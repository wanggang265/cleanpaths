#!/usr/bin/env python3
"""v1.7 -> v1.8 batch2: generate 8 EN + 8 PT frozen-copy tool pages + states.

Copy source: batch2_copy.json (parsed programmatically from
05-copy-freeze-v1.15-batch2-addendum.md — zero manual transcription).
Chrome (header/footer/tail) extracted verbatim from existing package pages
(png-to-dxf / pt-webp-para-svg), same method as laser_batch_build.py.
"""
import os, re, sys, json, html as H

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PAGES = os.path.join(ROOT, "pages")
sys.path.insert(0, os.path.dirname(__file__))
from states_common import generic_states, LOGO_LAYERS, DXF_DL_BTNS, STEPS_TRACE

DATA = json.load(open(os.path.join(os.path.dirname(__file__), "batch2_copy.json"), encoding="utf-8"))
COPY = {k: (v[0] if len(v) == 1 else v) for k, v in DATA["copy"].items()}
LISTS = DATA["copy"]

EXPECT = {
    "WEBP2PNG_": 31, "PT_WEBP2PNG_": 25,
    "WEBP2JPG_": 31, "PT_WEBP2JPG_": 25,
    "SVG2PNG_": 31, "PT_SVG2PNG_": 25,
    "JPEG2JPG_": 32, "PT_JPEG2JPG_": 25,
    "SVG2JPG_": 31, "PT_SVG2JPG_": 25,
    "GIF2JPG_": 32, "PT_GIF2JPG_": 25,
    "BMP2JPG_": 31, "PT_BMP2JPG_": 25,
    "JPEG2DXF_": 50, "PT_JPEG2DXF_": 26,
}
for pref, n in EXPECT.items():
    got = sum(1 for k in LISTS if k.startswith(pref))
    if got != n:
        sys.exit(f"COPY parse mismatch for {pref}: expected {n}, got {got}")

def C(key):
    v = COPY[key]
    if isinstance(v, list):
        sys.exit(f"{key} is a list; use L()")
    return v

def L(key):
    v = COPY[key]
    return v if isinstance(v, list) else [v]

def esc(s):
    return H.escape(s, quote=False)

# ---- linkify internal cross-references inside frozen prose (text stays verbatim) ----
EN_LINKS = [
    ("WebP to PNG converter", "../webp-to-png/code.html"),
    ("WebP to JPG converter", "../webp-to-jpg/code.html"),
    ("SVG to PNG converter", "../svg-to-png/code.html"),
    ("SVG to JPG converter", "../svg-to-jpg/code.html"),
    ("JPEG to JPG converter", "../jpeg-to-jpg/code.html"),
    ("JFIF to JPG converter", "../jfif-to-jpg/code.html"),
    ("JFIF to PNG converter", "../jfif-to-png/code.html"),
    ("JPG to DXF converter", "../jpg-to-dxf/code.html"),
    ("PNG to DXF converter", "../png-to-dxf/code.html"),
    ("Image to DXF converter", "../image-to-dxf/code.html"),
    ("SVG to DXF converter", "../svg-to-dxf-converter/code.html"),
    ("Privacy Policy", "../privacy/code.html"),
    ("pricing page", "../pricing/code.html"),
    ("CleanPaths home page", "../home/code.html"),
]
PT_LINKS = [
    ("conversor de WebP para PNG", "../pt-webp-para-png/code.html"),
    ("conversor de WebP para JPG", "../pt-webp-para-jpg/code.html"),
    ("conversor de SVG para PNG", "../pt-svg-para-png/code.html"),
    ("conversor de SVG para JPG", "../pt-svg-para-jpg/code.html"),
    ("conversor de JPEG para JPG", "../pt-jpeg-para-jpg/code.html"),
    ("conversor de JPEG para DXF", "../pt-jpeg-para-dxf/code.html"),
    ("JPEG para DXF", "../pt-jpeg-para-dxf/code.html"),
    ("Política de Privacidade", "../privacy/code.html"),
]

