import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type PrismaClient = typeof prisma;

export interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export const createInvoiceSchema = z.object({
    customerName: z.string().min(1),
    date: z.string().datetime().optional(),
    billingCycle: z.string().optional(),
    items: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        price: z.number().min(0)
    })),
    isRecurring: z.boolean().optional(),
    frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
    notes: z.string().optional(),
    templateName: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const getInvoices = async () => {
    return await prisma.invoice.findMany({
        include: { items: true, recurringConfig: true },
        orderBy: { date: 'desc' },
    });
};

export const getInvoiceById = async (id: string) => {
    return await prisma.invoice.findUnique({
        where: { id },
        include: {
            items: true,
            recurringConfig: true,
            customer: true,
            invoicePayments: true,
            history: true
        },
    });
};

function toDecimal(n: number) {
    return new Decimal(n);
}

function diffDays(from: Date, to: Date) {
    const ms = to.getTime() - from.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

async function resolveCustomerIdByName(tx: Prisma.TransactionClient, customerName: string) {
    const trimmed = customerName.trim();
    if (!trimmed) return null;

    const customer = await tx.customer.findUnique({ where: { name: trimmed } });
    return customer?.id ?? null;
}

export const createInvoice = async (body: CreateInvoiceInput) => {
    const totalAmount = body.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = totalAmount * 0.18;

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const invoiceCount = await tx.invoice.count();
        const customerId = await resolveCustomerIdByName(tx, body.customerName);
        const invoice = await tx.invoice.create({
            data: {
                invoiceNumber: generateInvoiceNumber(body.customerName, invoiceCount + 1),
                customerName: body.customerName,
                customerId,
                date: body.date ? new Date(body.date) : new Date(),
                billingCycle: body.billingCycle || new Date().toLocaleDateString('default', { month: 'short', year: 'numeric' }),
                totalAmount: new Prisma.Decimal(totalAmount + taxAmount),
                taxAmount: new Prisma.Decimal(taxAmount),
                status: 'PENDING',
                notes: body.notes,
                templateName: body.templateName || 'STANDARD',
                isRecurring: body.isRecurring || false,
                items: {
                    create: body.items.map(item => ({
                        description: item.description,
                        quantity: new Prisma.Decimal(item.quantity),
                        unitPrice: new Prisma.Decimal(item.price),
                        totalPrice: new Prisma.Decimal(item.quantity * item.price),
                    }))
                }
            },
            include: { items: true }
        });
        // ... rest of createInvoice

        if (body.isRecurring && body.frequency) {
            const nextRunDate = new Date();
            if (body.frequency === 'MONTHLY') nextRunDate.setMonth(nextRunDate.getMonth() + 1);
            else if (body.frequency === 'QUARTERLY') nextRunDate.setMonth(nextRunDate.getMonth() + 3);
            else if (body.frequency === 'ANNUALLY') nextRunDate.setFullYear(nextRunDate.getFullYear() + 1);

            await tx.recurringBillingConfig.create({
                data: {
                    invoiceId: invoice.id,
                    frequency: body.frequency,
                    nextRunDate,
                }
            });
        }

        return invoice;
    });
};

export const deleteInvoice = async (id: string) => {
    try {
        await prisma.invoice.delete({ where: { id } });
        return true;
    } catch {
        return false;
    }
};

export const updateInvoiceStatus = async (id: string, status: any) => {
    try {
        return await prisma.invoice.update({
            where: { id },
            data: { status },
            include: { items: true }
        });
    } catch {
        return null;
    }
};

export const processRecurringInvoices = async () => {
    const today = new Date();
    const dueConfigs = await prisma.recurringBillingConfig.findMany({
        where: {
            isActive: true,
            nextRunDate: { lte: today },
        },
        include: { invoice: { include: { items: true } } }
    });

    for (const config of dueConfigs) {
        // Generate new invoice based on the template (current config.invoice)
        await prisma.$transaction(async (tx) => {
            const invoiceCount = await tx.invoice.count();
            const newInvoice = await tx.invoice.create({
                data: {
                    invoiceNumber: generateInvoiceNumber(config.invoice.customerName, invoiceCount + 1),
                    customerName: config.invoice.customerName,
                    date: new Date(),
                    billingCycle: new Date().toLocaleDateString('default', { month: 'short', year: 'numeric' }),
                    totalAmount: config.invoice.totalAmount,
                    taxAmount: config.invoice.taxAmount,
                    status: 'PENDING',
                    notes: `Auto-generated from ${config.invoice.invoiceNumber}. ${config.invoice.notes || ''}`,
                    isRecurring: false,
                    templateName: config.invoice.templateName,
                    items: {
                        create: config.invoice.items.map((item: any) => ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                        }))
                    }
                }
            });

            // Update next run date
            const nextRunDate = new Date(config.nextRunDate);
            if (config.frequency === 'MONTHLY') nextRunDate.setMonth(nextRunDate.getMonth() + 1);
            else if (config.frequency === 'QUARTERLY') nextRunDate.setMonth(nextRunDate.getMonth() + 3);
            else if (config.frequency === 'ANNUALLY') nextRunDate.setFullYear(nextRunDate.getFullYear() + 1);

            await tx.recurringBillingConfig.update({
                where: { id: config.id },
                data: { nextRunDate }
            });
        });
    }

    return dueConfigs.length;
};

