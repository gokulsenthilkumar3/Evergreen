/**
 * Enhanced News Intelligence Service
 * Main aggregation service with filtering, caching, and analytics for TextilePulse
 */

import { rssFeedService } from './rss-feed.service';
import { hackerNewsService } from './hackernews.service';
import { redditService } from './reddit.service';
import { newsApiService } from './newsapi.service';
import { NewsArticle, NewsFilter, SocialPost, RegionNode, SectorStat, ContentPillar, SourceType } from './types';

// In-memory cache
let articlesCache: NewsArticle[] = [];
let lastFetchTime: number = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Get news with advanced filtering
 */
async function getNews(filters: NewsFilter = {}): Promise<NewsArticle[]> {
    await ensureFreshData();

    let filtered = [...articlesCache];

    // Filter by Pillar (Content Pillar)
    if (filters.pillar) {
        filtered = filtered.filter(a => a.pillar === filters.pillar);
    }

    // Filter by Category (Legacy support or granular filter)
    if (filters.category) {
        filtered = filtered.filter(a => a.category === filters.category);
    }

    // Filter by Source Type
    if (filters.sourceType) {
        filtered = filtered.filter(a => a.sourceType === filters.sourceType);
    }

    // Filter by Region (Country/City)
    if (filters.country) {
        filtered = filtered.filter(a =>
            a.regions.countries.includes(filters.country!) ||
            a.regions.cities.some(c => c.includes(filters.country!)) // Loose match for city-region link
        );
    }

    if (filters.city) {
        filtered = filtered.filter(a => a.regions.cities.includes(filters.city!));
    }

    // Filter by Sector
    if (filters.sector) {
        filtered = filtered.filter(a => a.sectors.includes(filters.sector as any));
    }

    // Search
    if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.summary.toLowerCase().includes(query) ||
            a.tags.some(t => t.toLowerCase().includes(query))
        );
    }

    // Date filtering - Default to last 30 days if no date params specified
    const now = new Date();
    let fromDate: Date;
    let toDate: Date = filters.toDate ? new Date(filters.toDate) : now;

    if (filters.fromDate) {
        fromDate = new Date(filters.fromDate);
    } else {
        // Default: last 30 days (or use daysBack if specified)
        const daysBack = filters.daysBack ?? 30;
        fromDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    }

    filtered = filtered.filter(a => {
        const articleDate = new Date(a.publishedAt);
        return articleDate >= fromDate && articleDate <= toDate;
    });

    // Apply limit and offset
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;

    return filtered.slice(offset, offset + limit);
}

/**
 * Ensure data is fresh
 */
async function ensureFreshData() {
    const now = Date.now();
    if (now - lastFetchTime > CACHE_TTL || articlesCache.length === 0) {
        await refreshCache();
    }
}

/**
 * Force refresh cache
 */
async function refreshCache() {
    console.log('[TextilePulse] Refreshing cache...');

    try {
        const [rssNews, hnPosts, redditPosts, newsApiArticles] = await Promise.all([
            rssFeedService.fetchAllSources(),
            hackerNewsService.fetchTopStories(),
            redditService.fetchAllSubreddits(),
            newsApiService.fetchTextileNews()
        ]);

        const hnArticles = hackerNewsService.convertToNewsArticles(hnPosts);
        const redditArticles = redditService.convertToNewsArticles(redditPosts);

        // Merge and sort by date
        const allNews = [...rssNews, ...hnArticles, ...redditArticles, ...newsApiArticles].sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        articlesCache = allNews;
        lastFetchTime = Date.now();
        console.log(`[TextilePulse] Cache updated with ${articlesCache.length} articles`);
    } catch (error) {
        console.error('[TextilePulse] Failed to refresh cache:', error);
    }
}

/**
 * Get breaking news
 */
async function getBreakingNews(limit: number = 5): Promise<NewsArticle[]> {
    await ensureFreshData();
    return articlesCache
        .filter(a => a.priority === 'breaking' || a.priority === 'high')
        .slice(0, limit);
}

/**
 * Get social posts
 */
async function getSocialPosts(limit: number = 10): Promise<SocialPost[]> {
    try {
        const [hn, reddit] = await Promise.all([
            hackerNewsService.fetchTopStories(limit),
            redditService.fetchSubreddit('textiles', limit) // Simplified for dashboard
        ]);
        return [...hn, ...reddit].sort((a, b) => b.upvotes - a.upvotes).slice(0, limit);
    } catch {
        return [];
    }
}

/**
 * Get region hierarchy for UI tree
 */
async function getRegionTree(): Promise<RegionNode[]> {
    await ensureFreshData();

    // Group by Continent -> Country -> City
    const tree: Record<string, any> = {};

    articlesCache.forEach(article => {
        const continent = article.regions.continents[0] || 'Global';
        const country = article.regions.countries[0] || 'Other';
        const city = article.regions.cities[0];

        if (!tree[continent]) tree[continent] = { count: 0, countries: {} };
        tree[continent].count++;

        if (!tree[continent].countries[country]) {
            tree[continent].countries[country] = { count: 0, cities: {} };
        }
        tree[continent].countries[country].count++;

        if (city) {
            if (!tree[continent].countries[country].cities[city]) {
                tree[continent].countries[country].cities[city] = 0;
            }
            tree[continent].countries[country].cities[city]++;
        }
    });

    // Convert to array format for UI
    return Object.entries(tree).map(([continent, cData]: [string, any]) => ({
        id: continent,
        name: continent,
        type: 'continent',
        articleCount: cData.count,
        children: Object.entries(cData.countries).map(([country, coData]: [string, any]) => ({
            id: country,
            name: country,
            type: 'country',
            articleCount: coData.count,
            children: Object.entries(coData.cities).map(([city, count]: [string, any]) => ({
                id: city,
                name: city,
                type: 'city',
                articleCount: count
            }))
        }))
    }));
}

/**
 * Get sector statistics
 */
async function getSectorStats(): Promise<SectorStat[]> {
    await ensureFreshData();

    const stats: Record<string, number> = {};
    articlesCache.forEach(a => {
        a.sectors.forEach(s => {
            stats[s] = (stats[s] || 0) + 1;
        });
    });

    return Object.entries(stats)
        .map(([sector, count]) => ({
            sector,
            count,
            trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down' | 'stable' // Placeholder for real trend
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get trending topics
 */
async function getTrendingTopics() {
    await ensureFreshData();

    const tagCounts: Record<string, number> = {};
    articlesCache.forEach(a => {
        a.tags.forEach(t => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
    });

    return Object.entries(tagCounts)
        .map(([topic, count]) => ({
            topic,
            hashtag: `#${topic.replace(/\s+/g, '')}`,
            count,
            trend: Math.random() > 0.5 ? 'up' : 'down'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

/**
 * Global search
 */
async function search(query: string): Promise<NewsArticle[]> {
    await ensureFreshData();
    const q = query.toLowerCase();

    return articlesCache.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.content?.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
}

const getSources = async () => Promise.resolve(require('./sources.config').RSS_SOURCES);
const getStats = () => ({ totalArticles: articlesCache.length, lastUpdated: new Date(lastFetchTime) });

export const newsIntelligenceService = {
    getNews,
    getBreakingNews,
    getSocialPosts,
    getRegionTree,
    getSectorStats,
    getTrendingTopics,
    getSources,
    getStats,
    search,
    refreshCache
};
