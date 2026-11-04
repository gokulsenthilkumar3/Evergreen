import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { guardManagedStock, reconcileStock } from './stock-bridge';
import {
  guardLots,
  reconcileLots,
  reconcileFinance,
  reconcileValuation,
  type FinanceScope,
} from './business-ledger';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createDatabaseClient } from '@evergreen/database/runtime-client';
import { Cron, CronExpression } from '@nestjs/schedule';

// Client delegation keeps lifecycle/ledger methods on the service while selecting a
// generated provider at construction time, after environment configuration is loaded.
export interface PrismaService extends PrismaClient {}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy
{
  private readonly mutationScope = new AsyncLocalStorage<{
    items: Set<number>;
    lots: Set<number>;
    waste: boolean;
    all: boolean;
    legacy: boolean;
    financeAll: boolean;
    finance: FinanceScope;
  }>();
  private startupIssue: string | null = null;
  private dataIssues: string[] = [];
  private auditInProgress = false;
  constructor() {
    const client = createDatabaseClient();
    client.$use(async (params, next) => {
      const result = await next(params);
      const scope = this.mutationScope.getStore();
      if (
        !scope ||
        ![
          'create',
          'update',
          'upsert',
          'delete',
          'createMany',
          'updateMany',
          'deleteMany',
        ].includes(params.action)
      )
        return result;
      if (
        [
          'StockMovement',
          'WarehouseMovement',
          'StockLot',
          'CatalogueItem',
        ].includes(params.model || '')
      ) {
        const itemId =
          params.model === 'CatalogueItem'
            ? result?.id
            : result?.itemId ||
              params.args?.data?.itemId ||
              params.args?.where?.itemId;
        if (typeof itemId === 'number') scope.items.add(itemId);
        else scope.all = true;
      }
      if (params.model === 'StockHold' && result?.lotId)
        scope.lots.add(result.lotId);
      if (params.model === 'WasteInventory') scope.waste = true;
      if (['CottonInventory', 'YarnInventory', 'InwardBatch'].includes(params.model || '')) scope.legacy = true;
      const financeModels: Partial<Record<Prisma.ModelName, keyof FinanceScope>> = {
        CostingEntry: 'costs', PayrollEntry: 'payroll', Production: 'productions', Invoice: 'invoices', Payment: 'invoices',
      };
      const financeKey = params.model ? financeModels[params.model] : undefined;
      if (financeKey) {
        const id = params.model === 'Payment' ? result?.invoiceId : result?.id;
        if (typeof id === 'number') scope.finance[financeKey].add(id);
        else scope.financeAll = true; // Bulk/partial results retain the safe full reconciliation path.
      }
      return result;
    });
    console.log('🏗️ PrismaService constructed');
    return new Proxy(this, {
      get(target, key, receiver) {
        if (key in target) return Reflect.get(target, key, receiver);
        const value = Reflect.get(client, key, client);
        return typeof value === 'function' ? value.bind(client) : value;
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async auditLedgers() {
    if (this.auditInProgress) return;
    this.auditInProgress = true;
    try { await this.reconcileEverything(); }
    catch { console.error('Scheduled ledger audit failed; database/schema health requires attention'); }
    finally { this.auditInProgress = false; }
  }
  async onModuleInit() {
    console.log('🔌 Connecting to Prisma database...');
    // DATABASE_URL may contain production credentials; never print it.
    await this.$connect();
    await this.reconcileEverything();
    console.log('✅ Prisma connected.');
  }

  /**
   * Full reconciliation, as run at startup. A business record that breaks a
   * ledger rule must not take sign-in and read access down with it: the reason
   * is remembered and postings keep failing with the same message until the
   * record is corrected. Anything else (schema, connectivity) is still fatal.
   */
  private async reconcileEverything(): Promise<void> {
    try {
      const issues = await this.$transaction(
        async (tx) => {
          await reconcileStock(tx);
          await reconcileLots(tx);
          const unposted = await reconcileFinance(tx);
          await reconcileValuation(tx);
          return unposted;
        },
        { timeout: 60_000 },
      );
      this.dataIssues = issues ?? [];
      this.startupIssue = null;
    } catch (error) {
      if (!(error instanceof BadRequestException)) throw error;
      this.startupIssue = error.message;
      console.error(`⚠️ Reconciliation found a data problem: ${error.message}`);
    }
  }

  /** Why the last full reconciliation was blocked, or null when the ledgers reconciled. */
  getStartupIssue(): string | null {
    return this.startupIssue;
  }

  /** Stored records left out of the journal by the most recent reconciliation. */
  getDataIssues(): string[] {
    return this.dataIssues;
  }

  stockTransaction<T>(
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const scope = {
      items: new Set<number>(),
      lots: new Set<number>(),
      waste: false,
      all: false,
      legacy: false,
      financeAll: false,
      finance: { costs: new Set<number>(), payroll: new Set<number>(), productions: new Set<number>(), invoices: new Set<number>() },
    };
    return this.mutationScope.run(scope, async () => {
      let unposted: string[] = [];
      const repairFirst = await this.leadingReconcileBlocked();
      const committed = await this.$transaction(
        async (tx) => {
          if (this.startupIssue && !repairFirst) {
            await reconcileStock(tx);
            await reconcileLots(tx);
          }
          const period = await tx.accountingPeriod.findFirst({
            orderBy: { through: 'desc' },
          });
          const closedSnapshot = period
            ? await this.closedSnapshot(tx, period.through)
            : null;
          const result = await work(tx);
          const affected = scope.legacy || scope.all || this.startupIssue ? undefined : scope.items;
          await reconcileStock(tx, affected);
          await reconcileLots(tx, affected);
          // Split lot issues before projecting commerce quantities back to yarn.
          await reconcileStock(tx, affected);
          for (const lotId of scope.lots) {
            const lot = await tx.stockLot.findUnique({ where: { id: lotId } });
            if (lot) scope.items.add(lot.itemId);
          }
          await guardManagedStock(
            tx,
            scope.all ? undefined : scope.items,
            scope.waste,
          );
          await guardLots(tx, scope.all ? undefined : scope.items);
          unposted = await reconcileFinance(tx, scope.financeAll || this.startupIssue ? undefined : scope.finance);
          await reconcileValuation(tx, scope.all ? undefined : scope.items);
          if (
            period &&
            closedSnapshot !== (await this.closedSnapshot(tx, period.through))
          )
            throw new BadRequestException(
              `Books are closed through ${period.through.toISOString().slice(0, 10)}; post in an open period`,
            );
          return result;
        },
        { timeout: 60_000 },
      );
      this.dataIssues = scope.financeAll || this.startupIssue ? unposted : [
        ...this.dataIssues.filter(issue => {
          const cost = issue.match(/^Cost entry #(\d+)/);
          const pay = issue.match(/^Payroll entry #(\d+)/);
          return !(cost && scope.finance.costs.has(Number(cost[1]))) && !(pay && scope.finance.payroll.has(Number(pay[1])));
        }),
        ...unposted,
      ];
      // This posting may have been the repair: re-run the full check so a resolved
      // problem stops being reported. The posting itself is already committed.
      if (this.startupIssue)
        await this.reconcileEverything().catch((error) =>
          console.error('Reconciliation re-check failed', error),
        );
      return committed;
    });
  }

  /**
   * While a data problem is recorded, the stock and lot reconcile that leads
   * every posting may be the very step that fails, and the posting that would
   * repair it would never reach its work. Try that step alone first: it runs in
   * its own transaction, so a failure rolls back whole and leaves no
   * half-assigned lots behind. When it is blocked the posting runs its work
   * first; the full reconcile and the guards after the work still decide
   * whether anything commits.
   */
  private async leadingReconcileBlocked(): Promise<boolean> {
    if (!this.startupIssue) return false;
    try {
      await this.$transaction(async tx => {
        await reconcileStock(tx);
        await reconcileLots(tx);
      }, { timeout: 60_000 });
      return false;
    } catch (error) {
      if (!(error instanceof BadRequestException)) throw error;
      return true;
    }
  }

  private async closedSnapshot(tx: Prisma.TransactionClient, through: Date) {
    const where = { date: { lte: through } },
      orderBy = { id: 'asc' as const };
    const rows = await Promise.all([
      tx.stockMovement.findMany({
        where,
        orderBy,
        select: {
          id: true,
          itemId: true,
          date: true,
          quantity: true,
          reservedQty: true,
          unitCost: true,
        },
      }),
      tx.invoice.findMany({
        where,
        orderBy,
        select: {
          id: true,
          total: true,
          discount: true,
          date: true,
          cgst: true,
          sgst: true,
          igst: true,
        },
      }),
      tx.payment.findMany({ where, orderBy }),
      tx.production.findMany({
        where,
        orderBy,
        select: {
          id: true,
          date: true,
          totalConsumed: true,
          totalProduced: true,
          totalWaste: true,
          totalIntermediate: true,
        },
      }),
      tx.inwardBatch.findMany({
        where,
        orderBy,
        select: { id: true, date: true, kg: true, bale: true, batchId: true },
      }),
      tx.outward.findMany({
        where,
        orderBy,
        select: { id: true, date: true, totalWeight: true },
      }),
      tx.workflowDocument.findMany({
        where,
        orderBy,
        select: { id: true, date: true, total: true, kind: true },
      }),
      tx.journalEntry.findMany({ where, orderBy, include: { lines: true } }),
    ]);
    return JSON.stringify(rows);
  }

  async onModuleDestroy() {
    console.log('🔌 Disconnecting from Prisma...');
    await this.$disconnect();
  }
}
