import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getJwtSecret, authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

describe('SEC-01: Cryptographic Rigor & JWT Secret Enforcement', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.JWT_SECRET = originalSecret;
  });

  it('throws fatal error in production when JWT_SECRET is missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    assert.throws(
      () => getJwtSecret(),
      /FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production/
    );
  });

  it('throws fatal error in production when JWT_SECRET is "secret"', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'secret';
    assert.throws(
      () => getJwtSecret(),
      /FATAL SECURITY ERROR: JWT_SECRET is too weak for production/
    );
  });

  it('throws fatal error in production when JWT_SECRET is shorter than 32 characters', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'short_insecure_key_123';
    assert.throws(
      () => getJwtSecret(),
      /FATAL SECURITY ERROR: JWT_SECRET is too weak for production/
    );
  });

  it('returns valid JWT secret when properly configured', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'this-is-a-very-strong-and-secure-production-jwt-secret-key';
    assert.equal(getJwtSecret(), 'this-is-a-very-strong-and-secure-production-jwt-secret-key');
  });
});

describe('SEC-02: Authentication & Authorization Middleware Gatekeeping', () => {
  const testSecret = 'dev-test-secret-that-is-at-least-32-chars-long';

  function createMockContext(headers: Record<string, string> = {}, user: any = null) {
    const req: any = {
      headers,
      header(name: string) {
        return this.headers[name.toLowerCase()] || this.headers[name];
      },
      user
    };
    const res: any = {
      statusCode: 200,
      body: null,
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
    const next = () => { nextCalled = true; };
    return { req, res, next, wasNextCalled: () => nextCalled };
  }

  it('rejects unauthenticated requests with 401 Unauthorized', () => {
    const { req, res, next, wasNextCalled } = createMockContext();
    authenticate(req as AuthRequest, res, next);
    assert.equal(res.statusCode, 401);
    assert.equal(wasNextCalled(), false);
  });

  it('rejects tampered or malformed tokens with 400 Bad Request', () => {
    const { req, res, next, wasNextCalled } = createMockContext({
      authorization: 'Bearer invalid.token.payload'
    });
    authenticate(req as AuthRequest, res, next);
    assert.equal(res.statusCode, 400);
    assert.equal(wasNextCalled(), false);
  });

  it('accepts valid bearer token and populates req.user', () => {
    const token = jwt.sign({ id: 'user-123', role: 'USER' }, getJwtSecret(), { expiresIn: '1h' });
    const { req, res, next, wasNextCalled } = createMockContext({
      authorization: `Bearer ${token}`
    });
    authenticate(req as AuthRequest, res, next);
    assert.equal(wasNextCalled(), true);
    assert.equal(req.user?.id, 'user-123');
    assert.equal(req.user?.role, 'USER');
  });

  it('requireAdmin blocks regular USER with 403 Forbidden', () => {
    const { req, res, next, wasNextCalled } = createMockContext({}, { id: 'u1', role: 'USER' });
    requireAdmin(req as AuthRequest, res, next);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Access denied. Admins only.');
    assert.equal(wasNextCalled(), false);
  });

  it('requireAdmin blocks VOLUNTEER_APPROVED with 403 Forbidden', () => {
    const { req, res, next, wasNextCalled } = createMockContext({}, { id: 'v1', role: 'VOLUNTEER_APPROVED' });
    requireAdmin(req as AuthRequest, res, next);
    assert.equal(res.statusCode, 403);
    assert.equal(wasNextCalled(), false);
  });

  it('requireAdmin permits ADMIN users through', () => {
    const { req, res, next, wasNextCalled } = createMockContext({}, { id: 'a1', role: 'ADMIN' });
    requireAdmin(req as AuthRequest, res, next);
    assert.equal(wasNextCalled(), true);
  });
});

describe('SEC-03: Recovery Key Hashing & Verification Logic', () => {
  it('hashes recovery keys so plaintext is never exposed in storage', async () => {
    const rawKey = 'ABCD-EFGH-IJKL-MNOP';
    const hash = await bcrypt.hash(rawKey, 10);
    assert.notEqual(rawKey, hash);
    assert.ok(hash.startsWith('$2'));

    // Verifies correctly
    const match = await bcrypt.compare(rawKey, hash);
    assert.equal(match, true);

    // Rejects incorrect key
    const mismatch = await bcrypt.compare('WRONG-KEY-1234-5678', hash);
    assert.equal(mismatch, false);
  });
});
