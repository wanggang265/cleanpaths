/**
 * functions/_middleware.js — Cloudflare Pages Function middleware (08 SEO P1-3).
 *
 * Preview deployments (*.pages.dev) must never be indexed: respond with
 * X-Robots-Tag: noindex on EVERY response when the request host ends with
 * .pages.dev. The production domain (cleanpaths.io, custom domain binding)
 * is completely untouched — the check is host-based, not a blanket header.
 */
export async function onRequest(context) {
  const res = await context.next();
  const host = (context.request.headers.get('host') || '').toLowerCase();
  if (!host.endsWith('.pages.dev')) return res;
  const headers = new Headers(res.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}
