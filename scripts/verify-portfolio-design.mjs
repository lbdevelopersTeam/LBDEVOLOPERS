import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const out = 'artifacts/portfolio-design';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const routes = ['/', '/services', '/portfolio', '/about', '/tech', '/blog', '/contact', '/faq', '/careers', '/booking', '/planner', '/privacy', '/terms', '/portfolio/vogue-decor', '/team/wajid-hussain'];
const results = [];
try {
  for (const width of [1440, 390, 768]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of routes) {
      errors.length = 0;
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.locator('h1').waitFor({ state: 'attached' });
      await page.evaluate(() => document.fonts.ready);
      // Exercise lazy content and reveal states before measuring the entire page.
      for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 750) {
        await page.evaluate(y => window.scrollTo(0, y), y);
        await page.waitForTimeout(60);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1300);
      const state = await page.evaluate(() => ({
        title: document.querySelector('h1')?.textContent,
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.getAttribute('src')),
        videos: [...document.querySelectorAll('video')].map(v => ({ src: v.getAttribute('src') || v.querySelector('source')?.getAttribute('src'), ready: v.readyState, error: v.error?.message })),
        background: getComputedStyle(document.querySelector('.studio-site')).backgroundColor,
      }));
      results.push({ route, width, ...state, errors: [...errors] });
      if (width !== 768 && ['/', '/portfolio', '/services', '/tech', '/contact', '/about'].includes(route)) {
        await page.screenshot({ path: `${out}/${route === '/' ? 'home' : route.slice(1)}-${width}.png` });
      }
      if (route === '/portfolio') {
        await page.getByRole('button', { name: 'E-commerce', exact: true }).click();
        if (await page.getByRole('button', { name: 'E-commerce', exact: true }).getAttribute('aria-pressed') !== 'true') throw Error('Portfolio filter did not activate');
        const cards = await page.locator('.project-card').count();
        if (!cards) throw Error('Portfolio filter returned no commerce projects');
      }
      if (route === '/faq') {
        const faq = page.locator('button[aria-controls^="faq-answer-"]').first();
        await faq.click();
        if (await faq.getAttribute('aria-expanded') !== 'true') throw Error('FAQ did not open');
      }
      if (route === '/' && width === 390) {
        await page.getByRole('button', { name: 'Open navigation menu' }).click();
        await page.getByRole('dialog', { name: 'Mobile navigation' }).waitFor();
        await page.keyboard.press('Escape');
        await page.getByRole('dialog', { name: 'Mobile navigation' }).waitFor({ state: 'hidden' });
      }
    }
    await page.close();
  }
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ checked: results.length, issues: results.filter(r => r.overflow || r.brokenImages.length || r.errors.length) }, null, 2));
} finally { await browser.close(); }
