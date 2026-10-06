import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { stockEventDate } from '../../utils/stock-event-date';
import { PrismaService } from '../../services/prisma.service';
import { unavailableStock } from '../../services/business-ledger';
import {
  throwInwardUnderProduction,
  throwWasteSoldOrLinked,
  throwOutwardBilled,
  SETTLE_GAP_MS,
} from '../../utils/delete-guard';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInwardHistory(from?: string, to?: string) {
    let whereClause = {};
    if (from && to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      whereClause = {
        date: {
          gte: new Date(from),
          lte: toDate,
        },
      };
    }

    const batches = await this.prisma.inwardBatch.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    const batchIds = batches.map((b) => b.batchId);

    const usedAggs = await this.prisma.cottonInventory.groupBy({
      by: ['batchId'],
      _sum: { quantity: true },
      where: { batchId: { in: batchIds } },
    });

    const baleAggs = await this.prisma.productionConsumption.groupBy({
      by: ['batchNo'],
      _sum: { bale: true },
      where: { batchNo: { in: batchIds } },
    });

    const usageMap = new Map<string, number>();
    for (const u of usedAggs) {
      // INWARD/MERGE_IN are positive; PRODUCTION/MERGE_OUT are negative — sum equals remaining kg.
      usageMap.set(u.batchId!, u._sum.quantity || 0);
    }

    const baleMap = new Map();
    for (const b of baleAggs) {
      baleMap.set(b.batchNo, b._sum.bale || 0);
    }

    return batches.map((b) => ({
      ...b,
      remainingKg: usageMap.get(b.batchId) ?? b.kg, // if no usage, remaining is original
      remainingBale: (usageMap.get(b.batchId) ?? b.kg) > 0.01 ? Math.max(0, b.bale - (baleMap.get(b.batchId) || 0)) : 0,
    }));
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
        date: { lte: dateLimit },
      },
    });

    // Filter active batches (remaining weight > 0 at that time)
    const activeBatches = balances.filter((b) => (b._sum.quantity ?? 0) > 0.01);

    if (activeBatches.length === 0) return [];

    // Fetch original batch details (including original kg, bale, and timestamps)
    const ids = activeBatches.map((b) => b.batchId!).filter(Boolean);
    const details = await this.prisma.inwardBatch.findMany({
      where: { batchId: { in: ids } },
      select: {
        batchId: true,
        supplier: true,
        bale: true,
        kg: true,
        date: true,
        createdAt: true,
      },
      orderBy: { date: 'desc' },
    });

    // Calculate bales and weight used per batch using typed Prisma aggregate
    const baleUsageByBatch = await this.prisma.productionConsumption.groupBy({
      by: ['batchNo'],
      _sum: { bale: true, weight: true },
      where: { batchNo: { in: ids }, production: { date: { lte: dateLimit } } },
    });
    const usageByBatch: Record<string, { bale: number; weight: number }> = {};
    for (const row of baleUsageByBatch) {
      usageByBatch[row.batchNo] = {
        bale: Number(row._sum.bale ?? 0),
        weight: Number(row._sum.weight ?? 0),
      };
    }

    // Combine details with remaining balance and usage stats
    return details.map((d) => {
      const bal = activeBatches.find((x) => x.batchId === d.batchId);
      const usage = usageByBatch[d.batchId] ?? { bale: 0, weight: 0 };
      const remainingBale = d.bale - usage.bale;
      const remainingKg = bal?._sum.quantity ?? 0;
      const receivedAt = d.date || d.createdAt;
      return {
        batchId: d.batchId,
        supplier: d.supplier,
        receivedAt,
        earliestStartAt: new Date(new Date(receivedAt).getTime() + SETTLE_GAP_MS),
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
        },
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
    data = { ...data, date: stockEventDate(data.date).toISOString() };
    if (!Number.isFinite(new Date(data.date).getTime()) || !data.customerName?.trim() || !Array.isArray(data.items) || !data.items.length)
      throw new BadRequestException('Date, customer and at least one yarn line are required');
    if (new Set(data.items.map(item => item.count)).size !== data.items.length)
      throw new BadRequestException('Combine duplicate yarn counts into one dispatch line');
    if (data.items.some(item => !item.count?.trim() || !Number.isFinite(item.weight) || item.weight <= 0 || !Number.isInteger(item.bags) || item.bags <= 0))
      throw new BadRequestException('Each dispatch line needs a yarn count, positive weight and whole bags');
    if (data.items.some(item => Math.abs(item.weight - item.bags * 60) > 0.01)) throw new BadRequestException('Bag dispatch uses 60 kg per bag. Invoice loose yarn by its kilogram quantity.');
    return this.prisma.stockTransaction(async (tx) => {
      const totalBags = data.items.reduce((sum, item) => sum + item.bags, 0);
      const totalWeight = data.items.reduce(
        (sum, item) => sum + item.weight,
        0,
      );

      // 0. Validation: Check stock as of the specific date
      for (const item of data.items) {
        const dateLimit = new Date(data.date);
        if (!data.date.includes('T')) dateLimit.setHours(23, 59, 59, 999);
        const stock = await tx.yarnInventory.aggregate({ where: { count: item.count, date: { lte: dateLimit } }, _sum: { quantity: true } });
        const available = stock._sum.quantity || 0;
        if (item.weight > available) {
          throw new BadRequestException(
            `Insufficient yarn stock for count ${item.count} on ${new Date(data.date).toLocaleDateString()}. ` +
              `Available then: ${available.toFixed(2)} kg, Requested: ${item.weight.toFixed(2)} kg.`,
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
            create: data.items.map((item) => ({
              count: item.count,
              bags: item.bags,
              weight: item.weight,
              createdBy: data.createdBy,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Deduct from Yarn Inventory for each count
      for (const item of data.items) {
        const lastYarnEntry = await tx.yarnInventory.findFirst({
          where: { count: item.count },
          orderBy: { id: 'desc' },
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
            createdBy: data.createdBy,
          },
        });
      }

      // 3. Recalculate Yarn Inventory Balances for affected counts
      const countsAffected = [...new Set(data.items.map((i) => i.count))];
      for (const count of countsAffected) {
        const movements = await tx.yarnInventory.findMany({
          where: { count },
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        });
        let running = 0;
        for (const mov of movements) {
          running += mov.quantity;
          if (Math.abs(mov.balance - running) > 0.001) {
            await tx.yarnInventory.update({
              where: { id: mov.id },
              data: { balance: running },
            });
          }
        }
      }

      return outward;
    });
  }

  async createInward(data: {
    batchId?: string;
    date: string;
    supplier: string;
    bale: number;
    kg: number;
    createdBy?: string;
  }) {
    data = { ...data, date: stockEventDate(data.date).toISOString() };
    if (!Number.isFinite(new Date(data.date).getTime()) || !data.supplier?.trim() || !Number.isInteger(data.bale) || data.bale <= 0 || !Number.isFinite(data.kg) || data.kg <= 0)
      throw new BadRequestException('Enter a valid receipt date, supplier, whole bales and positive cotton weight');
    try {
      return await this.prisma.stockTransaction(async (tx) => {
        const batchId = data.batchId?.trim() || `IN-${data.date.replace(/-/g, '').slice(0, 6)}-${randomUUID().slice(0, 8).toUpperCase()}`;
        // 1. Create Inward Batch record
        const batch = await tx.inwardBatch.create({
          data: {
            batchId,
            date: new Date(data.date),
            supplier: data.supplier,
            bale: data.bale,
            kg: data.kg,
            createdBy: data.createdBy,
          },
        });

        // 2. Get latest balance
        const lastEntry = await tx.cottonInventory.findFirst({
          orderBy: { id: 'desc' },
        });
        const currentBalance = lastEntry ? lastEntry.balance : 0;

        // 3. Add to Cotton Inventory
        await tx.cottonInventory.create({
          data: {
            date: new Date(data.date),
            type: 'INWARD',
            quantity: data.kg,
            balance: currentBalance + data.kg,
            reference: batchId,
            batchId,
            createdBy: data.createdBy,
          },
        });

        // 4. Recalculate Cotton Inventory Balances
        const cottonMovements = await tx.cottonInventory.findMany({
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        });
        let runningBalance = 0;
        for (const mov of cottonMovements) {
          runningBalance += mov.quantity;
          if (Math.abs(mov.balance - runningBalance) > 0.001) {
            await tx.cottonInventory.update({
              where: { id: mov.id },
              data: { balance: runningBalance },
            });
          }
        }
        return batch;
      });
    } catch (error: any) {
      console.error('[Inventory] createInward error:', error);
      throw error;
    }
  }

  async mergeBatches(data: {
    batchIds: string[];
    date: string;
    createdBy?: string;
  }) {
    data = { ...data, date: stockEventDate(data.date).toISOString() };
    if (!Array.isArray(data.batchIds) || new Set(data.batchIds).size !== data.batchIds.length || data.batchIds.length < 2 || !Number.isFinite(new Date(data.date).getTime()))
      throw new BadRequestException('Choose at least two different batches and a valid merge date');
    return this.prisma.stockTransaction(async (tx) => {
      const { batchIds, date, createdBy } = data;
      let totalRemainingKg = 0;
      let totalRemainingBales = 0;
      const suppliers = new Set<string>();

      const dummyProduction = await tx.production.create({
        data: {
          date: new Date(date),
          totalConsumed: 0,
          totalProduced: 0,
          totalWaste: 0,
          createdBy: 'SYSTEM_MERGE',
        },
      });

      for (const batchId of batchIds) {
        const batch = await tx.inwardBatch.findUnique({ where: { batchId } });
        if (!batch) throw new BadRequestException(`Batch ${batchId} not found`);

        const stockAgg = await tx.cottonInventory.aggregate({
          _sum: { quantity: true },
          where: { batchId },
        });
        const remainingKg = stockAgg._sum.quantity || 0;

        const baleAgg = await tx.productionConsumption.aggregate({
          _sum: { bale: true },
          where: { batchNo: batchId },
        });
        const usedBales = baleAgg._sum.bale || 0;
        const remainingBales = batch.bale - usedBales;

        if (remainingKg <= 0 && remainingBales <= 0) continue;

        totalRemainingKg += remainingKg;
        totalRemainingBales += remainingBales;
        suppliers.add(batch.supplier);

        if (remainingKg > 0) {
          const lastEntry = await tx.cottonInventory.findFirst({
            orderBy: { id: 'desc' },
          });
          const currentBalance = lastEntry ? lastEntry.balance : 0;

          await tx.cottonInventory.create({
            data: {
              date: new Date(date),
              type: 'MERGE_OUT',
              quantity: -remainingKg,
              balance: currentBalance - remainingKg,
              reference: `MERGE-${dummyProduction.id}`,
              batchId: batchId,
              createdBy: createdBy,
            },
          });
        }

        if (remainingBales > 0) {
          await tx.productionConsumption.create({
            data: {
              productionId: dummyProduction.id,
              batchNo: batchId,
              bale: remainingBales,
              weight: remainingKg,
              createdBy: createdBy,
            },
          });
        }
      }

      if (totalRemainingKg <= 0 && totalRemainingBales <= 0) {
        throw new BadRequestException(
          'Selected batches have no remaining stock to merge',
        );
      }

      const mergedBatchId = `MB-${Date.now()}`;
      const newBatch = await tx.inwardBatch.create({
        data: {
          batchId: mergedBatchId,
          date: new Date(date),
          supplier: Array.from(suppliers).join(', '),
          bale: totalRemainingBales,
          kg: totalRemainingKg,
          createdBy: createdBy,
          mergedFrom: batchIds.join(', '),
          isMerged: true,
        },
      });

      const lastEntry = await tx.cottonInventory.findFirst({
        orderBy: { id: 'desc' },
      });
      const currentBalance = lastEntry ? lastEntry.balance : 0;

      await tx.cottonInventory.create({
        data: {
          date: new Date(date),
          type: 'INWARD',
          quantity: totalRemainingKg,
          balance: currentBalance + totalRemainingKg,
          reference: mergedBatchId,
          batchId: mergedBatchId,
          createdBy: createdBy,
        },
      });

      const cottonMovements = await tx.cottonInventory.findMany({
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      });
      let runningBalance = 0;
      for (const mov of cottonMovements) {
        runningBalance += mov.quantity;
        if (Math.abs(mov.balance - runningBalance) > 0.001) {
          await tx.cottonInventory.update({
            where: { id: mov.id },
            data: { balance: runningBalance },
          });
        }
      }

      return newBatch;
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
        },
      };
    }

    const cottonMovements = await this.prisma.cottonInventory.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    // Fetch all batches to get bale and weight information
    const batches = await this.prisma.inwardBatch.findMany({
      select: { batchId: true, bale: true, kg: true },
    });
    const batchMap = new Map(
      batches.map((b: any) => [b.batchId, { bale: b.bale, kg: b.kg }]),
    );

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
          bale: parseFloat(baleCount.toFixed(2)),
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
        date: { lte: asOf },
      },
    });

    let totalYarnKg = 0;
    let totalYarnBags = 0;
    let totalYarnLooseKg = 0;

    const yarnStockByCount = await this.getYarnStockByCount(to); // Pass 'to' date to get stock as of that date
    for (const count in yarnStockByCount) {
      const balance = yarnStockByCount[count];
      totalYarnKg += balance;
      totalYarnBags += Math.floor(balance / 60);
      totalYarnLooseKg += balance % 60;
    }

    const cottonAgg = await this.prisma.cottonInventory.aggregate({
      _sum: { quantity: true },
      where: { date: { lte: asOf } },
    });
    const totalCotton = cottonAgg._sum.quantity || 0;

    const batches = await this.prisma.inwardBatch.findMany({ where: { date: { lte: asOf } }, select: { batchId: true, bale: true } });
    const usedBales = await this.prisma.productionConsumption.groupBy({ by: ['batchNo'], _sum: { bale: true }, where: { production: { date: { lte: asOf } } } });
    const usedByBatch = new Map(usedBales.map(row => [row.batchNo, row._sum.bale || 0]));
    const balances = await this.prisma.cottonInventory.groupBy({ by: ['batchId'], where: { date: { lte: asOf } }, _sum: { quantity: true } });
    const remaining = new Map(balances.map(row => [row.batchId, row._sum.quantity || 0]));
    const cottonBales = batches.reduce((sum, batch) => sum + ((remaining.get(batch.batchId) || 0) > 0.01 ? Math.max(0, batch.bale - (usedByBatch.get(batch.batchId) || 0)) : 0), 0);

    // Production & Waste Metrics (Period Based)
    let whereClause = {};
    if (from && to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      whereClause = {
        date: {
          gte: new Date(from),
          lte: toDate,
        },
      };
    }

    const productionAgg = await this.prisma.production.aggregate({
      _sum: { totalProduced: true, totalWaste: true },
      where: whereClause,
    });

    return {
      totalCotton,
      totalYarn: totalYarnKg, // Stock
      yarnBags: totalYarnBags,
      yarnLooseKg: totalYarnLooseKg,
      cottonBales,
      periodProduction: productionAgg._sum.totalProduced || 0,
      periodWaste: productionAgg._sum.totalWaste || 0,
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
        },
      };
    }

    return this.prisma.wasteInventory.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  async deleteInward(id: number, actor = 'SYSTEM', reason?: string) {
    return this.prisma.stockTransaction(async (tx) => {
      const batch = await tx.inwardBatch.findUnique({
        where: { id },
      });

      if (!batch) throw new BadRequestException('Batch not found');
      if (await tx.cottonInventory.count({ where: { batchId: batch.batchId, type: 'RECYCLED_WASTE' } })) throw new BadRequestException('Reverse the waste recycling entry to return this cotton to waste stock.');
      if (batch.catalogueItemId) throw new BadRequestException('This cotton receipt belongs to procurement. Record its supplier return in Business flows to preserve the purchase and payable links.');
      const receiptLinks = await tx.workflowDocument.findMany({ where: { kind: 'LINK_COTTON_RECEIPT' } });
      if (receiptLinks.some(doc => JSON.parse(doc.metadata).batchId === batch.batchId)) throw new BadRequestException('This receipt is linked to supplier accounting. Record its supplier return in Business flows.');

      // 1. Dependency Check: Check if batch is used in any genuine manufacturing production
      const consumptions = await tx.productionConsumption.findMany({
        where: {
          batchNo: batch.batchId,
          production: {
            createdBy: { not: 'SYSTEM_MERGE' },
          },
        },
        select: { productionId: true },
      });

      if (consumptions.length > 0) {
        const prodIds = [...new Set(consumptions.map((c) => c.productionId))];
        try {
          await tx.activityLog.create({
            data: {
              username: actor,
              action: 'DELETE_BLOCKED',
              module: 'INWARD',
              details: JSON.stringify({
                inwardId: id,
                batchId: batch.batchId,
                blockingProductionIds: prodIds,
                reason: reason || 'Attempted delete on batch under active production',
              }),
            },
          });
        } catch (_) {}

        throwInwardUnderProduction({
          inwardId: id,
          batchNo: batch.batchId,
          productionIds: prodIds,
        });
      }

      // 2. Delete inward movements from inventory (reference is batchId)
      await tx.cottonInventory.deleteMany({
        where: { reference: batch.batchId },
      });

      // 2.1 If deleting a merged batch, unmerge the original batches
      if (batch.isMerged && batch.mergedFrom) {
        const sourceBatchIds = batch.mergedFrom.split(',').map((s) => s.trim());
        // The source references identify this merge; other merges must remain intact.
        const mergeMovements = await tx.cottonInventory.findMany({ where: { type: 'MERGE_OUT', batchId: { in: sourceBatchIds } } });
        const mergeIds = [...new Set(mergeMovements.map(m => Number(m.reference.replace(/^MERGE-/, ''))).filter(Number.isFinite))];
        await tx.cottonInventory.deleteMany({
          where: {
            type: 'MERGE_OUT',
            batchId: { in: sourceBatchIds },
          },
        });
        await tx.productionConsumption.deleteMany({
          where: {
            batchNo: { in: sourceBatchIds },
            productionId: { in: mergeIds },
            production: { createdBy: 'SYSTEM_MERGE' },
          },
        });
        await tx.production.deleteMany({
          where: { id: { in: mergeIds }, createdBy: 'SYSTEM_MERGE' },
        });
      }

      // 3. Delete batch
      await tx.inwardBatch.delete({
        where: { id },
      });

      // 4. Recalculate Cotton Inventory Balances
      const cottonMovements = await tx.cottonInventory.findMany({
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      });

      let runningBalance = 0;
      for (const mov of cottonMovements) {
        runningBalance += mov.quantity;
        // Only update if balance is different (float comparison)
        if (Math.abs(mov.balance - runningBalance) > 0.001) {
          await tx.cottonInventory.update({
            where: { id: mov.id },
            data: { balance: runningBalance },
          });
        }
      }

      // 5. Audit log DELETE
      try {
        await tx.activityLog.create({
          data: {
            username: actor,
            action: 'DELETE',
            module: 'INWARD',
            details: JSON.stringify({
              inwardId: id,
              batchId: batch.batchId,
              bale: batch.bale,
              kg: batch.kg,
              supplier: batch.supplier,
              reason: reason || 'Deleted inward batch',
            }),
          },
        });
      } catch (_) {}

      return { success: true };
    });
  }

  async deleteOutward(id: number, actor = 'SYSTEM', reason?: string) {
    return this.prisma.stockTransaction(async (tx) => {
      // 1. Fetch outward to know which counts to recalculate (optimization) or just recalc all
      const outward = await tx.outward.findUnique({
        where: { id },
        include: { items: true, invoices: true },
      });

      if (!outward) throw new BadRequestException('Outward entry not found');
      if (outward.status === 'REVERSED') return { success: true };

      const matchingInvoice = outward.invoices.find(invoice => invoice.status !== 'VOID');

      if (matchingInvoice) {
        try {
          await tx.activityLog.create({
            data: {
              username: actor,
              action: 'DELETE_BLOCKED',
              module: 'OUTWARD',
              details: JSON.stringify({
                outwardId: id,
                customerName: outward.customerName,
                invoiceNo: matchingInvoice.invoiceNo,
                status: matchingInvoice.status,
                amountPaid: matchingInvoice.amountPaid,
                reason: 'Void the linked invoice before reversing its dispatch',
              }),
            },
          });
        } catch (_) {}

        throwOutwardBilled({
          outwardId: id,
          invoiceNo: matchingInvoice.invoiceNo,
        });
      }

      // Preserve dispatch history and record the physical return once.
      const original = await tx.yarnInventory.findMany({ where: { reference: `O-${id}`, type: 'OUTWARD' } });
      for (const movement of original) await tx.yarnInventory.create({ data: {
        date: new Date(), type: 'OUTWARD_REVERSAL', quantity: -movement.quantity, balance: 0,
        reference: `O-${id}-REVERSAL`, count: movement.count, createdBy: actor,
      } });

      // 3. Delete outward record
      await tx.outward.update({
        where: { id },
        data: { status: 'REVERSED', updatedBy: actor },
      });

      // 4. Recalculate Yarn Inventory Balances
      const countsAffected = [...new Set(outward.items.map((i) => i.count))];

      for (const count of countsAffected) {
        const movements = await tx.yarnInventory.findMany({
          where: { count },
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        });

        let running = 0;
        for (const mov of movements) {
          running += mov.quantity;
          if (Math.abs(mov.balance - running) > 0.001) {
            await tx.yarnInventory.update({
              where: { id: mov.id },
              data: { balance: running },
            });
          }
        }
      }

      // 5. Audit log DELETE
      try {
        await tx.activityLog.create({
          data: {
            username: actor,
            action: 'DELETE',
            module: 'OUTWARD',
            details: JSON.stringify({
              outwardId: id,
              customerName: outward.customerName,
              totalBags: outward.totalBags,
              totalWeight: outward.totalWeight,
              reason: reason || 'Deleted outward dispatch',
            }),
          },
        });
      } catch (_) {}

      return { success: true };
    });
  }
  async getYarnStockByCount(asOfDate?: string, availableOnly = false) {
    let dateLimit = new Date();
    if (asOfDate) {
      dateLimit = new Date(asOfDate);
      if (!asOfDate.includes('T')) dateLimit.setHours(23, 59, 59, 999);
    }

    const counts = await this.prisma.yarnInventory.findMany({
      distinct: ['count'],
      select: { count: true },
      where: {
        count: { not: null },
        date: { lte: dateLimit },
      },
    });

    const stock: Record<string, number> = {};
    for (const c of counts) {
      if (!c.count) continue;
      const entries = await this.prisma.yarnInventory.aggregate({
        where: {
          count: c.count,
          date: { lte: dateLimit },
        },
        _sum: { quantity: true },
      });
      let balance = entries._sum.quantity || 0;
      if (availableOnly) {
        const item = await this.prisma.catalogueItem.findUnique({ where: { sku: `LEGACY-YARN-${c.count}` } });
        if (item) {
          const catalogue = await this.prisma.stockMovement.aggregate({ where: { itemId: item.id }, _sum: { quantity: true, reservedQty: true } });
          balance = Math.min(balance, (catalogue._sum.quantity || 0) - (catalogue._sum.reservedQty || 0) - await unavailableStock(this.prisma, item.id));
        }
      }
      if (balance > 0.01) {
        stock[c.count] = balance;
      }
    }
    return stock;
  }

  async recycleWaste(data: {
    date: string;
    quantity: number;
    createdBy?: string;
  }) {
    data = { ...data, date: stockEventDate(data.date).toISOString() };
    if (!Number.isFinite(data.quantity) || data.quantity <= 0 || !Number.isFinite(new Date(data.date).getTime())) throw new BadRequestException('Enter a valid recycle date and positive waste weight');
    return this.prisma.stockTransaction(async (tx) => {
      // 1. Check Waste Balance as of the requested date
      const wasteAgg = await tx.wasteInventory.aggregate({
        _sum: { quantity: true },
        where: { date: { lte: new Date(data.date) } },
      });
      const wasteBalance = wasteAgg._sum.quantity || 0;

      if (wasteBalance < data.quantity) {
        throw new BadRequestException(
          `Insufficient Waste Stock on ${new Date(data.date).toLocaleDateString()}! ` +
            `Available then: ${wasteBalance.toFixed(2)} kg, Requested: ${data.quantity.toFixed(2)} kg.`,
        );
      }

      // 2. Reduce Waste Inventory
      const lastWaste = await tx.wasteInventory.findFirst({
        orderBy: { id: 'desc' },
      });
      const recycled = await tx.wasteInventory.create({
        data: {
          date: new Date(data.date),
          type: 'RECYCLE',
          quantity: -data.quantity,
          balance: (lastWaste?.balance || 0) - data.quantity,
          reference: 'RECYCLED',
          createdBy: data.createdBy,
        },
      });

      // 3. Add to Cotton Inventory (Recycled)
      const batchId = `RECYCLE-${recycled.id}`;
      await tx.wasteInventory.update({ where: { id: recycled.id }, data: { reference: batchId } });
      await tx.inwardBatch.create({ data: { batchId, date: new Date(data.date), supplier: 'Internal waste recycling', bale: 0, kg: data.quantity, createdBy: data.createdBy } });
      const lastCotton = await tx.cottonInventory.findFirst({
        orderBy: { id: 'desc' },
      });
      await tx.cottonInventory.create({
        data: {
          date: new Date(data.date),
          type: 'RECYCLED_WASTE',
          quantity: data.quantity,
          balance: (lastCotton?.balance || 0) + data.quantity, // Should this be + or -? Recycling ADDS to Cotton stock? Yes.
          reference: batchId,
          batchId,
          createdBy: data.createdBy,
        },
      });

      return { success: true };
    });
  }

  async exportWaste(data: {
    date: string;
    quantity: number;
    buyer?: string;
    price?: number;
    createdBy?: string;
  }) {
    data = { ...data, date: stockEventDate(data.date).toISOString() };
    if (!Number.isFinite(data.quantity) || data.quantity <= 0 || !Number.isFinite(new Date(data.date).getTime()) || (data.price !== undefined && (!Number.isFinite(data.price) || data.price < 0))) throw new BadRequestException('Enter a valid waste sale date, positive weight and non-negative price');
    return this.prisma.stockTransaction(async (tx) => {
      // 1. Check Waste Balance as of the requested date
      const wasteAgg = await tx.wasteInventory.aggregate({
        _sum: { quantity: true },
        where: { date: { lte: new Date(data.date) } },
      });
      const wasteBalance = wasteAgg._sum.quantity || 0;

      if (wasteBalance < data.quantity) {
        throw new BadRequestException(
          `Insufficient Waste Stock on ${new Date(data.date).toLocaleDateString()}! ` +
            `Available then: ${wasteBalance.toFixed(2)} kg, Requested: ${data.quantity.toFixed(2)} kg.`,
        );
      }

      // 2. Reduce Waste Inventory
      const lastWaste = await tx.wasteInventory.findFirst({
        orderBy: { id: 'desc' },
      });
      await tx.wasteInventory.create({
        data: {
          date: new Date(data.date),
          type: 'EXPORT',
          quantity: -data.quantity,
          balance: (lastWaste?.balance || 0) - data.quantity,
          reference: data.buyer ? `SOLD-${data.buyer}` : 'EXPORT',
          createdBy: data.createdBy,
        },
      });

      // Note: If we had a Sales/Income module, we would add an entry there using data.price * data.quantity

      return { success: true };
    });
  }

  async deleteWaste(id: number, actor = 'SYSTEM', reason?: string) {
    return this.prisma.stockTransaction(async (tx) => {
      const waste = await tx.wasteInventory.findUnique({ where: { id } });
      if (!waste) throw new BadRequestException('Waste entry not found');

      if (waste.type === 'PRODUCTION') {
        let parentProdId: number | null = waste.productionId || null;
        if (!parentProdId && waste.reference && waste.reference.startsWith('P-')) {
          parentProdId = parseInt(waste.reference.replace('P-', ''), 10) || null;
        }

        try {
          await tx.activityLog.create({
            data: {
              username: actor,
              action: 'DELETE_BLOCKED',
              module: 'WASTE',
              details: JSON.stringify({
                wasteId: id,
                reference: waste.reference,
                parentProdId,
                reason: reason || 'Cannot delete production waste directly',
              }),
            },
          });
        } catch (_) {}

        throwWasteSoldOrLinked({
          wasteId: id,
          productionId: parentProdId,
          reference: waste.reference || undefined,
          isSold: false,
        });
      }

      if (waste.type === 'EXPORT') {
        try {
          await tx.activityLog.create({
            data: {
              username: actor,
              action: 'DELETE_BLOCKED',
              module: 'WASTE',
              details: JSON.stringify({
                wasteId: id,
                reference: waste.reference,
                reason: reason || 'Cannot delete sold/exported waste entry',
              }),
            },
          });
        } catch (_) {}

        throwWasteSoldOrLinked({
          wasteId: id,
          reference: waste.reference || undefined,
          isSold: true,
        });
      }

      // 1. If it was RECYCLE, remove from Cotton Inventory
      if (waste.type === 'RECYCLE') {
        const linked = await tx.cottonInventory.findMany({ where: { type: 'RECYCLED_WASTE', ...(waste.reference?.startsWith('RECYCLE-') ? { reference: waste.reference } : { date: waste.date, quantity: Math.abs(waste.quantity) }) } });
        if (linked.length !== 1) throw new BadRequestException('This historical recycling entry has no unique cotton link. Reconcile its history before reversing it.');
        if (linked[0].batchId && await tx.productionConsumption.count({ where: { batchNo: linked[0].batchId } })) throw new BadRequestException('Recycled cotton is already used in production or a merge. Reverse the dependent entry first.');
        await tx.cottonInventory.deleteMany({
          where: { id: linked[0].id },
        });
        if (linked[0].batchId) await tx.inwardBatch.delete({ where: { batchId: linked[0].batchId } });

        // Recalculate Cotton Inventory
        const cottonMovements = await tx.cottonInventory.findMany({
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        });
        let runningCotton = 0;
        for (const mov of cottonMovements) {
          runningCotton += mov.quantity;
          if (Math.abs(mov.balance - runningCotton) > 0.001) {
            await tx.cottonInventory.update({
              where: { id: mov.id },
              data: { balance: runningCotton },
            });
          }
        }
      }

      // 2. Delete Waste Entry
      await tx.wasteInventory.delete({ where: { id } });

      // 3. Recalculate Waste Balances
      const wasteMovements = await tx.wasteInventory.findMany({
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      });
      let runningWaste = 0;
      for (const mov of wasteMovements) {
        runningWaste += mov.quantity;
        if (Math.abs(mov.balance - runningWaste) > 0.001) {
          await tx.wasteInventory.update({
            where: { id: mov.id },
            data: { balance: runningWaste },
          });
        }
      }

      // 4. Audit log DELETE
      try {
        await tx.activityLog.create({
          data: {
            username: actor,
            action: 'DELETE',
            module: 'WASTE',
            details: JSON.stringify({
              wasteId: id,
              type: waste.type,
              quantity: waste.quantity,
              reason: reason || 'Deleted waste entry',
            }),
          },
        });
      } catch (_) {}

      return { success: true };
    });
  }
}
