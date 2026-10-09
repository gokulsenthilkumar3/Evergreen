/**
 * TextilePulse - Enhanced Type Definitions
 * World-class textile industry news aggregation
 */

// ============================================
// GEOGRAPHIC HIERARCHY
// ============================================

export type Country =
    | 'India' | 'China' | 'Bangladesh' | 'Vietnam' | 'Pakistan' | 'Sri Lanka' | 'Indonesia' | 'Turkey'
    | 'United States' | 'United Kingdom' | 'Germany' | 'Italy' | 'France' | 'Spain' | 'Portugal'
    | 'Brazil' | 'Ethiopia' | 'Global';

export type Continent = 'Asia' | 'Europe' | 'North America' | 'South America' | 'Africa' | 'Oceania' | 'Global';

// Note: CONTINENT_COUNTRIES is now exported from sources.config.ts to avoid circular dependencies

export type StateProvince =
    | 'Tamil Nadu' | 'Gujarat' | 'Punjab' | 'Karnataka' | 'Maharashtra' | 'Kerala' | 'Rajasthan' | 'Haryana' | 'West Bengal' // India
    | 'Zhejiang' | 'Jiangsu' | 'Guangdong' | 'Shandong' | 'Fujian'; // China

export type TextileCity =
    // India
    | 'Tiruppur' | 'Coimbatore' | 'Chennai' | 'Erode' | 'Salem'
    | 'Ludhiana' | 'Surat' | 'Ahmedabad' | 'Mumbai' | 'Bhilwara' | 'Panipat' | 'Kolkata' | 'Ichalkaranji'
    | 'Bangalore' | 'Delhi-NCR' | 'Varanasi' | 'Kochi'
    // Bangladesh
    | 'Dhaka' | 'Chittagong' | 'Gazipur' | 'Narayanganj'
    // China
    | 'Shaoxing' | 'Hangzhou' | 'Keqiao' | 'Xiangshan' | 'Haiyang' | 'Shenzhen' | 'Guangzhou' | 'Dongguan' | 'Ningbo' | 'Suzhou' | 'Wuxi' | 'Nantong'
    // Vietnam
    | 'Ho Chi Minh City' | 'Hanoi' | 'Hai Phong' | 'Binh Duong'
    // Pakistan
    | 'Karachi' | 'Lahore' | 'Faisalabad' | 'Sialkot'
    // Turkey
    | 'Istanbul' | 'Bursa' | 'Denizli' | 'Gaziantep'
    // Europe
    | 'Prato' | 'Como' | 'Biella' | 'Milan' | 'Manchester' | 'Leicester' | 'Lyon' | 'Paris' | 'Munich'
    // USA
    | 'New York' | 'Los Angeles' | 'Dalton';

// ============================================
// CONTENT ARCHITECTURE
// ============================================

export type NewsCategory =
    | 'Breaking' | 'Markets' | 'Industry' | 'Trade' | 'Technology' | 'Sustainability' | 'Policy'
    | 'Business & Investments' | 'Innovation & Tech' | 'Cluster Spotlight' | 'Market Intelligence' | 'Policy & Trade'
    | 'Sustainability & Compliance'; // Added missing category

export type ContentPillar =
    | 'Policy & Trade'
    | 'Market Intelligence'
    | 'Innovation & Tech'
    | 'Business & Investments'
    | 'Sustainability & Compliance'
    | 'Cluster Spotlight';

export type Sector =
    | 'Cotton' | 'Yarn' | 'Fabric' | 'Knitting' | 'Weaving' | 'Processing'
    | 'Garments' | 'Denim' | 'Home Textiles' | 'Technical Textiles'
    | 'Man-Made Fiber' | 'Machinery' | 'Trade' | 'Sustainability' | 'Policy' | 'Industry'
    | 'Technology' | 'Innovation' | 'Market Intelligence';

export type Priority = 'breaking' | 'high' | 'medium' | 'low';

export type SourceType = 'newspaper' | 'trade-pub' | 'aggregator' | 'government' | 'research' | 'association' | 'social';

// ============================================
// DATA MODELS
// ============================================

export interface NewsSource {
    id: string;
    name: string;
    url: string;
    type: SourceType;
    region: Country | 'Global';
    priority: number; // 1-10
    logo?: string;
    category?: NewsCategory;
    categoryMap?: Record<string, string>; // Optional mapping if needed
}

export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    content?: string;
    url: string;
    imageUrl?: string;

    source: string;
    sourceType: SourceType;
    sourceLogo?: string;

    category: NewsCategory;
    pillar?: ContentPillar;
    sectors: Sector[];
    priority: Priority;

    regions: {
        cities: string[];
        countries: string[];
        continents: string[];
        states?: string[];
    };

    tags: string[];
    keywords: string[];

    publishedAt: Date;
    fetchedAt: Date;

    relevanceScore: number; // 0-100
    readTime: number; // minutes

    engagement?: {
        views?: number;
        likes?: number; // upvotes
        comments?: number;
        shares?: number;
    };
}

export interface NewsFilter {
    category?: NewsCategory;
    pillar?: ContentPillar;
    country?: string;
    city?: string;
    sector?: string;
    sourceType?: SourceType;
    search?: string;
    limit?: number;
    offset?: number;
    // Date filtering
    fromDate?: Date | string;  // Articles published after this date
    toDate?: Date | string;    // Articles published before this date
    daysBack?: number;         // Shorthand: get news from last N days (default: 30)
}

export interface SocialPost {
    id: string;
    platform: 'reddit' | 'hackernews' | 'twitter' | 'linkedin';
    title: string;
    content?: string;
    url: string;
    author: string;
    subreddit?: string; // Reddit specific
    upvotes: number;
    comments: number;
    publishedAt: Date;
}

// ============================================
// UI MODELS
// ============================================

export interface RegionNode {
    id: string;
    name: string;
    type: 'continent' | 'country' | 'city';
    articleCount: number;
    children?: RegionNode[];
}

export interface SectorStat {
    sector: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
}
