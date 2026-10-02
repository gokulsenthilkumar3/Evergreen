import type { InvoiceLine, InvoiceTotals } from '@evergreen/types';

export function calculateInvoiceTotals(lines: InvoiceLine[], interstate = false): InvoiceTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  const discount = lines.reduce((sum, line) => sum + line.quantity * line.rate * line.discount / 100, 0);
  const taxable = subtotal - discount;
  const tax = lines.reduce((sum, line) => {
    const base = line.quantity * line.rate * (1 - line.discount / 100);
    return sum + base * line.gstRate / 100;
  }, 0);
  return {
    subtotal, discount, taxable,
    cgst: interstate ? 0 : tax / 2,
    sgst: interstate ? 0 : tax / 2,
    igst: interstate ? tax : 0,
    grandTotal: taxable + tax,
  };
}
