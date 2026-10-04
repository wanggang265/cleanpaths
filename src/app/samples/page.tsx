import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/samples';
import PageShell from '@/components/PageShell';
import { jsonLd, samplesGallery } from '@/lib/schema';

export const metadata: Metadata = { title, description, alternates: { canonical: '/samples/' } };

export default function SamplesPage() {
  // Server-side static HTML wall (06c: indexable, no iframe/dynamic loading).
  // JSON-LD: ImageGallery + per-card ImageObject/ItemList (open-items #6).
  const schema = jsonLd(...samplesGallery(mainHtml));
  return <PageShell route="/samples/" mainHtml={mainHtml} schemaJson={schema} />;
}
