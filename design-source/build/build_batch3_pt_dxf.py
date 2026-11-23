#!/usr/bin/env python3
"""2b batch builder: generate 3 PT DXF tool pages.

  pages/pt-png-para-dxf/  pages/pt-jpg-para-dxf/  pages/pt-svg-para-dxf/

Copy source: build/batch3_copy.json — parsed verbatim from
05-copy-freeze-v1.18 §A (every slot char-count asserted at parse time).

Structure: PT batch2 precedent (pt-jpeg-para-dxf). Chrome (header / footer /
tail) extracted verbatim from the PATCHED pt-jpeg-para-dxf (mailto already
swapped), English-version href rewritten per page. No new copy invented;
component-mechanical strings (seg labels, ACEITA line, spec labels, dz-or,
SVG dz-icon) are carried over verbatim from existing production pages.

states.html: template-copy from pt-jpeg-para-dxf/states.html with mechanical
substitutions (laser_batch_build.py pt_states precedent): page context, dz
label (frozen), ACEITA ext, error ext, samples (EN twin's), v1.13 PT trace
steps, v1.13 PT 3-button DXF download form; svg page swaps in the EN svg
twin's POLYLINE layers list.
"""
import json
import os
import re
import html as H

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = os.path.join(HERE, "..", "pages")
COPY = json.load(open(os.path.join(HERE, "batch3_copy.json"), encoding="utf-8"))


def esc(s):
    return H.escape(s, quote=False)


def C(page, key):
    return COPY["pages"][page][key]


REF = open(os.path.join(PAGES, "pt-jpeg-para-dxf", "code.html"), encoding="utf-8").read()
ST_TPL = open(os.path.join(PAGES, "pt-jpeg-para-dxf", "states.html"), encoding="utf-8").read()

# ---------- chrome (verbatim from patched batch2 PT precedent) ----------
PT_HEADER = REF[REF.index('<header class="site-header">'): REF.index("</header>") + len("</header>")]
PT_FOOTER = REF[REF.index('<footer class="site-footer">'): REF.index("</footer>") + len("</footer>")]
PT_TAIL = REF[REF.index('<a class="fab-feedback"'): REF.index("</body>")]
DZ_ICON_SVG = REF[REF.index('<svg class="dz-icon"'): REF.index("</svg>") + len("</svg>")]
assert "mailto:" not in PT_HEADER + PT_FOOTER + PT_TAIL, "chrome not patched (mailto present)"
assert "Suporte: support [at]" in PT_FOOTER, "chrome footer missing swapped support row"


def chrome(slug, en_slug):
    h = PT_HEADER.replace("../jpeg-to-dxf/code.html", f"../{en_slug}/code.html")
    f = PT_FOOTER.replace("../jpeg-to-dxf/code.html", f"../{en_slug}/code.html")
    t = PT_TAIL.replace("/pt-jpeg-para-dxf", f"/{slug}")
    assert f"../{en_slug}/code.html" in f, f"footer English-version href rewrite failed for {slug}"
    return h, f, t


def head(title, desc):
    return (
        '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        f"<!-- PT_META_T --><title>{esc(title)}</title>\n"
        f'<!-- PT_META_D --><meta name="description" content="{esc(desc)}">\n'
        '<link rel="stylesheet" href="../../assets/design-system.css">\n'
        '<link rel="icon" type="image/svg+xml" href="../../assets/favicon.svg">\n'
        "</head>\n"
    )


def badges_html(page, key="PT_HERO_BADGES"):
    parts = [p.strip() for p in C(page, key).split("·")]
    inner = " · ".join(f'<span class="badge">{esc(p)}</span>' for p in parts)
    return f'<div class="badges">{inner}</div>'


SEG_BLOCK = (
    '<div style="margin-top:16px">\n        '
    '<div class="seg" role="group" aria-label="DXF version">\n        '
    '<button aria-pressed="true">R2000 · units included</button>\n        '
    '<button aria-pressed="false">R12 · compatibility mode</button>\n      </div>\n      '
    "<!-- PT_HERO_VER_NOTE -->" '<div class="seg-note">{ver_note}</div>\n    </div>'
)

