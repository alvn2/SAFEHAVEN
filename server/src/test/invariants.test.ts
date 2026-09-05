import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { AppError, formatErrorResponse } from '../utils/errors.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { idempotency } from '../middleware/idempotency.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

function makeFakeJwt(payload: { id: string }): string {
  const header = (Buffer as any).from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = (Buffer as any).from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.fakesig`;
}

// Helper to construct mock Express Request/Response
function createMockContext(options: {
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  ip?: string;
  user?: any;
} = {}) {
  const reqPath = options.path || '/api/test';
  const req: any = {
    method: options.method || 'GET',
    path: reqPath,
    url: reqPath,
    originalUrl: reqPath,
    baseUrl: '',
    headers: options.headers || {},
    header(name: string) {
      return this.headers[name.toLowerCase()] || this.headers[name];
    },
    ip: options.ip || '127.0.0.1',
    user: options.user || null
  };

  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, any>,
    body: null,
    setHeader(name: string, value: any) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name: string) {
      return this.headers[name.toLowerCase()];
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    }
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, wasNextCalled: () => nextCalled };
}

describe('INV-01: API Resilience & Structured Error Envelopes', () => {
  it('formats error responses with backward compatibility and structured errorDetails', () => {
    const errorRes = formatErrorResponse('TEST_CODE', 'A test error occurred', 400, { field: 'name' }, 'req-999');

    assert.equal(errorRes.success, false);
    assert.equal(errorRes.error, 'A test error occurred');
    assert.equal(errorRes.errorDetails.code, 'TEST_CODE');
    assert.equal(errorRes.errorDetails.statusCode, 400);
    assert.equal(errorRes.errorDetails.requestId, 'req-999');
    assert.deepEqual(errorRes.errorDetails.details, { field: 'name' });
    assert.ok(errorRes.errorDetails.timestamp);
  });

  it('errorHandler captures AppError instances and preserves status code and metadata', () => {
    const { req, res, next } = createMockContext({
      headers: { 'x-request-id': 'req-trace-123' }
    });

    const appError = new AppError('RESOURCE_NOT_FOUND', 'The requested resource was not found', 404, { id: 'item-1' });
    errorHandler(appError, req, res, next);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorDetails.code, 'RESOURCE_NOT_FOUND');
    assert.equal(res.body.errorDetails.requestId, 'req-trace-123');
    assert.deepEqual(res.body.errorDetails.details, { id: 'item-1' });
  });

  it('errorHandler gracefully catches unhandled errors as 500 INTERNAL_SERVER_ERROR', () => {
    const { req, res, next } = createMockContext();
    const runtimeError = new Error('Unexpected database connection timeout');

    errorHandler(runtimeError, req, res, next);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorDetails.code, 'INTERNAL_SERVER_ERROR');
    assert.equal(res.body.error, 'An internal server error occurred');
  });
});

describe('INV-05: Idempotency Replay on Flaky Mobile Networks', () => {
  it('bypasses idempotency for GET requests without intercepting', () => {
    const { req, res, next, wasNextCalled } = createMockContext({
      method: 'GET',
      headers: { 'idempotency-key': 'uuid-idemp-1' }
    });

    idempotency(req, res, next);
    assert.equal(wasNextCalled(), true);
    assert.equal(res.getHeader('x-idempotency-replay'), undefined);
  });

  it('bypasses idempotency for mutations that do not supply an Idempotency-Key', () => {
    const { req, res, next, wasNextCalled } = createMockContext({
      method: 'POST'
    });

    idempotency(req, res, next);
    assert.equal(wasNextCalled(), true);
    assert.equal(res.getHeader('x-idempotency-replay'), undefined);
  });

  it('caches the first mutation response and replays it on subsequent duplicate requests', () => {
    const key = `test-key-${Date.now()}`;

    // First request
    const ctx1 = createMockContext({
      method: 'POST',
      path: '/api/journal',
      headers: { 'idempotency-key': key },
      user: { id: 'seeker-alpha' }
    });

    idempotency(ctx1.req, ctx1.res, ctx1.next);
    assert.equal(ctx1.wasNextCalled(), true);

    // Simulate route handler completing
    ctx1.res.status(201).json({ id: 'journal-entry-1', status: 'created' });
    assert.equal(ctx1.res.statusCode, 201);
    assert.equal(ctx1.res.getHeader('x-idempotency-replay'), undefined);

    // Duplicate retry request with same Idempotency-Key
    const ctx2 = createMockContext({
      method: 'POST',
      path: '/api/journal',
      headers: { 'idempotency-key': key },
      user: { id: 'seeker-alpha' }
    });

    idempotency(ctx2.req, ctx2.res, ctx2.next);

    // Second request should NOT call next(); it should directly replay cached response
    assert.equal(ctx2.wasNextCalled(), false);
    assert.equal(ctx2.res.statusCode, 201);
    assert.equal(ctx2.res.getHeader('x-idempotency-replay'), 'true');
    assert.deepEqual(ctx2.res.body, { id: 'journal-entry-1', status: 'created' });
  });

  it('isolates idempotency cache keys by Bearer token user ID across shared NAT IPs', () => {
    const key = `shared-key-${Date.now()}`;
    const sharedIp = '197.237.100.1'; // Safaricom / Airtel CGNAT IP
    const tokenA = makeFakeJwt({ id: 'user-A' });
    const tokenB = makeFakeJwt({ id: 'user-B' });

    // User A submits mutation
    const ctxA = createMockContext({
      method: 'POST',
      path: '/api/journal',
      headers: {
        'idempotency-key': key,
        'authorization': `Bearer ${tokenA}`
      },
      ip: sharedIp
    });

    idempotency(ctxA.req, ctxA.res, ctxA.next);
    assert.equal(ctxA.wasNextCalled(), true);
    ctxA.res.status(201).json({ secretNote: 'User A journal' });

    // User B submits mutation with same key from same IP
    const ctxB = createMockContext({
      method: 'POST',
      path: '/api/journal',
      headers: {
        'idempotency-key': key,
        'authorization': `Bearer ${tokenB}`
      },
      ip: sharedIp
    });

    idempotency(ctxB.req, ctxB.res, ctxB.next);
    // User B must NOT receive User A's replay! Next must be called!
    assert.equal(ctxB.wasNextCalled(), true);
    assert.equal(ctxB.res.getHeader('x-idempotency-replay'), undefined);
  });
});

describe('INV-06: Sliding Window Rate Limiting & Abuse Defense', () => {
  it('allows requests within limit and attaches rate limit headers', () => {
    const limiter = createRateLimiter({
      name: 'test-limiter-1',
      windowMs: 60 * 1000,
      maxRequests: 5
    });

    const ctx = createMockContext({ ip: '10.0.0.1' });
    limiter(ctx.req, ctx.res, ctx.next);

    assert.equal(ctx.wasNextCalled(), true);
    assert.equal(ctx.res.getHeader('x-rateLimit-limit'), 5);
    assert.equal(ctx.res.getHeader('x-rateLimit-remaining'), 4);
    assert.ok(ctx.res.getHeader('x-rateLimit-reset'));
  });

  it('throttles excessive requests with 429 and Retry-After header', () => {
    const limiter = createRateLimiter({
      name: 'test-limiter-burst',
      windowMs: 60 * 1000,
      maxRequests: 2,
      code: 'AUTH_BURST_LIMITED',
      message: 'Rate limit exceeded'
    });

    const ip = `test-ip-${Date.now()}`;

    // Request 1: OK
    const ctx1 = createMockContext({ ip });
    limiter(ctx1.req, ctx1.res, ctx1.next);
    assert.equal(ctx1.wasNextCalled(), true);

    // Request 2: OK
    const ctx2 = createMockContext({ ip });
    limiter(ctx2.req, ctx2.res, ctx2.next);
    assert.equal(ctx2.wasNextCalled(), true);

    // Request 3: Throttled (exceeds maxRequests = 2)
    const ctx3 = createMockContext({ ip });
    limiter(ctx3.req, ctx3.res, ctx3.next);
    assert.equal(ctx3.wasNextCalled(), false);
    assert.equal(ctx3.res.statusCode, 429);
    assert.equal(ctx3.res.body.errorDetails.code, 'AUTH_BURST_LIMITED');
    assert.ok(ctx3.res.getHeader('retry-after'));
  });

  it('exempts / and /nuke emergency endpoints from rate limiting', () => {
    const limiter = createRateLimiter({
      name: 'test-limiter-exempt',
      windowMs: 60 * 1000,
      maxRequests: 0 // Zero allowance
    });

    const ctxHealth = createMockContext({ path: '/' });
    limiter(ctxHealth.req, ctxHealth.res, ctxHealth.next);
    assert.equal(ctxHealth.wasNextCalled(), true);

    const ctxNuke = createMockContext({ path: '/nuke' });
    limiter(ctxNuke.req, ctxNuke.res, ctxNuke.next);
    assert.equal(ctxNuke.wasNextCalled(), true);
  });
});

describe('INV-07: In-Memory Cache with HTTP SWR & Invalidation', () => {
  it('serves cache MISS on first request, attaches SWR headers, and HIT on subsequent request', () => {
    const cache = cacheMiddleware(60, 120);
    const path = `/api/volunteers-test-${Date.now()}`;

    // 1. Initial Request (MISS)
    const ctx1 = createMockContext({ method: 'GET', path });
    cache(ctx1.req, ctx1.res, ctx1.next);
    assert.equal(ctx1.wasNextCalled(), true);
    assert.equal(ctx1.res.getHeader('x-cache'), 'MISS');
    assert.equal(
      ctx1.res.getHeader('cache-control'),
      'public, max-age=60, stale-while-revalidate=120'
    );

    // Simulate controller sending payload
    ctx1.res.json([{ id: 'vol-1', name: 'Faith K.' }]);

    // 2. Subsequent Request (HIT)
    const ctx2 = createMockContext({ method: 'GET', path });
    cache(ctx2.req, ctx2.res, ctx2.next);
    assert.equal(ctx2.wasNextCalled(), false);
    assert.equal(ctx2.res.getHeader('x-cache'), 'HIT');
    assert.deepEqual(ctx2.res.body, [{ id: 'vol-1', name: 'Faith K.' }]);

    // 3. Invalidate Cache
    invalidateCache(path);

    // 4. Third Request after invalidation (MISS again)
    const ctx3 = createMockContext({ method: 'GET', path });
    cache(ctx3.req, ctx3.res, ctx3.next);
    assert.equal(ctx3.wasNextCalled(), true);
    assert.equal(ctx3.res.getHeader('x-cache'), 'MISS');
  });
});
