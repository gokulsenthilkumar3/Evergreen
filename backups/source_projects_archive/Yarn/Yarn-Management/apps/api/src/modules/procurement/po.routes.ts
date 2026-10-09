import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { createPOSchema, updatePOSchema } from './procurement.schemas';

export const poRouter = Router();

// List all POs
poRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: {
                supplier: { select: { id: true, name: true, supplierCode: true } },
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ purchaseOrders: pos });
    } catch (e) {
        return next(e);
    }
});

// Get PO by ID
poRouter.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: true,
                goodsReceiptNotes: true
            }
        });
        if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
        return res.json({ purchaseOrder: po });
    } catch (e) {
        return next(e);
    }
});

// Create PO
poRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createPOSchema.parse(req.body);

        // Generate PO Number (Simple Format: PO-timestamp)
        // In a real app, use a sequence or more robust format
        const poNumber = `PO-${Date.now()}`;

        // Calculate total amount
        const totalAmount = body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        const po = await prisma.purchaseOrder.create({
            data: {
                poNumber,
                supplierId: body.supplierId,
                expectedDeliveryDate: body.expectedDeliveryDate ? new Date(body.expectedDeliveryDate) : null,
                notes: body.notes,
                termsAndConditions: body.termsAndConditions,
                totalAmount,
                createdBy: req.userId,
                status: 'DRAFT',
                items: {
                    create: body.items.map(item => ({
                        materialType: item.materialType,
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice,
                    }))
                }
            },
            include: { items: true }
        });

        return res.status(201).json({ purchaseOrder: po });
    } catch (e) {
        return next(e);
    }
});

// Update PO
poRouter.patch('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updatePOSchema.parse(req.body);

        const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Purchase Order not found' });

        const data: any = { ...body };
        if (body.expectedDeliveryDate) {
            data.expectedDeliveryDate = new Date(body.expectedDeliveryDate);
        }

        const po = await prisma.purchaseOrder.update({
            where: { id },
            data,
            include: { items: true }
        });

        return res.json({ purchaseOrder: po });
    } catch (e) {
        return next(e);
    }
});

// Delete PO (Only if Draft)
poRouter.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.purchaseOrder.findUnique({ where: { id } });

        if (!existing) return res.status(404).json({ message: 'Purchase Order not found' });
        if (existing.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Only Draft POs can be deleted' });
        }

        await prisma.purchaseOrder.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return next(e);
    }
});
