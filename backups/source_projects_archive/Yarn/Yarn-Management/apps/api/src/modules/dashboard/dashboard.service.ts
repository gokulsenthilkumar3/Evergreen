import { prisma } from '../../prisma/client';
import * as billingService from '../billing/billing.service';

// Production Stats
export async function getProductionStats() {
    const activeBatches = await prisma.productionBatch.count({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
    });

    // Stage distribution
    const stageDistribution = await prisma.productionBatch.groupBy({
        by: ['currentStage'],
        where: {
            status: 'IN_PROGRESS',
        },
        _count: true,
    });

    // Active operators (assuming we track this in production stages)
    const activeOperators = await prisma.productionStage.findMany({
        where: {
            status: 'IN_PROGRESS',
            operatorName: { not: null },
        },
        distinct: ['operatorName'],
        select: { operatorName: true },
    });

    // Today's completion rate
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await prisma.productionBatch.count({
        where: {
            status: 'COMPLETED',
            endDate: { gte: today },
        },
    });

    const plannedToday = await prisma.productionBatch.count({
        where: {
            startDate: { gte: today },
        },
    });

    return {
        activeBatches,
        stageDistribution: stageDistribution.map((s: any) => ({
            stage: s.currentStage,
            count: s._count,
        })),
        activeOperators: activeOperators.length,
        completionRate: plannedToday > 0 ? Math.round((completedToday / plannedToday) * 100) : 0,
    };
}

// Financial Summary
export async function getFinancialSummary() {
    const invoices = await prisma.invoice.findMany({
        orderBy: { date: 'desc' },
    });

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const revenue = invoices
            .filter((inv: any) => inv.date >= monthStart && inv.date < monthEnd)
            .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);

        monthlyRevenue.push({
            month: monthStart.toLocaleString('default', { month: 'short' }),
            revenue: revenue.toFixed(2),
        });
    }

    const outstandingTotal = invoices
        .filter((inv: any) => inv.status === 'PENDING' || inv.status === 'OVERDUE')
        .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);

    const paidCount = invoices.filter((inv: any) => inv.status === 'PAID').length;
    const collectionRate = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0;
    const overdueCount = invoices.filter((inv: any) => inv.status === 'OVERDUE').length;

    return {
        monthlyRevenue,
        outstandingTotal,
        collectionRate,
        overdueCount,
    };
}

// Inventory Health
export async function getInventoryHealth() {
    const lowStockThreshold = 100;
    const highStockThreshold = 1000;

    const lowStockItems = await prisma.rawMaterial.count({
        where: {
            quantity: { lt: lowStockThreshold },
            status: 'IN_STOCK',
        },
    });

    const overstockItems = await prisma.rawMaterial.count({
        where: {
            quantity: { gt: highStockThreshold },
            status: 'IN_STOCK',
        },
    });

    // Total inventory value
    const allMaterials = await prisma.rawMaterial.findMany({
        where: { status: 'IN_STOCK' },
        select: { totalCost: true },
    });

    const totalValue = allMaterials.reduce((sum: number, item: any) => sum + Number(item.totalCost), 0);

    // Stock turnover ratio (placeholder calculation)
    const turnoverRatio = 4.5; // Replace with actual calculation

    return {
        lowStockItems,
        overstockItems,
        totalValue: totalValue.toFixed(2),
        turnoverRatio,
    };
}

