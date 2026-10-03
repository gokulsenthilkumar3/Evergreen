
import { prisma } from '../../prisma/client';
import { Prisma } from '@prisma/client';

// 1. Get Customer Ledger
export async function getCustomerLedger(customerId: string) {
    // Fetch invoices, payments, credit notes, debit notes
    const [invoices, payments, creditNotes, debitNotes, customer] = await Promise.all([
        prisma.invoice.findMany({
            where: { customerId },
            orderBy: { date: 'desc' },
            include: {
                items: true,
            }
        }),
        prisma.aRPayment.findMany({
            where: { customerId },
            orderBy: { date: 'desc' },
        }),
        prisma.creditNote.findMany({
            where: { invoice: { customerId } }, // Linked via invoice
            orderBy: { date: 'desc' },
        }),
        prisma.debitNote.findMany({
            where: { invoice: { customerId } },
            orderBy: { date: 'desc' },
        }),
        prisma.customer.findUnique({
            where: { id: customerId }
        })
    ]);

    if (!customer) throw new Error('Customer not found');

    // Combine into a single timeline
    const ledger = [
        ...invoices.map(i => ({
            id: i.id,
            date: i.date,
            type: 'INVOICE',
            reference: i.invoiceNumber,
            amount: Number(i.totalAmount), // Debit (increases balance)
            status: i.status,
            description: `Invoice #${i.invoiceNumber}`
        })),
        ...payments.map(p => ({
            id: p.id,
            date: p.date,
            type: 'PAYMENT',
            reference: p.reference || 'N/A',
            amount: -Number(p.amount), // Credit (decreases balance)
            description: `Payment via ${p.method}`
        })),
        ...creditNotes.map(cn => ({
            id: cn.id,
            date: cn.date,
            type: 'CREDIT_NOTE',
            reference: cn.creditNoteNumber,
            amount: -Number(cn.amount), // Credit (decreases balance)
            description: `Credit Note: ${cn.reason}`
        })),
        ...debitNotes.map(dn => ({
            id: dn.id,
            date: dn.date,
            type: 'DEBIT_NOTE',
            reference: dn.debitNoteNumber,
            amount: Number(dn.amount), // Debit (increases balance)
            description: `Debit Note: ${dn.reason}`
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Running Balance (reverse order calculation for display, or simple summation)
    // For simplicity, let's just return total outstanding
    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCredit = creditNotes.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalDebit = debitNotes.reduce((sum, d) => sum + Number(d.amount), 0);

    const currentBalance = (totalInvoiced + totalDebit) - (totalPaid + totalCredit);

    return {
        customer,
        currentBalance,
        ledger
    };
}

// 2. Get Aging Report
export async function getAgingReport() {
    const invoices = await prisma.invoice.findMany({
        where: { status: { in: ['PENDING', 'OVERDUE'] } },
        include: { customer: true }
    });

    const buckets = {
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0
    };

    const customerAging: Record<string, any> = {};

    const today = new Date();

    invoices.forEach(inv => {
        const diffTime = Math.abs(today.getTime() - new Date(inv.date).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const amount = Number(inv.totalAmount);

        // Global Buckets
        if (diffDays <= 30) buckets['0-30'] += amount;
        else if (diffDays <= 60) buckets['31-60'] += amount;
        else if (diffDays <= 90) buckets['61-90'] += amount;
        else buckets['90+'] += amount;

        // Per Customer Analysis
        const custId = inv.customerId || 'unknown';
        const custName = inv.customerName || 'Unknown';

        if (!customerAging[custId]) {
            customerAging[custId] = {
                id: custId,
                name: custName,
                totalOutstanding: 0,
                buckets: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
            };
        }

        customerAging[custId].totalOutstanding += amount;
        if (diffDays <= 30) customerAging[custId].buckets['0-30'] += amount;
        else if (diffDays <= 60) customerAging[custId].buckets['31-60'] += amount;
        else if (diffDays <= 90) customerAging[custId].buckets['61-90'] += amount;
        else customerAging[custId].buckets['90+'] += amount;
    });

    return {
        summary: buckets,
        byCustomer: Object.values(customerAging).sort((a: any, b: any) => b.totalOutstanding - a.totalOutstanding)
    };
}

// 3. Record Payment
export async function recordPayment(data: {
    customerId: string,
    amount: number,
    method: string,
    reference?: string,
    invoiceId?: string,
    notes?: string
}) {
    return await prisma.$transaction(async (tx) => {
        // 1. Create Payment Record
        const payment = await tx.aRPayment.create({
            data: {
                customerId: data.customerId,
                amount: data.amount,
                method: data.method,
                reference: data.reference,
                invoiceId: data.invoiceId,
                notes: data.notes
            }
        });

        // 2. If linked to an invoice, update invoice status if fully paid
        if (data.invoiceId) {
            const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
            if (invoice) {
                // Check total payments against this invoice
                const payments = await tx.aRPayment.findMany({ where: { invoiceId: data.invoiceId } });
                const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0); // Include this new payment (it's already created)

                // Note: we just created the payment, so it might be returned in findMany if we are in same tx? 
                // Actually findMany inside tx sees the new record.

                if (totalPaid >= Number(invoice.totalAmount)) {
                    await tx.invoice.update({
                        where: { id: data.invoiceId },
                        data: { status: 'PAID' }
                    });
                }
            }
        }

        return payment;
    });
}

// 4. Create Follow Up
export async function createFollowUp(data: {
    customerId: string,
    invoiceId?: string,
    dueDate: Date,
    notes?: string
}) {
    return await prisma.aRFollowUp.create({
        data: {
            customerId: data.customerId,
            invoiceId: data.invoiceId,
            dueDate: data.dueDate,
            notes: data.notes,
            status: 'OPEN'
        }
    });
}

// 5. Calculate Collection Metrics
export async function calculateCollectionMetrics() {
    const invoices = await prisma.invoice.findMany({
        orderBy: { date: 'asc' },
        include: { payments: true }
    });

    if (invoices.length === 0) return { dso: 0, cei: 100 };

    const totalReceivables = await prisma.invoice.aggregate({
        where: { status: { not: 'PAID' } },
        _sum: { totalAmount: true }
    });

    // Last 365 days sales
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const periodSales = await prisma.invoice.aggregate({
        where: { date: { gte: lastYear } },
        _sum: { totalAmount: true }
    });

    const receivables = Number(totalReceivables._sum.totalAmount || 0);
    const sales = Number(periodSales._sum.totalAmount || 0);

    const dso = sales > 0 ? (receivables / sales) * 365 : 0;

    // CEI (Collection Effectiveness Index)
    const totalCollected = await prisma.aRPayment.aggregate({
        _sum: { amount: true }
    });

    const allTimeSales = await prisma.invoice.aggregate({
        _sum: { totalAmount: true }
    });

    const collected = Number(totalCollected._sum.amount || 0);
    const totalInvoiced = Number(allTimeSales._sum.totalAmount || 0);

    const cei = totalInvoiced > 0 ? (collected / totalInvoiced) * 100 : 100;

    return {
        dso: Math.round(dso * 10) / 10,
        cei: Math.round(cei * 10) / 10
    };
}

// 6. Provision Bad Debt
export async function provisionBadDebt(data: {
    customerId: string,
    amount: number,
    notes?: string
}) {
    return await prisma.badDebtProvision.create({
        data: {
            customerId: data.customerId,
            amount: data.amount,
            notes: data.notes
        }
    });
}

// 7. Update Credit Limit
export async function updateCreditLimit(customerId: string, creditLimit: number) {
    return await prisma.customer.update({
        where: { id: customerId },
        data: { creditLimit }
    });
}
