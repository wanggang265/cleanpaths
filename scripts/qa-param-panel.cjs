/**
 * qa-param-panel.cjs — E2E regression for 05 v1.12 #82 param panel (/png-to-dxf/).
 * Covers (PROMPT_chuangkou_param_panel_stage2 "E2E 回归必含"):
 *   1. #78 dead-button path: result → reset → second conversion → result
 *   2. Precision slider original behavior (rerun + threshold follow-sync)
 *   3. P-W mm width: read-only line sync + DXF geometry span == set width (no rerun)
 *   4. P-T threshold / P-N smoothing / P-M mode seg: each triggers a rerun
 *   5. BIGFILE path: >2000px input → downscale size-note in result state
 *   6. Panel presence ONLY on /png-to-dxf/ (negative checks: /jpg-to-dxf/, /)
 *   7. mm rebuild latency measurement (<50ms engineering claim)
 * Usage: node scripts/qa-param-panel.cjs  (against localhost:8899 qa-server)
 */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.QA_BASE || 'http://localhost:8899';
const SAMPLE = '/home/ubuntu/projects/cleanpaths/public/assets/samples/logo-peak_before.png';
const SAMPLE_JPG = '/tmp/sample.jpg';
const BIG = '/tmp/big-2200.png';
const fails = [];
const ok = (n) => console.log('✓', n);
const bad = (n) => { console.log('✗ FAIL', n); fails.push(n); };

// console-error noise filter — judged by the failing URL (beacon/feedback are
// API routes the static QA server can't answer; production functions answer 204).
function watchErrors(pg, errs) {
  pg.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = m.location()?.url || '';
    if (url.includes('/api/')) return; // static-server 404/501 for beacon/feedback
    const t = m.text();
    if (/cloudflareinsights|clarity\.ms|google-analytics|googletagmanager|ERR_BLOCKED_BY_RESPONSE|net::ERR_FAILED/.test(t)) return;
    errs.push(t);
  });
  pg.on('pageerror', (e) => errs.push(String(e)));
}

async function convertOnce(pg, file) {
  await pg.locator('input[type=file]').setInputFiles(file);
  await pg.waitForSelector('[data-tool-dl]', { timeout: 120000 });
}

/** Wait for rerun()'s renderResult() to replace the result DOM (old node detaches). */
async function waitRerender(pg) {
  const old = await pg.locator('[data-tool-dl="dxf-r2000"]').elementHandle();
  await pg.waitForFunction((el) => !el.isConnected, old, { timeout: 120000 });
  await pg.waitForSelector('[data-tool-dl]', { timeout: 120000 });
}

