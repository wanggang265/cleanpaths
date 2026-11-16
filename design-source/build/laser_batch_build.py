#!/usr/bin/env python3
"""06 laser batch v1.6 -> v1.7: generate 5 new pages + patch EN footers.

Copy source: 05-copy-freeze-v1.13-laser-batch-addendum.md (parsed programmatically,
zero manual transcription). Chrome (header/footer/modal/cookie/states) extracted
verbatim from existing package pages (png-to-dxf, pt-webp-para-svg).
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROJ = os.path.abspath(os.path.join(ROOT, ".."))
PAGES = os.path.join(ROOT, "pages")

# ---------- 1. parse v1.13 frozen copy ----------
md = open(os.path.join(PROJ, "05-copy-freeze-v1.13-laser-batch-addendum.md"), encoding="utf-8").read()
COPY = {}
for line in md.splitlines():
    m = re.match(r"\|\s*\d+\s*\|\s*`([^`]+)`\s*\|[^|]*\|\s*`([^`]*)`\s*\|", line)
    if m:
        COPY[m.group(1)] = m.group(2)

EXPECT = {"IMG2DXF_": 53, "PT_IMG2DXF_": 29, "PHOTO2DXF_": 46, "PT_PHOTO2DXF_": 29, "LASER_": 33}
for pref, n in EXPECT.items():
    got = sum(1 for k in COPY if k.startswith(pref))
    if got != n:
        sys.exit(f"COPY parse mismatch for {pref}: expected {n}, got {got}")

def fill(tpl):
    for k, v in COPY.items():
        tpl = tpl.replace("\u00ab" + k + "\u00bb", v)
    left = re.findall(r"\u00ab[^\u00bb]+\u00bb", tpl)
    if left:
        sys.exit(f"unfilled tokens: {left[:5]}")
    return tpl

def strip(html):
    t = re.sub(r"<[^>]+>", "", html)
    import html as H
    return H.unescape(re.sub(r"\s+", " ", t))

# ---------- 2. verbatim chrome extraction ----------
png = open(os.path.join(PAGES, "png-to-dxf", "code.html"), encoding="utf-8").read()
ptw = open(os.path.join(PAGES, "pt-webp-para-svg", "code.html"), encoding="utf-8").read()

EN_HEADER = png[png.index('<header class="site-header">'):png.index("</header>") + len("</header>")]
EN_HEADER = EN_HEADER.replace(" navlink--desktop active", " navlink--desktop")  # no nav item active on new pages
EN_FOOTER = png[png.index('<footer class="site-footer">'):png.index("</footer>") + len("</footer>")]
EN_TAIL = png[png.index('<a class="fab-feedback"'):png.index("</body>")]

# footer Converters group +2 (mandated by work order; 06f precedent)
OLD_LI = '<li><a href="../samples/code.html">Samples gallery</a></li>'
NEW_LIS = ('<li><a href="../image-to-dxf/code.html">Image to DXF</a></li>'
           '<li><a href="../photo-to-dxf/code.html">Photo to DXF</a></li>')
assert EN_FOOTER.count(OLD_LI) == 1
EN_FOOTER = EN_FOOTER.replace(OLD_LI, NEW_LIS + OLD_LI)

# scenario page: no on-page converter -> drop the header nav CTA (dead #convert anchor;
# v1.13 §H negative sentinel: 'Convert now — free' must not appear on the content page)
NAV_CTA = '    <a class="btn btn--primary btn--sm nav-cta nav-cta-header" href="#convert">Convert now — free</a>\n'
assert NAV_CTA in EN_HEADER
EN_HEADER_CONTENT = EN_HEADER.replace(NAV_CTA, "")

PT_HEADER = ptw[ptw.index('<header class="site-header">'):ptw.index("</header>") + len("</header>")]
PT_FOOTER = ptw[ptw.index('<footer class="site-footer">'):ptw.index("</footer>") + len("</footer>")]
PT_TAIL = ptw[ptw.index('<a class="fab-feedback"'):ptw.index("</body>")]

def pt_chrome(en_href):
    # v1.13 spec: English version link points to the real EN counterpart
    h = PT_HEADER.replace("../jfif-to-jpg/code.html", en_href)
    f = PT_FOOTER.replace("../jfif-to-jpg/code.html", en_href)
    return h, f

CHIP = '<span class="stat" style="border-color:var(--caution);color:var(--caution);background:var(--caution-soft)">{FORMATS}</span>'
SLIDER_NOTE = "<!-- [PENDING-07-slider] precision slider slot = existing component (v1.10 C4); component verification = 07; v1.12 param panel NOT in this batch -->"

def en_page(route, title_key, desc_key, body):
    head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- {title_key} --><title>{COPY[title_key]}</title>
<!-- {desc_key} --><meta name="description" content="{COPY[desc_key]}">
<link rel="stylesheet" href="../../assets/design-system.css">
<link rel="icon" href="../../assets/logo.svg" type="image/svg+xml">

</head>
<body>
"""
    tail = EN_TAIL.replace('data-page-context="/png-to-dxf"', f'data-page-context="/{route}"')
    header = EN_HEADER_CONTENT if route == "png-to-dxf-for-laser-cutting" else EN_HEADER
    return head + header + "\n<main>\n" + fill(body) + "\n</main>\n" + EN_FOOTER + "\n" + tail + "</body>\n</html>"

def pt_page(route, en_route, title_key, desc_key, body):
    h, f = pt_chrome(f"../{en_route}/code.html")
    head = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- {title_key} --><title>{COPY[title_key]}</title>
