import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/terms';
import PageShell from '@/components/PageShell';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/terms/' },
  openGraph: openGraphFor({ title, description, url: '/terms/' }),
};

export default function TermsPage() {
  return <PageShell route="/terms/" mainHtml={mainHtml} />;
}
