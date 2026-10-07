import crypto from 'node:crypto';
import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import { sql, type Kysely } from 'kysely';
import type { Database, Role } from '../../db/types';
import type { JsonValue } from '../../db/types';
import {
  createBlog, createProject, createService, createTeamMember, createTestimonial, getBlog, getProject, getService, getTeamMember,
  listBlogs, listProjects, listServices, listTeam, listTestimonials, softDelete, updateBlog, updateProject, updateService, updateTeamMember, updateTestimonial,
} from './content-repository';
import { ApiError, asyncHandler, errorHandler, paginated, parsePagination, requestContext } from './http';
import {
  audit, authenticate, authorize, clearSessionCookie, createSession, csrfTokenFromCookie, hashPassword, principal, requireCsrf, sha256, verifyPassword,
} from './security';
import { blogInput, loginSchema, messageInput, projectInput, serviceInput, settingInput, skillInput, slugify, teamInput, technologyInput, testimonialInput, userInput, userUpdateInput, validate } from './schemas';
import { storeUpload } from './storage';

const limiter = (windowMs: number, limit: number, message: string) => rateLimit({
  windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message, requestId: String(res.locals.requestId || '') } }),
});
const loginLimiter = limiter(15 * 60_000, 8, 'Too many login attempts. Try again later.');
const contactLimiter = limiter(10 * 60_000, 5, 'Too many messages. Try again later.');
const publicReadLimiter = limiter(60_000, 120, 'Too many content requests. Try again later.');
const uploadLimiter = limiter(10 * 60_000, 40, 'Too many upload attempts. Try again later.');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 5 } });
const dummyHash = hashPassword(crypto.randomBytes(24).toString('base64url'));
const json = (value: unknown): JsonValue => JSON.stringify(value) as unknown as JsonValue;
const parseJson = (value: JsonValue): JsonValue => {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value) as JsonValue; } catch { return value; }
};

const listQuery = (req: express.Request) => ({ ...parsePagination(req), search: String(req.query.search || '').slice(0, 200), status: String(req.query.status || '').slice(0, 30), category: String(req.query.category || '').slice(0, 120), includeDeleted: req.query.includeDeleted === 'true' });

function publicCache(res: express.Response) {
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
}

const recentViews = new Map<string, number>();
async function recordView(db: Kysely<Database>, type: string, id: string, req: express.Request) {
  const now = Date.now();
  if (recentViews.size > 10_000) for (const [key, expiry] of recentViews) if (expiry <= now) recentViews.delete(key);
  const salt = process.env.IP_HASH_SALT || 'development-view-salt';
  const visitor = sha256(`${salt}:${req.ip || req.socket.remoteAddress || 'unknown'}`);
  const key = `${visitor}:${type}:${id}`;
  if ((recentViews.get(key) || 0) > now) return;
  recentViews.set(key, now + 10 * 60_000);
  await db.insertInto('page_views').values({ resource_type: type, resource_id: id, view_count: '1' })
    .onDuplicateKeyUpdate({ view_count: sql`page_views.view_count + 1` })
    .execute();
}

async function moveProject(db: Kysely<Database>, id: string, direction: -1 | 1) {
  await db.transaction().execute(async (trx) => {
    const rows = await trx.selectFrom('projects').select(['id', 'sort_order']).where('deleted_at', 'is', null).orderBy('sort_order').orderBy('id').execute();
    const currentIndex = rows.findIndex((row) => row.id === id);
    if (currentIndex < 0) throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found.');
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const reordered = [...rows];
    const [current] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, current);
    for (const [index, row] of reordered.entries()) {
      if (row.sort_order !== index + 1) await trx.updateTable('projects').set({ sort_order: index + 1 }).where('id', '=', row.id).execute();
    }
  });
  return getProject(db, id);
}

async function moveTeamMember(db: Kysely<Database>, id: string, direction: -1 | 1) {
  await db.transaction().execute(async (trx) => {
    const rows = await trx.selectFrom('team_members').select(['id', 'display_order']).where('deleted_at', 'is', null).orderBy('display_order').orderBy('id').execute();
    const currentIndex = rows.findIndex((row) => row.id === id);
    if (currentIndex < 0) throw new ApiError(404, 'TEAM_MEMBER_NOT_FOUND', 'Team member not found.');
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const reordered = [...rows];
    const [current] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, current);
    for (const [index, row] of reordered.entries()) {
      if (row.display_order !== index + 1) await trx.updateTable('team_members').set({ display_order: index + 1 }).where('id', '=', row.id).execute();
    }
  });
  return getTeamMember(db, id);
}

