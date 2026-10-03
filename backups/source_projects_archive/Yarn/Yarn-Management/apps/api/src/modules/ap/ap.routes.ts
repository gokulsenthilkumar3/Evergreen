
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as apService from './ap.service';

export const apRouter = Router();

// 1. Create Bill (Vendor Invoice)
apRouter.post('/bills', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bill = await apService.createBill({
            ...req.body,
            date: new Date(req.body.date),
            dueDate: new Date(req.body.dueDate)
        });
        res.json(bill);
    } catch (e) {
        next(e);
    }
});

// 2. Record Payment
apRouter.post('/payments', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payment = await apService.recordPayment({
            ...req.body,
            paymentDate: new Date(req.body.paymentDate)
        });
        res.json(payment);
    } catch (e) {
        next(e);
    }
});

// 3. Get Vendor Ledger
apRouter.get('/ledger/:supplierId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const ledger = await apService.getVendorLedger(supplierId);
        res.json(ledger);
    } catch (e) {
        next(e);
    }
});

// 4. Get Outstanding Payables
apRouter.get('/outstanding', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const outstanding = await apService.getOutstandingPayables();
        res.json(outstanding);
    } catch (e) {
        next(e);
    }
});

// 5. Create Expense
apRouter.post('/expenses', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const expense = await apService.createExpense({
            ...req.body,
            date: new Date(req.body.date)
        });
        res.json(expense);
    } catch (e) {
        next(e);
    }
});

// 6. Get All Expenses (With optional filters)
apRouter.get('/expenses', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, category } = req.query;
        const expenses = await apService.getExpenses({
            status: status as string,
            category: category as string
        });
        res.json(expenses);
    } catch (e) {
        next(e);
    }
});

// 7. Approve/Reject Expense
apRouter.patch('/expenses/:id/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        // Mocking user ID for now as "SYSTEM" or extracting from req.user if available
        const approverId = (req as any).user?.userId;

        const expense = await apService.updateExpenseStatus({
            id,
            status,
            rejectionReason,
            approverId
        });
        res.json(expense);
    } catch (e) {
        next(e);
    }
});

// 8. Expense Report (Category-wise)
apRouter.get('/reports/expenses', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await apService.getExpenseReport({
            startDate: startDate ? new Date(String(startDate)) : undefined,
            endDate: endDate ? new Date(String(endDate)) : undefined
        });
        res.json(report);
    } catch (e) {
        next(e);
    }
});
