import 'dotenv/config';
import { createMysqlDatabase, mysqlConfigFromEnv } from './client';

const curatedSlugs = ['albawabaa-shop', 'vogue-decor', 'american-dream-auto-protect', 'pedro-clavero-design'] as const;

async function main() {
  const config = mysqlConfigFromEnv();
  if (!config) throw new Error('MYSQL_DATABASE_URL is required to verify the curated MySQL projects.');
  const db = createMysqlDatabase(config);
  try {
    const projects = await db.selectFrom('projects').select([
      'id', 'slug', 'title', 'description_html', 'thumbnail_url', 'live_url', 'status',
    ]).where('slug', 'in', [...curatedSlugs]).where('deleted_at', 'is', null).execute();
    const links = projects.length ? await db.selectFrom('project_technologies').select(['project_id', 'technology_id'])
      .where('project_id', 'in', projects.map((project) => project.id)).execute() : [];
    const failures: string[] = [];
    for (const slug of curatedSlugs) {
      const project = projects.find((item) => item.slug === slug);
      if (!project) {
        failures.push(`${slug}: missing`);
        continue;
      }
      if (project.status !== 'published') failures.push(`${slug}: not published`);
      if (!project.thumbnail_url || !project.live_url) failures.push(`${slug}: missing image or live URL`);
      if (project.description_html.length < 1_000) failures.push(`${slug}: detailed case study is too short`);
      for (const heading of ['The Problem', 'The Challenge', 'The Solution', 'Delivery Process', 'Results', 'Achievements', 'Team Contributions']) {
        if (!project.description_html.includes(heading)) failures.push(`${slug}: missing ${heading} section`);
      }
      if (links.filter((link) => link.project_id === project.id).length < 4) failures.push(`${slug}: incomplete technology relationships`);
    }
    if (failures.length) throw new Error(`MySQL curated-project verification failed:\n- ${failures.join('\n- ')}`);
    process.stdout.write(`${JSON.stringify({ database: 'mysql', projects: projects.map(({ slug, title, live_url }) => ({ slug, title, liveUrl: live_url })), status: 'strong-content-verified' }, null, 2)}\n`);
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
