/* qa-44x200.cjs — full-route regression against sitemap.xml (local out/ server).
 * Writes scripts/qa-evidence-stage1/44x200.md table; exit 1 unless all 200.
 */
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = path.join(__dirname, 'qa-evidence-stage1');

(async () => {
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https:\/\/cleanpaths\.io/, ''));
  console.log(`${urls.length} URLs in sitemap`);
  const rows = [];
  for (const u of urls) {
    const res = await fetch(BASE + u, { redirect: 'manual' });
    rows.push({ url: u, status: res.status });
    if (res.status !== 200) console.log(`  NON-200 ${res.status} ${u}`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const md = ['# 44×200 regression (local out/, BASE=' + BASE + ')', '', `Run: ${new Date().toISOString()}`, '', '| # | URL | Status |', '|---|---|---|',
    ...rows.map((r, i) => `| ${i + 1} | ${r.url} | ${r.status} |`),
    '', `**${rows.filter((r) => r.status === 200).length}/${rows.length} → 200**`].join('\n');
  fs.writeFileSync(path.join(OUT, '44x200.md'), md);
  console.log(`RESULT: ${rows.filter((r) => r.status === 200).length}/${rows.length} 200`);
  process.exit(rows.every((r) => r.status === 200) ? 0 : 1);
})().catch((e) => { console.error('QA-ERROR', e.message); process.exit(1); });
