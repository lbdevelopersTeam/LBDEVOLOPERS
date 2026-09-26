import crypto from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sql, type Kysely } from 'kysely';
import type { Database } from '../../../db/types';
import { createV2Router } from '../router';
import { hashPassword } from '../security';
import { createTestDatabase } from './test-database';

let db: Kysely<Database>;
let close: () => Promise<void>;
let app: express.Express;
let uploadRoot: string;
const previousUploadDirectory = process.env.LOCAL_UPLOAD_DIRECTORY;

beforeEach(async () => {
  uploadRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lb-media-test-'));
  process.env.LOCAL_UPLOAD_DIRECTORY = uploadRoot;
  ({ db, close } = await createTestDatabase());
    await db.insertInto('users').values({ id: 'admin-user', username: 'test-admin', email: 'admin@example.com', password_hash: await hashPassword('Correct-Horse-42!'), display_name: 'Test Admin', role: 'super_admin', is_active: true, last_login_at: null, team_member_id: null, deleted_at: null }).execute();
  app = express();
  app.set('trust proxy', 1);
  app.use('/api/v2', createV2Router(db));
});
afterEach(async () => {
  await close();
  await fs.rm(uploadRoot, { recursive: true, force: true });
  if (previousUploadDirectory === undefined) delete process.env.LOCAL_UPLOAD_DIRECTORY;
  else process.env.LOCAL_UPLOAD_DIRECTORY = previousUploadDirectory;
});