export const checkOverdueInvoices = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pendingInvoices = await prisma.invoice.findMany({
        where: {
            status: 'PENDING',
            date: { lte: thirtyDaysAgo },
        }
    });

    for (const invoice of pendingInvoices) {
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'OVERDUE' }
        });

        // Trigger notifications (could be imported dynamically to avoid circular deps if needed)
        // For now we'll just log or assume a separate process handles the aggregate notification
    }

    return pendingInvoices.length;
};

const generateInvoiceNumber = (customerName: string, sequence: number) => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const datePart = `${yyyy}${mm}${dd}`;

    const custPart = (customerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() + 'XXXX').substring(0, 4);
    const seqPart = String(sequence).padStart(4, '0');

    return `${datePart}${custPart}${seqPart}`;
};

export const createCreditNoteSchema = z.object({
    invoiceId: z.string().optional(),
    customerName: z.string().min(1),
    amount: z.number().positive(),
    reason: z.enum(['RETURNED_GOODS', 'OVERCHARGED', 'DAMAGED_ITEMS', 'OTHER']),
    notes: z.string().optional(),
});

export type CreateCreditNoteInput = z.infer<typeof createCreditNoteSchema>;

export const createCreditNote = async (body: CreateCreditNoteInput) => {
    return await prisma.$transaction(async (tx) => {
        const count = await tx.creditNote.count();
        const creditNote = await tx.creditNote.create({
            data: {
                creditNoteNumber: `CN-${generateInvoiceNumber(body.customerName, count + 1)}`,
                customerName: body.customerName,
                invoiceId: body.invoiceId || null,
                amount: new Prisma.Decimal(body.amount),
                reason: body.reason,
                notes: body.notes,
            }
        });

        // Optionally update invoice status if linked
        if (body.invoiceId && body.reason === 'OVERCHARGED') {
            // Logic to adjust invoice could go here
        }

        return creditNote;
    });
};

export const getCreditNotes = async () => {
    return await prisma.creditNote.findMany({
        include: { invoice: true },
        orderBy: { date: 'desc' },
    });
};

export const createDebitNoteSchema = z.object({
    invoiceId: z.string().optional(),
    customerName: z.string().min(1),
    amount: z.number().positive(),
    reason: z.string().min(1),
    notes: z.string().optional(),
});

export type CreateDebitNoteInput = z.infer<typeof createDebitNoteSchema>;

export const createDebitNote = async (body: CreateDebitNoteInput) => {
    return await prisma.$transaction(async (tx) => {
        const count = await tx.debitNote.count();
        return await tx.debitNote.create({
            data: {
                debitNoteNumber: `DN-${generateInvoiceNumber(body.customerName, count + 1)}`,
                customerName: body.customerName,
                invoiceId: body.invoiceId || null,
                amount: new Prisma.Decimal(body.amount),
                reason: body.reason,
                notes: body.notes,
            }
        });
    });
};

export const getDebitNotes = async () => {
    return await prisma.debitNote.findMany({
        include: { invoice: true },
        orderBy: { date: 'desc' },
    });
};

export const getCustomers = async () => {
    return await prisma.customer.findMany({
        orderBy: { name: 'asc' },
    });
};

// ... (imports)

export const createCustomer = async (body: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    creditLimit?: number;
}) => {
    return await prisma.customer.create({
        data: {
            name: body.name.trim(),
            email: body.email || null,
            phone: body.phone || null,
            // Map simple address string to addresses relation
            addresses: body.address ? {
                create: {
                    line1: body.address,
                    city: 'Unknown',
                    state: 'Unknown',
                    pincode: '000000',
                    isDefault: true,
                    type: 'BILLING'
                }
            } : undefined,
            gstin: body.gstin || null,
            creditLimit: body.creditLimit === undefined ? null : toDecimal(body.creditLimit),
        }
    });
};

