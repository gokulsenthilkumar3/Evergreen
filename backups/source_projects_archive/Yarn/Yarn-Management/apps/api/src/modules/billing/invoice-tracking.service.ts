import { prisma } from '../../prisma/client';
import { recordAuditLog } from '../../utils/audit';
import { InvoiceStatus } from '@prisma/client';
import crypto from 'crypto';

/**
 * Generate a unique payment link token
 */
function generatePaymentToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Update invoice status and track timestamps
 */
export async function updateInvoiceTracking(
    invoiceId: string,
    userId: string,
    status: InvoiceStatus,
    notes?: string
) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    });

    if (!invoice) throw new Error('Invoice not found');

    const updates: any = {
        status,
        notes: notes ? (invoice.notes ? `${invoice.notes}\n${notes}` : notes) : invoice.notes,
    };

    // Update timestamps based on status
    const now = new Date();
    if (status === 'SENT' && !invoice.sentAt) updates.sentAt = now;
    if (status === 'VIEWED' && !invoice.viewedAt) updates.viewedAt = now;
    if (status === 'PAID' && !invoice.paidAt) updates.paidAt = now;

    // Generate payment link if sending
    if (status === 'SENT' && !invoice.paymentLinkToken) {
        updates.paymentLinkToken = generatePaymentToken();
        // In a real app, you'd construct the full URL here, e.g., `${env.APP_URL}/pay/${token}`
        // updates.paymentLink = ...
    }

    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: updates,
        include: {
            customer: true // Return customer info for UI updates
        }
    });

    await recordAuditLog('invoice.status_update', {
        userId,
        entityType: 'Invoice',
        entityId: invoiceId,
        metadata: { oldStatus: invoice.status, newStatus: status },
    });

    return updatedInvoice;
}

/**
 * Create a reminder
 */
export async function createReminder(
    userId: string,
    data: {
        invoiceId: string;
        reminderType: 'AUTO' | 'MANUAL';
        nextReminderAt?: Date;
    }
) {
    const reminder = await prisma.invoiceReminder.create({
        data: {
            invoiceId: data.invoiceId,
            reminderType: data.reminderType,
            sentAt: new Date(),
            nextReminderAt: data.nextReminderAt,
        },
    });

    await recordAuditLog('invoice.reminder_sent', {
        userId,
        entityType: 'Invoice',
        entityId: data.invoiceId,
        metadata: { reminderId: reminder.id, type: data.reminderType },
    });

    return reminder;
}

/**
 * Get invoice timeline/tracking info
 */
export async function getInvoiceTracking(invoiceId: string) {
    return await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: {
            id: true,
            status: true,
            sentAt: true,
            viewedAt: true,
            paidAt: true,
            createdAt: true,
            updatedAt: true,
            paymentLinkToken: true,
            reminders: {
                orderBy: { sentAt: 'desc' },
            },
        },
    });
}