def linkify(text, lang):
    pairs = EN_LINKS if lang == "en" else PT_LINKS
    pairs = sorted(pairs, key=lambda p: -len(p[0]))
    pat = re.compile("|".join(re.escape(p) for p, _ in pairs))
    url = dict(pairs)
    return pat.sub(lambda m: f'<a href="{url[m.group(0)]}">{m.group(0)}</a>', text)

def T(key, lang="en"):
    return linkify(esc(C(key)), lang)

# ---------- verbatim chrome extraction ----------
png = open(os.path.join(PAGES, "png-to-dxf", "code.html"), encoding="utf-8").read()
ptw = open(os.path.join(PAGES, "pt-webp-para-svg", "code.html"), encoding="utf-8").read()

EN_HEADER = png[png.index('<header class="site-header">'):png.index("</header>") + len("</header>")]
EN_HEADER = EN_HEADER.replace(" navlink--desktop active", " navlink--desktop")
EN_FOOTER = png[png.index('<footer class="site-footer">'):png.index("</footer>") + len("</footer>")]
EN_TAIL = png[png.index('<a class="fab-feedback"'):png.index("</body>")]

# footer Converters group: register the 8 new tools (new pages only; existing pages untouched)
OLD_LI = '<li><a href="../samples/code.html">Samples gallery</a></li>'
assert EN_FOOTER.count(OLD_LI) == 1
BATCH2_LIS = (
    '<li><a href="../webp-to-png/code.html">WebP to PNG</a></li>'
    '<li><a href="../webp-to-jpg/code.html">WebP to JPG</a></li>'
    '<li><a href="../svg-to-png/code.html">SVG to PNG</a></li>'
    '<li><a href="../jpeg-to-jpg/code.html">JPEG to JPG</a></li>'
    '<li><a href="../svg-to-jpg/code.html">SVG to JPG</a></li>'
    '<li><a href="../gif-to-jpg/code.html">GIF to JPG</a></li>'
    '<li><a href="../bmp-to-jpg/code.html">BMP to JPG</a></li>'
    '<li><a href="../jpeg-to-dxf/code.html">JPEG to DXF</a></li>'
)
EN_FOOTER = EN_FOOTER.replace(OLD_LI, BATCH2_LIS + OLD_LI)

PT_HEADER = ptw[ptw.index('<header class="site-header">'):ptw.index("</header>") + len("</header>")]
PT_FOOTER = ptw[ptw.index('<footer class="site-footer">'):ptw.index("</footer>") + len("</footer>")]
PT_TAIL = ptw[ptw.index('<a class="fab-feedback"'):ptw.index("</body>")]

def pt_chrome(en_slug):
    h = PT_HEADER.replace("../webp-to-svg/code.html", f"../{en_slug}/code.html")
    f = PT_FOOTER.replace("../webp-to-svg/code.html", f"../{en_slug}/code.html")
    return h, f

DZ_ICON = """<svg class="dz-icon" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
<rect x="5" y="9" width="36" height="30" rx="5" fill="#FAF6EE" stroke="#1E2430" stroke-width="2"/>
<path d="M23 31 V17 M17 23 l6-6 6 6" stroke="#E4572E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="35" cy="16" r="2.4" fill="#1F6E5C"/>
</svg>"""

def badges_html(key):
    parts = [p.strip() for p in C(key).split("·")]
    return '<div class="badges">' + " · ".join(f'<span class="badge">{esc(p)}</span>' for p in parts) + "</div>"

