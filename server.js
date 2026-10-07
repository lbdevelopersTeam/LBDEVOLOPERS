// Hostinger's Express preset requires a JavaScript entry present in Git.
// Installation builds the existing TypeScript backend; startup only loads it.
// LiteSpeed loads this entry with require(), so it must not use top-level await.
import { existsSync } from 'node:fs';

const backend = new URL('./dist/server.mjs', import.meta.url);
if (!existsSync(backend)) {
  console.error('[deployment] Backend build is missing. Run npm run build:node, or reinstall with NODE_ENV=production and VITE_PUBLIC_API_ENABLED=true.');
  process.exitCode = 1;
} else {
  import(backend.href).catch((error) => {
    console.error('[deployment] Backend failed to load.', error);
    process.exitCode = 1;
  });
}
