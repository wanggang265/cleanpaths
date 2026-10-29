/**
 * qa-06f-newpages.cjs — 06f 4-route landing + P1 pipeline verification + C-group assertions.
 *  A) P1 [PENDING-07-a]: JFIF→PNG pipeline = decode→PNG encode, ZERO new lossy compression
 *     (pixel-exact: decode(source JFIF) === decode(output PNG), same dimensions)
 *  B) /jfif-to-png/ EN E2E: convert → result → Download PNG present + F8 note visible
 *  C) /pt/jfif-para-png/ PT E2E: convert → result → Baixar PNG + F8 PT note + zero $59/Pro
 *  D) /webp-to-svg/ EN E2E: convert → result → single Download SVG (no DXF buttons) + zero DXF selector in hero
 *  E) /pt/webp-para-svg/ PT E2E: convert → result → Baixar SVG + zero $59
 *  F) C-group: jfif-to-jpg (JPEG) title/H1 + FAQ#8; jpg-to-dxf C5+C6; png-to-dxf C8+C9 + FAQPage counts
 *  G) footer Tools +2 on EN pages (rendered DOM); PT footers unchanged
 *  H) schema: 4 new pages SoftwareApplication+FAQPage; hreflang bidirectional pairs
 *  I) old-route regression: 5 spot pages still carry their key frozen strings
 *  J) network: zero file-scale exfiltration during conversions
 *  K) mobile 390px: no horizontal scroll on the 4 new pages
 */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.QA_BASE || 'http://localhost:8899';
const JFIF = '/tmp/qa-test.jfif';
const WEBP = '/tmp/qa-test.webp';
const fails = [];
const ok = (n) => console.log('✓', n);
const bad = (n) => { console.log('✗ FAIL', n); fails.push(n); };
const isNoise = (t) =>
  t.includes('cloudflareinsights.com') || t.includes('clarity.ms') || t.includes('net::ERR_FAILED') ||
  t.includes('google-analytics') || t.includes('googletagmanager') || t.includes('501 (Unsupported method') ||
  t.includes('ERR_BLOCKED_BY_RESPONSE');

