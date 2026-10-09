/**
 * News Sources Configuration
 * Comprehensive list of 50+ Global Textile Industry Sources
 */

import { NewsSource, Country, Sector, NewsCategory, ContentPillar, Continent } from './types';

// ============================================
// CONTINENT TO COUNTRIES MAPPING
// ============================================

export const CONTINENT_COUNTRIES: Record<string, Country[]> = {
    'Asia': ['India', 'China', 'Bangladesh', 'Vietnam', 'Pakistan', 'Sri Lanka', 'Indonesia', 'Turkey'],
    'Europe': ['United Kingdom', 'Germany', 'Italy', 'France', 'Spain', 'Portugal'],
    'North America': ['United States'],
    'South America': ['Brazil'],
    'Africa': ['Ethiopia'],
    'Oceania': [],
    'Global': []
};

// ============================================
// RSS FEED SOURCES
// ============================================

export const RSS_SOURCES: NewsSource[] = [
    // === 🇮🇳 INDIA (Regional & National) ===
    {
        id: 'et-textiles',
        name: 'Economic Times Textiles',
        url: 'https://economictimes.indiatimes.com/industry/cons-products/garments-/-textiles/rssfeeds/13337311.cms',
        type: 'newspaper',
        region: 'India',
        priority: 10,
        category: 'Industry'
    },
    {
        id: 'hindu-business',
        name: 'The Hindu Business',
        url: 'https://www.thehindu.com/business/Industry/?service=rss',
        type: 'newspaper',
        region: 'India',
        priority: 9,
        category: 'Business & Investments'
    },
    {
        id: 'fibre2fashion-india',
        name: 'Fibre2Fashion India',
        url: 'https://www.fibre2fashion.com/news/rss/textile-news/india/15',
        type: 'trade-pub',
        region: 'India',
        priority: 9,
        category: 'Industry'
    },
    {
        id: 'textile-magazine',
        name: 'The Textile Magazine',
        url: 'https://www.indiantextilemagazine.in/feed/',
        type: 'trade-pub',
        region: 'India',
        priority: 8,
        category: 'Innovation & Tech'
    },
    {
        id: 'apparel-views',
        name: 'Apparel Views',
        url: 'https://apparelviews.com/feed/',
        type: 'trade-pub',
        region: 'India',
        priority: 7,
        category: 'Industry'
    },

    // === 🇧🇩 BANGLADESH ===
    {
        id: 'textile-today',
        name: 'Textile Today',
        url: 'https://www.textiletoday.com.bd/rss.xml',
        type: 'trade-pub',
        region: 'Bangladesh',
        priority: 10,
        category: 'Industry'
    },
    {
        id: 'apparel-resources-bd',
        name: 'Apparel Resources BD',
        url: 'https://apparelresources.com/geography/bangladesh/feed/',
        type: 'trade-pub',
        region: 'Bangladesh',
        priority: 9,
        category: 'Policy & Trade'
    },

    // === 🇻🇳 VIETNAM ===
    {
        id: 'vietnam-textile',
        name: 'Vietnam Textile News',
        url: 'https://www.vietnamtextile.org.vn/rss', // Generic placeholder, will be supplemented by Google News
        type: 'association',
        region: 'Vietnam',
        priority: 8,
        category: 'Industry'
    },

    // === 🇨🇳 CHINA ===
    {
        id: 'china-textile-leader',
        name: 'China Textile Leader',
        url: 'http://www.ctl.com.cn/rss.xml', // Placeholder
        type: 'trade-pub',
        region: 'China',
        priority: 8,
        category: 'Market Intelligence'
    },

    // === 🇹🇷 TURKEY ===
    {
        id: 'textilegence',
        name: 'Textilegence',
        url: 'https://www.textilegence.com/en/feed/',
        type: 'trade-pub',
        region: 'Turkey',
        priority: 8,
        category: 'Innovation & Tech'
    },

    // === 🇪🇺 EUROPE (UK, Germany, France, Italy) ===
    {
        id: 'ecotextile',
        name: 'Ecotextile News',
        url: 'https://www.ecotextile.com/feed/news.rss',
        type: 'trade-pub',
        region: 'United Kingdom',
        priority: 9,
        category: 'Sustainability & Compliance'
    },
    {
        id: 'just-style',
        name: 'Just Style',
        url: 'https://www.just-style.com/feed/',
        type: 'trade-pub',
        region: 'United Kingdom',
        priority: 9,
        category: 'Business & Investments'
    },
    {
        id: 'fashion-united-uk',
        name: 'Fashion United UK',
        url: 'https://fashionunited.uk/rss-fashion-news',
        type: 'trade-pub',
        region: 'United Kingdom',
        priority: 8,
        category: 'Market Intelligence'
    },
    {
        id: 'fashion-network-fr',
        name: 'Fashion Network France',
        url: 'https://fr.fashionnetwork.com/rss.xml',
        type: 'trade-pub',
        region: 'France',
        priority: 8,
        category: 'Business & Investments'
    },

    // === 🇺🇸 USA ===
    {
        id: 'textile-world',
        name: 'Textile World',
        url: 'https://www.textileworld.com/feed/',
        type: 'trade-pub',
        region: 'United States',
        priority: 9,
        category: 'Innovation & Tech'
    },
    {
        id: 'sourcing-journal',
        name: 'Sourcing Journal',
        url: 'https://sourcingjournal.com/feed/',
        type: 'trade-pub',
        region: 'United States',
        priority: 9,
        category: 'Market Intelligence'
    },
    {
        id: 'wwd',
        name: 'WWD (Women\'s Wear Daily)',
        url: 'https://wwd.com/feed/',
        type: 'trade-pub',
        region: 'United States',
        priority: 8,
        category: 'Business & Investments'
    },

    // === GLOBAL / POLICY ===
    {
        id: 'wto-textiles',
        name: 'WTO Textiles',
        url: 'https://www.wto.org/english/rss_e/news_e.xml', // General, will filter for textile
        type: 'government',
        region: 'Global',
        priority: 8,
        category: 'Policy & Trade'
    },
];

