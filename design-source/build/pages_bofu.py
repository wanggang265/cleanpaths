#!/usr/bin/env python3
"""4 BOFU comparison pages — copy verbatim from 05-bofu-comparison-copy-v1.md §1-§4."""
from bofu_template import *

VM = dict(
    meta_title="Vector Magic Alternative for Cut-Ready DXF | CleanPaths",
    meta_desc="Vector Magic alternative in your browser: image to DXF/SVG with cleanup for bad images. No upload, no account. Pro $59 one-time — no subscriptions.",
    route="/vector-magic-alternative", eyebrow="Vector Magic alternative",
    h1="A Vector Magic Alternative That Runs in Your Browser — and Exports Cut-Ready DXF",
    sub="CleanPaths turns flat-color graphics into cut files — DXF in two versions, closed paths, color-separated layers — processed entirely on your device. No install, no upload, no account.",
    intro_txt='"If you came here from a Vector Magic pricing page, you already know the shape of the problem: the edition with DXF output is a $295 desktop app, the online edition bills monthly — and either way, you still don\'t have a file that\'s tuned for a cutter."',
    pains_h2="Why makers look for a Vector Magic alternative",
    pains_items=[
        ("The DXF edition costs $295.", "Vector Magic's desktop app — the edition whose output formats include DXF — is a $295 one-time purchase."),
        ("The online edition bills you monthly.", "$9.95 a month adds up fast for a tool most makers reach for a few times a week."),
        ("Its terms state no refunds.", "Vector Magic is one of the converter tools whose terms say purchases aren't refundable — you commit before you've tested it on your worst client image."),
    ],
    table_h2="Vector Magic vs CleanPaths", competitor="Vector Magic",
    rows=[
        ("Where it runs", "Desktop app (install) or online service (files go to their servers)",
         "✅ 100% in your browser — no install, no upload step"),
        ("Price", "$295 one-time (Desktop) / $9.95 per month (Online)",
         "✅ Free tier: 10 conversions a day. Pro: $59, one time"),
        ("Refund", "Terms state no refunds",
         "✅ 30-day money-back guarantee — no questions asked"),
        ("DXF export", "Desktop edition",
         "✅ Every tier — R2000 (with units) + R12 compatibility mode"),
        ("Output tuned for cutting", "General-purpose vector output",
         "✅ Closed paths, color-separated layers, units embedded"),
        ("Bad-image cleanup", "No dedicated denoise/upscale step" + tbd("待确认-落站前核实"),
         "✅ Built-in: denoise + upscale + auto-tuned tracing"),
        ("Account", "Required for the online edition" + tbd("待确认-落站前核实"),
         "✅ No account, no watermark"),
    ],
    diff_items=[
        ("Cut-ready DXF, in two versions — not just \"a vector.\"",
         "R2000 embeds units, so your file opens at the size you drew it in LightBurn, AutoCAD or modern CAM. R12 compatibility mode covers older software. Every path closed, every layer color-separated."),
        ("A cleanup pipeline for the images clients actually send.",
         "Denoise, upscale, then trace with parameters tuned to your image — the old upscale-in-one-app, trace-in-another routine, collapsed into a single pass."),
        ("Honest output, local processing.",
         "Flat-color graphics are designed to come out cut-ready; photos come out stylized, and we tell you which one you have before you convert. And nothing is uploaded — conversion runs on your device."),
    ],
    price_main="Pro Core is $59, one time: a commercial license for client work and selling what you make, AI HD rescue for the worst images, and no daily cap. No subscriptions. 30-day money-back guarantee.",
    price_aux="Free tier: 10 conversions a day, every core feature included, no watermark. Vector Magic's terms state no refunds — we'd rather earn your trust than lock you in.",
    faq_items=[
        ("Is CleanPaths a good Vector Magic alternative for cutting machines?",
         "Yes, if your end goal is a file that cuts. CleanPaths is built specifically for image-to-cut-file: closed paths, color-separated layers, DXF in R2000 and R12 versions. If you need general-purpose vector art for print or illustration, Vector Magic's desktop app is a capable tool — it's just priced like one, at $295."),
        ("How does CleanPaths pricing compare to Vector Magic?",
         "CleanPaths Pro is $59, one time, with a 30-day money-back guarantee. Vector Magic Desktop is $295 one-time; the online edition is $9.95 per month, and its terms state no refunds. CleanPaths also has a free tier — 10 conversions a day at full quality, no watermark."),
        ("Do I need to install anything or upload my files?",
         "Neither. CleanPaths runs entirely in your browser — there is no install and no upload step. Your files never leave your device."),
        ("My client's logo is a blurry photo — can CleanPaths still handle it?",
         "Usually, if the underlying graphic is flat-color. The preprocessing pipeline denoises and upscales before tracing, which is exactly the case it's built for. Check the layer preview before you download — what you see is what you get. If it's a photograph of a scene or person, expect a stylized result, not cut-ready."),
        ("What DXF version do I get — R12 or R2000?",
         "Both, your choice. R2000 is the default and embeds units (mm/inch) so files open at the right size. R12 compatibility mode is there for older CAM software that only accepts the 1992-era format."),
        ("Do you upload or store my files?", PRIVACY_A),
        ("Can I convert a photo and cut it?",
         "You can convert it, but expect a stylized, posterized result — not cut-ready. The cut-ready promise covers flat-color graphics: logos, icons, screenshots, line art."),
    ],
    final_h2="See what your worst client logo becomes — free.",
)

