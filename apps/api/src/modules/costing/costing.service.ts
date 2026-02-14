import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class CostingService {
    constructor(private prisma: PrismaService) { }

    async addEntry(data: any) {
        // Map frontend/controller data structure to Prisma Model
        // ensure numeric fields are numbers, dates are Dates.
        return (this.prisma as any).costingEntry.create({
            data: {
                date: new Date(data.date),
                category: data.category,
                details: data.details,
                totalCost: parseFloat(data.totalCost) || (parseFloat(data.amount) || 0), // Handle various input formats

                // Specifics
                unitsConsumed: data.unitsConsumed ? parseFloat(data.unitsConsumed) : undefined,
                ratePerUnit: data.ratePerUnit ? parseFloat(data.ratePerUnit) : undefined,
                noOfShifts: data.noOfShifts ? parseInt(data.noOfShifts) : undefined,
                workers: data.workers ? parseInt(data.workers) : undefined,
                yarnProduced: data.yarnProduced ? parseFloat(data.yarnProduced) : undefined,
                rate: data.rate ? parseFloat(data.rate) : (data.ratePerKg ? parseFloat(data.ratePerKg) : undefined),
                description: data.description,
                type: data.type,
                title: data.title,
                createdBy: data.createdBy,
            }
        });
    }

    async getCostEntries() {
        return (this.prisma as any).costingEntry.findMany({
            orderBy: { date: 'desc' }
        });
    }

    async deleteEntry(id: string) {
        // Parse ID (assuming frontend sends string, but DB is Int)
        // If frontend sends '3', we parse.
        // If frontend sends generated 'abc', update migration to String @id @default(cuid())?
        // User asked to use DB. We used Int @default(autoincrement).
        // Frontend likely sends whatever it gets from `getCostEntries`.
        // If `getCostEntries` returns Int ID, frontend sends Int ID (as string in URL param).
        const numId = parseInt(id);
        if (isNaN(numId)) return false; // Or throw

        try {
            await (this.prisma as any).costingEntry.delete({ where: { id: numId } });
            return true;
        } catch (e) {
            return false;
        }
    }

    async updateEntry(id: string, data: any) {
        const numId = parseInt(id);
        if (isNaN(numId)) return null;

        try {
            return await (this.prisma as any).costingEntry.update({
                where: { id: numId },
                data: {
                    // Allow updating fields
                    date: data.date ? new Date(data.date) : undefined,
                    category: data.category,
                    details: data.details,
                    totalCost: data.totalCost ? parseFloat(data.totalCost) : undefined,
                    unitsConsumed: data.unitsConsumed ? parseFloat(data.unitsConsumed) : undefined,
                    ratePerUnit: data.ratePerUnit ? parseFloat(data.ratePerUnit) : undefined,
                    noOfShifts: data.noOfShifts ? parseInt(data.noOfShifts) : undefined,
                    workers: data.workers ? parseInt(data.workers) : undefined,
                    yarnProduced: data.yarnProduced ? parseFloat(data.yarnProduced) : undefined,
                    rate: data.rate ? parseFloat(data.rate) : undefined,
                    description: data.description,
                    type: data.type,
                    title: data.title,
                    updatedBy: data.createdBy,
                }
            });
        } catch (e) {
            return null;
        }
    }

    async exists(date: string, category: string): Promise<boolean> {
        // date string YYYY-MM-DD
        // Prisma stores DateTime.
        // Comparison needs range or extraction.
        // Simplest: findFirst where category AND date >= start AND date < end of day.
        const d = new Date(date);
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));

        const count = await (this.prisma as any).costingEntry.count({
            where: {
                category,
                date: {
                    gte: start,
                    lte: end
                }
            }
        });
        return count > 0;
    }

    async getTotalCost(from?: string, to?: string): Promise<number> {
        const where = from && to ? {
            date: {
                gte: new Date(from),
                lte: new Date(to)
            }
        } : {};

        const agg = await (this.prisma as any).costingEntry.aggregate({
            _sum: { totalCost: true },
            where
        });

        return agg._sum.totalCost || 0;
    }

    // Helper for aggregation
    async getCostSummary(from: Date, to: Date) {
        const groupBy = await (this.prisma as any).costingEntry.groupBy({
            by: ['category'],
            _sum: { totalCost: true },
            where: {
                date: { gte: from, lte: to }
            }
        });

        const summary = {
            totalElectricityCost: 0,
            totalEmployeeCost: 0,
            totalPackagingCost: 0,
            totalMaintenanceCost: 0,
            totalExpenses: 0,
            grandTotal: 0
        };

        groupBy.forEach((g: any) => {
            const cost = g._sum.totalCost || 0;
            if (g.category === 'EB (Electricity)') summary.totalElectricityCost = cost;
            else if (g.category === 'Employee') summary.totalEmployeeCost = cost;
            else if (g.category === 'Packaging') summary.totalPackagingCost = cost;
            else if (g.category === 'Maintenance') summary.totalMaintenanceCost = cost;
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
        const entries = await (this.prisma as any).costingEntry.findMany({
            where: {
                category: category === 'Expense' ? { notIn: ['EB (Electricity)', 'Employee', 'Packaging', 'Maintenance'] } : category,
                date: { gte: from, lte: to }
            },
            orderBy: { date: 'asc' }
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
        const entries = await (this.prisma as any).costingEntry.findMany({
            where: { date: { gte: from, lte: to } }
        });

        const dailyMap = new Map();

        entries.forEach((e: any) => {
            const date = e.date.toISOString().split('T')[0];
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    date,
                    ebCost: 0, employeeCost: 0, packageCost: 0, maintenanceCost: 0, expenseCost: 0, totalCost: 0
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

        return Array.from(dailyMap.values()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
}
