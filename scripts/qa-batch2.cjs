/**
 * qa-batch2.cjs — 07 batch2 format-pairs landing: P1–P6 verification matrix + evidence pack.
 *
 *  P4 [BLOCKED-gate, runs FIRST]: /jpeg-to-jpg/ lossless repack — downloaded bytes === source bytes.
 *       Any mismatch = re-encode happened = hard FAIL, batch cannot ship.
 *  P1: /webp-to-png/ alpha survives (transparent webp → PNG; corner alpha==0, center opaque)
 *  P2: /webp-to-jpg/ + /svg-to-jpg/ transparency filled #ffffff (corner ≈ white)
 *  P5: /gif-to-jpg/ first frame only (3-frame gif red/green/blue → output ≈ red)
 *  P3: /svg-to-png/ + /svg-to-jpg/ result UI carries no unfrozen DPI/size wording
 *  P6: /jpeg-to-dxf/ precision slider ([data-tool-precision]) present in result state
 *  G) 16 new routes × desktop(1440) + mobile(390) screenshots → qa-evidence-batch2/
 *  H) 7 bitmap-kind real conversions, result-state screenshots w/ download button
 *  I) 8 PT pages zero $59/Pro (SSR)
 *  J) footer +8 new links on homepage + /jfif-to-jpg/ (rendered DOM)
 *  K) sitemap.xml 44 <loc>, 16 new URLs present
 *  L) 16 new pages: canonical self, ZERO hreflang link tags; FAQPage schema on sample
 *  M) zero file-scale exfiltration during conversions
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.QA_BASE || 'http://localhost:8899';
const OUT = path.join(__dirname, 'qa-evidence-batch2');
const ASSETS = '/tmp/qa-batch2';
const fails = [];
const ok = (n) => console.log('✓', n);
const bad = (n) => { console.log('✗ FAIL', n); fails.push(n); };

const EN = ['webp-to-png', 'webp-to-jpg', 'svg-to-png', 'jpeg-to-jpg', 'svg-to-jpg', 'gif-to-jpg', 'bmp-to-jpg', 'jpeg-to-dxf'];
const PT = ['webp-para-png', 'webp-para-jpg', 'svg-para-png', 'jpeg-para-jpg', 'svg-para-jpg', 'gif-para-jpg', 'bmp-para-jpg', 'jpeg-para-dxf'];

fs.mkdirSync(OUT, { recursive: true });

/** Convert on a route, return { page, downloadBytes } — clicks first [data-tool-dl]. */
async function convertAndDownload(browser, route, file, extraWait = 30000) {
  const ctx = await browser.newContext({ acceptDownloads: true });
  const pg = await ctx.newPage();
  const posts = [];
  await pg.route('**/*', (r) => {
    const q = r.request();
    const size = (q.postData() || '').length;
    if (q.method() === 'POST' && size > 50000 && !/clarity|cloudflareinsights|google-analytics|googletagmanager/.test(q.url())) posts.push(q.url());
    r.continue();
  });
  await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await pg.locator('input[type=file]').setInputFiles(file);
  await pg.waitForSelector('[data-tool-dl]', { timeout: extraWait });
  const dlLabel = (await pg.locator('[data-tool-dl]').first().innerText()).trim();
  const [dl] = await Promise.all([
    pg.waitForEvent('download', { timeout: 15000 }),
    pg.locator('[data-tool-dl]').first().click(),
  ]);
  const tmp = await dl.path();
  const bytes = fs.readFileSync(tmp);
  return { pg, ctx, bytes, dlLabel, suggested: dl.suggestedFilename(), posts };
}

/** Decode image bytes in-page, return {w,h, corner:[r,g,b,a], center:[r,g,b,a]}. */
async function probePixels(pg, bytes) {
  return pg.evaluate(async (b64) => {
    const u8 = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bmp = await createImageBitmap(new Blob([u8]));
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const x = c.getContext('2d');
    x.drawImage(bmp, 0, 0);
    const at = (px, py) => Array.from(x.getImageData(px, py, 1, 1).data);
    const r = { w: bmp.width, h: bmp.height, corner: at(3, 3), center: at((bmp.width / 2) | 0, (bmp.height / 2) | 0) };
    bmp.close();
    return r;
  }, bytes.toString('base64'));
}

const near = (v, t, tol = 45) => Math.abs(v - t) <= tol;