describe('API v2 authentication, RBAC, validation, and public content', () => {
  it('uses generic login failures and database-backed cookie sessions', async () => {
    const invalid = await request(app).post('/api/v2/auth/login').send({ username: 'missing-admin', password: 'Wrong-password-42!' });
    expect(invalid.status).toBe(401);
    expect(invalid.body.error.code).toBe('INVALID_CREDENTIALS');

    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').send({ username: 'TEST-ADMIN', password: 'Correct-Horse-42!' });
    expect(login.status).toBe(200);
    expect(String(login.headers['set-cookie'])).toContain('HttpOnly');
    const session = await agent.get('/api/v2/auth/session');
    expect(session.body.user).toMatchObject({ username: 'test-admin', email: 'admin@example.com', role: 'super_admin' });
    expect(session.body.csrfToken).toBeTypeOf('string');
  });

  it('requires both authentication and CSRF for privileged writes', async () => {
    const anonymous = await request(app).post('/api/v2/admin/services').send({ title: 'Blocked' });
    expect(anonymous.status).toBe(401);
    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').send({ username: 'test-admin', password: 'Correct-Horse-42!' });
    const missingCsrf = await agent.post('/api/v2/admin/services').send({ title: 'Blocked' });
    expect(missingCsrf.status).toBe(403);
    const created = await agent.post('/api/v2/admin/services').set('X-CSRF-Token', login.body.csrfToken).send({ title: 'Database Architecture', features: ['PostgreSQL'] });
    expect(created.status).toBe(201);
    expect(created.body.slug).toBe('database-architecture');
  });

  it('reorders projects atomically and normalizes their display positions', async () => {
    await db.insertInto('projects').values([
      { id: 'project-one', slug: 'project-one', title: 'Project One', thumbnail_media_id: null, completion_date: null, sort_order: 4, created_by: 'admin-user', updated_by: 'admin-user', deleted_at: null },
      { id: 'project-two', slug: 'project-two', title: 'Project Two', thumbnail_media_id: null, completion_date: null, sort_order: 9, created_by: 'admin-user', updated_by: 'admin-user', deleted_at: null },
    ]).execute();
    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').send({ username: 'test-admin', password: 'Correct-Horse-42!' });

    const moved = await agent.patch('/api/v2/admin/projects/project-two/reorder').set('X-CSRF-Token', login.body.csrfToken).send({ direction: -1 });
    expect(moved.status).toBe(200);
    const rows = await db.selectFrom('projects').select(['id', 'sort_order']).orderBy('sort_order').execute();
    expect(rows).toEqual([
      { id: 'project-two', sort_order: 1 },
      { id: 'project-one', sort_order: 2 },
    ]);

    const invalid = await agent.patch('/api/v2/admin/projects/project-two/reorder').set('X-CSRF-Token', login.body.csrfToken).send({ direction: 0 });
    expect(invalid.status).toBe(422);
  });

  it('validates contact messages and never accepts client-supplied IDs', async () => {
    const invalid = await request(app).post('/api/v2/messages').send({ id: crypto.randomUUID(), name: 'A', email: 'not-an-email', subject: '', message: 'short' });
    expect(invalid.status).toBe(422);
    expect(invalid.body.error.code).toBe('VALIDATION_FAILED');
    const accepted = await request(app).post('/api/v2/messages').send({ name: 'Example Client', email: 'client@example.com', subject: 'Project inquiry', message: 'Please contact me about a new product build.', website: '' });
    expect(accepted.status).toBe(201);
    expect(accepted.body.id).toBeTypeOf('string');
  });

  it('limits team-member accounts to their own profile and preserves administrative fields', async () => {
    await db.insertInto('team_members').values({ id: 'member-one', slug: 'member-one', name: 'Member One', role: 'Engineer', avatar_url: '/images/member.png', active: true, display_order: 7, avatar_media_id: null, cover_media_id: null, cv_media_id: null, deleted_at: null }).execute();
    await db.insertInto('users').values({ id: 'team-user', username: 'member-one', email: 'member@example.com', password_hash: await hashPassword('Member-Password-42!'), display_name: 'Member One', role: 'team_member', is_active: true, last_login_at: null, team_member_id: 'member-one', deleted_at: null }).execute();
    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').send({ username: 'member-one', password: 'Member-Password-42!' });
    expect(login.status).toBe(200);
    expect((await agent.get('/api/v2/admin/projects')).status).toBe(403);
    expect((await agent.get('/api/v2/admin/team/member-one')).status).toBe(200);
    expect((await agent.get('/api/v2/admin/team/someone-else')).status).toBe(403);

    const updated = await agent.put('/api/v2/admin/team/member-one').set('X-CSRF-Token', login.body.csrfToken).send({
      name: 'Updated Member', role: 'Engineer', avatar: '/images/member.png', active: false, displayOrder: 999,
    });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ name: 'Updated Member', active: true, displayOrder: 7 });
  });

  it('rejects unsupported media uploads before storage', async () => {
    const agent = request.agent(app);
    const anonymous = await agent.post('/api/v2/admin/media').attach('file', Buffer.from('89504e470d0a1a0a', 'hex'), { filename: 'private.png', contentType: 'image/png' });
    expect(anonymous.status).toBe(401);
    expect(anonymous.body).toMatchObject({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } });
    const login = await agent.post('/api/v2/auth/login').send({ username: 'test-admin', password: 'Correct-Horse-42!' });
    const upload = await agent.post('/api/v2/admin/media').set('X-CSRF-Token', login.body.csrfToken).attach('file', Buffer.from('not an image'), { filename: 'payload.txt', contentType: 'text/plain' });
    expect(upload.status).toBe(415);
    expect(upload.body.success).toBe(false);
    expect(upload.body.error.code).toBe('UPLOAD_TYPE_INVALID');
    const wrongField = await agent.post('/api/v2/admin/media').set('X-CSRF-Token', login.body.csrfToken).attach('image', Buffer.from('89504e470d0a1a0a', 'hex'), { filename: 'wrong-field.png', contentType: 'image/png' });
    expect(wrongField.status).toBe(422);
    expect(wrongField.body).toMatchObject({ success: false, error: { code: 'UPLOAD_FIELD_INVALID' } });
    const oversized = await agent.post('/api/v2/admin/media').set('X-CSRF-Token', login.body.csrfToken).attach('file', Buffer.alloc(10 * 1024 * 1024 + 1), { filename: 'too-large.png', contentType: 'image/png' });
    expect(oversized.status).toBe(413);
    expect(oversized.body).toMatchObject({ success: false, error: { code: 'UPLOAD_SIZE_INVALID' } });
  });

  it('uploads verified images and keeps project thumbnail and gallery media linked', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').send({ username: 'test-admin', password: 'Correct-Horse-42!' });
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zc6AAAAAASUVORK5CYII=', 'base64');
    const upload = await agent
      .post('/api/v2/admin/media')
      .set('X-CSRF-Token', login.body.csrfToken)
      .attach('file', png, { filename: 'project-thumbnail.png', contentType: 'image/png' });

    expect(upload.status).toBe(201);
    expect(upload.body).toMatchObject({ success: true, file: { type: 'image/png', mimeType: 'image/png', size: png.length, byteSize: png.length, reused: false } });
    expect(upload.body.file.url).toMatch(/^\/uploads\//);
    await expect(fs.stat(path.join(uploadRoot, upload.body.file.path))).resolves.toMatchObject({ size: png.length });

    const project = await agent.post('/api/v2/admin/projects').set('X-CSRF-Token', login.body.csrfToken).send({
      title: 'Uploaded Media Project',
      shortDescription: 'A project with persisted media relationships.',
      thumbnail: upload.body.file.url,
      thumbnailMediaId: upload.body.file.id,
      gallery: [upload.body.file.url],
      galleryMediaIds: [upload.body.file.id],
      status: 'published',
    });
    expect(project.status).toBe(201);
    expect(project.body).toMatchObject({
      thumbnail: upload.body.file.url,
      thumbnailMediaId: upload.body.file.id,
      gallery: [upload.body.file.url],
      galleryMediaIds: [upload.body.file.id],
    });
    const deleteInUse = await agent.delete(`/api/v2/admin/media/${upload.body.file.id}`).set('X-CSRF-Token', login.body.csrfToken);
    expect(deleteInUse.status).toBe(409);
    expect(deleteInUse.body.error.code).toBe('MEDIA_IN_USE');
  });

  it('lets team-member accounts upload profile media without granting media-library access', async () => {
    await db.insertInto('team_members').values({ id: 'member-upload', slug: 'member-upload', name: 'Member Upload', role: 'Engineer', avatar_url: '', active: true, display_order: 1, avatar_media_id: null, cover_media_id: null, cv_media_id: null, deleted_at: null }).execute();
    await db.insertInto('users').values({ id: 'team-upload-user', username: 'member-upload', email: 'upload@example.com', password_hash: await hashPassword('Member-Upload-42!'), display_name: 'Member Upload', role: 'team_member', is_active: true, last_login_at: null, team_member_id: 'member-upload', deleted_at: null }).execute();
    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').send({ username: 'member-upload', password: 'Member-Upload-42!' });
    const png = Buffer.from('89504e470d0a1a0a00000000', 'hex');
    const upload = await agent.post('/api/v2/admin/media').set('X-CSRF-Token', login.body.csrfToken).attach('file', png, { filename: 'avatar.png', contentType: 'image/png' });
    expect(upload.status).toBe(201);
    expect((await agent.get('/api/v2/admin/media')).status).toBe(403);
    expect((await agent.delete(`/api/v2/admin/media/${upload.body.file.id}`).set('X-CSRF-Token', login.body.csrfToken)).status).toBe(403);
  });

  it('supports PNG, JPEG, and WebP uploads, retry, duplicate reuse, thumbnail replacement, and stable gallery deletion', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').set('X-Forwarded-For', '203.0.113.88').send({ username: 'test-admin', password: 'Correct-Horse-42!' });
    const csrf = login.body.csrfToken;
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zc6AAAAAASUVORK5CYII=', 'base64');
    const jpeg = Buffer.from('ffd8ffe000104a46494600010100000100010000ffd9', 'hex');
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([4, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
    const send = (data: Buffer, filename: string, contentType: string) => agent.post('/api/v2/admin/media').set('X-CSRF-Token', csrf).attach('file', data, { filename, contentType });

    const failed = await send(Buffer.from('not-a-real-png'), 'broken.png', 'image/png');
    expect(failed.status).toBe(415);
    expect(failed.body).toMatchObject({ success: false, error: { code: 'UPLOAD_TYPE_INVALID' } });

    const pngUpload = await send(png, 'thumbnail.png', 'image/png');
    const jpegUpload = await send(jpeg, 'gallery.jpg', 'image/jpeg');
    const webpUpload = await send(webp, 'gallery.webp', 'image/webp');
    expect([pngUpload.status, jpegUpload.status, webpUpload.status]).toEqual([201, 201, 201]);
    expect([pngUpload.body.file.type, jpegUpload.body.file.type, webpUpload.body.file.type]).toEqual(['image/png', 'image/jpeg', 'image/webp']);

    const duplicate = await send(png, 'thumbnail-copy.png', 'image/png');
    expect(duplicate.status).toBe(200);
    expect(duplicate.body.file).toMatchObject({ id: pngUpload.body.file.id, url: pngUpload.body.file.url, reused: true });
    expect(Number((await db.selectFrom('media_assets').select(sql<number>`count(*)::int`.as('count')).executeTakeFirstOrThrow()).count)).toBe(3);

    const created = await agent.post('/api/v2/admin/projects').set('X-CSRF-Token', csrf).send({
      title: 'Media Lifecycle Project', shortDescription: 'Upload lifecycle coverage.', status: 'published',
      thumbnail: pngUpload.body.file.url, thumbnailMediaId: pngUpload.body.file.id,
      gallery: [webpUpload.body.file.url, jpegUpload.body.file.url], galleryMediaIds: [webpUpload.body.file.id, jpegUpload.body.file.id],
    });
    expect(created.status).toBe(201);
    expect((await request(app).get(`/api/v2/projects/${created.body.id}`)).body).toMatchObject({
      thumbnailMediaId: pngUpload.body.file.id,
      galleryMediaIds: [webpUpload.body.file.id, jpegUpload.body.file.id],
    });

    const replaced = await agent.put(`/api/v2/admin/projects/${created.body.id}`).set('X-CSRF-Token', csrf).send({
      title: created.body.title, status: 'published', version: created.body.version,
      thumbnail: jpegUpload.body.file.url, thumbnailMediaId: jpegUpload.body.file.id,
      gallery: [jpegUpload.body.file.url], galleryMediaIds: [jpegUpload.body.file.id],
    });
    expect(replaced.status).toBe(200);
    expect(replaced.body).toMatchObject({ thumbnailMediaId: jpegUpload.body.file.id, galleryMediaIds: [jpegUpload.body.file.id] });

    const removed = await agent.put(`/api/v2/admin/projects/${created.body.id}`).set('X-CSRF-Token', csrf).send({
      title: replaced.body.title, status: 'published', version: replaced.body.version,
      thumbnail: '', thumbnailMediaId: null,
      gallery: [jpegUpload.body.file.url], galleryMediaIds: [jpegUpload.body.file.id],
    });
    expect(removed.status).toBe(200);
    expect((await request(app).get(`/api/v2/projects/${created.body.id}`)).body).toMatchObject({ thumbnail: '', thumbnailMediaId: null, gallery: [jpegUpload.body.file.url] });
  });

  it('supports the complete admin catalog, settings, accounts, and message workflows', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/api/v2/auth/login').set('X-Forwarded-For', '203.0.113.99').send({ username: 'test-admin', password: 'Correct-Horse-42!' });
    expect(login.status).toBe(200);
    const csrf = login.body.csrfToken;

    const service = await agent.post('/api/v2/admin/services').set('X-CSRF-Token', csrf).send({ title: 'Admin Workflow Service', image: '/images/service.png', features: ['Planning'] });
    expect(service.status).toBe(201);
    expect((await agent.put(`/api/v2/admin/services/${service.body.id}`).set('X-CSRF-Token', csrf).send({ title: 'Updated Workflow Service', image: '/images/service.png', features: ['Planning', 'Delivery'] })).status).toBe(200);

    const testimonial = await agent.post('/api/v2/admin/testimonials').set('X-CSRF-Token', csrf).send({ author: 'Client Name', quote: 'A professional delivery with excellent communication.', avatar: '/images/client.png' });
    expect(testimonial.status).toBe(201);
    expect((await agent.put(`/api/v2/admin/testimonials/${testimonial.body.id}`).set('X-CSRF-Token', csrf).send({ author: 'Client Name', quote: 'An updated professional delivery with excellent communication.', avatar: '/images/client.png' })).status).toBe(200);

    const technology = await agent.post('/api/v2/admin/technologies').set('X-CSRF-Token', csrf).send({ name: 'Workflow Tech', category: 'Backend', iconUrl: '/images/tech.png' });
    expect(technology.status).toBe(201);
    expect((await agent.put(`/api/v2/admin/technologies/${technology.body.id}`).set('X-CSRF-Token', csrf).send({ name: 'Workflow Tech', category: 'Platform', iconUrl: '/images/tech.png' })).status).toBe(200);

    const skill = await agent.post('/api/v2/admin/skills').set('X-CSRF-Token', csrf).send({ name: 'Workflow Design', category: 'Operations' });
    expect(skill.status).toBe(201);
    expect((await agent.put(`/api/v2/admin/skills/${skill.body.id}`).set('X-CSRF-Token', csrf).send({ name: 'Workflow Design', category: 'Strategy' })).status).toBe(200);

    const blog = await agent.post('/api/v2/admin/blog').set('X-CSRF-Token', csrf).send({ title: 'Admin Workflow Post', content: '<p>Complete admin workflow coverage.</p>', author: 'Test Admin', status: 'draft' });
    expect(blog.status).toBe(201);
    expect((await agent.put(`/api/v2/admin/blog/${blog.body.id}`).set('X-CSRF-Token', csrf).send({ title: 'Updated Admin Workflow Post', content: '<p>Updated workflow coverage.</p>', author: 'Test Admin', status: 'published', publishedAt: new Date().toISOString(), version: blog.body.version })).status).toBe(200);

    const setting = await agent.put('/api/v2/admin/settings/contact.email').set('X-CSRF-Token', csrf).send({ value: 'contact@example.com', isPublic: true, description: 'Public contact address' });
    expect(setting.status).toBe(200);
    expect((await agent.get('/api/v2/settings')).body['contact.email']).toBe('contact@example.com');

    const account = await agent.post('/api/v2/admin/users').set('X-CSRF-Token', csrf).send({ username: 'workflow-editor', email: 'workflow@example.com', displayName: 'Workflow Editor', password: 'Workflow-Editor-42!', role: 'editor', isActive: true });
    expect(account.status).toBe(201);
    expect((await agent.patch(`/api/v2/admin/users/${account.body.id}`).set('X-CSRF-Token', csrf).send({ displayName: 'Updated Workflow Editor' })).status).toBe(200);
    expect((await agent.delete(`/api/v2/admin/users/${account.body.id}`).set('X-CSRF-Token', csrf)).status).toBe(204);

    const message = await request(app).post('/api/v2/messages').send({ name: 'Workflow Client', email: 'client@example.com', subject: 'Workflow review', message: 'Please review the complete administration workflow.', website: '' });
    expect(message.status).toBe(201);
    const messageUpdate = await agent.patch(`/api/v2/admin/messages/${message.body.id}`).set('X-CSRF-Token', csrf).send({ status: 'replied' });
    expect(messageUpdate.status).toBe(200);
    expect(messageUpdate.body.status).toBe('replied');

    for (const [resource, id] of [['services', service.body.id], ['testimonials', testimonial.body.id], ['technologies', technology.body.id], ['skills', skill.body.id], ['blog', blog.body.id]] as const) {
      expect((await agent.delete(`/api/v2/admin/${resource}/${id}`).set('X-CSRF-Token', csrf)).status).toBe(204);
    }
  });
});
