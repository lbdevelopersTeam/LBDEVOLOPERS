import 'dotenv/config';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import { mysqlConfigFromEnv, mysqlPoolOptions } from './client';

const migrationsDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
const migrationLock = 'lb-developers-mysql-v3-migrations';
interface MigrationLockRow extends RowDataPacket { acquired: number }
interface MigrationChecksumRow extends RowDataPacket { checksum: string }

export async function migrateMysql(connectionUrl = process.env.MYSQL_MIGRATION_URL || process.env.MYSQL_DATABASE_URL): Promise<void> {
  if (!connectionUrl) throw new Error('MYSQL_MIGRATION_URL or MYSQL_DATABASE_URL is required to run MySQL migrations.');
  const baseConfig = mysqlConfigFromEnv();
  const config = {
    url: connectionUrl,
    poolMax: baseConfig?.poolMax || 2,
    ssl: process.env.MYSQL_SSL === 'true',
  };
  const {
    connectionLimit: _connectionLimit,
    maxIdle: _maxIdle,
    idleTimeout: _idleTimeout,
    ...connectionOptions
  } = mysqlPoolOptions(config);
  const connection = await createConnection({ ...connectionOptions, multipleStatements: true });
  let lockHeld = false;
  try {
    await connection.query("SET SESSION time_zone = '+00:00'");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _app_migrations (
        name VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (name)
      ) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    const [lockRows] = await connection.execute<MigrationLockRow[]>('SELECT GET_LOCK(?, 30) AS acquired', [migrationLock]);
    if (lockRows[0]?.acquired !== 1) throw new Error('Could not acquire the MySQL migration lock within 30 seconds.');
    lockHeld = true;

    const files = (await fs.readdir(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort();
    for (const name of files) {
      const migrationSql = await fs.readFile(path.join(migrationsDirectory, name), 'utf8');
      const checksum = crypto.createHash('sha256').update(migrationSql).digest('hex');
      const [rows] = await connection.execute<MigrationChecksumRow[]>('SELECT checksum FROM _app_migrations WHERE name = ?', [name]);
      if (rows.length) {
        if (rows[0].checksum !== checksum) throw new Error(`Applied MySQL migration ${name} has changed.`);
        continue;
      }

      // MySQL DDL implicitly commits. Migrations are forward-only, idempotent, and
      // protected by the advisory lock; recovery uses a backup or forward repair.
      await connection.query(migrationSql);
      await connection.execute('INSERT INTO _app_migrations (name, checksum) VALUES (?, ?)', [name, checksum]);
      process.stdout.write(`Applied MySQL migration ${name}\n`);
    }
  } finally {
    if (lockHeld) await connection.execute('SELECT RELEASE_LOCK(?)', [migrationLock]).catch(() => undefined);
    await connection.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrateMysql().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
