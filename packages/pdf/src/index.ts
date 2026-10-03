export interface TaxLine {
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
}

<<<<<<< HEAD
export type TaxLine = {
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
  description?: string;
  hsnSac?: string;
  uom?: string;
};
=======
export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  grandTotal: number;
}
>>>>>>> 05aea36f3282e084109386f393c7cf3195b16b1b

export class InvoiceCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvoiceCalculationError';
  }
}

<<<<<<< HEAD
const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Canonical GST calculation shared by invoices, orders, PDFs and storefront estimates.
 *
 * Supports two call signatures:
 *  1. calculateInvoiceTotals(lines: TaxLine[], interstate?: boolean) — simple API
 *  2. calculateInvoiceTotals(lines: TaxLine[], documentDiscount, sellerState, buyerState) — full API
 */
export function calculateInvoiceTotals(
  lines: TaxLine[],
  documentDiscountOrInterstate?: number | boolean,
  sellerState?: string,
  buyerState?: string,
): InvoiceTotals {
  // Determine call mode
  const isSimpleMode = typeof documentDiscountOrInterstate === 'boolean' || documentDiscountOrInterstate === undefined;
  const interstate = isSimpleMode ? (documentDiscountOrInterstate as boolean ?? false) : false;
  const documentDiscount = isSimpleMode ? 0 : (documentDiscountOrInterstate as number ?? 0);
  const seller = sellerState ?? 'Tamil Nadu';
  const buyer = buyerState ?? seller;
  const sameState = seller.trim().toLowerCase() === buyer.trim().toLowerCase();

  if (!Number.isFinite(documentDiscount) || documentDiscount < 0) {
    throw new InvoiceCalculationError('Invoice discount is invalid');
  }

  const taxableLines = lines.map((line) => {
    const qty = line.quantity ?? 0;
    const rate = line.rate ?? 0;
    const disc = line.discount ?? 0;
    const gst = line.gstRate ?? 0;

    if (![qty, rate, disc, gst].every(Number.isFinite)) {
      throw new InvoiceCalculationError('Invoice line values are invalid');
    }

    let lineDiscount: number;
    if (isSimpleMode) {
      // Simple mode: discount is percentage of line value
      lineDiscount = money(qty * rate * disc / 100);
    } else {
      // Full mode: discount is absolute amount per line
      lineDiscount = money(disc);
    }

    const taxable = money(qty * rate - lineDiscount);
    if (taxable < 0) throw new InvoiceCalculationError('Line discount exceeds its value');
    return { lineTotal: money(qty * rate), lineDiscount, taxable, gstRate: gst };
  });

  const subtotal = money(taxableLines.reduce((s, l) => s + l.lineTotal, 0));
  const lineDiscounts = money(taxableLines.reduce((s, l) => s + l.lineDiscount, 0));
  const docDiscount = money(documentDiscount);

  if (docDiscount > subtotal - lineDiscounts)
    throw new InvoiceCalculationError('Invoice discount exceeds subtotal');

  const discount = money(lineDiscounts + docDiscount);
  const taxable = money(subtotal - discount);
  const discountFactor = subtotal ? taxable / subtotal : 1;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  for (const line of taxableLines) {
    const taxBase = money(line.lineTotal * discountFactor);
    const tax = money((taxBase * line.gstRate) / 100);
    if (isSimpleMode ? !interstate : sameState) {
      const half = money(tax / 2);
      cgst += half;
      sgst += money(tax - half);
    } else {
      igst += tax;
    }
  }

  cgst = money(cgst);
  sgst = money(sgst);
  igst = money(igst);
  const total = money(taxable + cgst + sgst + igst);

  return {
    subtotal,
    discount,
    taxable,
=======
const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateInvoiceTotals(
  lines: TaxLine[],
  documentDiscount = 0,
  sellerState = '',
  buyerState = '',
): InvoiceTotals {
  if (!Number.isFinite(documentDiscount) || documentDiscount < 0) {
    throw new InvoiceCalculationError('Document discount must be non-negative');
  }

  let subtotal = 0;
  let tax = 0;
  for (const line of lines) {
    if (![line.quantity, line.rate, line.discount, line.gstRate].every(Number.isFinite)) {
      throw new InvoiceCalculationError('Invoice values must be finite numbers');
    }
    const grossLine = line.quantity * line.rate;
    if (line.quantity <= 0 || line.rate < 0 || line.discount < 0 || line.discount > grossLine || line.gstRate < 0) {
      throw new InvoiceCalculationError('Invoice line values are outside their allowed range');
    }
    const taxableLine = grossLine - line.discount;
    subtotal += taxableLine;
  }

  if (documentDiscount > subtotal) {
    throw new InvoiceCalculationError('Document discount cannot exceed the subtotal');
  }
  const taxable = subtotal - documentDiscount;
  for (const line of lines) {
    const taxableLine = line.quantity * line.rate - line.discount;
    const allocatedDiscount = subtotal === 0 ? 0 : documentDiscount * taxableLine / subtotal;
    tax += (taxableLine - allocatedDiscount) * line.gstRate / 100;
  }

  const interstate = sellerState.trim().toLowerCase() !== buyerState.trim().toLowerCase();
  const cgst = interstate ? 0 : roundCurrency(tax / 2);
  const sgst = interstate ? 0 : roundCurrency(tax / 2);
  const igst = interstate ? roundCurrency(tax) : 0;
  const total = roundCurrency(taxable + tax);
  return {
    subtotal: roundCurrency(subtotal),
    discount: roundCurrency(documentDiscount),
    taxable: roundCurrency(taxable),
>>>>>>> 05aea36f3282e084109386f393c7cf3195b16b1b
    cgst,
    sgst,
    igst,
    total,
    grandTotal: total,
  };
}

// Re-export InvoiceLine for consumers that import from @evergreen/pdf
export type { InvoiceLine };
