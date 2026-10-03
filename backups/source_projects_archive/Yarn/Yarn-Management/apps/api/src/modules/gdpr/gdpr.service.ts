import { prisma } from '../../prisma/client';
import { recordAuditLog, AuditAction } from '../../utils/audit';
import crypto from 'crypto';

// Current privacy policy version
const CURRENT_PRIVACY_VERSION = '2.0.0';

/**
 * GDPR Service - Handles data export, deletion, and consent management
 */

/**
 * Export all user data (Right to Access - GDPR Article 15)
 */
export async function exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            authProvider: true,
            mfaEnabled: true,
            privacyAcceptedAt: true,
            privacyVersion: true,
            marketingConsent: true,
        }
    });

    if (!user) {
        const err: any = new Error('User not found');
        err.status = 404;
        throw err;
    }

    // Collect related data
    const [notifications, auditLogs, sessions, trustedDevices] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            select: { id: true, type: true, title: true, message: true, read: true, createdAt: true }
        }),
        prisma.auditLog.findMany({
            where: { actorId: userId },
            select: { id: true, action: true, entityType: true, entityId: true, createdAt: true, ip: true },
            orderBy: { createdAt: 'desc' },
            take: 1000 // Limit to last 1000 entries
        }),
        prisma.refreshToken.findMany({
            where: { userId },
            select: { id: true, ipAddress: true, userAgent: true, createdAt: true, lastActive: true }
        }),
        prisma.trustedDevice.findMany({
            where: { userId },
            select: { id: true, name: true, lastUsed: true, createdAt: true }
        })
    ]);

    await recordAuditLog(AuditAction.DATA_EXPORT, {
        userId,
        metadata: { action: 'gdpr_data_export' }
    });

    return {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        user: {
            profile: user,
            notifications,
            auditLogs,
            activeSessions: sessions,
            trustedDevices
        }
    };
}

/**
 * Delete/Anonymize user account (Right to Erasure - GDPR Article 17)
 * We anonymize rather than hard delete to maintain audit trail integrity
 */
export async function deleteUserAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, passwordHash: true }
    });

    if (!user) {
        const err: any = new Error('User not found');
        err.status = 404;
        throw err;
    }

    // Verify password for destructive action
    if (user.passwordHash) {
        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            const err: any = new Error('Invalid password');
            err.status = 401;
            throw err;
        }
    }

    // Generate anonymized identifiers
    const anonymizedEmail = `deleted_${crypto.createHash('sha256').update(user.email).digest('hex').slice(0, 16)}@deleted.local`;
    const deletedName = 'Deleted User';

    // Start transaction for atomic deletion
    await prisma.$transaction(async (tx) => {
        // Delete associated data that can be removed
        await tx.notification.deleteMany({ where: { userId } });
        await tx.refreshToken.deleteMany({ where: { userId } });
        await tx.trustedDevice.deleteMany({ where: { userId } });
        await tx.authenticator.deleteMany({ where: { userId } });

        // Anonymize user record (keep for audit trail integrity)
        await tx.user.update({
            where: { id: userId },
            data: {
                email: anonymizedEmail,
                name: deletedName,
                passwordHash: null,
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: [],
                status: 'DISABLED',
                allowedIPs: [],
                marketingConsent: false,
            }
        });
    });

    await recordAuditLog(AuditAction.ACCOUNT_DELETED, {
        userId,
        metadata: {
            action: 'gdpr_account_deletion',
            originalEmail: '[REDACTED]',
            anonymizedEmail
        }
    });

    return { success: true, message: 'Account has been anonymized and associated data deleted.' };
}

/**
 * Update user consent preferences
 */
export async function updateConsent(
    userId: string,
    options: {
        privacyAccepted?: boolean;
        marketingConsent?: boolean;
    }
) {
    const updateData: any = {};

    if (options.privacyAccepted) {
        updateData.privacyAcceptedAt = new Date();
        updateData.privacyVersion = CURRENT_PRIVACY_VERSION;
    }

    if (options.marketingConsent !== undefined) {
        updateData.marketingConsent = options.marketingConsent;
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            privacyAcceptedAt: true,
            privacyVersion: true,
            marketingConsent: true
        }
    });

    await recordAuditLog('CONSENT_UPDATED', {
        userId,
        metadata: {
            privacyAccepted: options.privacyAccepted,
            marketingConsent: options.marketingConsent,
            version: CURRENT_PRIVACY_VERSION
        }
    });

    return user;
}

/**
 * Get current privacy policy info
 */
export function getPrivacyPolicyInfo() {
    return {
        version: CURRENT_PRIVACY_VERSION,
        effectiveDate: '2026-01-01',
        lastUpdated: '2026-01-15',
        summaryChanges: [
            'Added GDPR data export and deletion capabilities',
            'Updated data retention policies',
            'Clarified third-party data sharing practices'
        ]
    };
}

/**
 * Check if user needs to accept updated privacy policy
 */
export async function checkPrivacyConsent(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { privacyVersion: true, privacyAcceptedAt: true }
    });

    if (!user) return { needsConsent: false };

    const needsConsent = !user.privacyVersion || user.privacyVersion !== CURRENT_PRIVACY_VERSION;

    return {
        needsConsent,
        currentVersion: CURRENT_PRIVACY_VERSION,
        userVersion: user.privacyVersion,
        lastAccepted: user.privacyAcceptedAt
    };
}
