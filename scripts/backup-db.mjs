import 'dotenv/config';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

async function resolvePgDump() {
  if (process.env.PG_DUMP_PATH) return process.env.PG_DUMP_PATH;
  if (process.platform !== 'win32') return 'pg_dump';

  const postgresRoot = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PostgreSQL');
  try {
    const versions = (await readdir(postgresRoot)).sort((left, right) =>
      right.localeCompare(left, undefined, { numeric: true }),
    );
    for (const version of versions) {
      const executable = path.join(postgresRoot, version, 'bin', 'pg_dump.exe');
      if (existsSync(executable)) return executable;
    }
  } catch {
    // Fall through to PATH so the resulting error includes the missing command.
  }
  return 'pg_dump';
}

const connectionString = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_MIGRATION_URL or DATABASE_URL is required.');
const directory = path.resolve(process.env.BACKUP_DIRECTORY || 'backups');
await mkdir(directory, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = path.join(directory, `lb-developers-${timestamp}.dump`);
const pgDump = await resolvePgDump();
const child = spawn(pgDump, ['--format=custom', '--no-owner', '--no-privileges', '--file', target, connectionString], { stdio: 'inherit', shell: false });
child.on('error', (error) => { process.stderr.write(`Unable to start pg_dump: ${error.message}\n`); process.exitCode = 1; });
child.on('exit', (code) => { if (code === 0) process.stdout.write(`Backup written to ${target}\n`); else process.exitCode = code || 1; });
