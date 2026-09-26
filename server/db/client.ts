import { Kysely, MysqlDialect } from 'kysely';
import { createPool, type PoolOptions } from 'mysql2';
import type { Database } from './types';

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  poolMax: number;
}

export function databaseConfigFromEnv(): DatabaseConfig | null {
  const url = (process.env.DATABASE_URL || '').trim();
  if (!url) return null;
  if (!/^mysql2?:\/\//i.test(url)) throw new Error('DATABASE_URL must use the mysql:// scheme.');
  return {
    url,
    ssl: process.env.DATABASE_SSL === 'true',
    poolMax: Math.max(1, Math.min(30, Number(process.env.DB_POOL_MAX || 10))),
  };
}

export function databasePoolOptions(config: DatabaseConfig): PoolOptions {
  const parsed = new URL(config.url);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!parsed.hostname || !database) throw new Error('DATABASE_URL must include a host and database name.');
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: ['DATE'],
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectionLimit: config.poolMax,
    maxIdle: config.poolMax,
    idleTimeout: 30_000,
    connectTimeout: 8_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements: false,
    ssl: config.ssl ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
    typeCast(field, next) {
      if (field.type === 'TINY' && field.length === 1) return field.string() === '1';
      return next();
    },
  };
}

export function createDatabase(config: DatabaseConfig): Kysely<Database> {
  const pool = createPool(databasePoolOptions(config));
  pool.on('connection', (connection) => connection.query("SET SESSION time_zone = '+00:00'"));
  return new Kysely<Database>({ dialect: new MysqlDialect({ pool }) });
}
