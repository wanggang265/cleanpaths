#!/usr/bin/env python3
"""Home page (/) — copy verbatim from 05-copy-freeze-v1.md §0/§1.1."""
from components import *
from states_common import _cap_state, share_block, feedback_fab_states, feedback_modal_states

def faq_std_answer():
    return ('No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store '
            'your images or the files you generate. Close the tab and they\'re gone; we never had them. This is how '
            'the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>.')

def build():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><span class="spec">PNG · JPG · SVG → DXF / SVG · in your browser</span></div>
      <h1>Convert PNG, JPG, SVG to Cut-Ready DXF — Free, in Your Browser</h1>
      <p class="hero__sub">CleanPaths turns flat-color graphics into clean, closed-path cut files — with real DXF export — processed entirely on your device. No upload, no account, no watermark.</p>
      <p style="margin-top:16px;font-size:15px;color:var(--ink-2);max-width:34em">Conversion runs 100% in your browser. There is no upload step — your files never leave your device. Close the tab and they're gone; we never had them.</p>
    </div>
    <div>
      {dropzone()}
    </div>
  </div>
</section>"""

    proof = f"""
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof — in our tests</span>
    <div class="proof" style="margin-top:20px">
      <div>
        <p class="proof__quote">"In our tests, a heavily compressed logo that default auto-tracing explodes into <span class="hl">88 messy color layers</span> comes out with <span class="hl">as few as 9</span> — closed paths, color-separated, no overlapping lines."</p>
        <div class="stats" style="margin-top:16px">
          <span class="stat">BEFORE <b>88 color layers</b></span>
          <span class="stat">AFTER <b>9 color layers</b></span>
          <span class="stat">CLOSED PATHS <b>✓</b></span>
        </div>
        <p style="margin-top:18px;font-size:15.5px;color:var(--ink-2)">DXF output, cut-ready preprocessing, R12 &amp; R2000 dual export — what free SVG-only tracers don't do.</p>
      </div>
      <div class="ba">
        <div class="ba__imgs">
          <img src="../../assets/samples/logo-acme_before.png" alt="Heavily compressed 150px logo JPG (synthetic sample)">
          <img src="../../assets/samples/logo-acme_after.png" alt="Same logo after CleanPaths conversion: 9 clean color layers (synthetic sample)">
        </div>
        <div class="ba__divider"></div>
        <div class="ba__handle">⇔</div>
        <span class="ba__tag ba__tag--before">BEFORE</span>
        <span class="ba__tag ba__tag--after">AFTER</span>
      </div>
    </div>
  </div>
</section>"""

    featured = f"""
<section class="section--alt featured-strip" style="padding:48px 0">
  <div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:12px;margin-bottom:20px">
      <span class="spec spec--mat">Featured examples</span>
      <a href="{href('/samples')}">See all before / after →</a>
    </div>
    <div class="grid-3">
      <a class="card" style="text-decoration:none" href="{href('/samples')}#logos">
        <div class="ba"><div class="ba__imgs"><img src="../../assets/samples/logo-acme_before.png" alt="150px logo JPG (synthetic sample)"><img src="../../assets/samples/logo-acme_after.png" alt="9-layer cut file output (synthetic sample)"></div><div class="ba__divider"></div><span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span><span class="synth-tag">SYNTHETIC SAMPLE</span></div>
        <p class="cap-line" style="margin-top:10px">150px compressed JPG → 9 color layers</p>
      </a>
      <a class="card" style="text-decoration:none" href="{href('/samples')}#screenshots">
        <div class="ba"><div class="ba__imgs"><img src="../../assets/samples/ui-dashboard_before.png" alt="UI screenshot (synthetic sample)"><img src="../../assets/samples/ui-dashboard_after.png" alt="recolor-ready layers (synthetic sample)"></div><div class="ba__divider"></div><span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span><span class="synth-tag">SYNTHETIC SAMPLE</span></div>
        <p class="cap-line" style="margin-top:10px">Dashboard screenshot → recolor-ready layers</p>
      </a>
      <a class="card" style="text-decoration:none" href="{href('/samples')}#lineart">
        <div class="ba"><div class="ba__imgs"><img src="../../assets/samples/line-flower_before.png" alt="scanned sketch (synthetic sample)"><img src="../../assets/samples/line-flower_after.png" alt="closed cut paths (synthetic sample)"></div><div class="ba__divider"></div><span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span><span class="synth-tag">SYNTHETIC SAMPLE</span></div>
        <p class="cap-line" style="margin-top:10px">Scanned sketch → closed cut paths</p>
      </a>
    </div>
  </div>
