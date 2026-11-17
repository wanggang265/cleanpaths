/** repro-progressive-jpeg.cjs — reproduce user's homepage conversion failure.
 *  A) user file (progressive JPEG, 290x417)
 *  B) same image re-encoded as baseline JPEG (PIL convert)
 *  Both dropped on https://cleanpaths.io/ homepage tool; console + final state captured.
 */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'https://cleanpaths.io';
const USER_FILE = '/home/ubuntu/.hermes/profiles/wangduoyu/cache/images/img_7fb482510f8a.jpg';
const BASELINE_FILE = '/tmp/qa-repro-baseline.jpg';

async function run(browser, file, label) {
  const ctx = await browser.newContext();
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  pg.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await pg.goto(BASE + '/', { waitUntil: 'networkidle' });
  const input = pg.locator('input[type=file]').first();
  await input.setInputFiles(file);
  // wait for state to settle: result or error
  const dz = pg.locator('[data-state], .dz, [class*=dz]').first();
  let state = '';
  try {
    await pg.waitForFunction(() => {
      const el = document.querySelector('[data-state]');
      return el && (el.dataset.state === 'result' || el.dataset.state === 'error');
    }, { timeout: 90000 });
    state = await pg.evaluate(() => document.querySelector('[data-state]')?.dataset.state || '?');
  } catch { state = 'TIMEOUT(still processing?)'; }
  const bodyText = state === 'error' ? await pg.evaluate(() => document.querySelector('[data-state]')?.textContent?.slice(0, 200)) : '';
  console.log(`\n=== ${label} ===`);
  console.log('final state:', state);
  if (bodyText) console.log('error text:', bodyText);
  console.log('console errors:', errors.length ? errors : '(none)');
  await pg.screenshot({ path: `/tmp/repro-${label}.png` });
  await ctx.close();
}

const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  await run(browser, USER_FILE, 'A-user-progressive');
  if (fs.existsSync(BASELINE_FILE)) await run(browser, BASELINE_FILE, 'B-baseline-reencode');
  await browser.close();
})();
