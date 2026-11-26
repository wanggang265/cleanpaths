/**
 * functions/api/webhooks/creem.ts — POST /api/webhooks/creem (08 dispatch v2 §3).
 *
 * Receives Creem webhook events, verifies the signature, and forwards a
 * sale notification to the existing Telegram bot channel (same pattern as
 * /api/feedback). NO order database (D1 is v1.1); this endpoint is
 * notify-only and returns 200 immediately after handling.
 *
 * Signature schemes supported (mirrors the official Creem SDK webhooks.ts):
 *   - legacy:   header `creem-signature` (or `x-creem-signature`),
 *               hex HMAC-SHA256(raw body, secret), optional `sha256=` prefix
 *   - standard: headers `webhook-id` + `webhook-timestamp` + `webhook-signature`,
 *               base64 HMAC-SHA256(`${id}.${ts}.${body}`, base64(secret minus whsec_)),
 *               `v1,<sig>` space-separated list, ±5min timestamp tolerance
 *
 * Failure semantics (aligned with existing API): 401 on bad signature, 405 on
 * non-POST, no stack traces in any response.
 *
 * P0-4b (analytics-spec §8.4): a verified checkout.completed additionally
 * fires a server-side GA4 `purchase` via Measurement Protocol — the ONLY
 * purchase channel (FE never sends purchase). Payload carries order-level
 * fields exclusively; customer PII (email/name) never enters this path.
 *
 * Interim state: CREEM_WEBHOOK_SECRET is backfilled by zhongshu AFTER this
 * endpoint is live (dispatch v2 §6). Until then events are accepted but the
 * Telegram notice is prefixed "UNVERIFIED" so spoofed noise is visible.
 */

interface Env {
	CREEM_WEBHOOK_SECRET?: string;
	/** P0-4b T6: test-store webhook endpoint has its own signing secret (differs from live's). */
	CREEM_WEBHOOK_SECRET_TEST?: string;
  TELEGRAM_BOT_TOKEN?: string;
  GA4_API_SECRET?: string; // P0-4b: Measurement Protocol api_secret (analytics-spec §8.4)
}

interface PagesEventContext<E> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void; // extend response lifetime for fire-and-forget sends
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

const TELEGRAM_CHAT_ID = '5190008355'; // same notify target as /api/feedback
const TELEGRAM_CHAT_ID_FALLBACK = '8626495474';
const TOLERANCE_S = 5 * 60;
const GA4_MEASUREMENT_ID = 'G-9T8XY5EB0Y'; // analytics-spec §8.4 (frozen, same GA4 asset as the web gtag)
const MP_TIMEOUT_MS = 6000; // GA4 send budget; the webhook 200 never waits this long (waitUntil)

const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(bytes: ArrayBuffer): string {
  let bin = '';
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function hmacSha256(key: Uint8Array, value: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value));
}

/** Mirrors Creem SDK verifyWebhookSignature (legacy + standard). */
async function verifySignature(payload: string, headers: Headers, secret: string): Promise<boolean> {
  // Standard webhook headers first.
  const id = headers.get('webhook-id');
  const ts = headers.get('webhook-timestamp');
  const sigHeader = headers.get('webhook-signature');
  if (id && ts && sigHeader) {
    const timestamp = Number.parseInt(ts, 10);
    if (Number.isNaN(timestamp)) return false;
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > TOLERANCE_S || timestamp > now + TOLERANCE_S) return false;
    const secretBytes = secret.startsWith('whsec_') ? fromBase64(secret.slice('whsec_'.length)) : encoder.encode(secret);
    const expected = toBase64(await hmacSha256(secretBytes, `${id}.${timestamp}.${payload}`));
    for (const part of sigHeader.split(' ')) {
      const [version, signature] = part.split(',');
      if (version === 'v1' && signature && timingSafeEqual(signature, expected)) return true;
    }
    return false;
  }
  // Legacy creem-signature header.
  const legacy = headers.get('creem-signature') ?? headers.get('x-creem-signature');
  if (!legacy) return false;
  const expected = toHex(await hmacSha256(encoder.encode(secret), payload));
  const given = legacy.trim().toLowerCase().replace(/^sha256=/, '');
  return timingSafeEqual(given, expected);
}

