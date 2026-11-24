/* visual-regression.cjs — CI visual regression gate (open-items #111, HEAD anchor 949473f).
 * 测试对象 = HEAD 本地 out/（与 CF 部署时序解耦，ticket §6.1）。
 *
 * 断言对准实现（zhongshu assertion-calibration 先例方向，ticket §6.2 —— 禁止为实现凑绿改实现）。
 * 选择器/阈值来源（写死，来源即注释）：
 *   A 溢出: document.documentElement.scrollWidth <= clientWidth
 *           （headless-vision-responsive-qa skill「DOM 定量兜底」口径；
 *            Playwright headless 自带 --hide-scrollbars，clientWidth == 视口宽）
 *   B 挤压: 逐字复用 scripts/qa-stage1-local.cjs T1 校准逻辑（zhongshu ruling 2026-03-18 #3）：
 *           '.wrap *' 内 display:grid 且 computed gridTemplateColumns 的 px 轨道数 >=3 的容器，
 *           当子项(rect width>0) >=2 时 min(width) 必须 >=160px（<=2 轨道视为已降级，放行）。
 *           仅 768 档跑本断言（ticket T2-B 口径）。
 *   C 像素: 9 图 vs scripts/visual-baseline/ 逐张比对（in-browser canvas，per-channel）。
 *           尺寸不一致 → 直接 FAIL（布局位移零容忍）；通道差 >CH_TOL 记为差异像素；
 *           差异像素占比 >RATIO_TOL → FAIL。阈值取值依据见
 *           scripts/visual-regression-evidence/calibration.md（校准过程在案）。
 *
 * 只读复用（ticket §7 禁改清单，本脚本不修改它们）：
 *   - scripts/qa-server.cjs（out/ + COOP/COEP）——自动 spawn，就绪后跑断言，退出时回收。
 *     端口事实：qa-server.cjs 绑定 :8899（ticket §4 写「默认 :4173」系表述笔误，
 *     4173 只是 qa 脚本 BASE 默认值）。本脚本 BASE 默认与 server 对齐为 :8899，BASE env 可覆盖
 *     （例：BASE=https://cleanpaths.io 可做本地-生产交叉验证，ticket T1）。
 *   - 截图口径 = scripts/qa-shots-stage1.cjs：3 路由 × {360,768,1024}、viewport h=900、
 *     waitUntil:'networkidle' + 600ms、fullPage:true。
 *
 * 模式（ticket §6.3）：
 *   默认            diff 模式（CI/日常用）——截图到系统临时目录，与基线 diff，不碰基线本体。
 *   --update-baseline  重锚模式——仅人工在「已核销批次」后刷新基线（须工作树净 + HEAD 已核销）。
 *
 * fault-injection 验证钩子（ticket T3 三闸独立 trip；CI/日常绝不设置 VR_INJECT）：
 *   VR_INJECT=overflow        注入 2000px 宽 × 1px 高透明元素 → 真实 scrollWidth 溢出 → 仅 A trip
 *                             （1px 无背景无像素 → C 不受影响）
 *   VR_INJECT=squeeze         注入 3×100px 轨道合成网格（子项 100px <160px 阈值、无像素）
 *                             → 仅 B trip
 *   VR_INJECT=wrong-baseline  C 逐张与「下一张」基线比对（渲染/DOM 不变）→ 仅 C trip
 *   注入元素均带 data-vr-inject 属性，便于取证时识别。
 *
 * 退出语义：任何 FAIL → exit 1（CI 红，与 #23 gate fail 语义一致）。无 || true、无 continue-on-error。
 */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const os = require('os');

const REPO = path.join(__dirname, '..');
const BASELINE_DIR = path.join(__dirname, 'visual-baseline');
const EVIDENCE_DIR = path.join(__dirname, 'visual-regression-evidence');
const RUN_DIR = path.join(os.tmpdir(), 'visual-regression-current');

const UPDATE = process.argv.includes('--update-baseline');
const INJECT = process.env.VR_INJECT || '';
const BASE = process.env.BASE || 'http://localhost:8899';

/* 校准阈值 —— 依据 scripts/visual-regression-evidence/calibration.md（勿随意调大凑绿） */
const CH_TOL = 24;       // 单通道 RGB 差 <=24 视为字体渲染抖动（非差异像素）
const RATIO_TOL = 0.004; // 差异像素占比 >0.40% → FAIL（容忍抖动、不容忍布局位移）

