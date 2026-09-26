import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('single MariaDB schema', () => {
  it('defines every production data table with InnoDB and utf8mb4', async () => {
    const migration = await fs.readFile(path.resolve(process.cwd(), 'server/db/mariadb-migrations/001_full_portfolio.sql'), 'utf8');
    const tables = [
      'users', 'sessions', 'media_assets', 'team_members', 'team_social_links', 'skills', 'team_member_skills',
      'technologies', 'projects', 'project_team_members', 'project_technologies', 'project_media', 'services',
      'testimonials', 'contact_messages', 'site_settings', 'blog_posts', 'page_views', 'audit_logs',
    ];
    for (const table of tables) expect(migration).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\s*\\(`));
    expect(migration.match(/ENGINE=InnoDB/g)).toHaveLength(tables.length);
    expect(migration).toContain('DEFAULT CHARSET=utf8mb4');
    expect(migration).not.toMatch(/CREATE\s+(DATABASE|SCHEMA)/i);
  });
});
