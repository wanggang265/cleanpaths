import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/refund';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = { title, description, alternates: { canonical: '/refund/' } };

export default function RefundPage() {
  return <PageShell route="/refund/" mainHtml={mainHtml} />;
}
