import NodeCache from 'node-cache';

/**
 * Simple in-memory cache for API responses
 * TTL: 5 minutes (300 seconds)
 * Check period: 60 seconds
 */
export const apiCache = new NodeCache({
    stdTTL: 300, // 5 minutes default TTL
    checkperiod: 60, // Check for expired keys every 60 seconds
    useClones: false, // Don't clone objects for better performance
});

/**
 * Cache middleware for Express routes
 * @param duration - Cache duration in seconds (default: 300)
 */
export const cacheMiddleware = (duration: number = 300) => {
    return (req: any, res: any, next: any) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = apiCache.get(key);

        if (cachedResponse) {
            // Return cached response
            return res.json(cachedResponse);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache the response
        res.json = (body: any) => {
            apiCache.set(key, body, duration);
            return originalJson(body);
        };

        next();
    };
};

/**
 * Clear cache by pattern
 */
export const clearCacheByPattern = (pattern: string) => {
    const keys = apiCache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    apiCache.del(matchingKeys);
    return matchingKeys.length;
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
    apiCache.flushAll();
};
