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
 *
 * P0-4a (analytics-spec §8.2 rows 6/8): this same delegated listener also
 * fires the GA4 twins — `buy_click` {slot} beside the beacon cta_click, and
 * `language_switch` for the PT pages' three component-level "English version"
 * links (SiteHeader desktop L91 / mobile L98 + SiteFooter L48). SiteHeader /
 * SiteFooter are server components and cannot carry onClick, so the switch is
 * matched here by frozen exact text under a /pt/ path guard — logo, privacy
 * and every other EN-bound link on PT pages never match, only those three
 * anchors fire. EN page body-content "Versão em português" links are out of
 * scope by spec (§8.2 row 8, P0-4a amendment).
 */
import { useEffect } from 'react';
import { beacon } from '@/lib/beacon';
import { gtagEvent } from '@/lib/gtag';

const PRO_CTA = 'Get CleanPaths Pro — $59, one time';

export default function CtaBeacon() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a');
      if (!a) return;
      const label = (a.textContent || '').trim();
      // P0-4a §8.2 row8: language_switch — PT pages' three component-level
      // "English version" links only (see header docstring).
      if (
        window.location.pathname.startsWith('/pt/') &&
        (label === 'English version →' || label === 'English version')
      ) {
        gtagEvent('language_switch', { from_lang: 'pt', to_lang: 'en' });
        return;
      }
      if (label !== PRO_CTA) return;
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
      if (slot) {
        beacon('cta_click', { slot });
        gtagEvent('buy_click', { slot }); // P0-4a §8.2 row6: same slot verdict as the beacon cta_click — preregistered slots only
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
