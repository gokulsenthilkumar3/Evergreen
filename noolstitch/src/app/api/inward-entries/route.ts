// @polsia:user-owned — POST /api/inward-entries
import 'server-only';
import { NextResponse } from 'next/server';
import { computeInwardEntryTotals, computeInwardLine } from '@/lib/business/inventory';
import { InwardEntryCreate, InwardEntrySchema } from '@/lib/contracts/inventory';
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
    const parsed = InwardEntryCreate.safeParse(await req.json());
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

    const computedRows = data.lines.map((line) => {
      const computed = computeInwardLine({
        qtyReceived: Number(line.qtyReceived),
        unitCost: Number(line.unitCost),
      });
      return {
        ...line,
        lineTotal: computed.lineTotal.toFixed(2),
      };
    });

    const totals = computeInwardEntryTotals(
      computedRows.map((row) => ({ lineTotal: Number(row.lineTotal) })),
    );

    const created = await prisma.$transaction(async (tx) => {
      // 1. Create Inward Entry
      const entry = await tx.inwardEntry.create({
        data: {
          receiptDate: new Date(`${data.receiptDate}T00:00:00Z`),
          supplierName: data.supplierName,
          referenceNumber: data.referenceNumber,
          totalValue: totals.totalValue.toFixed(2),
        },
      });

      // 2. Create Line Items and Update Inventory Stock
      const items = await Promise.all(
        computedRows.map(async (row) => {
          const line = await tx.inwardEntryLine.create({
            data: {
              inwardEntryId: entry.id,
              itemId: row.itemId,
              qtyReceived: row.qtyReceived,
              unitCost: row.unitCost,
              lineTotal: row.lineTotal,
            },
          });

          // Increment stock
          await tx.inventoryItem.update({
            where: { id: row.itemId },
            data: {
              currentStock: {
                increment: Number(row.qtyReceived),
              },
            },
          });

          return line;
        }),
      );
      return { ...entry, items };
    });

    const item = InwardEntrySchema.parse({
      id: created.id,
      receiptDate: created.receiptDate.toISOString().slice(0, 10),
      supplierName: created.supplierName,
      referenceNumber: created.referenceNumber || undefined,
      totalValue: decimalString(created.totalValue),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      lines: created.items.map((it) => ({
        id: it.id,
        inwardEntryId: it.inwardEntryId,
        itemId: it.itemId,
        qtyReceived: decimalString(it.qtyReceived),
        unitCost: decimalString(it.unitCost),
        lineTotal: decimalString(it.lineTotal),
        createdAt: it.createdAt.toISOString(),
        updatedAt: it.updatedAt.toISOString(),
      })),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
