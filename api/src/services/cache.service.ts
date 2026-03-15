import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

/**
 * Returns a singleton Redis client if Upstash credentials are configured,
 * otherwise null. All callers must handle the null case gracefully — the
 * app continues to work without a cache, just without token/listing caching.
 */
function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env['UPSTASH_REDIS_REST_URL'];
  const token = process.env['UPSTASH_REDIS_REST_TOKEN'];

  if (!url || !token) {
    return null;
  }

  _redis = new Redis({ url, token });
  return _redis;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
      return await redis.get<T>(key);
    } catch (err) {
      console.warn('[cache] get failed:', err);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (err) {
      console.warn('[cache] set failed:', err);
    }
  },

  async del(key: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (err) {
      console.warn('[cache] del failed:', err);
    }
  },
};

// ─── Cache key constants ───────────────────────────────────────────────────────
export const CacheKeys = {
  mlsToken: 'gprmls:token',
  listings: (state?: string) => `gprmls:listings:${state ?? 'all'}`,
  listing: (id: string) => `gprmls:listing:${id}`,
  soldListings: (state?: string) => `gprmls:sold:${state ?? 'all'}`,
};
