#!/usr/bin/env python3
"""Shared components for CleanPaths design handoff pages.
All visible copy is passed in from copy_data.py (verbatim from 05-copy-freeze-v1.md)
or from 03-compliance-v1 legal docs. This file contains structure only.
"""

LOGO_SVG = """<svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
<rect x="1" y="1" width="28" height="28" rx="6" fill="#1E2430"/>
<path d="M7 21 C7 12, 13 9, 17 9 S 24 12, 23 17" stroke="#E4572E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<circle cx="7" cy="21" r="2.6" fill="#FAF6EE"/>
<circle cx="17" cy="9" r="2.6" fill="#FAF6EE"/>
<circle cx="23" cy="17" r="2.6" fill="#E4572E"/>
</svg>"""

UPLOAD_ICON = """<svg class="dz-icon" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
<rect x="5" y="9" width="36" height="30" rx="5" fill="#FAF6EE" stroke="#1E2430" stroke-width="2"/>
<path d="M23 31 V17 M17 23 l6-6 6 6" stroke="#E4572E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="35" cy="16" r="2.4" fill="#1F6E5C"/>
</svg>"""

def logo():
    return f'<a class="logo" href="../home/code.html">{LOGO_SVG}<span class="word">Clean<em>Paths</em></span></a>'

# Route -> href helper (pages live in pages/<slug>/code.html)
def href(route, current_slug=""):
    m = {
        "/": "../home/code.html",
        "/png-to-dxf": "../png-to-dxf/code.html",
        "/jpg-to-dxf": "../jpg-to-dxf/code.html",
        "/svg-to-dxf-converter": "../svg-to-dxf-converter/code.html",
        "/jfif-to-jpg": "../jfif-to-jpg/code.html",
        "/pt/jfif-para-jpg": "../pt-jfif-para-jpg/code.html",
        "/screenshot-to-svg": "../screenshot-to-svg/code.html",
        "/samples": "../samples/code.html",
        "/for/cricut-sellers": "../for-cricut-sellers/code.html",
        "/for/embroidery": "../for-embroidery/code.html",
        "/pricing": "../pricing/code.html",
        "/privacy": "../privacy/code.html",
        "/terms": "../terms/code.html",
        "/cookies": "../cookies/code.html",
        "/refund": "../refund/code.html",
    }
    return m[route]

TOOLS_MENU = [
    ("/png-to-dxf", "PNG to DXF", "PNG→DXF"),
    ("/jpg-to-dxf", "JPG to DXF", "JPG→DXF"),
    ("/svg-to-dxf-converter", "SVG to DXF", "SVG→DXF"),
    ("/screenshot-to-svg", "Screenshot to SVG", "SHOT→SVG"),
    ("/jfif-to-jpg", "JFIF to JPG", "JFIF→JPG"),
]

def header(active_route="/", lang="en"):
    links = "".join(
        f'<a class="navlink navlink--desktop{" active" if active_route == r else ""}" href="{href(r)}">{n}</a>'
        for r, n, _ in TOOLS_MENU[:3]
    )
    more = "".join(
        f'<a href="{href(r)}">{n}<span class="fmt">{f}</span></a>' for r, n, f in TOOLS_MENU[3:]
    )
    people = (
        f'<a class="navlink navlink--desktop{" active" if active_route == "/for/cricut-sellers" else ""}" href="{href("/for/cricut-sellers")}">For Cricut sellers</a>'
        f'<a class="navlink navlink--desktop{" active" if active_route == "/for/embroidery" else ""}" href="{href("/for/embroidery")}">For embroidery</a>'
    )
    samples = f'<a class="navlink navlink--desktop{" active" if active_route == "/samples" else ""}" href="{href("/samples")}">Samples</a>'
    pricing = f'<a class="navlink navlink--desktop{" active" if active_route == "/pricing" else ""}" href="{href("/pricing")}">Pricing</a>'
    if lang == "pt":
        # PT page is a neutral tool page: minimal nav, language switch visible
        return f"""<header class="site-header"><div class="wrap bar">
  {logo()}
  <nav class="main-nav" aria-label="Main">
    <a class="navlink" href="{href('/jfif-to-jpg')}">English version →</a>
  </nav>
  <details class="nav-mobile"><summary aria-label="Menu">☰</summary><div class="menu">
    <a href="{href('/jfif-to-jpg')}">English version →</a>
    <a href="{href('/privacy')}">Política de Privacidade</a>
  </div></details>
</div></header>"""
    mobile = "".join(
        f'<a href="{href(r)}">{n}</a>' for r, n, _ in TOOLS_MENU
    ) + f'<a href="{href("/samples")}">Samples</a><a href="{href("/for/cricut-sellers")}">For Cricut sellers</a><a href="{href("/for/embroidery")}">For embroidery</a><a href="{href("/pricing")}">Pricing</a>'
    return f"""<header class="site-header"><div class="wrap bar">
  {logo()}
  <nav class="main-nav" aria-label="Main">
    {links}
    <details class="nav-more"><summary>More tools</summary><div class="menu">{more}</div></details>
    {samples}{people}{pricing}
    <a class="btn btn--primary btn--sm nav-cta nav-cta-header" href="#convert">Convert now — free</a>
  </nav>
  <details class="nav-mobile"><summary aria-label="Menu">☰</summary><div class="menu">{mobile}</div></details>
</div></header>"""

