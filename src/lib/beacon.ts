/**
 * beacon.ts — first-party aggregate event client (#54, 决策报告 v2.0 §埋点A,
 * 裁决记录 §三). Fire-and-forget: beacon failures must never affect UX.
 *
 * Pre-registered event set — EXACTLY these five, do not add/remove without
 * a zhongshu amendment: tool_start / tool_complete / cap_hit / purchase /
 * cta_click. Payload carries only { event, slug, slot? }: no file content,
 * no file names, no user-agent, nothing re-identifiable. `slot` is
 * cta_click-only (pricing card / cap state / cricut page share one event).
 *
 * The server (functions/api/beacon.ts) buckets by UTC day and stores an
 * IP-derived one-way hash with a 25h TTL — see docs/analytics-spec.md.
 */

export type BeaconEvent = 'tool_start' | 'tool_complete' | 'cap_hit' | 'purchase' | 'cta_click';

export function beacon(event: BeaconEvent, opts: { slug?: string; slot?: string } = {}): void {
  try {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({
      event,
      slug: opts.slug ?? window.location.pathname,
      ...(opts.slot ? { slot: opts.slot } : {}),
    });
    const blob = new Blob([payload], { type: 'application/json' });
    // sendBeacon survives page navigation (cap/pricing CTAs navigate away);
    // fetch+keepalive is the fallback for very old engines.
    if (!navigator.sendBeacon('/api/beacon', blob)) {
      void fetch('/api/beacon', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* analytics never breaks the tool */
  }
}
