/* qa-shots-stage1.cjs — evidence screenshots: 3 routes × 3 viewports (360/768/1024).
 * Matches baseline composition scripts/qa-evidence/{home,p2d,laser}-{360,768,1024}.png
 * Output → scripts/qa-evidence-stage1/
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = path.join(__dirname, 'qa-evidence-stage1');
const SHOTS = [
  ['home', '/', 'wait-net'],
  ['p2d', '/png-to-dxf/', 'wait-net'],
  ['laser', '/png-to-dxf-for-laser-cutting/', 'wait-net'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, url, wait] of SHOTS) {
    for (const w of [360, 768, 1024]) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto(BASE + url, wait === 'wait-net' ? { waitUntil: 'networkidle' } : {});
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(OUT, `${name}-${w}.png`), fullPage: true });
      await page.close();
      console.log(`shot ${name}-${w}.png`);
    }
  }
  await browser.close();
})().catch((e) => { console.error('QA-ERROR', e.message); process.exit(1); });
