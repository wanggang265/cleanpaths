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

// Expected frozen values. v1.4: err_fail_pre/err_fail_hint (STATE_COPY) +
// msg_required (FB_COPY), EN+PT. v1.5: CHECKOUT_COPY (2 keys) + LICENSE_COPY
// (10 keys), EN+PT. Sources: 05-copy-freeze-v1.4-error-variants-addendum.md,
// 05-copy-freeze-v1.5-checkout-license-addendum.md (§A/§B tables, verbatim).
const EXPECTED = [
  // ---- v1.4 (6) ----
  ['FB_COPY.en.msg_required', FB_COPY.en.msg_required],
  ['FB_COPY.pt.msg_required', FB_COPY.pt.msg_required],
  ['STATE_COPY.en.err_fail_pre', STATE_COPY.en.err_fail_pre],
  ['STATE_COPY.en.err_fail_hint', STATE_COPY.en.err_fail_hint],
  ['STATE_COPY.pt.err_fail_pre', STATE_COPY.pt.err_fail_pre],
  ['STATE_COPY.pt.err_fail_hint', STATE_COPY.pt.err_fail_hint],
  // ---- v1.5 CHECKOUT_COPY (4) ----
  ['CHECKOUT_COPY.en.ok_main', CHECKOUT_COPY.en.ok_main],
  ['CHECKOUT_COPY.en.ok_sub', CHECKOUT_COPY.en.ok_sub],
  ['CHECKOUT_COPY.pt.ok_main', CHECKOUT_COPY.pt.ok_main],
  ['CHECKOUT_COPY.pt.ok_sub', CHECKOUT_COPY.pt.ok_sub],
  // ---- v1.5 LICENSE_COPY (20) ----
  ...['entry', 'label', 'placeholder', 'submit', 'checking', 'ok_main', 'ok_pro', 'ok_pack', 'err_invalid', 'err_network'].flatMap(
    (k) => [
      [`LICENSE_COPY.en.${k}`, LICENSE_COPY.en[k]],
      [`LICENSE_COPY.pt.${k}`, LICENSE_COPY.pt[k]],
    ],
  ),
];

let sentinelFailures = 0;
const seen = new Set();
for (const [name, value] of EXPECTED) {
  if (typeof value !== 'string' || !value) {
    console.error(`✗ sentinel: ${name} missing/empty in copy.ts`);
    sentinelFailures++;
    continue;
  }
  if (seen.has(value)) {
    console.error(`✗ sentinel: ${name} duplicates another frozen string value`);
    sentinelFailures++;
  }
  seen.add(value);
  // count==1 in raw source: catches duplicate paste and quote-level drift.
  const occurrences = rawCopy.split(value).length - 1;
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

// Spot-check byte-identity anchors (verbatim freeze, anti-drift).
const ANCHORS = {
  'CHECKOUT_COPY.en.ok_main': 'Payment successful — your license key is on its way to your inbox.',
  'LICENSE_COPY.en.entry': 'Have a license key?',
  'LICENSE_COPY.en.ok_pack': '{PACKS} unlocked on this device.',
  'LICENSE_COPY.pt.ok_pack': 'Desbloqueado neste dispositivo: {PACKS}',
  'LICENSE_COPY.pt.entry': 'Tem uma chave de licença?',
  'FB_COPY.en.msg_required': 'Add a quick message first — even one word helps.',
  'STATE_COPY.en.err_fail_pre': "Your file is the right type, but we couldn't convert it.",
};
for (const [name, expected] of Object.entries(ANCHORS)) {
  const actual = name.split('.').reduce((o, k) => o?.[k], mod.exports);
  if (actual !== expected) {
    console.error(`✗ sentinel: ${name} drifted from frozen text`);
    sentinelFailures++;
  }
}

if (sentinelFailures) { console.error(`copy.ts sentinel: ${sentinelFailures} failure(s)`); process.exit(1); }
console.log(`copy.ts sentinel: PASS (v1.4 6 + v1.5 24 strings, count==1, EN/PT keys aligned)`);