// ============================================
// GOOGLE NEWS QUERIES (For Hyper-Local & Specific Topics)
// ============================================

export const GOOGLE_NEWS_CONFIGS = [
    // === 🇮🇳 INDIA REGIONS ===
    { query: 'Tiruppur textile industry export', region: 'IN', category: 'Cluster Spotlight' },
    { query: 'Tamil Nadu textile policy news', region: 'IN', category: 'Policy & Trade' },
    { query: 'Kerala Kitex textile news', region: 'IN', category: 'Business & Investments' },
    { query: 'Ludhiana hosiery industry', region: 'IN', category: 'Cluster Spotlight' },
    { query: 'Surat textile market news', region: 'IN', category: 'Market Intelligence' },

    // === 🌏 ASIA ===
    { query: 'Bangladesh garment export news', region: 'BD', category: 'Policy & Trade' },
    { query: 'Vietnam textile garment industry', region: 'VN', category: 'Industry' },
    { query: 'China Shaoxing textile market', region: 'CN', category: 'Cluster Spotlight' },
    { query: 'China textile export tariffs', region: 'CN', category: 'Policy & Trade' },

    // === 🇪🇺 EUROPE ===
    { query: 'Germany textile machinery news', region: 'DE', category: 'Innovation & Tech' },
    { query: 'Italy Prato textile industry', region: 'IT', category: 'Cluster Spotlight' },
    { query: 'France luxury textile news', region: 'FR', category: 'Business & Investments' },

    // === 🇺🇸 AMERICAS ===
    { query: 'US cotton industry news', region: 'US', category: 'Market Intelligence' },

    // === TOPICS ===
    { query: 'sustainable textile innovation', region: 'US', category: 'Innovation & Tech' },
    { query: 'cotton yarn price trends', region: 'IN', category: 'Market Intelligence' },
    { query: 'textile industry FTA news', region: 'IN', category: 'Policy & Trade' }
];

// ============================================
// HACKER NEWS KEYWORDS
// ============================================

export const HACKERNEWS_KEYWORDS = [
    'supply chain', 'logistics', 'manufacturing', 'automation',
    'robotics', 'textile', 'fabric', 'sustainable fashion',
    'circular economy', 'smart materials', 'wearable tech'
];

// ============================================
// REDDIT SUBREDDITS
// ============================================

export const REDDIT_SUBREDDITS = [
    'textiles',
    'supplychain',
    'manufacturing',
    'SustainableFashion',
    'materialscience',
    'sewing',
    'knitting'
];

// ============================================
// KEYWORD DICTIONARIES
// ============================================