def badges_row(extra=""):
    items = ['🔒 Files stay on your device', 'No account', 'No watermark']
    if extra:
        items.append(extra)
    return '<div class="badges">' + "".join(f'<span class="badge">{b}</span>' for b in items) + "</div>"

def dropzone(accept=".png, .jpg, .svg", dz_text="Drop a PNG, JPG or SVG here — or browse",
             btn="Convert now — free", micro='Flat-color graphics → <b>cut-ready</b> · Photos → <b>stylized result</b>',
             badges_extra="10 free conversions a day", version_seg=False, cleanup_switch=False,
             shot_preset=False, anchor_id="convert", seg_note=""):
    seg = ""
    if version_seg:
        seg = f"""<div style="margin-top:16px">
  <div class="seg" role="group" aria-label="DXF version">
    <button aria-pressed="true">R2000 · units included</button>
    <button aria-pressed="false">R12 · compatibility mode</button>
  </div>
  <div class="seg-note">{seg_note}</div>
</div>"""
    sw = ""
    if cleanup_switch:
        sw = """<div style="margin-top:16px"><label class="switch"><span class="track"></span>Clean up bad images (recommended)</label></div>"""
    if shot_preset:
        sw = """<div style="margin-top:16px"><label class="switch"><span class="track"></span>Optimized for screenshots</label></div>"""
    mc = f'<div><span class="microcopy">{micro}</span></div>' if micro else ""
    return f"""<div class="dropzone matgrid" id="{anchor_id}">
  {UPLOAD_ICON}
  <div class="dz-text">{dz_text}</div>
  <div class="dz-or">— or —</div>
  <button class="btn btn--primary btn--lg" type="button">{btn}</button>
  <div class="dz-formats">ACCEPTS: {accept.upper()} · PROCESSED LOCALLY</div>
  {seg}{sw}
  {mc}
</div>
<div style="margin-top:14px">{badges_row(badges_extra)}</div>"""

def feedback_block(context="result", compact=False, lang="en"):
    """Amend A001 feedback form. context: 'result' | 'footer'.
    lang='pt': submit button uses §12.1 A9 PT frozen `Enviar feedback`
    (§0.7 EN strings otherwise verbatim — PT emoji/placeholder not frozen, stay EN)."""
    pad = "" if not compact else ' style="padding:16px"'
    submit = "Enviar feedback" if lang == "pt" else "Send feedback"
    return f"""<div class="feedback"{pad} data-context="{context}">
  <h3>How did this one turn out?</h3>
  <div class="emojis" role="group" aria-label="Rate this result">
    <button class="emoji" type="button">😄 <span>Cut-ready — it worked</span></button>
    <button class="emoji" type="button">😐 <span>Close, but not quite</span></button>
    <button class="emoji" type="button">😞 <span>Not usable</span></button>
  </div>
  <textarea placeholder="What went wrong (or right)? Optional — please don't include personal info you don't want to share. Leave your email only if you'd like a reply." aria-label="Optional feedback"></textarea>
  <button class="btn btn--sm" type="button">{submit}</button>
</div>"""

