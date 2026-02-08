import { Injectable } from '@nestjs/common';

export interface AuditLog {
    id: string;
    timestamp: Date;
    userId?: string;
    action: string;
    resource: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class AuditService {
    private logs: AuditLog[] = [];

    log(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
        const auditLog: AuditLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            ...entry,
        };

        this.logs.push(auditLog);

        // In production, this would write to database
        console.log(`[AUDIT] ${auditLog.action} on ${auditLog.resource} by ${auditLog.userId || 'anonymous'}`);

        return auditLog;
    }

    getLogs(filters?: { userId?: string; resource?: string; startDate?: Date; endDate?: Date }) {
        let filteredLogs = [...this.logs];

        if (filters?.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
        }

        if (filters?.resource) {
            filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
        }

        if (filters?.startDate) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
        }

        if (filters?.endDate) {
            filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
        }

        return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    clearOldLogs(daysToKeep: number = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const initialCount = this.logs.length;
        this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
        const removedCount = initialCount - this.logs.length;

        console.log(`[AUDIT] Cleaned up ${removedCount} old audit logs (keeping ${daysToKeep} days)`);

        return { removed: removedCount, remaining: this.logs.length };
    }
}
