/**
 * Content Analyzer Service
 * Auto-detects regions, sectors, categories, and tags from article content
 */

import {
    Country, TextileCity, Continent, Sector, NewsCategory
} from './types';
import {
    REGION_KEYWORDS, SECTOR_KEYWORDS, CATEGORY_KEYWORDS, CONTINENT_COUNTRIES
} from './sources.config';

interface AnalysisResult {
    regions: {
        cities: TextileCity[];
        countries: Country[];
        continents: Continent[];
    };
    sectors: Sector[];
    category: NewsCategory;
    tags: string[];
    keywords: string[];
    relevanceScore: number;
}

/**
 * Analyze article content to extract regions, sectors, category, and tags
 */
export function analyzeContent(title: string, content: string, existingTags?: string[]): AnalysisResult {
    const fullText = `${title} ${content}`.toLowerCase();
    const words = fullText.split(/\s+/);

    // Detect regions
    const regions = detectRegions(fullText);

    // Detect sectors
    const sectors = detectSectors(fullText);

    // Detect category
    const category = detectCategory(fullText, title);

    // Extract tags
    const tags = extractTags(fullText, existingTags);

    // Extract important keywords
    const keywords = extractKeywords(fullText);

    // Calculate relevance score
    const relevanceScore = calculateRelevanceScore(regions, sectors, title, content);

    return {
        regions,
        sectors,
        category,
        tags,
        keywords,
        relevanceScore
    };
}

/**
 * Detect geographic regions from text
 */
function detectRegions(text: string): AnalysisResult['regions'] {
    const cities = new Set<TextileCity>();
    const countries = new Set<Country>();
    const continents = new Set<Continent>();

    // Check all region keywords
    for (const [keyword, region] of Object.entries(REGION_KEYWORDS)) {
        // Use word boundary matching for accuracy
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(text)) {
            if (region.city) {
                cities.add(region.city as TextileCity);
            }
            countries.add(region.country as Country);
            continents.add(region.continent as Continent);
        }
    }

    // Infer continents from countries if not already detected
    for (const country of countries) {
        for (const [continent, countryList] of Object.entries(CONTINENT_COUNTRIES)) {
            if (countryList.includes(country)) {
                continents.add(continent as Continent);
            }
        }
    }

    return {
        cities: Array.from(cities),
        countries: Array.from(countries),
        continents: Array.from(continents)
    };
}

/**
 * Detect sectors from text
 */
function detectSectors(text: string): Sector[] {
    const detected = new Set<Sector>();

    for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
            if (regex.test(text)) {
                detected.add(sector as Sector);
                break; // Only need one match per sector
            }
        }
    }

    return Array.from(detected);
}

/**
 * Detect article category
 */
function detectCategory(text: string, title: string): NewsCategory {
    const scores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0;
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                // Higher weight for title matches
                const titleRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
                if (titleRegex.test(title.toLowerCase())) {
                    score += 3;
                }
                score += matches.length;
            }
        }
        scores[category] = score;
    }

    // Find highest scoring category
    let maxScore = 0;
    let bestCategory: NewsCategory = 'Industry';

    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category as NewsCategory;
        }
    }

    return bestCategory;
}

/**
 * Extract relevant tags from text
 */
