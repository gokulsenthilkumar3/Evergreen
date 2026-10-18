import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

export interface WhatsAppStatementResult {
  customerId: number;
  customerName: string;
  phone: string;
  outstandingBalance: number;
  tamilMessage: string;
  englishMessage: string;
  combinedMessage: string;
  whatsappDeepLink: string;
}

@Injectable()
export class WhatsAppCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate an automated Tamil & English collections statement for a weaving / knitting customer
   */
  async generateStatement(
    customerId: number,
  ): Promise<WhatsAppStatementResult> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        invoices: {
          where: { status: { in: ['UNPAID', 'PARTIAL'] } },
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer #${customerId} not found`);
    }

    const settings = await this.prisma.systemSettings.findFirst();
    const millName = settings?.companyName || 'Evergreen Spinning Mills';

    // Calculate customer ledger balance
    const ledgerAgg = await this.prisma.customerLedgerEntry.aggregate({
      where: { customerId },
      _sum: { debit: true, credit: true },
    });
    const debit = Number(ledgerAgg._sum.debit || 0);
    const credit = Number(ledgerAgg._sum.credit || 0);
    const outstanding = Math.round((debit - credit) * 100) / 100;

    const lastInvoice = customer.invoices[0];
    const invoiceRef = lastInvoice
      ? `Inv #${lastInvoice.invoiceNo} (${new Date(lastInvoice.date).toLocaleDateString()})`
      : 'N/A';
    const dateStr = new Date().toLocaleDateString('en-IN');

    // Tamil localized message (native for Tirupur/Karur/Coimbatore textile owners)
    const tamilMessage = [
      `வணக்கம் ${customer.name},`,
      `*${millName}* சார்பாக நினைவூட்டல் (${dateStr}).`,
      `தங்களின் தற்போதைய நூல் நிலுவைத் தொகை: *₹${outstanding.toLocaleString('en-IN')}*`,
      lastInvoice ? `கடைசி பில்: ${invoiceRef}` : '',
      `தயவுசெய்து வங்கி பரிவர்த்தனை (NEFT/RTGS) மூலம் செலுத்தி விவரங்களை பகிரவும்.`,
      `பேரேடு சரிபார்க்க 'DISPUTE' எனவும், உறுதிசெய்ய 'OK' எனவும் பதிலளிக்கவும்.`,
    ]
      .filter(Boolean)
      .join('\n');

    // Professional English message
    const englishMessage = [
      `Dear ${customer.name},`,
      `Payment reminder from *${millName}* as of ${dateStr}.`,
      `Your current outstanding balance for cotton yarn is: *₹${outstanding.toLocaleString('en-IN')}*`,
      lastInvoice ? `Recent Invoice: ${invoiceRef}` : '',
      `Kindly arrange payment via RTGS/NEFT and share the UTR reference.`,
      `Reply 'OK' to acknowledge or 'DISPUTE' to review the ledger statement.`,
    ]
      .filter(Boolean)
      .join('\n');

    const combinedMessage = `${tamilMessage}\n\n---\n\n${englishMessage}`;

    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry =
      cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappDeepLink = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(combinedMessage)}`;

    // Log the collection reminder dispatch in activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'WHATSAPP_COLLECTION_STATEMENT',
        module: 'COMMERCE',
        username: 'COLLECTIONS_BOT',
        details: `Generated WhatsApp collections reminder for ${customer.name} (Outstanding: ₹${outstanding})`,
      },
    });

    return {
      customerId,
      customerName: customer.name,
      phone: customer.phone || '',
      outstandingBalance: outstanding,
      tamilMessage,
      englishMessage,
      combinedMessage,
      whatsappDeepLink,
    };
  }
}