<!-- {desc_key} --><meta name="description" content="{COPY[desc_key]}">
<link rel="stylesheet" href="../../assets/design-system.css">
<link rel="icon" href="../../assets/logo.svg" type="image/svg+xml">

</head>
<body>
"""
    tail = PT_TAIL.replace('data-page-context="/pt/webp-para-svg"', f'data-page-context="/{route}"')
    return head + h + "\n<main>\n" + fill(body) + "\n</main>\n" + f + "\n" + tail + "</body>\n</html>"

DZ_ICON = """<svg class="dz-icon" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
<rect x="5" y="9" width="36" height="30" rx="5" fill="#FAF6EE" stroke="#1E2430" stroke-width="2"/>
<path d="M23 31 V17 M17 23 l6-6 6 6" stroke="#E4572E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="35" cy="16" r="2.4" fill="#1F6E5C"/>
</svg>"""

SEG = """<div style="margin-top:16px">
  <div class="seg" role="group" aria-label="DXF version">
    <button aria-pressed="true">R2000 · units included</button>
    <button aria-pressed="false">R12 · compatibility mode</button>
  </div>
  <div class="seg-note">R12 compatibility mode available</div>
</div>"""

# ---------- 3. page bodies ----------
# ===== A-EN /image-to-dxf =====
A_EN_BODY = """
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><!-- IMG2DXF_EYEBROW --><span class="spec">«IMG2DXF_EYEBROW»</span></div>
      <!-- IMG2DXF_H1 --><h1>«IMG2DXF_H1»</h1>
      <!-- IMG2DXF_HERO_SUB --><p class="hero__sub">«IMG2DXF_HERO_SUB»</p>
    </div>
    <div><div class="dropzone matgrid" id="convert">
  """ + DZ_ICON + """
  <!-- IMG2DXF_DZ_TEXT --><div class="dz-text">«IMG2DXF_DZ_TEXT»</div>
  <div class="dz-or">— or —</div>
  <!-- IMG2DXF_DZ_BTN --><button class="btn btn--primary btn--lg" type="button">«IMG2DXF_DZ_BTN»</button>
  <!-- IMG2DXF_DZ_FORMATS [PENDING-07-formats]: {FORMATS} placeholder chip, list NOT locked by copy — 07 backfills from real component accept list -->
  <div class="dz-formats">ACCEPTS: """ + CHIP + """ · PROCESSED LOCALLY</div>
  """ + SEG + """
  <!-- IMG2DXF_MICROCOPY --><div><span class="microcopy">Flat-color graphics → <b>cut-ready</b> · Photos → <b>stylized result</b></span></div>
</div>
<div style="margin-top:14px"><!-- IMG2DXF_BADGES --><div class="badges"><span class="badge">🔒 Files stay on your device</span> · <span class="badge">No account</span> · <span class="badge">No watermark</span> · <span class="badge">10 free conversions a day</span></div></div></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof</span>
    <div class="proof" style="margin-top:20px">
      <!-- IMG2DXF_PROOF --><p class="proof__quote">"«IMG2DXF_PROOF»"</p>
    </div>
    <!-- IMG2DXF_VERIFY --><div class="info-strip" style="margin-top:16px"><span class="i">i</span><span style="font-family:var(--font-mono);font-size:13.5px">«IMG2DXF_VERIFY»</span></div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <!-- IMG2DXF_PROBLEM_H2 --><h2 style="margin-top:12px">«IMG2DXF_PROBLEM_H2»</h2>
    <ul class="plist" style="margin-top:12px">
      <!-- IMG2DXF_PROBLEM_B1 --><li>"«IMG2DXF_PROBLEM_B1»"</li>
      <!-- IMG2DXF_PROBLEM_B2 --><li>"«IMG2DXF_PROBLEM_B2»"</li>
      <!-- IMG2DXF_PROBLEM_B3 --><li>"«IMG2DXF_PROBLEM_B3»"</li>
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The pipeline</span>
    <!-- IMG2DXF_SOLUTION_H2 --><h2 style="margin-top:12px">«IMG2DXF_SOLUTION_H2»</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- IMG2DXF_SOLUTION_S1 --><li><h3>«IMG2DXF_SOLUTION_S1»</h3></li>
      <!-- IMG2DXF_SOLUTION_S2 --><li><h3>«IMG2DXF_SOLUTION_S2»</h3></li>
      <!-- IMG2DXF_SOLUTION_S3 --><li><h3>«IMG2DXF_SOLUTION_S3»</h3></li>
    </ol>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <!-- IMG2DXF_HONEST_H2 --><h2>«IMG2DXF_HONEST_H2»</h2>
    <div class="info-strip" style="margin-top:12px;border-color:var(--caution);background:var(--caution-soft)">
      <span class="i" style="background:var(--caution)">!</span>
      <!-- IMG2DXF_HONEST_P --><span>«IMG2DXF_HONEST_P»</span>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <!-- IMG2DXF_ANYIMAGE_H2 --><h2>«IMG2DXF_ANYIMAGE_H2»</h2>
    <!-- IMG2DXF_ANYIMAGE_P --><p style="margin-top:12px;max-width:62em;color:var(--ink-2)">«IMG2DXF_ANYIMAGE_P»</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <!-- IMG2DXF_CHOOSER_H2 --><h2>«IMG2DXF_CHOOSER_H2»</h2>
    <div class="grid-3" style="margin-top:20px">
      <div class="card"><!-- IMG2DXF_CHOOSER_I1 --><p>Know your file is a PNG? The dedicated <a href="../png-to-dxf/code.html">PNG to DXF converter</a> is tuned around that format.</p></div>
      <div class="card"><!-- IMG2DXF_CHOOSER_I2 --><p>Working from JPGs — especially compressed ones? The <a href="../jpg-to-dxf/code.html">JPG to DXF converter</a> leads with cleanup for noisy files.</p></div>
      <div class="card"><!-- IMG2DXF_CHOOSER_I3 --><p>Starting from a photograph? The <a href="../photo-to-dxf/code.html">photo to DXF converter</a> sets honest expectations for photographic input.</p></div>
      <div class="card"><!-- IMG2DXF_CHOOSER_I4 --><p>Already have vector? Skip tracing entirely with the <a href="../svg-to-dxf-converter/code.html">SVG to DXF converter</a>.</p></div>
      <div class="card" style="border-color:var(--blade);background:var(--blade-soft)"><!-- IMG2DXF_CHOOSER_I5 --><p>«IMG2DXF_CHOOSER_I5»</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <!-- IMG2DXF_SCENES_H2 --><h2>«IMG2DXF_SCENES_H2»</h2>
    <div class="grid-3" style="margin-top:20px">
      <div class="card"><!-- IMG2DXF_SCENES_B1 --><p>«IMG2DXF_SCENES_B1»</p></div>
      <div class="card"><!-- IMG2DXF_SCENES_B2 --><p>«IMG2DXF_SCENES_B2»</p></div>
      <div class="card"><!-- IMG2DXF_SCENES_B3 --><p>«IMG2DXF_SCENES_B3»</p></div>
    </div>
    <!-- IMG2DXF_SCENES_CLOSE --><p style="margin-top:20px;max-width:62em;color:var(--ink-2)">«IMG2DXF_SCENES_CLOSE»</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <!-- IMG2DXF_HOW_H2 --><h2 style="margin-top:12px">«IMG2DXF_HOW_H2»</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- IMG2DXF_HOW_S1 --><li><h3>«IMG2DXF_HOW_S1»</h3></li>
      <li><h3><!-- IMG2DXF_HOW_S2 -->«IMG2DXF_HOW_S2»</h3>""" + SLIDER_NOTE + """</li>
      <!-- IMG2DXF_HOW_S3 --><li><h3>«IMG2DXF_HOW_S3»</h3></li>
    </ol>
    <!-- IMG2DXF_HOW_AUX --><p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">«IMG2DXF_HOW_AUX»</p>
  </div>
