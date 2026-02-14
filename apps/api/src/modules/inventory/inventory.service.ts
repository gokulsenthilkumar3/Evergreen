import { Injectable, BadRequestException } from '@nestjs/common';
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
        // Find batches with remaining balance via CottonInventory aggregation
        const balances = await this.prisma.cottonInventory.groupBy({
            by: ['batchId'],
            _sum: { quantity: true },
            where: { batchId: { not: null } }
        });

        // Filter active batches (balance > 0)
        const activeBatches = balances
            .filter(b => (b._sum.quantity || 0) > 0.01);

        if (activeBatches.length === 0) return [];

        // Fetch details for active batches
        const ids = activeBatches.map(b => b.batchId!).filter(Boolean);
        const details = await this.prisma.inwardBatch.findMany({
            where: { batchId: { in: ids } },
            select: { batchId: true, supplier: true, bale: true },
            orderBy: { date: 'desc' }
        });

        // Combine details with remaining balance
        return details.map(d => {
            const bal = activeBatches.find(x => x.batchId === d.batchId);
            return {
                batchId: d.batchId,
                supplier: d.supplier,
                bale: d.bale,
                kg: bal?._sum.quantity || 0 // current remaining balance
            };
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
        createdBy?: string;
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
                    createdBy: data.createdBy,
                    items: {
                        create: data.items.map(item => ({
                            count: item.count,
                            bags: item.bags,
                            weight: item.weight,
                            createdBy: data.createdBy
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
                        count: item.count,
                        createdBy: data.createdBy
                    }
                });
            }

            return outward;
        });
    }

    async createInward(data: { batchId: string; date: string; supplier: string; bale: number; kg: number; createdBy?: string }) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create Inward Batch record
            const batch = await tx.inwardBatch.create({
                data: {
                    batchId: data.batchId,
                    date: new Date(data.date),
                    supplier: data.supplier,
                    bale: data.bale,
                    kg: data.kg,
                    createdBy: data.createdBy,
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
                    batchId: data.batchId,
                    createdBy: data.createdBy
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

        // Fetch all batches to get bale and weight information
        const batches = await this.prisma.inwardBatch.findMany({
            select: { batchId: true, bale: true, kg: true }
        });
        const batchMap = new Map(batches.map((b: any) => [b.batchId, { bale: b.bale, kg: b.kg }]));

        const yarnMovements = await this.prisma.yarnInventory.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });

        const wasteMovements = await this.prisma.wasteInventory.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });

        const combined = [
            ...cottonMovements.map((m: any) => {
                const batch = m.batchId ? batchMap.get(m.batchId) : null;
                let baleCount = 0;

                if (batch && batch.kg > 0) {
                    baleCount = (m.quantity / batch.kg) * batch.bale;
                }

                return {
                    ...m,
                    material: 'Cotton',
                    bale: parseFloat(baleCount.toFixed(2))
                };
            }),
            ...yarnMovements.map((m: any) => ({ ...m, material: 'Yarn' })),
            ...wasteMovements.map((m: any) => ({ ...m, material: 'Waste' })),
        ].sort((a: any, b: any) => {
            const dateDiff = b.date.getTime() - a.date.getTime();
            if (dateDiff !== 0) return dateDiff;
            return b.id - a.id;
        });

        return combined;
    }

    async getDashboardMetrics(from?: string, to?: string) {
        // Calculate total remaining cotton and yarn
        const lastCotton = await this.prisma.cottonInventory.findFirst({ orderBy: { id: 'desc' } });

        // Calculate Total Yarn by summing latest balance of each count
        const yarnCounts = await this.prisma.yarnInventory.findMany({
            distinct: ['count'],
            select: { count: true },
            where: { count: { not: null } }
        });

        let totalYarnKg = 0;
        let totalYarnBags = 0;
        let totalYarnLooseKg = 0;

        for (const c of yarnCounts) {
            if (!c.count) continue;
            const last = await this.prisma.yarnInventory.findFirst({
                where: { count: c.count },
                orderBy: { id: 'desc' },
                select: { balance: true }
            });
            const balance = last?.balance || 0;
            totalYarnKg += balance;
            totalYarnBags += Math.floor(balance / 60);
            totalYarnLooseKg += (balance % 60);
        }

        const cottonAgg = await this.prisma.cottonInventory.aggregate({ _sum: { quantity: true } });
        const totalCotton = cottonAgg._sum.quantity || 0;

        // Calculate Cotton Bales (Estimate based on Avg Bale Weight from Inward History)
        // Total Inward Bales / Total Inward Kg
        const inwardAgg = await this.prisma.inwardBatch.aggregate({
            _sum: { bale: true, kg: true }
        });
        const totalInwardBales = inwardAgg._sum.bale || 0;
        const totalInwardKg = inwardAgg._sum.kg || 0;
        const avgBaleWeight = totalInwardBales > 0 ? totalInwardKg / totalInwardBales : 170; // Fallback to 170kg

        const cottonBales = Math.round(totalCotton / avgBaleWeight);

        // Production & Waste Metrics (Period Based)
        const whereClause = from && to ? {
            date: {
                gte: new Date(from),
                lte: new Date(to),
            }
        } : {};

        const productionAgg = await this.prisma.production.aggregate({
            _sum: { totalProduced: true, totalWaste: true },
            where: whereClause
        });

        return {
            totalCotton,
            totalYarn: totalYarnKg, // Stock
            yarnBags: totalYarnBags,
            yarnLooseKg: totalYarnLooseKg,
            cottonBales,
            periodProduction: productionAgg._sum.totalProduced || 0,
            periodWaste: productionAgg._sum.totalWaste || 0
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

            // 3. Recalculate Cotton Inventory Balances
            const cottonMovements = await tx.cottonInventory.findMany({
                orderBy: [{ date: 'asc' }, { id: 'asc' }]
            });

            let runningBalance = 0;
            for (const mov of cottonMovements) {
                runningBalance += mov.quantity;
                // Only update if balance is different (float comparison)
                if (Math.abs(mov.balance - runningBalance) > 0.001) {
                    await tx.cottonInventory.update({
                        where: { id: mov.id },
                        data: { balance: runningBalance }
                    });
                }
            }

            return { success: true };
        });
    }

    async deleteOutward(id: number) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch outward to know which counts to recalculate (optimization) or just recalc all
            const outward = await tx.outward.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!outward) throw new Error('Outward entry not found');

            // 2. Delete yarn inventory movements
            await tx.yarnInventory.deleteMany({
                where: { reference: `OUT-${id}` }
            });

            // 3. Delete outward record
            await tx.outward.delete({
                where: { id }
            });

            // 4. Recalculate Yarn Inventory Balances
            // We need to recalculate for each count involved, or all counts?
            // Safer to recalculate specific counts affected.
            const countsAffected = [...new Set(outward.items.map(i => i.count))];

            for (const count of countsAffected) {
                const movements = await tx.yarnInventory.findMany({
                    where: { count },
                    orderBy: [{ date: 'asc' }, { id: 'asc' }]
                });

                let running = 0;
                for (const mov of movements) {
                    running += mov.quantity;
                    if (Math.abs(mov.balance - running) > 0.001) {
                        await tx.yarnInventory.update({
                            where: { id: mov.id },
                            data: { balance: running }
                        });
                    }
                }
            }

            return { success: true };
        });
    }
    async getYarnStockByCount() {
        const counts = await this.prisma.yarnInventory.findMany({
            distinct: ['count'],
            select: { count: true },
            where: { count: { not: null } }
        });

        const stock: Record<string, number> = {};
        for (const c of counts) {
            if (!c.count) continue;
            const last = await this.prisma.yarnInventory.findFirst({
                where: { count: c.count },
                orderBy: { id: 'desc' },
                select: { balance: true }
            });
            stock[c.count] = last?.balance || 0;
        }
        return stock;
    }

    async recycleWaste(data: { date: string; quantity: number; createdBy?: string }) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Check Waste Balance
            const wasteAgg = await tx.wasteInventory.aggregate({ _sum: { quantity: true } });
            const wasteBalance = wasteAgg._sum.quantity || 0;

            if (wasteBalance < data.quantity) {
                // If waste is negative (impossible?), handle it
                throw new BadRequestException(`Insufficient Waste Stock! Available: ${wasteBalance.toFixed(2)} kg`);
            }

            // 2. Reduce Waste Inventory
            const lastWaste = await tx.wasteInventory.findFirst({ orderBy: { id: 'desc' } });
            await tx.wasteInventory.create({
                data: {
                    date: new Date(data.date),
                    type: 'RECYCLE',
                    quantity: -data.quantity,
                    balance: (lastWaste?.balance || 0) - data.quantity,
                    reference: 'RECYCLED',
                    createdBy: data.createdBy,
                }
            });

            // 3. Add to Cotton Inventory (Recycled)
            const lastCotton = await tx.cottonInventory.findFirst({ orderBy: { id: 'desc' } });
            await tx.cottonInventory.create({
                data: {
                    date: new Date(data.date),
                    type: 'RECYCLED_WASTE',
                    quantity: data.quantity,
                    balance: (lastCotton?.balance || 0) + data.quantity, // Should this be + or -? Recycling ADDS to Cotton stock? Yes.
                    reference: 'RECYCLED',
                    batchId: null,
                    createdBy: data.createdBy,
                }
            });

            return { success: true };
        });
    }

    async exportWaste(data: { date: string; quantity: number; buyer?: string; price?: number; createdBy?: string }) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Check Waste Balance
            const wasteAgg = await tx.wasteInventory.aggregate({ _sum: { quantity: true } });
            const wasteBalance = wasteAgg._sum.quantity || 0;

            if (wasteBalance < data.quantity) {
                throw new BadRequestException(`Insufficient Waste Stock! Available: ${wasteBalance.toFixed(2)} kg`);
            }

            // 2. Reduce Waste Inventory
            const lastWaste = await tx.wasteInventory.findFirst({ orderBy: { id: 'desc' } });
            await tx.wasteInventory.create({
                data: {
                    date: new Date(data.date),
                    type: 'EXPORT',
                    quantity: -data.quantity,
                    balance: (lastWaste?.balance || 0) - data.quantity,
                    reference: data.buyer ? `SOLD-${data.buyer}` : 'EXPORT',
                    createdBy: data.createdBy,
                }
            });

            // Note: If we had a Sales/Income module, we would add an entry there using data.price * data.quantity

            return { success: true };
        });
    }
}
