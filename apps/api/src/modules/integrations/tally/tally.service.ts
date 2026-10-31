import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { dayRange } from '../../../utils/day-range';

/** Methods that move real money. REVERSAL and ALLOCATION rows are internal settlement entries. */
const RECEIPT_METHODS = ['CASH', 'BANK', 'UPI', 'CHEQUE'];

const percent = (rate: number) => String(Number(rate.toFixed(3)));
const paise = (amount: number) => Math.round(amount * 100) / 100;

/**
 * Output GST ledgers for one invoice, named by rate. The stored tax totals are split across rates in
 * proportion to each rate's taxable value times the rate, with any paise residue on the largest share,
 * so the ledger lines always add up to the saved invoice.
 */
export function outputTaxLedgers(invoice: {
  subtotal: number;
  discount?: number | null;
  cgst: number;
  sgst: number;
  igst?: number | null;
  items: Array<{
    gstRate?: number | null;
    rate: number;
    quantity?: number | null;
    weight?: number | null;
    discount?: number | null;
  }>;
}): Array<{ name: string; amount: number }> {
  const taxable = invoice.subtotal - (invoice.discount || 0);
  const tax = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);
  if (tax <= 0) return [];
  const groups = new Map<number, number>();
  for (const item of invoice.items) {
    const rate = Number(item.gstRate) || 0;
    const value =
      (item.quantity ?? item.weight ?? 0) * item.rate - (item.discount || 0);
    if (rate > 0 && value > 0)
      groups.set(rate, (groups.get(rate) || 0) + value);
  }
  // Older mill invoices kept the rate on the invoice only; infer it from the saved totals.
  if (!groups.size && taxable > 0)
    groups.set(Number(((tax / taxable) * 100).toFixed(2)), taxable);
  const shares = [...groups].map(([rate, value]) => ({
    rate,
    weight: rate * value,
  }));
  const totalWeight = shares.reduce((sum, share) => sum + share.weight, 0);
  const split = (amount: number) => {
    const parts = shares.map((share) =>
      paise((amount * share.weight) / totalWeight),
    );
    const largest = shares.reduce(
      (best, share, index) =>
        share.weight > shares[best].weight ? index : best,
      0,
    );
    parts[largest] = paise(
      parts[largest] + amount - parts.reduce((sum, part) => sum + part, 0),
    );
    return parts;
  };
  const ledgers: Array<{ name: string; amount: number }> = [];
  if ((invoice.igst || 0) > 0)
    split(invoice.igst!).forEach((amount, i) =>
      ledgers.push({ name: `Output IGST ${percent(shares[i].rate)}%`, amount }),
    );
  else {
    const cgst = split(invoice.cgst || 0);
    const sgst = split(invoice.sgst || 0);
    shares.forEach((share, i) => {
      ledgers.push({
        name: `Output CGST ${percent(share.rate / 2)}%`,
        amount: cgst[i],
      });
      ledgers.push({
        name: `Output SGST ${percent(share.rate / 2)}%`,
        amount: sgst[i],
      });
    });
  }
  return ledgers.filter((ledger) => ledger.amount !== 0);
}

export interface TallyExportFilter {
  from?: string;
  to?: string;
  voucherTypes?: ('Purchase' | 'Sales' | 'Receipt')[];
  companyName?: string;
}

export interface TallyExportResult {
  xml: string;
  filename: string;
  stats: {
    purchaseCount: number;
    salesCount: number;
    receiptCount: number;
    totalVouchers: number;
    /** Voided invoices in the period, left out of the file. */
    skippedVoidInvoices: number;
    /** Retained for response compatibility; receipts and reversals now export on their own dates. */
    skippedReversedReceipts: number;
  };
}

