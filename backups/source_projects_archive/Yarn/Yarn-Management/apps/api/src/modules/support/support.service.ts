import { prisma } from '../../prisma/client';
import { TicketCategory, TicketPriority } from '@prisma/client';

/**
 * Support Service - Tickets and Knowledge Base
 */

// Ticket Management
export async function createTicket(data: {
    title: string;
    description: string;
    category?: string;
    priority?: string;
    createdBy?: string;
}) {
    // Generate ticket number
    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return await prisma.supportTicket.create({
        data: {
            ...data,
            category: data.category as TicketCategory | undefined,
            priority: data.priority as TicketPriority | undefined,
            ticketNumber
        }
    });
}

export async function getTicketById(id: string) {
    return await prisma.supportTicket.findUnique({
        where: { id },
        include: {
            comments: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });
}

export async function listTickets(filters: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    createdBy?: string;
}) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.createdBy) where.createdBy = filters.createdBy;

    return await prisma.supportTicket.findMany({
        where,
        orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
        ],
        include: {
            _count: {
                select: { comments: true }
            }
        }
    });
}

export async function updateTicket(id: string, data: any) {
    const updateData: any = { ...data };

    if (data.status === 'RESOLVED' && !data.resolvedAt) {
        updateData.resolvedAt = new Date();
    }
    if (data.status === 'CLOSED' && !data.closedAt) {
        updateData.closedAt = new Date();
    }

    return await prisma.supportTicket.update({
        where: { id },
        data: updateData
    });
}

export async function assignTicket(id: string, assignedTo: string) {
    return await prisma.supportTicket.update({
        where: { id },
        data: {
            assignedTo,
            status: 'IN_PROGRESS'
        }
    });
}

// Ticket Comments
export async function addTicketComment(data: {
    ticketId: string;
    content: string;
    createdBy?: string;
    isInternal?: boolean;
}) {
    return await prisma.ticketComment.create({
        data
    });
}

// Knowledge Base
export async function createArticle(data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    author?: string;
}) {
    return await prisma.knowledgeBaseArticle.create({
        data: {
            ...data,
            tags: data.tags || []
        }
    });
}

export async function listArticles(filters: {
    category?: string;
    isPublished?: boolean;
    search?: string;
}) {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.isPublished !== undefined) where.isPublished = filters.isPublished;

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { content: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    return await prisma.knowledgeBaseArticle.findMany({
        where,
        orderBy: { viewCount: 'desc' }
    });
}

export async function getArticleById(id: string) {
    const article = await prisma.knowledgeBaseArticle.findUnique({
        where: { id }
    });

    if (article) {
        // Increment view count
        await prisma.knowledgeBaseArticle.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        });
    }

    return article;
}

export async function updateArticle(id: string, data: any) {
    return await prisma.knowledgeBaseArticle.update({
        where: { id },
        data
    });
}

export async function publishArticle(id: string) {
    return await prisma.knowledgeBaseArticle.update({
        where: { id },
        data: { isPublished: true }
    });
}

export async function markArticleHelpful(id: string) {
    return await prisma.knowledgeBaseArticle.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } }
    });
}

export async function getTicketStats() {
    const [total, open, inProgress, resolved] = await Promise.all([
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: 'OPEN' } }),
        prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.supportTicket.count({ where: { status: 'RESOLVED' } })
    ]);

    return {
        total,
        open,
        inProgress,
        resolved
    };
}
