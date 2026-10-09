import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as reportingService from './reporting.service';

export const reportingRouter = Router();

// Dashboard KPIs
reportingRouter.get('/dashboard/kpis', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const kpis = await reportingService.getDashboardKPIs();
        res.json(kpis);
    } catch (error) {
        next(error);
    }
});

// Compliance Reports
reportingRouter.get('/compliance/:type', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: 'startDate and endDate are required' });
            return;
        }

        const report = await reportingService.getComplianceReport(type, {
            startDate: startDate as string,
            endDate: endDate as string
        });
        res.json(report);
    } catch (error) {
        next(error);
    }
});

// Custom Report Builder
reportingRouter.post('/builder/generate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { source, fields, filters } = req.body;

        if (!source || !fields) {
            res.status(400).json({ error: 'Source and fields are required' });
            return;
        }

        const data = await reportingService.generateCustomReport(source, fields, filters);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// --- Report Schedules ---

reportingRouter.get('/schedules', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schedules = await reportingService.getReportSchedules();
        res.json(schedules);
    } catch (error) {
        next(error);
    }
});

reportingRouter.post('/schedules', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schedule = await reportingService.createReportSchedule(req.body);
        res.status(201).json(schedule);
    } catch (error) {
        next(error);
    }
});

reportingRouter.delete('/schedules/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reportingService.deleteReportSchedule(req.params.id);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// Manual Trigger for Testing
reportingRouter.post('/engine/run', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reportingService.processScheduledReports();
        res.json({ message: 'Engine processed due reports' });
    } catch (error) {
        next(error);
    }
});
