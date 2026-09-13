import 'server-only';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CostingSheetCreate } from '@/lib/contracts/costing';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const sheets = await prisma.costingSheet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { components: true },
    });

    const mapped = sheets.map((sheet) => ({
      ...sheet,
      totalMaterialCost: sheet.totalMaterialCost.toString(),
      totalProcessCost: sheet.totalProcessCost.toString(),
      totalOverheads: sheet.totalOverheads.toString(),
      grandTotal: sheet.grandTotal.toString(),
      components: sheet.components.map((c) => ({
        ...c,
        qty: c.qty.toString(),
        rate: c.rate.toString(),
        amount: c.amount.toString(),
      })),
    }));

    return NextResponse.json({ items: mapped }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = CostingSheetCreate.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      }
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    const data = result.data;

    let totalMaterialCost = 0;
    let totalProcessCost = 0;
    let totalOverheads = 0;

    const componentsWithAmount = data.components.map((comp) => {
      const amount = Number(comp.qty) * Number(comp.rate);
      if (comp.type === 'MATERIAL') totalMaterialCost += amount;
      else if (comp.type === 'PROCESS') totalProcessCost += amount;
      else if (comp.type === 'OVERHEAD') totalOverheads += amount;
      return {
        type: comp.type,
        description: comp.description,
        qty: Number(comp.qty),
        rate: Number(comp.rate),
        amount,
      };
    });

    const grandTotal = totalMaterialCost + totalProcessCost + totalOverheads;

    // Use transaction to ensure consistency
    const sheet = await prisma.$transaction(async (tx) => {
      return await tx.costingSheet.create({
        data: {
          styleCode: data.styleCode,
          description: data.description,
          totalMaterialCost,
          totalProcessCost,
          totalOverheads,
          grandTotal,
          components: {
            create: componentsWithAmount,
          },
        },
        include: { components: true },
      });
    });

    const mapped = {
      ...sheet,
      totalMaterialCost: sheet.totalMaterialCost.toString(),
      totalProcessCost: sheet.totalProcessCost.toString(),
      totalOverheads: sheet.totalOverheads.toString(),
      grandTotal: sheet.grandTotal.toString(),
      components: sheet.components.map((c) => ({
        ...c,
        qty: c.qty.toString(),
        rate: c.rate.toString(),
        amount: c.amount.toString(),
      })),
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { errors: { styleCode: 'Style code already exists' } },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
