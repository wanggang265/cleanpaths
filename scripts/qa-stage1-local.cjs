/* qa-stage1-local.cjs — Stage-1 pure-fix ticket assertions against local out/ (BASE, default :4173).
 * CALIBRATED per zhongshu ruling 2026-03-18: assertions aligned to THIS ticket's implementation
 * (SoftwareApplication no-merchant-fields, /png-to-dxf-for-laser-cutting/ inbound link, .btn--primary
 * empty-state label 'Choose a file', gtag events in chunks). Direction: script→implementation only.
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:4173';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`  PASS ${name}`); } else { fail++; console.log(`  FAIL ${name} ${extra}`); } };

(async () => {
  const browser = await chromium.launch();

  /* T1 — 768 grid safety (ruling #3: 4-col kids >=160px OR degraded to <=2 tracks) */
  console.log('T1 @768 grids');
  const p768 = await browser.newPage({ viewport: { width: 768, height: 900 } });
  for (const url of ['/', '/png-to-dxf/', '/samples/', '/pricing/']) {
    await p768.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    await p768.waitForTimeout(1200);
    const bad = await p768.evaluate(() => {
      const out = [];
      document.querySelectorAll('.wrap *').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.display !== 'grid') return;
        const tracks = cs.gridTemplateColumns.split(' ').filter((x) => x.endsWith('px'));
        if (tracks.length < 3) return; // <=2 cols = degraded, OK
        const kids = [...el.children].map((c) => c.getBoundingClientRect().width).filter((w) => w > 0);
        if (kids.length >= 2 && Math.min(...kids) < 160)
          out.push(`${el.className.toString().slice(0, 40)} tracks=${tracks.length} minKid=${Math.round(Math.min(...kids))}`);
      });
      return out;
    });
    ok(`T1 ${url} >=3col grids kids>=160px`, bad.length === 0, JSON.stringify(bad));
  }

  /* T2 — mobile tool-before-copy: dropzone order:-1 at <=620px */
  console.log('T2 mobile order');
  const p360 = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await p360.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await p360.waitForTimeout(800);
  const t2m = await p360.evaluate(() => {
    const dz = document.querySelector('.hero__grid > div:has(.dropzone)');
    if (!dz) return { found: false };
    const sib = dz.previousElementSibling;
    return { found: true, order: getComputedStyle(dz).order, dzTop: dz.getBoundingClientRect().top, sibTop: sib ? sib.getBoundingClientRect().top : -1 };
  });
  ok('T2 @360 dropzone order:-1 & visually first', t2m.found && t2m.order === '-1' && t2m.dzTop < t2m.sibTop, JSON.stringify(t2m));
  await p360.setViewportSize({ width: 1024, height: 900 });
  await p360.waitForTimeout(400);
  const t2d = await p360.evaluate(() => { const dz = document.querySelector('.hero__grid > div:has(.dropzone)'); return dz ? getComputedStyle(dz).order : 'missing'; });
  ok('T2 @1024 order reset to 0', t2d === '0', `order=${t2d}`);

  /* T3 — schema: no hasMerchantReturnPolicy / shippingDetails anywhere; SoftwareApplication name is string */
  console.log('T3 schema');
  const hasKey = (o, key) => { if (!o || typeof o !== 'object') return false; if (Object.prototype.hasOwnProperty.call(o, key)) return true; return Object.values(o).some((v) => hasKey(v, key)); };
  for (const url of ['/png-to-dxf/', '/jpeg-to-dxf/', '/pricing/']) {
    const res = await p768.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    const html = await res.text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);
    ok(`T3 ${url} no merchant/shipping fields`, !blocks.some((b) => hasKey(b, 'hasMerchantReturnPolicy') || hasKey(b, 'shippingDetails')));
    if (url !== '/pricing/') {
      const nodes = blocks.flatMap((b) => (Array.isArray(b) ? b : b['@graph'] || [b]));
      const sa = nodes.find((n) => n['@type'] === 'SoftwareApplication');
      ok(`T3 ${url} SoftwareApplication name is string`, !!sa && typeof sa.name === 'string', sa ? `name type=${typeof sa.name}` : 'missing');
    }
  }

  /* T4 — laser-page internal links */
  console.log('T4 laser links');
  await p768.goto(BASE + '/png-to-dxf/', { waitUntil: 'domcontentloaded' });
  const t4a = await p768.evaluate(() => [...document.querySelectorAll('main a[href="/png-to-dxf-for-laser-cutting/"]')].map((a) => a.textContent.trim()));
  ok('T4 p2d -> laser link >=1, anchor laser-related', t4a.length >= 1 && t4a.some((t) => /laser/i.test(t)), JSON.stringify(t4a));
  await p768.goto(BASE + '/png-to-dxf-for-laser-cutting/', { waitUntil: 'domcontentloaded' });
  const t4b = await p768.evaluate(() => [...document.querySelectorAll('main a[href^="/png-to-dxf/"], main a[href^="/samples/"]')].length);
  ok('T4 laser page outbound to /png-to-dxf/ or /samples/ >=1', t4b >= 1, `count=${t4b}`);

  /* T5 — button empty-state label (EN only) */
  console.log('T5 button label');
  await p768.goto(BASE + '/png-to-dxf/', { waitUntil: 'domcontentloaded' });
  await p768.waitForFunction(() => { const b = document.querySelector('.dropzone .btn--primary:not([data-tool-dl])'); return b && b.textContent.trim() !== ''; }, { timeout: 8000 });
  await p768.waitForTimeout(1000);
  const t5en = await p768.evaluate(() => document.querySelector('.dropzone .btn--primary:not([data-tool-dl])')?.textContent.trim());
  ok('T5 EN empty-state label = "Choose a file"', t5en === 'Choose a file', `got="${t5en}"`);
  await p768.goto(BASE + '/pt/jpeg-para-dxf/', { waitUntil: 'domcontentloaded' });
  await p768.waitForTimeout(1000);
  const t5pt = await p768.evaluate(() => document.querySelector('.dropzone .btn--primary:not([data-tool-dl])')?.textContent.trim());
  ok('T5 PT label untouched (frozen copy)', !!t5pt && t5pt !== 'Choose a file', `got="${t5pt}"`);

  /* T6 — gtag events present in built chunks */
  console.log('T6 chunk events');
  const fs = require('fs'), path = require('path');
  const chunkDir = 'out/_next/static/chunks';
  const allJs = fs.readdirSync(chunkDir).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(chunkDir, f), 'utf8')).join('\n');
  for (const ev of ['upload_start', 'convert_success', 'file_type']) ok(`T6 chunk contains "${ev}"`, allJs.includes(ev));
  ok('T6 gtag guard present', allJs.includes('dataLayer') || allJs.includes('gtag'));

  await browser.close();
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('QA-ERROR', e.message); process.exit(1); });
