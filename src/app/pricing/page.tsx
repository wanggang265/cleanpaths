import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pricing';
import PageShell from '@/components/PageShell';
import CheckoutLinks from '@/components/CheckoutLinks';
import { faqPageFromHtml, jsonLd, pricingProduct } from '@/lib/schema';

export const metadata: Metadata = { title, description, alternates: { canonical: '/pricing/' } };

export default function PricingPage() {
  // Dead-anchor fix (markup only, copy untouched): the frozen markup's bare
  // #convert has no target on /pricing — route it to the homepage tool.
  const html = mainHtml.replace('href="#convert"', 'href="/#convert"');
  const schema = jsonLd(pricingProduct(), faqPageFromHtml(mainHtml));
  return (
    <>
      <PageShell route="/pricing/" mainHtml={html} schemaJson={schema} />
      <CheckoutLinks />
    </>
  );
}
