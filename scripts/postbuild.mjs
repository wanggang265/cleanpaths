#!/usr/bin/env node
/**
 * postbuild.mjs — static-export fixups that Next.js app-router cannot express
 * with a single shared root layout (08 SEO P1-1):
 *
 * The root layout hardcodes <html lang="en">; the PT route overrides it on
 * the client via SetLang, but crawlers see the SSR HTML. Rewrite every exported
 * PT page's <html lang> to pt-BR. Deterministic, per-file, fails loudly.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// P0-3b: /pt/ hub joins the SSR lang fix (recon §G — new pages must carry the
// correct value directly). P2 backfill of the 16 legacy PT pages stays deferred
// (404-recon-2026-11-24 §6.4 — hydration covers them meanwhile).
const PT_PAGES = ['pt', 'pt/jfif-para-jpg', 'pt/jfif-para-png', 'pt/webp-para-svg', 'pt/imagem-para-dxf', 'pt/foto-para-dxf'];

for (const route of PT_PAGES) {
  const file = join(ROOT, 'out', route, 'index.html');
  if (!existsSync(file)) {
    console.error(`postbuild: ${file} missing — did next build run?`);
    process.exit(1);
  }
  const html = readFileSync(file, 'utf8');
  if (html.includes('<html lang="pt-BR"')) {
    console.log(`postbuild: ${route} <html lang="pt-BR"> already set`);
    continue;
  }
  if (!html.includes('<html lang="en"')) {
    console.error(`postbuild: ${route} has no <html lang="en"> to rewrite — markup changed?`);
    process.exit(1);
  }
  writeFileSync(file, html.replace('<html lang="en"', '<html lang="pt-BR"'));
  console.log(`postbuild: out/${route}/index.html <html lang> → pt-BR`);
}
