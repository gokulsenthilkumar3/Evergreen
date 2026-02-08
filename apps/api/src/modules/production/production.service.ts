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

            // 3. Update Yarn Inventory (Increase)
            for (const p of data.produced) {
                const lastYarn = await tx.yarnInventory.findFirst({ orderBy: { id: 'desc' } });
                const currentBalance = lastYarn ? lastYarn.balance : 0;
                const weight = parseFloat(p.weight);

                await tx.yarnInventory.create({
                    data: {
                        date: new Date(data.date),
                        type: 'PRODUCTION',
                        quantity: weight,
                        balance: currentBalance + weight,
                        reference: `PROD-${production.id}`,
                        count: p.count,
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
}
