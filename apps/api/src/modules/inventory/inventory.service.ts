import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async getInwardHistory(from?: string, to?: string) {
        const whereClause = from && to ? {
            date: {
                gte: new Date(from),
                lte: new Date(to),
            }
        } : {};

        return this.prisma.inwardBatch.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });
    }

    async getAvailableBatches() {
        return this.prisma.inwardBatch.findMany({
            select: { batchId: true, supplier: true, kg: true },
            orderBy: { date: 'desc' }
        });
    }

    async getOutwardHistory(from?: string, to?: string) {
        const whereClause = from && to ? {
            date: {
                gte: new Date(from),
                lte: new Date(to),
            }
        } : {};

        return this.prisma.outward.findMany({
            where: whereClause,
            include: { items: true },
            orderBy: { date: 'desc' },
        });
    }

    async createOutward(data: {
        date: string;
        customerName: string;
        vehicleNo: string;
        driverName: string;
        items: Array<{ count: string; bags: number; weight: number }>;
    }) {
        return this.prisma.$transaction(async (tx) => {
            const totalBags = data.items.reduce((sum, item) => sum + item.bags, 0);
            const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0);

            // 1. Create Outward record
            const outward = await tx.outward.create({
                data: {
                    date: new Date(data.date),
                    customerName: data.customerName,
                    vehicleNo: data.vehicleNo,
                    driverName: data.driverName,
                    totalBags,
                    totalWeight,
                    items: {
                        create: data.items.map(item => ({
                            count: item.count,
                            bags: item.bags,
                            weight: item.weight
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Deduct from Yarn Inventory for each count
            for (const item of data.items) {
                const lastYarnEntry = await tx.yarnInventory.findFirst({
                    where: { count: item.count },
                    orderBy: { id: 'desc' }
                });

                const currentBalance = lastYarnEntry ? lastYarnEntry.balance : 0;

                await tx.yarnInventory.create({
                    data: {
                        date: new Date(data.date),
                        type: 'OUTWARD',
                        quantity: -item.weight,
                        balance: currentBalance - item.weight,
                        reference: `OUT-${outward.id}`,
                        count: item.count
                    }
                });
            }

            return outward;
        });
    }

    async createInward(data: { batchId: string; date: string; supplier: string; bale: number; kg: number }) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create Inward Batch record
            const batch = await tx.inwardBatch.create({
                data: {
                    batchId: data.batchId,
                    date: new Date(data.date),
                    supplier: data.supplier,
                    bale: data.bale,
                    kg: data.kg,
                }
            });

            // 2. Get latest balance
            const lastEntry = await tx.cottonInventory.findFirst({
                orderBy: { id: 'desc' }
            });
            const currentBalance = lastEntry ? lastEntry.balance : 0;

            // 3. Add to Cotton Inventory
            await tx.cottonInventory.create({
                data: {
                    date: new Date(data.date),
                    type: 'INWARD',
                    quantity: data.kg,
                    balance: currentBalance + data.kg,
                    reference: data.batchId,
                    batchId: data.batchId
                }
            });

            return batch;
        });
    }

    async getHistory(from?: string, to?: string) {
        const whereClause = from && to ? {
            date: {
                gte: new Date(from),
                lte: new Date(to),
            }
        } : {};

        const cottonMovements = await this.prisma.cottonInventory.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });

        const yarnMovements = await this.prisma.yarnInventory.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });

        const combined = [
            ...cottonMovements.map((m: any) => ({ ...m, material: 'Cotton' })),
            ...yarnMovements.map((m: any) => ({ ...m, material: 'Yarn' })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        return combined;
    }

    async getDashboardMetrics(from?: string, to?: string) {
        // Calculate total remaining cotton and yarn
        const lastCotton = await this.prisma.cottonInventory.findFirst({ orderBy: { id: 'desc' } });
        const lastYarn = await this.prisma.yarnInventory.findFirst({ orderBy: { id: 'desc' } });

        return {
            totalCotton: lastCotton ? lastCotton.balance : 0,
            totalYarn: lastYarn ? lastYarn.balance : 0,
            // ... more metrics
        };
    }
}
