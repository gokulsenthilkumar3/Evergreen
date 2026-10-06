import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { freezeOrdersForHold } from '../../services/business-ledger';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  listInspections(params?: { from?: string; to?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (params?.status) where.status = params.status;
    if (params?.from || params?.to) {
      where.date = {};
      if (params.from) (where.date as Record<string, Date>).gte = new Date(params.from);
      if (params.to) (where.date as Record<string, Date>).lte = new Date(params.to);
    }
    return this.prisma.qualityInspection.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  createInspection(data: {
    lotId?: number;
    holdQuantity?: number;
    productionId?: number;
    batchId?: string;
    yarnCount?: string;
    sampleWeight?: number;
    tenacity?: number;
    elongation?: number;
    imperfections?: number;
    classimateFaults?: number;
    unevenness?: number;
    status?: string;
    disposition?: string;
    remarks?: string;
    inspectedBy?: string;
  }) {
    return this.prisma.stockTransaction(async tx => {
      if (['HOLD', 'FAIL'].includes(data.status || '') && (!data.lotId || !data.holdQuantity)) throw new BadRequestException('A failed/held inspection needs a stock lot and quarantined quantity');
      if (data.lotId && !await tx.stockLot.findUnique({ where: { id: data.lotId } })) throw new BadRequestException('Stock lot not found');
      const inspection = await tx.qualityInspection.create({ data });
      if (['HOLD', 'FAIL'].includes(data.status || '')) {
        const lot = await tx.stockLot.findUniqueOrThrow({ where: { id: data.lotId! } });
        await freezeOrdersForHold(tx, lot.itemId, data.holdQuantity!, data.inspectedBy || 'UNKNOWN');
      }
      if (['HOLD', 'FAIL'].includes(data.status || '')) await tx.stockHold.create({ data: { lotId: data.lotId!, quantity: data.holdQuantity!, inspectionId: inspection.id, reason: data.remarks || 'Quality inspection hold', createdBy: data.inspectedBy || 'UNKNOWN' } });
      return inspection;
    });
  }
}
