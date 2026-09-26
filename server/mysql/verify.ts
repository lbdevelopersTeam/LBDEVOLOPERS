import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'kysely';
import { createMysqlDatabase, mysqlConfigFromEnv } from './client';

const requiredTables = [
  'users', 'sessions', 'projects', 'technologies', 'project_technologies',
  'contact_messages', 'idempotency_keys', 'audit_logs', 'outbox_events',
] as const;

export async function verifyMysql(): Promise<void> {
  const config = mysqlConfigFromEnv();
  if (!config) throw new Error('MYSQL_DATABASE_URL is required to verify MySQL.');
  const db = createMysqlDatabase(config);
  try {
    const versionResult = await sql<{ version: string; timezone: string }>`SELECT VERSION() AS version, @@session.time_zone AS timezone`.execute(db);
    const version = versionResult.rows[0]?.version || '';
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    const [major, minor, patch] = match ? match.slice(1).map(Number) : [];
    const isMariaDb = /mariadb/i.test(version);
    const supportedMysql = !isMariaDb && major === 8 && (minor > 0 || (minor === 0 && patch >= 34));
    const supportedMariaDb = isMariaDb && (major > 10 || (major === 10 && minor >= 6));
    const supported = supportedMysql || supportedMariaDb;
    if (!supported) {
      throw new Error(`MySQL 8.0.34+ or MariaDB 10.6+ is required; connected server reports ${version || 'an unknown version'}.`);
    }

    const tablesResult = await sql<{ tableName: string }>`
      SELECT table_name AS tableName
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `.execute(db);
    const available = new Set(tablesResult.rows.map((row) => row.tableName));
    const missing = requiredTables.filter((table) => !available.has(table));
    if (missing.length) throw new Error(`MySQL schema is incomplete. Missing: ${missing.join(', ')}.`);

    const migrations = await sql<{ count: string | number }>`SELECT COUNT(*) AS count FROM _app_migrations`.execute(db);
    const users = await db.selectFrom('users').select(({ fn }) => fn.countAll<string>().as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow();
    const projects = await db.selectFrom('projects').select(({ fn }) => fn.countAll<string>().as('count')).where('deleted_at', 'is', null).executeTakeFirstOrThrow();

    process.stdout.write(`${JSON.stringify({
      database: 'mysql',
      engine: isMariaDb ? 'mariadb' : 'mysql',
      version,
      timezone: versionResult.rows[0]?.timezone,
      migrations: Number(migrations.rows[0]?.count || 0),
      tables: requiredTables.length,
      users: Number(users.count),
      projects: Number(projects.count),
      status: 'ready',
    }, null, 2)}\n`);
  } finally {
    await db.destroy();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyMysql().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
