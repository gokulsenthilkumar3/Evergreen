import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class MachineService {
  constructor(private prisma: PrismaService) {}

  listMachines() {
    return this.prisma.machine.findMany({
      include: { inspections: { take: 3, orderBy: { date: 'desc' } } },
      orderBy: { name: 'asc' },
    });
  }

  createMachine(data: {
    name: string;
    type: string;
    serialNo?: string;
    manufacturer?: string;
    purchasedAt?: Date | string;
    notes?: string;
    createdBy?: string;
  }) {
    return this.prisma.machine.create({ data });
  }

  listInspections(machineId?: number) {
    return this.prisma.machineInspection.findMany({
      where: machineId ? { machineId } : undefined,
      include: { machine: { select: { name: true, type: true } } },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  createInspection(data: {
    machineId: number;
    type: string;
    status?: string;
    description?: string;
    cost?: number;
    resolvedAt?: Date | string;
    createdBy?: string;
  }) {
    return this.prisma.machineInspection.create({ data });
  }
}
