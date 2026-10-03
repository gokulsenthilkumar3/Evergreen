import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import {
  SETTLE_GAP_MS,
  MASS_BALANCE_TOLERANCE,
  throwProductionTooEarly,
  throwProductionInFuture,
  throwMassBalanceExceeded,
  throwProductionHasBilledBags,
  throwProductionHasSoldWaste,
} from '../../utils/delete-guard';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    console.log(
      '[Production] Starting create with data:',
      JSON.stringify(data, null, 2),
    );
    try {
      return await this.prisma.$transaction(async (tx) => {
        const prodDate = new Date(data.date);

        // 0. Time Validation: Production date cannot be in the future
        if (prodDate.getTime() > Date.now() + 60_000) {
          throwProductionInFuture(prodDate);
        }

        // 0.1 Validation: Check Cotton Stock as of the production date
        const totalConsumption = data.consumed.reduce(
          (sum: number, c: any) => sum + parseFloat(c.weight || 0),
          0,
        );
        const stockAgg = await tx.cottonInventory.aggregate({
          where: { date: { lte: prodDate } },
          _sum: { quantity: true },
        });
        const availableStock = stockAgg._sum.quantity || 0;

        if (availableStock < totalConsumption) {
          throw new BadRequestException(
            `Insufficient Cotton Stock on ${prodDate.toLocaleDateString('en-IN')}! ` +
              `Available then: ${availableStock.toFixed(2)} kg, Required: ${totalConsumption.toFixed(2)} kg. ` +
              `Please check if you are recording production for a date before the stock was received.`,
          );
        }

        // 0.2 Validation: Check Per-Batch Availability & Settle Gap (Rule 5)
        for (const c of data.consumed) {
          const batch = await tx.inwardBatch.findUnique({
            where: { batchId: c.batchNo },
          });

          if (!batch) {
            throw new BadRequestException(
              `Batch "${c.batchNo}" not found in Inward History!`,
            );
          }

          // Rule 5: Minimum settle gap between inward receipt and production start
          const inwardReceivedAt = new Date(batch.date || batch.createdAt);
          const earliestAllowed = new Date(inwardReceivedAt.getTime() + SETTLE_GAP_MS);

          if (prodDate.getTime() < earliestAllowed.getTime()) {
            throwProductionTooEarly({
              batchNo: c.batchNo,
              inwardReceivedAt,
              earliestStartAt: earliestAllowed,
              startedAt: prodDate,
            });
          }

          // Calculate used so far (Usage is negative in CottonInventory, so abs)
          const usedAgg = await tx.cottonInventory.aggregate({
            _sum: { quantity: true },
            where: {
              batchId: c.batchNo,
              type: { in: ['PRODUCTION', 'MERGE_OUT'] },
            },
          });
          const alreadyUsed = Math.abs(usedAgg._sum.quantity || 0);
          const requesting = parseFloat(c.weight);
          const remaining = batch.kg - alreadyUsed;

          // Tolerance for float errors (0.01 kg)
          if (remaining - requesting < -0.01) {
            throw new BadRequestException(
              `Insufficient quantity in Batch ${c.batchNo}. Initial: ${batch.kg} kg, Used: ${alreadyUsed.toFixed(2)} kg, Available: ${remaining.toFixed(2)} kg, Requested: ${requesting.toFixed(2)} kg`,
            );
          }

          // Check remaining bales using typed Prisma aggregate
          const requestingBales = parseFloat(c.bale) || 0;
          if (requestingBales > 0) {
            const baleAgg = await tx.productionConsumption.aggregate({
              _sum: { bale: true },
              where: { batchNo: c.batchNo },
            });
            const usedBales = baleAgg._sum.bale ?? 0;
            const remainingBales = batch.bale - usedBales;
            if (requestingBales > remainingBales + 0.01) {
              throw new BadRequestException(
                `Insufficient bales in Batch ${c.batchNo}. Total: ${batch.bale}, Used: ${usedBales}, Available: ${remainingBales.toFixed(0)}, Requested: ${requestingBales}`,
              );
            }
          }
        }

        // 0.3 Mass Balance Validation: Output cannot exceed input by more than tolerance
        const totalProduced = parseFloat(data.totalProduced || 0);
        const totalWaste = parseFloat(data.totalWaste || 0);
        const totalIntermediate = parseFloat(data.totalIntermediate || 0);
        const totalOutput = totalProduced + totalWaste + totalIntermediate;

        if (totalOutput > totalConsumption * (1 + MASS_BALANCE_TOLERANCE) + 0.01) {
          throwMassBalanceExceeded({
            totalConsumed: totalConsumption,
            totalProduced,
            totalWaste,
            tolerance: MASS_BALANCE_TOLERANCE,
          });
        }

        // 1. Create Production Entry
        const production = await tx.production.create({
          data: {
            date: new Date(data.date),
            totalConsumed: data.totalConsumed,
            totalProduced: data.totalProduced,
            totalWaste: data.totalWaste,
            totalIntermediate: totalIntermediate,
            createdBy: data.createdBy,
            wasteBlowRoom: parseFloat(data.waste?.blowRoom) || 0,
            wasteCarding: parseFloat(data.waste?.carding) || 0,
            wasteOE: parseFloat(data.waste?.oe) || 0,
            wasteOthers: parseFloat(data.waste?.others) || 0,
            consumedBatches: {
              create: data.consumed.map((c: any) => ({
                batchNo: c.batchNo,
                bale: parseFloat(c.bale) || 0,
                weight: parseFloat(c.weight),
              })),
            },
            producedYarn: {
              create: data.produced.map((p: any) => ({
                count: p.count,
                weight: parseFloat(p.weight),
                bags: p.bags,
                remainingLog: p.remainingLog,
              })),
            },
          },
        });

        const batchSummary = data.consumed
          .map((c: any) => c.batchNo)
          .join(', ');

        // 2. Update Cotton Inventory (Reduction)
        for (const c of data.consumed) {
          const lastCotton = await tx.cottonInventory.findFirst({
            orderBy: { id: 'desc' },
          });
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
              bale: parseFloat(c.bale) || 0,
              createdBy: data.createdBy,
            },
          });
        }

        // 3. Update Yarn Inventory (Increase)
        for (const p of data.produced) {
          const lastYarnForCount = await tx.yarnInventory.findFirst({
            where: { count: p.count },
            orderBy: { id: 'desc' },
          });
          const currentBalanceForCount = lastYarnForCount
            ? lastYarnForCount.balance
            : 0;
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
              createdBy: data.createdBy,
            },
          });
        }

        // 4. Update Waste Inventory (if waste exists)
        if (data.totalWaste > 0) {
          const lastWaste = await tx.wasteInventory.findFirst({
            orderBy: { id: 'desc' },
          });
          const currentWasteBalance = lastWaste ? lastWaste.balance : 0;

          await tx.wasteInventory.create({
            data: {
              date: new Date(data.date),
              type: 'PRODUCTION',
              quantity: data.totalWaste,
              balance: currentWasteBalance + data.totalWaste,
              reference: `W-${batchSummary}`,
              wasteBlowRoom: parseFloat(data.waste?.blowRoom) || 0,
              wasteCarding: parseFloat(data.waste?.carding) || 0,
              wasteOE: parseFloat(data.waste?.oe) || 0,
              wasteOthers: parseFloat(data.waste?.others) || 0,
              productionId: production.id,
              createdBy: data.createdBy,
            },
          });
        }

        // 5. Recalculate Balances to guarantee ledger integrity
        // Cotton
        const cottonMovements = await tx.cottonInventory.findMany({
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        });
        let cottonRun = 0;
        for (const mov of cottonMovements) {
          cottonRun += mov.quantity;
          if (Math.abs(mov.balance - cottonRun) > 0.001) {
            await tx.cottonInventory.update({
              where: { id: mov.id },
              data: { balance: cottonRun },
            });
          }
        }

        // Yarn (for affected counts)
        const countsAffected = [
          ...new Set(data.produced.map((p: any) => p.count)),
        ];
        for (const count of countsAffected) {
          const yarnMovements = await tx.yarnInventory.findMany({
            where: { count: count as string },
            orderBy: [{ date: 'asc' }, { id: 'asc' }],
          });
          let yarnRun = 0;
          for (const mov of yarnMovements) {
            yarnRun += mov.quantity;
            if (Math.abs(mov.balance - yarnRun) > 0.001) {
              await tx.yarnInventory.update({
                where: { id: mov.id },
                data: { balance: yarnRun },
              });
            }
          }
        }

        // Waste
        if (data.totalWaste > 0) {
          const wasteMovements = await tx.wasteInventory.findMany({
            orderBy: [{ date: 'asc' }, { id: 'asc' }],
          });
          let wasteRun = 0;
          for (const mov of wasteMovements) {
            wasteRun += mov.quantity;
            if (Math.abs(mov.balance - wasteRun) > 0.001) {
              await tx.wasteInventory.update({
                where: { id: mov.id },
                data: { balance: wasteRun },
              });
            }
          }
        }

        // 6. Audit CREATE in ActivityLog
        await tx.activityLog.create({
          data: {
            username: data.createdBy || 'SYSTEM',
            action: 'CREATE',
            module: 'PRODUCTION',
            details: JSON.stringify({
              productionId: production.id,
              date: data.date,
              totalConsumed: totalConsumption,
              totalProduced,
              totalWaste,
              batches: data.consumed.map((c: any) => c.batchNo),
            }),
          },
        });

        return production;
      });
    } catch (error: any) {
      console.error('[Production] Error in create:', error);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.production.findMany({
      where: { createdBy: { not: 'SYSTEM_MERGE' } },
      orderBy: { date: 'desc' },
      include: {
        consumedBatches: true,
        producedYarn: true,
      },
    });
  }

  async delete(id: number, actor = 'SYSTEM', reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const prod = await tx.production.findUnique({
        where: { id },
        include: { producedYarn: true, consumedBatches: true },
      });
      if (!prod) throw new BadRequestException('Production entry not found');

      // 1. Dependency Checks: Packaging / Maintenance Costing
      const costing = await tx.costingEntry.findMany({
        where: {
          date: prod.date,
          category: { in: ['Packaging', 'Maintenance'] },
        },
      });
      if (costing.length > 0) {
        throw new BadRequestException(
          'Please delete Packaging and Maintenance costing for this production date first.',
        );
      }

      // 2. Rule 2 Delete-Guard: Check if yarn from this production is already billed or outwarded
      const countsAffected = prod.producedYarn.map((p) => p.count);
      for (const count of countsAffected) {
        const yarnMovements = await tx.yarnInventory.findMany({
          where: { count },
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        });

        let runningYarn = 0;
        for (const m of yarnMovements) {
          // Simulate state without this production run
          if (m.productionId === id) continue;
          runningYarn += m.quantity;
          if (runningYarn < -0.001) {
            // Blocked: Yarn bags are already outwarded or billed
            await tx.activityLog.create({
              data: {
                username: actor,
                action: 'DELETE_BLOCKED',
                module: 'PRODUCTION',
                details: JSON.stringify({
                  reason: 'Yarn bags from production are already billed or outwarded',
                  productionId: id,
                  count,
                  blockingDate: m.date,
                }),
              },
            });

            throwProductionHasBilledBags({
              productionId: id,
              counts: countsAffected,
              details: `Deleting Production #${id} would cause Yarn Count ${count} to go negative on ${m.date.toLocaleDateString('en-IN')}. Billed outwards depend on this production.`,
            });
          }
        }
      }

      // 3. Rule 2 Delete-Guard: Check if waste from this production is already sold or exported
      const wasteMovements = await tx.wasteInventory.findMany({
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      });

      let runningWaste = 0;
      for (const m of wasteMovements) {
        if (m.productionId === id) continue;
        runningWaste += m.quantity;
        if (runningWaste < -0.001) {
          await tx.activityLog.create({
            data: {
              username: actor,
              action: 'DELETE_BLOCKED',
              module: 'PRODUCTION',
              details: JSON.stringify({
                reason: 'Waste from production is already sold or exported',
                productionId: id,
                blockingDate: m.date,
              }),
            },
          });

          throwProductionHasSoldWaste({
            productionId: id,
          });
        }
      }

      // 4. Safe to cascade delete children (bags + waste + consumptions) with parent
      await tx.cottonInventory.deleteMany({
        where: { productionId: id },
      });

      await tx.yarnInventory.deleteMany({
        where: { productionId: id },
      });

      await tx.wasteInventory.deleteMany({
        where: { productionId: id },
      });

      await tx.production.delete({
        where: { id },
      });

      // 5. Recalculate Balances
      // Cotton
      const cottonMovements = await tx.cottonInventory.findMany({
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      });
      let runningCotton = 0;
      for (const m of cottonMovements) {
        runningCotton += m.quantity;
        if (Math.abs(m.balance - runningCotton) > 0.001) {
          await tx.cottonInventory.update({
            where: { id: m.id },
            data: { balance: runningCotton },
          });
        }
      }

      // Waste
      const remainingWaste = await tx.wasteInventory.findMany({
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      });
      let wasteRun = 0;
      for (const m of remainingWaste) {
        wasteRun += m.quantity;
        if (Math.abs(m.balance - wasteRun) > 0.001) {
          await tx.wasteInventory.update({
            where: { id: m.id },
            data: { balance: wasteRun },
          });
        }
      }

      // Yarn
      for (const count of countsAffected) {
        const remainingYarn = await tx.yarnInventory.findMany({
          where: { count },
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        });
        let yarnRun = 0;
        for (const m of remainingYarn) {
          yarnRun += m.quantity;
          if (Math.abs(m.balance - yarnRun) > 0.001) {
            await tx.yarnInventory.update({
              where: { id: m.id },
              data: { balance: yarnRun },
            });
          }
        }
      }

      // 6. Audit DELETE_CASCADE
      await tx.activityLog.create({
        data: {
          username: actor,
          action: 'DELETE_CASCADE',
          module: 'PRODUCTION',
          details: JSON.stringify({
            productionId: id,
            cascadedBags: prod.producedYarn.reduce((s, p) => s + (p.bags || 0), 0),
            cascadedWasteKg: prod.totalWaste,
            cascadedProducedKg: prod.totalProduced,
            reason: reason || 'Production and its bags + waste cascade deleted',
          }),
        },
      });

      return {
        success: true,
        cascaded: true,
        deletedProductionId: id,
      };
    });
  }
}