async function assertMediaIsUnused(db: Kysely<Database>, mediaId: string) {
  const references = await Promise.all([
    db.selectFrom('projects').select('id').where('thumbnail_media_id', '=', mediaId).where('deleted_at', 'is', null).executeTakeFirst(),
    db.selectFrom('project_media').innerJoin('projects', 'projects.id', 'project_media.project_id').select('project_media.project_id').where('project_media.media_id', '=', mediaId).where('projects.deleted_at', 'is', null).executeTakeFirst(),
    db.selectFrom('team_members').select('id').where((eb) => eb.or([
      eb('avatar_media_id', '=', mediaId), eb('cover_media_id', '=', mediaId), eb('cv_media_id', '=', mediaId),
    ])).where('deleted_at', 'is', null).executeTakeFirst(),
    db.selectFrom('blog_posts').select('id').where('cover_media_id', '=', mediaId).where('deleted_at', 'is', null).executeTakeFirst(),
    db.selectFrom('services').select('id').where('media_id', '=', mediaId).where('deleted_at', 'is', null).executeTakeFirst(),
    db.selectFrom('testimonials').select('id').where('avatar_media_id', '=', mediaId).where('deleted_at', 'is', null).executeTakeFirst(),
  ]);
  if (references.some(Boolean)) {
    throw new ApiError(409, 'MEDIA_IN_USE', 'This media asset is in use. Remove it from the linked content before deleting it.');
  }
}

