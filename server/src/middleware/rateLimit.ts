import type { Request, Response, NextFunction } from 'express';
import { formatErrorResponse } from '../utils/errors.js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

export const createRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  code?: string;
  message?: string;
  name: string;
}) => {
  const store = new Map<string, RateLimitRecord>();
  rateLimitStores.set(options.name, store);

  // Periodic cleanup
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(ip);
      }
    }
  }, options.windowMs);
  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Exempt local health checks or safety nuke calls
    if (req.path === '/' || req.path === '/nuke') {
      return next();
    }

    const identifier = ((req as any).user?.id || req.ip || 'anonymous').toString();
    const now = Date.now();

    let record = store.get(identifier);
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + options.windowMs };
      store.set(identifier, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);

      return res.status(429).json(
        formatErrorResponse(
          options.code || 'RATE_LIMIT_EXCEEDED',
          options.message || 'Too many requests. Please slow down.',
          429,
          { retryAfterSeconds: retryAfterSec }
        )
      );
    }

    next();
  };
};

// Pre-configured rate limiting tiers
export const authRateLimiter = createRateLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 login/register attempts per 15 min per IP
  code: 'AUTH_RATE_LIMITED',
  message: 'Too many authentication attempts. Please try again in 15 minutes.'
});

export const mutationRateLimiter = createRateLimiter({
  name: 'mutation',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 writes per minute
  code: 'MUTATION_RATE_LIMITED',
  message: 'Write rate limit exceeded. Please wait a moment.'
});

export const generalRateLimiter = createRateLimiter({
  name: 'general',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 180, // 180 requests per minute
  code: 'GENERAL_RATE_LIMITED',
  message: 'Too many requests. Please slow down.'
});
