#!/usr/bin/env node
/**
 * debugview-probe.cjs — OI-6 §8.6 DebugView probe (production, read-only site usage).
 *
 * Fires the 8 client events from analytics-spec §8.6 on https://cleanpaths.io with
 * debug_mode injected at runtime (queued before gtag.js loads) so every event lands
 * in GA4 DebugView. No production config changed.
 *
 * Evidence capture survives cross-document navigation two ways:
 *  1. sessionStorage mirror (300ms interval, per-document, survives same-tab nav)
 *  2. creem.io checkout navigation aborted in the pricing context so the
 *     document (and its dataLayer) stays alive after checkout_started.
 *
 * Evidence: docs/evidence/p0-4-ga4-debugview/oi6-probe-events.json
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE = 'https://cleanpaths.io';
const OUT = path.join(__dirname, '..', 'docs', 'evidence', 'p0-4-ga4-debugview', 'oi6-probe-events.json');
// Minimal valid 1x1 JPEG with APP0 JFIF marker (doubles as a .jfif fixture).
const JFIF_B64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
  'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy' +
  'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIA' +
  'AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA' +
  'AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3' +
  'ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm' +
  'p6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA' +
  'AwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx' +
  'BhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK' +
  'U1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3' +
  'uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vL09PX29vj5+v/aAAwDAQACEQMRAD8A9/4o' +
  'ooooo//9k=';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Ground-truth capture: GA4 collect requests (what DebugView actually shows).
// GET /g/collect?v=2&en=<event>&dl=<page_location>&ep.<param>=... — nav-proof.
const netEvents = [];
const oobEvents = [];
function wireConsole(page, ctxLabel) {
  page.on('console', (msg) => {
    const t = msg.text();
    if (t.startsWith('OOBEVENT ')) oobEvents.push({ ctx: ctxLabel, en: t.slice(9) });
  });
}

function wireNetwork(page, ctxLabel) {
  page.route('**/g/collect**', async (route) => {
    const req = route.request();
    const u = req.url();
    const p = new URL(u).searchParams;
    const base = { ctx: ctxLabel, dl: p.get('dl') };
    const body = req.postData();
    if (body) {
      try {
        const j = JSON.parse(body);
        for (const e of j.events || []) {
          const ep = e.params || {};
          netEvents.push({
            ...base,
            en: e.name,
            file_type: ep.file_type,
            slot: ep.slot,
            plan: ep.plan,
            path: ep.path,
            from_lang: ep.from_lang,
            to_lang: ep.to_lang,
          });
        }
        return;
      } catch {}
    }
    netEvents.push({
      ...base,
      en: p.get('en'),
      file_type: p.get('ep.file_type') || p.get('epn.file_type') || undefined,
      slot: p.get('ep.slot') || undefined,
      plan: p.get('ep.plan') || undefined,
      path: p.get('ep.path') || undefined,
      from_lang: p.get('ep.from_lang') || undefined,
      to_lang: p.get('ep.to_lang') || undefined,
    });
    route.continue().catch(() => {});
  });
}

async function newCtx(browser, seedCap = false) {
  const ctx = await browser.newContext({ bypassCSP: true });
  await ctx.addInitScript((cap) => {
    function oob(en) {
      try {
        console.log('OOBEVENT ' + en);
      } catch {}
    }
    window.dataLayer = window.dataLayer || [];
    const __origPush = window.dataLayer.push.bind(window.dataLayer);
    // Sync intercept: gtag stub pushes arguments objects (['event', name, params]);
    // capture at push time — survives even instant location.assign afterwards.
    window.dataLayer.push = function (...args) {
      try {
        const x = args[0];
        if (x && typeof x === 'object' && x[0] === 'event' && x[1]) oob(x[1]);
        else if (x && typeof x === 'object' && !Array.isArray(x) && typeof x.event === 'string') oob(x.event);
      } catch {}
      return __origPush.apply(this, args);
    };
    window.dataLayer.push(['set', 'debug_mode', true]);
    if (cap) {
      localStorage.setItem('cp.free.day', new Date().toISOString().slice(0, 10));
      localStorage.setItem('cp.free.count', '10');
    }
    // Mirror gtag events to sessionStorage at push time (300ms poll) — survives
    // same-tab navigation, so events fired right before location.assign are
    // still readable from the next document.
    window.__cpProbeCapture = [];
    setInterval(() => {
      try {
        const evs = (window.dataLayer || [])
          .filter((x) => x && x[0] === 'event')
          .map((x) => x[1]);
        for (const e of evs) {
          if (!window.__cpProbeCapture.includes(e)) {
            window.__cpProbeCapture.push(e);
            new Image().src = 'http://127.0.0.1:9911/b?e=' + encodeURIComponent(e) + '&c=' + Date.now();
          }
        }
        const prev = JSON.parse(sessionStorage.getItem('cp_probe_events') || '[]');
        sessionStorage.setItem('cp_probe_events', JSON.stringify([...new Set([...prev, ...window.__cpProbeCapture])]));
      } catch {}
    }, 200);
  }, seedCap);
  const ctxOpts = { bypassCSP: true };
  return ctx;
}

