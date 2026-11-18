/** qa-t1-measure.cjs — 768 视口网格/表格子项实测（Task 1 验证） */
const { chromium } = require('playwright');
const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = process.argv[2] || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 768, height: 1024 });
  for (const u of ['/', '/png-to-dxf/', '/samples/', '/pricing/']) {
    await page.goto(BASE + u, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(800);
    const data = await page.evaluate(() => {
      const out = { grids: [], tables: [], overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      document.querySelectorAll('*').forEach(el => {
        const s = getComputedStyle(el);
        if (s.display !== 'grid') return;
        const tracks = s.gridTemplateColumns.split(' ').filter(Boolean);
        if (tracks.length < 3) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        const kids = [...el.children].map(c => Math.round(c.getBoundingClientRect().width));
        out.grids.push({ cls: (el.className || '').toString().slice(0, 50), tracks: tracks.length, kids: kids.slice(0, 6) });
      });
      document.querySelectorAll('table').forEach(t => {
        const r = t.getBoundingClientRect();
        if (r.width === 0) return;
        const sc = t.closest('.table-scroll');
        out.tables.push({ w: Math.round(r.width), scrollW: t.scrollWidth, inScrollWrap: !!sc, minW: sc ? getComputedStyle(t.querySelector('th') || t).minWidth : null });
      });
      return out;
    });
    console.log(u, JSON.stringify(data));
  }
  await browser.close();
})();
