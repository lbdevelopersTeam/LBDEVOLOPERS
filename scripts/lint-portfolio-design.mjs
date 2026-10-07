// Reuse the installed visual-runtime skill's checks with the local Edge browser.
import { readFile } from 'node:fs/promises';
const skillRoot = process.env.VISUAL_RUNTIME_ROOT || 'C:/Users/STAR/.codex/skills/.shared/visual-runtime';
let source = await readFile(`${skillRoot}/scripts/visual_lint.mjs`, 'utf8');
source = source.replace('#!/usr/bin/env node', '')
  .replace("from 'playwright'", `from '${import.meta.resolve('playwright')}'`)
  .replace('headless: true', "headless: true, channel: 'msedge'")
  // The shared checker mistakes rgb(0,0,0) for transparent because it ends in
  // ', 0)'. Preserve black backgrounds and allow valid decorative alt="".
  .replace("!color.endsWith(', 0)')", "color !== 'rgba(0, 0, 0, 0)'")
  .replace("!image.getAttribute('alt')", "!image.hasAttribute('alt')")
  .replace('const domFindings = await page.evaluate', "await page.locator('h1').waitFor({ state: 'attached', timeout: 20000 }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1300); const domFindings = await page.evaluate");
await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
