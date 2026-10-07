import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.TECH_PREVIEW_URL || 'http://127.0.0.1:4180';
const dev = process.env.TECH_DEV_URL || 'http://127.0.0.1:4175';
const output = 'artifacts/tech-page';
await mkdir(output, { recursive: true });
const expected = {
  'React 18+': ['react'], 'Next.js 14': ['nextjs'], 'Tailwind CSS': ['tailwindcss'], 'Framer Motion': ['motion'],
  'Node.js / Bun': ['nodejs', 'bun'], PostgreSQL: ['postgresql'], Redis: ['redis'], 'Docker / K8s': ['docker', 'kubernetes'],
  AWS: ['aws'], Vercel: ['vercel'], Supabase: ['supabase'], Cloudflare: ['cloudflare'],
  'React Native': ['react'], 'Swift / Kotlin': ['swift', 'kotlin'], 'Pinecone / Vector': ['pinecone'], 'OpenAI / Gemini': ['openai-mark', 'gemini'],
  PHP: ['php'], Laravel: ['laravel'], MySQL: ['mysql'], WordPress: ['wordpress'],
};
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const records = [];
const captureStyle = '[data-capture-chrome]{visibility:hidden!important}';
try {
  for (const width of [1440, 768, 390, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/tech`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'PHP Systems', exact: true }).waitFor();
    // Section captures need immediate scrolling; the site's smooth scrolling
    // otherwise moves the viewport while Playwright calculates its clip.
    await page.addStyleTag({ content: 'html,body{scroll-behavior:auto!important}' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.tech-card img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    const result = await page.evaluate(() => {
      const content = document.querySelector('.tech-content');
      const first = content.querySelector('.tech-layer');
      return {
        gap: first.getBoundingClientRect().top - content.previousElementSibling.getBoundingClientRect().bottom,
        overflow: document.documentElement.scrollWidth - innerWidth,
        cards: [...document.querySelectorAll('.tech-card')].map(card => ({
          name: card.querySelector('h3').textContent,
          logos: [...card.querySelectorAll('.tech-brand-badge img')].map(img => ({
            mark: img.getAttribute('src').replace('/logos/', '').replace('.svg', ''), loaded: img.complete && img.naturalWidth > 0,
            fit: getComputedStyle(img).objectFit, visible: getComputedStyle(img).opacity,
            decorative: img.getAttribute('aria-hidden') === 'true' && img.hasAttribute('alt'),
          })),
          watermarks: card.querySelectorAll('.tech-card-monogram').length,
          clippedText: [...card.querySelectorAll('h3,p,.tech-card-level')].some(el => el.scrollWidth > el.clientWidth + 1),
          bodySize: parseFloat(getComputedStyle(card.querySelector('p')).fontSize),
        })),
      };
    });
    assert.ok(result.gap >= 48, `Layer 01 clearance: ${result.gap}`);
    assert.equal(result.overflow, 0);
    assert.equal(result.cards.length, 20);
    for (const card of result.cards) {
      assert.deepEqual(card.logos.map(logo => logo.mark), expected[card.name], card.name);
      assert.equal(card.watermarks, card.logos.length);
      assert.equal(card.clippedText, false, card.name);
      assert.ok(card.bodySize >= 16);
      card.logos.forEach(logo => assert.ok(logo.loaded && logo.fit === 'contain' && logo.visible === '1' && logo.decorative));
    }
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        if (getComputedStyle(el).position === 'fixed') el.dataset.captureChrome = '';
      });
      const first = document.querySelector('.tech-layer');
      window.scrollTo(0, first.getBoundingClientRect().top + scrollY - 240);
    });
    await page.screenshot({ path: `${output}/clearance-${width}.png`, animations: 'disabled', style: captureStyle });
    for (let i = 0; i < 5; i++) {
      const section = page.locator('.tech-layer').nth(i);
      const box = await section.boundingBox();
      await page.setViewportSize({ width, height: Math.ceil(box.height) + 160 });
      await section.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }));
      await page.waitForFunction(index => Math.abs(document.querySelectorAll('.tech-layer')[index].getBoundingClientRect().top - 80) < 2, i);
      // Capture the viewport at a pinned semantic section boundary. Edge's
      // element clip can include stale scroll geometry after fixed UI changes.
      await page.screenshot({ path: `${output}/layer-${i + 1}-${width}.png`, animations: 'disabled', style: captureStyle });
    }
    await page.getByRole('button', { name: 'Consultancy', exact: true }).focus();
    assert.equal(await page.getByRole('button', { name: 'Consultancy', exact: true }).evaluate(el => el === document.activeElement), true);
    assert.deepEqual(errors, []);
    records.push({ width, ...result });
    await context.close();
    console.log(`PASS /tech ${width}px: 20 branded cards, combined tools, PHP, ${Math.round(result.gap)}px clearance, no overflow.`);
  }
  const cmsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const cms = await cmsContext.newPage();
  let requested = false;
  await cms.route('**/api/v2/technologies', route => {
    requested = true;
    return route.fulfill({ json: { items: [
      { id: 'cms-next', name: 'Next.js 15.2', category: 'Frontend Architecture', proficiency: 'CMS value', description: 'Keep the CMS description.' },
      { id: 'cms-custom', name: 'Internal custom tool', category: 'Frontend Architecture', proficiency: 'Custom', description: 'A readable custom tool without an invented brand.' },
    ] } });
  });
  await cms.goto(`${dev}/tech`, { waitUntil: 'domcontentloaded' });
  await cms.getByRole('heading', { name: 'Next.js 15.2', exact: true }).waitFor();
  assert.equal(requested, true);
  const next = cms.locator('.tech-card').filter({ has: cms.getByRole('heading', { name: 'Next.js 15.2', exact: true }) });
  assert.equal(await next.locator('.tech-brand-badge img').getAttribute('src'), '/logos/nextjs.svg');
  assert.equal(await next.locator('p').textContent(), 'Keep the CMS description.');
  assert.equal(await cms.getByRole('heading', { name: 'PHP Systems', exact: true }).count(), 1);
  assert.equal(await cms.getByRole('region', { name: 'PHP Systems', exact: true }).locator('.tech-card').count(), 4);
  const unknown = cms.locator('.tech-card').filter({ has: cms.getByRole('heading', { name: 'Internal custom tool', exact: true }) });
  assert.equal(await unknown.locator('.tech-brand-badge img').count(), 0);
  assert.equal(await unknown.locator('.tech-brand-badge svg').count(), 1);
  assert.equal(await cms.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
  console.log('PASS CMS technology overrides: versioned logo, original copy preserved, PHP retained, unknown tool not falsely branded.');
  const provenance = JSON.parse(await readFile('public/logos/sources.json', 'utf8'));
  for (const asset of provenance.assets) {
    const response = await cmsContext.request.get(`${base}/logos/${asset.name}.svg`);
    assert.equal(response.status(), 200, asset.name);
    const svg = await response.text();
    assert.ok(svg.includes('<svg') && !/<script|<foreignObject|\sonload=|\sonerror=/i.test(svg), asset.name);
  }
  await cmsContext.close();
  await writeFile(`${output}/report.json`, JSON.stringify({ base, browser: 'Microsoft Edge', reducedMotion: true, records, cmsOverride: 'passed', assets: provenance.assets.length }, null, 2));
} finally {
  await browser.close();
}
