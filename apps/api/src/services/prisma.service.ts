import { BadRequestException, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { guardManagedStock, reconcileStock } from './stock-bridge';
import { guardLots, reconcileLots, reconcileFinance, reconcileValuation } from './business-ledger';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly mutationScope = new AsyncLocalStorage<{ items: Set<number>; lots: Set<number>; waste: boolean; all: boolean }>();
  constructor() {
    super();
    this.$use(async (params, next) => {
      const result = await next(params);
      const scope = this.mutationScope.getStore();
      if (!scope || !['create', 'update', 'upsert', 'delete', 'createMany', 'updateMany', 'deleteMany'].includes(params.action)) return result;
      if (['StockMovement', 'WarehouseMovement', 'StockLot', 'CatalogueItem'].includes(params.model || '')) {
        const itemId = params.model === 'CatalogueItem' ? result?.id : result?.itemId || params.args?.data?.itemId || params.args?.where?.itemId;
        if (typeof itemId === 'number') scope.items.add(itemId); else scope.all = true;
      }
      if (params.model === 'StockHold' && result?.lotId) scope.lots.add(result.lotId);
      if (params.model === 'WasteInventory') scope.waste = true;
      return result;
    });
    console.log('🏗️ PrismaService constructed');
  }
  async onModuleInit() {
    console.log('🔌 Connecting to Prisma database...');
    // DATABASE_URL may contain production credentials; never print it.
    await this.$connect();
    await this.$transaction(async tx => {
      await reconcileStock(tx);
      await reconcileLots(tx);
      await reconcileFinance(tx);
      await reconcileValuation(tx);
    }, { timeout: 60_000 });
    console.log('✅ Prisma connected.');
  }

  stockTransaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    const scope = { items: new Set<number>(), lots: new Set<number>(), waste: false, all: false };
    return this.mutationScope.run(scope, () => this.$transaction(async tx => {
      await reconcileStock(tx);
      await reconcileLots(tx);
      const period = await tx.accountingPeriod.findFirst({ orderBy: { through: 'desc' } });
      const closedSnapshot = period ? await this.closedSnapshot(tx, period.through) : null;
      const result = await work(tx);
      await reconcileStock(tx);
      await reconcileLots(tx);
      // Split lot issues before projecting commerce quantities back to yarn.
      await reconcileStock(tx);
      for (const lotId of scope.lots) { const lot = await tx.stockLot.findUnique({ where: { id: lotId } }); if (lot) scope.items.add(lot.itemId); }
      await guardManagedStock(tx, scope.all ? undefined : scope.items, scope.waste);
      await guardLots(tx, scope.all ? undefined : scope.items);
      await reconcileFinance(tx);
      await reconcileValuation(tx, scope.all ? undefined : scope.items);
      if (period && closedSnapshot !== await this.closedSnapshot(tx, period.through))
        throw new BadRequestException(`Books are closed through ${period.through.toISOString().slice(0, 10)}; post in an open period`);
      return result;
    }, { timeout: 60_000 }));
  }

  private async closedSnapshot(tx: Prisma.TransactionClient, through: Date) {
    const where = { date: { lte: through } }, orderBy = { id: 'asc' as const };
    const rows = await Promise.all([
      tx.stockMovement.findMany({ where, orderBy, select: { id: true, itemId: true, date: true, quantity: true, reservedQty: true, unitCost: true } }),
      tx.invoice.findMany({ where, orderBy, select: { id: true, total: true, discount: true, date: true, cgst: true, sgst: true, igst: true } }),
      tx.payment.findMany({ where, orderBy }),
      tx.production.findMany({ where, orderBy, select: { id: true, date: true, totalConsumed: true, totalProduced: true, totalWaste: true, totalIntermediate: true } }),
      tx.inwardBatch.findMany({ where, orderBy, select: { id: true, date: true, kg: true, bale: true, batchId: true } }), tx.outward.findMany({ where, orderBy, select: { id: true, date: true, totalWeight: true } }),
      tx.workflowDocument.findMany({ where, orderBy, select: { id: true, date: true, total: true, kind: true } }),
      tx.journalEntry.findMany({ where, orderBy, include: { lines: true } }),
    ]);
    return JSON.stringify(rows);
  }

  async onModuleDestroy() {
    console.log('🔌 Disconnecting from Prisma...');
    await this.$disconnect();
  }
}