def head(slug, title_key, desc_key, lang):
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- {title_key} --><title>{esc(C(title_key))}</title>
<!-- {desc_key} --><meta name="description" content="{esc(C(desc_key))}">
<link rel="stylesheet" href="../../assets/design-system.css">
<link rel="icon" href="../../assets/logo.svg" type="image/svg+xml">
</head>
<body>
"""

def en_page(slug, title_key, desc_key, body):
    tail = EN_TAIL.replace('data-page-context="/png-to-dxf"', f'data-page-context="/{slug}"')
    return head(slug, title_key, desc_key, "en") + EN_HEADER + "\n<main>\n" + body + "\n</main>\n" + EN_FOOTER + "\n" + tail + "</body>\n</html>"

def pt_page(slug, en_slug, title_key, desc_key, body):
    h, f = pt_chrome(en_slug)
    tail = PT_TAIL.replace('data-page-context="/pt/webp-para-svg"', f'data-page-context="/{slug}"')
    return head(slug, title_key, desc_key, "pt-BR") + h + "\n<main>\n" + body + "\n</main>\n" + f + "\n" + tail + "</body>\n</html>"

def faq_item(q_html, a_html):
    return f"<details><summary>{q_html}</summary><div class='a'>{a_html}</div></details>"

PRIVACY_A_EN = ("No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store your images or the files you generate. Close the tab and they're gone; we never had them. This is how the tool is built, not a marketing claim. Details in our Privacy Policy.")
PRIVACY_A_PT = ("Não. A conversão acontece inteiramente no seu navegador — não existe etapa de upload. Nós não recebemos, não vemos e não armazenamos suas imagens. É assim que a ferramenta é construída, não é só uma frase de marketing. Detalhes na Política de Privacidade.")

def en_faqs(prefix, count=5):
    out = []
    for i in range(1, count + 1):
        qk, ak = f"{prefix}_FAQ{i}_Q", f"{prefix}_FAQ{i}_A"
        ck = f"{prefix}_FAQ{i}_Q/A"
        if qk in COPY:
            q, a = C(qk), C(ak)
        else:
            pair = L(ck)
            q = pair[0]
            a = pair[1] if len(pair) > 1 else PRIVACY_A_EN
        out.append(faq_item(T(qk) if qk in COPY else linkify(esc(q), "en"),
                            T(ak) if ak in COPY else linkify(esc(a), "en")))
    return '<div class="faq">' + "".join(out) + "</div>"

def pt_faqs(prefix, count=5):
    out = []
    for i in range(1, count + 1):
        pair = L(f"{prefix}_FAQ{i}_Q/A")
        q = pair[0]
        a = pair[1] if len(pair) > 1 else PRIVACY_A_PT
        out.append(faq_item(linkify(esc(q), "pt"), linkify(esc(a), "pt")))
    return '<div class="faq">' + "".join(out) + "</div>"

def en_links_block(prefix):
    raw = L(f"{prefix}_LINKS")
    cards = []
    for i in range(0, len(raw), 2):
        text, url = raw[i], raw[i + 1]
        href = "../home/code.html" if url == "/" else ".." + url.rstrip("/") + "/code.html"
        cards.append(f'<div class="card"><a href="{href}">{esc(text)}</a></div>')
    return ('<section class="section"><div class="wrap"><span class="spec">More converters</span>'
            f'<div class="grid-3" style="margin-top:16px">{"".join(cards)}</div></div></section>')

def en_hero_single(prefix):
    return f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:860px">
    <div class="hero__eyebrow"><!-- {prefix}_EYEBROW --><span class="spec">{esc(C(prefix + '_EYEBROW'))}</span></div>
    <!-- {prefix}_H1 --><h1>{esc(C(prefix + '_H1'))}</h1>
    <!-- {prefix}_HERO_SUB --><p class="hero__sub">{esc(C(prefix + '_HERO_SUB'))}</p>
    <div class="dropzone matgrid" id="convert" style="margin-top:26px">
      {DZ_ICON}
      <!-- {prefix}_DZ_TEXT --><div class="dz-text">{esc(C(prefix + '_DZ_TEXT'))}</div>
      <div class="dz-or">— or —</div>
      <!-- {prefix}_DZ_BTN --><button class="btn btn--primary btn--lg" type="button">{esc(C(prefix + '_DZ_BTN'))}</button>
      <!-- {prefix}_DZ_FORMATS --><div class="dz-formats">{esc(C(prefix + '_DZ_FORMATS'))}</div>
    </div>
    <div style="margin-top:14px"><!-- {prefix}_BADGES -->{badges_html(prefix + '_BADGES')}</div>
  </div>
</section>"""

