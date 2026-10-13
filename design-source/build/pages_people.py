#!/usr/bin/env python3
"""People-axis pages + pricing: /for/cricut-sellers, /for/embroidery, /pricing.
Copy verbatim from 05-copy-freeze-v1.md §2.1/§2.2/§4 + §0."""
from components import *

def badges():
    return '<div class="badges"><span class="badge">🔒 Files stay on your device</span><span class="badge">No account</span><span class="badge">No watermark</span></div>'

def faq_std_answer():
    return ('No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store '
            'your images or the files you generate. Close the tab and they\'re gone; we never had them. This is how '
            'the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>.')

# ------------------------------------------------------- /for/cricut-sellers
def build_cricut():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:860px">
    <div class="hero__eyebrow"><span class="spec">For Cricut sellers · client-image rescue</span></div>
    <h1>Cut-Ready SVG &amp; DXF Files for Cricut Sellers</h1>
    <p class="hero__sub">Your customers send terrible images. CleanPaths turns them into clean, layered files that import into Design Space and cut the first time — so the order ships on schedule.</p>
    <div style="margin-top:24px;display:flex;gap:14px;flex-wrap:wrap;align-items:center">
      <a class="btn btn--primary btn--lg" href="{href('/png-to-dxf')}">Convert a client image free →</a>
    </div>
    <div style="margin-top:16px">{badges()}</div>
  </div>
</section>
<div class="disclaimer-strip">CleanPaths is an independent tool, compatible with Cricut Design Space — not affiliated with or endorsed by Cricut.</div>"""
    samples = f"""
<section class="section">
  <div class="wrap">
    <span class="spec">01 · real client inputs</span>
    <h2 style="margin-top:12px">The images clients actually send</h2>
    <p style="color:var(--ink-2);max-width:56em;margin-bottom:28px">"A 150px logo JPG. A phone photo of a business card. A screenshot of a screenshot. These are the inputs CleanPaths is built for — cleanup first, then tracing, then a file that behaves in Design Space."</p>
    <div class="grid-3">
      <div class="ba"><div class="ba__imgs"><img src="../../assets/samples/logo-acme_before.png" width="900" height="675" alt="150px logo JPG (synthetic sample)" loading="lazy" decoding="async"><img src="../../assets/samples/logo-acme_after.png" width="900" height="675" alt="layered cut file output (synthetic sample)" loading="lazy" decoding="async"></div><div class="ba__divider"></div><div class="ba__handle">⇔</div><span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span><span class="synth-tag">SYNTHETIC SAMPLE</span></div>
      <div class="ba"><div class="ba__imgs"><img src="../../assets/samples/logo-bean_before.png" width="900" height="675" alt="compressed business-card photo (synthetic sample)" loading="lazy" decoding="async"><img src="../../assets/samples/logo-bean_after.png" width="900" height="675" alt="cleaned layered output (synthetic sample)" loading="lazy" decoding="async"></div><div class="ba__divider"></div><div class="ba__handle">⇔</div><span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span><span class="synth-tag">SYNTHETIC SAMPLE</span></div>
      <div class="ba"><div class="ba__imgs"><img src="../../assets/samples/ui-mobile_before.png" width="900" height="675" alt="screenshot input (synthetic sample)" loading="lazy" decoding="async"><img src="../../assets/samples/ui-mobile_after.png" width="900" height="675" alt="traced layered output (synthetic sample)" loading="lazy" decoding="async"></div><div class="ba__divider"></div><div class="ba__handle">⇔</div><span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span><span class="synth-tag">SYNTHETIC SAMPLE</span></div>
    </div>
    <p style="margin-top:16px"><a href="{href('/samples')}">Browse the full before/after wall →</a></p>
  </div>