CC = dict(
    meta_title="CloudConvert Alternative for Cut-Ready DXF | CleanPaths",
    meta_desc="CloudConvert alternative for makers: image to DXF/SVG with bad-image cleanup, all in your browser. No upload. Pro $59 one-time.",
    route="/cloudconvert-alternative", eyebrow="CloudConvert alternative",
    h1="A CloudConvert Alternative That Never Uploads Your File",
    sub="CloudConvert converts hundreds of formats on its servers. CleanPaths does exactly one job — image to cut-ready DXF/SVG — entirely in your browser. No upload, no account, no watermark.",
    intro_txt='"CloudConvert is a solid general-purpose converter. But if you found this page, you probably weren\'t converting a spreadsheet — you had a logo or a piece of line art that needed to become a cut file, and a server-side, metered, generalist tool started to feel like the wrong shape for the job."',
    pains_h2="Why makers look for a CloudConvert alternative",
    pains_items=[
        ("Your file goes to someone else's server.", "Client logos and unreleased product artwork get uploaded before anything happens — your confidentiality promise to the client is then only as good as a third party's retention policy."),
        ("It's a generalist, not a cut-file tool.", "Hundreds of formats across documents, video, audio and images — impressive breadth, but image-to-DXF gets no cut-scene treatment: no closed-path post-processing, no units handling tuned for cutters, no layer separation by color. <span class='stat' style='border-color:var(--caution);color:var(--caution);background:var(--caution-soft)'>[其 DXF 输出范围待确认-落站前核实]</span>"),
        ("Metered pricing for a metered patience.", "Usage-based credits and monthly plans <span class='stat' style='border-color:var(--caution);color:var(--caution);background:var(--caution-soft)'>[待确认-落站前核实现行定价]</span> work fine for occasional conversions — less fine when a client's whole folder lands at 6pm."),
    ],
    table_h2="CloudConvert vs CleanPaths", competitor="CloudConvert",
    rows=[
        ("Where files go",
         "<span class='stat'>☁️ Uploaded to CloudConvert's servers</span>",
         "✅ <span class='stat' style='background:var(--mat-soft)'>💻 Nowhere — conversion runs 100% in your browser</span>"),
        ("Focus", "General cloud conversion, hundreds of formats, developer API",
         "✅ One job: image → cut-ready DXF/SVG, for makers and sellers"),
        ("DXF output", "General-purpose conversion; cut-scene specs unclear" + tbd("待确认-落站前核实"),
         "✅ R2000 (with units) + R12 mode, closed paths, color-separated layers"),
        ("Bad-image cleanup", "No image preprocessing step" + tbd("待确认-落站前核实"),
         "✅ Built-in: denoise + upscale + auto-tuned tracing"),
        ("Pricing", "Usage-based credits / monthly plans" + tbd("待确认-落站前核实现行定价"),
         "✅ Free tier: 10 a day. Pro: $59, one time. 30-day money-back guarantee"),
        ("Account", "Required" + tbd("待确认-落站前核实"),
         "✅ No account, no watermark"),
    ],
    diff_items=[
        ("Cut-ready DXF, in two versions.",
         "R2000 with units embedded, R12 compatibility mode for older CAM, every path closed, layers separated by color — output a cutter can actually follow, not a generic conversion."),
        ("Cleanup built for bad input.",
         "The images clients send are compressed, small and noisy. CleanPaths denoises and upscales before a single path is traced — the step generalist converters don't have."),
        ("Nothing leaves your device.",
         "There is no upload step to audit. For client work under NDA or simple shop hygiene, local processing isn't a feature — it's the whole architecture."),
    ],
    price_main="Pro Core is $59, one time: a commercial license for client work and selling what you make, AI HD rescue for the worst images, and no daily cap. No subscriptions. 30-day money-back guarantee.",
    price_aux="Free tier: 10 conversions a day, every core feature included, no watermark.",
    faq_items=[
        ("Is CleanPaths a good CloudConvert alternative?",
         "For one specific job, yes: turning images into cut-ready DXF/SVG files. That's all CleanPaths does, and it does it locally in your browser. If you need to convert documents, video or audio — or you want a developer API for many formats — CloudConvert is the right tool and we won't pretend otherwise."),
        ("Why does \"no upload\" matter for client work?",
         "Because the moment a client's logo or unreleased artwork hits a third-party server, your confidentiality promise depends on someone else's retention policy. With CleanPaths there is no upload step — conversion runs on your device, and closing the tab removes every trace. It answers the NDA question by architecture, not by policy."),
        ("How much does CleanPaths cost compared to CloudConvert?",
         "CleanPaths is free for 10 conversions a day, and Pro is $59 one-time with a 30-day money-back guarantee — no credits, no metering. CloudConvert uses usage-based credits and monthly plans <span class='stat' style='border-color:var(--caution);color:var(--caution);background:var(--caution-soft)'>[待确认-落站前核实现行定价]</span>; check their current pricing for the exact math on your volume."),
        ("Can CleanPaths handle a compressed, noisy JPG?",
         "Yes — that's the case the preprocessing pipeline is built for. It denoises and upscales before tracing, then auto-tunes the trace parameters to your image. There's a limit — a 50px smudge has no detail to recover — but the preview shows you the result before you download, and trying it is free."),
        ("What DXF version do I get — R12 or R2000?",
         "Both, your choice. R2000 is the default and embeds units (mm/inch) so files open at the right size. R12 compatibility mode is there for older CAM software that only accepts the 1992-era format."),
        ("Do you upload or store my files?", PRIVACY_A),
        ("Can I convert a photo and cut it?",
         "You can convert it, but expect a stylized, posterized result — not cut-ready. The cut-ready promise covers flat-color graphics: logos, icons, screenshots, line art."),
    ],
    final_h2="Your client's logo never had to leave your machine. Keep it that way.",
    emphasize_row=0,
)

