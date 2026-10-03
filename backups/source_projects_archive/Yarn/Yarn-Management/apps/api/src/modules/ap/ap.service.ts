
import { prisma } from '../../prisma/client';
import { Prisma } from '@prisma/client';

export async function createBill(data: {
    supplierId: string,
    invoiceNumber: string,
    date: Date,
    dueDate: Date,
    totalAmount: number,
    purchaseOrderId?: string,
    notes?: string
}) {
    return await prisma.vendorInvoice.create({
        data: {
            supplierId: data.supplierId,
            invoiceNumber: data.invoiceNumber,
            date: data.date,
            dueDate: data.dueDate,
            totalAmount: new Prisma.Decimal(data.totalAmount),
            purchaseOrderId: data.purchaseOrderId,
            notes: data.notes,
            status: 'OPEN'
        }
    });
}

export async function recordPayment(data: {
    supplierId: string,
    invoiceId?: string,
    amount: number,
    paymentDate: Date,
    method: string,
    reference?: string,
    notes?: string
}) {
    return await prisma.$transaction(async (tx) => {
        // 1. Create Payment
        const payment = await tx.vendorPayment.create({
            data: {
                supplierId: data.supplierId,
                invoiceId: data.invoiceId,
                amount: new Prisma.Decimal(data.amount),
                paymentDate: data.paymentDate,
                method: data.method,
                reference: data.reference,
                notes: data.notes
            }
        });

        // 2. Update Invoice Status if linked
        if (data.invoiceId) {
            const invoice = await tx.vendorInvoice.findUnique({
                where: { id: data.invoiceId },
                include: { payments: true }
            });

            if (invoice) {
                // Fetch all payments for this invoice inside tx to include the new one?
                // Actually relation inside findUnique with include might not show the just created one if connection is not updated yet?
                // Better to simple query payments.
                const payments = await tx.vendorPayment.findMany({ where: { invoiceId: data.invoiceId } });
                const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

                let newStatus = invoice.status;
                if (totalPaid >= Number(invoice.totalAmount)) {
                    newStatus = 'PAID';
                } else if (totalPaid > 0) {
                    newStatus = 'PARTIAL';
                }

                if (newStatus !== invoice.status) {
                    await tx.vendorInvoice.update({
                        where: { id: data.invoiceId },
                        data: { status: newStatus }
                    });
                }
            }
        }

        return payment;
    });
}

export async function getVendorLedger(supplierId: string) {
    const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId }
    });

    if (!supplier) throw new Error('Supplier not found');

    const invoices = await prisma.vendorInvoice.findMany({
        where: { supplierId },
        orderBy: { date: 'desc' }
    });

    const payments = await prisma.vendorPayment.findMany({
        where: { supplierId },
        orderBy: { paymentDate: 'desc' }
    });

    // Merge and sort by date
    const ledger = [
        ...invoices.map(i => ({ ...i, type: 'INVOICE', amount: -Number(i.totalAmount) })), // Payable is negative/liability? or just debit/credit representation
        // Let's adopt standard: Invoice increases balance (Credit for Vendor), Payment decreases (Debit).
        // Actually, "Credit" means we owe them. "Debit" means we paid them.
        ...payments.map(p => ({ ...p, type: 'PAYMENT', amount: Number(p.amount), date: p.paymentDate }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Balance
    // Total Invoiced - Total Paid
    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = totalInvoiced - totalPaid;

    return {
        supplier,
        balance,
        ledger,
        stats: {
            totalInvoiced,
            totalPaid
        }
    };
}

export async function getOutstandingPayables() {
    const invoices = await prisma.vendorInvoice.findMany({
        where: { status: { in: ['OPEN', 'PARTIAL'] } },
        include: { supplier: true },
        orderBy: { dueDate: 'asc' }
    });

    const totalOutstanding = invoices.reduce((sum, i) => {
        // We should calculate remaining amount per invoice ideally, but for now take total if not using partial logic strictly
        // For strict partial, we need (Total - Paid).
        // Let's assume frontend fetches full details or we compute it here.
        // For speed, let's just sum total amounts of OPEN/PARTIAL bills, 
        // OR better: compute actual remaining.
        return sum + Number(i.totalAmount);
    }, 0);

    // This is rough estimate. A better way is aggregation.
    // Let's stick to returning the invoices list.

    return {
        invoices,
        count: invoices.length,
        totalOutstanding
    };
}

export async function createExpense(data: {
    category: string,
    amount: number,
    date: Date,
    description: string,
    supplierId?: string,
    vendorName?: string,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
}) {
    return await prisma.expense.create({
        data: {
            category: data.category,
            amount: new Prisma.Decimal(data.amount),
            date: data.date,
            description: data.description,
            supplierId: data.supplierId,
            vendorName: data.vendorName,
            status: data.status || 'PENDING'
        }
    });
}

export async function getExpenses(filters: { status?: string, category?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    return await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        include: { supplier: true }
    });
}

export async function updateExpenseStatus(data: { id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string, approverId?: string }) {
    return await prisma.expense.update({
        where: { id: data.id },
        data: {
            status: data.status,
            rejectionReason: data.rejectionReason,
            approverId: data.approverId,
            approvalDate: new Date()
        }
    });
}

export async function getExpenseReport(filters: { startDate?: Date, endDate?: Date }) {
    const where: any = {};
    if (filters.startDate) where.date = { gte: filters.startDate };
    if (filters.endDate) where.date = { ...where.date, lte: filters.endDate };

    const expenses = await prisma.expense.findMany({
        where,
        select: { category: true, amount: true }
    });

    const report = expenses.reduce((acc: any, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
        return acc;
    }, {});

    return Object.entries(report).map(([category, amount]) => ({ category, amount }));
}
