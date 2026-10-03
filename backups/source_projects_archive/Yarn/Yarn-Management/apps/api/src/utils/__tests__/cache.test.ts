import { apiCache, clearAllCache, clearCacheByPattern } from '../cache';

describe('Cache Utility', () => {
    beforeEach(() => {
        clearAllCache();
    });

    afterEach(() => {
        clearAllCache();
    });

    describe('apiCache', () => {
        it('should store and retrieve values', () => {
            const key = 'test-key';
            const value = { data: 'test-value' };

            apiCache.set(key, value);
            const retrieved = apiCache.get(key);

            expect(retrieved).toEqual(value);
        });

        it('should return undefined for non-existent keys', () => {
            const retrieved = apiCache.get('non-existent-key');
            expect(retrieved).toBeUndefined();
        });

        it('should expire values after TTL', async () => {
            const key = 'expiring-key';
            const value = 'expiring-value';

            apiCache.set(key, value, 1); // 1 second TTL

            expect(apiCache.get(key)).toBe(value);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 1100));

            expect(apiCache.get(key)).toBeUndefined();
        });

        it('should delete specific keys', () => {
            apiCache.set('key1', 'value1');
            apiCache.set('key2', 'value2');

            apiCache.del('key1');

            expect(apiCache.get('key1')).toBeUndefined();
            expect(apiCache.get('key2')).toBe('value2');
        });
    });

    describe('clearCacheByPattern', () => {
        it('should clear cache entries matching pattern', () => {
            apiCache.set('user:1', { id: 1 });
            apiCache.set('user:2', { id: 2 });
            apiCache.set('product:1', { id: 1 });

            const cleared = clearCacheByPattern('user');

            expect(cleared).toBe(2);
            expect(apiCache.get('user:1')).toBeUndefined();
            expect(apiCache.get('user:2')).toBeUndefined();
            expect(apiCache.get('product:1')).toEqual({ id: 1 });
        });
    });

    describe('clearAllCache', () => {
        it('should clear all cache entries', () => {
            apiCache.set('key1', 'value1');
            apiCache.set('key2', 'value2');
            apiCache.set('key3', 'value3');

            clearAllCache();

            expect(apiCache.keys()).toHaveLength(0);
        });
    });
});
