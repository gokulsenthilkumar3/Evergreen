/**
 * Google News Service
 * Generates and parses dynamic RSS feeds for specific regions and keywords
 */

import Parser from 'rss-parser';
import { NewsArticle, Sector } from './types';
import { contentAnalyzer } from './content-analyzer.service';

const parser = new Parser({
    customFields: {
        item: [['source', 'sourceName']]
    }
});

const BASE_URL = 'https://news.google.com/rss/search';

interface GoogleNewsConfig {
    query: string;
    region: string; // e.g., 'IN', 'US', 'GB'
    language: string; // e.g., 'en'
    category?: string;
}

/**
 * Generate Google News RSS URL
 */
function generateUrl(config: GoogleNewsConfig): string {
    const { query, region, language } = config;
    const ceid = `${region}:${language}`;
    return `${BASE_URL}?q=${encodeURIComponent(query)}&hl=${language}-${region}&gl=${region}&ceid=${ceid}`;
}

/**
 * Fetch news from Google News for a specific topic/region
 */
async function fetchGoogleNewsTopics(
    topic: string,
    regionCode: string = 'IN',
    category: string = 'Industry'
): Promise<NewsArticle[]> {
    try {
        const url = generateUrl({
            query: topic,
            region: regionCode,
            language: 'en'
        });

        console.log(`[GoogleNews] Fetching: ${topic} (${regionCode})`);
        const feed = await parser.parseURL(url);

        return feed.items.map(item => {
            const title = item.title || '';
            const content = item.contentSnippet || item.content || '';

            // Analyze content
            const analysis = contentAnalyzer.analyzeContent(title, content);

            // Extract source name from title (Google News format: "Title - Source Name")
            let sourceName = 'Google News';
            let cleanTitle = title;

            if (item.sourceName) {
                sourceName = typeof item.sourceName === 'string' ? item.sourceName : (item.sourceName as any)._;
            } else {
                const lastDashIndex = title.lastIndexOf(' - ');
                if (lastDashIndex > 0) {
                    sourceName = title.substring(lastDashIndex + 3);
                    cleanTitle = title.substring(0, lastDashIndex);
                }
            }

            return {
                id: `gn-${generateHash(item.link || title)}`,
                title: cleanTitle,
                summary: content,
                content: content,
                url: item.link || '',
                // Google News doesn't provide images in RSS, strictly text
                imageUrl: undefined,

                source: sourceName,
                sourceType: 'aggregator' as const,
                sourceLogo: `https://www.google.com/s2/favicons?domain=${new URL(item.link || 'https://google.com').hostname}`,

                category: category as any,
                sectors: analysis.sectors.length > 0 ? analysis.sectors : ['Market Intelligence'] as Sector[],
                priority: 'medium' as const,

                regions: analysis.regions,
                tags: [...analysis.tags, 'Google News'],
                keywords: analysis.keywords,

                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                fetchedAt: new Date(),
                relevanceScore: analysis.relevanceScore,
                readTime: 1
            };
        });
    } catch (error) {
        console.error(`[GoogleNews] Error fetching ${topic}:`, error);
        return [];
    }
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

export const googleNewsService = {
    fetchGoogleNewsTopics
};