</section>"""
    diag_items = [
        ("Why won't my SVG upload to Cricut Design Space?",
         "Three usual suspects: (1) it's a fake SVG — a bitmap wrapped in SVG tags; (2) it uses unsupported features like embedded fonts or filters; (3) the file is corrupted. CleanPaths outputs true vector paths only, with no embedded bitmaps, so files import cleanly."),
        ("Why does my SVG show up as a black box in Cricut?",
         "Almost always a raster image hiding inside an SVG wrapper, or fill/stroke settings the importer misreads. The 10-second check: open the file in a text editor and search for <code>&lt;image&gt;</code> — if it's there, you don't have real vector. CleanPaths output is vector paths only; there's nothing in the file that can render as a black box."),
        ("How do I spot a fake SVG before I waste vinyl on it?",
         "Open it in a text editor: real vector SVGs are lists of paths; fakes contain an <code>&lt;image&gt;</code> tag pointing at a bitmap. Or drop it into CleanPaths — the layer preview shows immediately whether there are real paths to work with."),
        ("Glowforge rejected my SVG over 100 KB — what now?",
         "Glowforge's free tier won't process SVGs above 100 KB. The fix is fewer, cleaner paths: re-trace with a lower precision setting to trade a little smoothness for a much smaller file. Most flat-color designs come out well under the limit."),
        ("How small can I cut text and still read it?",
         "A working rule from working sellers: keep small text and fine details readable at 1.5–2 inches — below that, simplify. Merge tiny fragments, thicken hairlines, and always test-cut at final size. The Precision Pack's small-size presets automate the simplification step."),
    ]
    diag_html = "".join(
        f'<details class="diag__item"><summary><span class="sx">SYMPTOM</span>{q}</summary><div class="dx">{a}</div></details>'
        for q, a in diag_items)
    diag = f"""
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">02 · the repair manual</span>
    <h2 style="margin-top:12px">SVG problems, diagnosed</h2>
    <div class="diag" style="margin-top:20px">{diag_html}</div>
  </div>
</section>"""
    smallcut = """
<section class="section">
  <div class="wrap">
    <span class="spec">03 · readable at 1.5–2 inches</span>
    <h2 style="margin-top:12px">The small-cut workflow</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Simplify first</h3><p>Fewer colors and fragments cut cleaner at small sizes.</p></li>
      <li><h3>Use a precision preset tuned for small cuts</h3><p>Precision Pack, $29 one-time, optional.</p></li>
      <li><h3>Test-cut at final size</h3><p>Before the real material.</p></li>
    </ol>
  </div>
</section>"""
    roi = f"""
<section class="section section--alt">
  <div class="wrap">
    <span class="spec spec--mat">04 · the math</span>
    <h2 style="margin-top:12px">Selling every week? The math</h2>
    <div class="grid-2" style="align-items:center;margin-top:16px">
      <p style="font-size:17px;color:var(--ink-2)">"The free tier covers 10 conversions a day — full quality, no watermark. Past that, Pro is $59, one time: a commercial license for selling what you make, AI HD rescue for the worst images, no daily cap. No subscriptions. One outsourced cleanup runs $4–6 on Fiverr; at ten orders a month that's $40–60 — Pro pays for itself in about a month of orders, then it's yours for good. 30-day money-back guarantee."</p>
      <div class="card">
        <div class="stats" style="margin-bottom:14px"><span class="stat">FIVERR CLEANUP <b>$4–6 / order</b></span><span class="stat">10 ORDERS/MO <b>$40–60</b></span><span class="stat">PRO <b>$59 once</b></span></div>
        <a class="btn btn--primary" href="{href('/pricing')}">Get CleanPaths Pro — $59, one time</a>
      </div>
    </div>
  </div>
</section>"""
    faq_items = [
        ("Do you upload or store my client images?",
         faq_std_answer() + " Client work stays between you and your customer — the files never reach us."),
        ("Can I sell products made from converted files?",
         "Yes — with any paid license. Output made on the free tier is for personal use: hobbies, your own projects, gifts for friends and family. Output made while you hold any valid paid license (Pro Core, Batch Pack, Precision Pack, or Monthly Pass) is yours for personal and commercial use. Selling finished items counts as commercial use no matter how occasional — Etsy, your own shop, a craft fair or market stall. A charity or fundraiser sale is still a sale under the Terms; we won't come knocking over a school fundraiser, but a $10 Monthly Pass for that month keeps it clean. Two more things people ask: if your Monthly Pass ends, everything you made while it was active keeps its commercial rights — you bought the rights for that moment in time; only new conversions go back to personal use. And if you ever refund a license, items you already sold stay sold — nothing is retroactive. One thing never changes: converting someone else's logo doesn't grant you rights to that logo — you need the rights to any image you convert. Full text in <a href=\"/terms/\">Terms §3</a>."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = f"""
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>Keep the order moving.</h2>
    <a class="btn btn--primary btn--lg" href="{href('/png-to-dxf')}">Convert a client image free →</a>
  </div>
