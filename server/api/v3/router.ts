import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { Router, type Request } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import {
  v3ContactInput, v3LoginInput, v3ProjectCreateInput, v3ProjectListQuery, v3ProjectPatchInput,
  v3ResourceId, validateV3,
} from './contracts';
import { asyncRoute, requestContext, V3ApiError, v3ErrorBody, v3ErrorHandler } from './http';
import {
  authenticateV3, authorizeV3, clearV3SessionCookies, csrfCookie, establishSession, passwordMatches,
  requireV3Csrf, sha256Buffer, v3Principal,
} from './security';
import { IdempotencyMismatchError, type MutationContext, type ProjectCursor, type V3Store } from './store';

const openApiPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'openapi.yaml');
const idempotencyTtlMs = 24 * 60 * 60 * 1000;

function limiter(limit: number, windowMs: number) {
  return rateLimit({
    windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false,
    handler: (_req, res) => {
      const requestId = String(res.locals.requestId || crypto.randomUUID());
      res.status(429).json(v3ErrorBody(new V3ApiError(429, 'RATE_LIMITED', 'Too many requests. Try again later.'), requestId));
    },
  });
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function idempotencyKey(req: Request) {
  const value = req.get('idempotency-key') || '';
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(value)) {
    throw new V3ApiError(400, 'IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key must contain 8 to 128 letters, numbers, dots, underscores, colons, or hyphens.');
  }
  return value;
}

function mutationContext(req: Request, scope: string, actorUserId: string | null): MutationContext {
  const key = idempotencyKey(req);
  return {
    requestId: String(req.res?.locals.requestId || crypto.randomUUID()), actorUserId,
    idempotencyScope: actorUserId ? `${scope}:${actorUserId}` : scope,
    idempotencyKeyHash: sha256Buffer(key),
    requestHash: sha256Buffer(stableStringify({ method: req.method, path: req.baseUrl + req.path, body: req.body })),
    expiresAt: new Date(Date.now() + idempotencyTtlMs),
  };
}

function cursorSecret() {
  return process.env.API_CURSOR_SECRET || process.env.SESSION_SECRET || 'development-only-cursor-secret';
}

function encodeCursor(cursor: ProjectCursor | null) {
  if (!cursor) return null;
  const payload = Buffer.from(JSON.stringify(cursor)).toString('base64url');
  const signature = crypto.createHmac('sha256', cursorSecret()).update(payload).digest('base64url').slice(0, 22);
  return `${payload}.${signature}`;
}

function decodeCursor(value?: string): ProjectCursor | undefined {
  if (!value) return undefined;
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra) throw new V3ApiError(400, 'CURSOR_INVALID', 'The pagination cursor is invalid.');
  const expected = crypto.createHmac('sha256', cursorSecret()).update(payload).digest('base64url').slice(0, 22);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new V3ApiError(400, 'CURSOR_INVALID', 'The pagination cursor is invalid.');
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as ProjectCursor;
    if (!Number.isInteger(decoded.sortOrder) || decoded.sortOrder < 0 || !v3ResourceId.safeParse(decoded.id).success) throw new Error('invalid');
    return decoded;
  } catch {
    throw new V3ApiError(400, 'CURSOR_INVALID', 'The pagination cursor is invalid.');
  }
}

function projectEtag(version: number) {
  return `"project-${version}"`;
}

function expectedVersion(req: Request) {
  const value = req.get('if-match');
  if (!value) throw new V3ApiError(428, 'PRECONDITION_REQUIRED', 'If-Match is required for this mutation.');
  const match = value.match(/^"project-(\d+)"$/);
  const version = match ? Number(match[1]) : 0;
  if (!Number.isInteger(version) || version < 1) throw new V3ApiError(400, 'ETAG_INVALID', 'If-Match must contain a project ETag such as "project-3".');
  return version;
}

function versionConflict(currentVersion: number): never {
  throw new V3ApiError(409, 'VERSION_CONFLICT', `The project changed. Retry with ETag ${projectEtag(currentVersion)}.`);
}

