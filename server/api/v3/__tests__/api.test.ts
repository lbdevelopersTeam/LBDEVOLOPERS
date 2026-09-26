import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import YAML from 'yaml';
import type { V3Contact, V3ProjectCreate, V3ProjectPatch } from '../contracts';
import { createUnavailableV3Router, createV3Router } from '../router';
import { IdempotencyMismatchError, type ContactReceipt, type IdempotentResult, type MutationContext, type ProjectListOptions, type SessionCreate, type V3Principal, type V3Project, type V3Store, type V3UserAuth, type VersionedDeleteResult, type VersionedMutationResult } from '../store';

const timestamp = '2026-08-24T12:00:00.000Z';

class MemoryV3Store implements V3Store {
  ready = true;
  user!: V3UserAuth;
  sessions = new Map<string, V3Principal>();
  projects: V3Project[] = [{
    id: 'project-one', slug: 'project-one', title: 'Project One', summary: 'One', descriptionHtml: '<p>One</p>',
    category: 'Web', thumbnailUrl: null, liveUrl: null, repositoryUrl: null, featured: true,
    status: 'published', sortOrder: 1, version: 1, technologies: ['React'], publishedAt: timestamp,
    createdAt: timestamp, updatedAt: timestamp,
  }, {
    id: 'project-two', slug: 'project-two', title: 'Project Two', summary: 'Two', descriptionHtml: '<p>Two</p>',
    category: 'Commerce', thumbnailUrl: null, liveUrl: null, repositoryUrl: null, featured: false,
    status: 'published', sortOrder: 2, version: 2, technologies: ['MySQL'], publishedAt: timestamp,
    createdAt: timestamp, updatedAt: timestamp,
  }];
  idempotency = new Map<string, { requestHash: Buffer; result: IdempotentResult<unknown> }>();

  async ping() { if (!this.ready) throw new Error('unavailable'); }
  async findUserByUsername(username: string) { return username.toLowerCase() === this.user.username ? this.user : null; }
  async createSession(input: SessionCreate) {
    this.sessions.set(input.tokenHash.toString('hex'), {
      id: this.user.id, username: this.user.username, email: this.user.email, displayName: this.user.displayName,
      role: this.user.role, sessionId: input.id, csrfHash: input.csrfHash,
    });
  }
  async findPrincipalByTokenHash(hash: Buffer) { return this.sessions.get(hash.toString('hex')) || null; }
  async touchSession() {}
  async revokeSession(sessionId: string) {
    for (const [key, session] of this.sessions) if (session.sessionId === sessionId) this.sessions.delete(key);
  }
  async recordLogin() {}
  async listPublishedProjects(options: ProjectListOptions) {
    let projects = this.projects.filter((project) => project.status === 'published');
    if (options.category) projects = projects.filter((project) => project.category === options.category);
    if (options.featured !== undefined) projects = projects.filter((project) => project.featured === options.featured);
    if (options.cursor) projects = projects.filter((project) => project.sortOrder > options.cursor!.sortOrder || (project.sortOrder === options.cursor!.sortOrder && project.id > options.cursor!.id));
    const items = projects.slice(0, options.limit);
    const last = items.at(-1);
    return { items, nextCursor: projects.length > options.limit && last ? { sortOrder: last.sortOrder, id: last.id } : null };
  }
  async getPublishedProjectBySlug(slug: string) { return this.projects.find((project) => project.slug === slug && project.status === 'published') || null; }
  async createProject(input: V3ProjectCreate, context: MutationContext): Promise<IdempotentResult<V3Project>> {
    const existing = this.replay<V3Project>(context);
    if (existing) return existing;
    const project: V3Project = {
      id: 'project-created', slug: input.slug || 'created-project', title: input.title, summary: input.summary,
      descriptionHtml: input.descriptionHtml, category: input.category, thumbnailUrl: input.thumbnailUrl,
      liveUrl: input.liveUrl, repositoryUrl: input.repositoryUrl, featured: input.featured, status: input.status,
      sortOrder: input.sortOrder, version: 1, technologies: input.technologies,
      publishedAt: input.status === 'published' ? timestamp : null, createdAt: timestamp, updatedAt: timestamp,
    };
    this.projects.push(project);
    return this.remember(context, { value: project, status: 201, replayed: false });
  }
  async updateProject(id: string, expectedVersion: number, input: V3ProjectPatch): Promise<VersionedMutationResult> {
    const index = this.projects.findIndex((project) => project.id === id);
    if (index < 0) return { outcome: 'not_found' };
    if (this.projects[index].version !== expectedVersion) return { outcome: 'version_conflict', currentVersion: this.projects[index].version };
    const existing = this.projects[index];
    const updated: V3Project = {
      ...existing, ...input,
      thumbnailUrl: input.thumbnailUrl === undefined ? existing.thumbnailUrl : input.thumbnailUrl,
      liveUrl: input.liveUrl === undefined ? existing.liveUrl : input.liveUrl,
      repositoryUrl: input.repositoryUrl === undefined ? existing.repositoryUrl : input.repositoryUrl,
      technologies: input.technologies || existing.technologies,
      version: existing.version + 1, updatedAt: timestamp,
    };
    this.projects[index] = updated;
    return { outcome: 'updated', project: updated };
  }
  async deleteProject(id: string, expectedVersion: number): Promise<VersionedDeleteResult> {
    const index = this.projects.findIndex((project) => project.id === id);
    if (index < 0) return { outcome: 'not_found' };
    if (this.projects[index].version !== expectedVersion) return { outcome: 'version_conflict', currentVersion: this.projects[index].version };
    this.projects.splice(index, 1);
    return { outcome: 'deleted', version: expectedVersion + 1 };
  }
  async createContactMessage(_input: V3Contact, _sourceIpHash: Buffer | null, _userAgent: string | null, context: MutationContext): Promise<IdempotentResult<ContactReceipt>> {
    const existing = this.replay<ContactReceipt>(context);
    if (existing) return existing;
    return this.remember(context, { value: { id: crypto.randomUUID(), status: 'received', createdAt: timestamp }, status: 201, replayed: false });
  }
  private replay<T>(context: MutationContext): IdempotentResult<T> | null {
    const key = `${context.idempotencyScope}:${context.idempotencyKeyHash.toString('hex')}`;
    const previous = this.idempotency.get(key);
    if (!previous) return null;
    if (!previous.requestHash.equals(context.requestHash)) throw new IdempotencyMismatchError();
    return { ...(previous.result as IdempotentResult<T>), replayed: true };
  }
  private remember<T>(context: MutationContext, result: IdempotentResult<T>) {
    const key = `${context.idempotencyScope}:${context.idempotencyKeyHash.toString('hex')}`;
    this.idempotency.set(key, { requestHash: context.requestHash, result });
    return result;
  }
}