</section>"""
    body = hero + samples + diag + smallcut + roi + faq_sec + final
    return page("Image to SVG for Cricut — Cut-Ready, Free | CleanPaths",
                "Turn client images into clean, layered SVG/DXF files that import into Cricut Design Space and cut right. Free, in your browser — no upload.",
                body, active_route="/for/cricut-sellers")

# ------------------------------------------------------- /for/embroidery
def build_embroidery():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:900px">
    <div class="hero__eyebrow"><span class="spec">For embroidery machine owners · honest prep</span></div>
    <h1>From Image to Embroidery: Honest Prep, Human Digitizers</h1>
    <p class="hero__sub">We won't sell you a one-click "image to PES" button — because that button doesn't work. Here's what actually does: clean prep, realistic expectations, and a skilled human digitizer.</p>
    <div style="margin-top:24px;display:flex;gap:14px;flex-wrap:wrap">
      <a class="btn btn--primary btn--lg" href="{href('/png-to-dxf')}">Prep your image free →</a>
      <a class="btn btn--lg" href="#digitizer">Get a human digitizer quote →</a>
    </div>
    <div style="margin-top:16px">{badges()}</div>
  </div>
</section>"""
    manifesto = """
<section class="manifesto matgrid">
  <div class="wrap">
    <span class="spec">01 · the honest part</span>
    <h2 style="margin-top:12px">Why automatic digitizing doesn't work</h2>
    <p class="lede" style="margin-top:20px">"Embroidery isn't a file format problem — it's a physics problem.</p>
    <div class="body">
      <p>Satin stitches narrower than about 1 mm break. Pull compensation depends on your fabric. Underlay choices, stitch direction and density decide whether a design sews flat or snaps needles. None of that exists in the pixels of your image — it lives in your fabric, your thread and your machine.</p>
      <p>Even professional suites costing $1,000+ ship auto-digitize buttons — and their own tutorials tell you to fix the results by hand. The most mature open-source embroidery tool, Ink/Stitch, is a manual digitizing studio: if trustworthy one-click conversion could be built, the community would have built it in the last ten years. Ask any embroidery forum: auto digitizing never gives a proper design.</p>
      <p>So we don't pretend. What software <em>can</em> do is the preparation — and that's what we built."</p>
    </div>
  </div>
</section>"""
    prep = f"""
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">02 · what we do instead</span>
    <h2 style="margin-top:12px">What we do instead — prep that saves digitizing mistakes</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Clean and simplify.</h3><p>Upload your image to our converter: denoise, upscale, and reduce to the flat color count embroidery actually wants.</p></li>
      <li><h3>Think in thread.</h3><p>Fewer, flatter color regions = a design a digitizer can work with. (A thread-chart mapping for Madeira/Isacord colors is on our roadmap — today we get you the clean, simplified SVG.)</p></li>
      <li><h3>Export a digitizer-ready SVG.</h3><p>Clean, layered, closed paths — the starting point a human digitizer charges you less to finish.</p></li>
    </ol>
    <div style="margin-top:24px"><a class="btn btn--primary" href="{href('/png-to-dxf')}">Prep your image free →</a></div>
  </div>
</section>"""
    digitizer = f"""
<section class="section section--alt" id="digitizer">
  <div class="wrap">
    <span class="spec">03 · when software isn't enough</span>
    <h2 style="margin-top:12px">When you need a human digitizer</h2>
    <div class="grid-2" style="align-items:start;margin-top:16px">
      <div>
        <p style="font-size:17px;color:var(--ink-2)">"For client work, wearables, small lettering, or anything that must sew perfectly the first time: hire a human. Professional digitizing typically runs about $15 per design — cheap insurance against ruined garments.</p>
        <p style="font-size:17px;color:var(--ink-2);margin-top:12px">We've lined up digitizing partners who accept CleanPaths-prepared files."</p>
        <div style="margin-top:20px"><a class="btn btn--mat btn--lg" href="#digitizer">Get a digitizer quote →</a></div>
      </div>
      <div class="card">
        <span class="spec">Typical referral scope</span>
        <ul class="plist" style="margin-top:14px">
          <li>Client-facing or wearable work</li>
          <li>Small lettering that must sew clean</li>
          <li>Anything that must sew perfectly the first time</li>
        </ul>
        <div class="stats" style="margin-top:14px"><span class="stat">TYPICAL COST <b>~$15 / design</b></span></div>
      </div>
    </div>
    <p class="affil">Disclosure: CleanPaths may earn a commission when you use a digitizing service we refer — at no extra cost to you. We only refer services we believe are relevant. (16 CFR Part 255)</p>
  </div>
</section>"""
    faq_items = [
        ("Can I convert PNG to PES directly?",
         "Not honestly. PES files contain stitch data — type, direction, density, compensation — that can't be derived from pixels alone. What you <em>can</em> do automatically is the preparation: clean the image, simplify the colors, export a digitizer-ready SVG. The stitch decisions belong to a human digitizer."),
        ("Why do auto-digitized designs sew badly?",
         "Because the hard parts aren't in the image. Satin stitches under ~1 mm break; fabric stretch needs pull compensation; density and underlay decide whether it sews flat. Software that ignores your fabric, thread and machine is guessing — and your garment pays for the guess."),
        ("When is $15 for a human digitizer worth it?",
         "Anything client-facing, wearable, or with small lettering. If a failed sew-out costs you a garment, a blank, or a customer, $15 is the cheapest insurance in the process."),
        ("What about the auto-digitize in Hatch or Embrilliance?",
         "They exist — and their own documentation walks you through manually fixing the output. Auto features are assistants, not replacements. If you already own those tools, our prep export still saves you the cleanup step."),
        ("Do you have a stitchability checker?",
         "Not yet — a preparation report (minimum-width checks, small-fragment flags, thread-chart mapping) is on our roadmap. Today: free prep export plus referral to human digitizers."),
        ("Do you upload or store my designs?", faq_std_answer()),
    ]
    faq_sec = f"""<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = f"""
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>Start with an honest prep.</h2>
    <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
      <a class="btn btn--primary btn--lg" href="{href('/png-to-dxf')}">Prep your image free →</a>
      <a class="btn btn--lg" href="#digitizer">Get a human digitizer quote →</a>
    </div>
  </div>