</section>
<section class="section--alt" style="padding:40px 0">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <!-- IMG2DXF_PRICING_ANCHOR --><p style="font-size:17.5px;max-width:44em">Free for 10 conversions a day — every feature above included. Heavy day? Pro lifts the cap: <b>$59, one time</b>.</p>
    <a class="btn btn--primary" href="../pricing/code.html">Get CleanPaths Pro — $59, one time</a>
  </div>
</section>
<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px"><div class='faq'>
<details><summary><!-- IMG2DXF_FAQ1_Q -->«IMG2DXF_FAQ1_Q»</summary><div class='a'><!-- IMG2DXF_FAQ1_A -->«IMG2DXF_FAQ1_A»</div></details>
<details><summary><!-- IMG2DXF_FAQ2_Q -->«IMG2DXF_FAQ2_Q»</summary><div class='a'><!-- IMG2DXF_FAQ2_A -->Same engine, same output standard — the dedicated pages are tuned and written around one format each. If you know your format, the <a href="../png-to-dxf/code.html">PNG to DXF</a> or <a href="../jpg-to-dxf/code.html">JPG to DXF</a> page speaks directly to it. If you have a mix of images, or you're just not sure what you're holding, this page is the front door: it takes the common formats and gives them all the same cleanup, tracing and DXF export.</div></details>
<details><summary><!-- IMG2DXF_FAQ3_Q -->«IMG2DXF_FAQ3_Q»</summary><div class='a'><!-- IMG2DXF_FAQ3_A -->«IMG2DXF_FAQ3_A»</div></details>
<details><summary><!-- IMG2DXF_FAQ4_Q -->«IMG2DXF_FAQ4_Q»</summary><div class='a'><!-- IMG2DXF_FAQ4_A -->No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store your images or the files you generate. Close the tab and they're gone; we never had them. This is how the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>.</div></details>
<details><summary><!-- IMG2DXF_FAQ5_Q -->«IMG2DXF_FAQ5_Q»</summary><div class='a'><!-- IMG2DXF_FAQ5_A -->«IMG2DXF_FAQ5_A»</div></details>
</div></div></div></section>
<section class="section section--alt cta-band">
  <div class="wrap">
    <!-- IMG2DXF_FINAL_H2 --><h2>«IMG2DXF_FINAL_H2»</h2>
    <!-- IMG2DXF_FINAL_BTN --><a class="btn btn--primary btn--lg" href="#convert">«IMG2DXF_FINAL_BTN»</a>
  </div>
</section>
"""

# ===== B-EN /photo-to-dxf =====
B_EN_BODY = """
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><!-- PHOTO2DXF_EYEBROW --><span class="spec">«PHOTO2DXF_EYEBROW»</span></div>
      <!-- PHOTO2DXF_H1 --><h1>«PHOTO2DXF_H1»</h1>
      <!-- PHOTO2DXF_HERO_SUB --><p class="hero__sub">«PHOTO2DXF_HERO_SUB»</p>
    </div>
    <div><div class="dropzone matgrid" id="convert">
  """ + DZ_ICON + """
  <!-- PHOTO2DXF_DZ_TEXT --><div class="dz-text">«PHOTO2DXF_DZ_TEXT»</div>
  <div class="dz-or">— or —</div>
  <!-- PHOTO2DXF_DZ_BTN --><button class="btn btn--primary btn--lg" type="button">«PHOTO2DXF_DZ_BTN»</button>
  <!-- PHOTO2DXF_DZ_FORMATS [PENDING-07-formats]: {FORMATS} placeholder chip, list NOT locked by copy — 07 backfills from real component accept list -->
  <div class="dz-formats">ACCEPTS: """ + CHIP + """ · PROCESSED LOCALLY</div>
  """ + SEG + """
  <!-- PHOTO2DXF_MICROCOPY --><div><span class="microcopy">Flat-color graphics → <b>cut-ready</b> · Photos → <b>stylized result</b></span></div>
