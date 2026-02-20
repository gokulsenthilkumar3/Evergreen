import { Controller, Get, Query } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { CostingService } from '../costing/costing.service';
import { PrismaService } from '../../services/prisma.service';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly inventoryService: InventoryService,
        private readonly costingService: CostingService,
        private readonly prisma: PrismaService
    ) { }

    @Get('summary')
    async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
        const metrics = await this.inventoryService.getDashboardMetrics(from, to);
        const totalCost = await this.costingService.getTotalCost(from, to);

        const periodProduction = (metrics as any).periodProduction || 0;
        const periodWaste = (metrics as any).periodWaste || 0;

        const totalInput = periodProduction + periodWaste;
        const wasteRate = totalInput > 0 ? (periodWaste / totalInput) * 100 : 0;
        const costPerKg = periodProduction > 0 ? totalCost / periodProduction : 0;

        const hasProductionData = periodProduction > 0;
        const hasCottonData = metrics.totalCotton > 0;
        const hasWasteData = periodWaste > 0;
        const hasCostData = totalCost > 0;

        return {
            kpis: [
                {
                    label: 'Period Production',
                    value: hasProductionData ? `${periodProduction.toFixed(0)} kg` : 'No Data',
                    subValue: hasProductionData ? `${metrics.yarnBags} bags + ${metrics.yarnLooseKg?.toFixed(1) || 0} kg loose` : '',
                    color: '#2e7d32',
                    trend: '',
                    comparison: '',
                    hasData: hasProductionData
                },
                {
                    label: 'Cotton Stock',
                    value: hasCottonData ? `${metrics.totalCotton.toFixed(0)} kg` : 'No Data',
                    subValue: hasCottonData ? `≈ ${metrics.cottonBales} bales` : '',
                    color: '#0288d1',
                    trend: '',
                    comparison: '',
                    hasData: hasCottonData
                },
                {
                    label: 'Waste Rate',
                    value: hasWasteData ? `${wasteRate.toFixed(2)}%` : 'No Data',
                    subValue: hasWasteData ? `${periodWaste.toFixed(1)} kg wasted` : '',
                    color: '#d32f2f',
                    trend: '',
                    comparison: '',
                    hasData: hasWasteData
                },
                {
                    label: 'Total Cost',
                    value: hasCostData ? `₹${totalCost.toLocaleString('en-IN')}` : 'No Data',
                    subValue: hasCostData && costPerKg > 0 ? `₹${costPerKg.toFixed(2)} / kg` : '',
                    color: '#ed6c02',
                    trend: '',
                    comparison: '',
                    hasData: hasCostData
                },
            ],
            meta: {
                periodProduction,
                periodWaste,
                totalCost,
                costPerKg,
                totalYarnKg: metrics.totalYarn,
                yarnBags: metrics.yarnBags,
                yarnLooseKg: metrics.yarnLooseKg,
                totalCotton: metrics.totalCotton,
                cottonBales: metrics.cottonBales,
            }
        };
    }

    @Get('charts')
    async getCharts(@Query('from') from?: string, @Query('to') to?: string) {
        // Production trend (last 14 days if no range)
        const endDate = to ? new Date(to) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = from ? new Date(from) : new Date(endDate.getTime() - 13 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);

        const productions = await this.prisma.production.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            orderBy: { date: 'asc' },
            select: {
                date: true,
                totalProduced: true,
                totalWaste: true,
                totalConsumed: true,
            }
        });

        // Cost trend
        const costEntries = await this.prisma.costingEntry.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            orderBy: { date: 'asc' },
            select: { date: true, totalCost: true, category: true }
        });

        // Daily production map
        const prodMap = new Map<string, { produced: number; waste: number; consumed: number }>();
        productions.forEach((p: any) => {
            const day = p.date.toISOString().split('T')[0];
            const prev = prodMap.get(day) || { produced: 0, waste: 0, consumed: 0 };
            prodMap.set(day, {
                produced: prev.produced + (p.totalProduced || 0),
                waste: prev.waste + (p.totalWaste || 0),
                consumed: prev.consumed + (p.totalConsumed || 0),
            });
        });

        // Daily cost map
        const costMap = new Map<string, { total: number; eb: number; employee: number; packaging: number; maintenance: number; expenses: number }>();
        costEntries.forEach((e: any) => {
            const day = e.date.toISOString().split('T')[0];
            const prev = costMap.get(day) || { total: 0, eb: 0, employee: 0, packaging: 0, maintenance: 0, expenses: 0 };
            const cost = e.totalCost || 0;
            prev.total += cost;
            if (e.category === 'EB (Electricity)') prev.eb += cost;
            else if (e.category === 'Employee') prev.employee += cost;
            else if (e.category === 'Packaging') prev.packaging += cost;
            else if (e.category === 'Maintenance') prev.maintenance += cost;
            else prev.expenses += cost;
            costMap.set(day, prev);
        });

        // Generate date range
        const days: string[] = [];
        const cur = new Date(startDate);
        while (cur <= endDate) {
            days.push(cur.toISOString().split('T')[0]);
            cur.setDate(cur.getDate() + 1);
        }

        const productionTrend = days.map(day => ({
            date: day,
            produced: prodMap.get(day)?.produced || 0,
            waste: prodMap.get(day)?.waste || 0,
            consumed: prodMap.get(day)?.consumed || 0,
        }));

        const costTrend = days.map(day => ({
            date: day,
            total: costMap.get(day)?.total || 0,
            eb: costMap.get(day)?.eb || 0,
            employee: costMap.get(day)?.employee || 0,
            packaging: costMap.get(day)?.packaging || 0,
            maintenance: costMap.get(day)?.maintenance || 0,
            expenses: costMap.get(day)?.expenses || 0,
        }));

        // Yarn stock by count
        const yarnStock = await this.inventoryService.getYarnStockByCount();

        // Cost category totals for pie
        const costCategoryTotals = await this.prisma.costingEntry.groupBy({
            by: ['category'],
            _sum: { totalCost: true },
            where: { date: { gte: startDate, lte: endDate } }
        });

        return {
            productionTrend,
            costTrend,
            yarnStockByCount: yarnStock,
            costByCategory: costCategoryTotals.map((c: any) => ({
                name: c.category,
                value: c._sum.totalCost || 0,
            }))
        };
    }

    @Get('recent-activity')
    async getRecentActivity() {
        // Fetch last 8 events across modules
        const [productions, inwards, outwards, invoices] = await Promise.all([
            this.prisma.production.findMany({
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: { id: true, date: true, totalProduced: true, totalConsumed: true, createdBy: true, createdAt: true }
            }),
            this.prisma.inwardBatch.findMany({
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: { id: true, batchId: true, date: true, kg: true, bale: true, supplier: true, createdBy: true, createdAt: true }
            }),
            this.prisma.outward.findMany({
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: { id: true, date: true, totalWeight: true, customerName: true, createdBy: true, createdAt: true }
            }),
            this.prisma.invoice.findMany({
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: { id: true, invoiceNo: true, date: true, total: true, customerName: true, status: true, createdAt: true }
            }).catch(() => []),
        ]);

        const activities = [
            ...productions.map((p: any) => ({
                type: 'production',
                icon: 'factory',
                title: `Production entry`,
                subtitle: `${p.totalProduced?.toFixed(1)} kg produced from ${p.totalConsumed?.toFixed(1)} kg cotton`,
                by: p.createdBy,
                date: p.createdAt,
            })),
            ...inwards.map((i: any) => ({
                type: 'inward',
                icon: 'download',
                title: `Cotton inward: ${i.batchId}`,
                subtitle: `${i.bale} bales / ${i.kg} kg from ${i.supplier}`,
                by: i.createdBy,
                date: i.createdAt,
            })),
            ...outwards.map((o: any) => ({
                type: 'outward',
                icon: 'upload',
                title: `Outward dispatch`,
                subtitle: `${o.totalWeight?.toFixed(1)} kg to ${o.customerName}`,
                by: o.createdBy,
                date: o.createdAt,
            })),
            ...invoices.map((inv: any) => ({
                type: 'billing',
                icon: 'receipt',
                title: `Invoice ${inv.invoiceNo}`,
                subtitle: `₹${inv.total?.toLocaleString('en-IN')} - ${inv.customerName} (${inv.status})`,
                by: '',
                date: inv.createdAt,
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        return activities;
    }
}
