import { z } from 'zod';

export const createRawMaterialSchema = z.object({
    batchNo: z.string().min(1, 'Batch number is required').max(50),
    supplierId: z.string().uuid('Invalid Supplier ID'),
    materialType: z.string().min(1, 'Material type is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().default('kg'),
    costPerUnit: z.number().min(0, 'Cost cannot be negative'),
    qualityScore: z.number().min(1).max(10, 'Quality score must be 1-10'),
    moistureContent: z.number().min(0).max(100).nullish(),
    receivedDate: z.string().datetime(),
    warehouseLocationId: z.string().uuid().nullish(),
    legacyLocation: z.string().nullish(),
    status: z.enum(['IN_STOCK', 'QUALITY_CHECK', 'CONSUMED', 'RETURNED']).default('IN_STOCK'),
    notes: z.string().nullish(),
});

export const updateRawMaterialSchema = createRawMaterialSchema.partial();
