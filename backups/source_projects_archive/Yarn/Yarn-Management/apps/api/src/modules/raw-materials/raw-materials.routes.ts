import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { createRawMaterialSchema, updateRawMaterialSchema } from './raw-materials.schemas';

export const rawMaterialsRouter = Router();

// List all
rawMaterialsRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rawMaterials = await prisma.rawMaterial.findMany({
            include: {
                supplier: { select: { id: true, name: true, supplierCode: true } },
                productionBatches: { select: { batchNumber: true } },
                warehouseLocation: { include: { warehouse: { select: { name: true } } } }
            },
            orderBy: { receivedDate: 'desc' },
        });

        return res.json({ rawMaterials });
    } catch (e) {
        return next(e);
    }
});

// Create
rawMaterialsRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createRawMaterialSchema.parse(req.body);

        // Calculate total cost
        const totalCost = Number(body.quantity) * Number(body.costPerUnit);

        const rawMaterial = await prisma.rawMaterial.create({
            data: {
                ...body,
                totalCost,
                createdBy: req.userId,
            },
            include: { supplier: true },
        });
        return res.status(201).json({ rawMaterial });
    } catch (e) {
        return next(e);
    }
});

// Update
rawMaterialsRouter.patch('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updateRawMaterialSchema.parse(req.body);

        const existing = await prisma.rawMaterial.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Not Found' });

        let totalCost = undefined;
        if (body.quantity !== undefined || body.costPerUnit !== undefined) {
            const q = body.quantity !== undefined ? Number(body.quantity) : Number(existing.quantity);
            const c = body.costPerUnit !== undefined ? Number(body.costPerUnit) : Number(existing.costPerUnit);
            totalCost = q * c;
        }

        const rawMaterial = await prisma.rawMaterial.update({
            where: { id },
            data: { ...body, totalCost },
        });
        return res.json({ rawMaterial });
    } catch (e) {
        return next(e);
    }
});

// Delete
rawMaterialsRouter.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.rawMaterial.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return next(e);
    }
});
