import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    gstin: z.string().optional(),
    creditLimit: z.number().nonnegative().optional(),
});

export const updateCustomerSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    gstin: z.string().optional(),
    creditLimit: z.number().nonnegative().nullable().optional(),
});

export const createArPaymentSchema = z.object({
    customerId: z.string().uuid(),
    invoiceId: z.string().uuid().optional(),
    amount: z.number().positive(),
    method: z.string().optional(),
    reference: z.string().optional(),
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
});

export const createArFollowUpSchema = z.object({
    customerId: z.string().uuid(),
    invoiceId: z.string().uuid().optional(),
    dueDate: z.string().datetime().optional(),
    notes: z.string().optional(),
});

export const updateArFollowUpSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    notes: z.string().optional(),
});

export const createBadDebtProvisionSchema = z.object({
    customerId: z.string().uuid(),
    amount: z.number().positive(),
    provisionDate: z.string().datetime().optional(),
    notes: z.string().optional(),
});

export const createInvoiceSchema = z.object({
    customerId: z.string().uuid(),
    dueDate: z.string().datetime(),
    items: z.array(z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        finishedGoodId: z.string().uuid().optional(),
    })).min(1, 'At least one item required'),
    taxRate: z.number().default(0.18), // Default 18% GST
    notes: z.string().optional(),
});

export const updateInvoiceStatusSchema = z.object({
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
});
