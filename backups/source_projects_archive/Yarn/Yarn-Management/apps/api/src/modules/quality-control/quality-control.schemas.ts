import { z } from 'zod';

// Inspection schemas
export const createInspectionSchema = z.object({
    inspectionNumber: z.string().min(1),
    entityType: z.enum(['RAW_MATERIAL', 'PRODUCTION_BATCH']),
    entityId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
    inspectorId: z.string().uuid().optional(),
    inspectionDate: z.string().datetime().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    result: z.enum(['PASS', 'FAIL', 'CONDITIONAL_PASS']).optional(),
    checklistItems: z.array(z.object({
        item: z.string(),
        criteria: z.string(),
        result: z.enum(['PASS', 'FAIL', 'N/A']),
        notes: z.string().nullable().optional(),
    })),
    notes: z.string().optional(),
    photoUrls: z.array(z.string()).optional(),
});

export const updateInspectionSchema = createInspectionSchema.partial();

// Quality Test schemas
export const createQualityTestSchema = z.object({
    testNumber: z.string().min(1),
    entityType: z.enum(['RAW_MATERIAL', 'PRODUCTION_BATCH']),
    entityId: z.string().uuid(),
    testDate: z.string().datetime().optional(),
    testParameters: z.array(z.object({
        parameter: z.string(),
        expectedValue: z.string().optional(),
        actualValue: z.string(),
        unit: z.string().optional(),
        weight: z.number().min(0).max(100).optional(), // For weighted scoring
        passed: z.boolean(),
    })),
    qualityScore: z.number().min(0).max(100).optional(),
    qualityGrade: z.string().optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    certificateUrl: z.string().optional(),
    testedBy: z.string().optional(),
    notes: z.string().nullable().optional(),
});

export const updateQualityTestSchema = createQualityTestSchema.partial();

// Defect Log schemas
export const createDefectLogSchema = z.object({
    defectNumber: z.string().min(1),
    entityType: z.enum(['RAW_MATERIAL', 'PRODUCTION_BATCH', 'FINISHED_GOOD']),
    entityId: z.string().uuid(),
    defectCategory: z.string().min(1),
    defectType: z.string().min(1),
    severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
    quantity: z.number().positive().optional(),
    description: z.string().min(1),
    rootCause: z.string().optional(),
    correctiveAction: z.string().optional(),
    actionStatus: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    actionDueDate: z.string().datetime().optional(),
    actionCompletedDate: z.string().datetime().optional(),
    photoUrls: z.array(z.string()).optional(),
    reportedBy: z.string().optional(),
    assignedTo: z.string().uuid().optional(),
});

export const updateDefectLogSchema = createDefectLogSchema.partial();

// Inspection Template schemas
export const createInspectionTemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    entityType: z.enum(['RAW_MATERIAL', 'PRODUCTION_BATCH']),
    checklistItems: z.array(z.object({
        item: z.string(),
        criteria: z.string(),
        required: z.boolean().optional(),
    })),
    testParameters: z.array(z.object({
        parameter: z.string(),
        expectedRange: z.string().optional(),
        unit: z.string().optional(),
        weight: z.number().min(0).max(100).optional(),
    })).optional(),
    isActive: z.boolean().optional(),
});

export const updateInspectionTemplateSchema = createInspectionTemplateSchema.partial();