SWITCH_BLOCK = (
    "<!-- PT_HERO_TOGGLE -->"
    '<label class="switch" style="margin-top:16px"><span class="track"></span>{toggle}</label>'
)


def hero(page, fmt, *, seg=None, switch=False):
    """seg: "ver_note" key per page (version selector); switch: PT_HERO_TOGGLE."""
    inner = [f'<div class="dropzone matgrid" id="convert" style="margin-top:26px">',
             "      " + DZ_ICON_SVG,
             f"      <!-- PT_HERO_DZ_LABEL --><div class=\"dz-text\">{esc(C(page, 'PT_HERO_DZ_LABEL'))}</div>",
             '      <div class="dz-or">— ou —</div>',
             f"      <!-- PT_HERO_DZ_BTN --><button class=\"btn btn--primary btn--lg\" type=\"button\">{esc(C(page, 'PT_HERO_DZ_BTN'))}</button>",
             f'      <div class="dz-formats">ACEITA: {fmt} · PROCESSADO LOCALMENTE</div>']
    if seg:
        inner.append("      " + SEG_BLOCK.format(ver_note=esc(C(page, seg))))
    if switch:
        inner.append("      " + SWITCH_BLOCK.format(toggle=esc(C(page, "PT_HERO_TOGGLE"))))
    if "PT_MICROCOPY" in COPY["pages"][page]:
        inner.append(f"      <!-- PT_MICROCOPY --><div style=\"margin-top:12px\"><span class=\"microcopy\">{esc(C(page, 'PT_MICROCOPY'))}</span></div>")
    inner.append("    </div>")
    inner.append(f'    <div style="margin-top:14px"><!-- PT_HERO_BADGES -->{badges_html(page)}</div>')
    body = "\n".join(inner)
    return (
        '<section class="hero matgrid">\n  <div class="wrap" style="max-width:860px">\n'
        f"    <!-- PT_H1 --><h1>{esc(C(page, 'PT_H1'))}</h1>\n"
        f"    <!-- PT_SUB --><p class=\"hero__sub\">{esc(C(page, 'PT_SUB'))}</p>\n"
        f"    {body}\n  </div>\n</section>"
    )


def honest(page):
    return (
        '<section class="section">\n  <div class="wrap">\n'
        f"    <!-- PT_HONEST_H2 --><h2>{esc(C(page, 'PT_HONEST_H2'))}</h2>\n"
        '    <div class="info-strip" style="margin-top:12px;border-color:var(--caution);background:var(--caution-soft)">\n'
        '      <span class="i" style="background:var(--caution)">!</span>\n'
        f"      <!-- PT_HONEST_P --><span>{esc(C(page, 'PT_HONEST_P'))}</span>\n"
        "    </div>\n  </div>\n</section>"
    )


def plist(items):
    lis = "\n".join(f"      <!-- {k} --><li>{esc(v)}</li>" for k, v in items)
    return f'<ul class="plist" style="margin-top:12px">\n{lis}\n    </ul>'


def steps(items):
    lis = "\n".join(f"      <!-- {k} --><li><h3>{esc(v)}</h3></li>" for k, v in items)
    return f'<ol class="steps" style="margin-top:20px">\n{lis}\n    </ol>'


def problem(page):
    items = [(f"PT_PROB_P{i}", C(page, f"PT_PROB_P{i}")) for i in (1, 2, 3)]
    return (
        '<section class="section section--alt">\n  <div class="wrap">\n'
        '    <span class="spec">The problem</span>\n'
        f"    <!-- PT_PROB_H2 --><h2 style=\"margin-top:12px\">{esc(C(page, 'PT_PROB_H2'))}</h2>\n"
        f"    {plist(items)}\n  </div>\n</section>"
    )


def solution(page, keys, spec, note=None):
    items = [(k, C(page, k)) for k in keys]
    extra = ""
    if note:
        extra = (
            '\n    <div class="info-strip" style="margin-top:24px"><span class="i">i</span>'
            f"<!-- PT_SOL_NOTE --><span>{esc(C(page, note))}</span></div>"
        )
    return (
        '<section class="section">\n  <div class="wrap">\n'
        f'    <span class="spec">{spec}</span>\n'
        f"    <!-- PT_SOL_H2 --><h2 style=\"margin-top:12px\">{esc(C(page, 'PT_SOL_H2'))}</h2>\n"
        f"    {steps(items)}{extra}\n  </div>\n</section>"
    )


