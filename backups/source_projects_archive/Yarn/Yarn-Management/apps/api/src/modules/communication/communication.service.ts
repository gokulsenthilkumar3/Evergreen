import { prisma } from '../../prisma/client';
import { AnnouncementPriority } from '@prisma/client';

/**
 * Communication Service - Messaging and Announcements
 */

// Message Management
export async function sendMessage(data: {
    senderId: string;
    recipientId: string;
    subject?: string;
    content: string;
    parentId?: string;
}) {
    return await prisma.message.create({
        data
    });
}

export async function getMessageById(id: string) {
    return await prisma.message.findUnique({
        where: { id },
        include: {
            replies: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });
}

export async function listMessages(filters: {
    userId: string;
    type?: 'sent' | 'received';
    isRead?: boolean;
}) {
    const where: any = {};

    if (filters.type === 'sent') {
        where.senderId = filters.userId;
    } else if (filters.type === 'received') {
        where.recipientId = filters.userId;
    } else {
        where.OR = [
            { senderId: filters.userId },
            { recipientId: filters.userId }
        ];
    }

    if (filters.isRead !== undefined) {
        where.isRead = filters.isRead;
    }

    return await prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100
    });
}

export async function markMessageAsRead(id: string) {
    return await prisma.message.update({
        where: { id },
        data: {
            isRead: true,
            readAt: new Date(),
            status: 'READ'
        }
    });
}

export async function deleteMessage(id: string) {
    return await prisma.message.delete({
        where: { id }
    });
}

// Announcement Management
export async function createAnnouncement(data: {
    title: string;
    content: string;
    priority?: string;
    publishedBy?: string;
    expiresAt?: Date;
    targetRoles?: string[];
}) {
    return await prisma.announcement.create({
        data: {
            ...data,
            priority: data.priority as AnnouncementPriority | undefined,
            targetRoles: data.targetRoles || []
        }
    });
}

export async function listAnnouncements(filters: {
    isActive?: boolean;
    userRole?: string;
}) {
    const where: any = {};

    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }

    if (filters.userRole) {
        where.OR = [
            { targetRoles: { isEmpty: true } },
            { targetRoles: { has: filters.userRole } }
        ];
    }

    return await prisma.announcement.findMany({
        where,
        orderBy: [
            { priority: 'desc' },
            { publishedAt: 'desc' }
        ]
    });
}

export async function getAnnouncementById(id: string) {
    return await prisma.announcement.findUnique({
        where: { id }
    });
}

export async function updateAnnouncement(id: string, data: any) {
    return await prisma.announcement.update({
        where: { id },
        data
    });
}

export async function deleteAnnouncement(id: string) {
    return await prisma.announcement.delete({
        where: { id }
    });
}

export async function getUnreadMessageCount(userId: string) {
    return await prisma.message.count({
        where: {
            recipientId: userId,
            isRead: false
        }
    });
}
