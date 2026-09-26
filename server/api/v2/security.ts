import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Kysely, Selectable } from 'kysely';
import type { Database, Role, UserTable } from '../../db/types';
import { ApiError } from './http';

export const SESSION_COOKIE = 'lb_session';
export const CSRF_COOKIE = 'lb_csrf';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export interface Principal {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
  teamMemberId: string | null;
  sessionId: string;
  csrfHash: string;
}

export interface AuthenticatedRequest extends Request {
  principal?: Principal;
}

export const sha256 = (value: string | Buffer) => crypto.createHash('sha256').update(value).digest('hex');
export const randomToken = () => crypto.randomBytes(32).toString('base64url');
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

function cookieValue(req: Request, name: string): string | null {
  const cookies = req.headers.cookie?.split(';') || [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  const secure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/',
    expires: expiresAt,
    priority: 'high',
  });
}

function setCsrfCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
    priority: 'high',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.clearCookie(CSRF_COOKIE, { sameSite: 'strict', secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production', path: '/' });
}

export async function createSession(db: Kysely<Database>, user: Selectable<UserTable>, req: Request, res: Response) {
  const token = randomToken();
  const csrfToken = randomToken();
  const expiresAt = new Date(Date.now() + Math.max(15 * 60_000, Number(process.env.SESSION_TTL_MS || SESSION_TTL_MS)));
  const ip = req.ip || req.socket.remoteAddress || '';
  const ipSalt = process.env.IP_HASH_SALT || process.env.SESSION_SECRET || 'development-only-ip-salt';
  const sessionId = crypto.randomUUID();
  await db.insertInto('sessions').values({
    id: sessionId,
    user_id: user.id,
    token_hash: sha256(token),
    csrf_hash: sha256(csrfToken),
    expires_at: expiresAt,
    ip_hash: ip ? sha256(`${ipSalt}:${ip}`) : null,
    user_agent: (req.get('user-agent') || '').slice(0, 500) || null,
    revoked_at: null,
  }).execute();
  setSessionCookie(res, token, expiresAt);
  setCsrfCookie(res, csrfToken, expiresAt);
  return { csrfToken, expiresAt, sessionId };
}

export function csrfTokenFromCookie(req: Request): string | null {
  return cookieValue(req, CSRF_COOKIE);
}

export function authenticate(db: Kysely<Database>): RequestHandler {
  return async (req: AuthenticatedRequest, _res, next) => {
    try {
      const token = cookieValue(req, SESSION_COOKIE);
      if (!token) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.');
      const row = await db.selectFrom('sessions')
        .innerJoin('users', 'users.id', 'sessions.user_id')
        .select([
          'sessions.id as session_id', 'sessions.csrf_hash', 'sessions.expires_at', 'sessions.revoked_at',
          'users.id', 'users.username', 'users.email', 'users.display_name', 'users.role', 'users.team_member_id', 'users.is_active', 'users.deleted_at',
        ])
        .where('sessions.token_hash', '=', sha256(token))
        .executeTakeFirst();
      const expires = row?.expires_at instanceof Date ? row.expires_at : new Date(String(row?.expires_at));
      if (!row || row.revoked_at || row.deleted_at || !row.is_active || expires.getTime() <= Date.now()) {
        throw new ApiError(401, 'UNAUTHENTICATED', 'The session is invalid or expired.');
      }
      req.principal = {
        id: row.id,
        username: row.username,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        teamMemberId: row.team_member_id,
        sessionId: row.session_id,
        csrfHash: row.csrf_hash,
      };
      void db.updateTable('sessions').set({ last_seen_at: new Date() }).where('id', '=', row.session_id).execute().catch(() => undefined);
      next();
    } catch (error) {
      next(error);
    }
  };
}

type Permission = 'content:read' | 'content:write' | 'messages:read' | 'messages:write' | 'media:upload' | 'media:write' | 'settings:write' | 'users:manage' | 'audit:read';

const permissions: Record<Role, ReadonlySet<Permission>> = {
  super_admin: new Set(['content:read', 'content:write', 'messages:read', 'messages:write', 'media:upload', 'media:write', 'settings:write', 'users:manage', 'audit:read']),
  admin: new Set(['content:read', 'content:write', 'messages:read', 'messages:write', 'media:upload', 'media:write', 'settings:write', 'audit:read']),
  editor: new Set(['content:read', 'content:write', 'messages:read', 'messages:write', 'media:upload', 'media:write']),
  team_member: new Set(['media:upload']),
};

export const authorize = (permission: Permission): RequestHandler => (req: AuthenticatedRequest, _res, next) => {
  if (!req.principal) return next(new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.'));
  if (!permissions[req.principal.role].has(permission)) return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
  return next();
};

export const requireCsrf: RequestHandler = (req: AuthenticatedRequest, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.get('x-csrf-token') || '';
  const candidate = Buffer.from(sha256(token));
  const expected = Buffer.from(req.principal?.csrfHash || '');
  if (!req.principal || !token || candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) return next(new ApiError(403, 'CSRF_INVALID', 'The CSRF token is missing or invalid.'));
  const origin = req.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.get('host')) return next(new ApiError(403, 'ORIGIN_INVALID', 'The request origin is not allowed.'));
    } catch {
      return next(new ApiError(403, 'ORIGIN_INVALID', 'The request origin is not allowed.'));
    }
  }
  return next();
};

export async function audit(db: Kysely<Database>, req: AuthenticatedRequest, action: string, resourceType: string, resourceId?: string, metadata: Record<string, string | number | boolean | null> = {}) {
  await db.insertInto('audit_logs').values({
    actor_user_id: req.principal?.id || null,
    action,
    resource_type: resourceType,
    resource_id: resourceId || null,
    request_id: String(req.res?.locals.requestId || '') || null,
    metadata,
  }).execute();
}

export function principal(req: Request): Principal {
  const value = (req as AuthenticatedRequest).principal;
  if (!value) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  return value;
}
