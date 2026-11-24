import type { MetadataRoute } from 'next';
import { execSync } from 'node:child_process';
import { SITE_URL } from '@/lib/schema';

const ROUTES = [
  '/',
  '/png-to-dxf/',
  '/jpg-to-dxf/',
  '/svg-to-dxf-converter/',
  '/screenshot-to-svg/',
  '/jfif-to-jpg/',
  '/pt/jfif-para-jpg/',
  '/vector-magic-alternative/',
  '/cloudconvert-alternative/',
  '/vectorizer-ai-alternative/',
  '/convertio-alternative/',
  '/jfif-to-png/',
  '/pt/jfif-para-png/',
  '/webp-to-svg/',
  '/pt/webp-para-svg/',
  '/image-to-dxf/',
  '/pt/imagem-para-dxf/',
  '/photo-to-dxf/',
  '/pt/foto-para-dxf/',
  '/png-to-dxf-for-laser-cutting/',
  // 07 batch2 (05 v1.15): 16 format-pair landing pages
  '/webp-to-png/',
  '/webp-to-jpg/',
  '/svg-to-png/',
  '/jpeg-to-jpg/',
  '/svg-to-jpg/',
  '/gif-to-jpg/',
  '/bmp-to-jpg/',
  '/jpeg-to-dxf/',
  '/pt/webp-para-png/',
  '/pt/webp-para-jpg/',
  '/pt/svg-para-png/',
  '/pt/jpeg-para-jpg/',
  '/pt/svg-para-jpg/',
  '/pt/gif-para-jpg/',
  '/pt/bmp-para-jpg/',
  '/pt/jpeg-para-dxf/',
  // 2b batch3 (05-copy-freeze-v1.18): 3 new PT DXF landing pages
  '/pt/png-para-dxf/',
  '/pt/jpg-para-dxf/',
  '/pt/svg-para-dxf/',
  // P0-3b (05-copy-freeze-v1.19): PT navigation hub
  '/pt/',
  '/samples/',
  '/for/cricut-sellers/',
  '/for/embroidery/',
  '/pricing/',
  '/privacy/',
  '/terms/',
  '/cookies/',
  '/refund/',
];

// 数字一致性断言：路由合同 48 条（route-mapping v1.10 与本表必须同步增删）。
if (ROUTES.length !== 48) {
  throw new Error(`sitemap: route contract drift — expected 48 routes, got ${ROUTES.length}`);
}

/**
 * P0-3b: lastmod 真实化（方案A，侦察报告 404-recon-2026-11-24 §4）。
 * 每条路由取其设计真源内容目录的最近一次内容 commit 日期（date-only），
 * 无 commit 的新页回退构建日。禁手改 out/sitemap.xml —— 此函数是唯一来源。
 * 内建数字断言：格式合法 + 绝不发出未来时间（违者构建即红）。
 */
function contentLastmod(route: string): string {
  const slug =
    route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-');
  const dir = `design-source/pages/${slug}`;
  let iso = '';
  try {
    iso = execSync(`git log -1 --format=%cI -- ${dir}`, { encoding: 'utf8' }).trim();
  } catch {
    // 无 git 上下文（罕见）→ 走构建日回退
  }
  const date = iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`sitemap: malformed lastmod for ${route}: "${date}"`);
  }
  const today = new Date().toISOString().slice(0, 10);
  if (date > today) {
    throw new Error(`sitemap: future lastmod for ${route}: ${date} > ${today}`);
  }
  return date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastmodCache = new Map<string, string>();
  return ROUTES.map((r) => {
    if (!lastmodCache.has(r)) lastmodCache.set(r, contentLastmod(r));
    return {
      url: `${SITE_URL}${r}`,
      lastModified: lastmodCache.get(r)!,
      changeFrequency: (r === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: r === '/' ? 1 : r.includes('pricing') ? 0.9 : 0.7,
    };
  });
}
