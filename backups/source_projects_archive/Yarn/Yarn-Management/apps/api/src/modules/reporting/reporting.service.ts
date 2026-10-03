import { prisma } from '../../prisma/client';

// Executive Dashboard KPIs
export async function getDashboardKPIs() {
    // 1. Financial KPIs
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const invoices = await prisma.invoice.findMany({
        where: {
            date: { gte: currentMonth },
        },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousInvoices = await prisma.invoice.findMany({ where: { date: { gte: previousMonth, lt: currentMonth } } });
    const previousRevenue = previousInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // 2. Operational KPIs
    const activeProductionBatches = await prisma.productionBatch.count({
        where: { status: 'IN_PROGRESS' },
    });

    const activeOperators = await prisma.productionStage.groupBy({
        by: ['operatorName'],
        where: { status: 'IN_PROGRESS' },
        _count: true,
    });
    const operatorCount = activeOperators.length;

    return {
        financial: {
            revenue: totalRevenue,
            profit: null, // Cost accounting is not yet available; do not invent a margin.
            growth: previousRevenue > 0 ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) : null,
        },
        operations: {
            activeBatches: activeProductionBatches,
            activeOperators: operatorCount,
            efficiency: null, // OEE requires measured availability, performance and quality.
        },
        charts: {
            revenueVsCost: await getRevenueVsCostChart(),
            operationalEfficiency: await getEfficiencyChart(),
        }
    };
}

async function getRevenueVsCostChart() {
    const data = [];
    const start = new Date();
    start.setDate(1);
    start.setMonth(start.getMonth() - 5);
    start.setHours(0, 0, 0, 0);
    const invoices = await prisma.invoice.findMany({ where: { date: { gte: start } }, select: { date: true, totalAmount: true } });
    if (invoices.length === 0) return [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const revenue = invoices.filter((invoice) => invoice.date.getMonth() === d.getMonth() && invoice.date.getFullYear() === d.getFullYear()).reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
        data.push({ name: month, revenue });
    }
    return data;
}

async function getEfficiencyChart() {
    return []; // No measured OEE series exists yet.
}


// Custom Report Builder Logic
export async function generateCustomReport(source: string, fields: string[], filters: any) {
    let data: any[] = [];

    // Map source to Prisma Delegate
    switch (source) {
        case 'orders':
            // Assuming orders map to Invoices or SalesOrders
            data = await prisma.invoice.findMany({
                select: buildSelectObject(fields),
                where: buildWhereClause(filters),
                take: 100,
            });
            break;
        case 'inventory':
            data = await prisma.rawMaterial.findMany({
                select: buildSelectObject(fields),
                where: buildWhereClause(filters),
                take: 100,
            });
            break;
        case 'production':
            data = await prisma.productionBatch.findMany({
                select: buildSelectObject(fields),
                where: buildWhereClause(filters),
                take: 100,
            });
            break;
        case 'suppliers':
            data = await prisma.supplier.findMany({
                select: buildSelectObject(fields),
                where: buildWhereClause(filters),
                take: 100,
            })
            break;
        default:
            throw new Error(`Unknown data source: ${source}`);
    }

    return data;
}

function buildSelectObject(fields: string[]) {
    // If empty, return undefined to select all (or handle default)
    if (!fields || fields.length === 0) return undefined;

    const select: any = {};
    fields.forEach(f => select[f] = true);

    // Always include ID if possible
    select['id'] = true;
    return select;
}

function buildWhereClause(filters: any) {
    if (!filters) return {};

    const where: any = {};
    if (filters.dateRange && filters.dateField) {
        where[filters.dateField] = {
            gte: new Date(filters.dateRange.start),
            lte: new Date(filters.dateRange.end),
        };
    }

    // Add more dynamic filters here
    return where;
}

// Compliance Reports
export async function getComplianceReport(type: string, params: any) {
    if (type === 'gstr1') {
        const invoices = await prisma.invoice.findMany({
            where: {
                date: {
                    gte: new Date(params.startDate),
                    lte: new Date(params.endDate),
                }
            },
            include: {
                customer: true, // Assuming relation exists, or we fetch details
                items: true,
            }
        });

        // Transform for GSTR-1 format
        return invoices.map(inv => {
            const value = Number(inv.totalAmount);
            const tax = Number(inv.taxAmount);
            const taxableValue = value - tax;
            return {
                gstin: inv.customer?.gstin || 'URP',
                invoiceNumber: inv.invoiceNumber,
                date: inv.date,
                value,
                taxRate: taxableValue > 0 ? Math.round((tax / taxableValue) * 10000) / 100 : null,
                taxableValue,
            };
        });
    }

    if (type === 'financials') {
        // P&L Summary
        const revenue = await prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                date: {
                    gte: new Date(params.startDate),
                    lte: new Date(params.endDate),
                }
            }
        });

        const totalRevenue = Number(revenue._sum.totalAmount || 0);

        return {
            revenue: totalRevenue,
            cogs: null,
            grossProfit: null,
            expenses: null,
            netProfit: null,
            note: 'Cost and expense ledgers are not connected. Profit figures are unavailable rather than estimated.'
        };
    }

    return [];
}

// --- Phase 3 Advanced Features: Scheduled Reporting ---

export async function createReportSchedule(data: {
    name: string;
    reportType: string;
    frequency: string;
    recipients: string[];
    filters?: any;
    nextRun: Date;
}) {
    return await prisma.reportSchedule.create({
        data: {
            ...data,
            isActive: true
        }
    });
}

export async function getReportSchedules() {
    return await prisma.reportSchedule.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function deleteReportSchedule(id: string) {
    return await prisma.reportSchedule.delete({
        where: { id }
    });
}

/**
 * Background Engine: Process due reports
 */
export async function processScheduledReports() {
    const now = new Date();
    const dueReports = await prisma.reportSchedule.findMany({
        where: {
            isActive: true,
            nextRun: { lte: now }
        }
    });

    console.log(`[ReportingEngine] Processing ${dueReports.length} due reports...`);

    for (const schedule of dueReports) {
        try {
            // 1. Generate report data
            await generateCustomReport(schedule.reportType, [], schedule.filters);

            // 2. Simulate PDF/CSV generation & Email delivery
            await simulateEmailDelivery(schedule);

            // 3. Update next run time
            const nextRun = calculateNextRun(schedule.frequency, now);
            await prisma.reportSchedule.update({
                where: { id: schedule.id },
                data: {
                    lastRun: now,
                    nextRun: nextRun
                }
            });
        } catch (error) {
            console.error(`[ReportingEngine] Failed to process report ${schedule.id}:`, error);
        }
    }
}

async function simulateEmailDelivery(schedule: any) {
    console.log(`[ReportingEngine] Sending report "${schedule.name}" to: ${schedule.recipients.join(', ')}`);
    // In production, use nodemailer or a service like SendGrid
    return Promise.resolve();
}

function calculateNextRun(frequency: string, lastRun: Date): Date {
    const next = new Date(lastRun);
    if (frequency === 'DAILY') {
        next.setDate(next.getDate() + 1);
    } else if (frequency === 'WEEKLY') {
        next.setDate(next.getDate() + 7);
    } else {
        next.setMonth(next.getMonth() + 1);
    }
    return next;
}

// --- Export Utility ---
export function exportToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header])).join(','));
    return [headers.join(','), ...rows].join('\n');
}