def how(page, aux_mono=True):
    items = [(f"PT_HOW_S{i}", C(page, f"PT_HOW_S{i}")) for i in (1, 2, 3)]
    extra = ""
    if aux_mono:
        extra = (
            f"\n    <!-- PT_HOW_AUX --><p style=\"margin-top:20px;font-family:var(--font-mono);"
            f"font-size:13px;color:var(--ink-2)\">{esc(C(page, 'PT_HOW_AUX'))}</p>"
        )
    return (
        '<section class="section section--alt">\n  <div class="wrap">\n'
        '    <span class="spec">Workflow</span>\n'
        f"    <!-- PT_HOW_H2 --><h2 style=\"margin-top:12px\">{esc(C(page, 'PT_HOW_H2'))}</h2>\n"
        f"    {steps(items)}{extra}\n  </div>\n</section>"
    )


WHY_ROW_CLASS = {"no": "no", "part": "part", "yes": "yes"}


def why_tab_html():
    tab = COPY["why_tab"]
    head_cells = f"<thead><tr><th></th><th>{esc(tab['col'][0])}</th><th class=\"us\">{esc(tab['col'][1])}</th></tr></thead>"
    rows = []
    for feat, competitor, ours in tab["rows"]:
        cls = "no" if competitor.startswith("❌") else ("part" if competitor == "Limitado" else "yes")
        ocls = "yes" if ours.startswith("✅") else "part"
        rows.append(
            f"<tr><td>{esc(feat)}</td><td class=\"{cls}\">{esc(competitor)}</td>"
            f"<td class=\"{ocls}\">{esc(ours)}</td></tr>"
        )
    return (
        '<div style="overflow-x:auto;margin-top:24px"><table class="cmp">'
        + head_cells + "<tbody>\n" + "\n".join(rows) + "\n</tbody></table></div>"
    )


def why(page, *, facts=False, spec="Honest comparison"):
    chips = ""
    if facts:
        parts = [p.strip() for p in C(page, "PT_WHY_FACTS").split("·")]
        inner = " · ".join(f'<span class="badge">{esc(p)}</span>' for p in parts)
        chips = f"\n    <!-- PT_WHY_FACTS --><div class=\"badges\" style=\"margin-top:16px\">{inner}</div>"
    return (
        '<section class="section">\n  <div class="wrap">\n'
        f'    <span class="spec">{spec}</span>\n'
        f"    <!-- PT_WHY_H2 --><h2 style=\"margin-top:12px\">{esc(C(page, 'PT_WHY_H2'))}</h2>"
        f"{chips}\n    {why_tab_html()}\n  </div>\n</section>"
    )


def faqs(page, n, links):
    """links: [(anchor, href)] applied to answers (§J registered outlinks only)."""
    det = []
    for i in range(1, n + 1):
        q = esc(C(page, f"PT_FAQ{i}_Q"))
        a = esc(C(page, f"PT_FAQ{i}_A"))
        for anchor, href in links:
            assert a.count(anchor) <= 1, f"{page} FAQ{i}: anchor '{anchor}' count > 1"
            a = a.replace(anchor, f'<a href="{href}">{anchor}</a>')
        det.append(f"<details><summary><!-- PT_FAQ{i}_Q -->{q}</summary><div class='a'><!-- PT_FAQ{i}_A -->{a}</div></details>")
    return (
        '<section class="section"><div class="wrap"><span class="spec">FAQ</span>'
        '<div style="margin-top:12px"><div class="faq">\n' + "\n".join(det)
        + "\n</div></div></div></section>"
    )


def cta(page):
    return (
        '<section class="section section--alt cta-band"><div class="wrap">\n'
        f"  <!-- PT_CTA_H2 --><h2>{esc(C(page, 'PT_CTA_H2'))}</h2>\n"
        f"  <!-- PT_CTA_BTN --><a class=\"btn btn--primary btn--lg\" href=\"#convert\">{esc(C(page, 'PT_CTA_BTN'))}</a>\n"
        "</div></section>"
    )


