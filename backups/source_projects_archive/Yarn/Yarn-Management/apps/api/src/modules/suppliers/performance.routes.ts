import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import * as performanceService from './performance.service';
import * as ratingService from './rating.service';
import * as riskService from './risk.service';
import { PerformanceMetricType, RiskLevel, RiskCategory } from '@prisma/client';

const performanceRouter = Router();

// Performance Metrics
performanceRouter.post(
    '/:supplierId/metrics',
    authenticate,
    requirePermission('supplier.manage'),
    async (req, res) => {
        try {
            const { supplierId } = req.params;
            const schema = z.object({
                metricType: z.nativeEnum(PerformanceMetricType),
                value: z.number().min(0).max(100),
                weight: z.number().min(0).default(1),
                notes: z.string().optional(),
            });

            const data = schema.parse(req.body);
            const metric = await performanceService.recordPerformanceMetric(
                supplierId,
                data.metricType,
                data.value,
                data.weight,
                data.notes
            );

            res.json({ metric });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ message: 'Invalid input', errors: error.errors });
            }
            res.status(500).json({ message: error.message || 'Failed to record metric' });
        }
    }
);

performanceRouter.get('/:supplierId/metrics/trends', authenticate, async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { metricType, days } = req.query;

        const trends = await performanceService.getPerformanceTrends(
            supplierId,
            metricType as PerformanceMetricType | undefined,
            days ? parseInt(days as string) : 90
        );

        res.json({ trends });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch trends' });
    }
});

performanceRouter.post(
    '/:supplierId/metrics/update-all',
    authenticate,
    requirePermission('supplier.manage'),
    async (req, res) => {
        try {
            const { supplierId } = req.params;
            const metrics = await performanceService.updateAllMetrics(supplierId);
            res.json({ metrics });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to update metrics' });
        }
    }
);

// Ratings
performanceRouter.post('/:supplierId/ratings', authenticate, async (req, res) => {
    try {
        const { supplierId } = req.params;
        const schema = z.object({
            rating: z.number().int().min(1).max(5),
            comment: z.string().optional(),
            isPublic: z.boolean().default(false),
        });

        const data = schema.parse(req.body);
        const rating = await ratingService.createRating(
            supplierId,
            req.userId!,
            data.rating,
            data.comment,
            data.isPublic
        );

        res.json({ rating });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        res.status(500).json({ message: error.message || 'Failed to create rating' });
    }
});

performanceRouter.get('/:supplierId/ratings', authenticate, async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { includePrivate } = req.query;

        const ratings = await ratingService.getSupplierRatings(
            supplierId,
            includePrivate === 'true'
        );

        res.json({ ratings });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch ratings' });
    }
});

performanceRouter.get('/:supplierId/ratings/statistics', authenticate, async (req, res) => {
    try {
        const { supplierId } = req.params;
        const stats = await ratingService.getRatingStatistics(supplierId);
        res.json({ statistics: stats });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch statistics' });
    }
});

performanceRouter.put('/ratings/:ratingId', authenticate, async (req, res) => {
    try {
        const { ratingId } = req.params;
        const schema = z.object({
            rating: z.number().int().min(1).max(5).optional(),
            comment: z.string().optional(),
            isPublic: z.boolean().optional(),
        });

        const data = schema.parse(req.body);
        const updated = await ratingService.updateRating(ratingId, req.userId!, data);

        res.json({ rating: updated });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        res.status(500).json({ message: error.message || 'Failed to update rating' });
    }
});

performanceRouter.delete('/ratings/:ratingId', authenticate, async (req, res) => {
    try {
        const { ratingId } = req.params;
        await ratingService.deleteRating(ratingId, req.userId!);
        res.json({ message: 'Rating deleted successfully' });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        res.status(500).json({ message: error.message || 'Failed to delete rating' });
    }
});

// Risk Assessments
performanceRouter.post(
    '/:supplierId/risks',
    authenticate,
    requirePermission('supplier.manage'),
    async (req, res) => {
        try {
            const { supplierId } = req.params;
            const schema = z.object({
                riskCategory: z.nativeEnum(RiskCategory),
                riskLevel: z.nativeEnum(RiskLevel),
                description: z.string(),
                mitigationPlan: z.string().optional(),
                reviewDate: z.string().datetime().optional(),
                notes: z.string().optional(),
            });

            const data = schema.parse(req.body);
            const assessment = await riskService.createRiskAssessment(supplierId, req.userId!, {
                ...data,
                reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
            });

            res.json({ assessment });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ message: 'Invalid input', errors: error.errors });
            }
            res.status(500).json({ message: error.message || 'Failed to create risk assessment' });
        }
    }
);

performanceRouter.get('/:supplierId/risks', authenticate, async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { activeOnly } = req.query;

        const risks =
            activeOnly === 'true'
                ? await riskService.getActiveRisks(supplierId)
                : await riskService.getAllRisks(supplierId);

        res.json({ risks });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch risks' });
    }
});

performanceRouter.get('/:supplierId/risks/summary', authenticate, async (req, res) => {
    try {
        const { supplierId } = req.params;
        const summary = await riskService.getRiskSummary(supplierId);
        res.json({ summary });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch risk summary' });
    }
});

performanceRouter.put(
    '/risks/:assessmentId/status',
    authenticate,
    requirePermission('supplier.manage'),
    async (req, res) => {
        try {
            const { assessmentId } = req.params;
            const schema = z.object({
                status: z.enum(['ACTIVE', 'MITIGATED', 'CLOSED']),
                notes: z.string().optional(),
            });

            const data = schema.parse(req.body);
            const updated = await riskService.updateRiskStatus(
                assessmentId,
                req.userId!,
                data.status as any,
                data.notes
            );

            res.json({ assessment: updated });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to update risk status' });
        }
    }
);

performanceRouter.get('/risks/review-due', authenticate, async (req, res) => {
    try {
        const suppliers = await riskService.getSuppliersForRiskReview();
        res.json({ suppliers });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch suppliers for review' });
    }
});

export const performanceRouterExport = performanceRouter;
