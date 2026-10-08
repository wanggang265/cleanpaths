'use client';

/**
 * CheckoutLinks — pricing page CTA wiring (08 integration point).
 *
 * Pricing CTAs in the frozen markup point at #checkout. This component
 * intercepts them and POSTs to /api/checkout (08: Creem checkout session;
 * expected response {url} → redirect). Until 08 lands, the endpoint 404s and
 * the user stays on the page — NO fake success UI. Handoff: "08 接线".
 *
 * QA #26-① fix: the wrapper used to render EMPTY next to PageShell, so CTAs
 * were never inside [data-checkout-links] and the interceptor was dead code.
 * It now wraps the page content via children — clicks on #checkout anchors
 * bubble up to the listener here. Safe behavior is unchanged: click does not
 * navigate, does not error, until 08 wires Creem.
 */
import { useEffect, useRef } from 'react';

function planFromButton(btn: HTMLElement): string {
  const t = (btn.textContent || '').toLowerCase();
  if (t.includes('monthly')) return 'monthly-pass';
  if (t.includes('batch')) return 'batch-pack';
  if (t.includes('precision')) return 'precision-pack';
  return 'pro';
}

export default function CheckoutLinks({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
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
        body: JSON.stringify({ plan, source: 'pricing', ts: new Date().toISOString() }),
      })
        .then(async (res) => {
          if (!res.ok) return; // 08 not wired yet — no fake UI
          const data = (await res.json().catch(() => null)) as { url?: string } | null;
          if (data?.url) window.location.assign(data.url);
        })
        .catch(() => {
          /* offline / 404 until 08 wires Creem */
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
