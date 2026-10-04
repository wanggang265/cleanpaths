import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/privacy';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = { title, description, alternates: { canonical: '/privacy/' } };

export default function PrivacyPage() {
  // .fill placeholder chips stay visible until 08/legal fills them (03).
  return <PageShell route="/privacy/" mainHtml={mainHtml} />;
}