</section>"""

    problem = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <h2 style="margin-top:12px">Client images arrive broken</h2>
    <div class="grid-3" style="margin-top:8px">
      <div class="card card--flat"><ul class="plist"><li>"A customer sends you a 150px JPG of their logo and expects a cut file by Friday."</li></ul></div>
      <div class="card card--flat"><ul class="plist"><li>"Inkscape can fix it — after you learn Inkscape."</li></ul></div>
      <div class="card card--flat"><ul class="plist"><li>"Generic auto-tracers hand you a vector, not a cut file: dozens of tangled layers, open paths, no units."</li></ul></div>
    </div>
  </div>
</section>"""

    solution = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The difference</span>
    <h2 style="margin-top:12px">Built for cut-ready, not just vector</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Output is the cut file.</h3><p>Real DXF in two versions — R2000 with units, R12 compatibility mode — plus SVG. Closed paths, no overlapping lines, layers separated by color.</p></li>
      <li><h3>A preprocessing pipeline for bad images.</h3><p>Upscale, denoise and auto-tuned tracing in one pass — replacing the Upscayl→Inkscape two-step workaround.</p></li>
      <li><h3>Honest about limits.</h3><p>Flat-color graphics are designed to come out cut-ready. Photos come out stylized. We tell you before you upload, not after you pay.</p></li>
    </ol>
  </div>