export const updateCustomer = async (id: string, body: {
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    creditLimit?: number | null;
}) => {
    return await prisma.customer.update({
        where: { id },
        data: {
            email: body.email === undefined ? undefined : (body.email || null),
            phone: body.phone === undefined ? undefined : (body.phone || null),
            // address: body.address === undefined ? undefined : (body.address || null), // TODO: Handle address update with new schema
            gstin: body.gstin === undefined ? undefined : (body.gstin || null),
            creditLimit: body.creditLimit === undefined ? undefined : (body.creditLimit === null ? null : toDecimal(body.creditLimit)),
        },
    });
};

export const deleteCustomer = async (id: string) => {
    try {
        await prisma.customer.delete({ where: { id } });
        return true;
    } catch {
        return false;
    }
};

type LedgerTransaction = {
    type: 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'BAD_DEBT_PROVISION';
    id: string;
    date: Date;
    description: string;
    debit: number;
    credit: number;
    invoiceId?: string | null;
};

async function computeCustomerBalance(customerId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return null;

    const [invoices, payments, creditNotes, debitNotes] = await Promise.all([
        prisma.invoice.findMany({ where: { customerId }, select: { id: true, totalAmount: true, status: true } }),
        prisma.aRPayment.findMany({ where: { customerId }, select: { id: true, amount: true } }),
        prisma.creditNote.findMany({ where: { customerName: customer.name }, select: { id: true, amount: true } }),
        prisma.debitNote.findMany({ where: { customerName: customer.name }, select: { id: true, amount: true } }),
    ]);

    const invoiceTotal = invoices
        .filter((i) => i.status !== 'VOID')
        .reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const paymentTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const creditTotal = creditNotes.reduce((sum, c) => sum + Number(c.amount), 0);
    const debitTotal = debitNotes.reduce((sum, d) => sum + Number(d.amount), 0);

    return invoiceTotal + debitTotal - creditTotal - paymentTotal;
}

export const getArCustomersSummary = async (asOf?: Date) => {
    const now = asOf ?? new Date();
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });

    const invoices = await prisma.invoice.findMany({
        where: { status: { in: ['PENDING', 'OVERDUE'] } },
        select: { id: true, customerId: true, date: true, totalAmount: true },
    });

    const payments = await prisma.aRPayment.findMany({
        select: { id: true, invoiceId: true, amount: true },
    });

    const paymentsByInvoice = new Map<string, number>();
    payments.forEach((p) => {
        if (!p.invoiceId) return;
        paymentsByInvoice.set(p.invoiceId, (paymentsByInvoice.get(p.invoiceId) || 0) + Number(p.amount));
    });

    const summary = [] as any[];
    for (const c of customers) {
        const custInvoices = invoices.filter((i) => i.customerId === c.id);
        let totalOutstanding = 0;
        let aging30 = 0;
        let aging60 = 0;
        let aging90 = 0;

        for (const inv of custInvoices) {
            const paidAgainst = paymentsByInvoice.get(inv.id) || 0;
            const outstanding = Math.max(0, Number(inv.totalAmount) - paidAgainst);
            if (outstanding <= 0) continue;

            totalOutstanding += outstanding;
            const age = diffDays(new Date(inv.date), now);
            if (age <= 30) aging30 += outstanding;
            else if (age <= 60) aging60 += outstanding;
            else aging90 += outstanding;
        }

        summary.push({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            gstin: c.gstin,
            creditLimit: c.creditLimit,
            totalOutstanding,
            aging: {
                d30: aging30,
                d60: aging60,
                d90: aging90,
            },
        });
    }

    return summary;
};

