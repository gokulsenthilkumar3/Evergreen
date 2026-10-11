import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class MachineService {
  constructor(private prisma: PrismaService) {}

  listMachines() {
    return (this.prisma as any).machine.findMany({
      include: { inspections: { take: 3, orderBy: { date: 'desc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async createMachine(data: {
    name: string;
    type: string;
    serialNo?: string;
    manufacturer?: string;
    purchasedAt?: Date | string;
    notes?: string;
    createdBy?: string;
  }) {
    const settings = await this.prisma.systemSettings.findFirst();
    if (settings && typeof settings.maxMachines === 'number') {
      const machineCount = await (this.prisma as any).machine.count();
      if (machineCount >= settings.maxMachines) {
        throw new ForbiddenException(
          `Machine quota limit reached: Your current license allows up to ${settings.maxMachines} machine(s). Upgrade your license quota to add more.`,
        );
      }
    }
    return (this.prisma as any).machine.create({ data });
  }

  listInspections(machineId?: number) {
    return (this.prisma as any).machineInspection.findMany({
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
    return (this.prisma as any).machineInspection.create({ data });
  }
}
