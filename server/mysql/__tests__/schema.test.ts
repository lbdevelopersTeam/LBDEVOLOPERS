import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { mysqlPoolOptions } from '../client';

describe('MySQL v3 schema artifacts', () => {
  it('uses an explicit MySQL 8 transactional and integrity model', async () => {
    const migration = await fs.readFile(path.resolve(process.cwd(), 'server/mysql/migrations/001_initial.sql'), 'utf8');
    expect(migration).toContain('ENGINE=InnoDB');
    expect(migration).toContain('utf8mb4_0900_ai_ci');
    expect(migration).toContain('FOREIGN KEY');
    expect(migration).toContain('CHECK (version > 0)');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS idempotency_keys');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS audit_logs');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS outbox_events');
    expect(migration).not.toMatch(/\bSERIAL\b|timestamptz|jsonb|CREATE SCHEMA/i);
  });

  it('parses runtime connection configuration without enabling multi-statements', () => {
    const options = mysqlPoolOptions({ url: 'mysql://runtime:secret@127.0.0.1:3307/lb_v3', poolMax: 12, ssl: false });
    expect(options).toMatchObject({ host: '127.0.0.1', port: 3307, user: 'runtime', database: 'lb_v3', connectionLimit: 12, timezone: 'Z', multipleStatements: false });
  });
});
