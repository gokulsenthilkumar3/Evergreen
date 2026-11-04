import { reconcileFinance, type FinanceScope } from './business-ledger';

describe('incremental financial projections', () => {
  const date = new Date('2026-11-04T10:00:00Z');
  function fixture() {
    const entries = new Map<string, unknown>();
    const rows = {
      costingEntry: [{ id: 1, totalCost: 100, category: 'Power', date }, { id: 2, totalCost: 75, category: 'Other', date }],
      payrollEntry: [{ id: 3, month: '2026-11', basicPay: 100, overtime: 10, deductions: 5, netPay: 105, createdAt: date, staffId: 1 }],
      production: [{ id: 4, totalIntermediate: 0, processingCost: 25, date }],
      invoice: [{ id: 5, customerId: 1, invoiceNo: 'INV/2627/000001', total: 105, cgst: 2.5, sgst: 2.5, igst: 0, date,
        payments: [{ id: 6, method: 'BANK', amount: 105, date }] }],
    };
    const tx: any = {
      journalEntry: {
        findUnique: jest.fn(async ({ where }) => entries.get(where.sourceKey) || null),
        create: jest.fn(async ({ data }) => { entries.set(data.sourceKey, data); return data; }),
      },
    };
    for (const [model, source] of Object.entries(rows)) tx[model] = { findMany: jest.fn(async (args) =>
      source.filter(row => !args?.where?.id || args.where.id.in.includes(row.id))) };
    return { tx, entries };
  }
  const scope = (part: Partial<FinanceScope> = {}): FinanceScope => ({ costs: new Set(), payroll: new Set(), productions: new Set(), invoices: new Set(), ...part });
  it('matches full reconciliation across touched sources and idempotent payment replay', async () => {
    const full = fixture();
    await reconcileFinance(full.tx);
    const incremental = fixture();
    for (const change of [scope({ costs: new Set([1, 2]) }), scope({ payroll: new Set([3]) }),
      scope({ productions: new Set([4]) }), scope({ invoices: new Set([5]) }), scope({ invoices: new Set([5]) })]) {
      await reconcileFinance(incremental.tx, change);
    }
    expect([...incremental.entries]).toEqual([...full.entries]);
    expect(incremental.tx.journalEntry.create).toHaveBeenCalledTimes(full.entries.size);
  });
  it('does no historical finance reads for an unrelated stock mutation and scopes an invoice read', async () => {
    const { tx } = fixture();
    await reconcileFinance(tx, scope());
    for (const model of ['costingEntry', 'payrollEntry', 'production', 'invoice']) expect(tx[model].findMany).not.toHaveBeenCalled();
    await reconcileFinance(tx, scope({ invoices: new Set([5]) }));
    expect(tx.invoice.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { customerId: { not: null }, id: { in: [5] } } }));
    expect(tx.costingEntry.findMany).not.toHaveBeenCalled();
  });
});
