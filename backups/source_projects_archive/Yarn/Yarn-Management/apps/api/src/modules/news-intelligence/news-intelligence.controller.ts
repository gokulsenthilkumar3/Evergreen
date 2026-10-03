/**
 * Enhanced News Intelligence Controller
 * API handlers with advanced filtering and analytics for TextilePulse
 */

import { Request, Response } from 'express';
import { newsIntelligenceService } from './news-intelligence.service';
import { NewsFilter, Country, Sector, ContentPillar, SourceType } from './types';

// ============================================
// HANDLERS
// ============================================

/**
 * Get main news feed with sophisticated filtering
 */
const getFeed = async (req: Request, res: Response) => {
    try {
        const filters: NewsFilter = {
            category: req.query.category as any,
            pillar: req.query.pillar as ContentPillar,
            country: req.query.country as string,
            city: req.query.city as string,
            sector: req.query.sector as string,
            sourceType: req.query.sourceType as SourceType,
            search: req.query.search as string,
            limit: parseInt(req.query.limit as string) || 20,
            offset: parseInt(req.query.offset as string) || 0,
            // Date filters
            fromDate: req.query.fromDate as string,
            toDate: req.query.toDate as string,
            daysBack: req.query.daysBack ? parseInt(req.query.daysBack as string) : undefined
        };

        const result = await newsIntelligenceService.getNews(filters);
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        console.error('Error fetching news feed:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch news feed' });
    }
};

/**
 * Get breaking and high priority news
 */
const getBreaking = async (req: Request, res: Response) => {
    try {
        const news = await newsIntelligenceService.getBreakingNews(10);
        res.json({ success: true, count: news.length, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch breaking news' });
    }
};

/**
 * Get social media posts (Reddit, HN)
 */
const getSocial = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const posts = await newsIntelligenceService.getSocialPosts(limit);
        res.json({ success: true, count: posts.length, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch social posts' });
    }
};

/**
 * Get trending topics
 */
const getTrending = async (req: Request, res: Response) => {
    try {
        const topics = await newsIntelligenceService.getTrendingTopics();
        res.json({ success: true, count: topics.length, data: topics });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch trending topics' });
    }
};

/**
 * Get region hierarchy tree (Continents > Countries > Cities)
 */
const getRegions = async (req: Request, res: Response) => {
    try {
        const tree = await newsIntelligenceService.getRegionTree();
        res.json({ success: true, data: tree });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch region tree' });
    }
};

/**
 * Get sector statistics
 */
const getSectors = async (req: Request, res: Response) => {
    try {
        const stats = await newsIntelligenceService.getSectorStats();
        res.json({ success: true, count: stats.length, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch sector stats' });
    }
};

/**
 * Get configured sources
 */
const getSources = async (req: Request, res: Response) => {
    try {
        const sources = await newsIntelligenceService.getSources();
        res.json({ success: true, count: sources.length, data: sources });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch sources' });
    }
};

/**
 * Get overall statistics
 */
const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await newsIntelligenceService.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};

/**
 * Global search
 */
const search = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.status(400).json({ success: false, error: 'Query required' });

        const results = await newsIntelligenceService.search(query);
        res.json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Search failed' });
    }
};

/**
 * Filter by region convenience endpoint
 */
const getByRegion = async (req: Request, res: Response) => {
    try {
        const region = req.params.region;
        const result = await newsIntelligenceService.getNews({
            search: region // Using search as a broad filter for now or dedicated country/city based on detection
        });

        // Refine filter if needed in service, simplified here
        const filtered = result.filter(n =>
            n.regions.countries.includes(region) ||
            n.regions.cities.includes(region) ||
            n.regions.states?.includes(region)
        );

        res.json({ success: true, count: filtered.length, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to filter by region' });
    }
};

/**
 * Filter by sector convenience endpoint
 */
const getBySector = async (req: Request, res: Response) => {
    try {
        const sector = req.params.sector;
        const result = await newsIntelligenceService.getNews({ sector });
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to filter by sector' });
    }
};

/**
 * Force refresh cache
 */
const refresh = async (req: Request, res: Response) => {
    try {
        await newsIntelligenceService.refreshCache();
        res.json({ success: true, message: 'Cache refreshed' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to refresh cache' });
    }
};

export const newsIntelligenceController = {
    getFeed,
    getBreaking,
    getSocial,
    getTrending,
    getRegions,
    getSectors,
    getSources,
    getStats,
    search,
    getByRegion,
    getBySector,
    refresh
};
