import 'dotenv/config';
import assert from 'node:assert/strict';
import { sql } from 'kysely';
import { createDatabase, databaseConfigFromEnv } from './client';
import { verifyPassword } from '../api/v2/security';

const config = databaseConfigFromEnv();
if (!config) throw new Error('DATABASE_URL is required to verify MariaDB.');

const db = createDatabase(config);
try {
  const identity = await sql<{ database_name: string; server_version: string; session_timezone: string }>`
    select database() as database_name, version() as server_version, @@session.time_zone as session_timezone
  `.execute(db);
  assert.ok(identity.rows[0]?.database_name, 'The connection must select a database.');
  assert.equal(identity.rows[0]?.session_timezone, '+00:00', 'The MariaDB session must use UTC.');

  const username = (process.env.ADMIN_USERNAME || '').trim();
  const admin = username
    ? await db.selectFrom('users').select(['username', 'role', 'is_active', 'password_hash']).where(sql`lower(username)`, '=', username.toLowerCase()).where('deleted_at', 'is', null).executeTakeFirstOrThrow()
    : await db.selectFrom('users').select(['username', 'role', 'is_active', 'password_hash']).where('role', '=', 'super_admin').where('is_active', '=', true).where('deleted_at', 'is', null).executeTakeFirstOrThrow();
  assert.equal(admin.role, 'super_admin');
  assert.equal(admin.is_active, true);
  assert.match(admin.password_hash, /^\$2[aby]\$12\$/);
  assert.notEqual(admin.password_hash, process.env.ADMIN_INITIAL_PASSWORD);
  if (process.env.ADMIN_INITIAL_PASSWORD) assert.equal(await verifyPassword(process.env.ADMIN_INITIAL_PASSWORD, admin.password_hash), true);

  const [users, projects, teamMembers, blogPosts, services, migrations] = await Promise.all([
    db.selectFrom('users').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('projects').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('team_members').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('blog_posts').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('services').select(sql<number>`count(*)`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    sql<{ count: number }>`select count(*) as count from _app_migrations`.execute(db),
  ]);
  assert.ok(Number(users.count) >= 1);
  assert.ok(Number(projects.count) >= 1);
  assert.ok(Number(teamMembers.count) >= 1);
  assert.ok(Number(services.count) >= 1);
  assert.ok(Number(migrations.rows[0]?.count) >= 1);

  process.stdout.write(`${JSON.stringify({
    status: 'ok',
    database: 'mariadb',
    databaseName: identity.rows[0]?.database_name,
    serverVersion: identity.rows[0]?.server_version,
    migrations: Number(migrations.rows[0]?.count),
    records: {
      users: Number(users.count), projects: Number(projects.count), teamMembers: Number(teamMembers.count),
      blogPosts: Number(blogPosts.count), services: Number(services.count),
    },
    passwordHash: 'bcrypt-cost-12',
  })}\n`);
} finally {
  await db.destroy();
}
