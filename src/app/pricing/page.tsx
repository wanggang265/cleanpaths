import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pricing';
import PageShell from '@/components/PageShell';
import CheckoutLinks from '@/components/CheckoutLinks';
import { faqPageFromHtml, jsonLd, pricingProduct, openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/pricing/' },
  openGraph: openGraphFor({ title, description, url: '/pricing/' }),
};

export default function PricingPage() {
  // Dead-anchor fix (markup only, copy untouched): the frozen markup's bare
  // #convert has no target on /pricing — route it to the homepage tool.
  const html = mainHtml.replace('href="#convert"', 'href="/#convert"');
  const schema = jsonLd(pricingProduct(), faqPageFromHtml(mainHtml));
  // QA #26-①: CTAs must live INSIDE [data-checkout-links] for the
  // interceptor to fire — wrap PageShell, don't sibling it.
  return (
    <CheckoutLinks>
      <PageShell route="/pricing/" mainHtml={html} schemaJson={schema} />
    </CheckoutLinks>
  );
}
