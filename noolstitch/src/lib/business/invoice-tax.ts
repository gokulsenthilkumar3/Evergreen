// @polsia:user-owned — pure GST math + Indian state list. Used on the server
// (route handlers re-compute every line — never trust client numbers) AND on
// the client (real-time previews while the trader types). Same shape on both
// sides so the preview matches the persisted invoice byte-for-byte.

// Two-digit GST state codes per the India GST portal (01–37, plus 97/99 for
// Other Territory and Centre Jurisdiction). The list below covers the canonical
// 28 states + 8 UTs; each entry is { code, name } where name is the human-
// readable label used everywhere in the UI.
export interface IndianState {
  code: string;
  name: string;
}

export const INDIAN_STATES_WITH_CODE: ReadonlyArray<IndianState> = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '25', name: 'Daman & Diu' },
  { code: '26', name: 'Dadra & Nagar Haveli' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
];

// Maps the canonical state name (as selected by the trader / stored in the
// contact) to the 2-digit GST code. The persisted invoice denormalises the
// name only — the code is derived at render time so a future portal
// re-categorisation does not invalidate old invoices.
export function stateCodeFor(name: string): string {
  const match = INDIAN_STATES_WITH_CODE.find((s) => s.name === name);
  return match ? match.code : '–';
}

// Round to 2dp using half-away-from-zero (the conventional invoicing rule:
// 1.235 -> 1.24, 1.245 -> 1.25, -1.235 -> -1.24). Implemented with toFixed to
// avoid float drift before string-storing the Decimals in Postgres.
export function round2(n: number): number {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  // .005 / .015 / .025 / .035 ... edge case: Math.round does banker's-rounding
  // by default (1.235 -> 1.23), which is not the invoicing convention.
  // toFixed(2) is half-away-from-zero and string-anchored.
  const fixed = (abs + Number.EPSILON).toFixed(2);
  return sign * Number(fixed);
}

export interface InvoiceLineInput {
  qty: number;
  unitRate: number;
  gstRate: number;
  sellerState: string;
  buyerState: string;
}

export interface InvoiceLineComputed {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number;
  split: 'CGST_SGST' | 'IGST';
}

// Compute per-line GST. Intra-state (sellerState === buyerState) splits the
// tax evenly into CGST + SGST; inter-state collects the full rate as IGST.
export function computeInvoiceLine(input: InvoiceLineInput): InvoiceLineComputed {
  const taxable = round2(input.qty * input.unitRate);
  const half = round2((taxable * input.gstRate) / 200);
  const full = round2((taxable * input.gstRate) / 100);
  if (input.sellerState === input.buyerState) {
    return {
      taxable,
      cgst: half,
      sgst: half,
      igst: 0,
      lineTotal: round2(taxable + half + half),
      split: 'CGST_SGST',
    };
  }
  return {
    taxable,
    cgst: 0,
    sgst: 0,
    igst: full,
    lineTotal: round2(taxable + full),
    split: 'IGST',
  };
}

export interface InvoiceTotals {
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
}

export function computeInvoiceTotals(lines: Array<InvoiceLineComputed>): InvoiceTotals {
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let lineTotalSum = 0;
  for (const line of lines) {
    totalTaxable += line.taxable;
    totalCgst += line.cgst;
    totalSgst += line.sgst;
    totalIgst += line.igst;
    lineTotalSum += line.lineTotal;
  }
  return {
    totalTaxable: round2(totalTaxable),
    totalCgst: round2(totalCgst),
    totalSgst: round2(totalSgst),
    totalIgst: round2(totalIgst),
    // Sum of rounded line totals — matches the visual row-by-row addition
    // the trader sees on the preview, byte-for-byte with the persisted column.
    grandTotal: round2(lineTotalSum),
  };
}

// Canonical INR formatter. Used by form preview, API response, and print view
// so every surface agrees on display.
export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(round2(n));
}

// en-IN locale date formatter (DD/MM/YYYY) for Indian invoices.
export function formatDateIN(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '–';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
