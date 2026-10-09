
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';

export const budgetRouter = Router();

const budgetSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    periodKey: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
    notes: z.string().optional()
});

// 1. Get Budgets (Optional: Filter by period)
budgetRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { period } = req.query;
        const where = period ? { periodKey: String(period) } : {};

        const budgets = await prisma.budget.findMany({
            where,
            orderBy: { periodKey: 'desc' }
        });
        res.json(budgets);
    } catch (e) {
        next(e);
    }
});

// 2. Create or Update Budget
budgetRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = budgetSchema.parse(req.body);

        // Upsert based on unique constraint [category, periodKey]
        const budget = await prisma.budget.upsert({
            where: {
                category_periodKey: {
                    category: body.category,
                    periodKey: body.periodKey
                }
            },
            update: {
                amount: body.amount,
                notes: body.notes
            },
            create: {
                category: body.category,
                periodKey: body.periodKey,
                amount: body.amount,
                notes: body.notes
            }
        });

        res.json(budget);
    } catch (e) {
        next(e);
    }
});

// 3. Get Budget vs Actual for a period
budgetRouter.get('/vs-actual', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { period } = req.query;
        if (!period || typeof period !== 'string') {
            return res.status(400).json({ message: 'Period (YYYY-MM) is required' });
        }

        // 1. Fetch Budgets for period
        const budgets = await prisma.budget.findMany({
            where: { periodKey: period }
        });

        // 2. Fetch Actual Expenses for period
        // Calculate start and end date for the month
        const [year, month] = period.split('-');
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0); // Last day of month

        const expenses = await prisma.expense.groupBy({
            by: ['category'],
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'APPROVED' // Only count approved expenses? Or all excluding Rejected? Let's say all non-rejected.
                // improved logic: status: { not: 'REJECTED' }
            },
            _sum: {
                amount: true
            }
        });

        // 3. Merge Data
        // Get all unique categories
        const categories = new Set([
            ...budgets.map(b => b.category),
            ...expenses.map(e => e.category)
        ]);

        const result = Array.from(categories).map(cat => {
            const budget = budgets.find(b => b.category === cat);
            const expense = expenses.find(e => e.category === cat);

            const budgetAmount = Number(budget?.amount || 0);
            const actualAmount = Number(expense?._sum.amount || 0);

            return {
                category: cat,
                budget: budgetAmount,
                actual: actualAmount,
                variance: budgetAmount - actualAmount,
                percentUsed: budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : (actualAmount > 0 ? 100 : 0)
            };
        });

        res.json(result);
    } catch (e) {
        next(e);
    }
});