</section>"""

    how = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">Three steps. No sign-up.</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your image.</h3></li>
      <li><h3>Preview the traced layers and adjust precision if you like.</h3></li>
      <li><h3>Download your DXF or SVG.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">That's the whole flow. No account, no watermark, and your file never left your device.</p>
  </div>
</section>"""

    toolbox = f"""
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">All converters</span>
    <div class="grid-3" style="margin-top:16px">
      <a class="card" style="text-decoration:none" href="{href('/png-to-dxf')}"><span class="spec">PNG → DXF</span><h3 style="margin-top:10px;font-size:18px">PNG to DXF Converter — Cut-Ready Output</h3></a>
      <a class="card" style="text-decoration:none" href="{href('/jpg-to-dxf')}"><span class="spec">JPG → DXF</span><h3 style="margin-top:10px;font-size:18px">JPG to DXF — Turn Client Photos of Logos into Cut Files</h3></a>
      <a class="card" style="text-decoration:none" href="{href('/svg-to-dxf-converter')}"><span class="spec">SVG → DXF</span><h3 style="margin-top:10px;font-size:18px">SVG to DXF Converter — R12 &amp; R2000, Units Included</h3></a>
      <a class="card" style="text-decoration:none" href="{href('/screenshot-to-svg')}"><span class="spec">Screenshot → SVG</span><h3 style="margin-top:10px;font-size:18px">Screenshot to SVG — Clean Vector from Any UI Screenshot</h3></a>
      <a class="card" style="text-decoration:none" href="{href('/jfif-to-jpg')}"><span class="spec">JFIF → JPG</span><h3 style="margin-top:10px;font-size:18px">JFIF to JPG Converter — Free, No Upload</h3></a>
      <a class="card" style="text-decoration:none" href="{href('/samples')}"><span class="spec">Evidence</span><h3 style="margin-top:10px;font-size:18px">See the Difference: Before / After</h3></a>
    </div>
  </div>
</section>"""

    personas = f"""
<section class="section">
  <div class="wrap">
    <span class="spec">Who it's for</span>
    <h2 style="margin-top:12px">Made for makers who ship</h2>
    <div class="grid-2" style="margin-top:16px">
      <div class="card persona persona--cricut">
        <span class="spec">For Cricut sellers</span>
        <h3>Client mess in, cut-ready file out. Keep the order moving.</h3>
        <a class="btn btn--ghost" href="{href('/for/cricut-sellers')}">See how sellers use it →</a>
      </div>
      <div class="card persona">
        <span class="spec spec--mat">For embroidery machine owners</span>
        <h3>Honest prep for digitizing — and a human digitizer when you need one.</h3>
        <a class="btn btn--ghost" href="{href('/for/embroidery')}">See embroidery prep →</a>
      </div>
    </div>
  </div>
</section>"""

    pricing_anchor = f"""
<section class="section--alt" style="padding:40px 0">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <p style="font-size:17.5px;max-width:44em">Free for 10 conversions a day — full quality, no watermark. Need more? CleanPaths Pro is <b>$59, one time</b>. No subscriptions. 30-day money-back guarantee.</p>
    <a class="btn" href="{href('/pricing')}">See pricing →</a>
  </div>
</section>"""

    faq_items = [
        ("Do you upload or store my files?", faq_std_answer()),
        ('What does "cut-ready" actually mean here?',
         "Closed paths, no overlapping lines, layers separated by color, and DXF files with units embedded — the things buyers check before they pay for a cut file. It applies to flat-color graphics: logos, icons, screenshots, line art."),
        ("Will it work on a photo of my dog?",
         "It will convert — but the result is a stylized, posterized graphic, not a cut-ready file. That's an honest limit of auto-tracing photos, and we'd rather say it here than in a refund email."),
        ("Why won't my SVG upload to Cricut Design Space?",
         "Usually one of three reasons: the file is a fake SVG (a bitmap image wrapped in SVG tags), it uses features Design Space can't read, or it's corrupted. CleanPaths outputs true vector paths only — no embedded bitmaps — so files import cleanly. More on our <a href=\"../for-cricut-sellers/code.html\">Cricut sellers page</a>."),
        ("Why does my SVG show up as a black box in Cricut?",
         "A black box almost always means the 'SVG' is actually a raster image in an SVG wrapper, or the fill/stroke settings confuse the importer. Open the file in a text editor and look for an <code>&lt;image&gt;</code> tag — if you see one, it's not real vector. CleanPaths output contains vector paths only, so there's nothing to go black."),
        ("Is this a free SVG design library?",
         "No. It's built for makers who need to convert their own images into cut-ready files, not for downloading ready-made designs."),
        ("Do you offer an API or bulk service?",
         "An API is on the roadmap, not in the product today. If you need it, leave your email via the feedback form and we'll notify you when it ships."),
        ("What's the catch with the free tier?",
         "No catch: 10 conversions a day, full output quality, no watermark, no account. If your shop needs more, Pro removes the daily cap for $59 — one time, no subscriptions."),
    ]
    faq_sec = f"""
<section class="section">
  <div class="wrap">
    <span class="spec">FAQ</span>
    <div style="margin-top:12px">{faq(faq_items, "Questions makers actually ask")}</div>
  </div>
</section>"""

    final_cta = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>Your next client image doesn't have to cost you an evening.</h2>
    <a class="btn btn--primary btn--lg" href="#convert">Convert free now</a>
    <p class="sub">No account · No watermark · Files stay on your device</p>
  </div>
</section>"""

    body = hero + proof + featured + problem + solution + how + toolbox + personas + pricing_anchor + faq_sec + final_cta
    return page(
        "PNG, JPG, SVG to Cut-Ready DXF — Free | CleanPaths",
        "Turn logos, screenshots and line art into cut-ready DXF/SVG files — in your browser. No upload, no account, no watermark.",
        body, active_route="/")

def build_states():
    result_panel = """
