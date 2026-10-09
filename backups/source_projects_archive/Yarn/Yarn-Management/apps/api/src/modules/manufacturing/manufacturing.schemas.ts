import { z } from 'zod';

export const createBatchSchema = z.object({
    batchNumber: z.string().min(1, 'Batch number is required'),
    rawMaterialId: z.string().uuid('Invalid Raw Material ID'),
    inputQuantity: z.number().positive('Quantity must be positive'),
});

export const updateBatchSchema = z.object({
    batchNumber: z.string().min(1).optional(),
    rawMaterialId: z.string().uuid().optional(),
    inputQuantity: z.number().positive().optional(),
    currentStage: z.enum([
        'PLANNED', 'MIXING', 'CARDING', 'DRAWING', 'ROVING', 'SPINNING', 'WINDING', 'COMPLETED'
    ]).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const updateStageSchema = z.object({
    stage: z.enum([
        'PLANNED', 'MIXING', 'CARDING', 'DRAWING', 'ROVING', 'SPINNING', 'WINDING', 'COMPLETED'
    ]),
});

export const logWastageSchema = z.object({
    batchId: z.string().uuid(),
    stage: z.enum([
        'PLANNED', 'MIXING', 'CARDING', 'DRAWING', 'ROVING', 'SPINNING', 'WINDING', 'COMPLETED'
    ]),
    quantity: z.number().positive(),
    wasteType: z.enum(['Hard Waste', 'Soft Waste', 'Sweepings', 'Invisible Loss', 'REUSABLE', 'NON_REUSABLE']),
    reason: z.string().optional(),
});

export const completeBatchSchema = z.object({
    yarnCount: z.string().min(1, 'Yarn count is required'),
    producedQuantity: z.number().positive(),
    qualityGrade: z.string().optional(),
});
