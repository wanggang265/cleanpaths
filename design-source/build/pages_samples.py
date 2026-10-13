#!/usr/bin/env python3
"""Samples wall (/samples) — copy verbatim from 05-copy-freeze-v1.md §1.7.
Sample images are synthetic placeholders (05 §1.7 [待确认])."""
from components import *

def sample_card(name, before, after, stats, cta_route, caption):
    chips = "".join(f'<span class="stat">{k} <b>{v}</b></span>' for k, v in stats)
    return f"""<div class="card sample-card">
  <p class="sample-title">{name}</p>
  <div class="ba">
    <div class="ba__imgs">
      <img src="../../assets/samples/{before}" width="900" height="675" alt="{name} — input (synthetic sample)" loading="lazy" decoding="async">
      <img src="../../assets/samples/{after}" width="900" height="675" alt="{name} — traced output (synthetic sample)" loading="lazy" decoding="async">
    </div>
    <div class="ba__divider"></div><div class="ba__handle">⇔</div>
    <span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span>
    <span class="synth-tag">SYNTHETIC SAMPLE</span>
  </div>
  <div class="stats">{chips}</div>
  <p class="cap-line">{caption}</p>
  <a class="btn btn--ghost btn--sm" style="align-self:center" href="{href(cta_route)}">Try this conversion free →</a>
</div>"""

def build():
    hero = """
<section class="hero" style="padding-bottom:40px">
  <div class="wrap">
    <div class="hero__eyebrow"><span class="spec">Conversion evidence · synthetic samples, real corpus pending</span></div>
    <h1>See the Difference: Before / After</h1>
    <p class="hero__sub" style="max-width:56em">Every sample below started as the kind of image makers actually receive: a compressed logo, a phone screenshot, a scanned line drawing. Each one shows the input, the traced result, and the file stats — paths, color layers, closed loops. No photographs here: photos convert to stylized art, not cut-ready files, and we'd rather show you that boundary on the tool pages than hide it in a gallery.</p>
    <nav class="anchor-nav" aria-label="Sample categories">
      <a href="#logos">01 · LOW-RES LOGOS</a>
      <a href="#screenshots">02 · UI SCREENSHOTS</a>
      <a href="#lineart">03 · LINE ART &amp; SCANS</a>
    </nav>
  </div>
</section>"""
    logos = f"""
<section class="section" id="logos" style="padding-top:48px">
  <div class="wrap">
    <span class="spec">01 · the client special</span>
    <h2 style="margin-top:12px">Low-res logos</h2>
    <p style="color:var(--ink-2);margin-bottom:28px;max-width:52em">The client special: 150px, saved as JPG, expected back as a cut file.</p>
    <div class="grid-3">
      {sample_card("Hexagon badge logo", "logo-acme_before.png", "logo-acme_after.png",
                   [("LAYERS", "88 → 9"), ("PATHS", "closed ✓"), ("DXF", "R2000 · mm")], "/jpg-to-dxf",
                   "150px compressed JPG → 9 color layers")}
      {sample_card("Coffee mark logo", "logo-bean_before.png", "logo-bean_after.png",
                   [("INPUT", "noisy JPG"), ("PATHS", "closed ✓"), ("DXF", "R2000 · mm")], "/jpg-to-dxf",
                   "Noisy JPEG cleanup + trace in one pass")}
      {sample_card("Mountain mark logo", "logo-peak_before.png", "logo-peak_after.png",
                   [("INPUT", "small PNG"), ("PATHS", "closed ✓"), ("SVG", "layered")], "/png-to-dxf",
                   "Flat-color mark → cut-ready layers")}
    </div>
    <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">
      <a class="btn" href="{href('/png-to-dxf')}">PNG to DXF converter →</a>
      <a class="btn" href="{href('/jpg-to-dxf')}">JPG to DXF converter →</a>
    </div>
  </div>
</section>"""
    shots = f"""
<section class="section section--alt" id="screenshots">
  <div class="wrap">
    <span class="spec">02 · cleanest input there is</span>
    <h2 style="margin-top:12px">UI screenshots</h2>
    <p style="color:var(--ink-2);margin-bottom:28px;max-width:52em">Flat colors, sharp edges — the cleanest input there is.</p>
    <div class="grid-3">
      {sample_card("Dashboard UI", "ui-dashboard_before.png", "ui-dashboard_after.png",
                   [("LAYERS", "≈5"), ("EDGES", "sharp ✓"), ("SVG", "editable")], "/screenshot-to-svg",
                   "Dashboard screenshot → recolor-ready layers")}
      {sample_card("Mobile app screen", "ui-mobile_before.png", "ui-mobile_after.png",
                   [("INPUT", "app screen"), ("EDGES", "sharp ✓"), ("SVG", "editable")], "/screenshot-to-svg",
                   "App screen → tidy vector layers")}
      {sample_card("Settings panel", "ui-settings_before.png", "ui-settings_after.png",
                   [("INPUT", "settings UI"), ("EDGES", "sharp ✓"), ("SVG", "editable")], "/screenshot-to-svg",
                   "Settings UI → clean, editable SVG")}
    </div>
    <div style="margin-top:28px"><a class="btn" href="{href('/screenshot-to-svg')}">Screenshot to SVG converter →</a></div>
  </div>
</section>"""
    lineart = f"""
<section class="section" id="lineart">
  <div class="wrap">
    <span class="spec">03 · sketches &amp; scans</span>
    <h2 style="margin-top:12px">Line art &amp; scans</h2>
    <p style="color:var(--ink-2);margin-bottom:28px;max-width:52em">Sketches, stencils and scanned drawings, closed and cut-ready.</p>
    <div class="grid-3">
      {sample_card("Flower line art", "line-flower_before.png", "line-flower_after.png",
                   [("LAYER", "1 · ink"), ("PATHS", "closed ✓"), ("DXF", "R2000")], "/png-to-dxf",
                   "Scanned sketch → closed cut paths")}
      {sample_card("Rocket stencil", "line-rocket_before.png", "line-rocket_after.png",
                   [("LAYER", "1 · ink"), ("PATHS", "closed ✓"), ("DXF", "R2000")], "/png-to-dxf",
                   "Stencil drawing → clean outline")}
      {sample_card("Geometric deer", "line-deer_before.png", "line-deer_after.png",
                   [("LAYER", "1 · ink"), ("PATHS", "closed ✓"), ("DXF", "R12 ok")], "/png-to-dxf",
                   "Angular line art → machine-ready")}
    </div>
    <div style="margin-top:28px"><a class="btn" href="{href('/png-to-dxf')}">PNG to DXF converter →</a></div>
  </div>
</section>"""
    community = f"""
<section class="section section--alt" id="community">
  <div class="wrap">
    <span class="spec">04 · community</span>
    <h2 style="margin-top:12px">Community</h2>
    <div class="community-slot">
      <span class="spec">Reserved — opens on first opt-ins</span>
      <p>Real maker results land here — featured only with explicit opt-in. Nothing yet: the wall opens when the first makers say yes.</p>
    </div>
  </div>
</section>"""
    ugc = """
<section class="section--alt" style="padding:40px 0">
  <div class="wrap">
    <div class="info-strip"><span class="i">★</span><span>Made something with CleanPaths? A user showcase is coming — tell us via the feedback form if you'd like your finished work featured.</span></div>
  </div>
</section>"""
    body = hero + logos + shots + lineart + community + ugc
    return page("Before & After: See Cut-Ready Results | CleanPaths",
                "Real before-and-after conversions: compressed logos, UI screenshots and line art turned into clean, closed-path DXF/SVG cut files.",
                body, active_route="/samples")
