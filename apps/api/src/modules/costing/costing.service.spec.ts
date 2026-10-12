import { BadRequestException } from '@nestjs/common';
import { CostingService } from './costing.service';
import { reconcileFinance } from '../../services/business-ledger';

describe('costing writes', () => {
  let tx: any;
  let prisma: any;
  let service: CostingService;
  const unposted = { id: 7, category: 'EB (Electricity)', details: 'old', totalCost: 0, unitsConsumed: 10, ratePerUnit: 8, noOfShifts: 1 };

  beforeEach(() => {
    tx = {
      costingEntry: {
        create: jest.fn(async ({ data }) => ({ id: 1, ...data })),
        update: jest.fn(async ({ data }) => ({ ...unposted, ...data })),
        delete: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(unposted),
      },
      journalEntry: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    // Every write must go through the stock transaction; direct access fails the test.
    prisma = { stockTransaction: jest.fn(async (work: any) => work(tx)) };
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
      await expect(service.updateEntry('7', body)).rejects.toThrow(BadRequestException);
      expect(prisma.stockTransaction).not.toHaveBeenCalled();
      expect(tx.costingEntry.update).not.toHaveBeenCalled();
    });

    it('changes an unposted entry inside the stock transaction', async () => {
      const updated = await service.updateEntry('7', { totalCost: '160', unitsConsumed: '20', updatedBy: 'meena' });
      expect(prisma.stockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.costingEntry.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: expect.objectContaining({ totalCost: 160, unitsConsumed: 20, updatedBy: 'meena', details: '20 kWh @ ₹8/unit (1 Shifts)' }),
      });
      expect(updated).toMatchObject({ totalCost: 160 });
    });

    it('keeps zero as a value instead of dropping it', async () => {
      await service.updateEntry('7', { totalCost: 0, unitsConsumed: '0' });
      expect(tx.costingEntry.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ totalCost: 0, unitsConsumed: 0 }) }));
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

    it('refuses to change a posted expense', async () => {
      tx.journalEntry.findUnique.mockResolvedValue({ id: 3 });
      await expect(service.updateEntry('7', { totalCost: 5 })).rejects.toThrow('Posted expenses');
      expect(tx.journalEntry.findUnique).toHaveBeenCalledWith({ where: { sourceKey: 'COST:7' } });
      expect(tx.costingEntry.update).not.toHaveBeenCalled();
    });

    it.each(['abc', '0', '-3', '1.5', ''])('reports id %j as not found', async id => {
      await expect(service.updateEntry(id, { totalCost: 5 })).resolves.toBeNull();
      expect(prisma.stockTransaction).not.toHaveBeenCalled();
    });

    it('reports a missing entry as not found', async () => {
      tx.costingEntry.findUnique.mockResolvedValue(null);
      await expect(service.updateEntry('99', { totalCost: 5 })).resolves.toBeNull();
      expect(tx.costingEntry.update).not.toHaveBeenCalled();
    });

    it('lets a database failure surface instead of reporting "not found"', async () => {
      tx.costingEntry.update.mockRejectedValue(new Error('database is locked'));
      await expect(service.updateEntry('7', { totalCost: 5 })).rejects.toThrow('database is locked');
    });
  });

  describe('create', () => {
    it('stores the validated amount, never a second parse of the raw body', async () => {
      // A blank total used to pass validation as 0 while the stored value fell through to `amount`.
      await expect(service.addEntry({ date: '2026-10-12', category: 'Expense', totalCost: '', amount: -5 })).rejects.toThrow(BadRequestException);
      expect(tx.costingEntry.create).not.toHaveBeenCalled();
    });

    it.each([
      ['a missing date', { totalCost: 10 }],
      ['an invalid date', { date: 'soon', totalCost: 10 }],
      ['a negative amount', { date: '2026-10-12', amount: -1 }],
      ['a negative rate per kg', { date: '2026-10-12', totalCost: 10, ratePerKg: -4 }],
    ])('rejects %s', async (_label, body) => {
      await expect(service.addEntry(body)).rejects.toThrow(BadRequestException);
      expect(tx.costingEntry.create).not.toHaveBeenCalled();
    });

    it('builds the description on the server from checked numbers', async () => {
      await service.addEntry({ date: '2026-10-12', category: 'Packaging', yarnProduced: '120.5', ratePerKg: '1.6', totalCost: '192.8', createdBy: 'meena' });
      expect(tx.costingEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ category: 'Packaging', totalCost: 192.8, yarnProduced: 120.5, rate: 1.6, details: 'For 120.50 kg Yarn', createdBy: 'meena' }),
      });
    });

    it('falls back to amount for general expenses', async () => {
      await service.addEntry({ date: '2026-10-12', title: 'Laptop', amount: '45000', details: 'Laptop (Asset)' });
      expect(tx.costingEntry.create).toHaveBeenCalledWith({ data: expect.objectContaining({ category: 'Expense', totalCost: 45000, details: 'Laptop (Asset)' }) });
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

describe('ledger projection of cost entries', () => {
  it('names the offending record when a stored amount is invalid', async () => {
    const tx: any = { costingEntry: { findMany: jest.fn().mockResolvedValue([{ id: 12, category: 'Expense', totalCost: -1, date: new Date() }]) } };
    await expect(reconcileFinance(tx)).rejects.toThrow('Cost entry #12 (Expense) has an invalid amount');
  });
});
