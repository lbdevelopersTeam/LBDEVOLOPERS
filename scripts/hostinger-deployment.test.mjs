import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturesRoot = path.join(root, 'artifacts', 'hostinger-tests');
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

async function fixture(t) {
  await mkdir(fixturesRoot, { recursive: true });
  const directory = await mkdtemp(path.join(fixturesRoot, 'entry-'));
  // Cleanup is restricted to this test's newly-created fixture directory.
  assert.equal(path.dirname(path.resolve(directory)), path.resolve(fixturesRoot));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await copyFile(path.join(root, 'server.js'), path.join(directory, 'server.js'));
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ type: 'module' }));
  return directory;
}

test('Hostinger has a real JavaScript entry that starts the generated backend', async t => {
  const directory = await fixture(t);
  await mkdir(path.join(directory, 'dist'));
  await writeFile(path.join(directory, 'dist', 'server.mjs'), "console.log('BACKEND_STARTED');\n");
  const result = spawnSync(process.execPath, ['server.js'], { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /BACKEND_STARTED/);
});

test('missing backend bundle fails with an actionable build instruction', async t => {
  const directory = await fixture(t);
  const result = spawnSync(process.execPath, ['server.js'], { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /npm run build:node/);
});

test('Hostinger CommonJS loader can require the entry and start an async ESM backend', async t => {
  const directory = await fixture(t);
  await mkdir(path.join(directory, 'dist'));
  await writeFile(path.join(directory, 'dist', 'server.mjs'), "await Promise.resolve(); console.log('ASYNC_BACKEND_STARTED');\n");
  const result = spawnSync(process.execPath, ['--input-type=commonjs', '-e', "require('./server.js')"], { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ASYNC_BACKEND_STARTED/);
});

test('Hostinger loader gets a clear failure if the async backend import rejects', async t => {
  const directory = await fixture(t);
  await mkdir(path.join(directory, 'dist'));
  await writeFile(path.join(directory, 'dist', 'server.mjs'), "throw new Error('TEST_BACKEND_IMPORT_FAILURE');\n");
  const result = spawnSync(process.execPath, ['--input-type=commonjs', '-e', "require('./server.js')"], { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /TEST_BACKEND_IMPORT_FAILURE/);
  assert.doesNotMatch(result.stderr, /ERR_REQUIRE_ASYNC_MODULE/);
});

test('install/start scripts and production build dependency are available', async () => {
  assert.equal(manifest.scripts.postinstall, 'node scripts/hostinger-postinstall.mjs');
  assert.equal(manifest.scripts.start, 'node server.js');
  assert.ok(manifest.dependencies.esbuild, 'Production-only npm installs need the server bundler');
  assert.equal(manifest.devDependencies.esbuild, undefined);
  // The original static frontend build remains unchanged.
  assert.equal(manifest.scripts.build, 'vite build --configLoader runner --outDir dist');
});

test('locked security updates meet patched version floors, including nested copies', async () => {
  const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
  const floors = { compression: '1.8.2', dompurify: '3.4.16', sharp: '0.35.5', 'proxy-addr': '2.0.8', 'ip-address': '10.7.1', 'source-map-js': '1.2.2' };
  for (const [name, floor] of Object.entries(floors)) {
    const copies = Object.entries(lock.packages).filter(([location]) => location.endsWith(`/node_modules/${name}`) || location === `node_modules/${name}`);
    assert.ok(copies.length, `${name} must be present in the lockfile`);
    for (const [location, pkg] of copies) {
      const current = pkg.version.split('.').map(Number);
      const minimum = floor.split('.').map(Number);
      const comparison = current[0] - minimum[0] || current[1] - minimum[1] || current[2] - minimum[2];
      assert.ok(comparison >= 0, `${location}: ${pkg.version} is below patched version ${floor}`);
    }
  }
});

test('local and static frontend installs do not trigger a backend build', async () => {
  const { runHostingerBuild } = await import('./hostinger-postinstall.mjs');
  for (const env of [{}, { NODE_ENV: 'development', VITE_PUBLIC_API_ENABLED: 'true' }, { NODE_ENV: 'production' }, { NODE_ENV: 'production', VITE_PUBLIC_API_ENABLED: 'false' }]) {
    let calls = 0;
    const status = runHostingerBuild({ env, projectRoot: root, run: () => { calls++; return { status: 0 }; }, log: () => {} });
    assert.equal(status, 0);
    assert.equal(calls, 0);
  }
});

test('production backend install builds public assets then the server without database access', async () => {
  const { runHostingerBuild } = await import('./hostinger-postinstall.mjs');
  const calls = [];
  // Build processes are expensive; this unit seam records the process contract.
  // A separate real build/smoke check exercises the installed tools and bundle.
  const status = runHostingerBuild({
    env: { NODE_ENV: 'production', VITE_PUBLIC_API_ENABLED: 'true' }, projectRoot: root,
    run: (command, args, options) => { calls.push({ command, args, options }); return { status: 0 }; }, log: () => {},
  });
  assert.equal(status, 0);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].command, process.execPath);
  assert.deepEqual(calls[0].args.slice(1), ['build', '--configLoader', 'runner', '--outDir', 'dist/public']);
  assert.equal(calls[1].args[0], path.join(root, 'scripts', 'build-server.mjs'));
  for (const call of calls) {
    assert.equal(call.options.cwd, root);
    assert.equal(call.options.shell, false);
    assert.equal(call.options.env.DATABASE_URL, undefined);
  }
});

test('a failed asset build aborts installation before bundling the backend', async () => {
  const { runHostingerBuild } = await import('./hostinger-postinstall.mjs');
  let calls = 0;
  const status = runHostingerBuild({ env: { NODE_ENV: 'production', VITE_PUBLIC_API_ENABLED: 'true' }, projectRoot: root, run: () => { calls++; return { status: 7 }; }, log: () => {} });
  assert.equal(status, 7);
  assert.equal(calls, 1);
});

test('a failed server build also fails installation', async () => {
  const { runHostingerBuild } = await import('./hostinger-postinstall.mjs');
  let calls = 0;
  const status = runHostingerBuild({ env: { NODE_ENV: 'production', VITE_PUBLIC_API_ENABLED: 'true' }, projectRoot: root, run: () => ({ status: ++calls === 1 ? 0 : 8 }), log: () => {} });
  assert.equal(status, 8);
  assert.equal(calls, 2);
});

test('a process launch failure cannot be reported as a successful build', async () => {
  const { runHostingerBuild } = await import('./hostinger-postinstall.mjs');
  const status = runHostingerBuild({ env: { NODE_ENV: 'production', VITE_PUBLIC_API_ENABLED: 'true' }, projectRoot: root, run: () => ({ status: null, error: new Error('tool missing') }), log: () => {} });
  assert.equal(status, 1);
});
