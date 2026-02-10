import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class ProductionService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create Production Entry
            const production = await tx.production.create({
                data: {
                    date: new Date(data.date),
                    totalConsumed: data.totalConsumed,
                    totalProduced: data.totalProduced,
                    totalWaste: data.totalWaste,
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
                        productionId: production.id
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
                        productionId: production.id
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
                        productionId: production.id
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

            // 2. Delete production record (cascades to consumedBatches and producedYarn)
            await tx.production.delete({
                where: { id }
            });

            return { success: true };
        });
    }
}