</div>
<div style="margin-top:14px"><!-- PHOTO2DXF_BADGES --><div class="badges"><span class="badge">🔒 Files stay on your device</span> · <span class="badge">No account</span> · <span class="badge">No watermark</span> · <span class="badge">10 free conversions a day</span></div></div></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof</span>
    <div class="proof" style="margin-top:20px">
      <!-- PHOTO2DXF_PROOF --><p class="proof__quote">"«PHOTO2DXF_PROOF»"</p>
      <div class="ba" style="margin-top:20px">
        <div class="ba__imgs">
          <img src="../../assets/samples/photo-scene_before.png" width="900" height="675" alt="Continuous-tone photo input, sunset scene (synthetic sample)" loading="lazy" decoding="async">
          <img src="../../assets/samples/photo-scene_after.png" width="900" height="675" alt="Posterized color-layer trace output (synthetic sample)" loading="lazy" decoding="async">
        </div>
        <div class="ba__divider"></div><div class="ba__handle">⇔</div>
        <span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span>
        <span class="synth-tag">SYNTHETIC SAMPLE</span>
      </div>
    </div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <!-- PHOTO2DXF_PROBLEM_H2 --><h2 style="margin-top:12px">«PHOTO2DXF_PROBLEM_H2»</h2>
    <ul class="plist" style="margin-top:12px">
      <!-- PHOTO2DXF_PROBLEM_B1 --><li>"«PHOTO2DXF_PROBLEM_B1»"</li>
      <!-- PHOTO2DXF_PROBLEM_B2 --><li>"«PHOTO2DXF_PROBLEM_B2»"</li>
      <!-- PHOTO2DXF_PROBLEM_B3 --><li>"«PHOTO2DXF_PROBLEM_B3»"</li>
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The pipeline</span>
    <!-- PHOTO2DXF_SOLUTION_H2 --><h2 style="margin-top:12px">«PHOTO2DXF_SOLUTION_H2»</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- PHOTO2DXF_SOLUTION_S1 --><li><h3>«PHOTO2DXF_SOLUTION_S1»</h3></li>
      <!-- PHOTO2DXF_SOLUTION_S2 --><li><h3>«PHOTO2DXF_SOLUTION_S2»</h3></li>
      <!-- PHOTO2DXF_SOLUTION_S3 --><li><h3>«PHOTO2DXF_SOLUTION_S3»</h3></li>
    </ol>
  </div>
</section>
<section class="manifesto matgrid">
  <div class="wrap">
    <!-- PHOTO2DXF_HONEST_H2 --><h2>«PHOTO2DXF_HONEST_H2»</h2>
    <!-- PHOTO2DXF_HONEST_P --><p class="lede" style="margin-top:20px">«PHOTO2DXF_HONEST_P»</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <!-- PHOTO2DXF_TIPS_H2 --><h2>«PHOTO2DXF_TIPS_H2»</h2>
    <div class="grid-2" style="margin-top:20px">
      <div class="card"><!-- PHOTO2DXF_TIPS_B1 --><p>«PHOTO2DXF_TIPS_B1»</p></div>
      <div class="card"><!-- PHOTO2DXF_TIPS_B2 --><p>«PHOTO2DXF_TIPS_B2»</p></div>
      <div class="card"><!-- PHOTO2DXF_TIPS_B3 --><p>«PHOTO2DXF_TIPS_B3»</p></div>
      <div class="card"><!-- PHOTO2DXF_TIPS_B4 --><p>«PHOTO2DXF_TIPS_B4»</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <!-- PHOTO2DXF_GRAPHIC_H2 --><h2>«PHOTO2DXF_GRAPHIC_H2»</h2>
    <!-- PHOTO2DXF_GRAPHIC_P --><p style="margin-top:12px;max-width:62em;color:var(--ink-2)">There's a useful difference between a photo OF a graphic and a photo of a scene. A phone shot of a logo, a sign or a printed design has flat colors underneath the camera noise — the cleanup pipeline removes that noise before tracing, and the output is designed to be cut-ready. That's also exactly what our <a href="../jpg-to-dxf/code.html">JPG to DXF converter</a> is built around. A photo of your dog has no flat colors to recover — it becomes posterized art instead. Both are worth doing. They're just different results, and this page tells you which one you're holding.</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <!-- PHOTO2DXF_HOW_H2 --><h2 style="margin-top:12px">«PHOTO2DXF_HOW_H2»</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- PHOTO2DXF_HOW_S1 --><li><h3>«PHOTO2DXF_HOW_S1»</h3></li>
      <!-- PHOTO2DXF_HOW_S2 --><li><h3>«PHOTO2DXF_HOW_S2»</h3></li>
      <!-- PHOTO2DXF_HOW_S3 --><li><h3>«PHOTO2DXF_HOW_S3»</h3></li>
    </ol>
    <!-- PHOTO2DXF_HOW_AUX --><p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">«PHOTO2DXF_HOW_AUX»</p>
  </div>
