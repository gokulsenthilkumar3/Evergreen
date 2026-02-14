import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class ProductionService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.$transaction(async (tx) => {
            // 0. Validation: Check Cotton Stock
            const totalConsumption = data.consumed.reduce((sum: number, c: any) => sum + parseFloat(c.weight), 0);
            const lastEntry = await tx.cottonInventory.findFirst({ orderBy: { id: 'desc' } });
            const availableStock = lastEntry ? lastEntry.balance : 0;

            if (availableStock < totalConsumption) {
                // Formatting for readability
                throw new BadRequestException(`Insufficient Cotton Stock! Available: ${availableStock.toFixed(2)} kg, Required: ${totalConsumption.toFixed(2)} kg. Please add Inward Stock first.`);
            }

            // 0.5 Validation: Check Per-Batch Availability
            for (const c of data.consumed) {
                const batch = await tx.inwardBatch.findUnique({ where: { batchId: c.batchNo } });

                if (!batch) {
                    throw new BadRequestException(`Batch "${c.batchNo}" not found in Inward History!`);
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
            }

            // 1. Create Production Entry
            const production = await tx.production.create({
                data: {
                    date: new Date(data.date),
                    totalConsumed: data.totalConsumed,
                    totalProduced: data.totalProduced,
                    totalWaste: data.totalWaste,
                    createdBy: data.createdBy,
                    wasteBlowRoom: parseFloat(data.waste.blowRoom) || 0,
                    wasteCarding: parseFloat(data.waste.carding) || 0,
                    wasteOE: parseFloat(data.waste.oe) || 0,
                    wasteOthers: parseFloat(data.waste.others) || 0,
                    consumedBatches: {
                        create: data.consumed.map((c: any) => ({
                            batchNo: c.batchNo,
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
                        reference: `PROD-${production.id}`,
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
                        reference: `PROD-${production.id} Count ${p.count}`,
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
                        reference: `PROD-${production.id}`,
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
            // 1. Delete inventory movements
            await tx.cottonInventory.deleteMany({
                where: { productionId: id }
            });

            await tx.yarnInventory.deleteMany({
                where: { productionId: id }
            });

            await tx.wasteInventory.deleteMany({
                where: { productionId: id }
            });

            // 2. Delete production record (cascades to consumedBatches and producedYarn)
            await tx.production.delete({
                where: { id }
            });

            return { success: true };
        });
    }
}
