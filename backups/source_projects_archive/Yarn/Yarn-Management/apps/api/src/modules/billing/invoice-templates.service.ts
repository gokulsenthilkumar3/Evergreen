import { prisma } from '../../prisma/client';
import { recordAuditLog } from '../../utils/audit';

export async function createTemplate(userId: string, data: { name: string; htmlContent: string; isDefault?: boolean }) {
    if (data.isDefault) {
        // Unset other defaults
        await prisma.invoiceTemplate.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
        });
    }

    const template = await prisma.invoiceTemplate.create({
        data,
    });

    await recordAuditLog('invoice_template.create', { userId, entityType: 'InvoiceTemplate', entityId: template.id });
    return template;
}

export async function getTemplates() {
    return prisma.invoiceTemplate.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getTemplate(id: string) {
    return prisma.invoiceTemplate.findUnique({ where: { id } });
}

export async function updateTemplate(id: string, userId: string, data: { name?: string; htmlContent?: string; isDefault?: boolean }) {
    if (data.isDefault) {
        await prisma.invoiceTemplate.updateMany({
            where: { id: { not: id }, isDefault: true },
            data: { isDefault: false },
        });
    }

    const template = await prisma.invoiceTemplate.update({
        where: { id },
        data,
    });

    await recordAuditLog('invoice_template.update', { userId, entityType: 'InvoiceTemplate', entityId: id });
    return template;
}

export async function deleteTemplate(id: string, userId: string) {
    await prisma.invoiceTemplate.delete({ where: { id } });
    await recordAuditLog('invoice_template.delete', { userId, entityType: 'InvoiceTemplate', entityId: id });
    return true;
}