export const REGION_KEYWORDS: Record<string, { city?: string, country: string, continent: string, state?: string }> = {
    // INDIA
    'tiruppur': { city: 'Tirupur', state: 'Tamil Nadu', country: 'India', continent: 'Asia' },
    'tirupur': { city: 'Tirupur', state: 'Tamil Nadu', country: 'India', continent: 'Asia' },
    'coimbatore': { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', continent: 'Asia' },
    'chennai': { city: 'Chennai', state: 'Tamil Nadu', country: 'India', continent: 'Asia' },
    'erode': { city: 'Erode', state: 'Tamil Nadu', country: 'India', continent: 'Asia' },
    'salem': { city: 'Salem', state: 'Tamil Nadu', country: 'India', continent: 'Asia' },
    'surat': { city: 'Surat', state: 'Gujarat', country: 'India', continent: 'Asia' },
    'ahmedabad': { city: 'Ahmedabad', state: 'Gujarat', country: 'India', continent: 'Asia' },
    'ludhiana': { city: 'Ludhiana', state: 'Punjab', country: 'India', continent: 'Asia' },
    'mumbai': { city: 'Mumbai', state: 'Maharashtra', country: 'India', continent: 'Asia' },
    'delhi': { city: 'Delhi-NCR', country: 'India', continent: 'Asia' },
    'panipat': { city: 'Panipat', state: 'Haryana', country: 'India', continent: 'Asia' },
    'kolkata': { city: 'Kolkata', state: 'West Bengal', country: 'India', continent: 'Asia' },
    'ichalkaranji': { city: 'Ichalkaranji', state: 'Maharashtra', country: 'India', continent: 'Asia' },
    'bhilwara': { city: 'Bhilwara', state: 'Rajasthan', country: 'India', continent: 'Asia' },
    'kerala': { state: 'Kerala', country: 'India', continent: 'Asia' },
    'kochi': { city: 'Kochi', state: 'Kerala', country: 'India', continent: 'Asia' },

    // CHINA
    'shaoxing': { city: 'Shaoxing', state: 'Zhejiang', country: 'China', continent: 'Asia' },
    'hangzhou': { city: 'Hangzhou', state: 'Zhejiang', country: 'China', continent: 'Asia' },
    'keqiao': { city: 'Keqiao', state: 'Zhejiang', country: 'China', continent: 'Asia' },
    'xiangshan': { city: 'Xiangshan', state: 'Zhejiang', country: 'China', continent: 'Asia' },
    'haiyang': { city: 'Haiyang', state: 'Shandong', country: 'China', continent: 'Asia' },
    'guangzhou': { city: 'Guangzhou', state: 'Guangdong', country: 'China', continent: 'Asia' },
    'shenzhen': { city: 'Shenzhen', state: 'Guangdong', country: 'China', continent: 'Asia' },
    'jiangsu': { state: 'Jiangsu', country: 'China', continent: 'Asia' },

    // BANGLADESH
    'dhaka': { city: 'Dhaka', country: 'Bangladesh', continent: 'Asia' },
    'chittagong': { city: 'Chittagong', country: 'Bangladesh', continent: 'Asia' },
    'gazipur': { city: 'Gazipur', country: 'Bangladesh', continent: 'Asia' },

    // VIETNAM
    'ho chi minh': { city: 'Ho Chi Minh City', country: 'Vietnam', continent: 'Asia' },
    'hanoi': { city: 'Hanoi', country: 'Vietnam', continent: 'Asia' },

    // TURKEY
    'istanbul': { city: 'Istanbul', country: 'Turkey', continent: 'Asia' }, // Transcontinental but grouped in Asia for textile context often
    'bursa': { city: 'Bursa', country: 'Turkey', continent: 'Asia' },
    'denizli': { city: 'Denizli', country: 'Turkey', continent: 'Asia' },

    // EUROPE
    'prato': { city: 'Prato', country: 'Italy', continent: 'Europe' },
    'milan': { city: 'Milan', country: 'Italy', continent: 'Europe' },
    'biella': { city: 'Biella', country: 'Italy', continent: 'Europe' },
    'manchester': { city: 'Manchester', country: 'United Kingdom', continent: 'Europe' },
    'leicester': { city: 'Leicester', country: 'United Kingdom', continent: 'Europe' },
    'lyon': { city: 'Lyon', country: 'France', continent: 'Europe' },
    'paris': { city: 'Paris', country: 'France', continent: 'Europe' },
    'munich': { city: 'Munich', country: 'Germany', continent: 'Europe' },

    // USA
    'dalton': { city: 'Dalton', country: 'United States', continent: 'North America' },
    'new york': { city: 'New York', country: 'United States', continent: 'North America' },
    'los angeles': { city: 'Los Angeles', country: 'United States', continent: 'North America' },

    // Countries
    'india': { country: 'India', continent: 'Asia' },
    'china': { country: 'China', continent: 'Asia' },
    'bangladesh': { country: 'Bangladesh', continent: 'Asia' },
    'vietnam': { country: 'Vietnam', continent: 'Asia' },
    'pakistan': { country: 'Pakistan', continent: 'Asia' },
    'sri lanka': { country: 'Sri Lanka', continent: 'Asia' },
    'indonesia': { country: 'Indonesia', continent: 'Asia' },
    'turkey': { country: 'Turkey', continent: 'Asia' },
    'germany': { country: 'Germany', continent: 'Europe' },
    'italy': { country: 'Italy', continent: 'Europe' },
    'france': { country: 'France', continent: 'Europe' },
    'uk': { country: 'United Kingdom', continent: 'Europe' },
    'britain': { country: 'United Kingdom', continent: 'Europe' },
    'usa': { country: 'United States', continent: 'North America' },
    'brazil': { country: 'Brazil', continent: 'South America' },
};

export const SECTOR_KEYWORDS: Record<string, string[]> = {
    'Cotton': ['cotton', 'bale', 'ginning', 'staple', 'lint', 'bt cotton'],
    'Yarn': ['yarn', 'spinners', 'spinning', 'spindle', 'count', 'Ne', 'tex', 'denier', 'ply'],
    'Knitting': ['knitting', 'knit', 'knitwear', 'interlock', 'jersey', 'rib', 'hosiery'],
    'Weaving': ['weaving', 'loom', 'shuttle', 'powerloom', 'rapier', 'airjet'],
    'Processing': ['dyeing', 'printing', 'finishing', 'bleaching', 'mercerizing', 'zld', 'etp', 'cetu'],
    'Garments': ['garment', 'apparel', 'clothing', 'fashion', 'readymade', 'rmg'],
    'Denim': ['denim', 'jeans', 'indigo'],
    'Technical Textiles': ['technical textile', 'geotextile', 'meditech', 'agrotech', 'protech', 'smart textile'],
    'Home Textiles': ['home textile', 'bedding', 'towel', 'curtain', 'sheet', 'rug', 'carpet'],
    'Man-Made Fiber': ['polyester', 'nylon', 'viscose', 'acrylic', 'synthetic', 'mmf', 'psf'],
    'Sustainability': ['sustainable', 'recycle', 'circular', 'eco-friendly', 'organic', 'gots', 'grs', 'esg', 'carbon'],
    'Machinery': ['textile machinery', 'itma', 'spinning machine', 'knitting machine'],
    'Trade': ['export', 'import', 'fta', 'trade', 'tariff', 'duty', 'shipment', 'logistics'],
    'Policy': ['ministry of textile', 'policy', 'subsidy', 'scheme', 'pli', 'tufs', 'samarth', 'mitra', 'budget'],
};

// ============================================
// CATEGORY DETECTION KEYWORDS
// ============================================

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Breaking': ['breaking', 'just in', 'urgent', 'alert', 'developing', 'flash'],
    'Markets': ['price', 'stock', 'market', 'index', 'commodity', 'trading', 'shares', 'earnings', 'revenue'],
    'Industry': ['industry', 'sector', 'manufacturing', 'production', 'factory', 'mill', 'plant'],
    'Trade': ['export', 'import', 'trade', 'shipment', 'customs', 'tariff', 'quota', 'fta', 'bilateral'],
    'Technology': ['technology', 'innovation', 'automation', 'ai', 'digital', 'smart', 'iot', 'robotics'],
    'Sustainability': ['sustainable', 'eco', 'green', 'recycle', 'circular', 'carbon', 'climate', 'organic'],
    'Policy': ['policy', 'government', 'ministry', 'regulation', 'law', 'scheme', 'subsidy', 'budget', 'cabinet'],
    'Business & Investments': ['investment', 'merger', 'acquisition', 'ipo', 'funding', 'expansion', 'capex', 'venture'],
    'Innovation & Tech': ['research', 'r&d', 'patent', 'breakthrough', 'discovery', 'startup', 'lab'],
    'Cluster Spotlight': ['tiruppur', 'ludhiana', 'surat', 'shaoxing', 'dhaka', 'prato', 'cluster', 'hub', 'zone'],
    'Market Intelligence': ['forecast', 'outlook', 'trend', 'analysis', 'report', 'survey', 'data', 'statistics'],
    'Policy & Trade': ['fta', 'wto', 'bilateral', 'duties', 'anti-dumping', 'safeguard', 'sanctions']
};
