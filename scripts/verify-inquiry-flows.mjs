import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const dev = process.env.INQUIRY_DEV_URL || 'http://127.0.0.1:4175';
const staticSite = process.env.INQUIRY_STATIC_URL || 'http://127.0.0.1:4180';
const output = 'artifacts/ui-ux-audit';
await mkdir(output, { recursive: true });
const results = [];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  let mode = 'validation';
  let requests = 0;
  let payload;
  // Synthetic requests never reach the user's backend or create real messages.
  await context.route('**/api/v2/messages', async route => {
    assert.equal(route.request().method(), 'POST');
    requests++;
    payload = route.request().postDataJSON();
    if (mode === 'network') return route.abort('failed');
    const status = mode === 'validation' ? 422 : mode === 'rate-limit' ? 429 : 201;
    const body = mode === 'validation' ? { success: false, error: { code: 'VALIDATION_ERROR', message: 'invalid', fields: { name: ['invalid'] } } } : mode === 'rate-limit' ? { success: false, error: { code: 'RATE_LIMIT', message: 'slow down' } } : mode === 'malformed' ? { id: 'test-message' } : { id: 'test-message', received: true };
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  const page = await context.newPage();
  await page.goto(`${dev}/contact`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Full Name', { exact: true }).fill(' Test Person ');
  await page.getByLabel('Email Address', { exact: true }).fill('test@example.test');
  await page.getByLabel('Subject', { exact: true }).selectOption('Project inquiry');
  const message = 'A synthetic test brief, not a real inquiry.';
  await page.getByLabel('Message', { exact: true }).fill(message);
  for (const [nextMode, notice] of [['validation', 'check your name'], ['rate-limit', 'wait a few minutes'], ['network', 'could not confirm delivery'], ['malformed', 'could not confirm delivery']]) {
    mode = nextMode;
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: notice }).waitFor();
    assert.equal(await page.getByLabel('Message', { exact: true }).inputValue(), message);
    assert.equal(await page.getByRole('button', { name: 'Send message', exact: true }).isEnabled(), true);
    results.push(`PASS contact ${mode}: readable error, retained message, re-enabled submit`);
  }
  mode = 'success';
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.getByRole('heading', { name: 'Message received' }).waitFor();
  assert.equal(payload.name, 'Test Person');
  assert.equal(payload.message, message);
  assert.equal(requests, 5, 'exactly one request per click; no automatic retries');
  results.push('PASS contact API acknowledgement');

  async function pickBooking(url) {
    await page.goto(`${url}/booking`, { waitUntil: 'domcontentloaded' });
    const dates = page.locator('button[aria-pressed]');
    await dates.first().click();
    await page.getByRole('button', { name: 'Choose a time' }).click();
    await page.getByRole('button', { name: '10:00 AM', exact: true }).click();
    await page.getByRole('button', { name: 'Add contact details' }).click();
    await page.getByLabel('Full name', { exact: true }).fill('Test Person');
    await page.getByLabel('Email address', { exact: true }).fill('test@example.test');
    await page.getByLabel('What should we prepare for?').fill(message);
  }
  await pickBooking(dev);
  await page.getByRole('button', { name: 'Request this time', exact: true }).click();
  await page.getByRole('heading', { name: 'Request received' }).waitFor();
  assert.match(payload.message, /10:00 AM Pakistan Standard Time/);
  assert.equal(requests, 6);
  results.push('PASS booking API request with timezone and unconfirmed-booking notice');

  await page.goto(`${staticSite}/contact`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Full Name', { exact: true }).fill('Test Person');
  await page.getByLabel('Email Address', { exact: true }).fill('test@example.test');
  await page.getByLabel('Subject', { exact: true }).selectOption('Project inquiry');
  await page.getByLabel('Message', { exact: true }).fill(message);
  await page.getByRole('button', { name: 'Continue by email', exact: true }).click();
  await page.getByRole('heading', { name: 'Your email draft is ready' }).waitFor();
  assert.match(await page.getByRole('link', { name: 'Open email draft' }).getAttribute('href'), /^mailto:/);
  assert.equal(requests, 6, 'static contact does not POST');
  results.push('PASS static contact: email draft, no false delivery claim');
  await pickBooking(staticSite);
  await page.getByRole('button', { name: 'Continue by email', exact: true }).click();
  await page.getByRole('heading', { name: 'Your email draft is ready' }).waitFor();
  assert.match(decodeURIComponent(await page.getByRole('link', { name: 'Open email draft' }).getAttribute('href')), /Pakistan Standard Time/);
  assert.equal(requests, 6, 'static booking does not POST');
  results.push('PASS static booking: email draft fallback');
  await page.screenshot({ path: `${output}/booking-static-mobile.png` });
  await context.close();
} catch (error) { results.push(`FAIL ${error.message}`); process.exitCode = 1; }
finally { await writeFile(`${output}/inquiry-flows.json`, JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2)); await browser.close(); }
console.log(results.join('\n'));