export function createV2Router(db: Kysely<Database>): Router {
  const router = Router();
  router.use(requestContext);
  router.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  router.use(express.json({ limit: '1mb', strict: true }));

  router.get('/health', asyncHandler(async (_req, res) => {
    await sql`select 1`.execute(db);
    res.set('Cache-Control', 'no-store').json({ status: 'ok', database: 'mariadb', version: 'v2' });
  }));

  router.post('/auth/login', loginLimiter, asyncHandler(async (req, res) => {
    const input = validate(loginSchema, req.body);
    const user = await db.selectFrom('users').selectAll().where(sql`lower(username)`, '=', input.username).where('deleted_at', 'is', null).executeTakeFirst()
      || await db.selectFrom('users').selectAll().where(sql`lower(email)`, '=', input.username).where('deleted_at', 'is', null).executeTakeFirst();
    const valid = await verifyPassword(input.password, user?.password_hash || await dummyHash);
    if (!user || !valid || !user.is_active) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password.');
    await db.transaction().execute(async (trx) => {
      await trx.updateTable('sessions').set({ revoked_at: new Date() }).where('user_id', '=', user.id).where('revoked_at', 'is', null).execute();
      await trx.updateTable('users').set({ last_login_at: new Date() }).where('id', '=', user.id).execute();
    });
    const session = await createSession(db, user, req, res);
    await audit(db, req, 'auth.login', 'session', session.sessionId, { userId: user.id });
    res.set('Cache-Control', 'no-store').json({ user: { id: user.id, username: user.username, email: user.email, name: user.display_name, role: user.role, teamMemberId: user.team_member_id }, csrfToken: session.csrfToken, expiresAt: session.expiresAt.toISOString() });
  }));

  router.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/admin') && !req.path.startsWith('/auth') && req.path !== '/health') return publicReadLimiter(req, res, next);
    return next();
  });

  const secured = Router();
  secured.use(authenticate(db));
  secured.get('/auth/session', asyncHandler(async (req, res) => {
    const user = principal(req);
    const csrfToken = csrfTokenFromCookie(req);
    if (!csrfToken || sha256(csrfToken) !== user.csrfHash) throw new ApiError(401, 'SESSION_CSRF_MISSING', 'The browser session must be renewed.');
    res.set('Cache-Control', 'private, no-store').json({ authenticated: true, user: { id: user.id, username: user.username, email: user.email, name: user.displayName, role: user.role, teamMemberId: user.teamMemberId }, csrfToken });
  }));
  secured.use(requireCsrf);
  secured.post('/auth/logout', asyncHandler(async (req, res) => {
    const user = principal(req);
    await db.updateTable('sessions').set({ revoked_at: new Date() }).where('id', '=', user.sessionId).execute();
    clearSessionCookie(res);
    res.json({ ok: true });
  }));

  router.get('/projects', asyncHandler(async (req, res) => { const query = listQuery(req); const data = await listProjects(db, query, true); publicCache(res); res.json(paginated(data.items, data.total, query.page, query.limit)); }));
  router.get('/projects/:identifier', asyncHandler(async (req, res) => { const project = await getProject(db, req.params.identifier, true); void recordView(db, 'project', project.id, req).catch(() => undefined); publicCache(res); res.json(project); }));
  router.get('/team', asyncHandler(async (req, res) => { const query = listQuery(req); const data = await listTeam(db, query, true); publicCache(res); res.json(paginated(data.items, data.total, query.page, query.limit)); }));
  router.get('/team/:identifier/vcard', asyncHandler(async (req, res) => {
    const member = await getTeamMember(db, req.params.identifier, true);
    const clean = (value: string) => value.replace(/[\r\n,;]/g, ' ').trim();
    const origin = (process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const card = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${clean(member.name)}`, `TITLE:${clean(member.role)}`, member.email ? `EMAIL:${clean(member.email)}` : '', member.phone ? `TEL;TYPE=CELL:${clean(member.phone)}` : '', member.location ? `ADR:;;${clean(member.location)};;;;` : '', `URL:${origin}/team/${member.slug}`, 'END:VCARD'].filter(Boolean).join('\r\n');
    res.type('text/vcard').set('Content-Disposition', `attachment; filename="${member.slug}.vcf"`).send(card);
  }));
  router.get('/team/:memberIdentifier/projects/:projectIdentifier', asyncHandler(async (req, res) => {
    const member = await getTeamMember(db, req.params.memberIdentifier, true);
    const project = member.projects.find((item) => item.id === req.params.projectIdentifier || item.slug === req.params.projectIdentifier);
    if (!project) throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found for this team member.');
    publicCache(res);
    res.json({ project, member: { ...member, projects: undefined }, related: member.projects.filter((item) => item.id !== project.id).slice(0, 3) });
  }));
  router.get('/team/:identifier', asyncHandler(async (req, res) => { const member = await getTeamMember(db, req.params.identifier, true); void recordView(db, 'team_member', member.id, req).catch(() => undefined); publicCache(res); res.json(member); }));
  router.get(['/blog', '/blogs'], asyncHandler(async (req, res) => { const query = listQuery(req); const data = await listBlogs(db, query, true); publicCache(res); res.json(paginated(data.items, data.total, query.page, query.limit)); }));
  router.get('/blog/:identifier', asyncHandler(async (req, res) => { const post = await getBlog(db, req.params.identifier, true); void recordView(db, 'blog_post', post.id, req).catch(() => undefined); publicCache(res); res.json(post); }));
  router.get('/services', asyncHandler(async (_req, res) => { publicCache(res); res.json({ items: await listServices(db, true) }); }));
  router.get('/services/:identifier', asyncHandler(async (req, res) => { publicCache(res); res.json(await getService(db, req.params.identifier, true)); }));
  router.get('/testimonials', asyncHandler(async (_req, res) => { publicCache(res); res.json({ items: await listTestimonials(db, true) }); }));
  router.get('/technologies', asyncHandler(async (_req, res) => { const items = await db.selectFrom('technologies').select(['id', 'name', 'slug', 'category', 'icon_url', 'proficiency', 'description']).where('deleted_at', 'is', null).orderBy('category').orderBy('name').execute(); publicCache(res); res.json({ items: items.map((item) => ({ ...item, iconUrl: item.icon_url })) }); }));
  router.get('/skills', asyncHandler(async (_req, res) => { const items = await db.selectFrom('skills').select(['id', 'name', 'slug', 'category']).where('deleted_at', 'is', null).orderBy('category').orderBy('name').execute(); publicCache(res); res.json({ items }); }));
  router.get('/settings', asyncHandler(async (_req, res) => { const rows = await db.selectFrom('site_settings').select(['key', 'value']).where('is_public', '=', true).orderBy('key').execute(); publicCache(res); res.json(Object.fromEntries(rows.map((row) => [row.key, parseJson(row.value)]))); }));

  router.post('/messages', contactLimiter, asyncHandler(async (req, res) => {
    const input = validate(messageInput, req.body);
    const member = input.memberId ? await db.selectFrom('team_members').select('id').where('id', '=', input.memberId).where('active', '=', true).where('deleted_at', 'is', null).executeTakeFirst() : null;
    if (input.memberId && !member) throw new ApiError(422, 'TEAM_MEMBER_INVALID', 'The selected team member is unavailable.');
    const id = crypto.randomUUID();
    const ipSalt = process.env.IP_HASH_SALT || process.env.SESSION_SECRET || 'development-only-ip-salt';
    await db.insertInto('contact_messages').values({ id, name: input.name, email: input.email, subject: input.subject, message: input.message, team_member_id: member?.id || null, source_ip_hash: req.ip ? sha256(`${ipSalt}:${req.ip}`) : null, user_agent: (req.get('user-agent') || '').slice(0, 500) || null, deleted_at: null }).execute();
    res.status(201).json({ id, received: true });
  }));

  const contentWrite = authorize('content:write');
  secured.get('/admin/projects', authorize('content:read'), asyncHandler(async (req, res) => { const query = listQuery(req); const data = await listProjects(db, query); res.json(paginated(data.items, data.total, query.page, query.limit)); }));
  secured.post('/admin/projects', contentWrite, asyncHandler(async (req, res) => { const input = validate(projectInput, req.body); const item = await createProject(db, input, principal(req).id); await audit(db, req, 'project.create', 'project', item.id); res.status(201).json(item); }));
  secured.put('/admin/projects/:id', contentWrite, asyncHandler(async (req, res) => { const input = validate(projectInput, req.body); const item = await updateProject(db, req.params.id, input, principal(req).id); await audit(db, req, 'project.update', 'project', item.id); res.json(item); }));
  secured.delete('/admin/projects/:id', contentWrite, asyncHandler(async (req, res) => { await softDelete(db, 'projects', req.params.id); await audit(db, req, 'project.archive', 'project', req.params.id); res.status(204).end(); }));
  secured.patch('/admin/projects/:id/reorder', contentWrite, asyncHandler(async (req, res) => {
    const direction = Number(req.body?.direction);
    if (direction !== -1 && direction !== 1) throw new ApiError(422, 'VALIDATION_FAILED', 'Direction must be -1 or 1.');
    const item = await moveProject(db, req.params.id, direction);
    await audit(db, req, 'project.reorder', 'project', item.id, { direction });
    res.json(item);
  }));

  secured.get('/admin/team', authorize('content:read'), asyncHandler(async (req, res) => { const query = listQuery(req); const data = await listTeam(db, query); res.json(paginated(data.items, data.total, query.page, query.limit)); }));
  secured.get('/admin/team/:id', asyncHandler(async (req, res) => { const user = principal(req); if (user.role === 'team_member' ? user.teamMemberId !== req.params.id : !['super_admin', 'admin', 'editor'].includes(user.role)) throw new ApiError(403, 'FORBIDDEN', 'You may view only your own team profile.'); res.json(await getTeamMember(db, req.params.id)); }));
  secured.post('/admin/team', contentWrite, asyncHandler(async (req, res) => { const item = await createTeamMember(db, validate(teamInput, req.body)); await audit(db, req, 'team.create', 'team_member', item.id); res.status(201).json(item); }));
  secured.put('/admin/team/:id', asyncHandler(async (req, res) => { const user = principal(req); if (user.role === 'team_member' ? user.teamMemberId !== req.params.id : !['super_admin', 'admin', 'editor'].includes(user.role)) throw new ApiError(403, 'FORBIDDEN', 'You may update only your own team profile.'); let input = validate(teamInput, req.body); if (user.role === 'team_member') { const current = await getTeamMember(db, req.params.id); input = { ...input, active: current.active, displayOrder: current.displayOrder }; } const item = await updateTeamMember(db, req.params.id, input); await audit(db, req, 'team.update', 'team_member', item.id); res.json(item); }));
  secured.delete('/admin/team/:id', contentWrite, asyncHandler(async (req, res) => { await softDelete(db, 'team_members', req.params.id); await audit(db, req, 'team.archive', 'team_member', req.params.id); res.status(204).end(); }));
  secured.patch('/admin/team/:id/reorder', contentWrite, asyncHandler(async (req, res) => {
    const direction = Number(req.body?.direction);
    if (direction !== -1 && direction !== 1) throw new ApiError(422, 'VALIDATION_FAILED', 'Direction must be -1 or 1.');
    const item = await moveTeamMember(db, req.params.id, direction);
    await audit(db, req, 'team.reorder', 'team_member', item.id, { direction });
    res.json(item);
  }));

  secured.get('/admin/blog', authorize('content:read'), asyncHandler(async (req, res) => { const query = listQuery(req); const data = await listBlogs(db, query); res.json(paginated(data.items, data.total, query.page, query.limit)); }));
  secured.post('/admin/blog', contentWrite, asyncHandler(async (req, res) => { const item = await createBlog(db, validate(blogInput, req.body), principal(req).id); await audit(db, req, 'blog.create', 'blog_post', item.id); res.status(201).json(item); }));
  secured.put('/admin/blog/:id', contentWrite, asyncHandler(async (req, res) => { const item = await updateBlog(db, req.params.id, validate(blogInput, req.body), principal(req).id); await audit(db, req, 'blog.update', 'blog_post', item.id); res.json(item); }));
  secured.delete('/admin/blog/:id', contentWrite, asyncHandler(async (req, res) => { await softDelete(db, 'blog_posts', req.params.id); await audit(db, req, 'blog.archive', 'blog_post', req.params.id); res.status(204).end(); }));

  secured.get('/admin/services', authorize('content:read'), asyncHandler(async (_req, res) => res.json({ items: await listServices(db) })));
  secured.post('/admin/services', contentWrite, asyncHandler(async (req, res) => { const item = await createService(db, validate(serviceInput, req.body)); await audit(db, req, 'service.create', 'service', item.id); res.status(201).json(item); }));
  secured.put('/admin/services/:id', contentWrite, asyncHandler(async (req, res) => { const item = await updateService(db, req.params.id, validate(serviceInput, req.body)); await audit(db, req, 'service.update', 'service', item.id); res.json(item); }));
  secured.delete('/admin/services/:id', contentWrite, asyncHandler(async (req, res) => { await softDelete(db, 'services', req.params.id); await audit(db, req, 'service.archive', 'service', req.params.id); res.status(204).end(); }));

  secured.get('/admin/testimonials', authorize('content:read'), asyncHandler(async (_req, res) => res.json({ items: await listTestimonials(db) })));
  secured.post('/admin/testimonials', contentWrite, asyncHandler(async (req, res) => { const item = await createTestimonial(db, validate(testimonialInput, req.body)); await audit(db, req, 'testimonial.create', 'testimonial', item.id); res.status(201).json(item); }));
  secured.put('/admin/testimonials/:id', contentWrite, asyncHandler(async (req, res) => { const item = await updateTestimonial(db, req.params.id, validate(testimonialInput, req.body)); await audit(db, req, 'testimonial.update', 'testimonial', item.id); res.json(item); }));
  secured.delete('/admin/testimonials/:id', contentWrite, asyncHandler(async (req, res) => { await softDelete(db, 'testimonials', req.params.id); await audit(db, req, 'testimonial.archive', 'testimonial', req.params.id); res.status(204).end(); }));

  secured.get('/admin/technologies', authorize('content:read'), asyncHandler(async (_req, res) => res.json({ items: await db.selectFrom('technologies').selectAll().where('deleted_at', 'is', null).orderBy('category').orderBy('name').execute() })));
  secured.post('/admin/technologies', contentWrite, asyncHandler(async (req, res) => { const input = validate(technologyInput, req.body); const id = crypto.randomUUID(); await db.insertInto('technologies').values({ id, name: input.name, slug: input.slug || slugify(input.name), category: input.category, icon_url: input.iconUrl, proficiency: input.proficiency, description: input.description, deleted_at: null }).execute(); const item = await db.selectFrom('technologies').selectAll().where('id', '=', id).executeTakeFirstOrThrow(); await audit(db, req, 'technology.create', 'technology', id); res.status(201).json(item); }));
  secured.put('/admin/technologies/:id', contentWrite, asyncHandler(async (req, res) => { const input = validate(technologyInput, req.body); const result = await db.updateTable('technologies').set({ name: input.name, slug: input.slug || slugify(input.name), category: input.category, icon_url: input.iconUrl, proficiency: input.proficiency, description: input.description }).where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst(); if (Number(result.numUpdatedRows) === 0) throw new ApiError(404, 'TECHNOLOGY_NOT_FOUND', 'Technology not found.'); const item = await db.selectFrom('technologies').selectAll().where('id', '=', req.params.id).executeTakeFirstOrThrow(); await audit(db, req, 'technology.update', 'technology', item.id); res.json(item); }));
  secured.delete('/admin/technologies/:id', contentWrite, asyncHandler(async (req, res) => { const result = await db.updateTable('technologies').set({ deleted_at: new Date() }).where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst(); if (Number(result.numUpdatedRows) === 0) throw new ApiError(404, 'TECHNOLOGY_NOT_FOUND', 'Technology not found.'); await audit(db, req, 'technology.archive', 'technology', req.params.id); res.status(204).end(); }));

  secured.get('/admin/skills', authorize('content:read'), asyncHandler(async (_req, res) => res.json({ items: await db.selectFrom('skills').selectAll().where('deleted_at', 'is', null).orderBy('category').orderBy('name').execute() })));
  secured.post('/admin/skills', contentWrite, asyncHandler(async (req, res) => { const input = validate(skillInput, req.body); const id = crypto.randomUUID(); await db.insertInto('skills').values({ id, name: input.name, slug: input.slug || slugify(`${input.category}-${input.name}`), category: input.category, deleted_at: null }).execute(); const item = await db.selectFrom('skills').selectAll().where('id', '=', id).executeTakeFirstOrThrow(); await audit(db, req, 'skill.create', 'skill', id); res.status(201).json(item); }));
  secured.put('/admin/skills/:id', contentWrite, asyncHandler(async (req, res) => { const input = validate(skillInput, req.body); const result = await db.updateTable('skills').set({ name: input.name, slug: input.slug || slugify(`${input.category}-${input.name}`), category: input.category }).where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst(); if (Number(result.numUpdatedRows) === 0) throw new ApiError(404, 'SKILL_NOT_FOUND', 'Skill not found.'); const item = await db.selectFrom('skills').selectAll().where('id', '=', req.params.id).executeTakeFirstOrThrow(); await audit(db, req, 'skill.update', 'skill', item.id); res.json(item); }));
  secured.delete('/admin/skills/:id', contentWrite, asyncHandler(async (req, res) => { const result = await db.updateTable('skills').set({ deleted_at: new Date() }).where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst(); if (Number(result.numUpdatedRows) === 0) throw new ApiError(404, 'SKILL_NOT_FOUND', 'Skill not found.'); await audit(db, req, 'skill.archive', 'skill', req.params.id); res.status(204).end(); }));

  secured.get('/admin/messages', authorize('messages:read'), asyncHandler(async (req, res) => { const query = listQuery(req); let base = db.selectFrom('contact_messages').leftJoin('team_members', 'team_members.id', 'contact_messages.team_member_id').select(['contact_messages.id', 'contact_messages.name', 'contact_messages.email', 'contact_messages.subject', 'contact_messages.message', 'contact_messages.status', 'contact_messages.created_at', 'team_members.name as member_name', 'team_members.slug as member_slug']).where('contact_messages.deleted_at', 'is', null); if (query.status) base = base.where('contact_messages.status', '=', query.status as 'new' | 'read' | 'replied' | 'archived' | 'spam'); if (query.search) base = base.where((eb) => eb.or([eb('contact_messages.name', 'like', `%${query.search}%`), eb('contact_messages.email', 'like', `%${query.search}%`), eb('contact_messages.subject', 'like', `%${query.search}%`)])); const rows = await base.orderBy('contact_messages.created_at', 'desc').limit(query.limit).offset(query.offset).execute(); const total = await db.selectFrom('contact_messages').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(); res.json(paginated(rows.map((row) => ({ id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, status: row.status, memberName: row.member_name || undefined, memberSlug: row.member_slug || undefined, createdAt: row.created_at.toISOString() })), Number(total.count), query.page, query.limit)); }));
  secured.patch('/admin/messages/:id', authorize('messages:write'), asyncHandler(async (req, res) => { const status = String(req.body?.status); if (!['new', 'read', 'replied', 'archived', 'spam'].includes(status)) throw new ApiError(422, 'VALIDATION_FAILED', 'Invalid message status.'); const existing = await db.selectFrom('contact_messages').select('id').where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst(); if (!existing) throw new ApiError(404, 'MESSAGE_NOT_FOUND', 'Message not found.'); await db.updateTable('contact_messages').set({ status: status as 'new' | 'read' | 'replied' | 'archived' | 'spam' }).where('id', '=', existing.id).execute(); const row = await db.selectFrom('contact_messages').selectAll().where('id', '=', existing.id).executeTakeFirstOrThrow(); await audit(db, req, 'message.status', 'contact_message', row.id, { status }); res.json(row); }));

  secured.get('/admin/settings', authorize('content:read'), asyncHandler(async (_req, res) => res.json({ items: await db.selectFrom('site_settings').selectAll().orderBy('key').execute() })));
  secured.put('/admin/settings/:key', authorize('settings:write'), asyncHandler(async (req, res) => { const key = req.params.key; if (!/^[a-z0-9_.-]{1,160}$/.test(key)) throw new ApiError(422, 'VALIDATION_FAILED', 'Invalid setting key.'); const input = validate(settingInput, req.body); const user = principal(req); await db.insertInto('site_settings').values({ key, value: json(input.value), is_public: input.isPublic, description: input.description, updated_by: user.id }).onDuplicateKeyUpdate({ value: json(input.value), is_public: input.isPublic, description: input.description, updated_by: user.id }).execute(); const item = await db.selectFrom('site_settings').selectAll().where('key', '=', key).executeTakeFirstOrThrow(); await audit(db, req, 'setting.upsert', 'site_setting', key); res.json(item); }));

  secured.get('/admin/users', authorize('users:manage'), asyncHandler(async (_req, res) => { const rows = await db.selectFrom('users').select(['id', 'username', 'email', 'display_name', 'role', 'is_active', 'team_member_id', 'last_login_at', 'created_at']).where('deleted_at', 'is', null).orderBy('created_at', 'desc').execute(); res.json({ items: rows }); }));
  secured.post('/admin/users', authorize('users:manage'), asyncHandler(async (req, res) => { const input = validate(userInput, req.body); const actor = principal(req); if (input.role === 'super_admin' && actor.role !== 'super_admin') throw new ApiError(403, 'FORBIDDEN', 'Only a super administrator can create another super administrator.'); const id = crypto.randomUUID(); await db.insertInto('users').values({ id, username: input.username, email: input.email, display_name: input.displayName, password_hash: await hashPassword(input.password), role: input.role as Role, is_active: input.isActive, team_member_id: input.teamMemberId || null, last_login_at: null, deleted_at: null }).execute(); await audit(db, req, 'user.create', 'user', id, { role: input.role }); res.status(201).json({ id, username: input.username, email: input.email, displayName: input.displayName, role: input.role, isActive: input.isActive, teamMemberId: input.teamMemberId || null }); }));
  secured.patch('/admin/users/:id', authorize('users:manage'), asyncHandler(async (req, res) => {
    const input = validate(userUpdateInput, req.body);
    const current = await db.selectFrom('users').selectAll().where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst();
    if (!current) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
    if ((input.role || current.role) === 'team_member' && !(input.teamMemberId !== undefined ? input.teamMemberId : current.team_member_id)) throw new ApiError(422, 'TEAM_MEMBER_LINK_REQUIRED', 'A team-member account must be linked to a team profile.');
    const removesSuperAdmin = current.role === 'super_admin' && (input.role && input.role !== 'super_admin' || input.isActive === false);
    if (removesSuperAdmin) {
      const count = await db.selectFrom('users').select(sql<number>`count(*)`.as('count')).where('role', '=', 'super_admin').where('is_active', '=', true).where('deleted_at', 'is', null).executeTakeFirstOrThrow();
      if (Number(count.count) <= 1) throw new ApiError(409, 'LAST_SUPER_ADMIN', 'The final active super administrator cannot be disabled or demoted.');
    }
    await db.updateTable('users').set({
      ...(input.username ? { username: input.username } : {}), ...(input.email ? { email: input.email } : {}), ...(input.displayName ? { display_name: input.displayName } : {}),
      ...(input.password ? { password_hash: await hashPassword(input.password) } : {}), ...(input.role ? { role: input.role as Role } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}), ...(input.teamMemberId !== undefined ? { team_member_id: input.teamMemberId } : {}),
    }).where('id', '=', current.id).execute();
    const updated = await db.selectFrom('users').select(['id', 'username', 'email', 'display_name', 'role', 'is_active', 'team_member_id']).where('id', '=', current.id).executeTakeFirstOrThrow();
    if (input.username || input.password || input.isActive === false || input.role) await db.updateTable('sessions').set({ revoked_at: new Date() }).where('user_id', '=', current.id).where('revoked_at', 'is', null).execute();
    await audit(db, req, 'user.update', 'user', current.id, { role: updated.role, isActive: updated.is_active });
    res.json(updated);
  }));
  secured.delete('/admin/users/:id', authorize('users:manage'), asyncHandler(async (req, res) => {
    const current = await db.selectFrom('users').select(['id', 'role', 'is_active']).where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst();
    if (!current) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found.');
    if (current.id === principal(req).id) throw new ApiError(409, 'SELF_DELETE_DENIED', 'You cannot delete your current account.');
    if (current.role === 'super_admin' && current.is_active) {
      const count = await db.selectFrom('users').select(sql<number>`count(*)`.as('count')).where('role', '=', 'super_admin').where('is_active', '=', true).where('deleted_at', 'is', null).executeTakeFirstOrThrow();
      if (Number(count.count) <= 1) throw new ApiError(409, 'LAST_SUPER_ADMIN', 'The final active super administrator cannot be deleted.');
    }
    await db.transaction().execute(async (trx) => { await trx.updateTable('sessions').set({ revoked_at: new Date() }).where('user_id', '=', current.id).where('revoked_at', 'is', null).execute(); await trx.updateTable('users').set({ is_active: false, deleted_at: new Date() }).where('id', '=', current.id).execute(); });
    await audit(db, req, 'user.delete', 'user', current.id);
    res.status(204).end();
  }));

  secured.get('/admin/media', authorize('content:read'), asyncHandler(async (req, res) => { const query = listQuery(req); const rows = await db.selectFrom('media_assets').selectAll().where('deleted_at', 'is', null).orderBy('created_at', 'desc').limit(query.limit).offset(query.offset).execute(); const total = await db.selectFrom('media_assets').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(); res.json(paginated(rows, Number(total.count), query.page, query.limit)); }));
  secured.post('/admin/media', authorize('media:upload'), uploadLimiter, upload.single('file'), asyncHandler(async (req, res) => { if (!req.file) throw new ApiError(422, 'FILE_REQUIRED', 'A file is required.'); const { item, reused } = await storeUpload(db, req.file, principal(req).id, String(req.body.altText || '')); await audit(db, req, reused ? 'media.reuse' : 'media.upload', 'media_asset', item.id, { mimeType: item.mime_type, byteSize: item.byte_size }); res.status(reused ? 200 : 201).json({ success: true, file: { id: item.id, url: item.public_url, path: item.object_key, name: item.original_name, type: item.mime_type, size: Number(item.byte_size), mimeType: item.mime_type, byteSize: Number(item.byte_size), altText: item.alt_text, reused } }); }));
  secured.delete('/admin/media/:id', authorize('media:write'), asyncHandler(async (req, res) => { await assertMediaIsUnused(db, req.params.id); const item = await db.selectFrom('media_assets').select('id').where('id', '=', req.params.id).where('deleted_at', 'is', null).executeTakeFirst(); if (!item) throw new ApiError(404, 'MEDIA_NOT_FOUND', 'Media asset not found.'); await db.updateTable('media_assets').set({ status: 'deleted', deleted_at: new Date() }).where('id', '=', item.id).execute(); await audit(db, req, 'media.delete', 'media_asset', item.id); res.status(204).end(); }));

  secured.get('/admin/stats', authorize('content:read'), asyncHandler(async (_req, res) => { const [projects, blogs, team, views, activity] = await Promise.all([db.selectFrom('projects').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(), db.selectFrom('blog_posts').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).where('status', '=', 'published').executeTakeFirstOrThrow(), db.selectFrom('team_members').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).where('active', '=', true).executeTakeFirstOrThrow(), db.selectFrom('page_views').select(sql<number>`coalesce(sum(view_count),0)`.as('count')).executeTakeFirstOrThrow(), db.selectFrom('audit_logs').select(['id', 'action', 'resource_type', 'created_at']).orderBy('created_at', 'desc').limit(10).execute()]); res.json({ totalProjects: Number(projects.count), publishedBlogs: Number(blogs.count), teamMembers: Number(team.count), totalViews: Number(views.count), activity: activity.map((item) => ({ id: String(item.id), label: `${item.resource_type} ${item.action}`, createdAt: item.created_at.toISOString() })) }); }));
  secured.get('/admin/audit', authorize('audit:read'), asyncHandler(async (req, res) => { const query = listQuery(req); const rows = await db.selectFrom('audit_logs').selectAll().orderBy('created_at', 'desc').limit(query.limit).offset(query.offset).execute(); res.json({ items: rows, page: query.page, limit: query.limit }); }));

  router.use(secured);
  router.use((_req, _res, next) => next(new ApiError(404, 'ROUTE_NOT_FOUND', 'API route not found.')));
  router.use(errorHandler);
  return router;
}

export function createUnavailableV2Router(): Router {
  const router = Router();
  router.use(requestContext);
  router.get('/health', (_req, res) => res.status(503).set('Cache-Control', 'no-store').json({ status: 'unavailable', database: 'unavailable', version: 'v2' }));
  router.use((_req, _res, next) => next(new ApiError(503, 'SERVICE_UNAVAILABLE', 'The admin service is temporarily unavailable. Please try again later.')));
  router.use(errorHandler);
  return router;
}
