/* P1-5 acceptance evidence: price-bar element shots (desktop+mobile) + overflow metrics. */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'docs', 'evidence', 'p1-5-home-batch-2026-11-27');
const ROOT = path.join(__dirname, '..', 'out');

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
                   '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
                   '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.txt': 'text/plain' };
    res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  } else { res.statusCode = 404; res.end('nf'); }
});

(async () => {
  await new Promise((r) => server.listen(8893, r));
  const browser = await chromium.launch({ channel: 'chrome' });
  const results = [];
  for (const [label, vp] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    const pg = await browser.newPage({ viewport: vp });
    await pg.goto('http://127.0.0.1:8893/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    const ov = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const sec = pg.locator('section:has(a:has-text("or add a $29 batch pack"))').first();
    const shot = path.join(OUT, `pricebar-${label}-390or1280.png`.replace('390or1280', label === 'desktop' ? '1280' : '390'));
    await sec.screenshot({ path: shot });
    const txt = await sec.innerText();
    results.push({ label, overflowPx: ov, shot, hasFrozen: txt.includes('or add a $29 batch pack'), hrefOk: await sec.locator('a:has-text("or add a $29 batch pack")').getAttribute('href') });
    await pg.close();
  }
  await browser.close();
  server.close();
  console.log(JSON.stringify(results, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
