import { prisma } from '../../prisma/client';
import { PerformanceMetricType } from '@prisma/client';

interface MetricValue {
    type: PerformanceMetricType;
    value: number;
    weight?: number;
}

/**
 * Calculate overall performance score for a supplier
 * Score is weighted average of all metrics (0-100 scale)
 */
export async function calculatePerformanceScore(supplierId: string): Promise<number> {
    const metrics = await prisma.supplierPerformanceMetric.findMany({
        where: { supplierId },
        orderBy: { recordedAt: 'desc' },
    });

    if (metrics.length === 0) return 0;

    // Group by metric type and take latest value
    const latestMetrics = new Map<PerformanceMetricType, { value: number; weight: number }>();

    for (const metric of metrics) {
        if (!latestMetrics.has(metric.metricType)) {
            latestMetrics.set(metric.metricType, {
                value: metric.value,
                weight: metric.weight,
            });
        }
    }

    // Calculate weighted score
    let totalWeightedScore = 0;
    let totalWeight = 0;

    latestMetrics.forEach(({ value, weight }) => {
        totalWeightedScore += value * weight;
        totalWeight += weight;
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
}

/**
 * Record a performance metric for a supplier
 */
export async function recordPerformanceMetric(
    supplierId: string,
    metricType: PerformanceMetricType,
    value: number,
    weight: number = 1,
    notes?: string
) {
    const metric = await prisma.supplierPerformanceMetric.create({
        data: {
            supplierId,
            metricType,
            value: Math.min(100, Math.max(0, value)), // Clamp to 0-100
            weight,
            notes,
        },
    });

    // Update supplier's overall performance score
    const newScore = await calculatePerformanceScore(supplierId);

    await prisma.supplier.update({
        where: { id: supplierId },
        data: {
            performanceScore: newScore,
            lastPerformanceUpdate: new Date(),
        },
    });

    return metric;
}

/**
 * Get performance trends for a supplier
 */
export async function getPerformanceTrends(
    supplierId: string,
    metricType?: PerformanceMetricType,
    days: number = 90
) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.supplierPerformanceMetric.findMany({
        where: {
            supplierId,
            ...(metricType && { metricType }),
            recordedAt: { gte: since },
        },
        orderBy: { recordedAt: 'asc' },
    });
}

/**
 * Calculate on-time delivery rate from purchase orders
 */
export async function calculateOnTimeDeliveryRate(supplierId: string): Promise<number> {
    const orders = await prisma.purchaseOrder.findMany({
        where: {
            supplierId,
            status: 'COMPLETED',
            expectedDeliveryDate: { not: null },
        },
    });

    if (orders.length === 0) return 100; // No data = perfect score

    const onTimeOrders = orders.filter((order) => {
        if (!order.expectedDeliveryDate || !order.actualDeliveryDate) return false;
        return order.actualDeliveryDate <= order.expectedDeliveryDate;
    });

    return (onTimeOrders.length / orders.length) * 100;
}

/**
 * Calculate quality score from received goods
 */
export async function calculateQualityScore(supplierId: string): Promise<number> {
    const goodsReceipts = await prisma.goodsReceiptNote.findMany({
        where: { supplierId },
        include: { items: true },
    });

    if (goodsReceipts.length === 0) return 100;

    let totalItems = 0;
    let acceptedItems = 0;

    goodsReceipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
            totalItems += item.quantity;
            acceptedItems += item.acceptedQuantity;
        });
    });

    return totalItems > 0 ? (acceptedItems / totalItems) * 100 : 100;
}

/**
 * Auto-calculate and update all performance metrics
 */
export async function updateAllMetrics(supplierId: string) {
    const onTimeRate = await calculateOnTimeDeliveryRate(supplierId);
    const qualityScore = await calculateQualityScore(supplierId);

    await recordPerformanceMetric(supplierId, PerformanceMetricType.ON_TIME_DELIVERY, onTimeRate, 1.5);
    await recordPerformanceMetric(supplierId, PerformanceMetricType.QUALITY_SCORE, qualityScore, 2);

    return {
        onTimeRate,
        qualityScore,
        overallScore: await calculatePerformanceScore(supplierId),
    };
}
