import 'dotenv/config';
import assert from 'node:assert/strict';
import pg from 'pg';
import { sql } from 'kysely';
import { createDatabase, databaseConfigFromEnv } from './client';
import { verifyPassword } from '../api/v2/security';

const config = databaseConfigFromEnv();
if (!config) throw new Error('DATABASE_URL is required to verify PostgreSQL.');

const db = createDatabase(config);
const migrationClient = new pg.Client({
  connectionString: process.env.DATABASE_MIGRATION_URL || config.url,
  ssl: config.ssl ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
});

try {
  const identity = await sql<{ current_user: string; server_version: string }>`select current_user, current_setting('server_version') as server_version`.execute(db);
  assert.equal(identity.rows[0]?.current_user, 'lb_app', 'The runtime connection must use the restricted lb_app role.');

  const permissions = await sql<{ schema_usage: boolean; schema_create: boolean; users_select: boolean; users_update: boolean }>`
    select
      has_schema_privilege(current_user, 'app', 'USAGE') as schema_usage,
      has_schema_privilege(current_user, 'app', 'CREATE') as schema_create,
      has_table_privilege(current_user, 'app.users', 'SELECT') as users_select,
      has_table_privilege(current_user, 'app.users', 'UPDATE') as users_update
  `.execute(db);
  assert.equal(permissions.rows[0]?.schema_usage, true);
  assert.equal(permissions.rows[0]?.schema_create, false, 'The runtime role must not have schema creation privileges.');
  assert.equal(permissions.rows[0]?.users_select, true);
  assert.equal(permissions.rows[0]?.users_update, true);

  const username = (process.env.ADMIN_USERNAME || '').trim();
  const admin = await db.selectFrom('users').select(['username', 'role', 'is_active', 'password_hash']).where(sql`lower(username)`, '=', username.toLowerCase()).where('deleted_at', 'is', null).executeTakeFirstOrThrow();
  assert.equal(admin.username, username);
  assert.equal(admin.role, 'super_admin');
  assert.equal(admin.is_active, true);
  assert.match(admin.password_hash, /^\$2[aby]\$12\$/);
  assert.notEqual(admin.password_hash, process.env.ADMIN_INITIAL_PASSWORD);
  if (process.env.ADMIN_INITIAL_PASSWORD) assert.equal(await verifyPassword(process.env.ADMIN_INITIAL_PASSWORD, admin.password_hash), true);

  const counts = await Promise.all([
    db.selectFrom('users').select(sql<number>`count(*)::int`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('projects').select(sql<number>`count(*)::int`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('team_members').select(sql<number>`count(*)::int`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('blog_posts').select(sql<number>`count(*)::int`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
    db.selectFrom('services').select(sql<number>`count(*)::int`.as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow(),
  ]);
  assert.deepEqual(counts.map((item) => Number(item.count)), [1, 12, 4, 2, 7]);

  await migrationClient.connect();
  const migrations = await migrationClient.query<{ count: number }>('select count(*)::int as count from public._app_migrations');
  assert.equal(Number(migrations.rows[0]?.count), 4);

  process.stdout.write(`${JSON.stringify({
    status: 'ok',
    database: 'postgresql',
    serverMajor: identity.rows[0]?.server_version.split('.')[0],
    runtimeRole: identity.rows[0]?.current_user,
    migrations: Number(migrations.rows[0]?.count),
    records: { users: 1, projects: 12, teamMembers: 4, blogPosts: 2, services: 7 },
    passwordHash: 'bcrypt-cost-12',
  })}\n`);
} finally {
  await Promise.allSettled([db.destroy(), migrationClient.end()]);
}
