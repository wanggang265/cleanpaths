import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/png-to-dxf-for-laser-cutting';
import PageShell from '@/components/PageShell';
import { faqPageFromHtml, jsonLd, openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/png-to-dxf-for-laser-cutting/' },
  openGraph: openGraphFor({ title, description, url: '/png-to-dxf-for-laser-cutting/' }),
};

export default function PngToDxfForLaserCuttingPage() {
  // 05 v1.13 §C: content-scenario page — FAQPage only, NO SoftwareApplication
  // (the tool lives at /png-to-dxf). [PENDING-07-embed] CTA card ships as the
  // frozen placeholder structure (CTA-first), no tool mount.
  const schema = jsonLd(faqPageFromHtml(mainHtml));
  return <PageShell route="/png-to-dxf-for-laser-cutting/" mainHtml={mainHtml} schemaJson={schema} />;
}