// Supplier Performance Summary
export async function getSupplierPerformance() {
    // Get top 5 suppliers by quality
    const topSuppliers = await prisma.supplier.findMany({
        include: {
            performance: {
                select: {
                    avgQualityRating: true,
                    onTimeDeliveryPercent: true,
                    riskLevel: true,
                },
            },
        },
        take: 5,
        orderBy: {
            performance: {
                avgQualityRating: 'desc',
            },
        },
    });

    // Risk level distribution
    const riskDistribution = await prisma.supplierPerformance.groupBy({
        by: ['riskLevel'],
        _count: true,
    });

    return {
        topSuppliers: topSuppliers.map((s: any) => ({
            name: s.name,
            qualityRating: Number(s.performance?.avgQualityRating || 0).toFixed(2),
            deliveryPerformance: Number(s.performance?.onTimeDeliveryPercent || 0).toFixed(1),
            riskLevel: s.performance?.riskLevel || 'N/A',
        })),
        riskDistribution: riskDistribution.map((r: any) => ({
            level: r.riskLevel || 'Unknown',
            count: r._count,
        })),
    };
}

// Production Efficiency (for charts) - OPTIMIZED
export async function getProductionEfficiency(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Fetch all data in two batch queries instead of 2*days queries
    const [allBatches, completedBatches] = await Promise.all([
        prisma.productionBatch.findMany({
            where: {
                startDate: { gte: startDate },
            },
            select: { startDate: true },
        }),
        prisma.productionBatch.findMany({
            where: {
                status: 'COMPLETED',
                endDate: { gte: startDate },
            },
            select: { endDate: true },
        }),
    ]);

    // Group by date in memory
    const plannedByDate: Record<string, number> = {};
    const actualByDate: Record<string, number> = {};

    allBatches.forEach((b: any) => {
        if (b.startDate) {
            const dateStr = b.startDate.toISOString().split('T')[0];
            plannedByDate[dateStr] = (plannedByDate[dateStr] || 0) + 1;
        }
    });

    completedBatches.forEach((b: any) => {
        if (b.endDate) {
            const dateStr = b.endDate.toISOString().split('T')[0];
            actualByDate[dateStr] = (actualByDate[dateStr] || 0) + 1;
        }
    });

    // Generate result array
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];

        const planned = plannedByDate[dateStr] || 0;
        const actual = actualByDate[dateStr] || 0;

        data.push({
            date: dateStr,
            planned,
            actual,
            efficiency: planned > 0 ? Math.round((actual / planned) * 100) : 0,
        });
    }

    return data;
}


// Wastage Analysis
export async function getWastageAnalysis() {
    // By stage
    const byStage = await prisma.wastageLog.groupBy({
        by: ['stage'],
        _sum: {
            quantity: true,
        },
    });

    // By waste type
    const byType = await prisma.wastageLog.groupBy({
        by: ['wasteType'],
        _sum: {
            quantity: true,
        },
    });

    // Trends over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await prisma.wastageLog.findMany({
        where: {
            loggedAt: { gte: thirtyDaysAgo },
        },
        select: {
            loggedAt: true,
            quantity: true,
        },
        orderBy: {
            loggedAt: 'asc',
        },
    });

    return {
        byStage: byStage.map((s: any) => ({
            stage: s.stage,
            quantity: Number(s._sum.quantity || 0).toFixed(2),
        })),
        byType: byType.map((t: any) => ({
            type: t.wasteType,
            quantity: Number(t._sum.quantity || 0).toFixed(2),
        })),
        trends: trends.map((t: any) => ({
            date: t.loggedAt.toISOString().split('T')[0],
            quantity: Number(t.quantity).toFixed(2),
        })),
    };
}

// Quality Metrics - Grade Distribution (Donut Chart)
export async function getQualityGradeDistribution() {
    const gradeDistribution = await prisma.finishedGood.groupBy({
        by: ['qualityGrade'],
        _count: true,
        _sum: {
            producedQuantity: true,
        },
    });

    // Calculate totals for percentages
    const totalCount = gradeDistribution.reduce((sum: number, g: any) => sum + g._count, 0);
    const totalQuantity = gradeDistribution.reduce((sum: number, g: any) => sum + Number(g._sum.producedQuantity || 0), 0);

    return {
        distribution: gradeDistribution.map((g: any) => ({
            grade: g.qualityGrade || 'Ungraded',
            count: g._count,
            quantity: Number(g._sum.producedQuantity || 0).toFixed(2),
            percentage: totalCount > 0 ? Math.round((g._count / totalCount) * 100) : 0,
        })),
        summary: {
            totalBatches: totalCount,
            totalQuantity: totalQuantity.toFixed(2),
            gradeAPercentage: totalCount > 0
                ? Math.round((gradeDistribution.find((g: any) => g.qualityGrade === 'A')?._count || 0) / totalCount * 100)
                : 0,
        },
    };
}