def feedback_ok(lang="en"):
    msg = ("Obrigado — vai direto para a pessoa que está construindo o CleanPaths." if lang == "pt"
           else "Thanks — this goes straight to the person building CleanPaths.")
    return f'<div class="feedback"><span class="ok">{msg}</span></div>'

def faq(items, h2=None, klass="faq"):
    """items: list of (question, answer_html)."""
    head = f"<h2>{h2}</h2>" if h2 else ""
    rows = "".join(
        f"<details><summary>{q}</summary><div class='a'>{a}</div></details>" for q, a in items
    )
    return f"{head}<div class='{klass}'>{rows}</div>"

def footer(lang="en"):
    if lang == "pt":
        return f"""<footer class="site-footer"><div class="wrap">
  <div class="footer-trust" style="border-top:0">
    <span>🔒 Seus arquivos nunca saem do seu dispositivo · Sem cadastro</span>
    <span class="links">
      <a href="{href('/privacy')}">Política de Privacidade</a><span>·</span>
      <a href="{href('/jfif-to-jpg')}">English version</a><span>·</span>
      <a href="mailto:support@cleanpaths.io">Suporte: support@cleanpaths.io</a>
    </span>
  </div>
</div></footer>"""
    tools = "".join(f'<li><a href="{href(r)}">{n}</a></li>' for r, n, _ in TOOLS_MENU)
    return f"""<footer class="site-footer"><div class="wrap">
  <div class="footer-feedback" id="footer-feedback">
    <div class="grid-2" style="align-items:start">
      <div>
        <span class="spec">Feedback — no account needed</span>
        <p style="margin:10px 0 14px;color:var(--ink-2);font-size:15px;max-width:38em">Something off with a conversion? Tell the person building CleanPaths — it goes straight to the workshop bench, not a ticket queue.</p>
        <p style="margin:0 0 4px"><a class="btn btn--sm" href="#feedback-modal">Open the feedback dialog →</a></p>
      </div>
      {feedback_block(context="footer", compact=True)}
    </div>
  </div>
  <div class="footer-grid">
    <div>
      {logo()}
      <p style="margin-top:12px;color:var(--ink-2);font-size:14px;max-width:26em">Cut-ready DXF &amp; SVG from the images clients actually send — processed entirely in your browser.</p>
      <p style="margin-top:10px"><a href="{href('/samples')}">See before / after samples →</a></p>
    </div>
    <div>
      <h4>Converters</h4>
      <ul>{tools}<li><a href="{href('/samples')}">Samples gallery</a></li></ul>
    </div>
    <div>
      <h4>For makers</h4>
      <ul>
        <li><a href="{href('/for/cricut-sellers')}">For Cricut sellers</a></li>
        <li><a href="{href('/for/embroidery')}">For embroidery</a></li>
        <li><a href="{href('/pricing')}">Pricing</a></li>
      </ul>
    </div>
    <div>
      <h4>Legal</h4>
      <ul>
        <li><a href="{href('/privacy')}">Privacy Policy</a></li>
        <li><a href="{href('/terms')}">Terms of Service</a></li>
        <li><a href="{href('/refund')}">Refund Policy</a></li>
        <li><a href="{href('/cookies')}">Cookie Policy</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-trust">
    <span>Files never leave your device · No account</span>
    <span class="links">
      <a href="{href('/privacy')}">Privacy</a><span>·</span><a href="{href('/terms')}">Terms</a><span>·</span><a href="{href('/refund')}">Refund</a><span>·</span><a href="{href('/cookies')}">Cookies</a><span>·</span><a href="{href('/pricing')}">Pricing</a><span>·</span><a href="{href('/samples')}">Samples</a><span>·</span><a href="#feedback-modal">Feedback</a><span>·</span><a href="mailto:support@cleanpaths.io">Support: support@cleanpaths.io</a>
    </span>
    {social_slots()}
  </div>
</div></footer>"""