/* 截图矩阵 = qa-shots-stage1.cjs 现行口径（ticket §4，3×3 固定，禁扩） */
const ROUTES = [
  ['home', '/'],
  ['p2d', '/png-to-dxf/'],
  ['laser', '/png-to-dxf-for-laser-cutting/'],
];
const WIDTHS = [360, 768, 1024];
const SHOTS = ROUTES.flatMap(([n]) => WIDTHS.map((w) => `${n}-${w}.png`));

/* fault-injection（ticket T3 三闸独立 trip；CI/日常绝不设置 VR_INJECT）：
 * 坑（实证，勿回退）：不能走 addInitScript/DOMContentLoaded——本站是 Next.js/React 水合站，
 * 水合修复会删除 React 管辖子树（.wrap 内）中不认识的节点（React #418/#423 实证）；
 * 且 init script 执行时机早于 DOM 构建（documentElement=null 崩溃实证）。
 * 因此注入必须发生在「断言前」（openRoute 的 networkidle+600ms+滚动收敛之后，水合已完成），
 * 用真函数 page.evaluate（同时绕开 addInitScript(string) 的表达式求值陷阱）。
 * 三个注入均无像素输出（透明/无内容）→ 只 trip 目标闸，互不污染。
 *   overflow        2000px×1px 透明元素 → 真实 scrollWidth 溢出 → 仅 A trip
 *   squeeze         3×100px 轨道合成网格（子项 100px<160px 阈值）→ 仅 B trip
 *   wrong-baseline  无 DOM 注入；C 逐张与「下一张」基线比对 → 仅 C trip（C 循环内实现） */
