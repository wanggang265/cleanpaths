import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/refund';
import PageShell from '@/components/PageShell';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/refund/' },
  openGraph: openGraphFor({ title, description, url: '/refund/' }),
};

export default function RefundPage() {
  return <PageShell route="/refund/" mainHtml={mainHtml} />;
}
