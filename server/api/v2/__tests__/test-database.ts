import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import {
  Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler,
  type CompiledQuery, type DatabaseConnection, type Dialect, type Driver, type QueryResult, type TransactionSettings,
} from 'kysely';
import type { Database } from '../../../db/types';

class PGliteConnection implements DatabaseConnection {
  constructor(private readonly client: PGlite) {}
  async executeQuery<R>(query: CompiledQuery): Promise<QueryResult<R>> {
    const result = await this.client.query<R>(query.sql, [...query.parameters]);
    return { rows: result.rows, numAffectedRows: result.affectedRows === undefined ? undefined : BigInt(result.affectedRows) };
  }
  async *streamQuery<R>(query: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
    yield await this.executeQuery<R>(query);
  }
}

class PGliteDriver implements Driver {
  private readonly connection: PGliteConnection;
  constructor(private readonly client: PGlite) { this.connection = new PGliteConnection(client); }
  async init() {}
  async acquireConnection() { return this.connection; }
  async beginTransaction(_connection: DatabaseConnection, settings: TransactionSettings) { await this.client.exec(`BEGIN${settings.isolationLevel ? ` ISOLATION LEVEL ${settings.isolationLevel.toUpperCase()}` : ''}`); }
  async commitTransaction() { await this.client.exec('COMMIT'); }
  async rollbackTransaction() { await this.client.exec('ROLLBACK'); }
  async releaseConnection() {}
  async destroy() { await this.client.close(); }
}

class PGliteDialect implements Dialect {
  constructor(private readonly client: PGlite) {}
  createDriver() { return new PGliteDriver(this.client); }
  createQueryCompiler() { return new PostgresQueryCompiler(); }
  createAdapter() { return new PostgresAdapter(); }
  createIntrospector(db: Kysely<unknown>) { return new PostgresIntrospector(db); }
}

export async function createTestDatabase() {
  const client = new PGlite();
  await client.waitReady;
  const migrationsDirectory = path.resolve(process.cwd(), 'server/db/migrations');
  const migrations = (await fs.readdir(migrationsDirectory)).filter((name) => name.endsWith('.sql')).sort();
  for (const migration of migrations) {
    await client.exec(await fs.readFile(path.join(migrationsDirectory, migration), 'utf8'));
  }
  await client.exec('SET search_path TO app, pg_catalog');
  const db = new Kysely<Database>({ dialect: new PGliteDialect(client) });
  return { db, close: async () => { await db.destroy(); } };
}
