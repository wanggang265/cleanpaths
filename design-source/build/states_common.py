#!/usr/bin/env python3
"""Tool-page state board builder — v1.1, applies 05 §11.12 frozen wording.
States: dragover / processing / result+feedback / error / daily-cap / pro-locked / pro-active / feedback-sent.
"""
from components import *

# ---- §11.2 frozen cap-state copy ----
CAP_EN = {
    "badge": "10/10",
    "aria": "10 of 10 free conversions used today",
    "main": "That's your 10 for today — the free counter resets tomorrow.",
    "conv": "On a deadline? Pro removes the daily cap — $59, one time. No subscriptions. 30-day money-back guarantee.",
    "mono": "FREE COUNTER RESETS DAILY · PRO: NO DAILY CAP",
}
CAP_PT = {
    "badge": "10/10",
    "aria": "10 of 10 free conversions used today",
    "main": "Você usou as 10 conversões grátis de hoje — o contador reinicia amanhã.",
    "cta": "Ver opções →",
    "mono": "CONTADOR GRATUITO REINICIA TODO DIA",
}

STEPS_TRACE = ['✓ Reading file (local)', '▸ Tracing paths — auto-tuned parameters', '○ Preparing download']
STEPS_SVG = ['✓ Reading file (local)', '▸ Converting curves to polylines', '○ Preparing download']
STEPS_JFIF = ['✓ Reading file (local)', '▸ Repackaging as JPG', '○ Preparing download']
STEPS_PT = ['✓ Lendo o arquivo (local)', '▸ Reempacotando como JPG', '○ Preparando o download']

def _steps_html(steps):
    out = []
    for s in steps:
        cls = "done" if s.startswith("✓") else ("now" if s.startswith("▸") else "")
        out.append(f'<span class="{cls}">{s}</span>' if cls else f"<span>{s}</span>")
    return "\n    ".join(out)

def _cap_state(lang="en"):
    if lang == "pt":
        c = CAP_PT
        return f"""
<div class="dropzone">
  <div class="state-note state-note--cap"><span class="badge" aria-label="{c['aria']}"><b>{c['badge']}</b></span><span>{c['main']}</span></div>
  <div class="dl-row" style="justify-content:center">
    <a class="btn btn--ghost" href="../pricing/code.html">{c['cta']}</a>
  </div>
  <div class="dz-formats" style="margin-top:12px">{c['mono']}</div>
</div>"""
    c = CAP_EN
    return f"""
<div class="dropzone">
  <div class="state-note state-note--cap"><span class="badge" aria-label="{c['aria']}"><b>{c['badge']}</b></span><span>{c['main']}</span></div>
  <p style="margin-top:12px;font-size:15px;color:var(--ink-2)">{c['conv']}</p>
  <div class="dl-row" style="justify-content:center">
    <a class="btn btn--primary" href="../pricing/code.html">Get CleanPaths Pro — $59, one time</a>
    <a class="btn btn--ghost" href="../pricing/code.html">See pricing →</a>
  </div>
  <div class="dz-formats" style="margin-top:12px">{c['mono']}</div>
</div>"""

