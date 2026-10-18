import {
  assertOpenPeriod,
  assertOverheadAvailable,
  journal,
  unavailableStock,
} from './business-ledger';

describe('accounting and stock invariants', () => {
  const date = new Date('2026-10-10T00:00:00Z');
  let tx: any;
  beforeEach(() => {
    tx = {
      journalEntry: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      journalLine: {
        aggregate: jest
          .fn()
          .mockResolvedValue({ _sum: { debit: 100, credit: 40 } }),
      },
      accountingPeriod: {
        findFirst: jest.fn().mockResolvedValue({ through: date }),
      },
      stockHold: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 10 } }),
      },
      stockMovement: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 25 } }),
      },
    };
  });
  it('posts balanced entries and discards empty lines', async () => {
    await journal(tx, 'test-1', date, 'Receipt', 'admin', [
      { account: 'CASH', debit: 50 },
      { account: 'AR', credit: 50 },
      { account: 'EMPTY' },
    ]);
    expect(tx.journalEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sourceKey: 'test-1',
        lines: {
          create: [
            { account: 'CASH', debit: 50, credit: 0 },
            { account: 'AR', debit: 0, credit: 50 },
          ],
        },
      }),
    });
  });
  it.each([
    [{ account: 'CASH', debit: NaN }],
    [{ account: 'CASH', debit: Infinity }],
    [{ account: 'CASH', debit: -0.001 }],
    [
      { account: 'CASH', debit: -5 },
      { account: 'AR', credit: -5 },
    ],
    [{ account: 'CASH', debit: 5, credit: 5 }],
    [
      { account: 'CASH', debit: 5 },
      { account: 'AR', credit: 4 },
    ],
  ])('rejects invalid or unbalanced entries %j', async (...args) => {
    // it.each spreads a row; the row itself is the list of journal lines.
    await expect(
      journal(tx, 'test-2', date, 'Bad entry', 'admin', args as any),
    ).rejects.toThrow();
    expect(tx.journalEntry.create).not.toHaveBeenCalled();
  });
  it('does not double-post the same source', async () => {
    tx.journalEntry.findUnique.mockResolvedValue({ id: 1 });
    await journal(tx, 'same-source', date, 'Retry', 'admin', [
      { account: 'CASH', debit: 5 },
      { account: 'AR', credit: 5 },
    ]);
    expect(tx.journalEntry.create).not.toHaveBeenCalled();
  });
  it('blocks timestamps at the closure boundary and permits later postings', async () => {
    await expect(assertOpenPeriod(tx, date)).rejects.toThrow('closed');
    await expect(
      assertOpenPeriod(tx, new Date(date.getTime() + 1)),
    ).resolves.toBeUndefined();
    await expect(assertOpenPeriod(tx, new Date('invalid'))).rejects.toThrow(
      'valid posting date',
    );
  });
  it.each([NaN, Infinity, -1, 61])(
    'blocks invalid or unfunded overhead %s',
    async (amount) => {
      await expect(assertOverheadAvailable(tx, amount, date)).rejects.toThrow();
    },
  );
  it('permits recorded available overhead, including zero', async () => {
    await expect(
      assertOverheadAvailable(tx, 60, date),
    ).resolves.toBeUndefined();
    await expect(assertOverheadAvailable(tx, 0, date)).resolves.toBeUndefined();
  });
  it('excludes held and externally owned stock from availability', async () => {
    expect(await unavailableStock(tx, 7)).toBe(35);
    expect(tx.stockMovement.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { itemId: 7, lot: { owner: { not: 'COMPANY' } } },
      }),
    );
  });
});