<div class="dropzone" style="border-style:solid;border-color:var(--mat)">
  <div class="result">
    <div class="panel">
      <div class="cap">INPUT · logo-final-v2.jpg · 150px</div>
      <img src="../../assets/samples/logo-acme_before.png" alt="input preview" style="aspect-ratio:4/3;object-fit:cover">
    </div>
    <div class="panel">
      <div class="cap">OUTPUT PREVIEW · 9 color layers</div>
      <img src="../../assets/samples/logo-acme_after.png" alt="output preview" style="aspect-ratio:4/3;object-fit:cover">
    </div>
  </div>
  <ul class="layers" style="margin-top:14px;background:var(--paper);border:1.5px solid var(--line);border-radius:6px">
    <li><span class="sw" style="background:#1F4E79"></span>layer-1 · #1F4E79 · closed</li>
    <li><span class="sw" style="background:#F08F1C"></span>layer-2 · #F08F1C · closed</li>
    <li><span class="sw" style="background:#FFFFFF"></span>layer-3 · #FFFFFF · closed</li>
    <li style="color:var(--ink-3)">… 6 more layers, all closed paths</li>
  </ul>
  <div style="margin-top:14px;text-align:left">
    <label class="spec" style="margin-bottom:6px">Precision</label>
    <input type="range" min="1" max="10" value="6" style="width:100%;accent-color:#E4572E" aria-label="Precision">
  </div>
  <div class="dl-row">
    <button class="btn btn--primary" type="button">Download DXF (R2000)</button>
    <button class="btn" type="button">Download DXF (R12)</button>
    <button class="btn btn--ghost" type="button">Download SVG</button>
  </div>
  """ + share_block("en") + """
</div>
<div style="margin-top:16px">""" + feedback_block("result") + "</div>"

    blocks = [
        state_block("STATE 2 · drag-over", """
<div class="dropzone is-dragover matgrid">
  """ + UPLOAD_ICON + """
  <div class="dz-text">Drop a PNG, JPG or SVG here — or browse</div>
  <div class="dz-or">RELEASE TO START</div>
  <button class="btn btn--primary btn--lg" type="button">Convert now — free</button>
  <div class="dz-formats">ACCEPTS: .PNG, .JPG, .SVG · PROCESSED LOCALLY</div>
</div>"""),
        state_block("STATE 3 · processing", """
<div class="dropzone proc">
  <div class="dz-text">Converting — on your device, nothing uploaded</div>
  <div class="bar-outer"><div class="bar-inner"></div></div>
  <div class="steps-mini">
    <span class="done">✓ Reading image (local)</span>
    <span class="done">✓ Denoise + upscale</span>
    <span class="now">▸ Tracing paths — auto-tuned parameters</span>
    <span>○ Building DXF (R2000, units embedded)</span>
  </div>
</div>"""),
        state_block("STATE 4 · result (download) + feedback form [Amend A001]", result_panel),
        state_block("STATE 5 · error (unsupported file)", """
<div class="dropzone">
  <div class="state-note state-note--error"><b>!</b><span><b>That file can't be converted.</b> This tool accepts PNG, JPG and SVG. If your image is a HEIC or WEBP, export it as JPG or PNG first and drop it back in — nothing was uploaded, so nothing was stored.</span></div>
  <div style="margin-top:14px"><button class="btn" type="button">Choose another file</button></div>
</div>"""),
        state_block("STATE 6 · daily cap reached — 05 §11.2 frozen copy", _cap_state("en")),
        state_block("STATE 7 · Pro-locked feature (AI HD rescue) — permission state", """
<div class="dropzone" style="text-align:left">
  <label class="switch"><span class="track"></span>AI HD rescue <span class="try-badge">2 / 3 FREE TRIES LEFT</span></label>
  <p style="margin-top:10px;font-size:14px;color:var(--ink-2)">An optional AI upscaler that runs on your device's GPU (no upload) for heavily degraded images. Free tier includes 3 tries; Pro includes it with no per-use limit.</p>
</div>"""),
        state_block("STATE 8 · Pro active (license verified, offline-capable)", """
<div class="dropzone">
  <div class="badges" style="justify-content:center"><span class="badge"><b>✓ PRO ACTIVE</b></span><span class="badge badge--soft">no daily cap</span><span class="badge badge--soft">works offline after activation</span></div>
</div>"""),
        state_block("STATE 9 · feedback submitted (success)", feedback_ok()),
        state_block("STATE 10 · feedback FAB — 4 states (06c-A1)", feedback_fab_states("en")),
        state_block("STATE 11 · feedback modal — 4 states (06c-A2)", feedback_modal_states("en")),
    ]
    return states_page("Home — upload component states", "/", "".join(blocks))
