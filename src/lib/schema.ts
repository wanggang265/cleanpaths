/**
 * schema.ts — JSON-LD builders (open-items #6, 埋点规则 #1).
 *
 * Rules enforced here:
 * - Product/SoftwareApplication always carry `image` as ABSOLUTE URL.
 * - Every pricing Offer carries hasMerchantReturnPolicy (30 days, matches
 *   03-compliance Refund Policy) + shippingDetails ($0 digital delivery).
 * - No review / aggregateRating anywhere — no real data (03 / open-items).
 * - FAQPage is generated from the page's own frozen FAQ markup.
 */

export const SITE_URL = 'https://cleanpaths.io';
export const SITE_NAME = 'CleanPaths';
export const DEFAULT_IMAGE = `${SITE_URL}/assets/samples/logo-acme_after.png`;

export function jsonLd(...nodes: Array<Record<string, unknown> | null>): string {
  return JSON.stringify(nodes.filter(Boolean));
}

/* ---------------- SoftwareApplication (tool pages) ---------------- */

export function softwareApplication(opts: {
  name: string;
  url: string; // absolute
  description: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    url: opts.url,
    description: opts.description,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any (web browser)',
    browserRequirements: 'Requires JavaScript',
    image: [DEFAULT_IMAGE],
    inLanguage: opts.url.includes('/pt/') ? 'pt-BR' : 'en',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier: 10 conversions per day, full quality, no watermark.',
    },
  };
}

/* ---------------- FAQPage (parsed from frozen markup) ---------------- */

const FAQ_RE = /<details><summary>([\s\S]*?)<\/summary><div class='a'>([\s\S]*?)<\/div><\/details>/g;
const strip = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

export function faqPageFromHtml(mainHtml: string): Record<string, unknown> | null {
  const entities: Array<Record<string, unknown>> = [];
  for (const m of mainHtml.matchAll(FAQ_RE)) {
    const q = strip(m[1]);
    const a = strip(m[2]);
    if (q && a) {
      entities.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      });
    }
  }
  if (entities.length === 0) return null;
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities };
}

/* ---------------- WebPage (persona/legal generic) ---------------- */

export function webPage(opts: { name: string; url: string; description: string }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    url: opts.url,
    description: opts.description,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}

/* ---------------- Product + Offers (pricing, open-items #6) ---------------- */

const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'WW',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 30,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
} as const;

const DIGITAL_SHIPPING = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'WW' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
  },
} as const;

function offer(name: string, price: string, summary: string): Record<string, unknown> {
  return {
    '@type': 'Offer',
    name,
    price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/pricing/`,
    itemCondition: 'https://schema.org/NewCondition',
    description: summary,
    hasMerchantReturnPolicy: RETURN_POLICY,
    shippingDetails: DIGITAL_SHIPPING,
  };
}

export function pricingProduct(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'CleanPaths Pro',
    description:
      'One-time license for CleanPaths: no daily cap, offline after activation, AI HD rescue without per-use limits. Digital delivery by license key — nothing is shipped.',
    image: [DEFAULT_IMAGE],
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: [
      offer('CleanPaths Pro — one-time license', '59', 'No daily cap, works offline after activation, AI HD rescue included. One-time payment.'),
      offer('Batch Pack add-on', '29', 'One-time add-on for high-volume conversion sessions.'),
      offer('Precision Pack add-on', '29', 'One-time add-on for maximum-detail tracing presets.'),
      offer('Monthly Pass', '10', 'Monthly access, credits toward the one-time purchase.'),
    ],
  };
}

/* ---------------- ImageGallery (/samples wall, GEO asset) ---------------- */

export function samplesGallery(mainHtml: string): Record<string, unknown>[] {
  const items: Array<Record<string, unknown>> = [];
  const seen = new Set<string>();
  const IMG_RE = /<img src="(\/assets\/samples\/[^"]+)" alt="([^"]*)"/g;
  let i = 0;
  for (const m of mainHtml.matchAll(IMG_RE)) {
    const path = m[1];
    if (seen.has(path)) continue;
    seen.add(path);
    i += 1;
    items.push({
      '@type': 'ListItem',
      position: i,
      item: {
        '@type': 'ImageObject',
        contentUrl: `${SITE_URL}${path}`,
        name: strip(m[2]),
        representativeOfPage: false,
      },
    });
  }
  const gallery = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'See the Difference: Before / After',
    url: `${SITE_URL}/samples/`,
  };
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items,
  };
  return [gallery, list];
}
