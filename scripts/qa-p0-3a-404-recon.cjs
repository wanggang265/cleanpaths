// P0-3a GSC 404 侦察证据 — 生产 404/200 实拍（系统 Chrome，#111 已验证方法）
// 产出: scripts/qa-evidence-p0-3a/*.png + JSON 断言
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'qa-evidence-p0-3a');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'https://cleanpaths.io';
// 幽灵候选（预期 404）+ /pt/ hub 缺位（预期 404，hub 上线后自愈）+ 权威页对照（预期 200）
const TARGETS = [
  { url: '/pt/converter-png-para-dxf/', expect: 404, tag: 'ghost-task-cited' },
  { url: '/pt/bmp-to-jpg/', expect: 404, tag: 'ghost-wo-typo-enform' },
  { url: '/pt/screenshot-para-svg/', expect: 404, tag: 'ghost-wo-mention' },
  { url: '/svg-to-dxf/', expect: 404, tag: 'ghost-en-wo-typo-110' },
  { url: '/pt/', expect: 404, tag: 'hub-missing-p0-3a-scope' },
  { url: '/pt/png-para-dxf/', expect: 200, tag: 'authoritative-pt-control' },
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const results = [];
  for (const t of TARGETS) {
    const resp = await page.goto(BASE + t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const status = resp ? resp.status() : 0;
    const file = path.join(OUT_DIR, `probe${t.url.replace(/\//g, '_') || '_root'}-${status}.png`);
    await page.screenshot({ path: file, fullPage: false });
    results.push({ url: BASE + t.url, status, expect: t.expect, pass: status === t.expect, screenshot: file, title: await page.title().catch(() => '') });
    console.log(`${status === t.expect ? 'PASS' : 'FAIL'} ${t.url} -> ${status} (expect ${t.expect}) shot=${path.basename(file)}`);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'probe-results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, results }, null, 2));
  const allPass = results.every(r => r.pass);
  console.log(allPass ? 'ALL PASS' : 'HAS FAIL');
  await browser.close();
  process.exit(allPass ? 0 : 1);
})();
