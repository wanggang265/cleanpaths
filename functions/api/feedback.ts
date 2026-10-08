/**
 * functions/api/feedback.ts — POST /api/feedback (07e, open-items #3/#13).
 *
 * Minimal feedback endpoint: accepts the JSON payloads sent by
 * src/components/feedback.tsx (modal: { type, message, contact, page, lang, ts })
 * and src/components/tool/ToolController.tsx (inline: { kind, context, rating,
 * message, showcase_optin, ... }), forwards them to a Telegram bot chat, and
 * returns 200. The bot token lives in the TELEGRAM_BOT_TOKEN Pages secret.
 *
 * Rate limit: max 5 submissions per minute per client IP (in-memory; best
 * effort per isolate — sufficient against casual abuse, not a hard guarantee).
 */

interface Env {
  TELEGRAM_BOT_TOKEN?: string;
}

// Minimal Pages Function types (avoids a hard dependency on
// @cloudflare/workers-types in the Next.js tsconfig scope).
interface PagesEventContext<E> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

const TELEGRAM_CHAT_ID = '5190008355'; // specced notify target (07e)
// Fallback: verified reachable private chat of the site owner (Gang Wang,
// the bot's TELEGRAM_ALLOWED_USERS entry). Used only if the primary chat_id
// is not resolvable by the bot (e.g., bot not yet a member of that chat).
const TELEGRAM_CHAT_ID_FALLBACK = '8626495474';
const RATE_LIMIT = 5; // submissions
const RATE_WINDOW_MS = 60_000; // per minute

// In-memory per-isolate rate limiting.
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
  // occasional cleanup so the map doesn't grow unbounded
  if (hits.size > 1000) {
    hits.forEach((v, k) => {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    });
  }
  return false;
}

function str(v: unknown, max = 2000): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : String(v);
  return s.length > max ? s.slice(0, max) + '…' : s;
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

  // Tolerant field extraction across the two front-end payload shapes.
  const type =
    str(body.type, 100) || str(body.kind, 100) || str(body.rating, 100) || str(body.emoji, 100) || 'feedback';
  const page = str(body.page, 300) || str(body.context, 100) || 'unknown';
  const text = str(body.message, 2000) || str(body.text, 2000);
  const contact = str(body.contact, 300);
  const lang = str(body.lang, 10);
  const optin = body.showcase_optin === true ? 'yes' : body.showcase_optin === false ? 'no' : '';

  const lines = [
    `📬 CleanPaths feedback`,
    `Type: ${type}`,
    `Page: ${page}`,
    text ? `Message: ${text}` : '',
    contact ? `Contact: ${contact}` : '',
    lang ? `Lang: ${lang}` : '',
    optin ? `Showcase opt-in: ${optin}` : '',
    `IP: ${ip}`,
  ].filter(Boolean);

  const token = context.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    // Misconfigured deployment — don't leak details to the client.
    return Response.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }

  const messageText = lines.join('\n');
  async function sendTo(chatId: string): Promise<boolean> {
    try {
      const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          disable_web_page_preview: true,
        }),
      });
      return tg.ok;
    } catch {
      return false;
    }
  }

  // Primary target per spec; fall back to the owner's verified chat if the
  // primary is unreachable by this bot.
  const delivered = (await sendTo(TELEGRAM_CHAT_ID)) || (await sendTo(TELEGRAM_CHAT_ID_FALLBACK));
  if (!delivered) {
    return Response.json({ ok: false, error: 'upstream' }, { status: 502 });
  }

  return Response.json({ ok: true }, { status: 200 });
};

// Non-POST methods: reject cleanly.
export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
};
