/**
 * qa-param-panel-viewports.cjs — #82 hard gate (#37 lesson): result-state param
 * panel must overflow ZERO at 375/360/320px. Screenshots saved as evidence.
 */
const { chromium } = require('playwright');
const BASE = process.env.QA_BASE || 'http://localhost:8899';
const SAMPLE = '/home/ubuntu/projects/cleanpaths/public/assets/samples/logo-peak_before.png';
const OUT = `${__dirname}/qa-evidence-bofu`;
const fails = [];

(async () => {
  const browser = await chromium.launch();
  for (const w of [375, 360, 320]) {
    const pg = await browser.newPage({ viewport: { width: w, height: 800 } });
    await pg.goto(`${BASE}/png-to-dxf/`, { waitUntil: 'networkidle' });
    await pg.locator('input[type=file]').setInputFiles(SAMPLE);
    await pg.waitForSelector('[data-tool-parampanel]', { timeout: 120000 });
    const m = await pg.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      panelRight: document.querySelector('[data-tool-parampanel]')?.getBoundingClientRect().right,
    }));
    const overflow = m.scrollW > m.innerW || (m.panelRight ?? 0) > m.innerW + 0.5;
    if (overflow) { console.log(`✗ FAIL ${w}px: scrollW=${m.scrollW} panelRight=${m.panelRight}`); fails.push(`${w}px`); }
    else console.log(`✓ ${w}px zero overflow (scrollW=${m.scrollW} <= innerW=${m.innerW}, panelRight=${Math.round(m.panelRight)})`);
    await pg.locator('[data-tool-parampanel]').scrollIntoViewIfNeeded();
    await pg.screenshot({ path: `${OUT}/param-panel-${w}px.png` });
    await pg.close();
  }
  await browser.close();
  if (fails.length) { console.error('VIEWPORT OVERFLOW:', fails.join(', ')); process.exit(1); }
  console.log('VIEWPORTS: ALL PASS (screenshots in scripts/qa-evidence-bofu/)');
})();
