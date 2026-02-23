import redisClient from '../config/redis.js';

/**
 * Cache middleware
 * @param {string} prefix - Prefix for the cache key (e.g., 'products', 'categories')
 * @param {number} ttl - Time to live in seconds (default: 3600 / 1 hour)
 */
export const cacheMiddleware = (prefix, ttl = 3600) => async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = `${prefix}:${req.originalUrl || req.url}`;

    try {
        if (!redisClient.isReady) {
            return next();
        }
        const cachedData = await redisClient.get(key);
        if (cachedData) {
            console.log(`[Cache] HIT: ${key}`);
            return res.json(JSON.parse(cachedData));
        }

        console.log(`[Cache] MISS: ${key}`);
        
        // Override res.json to cache the response before sending it
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            // Only cache successful responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                redisClient.setEx(key, ttl, JSON.stringify(data)).catch(err => {
                    console.error(`[Cache] Error setting key ${key}:`, err);
                });
            }
            return originalJson(data);
        };

        next();
    } catch (err) {
        console.error(`[Cache] Error accessing Redis for key ${key}:`, err);
        next(); // Proceed to controller if cache fails
    }
};

/**
 * Utility to clear cache by prefix
 * @param {string} prefix - Prefix to clear (e.g., 'products:*')
 */
export const clearCache = async (pattern) => {
    try {
        if (!redisClient.isReady) return;
        
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`[Cache] INVALIDATED: ${pattern} (${keys.length} keys)`);
        }
    } catch (err) {
        console.error(`[Cache] Error clearing pattern ${pattern}:`, err);
    }
};
