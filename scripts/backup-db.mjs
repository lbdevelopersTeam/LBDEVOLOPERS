import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const directory = path.resolve(process.env.BACKUP_DIRECTORY || 'backups');
await mkdir(directory, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = path.join(directory, `lb-developers-${timestamp}.dump`);
const child = spawn('pg_dump', ['--format=custom', '--no-owner', '--no-privileges', '--file', target, process.env.DATABASE_URL], { stdio: 'inherit', shell: false });
child.on('error', (error) => { process.stderr.write(`Unable to start pg_dump: ${error.message}\n`); process.exitCode = 1; });
child.on('exit', (code) => { if (code === 0) process.stdout.write(`Backup written to ${target}\n`); else process.exitCode = code || 1; });
