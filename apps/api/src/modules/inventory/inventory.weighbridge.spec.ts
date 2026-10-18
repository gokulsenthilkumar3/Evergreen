import { calculateWeighbridge } from '@evergreen/types';
import { InventoryService } from './inventory.service';

const input = {
  batchId: 'WB-001',
  date: '2026-01-01T10:00:00.000Z',
  supplier: 'Pilot mill',
  bale: 50,
  grossWeightKg: 14520,
  tareWeightKg: 4200,
  moisturePercent: 9.2,
  method: 'EXCESS_PERCENTAGE' as const,
  standardMoistureBase: 8.5,
  contractReference: 'Agreed contract 001',
};

describe('weighbridge receipts', () => {
  let service: InventoryService;
  let tx: any;
  let prisma: any;
  beforeEach(() => {
    let saved: any;
    tx = {
      inwardBatch: {
        findUnique: jest.fn(() => Promise.resolve(saved)),
        create: jest.fn(({ data }) => {
          saved = { id: 1, ...data };
          return Promise.resolve(saved);
        }),
      },
      cottonInventory: {
        findFirst: jest.fn(() => Promise.resolve(null)),
        create: jest.fn(),
        findMany: jest.fn(() => Promise.resolve([])),
      },
      activityLog: { create: jest.fn() },
    };
    prisma = { stockTransaction: jest.fn(async (work) => await work(tx)) };
    service = new InventoryService(prisma);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('retains physical stock separately from deduction and ignores forged totals/seals', async () => {
    const result = await service.syncWeighbridgeSlip(
      {
        ...input,
        finalBillableKg: 1,
        signature: 'forged',
        antiFraudSeal: 'VERIFIED',
      },
      'operator',
    );
    expect(result).toMatchObject({
      netWeightKg: 10320,
      moistureDeductionKg: 72.24,
      finalBillableKg: 10247.76,
      verificationStatus: 'UNVERIFIED',
    });
    expect(result).not.toHaveProperty('antiFraudSeal');
    expect(tx.cottonInventory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ quantity: 10320 }),
    });
    const saved = tx.inwardBatch.create.mock.calls[0][0].data;
    expect(saved.createdBy).toBe('operator');
    expect(JSON.parse(saved.weighbridgeReceipt)).toMatchObject({
      grossWeightKg: 14520,
      tareWeightKg: 4200,
      contractReference: input.contractReference,
      method: 'EXCESS_PERCENTAGE',
    });
    expect(tx.activityLog.create).toHaveBeenCalledTimes(1);
  });

  it('replays an identical lot without duplicating stock or audit entries', async () => {
    await service.syncWeighbridgeSlip(input, 'operator');
    await service.syncWeighbridgeSlip(input, 'operator');
    expect(tx.inwardBatch.create).toHaveBeenCalledTimes(1);
    expect(tx.cottonInventory.create).toHaveBeenCalledTimes(1);
    expect(tx.activityLog.create).toHaveBeenCalledTimes(1);
  });

  it('rejects changed measurements on an existing lot', async () => {
    await service.syncWeighbridgeSlip(input, 'operator');
    await expect(
      service.syncWeighbridgeSlip({ ...input, tareWeightKg: 4201 }, 'operator'),
    ).rejects.toThrow('different receipt');
    expect(tx.cottonInventory.create).toHaveBeenCalledTimes(1);
  });

  it.each([
    { grossWeightKg: -1 },
    { tareWeightKg: 15000 },
    { tareWeightKg: -1 },
    { grossWeightKg: Infinity },
    { grossWeightKg: '' },
    { tareWeightKg: null },
    { moisturePercent: undefined },
    { moisturePercent: 100 },
    { moisturePercent: -1 },
    { moisturePercent: true },
    { standardMoistureBase: '' },
    { contractReference: '' },
    { method: 'CCI' },
    { batchId: '' },
    { date: '2026-01-01' },
    { supplier: '' },
    { bale: 0 },
    { bale: 1.5 },
  ])('rejects invalid input before any stock mutation: %j', async (change) => {
    await expect(
      service.syncWeighbridgeSlip({ ...input, ...change }, 'operator'),
    ).rejects.toThrow();
    expect(tx.inwardBatch.create).not.toHaveBeenCalled();
    expect(tx.cottonInventory.create).not.toHaveBeenCalled();
  });

  it('records unconfirmed terms without inventing a baseline or billable weight', async () => {
    const result = await service.syncWeighbridgeSlip(
      { ...input, method: undefined },
      'operator',
    );
    expect(result).toMatchObject({
      method: 'PENDING',
      finalBillableKg: null,
      moistureDeductionKg: null,
    });
    expect(result).not.toHaveProperty('standardMoistureBase');
  });

  it('accepts the agent envelope but does not trust its calculations', async () => {
    const { date, batchId, supplier, bale, ...payload } = input;
    const result = await service.syncWeighbridgeSlip(
      {
        slip: {
          payload: { ...payload, timestamp: date },
          calculations: { finalBillableKg: 0 },
          signature: 'fake',
        },
        metadata: { batchId, supplier, bale },
      },
      'operator',
    );
    expect(result.finalBillableKg).toBe(10247.76);
    expect(result.verificationStatus).toBe('UNVERIFIED');
  });

  it('does not add a premium below the agreed baseline', () => {
    expect(calculateWeighbridge({ ...input, moisturePercent: 7 })).toEqual({
      netWeightKg: 10320,
      moistureDeductionKg: 0,
      finalBillableKg: 10320,
    });
  });

  it('does not swallow audit persistence errors', async () => {
    tx.activityLog.create.mockRejectedValue(new Error('audit unavailable'));
    await expect(
      service.syncWeighbridgeSlip(input, 'operator'),
    ).rejects.toThrow('audit unavailable');
    // All three writes use the same stockTransaction callback; Prisma owns rollback.
    expect(prisma.stockTransaction).toHaveBeenCalledTimes(1);
  });

  it('prevents deletion of captured measurement history', async () => {
    await service.syncWeighbridgeSlip(input, 'operator');
    await expect(service.deleteInward(1, 'admin')).rejects.toThrow(
      'measurement history',
    );
  });
});
