// @polsia:user-owned — POST /api/invoices: validate via the shared contract,
// re-compute every line through computeInvoiceLine (never trust client numbers),
// persist with $transaction, return InvoiceItem (201).
import 'server-only';
import { NextResponse } from 'next/server';
import { computeInvoiceLine, computeInvoiceTotals } from '@/lib/business/invoice-tax';
import { InvoiceCreate, InvoiceItem } from '@/lib/contracts/invoice';
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

export async function POST(req: Request) {
  try {
    const parsed = InvoiceCreate.safeParse(await req.json());
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        const msg = messages?.[0];
        if (msg) errors[field] = msg;
      }
      return NextResponse.json({ errors }, { status: 400 });
    }
    const data = parsed.data;

    // Per-line: compute the GST math ONCE here, then drop straight into the
    // prisma.create below. We never reach back into a parallel array by index,
    // so there is no non-null assertion to make.
    const computedRows = data.lines.map((line) => {
      const computed = computeInvoiceLine({
        qty: Number(line.qty),
        unitRate: Number(line.unitRate),
        gstRate: Number(line.gstRate),
        sellerState: data.sellerState,
        buyerState: data.buyerState,
      });
      return {
        description: line.description,
        hsnSac: line.hsnSac,
        qty: line.qty,
        unitRate: line.unitRate,
        gstRate: line.gstRate,
        taxable: computed.taxable.toFixed(2),
        cgst: computed.cgst.toFixed(2),
        sgst: computed.sgst.toFixed(2),
        igst: computed.igst.toFixed(2),
        lineTotal: computed.lineTotal.toFixed(2),
      };
    });
    const totals = computeInvoiceTotals(
      computedRows.map((row) => ({
        split: data.sellerState === data.buyerState ? ('CGST_SGST' as const) : ('IGST' as const),
        taxable: Number(row.taxable),
        cgst: Number(row.cgst),
        sgst: Number(row.sgst),
        igst: Number(row.igst),
        lineTotal: Number(row.lineTotal),
      })),
    );

    const created = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          sellerName: data.sellerName,
          sellerGstin: data.sellerGstin,
          sellerState: data.sellerState,
          sellerAddress: data.sellerAddress,
          buyerName: data.buyerName,
          buyerGstin: data.buyerGstin,
          buyerState: data.buyerState,
          buyerAddress: data.buyerAddress,
          invoiceNumber: data.invoiceNumber,
          invoiceDate: new Date(`${data.invoiceDate}T00:00:00Z`),
          totalTaxable: totals.totalTaxable.toFixed(2),
          totalCgst: totals.totalCgst.toFixed(2),
          totalSgst: totals.totalSgst.toFixed(2),
          totalIgst: totals.totalIgst.toFixed(2),
          grandTotal: totals.grandTotal.toFixed(2),
        },
      });
      const items = await Promise.all(
        computedRows.map((row) =>
          tx.invoiceLineItem.create({
            data: {
              invoiceId: invoice.id,
              description: row.description,
              hsnSac: row.hsnSac,
              qty: row.qty,
              unitRate: row.unitRate,
              gstRate: row.gstRate,
              taxable: row.taxable,
              cgst: row.cgst,
              sgst: row.sgst,
              igst: row.igst,
              lineTotal: row.lineTotal,
            },
          }),
        ),
      );
      return { ...invoice, items };
    });

    const item = InvoiceItem.parse({
      id: created.id,
      sellerName: created.sellerName,
      sellerGstin: created.sellerGstin,
      sellerState: created.sellerState,
      sellerAddress: created.sellerAddress,
      buyerName: created.buyerName,
      buyerGstin: created.buyerGstin,
      buyerState: created.buyerState,
      buyerAddress: created.buyerAddress,
      invoiceNumber: created.invoiceNumber,
      invoiceDate: created.invoiceDate.toISOString().slice(0, 10),
      totalTaxable: decimalString(created.totalTaxable),
      totalCgst: decimalString(created.totalCgst),
      totalSgst: decimalString(created.totalSgst),
      totalIgst: decimalString(created.totalIgst),
      grandTotal: decimalString(created.grandTotal),
      createdAt: created.createdAt.toISOString(),
      items: created.items.map((it) => ({
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

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique constraint') || msg.includes('unique')) {
      return NextResponse.json({ errors: { invoiceNumber: 'Already used' } }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
