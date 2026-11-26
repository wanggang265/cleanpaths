/**
 * gtag.ts — shared GA4 web-event helper (P0-4a T1, analytics-spec §8).
 *
 * Extracted from ToolController's inline helper (zhongshu pre-authorized
 * refactor, 2026-11-26): same existence-guarded, fire-and-forget semantics —
 * never blocks the UI flow and no-ops when gtag is absent (script blocked,
 * no-JS). All event names / params / triggers are frozen in
 * docs/analytics-spec.md §8.2; implementation deviation = rejected (§8.7).
 * The server-side `purchase` (Measurement Protocol) is P0-4b scope and does
 * NOT go through this module — FE never fires purchase (§8.3 red line).
 */

/** Fire a GA4 event via the layout's gtag stub (app/layout.tsx `ga4-init`). */
export function gtagEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') w.gtag('event', name, params);
}

/**
 * Parse the GA4 client_id from the `_ga` cookie (format
 * `GA1.1.<digits>.<digits>` — client_id is the last two segments).
 *
 * P0-4a → P0-4b cross-order contract: returns null when the cookie is absent
 * or unparseable, and the caller (CheckoutLinks) must then OMIT the
 * `client_id` field from POST /api/checkout entirely — no empty strings, no
 * placeholder values.
 */
export function gaClientId(): string | null {
  if (typeof document === 'undefined') return null;
  const raw = /(?:^|;\s*)_ga=([^;]+)/.exec(document.cookie);
  if (!raw) return null;
  const m = /^GA1\.\d+\.(\d+)\.(\d+)$/.exec(decodeURIComponent(raw[1]));
  return m ? `${m[1]}.${m[2]}` : null;
}
