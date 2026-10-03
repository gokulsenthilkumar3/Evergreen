/**
 * Reddit Service
 * Fetches posts from textile industry subreddits
 */

import { NewsArticle, SocialPost, Sector } from './types';
import { contentAnalyzer } from './content-analyzer.service';
import { REDDIT_SUBREDDITS } from './sources.config';

const REDDIT_API = 'https://www.reddit.com';

interface RedditPost {
    data: {
        id: string;
        title: string;
        selftext: string;
        url: string;
        author: string;
        subreddit: string;
        score: number;
        num_comments: number;
        created_utc: number;
        permalink: string;
        thumbnail?: string;
        preview?: {
            images?: Array<{
                source?: { url?: string };
            }>;
        };
    };
}

/**
 * Fetch posts from a subreddit
 */
async function fetchSubreddit(subreddit: string, limit: number = 10): Promise<SocialPost[]> {
    try {
        const response = await fetch(
            `${REDDIT_API}/r/${subreddit}/hot.json?limit=${limit}`,
            {
                headers: {
                    'User-Agent': 'YarnManagement-Bot/1.0'
                }
            }
        );

        if (!response.ok) {
            console.warn(`[Reddit] Failed to fetch r/${subreddit}: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const posts: RedditPost[] = data.data?.children || [];

        return posts
            .filter(post => !post.data.url.includes('reddit.com/poll'))
            .map(post => ({
                id: `reddit-${post.data.id}`,
                platform: 'reddit' as const,
                title: post.data.title,
                content: post.data.selftext?.slice(0, 500) || '',
                url: `https://reddit.com${post.data.permalink}`,
                author: post.data.author,
                subreddit: post.data.subreddit,
                upvotes: post.data.score || 0,
                comments: post.data.num_comments || 0,
                publishedAt: new Date(post.data.created_utc * 1000)
            }));
    } catch (error) {
        console.error(`[Reddit] Error fetching r/${subreddit}:`, error);
        return [];
    }
}

/**
 * Fetch posts from all configured subreddits
 */
async function fetchAllSubreddits(): Promise<SocialPost[]> {
    const results = await Promise.allSettled(
        REDDIT_SUBREDDITS.map(sub => fetchSubreddit(sub, 8))
    );

    const allPosts: SocialPost[] = [];

    for (const result of results) {
        if (result.status === 'fulfilled') {
            allPosts.push(...result.value);
        }
    }

    // Sort by score
    allPosts.sort((a, b) => b.upvotes - a.upvotes);

    console.log(`[Reddit] Total posts: ${allPosts.length}`);
    return allPosts;
}

/**
 * Search Reddit for specific terms
 */
async function searchReddit(query: string, limit: number = 15): Promise<SocialPost[]> {
    try {
        const response = await fetch(
            `${REDDIT_API}/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=${limit}&type=link`,
            {
                headers: {
                    'User-Agent': 'YarnManagement-Bot/1.0'
                }
            }
        );

        if (!response.ok) return [];

        const data = await response.json();
        const posts: RedditPost[] = data.data?.children || [];

        return posts.map(post => ({
            id: `reddit-${post.data.id}`,
            platform: 'reddit' as const,
            title: post.data.title,
            content: post.data.selftext?.slice(0, 500) || '',
            url: `https://reddit.com${post.data.permalink}`,
            author: post.data.author,
            subreddit: post.data.subreddit,
            upvotes: post.data.score || 0,
            comments: post.data.num_comments || 0,
            publishedAt: new Date(post.data.created_utc * 1000)
        }));
    } catch (error) {
        console.error('[Reddit] Search error:', error);
        return [];
    }
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

            source: `Reddit r/${post.subreddit}`,
            sourceLogo: 'https://www.reddit.com/favicon.ico',
            sourceType: 'social' as const,
            author: post.author,

            category: analysis.category || 'Industry',
            sectors: analysis.sectors.length > 0 ? analysis.sectors : ['Trade'] as Sector[],
            priority: 'low' as const,

            regions: analysis.regions,
            tags: [...analysis.tags, post.subreddit || ''].filter(Boolean),
            keywords: analysis.keywords,

            publishedAt: post.publishedAt,
            fetchedAt: new Date(),
            relevanceScore: analysis.relevanceScore,
            readTime: 1,

            engagement: {
                views: post.upvotes * 5,
                comments: post.comments
            }
        };
    });
}

export const redditService = {
    fetchSubreddit,
    fetchAllSubreddits,
    searchReddit,
    convertToNewsArticles,
    SUBREDDITS: REDDIT_SUBREDDITS
};
