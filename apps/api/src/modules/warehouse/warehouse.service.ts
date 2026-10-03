import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  listLocations() {
    return this.prisma.warehouseLocation.findMany({
      include: {
        stockMovements: { take: 5, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  createLocation(data: {
    name: string;
    zone?: string;
    description?: string;
    createdBy?: string;
  }) {
    return this.prisma.warehouseLocation.create({ data });
  }

  listMovements(locationId?: number) {
    return this.prisma.warehouseMovement.findMany({
      where: locationId ? { locationId } : undefined,
      include: { location: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  createMovement(data: {
    locationId: number;
    itemId: number;
    quantity: number;
    movementType: string;
    referenceId?: string;
    notes?: string;
    createdBy?: string;
  }) {
    return this.prisma.warehouseMovement.create({ data });
  }
}
