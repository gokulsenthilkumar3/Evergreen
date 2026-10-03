import { prisma } from '../../prisma/client';

/**
 * Get dashboard statistics for a customer
 */
export async function getDashboardStats(customerId: string) {
    const [
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalInvoices,
        paidInvoices,
        outstandingInvoices,
        totalOutstanding,
    ] = await Promise.all([
        // Orders count
        prisma.salesOrder.count({ where: { customerId } }),
        prisma.salesOrder.count({ where: { customerId, status: 'DRAFT' } }),
        prisma.salesOrder.count({ where: { customerId, status: 'PROCESSING' } }),
        prisma.salesOrder.count({ where: { customerId, status: 'DELIVERED' } }),

        // Invoices count
        prisma.invoice.count({ where: { customerId } }),
        prisma.invoice.count({ where: { customerId, status: 'PAID' } }),
        prisma.invoice.count({ where: { customerId, status: { in: ['DRAFT', 'SENT', 'OVERDUE'] } } }),

        // Outstanding amount
        prisma.invoice.aggregate({
            where: { customerId, status: { in: ['SENT', 'OVERDUE'] } },
            _sum: { totalAmount: true },
        }),
    ]);

    return {
        orders: {
            total: totalOrders,
            pending: pendingOrders,
            processing: processingOrders,
            delivered: deliveredOrders,
        },
        invoices: {
            total: totalInvoices,
            paid: paidInvoices,
            outstanding: outstandingInvoices,
        },
        financials: {
            totalOutstanding: totalOutstanding._sum.totalAmount || 0,
        },
    };
}

/**
 * Get recent orders for dashboard
 */
export async function getRecentOrders(customerId: string, limit = 5) {
    return prisma.salesOrder.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            items: true,
            _count: { select: { items: true } },
        },
    });
}

/**
 * Get sales orders for a customer with pagination
 */
export async function getSalesOrders(
    customerId: string,
    options: {
        page?: number;
        limit?: number;
        status?: string;
    } = {}
) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { customerId };
    if (options.status) {
        where.status = options.status;
    }

    const [orders, total] = await Promise.all([
        prisma.salesOrder.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                _count: { select: { items: true } },
            },
        }),
        prisma.salesOrder.count({ where }),
    ]);

    return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Get single sales order details
 */
export async function getSalesOrderById(customerId: string, orderId: string) {
    const order = await prisma.salesOrder.findFirst({
        where: { id: orderId, customerId },
        include: {
            items: true,
            packingLists: true,
            deliveryNotes: true,
            customer: {
                include: {
                    contacts: true,
                    addresses: true,
                },
            },
        },
    });

    return order;
}

/**
 * Get invoices for a customer with pagination
 */
export async function getInvoices(
    customerId: string,
    options: {
        page?: number;
        limit?: number;
        status?: string;
    } = {}
) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { customerId };
    if (options.status) {
        where.status = options.status;
    }

    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            skip,
            take: limit,
            orderBy: { date: 'desc' },
            include: {
                items: true,
                payments: true,
            },
        }),
        prisma.invoice.count({ where }),
    ]);

    return {
        invoices,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Get single invoice details
 */
export async function getInvoiceById(customerId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, customerId },
        include: {
            items: true,
            payments: {
                orderBy: { date: 'desc' },
            },
            customer: {
                include: {
                    addresses: true,
                },
            },
        },
    });

    return invoice;
}

/**
 * Get customer account information
 */
export async function getCustomerAccount(customerId: string) {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            contacts: true,
            addresses: true,
        },
    });

    return customer;
}

/**
 * Update customer account information
 */
export async function updateCustomerAccount(
    customerId: string,
    data: {
        email?: string;
        phone?: string;
        notes?: string;
    }
) {
    const customer = await prisma.customer.update({
        where: { id: customerId },
        data,
        include: {
            contacts: true,
            addresses: true,
        },
    });

    return customer;
}

/**
 * Get payment history for a customer
 */
export async function getPaymentHistory(customerId: string) {
    const payments = await prisma.aRPayment.findMany({
        where: {
            invoice: {
                customerId,
            },
        },
        include: {
            invoice: {
                select: {
                    invoiceNumber: true,
                    totalAmount: true,
                },
            },
        },
        orderBy: { date: 'desc' },
    });

    return payments;
}

/**
 * Get support tickets for a customer
 */
export async function getSupportTickets(customerId: string) {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
    });

    if (!customer) {
        throw new Error('Customer not found');
    }

    const tickets = await prisma.supportTicket.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        include: {
            comments: {
                orderBy: { createdAt: 'desc' },
                take: 1, // Get latest comment if needed
            },
        },
    });

    return tickets;
}

/**
 * Create a support ticket for a customer
 */
export async function createSupportTicket(
    customerId: string,
    data: {
        title: string;
        description: string;
        category?: string;
        priority?: string;
    }
) {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
    });

    if (!customer) {
        throw new Error('Customer not found');
    }

    // Generate a simple ticket number (e.g., TKT-TIMESTAMP)
    // In production, use a more robust sequence
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    const ticket = await prisma.supportTicket.create({
        data: {
            ticketNumber,
            title: data.title,
            description: data.description,
            category: data.category as any || 'GENERAL',
            priority: data.priority as any || 'MEDIUM',
            status: 'OPEN',
            customerId,
        },
    });

    return ticket;
}
