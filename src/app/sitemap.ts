import type { MetadataRoute } from 'next';
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
  '/samples/',
  '/for/cricut-sellers/',
  '/for/embroidery/',
  '/pricing/',
  '/privacy/',
  '/terms/',
  '/cookies/',
  '/refund/',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-09-30');
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified,
    changeFrequency: (r === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: r === '/' ? 1 : r.includes('pricing') ? 0.9 : 0.7,
  }));
}