</section>
<section class="section--alt" style="padding:40px 0">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <!-- PHOTO2DXF_PRICING_ANCHOR --><p style="font-size:17.5px;max-width:44em">Free for 10 conversions a day — every feature above included. Heavy day? Pro lifts the cap: <b>$59, one time</b>.</p>
    <a class="btn btn--primary" href="../pricing/code.html">Get CleanPaths Pro — $59, one time</a>
  </div>
</section>
<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px"><div class='faq'>
<details><summary><!-- PHOTO2DXF_FAQ1_Q -->«PHOTO2DXF_FAQ1_Q»</summary><div class='a'><!-- PHOTO2DXF_FAQ1_A -->«PHOTO2DXF_FAQ1_A»</div></details>
<details><summary><!-- PHOTO2DXF_FAQ2_Q -->«PHOTO2DXF_FAQ2_Q»</summary><div class='a'><!-- PHOTO2DXF_FAQ2_A -->If the photo is of a flat-color graphic — a logo, a sign, a line drawing — the output is designed to be cut-ready, yes. If it's a photograph of a scene or a person, expect stylized poster art: bold shapes that can still cut well as decorative pieces, but not a faithful rendering. Test-cut before production either way. For the full laser workflow — LightBurn import, sizing, R12 decisions — see our <a href="../png-to-dxf-for-laser-cutting/code.html">PNG to DXF for laser cutting guide</a>.</div></details>
<details><summary><!-- PHOTO2DXF_FAQ3_Q -->«PHOTO2DXF_FAQ3_Q»</summary><div class='a'><!-- PHOTO2DXF_FAQ3_A -->«PHOTO2DXF_FAQ3_A»</div></details>
<details><summary><!-- PHOTO2DXF_FAQ4_Q -->«PHOTO2DXF_FAQ4_Q»</summary><div class='a'><!-- PHOTO2DXF_FAQ4_A -->No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store your images or the files you generate. Close the tab and they're gone; we never had them. This is how the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>. Photos are personal — that's exactly why the conversion runs on your device.</div></details>
<details><summary><!-- PHOTO2DXF_FAQ5_Q -->«PHOTO2DXF_FAQ5_Q»</summary><div class='a'><!-- PHOTO2DXF_FAQ5_A -->«PHOTO2DXF_FAQ5_A»</div></details>
</div></div></div></section>
<section class="section section--alt cta-band">
  <div class="wrap">
    <!-- PHOTO2DXF_FINAL_H2 --><h2>«PHOTO2DXF_FINAL_H2»</h2>
    <!-- PHOTO2DXF_FINAL_BTN --><a class="btn btn--primary btn--lg" href="#convert">«PHOTO2DXF_FINAL_BTN»</a>
  </div>
</section>
"""

# ===== C /png-to-dxf-for-laser-cutting (EN-only content page) =====
C_BODY = """
<section class="section" style="padding-top:64px">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Guide</span>
    <!-- LASER_H1 --><h1 style="margin-top:12px">«LASER_H1»</h1>
    <!-- LASER_INTRO --><p style="margin-top:16px;color:var(--ink-2);font-size:17px">«LASER_INTRO»</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Workflow</span>
    <!-- LASER_FLOW_H2 --><h2 style="margin-top:12px">«LASER_FLOW_H2»</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- LASER_FLOW_S1 --><li><h3>Convert your PNG to DXF — the <a href="../png-to-dxf/code.html">PNG to DXF converter</a> runs in your browser: it cleans the image, traces with parameters tuned to the image, and shows a layer preview before anything downloads.</h3></li>
      <!-- LASER_FLOW_S2 --><li><h3>«LASER_FLOW_S2»</h3></li>
      <!-- LASER_FLOW_S3 --><li><h3>«LASER_FLOW_S3»</h3></li>
      <!-- LASER_FLOW_S4 --><li><h3>«LASER_FLOW_S4»</h3></li>
      <!-- LASER_FLOW_S5 --><li><h3>«LASER_FLOW_S5»</h3></li>
    </ol>
  </div>
</section>
<section class="section">
  <div class="wrap" style="max-width:820px">
    <!-- LASER_R12_H2 --><h2>«LASER_R12_H2»</h2>
    <div class="info-strip" style="margin-top:12px"><span class="i">i</span><!-- LASER_R12_P --><span>«LASER_R12_P»</span></div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <!-- LASER_SCENES_H2 --><h2>«LASER_SCENES_H2»</h2>
    <div class="grid-2" style="margin-top:20px">
      <div class="card"><!-- LASER_SCENES_B1 --><p>«LASER_SCENES_B1»</p></div>
      <div class="card"><!-- LASER_SCENES_B2 --><p>«LASER_SCENES_B2»</p></div>
      <div class="card"><!-- LASER_SCENES_B3 --><p>«LASER_SCENES_B3»</p></div>
      <div class="card"><!-- LASER_SCENES_B4 --><p>«LASER_SCENES_B4»</p></div>
    </div>
    <!-- LASER_SCENES_CLOSE --><p style="margin-top:20px;max-width:62em;color:var(--ink-2)">«LASER_SCENES_CLOSE»</p>
  </div>
