import 'dotenv/config';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sql } from 'kysely';
import { createMysqlDatabase, mysqlConfigFromEnv } from './client';
import { slugifyV3, v3ProjectCreateInput } from '../api/v3/contracts';

interface LegacyContributor {
  memberId?: unknown;
  role?: unknown;
}

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
  client?: unknown;
  industry?: unknown;
  problem?: unknown;
  challenge?: unknown;
  solution?: unknown;
  process?: unknown;
  results?: unknown;
  achievements?: unknown;
  contributors?: unknown;
}

const curatedIds = [
  'project-albawabaa',
  'project-vogue-decor',
  'project-american-dream-auto-protect',
  'project-pedro-clavero',
] as const;

const contributorNames: Record<string, string> = {
  'team-wajid': 'Wajid Hussain',
  'team-laiba': 'Laiba Sahibzada',
  'team-mohsin': 'Mohsin Bilal',
  'team-ibad': 'Ibad Ullah',
};

const safeString = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const safeList = (value: unknown) => Array.isArray(value) ? value.map(safeString).filter(Boolean) : [];
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character]!));

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

function textSection(title: string, value: unknown) {
  const content = safeString(value);
  return content ? `<h2>${title}</h2><p>${escapeHtml(content)}</p>` : '';
}

function listSection(title: string, value: unknown) {
  const items = safeList(value);
  return items.length ? `<h2>${title}</h2><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
}

function strongDescription(project: LegacyProject) {
  const contributors = Array.isArray(project.contributors) ? project.contributors as LegacyContributor[] : [];
  const contributionSection = contributors.length
    ? `<h2>Team Contributions</h2><ul>${contributors.map((contributor) => {
        const memberId = safeString(contributor.memberId);
        const name = contributorNames[memberId] || memberId || 'LB CodeBase';
        return `<li><strong>${escapeHtml(name)}</strong> — ${escapeHtml(safeString(contributor.role) || 'Contributor')}</li>`;
      }).join('')}</ul>`
    : '';

  return [
    safeString(project.fullDescription),
    textSection('The Problem', project.problem),
    textSection('The Challenge', project.challenge),
    textSection('The Solution', project.solution),
    listSection('Delivery Process', project.process),
    listSection('Results', project.results),
    listSection('Achievements', project.achievements),
    contributionSection,
  ].filter(Boolean).join('');
}

async function main() {
  const sourceText = await fs.readFile(path.resolve(process.cwd(), 'db.json'), 'utf8');
  const source = JSON.parse(sourceText.replace(/^\uFEFF/, '')) as { projects?: LegacyProject[] };
  const byId = new Map((source.projects || []).map((project) => [safeString(project.id), project]));
  const missing = curatedIds.filter((id) => !byId.has(id));
  if (missing.length) throw new Error(`Missing curated projects in db.json: ${missing.join(', ')}`);

  const prepared = curatedIds.map((id) => {
    const project = byId.get(id)!;
    const title = safeString(project.title);
    const candidate = {
      title,
      slug: safeString(project.slug) || slugifyV3(title),
      summary: safeString(project.shortDescription),
      descriptionHtml: strongDescription(project),
      category: safeString(project.category) || 'Web',
      thumbnailUrl: safeUrl(project.thumbnail),
      liveUrl: safeUrl(project.liveUrl),
      repositoryUrl: safeUrl(project.githubUrl),
      featured: Boolean(project.featured),
      status: safeString(project.status) || 'published',
      sortOrder: Math.max(0, Number(project.sortOrder) || 0),
      technologies: safeList(project.technologies),
    };
    const parsed = v3ProjectCreateInput.safeParse(candidate);
    if (!parsed.success) throw new Error(`${id} failed MySQL validation: ${parsed.error.message}`);
    return { id, input: parsed.data };
  });

  if (process.argv.includes('--dry-run')) {
    process.stdout.write(`${JSON.stringify({
      database: 'mysql',
      mode: 'dry-run',
      projects: prepared.map(({ id, input }) => ({
        id,
        slug: input.slug,
        descriptionCharacters: input.descriptionHtml.length,
        technologies: input.technologies.length,
        thumbnailUrl: input.thumbnailUrl,
        liveUrl: input.liveUrl,
      })),
      status: 'validated',
    }, null, 2)}\n`);
    return;
  }

  const config = mysqlConfigFromEnv();
  if (!config) throw new Error('MYSQL_DATABASE_URL is required to seed the four curated projects into MySQL.');

  const db = createMysqlDatabase(config);
  try {
    const admin = await db.selectFrom('users').select('id')
      .where('role', '=', 'super_admin').where('is_active', '=', 1).where('deleted_at', 'is', null)
      .orderBy('created_at').executeTakeFirst();
    if (!admin) throw new Error('An active MySQL super-admin is required. Run npm run mysql:setup for first-time setup.');

    const ids = prepared.map((item) => item.id);
    const slugs = prepared.map((item) => item.input.slug || slugifyV3(item.input.title));
    const existing = await db.selectFrom('projects').selectAll().where((eb) => eb.or([
      eb('id', 'in', ids),
      eb('slug', 'in', slugs),
    ])).execute();
    if (existing.length) {
      const links = await db.selectFrom('project_technologies').selectAll()
        .where('project_id', 'in', existing.map((project) => project.id)).execute();
      const backupDirectory = path.resolve(process.cwd(), 'backups');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDirectory, `mysql-curated-projects-before-${timestamp}.json`);
      await fs.mkdir(backupDirectory, { recursive: true });
      await fs.writeFile(backupPath, `${JSON.stringify({ projects: existing, technologyLinks: links }, null, 2)}\n`, 'utf8');
      process.stdout.write(`Backed up ${existing.length} existing MySQL project record(s) to ${backupPath}.\n`);
    }

    for (const { id, input } of prepared) {
      await db.transaction().execute(async (trx) => {
        const slug = input.slug || slugifyV3(input.title);
        const current = await trx.selectFrom('projects').select(['id', 'published_at']).where((eb) => eb.or([
          eb('id', '=', id),
          eb('slug', '=', slug),
        ])).executeTakeFirst();
        const projectId = current?.id || (id.length <= 36 ? id : crypto.randomUUID());
        const values = {
          slug,
          title: input.title,
          summary: input.summary,
          description_html: input.descriptionHtml,
          category: input.category,
          thumbnail_url: input.thumbnailUrl,
          live_url: input.liveUrl,
          repository_url: input.repositoryUrl,
          featured: input.featured ? 1 : 0,
          status: input.status,
          sort_order: input.sortOrder,
          published_at: input.status === 'published' ? current?.published_at || new Date() : null,
          updated_by: admin.id,
          deleted_at: null,
        };

        if (current) {
          await trx.updateTable('projects').set({ ...values, version: sql<number>`version + 1` }).where('id', '=', projectId).execute();
        } else {
          await trx.insertInto('projects').values({ ...values, id: projectId, created_by: admin.id }).execute();
        }

        await trx.deleteFrom('project_technologies').where('project_id', '=', projectId).execute();
        for (const [displayOrder, name] of input.technologies.entries()) {
          const technologySlug = slugifyV3(name);
          let technology = await trx.selectFrom('technologies').select('id').where('slug', '=', technologySlug).executeTakeFirst();
          if (!technology) {
            technology = { id: crypto.randomUUID() };
            await trx.insertInto('technologies').values({ id: technology.id, slug: technologySlug, name, deleted_at: null }).execute();
          } else {
            await trx.updateTable('technologies').set({ name, deleted_at: null }).where('id', '=', technology.id).execute();
          }
          await trx.insertInto('project_technologies').values({ project_id: projectId, technology_id: technology.id, display_order: displayOrder }).execute();
        }
      });
      process.stdout.write(`Upserted ${input.title} into MySQL with full case-study content.\n`);
    }
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
