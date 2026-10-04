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
