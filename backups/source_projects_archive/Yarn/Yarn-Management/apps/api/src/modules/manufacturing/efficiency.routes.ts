import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as oeeService from './oee.service';
import * as cycleTimeService from './cycle-time.service';

export const efficiencyRouter = Router();

// Calculate OEE for a batch
efficiencyRouter.post('/batches/:id/oee/calculate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const oeeMetric = await oeeService.calculateOEE(id);
        return res.status(201).json({ oeeMetric });
    } catch (e) {
        return next(e);
    }
});

// Get latest OEE for a batch
efficiencyRouter.get('/batches/:id/oee/latest', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const oeeMetric = await oeeService.getLatestOEE(id);
        if (!oeeMetric) {
            return res.status(404).json({ message: 'No OEE metrics found for this batch' });
        }
        const benchmark = oeeService.getOEEBenchmark(Number(oeeMetric.oee));
        return res.json({ oeeMetric, benchmark });
    } catch (e) {
        return next(e);
    }
});

// Get OEE trends
efficiencyRouter.get('/oee/trends', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate as string) : new Date();

        const trends = await oeeService.getOEETrends(start, end);
        return res.json(trends);
    } catch (e) {
        return next(e);
    }
});

// Analyze cycle time for a batch
efficiencyRouter.post('/batches/:id/cycle-time/analyze', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const analyses = await cycleTimeService.analyzeCycleTime(id);
        return res.status(201).json({ analyses });
    } catch (e) {
        return next(e);
    }
});

// Compare target vs actual for a batch
efficiencyRouter.get('/batches/:id/cycle-time/compare', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const comparison = await cycleTimeService.compareTargetVsActual(id);
        return res.json(comparison);
    } catch (e) {
        return next(e);
    }
});

// Identify bottlenecks
efficiencyRouter.get('/bottlenecks', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bottlenecks = await cycleTimeService.identifyBottlenecks();
        return res.json(bottlenecks);
    } catch (e) {
        return next(e);
    }
});

// Get cycle time trends
efficiencyRouter.get('/cycle-time/trends', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { stageName } = req.query;
        const trends = await cycleTimeService.getCycleTimeTrends(stageName as any);
        return res.json({ trends });
    } catch (e) {
        return next(e);
    }
});