</section>
<section class="section">
  <div class="wrap" style="max-width:820px">
    <!-- LASER_QUALITY_H2 --><h2>«LASER_QUALITY_H2»</h2>
    <!-- LASER_QUALITY_P --><p style="margin-top:12px;color:var(--ink-2)">A raw auto-trace produces thousands of tiny segments and open paths — and the laser head follows all of them, so a dirty file shows up as rough edges, longer cut times and double-cut lines. A converter built for cutting earns its keep exactly here: denoise before tracing, closed paths only, layers separated by color, no overlapping lines. You can verify the output yourself: open the downloaded .dxf in any text editor and search for "SPLINE" — you won't find one, because strict CAM software chokes on SPLINE entities and CleanPaths never writes them. And if a DXF ever arrives bloated with nodes, opens at the wrong size, or won't open in LightBurn at all, <a href="../png-to-dxf/code.html">the PNG to DXF FAQ</a> walks through each of those fixes — they're usually one export setting away.</p>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <!-- [PENDING-07-embed] tool-embed placeholder: if 06/07 rule to embed the converter component, mount the dropzone at this card slot and attach §0.2 badges + §0.3 microcopy per 05 v1.13 §E-3. Current ruling = placeholder structure, CTA first. -->
    <div class="card" data-pending="07-embed" style="text-align:center;padding:40px 28px">
      <!-- LASER_CTA_H2 --><h2>«LASER_CTA_H2»</h2>
      <!-- LASER_CTA_P --><p style="margin:12px auto 20px;max-width:44em;color:var(--ink-2)">«LASER_CTA_P»</p>
      <!-- LASER_CTA_BTN --><a class="btn btn--primary btn--lg" href="../png-to-dxf/code.html">«LASER_CTA_BTN»</a>
    </div>
  </div>
</section>
<section class="section"><div class="wrap" style="max-width:820px"><span class="spec">FAQ</span><div style="margin-top:12px"><div class='faq'>
<details><summary><!-- LASER_FAQ1_Q -->«LASER_FAQ1_Q»</summary><div class='a'><!-- LASER_FAQ1_A -->Drop the PNG into the <a href="../png-to-dxf/code.html">PNG to DXF converter</a>, check the layer preview, and download the default R2000 DXF — units are embedded, so it imports into LightBurn at real size. Choose R12 compatibility mode only for older CAM that rejects newer DXF revisions. Then assign your color layers to operations and run a test cut before production. The whole conversion runs in your browser — nothing is uploaded.</div></details>
<details><summary><!-- LASER_FAQ2_Q -->«LASER_FAQ2_Q»</summary><div class='a'><!-- LASER_FAQ2_A -->«LASER_FAQ2_A»</div></details>
<details><summary><!-- LASER_FAQ3_Q -->«LASER_FAQ3_Q»</summary><div class='a'><!-- LASER_FAQ3_A -->Yes — the only real difference is that JPGs carry compression noise, so the cleanup step matters more. The <a href="../jpg-to-dxf/code.html">JPG to DXF converter</a> leads with that cleanup for exactly this reason. Everything after the conversion — R2000 export, LightBurn import, size verification, test cut — is identical to the workflow on this page.</div></details>
<details><summary><!-- LASER_FAQ4_Q -->«LASER_FAQ4_Q»</summary><div class='a'><!-- LASER_FAQ4_A -->Export with the default R2000 — it embeds units, so LightBurn reads the real dimensions straight from the file. After import, check the width and height fields against the size you actually want to cut, and scale in LightBurn if you need to. If a DXF ever lands at the wrong size, the cause is almost always an R12 file with no unit field — <a href="../png-to-dxf/code.html">the PNG to DXF FAQ</a> covers that fix, so we won't repeat it here.</div></details>
<details><summary><!-- LASER_FAQ5_Q -->«LASER_FAQ5_Q»</summary><div class='a'><!-- LASER_FAQ5_A -->«LASER_FAQ5_A»</div></details>
</div></div></div></section>
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>«LASER_CTA_H2»</h2>
    <p style="margin:0 auto 20px;max-width:44em;color:var(--ink-2)">«LASER_CTA_P»</p>
    <a class="btn btn--primary btn--lg" href="../png-to-dxf/code.html">«LASER_CTA_BTN»</a>
  </div>
</section>
"""

# ===== PT pages (mirror /pt/webp-para-svg light skeleton; slot order per v1.13 §A-2/§B-2) =====
PT_BODY_TMPL = """
<section class="hero matgrid">
  <div class="wrap" style="max-width:820px">
    <div class="hero__eyebrow"><!-- {P}_EYEBROW --><span class="spec">«{P}_EYEBROW»</span></div>
    <!-- {P}_H1 --><h1>«{P}_H1»</h1>
    <!-- {P}_HERO_SUB --><p class="hero__sub">«{P}_HERO_SUB»</p>
    <div style="margin-top:32px">
      <div class="dropzone matgrid" id="convert">
        """ + DZ_ICON + """
        <!-- {P}_DZ_TEXT --><div class="dz-text">«{P}_DZ_TEXT»</div>
        <div class="dz-or">— ou —</div>
        <!-- {P}_DZ_BTN --><button class="btn btn--primary btn--lg" type="button">«{P}_DZ_BTN»</button>
        <!-- {P}_DZ_FORMATS [PENDING-07-formats]: {FORMATS} placeholder chip — 07 backfills from real component accept list -->
        <div class="dz-formats">ACEITA: """ + CHIP + """ · PROCESSADO LOCALMENTE</div>
        <div style="margin-top:12px"><!-- {P}_MICROCOPY --><span class="microcopy">Gráficos de cores chapadas → <b>pronto para corte</b> · Fotos → <b>resultado estilizado</b></span></div>
      </div>
      <div style="margin-top:14px"><!-- {P}_BADGES --><div class="badges"><span class="badge">🔒 Seus arquivos não saem do seu dispositivo</span> · <span class="badge">Sem cadastro</span> · <span class="badge">Sem marca d'água</span></div></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Explicação</span>
    <!-- {P}_EXPLAINER_H2 --><h2 style="margin-top:12px">«{P}_EXPLAINER_H2»</h2>
    <!-- {P}_EXPLAINER_P --><p style="color:var(--ink-2);max-width:62em">«{P}_EXPLAINER_P»</p>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap" style="max-width:820px">
    <!-- {P}_HONEST_H2 --><h2>«{P}_HONEST_H2»</h2>
    <div class="info-strip" style="border-color:var(--caution);background:var(--caution-soft)">
      <span class="i" style="background:var(--caution)">!</span>
      <!-- {P}_HONEST_P --><span>«{P}_HONEST_P»</span>
    </div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Passo a passo</span>
    <!-- {P}_STEPS_H2 --><h2 style="margin-top:12px">«{P}_STEPS_H2»</h2>
    <ol class="steps" style="margin-top:20px">
      <!-- {P}_STEPS_S1 --><li><h3>«{P}_STEPS_S1»</h3></li>
      <!-- {P}_STEPS_S2 --><li><h3>«{P}_STEPS_S2»</h3></li>
      <!-- {P}_STEPS_S3 --><li><h3>«{P}_STEPS_S3»</h3></li>
    </ol>
    <!-- {P}_STEPS_AUX --><p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">«{P}_STEPS_AUX»</p>
  </div>
