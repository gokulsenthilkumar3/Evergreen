import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import * as monitoringService from './monitoring.service';
import * as alertsService from './alerts.service';
import { z } from 'zod';

const monitoringRouter = Router();

// Dashboard Data
monitoringRouter.get('/dashboard', authenticate, async (req, res) => {
    try {
        const data = await monitoringService.getLiveProductionData();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch dashboard data' });
    }
});

monitoringRouter.get('/machines/status', authenticate, async (req, res) => {
    try {
        const status = await monitoringService.getMachineStatusOverview();
        res.json({ machines: status });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch machine status' });
    }
});

// Batch Progress Update
monitoringRouter.patch(
    '/batches/:batchId/progress',
    authenticate,
    requirePermission('production.manage'),
    async (req, res) => {
        try {
            const { batchId } = req.params;
            const schema = z.object({
                status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SCHEDULED']).optional(),
                currentStage: z.string().optional(),
                currentStageProgress: z.number().min(0).max(100).optional(),
                machineId: z.string().optional(),
                operatorId: z.string().optional(),
            });

            const data = schema.parse(req.body);
            const updated = await monitoringService.updateBatchProgress(
                batchId,
                req.userId!,
                data as any
            );

            res.json({ batch: updated });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ message: 'Invalid input', errors: error.errors });
            }
            res.status(500).json({ message: error.message || 'Failed to update batch progress' });
        }
    }
);

// Alerts
monitoringRouter.get('/alerts', authenticate, async (req, res) => {
    try {
        const alerts = await alertsService.getActiveAlerts();
        res.json({ alerts });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch alerts' });
    }
});

monitoringRouter.post(
    '/alerts',
    authenticate,
    requirePermission('production.manage'),
    async (req, res) => {
        try {
            const schema = z.object({
                batchId: z.string(),
                alertType: z.string(),
                severity: z.string(),
                message: z.string(),
            });

            const data = schema.parse(req.body);
            const alert = await alertsService.createAlert(
                data.batchId,
                req.userId!,
                data
            );

            res.json({ alert });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to create alert' });
        }
    }
);

monitoringRouter.put(
    '/alerts/:alertId/resolve',
    authenticate,
    requirePermission('production.manage'),
    async (req, res) => {
        try {
            const { alertId } = req.params;
            const alert = await alertsService.resolveAlert(alertId, req.userId!);
            res.json({ alert });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to resolve alert' });
        }
    }
);

export const monitoringRouterExport = monitoringRouter;
