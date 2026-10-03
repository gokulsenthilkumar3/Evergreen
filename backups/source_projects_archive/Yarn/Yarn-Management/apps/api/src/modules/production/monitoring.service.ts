import { prisma } from '../../prisma/client';
import { BatchStatus, StageName } from '@prisma/client';
import { recordAuditLog } from '../../utils/audit';

/**
 * Update production batch status and progress
 */
export async function updateBatchProgress(
    batchId: string,
    userId: string,
    data: {
        status?: BatchStatus;
        currentStage?: StageName;
        currentStageProgress?: number;
        machineId?: string;
        operatorId?: string;
        notes?: string;
    }
) {
    const existingBatch = await prisma.productionBatch.findUnique({
        where: { id: batchId },
    });

    if (!existingBatch) {
        throw new Error('Batch not found');
    }

    // Validate progress
    if (data.currentStageProgress !== undefined) {
        if (data.currentStageProgress < 0 || data.currentStageProgress > 100) {
            throw new Error('Progress must be between 0 and 100');
        }
    }

    const updatedBatch = await prisma.productionBatch.update({
        where: { id: batchId },
        data: {
            status: data.status,
            currentStage: data.currentStage,
            currentStageProgress: data.currentStageProgress,
            machineId: data.machineId,
            operatorId: data.operatorId,
            updatedAt: new Date(),
        },
        include: {
            machine: { select: { name: true } },
            operator: { select: { name: true } },
        },
    });

    // Log audit
    await recordAuditLog('production.batch.update', {
        userId,
        entityType: 'ProductionBatch',
        entityId: batchId,
        metadata: {
            oldStatus: existingBatch.status,
            newStatus: data.status,
            progress: data.currentStageProgress,
        },
    });

    return updatedBatch;
}

/**
 * Get live dashboard data
 * Returns active batches with machine and operator info
 */
export async function getLiveProductionData() {
    const activeBatches = await prisma.productionBatch.findMany({
        where: {
            status: { in: ['IN_PROGRESS', 'PENDING', 'SCHEDULED'] },
        },
        include: {
            machine: { select: { id: true, name: true, code: true, status: true } },
            operator: { select: { id: true, name: true } },
            rawMaterial: { select: { materialType: true, batchNo: true } },
            alerts: {
                where: { resolvedAt: null }, // Only active alerts
                select: { id: true, alertType: true, severity: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });

    // Calculate generic OEE/Efficiency metrics (mock logic for now as we lack sensors)
    const metrics = activeBatches.reduce(
        (acc, batch) => {
            if (batch.status === 'IN_PROGRESS') acc.activeCount++;
            if (batch.alerts.length > 0) acc.alertCount++;
            return acc;
        },
        { activeCount: 0, alertCount: 0, totalCount: activeBatches.length }
    );

    return {
        batches: activeBatches,
        metrics,
    };
}

/**
 * Get machine status overview
 */
export async function getMachineStatusOverview() {
    const machines = await prisma.machine.findMany({
        include: {
            batches: {
                where: { status: 'IN_PROGRESS' },
                select: { id: true, batchNumber: true, currentStageProgress: true },
                take: 1,
            },
            _count: {
                select: {
                    downtimeLogs: {
                        where: { endTime: null }, // Active downtime
                    },
                },
            },
        },
    });

    return machines.map((machine) => ({
        id: machine.id,
        name: machine.name,
        code: machine.code,
        status: machine.status,
        currentBatch: machine.batches[0] || null,
        isDown: machine._count.downtimeLogs > 0,
    }));
}
