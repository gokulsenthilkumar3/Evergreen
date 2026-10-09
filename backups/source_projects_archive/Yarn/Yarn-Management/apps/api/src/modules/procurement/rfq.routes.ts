import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { createRFQSchema, createQuotationSchema } from './procurement.schemas';

export const rfqRouter = Router();

// List all RFQs
rfqRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rfqs = await prisma.requestForQuotation.findMany({
            include: {
                _count: { select: { items: true, quotations: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ rfqs });
    } catch (e) {
        return next(e);
    }
});

// Create RFQ
rfqRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createRFQSchema.parse(req.body);
        const rfqNumber = `RFQ-${Date.now()}`;

        const rfq = await prisma.requestForQuotation.create({
            data: {
                rfqNumber,
                title: body.title,
                description: body.description,
                deadline: body.deadline ? new Date(body.deadline) : null,
                createdBy: req.userId,
                items: {
                    create: body.items
                }
            },
            include: { items: true }
        });
        return res.status(201).json({ rfq });
    } catch (e) {
        return next(e);
    }
});

// Get RFQ details with Quotations
rfqRouter.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const rfq = await prisma.requestForQuotation.findUnique({
            where: { id },
            include: {
                items: true,
                quotations: {
                    include: {
                        supplier: { select: { name: true } },
                        items: true
                    }
                }
            }
        });
        if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
        return res.json({ rfq });
    } catch (e) {
        return next(e);
    }
});

// Add Quotation to RFQ
rfqRouter.post('/:id/quotations', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = createQuotationSchema.parse(req.body);

        if (body.rfqId !== id) {
            return res.status(400).json({ message: 'RFQ ID mismatch' });
        }

        const totalAmount = body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        const quotation = await prisma.quotation.create({
            data: {
                rfqId: id,
                supplierId: body.supplierId,
                quotationNumber: body.quotationNumber,
                quotationDate: body.quotationDate ? new Date(body.quotationDate) : new Date(),
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
                totalAmount,
                notes: body.notes,
                items: {
                    create: body.items.map(item => ({
                        ...item,
                        totalPrice: item.quantity * item.unitPrice
                    }))
                }
            },
            include: { items: true }
        });

        return res.status(201).json({ quotation });
    } catch (e) {
        return next(e);
    }
});
