#!/usr/bin/env python3
"""BOFU comparison pages ×4 (template A) + /png-to-dxf FAQ insert.
Copy verbatim from 05-bofu-comparison-copy-v1.md (05d). Zero rewrites.
Chrome strings (footer Compare group, hero eyebrows) are FROZEN by 05 v1.7 addendum §1 (E1-E10, v1.5) —
see 06e-new-copy-return-table.md (archived drafts) and audit.py E-sentinels."""
from components import *

# ---- shared atoms (05d §0, verbatim) ----
BADGE_ROW = "🔒 Files stay on your device · No account · No watermark"
PRIVACY_A = ('No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store '
             'your images or the files you generate. Close the tab and they\'re gone; we never had them. This is how '
             'the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>.')
HONESTY_H2 = "An honest note before you convert"
HONESTY_TXT = ("Best on flat-color graphics — logos, icons, screenshots, line art: output is designed to be cut-ready. "
               "Photos come out stylized (posterized), not cut-ready — we'll tell you which one you have before you convert.")
INTERNAL_LINKS = ('Start with your own file: <a href="../png-to-dxf/code.html">PNG to DXF</a> · '
                  '<a href="../jpg-to-dxf/code.html">JPG to DXF</a> · '
                  '<a href="../svg-to-dxf-converter/code.html">SVG to DXF</a>. '
                  'See real outputs on the <a href="../samples/code.html">samples wall</a>. '
                  'Pricing: <a href="../pricing/code.html">$59 one-time, no subscriptions</a>.')

def tbd(note):
    """[待确认-落站前核实] annotation — text note, no ❌/✅ visual assertion (05d §6.2 rule)."""
    return f' <span class="stat" style="border-color:var(--caution);color:var(--caution);background:var(--caution-soft)">[{note}]</span>'

def hero(eyebrow, h1, sub):
    return f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><span class="spec">{eyebrow}</span></div>
      <h1>{h1}</h1>
      <p class="hero__sub">{sub}</p>
    </div>
    <div>{dropzone()}</div>
  </div>
</section>"""

def intro(txt):
    return f"""
<section class="section--tight">
  <div class="wrap"><p style="font-size:19px;max-width:46em;color:var(--ink-2)">{txt}</p></div>
</section>"""

def pains(h2, items):
    lis = "".join(f"<li><b style='color:var(--ink)'>{lead}</b> {rest}</li>" for lead, rest in items)
    return f"""
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The friction</span>
    <h2 style="margin-top:12px">{h2}</h2>
    <ul class="plist" style="margin-top:12px">{lis}</ul>
  </div>
</section>"""

def versus_table(h2, competitor, rows, emphasize_row=None):
    """rows: (label, them_html, us_html). Competitor column = facts only, no ❌/✅.
    us_html gets ✅ where copy asserts a CleanPaths fact."""
    body = ""
    for i, (label, them, us) in enumerate(rows):
        emph = ' style="background:var(--mat-soft)"' if emphasize_row == i else ""
        body += (f'<tr{emph}><td data-col="">{label}</td>'
                 f'<td data-col="{competitor}">{them}</td>'
                 f'<td data-col="CleanPaths" class="yes">{us}</td></tr>\n')
    return f"""
<section class="section">
  <div class="wrap">
    <span class="spec">Facts, side by side</span>
    <h2 style="margin-top:12px">{h2}</h2>
    <div class="table-scroll cmp-versus"><table class="cmp">
      <thead><tr><th></th><th>{competitor}</th><th class="us">CleanPaths</th></tr></thead>
      <tbody>{body}</tbody>
    </table></div>
  </div>
</section>"""

def difference(items):
    lis = "".join(f"<li><h3>{lead}</h3><p>{rest}</p></li>" for lead, rest in items)
    return f"""
<section class="section section--alt">
  <div class="wrap">
    <span class="spec spec--mat">The difference</span>
    <h2 style="margin-top:12px">The CleanPaths difference</h2>
    <ol class="steps" style="margin-top:20px">{lis}</ol>
  </div>
