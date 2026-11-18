/* qa-ga4-events.cjs — live-fire GA4 event capture for ticket T6 (evidence pack).
 * The built page ships the standard GA4 snippet + real gtag.js, so events land in
 * window.dataLayer as ARRAY-LIKE arguments objects ({"0":"event","1":<name>,...}).
 * We pre-seed window.dataLayer, drive a real PNG→DXF conversion, click download,
 * and read the events back. Output: scripts/qa-evidence-stage1/ga4-events.json
 * + ga4-{before,result,download}.png
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = path.join(__dirname, 'qa-evidence-stage1');
const SAMPLE = path.join(__dirname, '..', 'public', 'assets', 'samples', 'logo-peak_before.png');

(async () => {
  if (!fs.existsSync(SAMPLE)) { console.error('missing sample', SAMPLE); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  await page.addInitScript(() => { window.dataLayer = []; });
  await page.goto(BASE + '/png-to-dxf/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type=file]', { state: 'attached', timeout: 10000 });
  await page.screenshot({ path: path.join(OUT, 'ga4-before.png'), fullPage: false });

  // upload_start fires when run() begins
  await page.setInputFiles('input[type=file]', SAMPLE);
  await page.waitForFunction(`(window.dataLayer || []).some((a) => a && a[0] === 'event' && a[1] === 'upload_start')`, undefined, { timeout: 20000 });

  // convert_success fires when result renders
  await page.waitForFunction(`(window.dataLayer || []).some((a) => a && a[0] === 'event' && a[1] === 'convert_success')`, undefined, { timeout: 60000 });
  await page.waitForSelector('[data-tool-dl]', { timeout: 15000 });
  await page.screenshot({ path: path.join(OUT, 'ga4-result.png'), fullPage: false });

  // download event fires on primary download click
  const before = await page.evaluate(() => (window.dataLayer || []).filter((a) => a && a[0] === 'event').length);
  await page.click('[data-tool-dl]');
  await page.waitForFunction((n) => (window.dataLayer || []).filter((a) => a && a[0] === 'event').length > n, before, { timeout: 15000 });
  await page.screenshot({ path: path.join(OUT, 'ga4-download.png'), fullPage: false });

  const calls = await page.evaluate(() => (window.dataLayer || []).filter((a) => a && a[0] === 'event').map((a) => Array.from({ length: a.length }, (_, i) => a[i])));
  fs.writeFileSync(path.join(OUT, 'ga4-events.json'), JSON.stringify(calls, null, 2));
  const evts = calls.map((c) => `${c[1]} ${JSON.stringify(c[2] || {})}`);
  console.log('GA4 event calls captured (via dataLayer):');
  evts.forEach((e) => console.log('  ', e));
  const need = ['upload_start', 'convert_success', 'download'];
  const missing = need.filter((n) => !evts.some((e) => e.startsWith(n)));
  console.log(missing.length === 0 ? 'GA4-EVENTS-PASS' : `GA4-EVENTS-FAIL missing=${missing.join(',')}`);
  await browser.close();
  process.exit(missing.length ? 1 : 0);
})().catch((e) => { console.error('QA-ERROR', e.message); process.exit(1); });