def pt_hero_single(prefix):
    dz = L(prefix + "_DZ")
    return f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:860px">
    <div class="hero__eyebrow"><!-- {prefix}_EYEBROW --><span class="spec">{esc(C(prefix + '_EYEBROW'))}</span></div>
    <!-- {prefix}_H1 --><h1>{esc(C(prefix + '_H1'))}</h1>
    <!-- {prefix}_HERO_SUB --><p class="hero__sub">{esc(C(prefix + '_HERO_SUB'))}</p>
    <div class="dropzone matgrid" id="convert" style="margin-top:26px">
      {DZ_ICON}
      <!-- {prefix}_DZ --><div class="dz-text">{esc(dz[0])}</div>
      <div class="dz-or">— ou —</div>
      <button class="btn btn--primary btn--lg" type="button">{esc(dz[1])}</button>
      <div class="dz-formats">{esc(dz[2])}</div>
    </div>
    <div style="margin-top:14px"><!-- {prefix}_BADGES -->{badges_html(prefix + '_BADGES')}</div>
  </div>
</section>"""

def section(key_h2, key_p, alt=False, lang="en"):
    cls = "section section--alt" if alt else "section"
    return (f'<section class="{cls}"><div class="wrap">'
            f'<!-- {key_h2} --><h2>{esc(C(key_h2))}</h2>'
            f'<!-- {key_p} --><p style="margin-top:12px;max-width:62em;color:var(--ink-2)">{T(key_p, lang)}</p>'
            f'</div></section>')

def steps_block(prefix, lang="en"):
    steps = L(prefix + "_STEPS")
    items = "".join(f"<li><h3>{esc(s)}</h3></li>" for s in steps[:3])
    aux = ""
    if lang == "en" and prefix + "_STEPS_AUX" in COPY:
        aux = f'<!-- {prefix}_STEPS_AUX --><p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">{esc(C(prefix + "_STEPS_AUX"))}</p>'
    elif lang == "pt" and len(steps) > 3:
        aux = f'<p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">{esc(steps[3])}</p>'
    return (f'<section class="section section--alt"><div class="wrap"><span class="spec">Workflow</span>'
            f'<!-- {prefix}_STEPS_H2 --><h2 style="margin-top:12px">{esc(C(prefix + "_STEPS_H2"))}</h2>'
            f'<ol class="steps" style="margin-top:20px">{items}</ol>{aux}</div></section>')

def verify_strip(key, alt=False):
    cls = "section" if not alt else "section section--alt"
    return (f'<section class="{cls}"><div class="wrap">'
            f'<!-- {key} --><div class="info-strip"><span class="i">i</span>'
            f'<span style="font-family:var(--font-mono);font-size:13.5px">{T(key)}</span></div>'
            f'</div></section>')

def faq_section(faq_html, final_btn_key=None, lang="en"):
    return f'<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq_html}</div></div></section>'

def final_band(btn_key, h2_key=None):
    h2 = f"<!-- {h2_key} --><h2>{esc(C(h2_key))}</h2>" if h2_key else ""
    return (f'<section class="section section--alt cta-band"><div class="wrap">{h2}'
            f'<!-- {btn_key} --><a class="btn btn--primary btn--lg" href="#convert">{esc(C(btn_key))}</a>'
            f'</div></section>')

# ---------------- page definitions ----------------
SIMPLE = [
    # (en_slug, pt_slug, en_prefix, pt_prefix, module key pairs)
    ("webp-to-png", "pt-webp-para-png", "WEBP2PNG", "PT_WEBP2PNG",
     [("ALPHA_H2", "ALPHA_P"), ("BATCH_H2", "BATCH_P"), ("COMPAT_H2", "COMPAT_P")]),
    ("webp-to-jpg", "pt-webp-para-jpg", "WEBP2JPG", "PT_WEBP2JPG",
     [("ALPHA_H2", "ALPHA_P"), ("CHOICE_H2", "CHOICE_P"), ("SIZE_H2", "SIZE_P")]),
    ("svg-to-png", "pt-svg-para-png", "SVG2PNG", "PT_SVG2PNG",
     [("ALPHA_H2", "ALPHA_P"), ("DIR_H2", "DIR_P"), ("RES_H2", "RES_P")]),
    ("jpeg-to-jpg", "pt-jpeg-para-jpg", "JPEG2JPG", "PT_JPEG2JPG",
     [("LEGACY_H2", "LEGACY_P"), ("LOSSLESS_H2", "LOSSLESS_P"), ("WHEN_H2", "WHEN_P")]),
    ("svg-to-jpg", "pt-svg-para-jpg", "SVG2JPG", "PT_SVG2JPG",
     [("ALPHA_H2", "ALPHA_P"), ("CHOICE_H2", "CHOICE_P"), ("PRINT_H2", "PRINT_P")]),
    ("gif-to-jpg", "pt-gif-para-jpg", "GIF2JPG", "PT_GIF2JPG",
     [("FIRSTFRAME_H2", "FIRSTFRAME_P"), ("DONT_H2", "DONT_P"), ("SCENES_H2", "SCENES_P")]),
    ("bmp-to-jpg", "pt-bmp-para-jpg", "BMP2JPG", "PT_BMP2JPG",
     [("SIZE_H2", "SIZE_P"), ("SOURCE_H2", "SOURCE_P"), ("WIN_H2", "WIN_P")]),
]

SAMPLES = {
    "webp-to-png": ("logo-acme_before.png", "logo-acme_after.png", ".webp", "PNG"),
    "webp-to-jpg": ("logo-bean_before.png", "logo-bean_after.png", ".webp", "JPG"),
    "svg-to-png": ("ui-settings_before.png", "ui-settings_after.png", ".svg", "PNG"),
    "jpeg-to-jpg": ("logo-peak_before.png", "logo-peak_after.png", ".jpeg", "JPG"),
    "svg-to-jpg": ("ui-mobile_before.png", "ui-mobile_after.png", ".svg", "JPG"),
    "gif-to-jpg": ("line-rocket_before.png", "line-rocket_after.png", ".gif", "JPG"),
    "bmp-to-jpg": ("line-flower_before.png", "line-flower_after.png", ".bmp", "JPG"),
    "jpeg-to-dxf": ("line-deer_before.png", "line-deer_after.png", ".jpeg", "DXF"),
}

def write(slug, name, html):
    d = os.path.join(PAGES, slug)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name), "w", encoding="utf-8") as f:
        f.write(html)

built = []

# ===== 7 simple EN pages + 7 simple PT pages =====
for en_slug, pt_slug, EN, PT, mods in SIMPLE:
    body = en_hero_single(EN)
    body += section(f"{EN}_EXPLAINER_H2", f"{EN}_EXPLAINER_P", alt=True)
    cards = "".join(
        f'<div class="card"><!-- {EN}_{hk} --><h3>{esc(C(f"{EN}_{hk}"))}</h3>'
        f'<!-- {EN}_{pk} --><p style="margin-top:8px">{T(f"{EN}_{pk}")}</p></div>'
        for hk, pk in mods)
    body += f'<section class="section"><div class="wrap"><div class="grid-3">{cards}</div></div></section>'
    body += verify_strip(f"{EN}_VERIFY", alt=True)
    body += steps_block(EN, "en")
    body += faq_section(en_faqs(EN))
    body += en_links_block(EN)
    final_h2 = f"{EN}_FINAL_H2" if f"{EN}_FINAL_H2" in COPY else None
    body += final_band(f"{EN}_FINAL_BTN", final_h2)
    write(en_slug, "code.html", en_page(en_slug, f"{EN}_META_TITLE", f"{EN}_META_DESC", body))

    sb, sa, ext, outfmt = SAMPLES[en_slug]
    layers = f'<li><span class="sw" style="background:#E0E4EA"></span>1 image · {ext} → .{outfmt.lower()} · processed locally</li>'
    btns = f'<button class="btn btn--primary" type="button">Download {outfmt}</button>'
    write(en_slug, "states.html", generic_states(
        f"/{en_slug}", ext, sb, sa, layers, btns,
        steps=L(f"{EN}_STEPS")[:3], lang="en", error_ext=ext.upper(),
        show_precision=False, show_ai_hd=False))

    # ---- PT counterpart ----
    pbody = pt_hero_single(PT)
    pbody += section(f"{PT}_EXPLAINER_H2", f"{PT}_EXPLAINER_P", alt=True, lang="pt")
    pcards = "".join(
        f'<div class="card"><!-- {PT}_{hk} --><h3>{esc(C(f"{PT}_{hk}"))}</h3>'
        f'<!-- {PT}_{pk} --><p style="margin-top:8px">{T(f"{PT}_{pk}", "pt")}</p></div>'
        for hk, pk in mods)
    pbody += f'<section class="section"><div class="wrap"><div class="grid-3">{pcards}</div></div></section>'
    pbody += verify_strip(f"{PT}_VERIFY", alt=True)
    pbody += steps_block(PT, "pt")
    pbody += faq_section(pt_faqs(PT), lang="pt")
    pbody += final_band(f"{PT}_FINAL_BTN")
    write(pt_slug, "code.html", pt_page(pt_slug, en_slug, f"{PT}_META_TITLE", f"{PT}_META_DESC", pbody))

    psteps = L(f"{PT}_STEPS")[:3]
    write(pt_slug, "states.html", generic_states(
        f"/{pt_slug}", ext, sb, sa, layers,
        '<button class="btn btn--primary" type="button">Baixar ' + outfmt + "</button>",
        steps=psteps, lang="pt", error_ext=ext.upper(),
        show_precision=False, show_ai_hd=False))
    built += [en_slug, pt_slug]

# ===== JPEG to DXF (grid skeleton, full converter page) =====
EN = "JPEG2DXF"
body = f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><!-- JPEG2DXF_EYEBROW --><span class="spec">{esc(C('JPEG2DXF_EYEBROW'))}</span></div>
      <!-- JPEG2DXF_H1 --><h1>{esc(C('JPEG2DXF_H1'))}</h1>
      <!-- JPEG2DXF_HERO_SUB --><p class="hero__sub">{esc(C('JPEG2DXF_HERO_SUB'))}</p>
    </div>
    <div><div class="dropzone matgrid" id="convert">
      {DZ_ICON}
      <!-- JPEG2DXF_DZ_TEXT --><div class="dz-text">{esc(C('JPEG2DXF_DZ_TEXT'))}</div>
      <div class="dz-or">— or —</div>
      <!-- JPEG2DXF_DZ_BTN --><button class="btn btn--primary btn--lg" type="button">{esc(C('JPEG2DXF_DZ_BTN'))}</button>
      <!-- JPEG2DXF_DZ_FORMATS --><div class="dz-formats">{esc(C('JPEG2DXF_DZ_FORMATS'))}</div>
      <!-- JPEG2DXF_MICROCOPY --><div style="margin-top:12px"><span class="microcopy">{esc(C('JPEG2DXF_MICROCOPY'))}</span></div>
    </div>
    <div style="margin-top:14px"><!-- JPEG2DXF_BADGES -->{badges_html('JPEG2DXF_BADGES')}</div></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof</span>
    <div class="proof" style="margin-top:20px"><!-- JPEG2DXF_PROOF --><p class="proof__quote">{esc(C('JPEG2DXF_PROOF'))}</p></div>
    <!-- JPEG2DXF_VERIFY --><div class="info-strip" style="margin-top:16px"><span class="i">i</span><span style="font-family:var(--font-mono);font-size:13.5px">{T('JPEG2DXF_VERIFY')}</span></div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <!-- JPEG2DXF_PROBLEM_H2 --><h2 style="margin-top:12px">{esc(C('JPEG2DXF_PROBLEM_H2'))}</h2>
    <ul class="plist" style="margin-top:12px">
      <!-- JPEG2DXF_PROBLEM_B1 --><li>{esc(C('JPEG2DXF_PROBLEM_B1'))}</li>
      <!-- JPEG2DXF_PROBLEM_B2 --><li>{esc(C('JPEG2DXF_PROBLEM_B2'))}</li>
      <!-- JPEG2DXF_PROBLEM_B3 --><li>{esc(C('JPEG2DXF_PROBLEM_B3'))}</li>
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The pipeline</span>
    <!-- JPEG2DXF_SOLUTION_H2 --><h2 style="margin-top:12px">{esc(C('JPEG2DXF_SOLUTION_H2'))}</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- JPEG2DXF_SOLUTION_S1 --><li><h3>{esc(C('JPEG2DXF_SOLUTION_S1'))}</h3></li>
      <!-- JPEG2DXF_SOLUTION_S2 --><li><h3>{esc(C('JPEG2DXF_SOLUTION_S2'))}</h3></li>
      <!-- JPEG2DXF_SOLUTION_S3 --><li><h3>{esc(C('JPEG2DXF_SOLUTION_S3'))}</h3></li>
    </ol>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <!-- JPEG2DXF_HONEST_H2 --><h2>{esc(C('JPEG2DXF_HONEST_H2'))}</h2>
    <div class="info-strip" style="margin-top:12px;border-color:var(--caution);background:var(--caution-soft)">
      <span class="i" style="background:var(--caution)">!</span>
      <!-- JPEG2DXF_HONEST_P --><span>{esc(C('JPEG2DXF_HONEST_P'))}</span>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <!-- JPEG2DXF_PHOTO_H2 --><h2>{esc(C('JPEG2DXF_PHOTO_H2'))}</h2>
    <!-- JPEG2DXF_PHOTO_P --><p style="margin-top:12px;max-width:62em;color:var(--ink-2)">{T('JPEG2DXF_PHOTO_P')}</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <!-- JPEG2DXF_SAMEFMT_H2 --><h2>{esc(C('JPEG2DXF_SAMEFMT_H2'))}</h2>
    <!-- JPEG2DXF_SAMEFMT_P --><p style="margin-top:12px;max-width:62em;color:var(--ink-2)">{T('JPEG2DXF_SAMEFMT_P')}</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <!-- JPEG2DXF_SCENES_H2 --><h2>{esc(C('JPEG2DXF_SCENES_H2'))}</h2>
    <div class="grid-3" style="margin-top:20px">
      <div class="card"><!-- JPEG2DXF_SCENES_B1 --><p>{esc(C('JPEG2DXF_SCENES_B1'))}</p></div>
      <div class="card"><!-- JPEG2DXF_SCENES_B2 --><p>{esc(C('JPEG2DXF_SCENES_B2'))}</p></div>
      <div class="card"><!-- JPEG2DXF_SCENES_B3 --><p>{esc(C('JPEG2DXF_SCENES_B3'))}</p></div>
    </div>
    <!-- JPEG2DXF_SCENES_CLOSE --><p style="margin-top:20px;max-width:62em;color:var(--ink-2)">{esc(C('JPEG2DXF_SCENES_CLOSE'))}</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <!-- JPEG2DXF_HOW_H2 --><h2 style="margin-top:12px">{esc(C('JPEG2DXF_HOW_H2'))}</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- JPEG2DXF_HOW_S1 --><li><h3>{esc(C('JPEG2DXF_HOW_S1'))}</h3></li>
      <!-- JPEG2DXF_HOW_S2 --><li><h3>{esc(C('JPEG2DXF_HOW_S2'))}</h3></li>
      <!-- JPEG2DXF_HOW_S3 --><li><h3>{esc(C('JPEG2DXF_HOW_S3'))}</h3></li>
    </ol>
    <!-- JPEG2DXF_HOW_AUX --><p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">{esc(C('JPEG2DXF_HOW_AUX'))}</p>
  </div>
</section>
<section class="section--alt" style="padding:40px 0">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <!-- JPEG2DXF_PRICING_ANCHOR --><p style="font-size:17.5px;max-width:44em">{esc(L('JPEG2DXF_PRICING_ANCHOR')[0])}</p>
    <a class="btn btn--primary" href="../pricing/code.html">{esc(L('JPEG2DXF_PRICING_ANCHOR')[1])}</a>
  </div>
</section>
"""
body += faq_section(en_faqs("JPEG2DXF", count=6))
body += en_links_block("JPEG2DXF")
body += final_band("JPEG2DXF_FINAL_BTN", "JPEG2DXF_FINAL_H2")
write("jpeg-to-dxf", "code.html", en_page("jpeg-to-dxf", "JPEG2DXF_META_TITLE", "JPEG2DXF_META_DESC", body))
write("jpeg-to-dxf", "states.html", generic_states(
    "/jpeg-to-dxf", ".jpeg, .jpg", "line-deer_before.png", "line-deer_after.png",
    LOGO_LAYERS, DXF_DL_BTNS, steps=STEPS_TRACE, lang="en", error_ext=".JPEG",
    show_precision=True, show_ai_hd=True))

