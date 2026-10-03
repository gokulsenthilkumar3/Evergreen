// @polsia:user-owned — shared zod contract for the Vyapari GST invoice resource.
// Client-importable: zod only, no server-only imports. Mirrors the waitlist
// example so applyServerErrors consumes 400 bodies unchanged.
//
// Decimal fields are stored as `string` (regex-validated down to 4dp) so the
// JS number `0.1 + 0.2 = 0.30000000000000004` float drift cannot corrupt
// rupee values. The server re-computes every line through computeInvoiceLine
// and serialises back to a string before storing into Postgres
// Decimal(12, 2); the GET handler stringifies them again on read.

import { z } from 'zod';
import { INDIAN_STATES_WITH_CODE } from '@/lib/business/invoice-tax';

const STATE_NAMES = INDIAN_STATES_WITH_CODE.map((s) => s.name) as [string, ...string[]];
export const IndianStateEnum = z.enum(STATE_NAMES);

// Decimal-as-string: 1–4 fractional digits, no leading dot, no exponent.
const decimalString = (maxFractionDigits: number) =>
  z.string().regex(new RegExp(`^\\d+(\\.\\d{1,${maxFractionDigits}})?$`), 'Enter a valid number');

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
// GSTIN format per Indian GST portal: 15 chars
// (2 digit state code + 10 char PAN + 1 entity letter + 1 default 'Z' + 1 checksum).

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD)');

export const InvoiceLineItemCreate = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description is too long'),
  hsnSac: z.string().regex(/^\d{4,8}$/, 'HSN/SAC must be 4–8 digits'),
  qty: decimalString(3),
  unitRate: decimalString(2),
  gstRate: decimalString(2),
});

export const InvoiceCreate = z.object({
  sellerName: z.string().min(1, 'Seller name is required').max(200),
  sellerGstin: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.string().regex(gstinRegex, 'Enter a valid 15-character GSTIN')),
  sellerState: IndianStateEnum,
  sellerAddress: z.string().min(1, 'Seller address is required').max(400),
  buyerName: z.string().min(1, 'Buyer name is required').max(200),
  buyerGstin: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.string().regex(gstinRegex, 'Enter a valid 15-character GSTIN')),
  buyerState: IndianStateEnum,
  buyerAddress: z.string().min(1, 'Buyer address is required').max(400),
  invoiceNumber: z
    .string()
    .min(1, 'Invoice number is required')
    .max(60, 'Invoice number is too long'),
  invoiceDate: dateString,
  lines: z
    .array(InvoiceLineItemCreate)
    .min(1, 'At least one line item is required')
    .max(50, 'Up to 50 line items per invoice'),
});

export const InvoiceLineItemItem = InvoiceLineItemCreate.extend({
  id: z.string(),
  taxable: decimalString(2),
  cgst: decimalString(2),
  sgst: decimalString(2),
  igst: decimalString(2),
  lineTotal: decimalString(2),
});

export const InvoiceItem = z.object({
  id: z.string(),
  sellerName: z.string(),
  sellerGstin: z.string(),
  sellerState: z.string(),
  sellerAddress: z.string(),
  buyerName: z.string(),
  buyerGstin: z.string(),
  buyerState: z.string(),
  buyerAddress: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  totalTaxable: decimalString(2),
  totalCgst: decimalString(2),
  totalSgst: decimalString(2),
  totalIgst: decimalString(2),
  grandTotal: decimalString(2),
  createdAt: z.string(),
  items: z.array(InvoiceLineItemItem),
});

export const InvoiceList = z.object({
  items: z.array(InvoiceItem),
});

export type InvoiceLineItemCreateType = z.input<typeof InvoiceLineItemCreate>;
export type InvoiceCreate = z.input<typeof InvoiceCreate>;
export type InvoiceItem = z.infer<typeof InvoiceItem>;
export type InvoiceList = z.infer<typeof InvoiceList>;
