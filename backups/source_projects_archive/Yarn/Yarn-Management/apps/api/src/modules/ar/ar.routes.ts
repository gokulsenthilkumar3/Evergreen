
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as arService from './ar.service';

export const arRouter = Router();

// Get Ledger
arRouter.get('/ledger/:customerId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customerId } = req.params;
        const ledger = await arService.getCustomerLedger(customerId);
        res.json(ledger);
    } catch (e) {
        next(e);
    }
});

// Get Aging Report
arRouter.get('/aging-report', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const report = await arService.getAgingReport();
        res.json(report);
    } catch (e) {
        next(e);
    }
});

// Record Payment
arRouter.post('/payment', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payment = await arService.recordPayment(req.body);
        res.json(payment);
    } catch (e) {
        next(e);
    }
});

// Create Follow Up
arRouter.post('/follow-up', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const followUp = await arService.createFollowUp({
            ...req.body,
            dueDate: new Date(req.body.dueDate)
        });
        res.json(followUp);
    } catch (e) {
        next(e);
    }
});
// Get Metrics
arRouter.get('/metrics', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const metrics = await arService.calculateCollectionMetrics();
        res.json(metrics);
    } catch (e) {
        next(e);
    }
});

// Update Credit Limit
arRouter.patch('/credit-limit/:customerId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customerId } = req.params;
        const { creditLimit } = req.body;
        const updated = await arService.updateCreditLimit(customerId, Number(creditLimit));
        res.json(updated);
    } catch (e) {
        next(e);
    }
});

// Record Bad Debt
arRouter.post('/bad-debt', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const provision = await arService.provisionBadDebt(req.body);
        res.json(provision);
    } catch (e) {
        next(e);
    }
});