</section>"""

def real_results():
    """05d §0 shared block. 'in our tests' sits in the H2 (visible hierarchy), per 06e requirement #3."""
    return """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Real results</span>
    <h2 style="margin-top:12px">What cleanup actually changes (in our tests)</h2>
    <div class="proof" style="margin-top:20px">
      <div>
        <p style="font-size:16.5px;color:var(--ink-2)"><b style="color:var(--error)">Before:</b> "A compressed logo run through default tracing comes out in 88 color layers — junk paths your cutter has to chew through."</p>
        <p style="font-size:16.5px;color:var(--ink-2);margin-top:14px"><b style="color:var(--mat)">After:</b> "The same logo after denoise + upscale + auto-tuned tracing: as few as 9 layers, every path closed, every layer color-separated."</p>
        <div class="stats" style="margin-top:16px">
          <span class="stat">BEFORE <b>88 color layers</b></span>
          <span class="stat">AFTER <b>as few as 9 layers</b></span>
          <span class="stat">CLOSED PATHS <b>✓</b></span>
        </div>
      </div>
      <div class="ba">
        <div class="ba__imgs">
          <img src="../../assets/samples/logo-acme_before.png" alt="Compressed logo before cleanup (synthetic sample)">
          <img src="../../assets/samples/logo-acme_after.png" alt="Same logo after cleanup pipeline (synthetic sample)">
        </div>
        <div class="ba__divider"></div><div class="ba__handle">⇔</div>
        <span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span>
        <span class="synth-tag">SYNTHETIC SAMPLE</span>
      </div>
    </div>
  </div>
</section>"""

def pricing_block(main, aux):
    return f"""
<section class="section--alt" style="padding:48px 0">
  <div class="wrap">
    <span class="spec">Pricing</span>
    <h2 style="margin-top:12px">What $59 gets you</h2>
    <p style="font-size:18px;max-width:46em">"{main}"</p>
    <p style="margin-top:12px;color:var(--ink-2);max-width:52em">{aux}</p>
    <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">
      <a class="btn btn--primary" href="{href('/pricing')}">Get CleanPaths Pro — $59, one time</a>
      <a class="btn btn--ghost" href="{href('/pricing')}">See pricing →</a>
    </div>
  </div>
</section>"""

def honesty_block():
    return f"""
<section class="section" style="padding-bottom:0">
  <div class="wrap">
    <h2>{HONESTY_H2}</h2>
    <div class="info-strip" style="border-color:var(--caution);background:var(--caution-soft)">
      <span class="i" style="background:var(--caution)">!</span>
      <span>{HONESTY_TXT}</span>
    </div>
  </div>
</section>"""

def final_cta(h2):
    return f"""
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>{h2}</h2>
    <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
      <a class="btn btn--primary btn--lg" href="{href('/png-to-dxf')}">Convert free now</a>
      <a class="btn btn--lg" href="{href('/pricing')}">Get CleanPaths Pro — $59, one time</a>
    </div>
  </div>
</section>"""

def internal_links_block():
    return f"""
<section class="section--tight">
  <div class="wrap"><p style="font-size:15.5px;color:var(--ink-2)">{INTERNAL_LINKS}</p></div>
</section>"""

def build_comparison(meta_title, meta_desc, route, eyebrow, h1, sub, intro_txt, pains_h2, pains_items,
                     table_h2, competitor, rows, diff_items, price_main, price_aux, faq_items,
                     final_h2, emphasize_row=None, extra_html=""):
    body = (hero(eyebrow, h1, sub) + intro(intro_txt) + pains(pains_h2, pains_items)
            + versus_table(table_h2, competitor, rows, emphasize_row) + difference(diff_items)
            + real_results() + pricing_block(price_main, price_aux) + extra_html + honesty_block()
            + f'<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>'
            + final_cta(final_h2) + internal_links_block())
    return page(meta_title, meta_desc, body, active_route=route)