// Quality Metrics - Defect Rate Trends (Line Chart) - OPTIMIZED
export async function getDefectRateTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Single batch query instead of N queries
    const materials = await prisma.rawMaterial.findMany({
        where: {
            receivedDate: { gte: startDate },
        },
        select: {
            qualityScore: true,
            receivedDate: true,
        },
    });

    // Group by date in memory
    const byDate: Record<string, { total: number; count: number }> = {};

    materials.forEach((m: any) => {
        const dateStr = m.receivedDate.toISOString().split('T')[0];
        if (!byDate[dateStr]) {
            byDate[dateStr] = { total: 0, count: 0 };
        }
        byDate[dateStr].total += Number(m.qualityScore);
        byDate[dateStr].count += 1;
    });

    // Generate result array
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];

        const dayData = byDate[dateStr];
        const avgScore = dayData ? dayData.total / dayData.count : null;
        const defectRate = avgScore !== null ? 100 - avgScore : null;

        data.push({
            date: dateStr,
            avgQualityScore: avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
            defectRate: defectRate !== null ? Math.round(defectRate * 10) / 10 : null,
            sampleCount: dayData?.count || 0,
        });
    }

    // Filter out days with no data for cleaner charts
    const filteredData = data.filter(d => d.sampleCount > 0);

    // Calculate overall stats
    const validScores = data.filter(d => d.avgQualityScore !== null);
    const overallAvg = validScores.length > 0
        ? validScores.reduce((sum, d) => sum + (d.avgQualityScore || 0), 0) / validScores.length
        : 0;

    return {
        trends: filteredData,
        summary: {
            averageQualityScore: Math.round(overallAvg * 10) / 10,
            averageDefectRate: Math.round((100 - overallAvg) * 10) / 10,
            totalSamples: data.reduce((sum, d) => sum + d.sampleCount, 0),
        },
    };
}


// Quality Metrics - Quality Score Heatmap
export async function getQualityScoreHeatmap() {
    // Get quality scores grouped by material type for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const materials = await prisma.rawMaterial.findMany({
        where: {
            receivedDate: { gte: sixMonthsAgo },
        },
        select: {
            materialType: true,
            qualityScore: true,
            receivedDate: true,
        },
    });

    // Group by material type and month
    const heatmapData: Record<string, Record<string, { total: number; count: number }>> = {};
    const months: string[] = [];

    // Generate month labels
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        months.push(monthLabel);
    }

    // Process materials
    materials.forEach((m: any) => {
        const monthLabel = m.receivedDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });

        if (!heatmapData[m.materialType]) {
            heatmapData[m.materialType] = {};
        }

        if (!heatmapData[m.materialType][monthLabel]) {
            heatmapData[m.materialType][monthLabel] = { total: 0, count: 0 };
        }

        heatmapData[m.materialType][monthLabel].total += Number(m.qualityScore);
        heatmapData[m.materialType][monthLabel].count += 1;
    });

    // Convert to array format for frontend
    const materialTypes = Object.keys(heatmapData);
    const heatmap = materialTypes.map((materialType) => {
        const row: any = { materialType };
        months.forEach((month) => {
            const cell = heatmapData[materialType][month];
            row[month] = cell ? Math.round(cell.total / cell.count) : null;
        });
        return row;
    });

    return {
        months,
        materialTypes,
        heatmap,
    };
}

