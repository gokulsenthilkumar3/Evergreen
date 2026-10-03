// @polsia:user-owned — POST and GET /api/inventory
import 'server-only';
import { NextResponse } from 'next/server';
import { InventoryItemCreate, InventoryItemSchema } from '@/lib/contracts/inventory';
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

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
    });

    const mapped = items.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description || undefined,
      currentStock: decimalString(item.currentStock),
      uom: item.uom,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return NextResponse.json({ items: mapped }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const parsed = InventoryItemCreate.safeParse(await req.json());
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
    const created = await prisma.inventoryItem.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        currentStock: Number(data.currentStock),
        uom: data.uom,
      },
    });

    const item = InventoryItemSchema.parse({
      id: created.id,
      sku: created.sku,
      name: created.name,
      description: created.description || undefined,
      currentStock: decimalString(created.currentStock),
      uom: created.uom,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique constraint') || msg.includes('unique')) {
      return NextResponse.json({ errors: { sku: 'SKU already exists' } }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
