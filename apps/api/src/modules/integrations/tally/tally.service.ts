import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

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
    const fromDate = filter.from ? new Date(filter.from) : undefined;
    const toDate = filter.to ? new Date(filter.to) : undefined;

    let purchaseXml = '';
    let salesXml = '';
    let receiptXml = '';
    let purchaseCount = 0;
    let salesCount = 0;
    let receiptCount = 0;

    // Purchase vouchers must come from approved purchase accounting, never inferred stock values.

    // 2. Yarn Sales Invoices (From Invoices)
    if (voucherTypes.includes('Sales')) {
      const invoices = await this.prisma.invoice.findMany({
        where: {
          ...(fromDate || toDate
            ? {
                date: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
        include: { items: true, outward: true },
        orderBy: { date: 'asc' },
      });

      for (const inv of invoices) {
        salesCount++;
        const tallyDate = this.formatTallyDate(inv.date);
        const isInterstate = (inv.igst || 0) > 0;
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

        if (isInterstate) {
          salesXml += `
            <!-- Output IGST 5% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output IGST 5%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.igst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
        } else {
          salesXml += `
            <!-- Output CGST 2.5% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST 2.5%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.cgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <!-- Output SGST 2.5% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST 2.5%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.sgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
        }

        salesXml += `
          </VOUCHER>
        </TALLYMESSAGE>`;
      }
    }

    // 3. Receipt Vouchers (Payments)
    if (voucherTypes.includes('Receipt')) {
      const payments = await this.prisma.payment.findMany({
        where: {
          ...(fromDate || toDate
            ? {
                date: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
        include: { invoice: true },
        orderBy: { date: 'asc' },
      });

      for (const pay of payments) {
        receiptCount++;
        const tallyDate = this.formatTallyDate(pay.date);
        const customerName = pay.invoice?.customerName || 'Sundry Debtor';
        const bankLedger =
          pay.method === 'CASH' ? 'Cash' : 'Bank Account (Current)';
        const narration = `Payment received against Inv #${pay.invoice?.invoiceNo || pay.invoiceId} via ${pay.method}. Ref: ${pay.reference || 'Direct Deposit'}.`;

        receiptXml += `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>REC-${pay.id}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${this.escapeXml(customerName)}</PARTYLEDGERNAME>
            <NARRATION>${this.escapeXml(narration)}</NARRATION>
            <!-- Bank/Cash Ledger Debit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${this.escapeXml(bankLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${pay.amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <!-- Customer Ledger Credit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${this.escapeXml(customerName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
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
      },
    };
  }
}
