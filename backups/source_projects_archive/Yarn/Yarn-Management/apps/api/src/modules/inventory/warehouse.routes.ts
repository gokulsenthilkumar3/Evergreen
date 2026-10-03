import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { z } from 'zod';
import QRCode from 'qrcode';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Mock authorize middleware to match other modules
const authorize = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: Function) => {
        next();
    };
};

const CreateWarehouseSchema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    type: z.enum(['RAW_MATERIAL', 'FINISHED_GOODS', 'GENERAL']),
    address: z.string().optional(),
});

const AddLocationSchema = z.object({
    code: z.string().min(3),
    zone: z.string().optional(),
    rack: z.string().optional(),
    bin: z.string().optional(),
    capacity: z.number().optional(),
});

const StockTransferSchema = z.object({
    sourceLocationId: z.string().optional(),
    destinationLocationId: z.string(),
    items: z.array(z.object({
        itemId: z.string(), // RawMaterial ID or FinishedGood ID
        itemType: z.enum(['RAW_MATERIAL', 'FINISHED_GOOD']),
        quantity: z.number()
    })),
    notes: z.string().optional()
});

// 1. List Warehouses
router.get('/warehouses', authenticate, async (req: Request, res: Response) => {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: {
                _count: { select: { locations: true } }
            }
        });
        res.json({ warehouses });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch warehouses' });
    }
});

// 2. Create Warehouse
router.post('/warehouses', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const data = CreateWarehouseSchema.parse(req.body);
        const warehouse = await prisma.warehouse.create({ data });
        res.status(201).json({ warehouse });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to create warehouse' });
    }
});

// 3. Get Warehouse Details with Locations
router.get('/warehouses/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const warehouse = await prisma.warehouse.findUnique({
            where: { id: req.params.id },
            include: {
                locations: {
                    include: {
                        _count: { select: { rawMaterials: true, finishedGoods: true } }
                    }
                }
            }
        });
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        res.json({ warehouse });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch warehouse details' });
    }
});

// 4. Add Location to Warehouse
router.post('/warehouses/:id/locations', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = AddLocationSchema.parse(req.body);

        const location = await prisma.warehouseLocation.create({
            data: {
                warehouseId: id,
                ...data,
                capacity: data.capacity ? Number(data.capacity) : undefined
            }
        });
        res.status(201).json({ location });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Failed to add location' });
    }
});

// 5. Stock Transfer
router.post('/transfer', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    try {
        const data = StockTransferSchema.parse(req.body);

        // Create Transfer Record
        const transfer = await prisma.stockTransfer.create({
            data: {
                transferNumber: `TRF-${Date.now()}`,
                sourceLocationId: data.sourceLocationId,
                destinationLocationId: data.destinationLocationId,
                items: data.items,
                status: 'COMPLETED', // Auto-complete for now
                requestedBy: req.userId,
                approvedBy: req.userId,
                completedAt: new Date()
            }
        });

        // Execute Movements
        const destination = await prisma.warehouseLocation.findUnique({ where: { id: data.destinationLocationId }, include: { warehouse: true } });
        if (!destination) throw new Error('Destination not found');

        for (const item of data.items) {
            if (item.itemType === 'RAW_MATERIAL') {
                // Update Raw Material Location
                await prisma.rawMaterial.update({
                    where: { id: item.itemId },
                    data: { warehouseLocationId: destination.id, status: 'IN_STOCK' }
                });
            } else {
                // Update Finished Good Location
                await prisma.finishedGood.update({
                    where: { id: item.itemId },
                    data: { warehouseLocationId: destination.id }
                });
            }

            // Log Movement
            await prisma.stockMovementLog.create({
                data: {
                    type: 'TRANSFER',
                    itemId: item.itemId,
                    itemType: item.itemType,
                    quantity: item.quantity,
                    locationId: destination.id,
                    toWarehouseId: destination.warehouseId,
                    performedBy: req.userId,
                    referenceType: 'TRANSFER',
                    referenceId: transfer.id
                }
            });
        }

        res.status(201).json({ transfer });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Failed to execute transfer' });
    }
});

// 6. Get Movements
router.get('/movements', authenticate, async (req: Request, res: Response) => {
    try {
        const logs = await prisma.stockMovementLog.findMany({
            include: {
                location: true,
                fromWarehouse: true,
                toWarehouse: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch movements' });
    }
});

// 7. Generate QR Code
router.get('/qrcode', authenticate, async (req: Request, res: Response) => {
    try {
        const { text } = req.query;
        if (!text) return res.status(400).json({ message: 'Text is required' });

        const dataUrl = await QRCode.toDataURL(text as string);
        res.json({ dataUrl });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate QR code' });
    }
});

// 8. Stock Aging Analysis
router.get('/analysis/aging', authenticate, async (req: Request, res: Response) => {
    try {
        const rawMaterials = await prisma.rawMaterial.findMany({
            where: { status: 'IN_STOCK' },
            select: { receivedDate: true, quantity: true }
        });

        const finishedGoods = await prisma.finishedGood.findMany({
            include: { batch: true }
        });

        const now = new Date();
        const aging: any = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

        rawMaterials.forEach((rm: any) => {
            const days = Math.floor((now.getTime() - new Date(rm.receivedDate).getTime()) / (1000 * 3600 * 24));
            const qty = Number(rm.quantity);
            if (days <= 30) aging['0-30'] += qty;
            else if (days <= 60) aging['31-60'] += qty;
            else if (days <= 90) aging['61-90'] += qty;
            else aging['90+'] += qty;
        });

        res.json({ aging });
    } catch (error) {
        res.status(500).json({ message: 'Failed to analyze stock aging' });
    }
});

// 9. FIFO Suggestions (Oldest materials first)
router.get('/suggest-materials', authenticate, async (req: Request, res: Response) => {
    try {
        const { type, limit } = req.query;
        const materials = await prisma.rawMaterial.findMany({
            where: {
                status: 'IN_STOCK',
                ...(type ? { materialType: String(type) } : {})
            },
            orderBy: { receivedDate: 'asc' },
            take: limit ? Number(limit) : 5
        });
        res.json({ materials });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get suggestions' });
    }
});

export const warehouseRouter = router;
