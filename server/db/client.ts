import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './types';

const { Pool } = pg;

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  poolMax: number;
}

export function databaseConfigFromEnv(): DatabaseConfig | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  return {
    url,
    ssl: process.env.DATABASE_SSL === 'true',
    poolMax: Math.max(1, Math.min(30, Number(process.env.DB_POOL_MAX || 10))),
  };
}

export function createDatabase(config: DatabaseConfig): Kysely<Database> {
  const pool = new Pool({
    connectionString: config.url,
    max: config.poolMax,
    ssl: config.ssl ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
    application_name: 'lb-developers-api',
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 30_000,
    options: '-c search_path=app,pg_catalog -c statement_timeout=15000',
  });

  pool.on('error', (error) => {
    process.stderr.write(`${JSON.stringify({ level: 'error', event: 'postgres_pool_error', message: error.message })}\n`);
  });

  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}