function extractTags(text: string, existingTags?: string[]): string[] {
    const tags = new Set<string>(existingTags || []);

    // Important industry terms that should become tags
    const tagPatterns = [
        // Trade agreements
        /\b(india[- ]eu[- ]fta|rcep|efta|cepa)\b/gi,
        // Organizations
        /\b(wto|bgmea|bkmea|texprocil|aepc|citi)\b/gi,
        // Price indicators
        /\b(cotlook|cotton[- ]price|yarn[- ]price|icac)\b/gi,
        // Events
        /\b(itma|texprocess|heimtextil|intertextile)\b/gi,
        // Certifications
        /\b(oeko[- ]tex|gots|bci|bluesign|higg)\b/gi,
        // Policies
        /\b(pli[- ]scheme|meis|rodtep|rbi|anti[- ]dumping)\b/gi,
        // Key topics
        /\b(tariff|export[- ]ban|import[- ]duty|subsidy|quota)\b/gi,
        // Sustainability
        /\b(carbon[- ]neutral|zero[- ]waste|organic|fair[- ]trade)\b/gi
    ];

    for (const pattern of tagPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const tag = match.toLowerCase().replace(/\s+/g, '-');
                if (tag.length > 2) {
                    tags.add(tag);
                }
            });
        }
    }

    // Extract hashtag-like terms
    const hashtagPattern = /#(\w+)/g;
    let match;
    while ((match = hashtagPattern.exec(text)) !== null) {
        if (match[1].length > 2) {
            tags.add(match[1].toLowerCase());
        }
    }

    return Array.from(tags).slice(0, 10); // Limit to 10 tags
}

/**
 * Extract important keywords
 */
function extractKeywords(text: string): string[] {
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that',
        'these', 'those', 'it', 'its', 'new', 'how', 'what', 'why', 'where',
        'who', 'which', 'from', 'as', 'more', 'also', 'said', 'says', 'per',
        'year', 'years', 'million', 'billion', 'percent', 'according'
    ]);

    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count word frequency
    const wordCount: Record<string, number> = {};
    for (const word of words) {
        wordCount[word] = (wordCount[word] || 0) + 1;
    }

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([word]) => word);
}

/**
 * Calculate relevance score for textile industry
 */
function calculateRelevanceScore(
    regions: AnalysisResult['regions'],
    sectors: Sector[],
    title: string,
    content: string
): number {
    let score = 50; // Base score

    // Region scoring
    if (regions.cities.length > 0) score += 15;
    if (regions.countries.length > 0) score += 10;

    // Priority countries get bonus
    const priorityCountries: Country[] = ['India', 'China', 'Bangladesh', 'Vietnam', 'Pakistan', 'Turkey'];
    for (const country of regions.countries) {
        if (priorityCountries.includes(country)) {
            score += 5;
        }
    }

    // Sector scoring
    score += Math.min(sectors.length * 5, 20);

    // Core sector bonus
    const coreSectors: Sector[] = ['Yarn', 'Cotton', 'Knitting', 'Garments', 'Trade'];
    for (const sector of sectors) {
        if (coreSectors.includes(sector)) {
            score += 3;
        }
    }

    // Title keyword bonus
    const titleLower = title.toLowerCase();
    const importantTerms = ['yarn', 'cotton', 'textile', 'garment', 'knitwear', 'export', 'tiruppur', 'china'];
    for (const term of importantTerms) {
        if (titleLower.includes(term)) {
            score += 5;
        }
    }

    // Content length bonus (more detailed articles)
    if (content.length > 500) score += 5;
    if (content.length > 1000) score += 5;

    // Cap at 100
    return Math.min(score, 100);
}

/**
 * Estimate read time in minutes
 */
export function estimateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Determine article priority
 */
export function determinePriority(
    title: string,
    relevanceScore: number,
    publishedAt: Date
): 'breaking' | 'high' | 'medium' | 'low' {
    const titleLower = title.toLowerCase();
    const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);

    // Breaking news indicators
    const breakingTerms = ['breaking', 'just in', 'urgent', 'alert', 'developing'];
    if (breakingTerms.some(term => titleLower.includes(term)) && hoursSincePublished < 6) {
        return 'breaking';
    }

    // High priority
    if (relevanceScore >= 80 && hoursSincePublished < 24) {
        return 'high';
    }

    // Medium priority
    if (relevanceScore >= 60 || hoursSincePublished < 48) {
        return 'medium';
    }

    return 'low';
}

export const contentAnalyzer = {
    analyzeContent,
    estimateReadTime,
    determinePriority
};
