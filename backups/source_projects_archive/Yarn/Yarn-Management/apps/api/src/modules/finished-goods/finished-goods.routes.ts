import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';

export const finishedGoodsRouter = Router();

// Get Finished Goods Inventory
finishedGoodsRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const finishedGoods = await prisma.finishedGood.findMany({
            include: {
                batch: {
                    select: { batchNumber: true, rawMaterial: { select: { materialType: true } } }
                },
                warehouseLocation: { include: { warehouse: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate Stats
        const totalQuantity = finishedGoods.reduce((sum: number, item: any) => sum + Number(item.producedQuantity), 0);
        const totalCount = finishedGoods.length;

        // Group by Yarn Count
        const byType: Record<string, number> = {};
        finishedGoods.forEach((item: any) => {
            byType[item.yarnCount] = (byType[item.yarnCount] || 0) + Number(item.producedQuantity);
        });

        return res.json({
            finishedGoods,
            stats: {
                totalQuantity,
                totalCount,
                byType
            }
        });
    } catch (e) {
        return next(e);
    }
});