</section>
<section class="section"><div class="wrap" style="max-width:820px"><span class="spec">FAQ</span><div style="margin-top:12px"><div class='faq'>
<details><summary><!-- {P}_FAQ1_Q -->«{P}_FAQ1_Q»</summary><div class='a'><!-- {P}_FAQ1_A -->«{P}_FAQ1_A»</div></details>
<details><summary><!-- {P}_FAQ2_Q -->«{P}_FAQ2_Q»</summary><div class='a'><!-- {P}_FAQ2_A -->«{P}_FAQ2_A»</div></details>
<details><summary><!-- {P}_FAQ3_Q -->«{P}_FAQ3_Q»</summary><div class='a'><!-- {P}_FAQ3_A -->Não. A conversão acontece inteiramente no seu navegador — não existe etapa de upload. Nós não recebemos, não vemos e não armazenamos suas imagens. É assim que a ferramenta é construída, não é só uma frase de marketing. Detalhes na <a href="../privacy/code.html">Política de Privacidade</a>.</div></details>
<details><summary><!-- {P}_FAQ4_Q -->«{P}_FAQ4_Q»</summary><div class='a'><!-- {P}_FAQ4_A -->«{P}_FAQ4_A»</div></details>
</div></div></div></section>
<section class="section section--alt cta-band">
  <div class="wrap">
    <!-- {P}_FINAL_BTN --><a class="btn btn--primary btn--lg" href="#convert">«{P}_FINAL_BTN»</a>
  </div>
