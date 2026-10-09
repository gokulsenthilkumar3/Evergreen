/**
 * NewsAPI.org Service
 * Integrates with NewsAPI.org for global news coverage
 * Docs: https://newsapi.org/docs
 */

import { NewsArticle, NewsCategory, SourceType } from './types';
import { contentAnalyzer } from './content-analyzer.service';

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';
const API_KEY = process.env.NEWSAPI_KEY;

// Textile industry search queries
const TEXTILE_KEYWORDS = [
    'textile industry',
    'garment manufacturing',
    'cotton exports',
    'yarn production',
    'fashion supply chain',
    'apparel industry',
    'textile trade',
    'fabric manufacturing'
];

interface NewsAPIArticle {
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: NewsAPIArticle[];
}

/**
 * Fetch news from NewsAPI.org
 */
async function fetchNews(query: string, options: {
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
    from?: string;
    to?: string;
} = {}): Promise<NewsArticle[]> {
    if (!API_KEY) {
        console.warn('[NewsAPI] API key not configured');
        return [];
    }

    try {
        const params = new URLSearchParams({
            q: query,
            apiKey: API_KEY,
            language: options.language || 'en',
            sortBy: options.sortBy || 'publishedAt',
            pageSize: String(options.pageSize || 20)
        });

        // Add date range if specified
        if (options.from) params.append('from', options.from);
        if (options.to) params.append('to', options.to);

        const url = `${NEWSAPI_BASE_URL}/everything?${params.toString()}`;
        console.log(`[NewsAPI] Fetching: ${query}`);

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[NewsAPI] Error: ${errorData.message || response.statusText}`);
            return [];
        }

        const data: NewsAPIResponse = await response.json();

        if (data.status !== 'ok') {
            console.error(`[NewsAPI] API returned error status`);
            return [];
        }

        console.log(`[NewsAPI] Found ${data.totalResults} results for "${query}"`);

        return data.articles
            .filter(article => article.title && article.title !== '[Removed]')
            .map(article => convertToNewsArticle(article));

    } catch (error) {
        console.error(`[NewsAPI] Failed to fetch "${query}":`, error);
        return [];
    }
}

/**
 * Convert NewsAPI article to our NewsArticle format
 */
function convertToNewsArticle(article: NewsAPIArticle): NewsArticle {
    const content = article.description || article.content || '';
    const analysis = contentAnalyzer.analyzeContent(article.title, content);
    const publishedAt = new Date(article.publishedAt);
    const priority = contentAnalyzer.determinePriority(article.title, analysis.relevanceScore, publishedAt);

    return {
        id: `newsapi-${Buffer.from(article.url).toString('base64').substring(0, 20)}`,
        title: article.title,
        summary: article.description || content.substring(0, 200),
        content: article.content || undefined,
        url: article.url,
        imageUrl: article.urlToImage || undefined,

        source: article.source.name,
        sourceType: 'newspaper' as SourceType,
        sourceLogo: undefined,

        category: analysis.category,
        pillar: undefined,
        sectors: analysis.sectors,
        priority,

        regions: analysis.regions,
        tags: analysis.tags,
        keywords: analysis.keywords,

        publishedAt,
        fetchedAt: new Date(),

        relevanceScore: analysis.relevanceScore,
        readTime: contentAnalyzer.estimateReadTime(content)
    };
}

/**
 * Fetch all textile industry news
 */
async function fetchTextileNews(): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // Calculate date range: last 30 days
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    // Fetch news for each keyword (limiting to avoid rate limits)
    const keywordsToFetch = TEXTILE_KEYWORDS.slice(0, 5); // Fetch 5 keywords max

    for (const keyword of keywordsToFetch) {
        try {
            const articles = await fetchNews(keyword, {
                pageSize: 10,
                from: fromStr,
                to: toStr,
                sortBy: 'publishedAt'
            });

            for (const article of articles) {
                if (!seenUrls.has(article.url)) {
                    seenUrls.add(article.url);
                    allArticles.push(article);
                }
            }

            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error(`[NewsAPI] Error fetching "${keyword}":`, error);
        }
    }

    console.log(`[NewsAPI] Total unique articles: ${allArticles.length}`);
    return allArticles;
}

/**
 * Fetch top headlines for a specific country
 */
async function fetchTopHeadlines(country: string = 'in', category: string = 'business'): Promise<NewsArticle[]> {
    if (!API_KEY) {
        console.warn('[NewsAPI] API key not configured');
        return [];
    }

    try {
        const params = new URLSearchParams({
            country,
            category,
            apiKey: API_KEY,
            pageSize: '20'
        });

        const url = `${NEWSAPI_BASE_URL}/top-headlines?${params.toString()}`;
        console.log(`[NewsAPI] Fetching headlines: ${country}/${category}`);

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`[NewsAPI] Headlines error: ${response.statusText}`);
            return [];
        }

        const data: NewsAPIResponse = await response.json();

        return data.articles
            .filter(article => article.title && article.title !== '[Removed]')
            .map(article => convertToNewsArticle(article));

    } catch (error) {
        console.error(`[NewsAPI] Failed to fetch headlines:`, error);
        return [];
    }
}

export const newsApiService = {
    fetchNews,
    fetchTextileNews,
    fetchTopHeadlines
};