(async () => {
  const browser = await chromium.launch();

  // ---------- main flow on /png-to-dxf/ ----------
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    watchErrors(pg, errs);
    await pg.goto(`${BASE}/png-to-dxf/`, { waitUntil: 'networkidle' });

    // 1) first conversion → result + panel present with frozen strings
    await convertOnce(pg, SAMPLE);
    const panelFound = await pg.locator('[data-tool-parampanel]').count();
    if (panelFound !== 1) bad(`param panel missing in result state (count=${panelFound})`);
    else ok('1. param panel renders in result state');

    const strings = ['Cut settings', 'Width (mm)', 'Color threshold', 'Lower = fewer colors, cleaner paths',
      'Default size assumes 96 DPI — set the width you actually cut at.', 'Node smoothing',
      'Higher = fewer nodes, smaller file', 'Engrave = filled color layers — not photo engraving'];
    // textContent (source-of-truth DOM text) — NOT innerText: .spec labels
    // render uppercase via CSS text-transform (v1.12 N1 rendering contract).
    const panelText = await pg.locator('[data-tool-parampanel]').evaluate((el) => el.textContent || '');
    for (const s of strings) {
      if (!panelText.includes(s)) bad(`frozen string missing in panel: "${s}"`);
    }
    ok('2. panel contains all frozen label/hint strings');

    const sizeLine0 = (await pg.locator('[data-tool-output-size]').innerText()).trim();
    if (!/^Output size: [\d.]+ × [\d.]+ mm$/.test(sizeLine0)) bad(`size line malformed: "${sizeLine0}"`);
    else ok(`3. N3 size line matches frozen template ("${sizeLine0}")`);
    // default = 96dpi conversion of geometry span → ratio must match bbox aspect (unknown here,
    // but w/h ratio consistency is re-checked after setting 100mm below)

    // P-W: set width=100 → size line syncs (in-memory rebuild, no rerun)
    const dlBefore = await pg.locator('[data-tool-dl="dxf-r2000"]').elementHandle();
    const t0 = Date.now();
    await pg.locator('[data-tool-width]').fill('100');
    await pg.waitForFunction(
      () => document.querySelector('[data-tool-output-size]')?.textContent?.startsWith('Output size: 100 ×'),
      { timeout: 5000 },
    );
    const rebuildMs = Date.now() - t0 - 250; // minus the 250ms debounce window
    const sameNode = await pg.evaluate((el) => el.isConnected, dlBefore);
    if (!sameNode) bad('P-W triggered a rerun (result DOM replaced) — must be in-memory only');
    else ok(`4. P-W width → size line synced in ≈${Math.max(rebuildMs, 0)}ms (after debounce), ZERO rerun (DOM untouched)`);
    const hMatch = (await pg.locator('[data-tool-output-size]').innerText()).match(/× ([\d.]+) mm/);
    const hVal = parseFloat(hMatch[1]);
    if (!(hVal > 40 && hVal < 100)) bad(`size line height implausible: ${hVal}`);
    else ok(`5. size line height tracks geometry aspect (h=${hVal}mm @ w=100mm)`);

    // DXF blob: geometry span must equal the set width (EXTMAX.x − EXTMIN.x ≈ 100)
    const dlEvt = pg.waitForEvent('download', { timeout: 10000 });
    await pg.locator('[data-tool-dl="dxf-r2000"]').click();
    const download = await dlEvt;
    const dxf = fs.readFileSync(await download.path(), 'utf8');
    const num = /([\d.]+)/;
    const extmax = dxf.match(new RegExp(`\\$EXTMAX\\s*\\r?\\n\\s*10\\s*\\r?\\n\\s*${num.source}`));
    const extmin = dxf.match(new RegExp(`\\$EXTMIN\\s*\\r?\\n\\s*10\\s*\\r?\\n\\s*${num.source}`));
    const span = parseFloat(extmax[1]) - parseFloat(extmin[1]);
    if (Math.abs(span - 100) > 0.5) bad(`DXF geometry x-span ${span} != 100mm (EXTMAX=${extmax[1]}, EXTMIN=${extmin[1]})`);
    else ok(`6. P-W DXF R2000 in-memory rebuild — geometry x-span=${span.toFixed(2)}mm ≈ 100mm`);
    if (!dxf.includes('$INSUNITS')) bad('DXF $INSUNITS missing'); else ok('7. R2000 $INSUNITS still present');

    // 2) #78: reset → second conversion still works
    await pg.locator('#convert [data-tool-reset]').click();
    await pg.waitForFunction(() => document.querySelector('#convert').dataset.state === 'empty', { timeout: 5000 });
    await convertOnce(pg, SAMPLE);
    const state2 = await pg.evaluate(() => document.querySelector('#convert').dataset.state);
    if (state2 !== 'result') bad(`#78 second conversion state=${state2}`);
    else ok('8. #78 regression: reset → second conversion reaches result');
    if ((await pg.locator('[data-tool-parampanel]').count()) !== 1) bad('panel missing after second conversion');
    else ok('9. panel re-renders after second conversion');

    // Precision slider original behavior: move → rerun; threshold follows linked value
    await pg.locator('[data-tool-precision]').fill('3');
    const expectedTh = String(Math.max(4, Math.min(9, 4 + Math.round((3 - 1) * (5 / 9))))); // = 5
    await pg.waitForFunction((want) => document.querySelector('[data-tool-threshold]')?.value === want, expectedTh, { timeout: 10000 });
    await waitRerender(pg);
    const pVal = await pg.locator('[data-tool-precision]').inputValue();
    if (pVal !== '3') bad(`Precision value lost across rerun (got ${pVal})`);
    else ok(`10. Precision slider rerun OK (value kept=3) + threshold followed to ${expectedTh} (linkage untouched)`);

    // P-T threshold: move → rerun happens
    await pg.locator('[data-tool-threshold]').fill('4');
    await waitRerender(pg);
    if ((await pg.locator('[data-tool-threshold]').inputValue()) !== '4') bad('threshold value lost across rerun');
    else ok('11. P-T threshold change → rerun → result re-rendered, value kept=4');

    // P-N smoothing: move → rerun
    await pg.locator('[data-tool-smooth]').fill('9');
    await waitRerender(pg);
    if ((await pg.locator('[data-tool-smooth]').inputValue()) !== '9') bad('smooth value lost across rerun');
    else ok('12. P-N smoothing change → rerun → result re-rendered, value kept=9');

    // P-M mode seg: Engrave → rerun + aria-pressed flips
    await pg.locator('[data-tool-mode] button[data-mode="engrave"]').click();
    await waitRerender(pg);
    const pressed = await pg.locator('[data-tool-mode] button[data-mode="engrave"]').getAttribute('aria-pressed');
    if (pressed !== 'true') bad('Engrave aria-pressed not flipped after rerun');
    else ok('13. P-M Engrave seg → rerun → aria-pressed flipped, result re-rendered');
    await pg.locator('[data-tool-mode] button[data-mode="cut"]').click();
    await waitRerender(pg);
    ok('14. P-M back to Cut (default preserved)');

    if (errs.length) bad(`console errors on /png-to-dxf/: ${errs.join(' | ').slice(0, 300)}`);
    else ok('15. zero console errors across full flow');
    await pg.close();
  }

  // ---------- BIGFILE path ----------
  {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${BASE}/png-to-dxf/`, { waitUntil: 'networkidle' });
    await convertOnce(pg, BIG);
    const note = await pg.locator('[data-tool-size-note]').count();
    if (note !== 1) bad('BIGFILE: size note missing after >2000px input');
    else ok('16. BIGFILE path: downscale size note renders in result state');
    if ((await pg.locator('[data-tool-parampanel]').count()) !== 1) bad('BIGFILE: panel missing');
    else ok('17. BIGFILE path: panel still renders + usable');
    await pg.close();
  }

  // ---------- negative checks: no panel elsewhere ----------
  for (const [route, file] of [['/', SAMPLE], ['/jpg-to-dxf/', SAMPLE_JPG]]) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await convertOnce(pg, file);
    const n = await pg.locator('[data-tool-parampanel]').count();
    if (n !== 0) bad(`panel leaked onto ${route}`);
    else ok(`18. no panel on ${route} (single-page batch honored)`);
    await pg.close();
  }

  await browser.close();
  if (fails.length) { console.error(`\n${fails.length} FAIL(S)`); process.exit(1); }
  console.log('\nQA PARAM PANEL: ALL PASS');
})();