</section>"""
    body = hero + manifesto + prep + digitizer + faq_sec + final
    return page("Image to PES: Honest Prep Before You Digitize | CleanPaths",
                "No fake one-click PES button. Honest embroidery image prep — cleanup, color simplification, digitizer-ready SVG — plus referral to human digitizers.",
                body, active_route="/for/embroidery")

# ------------------------------------------------------- /pricing
def build_pricing():
    hero = """
<section class="hero" style="padding-bottom:32px">
  <div class="wrap" style="max-width:900px">
    <div class="hero__eyebrow"><span class="spec">Pricing · one-time, yours forever</span></div>
    <h1>Simple, One-Time Pricing</h1>
    <p class="hero__sub"><b>Built for sellers who clean client images every week — and sell what they make. A paid license makes your output officially commercial.</b></p>
    <p class="hero__sub">Free for light use — full quality, no watermark, no account. One-time payment when your shop outgrows it. No subscriptions — ever.</p>
  </div>
</section>"""
    trustbar = """
<div class="wrap"><div class="trustbar">
  <div class="t"><span class="tick">✅</span><span><b>30-day money-back guarantee</b> — no questions asked</span></div>
  <div class="t"><span class="tick">✅</span><span><b>One-time payment</b>, yours forever</span></div>
  <div class="t"><span class="tick">✅</span><span><b>Files stay on your device</b></span></div>
  <div class="t"><span class="tick">✅</span><span><b>No account</b> needed</span></div>
</div></div>"""
    cards = f"""