</section>
"""

# ---------- 4. write pages ----------
def write_page(route, content):
    d = os.path.join(PAGES, route)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "code.html"), "w", encoding="utf-8") as f:
        f.write(content)

write_page("image-to-dxf", en_page("image-to-dxf", "IMG2DXF_META_TITLE", "IMG2DXF_META_DESC", A_EN_BODY))
write_page("photo-to-dxf", en_page("photo-to-dxf", "PHOTO2DXF_META_TITLE", "PHOTO2DXF_META_DESC", B_EN_BODY))
write_page("png-to-dxf-for-laser-cutting", en_page("png-to-dxf-for-laser-cutting", "LASER_META_TITLE", "LASER_META_DESC", C_BODY))

for route, en_route, pref in (("pt-imagem-para-dxf", "image-to-dxf", "PT_IMG2DXF"),
                              ("pt-foto-para-dxf", "photo-to-dxf", "PT_PHOTO2DXF")):
    body = PT_BODY_TMPL.replace("{P}", pref)
    # {FORMATS} chip marker inside comment got prefix-substituted guard: restore literal
    write_page(route, pt_page(route, en_route, pref + "_META_TITLE", pref + "_META_DESC", body))

# ---------- 5. states boards ----------
en_states_tpl = open(os.path.join(PAGES, "png-to-dxf", "states.html"), encoding="utf-8").read()
pt_states_tpl = open(os.path.join(PAGES, "pt-webp-para-svg", "states.html"), encoding="utf-8").read()

def en_states(route):
    s = en_states_tpl
    s = s.replace("States — /png-to-dxf", f"States — /{route}")
    s = s.replace("State board · /png-to-dxf", f"State board · /{route}")
    s = s.replace("/png-to-dxf — upload component states", f"/{route} — upload component states")
    s = s.replace("for <b>/png-to-dxf</b>", f"for <b>/{route}</b>")
    # [PENDING-07-formats] placeholder carries
    s = s.replace('<div class="dz-formats">ACCEPTS: .PNG · PROCESSED LOCALLY</div>',
                  '<div class="dz-formats">ACCEPTS: ' + CHIP + ' · PROCESSED LOCALLY</div>')
    s = s.replace("<b>That file can't be converted here.</b> This page accepts .PNG. Nothing was uploaded, so nothing was stored.",
                  "<b>That file can't be converted here.</b> This page accepts " + CHIP + ". Nothing was uploaded, so nothing was stored.")
    s = s.replace('<label class="spec" style="margin-bottom:6px">Precision</label>',
                  SLIDER_NOTE + '\n    <label class="spec" style="margin-bottom:6px">Precision</label>')
    return s

PT_DL = ('<div class="dl-row">\n'
         '<button class="btn btn--primary" type="button">Baixar DXF (R2000)</button>\n'
         '<button class="btn" type="button">Baixar DXF (R12)</button>\n'
         '<button class="btn btn--ghost" type="button">Baixar SVG</button></div>')

def pt_states(route, dz_text):
    s = pt_states_tpl
    s = s.replace("States — /pt/webp-para-svg", f"States — /{route}")
    s = s.replace("State board · /pt/webp-para-svg", f"State board · /{route}")
    s = s.replace("/pt/webp-para-svg — upload component states", f"/{route} — upload component states")
    s = s.replace("for <b>/pt/webp-para-svg</b>", f"for <b>/{route}</b>")
    s = s.replace("Arraste seu arquivo .webp aqui — ou clique para escolher", dz_text)
    s = s.replace('<div class="dz-formats">ACCEPTS: .WEBP · PROCESSED LOCALLY</div>',
                  '<div class="dz-formats">ACEITA: ' + CHIP + ' · PROCESSADO LOCALMENTE</div>')
    s = s.replace('<div class="dl-row"><button class="btn btn--primary" type="button">Baixar SVG</button></div>', PT_DL)
    s = s.replace("Esta página aceita .WEBP.", "Esta página aceita " + CHIP + ".")
    s = s.replace('<label class="spec" style="margin-bottom:6px">Precision</label>',
                  SLIDER_NOTE + '\n    <label class="spec" style="margin-bottom:6px">Precision</label>')
    return s

def write_states(route, content):
    with open(os.path.join(PAGES, route, "states.html"), "w", encoding="utf-8") as f:
        f.write(content)

write_states("image-to-dxf", en_states("image-to-dxf"))
write_states("photo-to-dxf", en_states("photo-to-dxf"))
write_states("pt-imagem-para-dxf", pt_states("pt-imagem-para-dxf", COPY["PT_IMG2DXF_DZ_TEXT"]))
write_states("pt-foto-para-dxf", pt_states("pt-foto-para-dxf", COPY["PT_PHOTO2DXF_DZ_TEXT"]))

# ---------- 6. footer patch on the 20 existing EN pages ----------
NEW_PAGES = {"image-to-dxf", "photo-to-dxf", "png-to-dxf-for-laser-cutting",
             "pt-imagem-para-dxf", "pt-foto-para-dxf"}
patched = []
for d in sorted(os.listdir(PAGES)):
    if d in NEW_PAGES or d.startswith("pt-"):
        continue
    p = os.path.join(PAGES, d, "code.html")
    if not os.path.exists(p):
        continue
    src = open(p, encoding="utf-8").read()
    if "Converters" not in src:
        continue
    if src.count(OLD_LI) != 1:
        sys.exit(f"footer patch anchor not unique in {d}: {src.count(OLD_LI)}")
    if NEW_LIS in src:
        continue
    open(p, "w", encoding="utf-8").write(src.replace(OLD_LI, NEW_LIS + OLD_LI))
    patched.append(d)

# ---------- 7. verbatim self-check (beyond §H sentinels) ----------
def page_text(route):
    return strip(open(os.path.join(PAGES, route, "code.html"), encoding="utf-8").read())

CHECKS = {
    "image-to-dxf": [k for k in COPY if k.startswith("IMG2DXF_")],
    "photo-to-dxf": [k for k in COPY if k.startswith("PHOTO2DXF_")],
    "png-to-dxf-for-laser-cutting": [k for k in COPY if k.startswith("LASER_")],
    "pt-imagem-para-dxf": [k for k in COPY if k.startswith("PT_IMG2DXF_")],
    "pt-foto-para-dxf": [k for k in COPY if k.startswith("PT_PHOTO2DXF_")],
}
# keys whose frozen text is NOT expected to appear visibly: meta desc lives in <head> attribute
ATTR_ONLY = {"IMG2DXF_META_DESC", "PHOTO2DXF_META_DESC", "LASER_META_DESC",
             "PT_IMG2DXF_META_DESC", "PT_PHOTO2DXF_META_DESC"}
# dz-formats: frozen string carries {FORMATS} which the page renders as a caution chip (same literal text)
miss = []
for route, keys in CHECKS.items():
    t = page_text(route)
    raw = open(os.path.join(PAGES, route, "code.html"), encoding="utf-8").read()
    for k in keys:
        v = COPY[k]
        if k in ATTR_ONLY:
            if v not in raw:
                miss.append(f"{route}: {k} (attr) missing")
            continue
        if k.endswith("DZ_FORMATS"):
            continue  # rendered with chip span; strip-contiguous, checked below
        if k.endswith("_FOOTER"):
            continue  # footer trust line — PT pages reuse §3 pattern line, links differ per spec
        if v not in t:
            miss.append(f"{route}: {k} missing: {v[:70]}")
# dz-formats strip-contiguous check
for route, key in (("image-to-dxf", "IMG2DXF_DZ_FORMATS"), ("photo-to-dxf", "PHOTO2DXF_DZ_FORMATS"),
                   ("pt-imagem-para-dxf", "PT_IMG2DXF_DZ_FORMATS"), ("pt-foto-para-dxf", "PT_PHOTO2DXF_DZ_FORMATS")):
    if COPY[key] not in page_text(route):
        miss.append(f"{route}: {key} chip text not strip-contiguous")
# PT footer trust line
for route in ("pt-imagem-para-dxf", "pt-foto-para-dxf"):
    if "🔒 Seus arquivos nunca saem do seu dispositivo · Sem cadastro" not in page_text(route):
        miss.append(f"{route}: PT footer trust line missing")
if miss:
    print("\n".join(miss))
    sys.exit(f"{len(miss)} verbatim self-check FAILURES")

print(f"PAGES WRITTEN: 5 code.html + 4 states.html")
print(f"FOOTER PATCHED ({len(patched)}): {', '.join(patched)}")
print("VERBATIM SELF-CHECK: PASS (190 slots)")

