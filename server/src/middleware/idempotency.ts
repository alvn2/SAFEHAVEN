import type { Request, Response, NextFunction } from 'express';
import { Buffer } from 'node:buffer';

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

// Lightweight zero-dependency JWT payload extractor
function decodeJwtPayload(token: string): { id?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = (Buffer as any).from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export const idempotency = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to state-modifying HTTP methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const key = req.header('Idempotency-Key');
  if (!key) {
    return next();
  }

  // Attempt to extract authenticated user from req.user or directly from Bearer token
  let userId = (req as any).user?.id;
  if (!userId) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = decodeJwtPayload(token);
      if (decoded?.id) {
        userId = decoded.id;
      }
    }
  }

  const clientIdentifier = userId ? `user:${userId}` : `ip:${req.ip || 'anonymous'}`;
  const cacheKey = `${clientIdentifier}:${req.method}:${req.baseUrl + req.path}:${key}`;

  const cached = idempotencyStore.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < IDEMPOTENCY_TTL_MS) {
    res.setHeader('X-Idempotency-Replay', 'true');
    return res.status(cached.statusCode).json(cached.body);
  }

  // Intercept res.json to capture response (deep copy to prevent mutation)
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    // Only cache successful or non-server-error responses
    if (res.statusCode < 500) {
      try {
        const clonedBody = typeof body === 'object' && body !== null ? JSON.parse(JSON.stringify(body)) : body;
        idempotencyStore.set(cacheKey, {
          statusCode: res.statusCode,
          headers: {},
          body: clonedBody,
          createdAt: Date.now()
        });
      } catch {
        idempotencyStore.set(cacheKey, {
          statusCode: res.statusCode,
          headers: {},
          body,
          createdAt: Date.now()
        });
      }
    }
    return originalJson(body);
  };

  next();
};
