import { TallyExportService, outputTaxLedgers } from './tally.service';
import { PrismaService } from '../../../services/prisma.service';

describe('outputTaxLedgers', () => {
  const line = (gstRate: number, quantity: number, rate: number) => ({
    gstRate,
    quantity,
    rate,
  });

  it('names intra-state ledgers by half the actual rate', () => {
    expect(
      outputTaxLedgers({
        subtotal: 1000,
        cgst: 90,
        sgst: 90,
        igst: 0,
        items: [line(18, 10, 100)],
      }),
    ).toEqual([
      { name: 'Output CGST 9%', amount: 90 },
      { name: 'Output SGST 9%', amount: 90 },
    ]);
  });

  it('splits mixed rates so the ledgers add up to the saved tax', () => {
    const ledgers = outputTaxLedgers({
      subtotal: 300,
      cgst: 0,
      sgst: 0,
      igst: 41.01,
      items: [line(5, 1, 100), line(18, 1, 200)],
    });
    expect(ledgers.map((l) => l.name)).toEqual([
      'Output IGST 5%',
      'Output IGST 18%',
    ]);
    expect(ledgers.reduce((sum, l) => sum + l.amount, 0)).toBeCloseTo(
      41.01,
      10,
    );
  });

  it('infers the rate of older invoices that kept it only on the invoice', () => {
    expect(
      outputTaxLedgers({
        subtotal: 6000,
        cgst: 150,
        sgst: 150,
        items: [{ rate: 100, weight: 60, gstRate: 0 }],
      }),
    ).toEqual([
      { name: 'Output CGST 2.5%', amount: 150 },
      { name: 'Output SGST 2.5%', amount: 150 },
    ]);
  });

  it('returns no tax ledgers for an exempt invoice', () => {
    expect(
      outputTaxLedgers({
        subtotal: 500,
        cgst: 0,
        sgst: 0,
        items: [line(0, 5, 100)],
      }),
    ).toEqual([]);
  });
});

describe('TallyExportService.generateTallyXml', () => {
  const invoice = {
    id: 1,
    invoiceNo: 'INV-1',
    date: new Date(2026, 9, 30, 18, 0),
    customerName: 'Buyer & Co',
    subtotal: 1000,
    discount: 0,
    cgst: 25,
    sgst: 25,
    igst: 0,
    total: 1050,
    status: 'PAID',
    items: [line(5)],
    outward: null,
  };
  function line(gstRate: number) {
    return {
      gstRate,
      quantity: 10,
      rate: 100,
      yarnCount: '40s',
      bags: 0,
      weight: 10,
    };
  }
  const payments = [
    {
      id: 11,
      amount: 500,
      method: 'BANK',
      date: new Date(2026, 9, 30),
      reference: null,
      invoiceId: 1,
      invoice,
    },
    {
      id: 12,
      amount: 550,
      method: 'CHEQUE',
      date: new Date(2026, 9, 30),
      reference: 'CHQ',
      invoiceId: 1,
      invoice,
    },
  ];
  type Query = {
    where: {
      status?: unknown;
      method?: unknown;
      amount?: unknown;
      date?: { gte?: Date; lte?: Date };
    };
  };
  const makePrisma = () => ({
    systemSettings: {
      findFirst: jest.fn(() => Promise.resolve({ companyName: 'QA Mills' })),
    },
    invoice: {
      findMany: jest.fn((query: Query) => {
        void query;
        return Promise.resolve([invoice]);
      }),
      count: jest.fn(() => Promise.resolve(2)),
    },
    payment: {
      findMany: jest.fn((query: Query) =>
        Promise.resolve(
          query.where.method === 'REVERSAL'
            ? [{ reference: 'PAYMENT-REVERSAL:12' }]
            : payments,
        ),
      ),
    },
  });
  let prisma: ReturnType<typeof makePrisma>;
  const service = () =>
    new TallyExportService(prisma as unknown as PrismaService);

  beforeEach(() => {
    prisma = makePrisma();
  });

  it('leaves out void invoices, internal rows and reversed receipts, and reports what it skipped', async () => {
    const result = await service().generateTallyXml({
      from: '2026-10-01',
      to: '2026-10-30',
    });
    const invoiceWhere = prisma.invoice.findMany.mock.calls[0][0].where;
    expect(invoiceWhere.status).toEqual({ not: 'VOID' });
    // The last day is included in full.
    expect(invoiceWhere.date?.lte).toEqual(
      new Date(2026, 9, 30, 23, 59, 59, 999),
    );
    const receiptWhere = prisma.payment.findMany.mock.calls[0][0].where;
    expect(receiptWhere.method).toEqual({
      in: ['CASH', 'BANK', 'UPI', 'CHEQUE'],
    });
    expect(receiptWhere.amount).toEqual({ gt: 0 });
    expect(result.stats).toMatchObject({
      salesCount: 1,
      receiptCount: 1,
      skippedVoidInvoices: 2,
      skippedReversedReceipts: 1,
    });
    expect(result.xml).toContain('REC-11');
    expect(result.xml).not.toContain('REC-12');
    expect(result.xml).not.toMatch(/<AMOUNT>--/);
    expect(result.xml).toContain('Output CGST 2.5%');
    expect(result.xml).toContain('Buyer &amp; Co');
    expect(result.xml).not.toContain('Round Off');
  });

  it('adds a round-off line when the saved total differs from taxable value plus tax', async () => {
    prisma.invoice.findMany.mockResolvedValue([{ ...invoice, total: 1050.3 }]);
    const { xml } = await service().generateTallyXml({
      voucherTypes: ['Sales'],
    });
    expect(xml).toMatch(
      /<LEDGERNAME>Round Off<\/LEDGERNAME>\s*<ISDEEMEDPOSITIVE>No<\/ISDEEMEDPOSITIVE>\s*<AMOUNT>0\.30<\/AMOUNT>/,
    );
  });

  it('rejects an impossible date', async () => {
    await expect(
      service().generateTallyXml({ to: '2026-02-30' }),
    ).rejects.toThrow('YYYY-MM-DD');
  });
});
