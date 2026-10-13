'use client';

/**
 * CtaBeacon (#54) — zero-UI delegated listener for the frozen Pro CTA
 * "Get CleanPaths Pro — $59, one time" (05 §0.8, single source site-wide).
 * One event `cta_click` for all three preregistered placements; `slot`
 * distinguishes position:
 *   cap     — tool-page daily-cap state primary CTA (→ /pricing/)
 *   pricing — /pricing card + final CTA (#checkout, intercepted by CheckoutLinks)
 *   cricut  — /for/cricut-sellers ROI card CTA (→ /pricing/)
 * Other occurrences of the CTA text (tool-page mid-page strips) are NOT
 * preregistered placements and are ignored. Matches on the frozen string —
 * stable because the copy is frozen; a copy change goes through 05 and
 * updates this constant in the same commit.
 */
import { useEffect } from 'react';
import { beacon } from '@/lib/beacon';

const PRO_CTA = 'Get CleanPaths Pro — $59, one time';

export default function CtaBeacon() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a');
      if (!a || (a.textContent || '').trim() !== PRO_CTA) return;
      const dz = a.closest('.dropzone');
      const path = window.location.pathname;
      const slot =
        dz && dz.querySelector('.state-note--cap')
          ? 'cap'
          : path.startsWith('/pricing')
            ? 'pricing'
            : path.startsWith('/for/cricut-sellers')
              ? 'cricut'
              : null;
      if (slot) beacon('cta_click', { slot });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
