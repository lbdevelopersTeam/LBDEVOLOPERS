import 'dotenv/config';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { createMysqlDatabase, mysqlConfigFromEnv } from './client';
import { slugifyV3, v3ProjectCreateInput } from '../api/v3/contracts';

interface LegacyProject {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  shortDescription?: unknown;
  fullDescription?: unknown;
  category?: unknown;
  thumbnail?: unknown;
  liveUrl?: unknown;
  githubUrl?: unknown;
  featured?: unknown;
  status?: unknown;
  sortOrder?: unknown;
  technologies?: unknown;
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeUrl(value: unknown) {
  const candidate = safeString(value);
  if (!candidate) return null;
  if (/^\/(?!\/)/.test(candidate)) return candidate;
  try {
    return ['http:', 'https:'].includes(new URL(candidate).protocol) ? candidate : null;
  } catch {
    return null;
  }
}

export async function seedMysql(): Promise<void> {
  const config = mysqlConfigFromEnv();
  if (!config) throw new Error('MYSQL_DATABASE_URL is required to seed MySQL.');
  const db = createMysqlDatabase(config);
  try {
    const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const displayName = (process.env.ADMIN_DISPLAY_NAME || 'LB Super Admin').trim();
    const initialPassword = process.env.MYSQL_ADMIN_INITIAL_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD;
    const existing = await db.selectFrom('users').select(['id', 'password_hash']).where('username', '=', username).executeTakeFirst();
    let adminId = existing?.id;
    if (!existing) {
      if (!initialPassword || initialPassword.length < 12) {
        throw new Error('MYSQL_ADMIN_INITIAL_PASSWORD or ADMIN_INITIAL_PASSWORD with at least 12 characters is required for the first MySQL seed.');
      }
      adminId = crypto.randomUUID();
      await db.insertInto('users').values({
        id: adminId, username, email, password_hash: await bcrypt.hash(initialPassword, 12), display_name: displayName,
        role: 'super_admin', is_active: 1, last_login_at: null, deleted_at: null,
      }).execute();
    } else {
      await db.updateTable('users').set({
        email, display_name: displayName, role: 'super_admin', is_active: 1, deleted_at: null,
        ...(initialPassword ? { password_hash: await bcrypt.hash(initialPassword, 12) } : {}),
      }).where('id', '=', existing.id).execute();
    }

    const sourceText = await fs.readFile(path.resolve(process.cwd(), 'db.json'), 'utf8');
    const raw = JSON.parse(sourceText.replace(/^\uFEFF/, '')) as { projects?: LegacyProject[] };
    let imported = 0;
    for (const [index, project] of (raw.projects || []).entries()) {
      const title = safeString(project.title) || `Project ${index + 1}`;
      const candidate = {
        title,
        slug: safeString(project.slug) || slugifyV3(title),
        summary: safeString(project.shortDescription),
        descriptionHtml: safeString(project.fullDescription),
        category: safeString(project.category) || 'Web',
        thumbnailUrl: safeUrl(project.thumbnail),
        liveUrl: safeUrl(project.liveUrl),
        repositoryUrl: safeUrl(project.githubUrl),
        featured: Boolean(project.featured),
        status: ['draft', 'published', 'archived'].includes(safeString(project.status)) ? safeString(project.status) : 'draft',
        sortOrder: Number.isInteger(Number(project.sortOrder)) ? Math.max(0, Number(project.sortOrder)) : index,
        technologies: Array.isArray(project.technologies) ? project.technologies.map(safeString).filter(Boolean) : [],
      };
      const parsed = v3ProjectCreateInput.safeParse(candidate);
      if (!parsed.success) throw new Error(`Legacy project ${title} failed MySQL seed validation: ${parsed.error.message}`);
      const alreadyExists = await db.selectFrom('projects').select('id').where('slug', '=', parsed.data.slug || slugifyV3(parsed.data.title)).executeTakeFirst();
      if (alreadyExists) continue;

      await db.transaction().execute(async (trx) => {
        const legacyId = safeString(project.id);
        const projectId = legacyId && legacyId.length <= 36 && /^[A-Za-z0-9-]+$/.test(legacyId) ? legacyId : crypto.randomUUID();
        await trx.insertInto('projects').values({
          id: projectId, slug: parsed.data.slug || slugifyV3(parsed.data.title), title: parsed.data.title,
          summary: parsed.data.summary, description_html: parsed.data.descriptionHtml, category: parsed.data.category,
          thumbnail_url: parsed.data.thumbnailUrl, live_url: parsed.data.liveUrl, repository_url: parsed.data.repositoryUrl,
          featured: parsed.data.featured ? 1 : 0, status: parsed.data.status, sort_order: parsed.data.sortOrder,
          published_at: parsed.data.status === 'published' ? new Date() : null,
          created_by: adminId!, updated_by: adminId!, deleted_at: null,
        }).execute();
        for (const [technologyOrder, technologyName] of parsed.data.technologies.entries()) {
          const technologySlug = slugifyV3(technologyName);
          let technology = await trx.selectFrom('technologies').select('id').where('slug', '=', technologySlug).executeTakeFirst();
          if (!technology) {
            technology = { id: crypto.randomUUID() };
            await trx.insertInto('technologies').values({ id: technology.id, slug: technologySlug, name: technologyName, deleted_at: null }).execute();
          }
          await trx.insertInto('project_technologies').values({ project_id: projectId, technology_id: technology.id, display_order: technologyOrder }).execute();
        }
      });
      imported += 1;
    }

    process.stdout.write(`${JSON.stringify({ database: 'mysql', admin: username, projectsImported: imported, status: 'seeded' }, null, 2)}\n`);
  } finally {
    await db.destroy();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  seedMysql().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