<section style="padding-bottom:64px"><div class="wrap">
<div class="price-grid">
  <div class="card price-card">
    <span class="tier">Free</span>
    <div class="amount">$0</div>
    <ul>
      <li>10 conversions a day</li>
      <li>Full cut-ready output: DXF (R2000 + R12) and SVG</li>
      <li>Classic preprocessing pipeline: denoise + upscale + auto-tuned tracing</li>
      <li>No watermark, no account</li>
      <li>Your files never leave your device</li>
      <li>AI HD rescue: 3 free tries</li>
      <li>Personal use</li>
    </ul>
    <a class="btn" href="{href('/')}">Start converting — free</a>
  </div>
  <div class="card price-card price-card--hero">
    <span class="pick-badge">Most shops pick this</span>
    <span class="tier">Pro Core</span>
    <div class="amount">$59 <small>one-time</small></div>
    <ul>
      <li>Everything in Free</li>
      <li>Commercial license — for client work and selling what you make</li>
      <li>AI HD rescue included (runs on your device's GPU)</li>
      <li>No daily cap — convert all day</li>
      <li>License key by email — works offline after a one-time activation</li>
      <li>30-day money-back guarantee, no questions asked</li>
    </ul>
    <a class="btn btn--primary btn--lg" href="#checkout">Get CleanPaths Pro — $59, one time</a>
  </div>
  <div style="display:grid;gap:20px;align-content:start">
    <div class="card price-card price-card--dim" style="padding:20px">
      <span class="tier">Monthly Pass — try first</span>
      <div class="amount" style="font-size:32px">$10 <small>/mo</small></div>
      <p style="font-size:14px;color:var(--ink-2);margin:8px 0">Prefer to try first? Everything in Pro Core, monthly. Cancel anytime — access runs to the end of the paid month. 100% of what you've paid credits toward the one-time price within 60 days.</p>
      <p style="font-size:14px;font-weight:600;margin:4px 0 0">Includes commercial use.</p>
      <a class="btn btn--ghost btn--sm" href="#checkout">Monthly Pass — $10/mo, credits toward one-time purchase</a>
    </div>
    <div class="pack-pair">
      <span class="spec">Add-on packs — $29 each, one-time</span>
      <p style="font-size:13.5px;color:var(--ink-2);margin-top:-8px">For heavy shop workloads</p>
      <div class="pack">
        <h3>Batch Pack <span class="p">$29 one-time</span></h3>
        <p>One order, many images — queue a whole client's folder, export as a ZIP.</p>
        <a class="btn btn--sm" href="#checkout">Add Batch Pack — $29, one time</a>
      </div>
      <div class="pack">
        <h3>Precision Pack <span class="p">$29 one-time</span></h3>
        <p>Advanced precision tiers, layer naming templates, small-size cut presets (readable at 1.5–2 inches).</p>
        <a class="btn btn--sm" href="#checkout">Add Precision Pack — $29, one time</a>
      </div>
    </div>
  </div>
</div>
<p class="honest-cap">Everything — Pro Core + both packs — is <b>$117, one time</b>. That's the most this site will ever ask of you.</p>
</div></section>"""
    refund = """
<section class="section"><div class="wrap">
  <div class="contrast">
    <span class="spec">The refund promise</span>
    <h2 style="margin:12px 0 16px">The refund policy most converter tools won't give you</h2>
    <p>30-day money-back guarantee — no questions asked. Email us your order ID within 30 days and we refund in full. Some converter tools state 'no refunds' in their terms — Vector Magic and Convertio among them. We'd rather earn your trust than lock you in.</p>
    <p style="margin-top:14px">Refunds go back to your original payment method through our payment partner; your license deactivates, and that's the whole deal. No forms, no retention scripts.</p>
  </div>
</div></section>"""
    roi = """
<section class="section--alt" style="padding:48px 0"><div class="wrap">
  <span class="spec">The math</span>
  <p style="font-size:19px;max-width:56em;margin-top:14px">"One outsourced cleanup costs <b>$4–6 on Fiverr</b> — at ten orders a month that's $40–60. CleanPaths Pro pays for itself in about a month of orders, then it's free for good. Or count it another way: five months of Canva Pro ($13/mo) already costs more than CleanPaths Pro, forever."</p>
</div></section>"""
    where = """
<section class="section"><div class="wrap">
  <span class="spec">Context — facts, not adjectives</span>
  <h2 style="margin-top:12px">Where $59 sits</h2>
  <div class="grid-3" style="margin-top:16px">
    <div class="card card--flat"><span class="spec">Vector Magic Desktop</span><p style="margin-top:10px;font-size:15.5px;color:var(--ink-2)">$295 (its DXF output lives in the desktop edition) — CleanPaths Pro: $59, in your browser.</p></div>
    <div class="card card--flat"><span class="spec">Silhouette Studio</span><p style="margin-top:10px;font-size:15.5px;color:var(--ink-2)">$49.99–$99.99, one-time — "no subscriptions required" is how craft software is sold. We agree.</p></div>
    <div class="card card--flat"><span class="spec">PixelToPath</span><p style="margin-top:10px;font-size:15.5px;color:var(--ink-2)">Free (MIT) and genuinely good — but SVG only. If you need DXF, that's us.</p></div>
  </div>
</div></section>"""
    faq_items = [
        ("Is it really a one-time payment?",
         "Yes. Pro Core and each add-on pack are one-time purchases — you pay once and the license is yours. We don't do subscriptions; the optional Monthly Pass exists only as a try-first on-ramp, and what you pay there credits toward the one-time price within 60 days."),
        ("What happens after I pay?",
         "You get a license key by email. Paste it in, it activates once online, and Pro works offline from then on. Your files still never leave your device — Pro unlocks features locally; it doesn't move your work to a server."),
        ("What if it doesn't work for me?",
         "Email us within 30 days with your order ID — full refund, no questions asked, no forms. (And before it comes to that: the free tier is the real product with a daily cap, so you can verify quality on your own images first.)"),
        ("Do you offer subscriptions?",
         "No. One-time purchases, plus an optional Monthly Pass that credits toward one-time. Craft software is sold this way for a reason — Silhouette's own upgrades say 'no subscriptions required' right on their site."),
        ("Is there a free trial of Pro features?",
         "The free tier is the trial: full output quality, 10 conversions a day, no watermark. AI HD rescue includes 3 free tries. We don't do timed trials of a locked product — you already know exactly what you're buying."),
        ("Can I upgrade from Monthly Pass to one-time?",
         "Yes — 100% of your Monthly Pass payments credit toward the $59 one-time price within 60 days of payment."),
        ("Do you charge per conversion or add watermarks?",
         "No. Free is 10 conversions a day at full quality with no watermark. Paid removes the cap. There is no per-file metering and never a watermark."),
        ("Who processes my payment?",
         "Checkout is handled by our Merchant of Record — they process your card and taxes; we receive only your email, order ID, license key and country. We never see your card number."),
        ("What counts as commercial use?",
         "Commercial use is any use connected with selling or promoting goods or services, or any use by or for a business — selling items made with converted files (on Etsy, in your own shop, at a craft fair or market stall), fulfilling client orders, or producing promotional material for a business. Personal use is hobbies, your own projects, and gifts for friends and family. Free-tier output is licensed for personal use; output made while any paid license is active — Pro Core, Batch Pack, Precision Pack, or Monthly Pass — is licensed for personal and commercial use. Full definition in Terms §3."),
    ]
    faq_sec = f"""<section class="section section--alt"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = f"""
<section class="section cta-band">
  <div class="wrap">
    <h2>Start free. Upgrade when the orders say so.</h2>
    <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
      <a class="btn btn--lg" href="{href('/')}">Convert free now</a>
      <a class="btn btn--primary btn--lg" href="#checkout">Get CleanPaths Pro — $59, one time</a>
    </div>
  </div>
</section>"""
    body = hero + trustbar + cards + refund + roi + where + faq_sec + final
    return page("Pricing: Free Tier + Pro $59 One-Time | CleanPaths",
                "Free 10 conversions a day, no account. Pro Core $59 one-time, add-on packs $29. No subscriptions. 30-day money-back guarantee.",
                body, active_route="/pricing")