# ---------------------------------------------------------------------------
# 06c additions — strings in FB_COPY / SHARE_COPY / SHOWCASE_COPY are
# FROZEN by 05 §12 (v1.3). Swap only via zhongshu-approved revision, then run audit.py.
# ---------------------------------------------------------------------------

FB_COPY = {
    "en": {
        "fab": "Feedback",
        "fab_aria": "Open feedback",
        "title": "Feedback",
        "sub": "Bugs, ideas, praise, anything — it lands on my workbench, not in a ticket queue.",
        "types": ["Idea", "Bug", "Praise", "Other"],
        "placeholder": "What worked, what didn't…",
        "contact": "Email or handle (optional — only if you'd like a reply)",
        "trust": "No contact info needed — please don't include personal info you don't want to share. We auto-attach this page and your language, never your files. <b>We never see your files.</b>",  # §12.1 A8 frozen
        "submit": "Send feedback",          # frozen 05 §0.7
        "success": "Thanks — this goes straight to the person building CleanPaths.",  # frozen 05 §0.7
        "close_aria": "Close feedback dialog",
        "error": "That didn't send — try again, or email feedback@cleanpaths.io directly.",
        "retry": "Try again",
    },
    "pt": {
        "fab": "Feedback",
        "fab_aria": "Abrir feedback",
        "title": "Feedback",
        "sub": "Bugs, ideias, elogios — cai direto na minha bancada, não numa fila de tickets.",
        "types": ["Ideia", "Bug", "Elogio", "Outro"],
        "placeholder": "O que funcionou, o que não funcionou…",
        "contact": "E-mail ou usuário (opcional — só se quiser resposta)",
        "trust": "Não é preciso deixar contato — não inclua dados pessoais que você não quer compartilhar. Anexamos esta página e seu idioma automaticamente, nunca seus arquivos. <b>Nós nunca vemos seus arquivos.</b>",  # §12.1 A8 PT frozen
        "submit": "Enviar feedback",          # §12.1 A9 PT frozen
        "success": "Obrigado — vai direto para a pessoa que está construindo o CleanPaths.",  # §12.1 A10 PT frozen
        "close_aria": "Fechar feedback",
        "error": "Não foi possível enviar — tente de novo, ou escreva para feedback@cleanpaths.io.",
        "retry": "Tentar de novo",
    },
}

SHARE_COPY = {
    "en": {
        "title": "Share your result",
        "copy": "Copy link",
        "copied": "Link copied",
        "x": "Post to X",
        "dl_img": "Download share image",
        "x_prefill": "Just turned a messy image into clean vector layers — in my browser, no upload. cleanpaths.io",  # §12.4 B5 frozen
        "optin": "Feature my result on the examples wall",
        "optin_micro": "Off by default. If you check it, we confirm by email before anything goes up — leave a contact in the feedback form.",
    },
    "pt": {
        "title": "Compartilhe seu resultado",
        "copy": "Copiar link",
        "copied": "Link copiado",
        "x": "Postar no X",
        "dl_img": "Baixar imagem para compartilhar",
        "x_prefill": "Converti minha imagem em camadas vetoriais limpas — direto no navegador, sem upload. cleanpaths.io",  # §12.4 B5 PT frozen
        "optin": "Mostrar meu resultado no mural de exemplos",
        "optin_micro": "Desativado por padrão. Se marcar, confirmamos por e-mail antes de publicar — deixe um contato no formulário de feedback.",  # §12.4 B8 PT frozen
    },
}

SHOWCASE_COPY = {
    "featured_label": "Featured examples",
    "featured_more": "See all before / after →",
    "community_title": "Community",
    "community_note": "Real maker results land here — featured only with explicit opt-in. Nothing yet: the wall opens when the first makers say yes.",
    "sample_titles": ["Hexagon badge logo", "Coffee mark logo", "Mountain mark logo",
                      "Dashboard UI", "Mobile app screen", "Settings panel",
                      "Flower line art", "Rocket stencil", "Geometric deer"],
}

def feedback_fab(lang="en"):
    c = FB_COPY[lang]
    return (f'<a class="fab-feedback" href="#feedback-modal" aria-label="{c["fab_aria"]}">'
            f'<span class="dot"></span><span class="fab-label">{c["fab"].upper()}</span></a>')

