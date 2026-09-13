// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import {
  InvoiceCreate,
  InvoiceItem,
  InvoiceLineItemCreate,
  InvoiceList,
} from '@/lib/contracts/invoice';

vi.mock('server-only', () => ({}));

const validInvoice = {
  sellerName: 'Tiruppur Knits',
  sellerGstin: '33ABCDE1234F1Z5',
  sellerState: 'Tamil Nadu',
  sellerAddress: '12 Kumaran Road',
  buyerName: 'Bengaluru Garments',
  buyerGstin: '29ABCDE1234F1Z5',
  buyerState: 'Karnataka',
  buyerAddress: '22 MG Road',
  invoiceNumber: 'INV-001',
  invoiceDate: '2026-01-20',
  lines: [
    {
      description: 'Cotton jersey',
      hsnSac: '5208',
      qty: '10',
      unitRate: '180.00',
      gstRate: '5.00',
    },
  ],
} as const;

describe('invoice shared contract', () => {
  it('InvoiceLineItemCreate validates a numeric string, not a number', () => {
    expect(
      InvoiceLineItemCreate.safeParse({
        description: 'x',
        hsnSac: '5208',
        qty: '10',
        unitRate: '180',
        gstRate: '5',
      }).success,
    ).toBe(true);
    // Numbers must be coerced to strings upstream (form/server contract).
    expect(
      InvoiceLineItemCreate.safeParse({
        description: 'x',
        hsnSac: '5208',
        qty: 10,
        unitRate: 180,
        gstRate: 5,
      }).success,
    ).toBe(false);
  });

  it('InvoiceLineItemCreate rejects out-of-range HSN/SAC', () => {
    expect(
      InvoiceLineItemCreate.safeParse({
        description: 'x',
        hsnSac: '123', // 3 digits – too short
        qty: '1',
        unitRate: '1',
        gstRate: '5',
      }).success,
    ).toBe(false);
    expect(
      InvoiceLineItemCreate.safeParse({
        description: 'x',
        hsnSac: '123456789', // 9 digits – too long
        qty: '1',
        unitRate: '1',
        gstRate: '5',
      }).success,
    ).toBe(false);
  });

  it('InvoiceCreate requires a non-empty lines array', () => {
    expect(InvoiceCreate.safeParse({ ...validInvoice, lines: [] }).success).toBe(false);
    expect(InvoiceCreate.safeParse(validInvoice).success).toBe(true);
  });

  it('InvoiceCreate rejects malformed GSTIN', () => {
    const result = InvoiceCreate.safeParse({ ...validInvoice, sellerGstin: 'BAD' });
    expect(result.success).toBe(false);
  });

  it('InvoiceCreate uppercases the GSTIN before validation', () => {
    const result = InvoiceCreate.safeParse({
      ...validInvoice,
      sellerGstin: '33abcde1234f1z5',
    });
    expect(result.success).toBe(true);
  });

  it('InvoiceItem wraps an invoice + line items only when id is present', () => {
    expect(
      InvoiceItem.safeParse({
        id: 'inv_1',
        createdAt: '2026-01-20T00:00:00.000Z',
        // No items, no totals -> fails the required check.
      }).success,
    ).toBe(false);
    expect(
      InvoiceItem.safeParse({
        id: 'inv_1',
        sellerName: validInvoice.sellerName,
        sellerGstin: validInvoice.sellerGstin,
        sellerState: validInvoice.sellerState,
        sellerAddress: validInvoice.sellerAddress,
        buyerName: validInvoice.buyerName,
        buyerGstin: validInvoice.buyerGstin,
        buyerState: validInvoice.buyerState,
        buyerAddress: validInvoice.buyerAddress,
        invoiceNumber: validInvoice.invoiceNumber,
        invoiceDate: validInvoice.invoiceDate,
        totalTaxable: '1800.00',
        totalCgst: '0',
        totalSgst: '0',
        totalIgst: '90.00',
        grandTotal: '1890.00',
        createdAt: '2026-01-20T00:00:00.000Z',
        items: validInvoice.lines.map((l, i) => ({
          ...l,
          id: `line_${i}`,
          taxable: '1800.00',
          cgst: '0',
          sgst: '0',
          igst: '90.00',
          lineTotal: '1890.00',
        })),
      }).success,
    ).toBe(true);
  });

  it('InvoiceList wraps an array of items, rejects empty id', () => {
    expect(InvoiceList.safeParse({ items: [] }).success).toBe(true);
    expect(
      InvoiceList.safeParse({
        items: [{ ...validInvoice, id: '', createdAt: '2026-01-20T00:00:00.000Z' }],
      }).success,
    ).toBe(false);
  });
});
