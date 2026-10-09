import { z } from 'zod';

// Purchase Order Schemas
export const createPOSchema = z.object({
    supplierId: z.string().uuid(),
    expectedDeliveryDate: z.string().optional(), // ISO Date string
    items: z.array(z.object({
        materialType: z.string(),
        description: z.string().optional(),
        quantity: z.number().positive(),
        unit: z.string(),
        unitPrice: z.number().nonnegative(),
    })).min(1),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
});

export const updatePOSchema = z.object({
    expectedDeliveryDate: z.string().optional(),
    status: z.enum(['DRAFT', 'SENT', 'CONFIRMED', 'CANCELLED']).optional(),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
});

// RFQ Schemas
export const createRFQSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    deadline: z.string().optional(),
    items: z.array(z.object({
        materialType: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        specifications: z.string().optional(),
    })).min(1),
});

export const createQuotationSchema = z.object({
    rfqId: z.string().uuid(),
    supplierId: z.string().uuid(),
    quotationNumber: z.string().optional(),
    quotationDate: z.string().optional(),
    validUntil: z.string().optional(),
    items: z.array(z.object({
        materialType: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        unitPrice: z.number().nonnegative(),
        remarks: z.string().optional(),
    })).min(1),
    notes: z.string().optional(),
});

// GRN Schemas
export const createGRNSchema = z.object({
    purchaseOrderId: z.string().uuid().optional(),
    supplierId: z.string().uuid(),
    receivedDate: z.string().optional(),
    challanNumber: z.string().optional(),
    invoiceNumber: z.string().optional(),
    items: z.array(z.object({
        materialType: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        batchNumber: z.string().optional(),
        remarks: z.string().optional(),
    })).min(1),
    notes: z.string().optional(),
});
