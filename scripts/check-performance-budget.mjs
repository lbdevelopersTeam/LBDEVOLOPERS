import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = path.resolve('dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const startupAssets = [...html.matchAll(/(?:src|href)="\/(assets\/[^"?]+\.(?:js|css))"/g)].map((match) => match[1]);
const startupJs = startupAssets.filter((asset) => asset.endsWith('.js'));
const startupCss = startupAssets.filter((asset) => asset.endsWith('.css'));
const gzipBytes = (assets) => assets.reduce((total, asset) => total + gzipSync(fs.readFileSync(path.join(dist, asset))).byteLength, 0);
const jsGzip = gzipBytes(startupJs);
const cssGzip = gzipBytes(startupCss);

const failures = [];
if (jsGzip > 150 * 1024) failures.push(`startup JavaScript is ${(jsGzip / 1024).toFixed(1)} KiB gzip (budget: 150 KiB)`);
if (cssGzip > 30 * 1024) failures.push(`startup CSS is ${(cssGzip / 1024).toFixed(1)} KiB gzip (budget: 30 KiB)`);
if (/Admin-|editor-vendor|table-vendor|RichTextEditor/i.test(html)) failures.push('admin/editor code is referenced by dist/index.html');

console.log(`Startup JS: ${(jsGzip / 1024).toFixed(1)} KiB gzip across ${startupJs.length} request(s)`);
console.log(`Startup CSS: ${(cssGzip / 1024).toFixed(1)} KiB gzip across ${startupCss.length} request(s)`);
console.log(`Initial assets: ${startupAssets.join(', ')}`);
if (failures.length) {
  for (const failure of failures) console.error(`Budget failure: ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Performance budgets passed.');
}
