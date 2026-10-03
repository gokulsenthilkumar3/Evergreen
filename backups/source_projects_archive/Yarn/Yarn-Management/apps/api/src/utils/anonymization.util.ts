import crypto from 'crypto';

/**
 * Data Anonymization Utility
 * Used for analytics and data that needs to be retained without PII
 */

/**
 * Hash an email address for anonymization
 */
export function anonymizeEmail(email: string): string {
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 16);
}

/**
 * Anonymize a name
 */
export function anonymizeName(name: string | null): string {
    if (!name) return 'Anonymous';
    return `User_${crypto.createHash('sha256').update(name).digest('hex').slice(0, 8)}`;
}

/**
 * Mask a phone number (keep country code and last 2 digits)
 */
export function maskPhoneNumber(phone: string | null): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return '***';
    return cleaned.slice(0, 2) + '*'.repeat(cleaned.length - 4) + cleaned.slice(-2);
}

/**
 * Mask an IP address (keep first octet)
 */
export function maskIpAddress(ip: string | null): string {
    if (!ip) return '';
    const parts = ip.split('.');
    if (parts.length !== 4) return ip.slice(0, 3) + '***'; // IPv6 partial mask
    return `${parts[0]}.***.***.**`;
}

/**
 * Anonymize an object by processing specific fields
 */
export function anonymizeRecord<T extends Record<string, any>>(
    record: T,
    fieldsToAnonymize: {
        emails?: string[];
        names?: string[];
        phones?: string[];
        ips?: string[];
        remove?: string[];
    }
): T {
    const result = { ...record };

    // Hash email fields
    if (fieldsToAnonymize.emails) {
        for (const field of fieldsToAnonymize.emails) {
            if (result[field]) {
                (result as any)[field] = anonymizeEmail(result[field]);
            }
        }
    }

    // Anonymize name fields
    if (fieldsToAnonymize.names) {
        for (const field of fieldsToAnonymize.names) {
            if (result[field]) {
                (result as any)[field] = anonymizeName(result[field]);
            }
        }
    }

    // Mask phone fields
    if (fieldsToAnonymize.phones) {
        for (const field of fieldsToAnonymize.phones) {
            if (result[field]) {
                (result as any)[field] = maskPhoneNumber(result[field]);
            }
        }
    }

    // Mask IP fields
    if (fieldsToAnonymize.ips) {
        for (const field of fieldsToAnonymize.ips) {
            if (result[field]) {
                (result as any)[field] = maskIpAddress(result[field]);
            }
        }
    }

    // Remove sensitive fields entirely
    if (fieldsToAnonymize.remove) {
        for (const field of fieldsToAnonymize.remove) {
            delete (result as any)[field];
        }
    }

    return result;
}

/**
 * Anonymize audit logs for analytics export
 */
export function anonymizeAuditLogForAnalytics(log: {
    id: string;
    action: string;
    actorId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    metadata?: any;
}) {
    return {
        id: log.id,
        action: log.action,
        actorHash: log.actorId ? anonymizeEmail(log.actorId) : null,
        ipMasked: maskIpAddress(log.ip ?? null),
        browserFamily: extractBrowserFamily(log.userAgent ?? null),
        createdAt: log.createdAt,
        // Remove any PII from metadata
        metadataClean: cleanMetadata(log.metadata)
    };
}

/**
 * Extract browser family from user agent (no fingerprinting details)
 */
function extractBrowserFamily(userAgent: string | null | undefined): string {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
}

/**
 * Clean metadata object of PII
 */
function cleanMetadata(metadata: any): any {
    if (!metadata) return null;

    const sensitiveKeys = ['email', 'password', 'token', 'secret', 'phone', 'address', 'ip', 'name'];

    if (typeof metadata === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(metadata)) {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
                cleaned[key] = '[REDACTED]';
            } else if (typeof value === 'object' && value !== null) {
                cleaned[key] = cleanMetadata(value);
            } else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }

    return metadata;
}
