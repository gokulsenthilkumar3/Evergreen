import { describe, expect, it } from 'vitest';
import { DEFAULT_LOW_STOCK_THRESHOLD, hasProductionOn, lowStockThreshold, overdueInvoices } from '../utils/alerts';

describe('notification rules', () => {
  it('uses the saved low-stock threshold and the database default otherwise', () => {
    expect(lowStockThreshold({ lowStockThreshold: '250' })).toBe(250);
    for (const value of [undefined, null, '', 'abc', '0', '-5']) expect(lowStockThreshold({ lowStockThreshold: value })).toBe(DEFAULT_LOW_STOCK_THRESHOLD);
    expect(lowStockThreshold(undefined)).toBe(500);
  });

  it('alerts only for unpaid balances past the due date', () => {
    const today = new Date(2026, 9, 30, 15);
    const base = { total: 1050, amountPaid: 0, creditTotal: 0, status: 'UNPAID' };
    const result = overdueInvoices([
      { id: 1, invoiceNo: 'A', dueDate: '2026-10-29', ...base },
      { id: 2, invoiceNo: 'B', dueDate: '2026-10-30', ...base },
      { id: 3, invoiceNo: 'C', dueDate: '2026-10-01', ...base, status: 'VOID' },
      { id: 4, invoiceNo: 'D', dueDate: '2026-10-01', ...base, amountPaid: 1050, status: 'PAID' },
      { id: 5, invoiceNo: 'E', dueDate: '2026-10-01', ...base, amountPaid: 1000, creditTotal: 50, status: 'PARTIAL' },
      { id: 6, invoiceNo: 'F', dueDate: '2026-10-01', ...base, amountPaid: 1000, status: 'PARTIAL' },
      { id: 7, invoiceNo: 'G', dueDate: null, ...base },
    ], today);
    expect(result.map(row => [row.invoice.invoiceNo, row.outstanding])).toEqual([['A', 1050], ['F', 50]]);
  });

  it('compares production days in local time, not by the UTC string', () => {
    const run = new Date(2026, 9, 30, 1, 0).toISOString();
    expect(hasProductionOn([{ date: run }], '2026-10-30')).toBe(true);
    expect(hasProductionOn([{ date: run }], '2026-10-29')).toBe(false);
    expect(hasProductionOn([{ date: null }], '2026-10-30')).toBe(false);
  });
});
