import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import {
    purgeOldAuditLogs,
    getAuditLogStats,
    purgeExpiredSessions
} from '../../services/log-retention.service';

export const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(authenticate);

/**
 * GET /api/admin/logs/stats
 * Get audit log statistics
 */
adminRouter.get('/logs/stats', requirePermission('admin:logs:view'), async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await getAuditLogStats();
        return res.json(stats);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/admin/logs/purge
 * Manually trigger audit log purge
 */
adminRouter.post('/logs/purge', requirePermission('admin:logs:manage'), async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await purgeOldAuditLogs();
        return res.json({
            success: true,
            message: `Purged ${result.deleted} logs older than ${result.cutoffDate.toISOString()}`
        });
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/admin/sessions/purge
 * Manually trigger expired session cleanup
 */
adminRouter.post('/sessions/purge', requirePermission('admin:sessions:manage'), async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await purgeExpiredSessions();
        return res.json({
            success: true,
            message: `Purged ${deleted} expired sessions`
        });
    } catch (e) {
        return next(e);
    }
});