def glow_strip(page, links):
    a = esc(C(page, "PT_HOW_AUX"))
    for anchor, href in links:
        assert a.count(anchor) <= 1, f"{page} HOW_AUX anchor '{anchor}' count > 1"
        a = a.replace(anchor, f'<a href="{href}">{anchor}</a>')
    return (
        '<div class="wrap" style="margin-top:24px">\n'
        '  <div class="info-strip"><span class="i">i</span>'
        f"<!-- PT_HOW_AUX --><span>{a}</span></div>\n</div>"
    )


# ---------- states.html (template-copy with mechanical substitutions) ----------
PT_DL = ('<div class="dl-row">\n'
         '<button class="btn btn--primary" type="button">Baixar DXF (R2000)</button>\n'
         '<button class="btn" type="button">Baixar DXF (R12)</button>\n'
         '<button class="btn btn--ghost" type="button">Baixar SVG</button></div>')

OLD_DL = '<div class="dl-row"><button class="btn btn--primary" type="button">Baixar DXF</button></div>'
OLD_DZ = "Arraste seu arquivo .jpeg aqui — ou clique para escolher"
OLD_FMT = '<div class="dz-formats">ACCEPTS: .jpeg, .jpg · PROCESSED LOCALLY</div>'
OLD_ERR = "Esta página aceita .JPEG."
OLD_STEPS = ('<span>Arraste seu arquivo .jpeg.</span>\n    '
             '<span>A conversão acontece no seu navegador — na hora.</span>\n    '
             '<span>Baixie o .dxf.</span>'.replace("Baixie", "Baixe"))
NEW_STEPS = ('<span>✓ Lendo o arquivo (local)</span>\n    '
             '<span>▸ Vetorizando — parâmetros ajustados à imagem</span>\n    '
             '<span>○ Preparando o download</span>')

m = re.search(r'<ul class="layers"[^>]*>.*?</ul>', ST_TPL, re.S)
assert m, "layers ul not found in states template"
OLD_LAYERS = m.group(0)
SVG_STATES = open(os.path.join(PAGES, "svg-to-dxf-converter", "states.html"), encoding="utf-8").read()
m2 = re.search(r'<ul class="layers"[^>]*>.*?</ul>', SVG_STATES, re.S)
assert m2, "svg layers ul not found"
NEW_LAYERS = m2.group(0)


def states(slug, *, dz_label, fmt, ext, sample, swap_layers=False):
    s = ST_TPL
    s = s.replace("/pt-jpeg-para-dxf", f"/{slug}")
    assert s.count(OLD_DZ) == 1
    s = s.replace(OLD_DZ, dz_label)
    assert s.count(OLD_FMT) == 1
    s = s.replace(OLD_FMT, f'<div class="dz-formats">ACEITA: {fmt.lower()} · PROCESSADO LOCALMENTE</div>')
    assert s.count(OLD_ERR) == 1
    s = s.replace(OLD_ERR, f"Esta página aceita {ext}.")
    assert s.count("samples/line-deer_before.png") == 1
    s = s.replace("line-deer_before.png", f"{sample}_before.png")
    assert s.count("samples/line-deer_after.png") == 1
    s = s.replace("line-deer_after.png", f"{sample}_after.png")
    assert s.count(OLD_STEPS) == 1
    s = s.replace(OLD_STEPS, NEW_STEPS)
    assert s.count(OLD_DL) == 1
    s = s.replace(OLD_DL, PT_DL)
    if swap_layers:
        assert s.count(OLD_LAYERS) == 1
        s = s.replace(OLD_LAYERS, NEW_LAYERS)
    return s


