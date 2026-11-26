#!/usr/bin/env node
// qa-p0-4a.cjs — P0-4a GA4 FE events after-verification (analytics-spec §8.2/§8.3/§8.6).
// Asserts the frozen 9-row event surface (8 FE events, FE never fires purchase),
// the §8.3 "who doesn't fire" red lines (cap / fast-fail / offline paths), the
// buy_click three-slot census, language_switch pt→en, checkout_started both
// paths, pricing_view once-per-load, and the P0-4a→P0-4b client_id checkout
// contract (attached when a _ga cookie exists, omitted entirely when not).
//
// Architecture note: GA network (googletagmanager/google-analytics) is BLOCKED
// for hermeticity, and a push-time reporting shim (addInitScript →
// window.__reportGa) mirrors every dataLayer push to Node BEFORE any
// navigation can tear the document down. Assertions therefore never race the
// navigations that checkout_started / language_switch / buy_click trigger.
// Production network/DebugView evidence is collected separately post-deploy.
//
// Usage: PLAYWRIGHT_BROWSERS_PATH=/home/ubuntu/.cache/ms-playwright node scripts/qa-p0-4a.cjs
// (spawns qa-server on :8899 itself; run against a fresh production `out/` build)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'docs', 'evidence', 'p0-4-ga4-debugview');
fs.mkdirSync(EV, { recursive: true });

// real 1x1 JFIF/JPEG — valid for the repack pipeline (same fixture as qa-p0-2)
const JPEG_B64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwcJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmgA//9k=';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'p04a-'));
fs.writeFileSync(path.join(TMP, 'photo.jfif'), Buffer.from(JPEG_B64, 'base64'));
fs.writeFileSync(path.join(TMP, 'doc.pdf'), Buffer.from('%PDF-1.4 not an image'));

