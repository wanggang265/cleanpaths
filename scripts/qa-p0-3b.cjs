#!/usr/bin/env node
/**
 * qa-p0-3b.cjs — /pt/ hub + 301 + lastmod 真实化 验收断言（落站单 P0-3b）。
 * 对象 = 本地构建产物 out/（构建后、部署前跑）。零新增视觉元素纪律的数字面检查。
 * 退出码 0 = 全绿；任何断言失败 -> 非零 + 逐条列出。
 */
const { readFileSync, existsSync } = require('node:fs');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'out');
const fails = [];
const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg) => { fails.push(msg); console.log(`  ✗ ${msg}`); };
const check = (cond, msg) => (cond ? ok(msg) : bad(msg));

const read = (p) => readFileSync(p, 'utf8');
const strip = (h) =>
  h.replace(/<script[\s\S]*?<\/script>/g, ' ')
   .replace(/<style[\s\S]*?<\/style>/g, ' ')
   .replace(/<[^>]+>/g, ' ')
   .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
   .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&gt;/g, '>')
   .replace(/\s+/g, ' ').trim();

// ---- 冻结串（05-copy-freeze-v1.19 §A/E，逐字） ----
const META_T = 'Conversores DXF e SVG em Português — Grátis | CleanPaths';
const META_D = 'Todos os conversores do CleanPaths em português: imagens para DXF pronto para corte e conversões de formato. Sem upload, sem cadastro.';
const H1 = 'Conversores DXF e SVG em Português — Grátis';
const E2_ROW = 'Versão em português: Todos os conversores →';

const PT16 = ['png-para-dxf','jpg-para-dxf','svg-para-dxf','jpeg-para-dxf','imagem-para-dxf','foto-para-dxf',
  'jfif-para-jpg','jfif-para-png','webp-para-svg','webp-para-png','webp-para-jpg','svg-para-png',
  'svg-para-jpg','jpeg-para-jpg','gif-para-jpg','bmp-para-jpg'];

console.log('— 1. /pt/ hub 产物 —');
const hubPath = join(OUT, 'pt', 'index.html');
if (!existsSync(hubPath)) { bad('out/pt/index.html MISSING'); process.exit(1); }
const hub = read(hubPath);
check(hub.includes('<html lang="pt-BR"'), 'html lang=pt-BR (SSR 直出正确值)');
check(hub.includes(`<title>${META_T}</title>`), 'META_T 逐字');
check(hub.includes(`<meta name="description" content="${META_D}"`), 'META_D 逐字');
check(hub.includes('<link rel="canonical" href="https://cleanpaths.io/pt/"'), 'canonical /pt/');
const hubHrefs = [...hub.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi)]
  .map((m) => `${m[1]}→${m[2]}`);
check(hubHrefs.includes('pt-BR→https://cleanpaths.io/pt/'), 'hreflang pt-BR 自身');
check(hubHrefs.includes('en→https://cleanpaths.io/'), 'hreflang en → EN 首页');
check(hubHrefs.includes('x-default→https://cleanpaths.io/'), 'hreflang x-default → EN 首页');
check(strip(hub).includes(H1), 'H1 逐字');
const hubLinks = [...new Set([...hub.matchAll(/href="\/pt\/([a-z0-9-]+\/)"/g)].map((m) => m[1]))];
check(hubLinks.length === 16, `/pt/ 出链 = 16（实际 ${hubLinks.length}）`);
const missing = PT16.filter((s) => !hubLinks.includes(`${s}/`));
check(missing.length === 0, `16 slug 对照 route-mapping v1.9 16/16${missing.length ? '，缺: ' + missing.join(',') : ''}`);
check(!hub.includes('id="dropzone"') && !hub.includes('type="file"'), '枢纽无 dropzone/文件输入');
check(!hub.includes('states'), '枢纽无 states 板引用');
const hubText = strip(hub);
check(!hubText.includes('$') && !hubText.includes('Assinatura') && !hubText.includes('ilimitado') && !hubText.includes('R$'), 'hub 域 $/Assinatura/ilimitado/R$ 零容忍');
check(hubText.includes('Todos os conversores'), 'hub 短名在位');

console.log('— 2. hub FAQPage schema 同源（§D 逐字） —');
const schemas = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((m) => JSON.parse(m[1]));
const flat = schemas.flat ? schemas.flat() : schemas.flat ? [] : [];
const allNodes = (Array.isArray(schemas) ? schemas : []).flatMap ? (Array.isArray(schemas[0]) ? schemas[0] : schemas) : [];
const faqNode = (Array.isArray(schemas) ? schemas : []).map((n) => (Array.isArray(n) ? n : [n])).flat()
  .find((n) => n && n['@type'] === 'FAQPage');
