// @polsia:user-owned — GET /api/invoices/[id]: read by cuid, return InvoiceItem
// (404 if missing). Validated through the shared contract so the wire shape
// stays in lockstep with the client.
import 'server-only';
import { NextResponse } from 'next/server';
import { InvoiceItem } from '@/lib/contracts/invoice';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function decimalString(n: unknown): string {
  if (typeof n === 'string') return Number(n).toFixed(2);
  if (typeof n === 'number') return n.toFixed(2);
  if (n && typeof (n as { toFixed?: unknown }).toFixed === 'function') {
    return (n as { toFixed: (d: number) => string }).toFixed(2);
  }
  return '0.00';
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const item = InvoiceItem.parse({
    id: invoice.id,
    sellerName: invoice.sellerName,
    sellerGstin: invoice.sellerGstin,
    sellerState: invoice.sellerState,
    sellerAddress: invoice.sellerAddress,
    buyerName: invoice.buyerName,
    buyerGstin: invoice.buyerGstin,
    buyerState: invoice.buyerState,
    buyerAddress: invoice.buyerAddress,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
    totalTaxable: decimalString(invoice.totalTaxable),
    totalCgst: decimalString(invoice.totalCgst),
    totalSgst: decimalString(invoice.totalSgst),
    totalIgst: decimalString(invoice.totalIgst),
    grandTotal: decimalString(invoice.grandTotal),
    createdAt: invoice.createdAt.toISOString(),
    items: invoice.items.map((it) => ({
      id: it.id,
      description: it.description,
      hsnSac: it.hsnSac,
      qty: it.qty.toString(),
      unitRate: it.unitRate.toString(),
      gstRate: it.gstRate.toString(),
      taxable: decimalString(it.taxable),
      cgst: decimalString(it.cgst),
      sgst: decimalString(it.sgst),
      igst: decimalString(it.igst),
      lineTotal: decimalString(it.lineTotal),
    })),
  });

  return NextResponse.json(item, { status: 200 });
}
