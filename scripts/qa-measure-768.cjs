/** qa-measure-768.cjs — 实测 768 视口下多列网格子项宽度（Task 1 实证） */
const { chromium } = require('playwright');
const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const { execSync } = require('child_process');
const URLS = execSync('curl -s https://cleanpaths.io/sitemap.xml').toString()
  .match(/<loc>https:\/\/cleanpaths\.io([^<]+)<\/loc>/g)
  .map(s => s.replace(/<\/?loc>|https:\/\/cleanpaths\.io/g, ''));
(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 768, height: 1024 });
  for (const u of URLS) {
    await page.goto('https://cleanpaths.io' + u, { waitUntil: 'networkidle', timeout: 60000 });
    const grids = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('*').forEach(el => {
        const s = getComputedStyle(el);
        if (s.display !== 'grid') return;
        const tracks = s.gridTemplateColumns.split(' ').filter(Boolean);
        if (tracks.length < 3) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        const kids = [...el.children].map(c => Math.round(c.getBoundingClientRect().width));
        out.push({ cls: (el.className || '').toString().slice(0, 60), tracks: tracks.length, w: Math.round(r.width), top: Math.round(r.top), kids: kids.slice(0, 8) });
      });
      document.querySelectorAll('table.cmp, .cmp table, table').forEach(t => {
        const r = t.getBoundingClientRect();
        if (r.width === 0) return;
        const firstRow = t.querySelector('tr');
        const cells = firstRow ? [...firstRow.children].map(c => Math.round(c.getBoundingClientRect().width)) : [];
        out.push({ table: (t.className || t.parentElement.className || '').toString().slice(0, 40), w: Math.round(r.width), top: Math.round(r.top), cells });
      });
      return out;
    });
    console.log(u, JSON.stringify(grids));
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