let store: MemoryV3Store;
let app: express.Express;

beforeEach(async () => {
  store = new MemoryV3Store();
  store.user = {
    id: 'admin-user', username: 'test-admin', email: 'admin@example.com', displayName: 'Test Admin',
    passwordHash: await bcrypt.hash('Correct-Horse-42!', 12), role: 'super_admin', active: true,
  };
  app = express();
  app.set('trust proxy', 1);
  app.use('/api/v3', createV3Router(store));
});

describe('API v3 contract, security, and reliability', () => {
  it('separates liveness from MySQL readiness and serves its OpenAPI contract', async () => {
    expect((await request(app).get('/api/v3/live')).body).toEqual({ status: 'alive', api: 'v3' });
    expect((await request(app).get('/api/v3/ready')).body).toEqual({ status: 'ready', api: 'v3', database: 'mysql' });
    store.ready = false;
    const unavailable = await request(app).get('/api/v3/ready');
    expect(unavailable.status).toBe(503);
    expect(unavailable.body.error.code).toBe('DEPENDENCY_UNAVAILABLE');
    expect((await request(app).get('/api/v3/openapi.yaml')).status).toBe(200);
  });

  it('uses signed keyset cursors and rejects tampering', async () => {
    const first = await request(app).get('/api/v3/projects?limit=1');
    expect(first.status).toBe(200);
    expect(first.body.data[0].id).toBe('project-one');
    expect(first.body.page.nextCursor).toBeTypeOf('string');
    const second = await request(app).get(`/api/v3/projects?limit=1&cursor=${encodeURIComponent(first.body.page.nextCursor)}`);
    expect(second.body.data[0].id).toBe('project-two');
    const tampered = await request(app).get(`/api/v3/projects?cursor=${encodeURIComponent(`${first.body.page.nextCursor}x`)}`);
    expect(tampered.status).toBe(400);
    expect(tampered.body.error.code).toBe('CURSOR_INVALID');
  });

  it('uses generic login failures, database sessions, CSRF, idempotency, and ETags', async () => {
    const invalid = await request(app).post('/api/v3/auth/sessions').send({ username: 'missing', password: 'Wrong-password-42!' });
    expect(invalid.status).toBe(401);
    expect(invalid.body.error.code).toBe('INVALID_CREDENTIALS');

    const agent = request.agent(app);
    const login = await agent.post('/api/v3/auth/sessions').send({ username: 'TEST-ADMIN', password: 'Correct-Horse-42!' });
    expect(login.status).toBe(201);
    expect(String(login.headers['set-cookie'])).toContain('HttpOnly');
    expect((await agent.get('/api/v3/auth/session')).status).toBe(200);

    const missingCsrf = await agent.post('/api/v3/admin/projects').set('Idempotency-Key', 'project-create-001').send({ title: 'Reliable Platform' });
    expect(missingCsrf.status).toBe(403);

    const headers = { 'X-CSRF-Token': login.body.data.csrfToken, 'Idempotency-Key': 'project-create-001' };
    const created = await agent.post('/api/v3/admin/projects').set(headers).send({ title: 'Reliable Platform', status: 'published', technologies: ['MySQL'] });
    expect(created.status).toBe(201);
    expect(created.headers.etag).toBe('"project-1"');
    expect(created.headers['idempotency-replayed']).toBe('false');
    const replayed = await agent.post('/api/v3/admin/projects').set(headers).send({ title: 'Reliable Platform', status: 'published', technologies: ['MySQL'] });
    expect(replayed.status).toBe(201);
    expect(replayed.headers['idempotency-replayed']).toBe('true');
    const conflictingKey = await agent.post('/api/v3/admin/projects').set(headers).send({ title: 'Different Request' });
    expect(conflictingKey.status).toBe(409);
    expect(conflictingKey.body.error.code).toBe('IDEMPOTENCY_CONFLICT');

    const missingVersion = await agent.patch('/api/v3/admin/projects/project-created').set('X-CSRF-Token', login.body.data.csrfToken).send({ title: 'Updated' });
    expect(missingVersion.status).toBe(428);
    const stale = await agent.patch('/api/v3/admin/projects/project-created').set('X-CSRF-Token', login.body.data.csrfToken).set('If-Match', '"project-8"').send({ title: 'Updated' });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('VERSION_CONFLICT');
    const updated = await agent.patch('/api/v3/admin/projects/project-created').set('X-CSRF-Token', login.body.data.csrfToken).set('If-Match', '"project-1"').send({ title: 'Updated' });
    expect(updated.status).toBe(200);
    expect(updated.headers.etag).toBe('"project-2"');
  });

  it('validates and deduplicates contact submissions', async () => {
    const invalid = await request(app).post('/api/v3/contact-messages').set('Idempotency-Key', 'contact-key-001').send({ name: 'A', email: 'invalid', subject: '', message: 'short' });
    expect(invalid.status).toBe(422);
    const payload = { name: 'Example Client', email: 'CLIENT@example.com', subject: 'New platform', message: 'Please contact me about a reliable platform.' };
    const first = await request(app).post('/api/v3/contact-messages').set('Idempotency-Key', 'contact-key-001').send(payload);
    const replay = await request(app).post('/api/v3/contact-messages').set('Idempotency-Key', 'contact-key-001').send(payload);
    expect(first.status).toBe(201);
    expect(replay.body.data.id).toBe(first.body.data.id);
    expect(replay.headers['idempotency-replayed']).toBe('true');
  });

  it('keeps the OpenAPI operation IDs unique and contract paths present', async () => {
    const document = YAML.parse(await fs.readFile(path.resolve(process.cwd(), 'server/api/v3/openapi.yaml'), 'utf8')) as { paths: Record<string, Record<string, { operationId?: string }>> };
    const operationIds = Object.values(document.paths).flatMap((item) => Object.values(item).map((operation) => operation.operationId).filter(Boolean));
    expect(new Set(operationIds).size).toBe(operationIds.length);
    expect(Object.keys(document.paths)).toEqual(expect.arrayContaining(['/ready', '/projects', '/contact-messages', '/admin/projects/{id}']));
  });

  it('fails closed when MySQL is not configured while keeping liveness available', async () => {
    const unavailableApp = express();
    unavailableApp.use('/api/v3', createUnavailableV3Router());
    expect((await request(unavailableApp).get('/api/v3/live')).status).toBe(200);
    const ready = await request(unavailableApp).get('/api/v3/ready');
    expect(ready.status).toBe(503);
    expect(ready.body.error.code).toBe('MYSQL_UNAVAILABLE');
  });
});
