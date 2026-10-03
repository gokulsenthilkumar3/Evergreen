export interface TaxLine {
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
}

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

export class InvoiceCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvoiceCalculationError';
  }
}

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
    cgst,
    sgst,
    igst,
    total,
    grandTotal: total,
  };
}
