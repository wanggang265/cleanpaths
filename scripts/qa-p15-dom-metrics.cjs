
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = '/home/ubuntu/projects/cleanpaths/out';
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(res); }
  else { res.statusCode = 404; res.end(); }
});
(async () => {
  await new Promise((r) => server.listen(8894, r));
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const [label, W] of [['desktop', 1280], ['mobile', 390]]) {
    const pg = await browser.newPage({ viewport: { width: W, height: 900 } });
    await pg.goto('http://127.0.0.1:8894/', { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(200);
    const m = await pg.evaluate(() => {
      const link = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'or add a $29 batch pack');
      const sec = link.closest('section');
      const p = link.closest('p');
      const btn = sec.querySelector('a.btn');
      const de = document.documentElement;
      const r = (el) => { const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), right: +b.right.toFixed(1), bottom: +b.bottom.toFixed(1) }; };
      const sr = sec.getBoundingClientRect();
      return {
        docOverflow: de.scrollWidth - de.clientWidth,
        section: { w: +sr.width.toFixed(1), right: +sr.right.toFixed(1) },
        link: r(link), para: r(p), btn: r(btn),
        linkInsideSection: link.getBoundingClientRect().right <= sr.right + 0.5 && link.getBoundingClientRect().left >= sr.left - 0.5,
        linkOverlapsBtn: btn ? (link.getBoundingClientRect().bottom > btn.getBoundingClientRect().top && link.getBoundingClientRect().top < btn.getBoundingClientRect().bottom && link.getBoundingClientRect().right > btn.getBoundingClientRect().left) : false,
        href: link.getAttribute('href'),
        text: p.textContent.replace(/\s+/g, ' ').trim().slice(-140),
      };
    });
    console.log(label, JSON.stringify(m, null, 1));
    await pg.close();
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
