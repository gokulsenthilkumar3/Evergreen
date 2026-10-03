import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { createGRNSchema } from './procurement.schemas';

export const grnRouter = Router();

// List GRNs
grnRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const grns = await prisma.goodsReceiptNote.findMany({
            include: {
                supplier: { select: { name: true } },
                purchaseOrder: { select: { poNumber: true } },
                _count: { select: { items: true } }
            },
            orderBy: { receivedDate: 'desc' },
        });
        return res.json({ grns });
    } catch (e) {
        return next(e);
    }
});

// Create GRN
grnRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createGRNSchema.parse(req.body);
        const grnNumber = `GRN-${Date.now()}`;

        // Create GRN
        const grn = await prisma.$transaction(async (tx: import('@prisma/client').Prisma.TransactionClient) => {
            const newGrn = await tx.goodsReceiptNote.create({
                data: {
                    grnNumber,
                    purchaseOrderId: body.purchaseOrderId,
                    supplierId: body.supplierId,
                    receivedDate: body.receivedDate ? new Date(body.receivedDate) : new Date(),
                    challanNumber: body.challanNumber,
                    invoiceNumber: body.invoiceNumber,
                    receivedBy: req.userId,
                    items: {
                        create: body.items
                    }
                },
                include: { items: true }
            });

            // Update Purchase Order received quantities if linked
            if (body.purchaseOrderId) {
                // Update PO status to PARTIALLY_RECEIVED or COMPLETED based on logic (omitted for brevity, just updating status to PARTIALLY_RECEIVED as a default if ANY item received)
                await tx.purchaseOrder.update({
                    where: { id: body.purchaseOrderId },
                    data: { status: 'PARTIALLY_RECEIVED' }
                });

                // Note: Full logic would match items and update receivedQuantity on PurchaseOrderItem
            }

            // Create Inventory (Raw Materials) from GRN Items
            for (const item of body.items) {
                // Calculate unit cost from PO item if possible, or leave 0/pending
                // For now, we assume simple inventory entry
                const batchNo = item.batchNumber || `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                await tx.rawMaterial.create({
                    data: {
                        batchNo,
                        supplierId: body.supplierId,
                        materialType: item.materialType,
                        quantity: item.quantity,
                        unit: item.unit,
                        costPerUnit: 0, // Needs to be derived or input
                        totalCost: 0,
                        qualityScore: 0,
                        receivedDate: new Date(),
                        status: 'QUALITY_CHECK', // Start in QC
                        notes: `Created from GRN: ${grnNumber}`
                    }
                });
            }

            return newGrn;
        });

        return res.status(201).json({ grn });
    } catch (e) {
        return next(e);
    }
});
