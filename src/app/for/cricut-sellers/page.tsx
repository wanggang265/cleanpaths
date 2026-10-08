import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/for-cricut-sellers';
import PageShell from '@/components/PageShell';
import { faqPageFromHtml, jsonLd, SITE_URL, webPage, openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/for/cricut-sellers/' },
  openGraph: openGraphFor({ title, description, url: '/for/cricut-sellers/' }),
};

export default function ForCricutSellersPage() {
  const schema = jsonLd(
    webPage({ name: 'Cut-Ready SVG & DXF Files for Cricut Sellers', url: `${SITE_URL}/for/cricut-sellers/`, description }),
    faqPageFromHtml(mainHtml),
  );
  return <PageShell route="/for/cricut-sellers/" mainHtml={mainHtml} schemaJson={schema} />;
}
