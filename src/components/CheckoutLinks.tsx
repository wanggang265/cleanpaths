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
 * Success landing (dispatch v2 §4 + 05 v1.5 §F-2/§D-3): Creem redirects to
 * /pricing/?checkout=success; we strip the params and render the frozen
 * EN toast + a license activation entry next to it.
 */
import { useEffect, useRef } from 'react';
import { CHECKOUT_COPY, LICENSE_COPY } from '@/lib/copy';
import { wireLicenseEntry } from '@/lib/license-panel';
import { beacon } from '@/lib/beacon';

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

  // Success-landing param handling (mount once). 05 v1.5 §F-2 + zhongshu §D-3:
  // dismissible EN toast (aria-live) + second license entry next to it.
  // Creem appends checkout_id/order_id/customer_id/product_id to success_url
  // (docs.creem.io checkout-api) — strip all of them for a clean URL.
  // §D-2 resolved: Creem does NOT append ?license= — no capture needed here.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('checkout') !== 'success') return;
    for (const p of ['checkout', 'checkout_id', 'order_id', 'customer_id', 'product_id', 'signature']) {
      url.searchParams.delete(p);
    }
    window.history.replaceState(null, '', url.toString());
    // #54 preregistered: purchase success landing. Funnel reference only —
    // the source of truth for purchases is the Creem webhook (08).
    beacon('purchase');

    const c = CHECKOUT_COPY.en; // EN-only render (05 v1.5 §A-4 ruling)
    const toast = document.createElement('div');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText =
      'position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:60;max-width:min(560px,calc(100vw - 32px));background:var(--paper,#fff);border:1px solid var(--line,#e5e2dc);border-radius:14px;padding:16px 18px;box-shadow:0 8px 30px rgba(0,0,0,.12);cursor:pointer';
    toast.innerHTML = `
      <div class="state-note" style="border:none;padding:0;background:none">
        <span><b>${c.ok_main}</b></span>
        <span style="display:block;margin-top:6px;font-size:14px;color:var(--ink-2)">${c.ok_sub}</span>
      </div>
      <div style="margin-top:10px;text-align:center"><button type="button" data-license-entry class="btn btn--ghost">${LICENSE_COPY.en.entry}</button></div>
      <div data-license-panel hidden></div>`;
    document.body.appendChild(toast);
    // Dismiss: click anywhere on the toast chrome (not inside the open panel);
    // auto-dismiss after 30s if the buyer never engages.
    const dismiss = window.setTimeout(() => {
      if (toast.querySelector<HTMLElement>('[data-license-panel]')?.hidden !== false) toast.remove();
    }, 30_000);
    toast.addEventListener('click', (e) => {
      const panel = toast.querySelector<HTMLElement>('[data-license-panel]');
      const insidePanel = panel && !panel.hidden && panel.contains(e.target as Node);
      if ((e.target as HTMLElement).closest('[data-license-entry]') || insidePanel) return;
      window.clearTimeout(dismiss);
      toast.remove();
    });
    wireLicenseEntry(toast, 'en');
    return () => {
      window.clearTimeout(dismiss);
      toast.remove();
    };
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