function maskEmail(email: unknown): string {
  if (typeof email !== 'string' || !email.includes('@')) return 'n/a';
  const [local, domain] = email.split('@');
  const head = local.slice(0, 2);
  return `${head}***@${domain}`;
}

function money(amount: unknown, currency: unknown): string {
  const a = typeof amount === 'number' ? amount : Number.NaN;
  if (!Number.isFinite(a)) return 'n/a';
  const cur = typeof currency === 'string' ? currency.toUpperCase() : 'USD';
  return `${cur} ${(a / 100).toFixed(2)}`;
}

/**
 * P0-4b dual-shape order extraction. Official docs ship `event.object.order`
 * as an OBJECT (id / amount / amount_paid / currency — docs.creem.io
 * OrderEntity); the legacy code assumed a bare string. Accept both, falling
 * back to checkout-level fields. Only order-level fields are read here, so
 * no customer PII can leak through this path.
 */
function extractOrder(obj: Record<string, unknown>): { id: string; amountCents: number | null; currency: string } {
  let id = '';
  let amountCents: number | null = null;
  let currency = '';
  const order = obj.order;
  if (typeof order === 'string') {
    id = order;
  } else if (order && typeof order === 'object') {
    const o = order as Record<string, unknown>;
    if (typeof o.id === 'string') id = o.id;
    if (typeof o.amount_paid === 'number') amountCents = o.amount_paid;
    else if (typeof o.amount === 'number') amountCents = o.amount;
    if (typeof o.currency === 'string') currency = o.currency;
  }
  // Checkout-level fallbacks: checkout id is stable per session, so it keeps
  // GA4 transaction_id dedup (idempotency) intact even in degraded payloads.
  if (!id && typeof obj.id === 'string') id = obj.id;
  if (amountCents === null && typeof obj.amount === 'number') amountCents = obj.amount;
  if (!currency && typeof obj.currency === 'string') currency = obj.currency;
  return { id, amountCents, currency };
}

/**
 * GA4 Measurement Protocol send (analytics-spec §8.4). Fire-and-forget:
 * failures resolve to status 0 and are logged upstream — never thrown, never
 * allowed to fail the webhook 2xx (Creem retries on non-2xx; GA4 dedups
 * repeats via transaction_id if we ever do re-fire).
 */
