import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { z } from 'zod';

const planningRouter = Router();

// Middleware to check roles (Simplified)
const authorize = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // In a real app, check req.user.roles or fetch from DB
        // For MVP, if authenticated, we allow (or just pass next() for now to avoid complexity)
        // ideally: const user = await prisma.user.findUnique(...)
        next();
    };
};

// --- Schemas ---
const CreatePlanSchema = z.object({
    name: z.string().min(1),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    notes: z.string().optional()
});

const CreateForecastSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2024),
    productType: z.string().min(1),
    forecastedQuantity: z.number().positive(),
    confidenceLevel: z.number().min(0).max(100).optional()
});

// --- Routes ---

// Get all production plans
planningRouter.get('/plans', authenticate, async (req: Request, res: Response) => {
    try {
        const plans = await prisma.productionPlan.findMany({
            include: {
                _count: { select: { batches: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ plans });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch plans' });
    }
});

// Create a new production plan
planningRouter.post('/plans', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const data = CreatePlanSchema.parse(req.body);
        const plan = await prisma.productionPlan.create({
            data: {
                ...data,
                status: 'DRAFT'
            }
        });
        res.status(201).json({ plan });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to create plan' });
    }
});

// Get Demand Forecasts
planningRouter.get('/forecasts', authenticate, async (req: Request, res: Response) => {
    try {
        const forecasts = await prisma.demandForecast.findMany({
            orderBy: [{ year: 'asc' }, { month: 'asc' }]
        });
        res.json({ forecasts });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch forecasts' });
    }
});

// Add/Update Demand Forecast
planningRouter.post('/forecasts', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const data = CreateForecastSchema.parse(req.body);

        // Upsert based on composite unique key
        const forecast = await prisma.demandForecast.upsert({
            where: {
                month_year_productType: {
                    month: data.month,
                    year: data.year,
                    productType: data.productType
                }
            },
            update: {
                forecastedQuantity: data.forecastedQuantity,
                confidenceLevel: data.confidenceLevel
            },
            create: {
                ...data,
                confidenceLevel: data.confidenceLevel || 80
            }
        });

        res.json({ forecast });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to save forecast' });
    }
});

// Get Machines & Capacity
planningRouter.get('/machines', authenticate, async (req: Request, res: Response) => {
    try {
        const machines = await prisma.machine.findMany({
            include: {
                _count: { select: { batches: true } }
            }
        });
        res.json({ machines });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch machines' });
    }
});

// Run MRP (Simplified Simulation)
planningRouter.post('/mrp', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const { planId } = req.body;
        // In a real app, this would calculate raw materials needed for the plan's batches
        // For now, we'll return a stubbed calculation

        const plan = await prisma.productionPlan.findUnique({
            where: { id: planId },
            include: { batches: true }
        });

        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const rawMaterialRequirements = [
            { material: 'Cotton - Grade A', required: 5000, available: 3200, status: 'SHORTAGE' },
            { material: 'Polyester Fiber', required: 2000, available: 5000, status: 'OK' }
        ];

        res.json({ requirements: rawMaterialRequirements });
    } catch (error) {
        res.status(500).json({ message: 'MRP calculation failed' });
    }
});

// Get Batches for Scheduling
planningRouter.get('/schedule', authenticate, async (req: Request, res: Response) => {
    try {
        const { start, end } = req.query;
        // In a real app, filter by date range if provided

        const key = start || end ? 'has-date' : 'all'; // simple cache key or filter indicator

        const batches = await prisma.productionBatch.findMany({
            where: {
                status: { not: 'COMPLETED' } // Fetch active/planned batches
            },
            include: {
                machine: { select: { id: true, name: true, type: true } },
                plan: { select: { id: true, name: true } },
                rawMaterial: { select: { materialType: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ batches });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch schedule' });
    }
});

// Update Batch Schedule (Assign Machine & Dates)
planningRouter.patch('/batches/:id/schedule', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, machineId } = req.body;

        const batch = await prisma.productionBatch.update({
            where: { id },
            data: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                machineId: machineId || undefined,
                status: 'SCHEDULED' // Automatically update status
            }
        });

        res.json({ batch });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update schedule' });
    }
});

// Shift Management
planningRouter.get('/shifts', authenticate, async (req: Request, res: Response) => {
    try {
        const shifts = await prisma.shift.findMany({ orderBy: { startTime: 'asc' } });
        res.json({ shifts });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch shifts' });
    }
});

planningRouter.post('/shifts', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const { name, startTime, endTime } = req.body;
        const shift = await prisma.shift.create({
            data: { name, startTime, endTime }
        });
        res.json({ shift });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create shift' });
    }
});

// Work Order Management
planningRouter.get('/work-orders', authenticate, async (req: Request, res: Response) => {
    try {
        const workOrders = await prisma.workOrder.findMany({
            include: {
                batches: {
                    include: { rawMaterial: { select: { materialType: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ workOrders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch work orders' });
    }
});

planningRouter.post('/work-orders', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const { workOrderNumber, priority, startDate, dueDate, batchIds } = req.body;

        const workOrder = await prisma.workOrder.create({
            data: {
                workOrderNumber,
                priority,
                startDate: startDate ? new Date(startDate) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                status: 'PENDING',
                batches: batchIds ? {
                    connect: batchIds.map((id: string) => ({ id }))
                } : undefined
            }
        });
        res.json({ workOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create work order' });
    }
});

// Assign Operator & Shift to Batch
planningRouter.patch('/batches/:id/assign', authenticate, authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { operatorId, shiftId } = req.body;

        const batch = await prisma.productionBatch.update({
            where: { id },
            data: {
                operatorId: operatorId || undefined,
                shiftId: shiftId || undefined
            }
        });
        res.json({ batch });
    } catch (error) {
        res.status(500).json({ message: 'Failed to assign operator/shift' });
    }
});

// Get Operators (Users with OPERATOR role - strictly speaking we check roles)
// Reuse existing user endpoint or add simple filter here
planningRouter.get('/operators', authenticate, async (req: Request, res: Response) => {
    try {
        // Fetch users who have a role that contains "OPERATOR" or just all users for simplicity in this MVP
        // In a real app we'd filter by role code. 
        // Assuming we have a 'OPERATOR' role code.
        const operators = await prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: { code: 'OPERATOR' }
                    }
                }
            },
            select: { id: true, name: true }
        });
        res.json({ operators });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch operators' });
    }
});

export { planningRouter };
