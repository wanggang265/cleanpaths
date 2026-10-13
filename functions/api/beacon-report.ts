/**
 * functions/api/beacon-report.ts — GET /api/beacon-report?days=N (#54).
 *
 * Reads the BEACON_KV aggregate counters written by /api/beacon and returns
 * the last N UTC day buckets (default 7, max 31):
 *   - per-day totals + per-slug breakdown for each of the five
 *     preregistered events (tool_start/tool_complete/cap_hit/purchase/cta_click
 *     + cta_click slot breakdown), and
 *   - the cap three-classification (裁决记录 §三.2): over iph markers with
 *     cap_hit that day — no further event = left; tool_complete without
 *     purchase = bypass (localStorage counter reset); purchase = paid.
 *
 * Auth: header `x-beacon-admin-key` must equal the BEACON_ADMIN_KEY Pages
 * secret. Missing/wrong → 401 JSON. No dashboard page by design — daily/
 * weekly reports pull this JSON and must cite docs/analytics-spec.md
 * (预注册: 禁止输出无落点结论, 裁决 §三.3).
 */

interface KVNamespaceLite {
  get(key: string): Promise<string | null>;
  list(opts?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
}

interface Env {
  BEACON_KV?: KVNamespaceLite;
  BEACON_ADMIN_KEY?: string;
}

interface PagesEventContext<E> {
  request: Request;
  env: E;
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

const EVENTS = ['tool_start', 'tool_complete', 'cap_hit', 'purchase', 'cta_click'] as const;

const UNAUTHORIZED = () =>
  Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });

function dayList(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    out.push(new Date(now.getTime() - i * 86_400_000).toISOString().slice(0, 10));
  }
  return out;
}

async function listAll(kv: KVNamespaceLite, prefix: string): Promise<string[]> {
  const names: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, limit: 1000, cursor });
    names.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return names;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const key = context.request.headers.get('x-beacon-admin-key') ?? '';
  const expected = context.env.BEACON_ADMIN_KEY;
  if (!expected || key !== expected) return UNAUTHORIZED();
  const kv = context.env.BEACON_KV;
  if (!kv) return Response.json({ ok: false, error: 'not_configured' }, { status: 500 });

  const url = new URL(context.request.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') ?? '7', 10) || 7, 1), 31);
  const wanted = dayList(days);

  const result: Record<string, unknown> = {};
  for (const day of wanted) {
    // ---- daily aggregates ----
    const totals: Record<string, number> = {};
    const bySlug: Record<string, Record<string, number>> = {};
    const slots: Record<string, number> = {};
    for (const event of EVENTS) {
      totals[event] = parseInt((await kv.get(`d:${day}:${event}`)) ?? '0', 10) || 0;
      const slugKeys = await listAll(kv, `d:${day}:${event}:`);
      for (const k of slugKeys) {
        const rest = k.slice(`d:${day}:${event}:`.length);
        const v = parseInt((await kv.get(k)) ?? '0', 10) || 0;
        if (rest.startsWith('slot:')) slots[rest.slice(5)] = v;
        else (bySlug[event] ??= {})[rest] = v;
      }
    }
    // ---- cap three-classification (裁决 §三.2) ----
    const ipKeys = await listAll(kv, `ip:${day}:`);
    const byIph = new Map<string, Set<string>>();
    for (const k of ipKeys) {
      // ip:<day>:<iph>:<event>
      const parts = k.split(':');
      const iph = parts[2];
      const event = parts[3];
      if (!iph || !event) continue;
      (byIph.get(iph) ?? byIph.set(iph, new Set()).get(iph)!).add(event);
    }
    let left = 0;
    let bypass = 0;
    let paid = 0;
    for (const [, events] of byIph) {
      if (!events.has('cap_hit')) continue; // classification population = capped iph
      if (events.has('purchase')) paid++;
      else if (events.has('tool_complete')) bypass++;
      else left++;
    }
    result[day] = {
      totals,
      bySlug,
      ctaSlots: slots,
      capClassification: { left, bypass, paid, cappedIps: left + bypass + paid },
    };
  }

  return Response.json({
    ok: true,
    spec: 'docs/analytics-spec.md — 裁决 §三.2/§三.3 preregistered; purchase truth = Creem webhook',
    days: result,
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'GET') return onRequestGet(context);
  return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
};
