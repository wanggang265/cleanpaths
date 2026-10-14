/**
 * functions/admin/feedback.ts — GET /admin/feedback?key=... (05 v1.6, 2026-10-14)
 *
 * Key-gated aggregate view of the feedback table (D1). Not linked anywhere on
 * the site; the URL + ADMIN_KEY Pages secret is the access control (the site
 * is no-account by frozen design, so no login system is introduced).
 *
 * Behavior:
 *  - No ADMIN_KEY configured → 404 (don't reveal the endpoint exists).
 *  - Wrong/missing key → 404 (same, not 403 — no oracle).
 *  - OK → summary counts (by kind / type / rating, last 7 days) + latest 200
 *    rows, newest first. ?type= filters rows. All output HTML-escaped.
 */

interface Env {
  ADMIN_KEY?: string;
  DB?: D1Database;
}

interface D1Row {
  id: number;
  created_at: string;
  kind: string;
  type: string;
  rating: string;
  message: string;
  contact: string;
  page: string;
  lang: string;
  showcase_optin: number;
}

interface D1Database {
  prepare(sql: string): {
    bind(...args: unknown[]): { run(): Promise<unknown>; all(): Promise<{ results?: D1Row[] }> };
    all(): Promise<{ results?: D1Row[] }>;
    first(): Promise<Record<string, unknown> | null>;
  };
}

interface PagesEventContext<E> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}
type PagesFunction<E> = (context: PagesEventContext<E>) => Promise<Response> | Response;

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Constant-time-ish compare (length-leak acceptable for a low-value admin view).
function keyOk(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const notFound = () => new Response('Not found', { status: 404 });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const secret = context.env.ADMIN_KEY;
  if (!secret) return notFound();
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') ?? '';
  if (!keyOk(key, secret)) return notFound();
  if (!context.env.DB) {
    return new Response('DB not configured', { status: 500, headers: { 'content-type': 'text/plain' } });
  }

  const db = context.env.DB;
  const typeFilter = url.searchParams.get('type') ?? '';

  const total = (await db.prepare('SELECT COUNT(*) AS n FROM feedback').first())?.n ?? 0;
  const week = (
    await db.prepare("SELECT COUNT(*) AS n FROM feedback WHERE created_at >= datetime('now', '-7 days')").first()
  )?.n ?? 0;
  const byType = await db
    .prepare('SELECT type, COUNT(*) AS n FROM feedback GROUP BY type ORDER BY n DESC')
    .all();
  const byRating = await db
    .prepare("SELECT rating, COUNT(*) AS n FROM feedback WHERE rating != '' GROUP BY rating ORDER BY n DESC")
    .all();

  const rows = typeFilter
    ? await db
        .prepare('SELECT * FROM feedback WHERE type = ? ORDER BY id DESC LIMIT 200')
        .bind(typeFilter)
        .all()
    : await db.prepare('SELECT * FROM feedback ORDER BY id DESC LIMIT 200').all();

  const pill = (label: string, n: unknown, active: boolean) =>
    `<a href="?key=${esc(key)}${label ? `&type=${encodeURIComponent(label)}` : ''}" style="display:inline-block;margin:0 6px 6px 0;padding:4px 12px;border-radius:999px;border:1.5px solid ${active ? '#E4572E' : '#d8dde6'};background:${active ? '#E4572E' : '#fff'};color:${active ? '#fff' : '#333'};text-decoration:none;font-size:13px">${esc(label || '全部')} (${String(n)})</a>`;

  const typePills = [
    pill('', total as number, !typeFilter),
    ...((byType.results ?? []).map((r) => pill(String(r.type), (r as unknown as { n: number }).n, typeFilter === String(r.type)))),
  ].join('');

  const ratingRows = (byRating.results ?? [])
    .map((r) => `<span style="margin-right:14px">${esc(String(r.rating))} × ${String((r as unknown as { n: number }).n)}</span>`)
    .join('');

  const trs = (rows.results ?? [])
    .map(
      (r) => `<tr>
<td style="white-space:nowrap">${esc(r.created_at)}</td>
<td>${esc(r.kind)}</td>
<td><b>${esc(r.type)}</b>${r.rating ? `<br><span style="color:#666">${esc(r.rating)}</span>` : ''}</td>
<td style="max-width:420px;word-break:break-word">${esc(r.message)}</td>
<td>${esc(r.contact)}</td>
<td style="font-size:12px;color:#666">${esc(r.page)}${r.lang ? ` · ${esc(r.lang)}` : ''}${r.showcase_optin ? ' · opt-in' : ''}</td>
</tr>`,
    )
    .join('\n');

  const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>CleanPaths 反馈汇总</title>
<style>
body{font-family:ui-monospace,Menlo,Consolas,monospace;max-width:1080px;margin:24px auto;padding:0 14px;color:#1a1d23}
h1{font-size:19px} h2{font-size:15px;margin-top:26px}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border:1px solid #e2e6ec;padding:7px 9px;text-align:left;vertical-align:top}
th{background:#f4f1ea;position:sticky;top:0}
tr:nth-child(even) td{background:#fafaf7}
.stat{display:inline-block;margin-right:26px;font-size:14px}
.stat b{font-size:22px;display:block}
</style></head><body>
<h1>📬 CleanPaths 反馈汇总</h1>
<div>
<span class="stat"><b>${esc(total)}</b>累计</span>
<span class="stat"><b>${esc(week)}</b>近 7 天</span>
<span class="stat"><b>${rows.results?.length ?? 0}</b>当前显示${typeFilter ? `（筛选: ${esc(typeFilter)}）` : ''}</span>
</div>
<h2>按类型</h2>
<div>${typePills}</div>
${ratingRows ? `<h2>按评分（结果态反馈）</h2><div>${ratingRows}</div>` : ''}
<h2>明细（最新在前，最多 200 条）</h2>
<table><thead><tr><th>时间 (UTC)</th><th>来源</th><th>类型/评分</th><th>内容</th><th>联系方式</th><th>页面</th></tr></thead>
<tbody>${trs || '<tr><td colspan="6" style="text-align:center;color:#888">暂无反馈</td></tr>'}</tbody></table>
</body></html>`;

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'GET') return onRequestGet(context);
  return notFound();
};