# ② optional enhancement: FAQ#2 (client work / NDA) as a body highlight card
CC_EXTRA = """
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="contrast">
      <span class="spec">Client work · NDA</span>
      <h2 style="margin:12px 0 16px">Why does "no upload" matter for client work?</h2>
      <p>Because the moment a client's logo or unreleased artwork hits a third-party server, your confidentiality promise depends on someone else's retention policy. With CleanPaths there is no upload step — conversion runs on your device, and closing the tab removes every trace. It answers the NDA question by architecture, not by policy.</p>
    </div>
  </div>
</section>"""

VAI = dict(
    meta_title="Vectorizer.ai Alternative with DXF Export | CleanPaths",
    meta_desc="Browser-based vectorizer with cut-ready DXF (R2000 + R12) and bad-image cleanup. No upload, no account. Pro $59 one-time — no subscriptions.",
    route="/vectorizer-ai-alternative", eyebrow="Vectorizer.ai alternative",
    h1="A Vectorizer.ai Alternative That Outputs Cut-Ready DXF",
    sub="Vectorizer.ai makes high-quality general-purpose vectors. CleanPaths makes cut files: DXF in two versions, closed color-separated paths, cleanup for bad images — all in your browser, with no upload.",
    intro_txt='"Vectorizer.ai is one of the better auto-tracers out there — the output quality is genuinely good. The friction starts later: when the vector has to become a DXF your cutter accepts, when the client\'s source image is a compressed mess, or when the monthly bill arrives for a tool you used twice."',
    pains_h2="Why makers look for a Vectorizer.ai alternative",
    pains_items=[
        ("A good vector is not automatically a cut file.", "General-purpose vectorization optimizes for how the result looks. Cutters need closed paths, sane layer counts, units in the file and CAD-friendly entities — a different finish line."),
        ("Recurring billing for occasional jobs.", "Vectorizer.ai is subscription-based <span class='stat' style='border-color:var(--caution);color:var(--caution);background:var(--caution-soft)'>[待确认-落站前核实现行定价]</span> — a rough fit for makers who convert a handful of logos a week and pay for the months in between."),
        ("Your artwork leaves your machine.", "Server-side processing means uploading every image — including client work you'd rather keep on your own hardware."),
    ],
    table_h2="Vectorizer.ai vs CleanPaths", competitor="Vectorizer.ai",
    rows=[
        ("Where files go", "Uploaded to Vectorizer.ai's servers",
         "✅ Nowhere — conversion runs 100% in your browser"),
        ("Output focus", "High-quality general-purpose vectors",
         "✅ Cut files: DXF in two versions, closed color-separated paths"),
        ("DXF dual version (R2000 with units / R12 mode)", tbd("待确认-落站前核实其 DXF 输出规格"),
         "✅ every tier, including free"),
        ("Bad-image cleanup", "Automated tracing pipeline; dedicated denoise/upscale step" + tbd("待确认-落站前核实"),
         "✅ Built-in: denoise + upscale + auto-tuned tracing"),
        ("Pricing", "Subscription-based" + tbd("待确认-落站前核实现行定价"),
         "✅ Free tier: 10 a day. Pro: $59, one time. 30-day money-back guarantee"),
        ("Account", "Required" + tbd("待确认-落站前核实"),
         "✅ No account, no watermark"),
    ],
    diff_items=[
        ("DXF built for cutters, in two versions.",
         "R2000 with units embedded so files open at the size you drew them; R12 compatibility mode for older CAM; closed paths; color-separated layers; all POLYLINE output with zero SPLINE entities — the file strict CAM software chokes on simply never gets written."),
        ("A cleanup pipeline before the trace.",
         "Denoise and upscale first, then trace with parameters tuned to your image. In our tests, that takes a compressed logo from 88 color layers down to as few as 9."),
        ("Local processing, one-time price.",
         "No upload step, no account, no recurring bill. Free for 10 conversions a day; Pro is $59 once, with a 30-day money-back guarantee."),
    ],
    price_main="Pro Core is $59, one time: a commercial license for client work and selling what you make, AI HD rescue for the worst images, and no daily cap. No subscriptions. 30-day money-back guarantee.",
    price_aux="One payment, and the meter stops existing. Free tier: 10 conversions a day, every core feature included, no watermark.",
    faq_items=[
        ("Is CleanPaths a good Vectorizer.ai alternative for cut files?",
         "Yes — that's the exact job it's built for. CleanPaths outputs DXF in two versions (R2000 with units, R12 compatibility mode) with closed, color-separated paths, and it cleans bad images before tracing. If you need general-purpose vector art for design work rather than a file for a cutter, Vectorizer.ai's output quality is genuinely strong."),
        ("What makes CleanPaths different from Vectorizer.ai?",
         "Three things: the output is tuned for cutting rather than looking (closed paths, units, layer separation, DXF R2000 + R12); bad images get a denoise-and-upscale cleanup pass before tracing; and everything runs locally in your browser — no upload, no account — at a one-time price instead of a recurring one."),
        ("How does CleanPaths pricing compare to Vectorizer.ai?",
         "CleanPaths is free for 10 conversions a day; Pro is $59 one-time with a 30-day money-back guarantee. Vectorizer.ai is subscription-based <span class='stat' style='border-color:var(--caution);color:var(--caution);background:var(--caution-soft)'>[待确认-落站前核实现行定价]</span> — check their current pricing for a like-for-like monthly comparison."),
        ("Can I switch from Vectorizer.ai to CleanPaths without losing anything?",
         "There's nothing to migrate. CleanPaths has no account and stores no files — you just drop your next image into the browser page. Anything you previously exported stays yours, on your machine."),
        ("My source image is small and compressed — will it still convert well?",
         "Usually, if it's a flat-color graphic. The preprocessing pipeline upscales and denoises before tracing, which is exactly the case it's built for. The preview shows you the layered result before you download, and trying it is free."),
        ("Do you upload or store my files?", PRIVACY_A),
        ("Can I convert a photo and cut it?",
         "You can convert it, but expect a stylized, posterized result — not cut-ready. The cut-ready promise covers flat-color graphics: logos, icons, screenshots, line art."),
    ],
    final_h2="The next logo you trace can stay on your machine.",
)

