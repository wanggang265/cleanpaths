import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/for-embroidery';
import PageShell from '@/components/PageShell';
import { faqPageFromHtml, jsonLd, SITE_URL, webPage, openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/for/embroidery/' },
  openGraph: openGraphFor({ title, description, url: '/for/embroidery/' }),
};

export default function ForEmbroideryPage() {
  const schema = jsonLd(
    webPage({ name: 'From Image to Embroidery: Honest Prep, Human Digitizers', url: `${SITE_URL}/for/embroidery/`, description }),
    faqPageFromHtml(mainHtml),
  );
  return <PageShell route="/for/embroidery/" mainHtml={mainHtml} schemaJson={schema} />;
}