// Snapshot: current document dataLayer ∪ sessionStorage mirror.
async function snap(page, label, seen) {
  const evs = await page.evaluate(() => {
    const dl = (window.dataLayer || []).filter((x) => x && x[0] === 'event').map((x) => x[1]);
    let ss = [];
    try {
      ss = JSON.parse(sessionStorage.getItem('cp_probe_events') || '[]');
    } catch {}
    return [...new Set([...dl, ...ss])];
  });
  seen.push({ label, url: page.url(), events: evs });
  console.log(`[${label}] → ${evs.join(', ') || '(none)'}`);
}

// Click via bubbling MouseEvent dispatch — bypasses overlay hit-testing and
// works for SVG anchors too (no el.click dependency).
async function evalClick(page, findJs) {
  return page.evaluate(`(() => {
    const find = ${findJs};
    const el = find();
    if (!el) return 'NOT_FOUND';
    try {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return 'DISPATCHED';
    } catch (e) {
      if (typeof el.click === 'function') { el.click(); return 'CLICKED'; }
      return 'FAIL:' + (el.tagName || typeof el) + ':' + e.message;
    }
  })()`);
}

const PRO_CTA_TEXT = 'Get CleanPaths Pro';
const proCtaIn = (scope) =>
  `() => { const s=${scope}; const els=[...s.querySelectorAll('a[href="#checkout"]')]; if (els[0]) return els[0]; const byText=[...s.querySelectorAll('a')].filter(e=>(e.textContent||'').includes('${PRO_CTA_TEXT}')); return byText[0] || null; }`;
const langLink = (idx) =>
  `() => { const els=[...document.querySelectorAll('a')].filter(e=>/English version/.test(e.textContent||'') && !e.closest('svg')); const el=${idx} < 0 ? els[els.length + ${idx}] : els[${idx}]; if(!el) return null; return el; }`;

const byText = (sel, text) =>
  `() => [...document.querySelectorAll('${sel}')].find((e) => (e.textContent || '').includes('${text}'))`;

