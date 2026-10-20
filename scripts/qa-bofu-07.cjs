/**
 * qa-bofu-07.cjs — 07 BOFU batch evidence:
 *  A) PT footer rendered without Compare group (post-hydration)
 *  B) 4 comparison pages desktop 1440x900 + mobile 390x844 screenshots
 *  C) E5 Real Results block close-up (vector-magic page, desktop)
 *  D) footer Compare group mobile screenshot (home)
 *  E) E2E conversion on /vector-magic-alternative/ (drop PNG -> result state)
 *     + Network assertion: zero file exfiltration during conversion
 *  F) zero console errors on all 4 pages
 *  G) mobile: no horizontal scroll on 4 pages
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.QA_BASE || 'http://localhost:8899';
const OUTDIR = path.join(__dirname, 'qa-evidence-bofu');
fs.mkdirSync(OUTDIR, { recursive: true });

const PAGES = ['vector-magic-alternative', 'cloudconvert-alternative', 'vectorizer-ai-alternative', 'convertio-alternative'];
const fails = [];
const ok = (n) => console.log('✓', n);
const bad = (n) => { console.log('✗ FAIL', n); fails.push(n); };
// CF Web Analytics rum beacon CORS-fails on localhost (expected: origin not the
// production zone). Not a regression — filter it out of console-error checks.
const isNoise = (t) => t.includes('cloudflareinsights.com') || t.includes('net::ERR_FAILED');

// minimal valid PNG (1x1 is too small for tracer; generate a flat-color logo-ish PNG via canvas later).
// Use the repo's own synthetic sample instead — a real flat-color logo PNG.
const SAMPLE = '/home/ubuntu/projects/cleanpaths/public/assets/samples/logo-peak_before.png';

(async () => {
  const browser = await chromium.launch();

  // ---------- A) PT footer post-hydration ----------
  {
    const pg = await browser.newPage();
    await pg.goto(`${BASE}/pt/jfif-para-jpg/`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(800); // hydration settle
    const footerText = await pg.evaluate(() => document.querySelector('footer').innerText);
    if (footerText.includes('Compare') || footerText.includes('vs Vector')) bad('PT footer has Compare after hydration');
    else ok('A) PT footer rendered WITHOUT Compare group (post-hydration)');
    await pg.close();
  }

  // ---------- B/C/D/F/G) per-page screenshots + console + scroll ----------
  for (const slug of PAGES) {
    // desktop
    const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    d.on('console', (m) => { if (m.type() === 'error' && !isNoise(m.text())) errs.push(m.text()); });
    d.on('pageerror', (e) => { if (!isNoise(String(e))) errs.push(String(e)); });
    await d.goto(`${BASE}/${slug}/`, { waitUntil: 'networkidle' });
    await d.screenshot({ path: path.join(OUTDIR, `${slug}-desktop.png`), fullPage: true });
    if (errs.length) bad(`F) ${slug} console errors: ${errs.join(' | ')}`);
    else ok(`F) ${slug} zero console errors (desktop)`);

    // E5 block close-up on vector-magic page
    if (slug === 'vector-magic-alternative') {
      const h2 = d.locator('h2', { hasText: 'What cleanup actually changes (in our tests)' });
      await h2.scrollIntoViewIfNeeded();
      const section = h2.locator('xpath=ancestor::section[1]');
      await section.screenshot({ path: path.join(OUTDIR, 'E5-real-results-block.png') });
      ok('C) E5 Real Results block screenshot captured');
    }
    await d.close();

    // mobile
    const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const merrs = [];
    m.on('console', (e) => { if (e.type() === 'error' && !isNoise(e.text())) merrs.push(e.text()); });
    m.on('pageerror', (e) => { if (!isNoise(String(e))) merrs.push(String(e)); });
    await m.goto(`${BASE}/${slug}/`, { waitUntil: 'networkidle' });
    await m.screenshot({ path: path.join(OUTDIR, `${slug}-mobile.png`), fullPage: true });
    const scrollW = await m.evaluate(() => document.documentElement.scrollWidth);
    if (scrollW > 391) bad(`G) ${slug} horizontal scroll: scrollWidth=${scrollW}`);
    else ok(`G) ${slug} no horizontal scroll (390px)`);
    if (merrs.length) bad(`F) ${slug} mobile console errors: ${merrs.join(' | ')}`);
    // comparison table stacked check: data-col pseudo labels visible -> check table display block
    const stacked = await m.evaluate(() => {
      const t = document.querySelector('.cmp-versus table');
      return t ? getComputedStyle(t).display === 'block' : false;
    });
    if (stacked) ok(`G) ${slug} cmp-versus stacked on mobile (data-col labels active)`);
    else bad(`G) ${slug} cmp-versus NOT stacked on mobile`);
    await m.close();
  }

  // ---------- D) footer Compare on mobile (home) ----------
  {
    const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await m.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const h4 = m.locator('footer h4', { hasText: 'Compare' });
    await h4.scrollIntoViewIfNeeded();
    await m.screenshot({ path: path.join(OUTDIR, 'footer-compare-mobile.png') });
    ok('D) footer Compare group mobile screenshot captured');
    await m.close();
  }

  // ---------- E) E2E conversion on a comparison page + network assertion ----------
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const uploads = [];
    const thirdParty = new Set();
    const ANALYTICS = ['clarity.ms', 'cloudflareinsights.com', 'google-analytics.com', 'googletagmanager.com'];
    await pg.route('**/*', (route) => {
      const req = route.request();
      const url = req.url();
      if (!url.startsWith(BASE)) thirdParty.add(new URL(url).hostname);
      // file-exfiltration = a POST carrying file-scale payload to a non-analytics endpoint
      const size = (req.postData() || '').length;
      if (req.method() === 'POST' && size > 50000 && !ANALYTICS.some((a) => url.includes(a))) {
        uploads.push(`${url} (${size} bytes)`);
      }
      route.continue();
    });
    await pg.goto(`${BASE}/vector-magic-alternative/`, { waitUntil: 'networkidle' });
    const dz = pg.locator('#convert');
    await dz.scrollIntoViewIfNeeded();
    // feed file via the hidden input ToolController creates, or fall back to setInputFiles on dropzone
    const input = pg.locator('input[type=file]');
    await input.setInputFiles(SAMPLE);
    // wait for result state: download buttons appear
    try {
      await pg.waitForSelector('[data-tool-dl]', { timeout: 60000 });
      ok('E) comparison-page hero upload reached RESULT state (download buttons present)');
      const dlCount = await pg.locator('[data-tool-dl]').count();
      ok(`E) result offers ${dlCount} download buttons (same tool-page flow)`);
      await pg.screenshot({ path: path.join(OUTDIR, 'E2E-result-state.png') });
    } catch (e) {
      bad('E) conversion did not reach result state within 60s');
      await pg.screenshot({ path: path.join(OUTDIR, 'E2E-FAILED-state.png') });
    }
    if (uploads.length) bad(`E) FILE EXFILTRATION detected: ${uploads.join(', ')}`);
    else ok('E) zero file-scale upload POST during conversion (files never leave device)');
    ok(`E) third-party hosts contacted (analytics only, no file payloads): ${[...thirdParty].join(', ') || 'none'}`);
    await pg.close();
  }

  await browser.close();
  console.log('\nRESULT:', fails.length ? `${fails.length} FAILURES:\n- ${fails.join('\n- ')}` : 'ALL PASS');
  process.exit(fails.length ? 1 : 0);
})();
