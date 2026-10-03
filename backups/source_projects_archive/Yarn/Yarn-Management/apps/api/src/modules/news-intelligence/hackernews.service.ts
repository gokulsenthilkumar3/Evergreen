/**
 * Hacker News Service
 * Fetches tech and supply chain news from HN API
 */

import { NewsArticle, SocialPost, Sector } from './types';
import { contentAnalyzer } from './content-analyzer.service';
import { HACKERNEWS_KEYWORDS } from './sources.config';

const HN_API = 'https://hacker-news.firebaseio.com/v0';

interface HNStory {
    id: number;
    title: string;
    url?: string;
    text?: string;
    by: string;
    score: number;
    descendants: number;
    time: number;
    type: string;
}

/**
 * Fetch top stories from Hacker News
 */
async function fetchTopStories(limit: number = 15): Promise<SocialPost[]> {
    try {
        // Get top story IDs
        const response = await fetch(`${HN_API}/topstories.json`);
        const storyIds: number[] = await response.json();

        // Fetch story details (limit to avoid rate limiting)
        const stories = await Promise.all(
            storyIds.slice(0, limit * 2).map(id => fetchStory(id))
        );

        // Filter for relevant stories
        const relevantStories = stories
            .filter((s): s is HNStory => s !== null)
            .filter(story => isRelevant(story.title, story.text))
            .slice(0, limit);

        return relevantStories.map(story => ({
            id: `hn-${story.id}`,
            platform: 'hackernews' as const,
            title: story.title,
            content: story.text || '',
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            author: story.by,
            upvotes: story.score || 0,
            comments: story.descendants || 0,
            publishedAt: new Date(story.time * 1000)
        }));
    } catch (error) {
        console.error('[HackerNews] Error fetching stories:', error);
        return [];
    }
}

/**
 * Fetch a single story by ID
 */
async function fetchStory(id: number): Promise<HNStory | null> {
    try {
        const response = await fetch(`${HN_API}/item/${id}.json`);
        const story = await response.json();
        return story && story.type === 'story' ? story : null;
    } catch {
        return null;
    }
}

/**
 * Check if story is relevant to textile/supply chain
 */
function isRelevant(title: string, text?: string): boolean {
    const content = `${title} ${text || ''}`.toLowerCase();

    return HACKERNEWS_KEYWORDS.some(keyword =>
        content.includes(keyword.toLowerCase())
    );
}

/**
 * Convert social posts to news articles
 */
function convertToNewsArticles(posts: SocialPost[]): NewsArticle[] {
    return posts.map(post => {
        const analysis = contentAnalyzer.analyzeContent(post.title, post.content || '');

        return {
            id: post.id,
            title: post.title,
            summary: post.content?.slice(0, 200) || post.title,
            content: post.content,
            url: post.url,

            source: 'Hacker News',
            sourceLogo: 'https://news.ycombinator.com/favicon.ico',
            sourceType: 'social' as const,
            author: post.author,

            category: 'Technology' as const,
            sectors: analysis.sectors.length > 0 ? analysis.sectors : ['Technology', 'Innovation'] as Sector[],
            priority: 'medium' as const,

            regions: analysis.regions,
            tags: analysis.tags,
            keywords: analysis.keywords,

            publishedAt: post.publishedAt,
            fetchedAt: new Date(),
            relevanceScore: Math.min(analysis.relevanceScore + post.upvotes / 10, 100),
            readTime: 2,

            engagement: {
                views: post.upvotes * 10,
                comments: post.comments
            }
        };
    });
}

/**
 * Search HN stories
 */
async function searchStories(query: string, limit: number = 10): Promise<SocialPost[]> {
    try {
        const response = await fetch(
            `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`
        );
        const data = await response.json();

        return (data.hits || []).map((hit: any) => ({
            id: `hn-${hit.objectID}`,
            platform: 'hackernews' as const,
            title: hit.title || '',
            content: hit.story_text || '',
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            author: hit.author || '',
            upvotes: hit.points || 0,
            comments: hit.num_comments || 0,
            publishedAt: new Date(hit.created_at)
        }));
    } catch (error) {
        console.error('[HackerNews] Search error:', error);
        return [];
    }
}

export const hackerNewsService = {
    fetchTopStories,
    convertToNewsArticles,
    searchStories
};
