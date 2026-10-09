import { prisma } from '../../prisma/client';

/**
 * Analyze material costs and identify optimization opportunities
 */
export async function analyzeMaterialCosts(materialType?: string) {
    const where = materialType ? { materialType } : {};

    const materials = await prisma.rawMaterial.findMany({
        where,
        select: {
            materialType: true,
            costPerUnit: true,
            receivedDate: true,
            supplierId: true,
            supplier: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            receivedDate: 'desc',
        },
    });

    // Group by material type
    const byType: Record<string, any[]> = {};
    materials.forEach((m) => {
        if (!byType[m.materialType]) {
            byType[m.materialType] = [];
        }
        byType[m.materialType].push(m);
    });

    const analyses: any[] = [];

    for (const [type, items] of Object.entries(byType)) {
        const costs = items.map((i) => Number(i.costPerUnit));
        const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
        const minCost = Math.min(...costs);
        const maxCost = Math.max(...costs);
        const costVariance = maxCost - minCost;

        // Calculate trend (last 10 vs previous 10)
        const recent = items.slice(0, 10).map((i) => Number(i.costPerUnit));
        const previous = items.slice(10, 20).map((i) => Number(i.costPerUnit));

        let trendDirection = 'STABLE';
        if (recent.length > 0 && previous.length > 0) {
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
            const change = ((recentAvg - previousAvg) / previousAvg) * 100;

            if (change > 5) trendDirection = 'INCREASING';
            else if (change < -5) trendDirection = 'DECREASING';
        }

        // Price volatility (coefficient of variation)
        const stdDev = Math.sqrt(
            costs.reduce((sq, n) => sq + Math.pow(n - avgCost, 2), 0) / costs.length
        );
        const priceVolatility = (stdDev / avgCost) * 100;

        // Potential savings if switching to lowest cost supplier
        const totalQuantity = items.reduce((sum, i) => sum + 1, 0);
        const potentialSavings = (avgCost - minCost) * totalQuantity;

        // Generate recommendations
        const recommendations: string[] = [];
        if (priceVolatility > 20) {
            recommendations.push(`High price volatility detected (${priceVolatility.toFixed(1)}%). Consider negotiating long-term contracts.`);
        }
        if (potentialSavings > 1000) {
            recommendations.push(`Potential savings of ₹${potentialSavings.toFixed(2)} by optimizing supplier selection.`);
        }
        if (trendDirection === 'INCREASING') {
            recommendations.push('Costs are trending upward. Review supplier contracts and consider bulk purchasing.');
        }
        if (costVariance > avgCost * 0.3) {
            recommendations.push('Significant cost variance between suppliers. Consolidate purchases with best-priced suppliers.');
        }

        // Save analysis
        const analysis = await prisma.materialCostAnalysis.create({
            data: {
                materialType: type,
                averageCost: avgCost,
                minCost,
                maxCost,
                costVariance,
                trendDirection,
                priceVolatility,
                potentialSavings: potentialSavings > 0 ? potentialSavings : null,
                recommendations: recommendations.join('\n'),
                analyzedBy: 'SYSTEM',
            },
        });

        analyses.push(analysis);
    }

    return analyses;
}

/**
 * Get price trends for a material type
 */
export async function getPriceTrends(materialType: string, days: number = 90) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const materials = await prisma.rawMaterial.findMany({
        where: {
            materialType,
            receivedDate: { gte: since },
        },
        select: {
            costPerUnit: true,
            receivedDate: true,
            supplier: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            receivedDate: 'asc',
        },
    });

    return materials.map((m) => ({
        date: m.receivedDate,
        cost: Number(m.costPerUnit),
        supplier: m.supplier.name,
    }));
}

/**
 * Compare supplier prices for a material type
 */
export async function compareSupplierPrices(materialType: string) {
    const materials = await prisma.rawMaterial.findMany({
        where: { materialType },
        select: {
            costPerUnit: true,
            supplierId: true,
            receivedDate: true,
            supplier: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    // Group by supplier
    const bySupplier: Record<string, any> = {};

    materials.forEach((m) => {
        const supplierId = m.supplier.id;
        if (!bySupplier[supplierId]) {
            bySupplier[supplierId] = {
                supplierId,
                supplierName: m.supplier.name,
                prices: [],
            };
        }
        bySupplier[supplierId].prices.push(Number(m.costPerUnit));
    });

    // Calculate statistics
    return Object.values(bySupplier).map((s: any) => {
        const avgPrice = s.prices.reduce((a: number, b: number) => a + b, 0) / s.prices.length;
        const minPrice = Math.min(...s.prices);
        const maxPrice = Math.max(...s.prices);

        return {
            supplierId: s.supplierId,
            supplierName: s.supplierName,
            avgPrice,
            minPrice,
            maxPrice,
            orderCount: s.prices.length,
        };
    }).sort((a, b) => a.avgPrice - b.avgPrice);
}

/**
 * Get procurement analytics
 */
export async function getProcurementAnalytics() {
    // Total spend by material type
    const spendByType = await prisma.rawMaterial.groupBy({
        by: ['materialType'],
        _sum: {
            totalCost: true,
        },
        _count: {
            id: true,
        },
    });

    // Total spend by supplier
    const spendBySupplier = await prisma.rawMaterial.groupBy({
        by: ['supplierId'],
        _sum: {
            totalCost: true,
        },
        _count: {
            id: true,
        },
    });

    return {
        byMaterialType: spendByType.map((s) => ({
            materialType: s.materialType,
            totalSpend: Number(s._sum.totalCost || 0),
            orderCount: s._count.id,
        })),
        bySupplier: await Promise.all(
            spendBySupplier.map(async (s) => {
                const supplier = await prisma.supplier.findUnique({
                    where: { id: s.supplierId },
                    select: { name: true },
                });
                return {
                    supplierId: s.supplierId,
                    supplierName: supplier?.name || 'Unknown',
                    totalSpend: Number(s._sum.totalCost || 0),
                    orderCount: s._count.id,
                };
            })
        ),
    };
}
