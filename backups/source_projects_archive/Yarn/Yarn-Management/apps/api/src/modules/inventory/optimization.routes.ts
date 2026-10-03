import { Router } from 'express';
import { prisma } from '../../prisma/client';
import { z } from 'zod';

const router = Router();

// Zod schemas for validation
const optimizationSettingsSchema = z.object({
    materialType: z.string(),
    reorderPoint: z.number().min(0),
    safetyStock: z.number().min(0),
    leadTimeDays: z.number().min(1),
    eoq: z.number().optional(),
});

// GET /inventory/optimization/settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await prisma.inventoryOptimization.findMany();
        res.json({ settings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch optimization settings' });
    }
});

// PATCH /inventory/optimization/settings
router.patch('/settings', async (req, res) => {
    try {
        const data = optimizationSettingsSchema.parse(req.body);
        const settings = await prisma.inventoryOptimization.upsert({
            where: { materialType: data.materialType },
            update: {
                reorderPoint: data.reorderPoint,
                safetyStock: data.safetyStock,
                leadTimeDays: data.leadTimeDays,
                eoq: data.eoq,
            },
            create: {
                materialType: data.materialType,
                reorderPoint: data.reorderPoint,
                safetyStock: data.safetyStock,
                leadTimeDays: data.leadTimeDays,
                eoq: data.eoq,
            },
        });
        res.json({ settings });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Failed to update optimization settings' });
    }
});

// GET /inventory/optimization/analysis
router.get('/analysis', async (req, res) => {
    try {
        // 1. Get current stock levels per material type
        const rawMaterials = await prisma.rawMaterial.findMany({
            where: { status: 'IN_STOCK' },
        });

        const stockLevels: Record<string, number> = {};
        rawMaterials.forEach((m: any) => {
            stockLevels[m.materialType] = (stockLevels[m.materialType] || 0) + Number(m.quantity);
        });

        // 2. Get optimization settings
        const settings = await prisma.inventoryOptimization.findMany();
        const settingsMap = new Map(settings.map((s: any) => [s.materialType, s]));

        // 3. Identify Reorder Alerts
        const alerts = [];
        for (const [materialType, totalStock] of Object.entries(stockLevels)) {
            const setting = settingsMap.get(materialType);
            if (setting && totalStock <= Number(setting.reorderPoint)) {
                alerts.push({
                    materialType,
                    currentStock: totalStock,
                    reorderPoint: Number(setting.reorderPoint),
                    status: totalStock <= Number(setting.safetyStock) ? 'CRITICAL' : 'WARNING',
                });
            }
        }

        // 4. ABC Analysis (Basic version based on current stock value)
        const materialValues = rawMaterials.map((m: any) => ({
            materialType: m.materialType,
            value: Number(m.quantity) * Number(m.costPerUnit)
        }));

        const valuePerType: Record<string, number> = {};
        materialValues.forEach((v: any) => {
            valuePerType[v.materialType] = (valuePerType[v.materialType] || 0) + v.value;
        });

        const sortedTypes = Object.entries(valuePerType).sort((a, b) => b[1] - a[1]);
        const totalValue = sortedTypes.reduce((acc: number, curr: any) => acc + curr[1], 0);

        let cumulativeValue = 0;
        const abcAnalysis = sortedTypes.map(([materialType, value]) => {
            cumulativeValue += value;
            const percentage = (cumulativeValue / totalValue) * 100;
            let category = 'C';
            if (percentage <= 70) category = 'A';
            else if (percentage <= 90) category = 'B';

            return { materialType, value, category };
        });

        // 5. Dead Stock (Items received over 90 days ago and still in stock)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const deadStock = rawMaterials.filter((m: any) => new Date(m.receivedDate) < ninetyDaysAgo);

        // 6. turnover ratio (Placeholder for now, requires consumption history)
        const turnoverRatio = 0.5; // Dummy value

        res.json({
            alerts,
            abcAnalysis,
            deadStockCount: deadStock.length,
            deadStockValue: deadStock.reduce((acc: number, curr: any) => acc + (Number(curr.quantity) * Number(curr.costPerUnit)), 0),
            turnoverRatio
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to run inventory analysis' });
    }
});

export default router;
