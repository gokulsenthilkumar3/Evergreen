import type { InvoiceTotals } from "@evergreen/types";

export type TaxLine = {
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
};
export class InvoiceCalculationError extends Error {}
const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** Canonical GST calculation shared by invoices, orders, PDFs and storefront estimates. */
export function calculateInvoiceTotals(
  lines: TaxLine[],
  documentDiscount = 0,
  sellerState = "Tamil Nadu",
  buyerState = sellerState,
): InvoiceTotals {
  if (!Number.isFinite(documentDiscount) || documentDiscount < 0) {
    throw new InvoiceCalculationError("Invoice discount is invalid");
  }
  const taxableLines = lines.map((line) => {
    if (
      ![line.quantity, line.rate, line.discount, line.gstRate].every(
        Number.isFinite,
      ) ||
      line.quantity <= 0 ||
      line.rate < 0 ||
      line.discount < 0 ||
      line.gstRate < 0 ||
      line.gstRate > 100
    ) {
      throw new InvoiceCalculationError("Invoice line values are invalid");
    }
    const taxable = money(line.quantity * line.rate - line.discount);
    if (taxable < 0)
      throw new InvoiceCalculationError("Line discount exceeds its value");
    return { taxable, gstRate: line.gstRate };
  });
  const subtotal = money(
    taxableLines.reduce((sum, line) => sum + line.taxable, 0),
  );
  const discount = money(documentDiscount);
  if (discount > subtotal)
    throw new InvoiceCalculationError("Invoice discount exceeds subtotal");
  const taxable = money(subtotal - discount);
  const discountFactor = subtotal ? taxable / subtotal : 1;
  const sameState =
    sellerState.trim().toLowerCase() === buyerState.trim().toLowerCase();
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  for (const line of taxableLines) {
    const tax = money((line.taxable * discountFactor * line.gstRate) / 100);
    if (sameState) {
      const half = money(tax / 2);
      cgst += half;
      sgst += money(tax - half);
    } else igst += tax;
  }
  cgst = money(cgst);
  sgst = money(sgst);
  igst = money(igst);
  const total = money(taxable + cgst + sgst + igst);
  return {
    subtotal,
    discount,
    taxable,
    cgst,
    sgst,
    igst,
    total,
    grandTotal: total,
  };
}
