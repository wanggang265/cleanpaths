/**
 * functions/admin/feedback.ts — GET /admin/feedback (05 v1.6, 2026-10-14;
 * P1 security fix 2026-10-24: ADMIN_KEY moved out of the URL, CWE-598).
 *
 * Key-gated aggregate view of the feedback table (D1). Not linked anywhere on
 * the site; the ADMIN_KEY Pages secret is the access control (the site is
 * no-account by frozen design, so no login system is introduced).
 *
 * Auth contract (post-F1):
 *  - The key travels ONLY in the `X-Admin-Key` request header. A `?key=`
 *    query param is refused outright (401) — no legacy compat: URLs leak
 *    into browser history, proxy logs and Referer headers.
 *  - No ADMIN_KEY configured → 404 (don't reveal the endpoint exists).
 *  - Plain browser GET without the header → static key-entry shell page
 *    (contains no data); its JS sends the pasted key as a header on every
 *    fetch and renders the JSON client-side (textContent only — no
 *    innerHTML on user data).
 *  - Wrong/missing key on any other request → 401 JSON, no key echo.
 *  - OK → JSON: summary counts (total / last 7 days / by type / by rating)
 *    + latest 200 rows, newest first. ?type= filters rows.
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

// Constant-time-ish compare (length-leak acceptable for a low-value admin view).
function keyOk(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const notFound = () => new Response('Not found', { status: 404 });
const unauthorized = () => Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });

const SHELL_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex',
};
const DATA_HEADERS = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };

// Key-entry shell: no data in this page; the key never touches the URL.
// Keep free of backticks and "${" — this is a TS template literal.
const SHELL_HTML = `<!doctype html><html lang="zh"><head><meta charset="utf-8">
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
.pill{display:inline-block;margin:0 6px 6px 0;padding:4px 12px;border-radius:999px;border:1.5px solid #d8dde6;background:#fff;color:#333;font-size:13px;cursor:pointer}
.pill.on{border-color:#E4572E;background:#E4572E;color:#fff}
#gate input{padding:6px 10px;font-size:14px;width:340px;font-family:inherit}
#gate button{padding:6px 16px;font-size:14px;cursor:pointer}
#err{color:#b3261e;margin-left:10px}
</style></head><body>
<h1>📬 CleanPaths 反馈汇总</h1>
<div id="gate">
<input id="key" type="password" placeholder="粘贴 ADMIN_KEY 后回车" autocomplete="off">
<button id="go" type="button">查看</button><span id="err"></span>
</div>
<div id="report" style="display:none">
<div id="stats"></div>
<h2>按类型</h2>
<div id="pills"></div>
<div id="ratingsWrap" style="display:none"><h2>按评分（结果态反馈）</h2><div id="ratings"></div></div>
<h2>明细（最新在前，最多 200 条）</h2>
<table><thead><tr><th>时间 (UTC)</th><th>来源</th><th>类型/评分</th><th>内容</th><th>联系方式</th><th>页面</th></tr></thead>
<tbody id="rows"></tbody></table>
</div>
<script>
(function () {
  var keyInput = document.getElementById('key');
  var errEl = document.getElementById('err');
  var reportEl = document.getElementById('report');
  var currentType = '';

  function el(tag, text) {
    var n = document.createElement(tag);
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }

  function render(d) {
    reportEl.style.display = '';
    var stats = document.getElementById('stats');
    stats.textContent = '';
    [['累计', d.total], ['近 7 天', d.week], ['当前显示' + (d.typeFilter ? '（筛选: ' + d.typeFilter + '）' : ''), d.shown]].forEach(function (pair) {
      var s = el('span');
      s.className = 'stat';
      s.appendChild(el('b', pair[1]));
      s.appendChild(document.createTextNode(pair[0]));
      stats.appendChild(s);
    });

    var pills = document.getElementById('pills');
    pills.textContent = '';
    function addPill(label, n, value) {
      var p = el('span', label + ' (' + n + ')');
      p.className = 'pill' + (currentType === value ? ' on' : '');
      p.addEventListener('click', function () { currentType = value; load(); });
      pills.appendChild(p);
    }
    addPill('全部', d.total, '');
    (d.byType || []).forEach(function (t) { addPill(t.type, t.n, t.type); });

    var rw = document.getElementById('ratingsWrap');
    var ratings = document.getElementById('ratings');
    ratings.textContent = '';
    if (d.byRating && d.byRating.length) {
      rw.style.display = '';
      d.byRating.forEach(function (r) {
        var s = el('span', r.rating + ' × ' + r.n);
        s.style.marginRight = '14px';
        ratings.appendChild(s);
      });
    } else {
      rw.style.display = 'none';
    }

    var rows = document.getElementById('rows');
    rows.textContent = '';
    if (!d.rows || !d.rows.length) {
      var tr0 = el('tr');
      var td0 = el('td', '暂无反馈');
      td0.colSpan = 6;
      td0.style.textAlign = 'center';
      td0.style.color = '#888';
      tr0.appendChild(td0);
      rows.appendChild(tr0);
      return;
    }
    d.rows.forEach(function (r) {
      var tr = el('tr');
      var c0 = el('td', r.created_at);
      c0.style.whiteSpace = 'nowrap';
      tr.appendChild(c0);
      tr.appendChild(el('td', r.kind));
      var c2 = el('td');
      c2.appendChild(el('b', r.type));
      if (r.rating) {
        c2.appendChild(document.createElement('br'));
        var rs = el('span', r.rating);
        rs.style.color = '#666';
        c2.appendChild(rs);
      }
      tr.appendChild(c2);
      var c3 = el('td', r.message);
      c3.style.maxWidth = '420px';
      c3.style.wordBreak = 'break-word';
      tr.appendChild(c3);
      tr.appendChild(el('td', r.contact));
      var meta = r.page + (r.lang ? ' · ' + r.lang : '') + (r.showcase_optin ? ' · opt-in' : '');
      var c5 = el('td', meta);
      c5.style.fontSize = '12px';
      c5.style.color = '#666';
      tr.appendChild(c5);
      rows.appendChild(tr);
    });
  }

  function load() {
    var key = keyInput.value.trim();
    if (!key) { errEl.textContent = '请先粘贴 key'; return; }
    errEl.textContent = '加载中…';
    var u = '/admin/feedback' + (currentType ? '?type=' + encodeURIComponent(currentType) : '');
    fetch(u, { headers: { 'x-admin-key': key, 'accept': 'application/json' } }).then(function (res) {
      if (res.status === 401) {
        errEl.textContent = 'key 无效';
        reportEl.style.display = 'none';
        sessionStorage.removeItem('cp_admin_key');
        return null;
      }
      if (!res.ok) { errEl.textContent = '加载失败 (' + res.status + ')'; return null; }
      return res.json();
    }).then(function (d) {
      if (!d) return;
      errEl.textContent = '';
      sessionStorage.setItem('cp_admin_key', key);
      render(d);
    }).catch(function () { errEl.textContent = '网络错误'; });
  }

  document.getElementById('go').addEventListener('click', function () { currentType = ''; load(); });
  keyInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { currentType = ''; load(); } });
  var saved = sessionStorage.getItem('cp_admin_key');
  if (saved) { keyInput.value = saved; load(); }
})();
</script>
</body></html>`;

async function serveData(context: PagesEventContext<Env>, url: URL): Promise<Response> {
  if (!context.env.DB) {
    return new Response('DB not configured', { status: 500, headers: { 'content-type': 'text/plain' } });
  }
  const db = context.env.DB;
  const typeFilter = url.searchParams.get('type') ?? '';

  const total = (await db.prepare('SELECT COUNT(*) AS n FROM feedback').first())?.n ?? 0;
  const week =
    (await db.prepare("SELECT COUNT(*) AS n FROM feedback WHERE created_at >= datetime('now', '-7 days')").first())
      ?.n ?? 0;
  const byType = await db.prepare('SELECT type, COUNT(*) AS n FROM feedback GROUP BY type ORDER BY n DESC').all();
  const byRating = await db
    .prepare("SELECT rating, COUNT(*) AS n FROM feedback WHERE rating != '' GROUP BY rating ORDER BY n DESC")
    .all();

  const rows = typeFilter
    ? await db.prepare('SELECT * FROM feedback WHERE type = ? ORDER BY id DESC LIMIT 200').bind(typeFilter).all()
    : await db.prepare('SELECT * FROM feedback ORDER BY id DESC LIMIT 200').all();

  return Response.json(
    {
      ok: true,
      total: Number(total),
      week: Number(week),
      shown: rows.results?.length ?? 0,
      typeFilter,
      byType: (byType.results ?? []).map((r) => ({ type: String(r.type), n: Number((r as unknown as { n: number }).n) })),
      byRating: (byRating.results ?? []).map((r) => ({
        rating: String(r.rating),
        n: Number((r as unknown as { n: number }).n),
      })),
      rows: rows.results ?? [],
    },
    { headers: DATA_HEADERS },
  );
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  // F1 (CWE-598): URL-carried keys are refused outright — no legacy compat.
  if (url.searchParams.has('key')) return unauthorized();
  const secret = context.env.ADMIN_KEY;
  if (!secret) return notFound();
  const key = context.request.headers.get('x-admin-key') ?? '';
  if (!keyOk(key, secret)) {
    // Plain browser visit: hand out the key-entry shell (no data in it).
    const accept = context.request.headers.get('accept') ?? '';
    if (context.request.method === 'GET' && !key && accept.includes('text/html')) {
      return new Response(SHELL_HTML, { status: 200, headers: SHELL_HEADERS });
    }
    return unauthorized();
  }
  if (context.request.method !== 'GET') {
    return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  }
  return serveData(context, url);
};
