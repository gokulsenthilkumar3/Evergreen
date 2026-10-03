/**
 * Enhanced RSS Feed Service
 * Fetches and parses news from multiple textile industry RSS sources + Google News
 */

import Parser from 'rss-parser';
import { NewsArticle, NewsSource, Sector, ContentPillar } from './types';
import { RSS_SOURCES, GOOGLE_NEWS_CONFIGS } from './sources.config';
import { contentAnalyzer } from './content-analyzer.service';
import { googleNewsService } from './google-news.service';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded'],
            ['dc:creator', 'creator'],
        ],
    },
});

/**
 * Fetch news from a single RSS source
 */
async function fetchSource(source: NewsSource): Promise<NewsArticle[]> {
    try {
        const feed = await parser.parseURL(source.url);

        return feed.items.map((item) => {
            const content = item.contentEncoded || item.content || item.contentSnippet || '';
            const title = item.title || '';

            // Analyze content for enhanced metadata
            const analysis = contentAnalyzer.analyzeContent(title, content);

            // Extract image
            let imageUrl: string | undefined;
            if (item.mediaContent?.$?.url) imageUrl = item.mediaContent.$.url;
            else if (item.mediaThumbnail?.$?.url) imageUrl = item.mediaThumbnail.$.url;
            else if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) imageUrl = item.enclosure.url;

            // Determine Content Pillar based on analysis
            let pillar: ContentPillar = 'Market Intelligence';
            if (source.category) {
                // Map legacy categories to pillars if needed, or use source default
                pillar = mapCategoryToPillar(source.category);
            } else if (analysis.category) {
                pillar = mapCategoryToPillar(analysis.category);
            }

            return {
                id: `${source.id}-${generateHash(item.link || title)}`,
                title: title,
                summary: item.contentSnippet || content.substring(0, 200) + '...',
                content: content,
                url: item.link || '',
                imageUrl,

                source: source.name,
                sourceType: source.type,
                sourceLogo: `https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}`,

                category: source.category || analysis.category || 'Industry',
                pillar, // New field for TextilePulse
                sectors: analysis.sectors.length > 0 ? analysis.sectors : ['Industry'] as Sector[],
                priority: determinePriority(title, source.priority),

                regions: analysis.regions,
                tags: [...analysis.tags, source.name],
                keywords: analysis.keywords,

                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                fetchedAt: new Date(),
                relevanceScore: Math.min(analysis.relevanceScore + (source.priority * 2), 100),
                readTime: Math.ceil((content.length || 500) / 1500), // ~250 words per min
            };
        });
    } catch (error) {
        console.warn(`[RSS] Failed to fetch ${source.name}:`, error);
        return [];
    }
}

/**
 * Fetch all configured RSS sources and Google News topics
 */
async function fetchAllSources(): Promise<NewsArticle[]> {
    console.log('[TextilePulse] Starting aggregated fetch...');

    // 1. Fetch Standard RSS Sources
    const rssPromises = RSS_SOURCES.map(source => fetchSource(source));

    // 2. Fetch Google News Topics (Parallel)
    const googleNewsPromises = GOOGLE_NEWS_CONFIGS.map(config =>
        googleNewsService.fetchGoogleNewsTopics(config.query, config.region, config.category)
    );

    const [rssResults, gnResults] = await Promise.all([
        Promise.allSettled(rssPromises),
        Promise.allSettled(googleNewsPromises)
    ]);

    let allArticles: NewsArticle[] = [];

    // Process RSS results
    rssResults.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
        }
    });

    // Process Google News results
    gnResults.forEach(result => {
        if (result.status === 'fulfilled') {
            const articles = result.value.map(article => ({
                ...article,
                // Ensure pillar is set for Google News items based on the config category
                pillar: mapCategoryToPillar(article.category)
            }));
            allArticles.push(...articles);
        }
    });

    // Deduplicate by URL and Title similarity
    const uniqueArticles = deduplicateArticles(allArticles);

    // Sort by date desc
    return uniqueArticles.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
        // Create a similarity key (first 20 chars of title + source)
        const key = article.title.toLowerCase().substring(0, 30).replace(/[^a-z0-9]/g, '');
        if (seen.has(key)) return false;

        seen.add(key);
        // Also check URL if valid
        if (article.url) seen.add(article.url);

        return true;
    });
}

function generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

function determinePriority(title: string, sourcePriority: number): 'breaking' | 'high' | 'medium' | 'low' {
    const breakingKeywords = ['breaking', 'urgent', 'alert', 'crisis', 'crash', 'explode', 'shutdown'];
    const lowerTitle = title.toLowerCase();

    if (breakingKeywords.some(k => lowerTitle.includes(k))) return 'breaking';
    if (sourcePriority >= 10) return 'high';
    if (sourcePriority >= 8) return 'medium';
    return 'low';
}

function mapCategoryToPillar(category: string): ContentPillar {
    const map: Record<string, ContentPillar> = {
        'Breaking': 'Market Intelligence',
        'Markets': 'Market Intelligence',
        'Industry': 'Business & Investments',
        'Trade': 'Policy & Trade',
        'Policy': 'Policy & Trade',
        'Technology': 'Innovation & Tech',
        'Sustainability': 'Sustainability & Compliance',
        'Cluster Spotlight': 'Cluster Spotlight',
        'Business & Investments': 'Business & Investments'
    };
    return map[category] || 'Market Intelligence'; // Default
}

export const rssFeedService = {
    fetchSource,
    fetchAllSources
};
