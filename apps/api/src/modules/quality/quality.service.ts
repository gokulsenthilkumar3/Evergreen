import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

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
    return this.prisma.qualityInspection.create({ data });
  }
}
