import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const connectionString = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_MIGRATION_URL or DATABASE_URL is required.');
const connection = new URL(connectionString);
if (!/^mysql:$/.test(connection.protocol)) throw new Error('DATABASE_URL must use the mysql:// scheme.');

const database = decodeURIComponent(connection.pathname.replace(/^\//, ''));
if (!database) throw new Error('DATABASE_URL must include a database name.');
const directory = path.resolve(process.env.BACKUP_DIRECTORY || 'backups');
await mkdir(directory, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = path.join(directory, `lb-codebase-${timestamp}.sql`);
const executable = process.env.MARIADB_DUMP_PATH || 'mariadb-dump';
const args = [
  `--host=${connection.hostname}`,
  `--port=${connection.port || '3306'}`,
  `--user=${decodeURIComponent(connection.username)}`,
  '--single-transaction', '--routines', '--events', '--triggers', '--hex-blob',
  `--result-file=${target}`,
  database,
];

const child = spawn(executable, args, {
  stdio: 'inherit', shell: false,
  env: { ...process.env, MYSQL_PWD: decodeURIComponent(connection.password) },
});
child.on('error', (error) => {
  process.stderr.write(`Unable to start ${executable}: ${error.message}. Install MariaDB client tools or set MARIADB_DUMP_PATH.\n`);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  if (code === 0) process.stdout.write(`Backup written to ${target}\n`);
  else process.exitCode = code || 1;
});
