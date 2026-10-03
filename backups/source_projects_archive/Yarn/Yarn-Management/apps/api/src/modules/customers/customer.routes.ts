import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as customerService from './customer.service';

export const customerRouter = Router();

// List customers with filters
customerRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, lifecycleStage, valueClass, search } = req.query;
        const customers = await customerService.listCustomers({
            category: category as any,
            lifecycleStage: lifecycleStage as any,
            valueClass: valueClass as any,
            search: search as string
        });
        return res.json({ customers });
    } catch (e) {
        return next(e);
    }
});

// Create customer
customerRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        return res.status(201).json({ customer });
    } catch (e) {
        return next(e);
    }
});

// Get customer details
customerRouter.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const customer = await customerService.getCustomerById(id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        return res.json({ customer });
    } catch (e) {
        return next(e);
    }
});

// Update customer
customerRouter.patch('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const customer = await customerService.updateCustomer(id, req.body);
        return res.json({ customer });
    } catch (e) {
        return next(e);
    }
});

// Get customer analytics
customerRouter.get('/:id/analytics', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const analytics = await customerService.getCustomerAnalytics(id);
        return res.json({ analytics });
    } catch (e) {
        return next(e);
    }
});

// Get revenue history
customerRouter.get('/:id/revenue-history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { months } = req.query;
        const history = await customerService.getRevenueHistory(id, months ? parseInt(months as string) : 6);
        return res.json({ history });
    } catch (e) {
        return next(e);
    }
});