# ===== PT JPEG para DXF (compact PT skeleton) =====
PT = "PT_JPEG2DXF"
pbody = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:860px">
    <div class="hero__eyebrow"><!-- PT_JPEG2DXF_EYEBROW --><span class="spec">{esc(C('PT_JPEG2DXF_EYEBROW'))}</span></div>
    <!-- PT_JPEG2DXF_H1 --><h1>{esc(C('PT_JPEG2DXF_H1'))}</h1>
    <!-- PT_JPEG2DXF_HERO_SUB --><p class="hero__sub">{esc(C('PT_JPEG2DXF_HERO_SUB'))}</p>
    <div class="dropzone matgrid" id="convert" style="margin-top:26px">
      {DZ_ICON}
      <!-- PT_JPEG2DXF_DZ_TEXT --><div class="dz-text">{esc(C('PT_JPEG2DXF_DZ_TEXT'))}</div>
      <div class="dz-or">— ou —</div>
      <!-- PT_JPEG2DXF_DZ_BTN --><button class="btn btn--primary btn--lg" type="button">{esc(C('PT_JPEG2DXF_DZ_BTN'))}</button>
      <!-- PT_JPEG2DXF_DZ_FORMATS --><div class="dz-formats">{esc(C('PT_JPEG2DXF_DZ_FORMATS'))}</div>
      <!-- PT_JPEG2DXF_MICROCOPY --><div style="margin-top:12px"><span class="microcopy">{esc(C('PT_JPEG2DXF_MICROCOPY'))}</span></div>
    </div>
    <div style="margin-top:14px"><!-- PT_JPEG2DXF_BADGES -->{badges_html('PT_JPEG2DXF_BADGES')}</div>
  </div>
