/**
 * functions/api/license/verify.ts — POST /api/license/verify (08 dispatch v2 §5).
 *
 * Server-side proxy for Creem license activation/validation so the API key
 * never reaches the browser. No account system, no database: the entitlement
 * itself lives in the client's localStorage (04 §7); this endpoint is the
 * one-time online check that makes "offline after activation" honest.
 *
 * Flow:
 *   First activation on a device:
 *     client → { license_key, instance_name }  → Creem /v1/licenses/activate
 *     → { valid, tier, packs, instance_id, status }
 *   Re-verification (same device, online):
 *     client → { license_key, instance_id }    → Creem /v1/licenses/validate
 *     → same shape
 *
 * tier/packs mapping (04 §1.2 / §7, frozen):
 *   Pro Core   → tier "pro_core",     packs []
 *   Batch      → tier "pack",         packs ["batch"]
 *   Precision  → tier "pack",         packs ["precision"]
 *   Monthly    → tier "monthly_pass", packs []      (pro-level while active)
 *
 * Errors: 400 invalid_request, 401 invalid key / instance (valid:false),
 * 500 not_configured, 502 upstream. No Creem internals or stack traces leak.
 */

interface Env {
  CREEM_API_KEY?: string;
  CREEM_PRODUCT_ID_PRO_CORE?: string;
  CREEM_PRODUCT_ID_BATCH?: string;
  CREEM_PRODUCT_ID_PRECISION?: string;
  CREEM_PRODUCT_ID_MONTHLY?: string;
  CREEM_PRODUCT_ID_TEST_DOLLAR?: string;
}

interface PagesEventContext<E> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

const CREEM_BASE = 'https://api.creem.io/v1/licenses';
const RATE_LIMIT = 10; // verify attempts
const RATE_WINDOW_MS = 60_000;

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

type Tier = 'pro_core' | 'pack' | 'monthly_pass';
type Pack = 'batch' | 'precision';

interface EntitlementMapping {
  tier: Tier;
  packs: Pack[];
}

function entitlementFor(env: Env, productId: string): EntitlementMapping | null {
  if (productId === env.CREEM_PRODUCT_ID_PRO_CORE) return { tier: 'pro_core', packs: [] };
  if (productId === env.CREEM_PRODUCT_ID_BATCH) return { tier: 'pack', packs: ['batch'] };
  if (productId === env.CREEM_PRODUCT_ID_PRECISION) return { tier: 'pack', packs: ['precision'] };
  if (productId === env.CREEM_PRODUCT_ID_MONTHLY) return { tier: 'monthly_pass', packs: [] };
  // E2E test product maps to pro_core so the $1 rehearsal exercises the same
  // client path as a real Pro Core activation (refunded afterwards).
  if (productId === env.CREEM_PRODUCT_ID_TEST_DOLLAR) return { tier: 'pro_core', packs: [] };
  return null;
}

interface CreemLicenseResponse {
  id?: string;
  key?: string;
  status?: string;
  product_id?: string;
  product?: string;
  instance?: { id?: string; status?: string };
  instances?: Array<{ id?: string; status?: string }>;
  message?: string;
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

  const key = typeof body.license_key === 'string' ? body.license_key.trim() : '';
  if (!key || key.length > 200) {
    return Response.json({ ok: false, error: 'invalid_request' }, { status: 400 });
  }
  const instanceId = typeof body.instance_id === 'string' ? body.instance_id.trim() : '';
  const instanceName =
    typeof body.instance_name === 'string' && body.instance_name.trim()
      ? body.instance_name.trim().slice(0, 120)
      : 'cleanpaths-web';
  if (!instanceId && !instanceName) {
    return Response.json({ ok: false, error: 'invalid_request' }, { status: 400 });
  }

  const apiKey = context.env.CREEM_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }

  // instance_id present → validate that existing activation; otherwise
  // perform the one-time activation for this device.
  const path = instanceId ? '/validate' : '/activate';
  const payload = instanceId
    ? { key, instance_id: instanceId }
    : { key, instance_name: instanceName };

  let creemRes: Response;
  try {
    creemRes = await fetch(`${CREEM_BASE}${path}`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return Response.json({ ok: false, error: 'upstream' }, { status: 502 });
  }

  let data: CreemLicenseResponse | null = null;
  try {
    data = (await creemRes.json()) as CreemLicenseResponse;
  } catch {
    data = null;
  }

  if (!creemRes.ok || !data) {
    // Wrong key / unknown instance / activation limit — an honest "no".
    // 4xx from Creem means the key/instance is the problem, not our server.
    if (creemRes.status >= 400 && creemRes.status < 500) {
      return Response.json({ ok: true, valid: false }, { status: 200 });
    }
    return Response.json({ ok: false, error: 'upstream' }, { status: 502 });
  }

  const status = (data.status ?? '').toLowerCase();
  const valid = status === 'active';
  const productId = data.product_id ?? data.product ?? '';
  const mapping = productId ? entitlementFor(context.env, productId) : null;
  const returnedInstanceId = data.instance?.id ?? data.instances?.[0]?.id ?? instanceId ?? null;

  return Response.json(
    {
      ok: true,
      valid,
      status: status || 'unknown',
      tier: mapping?.tier ?? null,
      packs: mapping?.packs ?? [],
      instance_id: returnedInstanceId,
    },
    { status: 200 },
  );
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
};
