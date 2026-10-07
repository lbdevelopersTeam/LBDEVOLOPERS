import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function runHostingerBuild({ env = process.env, projectRoot: directory = projectRoot, run = spawnSync, log = console.log } = {}) {
  // Do not change ordinary local installs or static-only Vite deployments.
  if (env.NODE_ENV !== 'production' || env.VITE_PUBLIC_API_ENABLED !== 'true') {
    log('[deployment] Skipping automatic backend build (production backend flags are not enabled).');
    return 0;
  }

  log('[deployment] Building assets and backend for the Hostinger Express entry.');
  const commands = [
    [path.join(directory, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--configLoader', 'runner', '--outDir', 'dist/public'],
    [path.join(directory, 'scripts', 'build-server.mjs')],
  ];
  for (const args of commands) {
    const result = run(process.execPath, args, { cwd: directory, env, stdio: 'inherit', shell: false });
    if (result.error || result.status !== 0) {
      log('[deployment] Build failed. Check the build output above; installation will not publish an incomplete backend.');
      return Number.isInteger(result.status) && result.status > 0 ? result.status : 1;
    }
  }
  log('[deployment] Ready: server.js loads dist/server.mjs. No database setup or seeding was performed.');
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Some hosts stage a .env file instead of exporting every variable to npm.
  // Never override actual host environment variables or print secret values.
  dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });
  process.exitCode = runHostingerBuild();
}