async function sendPurchaseToGa4(mpUrl: string, payload: unknown): Promise<number> {
  try {
    const res = await fetch(mpUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await res.text(); // drain the body so the connection is released
    return res.status;
  } catch {
    return 0;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const payload = await context.request.text();
  // Live and test webhook endpoints carry different signing secrets; a match
  // against either verifies the event (P0-4b T6 test-store deliveries).
  // Semantics unchanged: no match + at least one secret configured = 401.
  const secrets = [context.env.CREEM_WEBHOOK_SECRET, context.env.CREEM_WEBHOOK_SECRET_TEST].filter(
    (s): s is string => typeof s === 'string' && s.length > 0,
  );

  let verified = false;
  if (secrets.length > 0) {
    for (const secret of secrets) {
      if (await verifySignature(payload, context.request.headers, secret)) {
        verified = true;
        break;
      }
    }
    if (!verified) {
      return Response.json({ ok: false, error: 'invalid_signature' }, { status: 401 });
    }
  }
  // No secret configured yet (pre-backfill window): accept but mark clearly.

  let event: {
    eventType?: string;
    event_type?: string;
    type?: string;
    object?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
  try {
    event = JSON.parse(payload) as typeof event;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const type = event.eventType ?? event.event_type ?? event.type ?? 'unknown';
  const obj = (event.object ?? event.data ?? {}) as Record<string, unknown>;
  const metadata = (obj.metadata ?? {}) as Record<string, unknown>;
  const customer = (obj.customer ?? {}) as Record<string, unknown>;

  if (type === 'checkout.completed') {
    // P0-4b: order-level extraction shared by the Telegram notice and the GA4
    // MP purchase event (handles documented order-object and legacy
    // order-as-string shapes — see extractOrder).
    const { id: orderId, amountCents, currency: orderCurrency } = extractOrder(obj);
    const plan = typeof metadata.tier === 'string' ? metadata.tier : 'unknown';
    const lines = [
      `${verified ? '💰' : '⚠️ UNVERIFIED'} CleanPaths order (checkout.completed)`,
      `Tier: ${plan}`,
      `Product: ${typeof obj.product === 'string' ? obj.product : 'n/a'}`,
      `Amount: ${money(amountCents, orderCurrency)}`,
      `Email: ${maskEmail(customer.email ?? obj.email)}`,
      `Order: ${orderId || 'n/a'}`,
      `Checkout: ${typeof obj.id === 'string' ? obj.id : 'n/a'}`,
    ];

    const token = context.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      const text = lines.join('\n');
      const sendTo = async (chatId: string): Promise<boolean> => {
        try {
          const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
          });
          return tg.ok;
        } catch {
          return false;
        }
      };
      // Best-effort notify; never block the 200 on Telegram health.
      await Promise.race([
        (async () => ((await sendTo(TELEGRAM_CHAT_ID)) || (await sendTo(TELEGRAM_CHAT_ID_FALLBACK))))(),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
    }

    // GA4 purchase via Measurement Protocol (analytics-spec §8.4) — the only
    // BE purchase channel. Fire-and-forget via waitUntil: the webhook returns
    // its 200 immediately (Creem retry semantics) while the GA4 send runs in
    // the background. Idempotency = GA4's native transaction_id dedup, so
    // webhook redelivery never double-counts. Payload: order-level fields
    // only; customer PII never enters (T4 red line).
    const apiSecret = context.env.GA4_API_SECRET;
    if (!apiSecret || !orderId || amountCents === null) {
      console.log(
        JSON.stringify({
          mp_purchase_skipped: {
            reason: !apiSecret ? 'no_api_secret' : !orderId ? 'no_order_id' : 'no_amount',
            transaction_id: orderId,
            plan,
          },
        }),
      );
    } else {
      const rawClientId =
        typeof metadata.client_id === 'string' && metadata.client_id.trim().length > 0 ? metadata.client_id : '';
      // §8.4 frozen fallback: missing client_id → random UUID, purchase still
      // sends (only the user-level join with checkout_started is weakened).
      const clientId = rawClientId || crypto.randomUUID();
      const value = amountCents / 100; // cents → currency units (the one spec-mandated conversion; no rounding)
      const currency = orderCurrency.toUpperCase();
      const mpUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${encodeURIComponent(apiSecret)}`;
      const mpPayload = {
        client_id: clientId,
        events: [
          {
            name: 'purchase',
            params: {
              transaction_id: orderId,
              currency,
              value,
              items: [{ item_id: plan, item_name: plan, price: value, quantity: 1 }],
            },
          },
        ],
      };
      const timeout = new Promise<number>((resolve) => setTimeout(() => resolve(0), MP_TIMEOUT_MS));
      context.waitUntil(
        Promise.race([sendPurchaseToGa4(mpUrl, mpPayload), timeout]).then((status) => {
          // Evidence log — order-level fields only; client_id reduced to a
          // presence boolean (PII red line, T4).
          console.log(
            JSON.stringify({
              mp_purchase: {
                ok: status >= 200 && status < 300,
                status,
                transaction_id: orderId,
                plan,
                currency,
                value,
                client_id_provided: rawClientId !== '',
              },
            }),
          );
        }),
      );
    }
  }

  // Acknowledge everything (200) so Creem doesn't retry known-accepted events.
  return Response.json({ ok: true }, { status: 200 });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
};
