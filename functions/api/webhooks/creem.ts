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
 * Interim state: CREEM_WEBHOOK_SECRET is backfilled by zhongshu AFTER this
 * endpoint is live (dispatch v2 §6). Until then events are accepted but the
 * Telegram notice is prefixed "UNVERIFIED" so spoofed noise is visible.
 */

interface Env {
  CREEM_WEBHOOK_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
}

interface PagesEventContext<E> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

const TELEGRAM_CHAT_ID = '5190008355'; // same notify target as /api/feedback
const TELEGRAM_CHAT_ID_FALLBACK = '8626495474';
const TOLERANCE_S = 5 * 60;

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const payload = await context.request.text();
  const secret = context.env.CREEM_WEBHOOK_SECRET;

  let verified = false;
  if (secret) {
    verified = await verifySignature(payload, context.request.headers, secret);
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
    const lines = [
      `${verified ? '💰' : '⚠️ UNVERIFIED'} CleanPaths order (checkout.completed)`,
      `Tier: ${typeof metadata.tier === 'string' ? metadata.tier : 'n/a'}`,
      `Product: ${typeof obj.product === 'string' ? obj.product : 'n/a'}`,
      `Amount: ${money(obj.amount ?? obj.total, obj.currency)}`,
      `Email: ${maskEmail(customer.email ?? obj.email)}`,
      `Order: ${typeof obj.order === 'string' ? obj.order : 'n/a'}`,
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
  }

  // Acknowledge everything (200) so Creem doesn't retry known-accepted events.
  return Response.json({ ok: true }, { status: 200 });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
};
