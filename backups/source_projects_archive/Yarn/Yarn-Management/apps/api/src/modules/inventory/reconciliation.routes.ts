import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Zod schemas
const startReconciliationSchema = z.object({
    warehouseId: z.string(),
    notes: z.string().optional(),
});

const updateItemsSchema = z.object({
    items: z.array(z.object({
        id: z.string(), // ReconciliationItem ID
        physicalQuantity: z.number().min(0),
        notes: z.string().optional(),
    })),
});

// GET /inventory/reconciliation
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.stockReconciliation.findMany({
            include: {
                warehouse: { select: { name: true, code: true } },
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reconciliation sessions' });
    }
});

// POST /inventory/reconciliation
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { warehouseId, notes } = startReconciliationSchema.parse(req.body);

        // 1. Get all items in this warehouse
        const [rawMaterials, finishedGoods] = await Promise.all([
            prisma.rawMaterial.findMany({
                where: { warehouseLocation: { warehouseId }, status: 'IN_STOCK' },
            }),
            prisma.finishedGood.findMany({
                where: { warehouseLocation: { warehouseId } },
                include: { batch: true }
            })
        ]);

        // 2. Create the session
        const session = await prisma.stockReconciliation.create({
            data: {
                reconcileNo: `REC-${Date.now()}`,
                warehouseId,
                notes,
                startedBy: (req as any).userId,
                items: {
                    create: [
                        ...rawMaterials.map((rm: any) => ({
                            itemId: rm.id,
                            itemType: 'RAW_MATERIAL',
                            itemName: `${rm.materialType} (${rm.batchNo})`,
                            systemQuantity: Number(rm.quantity),
                        })),
                        ...finishedGoods.map((fg: any) => ({
                            itemId: fg.id,
                            itemType: 'FINISHED_GOOD',
                            itemName: `FG: ${fg.batch?.batchNumber || fg.id}`,
                            systemQuantity: Number(fg.producedQuantity),
                        }))
                    ]
                }
            },
            include: { items: true }
        });

        res.status(201).json({ session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start reconciliation session' });
    }
});

// GET /inventory/reconciliation/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const session = await prisma.stockReconciliation.findUnique({
            where: { id: req.params.id },
            include: {
                warehouse: true,
                items: { orderBy: { itemName: 'asc' } }
            }
        });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json({ session });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

// PATCH /inventory/reconciliation/:id/items
router.patch('/:id/items', authenticate, async (req: Request, res: Response) => {
    try {
        const { items } = updateItemsSchema.parse(req.body);

        for (const item of items) {
            const currentItem = await prisma.reconciliationItem.findUnique({ where: { id: item.id } });
            if (!currentItem) continue;

            await prisma.reconciliationItem.update({
                where: { id: item.id },
                data: {
                    physicalQuantity: item.physicalQuantity,
                    difference: item.physicalQuantity - Number(currentItem.systemQuantity),
                    notes: item.notes
                }
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update items' });
    }
});

// POST /inventory/reconciliation/:id/finalize
router.post('/:id/finalize', authenticate, async (req: Request, res: Response) => {
    try {
        const session = await prisma.stockReconciliation.findUnique({
            where: { id: req.params.id },
            include: { items: true, warehouse: true }
        });

        if (!session || session.status !== 'PENDING') {
            return res.status(400).json({ error: 'Invalid session or already finalized' });
        }

        // Process adjustments
        await prisma.$transaction(async (tx: any) => {
            const defaultLocation = await tx.warehouseLocation.findFirst({ where: { warehouseId: session.warehouseId } });

            for (const item of session.items) {
                if (item.physicalQuantity === null) continue;

                const diff = Number(item.physicalQuantity) - Number(item.systemQuantity);
                if (diff === 0) continue;

                // Update item stock level
                if (item.itemType === 'RAW_MATERIAL') {
                    await tx.rawMaterial.update({
                        where: { id: item.itemId },
                        data: { quantity: { increment: diff } }
                    });
                } else {
                    await tx.finishedGood.update({
                        where: { id: item.itemId },
                        data: { producedQuantity: { increment: diff } }
                    });
                }

                // Create Movement Log
                await tx.stockMovementLog.create({
                    data: {
                        type: 'ADJUSTMENT',
                        itemId: item.itemId,
                        itemType: item.itemType,
                        quantity: Math.abs(diff),
                        locationId: defaultLocation?.id,
                        performedBy: (req as any).userId,
                        referenceType: 'RECONCILIATION',
                        referenceId: session.id,
                    }
                });
            }

            // Update session status
            await tx.stockReconciliation.update({
                where: { id: session.id },
                data: {
                    status: 'COMPLETED',
                    finalizedBy: (req as any).userId,
                    finalizedAt: new Date()
                }
            });
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to finalize reconciliation' });
    }
});

export default router;
