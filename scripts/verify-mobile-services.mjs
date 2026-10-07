import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4175';
const output = 'artifacts/mobile-services';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const records = [];
try {
  for (const width of [320, 375, 390, 640, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/services`, { waitUntil: 'domcontentloaded' });
    await page.locator('.services-directory-card').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'html,body { scroll-behavior: auto !important; }' });
    // Exercise real intersection-based entrance animations before measuring.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let top = 0; top < height; top += 650) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top);
      await page.waitForTimeout(35);
    }
    await page.waitForTimeout(1400);
    // A rapid sweep can leave lazy media unloaded until an animated card is
    // actually visible. Visit every image as a user would before asserting it.
    for (const img of await page.locator('[id^="service-detail-"] img').all()) {
      await img.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForFunction(el => el.complete && el.naturalWidth > 0, await img.elementHandle());
    }
    const result = await page.evaluate(() => {
      const box = el => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width };
      };
      const nav = document.querySelector('nav[aria-label="Footer navigation"]');
      const support = document.querySelector('nav[aria-label="Footer support"]');
      const selectors = '.services-directory-card,[id^="service-detail-"],.capability-card,.services-process-card,.services-fit-table > div,.services-investment .grid > div,.estimate-addons button,.project-estimate-panel,footer nav';
      const clipped = [];
      for (const card of document.querySelectorAll(selectors)) {
        const bounds = box(card);
        const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent.trim() || node.parentElement.closest('[aria-hidden="true"]')) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects()) {
            if (r.left < bounds.x - 2 || r.right > bounds.right + 2 || r.right > innerWidth + 2) {
              clipped.push({ text: node.textContent.trim(), left: r.left, right: r.right, card: bounds });
            }
          }
        }
      }
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth - innerWidth,
        directoryColumns: getComputedStyle(document.querySelector('.services-directory-grid')).gridTemplateColumns.split(' ').length,
        directoryCards: document.querySelectorAll('.services-directory-card').length,
        nav: box(nav), support: box(support), clipped,
        footerTargets: [...document.querySelectorAll('footer nav a')].map(el => el.getBoundingClientRect().height),
        brokenImages: [...document.images].filter(el => !el.complete || !el.naturalWidth).map(el => el.getAttribute('src')),
      };
    });
    assert.equal(result.overflow, 0, `Page overflow at ${width}px`);
    assert.equal(result.directoryCards, 7);
    assert.equal(result.directoryColumns, width < 640 ? 1 : width < 1024 ? 2 : 4);
    assert.ok(Math.abs(result.nav.y - result.support.y) < 1, 'Footer links must share a row');
    assert.ok(result.nav.right < result.support.x, 'Footer links must be separate columns');
    assert.ok(result.footerTargets.every(height => height >= 44), 'Footer links must be touch-friendly');
    assert.deepEqual(result.clipped, [], `Text clipped at ${width}px`);
    assert.deepEqual(result.brokenImages, [], `Images must load at ${width}px`);
    assert.deepEqual(errors, []);

    await page.getByRole('button', { name: /Premium UI\/UX Design/ }).click();
    await page.waitForTimeout(500);
    await assert.doesNotReject(() => page.locator('.project-estimate-panel').getByText('$280', { exact: true }).waitFor());
    const addon = page.getByRole('button', { name: /Premium UI\/UX Design/ });
    assert.equal(await addon.getAttribute('aria-pressed'), 'true');
    await addon.focus();
    await page.keyboard.press('Space');
    assert.equal(await addon.getAttribute('aria-pressed'), 'false');

    if ([390, 768, 1440].includes(width)) {
      for (const [selector, label] of [['.services-directory', 'directory'], ['.services-process', 'process'], ['#service-detail-6', 'service-detail'], ['#specialist-builds', 'specialist'], ['#automation-ai', 'automation'], ['.services-fit', 'fit'], ['.services-investment', 'investment'], ['.services-estimator', 'estimator'], ['footer', 'footer']]) {
        const target = page.locator(selector);
        const bounds = await target.boundingBox();
        await page.setViewportSize({ width, height: Math.ceil(bounds.height) + 160 });
        // A full-height hero changes its size when the capture viewport changes.
        // Wait for that reflow before computing the target's document position.
        await page.waitForTimeout(250);
        await page.evaluate(selector => {
          const el = document.querySelector(selector);
          scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' });
          document.querySelectorAll('*').forEach(node => {
            if (getComputedStyle(node).position === 'fixed') node.dataset.captureChrome = '';
          });
        }, selector);
        await page.waitForFunction(selector => {
          const top = document.querySelector(selector).getBoundingClientRect().top;
          return top >= 79 && top <= 162;
        }, selector);
        await page.screenshot({ path: `${output}/${label}-${width}.png`, animations: 'disabled', style: '[data-capture-chrome] { visibility: hidden !important; }' });
      }
    }
    // The estimate must remain usable and pass a brief into the inquiry page.
    await page.getByRole('button', { name: 'Discuss this estimate', exact: true }).click();
    await page.waitForURL('**/contact');
    await page.locator('textarea').waitFor();
    assert.match(await page.locator('textarea').inputValue(), /Project: Web Development/);
    assert.match(await page.locator('textarea').inputValue(), /Indicative estimate: \$200/);
    records.push(result);
    console.log(`PASS Services + two-column footer + estimate interaction: ${width}px`);
    await page.close();
  }
  await writeFile(`${output}/results.json`, JSON.stringify(records, null, 2));
} finally {
  await browser.close();
}
