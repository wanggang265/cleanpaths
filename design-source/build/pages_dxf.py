#!/usr/bin/env python3
"""DXF tool pages: /png-to-dxf, /jpg-to-dxf, /svg-to-dxf-converter.
Copy verbatim from 05-copy-freeze-v1.md §1.2–1.4 + §0."""
from components import *
from states_common import generic_states, DXF_DL_BTNS, LOGO_LAYERS, STEPS_SVG

def cmp_table(input_label):
    """Shared DXF difference table (05 §1.2 shared component + §11.1 frozen cell)."""
    return f"""<div style="overflow-x:auto"><table class="cmp">
<thead><tr><th></th><th>Free online tracers (e.g. PixelToPath online)</th><th class="us">CleanPaths</th></tr></thead>
<tbody>
<tr><td>DXF export</td><td class="no">❌ SVG only</td><td class="yes">✅ R2000 + R12</td></tr>
<tr><td>Units in file</td><td class="no">❌</td><td class="yes">✅ (R2000)</td></tr>
<tr><td>Bad-image preprocessing</td><td class="no">❌</td><td class="yes">✅ denoise + upscale + auto-tuned</td></tr>
<tr><td>Closed, color-separated paths</td><td class="part">Limited (default settings)</td><td class="yes">✅</td></tr>
<tr><td>Files stay on your device</td><td class="yes">✅</td><td class="yes">✅</td></tr>
</tbody></table></div>"""

DXF_DIFF_MAIN = ("Free online tracers — including the open-source PixelToPath — stop at SVG. CleanPaths goes the last mile: "
                 "real DXF export in two versions (R2000 with units, R12 compatibility mode), closed paths, color-separated "
                 "layers, and a preprocessing pipeline that cleans bad images before tracing. Free tools give you a vector. "
                 "We give you a cut file.")

def faq_std_answer():
    return ('No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store '
            'your images or the files you generate. Close the tab and they\'re gone; we never had them. This is how '
            'the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>.')

# ---------------------------------------------------------------- /png-to-dxf
def build_png():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><span class="spec">PNG → DXF · R2000 + R12</span></div>
      <h1>PNG to DXF Converter — Cut-Ready Output</h1>
      <p class="hero__sub">Drop a PNG, get a DXF that actually cuts — closed paths, color-separated layers, units embedded. Processed on your device, never uploaded.</p>
    </div>
    <div>{dropzone(accept=".png", dz_text="Drop a PNG here — or browse",
                   version_seg=True, seg_note="R12 compatibility mode available")}</div>
  </div>
</section>"""
    proof = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof — in our tests</span>
    <div class="proof" style="margin-top:20px">
      <p class="proof__quote">"R2000 output carries units, so your file opens at the size you drew it. R12 compatibility mode covers older CAM. Every path closed, every layer color-separated — in our tests, a compressed logo that default tracing renders in <span class="hl">88 layers</span> comes out in <span class="hl">the teens or better</span>."</p>
      <div class="ba">
        <div class="ba__imgs">
          <img src="../../assets/samples/logo-peak_before.png" width="900" height="675" alt="Compressed logo PNG input (synthetic sample)" loading="lazy" decoding="async">
          <img src="../../assets/samples/logo-peak_after.png" width="900" height="675" alt="Color-separated clean output (synthetic sample)" loading="lazy" decoding="async">
        </div>
        <div class="ba__divider"></div><div class="ba__handle">⇔</div>
        <span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span>
      </div>
    </div>
  </div>
</section>"""
    problem = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <h2 style="margin-top:12px">A PNG is a picture. Your cutter needs paths.</h2>
    <ul class="plist" style="margin-top:12px">
      <li>"Your plotter, laser or CNC can't read pixels — it follows paths. A raw auto-trace gives you thousands of loose segments."</li>
      <li>"Free converters stop at 'here's a vector.' Whether it cuts is your problem."</li>
      <li>"And most of them want your file on their server first."</li>
    </ul>
  </div>
