import { BadRequestException } from '@nestjs/common';
import {
  calculateInvoiceTotals as calculateSharedInvoiceTotals,
  InvoiceCalculationError,
  type TaxLine,
} from '@evergreen/pdf';

export type { TaxLine } from '@evergreen/pdf';

/** Nest adapter for the framework-agnostic shared invoice calculator. */
export function calculateInvoiceTotals(
  lines: TaxLine[],
  documentDiscount: number,
  sellerState: string,
  buyerState: string,
) {
  try {
    const { subtotal, discount, cgst, sgst, igst, total } =
      calculateSharedInvoiceTotals(
        lines,
        documentDiscount,
        sellerState,
        buyerState,
      );
    return { subtotal, discount, cgst, sgst, igst, total };
  } catch (error) {
    if (error instanceof InvoiceCalculationError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
