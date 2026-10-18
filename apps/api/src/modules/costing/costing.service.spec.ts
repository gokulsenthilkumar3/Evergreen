import { BadRequestException, ConflictException } from '@nestjs/common';
import { CostingService } from './costing.service';
import { reconcileFinance } from '../../services/business-ledger';

describe('costing writes', () => {
  let tx: any;
  let prisma: any;
  let service: CostingService;
  const unposted = {
    id: 7,
    category: 'EB (Electricity)',
    details: 'old',
    totalCost: 0,
    unitsConsumed: 10,
    ratePerUnit: 8,
    noOfShifts: 1,
  };

  beforeEach(() => {
    tx = {
      costingEntry: {
        create: jest.fn(({ data }) => Promise.resolve({ id: 1, ...data })),
        update: jest.fn(({ data }) =>
          Promise.resolve({ ...unposted, ...data }),
        ),
        delete: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(unposted),
        count: jest.fn().mockResolvedValue(0),
      },
      journalEntry: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    // Every write must go through the stock transaction; direct access fails the test.
    prisma = { stockTransaction: jest.fn(async (work: any) => await work(tx)) };
    service = new CostingService(prisma);
  });

  describe('update', () => {
    it.each([
      ['a negative total', { totalCost: -1 }],
      ['a negative total sent as text', { totalCost: '-0.01' }],
      ['a non-numeric total', { totalCost: 'abc' }],
      ['a number with trailing text', { totalCost: '12abc' }],
      ['an infinite total', { totalCost: Infinity }],
      ['an oversized total', { totalCost: 1e12 }],
      ['negative units', { unitsConsumed: -5 }],
      ['a negative rate', { ratePerUnit: -1 }],
      ['fractional workers', { workers: 2.5 }],
      ['negative shifts', { noOfShifts: -1 }],
      ['an object as amount', { totalCost: { $gt: 0 } }],
      ['an invalid date', { date: 'not-a-date' }],
      ['a non-text title', { title: 42 }],
    ])('rejects %s before touching the database', async (_label, body) => {
      await expect(service.updateEntry('7', body)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.stockTransaction).not.toHaveBeenCalled();
      expect(tx.costingEntry.update).not.toHaveBeenCalled();
    });

    it('changes an unposted entry inside the stock transaction', async () => {
      const updated = await service.updateEntry('7', {
        totalCost: '160',
        unitsConsumed: '20',
        updatedBy: 'meena',
      });
      expect(prisma.stockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.costingEntry.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: expect.objectContaining({
          totalCost: 160,
          unitsConsumed: 20,
          updatedBy: 'meena',
          details: '20 kWh @ ₹8/unit (1 Shifts)',
        }),
      });
      expect(updated).toMatchObject({ totalCost: 160 });
    });

    it('keeps zero as a value instead of dropping it', async () => {
      await service.updateEntry('7', { totalCost: 0, unitsConsumed: '0' });
      expect(tx.costingEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 0, unitsConsumed: 0 }),
        }),
      );
    });

    it('leaves fields that were not sent untouched', async () => {
      await service.updateEntry('7', { title: 'Power bill' });
      const { data } = tx.costingEntry.update.mock.calls[0][0];
      expect(data.totalCost).toBeUndefined();
      expect(data.date).toBeUndefined();
      expect(data.title).toBe('Power bill');
    });

    it('cannot relabel an entry into another category', async () => {
      await service.updateEntry('7', { category: 'Employee', workers: 4 });
      const { data } = tx.costingEntry.update.mock.calls[0][0];
      expect(data).not.toHaveProperty('category');
      expect(data.details).toContain('kWh');
    });

    it('works out the total of a computed category itself and ignores one sent by the caller', async () => {
      await service.updateEntry('7', { totalCost: 999999 });
      expect(
        tx.costingEntry.update.mock.calls[0][0].data.totalCost,
      ).toBeUndefined();
      await service.updateEntry('7', {
        totalCost: 999999,
        unitsConsumed: 50,
        noOfShifts: 2,
      });
      expect(tx.costingEntry.update.mock.calls[1][0].data.totalCost).toBe(800);
    });

    it('takes the entered total for categories that have no formula', async () => {
      tx.costingEntry.findUnique.mockResolvedValue({
        id: 8,
        category: 'Expense',
        details: 'Laptop (Asset)',
        totalCost: 0,
      });
      await service.updateEntry('8', { totalCost: 45000 });
      expect(tx.costingEntry.update.mock.calls[0][0].data).toMatchObject({
        totalCost: 45000,
        details: 'Laptop (Asset)',
      });
    });

    it('refuses to change a posted expense', async () => {
      tx.journalEntry.findUnique.mockResolvedValue({ id: 3 });
      await expect(service.updateEntry('7', { totalCost: 5 })).rejects.toThrow(
        'Posted expenses',
      );
      expect(tx.journalEntry.findUnique).toHaveBeenCalledWith({
        where: { sourceKey: 'COST:7' },
      });
      expect(tx.costingEntry.update).not.toHaveBeenCalled();
    });

    it.each(['abc', '0', '-3', '1.5', ''])(
      'reports id %j as not found',
      async (id) => {
        await expect(
          service.updateEntry(id, { totalCost: 5 }),
        ).resolves.toBeNull();
        expect(prisma.stockTransaction).not.toHaveBeenCalled();
      },
    );

    it('reports a missing entry as not found', async () => {
      tx.costingEntry.findUnique.mockResolvedValue(null);
      await expect(
        service.updateEntry('99', { totalCost: 5 }),
      ).resolves.toBeNull();
      expect(tx.costingEntry.update).not.toHaveBeenCalled();
    });

    it('lets a database failure surface instead of reporting "not found"', async () => {
      tx.costingEntry.update.mockRejectedValue(new Error('database is locked'));
      await expect(service.updateEntry('7', { totalCost: 5 })).rejects.toThrow(
        'database is locked',
      );
    });
  });

  describe('create', () => {
    it('stores the validated amount, never a second parse of the raw body', async () => {
      // A blank total used to pass validation as 0 while the stored value fell through to `amount`.
      await expect(
        service.addEntry({
          date: '2026-10-12',
          category: 'Expense',
          totalCost: '',
          amount: -5,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(tx.costingEntry.create).not.toHaveBeenCalled();
    });

    it.each([
      ['a missing date', { totalCost: 10 }],
      ['an invalid date', { date: 'soon', totalCost: 10 }],
      ['a negative amount', { date: '2026-10-12', amount: -1 }],
      [
        'a negative rate per kg',
        { date: '2026-10-12', totalCost: 10, ratePerKg: -4 },
      ],
    ])('rejects %s', async (_label, body) => {
      await expect(service.addEntry(body)).rejects.toThrow(BadRequestException);
      expect(tx.costingEntry.create).not.toHaveBeenCalled();
    });

    it('builds the description on the server from checked numbers', async () => {
      await service.addEntry({
        date: '2026-10-12',
        category: 'Packaging',
        yarnProduced: '120.5',
        ratePerKg: '1.6',
        totalCost: '192.8',
        createdBy: 'meena',
      });
      expect(tx.costingEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          category: 'Packaging',
          totalCost: 192.8,
          yarnProduced: 120.5,
          rate: 1.6,
          details: 'For 120.50 kg Yarn',
          createdBy: 'meena',
        }),
      });
    });

    it.each([
      [
        'electricity',
        {
          category: 'EB (Electricity)',
          unitsConsumed: 120.5,
          ratePerUnit: 8,
          noOfShifts: 2,
        },
        1928,
      ],
      [
        'electricity with one shift by default',
        { category: 'EB (Electricity)', unitsConsumed: 100, ratePerUnit: 7.35 },
        735,
      ],
      [
        'labour with overtime',
        {
          category: 'Employee',
          workers: 12,
          rate: 550.5,
          noOfShifts: 3,
          overtime: 900,
        },
        20718,
      ],
      [
        'labour without overtime',
        { category: 'Employee', workers: 4, rate: 600 },
        2400,
      ],
      [
        'packaging rounded to paise',
        { category: 'Packaging', yarnProduced: 333.33, ratePerKg: 1.6 },
        533.33,
      ],
    ])(
      'computes %s on the server and ignores a total sent by the caller',
      async (_label, body, expected) => {
        await service.addEntry({
          date: '2026-10-12',
          totalCost: 1,
          amount: 2,
          ...body,
        });
        expect(tx.costingEntry.create.mock.calls[0][0].data.totalCost).toBe(
          expected,
        );
      },
    );

    it.each([
      [
        'electricity without a rate',
        { category: 'EB (Electricity)', unitsConsumed: 10, totalCost: 80 },
      ],
      [
        'labour without workers',
        { category: 'Employee', rate: 600, totalCost: 2400 },
      ],
      [
        'packaging without production',
        { category: 'Packaging', ratePerKg: 1.6, totalCost: 100 },
      ],
      [
        'a calculated total beyond the limit',
        { category: 'EB (Electricity)', unitsConsumed: 1e9, ratePerUnit: 1e9 },
      ],
    ])(
      'rejects %s instead of trusting an entered total',
      async (_label, body) => {
        await expect(
          service.addEntry({ date: '2026-10-12', ...body }),
        ).rejects.toThrow(BadRequestException);
        expect(tx.costingEntry.create).not.toHaveBeenCalled();
      },
    );

    it('refuses a second entry for the same day and category, checking inside the transaction', async () => {
      tx.costingEntry.count.mockResolvedValue(1);
      await expect(
        service.addEntry({
          date: '2026-10-12',
          category: 'Maintenance',
          totalCost: 500,
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.stockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.costingEntry.count).toHaveBeenCalledWith({
        where: {
          category: 'Maintenance',
          date: { gte: expect.any(Date), lte: expect.any(Date) },
        },
      });
      expect(tx.costingEntry.create).not.toHaveBeenCalled();
    });

    it('allows any number of general expenses on one day', async () => {
      tx.costingEntry.count.mockResolvedValue(5);
      await expect(
        service.addEntry({
          date: '2026-10-12',
          category: 'Expense',
          title: 'Tea',
          amount: 120,
        }),
      ).resolves.toMatchObject({ totalCost: 120 });
      expect(tx.costingEntry.count).not.toHaveBeenCalled();
    });

    it('falls back to amount for general expenses', async () => {
      await service.addEntry({
        date: '2026-10-12',
        title: 'Laptop',
        amount: '45000',
        details: 'Laptop (Asset)',
      });
      expect(tx.costingEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          category: 'Expense',
          totalCost: 45000,
          details: 'Laptop (Asset)',
        }),
      });
    });
  });

  describe('delete', () => {
    it('removes an unposted entry inside the stock transaction', async () => {
      await expect(service.deleteEntry('7')).resolves.toBe(true);
      expect(prisma.stockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.costingEntry.delete).toHaveBeenCalledWith({ where: { id: 7 } });
    });

    it('refuses to delete a posted expense', async () => {
      tx.journalEntry.findUnique.mockResolvedValue({ id: 3 });
      await expect(service.deleteEntry('7')).rejects.toThrow('Posted expenses');
      expect(tx.costingEntry.delete).not.toHaveBeenCalled();
    });

    it('reports a missing entry as not found', async () => {
      tx.costingEntry.findUnique.mockResolvedValue(null);
      await expect(service.deleteEntry('7')).resolves.toBe(false);
      await expect(service.deleteEntry('abc')).resolves.toBe(false);
      expect(tx.costingEntry.delete).not.toHaveBeenCalled();
    });
  });
});

