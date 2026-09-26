import 'dotenv/config';
import { createDatabase, databaseConfigFromEnv } from './client';

const projectIds = [
  'project-albawabaa',
  'project-vogue-decor',
  'project-american-dream-auto-protect',
  'project-pedro-clavero',
] as const;

const memberIds = ['team-wajid', 'team-laiba', 'team-mohsin', 'team-ibad'] as const;

async function main() {
  const config = databaseConfigFromEnv();
  if (!config) throw new Error('DATABASE_URL is required to verify curated projects.');

  const db = createDatabase(config);
  try {
    const [projects, contributors, technologies] = await Promise.all([
      db.selectFrom('projects')
        .select(['id', 'slug', 'title', 'status', 'live_url', 'full_description', 'problem', 'challenge', 'solution', 'process', 'results', 'achievements'])
        .where('id', 'in', [...projectIds])
        .where('deleted_at', 'is', null)
        .execute(),
      db.selectFrom('project_team_members')
        .select(['project_id', 'team_member_id', 'contribution_role'])
        .where('project_id', 'in', [...projectIds])
        .execute(),
      db.selectFrom('project_technologies')
        .select(['project_id', 'technology_id'])
        .where('project_id', 'in', [...projectIds])
        .execute(),
    ]);

    const failures: string[] = [];
    for (const id of projectIds) {
      const project = projects.find((item) => item.id === id);
      if (!project) {
        failures.push(`${id}: missing project row`);
        continue;
      }
      if (project.status !== 'published') failures.push(`${id}: not published`);
      if (!project.live_url) failures.push(`${id}: missing live URL`);
      if (project.full_description.length < 300) failures.push(`${id}: case-study description is too short`);
      if (![project.problem, project.challenge, project.solution].every((value) => value.length >= 100)) failures.push(`${id}: incomplete strategy narrative`);
      if (!Array.isArray(project.process) || project.process.length < 4) failures.push(`${id}: incomplete process`);
      if (!Array.isArray(project.results) || project.results.length < 3) failures.push(`${id}: incomplete results`);
      if (!Array.isArray(project.achievements) || project.achievements.length < 3) failures.push(`${id}: incomplete achievements`);
      if (contributors.filter((item) => item.project_id === id).length !== memberIds.length) failures.push(`${id}: expected ${memberIds.length} contributors`);
      if (!technologies.some((item) => item.project_id === id)) failures.push(`${id}: missing technology relationships`);
    }

    const memberSummary = memberIds.map((memberId) => ({
      memberId,
      projectCount: contributors.filter((item) => item.team_member_id === memberId).length,
      roles: contributors.filter((item) => item.team_member_id === memberId).map((item) => item.contribution_role),
    }));
    for (const member of memberSummary) {
      if (member.projectCount !== projectIds.length) failures.push(`${member.memberId}: expected ${projectIds.length} sub-portfolio projects`);
    }

    if (failures.length) throw new Error(`Curated-project verification failed:\n- ${failures.join('\n- ')}`);
    process.stdout.write(`${JSON.stringify({ projects: projects.map(({ id, slug, title, live_url }) => ({ id, slug, title, liveUrl: live_url })), subPortfolios: memberSummary }, null, 2)}\n`);
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