export const getCustomerLedger = async (customerId: string) => {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return null;

    const [invoices, payments, creditNotes, debitNotes, badDebt] = await Promise.all([
        prisma.invoice.findMany({
            where: { customerId },
            select: { id: true, invoiceNumber: true, date: true, totalAmount: true, status: true },
            orderBy: { date: 'asc' },
        }),
        prisma.aRPayment.findMany({
            where: { customerId },
            select: { id: true, invoiceId: true, date: true, amount: true, method: true, reference: true },
            orderBy: { date: 'asc' },
        }),
        prisma.creditNote.findMany({
            where: { customerName: customer.name },
            select: { id: true, invoiceId: true, date: true, amount: true, creditNoteNumber: true },
            orderBy: { date: 'asc' },
        }),
        prisma.debitNote.findMany({
            where: { customerName: customer.name },
            select: { id: true, invoiceId: true, date: true, amount: true, debitNoteNumber: true },
            orderBy: { date: 'asc' },
        }),
        prisma.badDebtProvision.findMany({
            where: { customerId },
            select: { id: true, provisionDate: true, amount: true },
            orderBy: { provisionDate: 'asc' },
        }),
    ]);

    const tx: LedgerTransaction[] = [];

    invoices
        .filter((i) => i.status !== 'VOID')
        .forEach((i) => {
            tx.push({
                type: 'INVOICE',
                id: i.id,
                date: i.date,
                description: `Invoice ${i.invoiceNumber}`,
                debit: Number(i.totalAmount),
                credit: 0,
                invoiceId: i.id,
            });
        });

    payments.forEach((p) => {
        tx.push({
            type: 'PAYMENT',
            id: p.id,
            date: p.date,
            description: `Payment${p.method ? ` (${p.method})` : ''}${p.reference ? ` - ${p.reference}` : ''}`,
            debit: 0,
            credit: Number(p.amount),
            invoiceId: p.invoiceId,
        });
    });

    creditNotes.forEach((c) => {
        tx.push({
            type: 'CREDIT_NOTE',
            id: c.id,
            date: c.date,
            description: `Credit Note ${c.creditNoteNumber}`,
            debit: 0,
            credit: Number(c.amount),
            invoiceId: c.invoiceId,
        });
    });

    debitNotes.forEach((d) => {
        tx.push({
            type: 'DEBIT_NOTE',
            id: d.id,
            date: d.date,
            description: `Debit Note ${d.debitNoteNumber}`,
            debit: Number(d.amount),
            credit: 0,
            invoiceId: d.invoiceId,
        });
    });

    badDebt.forEach((b) => {
        tx.push({
            type: 'BAD_DEBT_PROVISION',
            id: b.id,
            date: b.provisionDate,
            description: 'Bad debt provision',
            debit: 0,
            credit: Number(b.amount),
            invoiceId: null,
        });
    });

    tx.sort((a, b) => a.date.getTime() - b.date.getTime());

    let running = 0;
    const transactions = tx.map((t) => {
        running += (t.debit - t.credit);
        return {
            ...t,
            balance: running,
        };
    });

    const outstandingBalance = await computeCustomerBalance(customerId);

    return {
        customer,
        outstandingBalance,
        transactions,
    };
};

export const createArPayment = async (userId: string | undefined, body: {
    customerId: string;
    invoiceId?: string;
    amount: number;
    method?: string;
    reference?: string;
    date?: string;
    notes?: string;
}) => {
    return await prisma.aRPayment.create({
        data: {
            customerId: body.customerId,
            invoiceId: body.invoiceId || null,
            amount: toDecimal(body.amount),
            method: body.method || null,
            reference: body.reference || null,
            date: body.date ? new Date(body.date) : new Date(),
            notes: body.notes || null,
            createdBy: userId || null,
        }
    });
};

export const getArFollowUps = async (filters?: { status?: string }) => {
    return await prisma.aRFollowUp.findMany({
        where: {
            status: (filters?.status as any) || undefined,
        },
        include: { customer: true, invoice: true },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
};

export const createArFollowUp = async (userId: string | undefined, body: {
    customerId: string;
    invoiceId?: string;
    dueDate?: string;
    notes?: string;
}) => {
    return await prisma.aRFollowUp.create({
        data: {
            customerId: body.customerId,
            invoiceId: body.invoiceId || null,
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            notes: body.notes || null,
            createdBy: userId || null,
        },
        include: { customer: true, invoice: true },
    });
};

export const updateArFollowUp = async (id: string, body: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    dueDate?: string | null;
    notes?: string;
}) => {
    const status = body.status;
    const completedAt = status === 'COMPLETED' ? new Date() : undefined;
    return await prisma.aRFollowUp.update({
        where: { id },
        data: {
            status: status as any,
            dueDate: body.dueDate === undefined ? undefined : (body.dueDate === null ? null : new Date(body.dueDate)),
            notes: body.notes === undefined ? undefined : (body.notes || null),
            completedAt,
        },
        include: { customer: true, invoice: true },
    });
};

export const createBadDebtProvision = async (userId: string | undefined, body: {
    customerId: string;
    amount: number;
    provisionDate?: string;
    notes?: string;
}) => {
    return await prisma.badDebtProvision.create({
        data: {
            customerId: body.customerId,
            amount: toDecimal(body.amount),
            provisionDate: body.provisionDate ? new Date(body.provisionDate) : new Date(),
            notes: body.notes || null,
            createdBy: userId || null,
        },
        include: { customer: true },
    });
};

export const getCollectionMetrics = async () => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [paidInvoices, totalInvoices] = await Promise.all([
        prisma.invoice.count({ where: { status: 'PAID', date: { gte: since } } }),
        prisma.invoice.count({ where: { date: { gte: since } } }),
    ]);

    const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
    return {
        last30Days: {
            totalInvoices,
            paidInvoices,
            collectionRate,
        }
    };
};