if (!faqNode) bad('FAQPage JSON-LD 缺失');
else {
  const ents = faqNode.mainEntity || [];
  check(ents.length === 5, `FAQPage mainEntity = 5（实际 ${ents.length}）`);
  const visQ = [...hub.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>/g)].map((m) => strip(m[1]))
    .filter((s) => s.length > 5); // 排除移动菜单 ☰ 摘要
  const visA = [...hub.matchAll(/<div class=['"]a['"]>([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]));
  let qSame = 0, aSame = 0;
  ents.forEach((e, i) => {
    if (visQ[i] && e.name === visQ[i]) qSame++;
    if (visA[i] && (e.acceptedAnswer || {}).text === visA[i]) aSame++;
  });
  check(qSame === 5, `schema Q == 可见 FAQ Q 5/5（实际 ${qSame}）`);
  check(aSame === 5, `schema A == 可见 FAQ A 5/5（实际 ${aSame}）`);
}

console.log('— 3. EN 首页入口 + 反向 hreflang（§E-2/E-3） —');
const home = read(join(OUT, 'index.html'));
check(strip(home).includes(E2_ROW), 'E-2 语言行逐字（整串入锚）');
check(/<link rel="alternate" hreflang="pt-BR" href="https:\/\/cleanpaths\.io\/pt\/"\/?>/i.test(home), 'EN 首页反向 hreflang pt-BR → /pt/');
check(home.includes('href="/pt/"'), 'EN 首页 /pt/ 链接在位');

console.log('— 4. 16 PT 页页脚 hub 回链 —');
let footOk = 0;
for (const s of PT16) {
  const p = join(OUT, 'pt', s, 'index.html');
  if (!existsSync(p)) { bad(`out/pt/${s}/index.html MISSING`); continue; }
  const h = read(p);
  if (h.includes('href="/pt/"') && strip(h).includes('Todos os conversores')) footOk++;
  else bad(`PT 页脚缺 hub 回链: ${s}`);
}
check(footOk === 16, `PT 页脚互链 16/16（实际 ${footOk}）`);

console.log('— 5. sitemap 数字一致性（方案A） —');
const sm = read(join(OUT, 'sitemap.xml'));
const urls = [...sm.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
check(urls.length === 48, `sitemap <url> = 48（实际 ${urls.length}）`);
const today = new Date().toISOString().slice(0, 10);
const locOf = (u) => (u.match(/<loc>([^<]+)<\/loc>/) || [])[1];
const lmOf = (u) => (u.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
let badDates = 0, futureDates = 0, missingLm = 0;
for (const u of urls) {
  const lm = lmOf(u);
  if (!lm) missingLm++;
  else {
    if (!/^\d{4}-\d{2}-\d{2}/.test(lm)) badDates++;
    if (lm.slice(0, 10) > today) futureDates++;
  }
}
check(missingLm === 0, '每条 <url> 带 lastmod');
check(badDates === 0, `lastmod 全部 YYYY-MM-DD 格式（坏 ${badDates}）`);
check(futureDates === 0, `lastmod 零未来时间（坏 ${futureDates}）`);
const hubUrl = urls.find((u) => locOf(u) === 'https://cleanpaths.io/pt/');
check(!!hubUrl, 'sitemap 含 /pt/');
if (hubUrl) check(lmOf(hubUrl).slice(0, 10) === today, `hub lastmod = 构建日 ${today}（新页回退口径）`);
const gitDate = (slug) => {
  try {
    return execSync(`git log -1 --format=%cI -- design-source/pages/${slug}`, { cwd: ROOT, encoding: 'utf8' })
      .trim().slice(0, 10);
  } catch { return ''; }
};
for (const [route, slug] of [['/', 'home'], ['/png-to-dxf/', 'png-to-dxf'], ['/pt/png-para-dxf/', 'pt-png-para-dxf'], ['/pricing/', 'pricing']]) {
  const expect = gitDate(slug);
  const u = urls.find((x) => locOf(x) === `https://cleanpaths.io${route}`);
  const got = u ? lmOf(u).slice(0, 10) : '(no url)';
  check(expect && got === expect, `lastmod git 锚 ${route} → ${got}（期望 ${expect}）`);
}

console.log('— 6. 301 规则文件 —');
const redir = read(join(ROOT, 'public', '_redirects'));
check(/^\/svg-to-dxf\/\s+\/svg-to-dxf-converter\/\s+301$/m.test(redir.trim().split('\n').map((l) => l.trimEnd()).join('\n')) || / SvgToDxf /.test(''),
  '_redirects: /svg-to-dxf/ → /svg-to-dxf-converter/ 301');
check(!redir.includes('/en/'), '301 目标无 /en/ 前缀（督办修正口径）');

console.log('— 7. 生产面 lang 全局复核（新页直出正确值口径；16 旧 PT 页 hydration 覆盖，P2 缓发） —');
check(hub.includes('<html lang="pt-BR"'), 'hub SSR lang=pt-BR（postbuild PT_PAGES 名单内）');

console.log('');
if (fails.length) { console.log(`QA-P0-3b: ${fails.length} FAILURE(S)`); process.exit(1); }
console.log('QA-P0-3b: ALL GREEN — /pt/ hub + 301 + lastmod 真实化验收通过');
