import { Kysely, MysqlDialect } from 'kysely';
import { createPool, type Pool, type PoolOptions } from 'mysql2';
import type { MysqlDatabase } from './types';

export interface MysqlDatabaseConfig {
  url: string;
  poolMax: number;
  ssl: boolean;
}

export function mysqlConfigFromEnv(): MysqlDatabaseConfig | null {
  const url = process.env.MYSQL_DATABASE_URL?.trim();
  if (!url) return null;
  return {
    url,
    poolMax: Math.max(1, Math.min(30, Number(process.env.MYSQL_POOL_MAX || 10))),
    ssl: process.env.MYSQL_SSL === 'true',
  };
}

export function mysqlPoolOptions(config: MysqlDatabaseConfig): PoolOptions {
  const parsed = new URL(config.url);
  if (!['mysql:', 'mysql2:'].includes(parsed.protocol)) {
    throw new Error('MYSQL_DATABASE_URL must use the mysql:// scheme.');
  }
  const database = parsed.pathname.replace(/^\//, '');
  if (!parsed.hostname || !database) throw new Error('MYSQL_DATABASE_URL must include a host and database name.');
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(database),
    charset: 'utf8mb4',
    timezone: 'Z',
    connectionLimit: config.poolMax,
    maxIdle: config.poolMax,
    idleTimeout: 30_000,
    connectTimeout: 8_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements: false,
    ssl: config.ssl ? { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
  };
}

export function createMysqlPool(config: MysqlDatabaseConfig): Pool {
  const pool = createPool(mysqlPoolOptions(config));
  pool.on('connection', (connection) => {
    connection.query("SET SESSION time_zone = '+00:00'");
  });
  return pool;
}

export function createMysqlDatabase(config: MysqlDatabaseConfig): Kysely<MysqlDatabase> {
  return new Kysely<MysqlDatabase>({
    dialect: new MysqlDialect({ pool: createMysqlPool(config) }),
  });
}
