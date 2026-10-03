import { prisma } from '../../prisma/client';
import { StageName } from '@prisma/client';

/**
 * Analyze cycle time for a production batch
 */
export async function analyzeCycleTime(batchId: string) {
    const batch = await prisma.productionBatch.findUnique({
        where: { id: batchId },
        include: {
            stages: {
                where: {
                    endTime: { not: null },
                },
                orderBy: {
                    startTime: 'asc',
                },
            },
        },
    });

    if (!batch) {
        throw new Error('Batch not found');
    }

    // Stage target cycle times (in minutes)
    const stageTargets: Record<string, number> = {
        MIXING: 30,
        CARDING: 45,
        DRAWING: 40,
        COMBING: 50,
        SIMPLEX: 40,
        SPINNING: 120,
        WINDING: 60,
        REELING: 45,
        BUNDLING: 30,
        COMPLETED: 0,
        PLANNED: 0,
    };

    const analyses: any[] = [];

    for (const stage of batch.stages) {
        if (!stage.endTime) continue;

        const actualCycleTime = Math.floor(
            (stage.endTime.getTime() - stage.startTime.getTime()) / (1000 * 60)
        );
        const targetCycleTime = stageTargets[stage.stageName] || 60;
        const variance = actualCycleTime - targetCycleTime;
        const isBottleneck = variance > (targetCycleTime * 0.2); // More than 20% over target

        const analysis = await prisma.cycleTimeAnalysis.create({
            data: {
                batchId,
                stageName: stage.stageName,
                targetCycleTime,
                actualCycleTime,
                variance,
                isBottleneck,
                improvementNote: isBottleneck
                    ? `Stage is ${variance} minutes over target. Investigation recommended.`
                    : null,
            },
        });

        analyses.push(analysis);
    }

    return analyses;
}

/**
 * Identify bottlenecks across all batches
 */
export async function identifyBottlenecks() {
    const analyses = await prisma.cycleTimeAnalysis.findMany({
        where: {
            isBottleneck: true,
        },
        include: {
            batch: {
                select: {
                    batchNumber: true,
                    currentStage: true,
                    status: true,
                },
            },
        },
        orderBy: {
            variance: 'desc',
        },
        take: 20,
    });

    // Group by stage to find systematic bottlenecks
    const bottlenecksByStage: Record<string, any[]> = {};
    for (const analysis of analyses) {
        const stageName = analysis.stageName;
        if (!bottlenecksByStage[stageName]) {
            bottlenecksByStage[stageName] = [];
        }
        bottlenecksByStage[stageName].push(analysis);
    }

    return {
        allBottlenecks: analyses,
        byStage: bottlenecksByStage,
        summary: Object.entries(bottlenecksByStage).map(([stage, items]) => ({
            stage,
            count: items.length,
            avgVariance: items.reduce((sum, item) => sum + item.variance, 0) / items.length,
        })),
    };
}

/**
 * Compare target vs actual for a batch
 */
export async function compareTargetVsActual(batchId: string) {
    const analyses = await prisma.cycleTimeAnalysis.findMany({
        where: { batchId },
        orderBy: { analyzedAt: 'desc' },
    });

    const totalTarget = analyses.reduce((sum, a) => sum + a.targetCycleTime, 0);
    const totalActual = analyses.reduce((sum, a) => sum + a.actualCycleTime, 0);
    const totalVariance = totalActual - totalTarget;

    const efficiency = totalTarget > 0 ? (totalTarget / totalActual) * 100 : 0;

    return {
        analyses,
        summary: {
            totalTargetTime: totalTarget,
            totalActualTime: totalActual,
            totalVariance,
            efficiencyPercentage: Math.min(efficiency, 100),
            status: efficiency >= 100 ? 'ON_TARGET' : efficiency >= 80 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT',
        },
    };
}

/**
 * Get cycle time trends
 */
export async function getCycleTimeTrends(stageName?: StageName) {
    const where = stageName ? { stageName } : {};

    return await prisma.cycleTimeAnalysis.findMany({
        where,
        include: {
            batch: {
                select: {
                    batchNumber: true,
                },
            },
        },
        orderBy: {
            analyzedAt: 'asc',
        },
        take: 50,
    });
}
