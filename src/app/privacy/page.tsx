import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/privacy';
import PageShell from '@/components/PageShell';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/privacy/' },
  openGraph: openGraphFor({ title, description, url: '/privacy/' }),
};

export default function PrivacyPage() {
  // .fill placeholder chips stay visible until 08/legal fills them (03).
  return <PageShell route="/privacy/" mainHtml={mainHtml} />;
}
