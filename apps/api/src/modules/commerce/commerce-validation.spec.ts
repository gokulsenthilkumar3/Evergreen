import { BadRequestException } from '@nestjs/common';
import { CommerceService } from './commerce.service';

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
  let prisma: any;
  let service: CommerceService;

  beforeEach(() => {
    prisma = {
      catalogueItem: {
        create: jest.fn(async ({ data }) => ({ id: 1, ...data })),
        update: jest.fn(async ({ data }) => ({ ...item, ...data })),
        findUniqueOrThrow: jest.fn(async () => item),
        findMany: jest.fn(async () => [item]),
      },
      stockMovement: {
        count: jest.fn(async () => 0),
        // 100 kg owned by the company; none held for customers.
        aggregate: jest.fn(async ({ where }) => ({
          _sum: { quantity: where.lot ? 0 : 100, reservedQty: 0 },
        })),
        create: jest.fn(),
      },
      stockHold: {
        aggregate: jest.fn(async () => ({ _sum: { quantity: 0 } })),
      },
      customer: {
        create: jest.fn(async ({ data }) => ({ id: 3, ...data })),
        update: jest.fn(async ({ data }) => ({ id: 3, ...data })),
        findUniqueOrThrow: jest.fn(async () => ({
          id: 3,
          state: 'Kerala',
          gstin: '32ABCDE1234F1Z5',
        })),
        findUnique: jest.fn(async () => ({
          id: 3,
          state: 'Kerala',
          active: true,
        })),
      },
      systemSettings: {
        findFirst: jest.fn(async () => ({ sellerState: 'Karnataka' })),
      },
      salesOrder: { create: jest.fn(async ({ data }) => ({ id: 9, ...data })) },
      payment: { findFirst: jest.fn() },
      invoice: { findUnique: jest.fn() },
    };
    prisma.stockTransaction = jest.fn((work: (tx: any) => unknown) =>
      work(prisma),
    );
    service = new CommerceService(prisma);
  });

  const rejects = (promise: Promise<unknown>, message: RegExp) =>
    expect(promise).rejects.toThrow(
      expect.objectContaining({
        constructor: BadRequestException,
        message: expect.stringMatching(message),
      }),
    );

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