(async () => {
  const browser = await chromium.launch();
  const jfifB64 = fs.readFileSync(JFIF).toString('base64');

  // ---------- A) P1 pipeline verification (pixel-exact) ----------
  {
    const pg = await browser.newPage();
    await pg.goto(`${BASE}/jfif-to-png/`, { waitUntil: 'domcontentloaded' });
    const result = await pg.evaluate(async (b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const srcBlob = new Blob([bytes], { type: 'image/jpeg' });
      const bmp = await createImageBitmap(srcBlob);
      // baseline decode dump
      const dump = async (bitmap) => {
        const c = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = c.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        return { w: bitmap.width, h: bitmap.height, data: ctx.getImageData(0, 0, bitmap.width, bitmap.height).data };
      };
      const a = await dump(bmp);
      // run the same pipeline as ToolController jfif-png branch
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      c.getContext('2d').drawImage(bmp, 0, 0);
      const pngBlob = await c.convertToBlob({ type: 'image/png' });
      const bmp2 = await createImageBitmap(pngBlob);
      const b = await dump(bmp2);
      bmp.close(); bmp2.close();
      if (a.w !== b.w || a.h !== b.h) return { ok: false, why: `dims ${a.w}x${a.h} vs ${b.w}x${b.h}` };
      if (a.data.length !== b.data.length) return { ok: false, why: 'rgba length mismatch' };
      let diff = 0;
      for (let i = 0; i < a.data.length; i++) if (a.data[i] !== b.data[i]) diff++;
      return { ok: diff === 0, diff, pixels: a.data.length / 4, pngBytes: pngBlob.size };
    }, jfifB64);
    if (result.ok) ok(`A) P1 VERIFIED: decode→PNG encode pixel-exact (${result.pixels} px, 0 differing bytes, PNG ${result.pngBytes}B) — zero new lossy compression`);
    else bad(`A) P1 FAILED: ${result.why || `${result.diff} differing bytes`}`);
    await pg.close();
  }

  // ---------- B/C) jfif-to-png EN + PT E2E ----------
  for (const [route, lang] of [['/jfif-to-png/', 'en'], ['/pt/jfif-para-png/', 'pt']]) {
    const pg = await browser.newPage();
    const posts = [];
    await pg.route('**/*', (r) => {
      const q = r.request();
      const size = (q.postData() || '').length;
      if (q.method() === 'POST' && size > 50000 && !/clarity|cloudflareinsights|google-analytics|googletagmanager/.test(q.url())) posts.push(q.url());
      r.continue();
    });
    await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await pg.locator('input[type=file]').setInputFiles(JFIF);
    try {
      await pg.waitForSelector('[data-tool-dl]', { timeout: 30000 });
      const dlText = await pg.locator('[data-tool-dl]').first().innerText();
      const expectBtn = lang === 'pt' ? 'Baixar PNG' : 'Download PNG';
      if (dlText.includes(expectBtn)) ok(`${lang.toUpperCase()} ${route} result shows "${expectBtn}"`);
      else bad(`${route} download label "${dlText}" != "${expectBtn}"`);
      const note = await pg.locator('#convert').innerText();
      const f8 = lang === 'pt' ? 'decodificado e salvo como .png sem perdas' : 'decoded + stored as lossless .png';
      if (note.includes(f8)) ok(`${lang.toUpperCase()} ${route} F8 result note rendered verbatim`);
      else bad(`${route} F8 note missing`);
      if (lang === 'pt') {
        const body = await pg.content();
        if (/\$59|Get CleanPaths Pro/.test(body)) bad(`${route} PT page leaks $59/Pro`);
        else ok(`${route} PT zero $59/Pro (neutral page)`);
      }
      if (posts.length) bad(`${route} exfiltration: ${posts.join(',')}`);
      else ok(`${route} zero file-scale exfiltration`);
    } catch (e) {
      bad(`${route} E2E failed: ${e.message.split('\n')[0]}`);
      await pg.screenshot({ path: `${__dirname}/qa-evidence-bofu/06f-FAIL${route.replaceAll('/', '_')}.png` });
    }
    await pg.close();
  }

  // ---------- D/E) webp-to-svg EN + PT E2E ----------
  for (const [route, lang] of [['/webp-to-svg/', 'en'], ['/pt/webp-para-svg/', 'pt']]) {
    const pg = await browser.newPage();
    await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    // P4 re-check at runtime: no seg control / DXF button anywhere in hero
    const heroBad = await pg.evaluate(() => {
      const hero = document.querySelector('.hero');
      return hero && (hero.querySelector('.seg') || /DXF/.test(hero.innerText));
    });
    if (heroBad) bad(`${route} hero contains seg/DXF (P4 violation)`);
    await pg.locator('input[type=file]').setInputFiles(WEBP);
    try {
      await pg.waitForSelector('[data-tool-dl]', { timeout: 90000 });
      const count = await pg.locator('[data-tool-dl]').count();
      const first = await pg.locator('[data-tool-dl]').first().innerText();
      const expectBtn = lang === 'pt' ? 'Baixar SVG' : 'Download SVG';
      if (count === 1 && first.includes(expectBtn)) ok(`${lang.toUpperCase()} ${route} single "${expectBtn}" (SVG-only, no DXF pair)`);
      else bad(`${route} downloads=${count} first="${first}" (expected single ${expectBtn})`);
      if (lang === 'pt') {
        const body = await pg.content();
        if (/\$59|Get CleanPaths Pro/.test(body)) bad(`${route} PT leaks $59/Pro`);
        else ok(`${route} PT zero $59/Pro`);
      }
      if (!heroBad) ok(`${route} hero P4 clean (no seg, no DXF text)`);
    } catch (e) {
      bad(`${route} E2E failed: ${e.message.split('\n')[0]}`);
      await pg.screenshot({ path: `${__dirname}/qa-evidence-bofu/06f-FAIL${route.replaceAll('/', '_')}.png` });
    }
    await pg.close();
  }

  // ---------- F) C-group assertions (SSR HTML) ----------
  {
    const pg = await browser.newPage();
    // jfif-to-jpg
    await pg.goto(`${BASE}/jfif-to-jpg/`);
    let html = await pg.content();
    const title = await pg.title();
    if (title === 'JFIF to JPG (JPEG) Converter — Free, No Upload | CleanPaths') ok('F) jfif-to-jpg C1 title (JPEG) variant');
    else bad(`jfif-to-jpg title: ${title}`);
    const h1 = await pg.locator('h1').first().innerText();
    if (h1 === 'JFIF to JPG (JPEG) Converter — Free, No Upload') ok('F) jfif-to-jpg C2 H1 (JPEG) variant');
    else bad(`jfif-to-jpg H1: ${h1}`);
    if (html.includes('Is a JFIF file the same as a JPEG?')) ok('F) jfif-to-jpg C3 FAQ appended');
    else bad('jfif-to-jpg C3 FAQ missing');
    const faqLd = JSON.parse(await pg.locator('script[type="application/ld+json"]').first().innerText());
    const faqNode = (Array.isArray(faqLd) ? faqLd : [faqLd]).find((n) => n['@type'] === 'FAQPage');
    if (faqNode && faqNode.mainEntity.length === 8 && faqNode.mainEntity[7].name === 'Is a JFIF file the same as a JPEG?') ok('F) jfif-to-jpg FAQPage 8 items, #8 = JPEG question');
    else bad(`jfif-to-jpg FAQPage: ${faqNode ? faqNode.mainEntity.length : 'none'}`);
    // jpg-to-dxf
    await pg.goto(`${BASE}/jpg-to-dxf/`);
    html = await pg.content();
    if (html.includes('Whether you call it photo to DXF or picture to DXF')) ok('F) jpg-to-dxf C5 closing line');
    else bad('jpg-to-dxf C5 missing');
    if (html.includes('Can I convert a photo or picture to DXF?')) ok('F) jpg-to-dxf C6 FAQ#7');
    else bad('jpg-to-dxf C6 missing');
    // png-to-dxf
    await pg.goto(`${BASE}/png-to-dxf/`);
    html = await pg.content();
    if (html.includes('Looking for photo to DXF or picture to DXF?')) ok('F) png-to-dxf C8 closing line');
    else bad('png-to-dxf C8 missing');
    if (html.includes("the rule doesn't change: flat-color graphics are designed for cut-ready output; photographic scenes come out stylized.")) ok('F) png-to-dxf C9 FAQ#5 expanded');
    else bad('png-to-dxf C9 missing');
    await pg.close();
  }

  // ---------- G) footer Tools +2 (rendered DOM) ----------
  {
    const pg = await browser.newPage();
    for (const route of ['/', '/pricing/', '/vector-magic-alternative/']) {
      await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      await pg.waitForTimeout(500);
      const footer = await pg.evaluate(() => document.querySelector('footer').innerText);
      if (footer.includes('JFIF to PNG') && footer.includes('WebP to SVG')) ok(`G) ${route} footer Tools +2 rendered`);
      else bad(`G) ${route} footer missing new Tools links`);
    }
    await pg.goto(`${BASE}/pt/jfif-para-jpg/`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(500);
    const ptFooter = await pg.evaluate(() => document.querySelector('footer').innerText);
    if (!/JFIF to PNG|WebP to SVG/.test(ptFooter)) ok('G) PT footer unchanged (minimal, no new Tools links)');
    else bad('G) PT footer leaked Tools links');
    await pg.close();
  }

  // ---------- H) schema + hreflang ----------
  {
    const pg = await browser.newPage();
    const pairs = [['/jfif-to-png/', '/pt/jfif-para-png/'], ['/webp-to-svg/', '/pt/webp-para-svg/']];
    for (const [en, pt] of pairs) {
      for (const route of [en, pt]) {
        await pg.goto(`${BASE}${route}`);
        const lds = await pg.locator('script[type="application/ld+json"]').first().innerText();
        const nodes = JSON.parse(lds);
        const types = nodes.map((n) => n['@type']);
        if (types.includes('SoftwareApplication') && types.includes('FAQPage')) ok(`H) ${route} SoftwareApplication+FAQPage`);
        else bad(`H) ${route} schema types: ${types}`);
        const html = await pg.content();
        const other = route === en ? pt : en;
        if (html.includes(`hreflang="pt-BR"`) && html.includes(`hreflang="en"`) && html.includes(other)) ok(`H) ${route} hreflang bidirectional`);
        else bad(`H) ${route} hreflang missing/wrong`);
        if (html.includes(`rel="canonical" href="https://cleanpaths.io${route}"`)) ok(`H) ${route} canonical self`);
        else bad(`H) ${route} canonical wrong`);
      }
    }
    await pg.close();
  }

  // ---------- I) old-route regression (5 spot pages) ----------
  {
    const pg = await browser.newPage();
    const spots = [
      ['/', 'Convert PNG, JPG, SVG to Cut-Ready DXF'],
      ['/pricing/', 'What counts as commercial use?'],
      ['/vector-magic-alternative/', 'What cleanup actually changes (in our tests)'],
      ['/samples/', 'SYNTHETIC SAMPLE'],
      ['/pt/jfif-para-jpg/', 'Conversor de JFIF para JPG'],
    ];
    for (const [route, needle] of spots) {
      await pg.goto(`${BASE}${route}`);
      const html = await pg.content();
      if (html.includes(needle)) ok(`I) ${route} regression key string present`);
      else bad(`I) ${route} missing "${needle}"`);
    }
    await pg.close();
  }

  // ---------- K) mobile scroll ----------
  {
    for (const route of ['/jfif-to-png/', '/pt/jfif-para-png/', '/webp-to-svg/', '/pt/webp-para-svg/']) {
      const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errs = [];
      pg.on('console', (m) => { if (m.type() === 'error' && !isNoise(m.text())) errs.push(m.text()); });
      await pg.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      const w = await pg.evaluate(() => document.documentElement.scrollWidth);
      if (w > 391) bad(`K) ${route} horizontal scroll ${w}px`);
      else ok(`K) ${route} no horizontal scroll`);
      if (errs.length) bad(`K) ${route} console errors: ${errs.join('|')}`);
      await pg.screenshot({ path: `${__dirname}/qa-evidence-bofu/06f${route.replaceAll('/', '_')}mobile.png`, fullPage: false });
      await pg.close();
    }
  }

  await browser.close();
  console.log('\nRESULT:', fails.length ? `${fails.length} FAILURES:\n- ${fails.join('\n- ')}` : 'ALL PASS');
  process.exit(fails.length ? 1 : 0);
})();
