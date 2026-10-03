import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { z } from 'zod';

const machineRouter = Router();

// Middleware for minimal authorization
const authorize = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: Function) => {
        next();
    };
};

// --- Schemas ---

const CreateMachineSchema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    type: z.string().min(1),
    capacityPerHour: z.number().positive(),
    status: z.string().default('ACTIVE')
});

const MaintenanceRecordSchema = z.object({
    machineId: z.string().uuid(),
    type: z.enum(['PREVENTIVE', 'BREAKDOWN']),
    date: z.string().transform(str => new Date(str)),
    technician: z.string().optional(),
    description: z.string().optional(),
    cost: z.number().optional(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).default('SCHEDULED')
});

const DowntimeLogSchema = z.object({
    machineId: z.string().uuid(),
    startTime: z.string().transform(str => new Date(str)),
    endTime: z.string().transform(str => new Date(str)).optional(),
    reason: z.string().optional(),
    durationMinutes: z.number().optional()
});

const SparePartSchema = z.object({
    name: z.string().min(1),
    partNumber: z.string().min(1),
    quantityInStock: z.number().int().min(0),
    minimumStockLevel: z.number().int().min(0),
    costPerUnit: z.number().positive()
});

// --- Routes ---

// 1. Machines CRUD
machineRouter.get('/machines', authenticate, async (req: Request, res: Response) => {
    try {
        const machines = await prisma.machine.findMany({
            include: {
                _count: { select: { batches: true, maintenanceRecords: true, downtimeLogs: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json({ machines });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch machines' });
    }
});

machineRouter.post('/machines', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const data = CreateMachineSchema.parse(req.body);
        const machine = await prisma.machine.create({ data });
        res.status(201).json({ machine });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to create machine' });
    }
});

machineRouter.patch('/machines/:id', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const machine = await prisma.machine.update({
            where: { id },
            data: req.body
        });
        res.json({ machine });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update machine' });
    }
});

// 2. Maintenance Records
machineRouter.get('/machines/:id/maintenance', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const records = await prisma.maintenanceRecord.findMany({
            where: { machineId: id },
            orderBy: { date: 'desc' }
        });
        res.json({ records });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch maintenance records' });
    }
});

machineRouter.post('/maintenance', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const data = MaintenanceRecordSchema.parse(req.body);
        const record = await prisma.maintenanceRecord.create({ data });
        res.status(201).json({ record });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to create maintenance record' });
    }
});

// 3. Downtime Logs
machineRouter.get('/machines/:id/downtime', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const logs = await prisma.downtimeLog.findMany({
            where: { machineId: id },
            orderBy: { startTime: 'desc' }
        });
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch downtime logs' });
    }
});

machineRouter.post('/downtime', authenticate, authorize(['ADMIN', 'MANAGER', 'SUPERVISOR']), async (req: Request, res: Response) => {
    try {
        const data = DowntimeLogSchema.parse(req.body);
        // Calculate duration if endTime is provided
        let duration = data.durationMinutes;
        if (data.endTime && !duration) {
            const diffMs = data.endTime.getTime() - data.startTime.getTime();
            duration = Math.round(diffMs / 60000);
        }

        const log = await prisma.downtimeLog.create({
            data: { ...data, durationMinutes: duration }
        });

        // Auto-update machine status to DOWN if it's an ongoing downtime
        if (!data.endTime) {
            await prisma.machine.update({
                where: { id: data.machineId },
                data: { status: 'DOWN' }
            });
        }

        res.status(201).json({ log });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to log downtime' });
    }
});

// 4. Spare Parts
machineRouter.get('/spare-parts', authenticate, async (req: Request, res: Response) => {
    try {
        const parts = await prisma.sparePart.findMany({ orderBy: { name: 'asc' } });
        res.json({ parts });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch spare parts' });
    }
});

machineRouter.post('/spare-parts', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const data = SparePartSchema.parse(req.body);
        const part = await prisma.sparePart.create({ data });
        res.status(201).json({ part });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to create spare part' });
    }
});

export { machineRouter };
