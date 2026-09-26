import 'dotenv/config';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection, type RowDataPacket } from 'mysql2/promise';
import { databaseConfigFromEnv, databasePoolOptions } from './client';

const migrationsDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'mariadb-migrations');
interface ChecksumRow extends RowDataPacket { checksum: string }

export async function migrate(connectionUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL): Promise<void> {
  if (!connectionUrl) throw new Error('DATABASE_URL is required to run MariaDB migrations.');
  const base = databaseConfigFromEnv();
  if (!base) throw new Error('DATABASE_URL is required to run MariaDB migrations.');
  const options = databasePoolOptions({ ...base, url: connectionUrl });
  const { connectionLimit: _limit, maxIdle: _maxIdle, idleTimeout: _idle, ...connectionOptions } = options;
  const connection = await createConnection({ ...connectionOptions, multipleStatements: true });
  let lockHeld = false;
  try {
    await connection.query("SET SESSION time_zone = '+00:00'");
    await connection.query(`CREATE TABLE IF NOT EXISTS _app_migrations (
      name VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
      checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
      applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const [locks] = await connection.query<RowDataPacket[]>("SELECT GET_LOCK('lb-codebase-migrations', 30) AS acquired");
    if (Number(locks[0]?.acquired) !== 1) throw new Error('Could not acquire the MariaDB migration lock.');
    lockHeld = true;
    const files = (await fs.readdir(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort();
    for (const name of files) {
      const migrationSql = await fs.readFile(path.join(migrationsDirectory, name), 'utf8');
      const checksum = crypto.createHash('sha256').update(migrationSql).digest('hex');
      const [rows] = await connection.execute<ChecksumRow[]>('SELECT checksum FROM _app_migrations WHERE name = ?', [name]);
      if (rows.length) {
        if (rows[0].checksum !== checksum) throw new Error(`Applied migration ${name} has changed.`);
        continue;
      }
      await connection.query(migrationSql);
      await connection.execute('INSERT INTO _app_migrations (name, checksum) VALUES (?, ?)', [name, checksum]);
      process.stdout.write(`Applied ${name}\n`);
    }
  } finally {
    if (lockHeld) await connection.execute("SELECT RELEASE_LOCK('lb-codebase-migrations')").catch(() => undefined);
    await connection.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrate().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
