import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as costService from './cost-optimization.service';

export const costOptimizationRouter = Router();

// Analyze material costs
costOptimizationRouter.get('/analyze', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { materialType } = req.query;
        const analyses = await costService.analyzeMaterialCosts(materialType as string);
        return res.json({ analyses });
    } catch (e) {
        return next(e);
    }
});

// Get price trends
costOptimizationRouter.get('/trends/:materialType', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { materialType } = req.params;
        const { days } = req.query;
        const trends = await costService.getPriceTrends(materialType, days ? parseInt(days as string) : 90);
        return res.json({ trends });
    } catch (e) {
        return next(e);
    }
});

// Compare supplier prices
costOptimizationRouter.get('/compare/:materialType', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { materialType } = req.params;
        const comparison = await costService.compareSupplierPrices(materialType);
        return res.json({ comparison });
    } catch (e) {
        return next(e);
    }
});

// Get procurement analytics
costOptimizationRouter.get('/analytics', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const analytics = await costService.getProcurementAnalytics();
        return res.json(analytics);
    } catch (e) {
        return next(e);
    }
});