</section>"""
    solution = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The pipeline</span>
    <h2 style="margin-top:12px">From PNG to cut-ready DXF, in your browser</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Clean the image first</h3><p>Denoise and upscale before a single path is traced.</p></li>
      <li><h3>Trace with parameters tuned to your image</h3><p>Not one-size-fits-all defaults.</p></li>
      <li><h3>Export real DXF</h3><p>R2000 with units by default, R12 compatibility mode for older CAM, SVG if your machine prefers it.</p></li>
    </ol>
    <div class="info-strip" style="margin-top:24px"><span class="i">i</span><span>Not sure? Keep R2000 — it carries units and opens correctly in LightBurn, AutoCAD and modern CAM. Choose R12 only when your software is older than the format.</span></div>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">How to convert PNG to DXF (and get a file that cuts)</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your PNG.</h3></li>
      <li><h3>Check the layer preview; slide precision if you want a smaller or smoother file.</h3></li>
      <li><h3>Download DXF (R2000 or R12) — done.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">No sign-up. No watermark. Your PNG never left your machine.</p>
  </div>
</section>"""
    diff = f"""
<section class="section">
  <div class="wrap">
    <span class="spec">Honest comparison</span>
    <h2 style="margin-top:12px">Why not just use a free tracer?</h2>
    <p style="max-width:62em;color:var(--ink-2);margin-bottom:24px">{DXF_DIFF_MAIN}</p>
    {cmp_table("PNG")}
  </div>
</section>"""
    pricing = f"""
<section class="section--alt" style="padding:40px 0">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <p style="font-size:17.5px;max-width:44em">Free for 10 conversions a day — every feature above included. Heavy day? Pro lifts the cap: <b>$59, one time</b>.</p>
    <a class="btn btn--primary" href="{href('/pricing')}">Get CleanPaths Pro — $59, one time</a>
  </div>
</section>"""
    faq_items = [
        ("What DXF version do I get — R12 or R2000?",
         "Both, your choice. R2000 is the default and embeds units (mm/inch) so files open at the right size. R12 compatibility mode is there for older CAM software that only accepts the 1992-era format."),
        ("Will the DXF work in LightBurn?",
         "Yes — output is all POLYLINE with zero SPLINE entities, which is exactly what LightBurn handles best. Always run a test cut before production."),
        ("Does the conversion keep my logo's colors as separate layers?",
         "Yes — output is color-separated so you can assign different cut settings per layer. In our tests a typical flat-color logo lands in the single-digit to teens layer range, not the dozens a default trace produces."),
        ("My PNG is small and blurry — can it still work?",
         "Usually, if it's a flat-color graphic. The preprocessing pipeline upscales and denoises before tracing, which is exactly the case it's built for. There's a limit — a 50px smudge has no detail to recover — but try it: it's free and the preview shows you the result before you download."),
        ("Can I convert a photo to DXF?",
         "You can, but expect a stylized, posterized result — not cut-ready. This page's promise covers flat-color graphics: logos, icons, line art."),
        ("Do you upload or store my PNG?", faq_std_answer()),
        ("Is there a daily limit?",
         "Free tier: 10 conversions a day, full quality. Pro removes the cap — $59, one time, no subscriptions."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>That logo PNG sitting in your inbox? Convert it before the tab gets cold.</h2>
    <a class="btn btn--primary btn--lg" href="#convert">Convert PNG free now</a>
  </div>
</section>"""
    body = hero + proof + problem + solution + how + diff + pricing + faq_sec + final
    return page("PNG to DXF Converter — Cut-Ready & Free | CleanPaths",
                "Convert PNG to DXF with closed paths, separated layers and units included. Free, in your browser — no upload, no account, no watermark.",
                body, active_route="/png-to-dxf")

def build_png_states():
    return generic_states("/png-to-dxf", ".PNG", "logo-peak_before.png", "logo-peak_after.png",
                          LOGO_LAYERS, DXF_DL_BTNS, error_ext=".PNG")

# ---------------------------------------------------------------- /jpg-to-dxf
def build_jpg():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><span class="spec">JPG → DXF · built-in cleanup</span></div>
      <h1>JPG to DXF — Turn Client Photos of Logos into Cut Files</h1>
      <p class="hero__sub">JPGs arrive compressed, small and noisy. CleanPaths cleans them before tracing, then hands you a cut-ready DXF — processed on your device, never uploaded.</p>
    </div>
    <div>{dropzone(accept=".jpg, .jpeg", dz_text="Drop a JPG here — or browse", cleanup_switch=True)}</div>
  </div>
</section>"""
    proof = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof — in our tests</span>
    <div class="proof" style="margin-top:20px">
      <p class="proof__quote">"JPEG compression is the enemy of clean tracing — it rings every edge with noise. In our tests, denoising and upscaling a compressed logo before tracing cut the output from <span class="hl">88 color layers</span> down to <span class="hl">as few as 9</span>."</p>
      <div class="ba">
        <div class="ba__imgs">
          <img src="../../assets/samples/logo-bean_before.png" width="900" height="675" alt="Compressed, noisy JPG logo input (synthetic sample)" loading="lazy" decoding="async">
          <img src="../../assets/samples/logo-bean_after.png" width="900" height="675" alt="Cleaned and traced output (synthetic sample)" loading="lazy" decoding="async">
        </div>
        <div class="ba__divider"></div><div class="ba__handle">⇔</div>
        <span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span>
      </div>
    </div>
  </div>
</section>"""
    problem = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <h2 style="margin-top:12px">Nobody sends you a clean JPG</h2>
    <ul class="plist" style="margin-top:12px">
      <li>"It's a photo of a logo on a truck door, a business card, a napkin sketch."</li>
      <li>"JPEG artifacts make every edge fuzzy — a raw trace turns that fuzz into hundreds of junk paths."</li>
      <li>"The usual fix is two tools and an evening: upscale in one app, trace in another, pray the settings match."</li>
    </ul>
  </div>
</section>"""
    solution = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The pipeline</span>
    <h2 style="margin-top:12px">Cleanup and tracing in one pass</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Denoise + upscale first.</h3><p>The pipeline rescues compressed JPGs before a single path is drawn — the step free tracers skip.</p></li>
      <li><h3>Parameters that adapt to your image.</h3><p>Trace settings scale with image size and color count automatically.</p></li>
      <li><h3>Optional HD rescue.</h3><p>AI upscaling (runs on your device's GPU) for the truly rough ones — 3 free tries, included in Pro.</p></li>
      <li><h3>Real DXF out.</h3><p>R2000 with units, R12 compatibility mode, closed color-separated paths.</p></li>
    </ol>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">How to convert JPG to DXF without the two-app dance</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your JPG — leave "Clean up bad images" on.</h3></li>
      <li><h3>Preview the layers; toggle cleanup off to compare.</h3></li>
      <li><h3>Download your DXF.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">Your photo never left your device — cleanup and tracing both run in your browser.</p>
  </div>
</section>"""
    diff = f"""
<section class="section">
  <div class="wrap">
    <span class="spec">Honest comparison</span>
    <h2 style="margin-top:12px">Why not just use a free tracer?</h2>
    <p style="max-width:62em;color:var(--ink-2);margin-bottom:24px">{DXF_DIFF_MAIN}</p>
    {cmp_table("JPG")}
  </div>
</section>"""
    pricing = f"""
<section class="section--alt" style="padding:40px 0">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <p style="font-size:17.5px;max-width:44em">10 free conversions a day, cleanup included. Client work piling up? Pro removes the cap and includes AI HD rescue — <b>$59, one time</b>.</p>
    <a class="btn btn--primary" href="{href('/pricing')}">Get CleanPaths Pro — $59, one time</a>
  </div>
</section>"""
    faq_items = [
        ("My JPG is a low-resolution photo of a logo — will it cut?",
         "If the underlying graphic is flat-color, usually yes: cleanup removes the JPEG noise and upscales before tracing. Check the layer preview — what you see is what downloads. If the image is a photograph of a scene or person, expect a stylized result, not cut-ready."),
        ('What does the "Clean up bad images" switch actually do?',
         "Denoises and upscales your JPG, then auto-tunes the trace parameters to the result. It's the difference between tracing the noise and tracing the logo underneath it."),
        ("What's AI HD rescue?",
         "An optional AI upscaler that runs on your device's GPU (no upload) for heavily degraded images. Free tier includes 3 tries; Pro includes it with no per-use limit."),
        ("Will the DXF open at the right size?",
         "Yes with the default R2000 export — it embeds units. R12 mode (for older CAM) doesn't store units; set the unit when importing."),
        ("JPG vs PNG — does it matter which I upload?",
         "Both convert the same way. PNGs are usually cleaner (lossless), JPGs carry compression noise — which is why this page's cleanup switch exists."),
        ("Do you upload or store my JPG?", faq_std_answer()),
    ]
    faq_sec = f"""<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>The blurry JPG is not the problem. Waiting to fix it is.</h2>
    <a class="btn btn--primary btn--lg" href="#convert">Convert JPG free now</a>
  </div>
</section>"""
    body = hero + proof + problem + solution + how + diff + pricing + faq_sec + final
    return page("JPG to DXF — Turn Logo Photos into Cut Files | CleanPaths",
                "Convert JPG to DXF with built-in cleanup for blurry, compressed images. Cut-ready DXF, free in your browser — no upload, no account.",
                body, active_route="/jpg-to-dxf")

def build_jpg_states():
    return generic_states("/jpg-to-dxf", ".JPG, .JPEG", "logo-bean_before.png", "logo-bean_after.png",
                          LOGO_LAYERS, DXF_DL_BTNS, error_ext=".JPG")

# ---------------------------------------------------------------- /svg-to-dxf-converter
def build_svg():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><span class="spec">SVG → DXF · all POLYLINE · zero SPLINE</span></div>
      <h1>SVG to DXF Converter — R12 &amp; R2000, Units Included</h1>
      <p class="hero__sub">Real DXF, not a renamed SVG: all POLYLINE with zero SPLINE entities, units embedded in R2000 so your file opens at the size you drew it. Choose R12 compatibility mode for older CAM.</p>
    </div>
    <div>{dropzone(accept=".svg", dz_text="Drop an SVG here — or browse", micro=None,
                   version_seg=True, seg_note="R2000 default — units included · R12 for older CAM")}</div>
  </div>
</section>"""
    glow = """
<div class="wrap" style="margin-top:24px">
  <div class="info-strip"><span class="i">i</span><span>Glowforge user? Glowforge imports SVG/PDF, not DXF — download the cleaned SVG from our <a href="../png-to-dxf/code.html">PNG</a>/<a href="../jpg-to-dxf/code.html">JPG</a> converters instead.</span></div>
</div>"""
    proof = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof — in our tests</span>
    <p class="proof__quote" style="margin-top:20px;max-width:46em">"Every export is all POLYLINE — zero SPLINE entities — so the file that crashes strict CAM software simply never gets written. Curves are converted to clean polylines at a density you control with the precision slider. Closed paths stay closed."</p>
    <div class="stats" style="margin-top:20px">
      <span class="stat">ENTITIES <b>100% POLYLINE</b></span>
      <span class="stat">SPLINE <b>0</b></span>
      <span class="stat">EZDXF AUDIT <b>0 errors · 0 fixes</b></span>
      <span class="stat">UNITS <b>embedded (R2000)</b></span>
    </div>
  </div>
</section>"""
    problem = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <h2 style="margin-top:12px">SVG speaks web. Your machine speaks DXF.</h2>
    <ul class="plist" style="margin-top:12px">
      <li>"Design Space, Illustrator and the web live on SVG. LightBurn, AutoCAD and CNC CAM live on DXF."</li>
      <li>"Naive converters dump SPLINE entities that older CAM chokes on — or lose the units, so your 4-inch design imports at 4 millimeters."</li>
      <li>"And the online ones want your file uploaded to a server first."</li>
    </ul>
  </div>
</section>"""
    solution = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The converter</span>
    <h2 style="margin-top:12px">A converter that respects both formats</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Two real DXF flavors.</h3><p>R2000 (default) embeds units and opens in everything modern. R12 compatibility mode talks to 30-year-old CAM.</p></li>
      <li><h3>All POLYLINE, zero SPLINE.</h3><p>Curves become clean polylines at a density you set — no surprises in strict software.</p></li>
      <li><h3>Precision slider.</h3><p>Trade file size for smoothness yourself; see the result before you download.</p></li>
      <li><h3>Runs on your device.</h3><p>Your SVG never leaves the browser.</p></li>
    </ol>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">How to convert SVG to DXF</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your SVG.</h3></li>
      <li><h3>Pick R2000 (units included) or R12 (older CAM).</h3></li>
      <li><h3>Set precision, preview, download.</h3></li>
    </ol>
  </div>
</section>"""
    diff = f"""
<section class="section">
  <div class="wrap">
    <span class="spec">What you get</span>
    <h2 style="margin-top:12px">What "real DXF" means here</h2>
    <p style="max-width:62em;color:var(--ink-2);margin-bottom:24px">DXF output, cut-ready preprocessing, R12 &amp; R2000 dual export — what free SVG-only tracers don't do.</p>
    <div class="grid-3" style="margin-bottom:32px">
      <div class="card card--flat"><span class="spec spec--mat">Entity safety</span><h3 style="margin-top:8px">All POLYLINE</h3><p style="color:var(--ink-2);font-size:15px">Zero SPLINE entities — the class of file that crashes strict CAM never gets written.</p></div>
      <div class="card card--flat"><span class="spec spec--mat">Scale fidelity</span><h3 style="margin-top:8px">Units in R2000</h3><p style="color:var(--ink-2);font-size:15px">Your 4-inch design imports at 4 inches, not 4 millimeters.</p></div>
      <div class="card card--flat"><span class="spec spec--mat">Cut integrity</span><h3 style="margin-top:8px">Closed paths preserved</h3><p style="color:var(--ink-2);font-size:15px">Closed stays closed through discretization — no open contours to weld by hand.</p></div>
    </div>
    {cmp_table("SVG")}
  </div>
</section>"""
    pricing = f"""
<section class="section--alt" style="padding:40px 0">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <p style="font-size:17.5px;max-width:44em">Free for 10 conversions a day — both DXF versions included. Pro removes the cap: <b>$59, one time</b>, no subscriptions.</p>
    <a class="btn btn--primary" href="{href('/pricing')}">Get CleanPaths Pro — $59, one time</a>
  </div>
</section>"""
    faq_items = [
        ("R12 or R2000 — which should I choose?",
         "Keep the default R2000 unless your software rejects it. R2000 embeds units and opens correctly in LightBurn, AutoCAD and everything modern. R12 exists for legacy CAM that only accepts the 1992 format — note that R12 files carry no unit field, so set mm/inch when importing."),
        ("Why do some DXF files crash my CAM software?",
         "Usually SPLINE entities — smooth-curve objects many converters emit and strict CAM can't parse. CleanPaths writes all-POLYLINE output, so this class of crash doesn't occur."),
        ("Will my DXF open at the right size?",
         "Yes in R2000 mode — units are embedded. In R12 mode, units aren't stored in the format itself; choose the unit when importing."),
        ("Does it work with LightBurn?",
         "Yes — all-POLYLINE R2000/R12 output is exactly LightBurn's comfort zone. As with any cut file, run a test cut before production."),
        ("What about Glowforge?",
         "Glowforge doesn't accept DXF — it imports SVG or PDF. Use our PNG/JPG converters' cleaned SVG output instead."),
        ("My SVG has tiny details — will they survive?",
         "The precision slider controls curve density: higher for smoothness, lower for small files. The preview shows exactly what downloads."),
        ("Do you upload or store my SVG?", faq_std_answer()),
    ]
    faq_sec = f"""<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>Your CAM software called. It wants POLYLINEs.</h2>
    <a class="btn btn--primary btn--lg" href="#convert">Convert SVG free now</a>
  </div>
</section>"""
    body = hero + glow + proof + problem + solution + how + diff + pricing + faq_sec + final
    return page("SVG to DXF — R12 & R2000, Units Included | CleanPaths",
                "Convert SVG to DXF with real CAD compatibility: R2000 with units or R12 mode, all POLYLINE, no SPLINE crashes. Free, in your browser.",
                body, active_route="/svg-to-dxf-converter")

def build_svg_states():
    layers = """
<li><span class="sw" style="background:#2A2C34"></span>layer-1 · 24 segments/curve · POLYLINE</li>
<li style="color:var(--ink-3)">0 SPLINE entities · units: mm · closed paths preserved</li>"""
    return generic_states("/svg-to-dxf-converter", ".SVG", "line-rocket_before.png", "line-rocket_after.png",
                          layers, DXF_DL_BTNS, steps=STEPS_SVG, error_ext=".SVG")
