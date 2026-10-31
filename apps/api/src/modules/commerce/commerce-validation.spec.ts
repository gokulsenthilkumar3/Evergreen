import { BadRequestException } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { PrismaService } from '../../services/prisma.service';

/** Command-level validation that does not depend on stock or ledger state. */
describe('CommerceService input validation', () => {
  const item = {
    id: 7,
    name: 'Yarn 40s',
    sku: 'Y40',
    type: 'YARN',
    uom: 'KG',
    gstRate: 5,
    salePrice: 250,
    active: true,
    shopVisible: false,
    legacySource: null,
  };
  type Write = { data: Record<string, unknown> };
  const resolves = <T>(value: T) => jest.fn(() => Promise.resolve(value));
  const echo = (base: Record<string, unknown>) =>
    jest.fn(({ data }: Write) => Promise.resolve({ ...base, ...data }));
  const makePrisma = () => {
    const client = {
      catalogueItem: {
        create: echo({ id: 1 }),
        update: echo(item),
        findUniqueOrThrow: resolves(item),
        findMany: resolves([item]),
      },
      stockMovement: {
        count: resolves(0),
        // 100 kg owned by the company; none held for customers.
        aggregate: jest.fn(({ where }: { where: { lot?: unknown } }) =>
          Promise.resolve({
            _sum: { quantity: where.lot ? 0 : 100, reservedQty: 0 },
          }),
        ),
        create: jest.fn(),
      },
      stockHold: { aggregate: resolves({ _sum: { quantity: 0 } }) },
      customer: {
        create: echo({ id: 3 }),
        update: echo({ id: 3 }),
        findUniqueOrThrow: resolves({
          id: 3,
          state: 'Kerala',
          gstin: '32ABCDE1234F1Z5',
        }),
        findUnique: resolves({ id: 3, state: 'Kerala', active: true }),
      },
      systemSettings: { findFirst: resolves({ sellerState: 'Karnataka' }) },
      salesOrder: { create: echo({ id: 9 }) },
      payment: { findFirst: jest.fn() },
      invoice: { findUnique: jest.fn() },
    };
    return {
      ...client,
      stockTransaction: jest.fn((work: (tx: typeof client) => unknown) =>
        work(client),
      ),
    };
  };
  let prisma: ReturnType<typeof makePrisma>;
  let service: CommerceService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CommerceService(prisma as unknown as PrismaService);
  });

  const rejects = async (promise: Promise<unknown>, message: RegExp) => {
    const error: unknown = await promise.then(
      () => undefined,
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as Error).message).toMatch(message);
  };

  describe('catalogue items', () => {
    const base = { name: 'Yarn 30s', sku: 'y30', type: 'YARN' };

    it.each([
      [{ gstRate: -5 }, /GST rate/],
      [{ gstRate: 500 }, /GST rate/],
      [{ gstRate: 'five' }, /GST rate/],
      [{ salePrice: -10 }, /Sale price/],
      [{ costPrice: Infinity }, /Cost price/],
      [{ reorderLevel: -1 }, /Reorder level/],
      [{ type: 'BANANA' }, /Item type must be one of/],
      [{ brandId: 1.5 }, /valid brand/],
      [{ uom: '  ' }, /Unit is required/],
    ])('rejects %j on create', async (override, message) => {
      await rejects(service.createItem({ ...base, ...override }), message);
      expect(prisma.catalogueItem.create).not.toHaveBeenCalled();
    });

    it('stores a valid item with an upper-case SKU and blank amounts as zero', async () => {
      const created = await service.createItem({
        ...base,
        sku: ' y30 ',
        gstRate: '5',
        salePrice: '',
      });
      expect(created).toMatchObject({ sku: 'Y30', gstRate: 5, salePrice: 0 });
    });

    it.each([
      [{ name: '   ' }, /Item name is required/],
      [{ sku: '' }, /SKU is required/],
      [{ gstRate: null }, /GST rate cannot be cleared/],
      [{ gstRate: 101 }, /GST rate/],
      [{ active: 'no' }, /active must be true or false/],
      [{ shopVisible: 1 }, /shopVisible must be true or false/],
      [{ type: 'WASTE' }, /Item type must be one of/],
    ])('rejects %j on update', async (override, message) => {
      await rejects(service.updateItem(7, override), message);
      expect(prisma.catalogueItem.update).not.toHaveBeenCalled();
    });

    it('updates only supplied fields', async () => {
      await service.updateItem(7, {
        salePrice: 260,
        name: ' Yarn 40s combed ',
      });
      expect(prisma.catalogueItem.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { salePrice: 260, name: 'Yarn 40s combed' },
      });
    });
  });

  describe('customers', () => {
    it.each([
      [{ gstin: 'NOT-A-GSTIN' }, /valid 15-character GSTIN/],
      [{ email: 'nope' }, /valid email/],
      [{ phone: '12' }, /valid phone/],
      [{ state: 'Atlantis' }, /Indian state/],
      [
        { gstin: '33ABCDE1234F1Z5', state: 'Kerala' },
        /registered in Tamil Nadu, not Kerala/,
      ],
    ])('rejects %j', async (override, message) => {
      await rejects(
        service.createCustomer({ name: 'Buyer', ...override }),
        message,
      );
      expect(prisma.customer.create).not.toHaveBeenCalled();
    });

    it('takes the state from the GSTIN when none is given', async () => {
      const customer = await service.createCustomer({
        name: 'Buyer',
        gstin: '32abcde1234f1z5',
      });
      expect(customer).toMatchObject({
        gstin: '32ABCDE1234F1Z5',
        state: 'Kerala',
      });
    });

    it('assumes the company state for a customer without GSTIN or state', async () => {
      const customer = await service.createCustomer({ name: 'Walk-in' });
      expect(customer.state).toBe('Karnataka');
    });

    it('checks a state change against the GSTIN already on file', async () => {
      await rejects(
        service.updateCustomer(3, { state: 'Tamil Nadu' }),
        /registered in Kerala, not Tamil Nadu/,
      );
      await expect(
        service.updateCustomer(3, { phone: '+91 98765 43210' }),
      ).resolves.toMatchObject({ phone: '+91 98765 43210' });
    });

    it('rejects a blank name on update', async () => {
      await rejects(
        service.updateCustomer(3, { name: ' ' }),
        /Customer name is required/,
      );
    });
  });

  describe('order GST', () => {
    it('rejects a line GST rate that differs from the catalogue', async () => {
      await rejects(
        service.createOrder({
          customerId: 3,
          lines: [{ itemId: 7, quantity: 10, gstRate: 0 }],
        }),
        /GST for Yarn 40s is 5% in the catalogue/,
      );
      expect(prisma.salesOrder.create).not.toHaveBeenCalled();
    });

    it('accepts a line that restates the catalogue rate', async () => {
      await expect(
        service.createOrder({
          customerId: 3,
          lines: [{ itemId: 7, quantity: 10, gstRate: '5' }],
        }),
      ).resolves.toMatchObject({ id: 9 });
    });
  });

  it('invoices an existing order at its saved GST rate after a catalogue change', async () => {
    const date = new Date(2026, 9, 1);
    const contract = {
      id: 1,
      itemId: 7,
      quantity: 10,
      rate: 250,
      gstRate: 5,
      discount: 0,
      invoicedQty: 0,
      dispatchedQty: 0,
    };
    const tx = {
      ...prisma,
      accountingPeriod: { findFirst: jest.fn(async () => null) },
      catalogueItem: {
        findMany: jest.fn(async () => [{ ...item, gstRate: 18 }]),
      },
      systemSettings: {
        findFirst: jest.fn(async () => ({
          companyName: 'Mill',
          address: 'Address',
          gstin: '29ABCDE1234F1Z5',
          sellerState: 'Karnataka',
        })),
      },
      salesOrder: {
        findUnique: jest.fn(async () => ({
          id: 9,
          customerId: 3,
          status: 'CONFIRMED',
          date,
          lines: [contract],
          invoices: [],
          subtotal: 2500,
          discount: 0,
        })),
        update: jest.fn(),
      },
      salesOrderLine: {
        update: jest.fn(),
        findMany: jest.fn(async () => [{ ...contract, invoicedQty: 10 }]),
      },
      invoice: {
        create: jest.fn(async ({ data }: Write) => ({ id: 5, ...data })),
      },
      customerLedgerEntry: { create: jest.fn() },
    };
    const service = new CommerceService({
      stockTransaction: (work: (client: typeof tx) => unknown) => work(tx),
    } as unknown as PrismaService);
    await expect(
      service.createInvoice({
        customerId: 3,
        salesOrderId: 9,
        date: '2026-10-02',
        lines: [{ itemId: 7, quantity: 10, gstRate: 99 }],
      }),
    ).resolves.toMatchObject({ total: 2625, igst: 125 });
    expect(tx.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          items: { create: [expect.objectContaining({ gstRate: 5 })] },
        }),
      }),
    );
  });

  describe('payment retry key', () => {
    it('treats requestKey like idempotencyKey and returns the earlier receipt', async () => {
      const invoice = { id: 4, customerId: 3, status: 'PARTIAL' };
      prisma.invoice.findUnique.mockResolvedValue(invoice);
      prisma.payment.findFirst.mockResolvedValue({ amount: 100 });
      await expect(
        service.recordInvoicePayment(4, { amount: 100, requestKey: 'abc' }),
      ).resolves.toBe(invoice);
      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: { invoiceId: 4, reference: 'PAYMENT-REQUEST:abc' },
      });
    });

    it('rejects two different keys on one request', async () => {
      await rejects(
        service.recordInvoicePayment(4, {
          amount: 1,
          requestKey: 'a',
          idempotencyKey: 'b',
        }),
        /one payment retry key/,
      );
    });
  });
});