const results = [];
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail: String(detail).slice(0, 300) });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + String(detail).slice(0, 200) : ''}`);
  return !!cond;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mkPage(browser) {
  const page = await browser.newPage();
  const raw = []; // every dataLayer push, mirrored at push time (nav-immune)
  await page.exposeFunction('__reportGa', (entry) => raw.push(entry));
  await page.addInitScript(() => {
    // Runs before any page script. layout.tsx does `window.dataLayer = window.dataLayer || []`
    // (sloppy inline) → keeps OUR array; its gtag stub pushes Arguments into it.
    window.__gaLog = [];
    window.dataLayer = window.__gaLog;
    window.dataLayer.push = function (...args) {
      for (const a of args) {
        try {
          window.__reportGa(JSON.parse(JSON.stringify(a)));
        } catch (e) {
          /* non-serializable internal push */
        }
      }
      return Array.prototype.push.apply(this, args);
    };
  });
  // hermetic: no GA network (no _ga cookie gets written by gtag.js), no real external nav
  await page.route(/googletagmanager\.com|google-analytics\.com|example\.com|creem\.io/, (r) => r.abort());
  const evts = () =>
    raw
      .filter((e) => e && e['0'] === 'event' && typeof e['1'] === 'string')
      .map((e) => ({ name: e['1'], params: e['2'] && typeof e['2'] === 'object' ? e['2'] : null }));
  return { page, evts, raw };
}

(async () => {
  const server = spawn('node', [path.join(__dirname, 'qa-server.cjs')], { stdio: 'pipe' });
  await sleep(700);
  const browser = await chromium.launch();

  try {
    // ============ A. EN tool flow: upload_start/convert_started/convert_success/download params ============
    {
      const { page, evts } = await mkPage(browser);
      await page.goto('http://localhost:8899/jfif-to-jpg/', { waitUntil: 'networkidle' });
      await page.setInputFiles('input[type=file]', path.join(TMP, 'photo.jfif'));
      await sleep(400);
      let e = evts();
      const us = e.find((x) => x.name === 'upload_start');
      const cnt = (n) => e.filter((x) => x.name === n).length;
      ok('A1 upload_start fires once on pick', cnt('upload_start') === 1, JSON.stringify(e.map((x) => x.name)));
      ok('A2 upload_start.file_type=jfif (dot-less)', us && us.params && us.params.file_type === 'jfif', JSON.stringify(us && us.params));
      ok('A3 pricing_view NOT fired on tool page', cnt('pricing_view') === 0);

      await page.click('[data-tool-convert]');
      await page.waitForSelector('[data-tool-dl]', { timeout: 40000 });
      await sleep(300);
      e = evts();
      const cs = e.find((x) => x.name === 'convert_started');
      const cc = e.find((x) => x.name === 'convert_success');
      ok('A4 upload_start still exactly 1 after Convert (no re-fire)', cnt('upload_start') === 1);
      ok('A5 convert_started fires once', cnt('convert_started') === 1);
      ok('A6 convert_started.file_type=jfif (input ext)', cs && cs.params && cs.params.file_type === 'jfif', JSON.stringify(cs && cs.params));
      ok('A7 convert_success fires once', cnt('convert_success') === 1);
      ok('A8 convert_success.file_type=jpg (primary out key)', cc && cc.params && cc.params.file_type === 'jpg', JSON.stringify(cc && cc.params));
      ok('A9 download NOT fired before click', cnt('download') === 0);

      await page.click('[data-tool-dl]');
      await sleep(400);
      e = evts();
      const dl = e.find((x) => x.name === 'download');
      ok('A10 download fires once', cnt('download') === 1);
      ok('A11 download.file_type=jpg (regression: live param intact)', dl && dl.params && dl.params.file_type === 'jpg', JSON.stringify(dl && dl.params));
      ok('A12 FE never fires purchase (§8.3)', cnt('purchase') === 0);
      await page.close();
    }

    // ============ B. fast-fail: invalid ext → upload_start records value, no convert_started ============
    {
      const { page, evts } = await mkPage(browser);
      await page.goto('http://localhost:8899/jfif-to-jpg/', { waitUntil: 'networkidle' });
      await page.setInputFiles('input[type=file]', path.join(TMP, 'doc.pdf'));
      await sleep(400);
      const e = evts();
      const us = e.find((x) => x.name === 'upload_start');
      ok('B1 fast-fail: upload_start still fires (invalid ext recorded as-is)', e.filter((x) => x.name === 'upload_start').length === 1);
      ok('B2 fast-fail: upload_start.file_type=pdf', us && us.params && us.params.file_type === 'pdf', JSON.stringify(us && us.params));
      ok('B3 fast-fail: convert_started NOT fired', e.filter((x) => x.name === 'convert_started').length === 0);
      await page.close();
    }

    // ============ C. daily-cap: convert_started withheld; cap-state CTA → buy_click slot=cap ============
    {
      const { page, evts } = await mkPage(browser);
      await page.addInitScript(() => {
        localStorage.setItem('cp.free.day', new Date().toISOString().slice(0, 10));
        localStorage.setItem('cp.free.count', '10'); // FREE_DAILY_CAP=10 → cap
      });
      await page.goto('http://localhost:8899/jfif-to-jpg/', { waitUntil: 'networkidle' });
      await page.setInputFiles('input[type=file]', path.join(TMP, 'photo.jfif'));
      await sleep(300);
      await page.click('[data-tool-convert]');
      await page.waitForSelector('.state-note--cap', { timeout: 8000 });
      await sleep(300);
      let e = evts();
      ok('C1 cap path: convert_started withheld (§8.3)', e.filter((x) => x.name === 'convert_started').length === 0, JSON.stringify(e.map((x) => x.name)));
      ok('C2 cap path: upload_start DID fire (pick precedes quota gate)', e.filter((x) => x.name === 'upload_start').length === 1);

      await page.locator('.dropzone a:has-text("Get CleanPaths Pro")').first().click();
      await sleep(600);
      e = evts();
      const bc = e.find((x) => x.name === 'buy_click');
      ok('C3 cap-state CTA → buy_click slot=cap', bc && bc.params && bc.params.slot === 'cap', JSON.stringify(bc && bc.params));
      await page.close();
    }

    // ============ D. pricing: pricing_view once; buy_click slot=pricing; checkout_started path=api; client_id OMITTED (no _ga, GA blocked) ============
    {
      const { page, evts } = await mkPage(browser);
      const bodies = [];
      page.on('request', (r) => {
        if (/\/api\/checkout$/.test(r.url())) bodies.push(r.postData() || '');
      });
      await page.route(/\/api\/checkout$/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://example.com/creem-mock' }) }));
      await page.goto('http://localhost:8899/pricing/', { waitUntil: 'networkidle' });
      await sleep(400);
      let e = evts();
      ok('D1 pricing_view fires exactly once on /pricing/ load', e.filter((x) => x.name === 'pricing_view').length === 1);

      await page.locator('a:has-text("Get CleanPaths Pro")').first().click();
      await sleep(900);
      e = evts();
      const bc = e.find((x) => x.name === 'buy_click');
      const cks = e.filter((x) => x.name === 'checkout_started');
      ok('D2 buy_click slot=pricing', bc && bc.params && bc.params.slot === 'pricing', JSON.stringify(bc && bc.params));
      ok('D3 checkout_started fires exactly once', cks.length === 1, JSON.stringify(cks));
      ok('D4 checkout_started path=api plan=pro', cks[0] && cks[0].params && cks[0].params.path === 'api' && cks[0].params.plan === 'pro', JSON.stringify(cks[0] && cks[0].params));
      const parsed = (() => {
        try {
          return JSON.parse(bodies[0] || '{}');
        } catch {
          return {};
        }
      })();
      ok('D5 contract: client_id OMITTED without _ga cookie (GA blocked → none)', !('client_id' in parsed), bodies[0] || '');
      await page.close();
    }

    // ============ D2. ?checkout=success landing → pricing_view also once ============
    {
      const { page, evts } = await mkPage(browser);
      await page.goto('http://localhost:8899/pricing/?checkout=success', { waitUntil: 'networkidle' });
      await sleep(400);
      const e = evts();
      ok('D6 success landing: pricing_view fires once', e.filter((x) => x.name === 'pricing_view').length === 1);
      ok('D7 success landing: FE still never fires purchase (beacon≠GA4, §8.3)', e.filter((x) => x.name === 'purchase').length === 0);
      await page.close();
    }

    // ============ E. fallback path (API 500) WITH injected _ga cookie → client_id attached ============
    {
      const { page, evts } = await mkPage(browser);
      await page.addInitScript(() => {
        document.cookie = '_ga=GA1.1.123456789.987654321;path=/';
      });
      const bodies = [];
      page.on('request', (r) => {
        if (/\/api\/checkout$/.test(r.url())) bodies.push(r.postData() || '');
      });
      await page.route(/\/api\/checkout$/, (r) => r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'rate_limited' }) }));
      await page.goto('http://localhost:8899/pricing/', { waitUntil: 'networkidle' });
      await page.locator('a:has-text("Get CleanPaths Pro")').first().click();
      await sleep(900);
      const e = evts();
      const cks = e.filter((x) => x.name === 'checkout_started');
      ok('E1 checkout_started path=fallback on API 500', cks.length === 1 && cks[0].params && cks[0].params.path === 'fallback' && cks[0].params.plan === 'pro', JSON.stringify(cks[0] && cks[0].params));
      const parsed = (() => {
        try {
          return JSON.parse(bodies[0] || '{}');
        } catch {
          return {};
        }
      })();
      ok('E2 contract: client_id=123456789.987654321 (last two _ga segments)', parsed.client_id === '123456789.987654321', bodies[0] || '');
      await page.close();
    }

    // ============ F. offline path → NO checkout_started (§8.2 row7) ============
    {
      const { page, evts } = await mkPage(browser);
      await page.route(/\/api\/checkout$/, (r) => r.abort());
      await page.goto('http://localhost:8899/pricing/', { waitUntil: 'networkidle' });
      await page.locator('a:has-text("Get CleanPaths Pro")').first().click();
      await sleep(900);
      const e = evts();
      ok('F1 offline .catch: checkout_started withheld', e.filter((x) => x.name === 'checkout_started').length === 0, JSON.stringify(e.map((x) => x.name)));
      ok('F2 offline: buy_click still fired (CTA click is real)', e.filter((x) => x.name === 'buy_click').length === 1);
      await page.close();
    }

    // ============ G. language_switch: header + footer fire pt→en; logo never ============
    {
      const g1 = await mkPage(browser);
      await g1.page.goto('http://localhost:8899/pt/jfif-para-jpg/', { waitUntil: 'networkidle' });
      await g1.page.locator('header .main-nav a', { hasText: 'English version' }).first().click(); // nav to EN proceeds (push already reported)
      await sleep(600);
      let e = g1.evts();
      const ls = e.find((x) => x.name === 'language_switch');
      ok('G1 header link → language_switch from_lang=pt to_lang=en', ls && ls.params && ls.params.from_lang === 'pt' && ls.params.to_lang === 'en', JSON.stringify(ls && ls.params));
      await g1.page.close();

      const g2 = await mkPage(browser);
      await g2.page.goto('http://localhost:8899/pt/jfif-para-jpg/', { waitUntil: 'networkidle' });
      await g2.page.locator('.site-footer a', { hasText: 'English version' }).first().evaluate((el) => el.click()); // force-click can't scroll (y≈2631 → off-viewport coords); DOM click targets the element exactly, same delegated-listener path
      await sleep(600);
      e = g2.evts();
      ok('G2 footer link → language_switch pt→en', e.some((x) => x.name === 'language_switch' && x.params && x.params.from_lang === 'pt' && x.params.to_lang === 'en'), JSON.stringify(e));
      await g2.page.close();

      const g3 = await mkPage(browser);
      await g3.page.goto('http://localhost:8899/pt/', { waitUntil: 'networkidle' });
      await g3.page.locator('header a').first().click(); // logo → EN-bound but NOT a language-switch anchor
      await sleep(600);
      e = g3.evts();
      ok('G3 logo click does NOT fire language_switch (no false positive)', e.filter((x) => x.name === 'language_switch').length === 0, JSON.stringify(e.map((x) => x.name)));
      await g3.page.close();

      const g4 = await mkPage(browser);
      await g4.page.goto('http://localhost:8899/jfif-to-jpg/', { waitUntil: 'networkidle' });
      await sleep(300);
      ok('G4 EN page fires no language_switch', g4.evts().filter((x) => x.name === 'language_switch').length === 0);
      await g4.page.close();
    }

    // ============ H. cricut slot ============
    {
      const { page, evts } = await mkPage(browser);
      await page.goto('http://localhost:8899/for/cricut-sellers/', { waitUntil: 'networkidle' });
      await page.locator('a:has-text("Get CleanPaths Pro")').first().click();
      await sleep(600);
      const e = evts();
      const bc = e.find((x) => x.name === 'buy_click');
      ok('H1 cricut ROI CTA → buy_click slot=cricut', bc && bc.params && bc.params.slot === 'cricut', JSON.stringify(bc && bc.params));
      await page.close();
    }
  } catch (err) {
    ok('RUNTIME', false, err && err.message);
  } finally {
    await browser.close();
    server.kill();
  }

  fs.writeFileSync(path.join(EV, 'p0-4a-qa-results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(
    path.join(EV, 'p0-4a-qa-README.md'),
    [
      '# P0-4a local QA evidence (qa-p0-4a.cjs)',
      '',
      '- Environment: qa-server :8899 (static `out/`), Chromium headless, GA network blocked (hermetic).',
      '- Event capture: push-time dataLayer shim (`window.__reportGa`) — nav-immune; params = gtag event params verbatim.',
      '- Results: `p0-4a-qa-results.json`; checkout request bodies: `p0-4a-checkout-contract.json`.',
      '- Production network/DebugView evidence: `p0-4a-prod-*.log` (collected post-deploy, real GA4 G-9T8XY5EB0Y stream).',
      '',
    ].join('\n')
  );

  const fails = results.filter((r) => !r.pass);
  console.log(`\n==== qa-p0-4a: ${results.length - fails.length}/${results.length} PASS ====`);
  if (fails.length) {
    console.log('FAILED:');
    fails.forEach((f) => console.log(`  ✗ ${f.name} — ${f.detail}`));
  }
  process.exit(fails.length ? 1 : 0);
})();
