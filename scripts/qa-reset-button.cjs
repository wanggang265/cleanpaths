/**
 * qa-reset-button.cjs — regression for P1 fix (PROMPT_chuangkou_08_reset_button_fix):
 * result-state [data-tool-reset] ("Choose another file") must be wired:
 *   convert -> dataset.state==='result' -> click reset -> 'empty' -> dropzone usable again
 * Spot-check two pages sharing the same renderResult(): / (trace-multi) + /png-to-dxf/ (trace-raster).
 * Usage: node scripts/qa-reset-button.cjs            (localhost:8899)
 *        QA_BASE=https://cleanpaths.io node scripts/qa-reset-button.cjs   (production)
 */
const { chromium } = require('playwright');

const BASE = process.env.QA_BASE || 'http://localhost:8899';
const SAMPLE = '/home/ubuntu/projects/cleanpaths/public/assets/samples/logo-peak_before.png';
const PAGES = ['/', '/png-to-dxf/'];
const fails = [];
const ok = (n) => console.log('✓', n);
const bad = (n) => { console.log('✗ FAIL', n); fails.push(n); };
// noise: analytics hosts (prod) + beacon POST 501s against the local static server
// (python http.server can't POST; production functions/api/beacon.ts answers 204).
const isNoise = (t) =>
  t.includes('cloudflareinsights.com') || t.includes('clarity.ms') ||
  t.includes('net::ERR_FAILED') || t.includes('google-analytics') || t.includes('googletagmanager') ||
  t.includes('501 (Unsupported method');

(async () => {
  const browser = await chromium.launch();
  for (const route of PAGES) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !isNoise(m.text())) errs.push(m.text()); });
    pg.on('pageerror', (e) => { if (!isNoise(String(e))) errs.push(String(e)); });
    await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });

    // 1) convert once -> result state
    await pg.locator('input[type=file]').setInputFiles(SAMPLE);
    try {
      await pg.waitForSelector('[data-tool-dl]', { timeout: 60000 });
    } catch {
      bad(`${route} never reached result state`);
      await pg.screenshot({ path: `${__dirname}/qa-evidence-bofu/reset-FAIL-${route === '/' ? 'home' : 'png'}-1.png` });
      await pg.close();
      continue;
    }
    const state1 = await pg.evaluate(() => document.querySelector('#convert').dataset.state);
    if (state1 !== 'result') bad(`${route} expected state=result, got ${state1}`);
    else ok(`${route} conversion reached result state`);

    // 2) click reset ("Choose another file" — frozen string, do not match by text; use the hook)
    const resetBtn = pg.locator('#convert [data-tool-reset]');
    if ((await resetBtn.count()) === 0) { bad(`${route} reset button missing in result state`); await pg.close(); continue; }
    await resetBtn.click();

    // 3) state must be empty + dropzone usable again
    const state2 = await pg.evaluate(() => document.querySelector('#convert').dataset.state);
    if (state2 !== 'empty') { bad(`${route} after reset click: state=${state2} (expected empty) — BUG STILL PRESENT`); await pg.close(); continue; }
    ok(`${route} reset click -> state=empty`);
    const usable = await pg.evaluate(() => {
      const dz = document.querySelector('#convert');
      return !!dz.querySelector('input[type=file], .btn--primary') && dz.classList.contains('matgrid');
    });
    if (!usable) bad(`${route} dropzone not restored to usable empty state`);
    else ok(`${route} dropzone restored (matgrid + browse affordance present)`);

    // 4) second conversion must work (the broken loop this fix restores)
    await pg.locator('input[type=file]').setInputFiles(SAMPLE);
    try {
      await pg.waitForSelector('[data-tool-dl]', { timeout: 60000 });
      ok(`${route} second conversion reached result state — loop closed`);
    } catch {
      bad(`${route} second conversion after reset failed`);
    }

    if (errs.length) bad(`${route} console errors: ${errs.join(' | ')}`);
    await pg.close();
  }
  await browser.close();
  console.log('\nRESULT:', fails.length ? `${fails.length} FAILURES:\n- ${fails.join('\n- ')}` : 'ALL PASS');
  process.exit(fails.length ? 1 : 0);
})();