describe('ledger projection of cost and payroll entries', () => {
  const date = new Date('2026-10-12T00:00:00Z');
  const tx = (costs: object[], payroll: object[] = []): any => ({
    costingEntry: { findMany: jest.fn().mockResolvedValue(costs) },
    payrollEntry: { findMany: jest.fn().mockResolvedValue(payroll) },
    production: { findMany: jest.fn().mockResolvedValue([]) },
    invoice: { findMany: jest.fn().mockResolvedValue([]) },
    journalEntry: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
  });

  it('reports invalid stored amounts by record instead of blocking the ledger, and still posts the valid rows', async () => {
    const ledger = tx([
      { id: 12, category: 'Expense', totalCost: -1, date },
      { id: 13, category: 'Expense', totalCost: NaN, date },
      { id: 14, category: 'Expense', title: 'Laptop', totalCost: 45000, date },
    ]);
    const issues = await reconcileFinance(ledger);
    expect(issues).toEqual([
      expect.stringContaining('Cost entry #12 (Expense) has an invalid amount'),
      expect.stringContaining('Cost entry #13 (Expense) has an invalid amount'),
    ]);
    expect(ledger.journalEntry.create).toHaveBeenCalledTimes(1);
    expect(ledger.journalEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sourceKey: 'COST:14' }),
    });
  });

  it('reports a payroll row with an invalid month and posts the others', async () => {
    const pay = {
      staffId: 1,
      basicPay: 1000,
      overtime: 0,
      netPay: 900,
      deductions: 100,
      createdAt: date,
    };
    const ledger = tx(
      [],
      [
        { id: 5, month: '2026-13', ...pay },
        { id: 6, month: '2026-10', ...pay },
      ],
    );
    await expect(reconcileFinance(ledger)).resolves.toEqual([
      expect.stringContaining('Payroll entry #5 has an invalid month'),
    ]);
    expect(ledger.journalEntry.create).toHaveBeenCalledTimes(1);
    expect(ledger.journalEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sourceKey: 'PAYROLL:6' }),
    });
  });

  it.each([
    ['a negative amount', { basicPay: -1000, netPay: -1100 }],
    ['an amount that is not a number', { overtime: NaN }],
    ['amounts that do not balance', { netPay: 950 }],
  ])('reports a payroll row with %s instead of throwing, and posts the others', async (_case, change) => {
    const pay = { staffId: 1, month: '2026-10', basicPay: 1000, overtime: 0, netPay: 900, deductions: 100, createdAt: date };
    const ledger = tx([], [{ id: 5, ...pay, ...change }, { id: 6, ...pay }]);
    await expect(reconcileFinance(ledger)).resolves.toEqual([expect.stringContaining('Payroll entry #5 has')]);
    expect(ledger.journalEntry.create).toHaveBeenCalledTimes(1);
    expect(ledger.journalEntry.create).toHaveBeenCalledWith({ data: expect.objectContaining({ sourceKey: 'PAYROLL:6' }) });
  });

  it('reports nothing when every row is valid', async () => {
    await expect(
      reconcileFinance(
        tx([{ id: 1, category: 'Expense', totalCost: 0, date }]),
      ),
    ).resolves.toEqual([]);
  });
});
