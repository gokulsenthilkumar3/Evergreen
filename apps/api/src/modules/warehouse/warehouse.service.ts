import { BadRequestException, Injectable } from '@nestjs/common';
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
    toLocationId?: number;
  }) {
    return this.prisma.stockTransaction(async tx => {
      if (!Number.isFinite(data.quantity) || data.quantity <= 0 || !['IN', 'OUT', 'TRANSFER'].includes(data.movementType)) throw new BadRequestException('Enter a positive quantity and a valid location movement');
      const location = await tx.warehouseLocation.findUnique({ where: { id: data.locationId } });
      const item = await tx.catalogueItem.findUnique({ where: { id: data.itemId } });
      if (!location?.active || !item?.active || item.type === 'SERVICE') throw new BadRequestException('Choose an active location and a stocked catalogue item');
      const stock = await tx.stockMovement.aggregate({ where: { itemId: item.id }, _sum: { quantity: true } });
      const movements = await tx.warehouseMovement.findMany({ where: { itemId: item.id } });
      const signed = (row: { movementType: string; quantity: number }) => row.movementType === 'IN' ? row.quantity : row.movementType === 'OUT' ? -row.quantity : 0;
      const allocated = movements.reduce((sum, row) => sum + signed(row), 0);
      const inLocation = movements.filter(row => row.locationId === location.id).reduce((sum, row) => sum + signed(row), 0);
      if (data.movementType === 'IN' && data.quantity > Number(stock._sum.quantity || 0) - allocated + 0.0001) throw new BadRequestException('Location allocation exceeds received stock. Receive the material first.');
      if (data.movementType !== 'IN' && data.quantity > inLocation + 0.0001) throw new BadRequestException('This location does not contain enough of the selected item');
      const { toLocationId, ...movement } = data;
      if (data.movementType !== 'TRANSFER') return tx.warehouseMovement.create({ data: movement });
      const destination = toLocationId ? await tx.warehouseLocation.findUnique({ where: { id: toLocationId } }) : null;
      if (!destination?.active || destination.id === location.id) throw new BadRequestException('Choose a different active destination for the transfer');
      const referenceId = movement.referenceId || `TRANSFER-${Date.now()}`;
      const out = await tx.warehouseMovement.create({ data: { ...movement, movementType: 'OUT', referenceId } });
      const inward = await tx.warehouseMovement.create({ data: { ...movement, locationId: destination.id, movementType: 'IN', referenceId } });
      return { out, inward };
    });
  }
}