(async () => {
  const fixture = path.join(os.tmpdir(), `probe-${Date.now()}.jfif`);
  fs.writeFileSync(fixture, Buffer.from(JFIF_B64, 'base64'));

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessRespectsPreflight'],
  });
  const seen = [];

  // ── Context A: main conversion flow (EN) ──
  const ctxA = await newCtx(browser);
  const page = await ctxA.newPage();
  wireConsole(page, 'A-conversion');
  wireNetwork(page, 'A-conversion');
  page.setDefaultTimeout(30000);

  await page.goto(`${BASE}/jfif-to-jpg/`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await snap(page, '1.tool-en-loaded', seen);

  await page.setInputFiles('input[type="file"]', fixture);
  await sleep(1200);
  await snap(page, '2.upload_start-expected', seen);

  await evalClick(page, byText('button', 'Convert'));
  await sleep(1500);
  await snap(page, '3.convert_started-expected', seen);

  await page
    .waitForFunction(
      () =>
        !document.querySelector('div[role="status"]') ||
        (document.querySelector('div[role="status"]').textContent || '') === '',
      { timeout: 25000 },
    )
    .catch(() => {});
  await sleep(1000);
  await snap(page, '4.convert_success-expected', seen);

  await evalClick(page, byText('a,button', 'Download'));
  await sleep(1200);
  await snap(page, '5.download-expected', seen);
  await ctxA.close();

  // ── Context B: pricing — abort the creem.io redirect so the document
  // (dataLayer) survives checkout_started; events still fire before assign. ──
  const ctxB = await newCtx(browser);
  const pb = await ctxB.newPage();
  wireConsole(pb, 'B-pricing');
  wireNetwork(pb, 'B-pricing');
  pb.setDefaultTimeout(30000);
  await pb.goto(`${BASE}/pricing/`, { waitUntil: 'networkidle' });
  await sleep(1200);
  await snap(pb, '6.pricing_view-expected', seen);

  const r7 = await evalClick(pb, proCtaIn('document'));
  console.log(`[pricing-cta-click] ${r7}`);
  await sleep(4000);
  await snap(pb, '7.buy_click-pricing+checkout_started-expected', seen);
  await ctxB.close();

  // ── Context C: language_switch (PT→EN, header + footer) ──
  const ctxC = await newCtx(browser);
  const pc = await ctxC.newPage();
  wireConsole(pc, 'C-language');
  wireNetwork(pc, 'C-language');
  pc.setDefaultTimeout(30000);
  await pc.goto(`${BASE}/pt/jfif-para-jpg/`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await snap(pc, '8.tool-pt-page_location-expected', seen);

  const hdrOk = await evalClick(pc, langLink(0));
  await sleep(1200);
  console.log(`[lang-header-clicked] ${hdrOk}`);
  await snap(pc, '9.language_switch-header-expected', seen);

  await pc.goto(`${BASE}/pt/jfif-para-jpg/`, { waitUntil: 'networkidle' });
  await sleep(1500);
  const ftrOk = await evalClick(pc, langLink(-1));
  await sleep(1200);
  console.log(`[lang-footer-clicked] ${ftrOk}`);
  await snap(pc, '10.language_switch-footer-expected', seen);
  await ctxC.close();

  // ── Context D: cap state → buy_click slot=cap ──
  const ctxD = await newCtx(browser, true);
  const pd = await ctxD.newPage();
  wireConsole(pd, 'D-cap');
  wireNetwork(pd, 'D-cap');
  pd.setDefaultTimeout(30000);
  await pd.goto(`${BASE}/jfif-to-jpg/`, { waitUntil: 'networkidle' });
  await sleep(1500);
  // cap state renders only inside run()'s quota gate: select file → Convert →
  // rejected (count=10 seeded) → cap HTML replaces dropzone content.
  await pd.setInputFiles('input[type="file"]', fixture);
  await sleep(1000);
  await evalClick(pd, byText('button', 'Convert'));
  await sleep(2000);
  const capVisible = await pd.evaluate(() => Boolean(document.querySelector('.state-note--cap')));
  console.log(`[cap-state-visible] ${capVisible}`);
  const capOk = await evalClick(pd, proCtaIn("document.querySelector('.dropzone') || document"));
  console.log(`[cap-cta-clicked] ${capOk}`);
  await sleep(4000);
  await snap(pd, '11.buy_click-cap-expected', seen);
  await ctxD.close();

  // ── Context F: cricut page CTA → buy_click slot=cricut ──
  const ctxF = await newCtx(browser);
  const pf = await ctxF.newPage();
  wireConsole(pf, 'F-cricut');
  pf.setDefaultTimeout(30000);
  await pf.goto(`${BASE}/for/cricut-sellers/`, { waitUntil: 'networkidle' });
  await sleep(1500);
  const rF = await evalClick(pf, proCtaIn('document'));
  console.log(`[cricut-cta-click] ${rF}`);
  await sleep(3000);
  await snap(pf, '13.buy_click-cricut-expected', seen);
  await ctxF.close();

  // ── Context E: pricing_view ?checkout=success return-landing variant ──
  const ctxE = await newCtx(browser);
  const pe = await ctxE.newPage();
  wireConsole(pe, 'E-checkout-success');
  wireNetwork(pe, 'E-checkout-success');
  await pe.goto(`${BASE}/pricing/?checkout=success`, { waitUntil: 'networkidle' });
  await sleep(1200);
  await snap(pe, '12.pricing_view-checkout-success-expected', seen);
  await ctxE.close();

  await browser.close();
  fs.unlinkSync(fixture);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, seen, network: netEvents, oob: oobEvents }, null, 2));
  console.log('=== OUT-OF-BAND EVENTS (nav-proof, via console channel) ===');
  for (const o of oobEvents) console.log(`${o.ctx}  ${o.en}`);
  console.log('\n=== NETWORK TRUTH (GA4 collect) ===');
  for (const n of netEvents) console.log(`${n.ctx}  ${n.en}  dl=${n.dl || '-'}${n.file_type ? ' file_type=' + n.file_type : ''}${n.slot ? ' slot=' + n.slot : ''}${n.plan ? ' plan=' + n.plan : ''}${n.path ? ' path=' + n.path : ''}${n.from_lang ? ' ' + n.from_lang + '→' + n.to_lang : ''}`);
  console.log(`\nDONE — evidence → ${OUT}`);
})().catch((e) => {
  console.error('PROBE FAILED:', e.message);
  process.exit(1);
});
