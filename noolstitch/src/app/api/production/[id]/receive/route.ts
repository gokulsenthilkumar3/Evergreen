import 'server-only';
import { NextResponse } from 'next/server';
import { JobWorkReceiveCreate } from '@/lib/contracts/production';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const challanId = params.id;
  try {
    const body = await req.json();
    const result = JobWorkReceiveCreate.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      }
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    const data = result.data;

    const receipt = await prisma.$transaction(async (tx) => {
      // 1. Mark Challan as Completed
      await tx.jobWorkChallan.update({
        where: { id: challanId },
        data: { status: 'COMPLETED' },
      });

      // 2. Create Receipt Lines and Increment Inventory
      const lines = [];
      for (const line of data.receiptLines) {
        const qtyReceived = Number(line.qtyReceived);
        const scrapQty = Number(line.scrapQty || 0);

        const receiptLine = await tx.jobWorkReceiptLine.create({
          data: {
            challanId,
            itemId: line.itemId,
            qtyReceived,
            scrapQty,
          },
        });
        lines.push(receiptLine);

        // Increment inventory stock for processed materials
        await tx.inventoryItem.update({
          where: { id: line.itemId },
          data: {
            currentStock: {
              increment: qtyReceived,
            },
          },
        });
      }
      return lines;
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
