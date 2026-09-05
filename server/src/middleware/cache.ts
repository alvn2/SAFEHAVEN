import type { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  body: any;
  cachedAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

export const cacheMiddleware = (ttlSeconds: number, swrSeconds = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cached = memoryCache.get(key);
    const now = Date.now();

    // Attach modern HTTP caching headers
    res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=${swrSeconds}`);

    if (cached && (now - cached.cachedAt) < (ttlSeconds * 1000)) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.body);
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept json call to populate cache
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode === 200) {
        memoryCache.set(key, {
          body,
          cachedAt: Date.now()
        });
      }
      return originalJson(body);
    };

    next();
  };
};

export const invalidateCache = (urlPrefix: string) => {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      memoryCache.delete(key);
    }
  }
};
