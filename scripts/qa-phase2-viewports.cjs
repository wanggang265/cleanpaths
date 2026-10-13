// qa-phase2-viewports.cjs — Phase 2 视口验收：/pricing 四卡 + /png-to-dxf cap 态
// 390/375/360/320px：无横向滚动；新串在 DOM；cap 态 conv 为折行 <p>。
const { chromium } = require('playwright');

const BASE = process.env.QA_BASE || 'http://localhost:8899';
const WIDTHS = [390, 375, 360, 320];
const DAY = new Date().toISOString().slice(0, 10);

(async () => {
  const browser = await chromium.launch();
  let failures = 0;
  const fail = (m) => { console.error('✗ ' + m); failures++; };
  const ok = (m) => console.log('✓ ' + m);

  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
    const page = await ctx.newPage();

    // --- /pricing ---
    await page.goto(`${BASE}/pricing/`, { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => document.scrollingElement.scrollWidth);
    if (sw > w) fail(`pricing @${w}px: horizontal overflow scrollWidth=${sw}`);
    else ok(`pricing @${w}px: no horizontal overflow`);
    const body = await page.evaluate(() => document.body.innerText);
    for (const s of ['Personal use', 'Commercial license — for client work and selling what you make',
                     'Includes commercial use.', 'What counts as commercial use?',
                     'officially commercial']) {
      if (!body.includes(s)) fail(`pricing @${w}px: missing "${s}"`);
    }
    const cards = await page.locator('.price-card').count();
    if (cards < 3) fail(`pricing @${w}px: expected >=3 price cards, got ${cards}`);

    // --- /png-to-dxf cap state (force counter to 10, then attempt a conversion) ---
    await page.addInitScript(([d]) => {
      localStorage.setItem('cp.free.day', d);
      localStorage.setItem('cp.free.count', '10');
    }, [DAY]);
    await page.goto(`${BASE}/png-to-dxf/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.locator('input[type=file]').setInputFiles('/tmp/qa-pixel.png');
    await page.waitForTimeout(600);
    const sw2 = await page.evaluate(() => document.scrollingElement.scrollWidth);
    if (sw2 > w) fail(`png-to-dxf cap @${w}px: horizontal overflow scrollWidth=${sw2}`);
    const convText = 'On a deadline? Pro is built for client work — commercial license, AI HD rescue, and no daily cap.';
    const capHtml = await page.evaluate(() => document.body.innerText);
    if (!capHtml.includes(convText)) fail(`png-to-dxf cap @${w}px: new conv line not rendered`);
    else ok(`png-to-dxf cap @${w}px: conv line rendered, scrollWidth=${sw2}`);
    // conv renders as wrapping <p>, not a horizontal badge row
    const convEl = await page.evaluate(() => {
      const ps = [...document.querySelectorAll('p')];
      const p = ps.find((x) => x.textContent.includes('Pro is built for client work'));
      if (!p) return null;
      const r = p.getBoundingClientRect();
      return { height: r.height, width: r.width, lines: Math.round(r.height / parseFloat(getComputedStyle(p).lineHeight)) };
    });
    if (convEl && convEl.lines < 2 && w <= 360) fail(`png-to-dxf cap @${w}px: conv did not wrap (lines=${convEl.lines})`);

    await ctx.close();
  }

  await browser.close();
  if (failures) { console.error(`\n${failures} FAILURES`); process.exit(1); }
  console.log('\nQA PASS: viewports 390/375/360/320 — pricing cards + cap state clean');
})();
