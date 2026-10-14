/**
 * functions/api/checkout.ts — POST /api/checkout (08 dispatch v2: Creem 接线).
 *
 * Maps a pricing tier to its Creem Product ID (Pages env), creates a Creem
 * checkout session via POST https://api.creem.io/v1/checkouts, and returns
 * { url } for the frontend to redirect to. The API key never leaves the
 * server side (Pages secret); the browser bundle holds zero secrets.
 *
 * Request:  { tier: "core"|"batch"|"precision"|"monthly"|"test" }
 *           (legacy alias: { plan: "pro"|"batch-pack"|"precision-pack"|"monthly-pass" })
 * Response: { ok: true, url: "https://www.creem.io/checkout/..." }
 * Errors:   400 invalid_tier / invalid_json, 429 rate_limited,
 *           500 not_configured, 502 upstream — no stack traces, no key leakage.
 *
 * cancel_url note: the Creem checkout-create API has NO cancel_url field
 * (confirmed against the official SDK schema). Only success_url is sent;
 * aborting the hosted checkout simply leaves the user on Creem/returns them
 * per Creem's own UX. Reported to zhongshu — not a frozen-fact conflict.
 */

interface Env {
  CREEM_API_KEY?: string;
  CREEM_PRODUCT_ID_PRO_CORE?: string;
  CREEM_PRODUCT_ID_BATCH?: string;
  CREEM_PRODUCT_ID_PRECISION?: string;
  CREEM_PRODUCT_ID_MONTHLY?: string;
  CREEM_PRODUCT_ID_TEST_DOLLAR?: string;
  // Optional override for Creem test mode (https://test-api.creem.io).
  // Unset = production. Set ONLY during test-mode E2E; delete after.
  CREEM_CHECKOUT_API?: string;
}

interface PagesEventContext<E> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

const CREEM_API = 'https://api.creem.io/v1/checkouts'; // production default; CREEM_CHECKOUT_API env overrides for test mode
const RATE_LIMIT = 10; // checkout attempts
const RATE_WINDOW_MS = 60_000; // per minute per IP

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 1000) {
    hits.forEach((v, k) => {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    });
  }
  return false;
}

type Tier = 'core' | 'batch' | 'precision' | 'monthly' | 'test';

const TIER_ALIASES: Record<string, Tier> = {
  core: 'core',
  pro: 'core',
  'pro-core': 'core',
  batch: 'batch',
  'batch-pack': 'batch',
  precision: 'precision',
  'precision-pack': 'precision',
  monthly: 'monthly',
  'monthly-pass': 'monthly',
  test: 'test',
};

function productIdFor(env: Env, tier: Tier): string | undefined {
  switch (tier) {
    case 'core':
      return env.CREEM_PRODUCT_ID_PRO_CORE;
    case 'batch':
      return env.CREEM_PRODUCT_ID_BATCH;
    case 'precision':
      return env.CREEM_PRODUCT_ID_PRECISION;
    case 'monthly':
      return env.CREEM_PRODUCT_ID_MONTHLY;
    case 'test':
      return env.CREEM_PRODUCT_ID_TEST_DOLLAR;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip =
    context.request.headers.get('cf-connecting-ip') ??
    context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const raw = typeof body.tier === 'string' ? body.tier : typeof body.plan === 'string' ? body.plan : '';
  const tier = TIER_ALIASES[raw.toLowerCase().trim()];
  if (!tier) {
    return Response.json({ ok: false, error: 'invalid_tier' }, { status: 400 });
  }

  const apiKey = context.env.CREEM_API_KEY;
  const productId = productIdFor(context.env, tier);
  if (!apiKey || !productId) {
    // Misconfigured deployment — don't leak which piece is missing.
    return Response.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }

  // Success lands back on /pricing with a marker query param (dispatch v2 §4,
  // zero-new-copy scheme). Query params in success_url verified accepted by
  // the Creem API on 2026-10-11.
  const origin = new URL(context.request.url).origin;
  const successUrl = `${origin}/pricing/?checkout=success`;

  let creemRes: Response;
  const creemApi = context.env.CREEM_CHECKOUT_API ?? CREEM_API;
  try {
    creemRes = await fetch(creemApi, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        units: 1,
        success_url: successUrl,
        metadata: { source: 'cleanpaths.io', tier },
      }),
    });
  } catch {
    return Response.json({ ok: false, error: 'upstream' }, { status: 502 });
  }

  let data: { checkout_url?: string; message?: string } | null = null;
  try {
    data = (await creemRes.json()) as { checkout_url?: string; message?: string } | null;
  } catch {
    data = null;
  }

  if (!creemRes.ok || !data?.checkout_url) {
    // Honest failure, no Creem internals leaked to the client.
    return Response.json({ ok: false, error: 'upstream' }, { status: 502 });
  }

  return Response.json({ ok: true, url: data.checkout_url }, { status: 200 });
};

// Non-POST methods: reject cleanly (aligned with /api/feedback semantics).
export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
};
