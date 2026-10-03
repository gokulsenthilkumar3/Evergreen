import { prisma } from '../prisma/client';

export enum AuditAction {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    LOGOUT = 'LOGOUT',
    MFA_ENABLED = 'MFA_ENABLED',
    MFA_DISABLED = 'MFA_DISABLED',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE',
    IP_WHITELIST_UPDATE = 'IP_WHITELIST_UPDATE',
    DEVICE_REVOKED = 'DEVICE_REVOKED',
    ACCESS_DENIED = 'ACCESS_DENIED',
    SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
    DATA_EXPORT = 'DATA_EXPORT',
    ACCOUNT_DELETED = 'ACCOUNT_DELETED',
}

interface AuditLogOptions {
    userId?: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    ip?: string;
    userAgent?: string;
}

export async function recordAuditLog(
    action: AuditAction | string,
    options: AuditLogOptions = {}
) {
    try {
        await prisma.auditLog.create({
            data: {
                action: action.toString(),
                actorId: options.userId,
                entityType: options.entityType,
                entityId: options.entityId,
                metadata: options.metadata,
                ip: options.ip,
                userAgent: options.userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to record audit log:', error);
        // We don't want to throw here and break the main flow if audit logging fails,
        // but in a strict compliance environment we might.
    }
}
