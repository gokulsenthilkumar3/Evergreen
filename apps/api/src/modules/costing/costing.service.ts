import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';
import { money } from '../../services/business-ledger';
import { MAX_COST_VALUE } from './costing.dto';

const POSTED_EXPENSE = 'Posted expenses retain their accounting history. Record an expense correction in Business flows.';
const DUPLICATE_ENTRY = 'An entry already exists for this date. Edit that entry instead.';
// One entry per day for these; general expenses may repeat.
const DAILY_CATEGORIES = ['EB (Electricity)', 'Employee', 'Packaging', 'Maintenance'];
const COMPUTED_CATEGORIES = ['EB (Electricity)', 'Employee', 'Packaging'];

/**
 * The controller validates request shapes; these checks are the last line
 * before the ledger and also guard direct callers of the service.
 * Blank means "not supplied"; zero is a value.
 */
function costNumber(value: unknown, label: string, whole = false): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > MAX_COST_VALUE || (whole && !Number.isInteger(n)))
    throw new BadRequestException(`${label} must be a ${whole ? 'whole ' : ''}number between 0 and ${MAX_COST_VALUE}`);
  return n;
}

function costDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value as string);
  if (!Number.isFinite(date.getTime())) throw new BadRequestException('Enter a valid expense date');
  return date;
}

function costText(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.length > 500) throw new BadRequestException(`${label} must be text of at most 500 characters`);
  return value;
}

function costFields(data: any) {
  return {
    unitsConsumed: costNumber(data.unitsConsumed, 'Units consumed'),
    ratePerUnit: costNumber(data.ratePerUnit, 'Rate per unit'),
    noOfShifts: costNumber(data.noOfShifts, 'Number of shifts', true),
    workers: costNumber(data.workers, 'Workers', true),
    yarnProduced: costNumber(data.yarnProduced, 'Yarn produced'),
    rate: costNumber(data.rate ?? data.ratePerKg, 'Rate'),
    description: costText(data.description, 'Description'),
    type: costText(data.type, 'Type'),
    title: costText(data.title, 'Title'),
  };
}
type CostFields = ReturnType<typeof costFields>;

function costDetails(category: string, fields: CostFields, fallback?: string) {
  if (category === 'EB (Electricity)') return `${fields.unitsConsumed} kWh @ ₹${fields.ratePerUnit}/unit (${fields.noOfShifts || 1} Shifts)`;
  if (category === 'Employee') return `${fields.workers} Workers (${fields.noOfShifts || 1} Shifts)`;
  if (category === 'Packaging') return `For ${fields.yarnProduced?.toFixed(2)} kg Yarn`;
  if (category === 'Maintenance') return fields.description;
  return fallback;
}

/**
 * Electricity, labour and packaging totals follow from their inputs, so the
 * server works them out and never accepts a total from the request for them.
 * Returns undefined when the category carries an entered amount instead.
 */
function computedTotal(category: string, fields: CostFields, overtime = 0): number | undefined {
  const shifts = fields.noOfShifts || 1;
  let total: number | undefined;
  if (category === 'EB (Electricity)' && fields.unitsConsumed !== undefined && fields.ratePerUnit !== undefined) total = fields.unitsConsumed * fields.ratePerUnit * shifts;
  if (category === 'Employee' && fields.workers !== undefined && fields.rate !== undefined) total = fields.workers * fields.rate * shifts + overtime;
  if (category === 'Packaging' && fields.yarnProduced !== undefined && fields.rate !== undefined) total = fields.yarnProduced * fields.rate;
  if (total === undefined) return undefined;
  if (total > MAX_COST_VALUE) throw new BadRequestException(`The calculated total exceeds ${MAX_COST_VALUE}. Check the quantities and rates.`);
  return money(total);
}

function definedOnly<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>;
}

@Injectable()
export class CostingService {
  constructor(private prisma: PrismaService) {}

  async addEntry(data: any) {
    const date = costDate(data.date);
    if (!date) throw new BadRequestException('Enter a valid expense date');
    const fields = costFields(data);
    const category = costText(data.category, 'Category') || 'Expense';
    const computed = computedTotal(category, fields, costNumber(data.overtime, 'Overtime'));
    if (computed === undefined && COMPUTED_CATEGORIES.includes(category)) throw new BadRequestException(`Enter the quantities and rate for this ${category} entry`);
    const totalCost = computed ?? costNumber(data.totalCost, 'Total cost') ?? costNumber(data.amount, 'Amount') ?? 0;
    return this.prisma.stockTransaction(async tx => {
      // Inside the transaction so two simultaneous saves cannot both pass the check.
      if (DAILY_CATEGORIES.includes(category) && (await this.existsOn(tx, date, category))) throw new ConflictException(DUPLICATE_ENTRY);
      return tx.costingEntry.create({
        data: {
          date,
          category,
          details: costDetails(category, fields, costText(data.details, 'Details')),
          totalCost,
          ...fields,
          createdBy: data.createdBy,
        },
      });
    });
  }

  /** `posted` entries are in the accounts and can only be changed by a correction. */
  async getCostEntries() {
    const [entries, journals] = await Promise.all([
      this.prisma.costingEntry.findMany({ orderBy: { date: 'desc' } }),
      this.prisma.journalEntry.findMany({ where: { sourceKey: { startsWith: 'COST:' } }, select: { sourceKey: true } }),
    ]);
    const posted = new Set(journals.map(journal => journal.sourceKey));
    return entries.map(entry => ({ ...entry, posted: posted.has(`COST:${entry.id}`) }));
  }