// Combined Quality Metrics endpoint
export async function getQualityMetrics(days: number = 30) {
    const [gradeDistribution, defectTrends, heatmap] = await Promise.all([
        getQualityGradeDistribution(),
        getDefectRateTrends(days),
        getQualityScoreHeatmap(),
    ]);

    return {
        gradeDistribution,
        defectTrends,
        heatmap,
    };
}

// Financial Analytics - Revenue vs Cost Analysis - OPTIMIZED
export async function getRevenueVsCostAnalysis(months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Batch queries - just 2 queries instead of 3*months
    const [materials, finishedGoods] = await Promise.all([
        prisma.rawMaterial.findMany({
            where: { receivedDate: { gte: startDate } },
            select: { totalCost: true, quantity: true, receivedDate: true },
        }),
        prisma.finishedGood.findMany({
            where: { packingDate: { gte: startDate } },
            select: { producedQuantity: true, packingDate: true },
        }),
    ]);

    // Group by month in memory
    const costByMonth: Record<string, { cost: number; qty: number }> = {};
    const productionByMonth: Record<string, number> = {};

    materials.forEach((m: any) => {
        const monthLabel = m.receivedDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        if (!costByMonth[monthLabel]) {
            costByMonth[monthLabel] = { cost: 0, qty: 0 };
        }
        costByMonth[monthLabel].cost += Number(m.totalCost);
        costByMonth[monthLabel].qty += Number(m.quantity);
    });

    finishedGoods.forEach((fg: any) => {
        const monthLabel = fg.packingDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        productionByMonth[monthLabel] = (productionByMonth[monthLabel] || 0) + Number(fg.producedQuantity);
    });

    // Generate result array
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthLabel = monthDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });

        const costs = costByMonth[monthLabel] || { cost: 0, qty: 0 };
        const produced = productionByMonth[monthLabel] || 0;

        const avgCostPerUnit = costs.qty > 0 ? costs.cost / costs.qty : 0;
        const revenue = produced * avgCostPerUnit * 2.5;

        data.push({
            month: monthLabel,
            revenue: Math.round(revenue),
            cost: Math.round(costs.cost),
            profit: Math.round(revenue - costs.cost),
        });
    }

    // Calculate summary stats
    const totalRevenue = data.reduce((sum: number, d: any) => sum + d.revenue, 0);
    const totalCost = data.reduce((sum: number, d: any) => sum + d.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const avgMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    return {
        monthly: data,
        summary: {
            totalRevenue,
            totalCost,
            totalProfit,
            averageProfitMargin: avgMargin,
        },
    };
}

// Financial Analytics - Profit Margin Trends - OPTIMIZED
export async function getProfitMarginTrends(months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Batch queries
    const [materials, finishedGoods] = await Promise.all([
        prisma.rawMaterial.findMany({
            where: { receivedDate: { gte: startDate } },
            select: { totalCost: true, quantity: true, receivedDate: true },
        }),
        prisma.finishedGood.findMany({
            where: { packingDate: { gte: startDate } },
            select: { producedQuantity: true, packingDate: true },
        }),
    ]);

    // Group by month in memory
    const dataByMonth: Record<string, { cost: number; qty: number; produced: number }> = {};

    materials.forEach((m: any) => {
        const monthLabel = m.receivedDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        if (!dataByMonth[monthLabel]) {
            dataByMonth[monthLabel] = { cost: 0, qty: 0, produced: 0 };
        }
        dataByMonth[monthLabel].cost += Number(m.totalCost);
        dataByMonth[monthLabel].qty += Number(m.quantity);
    });

    finishedGoods.forEach((fg: any) => {
        const monthLabel = fg.packingDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        if (!dataByMonth[monthLabel]) {
            dataByMonth[monthLabel] = { cost: 0, qty: 0, produced: 0 };
        }
        dataByMonth[monthLabel].produced += Number(fg.producedQuantity);
    });

    // Generate result array
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthLabel = monthDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });

        const monthData = dataByMonth[monthLabel] || { cost: 0, qty: 0, produced: 0 };
        const avgCostPerUnit = monthData.qty > 0 ? monthData.cost / monthData.qty : 0;
        const revenue = monthData.produced * avgCostPerUnit * 2.5;
        const profit = revenue - monthData.cost;
        const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
        const grossMargin = revenue > 0 ? Math.round(((revenue - monthData.cost) / revenue) * 100) : 0;

        data.push({
            month: monthLabel,
            profitMargin,
            grossMargin,
            revenue: Math.round(revenue),
            cost: Math.round(monthData.cost),
        });
    }

    // Calculate trend (change from first to last month)
    const validData = data.filter(d => d.revenue > 0);
    const trend = validData.length >= 2
        ? validData[validData.length - 1].profitMargin - validData[0].profitMargin
        : 0;

    // Average margin
    const avgMargin = validData.length > 0
        ? Math.round(validData.reduce((sum, d) => sum + d.profitMargin, 0) / validData.length)
        : 0;

    return {
        trends: data,
        summary: {
            averageProfitMargin: avgMargin,
            trend: trend > 0 ? 'UP' : trend < 0 ? 'DOWN' : 'STABLE',
            trendValue: trend,
            monthsAnalyzed: data.length,
        },
    };
}


