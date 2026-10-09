import { prisma } from '../../prisma/client';
import { SalesOrderStatus } from '@prisma/client';

/**
 * Service for managing sales orders and fulfillment
 */
export async function createSalesOrder(data: any) {
    const { items, ...orderData } = data;

    // Generate a unique order number
    const count = await prisma.salesOrder.count();
    const orderNumber = `SO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    return await prisma.salesOrder.create({
        data: {
            ...orderData,
            orderNumber,
            items: {
                create: items.map((item: any) => ({
                    ...item,
                    totalPrice: Number(item.quantity) * Number(item.unitPrice)
                }))
            }
        },
        include: {
            customer: true,
            items: true
        }
    });
}

export async function getSalesOrderById(id: string) {
    return await prisma.salesOrder.findUnique({
        where: { id },
        include: {
            customer: true,
            items: true,
            packingLists: true,
            deliveryNotes: true
        }
    });
}

export async function listSalesOrders(filters: {
    status?: SalesOrderStatus;
    customerId?: string;
    search?: string;
}) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.search) {
        where.OR = [
            { orderNumber: { contains: filters.search, mode: 'insensitive' } },
            { customer: { name: { contains: filters.search, mode: 'insensitive' } } }
        ];
    }

    return await prisma.salesOrder.findMany({
        where,
        include: {
            customer: {
                select: { name: true }
            },
            _count: {
                select: { items: true }
            }
        },
        orderBy: { orderDate: 'desc' }
    });
}

export async function updateSalesOrderStatus(id: string, status: SalesOrderStatus) {
    return await prisma.salesOrder.update({
        where: { id },
        data: { status }
    });
}

export async function createPackingList(orderId: string, data: any) {
    const count = await prisma.packingList.count();
    const packingListNumber = `PL-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    return await prisma.packingList.create({
        data: {
            ...data,
            salesOrderId: orderId,
            packingListNumber
        }
    });
}

export async function createDeliveryNote(orderId: string, data: any) {
    const count = await prisma.deliveryNote.count();
    const deliveryNoteNumber = `DN-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    return await prisma.deliveryNote.create({
        data: {
            ...data,
            salesOrderId: orderId,
            deliveryNoteNumber
        }
    });
}

export async function getSalesOrderAnalytics() {
    const orders = await prisma.salesOrder.findMany({
        select: {
            status: true,
            totalAmount: true,
            orderDate: true
        }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const orderCount = orders.length;

    const byStatus = orders.reduce((acc: any, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    return {
        totalRevenue,
        orderCount,
        byStatus
    };
}
