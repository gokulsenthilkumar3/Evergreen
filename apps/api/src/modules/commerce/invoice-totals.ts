import { BadRequestException } from '@nestjs/common';

export type TaxLine = { quantity: number; rate: number; discount: number; gstRate: number };
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateInvoiceTotals(lines: TaxLine[], documentDiscount: number, sellerState: string, buyerState: string) {
  if (!Number.isFinite(documentDiscount) || documentDiscount < 0) throw new BadRequestException('Invoice discount is invalid');
  const taxableLines = lines.map(line => {
    if (![line.quantity, line.rate, line.discount, line.gstRate].every(Number.isFinite) || line.quantity <= 0 || line.rate < 0 || line.discount < 0 || line.gstRate < 0 || line.gstRate > 100) throw new BadRequestException('Invoice line values are invalid');
    const taxable = money(line.quantity * line.rate - line.discount);
    if (taxable < 0) throw new BadRequestException('Line discount exceeds its value');
    return { taxable, gstRate: line.gstRate };
  });
  const subtotal = money(taxableLines.reduce((sum, line) => sum + line.taxable, 0));
  const discount = money(documentDiscount);
  if (discount > subtotal) throw new BadRequestException('Invoice discount exceeds subtotal');
  const discountFactor = subtotal ? (subtotal - discount) / subtotal : 1;
  const sameState = sellerState.trim().toLowerCase() === buyerState.trim().toLowerCase();
  let cgst = 0, sgst = 0, igst = 0;
  for (const line of taxableLines) {
    const tax = money(line.taxable * discountFactor * line.gstRate / 100);
    if (sameState) {
      const half = money(tax / 2);
      cgst += half;
      sgst += money(tax - half);
    } else igst += tax;
  }
  cgst = money(cgst); sgst = money(sgst); igst = money(igst);
  return { subtotal, discount, cgst, sgst, igst, total: money(subtotal - discount + cgst + sgst + igst) };
}
