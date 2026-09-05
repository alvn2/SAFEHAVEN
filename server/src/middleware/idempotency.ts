import type { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  createdAt: number;
}

// In-memory cache for idempotency records (TTL: 5 minutes)
const idempotencyStore = new Map<string, CachedResponse>();
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

// Automatic periodic cache cleanup every 10 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.createdAt > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}, 10 * 60 * 1000);
cleanupTimer.unref();

export const idempotency = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to state-modifying HTTP methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const key = req.header('Idempotency-Key');
  if (!key) {
    return next();
  }

  const clientIdentifier = (req as any).user?.id || req.ip || 'anonymous';
  const cacheKey = `${clientIdentifier}:${req.method}:${req.baseUrl + req.path}:${key}`;

  const cached = idempotencyStore.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < IDEMPOTENCY_TTL_MS) {
    res.setHeader('X-Idempotency-Replay', 'true');
    return res.status(cached.statusCode).json(cached.body);
  }

  // Intercept res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    // Only cache successful or non-server-error responses
    if (res.statusCode < 500) {
      idempotencyStore.set(cacheKey, {
        statusCode: res.statusCode,
        headers: {},
        body,
        createdAt: Date.now()
      });
    }
    return originalJson(body);
  };

  next();
};
