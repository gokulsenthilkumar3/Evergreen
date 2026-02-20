import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class ProductionService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        console.log('[Production] Starting create with data:', JSON.stringify(data, null, 2));
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 0. Validation: Check Cotton Stock as of the production date
                const prodDate = new Date(data.date);
                const totalConsumption = data.consumed.reduce((sum: number, c: any) => sum + parseFloat(c.weight), 0);
                const stockAgg = await tx.cottonInventory.aggregate({
                    where: { date: { lte: prodDate } },
                    _sum: { quantity: true }
                });
                const availableStock = stockAgg._sum.quantity || 0;

                if (availableStock < totalConsumption) {
                    throw new BadRequestException(
                        `Insufficient Cotton Stock on ${prodDate.toLocaleDateString()}! ` +
                        `Available then: ${availableStock.toFixed(2)} kg, Required: ${totalConsumption.toFixed(2)} kg. ` +
                        `Please check if you are recording production for a date before the stock was received.`
                    );
                }

                // 0.5 Validation: Check Per-Batch Availability
                for (const c of data.consumed) {
                    const batch = await tx.inwardBatch.findUnique({ where: { batchId: c.batchNo } });

                    if (!batch) {
                        throw new BadRequestException(`Batch "${c.batchNo}" not found in Inward History!`);
                    }

                    if (new Date(batch.date) > prodDate) {
                        throw new BadRequestException(
                            `Batch ${c.batchNo} was received on ${new Date(batch.date).toLocaleDateString()}, ` +
                            `which is AFTER the production date ${prodDate.toLocaleDateString()}. ` +
                            `You cannot consume cotton that hasn't been received yet.`
                        );
                    }

                    // Calculate used so far (Usage is negative in CottonInventory, so abs)
                    const usedAgg = await tx.cottonInventory.aggregate({
                        _sum: { quantity: true },
                        where: {
                            batchId: c.batchNo,
                            type: 'PRODUCTION'
                        }
                    });
                    const alreadyUsed = Math.abs(usedAgg._sum.quantity || 0);
                    const requesting = parseFloat(c.weight);
                    const remaining = batch.kg - alreadyUsed;

                    // Tolerance for float errors (0.01 kg)
                    if (remaining - requesting < -0.01) {
                        throw new BadRequestException(`Insufficient quantity in Batch ${c.batchNo}. Initial: ${batch.kg} kg, Used: ${alreadyUsed.toFixed(2)} kg, Available: ${remaining.toFixed(2)} kg, Requested: ${requesting.toFixed(2)} kg`);
                    }

                    // Check remaining bales using typed Prisma aggregate
                    const requestingBales = parseFloat(c.bale) || 0;
                    if (requestingBales > 0) {
                        const baleAgg = await tx.productionConsumption.aggregate({
                            _sum: { bale: true },
                            where: { batchNo: c.batchNo }
                        });
                        const usedBales = baleAgg._sum.bale ?? 0;
                        const remainingBales = batch.bale - usedBales;
                        if (requestingBales > remainingBales + 0.01) {
                            throw new BadRequestException(`Insufficient bales in Batch ${c.batchNo}. Total: ${batch.bale}, Used: ${usedBales}, Available: ${remainingBales.toFixed(0)}, Requested: ${requestingBales}`);
                        }
                    }
                }

                // 1. Create Production Entry
                const production = await tx.production.create({
                    data: {
                        date: new Date(data.date),
                        totalConsumed: data.totalConsumed,
                        totalProduced: data.totalProduced,
                        totalWaste: data.totalWaste,
                        totalIntermediate: parseFloat(data.totalIntermediate) || 0,
                        createdBy: data.createdBy,
                        wasteBlowRoom: parseFloat(data.waste.blowRoom) || 0,
                        wasteCarding: parseFloat(data.waste.carding) || 0,
                        wasteOE: parseFloat(data.waste.oe) || 0,
                        wasteOthers: parseFloat(data.waste.others) || 0,
                        consumedBatches: {
                            create: data.consumed.map((c: any) => ({
                                batchNo: c.batchNo,
                                bale: parseFloat(c.bale) || 0,
                                weight: parseFloat(c.weight)
                            }))
                        },
                        producedYarn: {
                            create: data.produced.map((p: any) => ({
                                count: p.count,
                                weight: parseFloat(p.weight),
                                bags: p.bags,
                                remainingLog: p.remainingLog
                            }))
                        }
                    }
                });

                const batchSummary = data.consumed.map((c: any) => c.batchNo).join(', ');

                // 2. Update Cotton Inventory (Reduction)
                for (const c of data.consumed) {
                    const lastCotton = await tx.cottonInventory.findFirst({ orderBy: { id: 'desc' } });
                    const currentBalance = lastCotton ? lastCotton.balance : 0;
                    const weight = parseFloat(c.weight);

                    await tx.cottonInventory.create({
                        data: {
                            date: new Date(data.date),
                            type: 'PRODUCTION',
                            quantity: -weight,
                            balance: currentBalance - weight,
                            reference: `P-${c.batchNo}`,
                            batchId: c.batchNo,
                            productionId: production.id,
                            createdBy: data.createdBy
                        }
                    });
                }

                // 3. Update Yarn Inventory (Increase) - Create one entry per count
                for (const p of data.produced) {
                    // Get the last balance for this specific count
                    const lastYarnForCount = await tx.yarnInventory.findFirst({
                        where: { count: p.count },
                        orderBy: { id: 'desc' }
                    });
                    const currentBalanceForCount = lastYarnForCount ? lastYarnForCount.balance : 0;
                    const weight = parseFloat(p.weight);

                    await tx.yarnInventory.create({
                        data: {
                            date: new Date(data.date),
                            type: 'PRODUCTION',
                            quantity: weight,
                            balance: currentBalanceForCount + weight,
                            reference: `P-${batchSummary}`,
                            count: p.count,
                            productionId: production.id,
                            createdBy: data.createdBy
                        }
                    });
                }

                // 4. Update Waste Inventory (if waste exists)
                if (data.totalWaste > 0) {
                    const lastWaste = await tx.wasteInventory.findFirst({ orderBy: { id: 'desc' } });
                    const currentWasteBalance = lastWaste ? lastWaste.balance : 0;

                    await tx.wasteInventory.create({
                        data: {
                            date: new Date(data.date),
                            type: 'PRODUCTION',
                            quantity: data.totalWaste,
                            balance: currentWasteBalance + data.totalWaste,
                            reference: `W-${batchSummary}`,
                            wasteBlowRoom: parseFloat(data.waste.blowRoom) || 0,
                            wasteCarding: parseFloat(data.waste.carding) || 0,
                            wasteOE: parseFloat(data.waste.oe) || 0,
                            wasteOthers: parseFloat(data.waste.others) || 0,
                            productionId: production.id,
                            createdBy: data.createdBy
                        }
                    });
                }

                return production;
            });
        } catch (error: any) {
            console.error('[Production] Error in create:', error);
            console.error('[Production] Error stack:', error.stack);
            throw error;
        }
    }

    async findAll() {
        return this.prisma.production.findMany({
            orderBy: { date: 'desc' },
            include: {
                consumedBatches: true,
                producedYarn: true
            }
        });
    }

    async delete(id: number) {
        return this.prisma.$transaction(async (tx) => {
            const prod = await tx.production.findUnique({
                where: { id },
                include: { producedYarn: true }
            });
            if (!prod) throw new BadRequestException('Production entry not found');

            // 1. Dependency Checks

            // a. Check for Packaging/Maintenance costing
            const costing = await tx.costingEntry.findMany({
                where: {
                    date: prod.date,
                    category: { in: ['Packaging', 'Maintenance'] }
                }
            });
            if (costing.length > 0) {
                throw new BadRequestException('Please delete Packaging and Maintenance costing for this production date first.');
            }

            // b. Check for Outwards recorded on or after this date for these counts
            const countsAffected = prod.producedYarn.map(p => p.count);
            const existsOutward = await tx.yarnInventory.findFirst({
                where: {
                    count: { in: countsAffected },
                    type: 'OUTWARD',
                    date: { gte: prod.date }
                }
            });
            if (existsOutward) {
                throw new BadRequestException('Please delete any Outward (Sales) entries for these yarn counts on or after this date first.');
            }

            // 2. Delete inventory movements
            await tx.cottonInventory.deleteMany({
                where: { productionId: id }
            });

            await tx.yarnInventory.deleteMany({
                where: { productionId: id }
            });

            await tx.wasteInventory.deleteMany({
                where: { productionId: id }
            });

            // 3. Delete production record (cascades to consumedBatches and producedYarn)

            await tx.production.delete({
                where: { id }
            });

            // 3. Recalculate Balances to maintain audit trail integrity

            // Recalculate Cotton Inventory
            const cottonMovements = await tx.cottonInventory.findMany({ orderBy: [{ date: 'asc' }, { id: 'asc' }] });
            let runningCotton = 0;
            for (const m of cottonMovements) {
                runningCotton += m.quantity;
                if (Math.abs(m.balance - runningCotton) > 0.001) {
                    await tx.cottonInventory.update({ where: { id: m.id }, data: { balance: runningCotton } });
                }
            }

            // Recalculate Waste Inventory
            const wasteMovements = await tx.wasteInventory.findMany({ orderBy: [{ date: 'asc' }, { id: 'asc' }] });
            let runningWaste = 0;
            for (const m of wasteMovements) {
                runningWaste += m.quantity;
                if (Math.abs(m.balance - runningWaste) > 0.001) {
                    await tx.wasteInventory.update({ where: { id: m.id }, data: { balance: runningWaste } });
                }
            }

            // Recalculate Yarn Inventory (for each count involved)
            for (const count of countsAffected) {
                const yarnMovements = await tx.yarnInventory.findMany({
                    where: { count },
                    orderBy: [{ date: 'asc' }, { id: 'asc' }]
                });
                let runningYarn = 0;
                for (const m of yarnMovements) {
                    runningYarn += m.quantity;
                    if (Math.abs(m.balance - runningYarn) > 0.001) {
                        await tx.yarnInventory.update({ where: { id: m.id }, data: { balance: runningYarn } });
                    }
                }
            }

            return { success: true };
        });
    }
}