  async deleteEntry(id: string) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) return false;
    return this.prisma.stockTransaction(async tx => {
      if (!(await tx.costingEntry.findUnique({ where: { id: numId } }))) return false;
      if (await tx.journalEntry.findUnique({ where: { sourceKey: `COST:${numId}` } })) throw new BadRequestException(POSTED_EXPENSE);
      await tx.costingEntry.delete({ where: { id: numId } });
      return true;
    });
  }

  /**
   * Runs inside the stock transaction so the posted-entry check, the change and
   * its journal commit together. An unposted (zero) entry that gains an amount
   * is posted by the same transaction, exactly like a new entry.
   */
  async updateEntry(id: string, data: any) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) return null;
    const date = costDate(data.date);
    const enteredTotal = costNumber(data.totalCost, 'Total cost');
    const overtime = costNumber(data.overtime, 'Overtime');
    const fields = costFields(data);
    const details = costText(data.details, 'Details');
    const inputsChanged = overtime !== undefined || [fields.unitsConsumed, fields.ratePerUnit, fields.noOfShifts, fields.workers, fields.yarnProduced, fields.rate].some(v => v !== undefined);
    return this.prisma.stockTransaction(async tx => {
      const existing = await tx.costingEntry.findUnique({ where: { id: numId } });
      if (!existing) return null;
      if (await tx.journalEntry.findUnique({ where: { sourceKey: `COST:${numId}` } })) throw new BadRequestException(POSTED_EXPENSE);
      // The stored category decides the wording and the arithmetic; a request cannot relabel an entry.
      const merged = { ...definedOnly(existing), ...definedOnly(fields) } as CostFields;
      const computed = COMPUTED_CATEGORIES.includes(existing.category);
      return tx.costingEntry.update({
        where: { id: numId },
        data: {
          date,
          details: costDetails(existing.category, merged, details ?? existing.details ?? undefined),
          totalCost: computed ? (inputsChanged ? computedTotal(existing.category, merged, overtime) : undefined) : enteredTotal,
          ...fields,
          updatedBy: data.updatedBy,
        },
      });
    });
  }

  /** Same calendar day in the server's time zone, matching how entries are listed. */
  private async existsOn(tx: Prisma.TransactionClient, date: Date, category: string): Promise<boolean> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return (await tx.costingEntry.count({ where: { category, date: { gte: start, lte: end } } })) > 0;
  }

  async getTotalCost(from?: string, to?: string): Promise<number> {
    const where =
      from && to
        ? {
            date: {
              gte: new Date(from),
              lte: new Date(to),
            },
          }
        : {};

    const agg = await this.prisma.costingEntry.aggregate({
      _sum: { totalCost: true },
      where,
    });

    return agg._sum.totalCost || 0;
  }

  // Helper for aggregation
  async getCostSummary(from: Date, to: Date) {
    const groupBy = await this.prisma.costingEntry.groupBy({
      by: ['category'],
      _sum: { totalCost: true },
      where: {
        date: { gte: from, lte: to },
      },
    });

    const summary = {
      totalElectricityCost: 0,
      totalEmployeeCost: 0,
      totalPackagingCost: 0,
      totalMaintenanceCost: 0,
      totalExpenses: 0,
      grandTotal: 0,
    };

    groupBy.forEach((g: any) => {
      const cost = g._sum.totalCost || 0;
      if (g.category === 'EB (Electricity)')
        summary.totalElectricityCost = cost;
      else if (g.category === 'Employee') summary.totalEmployeeCost = cost;
      else if (g.category === 'Packaging') summary.totalPackagingCost = cost;
      else if (g.category === 'Maintenance')
        summary.totalMaintenanceCost = cost;
      else summary.totalExpenses += cost; // Group 'Expense' and others?
      summary.grandTotal += cost;
    });

    return summary;
  }

  async getHistoryByCategory(category: string, from: Date, to: Date) {
    // Return raw entries for charts? Or daily sum?
    // Charts usually want daily data points.
    // Group by Date.
    // Prisma groupBy date? Not directly supported for date truncation in all DBs.
    // Simplest: Fetch all entries in range for category, modify in memory.
    const entries = await this.prisma.costingEntry.findMany({
      where: {
        category:
          category === 'Expense'
            ? {
                notIn: [
                  'EB (Electricity)',
                  'Employee',
                  'Packaging',
                  'Maintenance',
                ],
              }
            : category,
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    });

    // Map to format
    return entries.map((e: any) => ({
      date: e.date.toISOString().split('T')[0],
      cost: e.totalCost,
      // Add specific fields if needed
      units: e.unitsConsumed, // EB
      shifts: e.noOfShifts,
      employees: e.workers,
      totalKg: e.yarnProduced,
      category: e.type || e.category, // for Expenses
    }));
  }

  async getDailyCostSummary(from: Date, to: Date) {
    const entries = await this.prisma.costingEntry.findMany({
      where: { date: { gte: from, lte: to } },
    });

    const dailyMap = new Map();

    entries.forEach((e: any) => {
      const date = e.date.toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          ebCost: 0,
          employeeCost: 0,
          packageCost: 0,
          maintenanceCost: 0,
          expenseCost: 0,
          totalCost: 0,
        });
      }
      const d = dailyMap.get(date);
      const cost = e.totalCost;
      d.totalCost += cost;

      if (e.category === 'EB (Electricity)') d.ebCost += cost;
      else if (e.category === 'Employee') d.employeeCost += cost;
      else if (e.category === 'Packaging') d.packageCost += cost;
      else if (e.category === 'Maintenance') d.maintenanceCost += cost;
      else d.expenseCost += cost;
    });

    return Array.from(dailyMap.values()).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }
}
