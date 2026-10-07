import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4175';
const output = 'artifacts/ui-ux-audit';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const records = [];
try {
  for (const width of [1440, 1024, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [route, section, cards, label] of [
      ['/about', '.studio-journey', '.studio-journey-card', 'journey'],
      ['/services', '.services-process', '.services-process-card', 'process'],
    ]) {
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
      await page.locator(cards).first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.locator(section).scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      const geometry = await page.locator(section).evaluate((el, selector) => {
        const bounds = node => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
        };
        const luminance = rgb => rgb.map(value => {
          const normalized = value / 255;
          return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
        }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
        const color = value => (value.match(/[\d.]+/g) || []).map(Number);
        const contrast = node => {
          const chain = [];
          for (let parent = node; parent; parent = parent.parentElement) chain.unshift(parent);
          const background = chain.reduce((under, parent) => {
            const rgba = color(getComputedStyle(parent).backgroundColor);
            const alpha = rgba[3] ?? 1;
            return under.map((channel, index) => rgba[index] * alpha + channel * (1 - alpha));
          }, [0, 0, 0]);
          const foreground = color(getComputedStyle(node).color);
          const values = [luminance(foreground.slice(0, 3)), luminance(background)].sort((a, b) => a - b);
          return (values[1] + .05) / (values[0] + .05);
        };
        const textChecks = [...el.querySelectorAll(selector)].flatMap(card => {
          const container = bounds(card);
          return [...card.querySelectorAll('h3,p,strong,.studio-journey-year,.services-process-number,.services-process-output > span')].map(node => {
            const rect = bounds(node);
            return {
              text: node.textContent, contrast: contrast(node),
              fits: rect.x >= container.x && rect.right <= container.right && rect.y >= container.y && rect.bottom <= container.bottom,
              overflow: node.scrollWidth - node.clientWidth,
            };
          });
        });
        return {
          section: bounds(el),
          cards: [...el.querySelectorAll(selector)].map(bounds),
          headings: [...el.querySelectorAll('h3')].map(node => node.textContent),
          dots: [...el.querySelectorAll('.studio-journey-dot')].map(bounds),
          connectors: el.querySelectorAll('.services-process-connector').length,
          overflow: document.documentElement.scrollWidth - innerWidth,
          gradients: [...el.querySelectorAll('*')].filter(node => ['', '::before', '::after'].some(p => getComputedStyle(node, p || null).backgroundImage.includes('gradient'))).length,
          textChecks,
        };
      }, cards);
      assert.equal(geometry.cards.length, 4);
      assert.equal(geometry.overflow, 0, `${label}: horizontal overflow at ${width}`);
      assert.equal(geometry.gradients, 0);
      geometry.textChecks.forEach(text => {
        assert.ok(text.fits && text.overflow <= 1, `Readable text must fit: ${text.text}`);
        assert.ok(text.contrast >= 4.5, `Text contrast must meet 4.5:1: ${text.text} (${text.contrast})`);
      });
      if (label === 'journey') {
        assert.deepEqual(geometry.headings, ['The foundation', 'The system grows', 'More useful work', 'The next chapter']);
        const lineX = geometry.dots[0].x + geometry.dots[0].width / 2;
        geometry.dots.forEach(dot => assert.ok(Math.abs(dot.x + dot.width / 2 - lineX) < 1));
        geometry.cards.forEach((card, index) => {
          assert.ok(Math.abs(card.y + card.height / 2 - (geometry.dots[index].y + 7)) < 1, 'Timeline node must align with its card');
          if (width >= 900 && index % 2 === 0) assert.ok(card.right < lineX, 'Odd milestone must be left');
          else assert.ok(card.x > lineX, 'Even/mobile milestone must be right');
        });
      } else {
        assert.deepEqual(geometry.headings, ['Frame', 'Shape', 'Build', 'Improve']);
        assert.equal(geometry.connectors, 3);
        geometry.cards.slice(1).forEach((card, index) => {
          const previous = geometry.cards[index];
          if (width >= 1024) {
            assert.ok(card.x > previous.right && card.y < previous.y, 'Desktop stages must ascend forwards');
          } else assert.ok(card.y > previous.bottom, 'Mobile stages must flow downwards');
        });
      }
      assert.deepEqual(errors, []);
      // Clip directly: entrance animations elsewhere on the long page can keep
      // Playwright's element-stability gate waiting despite reduced-motion CSS.
      await page.evaluate(selector => {
        const target = document.querySelector(selector);
        window.scrollTo(0, target.getBoundingClientRect().top + scrollY);
        // Section-only evidence omits fixed navigation/chat chrome, which a
        // full-page screenshot otherwise repeats over the clipped section.
        document.querySelectorAll('*').forEach(node => {
          if (getComputedStyle(node).position === 'fixed') node.dataset.captureChrome = '';
        });
      }, section);
      await page.screenshot({ path: `${output}/${label}-${width}.png`, fullPage: true, clip: {
        x: Math.max(0, geometry.section.x), y: await page.locator(section).evaluate(el => el.getBoundingClientRect().top + scrollY),
        width: Math.min(width, geometry.section.width), height: geometry.section.height,
      }, style: '[data-capture-chrome] { visibility: hidden !important; }', animations: 'disabled', timeout: 60000 });
      records.push({ route, width, ...geometry });
      console.log(`PASS ${label}: ${width}px`);
    }
    await page.close();
  }
  await writeFile(`${output}/connected-sections.json`, JSON.stringify(records, null, 2));
} finally {
  await browser.close();
}