// Financial Analytics - Customer Payment Behavior
export async function getCustomerPaymentBehavior() {
    // Get invoices from shared service
    const invoices = await billingService.getInvoices();

    // 1. Calculate Average Days to Pay (Simulated based on status/random for this mock data)
    // In real app, we would use paymentDate - invoiceDate
    const paymentTrends = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });

        // Simulate a trend: improved payment speed over time
        // Random base between 25-45 days, improved by current index
        const avgDays = Math.round(35 + (Math.random() * 10 - 5) - (i * 1.5));

        paymentTrends.push({
            month: monthLabel,
            avgDaysToPay: avgDays,
            standardTerms: 30, // Standard Net 30
        });
    }

    // 2. Payment Status Distribution (On Time vs Late vs Very Late)
    // Logic: 
    // On Time: < 30 days
    // Late: 31-60 days
    // Very Late: > 60 days (or Overdue)

    // We'll simulate this distribution based on our mock invoices
    let onTime = 0;
    let late = 0;
    let veryLate = 0;

    invoices.forEach((inv: any) => {
        if (inv.status === 'PAID') {
            // Randomly assign to a bucket for simulation
            const r = Math.random();
            if (r > 0.3) onTime++;
            else if (r > 0.1) late++;
            else veryLate++;
        } else if (inv.status === 'OVERDUE') {
            veryLate++;
        }
    });

    const total = onTime + late + veryLate;
    const distribution = [
        { name: 'On Time (<30 Days)', value: onTime, color: '#10b981' },
        { name: 'Late (31-60 Days)', value: late, color: '#f59e0b' },
        { name: 'Very Late (>60 Days)', value: veryLate, color: '#ef4444' },
    ];

    // Summary text
    const onTimePercentage = total > 0 ? Math.round((onTime / total) * 100) : 0;
    const avgCollectionPeriod = Math.round(paymentTrends.reduce((sum, t) => sum + t.avgDaysToPay, 0) / paymentTrends.length);

    return {
        trends: paymentTrends,
        distribution,
        summary: {
            onTimePercentage,
            avgCollectionPeriod,
            totalProcessed: total
        }
    };
}

// Combined Financial Analytics endpoint
export async function getFinancialAnalytics() {
    const [revenueVsCost, profitMargins, paymentBehavior] = await Promise.all([
        getRevenueVsCostAnalysis(6),
        getProfitMarginTrends(12),
        getCustomerPaymentBehavior(),
    ]);

    return {
        revenueVsCost,
        profitMargins,
        paymentBehavior,
    };
}

