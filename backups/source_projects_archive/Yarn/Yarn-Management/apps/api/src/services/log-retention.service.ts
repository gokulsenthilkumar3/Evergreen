import { prisma } from '../prisma/client';
import { env } from '../config/env';

/**
 * Log Retention Service
 * Handles automated purging of old audit logs based on retention policy
 */

/**
 * Purge audit logs older than retention period
 * @returns Number of logs deleted
 */
export async function purgeOldAuditLogs(): Promise<{ deleted: number; cutoffDate: Date }> {
    const retentionDays = env.AUDIT_LOG_RETENTION_DAYS;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.auditLog.deleteMany({
        where: {
            createdAt: {
                lt: cutoffDate
            }
        }
    });

    console.log(`[Log Retention] Purged ${result.count} audit logs older than ${retentionDays} days`);

    return {
        deleted: result.count,
        cutoffDate
    };
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats() {
    const retentionDays = env.AUDIT_LOG_RETENTION_DAYS;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const [total, expiring, byAction] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({
            where: { createdAt: { lt: cutoffDate } }
        }),
        prisma.auditLog.groupBy({
            by: ['action'],
            _count: { action: true },
            orderBy: { _count: { action: 'desc' } },
            take: 10
        })
    ]);

    // Get date range
    const oldest = await prisma.auditLog.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
    });

    const newest = await prisma.auditLog.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
    });

    return {
        totalLogs: total,
        logsExpiring: expiring,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        dateRange: {
            oldest: oldest?.createdAt?.toISOString() || null,
            newest: newest?.createdAt?.toISOString() || null
        },
        topActions: byAction.map(a => ({
            action: a.action,
            count: a._count.action
        }))
    };
}

/**
 * Purge expired refresh tokens (already handled but good for manual cleanup)
 */
export async function purgeExpiredSessions(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: {
                lt: new Date()
            }
        }
    });

    console.log(`[Session Cleanup] Purged ${result.count} expired sessions`);
    return result.count;
}
