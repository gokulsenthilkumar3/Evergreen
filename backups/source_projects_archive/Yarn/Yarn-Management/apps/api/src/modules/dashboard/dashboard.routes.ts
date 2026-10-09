import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as dashboardService from './dashboard.service';

export const dashboardRouter = Router();

// Production stats
dashboardRouter.get('/production-stats', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await dashboardService.getProductionStats();
        return res.json(stats);
    } catch (e) {
        return next(e);
    }
});

// Financial summary
dashboardRouter.get('/financial-summary', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const summary = await dashboardService.getFinancialSummary();
        return res.json(summary);
    } catch (e) {
        return next(e);
    }
});

// Inventory health
dashboardRouter.get('/inventory-health', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const health = await dashboardService.getInventoryHealth();
        return res.json(health);
    } catch (e) {
        return next(e);
    }
});

// Supplier performance
dashboardRouter.get('/supplier-performance', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const performance = await dashboardService.getSupplierPerformance();
        return res.json(performance);
    } catch (e) {
        return next(e);
    }
});

// Production efficiency
dashboardRouter.get('/production-efficiency', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const data = await dashboardService.getProductionEfficiency(days);
        return res.json(data);
    } catch (e) {
        return next(e);
    }
});

// Wastage analysis
dashboardRouter.get('/wastage-analysis', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const analysis = await dashboardService.getWastageAnalysis();
        return res.json(analysis);
    } catch (e) {
        return next(e);
    }
});

// Quality metrics (combined endpoint)
dashboardRouter.get('/quality-metrics', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 30;
        const metrics = await dashboardService.getQualityMetrics(days);
        return res.json(metrics);
    } catch (e) {
        return next(e);
    }
});

// Financial analytics (combined endpoint)
dashboardRouter.get('/financial-analytics', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const analytics = await dashboardService.getFinancialAnalytics();
        return res.json(analytics);
    } catch (e) {
        return next(e);
    }
});
