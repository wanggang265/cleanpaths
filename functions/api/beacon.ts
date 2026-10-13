/**
 * functions/api/beacon.ts — POST /api/beacon (#54, 决策报告 v2.0 §埋点A,
 * 裁决记录 §三 preregistered). First-party aggregate event counter.
 *
 * Contract:
 * - Always 204, always. Bad JSON, unknown event, KV outage — the client
 *   must never see an error from analytics (beacon is fire-and-forget).
 * - Preregistered event set, EXACTLY five: tool_start / tool_complete /
 *   cap_hit / purchase / cta_click. Unknown events are dropped silently.
 * - Payload (client): { event, slug, slot? }. slot is cta_click-only.
 *   NEVER accepted/logged: user-agent fingerprints, file content, file
 *   names, or anything re-identifiable (03 P1-2 zero-exfil extends here).
 *
 * Storage (KV namespace BEACON_KV):
 * - d:<day>:<event>              daily total counter (increment)
 * - d:<day>:<event>:<slug>       per-page/tool daily counter
 * - d:<day>:cta_click:slot:<s>   extra slot breakdown for cta_click only
 * - ip:<day>:<iph>:<event>       existence marker, TTL 25h — powers the
 *   cap three-classification join, then expires on its own (Privacy:
 *   "hash deleted within 24 hours" — TTL 25h covers the 24h join window).
 * - iph = SHA-256("cp-beacon-v1:" + day + ":" + cf-connecting-ip) — the
 *   day bucket IS the daily-rotating salt: derived per request, never
 *   persisted, so yesterday's hashes can't be joined to today's.
 *
 * Counter increments are read-modify-write (KV has no atomic INCR). At this
 * site's event volume lost races are negligible for aggregate analytics —
 * documented limitation, do not "fix" with Durable Objects without a
 * zhongshu cost review (裁决 §三.4 gate: server-cost features re-run the
 * pricing five questions).
 *
 * Three-classification reading (裁决 §三.2, details docs/analytics-spec.md):
 * for iph with cap_hit in a day bucket — no further events = 离开;
 * tool_complete without purchase = 绕过 (counter reset via localStorage);
 * purchase present = 付费. Purchase source of truth = Creem webhook;
 * beacon purchase is funnel reference only.
 */

interface KVNamespaceLite {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  BEACON_KV?: KVNamespaceLite;
}

interface PagesEventContext<E> {
  request: Request;
  env: E;
  waitUntil?: (p: Promise<unknown>) => void;
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

const EVENTS = new Set(['tool_start', 'tool_complete', 'cap_hit', 'purchase', 'cta_click']);
const IP_TTL_SECONDS = 25 * 3600; // 25h: 24h join window + 1h skew
const NO_CONTENT = () => new Response(null, { status: 204 });

function cleanPart(v: unknown, max = 60): string {
  if (typeof v !== 'string') return '';
  // keep key-safe chars only; never trust raw client strings in KV keys
  return v.replace(/[^a-z0-9/_-]/gi, '').slice(0, max);
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function incr(kv: KVNamespaceLite, key: string): Promise<void> {
  const cur = parseInt((await kv.get(key)) ?? '0', 10) || 0;
  await kv.put(key, String(cur + 1));
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const kv = context.env.BEACON_KV;
    if (!kv) return NO_CONTENT(); // binding missing — analytics off, UX unaffected

    const body = (await context.request.json()) as Record<string, unknown>;
    const event = typeof body.event === 'string' ? body.event : '';
    if (!EVENTS.has(event)) return NO_CONTENT();

    const slug = cleanPart(body.slug);
    const slot = event === 'cta_click' ? cleanPart(body.slot, 30) : '';
    const day = new Date().toISOString().slice(0, 10); // UTC day bucket
    const ip = context.request.headers.get('cf-connecting-ip') ?? 'unknown';
    const iph = await sha256Hex(`cp-beacon-v1:${day}:${ip}`);

    const writes: Promise<void>[] = [
      incr(kv, `d:${day}:${event}`),
      ...(slug ? [incr(kv, `d:${day}:${event}:${slug}`)] : []),
      ...(slot ? [incr(kv, `d:${day}:cta_click:slot:${slot}`)] : []),
      kv.put(`ip:${day}:${iph}:${event}`, '1', { expirationTtl: IP_TTL_SECONDS }),
    ];
    const all = Promise.all(writes);
    if (context.waitUntil) {
      context.waitUntil(all); // answer immediately, write in background
      return NO_CONTENT();
    }
    await all;
  } catch {
    /* fall through: analytics never surfaces errors */
  }
  return NO_CONTENT();
};

// Non-POST: still 204 — "never errors to the frontend" is literal.
export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return NO_CONTENT();
};
