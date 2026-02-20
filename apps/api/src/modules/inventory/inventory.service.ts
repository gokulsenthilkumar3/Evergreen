import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async getInwardHistory(from?: string, to?: string) {
        let whereClause = {};
        if (from && to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            whereClause = {
                date: {
                    gte: new Date(from),
                    lte: toDate,
                }
            };
        }

        return this.prisma.inwardBatch.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });
    }

    async getAvailableBatches(asOfDate?: string) {
        const dateLimit = asOfDate ? new Date(asOfDate) : new Date();
        // Set to end of day to include all transactions on the selected date
        dateLimit.setHours(23, 59, 59, 999);

        // Find batches with remaining weight balance via CottonInventory aggregation
        const balances = await this.prisma.cottonInventory.groupBy({
            by: ['batchId'],
            _sum: { quantity: true },
            where: {
                batchId: { not: null },
                date: { lte: dateLimit }
            }
        });

        // Filter active batches (remaining weight > 0 at that time)
        const activeBatches = balances
            .filter(b => (b._sum.quantity ?? 0) > 0.01);

        if (activeBatches.length === 0) return [];

        // Fetch original batch details (including original kg and bale)
        const ids = activeBatches.map(b => b.batchId!).filter(Boolean);
        const details = await this.prisma.inwardBatch.findMany({
            where: { batchId: { in: ids } },
            select: { batchId: true, supplier: true, bale: true, kg: true },
            orderBy: { date: 'desc' }
        });

        // Calculate bales and weight used per batch using typed Prisma aggregate
        const baleUsageByBatch = await this.prisma.productionConsumption.groupBy({
            by: ['batchNo'],
            _sum: { bale: true, weight: true },
            where: { batchNo: { in: ids } }
        });
        const usageByBatch: Record<string, { bale: number; weight: number }> = {};
        for (const row of baleUsageByBatch) {
            usageByBatch[row.batchNo] = {
                bale: Number(row._sum.bale ?? 0),
                weight: Number(row._sum.weight ?? 0),
            };
        }

        // Combine details with remaining balance and usage stats
        return details.map(d => {
            const bal = activeBatches.find(x => x.batchId === d.batchId);
            const usage = usageByBatch[d.batchId!] ?? { bale: 0, weight: 0 };
            const remainingBale = d.bale - usage.bale;
            const remainingKg = bal?._sum.quantity ?? 0;
            return {
                batchId: d.batchId,
                supplier: d.supplier,
                // Original totals
                originalKg: d.kg,
                originalBale: d.bale,
                // Used totals
                usedKg: parseFloat((d.kg - remainingKg).toFixed(2)),
                usedBale: usage.bale,
                // Remaining (what can still be consumed)
                bale: Math.max(0, remainingBale),
                kg: remainingKg,
            };
        });
    }

    async getOutwardHistory(from?: string, to?: string) {
        let whereClause = {};
        if (from && to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            whereClause = {
                date: {
                    gte: new Date(from),
                    lte: toDate,
                }
            };
        }

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

            // 0. Validation: Check stock as of the specific date
            const stockAtDate = await this.getYarnStockByCount(data.date);
            for (const item of data.items) {
                const available = stockAtDate[item.count] || 0;
                if (item.weight > available) {
                    throw new BadRequestException(
                        `Insufficient yarn stock for count ${item.count} on ${new Date(data.date).toLocaleDateString()}. ` +
                        `Available then: ${available.toFixed(2)} kg, Requested: ${item.weight.toFixed(2)} kg.`
                    );
                }
            }

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
                        reference: `O-${outward.id}`,
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
        let whereClause = {};
        if (from && to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            whereClause = {
                date: {
                    gte: new Date(from),
                    lte: toDate,
                }
            };
        }

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
        // For dashboard, we usually want current total, but if 'to' is provided, we use it
        let asOf = new Date();
        if (to) {
            asOf = new Date(to);
            asOf.setHours(23, 59, 59, 999);
        }

        // Calculate Total Yarn by summing latest balance of each count as of 'to' date
        const yarnCounts = await this.prisma.yarnInventory.findMany({
            distinct: ['count'],
            select: { count: true },
            where: {
                count: { not: null },
                date: { lte: asOf }
            }
        });

        let totalYarnKg = 0;
        let totalYarnBags = 0;
        let totalYarnLooseKg = 0;

        const yarnStockByCount = await this.getYarnStockByCount(to); // Pass 'to' date to get stock as of that date
        for (const count in yarnStockByCount) {
            const balance = yarnStockByCount[count];
            totalYarnKg += balance;
            totalYarnBags += Math.floor(balance / 60);
            totalYarnLooseKg += (balance % 60);
        }

        const cottonAgg = await this.prisma.cottonInventory.aggregate({
            _sum: { quantity: true },
            where: { date: { lte: asOf } }
        });
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
        let whereClause = {};
        if (from && to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            whereClause = {
                date: {
                    gte: new Date(from),
                    lte: toDate,
                }
            };
        }

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
        let whereClause = {};
        if (from && to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            whereClause = {
                date: {
                    gte: new Date(from),
                    lte: toDate,
                }
            };
        }

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

            if (!batch) throw new BadRequestException('Batch not found');

            // 1. Dependency Check: Check if batch is used in any production
            const consumption = await tx.productionConsumption.findFirst({
                where: { batchNo: batch.batchId }
            });

            if (consumption) {
                throw new BadRequestException(`Cannot delete batch ${batch.batchId} because it has been used in production. Delete the corresponding production entry first.`);
            }

            // 2. Delete inward movements from inventory (reference is batchId)
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
    async getYarnStockByCount(asOfDate?: string) {
        let dateLimit = new Date();
        if (asOfDate) {
            dateLimit = new Date(asOfDate);
            dateLimit.setHours(23, 59, 59, 999);
        }

        const counts = await this.prisma.yarnInventory.findMany({
            distinct: ['count'],
            select: { count: true },
            where: {
                count: { not: null },
                date: { lte: dateLimit }
            }
        });

        const stock: Record<string, number> = {};
        for (const c of counts) {
            if (!c.count) continue;
            const entries = await this.prisma.yarnInventory.aggregate({
                where: {
                    count: c.count,
                    date: { lte: dateLimit }
                },
                _sum: { quantity: true }
            });
            const balance = entries._sum.quantity || 0;
            if (balance > 0.01) {
                stock[c.count] = balance;
            }
        }
        return stock;
    }

    async recycleWaste(data: { date: string; quantity: number; createdBy?: string }) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Check Waste Balance as of the requested date
            const wasteAgg = await tx.wasteInventory.aggregate({
                _sum: { quantity: true },
                where: { date: { lte: new Date(data.date) } }
            });
            const wasteBalance = wasteAgg._sum.quantity || 0;

            if (wasteBalance < data.quantity) {
                throw new BadRequestException(
                    `Insufficient Waste Stock on ${new Date(data.date).toLocaleDateString()}! ` +
                    `Available then: ${wasteBalance.toFixed(2)} kg, Requested: ${data.quantity.toFixed(2)} kg.`
                );
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
            // 1. Check Waste Balance as of the requested date
            const wasteAgg = await tx.wasteInventory.aggregate({
                _sum: { quantity: true },
                where: { date: { lte: new Date(data.date) } }
            });
            const wasteBalance = wasteAgg._sum.quantity || 0;

            if (wasteBalance < data.quantity) {
                throw new BadRequestException(
                    `Insufficient Waste Stock on ${new Date(data.date).toLocaleDateString()}! ` +
                    `Available then: ${wasteBalance.toFixed(2)} kg, Requested: ${data.quantity.toFixed(2)} kg.`
                );
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

    async deleteWaste(id: number) {
        return this.prisma.$transaction(async (tx) => {
            const waste = await tx.wasteInventory.findUnique({ where: { id } });
            if (!waste) throw new BadRequestException('Waste entry not found');

            if (waste.type === 'PRODUCTION') {
                throw new BadRequestException('Cannot delete production waste directly. Please delete the production entry.');
            }

            // 1. If it was RECYCLE, remove from Cotton Inventory
            if (waste.type === 'RECYCLE') {
                await tx.cottonInventory.deleteMany({
                    where: {
                        type: 'RECYCLED_WASTE',
                        date: waste.date,
                        quantity: Math.abs(waste.quantity)
                    }
                });

                // Recalculate Cotton Inventory
                const cottonMovements = await tx.cottonInventory.findMany({
                    orderBy: [{ date: 'asc' }, { id: 'asc' }]
                });
                let runningCotton = 0;
                for (const mov of cottonMovements) {
                    runningCotton += mov.quantity;
                    if (Math.abs(mov.balance - runningCotton) > 0.001) {
                        await tx.cottonInventory.update({ where: { id: mov.id }, data: { balance: runningCotton } });
                    }
                }
            }

            // 2. Delete Waste Entry
            await tx.wasteInventory.delete({ where: { id } });

            // 3. Recalculate Waste Balances
            const wasteMovements = await tx.wasteInventory.findMany({
                orderBy: [{ date: 'asc' }, { id: 'asc' }]
            });
            let runningWaste = 0;
            for (const mov of wasteMovements) {
                runningWaste += mov.quantity;
                if (Math.abs(mov.balance - runningWaste) > 0.001) {
                    await tx.wasteInventory.update({ where: { id: mov.id }, data: { balance: runningWaste } });
                }
            }

            return { success: true };
        });
    }
}
