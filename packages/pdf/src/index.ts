<<<<<<< HEAD
import type { InvoiceLine, InvoiceTotals } from '@evergreen/types';
=======
import type { InvoiceLine, InvoiceTotals } from "@evergreen/types";
>>>>>>> 00150265d55fc52cd88db9512cd099f04a14af02

export type TaxLine = {
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
  description?: string;
  hsnSac?: string;
  uom?: string;
};
<<<<<<< HEAD

export { type InvoiceTotals };
=======
>>>>>>> 00150265d55fc52cd88db9512cd099f04a14af02

export class InvoiceCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceCalculationError";
  }
}

const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

<<<<<<< HEAD
/**
 * Canonical GST calculation shared by invoices, orders, PDFs and storefront estimates.
 *
 * Supports two call signatures:
 *  1. calculateInvoiceTotals(lines, interstate?) — simple API (boolean flag)
 *  2. calculateInvoiceTotals(lines, documentDiscount, sellerState, buyerState) — full API
 */
=======
/** Canonical GST calculation shared by invoices, orders, PDFs and storefront estimates. */
>>>>>>> 00150265d55fc52cd88db9512cd099f04a14af02
export function calculateInvoiceTotals(
  lines: TaxLine[],
  documentDiscountOrInterstate?: number | boolean,
  sellerState?: string,
  buyerState?: string,
): InvoiceTotals {
  const isSimpleMode =
<<<<<<< HEAD
    typeof documentDiscountOrInterstate === 'boolean' ||
    documentDiscountOrInterstate === undefined;
  const interstate = isSimpleMode
    ? ((documentDiscountOrInterstate as boolean) ?? false)
    : false;
  const documentDiscount = isSimpleMode
    ? 0
    : ((documentDiscountOrInterstate as number) ?? 0);
  const seller = sellerState ?? 'Tamil Nadu';
=======
    typeof documentDiscountOrInterstate === "boolean" ||
    documentDiscountOrInterstate === undefined;
  const interstate = isSimpleMode
    ? ((documentDiscountOrInterstate as boolean | undefined) ?? false)
    : false;
  const documentDiscount = isSimpleMode
    ? 0
    : ((documentDiscountOrInterstate as number | undefined) ?? 0);
  const seller = sellerState ?? "Tamil Nadu";
>>>>>>> 00150265d55fc52cd88db9512cd099f04a14af02
  const buyer = buyerState ?? seller;
  const sameState = seller.trim().toLowerCase() === buyer.trim().toLowerCase();

  if (!Number.isFinite(documentDiscount) || documentDiscount < 0) {
    throw new InvoiceCalculationError("Invoice discount is invalid");
  }

  const taxableLines = lines.map((line) => {
    const { quantity, rate, discount, gstRate } = line;
    if (![quantity, rate, discount, gstRate].every(Number.isFinite)) {
      throw new InvoiceCalculationError("Invoice line values are invalid");
    }
    if (
      quantity <= 0 ||
      rate < 0 ||
      discount < 0 ||
      gstRate < 0 ||
      gstRate > 100
    ) {
      throw new InvoiceCalculationError(
        "Invoice line values are outside their allowed range",
      );
    }

<<<<<<< HEAD
    let lineDiscount: number;
    if (isSimpleMode) {
      // Simple mode: discount is percentage of line value
      lineDiscount = money((qty * rate * disc) / 100);
    } else {
      // Full mode: discount is absolute amount per line
      lineDiscount = money(disc);
    }

    const taxable = money(qty * rate - lineDiscount);
    if (taxable < 0)
      throw new InvoiceCalculationError('Line discount exceeds its value');
    return { lineTotal: money(qty * rate), lineDiscount, taxable, gstRate: gst };
=======
    const lineTotal = money(quantity * rate);
    // The legacy boolean overload uses percentage discounts; the full API uses amounts.
    const lineDiscount = money(
      isSimpleMode ? (lineTotal * discount) / 100 : discount,
    );
    if (lineDiscount > lineTotal) {
      throw new InvoiceCalculationError("Line discount exceeds its value");
    }
    return {
      lineTotal,
      lineDiscount,
      taxable: money(lineTotal - lineDiscount),
      gstRate,
    };
>>>>>>> 00150265d55fc52cd88db9512cd099f04a14af02
  });

  const grossSubtotal = money(
    taxableLines.reduce((sum, line) => sum + line.lineTotal, 0),
  );
  const lineDiscounts = money(
    taxableLines.reduce((sum, line) => sum + line.lineDiscount, 0),
  );
  const discountedSubtotal = money(grossSubtotal - lineDiscounts);
  const documentDiscountRounded = money(documentDiscount);
  if (documentDiscountRounded > discountedSubtotal) {
    throw new InvoiceCalculationError("Invoice discount exceeds subtotal");
  }
  const taxable = money(discountedSubtotal - documentDiscountRounded);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  for (const line of taxableLines) {
    // Preserve each line's discount, then allocate only the document discount.
    const allocatedDocumentDiscount = discountedSubtotal
      ? (documentDiscountRounded * line.taxable) / discountedSubtotal
      : 0;
    const taxBase = money(line.taxable - allocatedDocumentDiscount);
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
    subtotal: isSimpleMode ? grossSubtotal : discountedSubtotal,
    discount: isSimpleMode ? lineDiscounts : documentDiscountRounded,
    taxable,
    cgst,
    sgst,
    igst,
    total,
    grandTotal: total,
  };
}

export type { InvoiceLine };
