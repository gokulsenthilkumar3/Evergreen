import { prisma } from '../../prisma/client';
import { recordAuditLog } from '../../utils/audit';

/**
 * Create a supplier rating
 */
export async function createRating(
    supplierId: string,
    userId: string,
    rating: number,
    comment?: string,
    isPublic: boolean = false
) {
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    const supplierRating = await prisma.supplierRating.create({
        data: {
            supplierId,
            userId,
            rating,
            comment,
            isPublic,
        },
        include: {
            user: { select: { name: true, email: true } },
        },
    });

    await recordAuditLog('supplier.rating.create', {
        userId,
        entityType: 'Supplier',
        entityId: supplierId,
        metadata: { rating, isPublic },
    });

    // Update supplier's average rating
    await updateSupplierAverageRating(supplierId);

    return supplierRating;
}

/**
 * Update supplier's average rating
 */
async function updateSupplierAverageRating(supplierId: string) {
    const ratings = await prisma.supplierRating.findMany({
        where: { supplierId },
        select: { rating: true },
    });

    if (ratings.length === 0) return;

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await prisma.supplier.update({
        where: { id: supplierId },
        data: { rating: Math.round(avgRating) },
    });
}

/**
 * Get ratings for a supplier
 */
export async function getSupplierRatings(supplierId: string, includePrivate: boolean = false) {
    return prisma.supplierRating.findMany({
        where: {
            supplierId,
            ...(includePrivate ? {} : { isPublic: true }),
        },
        include: {
            user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Update a rating
 */
export async function updateRating(
    ratingId: string,
    userId: string,
    updates: { rating?: number; comment?: string; isPublic?: boolean }
) {
    const existing = await prisma.supplierRating.findUnique({
        where: { id: ratingId },
    });

    if (!existing) throw new Error('Rating not found');
    if (existing.userId !== userId) throw new Error('Unauthorized');

    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
    }

    const updated = await prisma.supplierRating.update({
        where: { id: ratingId },
        data: updates,
        include: {
            user: { select: { name: true } },
        },
    });

    await updateSupplierAverageRating(existing.supplierId);

    return updated;
}

/**
 * Delete a rating
 */
export async function deleteRating(ratingId: string, userId: string) {
    const existing = await prisma.supplierRating.findUnique({
        where: { id: ratingId },
    });

    if (!existing) throw new Error('Rating not found');
    if (existing.userId !== userId) throw new Error('Unauthorized');

    await prisma.supplierRating.delete({
        where: { id: ratingId },
    });

    await updateSupplierAverageRating(existing.supplierId);
}

/**
 * Get rating statistics for a supplier
 */
export async function getRatingStatistics(supplierId: string) {
    const ratings = await prisma.supplierRating.findMany({
        where: { supplierId },
        select: { rating: true },
    });

    if (ratings.length === 0) {
        return {
            average: 0,
            total: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
        distribution[r.rating as keyof typeof distribution]++;
    });

    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    return {
        average: Math.round(average * 10) / 10,
        total: ratings.length,
        distribution,
    };
}
