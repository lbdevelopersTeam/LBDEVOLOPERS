// Hostinger's Express preset requires a JavaScript entry present in Git.
// Installation builds the existing TypeScript backend; startup only loads it.
import { existsSync } from 'node:fs';

const backend = new URL('./dist/server.mjs', import.meta.url);
if (!existsSync(backend)) {
  console.error('[deployment] Backend build is missing. Run npm run build:node, or reinstall with NODE_ENV=production and VITE_PUBLIC_API_ENABLED=true.');
  process.exitCode = 1;
} else {
  await import(backend.href);
}