export function createV3Router(store: V3Store): Router {
  const router = Router();
  const authenticate = authenticateV3(store);
  router.use(requestContext);
  router.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
  router.use(express.json({ limit: '256kb', type: 'application/json' }));

  router.get('/openapi.yaml', (_req, res) => res.type('application/yaml').sendFile(openApiPath));
  router.get('/live', (_req, res) => res.json({ status: 'alive', api: 'v3' }));
  router.get('/ready', asyncRoute(async (_req, res) => {
    try {
      await store.ping();
      res.set('Cache-Control', 'no-store').json({ status: 'ready', api: 'v3', database: 'mysql' });
    } catch {
      throw new V3ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'The MySQL dependency is unavailable.', undefined, 5);
    }
  }));

  router.post('/auth/sessions', limiter(8, 15 * 60_000), asyncRoute(async (req, res) => {
    const input = validateV3(v3LoginInput, req.body);
    const user = await store.findUserByUsername(input.username);
    if (!await passwordMatches(input.password, user) || !user?.active) {
      throw new V3ApiError(401, 'INVALID_CREDENTIALS', 'The username or password is incorrect.');
    }
    const session = await establishSession(store, user, req, res);
    await store.recordLogin(user.id);
    res.set('Cache-Control', 'no-store').status(201).json({
      data: {
        user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, role: user.role },
        csrfToken: session.csrfToken, expiresAt: session.expiresAt.toISOString(),
      },
    });
  }));

  router.get('/auth/session', authenticate, (req, res) => {
    const principal = v3Principal(req);
    res.set('Cache-Control', 'no-store').json({
      data: {
        user: { id: principal.id, username: principal.username, email: principal.email, displayName: principal.displayName, role: principal.role },
        csrfToken: csrfCookie(req),
      },
    });
  });

  router.delete('/auth/session', authenticate, requireV3Csrf, asyncRoute(async (req, res) => {
    await store.revokeSession(v3Principal(req).sessionId);
    clearV3SessionCookies(res);
    res.status(204).end();
  }));

  router.get('/projects', asyncRoute(async (req, res) => {
    const query = validateV3(v3ProjectListQuery, req.query);
    const result = await store.listPublishedProjects({
      limit: query.limit, cursor: decodeCursor(query.cursor), category: query.category, featured: query.featured,
    });
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120').json({
      data: result.items,
      page: { limit: query.limit, nextCursor: encodeCursor(result.nextCursor) },
    });
  }));

  router.get('/projects/:slug', asyncRoute(async (req, res) => {
    const projectSlug = validateV3(v3ResourceId.or(v3ProjectCreateInput.shape.slug.unwrap()), req.params.slug);
    const project = await store.getPublishedProjectBySlug(projectSlug);
    if (!project) throw new V3ApiError(404, 'PROJECT_NOT_FOUND', 'The project was not found.');
    res.set({ ETag: projectEtag(project.version), 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' }).json({ data: project });
  }));

  router.post('/contact-messages', limiter(5, 10 * 60_000), asyncRoute(async (req, res) => {
    const input = validateV3(v3ContactInput, req.body);
    const ip = req.ip || req.socket.remoteAddress || '';
    const salt = process.env.IP_HASH_SALT || process.env.SESSION_SECRET || 'development-only-ip-salt';
    try {
      const result = await store.createContactMessage(
        input, ip ? sha256Buffer(`${salt}:${ip}`) : null, (req.get('user-agent') || '').slice(0, 500) || null,
        mutationContext(req, 'contact-messages:create', null),
      );
      res.set('Idempotency-Replayed', String(result.replayed)).status(result.status).json({ data: result.value });
    } catch (error) {
      if (error instanceof IdempotencyMismatchError) throw new V3ApiError(409, 'IDEMPOTENCY_CONFLICT', 'The Idempotency-Key was already used with a different request.');
      throw error;
    }
  }));

  const projectWrite = [authenticate, authorizeV3('content:write'), requireV3Csrf];
  router.post('/admin/projects', ...projectWrite, asyncRoute(async (req, res) => {
    const input = validateV3(v3ProjectCreateInput, req.body);
    const principal = v3Principal(req);
    try {
      const result = await store.createProject(input, mutationContext(req, 'admin-projects:create', principal.id));
      res.set({ Location: `/api/v3/projects/${result.value.slug}`, ETag: projectEtag(result.value.version), 'Idempotency-Replayed': String(result.replayed) })
        .status(result.status).json({ data: result.value });
    } catch (error) {
      if (error instanceof IdempotencyMismatchError) throw new V3ApiError(409, 'IDEMPOTENCY_CONFLICT', 'The Idempotency-Key was already used with a different request.');
      throw error;
    }
  }));

  router.patch('/admin/projects/:id', ...projectWrite, asyncRoute(async (req, res) => {
    const id = validateV3(v3ResourceId, req.params.id);
    const input = validateV3(v3ProjectPatchInput, req.body);
    const result = await store.updateProject(id, expectedVersion(req), input, v3Principal(req).id, String(res.locals.requestId));
    if (result.outcome === 'not_found') throw new V3ApiError(404, 'PROJECT_NOT_FOUND', 'The project was not found.');
    if (result.outcome === 'version_conflict') versionConflict(result.currentVersion);
    res.set('ETag', projectEtag(result.project.version)).json({ data: result.project });
  }));

  router.delete('/admin/projects/:id', ...projectWrite, asyncRoute(async (req, res) => {
    const id = validateV3(v3ResourceId, req.params.id);
    const result = await store.deleteProject(id, expectedVersion(req), v3Principal(req).id, String(res.locals.requestId));
    if (result.outcome === 'not_found') throw new V3ApiError(404, 'PROJECT_NOT_FOUND', 'The project was not found.');
    if (result.outcome === 'version_conflict') versionConflict(result.currentVersion);
    res.set('ETag', projectEtag(result.version)).status(204).end();
  }));

  router.use((_req, _res, next) => next(new V3ApiError(404, 'ROUTE_NOT_FOUND', 'The API route was not found.')));
  router.use(v3ErrorHandler);
  return router;
}

export function createUnavailableV3Router(): Router {
  const router = Router();
  router.use(requestContext);
  router.get('/openapi.yaml', (_req, res) => res.type('application/yaml').sendFile(openApiPath));
  router.get('/live', (_req, res) => res.json({ status: 'alive', api: 'v3' }));
  router.use((_req, res) => {
    const error = new V3ApiError(503, 'MYSQL_UNAVAILABLE', 'The MySQL API is not configured or its schema is unavailable.', undefined, 5);
    res.set({ 'Cache-Control': 'no-store', 'Retry-After': '5' }).status(503).json(v3ErrorBody(error, String(res.locals.requestId)));
  });
  return router;
}
