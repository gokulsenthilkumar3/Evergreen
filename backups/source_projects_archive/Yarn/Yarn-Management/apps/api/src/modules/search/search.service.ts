import { prisma } from '../../prisma/client';

export interface SearchResult {
    id: string;
    type: 'supplier' | 'raw_material' | 'batch' | 'finished_good';
    title: string;
    subtitle: string;
    metadata?: any;
}

export async function globalSearch(query: string, limit: number = 20): Promise<SearchResult[]> {
    const searchTerm = query.trim().toLowerCase();

    if (searchTerm.length < 2) {
        return [];
    }

    const results: SearchResult[] = [];

    try {
        // Search Suppliers
        const suppliers = await prisma.supplier.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { email: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            take: 5,
            select: {
                id: true,
                name: true,
                phone: true,
                address: true,
            },
        });

        results.push(
            ...suppliers.map((s: any) => ({
                id: s.id,
                type: 'supplier' as const,
                title: s.name,
                subtitle: `Phone: ${s.phone || 'N/A'} • ${s.address || 'No address'}`,
            }))
        );

        // Search Raw Materials
        const rawMaterials = await prisma.rawMaterial.findMany({
            where: {
                OR: [
                    { materialType: { contains: searchTerm, mode: 'insensitive' } },
                    { batchNo: { contains: searchTerm, mode: 'insensitive' } },
                    { supplier: { name: { contains: searchTerm, mode: 'insensitive' } } },
                ],
            },
            take: 5,
            select: {
                id: true,
                materialType: true,
                batchNo: true,
                quantity: true,
                unit: true,
                supplier: { select: { name: true } },
            },
        });

        results.push(
            ...rawMaterials.map((m: any) => ({
                id: m.id,
                type: 'raw_material' as const,
                title: `${m.materialType} (${m.batchNo})`,
                subtitle: `${m.quantity} ${m.unit} • Supplier: ${m.supplier.name}`,
            }))
        );

        // Search Production Batches
        const batches = await prisma.productionBatch.findMany({
            where: {
                batchNumber: { contains: searchTerm, mode: 'insensitive' },
            },
            take: 5,
            select: {
                id: true,
                batchNumber: true,
                currentStage: true,
                status: true,
                inputQuantity: true,
            },
        });

        results.push(
            ...batches.map((b: any) => ({
                id: b.id,
                type: 'batch' as const,
                title: `Batch ${b.batchNumber}`,
                subtitle: `${b.currentStage} • ${b.status} • Input: ${b.inputQuantity}kg`,
            }))
        );

        // Search Finished Goods
        const finishedGoods = await prisma.finishedGood.findMany({
            where: {
                yarnCount: { contains: searchTerm, mode: 'insensitive' },
            },
            take: 5,
            select: {
                id: true,
                yarnCount: true,
                producedQuantity: true,
                batch: { select: { batchNumber: true } },
            },
        });

        results.push(
            ...finishedGoods.map((fg: any) => ({
                id: fg.id,
                type: 'finished_good' as const,
                title: `Finished: ${fg.yarnCount}`,
                subtitle: `Batch ${fg.batch.batchNumber} • ${fg.producedQuantity}kg`,
            }))
        );

        return results.slice(0, limit);
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Get recent searches for a user (can be stored in localStorage on frontend)
export async function getRecentSearches(userId: string, limit: number = 5) {
    // This would typically be stored in a separate table or Redis
    // For now, return empty array - implement if needed
    return [];
}
