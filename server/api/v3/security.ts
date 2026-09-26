import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Request, RequestHandler, Response } from 'express';
import { V3ApiError } from './http';
import type { V3Principal, V3Store, V3UserAuth } from './store';

export const V3_SESSION_COOKIE = 'lb_v3_session';
export const V3_CSRF_COOKIE = 'lb_v3_csrf';
const DEFAULT_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const dummyPasswordHash = bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

export interface V3AuthenticatedRequest extends Request {
  v3Principal?: V3Principal;
}

export const randomV3Token = () => crypto.randomBytes(32).toString('base64url');
export const sha256Buffer = (value: string | Buffer) => crypto.createHash('sha256').update(value).digest();

function cookieValue(req: Request, name: string): string | null {
  for (const cookie of req.headers.cookie?.split(';') || []) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function cookieSecurity() {
  return process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
}

export function setV3SessionCookies(res: Response, sessionToken: string, csrfToken: string, expiresAt: Date) {
  res.cookie(V3_SESSION_COOKIE, sessionToken, {
    httpOnly: true, sameSite: 'strict', secure: cookieSecurity(), path: '/api/v3', expires: expiresAt, priority: 'high',
  });
  res.cookie(V3_CSRF_COOKIE, csrfToken, {
    httpOnly: false, sameSite: 'strict', secure: cookieSecurity(), path: '/api/v3', expires: expiresAt, priority: 'high',
  });
}

export function clearV3SessionCookies(res: Response) {
  res.clearCookie(V3_SESSION_COOKIE, { httpOnly: true, sameSite: 'strict', secure: cookieSecurity(), path: '/api/v3' });
  res.clearCookie(V3_CSRF_COOKIE, { httpOnly: false, sameSite: 'strict', secure: cookieSecurity(), path: '/api/v3' });
}

export function csrfCookie(req: Request) {
  return cookieValue(req, V3_CSRF_COOKIE);
}

export async function passwordMatches(password: string, user: V3UserAuth | null) {
  return bcrypt.compare(password, user?.passwordHash || await dummyPasswordHash);
}

export async function establishSession(store: V3Store, user: V3UserAuth, req: Request, res: Response) {
  const sessionToken = randomV3Token();
  const csrfToken = randomV3Token();
  const ttl = Math.max(15 * 60_000, Number(process.env.SESSION_TTL_MS || DEFAULT_SESSION_TTL_MS));
  const expiresAt = new Date(Date.now() + ttl);
  const ip = req.ip || req.socket.remoteAddress || '';
  const ipSalt = process.env.IP_HASH_SALT || process.env.SESSION_SECRET || 'development-only-ip-salt';
  await store.createSession({
    id: crypto.randomUUID(), userId: user.id, tokenHash: sha256Buffer(sessionToken), csrfHash: sha256Buffer(csrfToken),
    expiresAt, ipHash: ip ? sha256Buffer(`${ipSalt}:${ip}`) : null,
    userAgent: (req.get('user-agent') || '').slice(0, 500) || null,
  });
  setV3SessionCookies(res, sessionToken, csrfToken, expiresAt);
  return { csrfToken, expiresAt };
}

export function authenticateV3(store: V3Store): RequestHandler {
  return async (req: V3AuthenticatedRequest, _res, next) => {
    try {
      const token = cookieValue(req, V3_SESSION_COOKIE);
      if (!token) throw new V3ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.');
      const principal = await store.findPrincipalByTokenHash(sha256Buffer(token));
      if (!principal) throw new V3ApiError(401, 'UNAUTHENTICATED', 'The session is invalid or expired.');
      req.v3Principal = principal;
      void store.touchSession(principal.sessionId).catch(() => undefined);
      next();
    } catch (error) {
      next(error);
    }
  };
}

type Permission = 'content:write';
const permissions: Record<V3Principal['role'], ReadonlySet<Permission>> = {
  super_admin: new Set(['content:write']), admin: new Set(['content:write']), editor: new Set(['content:write']),
};

export const authorizeV3 = (permission: Permission): RequestHandler => (req: V3AuthenticatedRequest, _res, next) => {
  const principal = req.v3Principal;
  if (!principal) return next(new V3ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.'));
  if (!permissions[principal.role].has(permission)) return next(new V3ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
  return next();
};

export const requireV3Csrf: RequestHandler = (req: V3AuthenticatedRequest, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const supplied = req.get('x-csrf-token') || '';
  const actual = sha256Buffer(supplied);
  const expected = req.v3Principal?.csrfHash;
  if (!supplied || !expected || actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    return next(new V3ApiError(403, 'CSRF_INVALID', 'The CSRF token is missing or invalid.'));
  }
  const origin = req.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.get('host')) return next(new V3ApiError(403, 'ORIGIN_INVALID', 'The request origin is not allowed.'));
    } catch {
      return next(new V3ApiError(403, 'ORIGIN_INVALID', 'The request origin is not allowed.'));
    }
  }
  return next();
};

export function v3Principal(req: Request): V3Principal {
  const principal = (req as V3AuthenticatedRequest).v3Principal;
  if (!principal) throw new V3ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  return principal;
}
