import type { InvoiceLine, InvoiceTotals } from "@evergreen/types";

export type TaxLine = {
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
  description?: string;
  hsnSac?: string;
  uom?: string;
};

export class InvoiceCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceCalculationError";
  }
}

const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** Canonical GST calculation shared by invoices, orders, PDFs and storefront estimates. */
export function calculateInvoiceTotals(
  lines: TaxLine[],
  documentDiscountOrInterstate?: number | boolean,
  sellerState?: string,
  buyerState?: string,
): InvoiceTotals {
  const isSimpleMode =
    typeof documentDiscountOrInterstate === "boolean" ||
    documentDiscountOrInterstate === undefined;
  const interstate = isSimpleMode
    ? ((documentDiscountOrInterstate as boolean | undefined) ?? false)
    : false;
  const documentDiscount = isSimpleMode
    ? 0
    : ((documentDiscountOrInterstate as number | undefined) ?? 0);
  const seller = sellerState ?? "Tamil Nadu";
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

    const lineTotal = money(quantity * rate);
    if (!Number.isFinite(lineTotal) || lineTotal > 1e12) throw new InvoiceCalculationError('Invoice line value exceeds the supported amount range');
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
  if (!Number.isFinite(total) || total > 1e12) throw new InvoiceCalculationError('Invoice total exceeds the supported amount range');
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
