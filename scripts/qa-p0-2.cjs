#!/usr/bin/env node
// qa-p0-2.cjs — P0-2 修改完善计划 (2026-11-24, 王刚 GO) after-verification.
// Covers: item-1 nav dead-band fix + light-page hero reorder; item-4 (R1) CTA
// census is done via grep (see evidence log); item-5 two-stage button flow
// (EN+PT), format fast-fail, upload_start-once telemetry; R2 privacy para;
// 390px full-site overflow sweep; CLS re-measure vs before/cls-baseline.json.
// Usage: node scripts/qa-p0-2.cjs  (spawns qa-server on :8899 itself)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const EV = path.join(ROOT, 'docs', 'evidence', 'p0-2-2026-11-24', 'after');
fs.mkdirSync(EV, { recursive: true });

// real 1x1 JFIF/JPEG (SOI + JFIF APP0 + frame) — valid for repack & decode
const JPEG_B64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwcJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmgA//9k=';
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'p0q-'));
fs.writeFileSync(path.join(TMP, 'photo.jfif'), Buffer.from(JPEG_B64, 'base64'));
fs.writeFileSync(path.join(TMP, 'doc.pdf'), Buffer.from('%PDF-1.4 not an image'));

const results = [];
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail: String(detail).slice(0, 200) });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  return !!cond;
};

function walkRoutes(dir, base = '') {
  let routes = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) routes = routes.concat(walkRoutes(path.join(dir, e.name), base + '/' + e.name));
    else if (e.name === 'index.html') routes.push(base + '/');
  }
  return routes;
}

async function measureCLS(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        let sum = 0,
          n = 0;
        new PerformanceObserver((l) =>
          l.getEntries().forEach((e) => {
            if (!e.hadRecentInput) {
              sum += e.value;
              n++;
            }
          }),
        ).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve({ cls: sum, entries: n }), 900);
      }),
  );
}

