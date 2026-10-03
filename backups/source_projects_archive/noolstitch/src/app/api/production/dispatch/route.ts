import 'server-only';
import { NextResponse } from 'next/server';
import { JobWorkChallanCreate } from '@/lib/contracts/production';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = JobWorkChallanCreate.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      }
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    const data = result.data;

    const challan = await prisma.$transaction(async (tx) => {
      // 1. Create the Challan and dispatch lines
      const newChallan = await tx.jobWorkChallan.create({
        data: {
          challanDate: new Date(data.challanDate),
          jobWorkerName: data.jobWorkerName,
          processType: data.processType,
          notes: data.notes,
          status: 'PENDING',
          dispatchLines: {
            create: data.dispatchLines.map((line) => ({
              itemId: line.itemId,
              qtyDispatched: Number(line.qtyDispatched),
            })),
          },
        },
        include: { dispatchLines: true },
      });

      // 2. Decrement inventory stock for dispatched materials
      for (const line of newChallan.dispatchLines) {
        await tx.inventoryItem.update({
          where: { id: line.itemId },
          data: {
            currentStock: {
              decrement: Number(line.qtyDispatched),
            },
          },
        });
      }

      return newChallan;
    });

    return NextResponse.json(challan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
