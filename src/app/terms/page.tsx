import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/terms';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = { title, description, alternates: { canonical: '/terms/' } };

export default function TermsPage() {
  return <PageShell route="/terms/" mainHtml={mainHtml} />;
}
