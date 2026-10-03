import { prisma } from '../../prisma/client';
import { recordAuditLog } from '../../utils/audit';

/**
 * Create a production alert
 */
export async function createAlert(
    batchId: string,
    userId: string,
    data: {
        alertType: string;
        severity: string;
        message: string;
    }
) {
    const alert = await prisma.productionAlert.create({
        data: {
            batchId,
            alertType: data.alertType,
            severity: data.severity,
            message: data.message,
        },
        include: {
            batch: { select: { batchNumber: true } },
        },
    });

    // Optionally send notification to supervisors (skipping for this iteration)

    await recordAuditLog('production.alert.create', {
        userId,
        entityType: 'ProductionAlert',
        entityId: alert.id,
        metadata: { severity: data.severity, type: data.alertType },
    });

    return alert;
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: string, userId: string) {
    const alert = await prisma.productionAlert.update({
        where: { id: alertId },
        data: {
            resolvedAt: new Date(),
            resolvedBy: userId,
        },
        include: {
            batch: { select: { batchNumber: true } },
        },
    });

    await recordAuditLog('production.alert.resolve', {
        userId,
        entityType: 'ProductionAlert',
        entityId: alertId,
    });

    return alert;
}

/**
 * Get active alerts
 */
export async function getActiveAlerts() {
    return prisma.productionAlert.findMany({
        where: { resolvedAt: null },
        include: {
            batch: {
                select: {
                    id: true,
                    batchNumber: true,
                    machine: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