</section>
"""
pbody += section("PT_JPEG2DXF_EXPLAINER_H2", "PT_JPEG2DXF_EXPLAINER_P", alt=True, lang="pt")
pcards = "".join(
    f'<div class="card"><!-- PT_JPEG2DXF_{hk} --><h3>{esc(C(f"PT_JPEG2DXF_{hk}"))}</h3>'
    f'<!-- PT_JPEG2DXF_{pk} --><p style="margin-top:8px">{T(f"PT_JPEG2DXF_{pk}", "pt")}</p></div>'
    for hk, pk in [("HONEST_H2", "HONEST_P"), ("PHOTO_H2", "PHOTO_P"), ("SAMEFMT_H2", "SAMEFMT_P")])
pbody += f'<section class="section"><div class="wrap"><div class="grid-3">{pcards}</div></div></section>'
pbody += steps_block("PT_JPEG2DXF", "pt")
pbody += faq_section(pt_faqs("PT_JPEG2DXF", count=4), lang="pt")
pbody += final_band("PT_JPEG2DXF_FINAL_BTN")
write("pt-jpeg-para-dxf", "code.html", pt_page("pt-jpeg-para-dxf", "jpeg-to-dxf",
                                              "PT_JPEG2DXF_META_TITLE", "PT_JPEG2DXF_META_DESC", pbody))
write("pt-jpeg-para-dxf", "states.html", generic_states(
    "/pt-jpeg-para-dxf", ".jpeg, .jpg", "line-deer_before.png", "line-deer_after.png",
    LOGO_LAYERS, '<button class="btn btn--primary" type="button">Baixar DXF</button>',
    steps=L("PT_JPEG2DXF_STEPS")[:3], lang="pt", error_ext=".JPEG",
    show_precision=False, show_ai_hd=False))
built += ["jpeg-to-dxf", "pt-jpeg-para-dxf"]

print("BUILT " + ",".join(built))
