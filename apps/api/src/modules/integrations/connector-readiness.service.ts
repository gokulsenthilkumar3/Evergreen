import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { request } from 'node:http';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class ConnectorReadinessService {
  constructor(private readonly prisma: PrismaService) {}
  status() {
    return {
      csv: { status: 'available', limit: 500 },
      tally: { status: 'export_available', liveSync: false },
      ewayBill: { status: 'setup_required', registration: false },
      webhooks: { status: 'planned' },
    };
  }
  /** Fixed loopback target: callers cannot use this endpoint to probe arbitrary networks. */
  async tallyConnection(): Promise<{ connected: boolean; message: string }> {
    const port = Number(process.env.TALLY_PORT || 9000);
    if (!Number.isInteger(port) || port < 1 || port > 65535)
      throw new BadRequestException('TALLY_PORT must be a valid port');
    return new Promise((resolve) => {
      let done = false;
      const finish = (connected: boolean, message: string) => {
        if (!done) {
          done = true;
          resolve({ connected, message });
        }
      };
      const req = request(
        {
          hostname: '127.0.0.1',
          port,
          method: 'POST',
          path: '/',
          headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        },
        (res) => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk: string) => {
            body += chunk;
            if (body.length > 65536)
              req.destroy(new Error('Response too large'));
          });
          res.on('error', () =>
            finish(
              false,
              'Tally returned an incomplete response. Check the local HTTP server.',
            ),
          );
          res.on('end', () =>
            finish(
              res.statusCode === 200 && /<COMPANY(?:\s|>)/i.test(body),
              res.statusCode === 200 && /<COMPANY(?:\s|>)/i.test(body)
                ? 'Tally responded with a loaded company. Verify the company before importing.'
                : 'No loaded company was found. Open the company in TallyPrime and enable its HTTP server.',
            ),
          );
        },
      );
      const timer = setTimeout(() => req.destroy(new Error('Timeout')), 5000);
      req.on('close', () => clearTimeout(timer));
      req.on('error', () =>
        finish(
          false,
          'Cannot reach TallyPrime on this API machine. Start Tally, load a company and enable HTTP on the configured port.',
        ),
      );
      req.end(
        '<ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Collection</TYPE><ID>EverGreenCompanies</ID></HEADER><BODY><DESC><TDL><TDLMESSAGE><COLLECTION NAME="EverGreenCompanies"><TYPE>Company</TYPE><FETCH>Name</FETCH></COLLECTION></TDLMESSAGE></TDL></DESC></BODY></ENVELOPE>',
      );
    });
  }
  async ewayReadiness(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const checks = [
      { label: 'Active invoice', passed: invoice.status !== 'VOID' },
      {
        label: 'Seller GSTIN',
        passed: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
          invoice.sellerGSTIN || '',
        ),
      },
      {
        label: 'Seller and buyer addresses',
        passed: Boolean(
          invoice.sellerAddress?.trim() && invoice.customerAddress?.trim(),
        ),
      },
      { label: 'Place of supply', passed: Boolean(invoice.buyerState?.trim()) },
      {
        label: 'HSN codes on all goods',
        passed:
          invoice.items.length > 0 &&
          invoice.items.every((item) => Boolean(item.hsnSac?.trim())),
      },
      {
        label: 'Transport details',
        passed: Boolean(
          invoice.transportMode?.trim() && invoice.vehicleNo?.trim(),
        ),
      },
      {
        label: 'Dispatch/ship-to pincodes and transporter details',
        passed: false,
      },
      { label: 'Authorized GSP or NIC sandbox connection', passed: false },
    ];
    return {
      invoiceNo: invoice.invoiceNo,
      checks,
      readyToRegister: false,
      message:
        'Preparation checklist only. No e-Way Bill has been registered. Confirm transport-mode-specific requirements with your authorized provider.',
    };
  }
}