def feedback_modal(lang="en", page_ctx="/"):
    """Modal default state embedded in every page (CSS :target open). 4 visual states
    are documented on the states boards. page_ctx = auto-attached context hint (07 fills real route)."""
    c = FB_COPY[lang]
    types = "".join(f'<button type="button" aria-pressed="false">{t}</button>' for t in c["types"])
    return f"""<div class="fb-modal" id="feedback-modal" role="dialog" aria-modal="true" aria-label="{c['title']}">
  <div class="fb-modal__card" data-page-context="{page_ctx}">
    <a class="fb-modal__close" href="#" aria-label="{c['close_aria']}">✕</a>
    <h3>{c['title']}</h3>
    <p class="sub">{c['sub']}</p>
    <div class="fb-types" role="group" aria-label="Feedback type">{types}</div>
    <textarea placeholder="{c['placeholder']}" aria-label="Feedback"></textarea>
    <input type="text" placeholder="{c['contact']}" aria-label="Contact (optional)">
    <div class="fb-trust">{c['trust']}</div>
    <div class="actions"><button class="btn btn--primary" type="button">{c['submit']}</button></div>
  </div>
</div>"""

def social_slots():
    """Footer social icon SLOTS ONLY — real account URLs are open-items, no invented handles."""
    x = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20z"/></svg>'
    yt = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.8.3c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.8-.4c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.9 15.1V8.4l6.2 3.4-6.2 3.3z"/></svg>'
    pin = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.4.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2-1.3 2.7.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>'
    return (f'<span class="social-slots" aria-label="Social links">'
            f'<a href="#" data-pending="account-url" aria-label="X">{x}</a>'
            f'<a href="#" data-pending="account-url" aria-label="YouTube">{yt}</a>'
            f'<a href="#" data-pending="account-url" aria-label="Pinterest">{pin}</a></span>')

def share_block(lang="en"):
    """Result-state share CTA + opt-in checkbox (06c-B2/C3). Visible ONLY in result state;
    hidden by default (07 renders only when a result exists)."""
    c = SHARE_COPY[lang]
    prefill = c["x_prefill"].replace(" ", "%20")
    return f"""<div class="share-block" data-visible-when="result">
  <div class="spec">{c['title']}</div>
  <div class="share-row">
    <button class="btn btn--sm" type="button">{c['copy']}</button>
    <a class="btn btn--sm" href="https://x.com/intent/post?text={prefill}" target="_blank" rel="noopener">{c['x']}</a>
    <button class="btn btn--sm" type="button">{c['dl_img']}</button>
  </div>
  <label class="share-optin">
    <input type="checkbox">
    <span>{c['optin']}<br><span class="micro">{c['optin_micro']}</span></span>
  </label>
</div>"""

def page(title, meta_desc, body_html, active_route="/", lang="en", extra_head=""):
    lang_attr = "pt-BR" if lang == "pt" else "en"
    return f"""<!doctype html>
<html lang="{lang_attr}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<link rel="stylesheet" href="../../assets/design-system.css">
<link rel="icon" href="../../assets/logo.svg" type="image/svg+xml">
{extra_head}
</head>
<body>
{header(active_route, lang)}
<main>
{body_html}
</main>
{footer(lang)}
{feedback_fab(lang)}
{feedback_modal(lang, active_route)}
</body>
</html>"""

def states_page(title, page_name, states_html):
    """State board wrapper for a tool page."""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>States — {page_name} | CleanPaths design handoff</title>
<link rel="stylesheet" href="../../assets/design-system.css">
</head>
<body>
<main class="wrap" style="padding:48px 24px">
  <span class="spec">State board · {page_name}</span>
  <h1 style="margin:12px 0 8px">{title}</h1>
  <p style="color:var(--ink-2);max-width:60em;margin-bottom:40px">Tool interaction states for <b>{page_name}</b>. Same dropzone component, state modifiers only. Default (empty) state is the live page; this board shows the rest.</p>
  <div class="state-grid">
  {states_html}
  </div>
</main>
</body>
</html>"""

def state_block(label, inner_html):
    return f'<section class="state-block"><span class="spec">{label}</span><div style="margin-top:10px">{inner_html}</div></section>'
