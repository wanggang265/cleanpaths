/** repro-poison.cjs — simulate flaky CN→CF network: abort the 11.2MB WASM fetch once,
 *  then allow it, and check whether conversion recovers or stays poisoned.
 */
const { chromium } = require('playwright');
const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const FILE = '/tmp/qa-repro-baseline.jpg';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const ctx = await browser.newContext();
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  let aborted = 0;
  await pg.route('**/vectorizer.wasm32-wasi.wasm', (r) => {
    aborted++;
    r.abort('connectionreset'); // simulate mid-fetch network failure
  });
  // also block nothing else; bundle.js loads fine, wasm fetch dies

  await pg.goto('https://cleanpaths.io/', { waitUntil: 'domcontentloaded' });
  const input = pg.locator('input[type=file]').first();

  // Attempt 1: wasm fetch will be aborted
  await input.setInputFiles(FILE);
  let s1 = '';
  try {
    await pg.waitForFunction(() => {
      const el = document.querySelector('[data-state]');
      return el && (el.dataset.state === 'result' || el.dataset.state === 'error');
    }, { timeout: 60000 });
    s1 = await pg.evaluate(() => document.querySelector('[data-state]').dataset.state);
  } catch { s1 = 'TIMEOUT'; }
  console.log('attempt 1 (wasm aborted):', s1, '| aborted fetches:', aborted);

  // Now heal the network
  await pg.unroute('**/vectorizer.wasm32-wasi.wasm');

  // Attempt 2: reset via reset button if present, then convert again
  const resetBtn = pg.locator('[data-tool-reset]');
  if (await resetBtn.count()) await resetBtn.first().click();
  await input.setInputFiles(FILE);
  let s2 = '';
  try {
    await pg.waitForFunction(() => {
      const el = document.querySelector('[data-state]');
      return el && (el.dataset.state === 'result' || el.dataset.state === 'error');
    }, { timeout: 90000 });
    s2 = await pg.evaluate(() => document.querySelector('[data-state]').dataset.state);
  } catch { s2 = 'TIMEOUT'; }
  console.log('attempt 2 (network healed):', s2);

  console.log('console errors:', errors.filter(e => e.includes('cleanpaths') || e.includes('wasm') || e.includes('engine')).slice(0, 6));
  await browser.close();
})();