def generic_states(page_name, accept, sample_before, sample_after, layers_html,
                   download_btns, *, steps=None, lang="en", error_ext=None,
                   show_precision=True, show_ai_hd=True):
    """steps: list of 3 frozen step labels; error_ext: e.g. '.JFIF' (§11.3 single-format template)."""
    steps = steps or STEPS_TRACE
    error_ext = error_ext or accept.split(",")[0].strip()
    if lang == "pt":
        dz_drop, dz_or = "Arraste seu arquivo .jfif aqui — ou clique para escolher", "SOLTE PARA COMEÇAR"
        proc_main = "Convertendo — no seu navegador, nada foi enviado"
        err_main = f"<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita {error_ext}. Nada foi enviado, então nada foi armazenado."
        err_btn = "Escolher outro arquivo"
    else:
        dz_drop, dz_or = "Drop your file here", "RELEASE TO START"
        proc_main = "Converting — on your device, nothing uploaded"
        err_main = f"<b>That file can't be converted here.</b> This page accepts {error_ext}. Nothing was uploaded, so nothing was stored."
        err_btn = "Choose another file"

    precision_html = ""
    if show_precision:
        precision_html = """
  <div style="margin-top:14px;text-align:left">
    <label class="spec" style="margin-bottom:6px">Precision</label>
    <input type="range" min="1" max="10" value="6" style="width:100%;accent-color:#E4572E" aria-label="Precision">
  </div>"""

    result_panel = f"""
<div class="dropzone" style="border-style:solid;border-color:var(--mat)">
  <div class="result">
    <div class="panel">
      <div class="cap">INPUT</div>
      <img src="../../assets/samples/{sample_before}" alt="input preview" style="aspect-ratio:4/3;object-fit:cover">
    </div>
    <div class="panel">
      <div class="cap">OUTPUT PREVIEW</div>
      <img src="../../assets/samples/{sample_after}" alt="output preview" style="aspect-ratio:4/3;object-fit:cover">
    </div>
  </div>
  <ul class="layers" style="margin-top:14px;background:var(--paper);border:1.5px solid var(--line);border-radius:6px">
    {layers_html}
  </ul>{precision_html}
  <div class="dl-row">{download_btns}</div>
  {share_block(lang)}
</div>
<div style="margin-top:16px">{feedback_block("result", lang=lang)}</div>"""

    blocks = [
        state_block("STATE 2 · drag-over", f"""
<div class="dropzone is-dragover matgrid">
  {UPLOAD_ICON}
  <div class="dz-text">{dz_drop}</div>
  <div class="dz-or">{dz_or}</div>
  <div class="dz-formats">ACCEPTS: {accept} · PROCESSED LOCALLY</div>
</div>"""),
        state_block("STATE 3 · processing", f"""
<div class="dropzone proc">
  <div class="dz-text">{proc_main}</div>
  <div class="bar-outer"><div class="bar-inner"></div></div>
  <div class="steps-mini">
    {_steps_html(steps)}
  </div>
</div>"""),
        state_block("STATE 4 · result (download) + feedback form [Amend A001]", result_panel),
        state_block("STATE 5 · error (unsupported file)", f"""
<div class="dropzone">
  <div class="state-note state-note--error"><b>!</b><span>{err_main}</span></div>
  <div style="margin-top:14px"><button class="btn" type="button">{err_btn}</button></div>
</div>"""),
        state_block("STATE 6 · daily cap reached — 05 §11.2 frozen copy" + (" (PT neutral variant)" if lang == "pt" else ""),
                    _cap_state(lang)),
    ]
    if show_ai_hd:
        blocks.append(state_block("STATE 7 · Pro-locked feature / permission state (AI HD rescue)", """
<div class="dropzone" style="text-align:left">
  <label class="switch"><span class="track"></span>AI HD rescue <span class="try-badge">2 / 3 FREE TRIES LEFT</span></label>
  <p style="margin-top:10px;font-size:14px;color:var(--ink-2)">An optional AI upscaler that runs on your device's GPU (no upload) for heavily degraded images. Free tier includes 3 tries; Pro includes it with no per-use limit.</p>
</div>"""))
    blocks.append(state_block("STATE 8 · Pro active (license verified, offline-capable)", """
<div class="dropzone">
  <div class="badges" style="justify-content:center"><span class="badge"><b>✓ PRO ACTIVE</b></span><span class="badge badge--soft">no daily cap</span><span class="badge badge--soft">works offline after activation</span></div>
</div>"""))
    blocks.append(state_block("STATE 9 · feedback submitted (success)", feedback_ok(lang)))
    blocks.append(state_block("STATE 10 · feedback FAB — 4 states (06c-A1)", feedback_fab_states(lang)))
    blocks.append(state_block("STATE 11 · feedback modal — 4 states (06c-A2)", feedback_modal_states(lang)))
    return states_page(f"{page_name} — upload component states", page_name, "".join(blocks))


