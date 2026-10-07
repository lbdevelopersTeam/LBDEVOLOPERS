import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4175';
const output = 'artifacts/brand-logos';
await mkdir(output, { recursive: true });
const sources = JSON.parse(await readFile('public/logos/sources.json', 'utf8'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const records = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/', '/services', '/tech']) {
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
      await page.locator('h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const sections = route === '/' ? ['.studio-platforms', '#technology-partners'] : route === '/services' ? ['.services-directory', '#specialist-builds', '#automation-ai'] : ['.space-y-16'];
      for (const selector of sections) {
        if (selector === '#technology-partners') {
          // The strip is mounted by IntersectionObserver only when visited.
          await page.locator('div[style*="min-height: 240px"]').scrollIntoViewIfNeeded();
        }
        const section = page.locator(selector).first();
        await section.waitFor();
        await section.scrollIntoViewIfNeeded();
        await section.locator('img.brand-logo').first().waitFor();
        await page.waitForFunction(selector => [...document.querySelector(selector).querySelectorAll('img.brand-logo')].every(img => img.complete && img.naturalWidth > 0), selector);
        const result = await section.evaluate(el => ({
          logos: [...el.querySelectorAll('img.brand-logo')].map(img => ({ src: img.getAttribute('src'), naturalWidth: img.naturalWidth, alt: img.alt, decorative: img.getAttribute('aria-hidden') === 'true', width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height, objectFit: getComputedStyle(img).objectFit })),
          fakeMonograms: [...el.querySelectorAll('.platform-card-monogram,.tech-card-monogram')].filter(node => node.tagName !== 'IMG').length,
          overflow: document.documentElement.scrollWidth - innerWidth,
        }));
        assert.equal(result.fakeMonograms, 0);
        assert.equal(result.overflow, 0);
        result.logos.forEach(logo => {
          assert.ok(logo.src.startsWith('/logos/') && logo.naturalWidth > 0);
          assert.equal(logo.objectFit, 'contain');
          assert.ok(logo.width > 0 && logo.height > 0);
          assert.ok(logo.alt || logo.decorative);
        });
        if (selector === '#technology-partners') {
          assert.equal(result.logos.length, 10);
          assert.equal(await section.locator('a').count(), 10);
          await section.getByRole('link', { name: 'Shopify', exact: true }).focus();
          assert.equal(await section.getByRole('link', { name: 'Shopify', exact: true }).getAttribute('href'), 'https://www.shopify.com/');
        }
        // Fixed chrome is omitted only in section screenshots, not assertions.
        await section.evaluate(el => {
          document.querySelectorAll('*').forEach(node => {
            if (getComputedStyle(node).position === 'fixed') node.dataset.captureChrome = '';
          });
        });
        await section.screenshot({ path: `${output}/${route === '/' ? 'home' : route.slice(1)}-${selector.replace(/[^a-z0-9]/gi, '')}-${width}.png`, animations: 'disabled', style: '[data-capture-chrome]{visibility:hidden!important}' });
        records.push({ route, selector, width, ...result });
      }
      assert.deepEqual(errors, []);
      console.log(`PASS original logo surfaces: ${route} ${width}px`);
    }
    for (const asset of sources.assets) {
      const response = await context.request.get(`${base}/logos/${asset.name}.svg`);
      assert.equal(response.status(), 200);
      const svg = await response.text();
      assert.ok(svg.includes('<svg') && !/<script|<foreignObject/i.test(svg));
    }
    await context.close();
  }
  const moving = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await moving.goto(base, { waitUntil: 'domcontentloaded' });
  await moving.locator('div[style*="min-height: 240px"]').scrollIntoViewIfNeeded();
  const strip = moving.locator('#technology-partners');
  await strip.waitFor();
  await strip.scrollIntoViewIfNeeded();
  await strip.getByRole('link', { name: 'Shopify', exact: true }).focus();
  assert.equal(await strip.locator('.home-marquee-track').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
  assert.equal(await strip.locator('[inert]').count(), 1, 'duplicate logos excluded from keyboard/accessibility flow');
  await moving.close();
  await writeFile(`${output}/report.json`, JSON.stringify({ base, records, localAssets: sources.assets.length, checks: 'Desktop/mobile loads, no initials, local asset availability, contained proportions, labels, keyboard link and pause.' }, null, 2));
} finally {
  await browser.close();
}
