'use client';

/**
 * CheckoutLinks — pricing page CTA wiring (08 dispatch v2: Creem live).
 *
 * Pricing CTAs in the frozen markup point at #checkout. This component
 * intercepts them, POSTs to /api/checkout { plan }, and redirects to the
 * returned Creem hosted checkout URL.
 *
 * Honest-failure policy (no unapproved copy): if the API fails we fall back
 * to the product's public Creem express-checkout page (a real checkout, not
 * a fake state). Only a network-level failure (offline) leaves the user on
 * the page — there is no frozen string for that case yet (wenshu 加急 filed
 * via zhongshu).
 *
 * Success landing (dispatch v2 §4, zero-new-copy scheme): Creem redirects to
 * /pricing/?checkout=success; we detect + strip the param here. A visible
 * success toast needs approved copy — pending wenshu, reported to zhongshu.
 */
import { useEffect, useRef } from 'react';

type Plan = 'pro' | 'monthly-pass' | 'batch-pack' | 'precision-pack';

function planFromButton(btn: HTMLElement): Plan {
  const t = (btn.textContent || '').toLowerCase();
  if (t.includes('monthly')) return 'monthly-pass';
  if (t.includes('batch')) return 'batch-pack';
  if (t.includes('precision')) return 'precision-pack';
  return 'pro';
}

/** Public Creem express-checkout pages — real checkout fallback if /api/checkout 5xxs. */
const CREEM_PRODUCT_URL: Record<Plan, string> = {
  pro: 'https://www.creem.io/product/prod_7vlF3MSgbHq3c4tTWONsz',
  'monthly-pass': 'https://www.creem.io/product/prod_cL03e3dRwQfwr2boxSC0L',
  'batch-pack': 'https://www.creem.io/product/prod_2r0uGqiaZaIhRcMTaIS4jo',
  'precision-pack': 'https://www.creem.io/product/prod_6S3CNISFVIZgvqKC1w6Z2H',
};

export default function CheckoutLinks({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Success-landing param handling (mount once).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('checkout') === 'success') {
      url.searchParams.delete('checkout');
      window.history.replaceState(null, '', url.toString());
      // Visible confirmation is copy-blocked (wenshu 加急) — the license key
      // arrives by email and the pricing FAQ already says so (frozen copy).
    }
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href="#checkout"]');
      if (!a) return;
      e.preventDefault();
      const plan = planFromButton(a as HTMLElement);
      void fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan, tier: plan, source: 'pricing', ts: new Date().toISOString() }),
      })
        .then(async (res) => {
          if (!res.ok) {
            // API misconfig/upstream — fall back to Creem's hosted product page.
            window.location.assign(CREEM_PRODUCT_URL[plan]);
            return;
          }
          const data = (await res.json().catch(() => null)) as { url?: string } | null;
          window.location.assign(data?.url ?? CREEM_PRODUCT_URL[plan]);
        })
        .catch(() => {
          // Offline: stay on the page (no fake state, no unapproved copy).
        });
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, []);
  return (
    <div ref={ref} style={{ display: 'contents' }} data-checkout-links>
      {children}
    </div>
  );
}
