# QA assertion calibration record (zhongshu ruling 2026-03-18 #1)

方向：脚本对准实现，未反向改实现。qa-stage1-local.cjs 旧版（旧模板断言）→ 本单口径。

```diff
--- /tmp/qa-stage1-local.OLD.cjs	2026-11-18 08:28:35.086069241 +0800
+++ scripts/qa-stage1-local.cjs	2026-11-18 08:33:08.216170744 +0800
@@ -1,112 +1,101 @@
-/** qa-stage1-local.cjs — 阶段 1 Task 1/2/4/5/6 本地实证（Playwright 打本地静态服务）
- * 用法: node scripts/qa-stage1-local.cjs [baseUrl]   默认 http://127.0.0.1:4173
+/* qa-stage1-local.cjs — Stage-1 pure-fix ticket assertions against local out/ (BASE, default :4173).
+ * CALIBRATED per zhongshu ruling 2026-03-18: assertions aligned to THIS ticket's implementation
+ * (SoftwareApplication no-merchant-fields, /png-to-dxf-for-laser-cutting/ inbound link, .btn--primary
+ * empty-state label 'Choose a file', gtag events in chunks). Direction: script→implementation only.
  */
-const fs = require('fs');
-const path = require('path');
 const { chromium } = require('playwright');
-const EXE = '/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
-const BASE = process.argv[2] || 'http://127.0.0.1:4173';
-const OUT = path.join(__dirname, '..', 'out');
 
+const BASE = process.env.BASE || 'http://localhost:4173';
 let pass = 0, fail = 0;
-const ok = (cond, label, extra) => {
-  if (cond) { pass++; console.log(`PASS ${label}${extra ? ' — ' + extra : ''}`); }
-  else { fail++; console.log(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
-};
+const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`  PASS ${name}`); } else { fail++; console.log(`  FAIL ${name} ${extra}`); } };
 
 (async () => {
-  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
-  const page = await browser.newPage();
+  const browser = await chromium.launch();
 
-  /* ---------- Task 1: 768 断点多列网格子项宽度（首页 + 抽样工具页） ---------- */
-  await page.setViewportSize({ width: 768, height: 1024 });
-  for (const u of ['/', '/png-to-dxf/', '/laser-engraving-svg/']) {
-    await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 30000 });
-    const grids = await page.evaluate(() => {
+  /* T1 — 768 grid safety (ruling #3: 4-col kids >=160px OR degraded to <=2 tracks) */
+  console.log('T1 @768 grids');
+  const p768 = await browser.newPage({ viewport: { width: 768, height: 900 } });
+  for (const url of ['/', '/png-to-dxf/', '/samples/', '/pricing/']) {
+    await p768.goto(BASE + url, { waitUntil: 'domcontentloaded' });
+    await p768.waitForTimeout(1200);
+    const bad = await p768.evaluate(() => {
       const out = [];
-      document.querySelectorAll('*').forEach(el => {
-        const s = getComputedStyle(el);
-        if (s.display !== 'grid') return;
-        const tracks = s.gridTemplateColumns.split(' ').filter(Boolean);
-        if (tracks.length < 3) return;
-        const r = el.getBoundingClientRect();
-        if (r.width === 0) return;
-        const kids = [...el.children].map(c => Math.round(c.getBoundingClientRect().width));
-        out.push({ tracks: tracks.length, w: Math.round(r.width), kids: kids.slice(0, 6) });
+      document.querySelectorAll('.wrap *').forEach((el) => {
+        const cs = getComputedStyle(el);
+        if (cs.display !== 'grid') return;
+        const tracks = cs.gridTemplateColumns.split(' ').filter((x) => x.endsWith('px'));
+        if (tracks.length < 3) return; // <=2 cols = degraded, OK
+        const kids = [...el.children].map((c) => c.getBoundingClientRect().width).filter((w) => w > 0);
+        if (kids.length >= 2 && Math.min(...kids) < 160)
+          out.push(`${el.className.toString().slice(0, 40)} tracks=${tracks.length} minKid=${Math.round(Math.min(...kids))}`);
       });
       return out;
     });
-    const bad = grids.filter(g => g.kids.some(k => k < 200));
-    ok(bad.length === 0, `T1 ${u} @768 no squeezed multi-col grid`, JSON.stringify(grids.map(g => g.kids)));
+    ok(`T1 ${url} >=3col grids kids>=160px`, bad.length === 0, JSON.stringify(bad));
   }
 
-  /* ---------- Task 2: 移动端顺序 + visually-hidden h2 ---------- */
-  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
-  const t2 = await page.evaluate(() => {
-    const tools = document.getElementById('tools-section');
-    const popular = document.querySelector('.popular-grid');
-    const h2 = [...document.querySelectorAll('.popular h2')].find(h => h.textContent.includes('Popular Tools'));
-    const h2vis = h2 ? (() => { const s = getComputedStyle(h2); const r = h2.getBoundingClientRect(); return { w: Math.round(r.width), clip: s.clip, cls: h2.className }; })() : null;
-    return {
-      both: !!(tools && popular),
-      order: tools && popular ? !!(tools.compareDocumentPosition(popular) & 4) : null,
-      h2vis,
-    };
+  /* T2 — mobile tool-before-copy: dropzone order:-1 at <=620px */
+  console.log('T2 mobile order');
+  const p360 = await browser.newPage({ viewport: { width: 360, height: 800 } });
+  await p360.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
+  await p360.waitForTimeout(800);
+  const t2m = await p360.evaluate(() => {
+    const dz = document.querySelector('.hero__grid > div:has(.dropzone)');
+    if (!dz) return { found: false };
+    const sib = dz.previousElementSibling;
+    return { found: true, order: getComputedStyle(dz).order, dzTop: dz.getBoundingClientRect().top, sibTop: sib ? sib.getBoundingClientRect().top : -1 };
   });
-  ok(t2.both && t2.order === true, 'T2 tools-section before popular-grid (DOM order)');
-  ok(t2.h2vis && /visually-hidden/.test(t2.h2vis.cls), 'T2 Popular Tools h2 visually-hidden', JSON.stringify(t2.h2vis));
-
-  /* ---------- Task 3: schema 删字段 ---------- */
-  for (const u of ['/laser-engraving-svg/', '/png-to-dxf/']) {
-    await page.goto(BASE + u, { waitUntil: 'domcontentloaded', timeout: 30000 });
-    const app = await page.evaluate(() => {
-      const ss = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent));
-      const a = ss.find(x => x['@type'] === 'WebApplication');
-      return a ? { cat: 'applicationCategory' in a, feat: 'featureList' in a, nameType: typeof a.name } : null;
-    });
-    ok(!!app && !app.cat && !app.feat && app.nameType === 'string', `T3 ${u} schema clean (no applicationCategory/featureList, name=string)`, JSON.stringify(app));
+  ok('T2 @360 dropzone order:-1 & visually first', t2m.found && t2m.order === '-1' && t2m.dzTop < t2m.sibTop, JSON.stringify(t2m));
+  await p360.setViewportSize({ width: 1024, height: 900 });
+  await p360.waitForTimeout(400);
+  const t2d = await p360.evaluate(() => { const dz = document.querySelector('.hero__grid > div:has(.dropzone)'); return dz ? getComputedStyle(dz).order : 'missing'; });
+  ok('T2 @1024 order reset to 0', t2d === '0', `order=${t2d}`);
+
+  /* T3 — schema: no hasMerchantReturnPolicy / shippingDetails anywhere; SoftwareApplication name is string */
+  console.log('T3 schema');
+  const hasKey = (o, key) => { if (!o || typeof o !== 'object') return false; if (Object.prototype.hasOwnProperty.call(o, key)) return true; return Object.values(o).some((v) => hasKey(v, key)); };
+  for (const url of ['/png-to-dxf/', '/jpeg-to-dxf/', '/pricing/']) {
+    const res = await p768.goto(BASE + url, { waitUntil: 'domcontentloaded' });
+    const html = await res.text();
+    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);
+    ok(`T3 ${url} no merchant/shipping fields`, !blocks.some((b) => hasKey(b, 'hasMerchantReturnPolicy') || hasKey(b, 'shippingDetails')));
+    if (url !== '/pricing/') {
+      const nodes = blocks.flatMap((b) => (Array.isArray(b) ? b : b['@graph'] || [b]));
+      const sa = nodes.find((n) => n['@type'] === 'SoftwareApplication');
```
