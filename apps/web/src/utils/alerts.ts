/** Database default for SystemSettings.lowStockThreshold, in kilograms. */
export const DEFAULT_LOW_STOCK_THRESHOLD = 500;

/** The saved low-stock threshold, or the database default when it is missing or invalid. */
export function lowStockThreshold(settings?: { lowStockThreshold?: string | number | null } | null): number {
  const value = Number(settings?.lowStockThreshold);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_LOW_STOCK_THRESHOLD;
}

export interface InvoiceForAlert {
  id: number;
  invoiceNo?: string;
  dueDate?: string | null;
  total: number;
  amountPaid?: number;
  creditTotal?: number;
  status?: string;
}

/** Invoices past their due date that still have money owed. Void and paid invoices never alert. */
export function overdueInvoices(invoices: InvoiceForAlert[], today = new Date()) {
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  return invoices.flatMap(invoice => {
    if (!invoice.dueDate || invoice.status === 'VOID' || invoice.status === 'PAID') return [];
    const outstanding = Math.round(((invoice.total || 0) - (invoice.amountPaid || 0) - (invoice.creditTotal || 0)) * 100) / 100;
    const due = new Date(invoice.dueDate);
    due.setHours(0, 0, 0, 0);
    return outstanding > 0 && due < startOfToday ? [{ invoice, outstanding }] : [];
  });
}

/** Whether any run happened on the given local calendar day (YYYY-MM-DD); stored dates are UTC timestamps. */
export function hasProductionOn(runs: Array<{ date?: string | null }>, day: string): boolean {
  return runs.some(run => Boolean(run.date) && new Date(run.date!).toLocaleDateString('en-CA') === day);
}