# ---- 06c-A state documentation: FAB 4 states + modal 4 states ----
def feedback_fab_states(lang="en"):
    c = FB_COPY[lang]
    return f"""
<div style="display:grid;gap:18px">
  <div><span class="spec">default</span><div style="margin-top:8px;position:relative;height:52px;background:var(--paper-2);border:1.5px solid var(--line);border-radius:8px">
    <span class="fab-feedback" style="position:absolute;right:16px;bottom:12px"><span class="dot"></span><span class="fab-label">{c['fab'].upper()}</span></span></div></div>
  <div><span class="spec">hover</span><div style="margin-top:8px;position:relative;height:52px;background:var(--paper-2);border:1.5px solid var(--line);border-radius:8px">
    <span class="fab-feedback" style="position:absolute;right:16px;bottom:14px;transform:translateY(-2px)"><span class="dot"></span><span class="fab-label">{c['fab'].upper()}</span></span></div></div>
  <div><span class="spec">focus-visible</span><div style="margin-top:8px;position:relative;height:52px;background:var(--paper-2);border:1.5px solid var(--line);border-radius:8px">
    <span class="fab-feedback" style="position:absolute;right:16px;bottom:12px;outline:3px solid #E4572E;outline-offset:3px"><span class="dot"></span><span class="fab-label">{c['fab'].upper()}</span></span></div></div>
  <div><span class="spec">reduced-motion · quiet (tool busy)</span><div style="margin-top:8px;position:relative;height:52px;background:var(--paper-2);border:1.5px solid var(--line);border-radius:8px">
    <span class="fab-feedback is-quiet" style="position:absolute;right:16px;bottom:12px;transition:none"><span class="dot"></span><span class="fab-label">{c['fab'].upper()}</span></span></div></div>
</div>"""

def _modal_card_inner(lang="en", state="default"):
    c = FB_COPY[lang]
    types = "".join(
        f'<button type="button" aria-pressed="{"true" if (state == "default" and t == c["types"][1]) else "false"}">{t}</button>'
        for t in c["types"])
    if state == "submitting":
        btn = f'<button class="btn btn--primary" type="button" disabled style="opacity:.6">{c["submit"]}…</button>'
        extra = ""
    elif state == "success":
        return f"""<h3>{c['title']}</h3>
    <div class="fb-success"><div class="big">✅</div><p style="font-weight:600">{c['success']}</p></div>"""
    elif state == "error":
        btn = f'<button class="btn btn--primary" type="button">{c["retry"]}</button>'
        extra = f'<div class="fb-error-note">{c["error"]}</div>'
    else:
        btn = f'<button class="btn btn--primary" type="button">{c["submit"]}</button>'
        extra = ""
    return f"""<h3>{c['title']}</h3>
    <p class="sub">{c['sub']}</p>
    <div class="fb-types" role="group" aria-label="Feedback type">{types}</div>
    <textarea placeholder="{c['placeholder']}" aria-label="Feedback"></textarea>
    <input type="text" placeholder="{c['contact']}" aria-label="Contact (optional)">
    <div class="fb-trust">{c['trust']}</div>
    {extra}
    <div class="actions">{btn}</div>"""

def feedback_modal_states(lang="en"):
    out = []
    for st in ["default", "submitting", "success", "error"]:
        out.append(f"""<div style="margin-bottom:24px"><span class="spec">{st}</span>
  <div class="fb-modal__card" style="max-width:520px;margin-top:8px">{_modal_card_inner(lang, st)}</div></div>""")
    return '<div style="background:rgba(30,36,48,.12);padding:24px;border-radius:10px">' + "".join(out) + "</div>"


DXF_DL_BTNS = """
<button class="btn btn--primary" type="button">Download DXF (R2000)</button>
<button class="btn" type="button">Download DXF (R12)</button>
<button class="btn btn--ghost" type="button">Download SVG</button>"""

SVG_DL_BTNS = """
<button class="btn btn--primary" type="button">Download SVG</button>"""

JPG_DL_BTNS = """
<button class="btn btn--primary" type="button">Download JPG</button>"""

PT_DL_BTNS = '<button class="btn btn--primary" type="button">Baixar JPG</button>'

LOGO_LAYERS = """
<li><span class="sw" style="background:#1F4E79"></span>layer-1 · #1F4E79 · closed</li>
<li><span class="sw" style="background:#F08F1C"></span>layer-2 · #F08F1C · closed</li>
<li style="color:var(--ink-3)">… 7 more layers, all closed paths</li>"""

UI_LAYERS = """
<li><span class="sw" style="background:#22283A"></span>layer-1 · #22283A · closed</li>
<li><span class="sw" style="background:#E4572E"></span>layer-2 · #E4572E · closed</li>
<li style="color:var(--ink-3)">… 3 more layers, all closed paths</li>"""

LINE_LAYERS = """
<li><span class="sw" style="background:#2A2C34"></span>layer-1 · stroke paths · closed</li>
<li style="color:var(--ink-3)">single ink layer · cut-ready</li>"""

JFIF_LAYERS_EN = '<li><span class="sw" style="background:#E0E4EA"></span>container repackaged · .jfif → .jpg · image data untouched</li>'
