import { prisma } from '../../prisma/client';

export interface NewsInsight {
    id: string;
    title: string;
    summary: string;
    category: 'Market' | 'Economic' | 'Technology' | 'Sustainability';
    relevanceScore: number;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    businessImpact: string;
    source: string;
    url?: string;
    publishedAt: Date;
}

export class MarketIntelligenceService {
    /**
     * Simulation of an AI-curated news aggregator.
     * In a real system, this would fetch from APIs like NewsAPI or industry-specific scrapers
     * and use an LLM or vector search to score relevance against user context.
     */
    static async getCuratedInsights(userId: string): Promise<NewsInsight[]> {
        // Fetch user roles/interests to personalize score
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true }
        });

        const isManagement = user?.roles.some((r: any) => r.role === 'ADMIN' || r.role === 'MANAGER');
        const isProcurement = user?.roles.some((r: any) => r.role === 'PURCHASING');

        const baseInsights: NewsInsight[] = [
            {
                id: 'market-1',
                title: 'Cotton Futures Surged 4% Amid Export Demand',
                summary: 'International cotton prices saw a sharp uptick this morning as major importers increased orders for high-quality staples.',
                category: 'Market',
                sentiment: 'NEGATIVE',
                businessImpact: 'High - Expect increased procurement costs.',
                source: 'Textile Daily',
                publishedAt: new Date(),
                relevanceScore: isProcurement ? 95 : 75
            },
            {
                id: 'tech-1',
                title: 'New Eco-Friendly Dyeing Process Reduces Water Use by 80%',
                summary: 'Researchers in Germany have unveiled a proprietary enzyme-based dyeing process that significantly minimizes water and chemical footprint.',
                category: 'Technology',
                sentiment: 'POSITIVE',
                businessImpact: 'Medium - Potential for long-term savings and sustainability branding.',
                source: 'Green Fiber Journal',
                publishedAt: new Date(Date.now() - 3600000),
                relevanceScore: 80
            },
            {
                id: 'econ-1',
                title: 'Ocean Freight Rates Stabilize After Peak Season',
                summary: 'Logistics experts report a cooling of container rates on the Asia-Europe route, easing pressure on import raw materials.',
                category: 'Economic',
                sentiment: 'POSITIVE',
                businessImpact: 'Medium - Reduced logistics overhead.',
                source: 'Logistics Insider',
                publishedAt: new Date(Date.now() - 7200000),
                relevanceScore: isManagement ? 90 : 60
            },
            {
                id: 'sust-1',
                title: 'EU Tightens Textile Waste Regulations',
                summary: 'A new directive mandates higher circularity standards for all textile imports starting Q3 2026.',
                category: 'Sustainability',
                sentiment: 'NEUTRAL',
                businessImpact: 'High - Requires compliance review.',
                source: 'Regulate Watch',
                publishedAt: new Date(Date.now() - 86400000),
                relevanceScore: isManagement ? 98 : 50
            }
        ];

        // Sort by relevance high to low
        return baseInsights.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
}