const INJECT_FNS = {
  overflow: async () => {
    const d = document.createElement('div');
    d.setAttribute('data-vr-inject', 'overflow');
    d.style.cssText = 'position:absolute;top:0;left:0;width:2000px;height:1px;background:transparent;border:0;';
    (document.body || document.documentElement).appendChild(d);
  },
  squeeze: async () => {
    const host = document.querySelector('.wrap') || document.body;
    const g = document.createElement('div');
    g.setAttribute('data-vr-inject', 'squeeze');
    g.style.cssText = 'display:grid;grid-template-columns:100px 100px 100px;';
    for (let i = 0; i < 3; i++) {
      const k = document.createElement('div');
      k.style.cssText = 'background:transparent;border:0;';
      g.appendChild(k);
    }
    host.appendChild(g);
  },
};

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS ${name}${extra ? ' ' + extra : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' ' + extra : ''}`); }
};

function httpOk(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (resp) => { resp.resume(); resolve(!!resp.statusCode && resp.statusCode < 500); });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => { req.destroy(); resolve(false); });
  });
}

/* 复用 scripts/qa-server.cjs（只读复用 = spawn，不修改）：已在跑则复用，否则代起 */
async function ensureServer() {
  if (await httpOk(BASE + '/')) { console.log(`server reuse: ${BASE}`); return null; }
  const child = spawn(process.execPath, [path.join(__dirname, 'qa-server.cjs')], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (await httpOk(BASE + '/')) { console.log('qa-server.cjs spawned (:8899, out/ + COOP/COEP)'); return child; }
  }
  child.kill();
  throw new Error('qa-server.cjs did not become ready on :8899');
}

async function openRoute(browser, name, route, w) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } }); // h=900 同 qa-shots-stage1
  await page.goto(BASE + route, { waitUntil: 'networkidle' }); // 同 qa-shots-stage1
  await page.waitForTimeout(600);
  /* 确定性加固（仅脚本侧，禁改 src/；依据 scripts/visual-regression-evidence/calibration.md）：
   * 实证 home@360 两处 .ba__imgs <img> 区域跨 run 像素抖动 0.28–0.56%（fullPage 视口展开
   * 触发图块异步重光栅化竞态）。加固：滚动全页触发懒加载 → 等全部 <img> complete+decode
   * 与 fonts.ready → 后续以「视口拉伸到整页高」单遍截图取代 fullPage 拼接。 */
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map(async (i) => {
      if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; });
      if (i.decode) { try { await i.decode(); } catch {} }
    }));
    await document.fonts.ready;
  });
  return page;
}

/* 单遍整页截图：视口拉到整页高（Chromium 单纹理上限 16384px 内），消除 fullPage
 * 拼接竞态；超高页兜底 fullPage。捕获方法对基线与当前帧保持一致。 */
async function shotFullPage(page, w, file) {
  const fullH = await page.evaluate(() => document.documentElement.scrollHeight);
  if (fullH <= 16000) {
    await page.setViewportSize({ width: w, height: fullH });
    await page.waitForTimeout(600); // 拉伸后重排 + 图块重光栅化收敛
    await page.screenshot({ path: file });
    await page.setViewportSize({ width: w, height: 900 }); // 复位
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }
}

/* A —— 水平零溢出（3 页 × 3 档） */
async function assertOverflow(page, name, w) {
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    return { sw: de.scrollWidth, cw: de.clientWidth };
  });
  ok(`A overflow ${name}@${w} scrollWidth<=clientWidth`, m.sw <= m.cw,
    `(scrollWidth=${m.sw} clientWidth=${m.cw}${INJECT === 'overflow' ? ' [inject]' : ''})`);
}

/* B —— 768 档多列网格子项 >=160px（qa-stage1-local.cjs T1 校准逻辑逐字复用） */
async function assertGridSqueeze(page, name) {
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.wrap *').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display !== 'grid') return;
      const tracks = cs.gridTemplateColumns.split(' ').filter((x) => x.endsWith('px'));
      if (tracks.length < 3) return; // <=2 cols = degraded, OK（校准先例口径）
      const kids = [...el.children].map((c) => c.getBoundingClientRect().width).filter((wd) => wd > 0);
      if (kids.length >= 2 && Math.min(...kids) < 160)
        out.push(`${el.className.toString().slice(0, 40)} tracks=${tracks.length} minKid=${Math.round(Math.min(...kids))}`);
    });
    return out;
  });
  ok(`B grid-squeeze ${name}@768 kids>=160px`, bad.length === 0,
    bad.length ? JSON.stringify(bad) + (INJECT === 'squeeze' ? ' [inject]' : '') : `(all grids healthy)`);
}

function pngDims(buf) { return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }; }

/* C —— 像素 diff（in-browser canvas，零新增 npm 依赖；package.json 白名单只许加 scripts 条目） */
async function diffImages(browser, curBuf, baseBuf, chTol) {
  const page = await browser.newPage();
  const res = await page.evaluate(async ({ aB64, bB64, tol }) => {
    const load = (b64) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('png decode failed'));
      img.src = 'data:image/png;base64,' + b64;
    });
    const [ia, ib] = await Promise.all([load(aB64), load(bB64)]);
    if (ia.width !== ib.width || ia.height !== ib.height)
      return { dimMismatch: { cur: [ia.width, ia.height], base: [ib.width, ib.height] } };
    const c = document.createElement('canvas');
    c.width = ia.width; c.height = ia.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(ia, 0, 0);
    const da = ctx.getImageData(0, 0, c.width, c.height);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(ib, 0, 0);
    const db = ctx.getImageData(0, 0, c.width, c.height);
    let diff = 0;
    const total = c.width * c.height;
    const vis = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < total; i++) {
      const o = i * 4;
      const d = Math.max(
        Math.abs(da.data[o] - db.data[o]),
        Math.abs(da.data[o + 1] - db.data[o + 1]),
        Math.abs(da.data[o + 2] - db.data[o + 2]),
      );
      if (d > tol) { diff++; vis.data[o] = 255; vis.data[o + 1] = 0; vis.data[o + 2] = 0; vis.data[o + 3] = 255; }
      else { const g = da.data[o]; vis.data[o] = g; vis.data[o + 1] = g; vis.data[o + 2] = g; vis.data[o + 3] = 255; }
    }
    let diffPng = null;
    if (diff > 0) { ctx.putImageData(vis, 0, 0); diffPng = c.toDataURL('image/png').split(',')[1]; }
    return { diff, total, ratio: diff / total, diffPng };
  }, { aB64: curBuf.toString('base64'), bB64: baseBuf.toString('base64'), tol: chTol });
  await page.close();
  return res;
}

(async () => {
  console.log(`== visual-regression gate (open-items #111) ==`);
  console.log(`BASE=${BASE} MODE=${UPDATE ? 'update-baseline' : 'diff'} INJECT=${INJECT || 'none'} CH_TOL=${CH_TOL} RATIO_TOL=${RATIO_TOL}`);
  if (INJECT && !INJECT_FNS[INJECT] && INJECT !== 'wrong-baseline')
    throw new Error(`unknown VR_INJECT=${INJECT}`);
  fs.mkdirSync(RUN_DIR, { recursive: true });
  const server = await ensureServer();
  const browser = await chromium.launch();

  try {
    /* 截图 + A/B 断言（DOM 断言须在页面关闭前做） */
    for (const [name, route] of ROUTES) {
      for (const w of WIDTHS) {
        const page = await openRoute(browser, name, route, w);
        if (INJECT && INJECT_FNS[INJECT]) await page.evaluate(INJECT_FNS[INJECT]); // 断言前注入（水合后）
        await assertOverflow(page, name, w);                     // A：3 页 × 3 档
        if (w === 768) await assertGridSqueeze(page, name);      // B：仅 768 档
        await shotFullPage(page, w, path.join(RUN_DIR, `${name}-${w}.png`));
        await page.close();
        console.log(`  shot ${name}-${w}.png`);
      }
    }

    if (UPDATE) {
      /* 重锚模式：当前截图即新基线（仅人工在已核销 HEAD 上执行；CI 恒走 diff） */
      fs.mkdirSync(BASELINE_DIR, { recursive: true });
      for (const f of SHOTS) fs.copyFileSync(path.join(RUN_DIR, f), path.join(BASELINE_DIR, f));
      console.log(`\nBASELINE UPDATED: ${SHOTS.length} images -> scripts/visual-baseline/`);
      console.log(`RESULT: ${pass} pass, ${fail} fail (A/B assertions informational in update mode)`);
      return;
    }

    /* 基线完整性：9 图缺一即 FAIL（防静默漏比） */
    const missing = SHOTS.filter((f) => !fs.existsSync(path.join(BASELINE_DIR, f)));
    ok(`baseline set complete (9 images)`, missing.length === 0,
      missing.length ? `missing: ${missing.join(',')}` : '');

    /* C —— 9 图逐张 diff */
    for (let i = 0; i < SHOTS.length; i++) {
      const shot = SHOTS[i];
      const baselineName = INJECT === 'wrong-baseline' ? SHOTS[(i + 1) % SHOTS.length] : shot;
      const curBuf = fs.readFileSync(path.join(RUN_DIR, shot));
      const baseBuf = fs.readFileSync(path.join(BASELINE_DIR, baselineName));
      const dCur = pngDims(curBuf); const dBase = pngDims(baseBuf);
      const tag = INJECT === 'wrong-baseline' ? ` (vs wrong baseline ${baselineName}) [inject]` : '';
      if (dCur.w !== dBase.w || dCur.h !== dBase.h) {
        ok(`C pixel ${shot}${tag}`, false, `dimensions differ: cur=${dCur.w}x${dCur.h} base=${dBase.w}x${dBase.h}`);
        /* 尺寸不一致同样落盘当前帧（取证；无 diff 图可生成） */
        fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
        const stemD = shot.replace(/\.png$/, '');
        fs.writeFileSync(path.join(EVIDENCE_DIR, `fail-${stemD}-current.png`), curBuf);
        continue;
      }
      const r = await diffImages(browser, curBuf, baseBuf, CH_TOL);
      const passC = r.ratio <= RATIO_TOL;
      ok(`C pixel ${shot}${tag}`, passC,
        `ratio=${(r.ratio * 100).toFixed(4)}% (${r.diff}/${r.total} px, tol ch>${CH_TOL} ratio>${(RATIO_TOL * 100).toFixed(2)}%)`);
      /* ticket T2：diff 超标图落盘证据目录（不覆盖基线本体） */
      if (!passC) {
        fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
        const stem = shot.replace(/\.png$/, '');
        fs.writeFileSync(path.join(EVIDENCE_DIR, `fail-${stem}-current.png`), curBuf);
        if (r.diffPng) fs.writeFileSync(path.join(EVIDENCE_DIR, `fail-${stem}-diff.png`), Buffer.from(r.diffPng, 'base64'));
      }
    }

    console.log(`\nRESULT: ${pass} pass, ${fail} fail  (A=9 overflow, B=3 squeeze, C=9 pixel, +1 baseline-set)`);
    if (fail > 0) console.log('GATE: FAIL — see FAIL lines above; diff artifacts in scripts/visual-regression-evidence/ (if pixel)');
    else console.log('GATE: PASS');
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('QA-ERROR', e.message); process.exit(1); });
