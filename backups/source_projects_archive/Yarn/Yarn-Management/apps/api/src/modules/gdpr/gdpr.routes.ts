import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import {
    exportUserData,
    deleteUserAccount,
    updateConsent,
    getPrivacyPolicyInfo,
    checkPrivacyConsent
} from './gdpr.service';

export const gdprRouter = Router();

/**
 * GET /api/gdpr/export
 * Export all user data (GDPR Right to Access)
 */
gdprRouter.get('/export', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await exportUserData(req.userId!);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="user-data-export-${new Date().toISOString().split('T')[0]}.json"`);

        return res.json(data);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/gdpr/delete-account
 * Request account deletion (GDPR Right to Erasure)
 */
const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required'),
    confirmation: z.literal('DELETE MY ACCOUNT')
});

gdprRouter.post('/delete-account', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password } = deleteAccountSchema.parse(req.body);
        const result = await deleteUserAccount(req.userId!, password);
        return res.json(result);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/gdpr/consent
 * Update privacy consent preferences
 */
const consentSchema = z.object({
    privacyAccepted: z.boolean().optional(),
    marketingConsent: z.boolean().optional()
});

gdprRouter.post('/consent', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const options = consentSchema.parse(req.body);
        const result = await updateConsent(req.userId!, options);
        return res.json(result);
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /api/gdpr/privacy-policy
 * Get current privacy policy information
 */
gdprRouter.get('/privacy-policy', async (_req: Request, res: Response) => {
    return res.json(getPrivacyPolicyInfo());
});

/**
 * GET /api/gdpr/consent-status
 * Check if user needs to accept updated privacy policy
 */
gdprRouter.get('/consent-status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await checkPrivacyConsent(req.userId!);
        return res.json(status);
    } catch (e) {
        return next(e);
    }
});