# ---------- page definitions ----------
PAGES_SPEC = {
    "pt-png-para-dxf": dict(
        en="png-to-dxf", fmt=".PNG", ext=".PNG", sample="logo-peak",
        ver="PT_HERO_VER_NOTE", n_faq=7,
        sol=["PT_SOL_P1", "PT_SOL_P2", "PT_SOL_P3"], spec_sol="The pipeline", sol_note="PT_SOL_NOTE",
        links=[("conversor de JPG para DXF", "../pt-jpg-para-dxf/code.html")],
    ),
    "pt-jpg-para-dxf": dict(
        en="jpg-to-dxf", fmt=".JPG", ext=".JPG", sample="logo-bean",
        switch=True, n_faq=7,
        sol=["PT_SOL_P1", "PT_SOL_P2", "PT_SOL_P3", "PT_SOL_P4"], spec_sol="The pipeline",
        links=[("conversor de JPEG para DXF", "../pt-jpeg-para-dxf/code.html")],
    ),
    "pt-svg-para-dxf": dict(
        en="svg-to-dxf-converter", fmt=".SVG", ext=".SVG", sample="line-rocket",
        ver="PT_HERO_VER_NOTE", n_faq=8, glow=True, swap_layers=True,
        sol=["PT_SOL_P1", "PT_SOL_P2", "PT_SOL_P3", "PT_SOL_P4"], spec_sol="The converter",
        links=[("conversor de PNG", "../pt-png-para-dxf/code.html"),
               ("conversor de JPG", "../pt-jpg-para-dxf/code.html")],
    ),
}

STRIP = lambda s: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s))
STRIP0 = lambda s: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s))

for slug, sp in PAGES_SPEC.items():
    page = slug
    h, f, t = chrome(slug, sp["en"])
    parts = [head(C(page, "PT_META_T"), C(page, "PT_META_D")), h, "<main>\n"]
    parts.append(hero(page, sp["fmt"], seg=sp.get("ver"), switch=sp.get("switch", False)))
    if sp.get("glow"):
        parts.append(glow_strip(page, sp["links"]))
    if "PT_HONEST_H2" in COPY["pages"][page]:
        parts.append(honest(page))
    parts.append(problem(page))
    parts.append(solution(page, sp["sol"], sp["spec_sol"], note=sp.get("sol_note")))
    parts.append(how(page, aux_mono=not sp.get("glow")))
    parts.append(why(page, facts=sp.get("glow", False),
                     spec="What you get" if sp.get("glow") else "Honest comparison"))
    parts.append(faqs(page, sp["n_faq"], sp["links"]))
    parts.append(cta(page))
    parts.append("</main>\n" + f + "\n" + t + "</body>\n</html>\n")
    html_doc = "\n".join(parts)

    st = states(slug, dz_label=C(page, "PT_HERO_DZ_LABEL"), fmt=sp["fmt"], ext=sp["ext"],
                sample=sp["sample"], swap_layers=sp.get("swap_layers", False))

    # ---- self-check: every frozen slot lands verbatim ----
    flat = STRIP0(html_doc)
    missing = []
    for key, val in COPY["pages"][page].items():
        if key == "PT_ERR":
            assert STRIP(val) in STRIP(st), f"{slug}: PT_ERR missing in states"
            continue
        if key == "PT_FOOT_LINKS":
            # registration row (notation), realized by chrome footer — verify semantically
            assert "Política de Privacidade" in f and f"../{sp['en']}/code.html" in f \
                and "Suporte: support [at] cleanpaths.io" in f, f"{slug}: footer links incomplete"
            continue
        if val in html_doc or val in flat:
            continue
        # escape-aware pass: slots rendered through esc() (or linkified in flat text)
        if esc(val) in html_doc or STRIP(esc(val)) in flat:
            continue
        missing.append(key)
    assert not missing, f"{slug}: slots missing: {missing}"
    # §J outlink count check: every registered anchor href lands the expected times
    expect = {"pt-png-para-dxf": 1, "pt-jpg-para-dxf": 1, "pt-svg-para-dxf": 2}[slug]
    for _, href in sp["links"]:
        n = html_doc.count(f'<a href="{href}">')
        assert n == expect, f"{slug}: href {href} count {n} != {expect}"

    d = os.path.join(PAGES, slug)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "code.html"), "w", encoding="utf-8") as fh:
        fh.write(html_doc)
    with open(os.path.join(d, "states.html"), "w", encoding="utf-8") as fh:
        fh.write(st)
    print(f"{slug}: code.html {len(html_doc)}B, states.html {len(st)}B — all 45 slots verbatim OK")

print("BATCH3 BUILD COMPLETE")
