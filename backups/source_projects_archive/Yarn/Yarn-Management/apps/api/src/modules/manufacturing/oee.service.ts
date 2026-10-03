import { prisma } from '../../prisma/client';

/**
 * Calculate OEE (Overall Equipment Effectiveness) for a production batch
 * OEE = Availability × Performance × Quality
 */
export async function calculateOEE(batchId: string) {
    const batch = await prisma.productionBatch.findUnique({
        where: { id: batchId },
        include: {
            stages: true,
            wastageLogs: true,
        },
    });

    if (!batch) {
        throw new Error('Batch not found');
    }

    // Calculate time metrics
    const plannedProductionTime = 480; // 8 hours in minutes (default)
    const actualProductionTime = batch.stages.reduce((total, stage) => {
        if (stage.endTime && stage.startTime) {
            return total + Math.floor((stage.endTime.getTime() - stage.startTime.getTime()) / (1000 * 60));
        }
        return total;
    }, 0);

    const downtime = plannedProductionTime - actualProductionTime;

    // Availability = (Actual Production Time / Planned Production Time) × 100
    const availability = actualProductionTime > 0
        ? (actualProductionTime / plannedProductionTime) * 100
        : 0;

    // Performance metrics
    const idealCycleTime = 1; // 1 minute per unit (example)
    const totalPiecesProduced = Number(batch.inputQuantity);
    const actualCycleTime = actualProductionTime > 0
        ? actualProductionTime / totalPiecesProduced
        : 0;

    // Performance = (Ideal Cycle Time / Actual Cycle Time) × 100
    const performance = actualCycleTime > 0
        ? (idealCycleTime / actualCycleTime) * 100
        : 0;

    // Quality metrics
    const totalWastage = batch.wastageLogs.reduce(
        (sum, log) => sum + Number(log.quantity),
        0
    );
    const goodPieces = totalPiecesProduced - totalWastage;
    const defectivePieces = totalWastage;

    // Quality = (Good Pieces / Total Pieces Produced) × 100
    const quality = totalPiecesProduced > 0
        ? (goodPieces / totalPiecesProduced) * 100
        : 0;

    // Overall OEE
    const oee = (availability * performance * quality) / 10000;

    // Save OEE metric
    return await prisma.oEEMetric.create({
        data: {
            batchId,
            availability: Math.min(availability, 100),
            performance: Math.min(performance, 100),
            quality: Math.min(quality, 100),
            oee: Math.min(oee, 100),
            plannedProductionTime,
            actualProductionTime,
            downtime,
            idealCycleTime,
            actualCycleTime: Math.round(actualCycleTime),
            totalPiecesProduced,
            goodPieces: Math.round(goodPieces),
            defectivePieces: Math.round(defectivePieces),
        },
    });
}

/**
 * Get OEE trends for a date range
 */
export async function getOEETrends(startDate: Date, endDate: Date) {
    const metrics = await prisma.oEEMetric.findMany({
        where: {
            calculationDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            batch: {
                select: {
                    batchNumber: true,
                    currentStage: true,
                },
            },
        },
        orderBy: {
            calculationDate: 'asc',
        },
    });

    // Calculate averages
    const avgOEE = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + Number(m.oee), 0) / metrics.length
        : 0;
    const avgAvailability = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + Number(m.availability), 0) / metrics.length
        : 0;
    const avgPerformance = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + Number(m.performance), 0) / metrics.length
        : 0;
    const avgQuality = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + Number(m.quality), 0) / metrics.length
        : 0;

    return {
        metrics,
        averages: {
            oee: avgOEE,
            availability: avgAvailability,
            performance: avgPerformance,
            quality: avgQuality,
        },
    };
}

/**
 * Get OEE benchmark - World class OEE is 85%+
 */
export function getOEEBenchmark(oee: number) {
    if (oee >= 85) return { level: 'WORLD_CLASS', color: 'green' };
    if (oee >= 60) return { level: 'GOOD', color: 'blue' };
    if (oee >= 40) return { level: 'FAIR', color: 'orange' };
    return { level: 'POOR', color: 'red' };
}

/**
 * Get latest OEE for a batch
 */
export async function getLatestOEE(batchId: string) {
    return await prisma.oEEMetric.findFirst({
        where: { batchId },
        orderBy: { calculationDate: 'desc' },
    });
}
