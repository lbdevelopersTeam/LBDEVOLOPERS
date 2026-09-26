import { afterEach, describe, expect, it } from 'vitest';
import type { Kysely } from 'kysely';
import type { Database } from '../../../db/types';
import { createProject, createTeamMember, getProject, listProjects, updateProject } from '../content-repository';
import { blogInput, projectInput, teamInput, validate } from '../schemas';
import { createTestDatabase } from './test-database';

let db: Kysely<Database> | undefined;
let close: (() => Promise<void>) | undefined;
afterEach(async () => { await close?.(); db = undefined; close = undefined; });

describe('PostgreSQL schema and repository', () => {
  it('creates the normalized tables, foreign keys, and unique slug constraints', async () => {
    ({ db, close } = await createTestDatabase());
    const tables = await db.selectFrom('team_members').select('id').execute();
    expect(tables).toEqual([]);
    await db.insertInto('team_members').values({ id: 'one', slug: 'same', name: 'One', role: 'Engineer', avatar_media_id: null, cover_media_id: null, cv_media_id: null, deleted_at: null }).execute();
    await expect(db.insertInto('team_members').values({ id: 'two', slug: 'same', name: 'Two', role: 'Designer', avatar_media_id: null, cover_media_id: null, cv_media_id: null, deleted_at: null }).execute()).rejects.toThrow();
    await expect(db.insertInto('project_team_members').values({ project_id: 'missing', team_member_id: 'one', contribution_role: 'Lead', display_order: 0 }).execute()).rejects.toThrow();
  });

  it('persists and reads project-team and project-technology many-to-many relations', async () => {
    ({ db, close } = await createTestDatabase());
    await db.insertInto('users').values({ id: 'seed-user', username: 'seed-admin', email: 'seed@example.com', password_hash: 'test-only', display_name: 'Seed', role: 'super_admin', is_active: true, last_login_at: null, team_member_id: null, deleted_at: null }).execute();
    const member = await createTeamMember(db, validate(teamInput, { name: 'Jane Doe', role: 'Engineer', avatar: '/images/jane.png', skills: ['React'], skillGroups: [{ category: 'Frontend', skills: ['React', 'TypeScript'] }] }));
    const project = await createProject(db, validate(projectInput, { title: 'Secure Portal', shortDescription: 'A secure portal', fullDescription: '<p>Hello</p><script>alert(1)</script>', thumbnail: '/images/portal.png', category: 'Web', technologies: ['React', 'PostgreSQL'], status: 'published', contributors: [{ memberId: member.id, role: 'Lead Engineer' }] }), 'seed-user');
    expect(project.technologies).toEqual(['React', 'PostgreSQL']);
    expect(project.contributors[0]).toMatchObject({ memberId: member.id, role: 'Lead Engineer' });
    expect(project.fullDescription).not.toContain('<script');
    const fetched = await getProject(db, project.slug, true);
    expect(fetched.id).toBe(project.id);
    const list = await listProjects(db, { page: 1, limit: 10, offset: 0 }, true);
    expect(list.total).toBe(1);
  });

  it('preserves summary expertise when detailed skill labels do not match it', async () => {
    ({ db, close } = await createTestDatabase());
    const member = await createTeamMember(db, validate(teamInput, {
      name: 'Ibad Ullah',
      role: 'Lead UI/UX & Product Designer',
      skills: ['UI/UX Design', 'Interface Design', 'Responsive Design', 'Next.js Web Development Expert'],
      skillGroups: [
        { category: 'User Experience & Strategy', skills: ['User Journey Mapping & Personas', 'Information Architecture (IA)'] },
        { category: 'Interface & Design Systems', skills: ['Design Token Architecture', 'Next.js Web Development Expert'] },
      ],
    }));

    expect(member.skills).toEqual(['UI/UX Design', 'Interface Design', 'Responsive Design', 'Next.js Web Development Expert']);
    expect(member.skillGroups).toEqual([
      { category: 'User Experience & Strategy', skills: ['User Journey Mapping & Personas', 'Information Architecture (IA)'] },
      { category: 'Interface & Design Systems', skills: ['Design Token Architecture', 'Next.js Web Development Expert'] },
    ]);
  });

  it('defaults new portfolio projects to published visibility', async () => {
    const payload = validate(projectInput, { title: 'Visible By Default', thumbnail: '/images/visible.png' });
    expect(payload.status).toBe('published');
  });

  it('accepts and stores blog live URLs', async () => {
    const payload = validate(blogInput, {
      title: 'Launch Notes',
      excerpt: 'Our launch story',
      content: '<p>We launched.</p>',
      coverImage: '/images/launch.png',
      category: 'Development',
      tags: ['launch'],
      author: 'Wajid Hussain',
      status: 'published',
      liveUrl: 'https://example.com/blog/launch',
    });
    expect(payload.liveUrl).toBe('https://example.com/blog/launch');
  });

  it('rejects stale optimistic-concurrency versions', async () => {
    ({ db, close } = await createTestDatabase());
    await db.insertInto('users').values({ id: 'seed-user', username: 'seed-admin', email: 'seed@example.com', password_hash: 'test-only', display_name: 'Seed', role: 'super_admin', is_active: true, last_login_at: null, team_member_id: null, deleted_at: null }).execute();
    const created = await createProject(db, validate(projectInput, { title: 'Versioned', thumbnail: '/images/versioned.png' }), 'seed-user');
    const update = validate(projectInput, {
      title: 'Versioned update', slug: created.slug, shortDescription: created.shortDescription, fullDescription: created.fullDescription,
      thumbnail: created.thumbnail, gallery: created.gallery, category: created.category, technologies: created.technologies,
      liveUrl: created.liveUrl, githubUrl: created.githubUrl, featured: created.featured, status: created.status,
      completionDate: created.completionDate, metaTitle: created.metaTitle, metaDescription: created.metaDescription, sortOrder: created.sortOrder,
      contributors: created.contributors.map((item) => ({ memberId: item.memberId, role: item.role })), client: created.client, industry: created.industry,
      problem: created.problem, challenge: created.challenge, solution: created.solution, process: created.process, results: created.results, achievements: created.achievements,
      version: created.version,
    });
    const updated = await updateProject(db, created.id, update, 'seed-user');
    expect(updated.version).toBe(created.version + 1);
    await expect(updateProject(db, created.id, update, 'seed-user')).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
  });
});
