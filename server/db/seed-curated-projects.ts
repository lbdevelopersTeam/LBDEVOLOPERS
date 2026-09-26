import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createDatabase, databaseConfigFromEnv } from './client';
import { updateProject } from '../api/v2/content-repository';
import { projectInput } from '../api/v2/schemas';

interface LegacyProject {
  id: string;
  [key: string]: unknown;
}

interface LegacyDatabase {
  projects: LegacyProject[];
}

const projectIds = [
  'project-albawabaa',
  'project-vogue-decor',
  'project-american-dream-auto-protect',
  'project-pedro-clavero',
] as const;

const withoutMetadata = (record: LegacyProject) => {
  const copy = { ...record };
  for (const key of ['id', 'createdAt', 'updatedAt', 'deletedAt', 'readingTime', 'testimonials']) delete copy[key];
  return copy;
};

async function main() {
  const config = databaseConfigFromEnv();
  if (!config) throw new Error('DATABASE_URL is required to seed curated projects.');

  const sourceText = await fs.readFile(path.resolve(process.cwd(), 'db.json'), 'utf8');
  const source = JSON.parse(sourceText.replace(/^\uFEFF/, '')) as LegacyDatabase;
  const sourceById = new Map(source.projects.map((project) => [project.id, project]));
  const missingSourceIds = projectIds.filter((id) => !sourceById.has(id));
  if (missingSourceIds.length) throw new Error(`Missing curated projects in db.json: ${missingSourceIds.join(', ')}`);

  const inputs = projectIds.map((id) => ({
    id,
    input: projectInput.parse(withoutMetadata(sourceById.get(id)!)),
  }));

  const db = createDatabase(config);
  try {
    const [admin, teamMembers, existingProjects] = await Promise.all([
      db.selectFrom('users').select('id').where('role', '=', 'super_admin').where('is_active', '=', true).where('deleted_at', 'is', null).orderBy('created_at').executeTakeFirst(),
      db.selectFrom('team_members').select(['id', 'name']).where('id', 'in', ['team-wajid', 'team-laiba', 'team-mohsin', 'team-ibad']).where('deleted_at', 'is', null).execute(),
      db.selectFrom('projects').selectAll().where('id', 'in', [...projectIds]).execute(),
    ]);

    if (!admin) throw new Error('An active super-admin account is required to seed projects.');
    if (teamMembers.length !== 4) {
      const found = new Set(teamMembers.map((member) => member.id));
      const missing = ['team-wajid', 'team-laiba', 'team-mohsin', 'team-ibad'].filter((id) => !found.has(id));
      throw new Error(`Missing project contributors: ${missing.join(', ')}`);
    }

    if (existingProjects.length) {
      const existingIds = existingProjects.map((project) => project.id);
      const [contributors, technologies, media] = await Promise.all([
        db.selectFrom('project_team_members').selectAll().where('project_id', 'in', existingIds).execute(),
        db.selectFrom('project_technologies').selectAll().where('project_id', 'in', existingIds).execute(),
        db.selectFrom('project_media').selectAll().where('project_id', 'in', existingIds).execute(),
      ]);
      const backupDirectory = path.resolve(process.cwd(), 'backups');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDirectory, `curated-projects-before-${timestamp}.json`);
      await fs.mkdir(backupDirectory, { recursive: true });
      await fs.writeFile(backupPath, `${JSON.stringify({ projects: existingProjects, contributors, technologies, media }, null, 2)}\n`, 'utf8');
      process.stdout.write(`Backed up ${existingProjects.length} existing curated project record(s) to ${backupPath}.\n`);
    }

    for (const { id, input } of inputs) {
      await db.insertInto('projects').values({
        id,
        slug: input.slug || id,
        title: input.title,
        thumbnail_media_id: null,
        completion_date: null,
        created_by: admin.id,
        updated_by: admin.id,
        deleted_at: null,
      }).onConflict((conflict) => conflict.column('id').doUpdateSet({ deleted_at: null })).execute();
      await updateProject(db, id, input, admin.id);
      process.stdout.write(`Upserted ${input.title}.\n`);
    }

    const verification = await db.selectFrom('projects')
      .leftJoin('project_team_members', 'project_team_members.project_id', 'projects.id')
      .select(['projects.id', 'projects.slug', 'projects.title', 'projects.status', 'projects.live_url'])
      .select((eb) => eb.fn.count('project_team_members.team_member_id').as('contributors'))
      .where('projects.id', 'in', [...projectIds])
      .where('projects.deleted_at', 'is', null)
      .groupBy(['projects.id', 'projects.slug', 'projects.title', 'projects.status', 'projects.live_url'])
      .orderBy('projects.sort_order')
      .execute();

    process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
