// Enhanced Invoice Management Functions

import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Record a partial payment for an invoice
 */
export async function recordPartialPayment(invoiceId: string, body: {
    amount: number;
    paymentMethod: string;
    paymentDate?: string;
    reference?: string;
    notes?: string;
}) {
    return await prisma.$transaction(async (tx) => {
        // Get invoice
        const invoice = await tx.invoice.findUnique({
            where: { id: invoiceId },
            include: { invoicePayments: true },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        if (invoice.isLocked && invoice.status === 'PAID') {
            throw new Error('Cannot add payment to fully paid invoice');
        }

        const currentBalance = Number(invoice.balance || invoice.totalAmount);

        if (body.amount > currentBalance) {
            throw new Error(`Payment amount (₹${body.amount}) exceeds remaining balance (₹${currentBalance})`);
        }

        // Generate receipt number
        const paymentCount = await tx.invoicePayment.count();
        const receiptNumber = `RCP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(paymentCount + 1).padStart(6, '0')}`;

        // Create payment record
        const payment = await tx.invoicePayment.create({
            data: {
                invoiceId,
                receiptNumber,
                amount: new Prisma.Decimal(body.amount),
                paymentMethod: body.paymentMethod,
                paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
                reference: body.reference || null,
                notes: body.notes || null,
            },
        });

        // Update invoice
        const newPaidAmount = Number(invoice.paidAmount || 0) + body.amount;
        const newBalance = Number(invoice.totalAmount) - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'PAID' : (newPaidAmount > 0 ? 'PARTIALLY_PAID' : invoice.status);

        await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: new Prisma.Decimal(newPaidAmount),
                balance: new Prisma.Decimal(Math.max(0, newBalance)),
                status: newStatus as any,
                paidAt: newStatus === 'PAID' ? new Date() : invoice.paidAt,
            },
        });

        // Record history
        await tx.invoiceHistory.create({
            data: {
                invoiceId,
                action: 'PAYMENT_RECEIVED',
                description: `Payment of ₹${body.amount} received via ${body.paymentMethod}`,
                newValue: receiptNumber,
            },
        });

        return payment;
    });
}

/**
 * Get all payments for an invoice
 */
export async function getInvoicePayments(invoiceId: string) {
    return await prisma.invoicePayment.findMany({
        where: { invoiceId },
        orderBy: { paymentDate: 'desc' },
    });
}

/**
 * Get invoice history/audit trail
 */
export async function getInvoiceHistory(invoiceId: string) {
    return await prisma.invoiceHistory.findMany({
        where: { invoiceId },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Create invoice for a specific month
 */
export async function createMonthlyInvoice(body: {
    customerName: string;
    month: string; // YYYY-MM format
    items: Array<{ description: string; quantity: number; price: number }>;
    notes?: string;
    templateName?: string;
}) {
    const totalAmount = body.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = totalAmount * 0.18;
    const grandTotal = totalAmount + taxAmount;

    return await prisma.$transaction(async (tx) => {
        const invoiceCount = await tx.invoice.count();
        const customerId = await resolveCustomerIdByName(tx, body.customerName);

        // Parse month to set invoice date to first of month
        const [year, month] = body.month.split('-').map(Number);
        const invoiceDate = new Date(year, month - 1, 1);

        const invoice = await tx.invoice.create({
            data: {
                invoiceNumber: generateInvoiceNumber(body.customerName, invoiceCount + 1),
                customerName: body.customerName,
                customerId,
                date: invoiceDate,
                invoiceMonth: body.month,
                billingCycle: invoiceDate.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
                totalAmount: new Prisma.Decimal(grandTotal),
                balance: new Prisma.Decimal(grandTotal), // Initialize balance to total
                taxAmount: new Prisma.Decimal(taxAmount),
                status: 'PENDING',
                notes: body.notes,
                templateName: body.templateName || 'STANDARD',
                isLocked: true,
                items: {
                    create: body.items.map(item => ({
                        description: item.description,
                        quantity: new Prisma.Decimal(item.quantity),
                        unitPrice: new Prisma.Decimal(item.price),
                        totalPrice: new Prisma.Decimal(item.quantity * item.price),
                    })),
                },
            },
            include: { items: true },
        });

        // Record creation in history
        await tx.invoiceHistory.create({
            data: {
                invoiceId: invoice.id,
                action: 'CREATED',
                description: `Invoice created for ${body.month}`,
            },
        });

        return invoice;
    });
}

/**
 * Get invoices by month
 */
export async function getInvoicesByMonth(month: string) {
    return await prisma.invoice.findMany({
        where: { invoiceMonth: month },
        include: { items: true, invoicePayments: true },
        orderBy: { date: 'desc' },
    });
}

/**
 * Helper to resolve customer ID by name
 */
async function resolveCustomerIdByName(tx: Prisma.TransactionClient, customerName: string) {
    const trimmed = customerName.trim();
    if (!trimmed) return null;
    const customer = await tx.customer.findUnique({ where: { name: trimmed } });
    return customer?.id ?? null;
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(customerName: string, sequence: number) {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const datePart = `${yyyy}${mm}${dd}`;
    const custPart = (customerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() + 'XXXX').substring(0, 4);
    const seqPart = String(sequence).padStart(4, '0');
    return `${datePart}${custPart}${seqPart}`;
}