(async () => {
  const server = spawn('node', [path.join(__dirname, 'qa-server.cjs')], { stdio: 'pipe' });
  await new Promise((r) => setTimeout(r, 700));
  const browser = await chromium.launch();
  const errors = [];

  try {
    // ---------- A. nav band probe (home) ----------
    {
      const page = await browser.newPage();
      const navLog = [];
      for (const w of [961, 960, 900, 768, 700, 621, 620, 390]) {
        await page.setViewportSize({ width: w, height: 844 });
        await page.goto('http://localhost:8899/', { waitUntil: 'networkidle' });
        const s = await page.evaluate(() => {
          const disp = (sel) => {
            const el = document.querySelector(sel);
            return el ? getComputedStyle(el).display : 'absent';
          };
          return {
            burger: disp('.nav-mobile'),
            more: disp('.nav-more'),
            cta: disp('.nav-cta-header'),
            navlinks: [...document.querySelectorAll('.main-nav a.navlink')].filter((a) => getComputedStyle(a).display !== 'none').length,
          };
        });
        navLog.push(`w=${w} navlinks ${s.navlinks}/7 | hamburger ${s.burger} | More ${s.more} | headerCTA ${s.cta}`);
        if (w >= 961) ok(`nav w=${w} desktop`, s.navlinks === 7 && s.burger === 'none' && s.cta !== 'none', JSON.stringify(s));
        else if (w >= 621) ok(`nav w=${w} band fixed`, s.burger === 'block' && s.more === 'none' && s.cta !== 'none', JSON.stringify(s));
        else ok(`nav w=${w} mobile`, s.burger === 'block' && s.cta === 'none', JSON.stringify(s));
      }
      fs.writeFileSync(path.join(EV, 'nav-probe-after.log'), `621-960 nav dead band (after fix, 2026-11-24):\n${navLog.join('\n')}\n`);

      // menu reachability at 768: open burger, count links, fetch each href
      await page.setViewportSize({ width: 768, height: 844 });
      await page.goto('http://localhost:8899/', { waitUntil: 'networkidle' });
      await page.click('.nav-mobile summary');
      const menu = await page.evaluate(() => {
        const m = document.querySelector('.nav-mobile .menu');
        const open = m && getComputedStyle(m).display !== 'none' && getComputedStyle(m.closest('.nav-mobile')).display !== 'none';
        return { open, hrefs: m ? [...m.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [] };
      });
      ok('nav w=768 menu opens', menu.open && menu.hrefs.length >= 7, `${menu.hrefs.length} links`);
      let all200 = true;
      for (const h of menu.hrefs) {
        const res = await page.request.get('http://localhost:8899' + h);
        if (res.status() !== 200) {
          all200 = false;
          console.log('   menu href not 200:', h, res.status());
        }
      }
      ok('nav w=768 menu links all 200', all200);
      await page.close();
    }

    // ---------- B/C/D/E/F/G shared helpers ----------
    const dlEvents = (page) =>
      page.evaluate(() => (window.dataLayer || []).filter((e) => e && e[0] === 'event' && e[1] === 'upload_start').length);

    // ---------- B. item-5 EN flow ----------
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 768, height: 844 });
      await page.goto('http://localhost:8899/jfif-to-jpg/', { waitUntil: 'networkidle' });
      const hydrate = await page.evaluate(() => document.querySelector('#convert .btn--primary')?.textContent?.trim());
      ok('EN hydration label = Choose a file', hydrate === 'Choose a file', hydrate);

      await page.setInputFiles('input[type=file]', path.join(TMP, 'photo.jfif'));
      await page.waitForSelector('.dz-selected', { timeout: 5000 });
      const chip = await page.evaluate(() => {
        const dz = document.querySelector('#convert');
        const name = document.querySelector('.dz-sel-name')?.textContent;
        const btn = document.querySelector('[data-tool-convert]');
        const staticBtn = [...dz.querySelectorAll(':scope > .btn--primary')][0];
        return {
          name,
          btn: btn?.textContent?.trim(),
          state: dz.dataset.state,
          staticHidden: staticBtn ? getComputedStyle(staticBtn).display === 'none' : true,
          iconHidden: getComputedStyle(document.querySelector('#convert .dz-icon') || document.body).display === 'none',
        };
      });
      ok('EN chip shows', chip.state === 'selected' && chip.btn === 'Convert' && chip.staticHidden && chip.iconHidden, JSON.stringify(chip));
      ok('EN chip filename', chip.name === 'photo.jfif', chip.name);
      ok('EN upload_start fired once at pick', (await dlEvents(page)) === 1);

      await page.click('[data-tool-convert]');
      await page.waitForSelector('[data-tool-dl]', { timeout: 40000 });
      ok('EN convert → Download appears', await page.isVisible('[data-tool-dl]'));
      ok('EN upload_start NOT re-fired on Convert', (await dlEvents(page)) === 1);
      await page.click('[data-tool-reset]');
      const after = await page.evaluate(() => document.querySelector('#convert .btn--primary')?.textContent?.trim());
      ok('EN reset restores empty state', after === 'Choose a file', after);
      await page.close();
    }

    // ---------- C. fast-fail preserved ----------
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 768, height: 844 });
      await page.goto('http://localhost:8899/jfif-to-jpg/', { waitUntil: 'networkidle' });
      const t0 = Date.now();
      await page.setInputFiles('input[type=file]', path.join(TMP, 'doc.pdf'));
      await page.waitForSelector('.state-note--error', { timeout: 3000 });
      const errText = await page.evaluate(() => document.querySelector('.state-note--error')?.textContent?.replace(/\s+/g, ' ').slice(0, 90));
      ok('EN invalid file fast-fails (frozen error)', Date.now() - t0 < 3000 && /can.t be converted/i.test(errText || ''), errText);
      ok('EN fast-fail upload_start counted', (await dlEvents(page)) === 1);
      await page.close();
    }

    // ---------- D. item-5 PT flow ----------
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 768, height: 844 });
      await page.goto('http://localhost:8899/pt/jfif-para-jpg/', { waitUntil: 'networkidle' });
      const staticLabel = await page.evaluate(() => document.querySelector('#convert .btn--primary')?.textContent?.trim());
      ok('PT static label = Testar grátis (no hydration)', staticLabel === 'Testar grátis', staticLabel);
      await page.setInputFiles('input[type=file]', path.join(TMP, 'photo.jfif'));
      await page.waitForSelector('.dz-selected', { timeout: 5000 });
      const btn = await page.evaluate(() => document.querySelector('[data-tool-convert]')?.textContent?.trim());
      ok('PT chip button = Converter', btn === 'Converter', btn);
      await page.click('[data-tool-convert]');
      await page.waitForSelector('[data-tool-dl]', { timeout: 40000 });
      ok('PT convert → Download appears', await page.isVisible('[data-tool-dl]'));
      await page.close();
    }

    // ---------- E. 390 overflow sweep (all routes) ----------
    {
      const page = await browser.newPage();
      const routes = walkRoutes(OUT).filter((r) => !r.startsWith('/404'));
      const offenders = [];
      for (const r of routes) {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:8899' + r, { waitUntil: 'load' });
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        if (sw > 391) offenders.push(`${r} scrollWidth=${sw}`);
      }
      ok(`390 overflow sweep (${routes.length} routes)`, offenders.length === 0, offenders.join(' | ') || 'no horizontal overflow');
      await page.close();
    }

    // ---------- F. hero order at 390 ----------
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 390, height: 844 });
      for (const r of ['/jfif-to-jpg/', '/pt/jfif-para-jpg/', '/png-to-dxf/', '/']) {
        await page.goto('http://localhost:8899' + r, { waitUntil: 'networkidle' });
        const tops = await page.evaluate(() => {
          const dz = document.querySelector('#convert');
          const h1 = document.querySelector('h1');
          return { dz: dz?.getBoundingClientRect().top ?? -1, h1: h1?.getBoundingClientRect().top ?? -1 };
        });
        ok(`390 dz-above-h1 ${r}`, tops.dz >= 0 && tops.dz < tops.h1, JSON.stringify(tops));
      }
      await page.close();
    }

    // ---------- G. CLS after (same method/routes/widths as before) ----------
    {
      const cls = [];
      for (const r of ['/', '/jfif-to-jpg/', '/pt/jfif-para-jpg/', '/png-to-dxf/']) {
        for (const w of [390, 768]) {
          const page = await browser.newPage();
          await page.setViewportSize({ width: w, height: 844 });
          await page.goto('http://localhost:8899' + r, { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts.ready);
          const m = await measureCLS(page);
          cls.push({ route: r, w, ...m });
          await page.close();
        }
      }
      fs.writeFileSync(path.join(EV, 'cls-after.json'), JSON.stringify(cls, null, 2));
      const before = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/evidence/p0-2-2026-11-24/before/cls-baseline.json'), 'utf8'));
      const regress = cls.filter((c, i) => c.cls > (before[i]?.cls ?? 0) + 0.005);
      ok('CLS no regression vs before', regress.length === 0, regress.map((c) => `${c.route}@${c.w} ${c.cls.toFixed(5)}`).join(' | ') || `max ${Math.max(...cls.map((c) => c.cls)).toFixed(5)}`);
    }

    // ---------- H. after screenshots ----------
    {
      const page = await browser.newPage();
      for (const [r, w, name] of [
        ['/', 390, 'home-390'],
        ['/', 768, 'home-768'],
        ['/jfif-to-jpg/', 390, 'jfif-to-jpg-390'],
        ['/jfif-to-jpg/', 768, 'jfif-to-jpg-768'],
        ['/pt/jfif-para-jpg/', 390, 'pt-jfif-para-jpg-390'],
        ['/png-to-dxf/', 390, 'png-to-dxf-390'],
      ]) {
        await page.setViewportSize({ width: w, height: 844 });
        await page.goto('http://localhost:8899' + r, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(EV, name + '.png'), fullPage: false });
      }
      await page.close();
    }
  } catch (e) {
    errors.push(e.message);
    console.error('SCRIPT ERROR:', e.message);
  } finally {
    fs.writeFileSync(path.join(EV, 'qa-p0-2-results.json'), JSON.stringify({ results, errors, at: new Date().toISOString() }, null, 2));
    await browser.close();
    server.kill();
  }
  const fails = results.filter((r) => !r.pass).length;
  console.log(`\n=== qa-p0-2: ${results.length - fails}/${results.length} PASS, ${fails} FAIL ===`);
  process.exit(fails || errors.length ? 1 : 0);
})();