@Injectable()
export class TallyExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format Date to Tally XML Date format: YYYYMMDD
   */
  private formatTallyDate(date: Date | string): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  /**
   * Escape XML special characters for valid Tally Prime parsing
   */
  private escapeXml(unsafe: string | null | undefined): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate canonical Tally Prime XML Import document
   */
  async generateTallyXml(
    filter: TallyExportFilter = {},
  ): Promise<TallyExportResult> {
    const settings = await this.prisma.systemSettings.findFirst();
    const millCompanyName =
      filter.companyName || settings?.companyName || 'Evergreen Spinning Mills';

    const voucherTypes = filter.voucherTypes || ['Sales', 'Receipt'];
    if (voucherTypes.includes('Purchase')) {
      throw new BadRequestException(
        'Purchase export requires an approved supplier bill with agreed rate, tax treatment and ledger mapping. Inward weight alone cannot create a purchase voucher. Export Sales or Receipt vouchers separately.',
      );
    }
    // Whole local days: a `to` of 2026-10-30 includes documents saved later that day.
    const range = dayRange(filter.from, filter.to);
    const dateFilter = range.gte || range.lte ? { date: range } : {};

    const purchaseXml = '';
    let salesXml = '';
    let receiptXml = '';
    const purchaseCount = 0;
    let salesCount = 0;
    let receiptCount = 0;
    let skippedVoidInvoices = 0;
    const skippedReversedReceipts = 0;

    // Purchase vouchers must come from approved purchase accounting, never inferred stock values.

    // 2. Yarn Sales Invoices (From Invoices)
    if (voucherTypes.includes('Sales')) {
      // A voided invoice was never a sale; exporting it would double the turnover in Tally.
      const invoices = await this.prisma.invoice.findMany({
        where: { ...dateFilter, status: { not: 'VOID' } },
        include: { items: true, outward: true },
        orderBy: { date: 'asc' },
      });
      skippedVoidInvoices = await this.prisma.invoice.count({
        where: { ...dateFilter, status: 'VOID' },
      });

      for (const inv of invoices) {
        salesCount++;
        const tallyDate = this.formatTallyDate(inv.date);
        const totalAmount = inv.total;
        const taxableAmount = inv.subtotal - (inv.discount || 0);
        const narration = `Yarn Tax Invoice - No: ${inv.invoiceNo}, Buyer: ${inv.customerName}, Vehicle: ${inv.vehicleNo || inv.outward?.vehicleNo || 'Self Gate Pass'}. Items: ${inv.items.map((i) => `${i.yarnCount || 'Yarn'} (${i.bags} bags, ${i.weight} kg)`).join('; ')}`;

        salesXml += `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${this.escapeXml(inv.invoiceNo)}</VOUCHERNUMBER>
            <REFERENCE>${this.escapeXml(inv.invoiceNo)}</REFERENCE>
            <PARTYLEDGERNAME>${this.escapeXml(inv.customerName)}</PARTYLEDGERNAME>
            <NARRATION>${this.escapeXml(narration)}</NARRATION>
            <!-- Customer Ledger Debit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${this.escapeXml(inv.customerName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${totalAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <!-- Yarn Sales Ledger Credit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Cotton Yarn Sales</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${taxableAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;

        const taxLedgers = outputTaxLedgers(inv);
        for (const ledger of taxLedgers)
          salesXml += `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${this.escapeXml(ledger.name)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${ledger.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
        // Tally rejects a voucher whose debit and credits differ; carry any paise difference explicitly.
        const roundOff = paise(
          totalAmount -
            taxableAmount -
            taxLedgers.reduce((sum, ledger) => sum + ledger.amount, 0),
        );
        if (roundOff !== 0)
          salesXml += `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Round Off</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${roundOff > 0 ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${roundOff.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;

        salesXml += `
          </VOUCHER>
        </TALLYMESSAGE>`;
      }
    }

    // 3. Receipt Vouchers (Payments)
    if (voucherTypes.includes('Receipt')) {
      // Preserve cash events on their own dates, including reversals in later periods.
      const payments = await this.prisma.payment.findMany({
        where: {
          ...dateFilter,
          OR: [
            { method: { in: RECEIPT_METHODS }, amount: { gt: 0 } },
            { method: 'REVERSAL', amount: { lt: 0 } },
          ],
        },
        include: { invoice: true },
        orderBy: { date: 'asc' },
      });
      for (const pay of payments) {
        const isReversal = pay.method === 'REVERSAL';
        let method = pay.method;
        if (isReversal) {
          const match = /^PAYMENT-REVERSAL:(\d+)$/.exec(pay.reference || '');
          const original = match
            ? await this.prisma.payment.findUnique({
                where: { id: Number(match[1]) },
              })
            : null;
          if (
            !original ||
            original.invoiceId !== pay.invoiceId ||
            !RECEIPT_METHODS.includes(original.method)
          )
            throw new BadRequestException(
              'A receipt reversal must reference its original cash or bank payment',
            );
          method = original.method;
        }
        const voucherType = isReversal ? 'Journal' : 'Receipt';
        receiptCount++;
        const tallyDate = this.formatTallyDate(pay.date);
        const customerName = pay.invoice?.customerName || 'Sundry Debtor';
        const bankLedger =
          method === 'CASH' ? 'Cash' : 'Bank Account (Current)';
        const narration = `${isReversal ? 'Payment reversed' : 'Payment received'} against Inv #${pay.invoice?.invoiceNo || pay.invoiceId} via ${pay.method}. Ref: ${pay.reference || 'Direct Deposit'}.`;

        receiptXml += `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${voucherType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>REC-${pay.id}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${this.escapeXml(customerName)}</PARTYLEDGERNAME>
            <NARRATION>${this.escapeXml(narration)}</NARRATION>
            <!-- Bank/Cash Ledger Debit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${this.escapeXml(bankLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${isReversal ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${(-pay.amount).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <!-- Customer Ledger Credit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${this.escapeXml(customerName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${isReversal ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${pay.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`;
      }
    }

    // Wrap in standard Tally Prime XML envelope
    const fullXml = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters &amp; Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${this.escapeXml(millCompanyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>${purchaseXml}${salesXml}${receiptXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Tally-Prime-Import-${millCompanyName.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.xml`;

    return {
      xml: fullXml,
      filename,
      stats: {
        purchaseCount,
        salesCount,
        receiptCount,
        totalVouchers: purchaseCount + salesCount + receiptCount,
        skippedVoidInvoices,
        skippedReversedReceipts,
      },
    };
  }
}
