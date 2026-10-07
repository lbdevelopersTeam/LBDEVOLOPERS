import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4175';
const output = 'artifacts/ui-ux-audit';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const routes = ['/', '/about', '/services', '/portfolio', '/blog', '/contact', '/booking', '/planner', '/tech', '/faq', '/careers', '/privacy', '/terms', '/not-a-page', '/admin'];
const records = [];
const failures = [];

async function open(page, route) {
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  await page.locator('h1').waitFor({ state: 'attached', timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  // Wait for the existing navigation entrance transition, not network idle/videos.
  await page.waitForTimeout(1100);
}

async function measure(page) {
  return page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const publicSite = !!document.querySelector('.studio-site');
    const gradients = publicSite ? [...document.querySelectorAll('.studio-site *')].filter(visible).filter(el => ['','::before','::after'].some(p => getComputedStyle(el, p || null).backgroundImage.includes('gradient'))).map(el => el.className?.baseVal || el.className).slice(0, 10) : [];
    const unnamed = [...document.querySelectorAll('button, a')].filter(visible).filter(el => !(el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.querySelector('img[alt]'))).map(el => el.outerHTML.slice(0, 150));
    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent,
      overflow: document.documentElement.scrollWidth - innerWidth,
      nestedInteractive: document.querySelectorAll('a button, button a, a a, button button').length,
      sparkIcons: document.querySelectorAll('.lucide-sparkles,.lucide-zap').length,
      unnamed,
      gradients,
      brokenImages: [...document.images].filter(el => visible(el) && el.complete && el.currentSrc && el.naturalWidth === 0).map(el => el.currentSrc),
    };
  });
}

try {
  if (process.env.FLOWS_ONLY !== '1') {
    const discovery = await browser.newPage({ reducedMotion: 'reduce' });
    const hrefs = async (route, prefix) => {
      await open(discovery, route);
      return discovery.locator(`a[href^="${prefix}"]`).evaluateAll(es => [...new Set(es.map(el => el.getAttribute('href')))]);
    };
    const members = (await hrefs('/about', '/team/')).filter(href => href.split('/').length === 3).slice(0, 4);
    routes.push(...members);
    routes.push(...(await hrefs('/portfolio', '/portfolio/')).slice(0, 2));
    routes.push(...(await hrefs('/blog', '/blog/')).slice(0, 2));
    if (members[0]) routes.push(...(await hrefs(members[0], `${members[0]}/`)).slice(0, 3));
    await discovery.close();
  }
  // One viewport at a time keeps browser/media decoding within local resources.
  for (const width of (process.env.FLOWS_ONLY === '1' ? [] : [1440, 768, 390])) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of routes) {
      const errors = [];
      const listener = error => errors.push(error.message);
      page.on('pageerror', listener);
      try {
        await open(page, route);
        const result = await measure(page);
        const record = { route, width, ...result, errors };
        records.push(record);
        await page.screenshot({ path: `${output}/${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${width}.png` });
        assert.ok(result.overflow <= 1, `horizontal overflow ${result.overflow}`);
        assert.equal(result.nestedInteractive, 0, 'nested interactive controls');
        assert.equal(result.sparkIcons, 0, 'spark icons remain');
        assert.deepEqual(result.gradients, [], 'gradients remain');
        assert.deepEqual(result.unnamed, [], 'unnamed controls');
        assert.deepEqual(result.brokenImages, [], 'broken images');
        assert.deepEqual(errors, [], 'runtime errors');
        console.log(`PASS ${width} ${route}`);
      } catch (error) { failures.push({ route, width, error: error.message, runtimeErrors: errors }); await page.screenshot({ path: `${output}/failed-${route.slice(1).replaceAll('/', '-') || 'home'}-${width}.png` }); console.log(`FAIL ${width} ${route}: ${error.message}`); }
      finally { page.off('pageerror', listener); }
    }
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await open(page, '/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  await page.waitForTimeout(150);
  assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'menu receives focus');
  for (let i = 0; i < 15; i++) { await page.keyboard.press('Tab'); assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'menu traps keyboard focus'); }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Open navigation menu');
  assert.equal(await page.getByRole('button', { name: 'Open navigation menu' }).evaluate(el => el === document.activeElement), true, 'focus returns to menu trigger');
  assert.equal(await page.locator('main').evaluate(el => el.inert), false, 'background re-enabled');
  console.log('PASS mobile menu keyboard flow');

  await open(page, '/planner');
  for (const name of ['New Website Design', 'Visual Storytelling', 'Under $500']) await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('link', { name: 'Continue with this brief' }).click();
  await page.getByLabel('Message', { exact: true }).waitFor();
  assert.match(await page.getByLabel('Message', { exact: true }).inputValue(), /New Website Design[\s\S]*Visual Storytelling[\s\S]*Under \$500/);
  assert.equal(await page.getByLabel('Subject', { exact: true }).inputValue(), 'Project inquiry');
  console.log('PASS planner preserves brief');

  await open(page, '/faq');
  const question = page.locator('button[aria-expanded]').first();
  await question.click();
  assert.equal(await question.getAttribute('aria-expanded'), 'true');
  console.log('PASS FAQ expands');
  await context.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const detailPage = await desktop.newPage();
  for (const [route, selector, name] of [['/services', '.services-specialist', 'services-specialist'], ['/services', '.services-automation', 'services-automation'], ['/services', '.services-process', 'services-process'], ['/', '.studio-capability-cards', 'home-capabilities'], ['/contact', 'form', 'contact-form']]) {
    await open(detailPage, route);
    await detailPage.locator(selector).scrollIntoViewIfNeeded();
    await detailPage.waitForTimeout(700);
    await detailPage.screenshot({ path: `${output}/${name}-desktop.png` });
  }
  await open(detailPage, '/services');
  const hero = await detailPage.locator('.hero-background-media').evaluate(el => ({ bounds: el.getBoundingClientRect().toJSON(), section: el.parentElement.getBoundingClientRect().toJSON(), viewport: innerWidth, video: el.querySelector('video')?.currentSrc }));
  assert.ok(hero.section.height >= 900 && Math.abs(hero.bounds.width - hero.viewport) < 1 && hero.section.height - hero.bounds.height <= 1, 'edge-to-edge full-height hero (allow section border)');
  assert.ok(hero.video?.includes('other-pages-hero.mp4'), 'inner hero video loaded');
  await detailPage.screenshot({ path: `${output}/services-video-desktop.png` });
  await desktop.close();
  console.log('PASS full-bleed hero and section screenshots');
} catch (error) { failures.push({ flow: true, error: error.message }); console.error(error.message); }
finally {
  await writeFile(`${output}/report.json`, JSON.stringify({ base, generatedAt: new Date().toISOString(), records, failures }, null, 2));
  await browser.close();
}
console.log(`${records.length} route/viewport checks; ${failures.length} failures. Evidence: ${output}`);
if (failures.length) process.exitCode = 1;
