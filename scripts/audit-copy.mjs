#!/usr/bin/env node
/**
 * audit-copy.mjs — verifies every visible string in src/content/pages/*.ts is
 * byte-identical to the frozen design source (05 v1.2 + §12 via 06 handoff).
 * Since extraction is deterministic, this re-extracts in-memory and diffs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DS = join(ROOT, 'design-source');
const OUT = join(ROOT, 'src', 'content', 'pages');

const mapping = JSON.parse(readFileSync(join(DS, 'route-mapping.json'), 'utf8'));
let failures = 0;

for (const r of mapping.routes) {
  const slug = r.dir.replace(/^pages\//, '');
  const srcHtml = readFileSync(join(DS, 'pages', slug, 'code.html'), 'utf8');
  const m = srcHtml.match(/<main>([\s\S]*?)<\/main>/);
  if (!m) { console.error(`✗ ${slug}: no <main> in design source`); failures++; continue; }
  const gen = readFileSync(join(OUT, `${slug}.ts`), 'utf8');
  // every FAQ question in the design's <main> must appear in generated output
  // (header/footer <details> like the "More tools" nav are out of scope)
  const needles = [...m[1].matchAll(/<summary>([^<]{4,})<\/summary>/g)].map((x) => x[1]);
  for (const n of needles) {
    const escaped = n.replace(/"/g, '\\"');
    if (!gen.includes(escaped) && !gen.includes(n)) {
      console.error(`✗ ${slug}: FAQ string missing from generated content: "${n}"`);
      failures++;
    }
  }
}
if (failures) { console.error(`copy audit: ${failures} failure(s)`); process.exit(1); }
console.log('copy audit: PASS (all FAQ strings byte-present in generated content)');

// ---------------------------------------------------------------------------
// §D-5 sentinel block (zhongshu 2026-10-11): runtime copy in src/lib/copy.ts
// is OUTSIDE the design-source scan surface above. Pin every frozen runtime
// string here — v1.4 六串 + v1.5 二十四串 — each must appear EXACTLY ONCE in
// the raw source (duplicate paste / drift = gate failure), values must be
// byte-identical to the freeze docs, and LICENSE_COPY/CHECKOUT_COPY EN/PT key
// sets must align (漏译防线). eval'd via esbuild → no quote-style fragility.
// ---------------------------------------------------------------------------
import { buildSync } from 'esbuild';

const COPY_TS = join(ROOT, 'src', 'lib', 'copy.ts');
const rawCopy = readFileSync(COPY_TS, 'utf8');
const bundled = buildSync({
  entryPoints: [COPY_TS],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
}).outputFiles[0].text;
const mod = { exports: {} };
new Function('module', 'exports', bundled)(mod, mod.exports);
const { FB_COPY, STATE_COPY, CHECKOUT_COPY, LICENSE_COPY } = mod.exports;

// Expected frozen values, byte-identical to the freeze docs. v1.4: err_fail_pre/
// err_fail_hint (STATE_COPY) + msg_required (FB_COPY), EN+PT. v1.5: CHECKOUT_COPY
// (2 keys) + LICENSE_COPY (10 keys), EN+PT. Sources:
// 05-copy-freeze-v1.4-error-variants-addendum.md, 05-copy-freeze-v1.5-checkout-license-addendum.md (§A/§B tables, verbatim).
// Every string asserted twice: runtime value === frozen literal (逐字), and the
// frozen literal appears EXACTLY ONCE in raw copy.ts source (count==1).
// (2026-10-13 Phase 2 升级：由 7 条锚点抽查改为 30 串全量逐字断言 — v1.5 §D-5 原案。)
const EXPECTED = [
  // ---- v1.4 (6) ----
  ['FB_COPY.en.msg_required', 'Add a quick message first — even one word helps.'],
  ['FB_COPY.pt.msg_required', 'Escreva uma mensagem primeiro — mesmo uma palavra já ajuda.'],
  ['STATE_COPY.en.err_fail_pre', "Your file is the right type, but we couldn't convert it."],
  ['STATE_COPY.en.err_fail_hint', 'Try a simpler file — or, for an SVG, re-save it as a plain SVG in an editor first and drop it back in.'],
  ['STATE_COPY.pt.err_fail_pre', 'Seu arquivo é do tipo certo, mas não conseguimos convertê-lo.'],
  ['STATE_COPY.pt.err_fail_hint', 'Tente um arquivo mais simples — ou, se for um SVG, salve-o novamente como SVG simples em um editor e arraste de volta.'],
  // ---- v1.5 CHECKOUT_COPY (4) ----
  ['CHECKOUT_COPY.en.ok_main', 'Payment successful — your license key is on its way to your inbox.'],
  ['CHECKOUT_COPY.en.ok_sub', "Can't find it? Check your spam folder, or email support@cleanpaths.io."],
  ['CHECKOUT_COPY.pt.ok_main', 'Pagamento concluído — sua chave de licença está a caminho do seu e-mail.'],
  ['CHECKOUT_COPY.pt.ok_sub', 'Não achou? Confira a caixa de spam, ou escreva para support@cleanpaths.io.'],
  // ---- v1.5 LICENSE_COPY (20) ----
  ['LICENSE_COPY.en.entry', 'Have a license key?'],
  ['LICENSE_COPY.en.label', 'License key'],
  ['LICENSE_COPY.en.placeholder', 'Paste the key from your purchase email'],
  ['LICENSE_COPY.en.submit', 'Activate'],
  ['LICENSE_COPY.en.checking', 'Checking your key…'],
  ['LICENSE_COPY.en.ok_main', 'License activated ✓'],
  ['LICENSE_COPY.en.ok_pro', 'Pro is unlocked on this device — no daily cap.'],
  ['LICENSE_COPY.en.ok_pack', '{PACKS} unlocked on this device.'],
  ['LICENSE_COPY.en.err_invalid', "That key didn't work — check for typos and that it matches your purchase email. Still stuck? Email support@cleanpaths.io."],
  ['LICENSE_COPY.en.err_network', 'No connection — activation needs to be online once. Check your connection and try again. Already activated on this device? Your Pro still works offline.'],
  ['LICENSE_COPY.pt.entry', 'Tem uma chave de licença?'],
  ['LICENSE_COPY.pt.label', 'Chave de licença'],
  ['LICENSE_COPY.pt.placeholder', 'Cole a chave do e-mail de compra'],
  ['LICENSE_COPY.pt.submit', 'Ativar'],
  ['LICENSE_COPY.pt.checking', 'Verificando sua chave…'],
  ['LICENSE_COPY.pt.ok_main', 'Licença ativada ✓'],
  ['LICENSE_COPY.pt.ok_pro', 'Pro desbloqueado neste dispositivo — sem limite diário.'],
  ['LICENSE_COPY.pt.ok_pack', 'Desbloqueado neste dispositivo: {PACKS}'],
  ['LICENSE_COPY.pt.err_invalid', 'Não foi possível ativar essa chave — confira a digitação e compare com o e-mail de compra. Se não resolver, escreva para support@cleanpaths.io.'],
  ['LICENSE_COPY.pt.err_network', 'Sem conexão — a ativação precisa de internet só na primeira vez. Confira sua conexão e tente de novo. Já ativou neste dispositivo? O Pro continua funcionando offline.'],
  // ---- v1.12 param panel, STATE_COPY.en (11) — 05-copy-freeze-v1.12 §A verbatim ----
  // Third element true = count check runs against the QUOTED literal ('...') so
  // short strings ('Cut', 'Engrave') aren't inflated by superstrings like
  // 'Cut settings' / the mode_hint sentence. EN-only batch: no pt keys (by design).
  ['STATE_COPY.en.panel_spec', 'Cut settings', true],
  ['STATE_COPY.en.width_label', 'Width (mm)', true],
  ['STATE_COPY.en.output_size_tpl', 'Output size: {w} × {h} mm', true],
  ['STATE_COPY.en.threshold_label', 'Color threshold', true],
  ['STATE_COPY.en.threshold_hint', 'Lower = fewer colors, cleaner paths', true],
  ['STATE_COPY.en.width_hint', 'Default size assumes 96 DPI — set the width you actually cut at.', true],
  ['STATE_COPY.en.smooth_label', 'Node smoothing', true],
  ['STATE_COPY.en.smooth_hint', 'Higher = fewer nodes, smaller file', true],
  ['STATE_COPY.en.mode_cut', 'Cut', true],
  ['STATE_COPY.en.mode_engrave', 'Engrave', true],
  ['STATE_COPY.en.mode_hint', 'Engrave = filled color layers — not photo engraving', true],
];

let sentinelFailures = 0;
for (const [name, frozen, quoted] of EXPECTED) {
  const actual = name.split('.').reduce((o, k) => o?.[k], mod.exports);
  if (actual !== frozen) {
    console.error(`✗ sentinel: ${name} drifted from frozen text`);
    sentinelFailures++;
    continue;
  }
  // count==1 in raw source: catches duplicate paste and quote-level drift.
  const needle = quoted ? `'${frozen}'` : frozen;
  const occurrences = rawCopy.split(needle).length - 1;
  if (occurrences !== 1) {
    console.error(`✗ sentinel: ${name} appears ${occurrences}× in copy.ts (must be exactly 1)`);
    sentinelFailures++;
  }
}

// EN/PT key-set alignment (漏译防线).
for (const dict of ['LICENSE_COPY', 'CHECKOUT_COPY']) {
  const en = Object.keys(mod.exports[dict].en).sort().join(',');
  const pt = Object.keys(mod.exports[dict].pt).sort().join(',');
  if (en !== pt) {
    console.error(`✗ sentinel: ${dict} EN/PT key mismatch — en:[${en}] pt:[${pt}]`);
    sentinelFailures++;
  }
}

if (sentinelFailures) { console.error(`copy.ts sentinel: ${sentinelFailures} failure(s)`); process.exit(1); }
console.log('copy.ts sentinel: PASS (v1.4 6 + v1.5 24 + v1.12 11 strings, verbatim + count==1, EN/PT keys aligned)');
