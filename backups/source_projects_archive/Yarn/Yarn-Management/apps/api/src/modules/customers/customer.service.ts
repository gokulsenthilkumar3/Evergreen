import { prisma } from '../../prisma/client';
import { CustomerCategory, CustomerLifecycleStage, CustomerValueClass, AddressType } from '@prisma/client';

/**
 * Service for managing customers and their related data
 */
export async function createCustomer(data: any) {
    const { contacts, addresses, ...customerData } = data;

    return await prisma.customer.create({
        data: {
            ...customerData,
            contacts: contacts ? {
                create: contacts
            } : undefined,
            addresses: addresses ? {
                create: addresses
            } : undefined
        },
        include: {
            contacts: true,
            addresses: true
        }
    });
}

export async function updateCustomer(id: string, data: any) {
    const { contacts, addresses, ...customerData } = data;

    // For simplicity in this implementation, we update basic info
    // contacts and addresses would normally be managed via separate endpoints or careful syncing
    return await prisma.customer.update({
        where: { id },
        data: customerData,
        include: {
            contacts: true,
            addresses: true
        }
    });
}

export async function getCustomerById(id: string) {
    return await prisma.customer.findUnique({
        where: { id },
        include: {
            contacts: true,
            addresses: true,
            invoices: {
                take: 10,
                orderBy: { date: 'desc' }
            },
            payments: {
                take: 10,
                orderBy: { date: 'desc' }
            }
        }
    });
}

export async function listCustomers(filters: {
    category?: CustomerCategory;
    lifecycleStage?: CustomerLifecycleStage;
    valueClass?: CustomerValueClass;
    search?: string;
}) {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.lifecycleStage) where.lifecycleStage = filters.lifecycleStage;
    if (filters.valueClass) where.valueClass = filters.valueClass;
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search, mode: 'insensitive' } },
            { gstin: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    const customers = await prisma.customer.findMany({
        where,
        include: {
            invoices: {
                select: { totalAmount: true }
            },
            payments: {
                select: { amount: true }
            },
            _count: {
                select: { invoices: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    return customers.map(customer => {
        const totalRevenue = customer.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        const totalPaid = customer.payments.reduce((sum, pay) => sum + Number(pay.amount), 0);

        return {
            ...customer,
            outstanding: totalRevenue - totalPaid,
            invoices: undefined,
            payments: undefined
        };
    });
}

/**
 * Calculate analytics for a customer
 */
export async function getCustomerAnalytics(id: string) {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            invoices: true,
            payments: true
        }
    });

    if (!customer) throw new Error('Customer not found');

    const totalRevenue = customer.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalPaid = customer.payments.reduce((sum, pay) => sum + Number(pay.amount), 0);
    const outstanding = totalRevenue - totalPaid;

    // Average time to pay (simplified)
    // ... (could be implemented if payment records linked to invoices better)

    // Lifetime Value (simplified)
    // CLV = Average Purchase Value * Purchase Frequency * Customer Lifespan
    const purchaseCount = customer.invoices.length;
    const avgOrderValue = purchaseCount > 0 ? totalRevenue / purchaseCount : 0;

    return {
        totalRevenue,
        totalPaid,
        outstanding,
        avgOrderValue,
        purchaseCount,
        lifecycleStage: customer.lifecycleStage,
        valueClass: customer.valueClass
    };
}

/**
 * Get revenue history for trends
 */
export async function getRevenueHistory(id: string, months: number = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const invoices = await prisma.invoice.findMany({
        where: {
            customerId: id,
            date: { gte: since }
        },
        select: {
            date: true,
            totalAmount: true
        },
        orderBy: { date: 'asc' }
    });

    // Group by month
    const history: Record<string, number> = {};
    invoices.forEach(inv => {
        const month = inv.date.toISOString().substring(0, 7); // YYYY-MM
        history[month] = (history[month] || 0) + Number(inv.totalAmount);
    });

    return Object.entries(history).map(([month, amount]) => ({ month, amount }));
}
