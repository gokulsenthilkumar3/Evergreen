import { Request, Response, NextFunction } from 'express';

const MASKED_FIELDS = [
    'password',
    'token',
    'secret',
    'bankAccountNumber',
    'panNumber',
    'mfaSecret',
    'mfaBackupCodes',
    'otp',
    'cvv',
    'cardNumber'
];

/**
 * Deep clones an object and masks sensitive fields
 */
function maskData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(maskData);
    }

    const masked = { ...data };
    for (const key in masked) {
        if (MASKED_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            masked[key] = '********';
        } else if (typeof masked[key] === 'object') {
            masked[key] = maskData(masked[key]);
        }
    }
    return masked;
}

/**
 * Middleware to log requests with masked sensitive data
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Log request
    const maskedBody = maskData(req.body) || {};
    const maskedQuery = maskData(req.query) || {};

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(maskedBody).length > 0) {
        console.log(`  Body:`, JSON.stringify(maskedBody, null, 2));
    }
    if (Object.keys(maskedQuery).length > 0) {
        console.log(`  Query:`, JSON.stringify(maskedQuery, null, 2));
    }

    // Intercept response to log performance
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });

    next();
}
