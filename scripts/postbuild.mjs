#!/usr/bin/env node
/**
 * postbuild.mjs — static-export fixups that Next.js app-router cannot express
 * with a single shared root layout (08 SEO P1-1):
 *
 * The root layout hardcodes <html lang="en">; the PT route overrides it on
 * the client via SetLang, but crawlers see the SSR HTML. Rewrite the exported
 * PT page's <html lang> to pt-BR. Deterministic, one file, fails loudly.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PT_PAGE = join(ROOT, 'out', 'pt', 'jfif-para-jpg', 'index.html');

if (!existsSync(PT_PAGE)) {
  console.error(`postbuild: ${PT_PAGE} missing — did next build run?`);
  process.exit(1);
}
const html = readFileSync(PT_PAGE, 'utf8');
if (html.includes('<html lang="pt-BR"')) {
  console.log('postbuild: PT <html lang="pt-BR"> already set');
  process.exit(0);
}
if (!html.includes('<html lang="en"')) {
  console.error('postbuild: PT page has no <html lang="en"> to rewrite — markup changed?');
  process.exit(1);
}
writeFileSync(PT_PAGE, html.replace('<html lang="en"', '<html lang="pt-BR"'));
console.log('postbuild: out/pt/jfif-para-jpg/index.html <html lang> → pt-BR');
