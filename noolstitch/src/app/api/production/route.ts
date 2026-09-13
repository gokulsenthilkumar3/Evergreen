import 'server-only';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const challans = await prisma.jobWorkChallan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dispatchLines: { include: { item: true } },
        receiptLines: { include: { item: true } },
      },
    });

    const mapped = challans.map((challan) => ({
      ...challan,
      dispatchLines: challan.dispatchLines.map((line) => ({
        ...line,
        qtyDispatched: line.qtyDispatched.toString(),
      })),
      receiptLines: challan.receiptLines.map((line) => ({
        ...line,
        qtyReceived: line.qtyReceived.toString(),
        scrapQty: line.scrapQty.toString(),
      })),
    }));

    return NextResponse.json({ items: mapped }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
