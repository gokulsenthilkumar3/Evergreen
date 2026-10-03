import { prisma } from '../../prisma/client';
import type { NotificationType } from '@prisma/client';

export interface NotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}

export interface NotificationFilters {
    type?: NotificationType;
    read?: boolean;
    limit?: number;
    offset?: number;
}

export async function createNotification(data: NotificationData) {
    return prisma.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data || null,
        },
    });
}

export async function getUserNotifications(userId: string, filters: NotificationFilters = {}) {
    const { type, read, limit = 50, offset = 0 } = filters;

    return prisma.notification.findMany({
        where: {
            userId,
            ...(type && { type }),
            ...(read !== undefined && { read }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
}

export async function getUnreadCount(userId: string) {
    return prisma.notification.count({
        where: {
            userId,
            read: false,
        },
    });
}

export async function markAsRead(notificationId: string) {
    return prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
    });
}

export async function markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
        where: {
            userId,
            read: false,
        },
        data: { read: true },
    });
}

export async function deleteNotification(notificationId: string) {
    return prisma.notification.delete({
        where: { id: notificationId },
    });
}

// Auto-notification triggers
export async function checkLowStock() {
    const lowStockItems = await prisma.rawMaterial.findMany({
        where: {
            quantity: { lt: 100 }, // Example threshold
            status: 'IN_STOCK',
        },
        include: {
            supplier: { select: { name: true } },
        },
    });

    // Get all users (or specific roles) to notify
    const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
    });

    for (const item of lowStockItems) {
        for (const user of users) {
            // Check if notification already exists for this item
            const existing = await prisma.notification.findFirst({
                where: {
                    userId: user.id,
                    type: 'LOW_STOCK',
                    data: { path: ['materialId'], equals: item.id },
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
                },
            });

            if (!existing) {
                await createNotification({
                    userId: user.id,
                    type: 'LOW_STOCK',
                    title: 'Low Stock Alert',
                    message: `${item.materialType} from ${item.supplier.name} is running low (${item.quantity} ${item.unit} remaining)`,
                    data: { materialId: item.id, batchNo: item.batchNo },
                });
            }
        }
    }
}

export async function checkQualityAlerts() {
    const qualityIssues = await prisma.rawMaterial.findMany({
        where: {
            qualityScore: { lt: 70 }, // Example threshold
            status: { in: ['IN_STOCK', 'QUALITY_CHECK'] },
        },
        include: {
            supplier: { select: { name: true } },
        },
    });

    const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
    });

    for (const item of qualityIssues) {
        for (const user of users) {
            const existing = await prisma.notification.findFirst({
                where: {
                    userId: user.id,
                    type: 'QUALITY_ALERT',
                    data: { path: ['materialId'], equals: item.id },
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            });

            if (!existing) {
                await createNotification({
                    userId: user.id,
                    type: 'QUALITY_ALERT',
                    title: 'Quality Alert',
                    message: `${item.materialType} (Batch: ${item.batchNo}) has low quality score: ${item.qualityScore}`,
                    data: { materialId: item.id, batchNo: item.batchNo },
                });
            }
        }
    }
}