# ③ optional enhancement: technical footnote card for "all POLYLINE, zero SPLINE"
VAI_EXTRA = """
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="card">
      <span class="spec">Technical footnote · in our tests</span>
      <p style="margin-top:12px;font-size:16px;color:var(--ink-2)">All POLYLINE, zero SPLINE: every export is all POLYLINE — zero SPLINE entities — so the file that crashes strict CAM software simply never gets written. In our tests (ezdxf audit): 0 errors, 0 fixes.</p>
    </div>
  </div>
</section>"""

CV = dict(
    meta_title="Convertio Alternative for Cut-Ready DXF | CleanPaths",
    meta_desc="Convertio alternative built for makers: image to DXF/SVG in your browser, with cleanup for bad images. No upload, no account. Pro $59 one-time.",
    route="/convertio-alternative", eyebrow="Convertio alternative",
    h1="A Convertio Alternative Built for Cut Files, Not Just Conversions",
    sub="Convertio converts everything, on its servers. CleanPaths does one job — image to cut-ready DXF/SVG — entirely on your device. No upload, no account, no watermark.",
    intro_txt='"Convertio is the tool you bookmark for \'convert anything to anything.\' But a cut file isn\'t just a conversion — it\'s a manufacturing input. If your DXF has to survive LightBurn or a CNC controller, \'converted\' and \'cut-ready\' are two different finish lines."',
    pains_h2="Why makers look for a Convertio alternative",
    pains_items=[
        ("Conversion happens on their servers.", "Every image — including client logos and unreleased artwork — is uploaded before it's processed."),
        ("A generalist pipeline, not a cut-file pipeline.", "Documents, video, audio, images — Convertio covers them all, but image-to-DXF gets no closed-path post-processing, no units handling, no color-separated layers. <span class='stat' style='border-color:var(--caution);color:var(--caution);background:var(--caution-soft)'>[其 DXF 输出规格待确认-落站前核实]</span>"),
        ("The terms state no refunds.", "Convertio is one of the converter tools whose terms say purchases aren't refundable."),
        ("Recurring pricing for a job you do in bursts.", "Subscription-based plans <span class='stat' style='border-color:var(--caution);color:var(--caution);background:var(--caution-soft)'>[待确认-落站前核实现行定价]</span> make sense at volume — less so for a few client logos a week."),
    ],
    table_h2="Convertio vs CleanPaths", competitor="Convertio",
    rows=[
        ("Where files go", "Uploaded to Convertio's servers",
         "✅ Nowhere — conversion runs 100% in your browser"),
        ("Focus", "General format conversion: documents, video, audio, images",
         "✅ One job: image → cut-ready DXF/SVG, for makers and sellers"),
        ("DXF output", "General-purpose conversion; no cut-scene post-processing" + tbd("待确认-落站前核实其 DXF 输出规格"),
         "✅ R2000 (with units) + R12 mode, closed paths, color-separated layers"),
        ("Bad-image cleanup", "No image preprocessing step" + tbd("待确认-落站前核实"),
         "✅ Built-in: denoise + upscale + auto-tuned tracing"),
        ("Pricing", "Subscription-based" + tbd("待确认-落站前核实现行定价") + "; terms state no refunds",
         "✅ Free tier: 10 a day. Pro: $59, one time. 30-day money-back guarantee"),
        ("Account", "Required" + tbd("待确认-落站前核实"),
         "✅ No account, no watermark"),
    ],
    diff_items=[
        ("A cut file, not just a conversion.",
         "DXF in two versions — R2000 with units embedded, R12 compatibility mode for older CAM — with every path closed and layers separated by color. Output your cutter can follow, not a file that merely opens."),
        ("Cleanup for the images clients actually send.",
         "Denoise and upscale before tracing, with parameters tuned to your image — the fix for the compressed, screenshot-quality logos that arrive in your inbox."),
        ("Local, one-time, refundable.",
         "No upload step, no account, $59 once if you ever outgrow the free tier — and a 30-day money-back guarantee, because we'd rather earn your trust than lock you in."),
    ],
    price_main="Pro Core is $59, one time: a commercial license for client work and selling what you make, AI HD rescue for the worst images, and no daily cap. No subscriptions. 30-day money-back guarantee.",
    price_aux="Free tier: 10 conversions a day, every core feature included, no watermark. Convertio's terms state no refunds — ours are the opposite: 30 days, full refund, no questions asked.",
    faq_items=[
        ("Is CleanPaths really free?",
         "Yes — 10 conversions a day at full output quality, no watermark, no account. Every core feature is included: the cleanup pipeline, both DXF versions, layer preview. Pro exists for heavy shop workloads, not to unlock the basics."),
        ("Is CleanPaths a good Convertio alternative for image-to-DXF?",
         "For that specific job, yes — it's the only job CleanPaths does, and it does it locally in your browser with cut-scene post-processing (closed paths, units, color-separated layers). If you need to convert documents, video or audio, Convertio covers those and CleanPaths doesn't."),
        ("Do you upload my files?", PRIVACY_A),
        ("Can I sell what I make with the output?",
         "With any paid license, output is licensed for personal and commercial use — client orders, Etsy, your own shop. Free-tier output is for personal use. Full definition in Terms §3."),
        ("What DXF version do I get — R12 or R2000?",
         "Both, your choice. R2000 is the default and embeds units (mm/inch) so files open at the right size. R12 compatibility mode is there for older CAM software that only accepts the 1992-era format."),
        ("My logo file is a compressed screenshot — will it convert cleanly?",
         "Usually. The preprocessing pipeline denoises and upscales before tracing, and the parameters adapt to your image. The layer preview shows you the result before you download — trying it is free."),
        ("Can I convert a photo and cut it?",
         "You can convert it, but expect a stylized, posterized result — not cut-ready. The cut-ready promise covers flat-color graphics: logos, icons, screenshots, line art."),
    ],
    final_h2="That logo PNG sitting in your inbox? Convert it before the tab gets cold.",
)

def build_vm(): return build_comparison(**VM)
def build_cc(): return build_comparison(**CC, extra_html=CC_EXTRA)
def build_vai(): return build_comparison(**VAI, extra_html=VAI_EXTRA)
def build_cv(): return build_comparison(**CV)
