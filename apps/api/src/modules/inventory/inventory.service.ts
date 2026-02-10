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
            select: { batchId: true, supplier: true, bale: true, kg: true },
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

        // Fetch all batches to get bale information
        const batches = await this.prisma.inwardBatch.findMany({
            select: { batchId: true, bale: true }
        });
        const batchMap = new Map(batches.map(b => [b.batchId, b.bale]));

        const yarnMovements = await this.prisma.yarnInventory.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });

        const combined = [
            ...cottonMovements.map((m: any) => ({
                ...m,
                material: 'Cotton',
                bale: m.batchId ? batchMap.get(m.batchId) || 0 : 0
            })),
            ...yarnMovements.map((m: any) => ({ ...m, material: 'Yarn' })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        return combined;
    }

    async getDashboardMetrics(from?: string, to?: string) {
        // Calculate total remaining cotton and yarn
        const lastCotton = await this.prisma.cottonInventory.findFirst({ orderBy: { id: 'desc' } });
        const lastYarn = await this.prisma.yarnInventory.findFirst({ orderBy: { id: 'desc' } });

        // Calculate total bales from all inward batches
        const allBatches = await this.prisma.inwardBatch.findMany({
            select: { bale: true }
        });
        const totalBales = allBatches.reduce((sum, batch) => sum + batch.bale, 0);

        return {
            totalCotton: lastCotton ? lastCotton.balance : 0,
            totalYarn: lastYarn ? lastYarn.balance : 0,
            totalBales: totalBales,
            // ... more metrics
        };
    }

    async getWasteHistory(from?: string, to?: string) {
        const whereClause = from && to ? {
            date: {
                gte: new Date(from),
                lte: new Date(to),
            }
        } : {};

        return this.prisma.wasteInventory.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });
    }

    async deleteInward(id: number) {
        return this.prisma.$transaction(async (tx) => {
            const batch = await tx.inwardBatch.findUnique({
                where: { id }
            });

            if (!batch) throw new Error('Batch not found');

            // 1. Delete inward movements from inventory (reference is batchId)
            await tx.cottonInventory.deleteMany({
                where: { reference: batch.batchId }
            });

            // 2. Delete batch
            await tx.inwardBatch.delete({
                where: { id }
            });

            // 3. Optional: Recalculate all balances? (In a simple app, we just delete)
            return { success: true };
        });
    }

    async deleteOutward(id: number) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Delete yarn inventory movements
            await tx.yarnInventory.deleteMany({
                where: { reference: `OUT-${id}` }
            });

            // 2. Delete outward record (cascades to items)
            await tx.outward.delete({
                where: { id }
            });

            return { success: true };
        });
    }
}