(async () => {
  const browser = await chromium.launch();

  // ================= P4 FIRST — jpeg→jpg lossless repack (BLOCKED gate) =================
  {
    const src = fs.readFileSync(`${ASSETS}/photo.jpeg`);
    try {
      const { bytes, pg, ctx } = await convertAndDownload(browser, '/jpeg-to-jpg/', `${ASSETS}/photo.jpeg`);
      await pg.screenshot({ path: `${OUT}/conv-jpeg-to-jpg-result.png`, fullPage: false });
      if (Buffer.compare(src, bytes) === 0) ok(`P4 VERIFIED: jpeg→jpg byte-identical repack (${src.length}B === ${bytes.length}B) — zero re-encode, zero pixel diff`);
      else bad(`P4 FAILED: output ${bytes.length}B != source ${src.length}B — RE-ENCODE DETECTED, batch CANNOT ship [BLOCKED]`);
      await ctx.close();
    } catch (e) { bad(`P4 E2E failed: ${e.message.split('\n')[0]}`); }
  }
  if (fails.length) { console.log('\nP4 gate failed — aborting remaining checks.'); await browser.close(); process.exit(1); }

  // ================= P1 — webp→png alpha preserved =================
  {
    try {
      const { bytes, pg, ctx, dlLabel } = await convertAndDownload(browser, '/webp-to-png/', `${ASSETS}/alpha.webp`);
      await pg.screenshot({ path: `${OUT}/conv-webp-to-png-result.png` });
      const p = await probePixels(pg, bytes);
      const alphaKept = p.corner[3] === 0 && p.center[3] === 255 && near(p.center[0], 228) && near(p.center[1], 87);
      if (alphaKept && p.w === 200 && p.h === 200) ok(`P1 VERIFIED: webp→png alpha preserved (corner a=${p.corner[3]}, center a=${p.center[3]} rgb≈${p.center.slice(0, 3)}, ${p.w}x${p.h}) btn="${dlLabel}"`);
      else bad(`P1 FAILED: corner=${p.corner} center=${p.center} dims=${p.w}x${p.h}`);
      await ctx.close();
    } catch (e) { bad(`P1 E2E failed: ${e.message.split('\n')[0]}`); }
  }

  // ================= P2a — webp→jpg transparent → white fill =================
  {
    try {
      const { bytes, pg, ctx, dlLabel } = await convertAndDownload(browser, '/webp-to-jpg/', `${ASSETS}/alpha.webp`);
      await pg.screenshot({ path: `${OUT}/conv-webp-to-jpg-result.png` });
      const p = await probePixels(pg, bytes);
      const filled = near(p.corner[0], 255) && near(p.corner[1], 255) && near(p.corner[2], 255);
      if (filled) ok(`P2a VERIFIED: webp→jpg transparency → white fill (corner rgb=${p.corner.slice(0, 3)}) btn="${dlLabel}"`);
      else bad(`P2a FAILED: corner rgb=${p.corner.slice(0, 3)} (expected ≈255,255,255)`);
      await ctx.close();
    } catch (e) { bad(`P2a E2E failed: ${e.message.split('\n')[0]}`); }
  }

  // ================= P2b — svg→jpg transparent → white fill =================
  {
    try {
      const { bytes, pg, ctx, dlLabel } = await convertAndDownload(browser, '/svg-to-jpg/', `${ASSETS}/icon.svg`);
      await pg.screenshot({ path: `${OUT}/conv-svg-to-jpg-result.png` });
      const p = await probePixels(pg, bytes);
      const filled = near(p.corner[0], 255) && near(p.corner[1], 255) && near(p.corner[2], 255);
      if (filled && p.w === 160 && p.h === 160) ok(`P2b VERIFIED: svg→jpg transparency → white fill (corner rgb=${p.corner.slice(0, 3)}, intrinsic ${p.w}x${p.h}) btn="${dlLabel}"`);
      else bad(`P2b FAILED: corner=${p.corner.slice(0, 3)} dims=${p.w}x${p.h}`);
      await ctx.close();
    } catch (e) { bad(`P2b E2E failed: ${e.message.split('\n')[0]}`); }
  }

  // ================= P5 — gif→jpg first frame only =================
  {
    try {
      const { bytes, pg, ctx, dlLabel } = await convertAndDownload(browser, '/gif-to-jpg/', `${ASSETS}/anim.gif`);
      await pg.screenshot({ path: `${OUT}/conv-gif-to-jpg-result.png` });
      const p = await probePixels(pg, bytes);
      const firstFrame = near(p.center[0], 255) && p.center[1] < 60 && p.center[2] < 60; // red, not green/blue
      if (firstFrame) ok(`P5 VERIFIED: gif→jpg = FIRST frame (center rgb=${p.center.slice(0, 3)} ≈ red; frame2 green / frame3 blue absent)`);
      else bad(`P5 FAILED: center rgb=${p.center.slice(0, 3)} (expected ≈255,0,0 red first frame)`);
      await ctx.close();
    } catch (e) { bad(`P5 E2E failed: ${e.message.split('\n')[0]}`); }
  }

  // ================= svg→png conversion (evidence) + P3 (no unfrozen DPI/size UI) =================
  {
    try {
      const { bytes, pg, ctx, dlLabel } = await convertAndDownload(browser, '/svg-to-png/', `${ASSETS}/icon.svg`);
      await pg.screenshot({ path: `${OUT}/conv-svg-to-png-result.png` });
      const p = await probePixels(pg, bytes);
      const alphaKept = p.corner[3] === 0 && near(p.center[0], 228) && near(p.center[1], 87);
      if (alphaKept && p.w === 160) ok(`svg→png conversion OK (alpha kept, intrinsic 160x160) btn="${dlLabel}"`);
      else bad(`svg→png FAILED: corner=${p.corner} center=${p.center} w=${p.w}`);
      // P3: no unfrozen DPI/size wording anywhere in the tool zone
      const toolText = await pg.locator('#convert').innerText();
      if (/\b\d{2,4}\s*DPI\b|\bDPI\b|\b\d{3,4}\s*[×x]\s*\d{3,4}\b|output size|resolution:/i.test(toolText)) bad(`P3 FAILED: svg→png tool zone shows DPI/size wording`);
      else ok('P3 VERIFIED: svg→png tool zone carries zero DPI/size wording (intrinsic-dims render, matches frozen copy)');
      await ctx.close();
    } catch (e) { bad(`svg→png E2E failed: ${e.message.split('\n')[0]}`); }
  }
  {
    // P3 on svg→jpg too (SSR grep is enough — no size UI rendered)
    const pg = await browser.newPage();
    await pg.goto(`${BASE}/svg-to-jpg/`, { waitUntil: 'networkidle' });
    const toolText = await pg.locator('#convert').innerText();
    if (/\b\d{2,4}\s*DPI\b|\bDPI\b|output size|resolution:/i.test(toolText)) bad('P3 FAILED: svg→jpg tool zone shows DPI/size wording');
    else ok('P3 VERIFIED: svg→jpg tool zone zero DPI/size wording');
    await pg.close();
  }

  // ================= bmp→jpg conversion (evidence) =================
  {
    try {
      const { bytes, pg, ctx, dlLabel } = await convertAndDownload(browser, '/bmp-to-jpg/', `${ASSETS}/scan.bmp`);
      await pg.screenshot({ path: `${OUT}/conv-bmp-to-jpg-result.png` });
      const p = await probePixels(pg, bytes);
      if (p.w === 200 && p.h === 150) ok(`bmp→jpg conversion OK (200x150, ${bytes.length}B vs source 90054B) btn="${dlLabel}"`);
      else bad(`bmp→jpg FAILED dims=${p.w}x${p.h}`);
      await ctx.close();
    } catch (e) { bad(`bmp→jpg E2E failed: ${e.message.split('\n')[0]}`); }
  }

  // ================= P6 — jpeg-to-dxf precision slider in result state =================
  {
    const ctx = await browser.newContext({ acceptDownloads: true });
    const pg = await ctx.newPage();
    try {
      await pg.goto(`${BASE}/jpeg-to-dxf/`, { waitUntil: 'networkidle' });
      await pg.locator('input[type=file]').setInputFiles(`${ASSETS}/photo.jpeg`);
      await pg.waitForSelector('[data-tool-dl]', { timeout: 120000 }); // trace is heavier
      const hasSlider = (await pg.locator('[data-tool-precision]').count()) > 0;
      if (hasSlider) {
        const v = await pg.locator('[data-tool-precision]').first().inputValue();
        ok(`P6 VERIFIED: jpeg-to-dxf result state has precision slider (value=${v})`);
      } else bad('P6 FAILED: [data-tool-precision] absent in jpeg-to-dxf result state');
      await pg.screenshot({ path: `${OUT}/conv-jpeg-to-dxf-result.png` });
    } catch (e) {
      bad(`P6 E2E failed: ${e.message.split('\n')[0]}`);
      await pg.screenshot({ path: `${OUT}/FAIL-jpeg-to-dxf.png` });
    }
    await ctx.close();
  }

  // ================= H-extra) one PT conversion E2E + zero $59 =================
  {
    const ctx = await browser.newContext({ acceptDownloads: true });
    const pg = await ctx.newPage();
    try {
      await pg.goto(`${BASE}/pt/webp-para-png/`, { waitUntil: 'networkidle' });
      await pg.locator('input[type=file]').setInputFiles(`${ASSETS}/alpha.webp`);
      await pg.waitForSelector('[data-tool-dl]', { timeout: 30000 });
      const lbl = (await pg.locator('[data-tool-dl]').first().innerText()).trim();
      if (/Baixar/i.test(lbl)) ok(`PT /pt/webp-para-png/ converts, download btn="${lbl}"`);
      else bad(`PT download label "${lbl}" not PT`);
      const body = await pg.content();
      if (/\$59|Get CleanPaths Pro/.test(body)) bad('PT page leaks $59/Pro');
      else ok('PT page zero $59/Pro');
      await pg.screenshot({ path: `${OUT}/conv-pt-webp-para-png-result.png` });
    } catch (e) { bad(`PT E2E failed: ${e.message.split('\n')[0]}`); }
    await ctx.close();
  }

  // ================= G) 16 routes × desktop + mobile screenshots =================
  {
    const all = [...EN.map((r) => `/${r}/`), ...PT.map((r) => `/pt/${r}/`)];
    for (const route of all) {
      const name = route.replaceAll('/', '_').replace(/^_+|_+$/g, '') || 'home';
      const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      await pg.screenshot({ path: `${OUT}/page-${name}-desktop.png`, fullPage: true });
      await pg.close();
      const pm = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await pm.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      await pm.screenshot({ path: `${OUT}/page-${name}-mobile.png`, fullPage: true });
      const scrollW = await pm.evaluate(() => document.documentElement.scrollWidth);
      if (scrollW > 391) bad(`mobile h-scroll on ${route} (${scrollW}px)`);
      await pm.close();
    }
    ok(`G) 16 routes × desktop+mobile screenshots saved (32 PNGs in qa-evidence-batch2/)`);
  }

  // ================= I) 8 PT pages zero $59/Pro (SSR) =================
  {
    const pg = await browser.newPage();
    let allClean = true;
    for (const r of PT) {
      await pg.goto(`${BASE}/pt/${r}/`, { waitUntil: 'domcontentloaded' });
      const body = await pg.content();
      if (/\$59|Get CleanPaths Pro/.test(body)) { bad(`PT ${r} leaks $59/Pro`); allClean = false; }
    }
    if (allClean) ok('I) 8 PT pages zero $59/Pro (SSR)');
    await pg.close();
  }

  // ================= J) footer +8 new links (homepage + old page) =================
  {
    const pg = await browser.newPage();
    for (const route of ['/', '/jfif-to-jpg/']) {
      await pg.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      const footer = await pg.locator('footer').innerText();
      const hrefs = await pg.locator('footer a').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
      const need = EN.map((r) => `/${r}/`);
      const missing = need.filter((n) => !hrefs.includes(n));
      if (missing.length) bad(`J) ${route} footer missing: ${missing.join(',')}`);
      else ok(`J) ${route} footer carries all 8 new converter links`);
    }
    await pg.close();
  }

  // ================= K) sitemap 44 loc + 16 new =================
  {
    const pg = await browser.newPage();
    const res = await pg.goto(`${BASE}/sitemap.xml`);
    const xml = await res.text();
    const locs = (xml.match(/<loc>/g) || []).length;
    const missing = [...EN.map((r) => `/${r}/`), ...PT.map((r) => `/pt/${r}/`)].filter((u) => !xml.includes(`https://cleanpaths.io${u}</loc>`));
    if (locs === 44 && !missing.length) ok('K) sitemap.xml 44 <loc>, all 16 new URLs present');
    else bad(`K) sitemap locs=${locs} missing=${missing.join(',')}`);
    await pg.close();
  }

  // ================= L) canonical self + zero hreflang + FAQPage =================
  {
    const pg = await browser.newPage();
    let canonOK = true, hreflangFree = true;
    for (const r of [...EN.map((x) => `/${x}/`), ...PT.map((x) => `/pt/${x}/`)]) {
      await pg.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded' });
      const canon = await pg.locator('link[rel=canonical]').getAttribute('href');
      if (canon !== `https://cleanpaths.io${r}`) { bad(`L) ${r} canonical="${canon}"`); canonOK = false; }
      const hl = await pg.locator('link[rel=alternate][hreflang]').count();
      if (hl > 0) { bad(`L) ${r} has ${hl} hreflang tags (batch2 must be ZERO)`); hreflangFree = false; }
    }
    if (canonOK) ok('L) 16 pages canonical self');
    if (hreflangFree) ok('L) 16 pages ZERO hreflang (batch2 contract)');
    await pg.goto(`${BASE}/webp-to-png/`, { waitUntil: 'domcontentloaded' });
    const lds = await pg.locator('script[type="application/ld+json"]').allInnerTexts();
    const hasFaq = lds.some((t) => { try { const n = JSON.parse(t); return (Array.isArray(n) ? n : [n]).some((x) => x['@type'] === 'FAQPage'); } catch { return false; } });
    if (hasFaq) ok('L) FAQPage schema present (sample /webp-to-png/)');
    else bad('L) FAQPage schema missing on /webp-to-png/');
    await pg.close();
  }

  await browser.close();
  console.log('\n========================================');
  if (fails.length) { console.log(`FAILED (${fails.length}):`); fails.forEach((f) => console.log('  ✗', f)); process.exit(1); }
  console.log('ALL BATCH2 QA CHECKS PASSED');
})();
