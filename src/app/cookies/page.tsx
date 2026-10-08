import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/cookies';
import PageShell from '@/components/PageShell';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/cookies/' },
  openGraph: openGraphFor({ title, description, url: '/cookies/' }),
};

export default function CookiesPage() {
  return <PageShell route="/cookies/" mainHtml={mainHtml} />;
}
