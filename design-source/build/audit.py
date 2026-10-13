#!/usr/bin/env python3
"""Audit: frozen-copy sentinels must appear verbatim; banned words must not."""
import os, re, sys, html as htmllib

BASE = os.path.join(os.path.dirname(__file__), "..", "pages")

def read(slug):
    with open(os.path.join(BASE, slug, "code.html"), encoding="utf-8") as f:
        return f.read()

def strip(html):
    t = re.sub(r"<[^>]+>", "", html)
    return htmllib.unescape(re.sub(r"\s+", " ", t))

# (slug, [verbatim sentinels from 05-copy-freeze / 03-compliance])
SENTINELS = {
 "home": [
   "Convert PNG, JPG, SVG to Cut-Ready DXF — Free, in Your Browser",
   "CleanPaths turns flat-color graphics into clean, closed-path cut files — with real DXF export — processed entirely on your device. No upload, no account, no watermark.",
   "Conversion runs 100% in your browser. There is no upload step — your files never leave your device. Close the tab and they're gone; we never had them.",
   "Drop a PNG, JPG or SVG here — or browse",
   "Convert now — free",
   "Flat-color graphics → cut-ready · Photos → stylized result",
   "Files stay on your device", "No account", "No watermark", "10 free conversions a day",
   "In our tests, a heavily compressed logo that default auto-tracing explodes into 88 messy color layers comes out with as few as 9 — closed paths, color-separated, no overlapping lines.",
   "DXF output, cut-ready preprocessing, R12 & R2000 dual export — what free SVG-only tracers don't do.",
   "Client images arrive broken",
   "A customer sends you a 150px JPG of their logo and expects a cut file by Friday.",
   "Inkscape can fix it — after you learn Inkscape.",
   "Generic auto-tracers hand you a vector, not a cut file: dozens of tangled layers, open paths, no units.",
   "Built for cut-ready, not just vector",
   "Output is the cut file.",
   "A preprocessing pipeline for bad images.",
   "Honest about limits.",
   "Three steps. No sign-up.",
   "That's the whole flow. No account, no watermark, and your file never left your device.",
   "Made for makers who ship",
   "Client mess in, cut-ready file out. Keep the order moving.",
   "See how sellers use it →",
   "Honest prep for digitizing — and a human digitizer when you need one.",
   "See embroidery prep →",
   "Free for 10 conversions a day — full quality, no watermark. Need more? CleanPaths Pro is $59, one time. No subscriptions. 30-day money-back guarantee.",
   "See pricing →",
   "Questions makers actually ask",
   "Do you upload or store my files?",
   "Why won't my SVG upload to Cricut Design Space?",
   "Why does my SVG show up as a black box in Cricut?",
   "Is this a free SVG design library?",
   "What's the catch with the free tier?",
   "Your next client image doesn't have to cost you an evening.",
   "Convert free now",
   "How did this one turn out?",
   "Cut-ready — it worked", "Close, but not quite", "Not usable",
   "Send feedback",
   "Files never leave your device · No account · No tracking cookies",
 ],
 "png-to-dxf": [
   "PNG to DXF Converter — Cut-Ready Output",
   "Drop a PNG, get a DXF that actually cuts — closed paths, color-separated layers, units embedded. Processed on your device, never uploaded.",
   "R12 compatibility mode available",
   "A PNG is a picture. Your cutter needs paths.",
   "From PNG to cut-ready DXF, in your browser",
   "Not sure? Keep R2000 — it carries units and opens correctly in LightBurn, AutoCAD and modern CAM. Choose R12 only when your software is older than the format.",
   "How to convert PNG to DXF (and get a file that cuts)",
   "No sign-up. No watermark. Your PNG never left your machine.",
   "Why not just use a free tracer?",
   "Free online tracers — including the open-source PixelToPath — stop at SVG.",
   "We give you a cut file.",
   "Free online tracers (e.g. PixelToPath online)",
   "Free for 10 conversions a day — every feature above included. Heavy day? Pro lifts the cap: $59, one time.",
   "Get CleanPaths Pro — $59, one time",
   "What DXF version do I get — R12 or R2000?",
   "Will the DXF work in LightBurn?",
   "That logo PNG sitting in your inbox? Convert it before the tab gets cold.",
   "Convert PNG free now",
 ],
 "jpg-to-dxf": [
   "JPG to DXF — Turn Client Photos of Logos into Cut Files",
   "JPGs arrive compressed, small and noisy.",
   "Clean up bad images (recommended)",
   "JPEG compression is the enemy of clean tracing",
   "Nobody sends you a clean JPG",
   "Cleanup and tracing in one pass",
   "Denoise + upscale first.",
   "Optional HD rescue.",
   "3 free tries, included in Pro",
   "How to convert JPG to DXF without the two-app dance",
   "Your photo never left your device — cleanup and tracing both run in your browser.",
   "10 free conversions a day, cleanup included. Client work piling up? Pro removes the cap and includes AI HD rescue — $59, one time.",
   "My JPG is a low-resolution photo of a logo — will it cut?",
   "What's AI HD rescue?",
   "The blurry JPG is not the problem. Waiting to fix it is.",
   "Convert JPG free now",
 ],
 "svg-to-dxf-converter": [
   "SVG to DXF Converter — R12 & R2000, Units Included",
   "Real DXF, not a renamed SVG: all POLYLINE with zero SPLINE entities",
   "Glowforge user? Glowforge imports SVG/PDF, not DXF",
   "Every export is all POLYLINE — zero SPLINE entities",
   "SVG speaks web. Your machine speaks DXF.",
   "A converter that respects both formats",
   "How to convert SVG to DXF",
   'What "real DXF" means here',
   "Free for 10 conversions a day — both DXF versions included. Pro removes the cap: $59, one time, no subscriptions.",
   "R12 or R2000 — which should I choose?",
   "Your CAM software called. It wants POLYLINEs.",
   "Convert SVG free now",
 ],
 "screenshot-to-svg": [
   "Screenshot to SVG — Clean Vector from Any UI Screenshot",
   "UI screenshots are the cleanest input a tracer can get",
   "Optimized for screenshots",
   "about 5 clean color layers",
   "Pixels don't scale. Vectors do.",
   "Purpose-tuned for screenshots",
   "Screenshot-optimized tracing.",
   "Need a DXF for a cutting machine? Run the result through our SVG to DXF converter →",
   "How to turn a screenshot into an SVG",
   "Free for 10 conversions a day. Pro removes the cap — $59, one time, no subscriptions.",
   "What screenshots convert best?",
   "Screenshots can contain sensitive UI — that's exactly why this runs on your device.",
   "That screenshot you just took is five seconds from being a vector.",
   "Convert screenshot free now",
 ],
 "jfif-to-jpg": [
   "JFIF to JPG Converter — Free, No Upload",
   "Drag in a JFIF, download a JPG.",
   "Why do I even have a JFIF file?",
   "This converter repackages it as a standard .jpg that everything accepts.",
   "Convert JFIF to JPG in three steps",
   "No upload. No account. No watermark. Free, 10 conversions a day.",
   "What is a JFIF file?",
   "only the packaging and extension differ",
   "Convert JFIF free now",
   "Versão em português: JFIF para JPG →",
 ],
 "pt-jfif-para-jpg": [
   "Conversor de JFIF para JPG — Grátis, sem Upload",
   "Arraste sua imagem JFIF e baixe o JPG em segundos.",
   "Arraste seu arquivo .jfif aqui — ou clique para escolher",
   "Converter agora — grátis",
   "Seus arquivos não saem do seu dispositivo",
   "Por que meu arquivo veio como JFIF?",
   "Como converter JFIF para JPG",
   "Sem upload. Sem cadastro. Sem marca d'água. Grátis, 10 conversões por dia.",
   "O que é um arquivo JFIF?",
   "Preciso criar conta?",
   "Tem limite de uso?",
   "Converter JFIF grátis agora",
   "Sem cookies de rastreamento",
   "Política de Privacidade",
   "English version",
 ],
 "samples": [
   "See the Difference: Before / After",
   "Every sample below started as the kind of image makers actually receive",
   "No photographs here: photos convert to stylized art, not cut-ready files",
   "The client special: 150px, saved as JPG, expected back as a cut file.",
   "Flat colors, sharp edges — the cleanest input there is.",
   "Sketches, stencils and scanned drawings, closed and cut-ready.",
   "Try this conversion free →",
   "Made something with CleanPaths? A user showcase is coming — tell us via the feedback form if you'd like your finished work featured.",
   "Low-res logos", "UI screenshots", "Line art & scans",
 ],
 "for-cricut-sellers": [
   "Cut-Ready SVG & DXF Files for Cricut Sellers",
   "Your customers send terrible images.",
   "Convert a client image free →",
   "CleanPaths is an independent tool, compatible with Cricut Design Space — not affiliated with or endorsed by Cricut.",
   "The images clients actually send",
   "A 150px logo JPG. A phone photo of a business card. A screenshot of a screenshot.",
   "SVG problems, diagnosed",
   "Why won't my SVG upload to Cricut Design Space?",
   "Glowforge rejected my SVG over 100 KB — what now?",
   "How small can I cut text and still read it?",
   "readable at 1.5–2 inches",
   "The small-cut workflow",
   "Selling every week? The math",
   "Pro is $59, one time: a commercial license for selling what you make",
   "you bought the rights for that moment in time",
   "Get CleanPaths Pro — $59, one time",
   "Can I sell products made from converted files?",
 ],
 "for-embroidery": [
   "From Image to Embroidery: Honest Prep, Human Digitizers",
   "We won't sell you a one-click \"image to PES\" button — because that button doesn't work.",
   "Prep your image free →",
   "Get a human digitizer quote →",
   "Why automatic digitizing doesn't work",
   "Embroidery isn't a file format problem — it's a physics problem.",
   "Satin stitches narrower than about 1 mm break.",
   "Ink/Stitch",
   "So we don't pretend.",
   "What we do instead — prep that saves digitizing mistakes",
   "Clean and simplify.",
   "Think in thread.",
   "Export a digitizer-ready SVG.",
   "When you need a human digitizer",
   "about $15 per design",
   "Disclosure: CleanPaths may earn a commission when you use a digitizing service we refer — at no extra cost to you. We only refer services we believe are relevant. (16 CFR Part 255)",
   "Can I convert PNG to PES directly?",
   "Do you have a stitchability checker?",
   "Get a digitizer quote →",
 ],
 "pricing": [
  "Simple, One-Time Pricing",
  "Built for sellers who clean client images every week — and sell what they make. A paid license makes your output officially commercial.",
  "Free for light use — full quality, no watermark, no account. One-time payment when your shop outgrows it. No subscriptions — ever.",
  "30-day money-back guarantee — no questions asked",
  "One-time payment, yours forever",
  "Files stay on your device",
  "No account needed",
  "10 conversions a day",
  "Full cut-ready output: DXF (R2000 + R12) and SVG",
  "AI HD rescue: 3 free tries",
  "Personal use",
  "Start converting — free",
  "Most shops pick this",
  "Commercial license — for client work and selling what you make",
  "No daily cap — convert all day",
  "License key by email — works offline after a one-time activation",
  "Get CleanPaths Pro — $59, one time",
  "Prefer to try first?",
  "Includes commercial use.",
  "Monthly Pass — $10/mo, credits toward one-time purchase",
   "For heavy shop workloads",
   "Batch Pack", "Precision Pack",
   "Add Batch Pack — $29, one time",
   "Add Precision Pack — $29, one time",
   "Everything — Pro Core + both packs — is $117, one time. That's the most this site will ever ask of you.",
   "The refund policy most converter tools won't give you",
   "Vector Magic and Convertio among them",
   "No forms, no retention scripts.",
   "$4–6 on Fiverr",
   "five months of Canva Pro ($13/mo)",
   "Where $59 sits",
   "Vector Magic Desktop",
   "$295",
   "$49.99–$99.99",
   "PixelToPath",
   "Is it really a one-time payment?",
  "Who processes my payment?",
  "What counts as commercial use?",
  "Start free. Upgrade when the orders say so.",
 ],
 "privacy": [
   "The one-line version: your files never leave your device — conversion happens in your browser, and there is no upload step. The details below are written to be read, not hidden.",
   "your files never leave your device",
   "A note on the feedback form",
   "Merchant of Record",
   "We do not use tracking cookies",
   "Cloudflare Web Analytics (Cloudflare) and our own first-party aggregate event counter",
   "cookieless, with no cross-site tracking and no personal profiles",
   "Aggregate page-view and funnel-event statistics only",
 ],
 "terms": [
   "The honest version of our quality boundaries lives here in plain English",
   "you always test-cut before production",
   "Your content — you own it",
   "keeps its commercial-use rights — you bought the rights for that moment in time",
   "Items you already sold stay sold",
   "any use connected with the sale or promotion of goods or services, or any use by or on behalf of a business entity",
   "Affiliate disclosure (FTC)",
   "16 CFR Part 255",
 ],
 "cookies": [
   "we don't use tracking cookies",
   "no cookie consent banner",
   "strictly necessary",
   "We use Cloudflare Web Analytics, a privacy-focused analytics tool that works without cookies",
   "collects only aggregate, anonymous statistics (page views, approximate region, device type)",
   "It does not identify you and does not follow you around the web.",
 ],
 "refund": [
   "30-day, no-questions-asked refund",
   "No reason required, no forms, no retention scripts.",
   "license key is deactivated",
   "Monthly Pass",
   "60 days",
 ],
}

BANNED = ["unlimited", "infinite", "lifetime", "guaranteed", "100% accurate", "official partner",
          "anonymous", "secure & private", "permanent guarantee"]

def main():
    fails = []
    texts = {}
    for slug, sents in SENTINELS.items():
        t = strip(read(slug))
        texts[slug] = t
        for s in sents:
            if s not in t:
                fails.append(f"[MISSING] {slug}: {s[:90]}")

    # ---------- §11 frozen strings: states boards + samples ----------
    def read_states(slug):
        with open(os.path.join(BASE, slug, "states.html"), encoding="utf-8") as f:
            return strip(f.read())

    CAP_EN = ["That's your 10 for today — the free counter resets tomorrow.",
              "On a deadline? Pro is built for client work — commercial license, AI HD rescue, and no daily cap. $59, one time. No subscriptions. 30-day money-back guarantee.",
              "FREE COUNTER RESETS DAILY · PRO: NO DAILY CAP",
              "Get CleanPaths Pro — $59, one time", "See pricing →"]
    CAP_EN_RAW = ["10 of 10 free conversions used today"]  # lives in aria-label attribute
    TRACE_STEPS = ["✓ Reading file (local)", "▸ Tracing paths — auto-tuned parameters", "○ Preparing download"]
    COMMON = ["RELEASE TO START", "Converting — on your device, nothing uploaded",
              "Choose another file", "✓ PRO ACTIVE", "no daily cap", "works offline after activation"]
    LAYERS_TPL = ["more layers, all closed paths"]  # multi-layer result lists only

    STATES = {
        "home": CAP_EN + COMMON + LAYERS_TPL + ["✓ Reading image (local)", "✓ Denoise + upscale",
                "▸ Tracing paths — auto-tuned parameters", "○ Building DXF (R2000, units embedded)",
                "That file can't be converted. This tool accepts PNG, JPG and SVG.",
                "Download DXF (R2000)", "Download DXF (R12)", "Download SVG", "Precision",
                "2 / 3 FREE TRIES LEFT"],
        "png-to-dxf": CAP_EN + COMMON + LAYERS_TPL + TRACE_STEPS + ["Download DXF (R2000)", "Download DXF (R12)",
                "Download SVG", "Precision", "This page accepts .PNG"],
        "jpg-to-dxf": CAP_EN + COMMON + LAYERS_TPL + TRACE_STEPS + ["Download DXF (R2000)", "Download DXF (R12)",
                "Download SVG", "Precision", "This page accepts .JPG"],
        "svg-to-dxf-converter": CAP_EN + COMMON + ["✓ Reading file (local)",
                "▸ Converting curves to polylines", "○ Preparing download",
                "Download DXF (R2000)", "Download DXF (R12)", "Download SVG", "Precision",
                "This page accepts .SVG"],
        "screenshot-to-svg": CAP_EN + COMMON + LAYERS_TPL + TRACE_STEPS + ["Download SVG", "Precision",
                "This page accepts .PNG"],
        "jfif-to-jpg": CAP_EN + COMMON + ["✓ Reading file (local)", "▸ Repackaging as JPG",
                "○ Preparing download", "Download JPG", "This page accepts .JFIF"],
        "pt-jfif-para-jpg": ["SOLTE PARA COMEÇAR", "Convertendo — no seu navegador, nada foi enviado",
                "✓ Lendo o arquivo (local)", "▸ Reempacotando como JPG", "○ Preparando o download",
                "Este arquivo não pode ser convertido aqui. Esta página aceita .JFIF. Nada foi enviado, então nada foi armazenado.",
                "Escolher outro arquivo", "Baixar JPG",
                "Você usou as 10 conversões grátis de hoje — o contador reinicia amanhã.",
                "Ver opções →", "CONTADOR GRATUITO REINICIA TODO DIA"],
    }
    NEGATIVE = {
        "svg-to-dxf-converter": ["Tracing paths"],
        # jfif: AI HD *feature block* must stay off this page — needle is the
        # feature-block description, not the bare name (Phase 2 conv line
        # legitimately mentions "AI HD rescue" as a Pro benefit, 05 v1.6 §D).
        "jfif-to-jpg": ["Precision", "runs on your device's GPU", "Tracing paths", "Download DXF"],
        "pt-jfif-para-jpg": ["$59", "Precision", "AI HD rescue", "Download DXF", "Tracing paths"],
    }
    for slug, sents in STATES.items():
        t = read_states(slug)
        with open(os.path.join(BASE, slug, "states.html"), encoding="utf-8") as f:
            raw_states = f.read()
        for s in sents:
            if s not in t:
                fails.append(f"[STATES-MISSING] {slug}: {s[:90]}")
        if slug != "pt-jfif-para-jpg":
            for s in CAP_EN_RAW:
                if s not in raw_states:
                    fails.append(f"[STATES-MISSING-ATTR] {slug}: {s[:90]}")
        for n in NEGATIVE.get(slug, []):
            if n in t:
                fails.append(f"[STATES-SHOULD-NOT-CONTAIN] {slug}: {n}")

    # /samples: visible SYNTHETIC SAMPLE tag per card (9) + cricut embeds (3)
    raw_samples = read("samples")
    n_synth = raw_samples.count("SYNTHETIC SAMPLE")
    if n_synth != 9:
        fails.append(f"[SYNTHETIC-TAG] samples: expected 9 visible tags, got {n_synth}")
    raw_cricut = read("for-cricut-sellers")
    n_synth_c = raw_cricut.count("SYNTHETIC SAMPLE")
    if n_synth_c != 3:
        fails.append(f"[SYNTHETIC-TAG] for-cricut-sellers: expected 3 visible tags, got {n_synth_c}")

    # §11.1 comparison cell
    for slug in ("png-to-dxf", "jpg-to-dxf", "svg-to-dxf-converter"):
        if "Limited (default settings)" not in texts[slug]:
            fails.append(f"[MISSING] {slug}: 'Limited (default settings)'")
        if "Partial (default settings)" in texts[slug]:
            fails.append(f"[STALE] {slug}: 'Partial (default settings)' still present")

    # ---------- 06c structure assertions (presence only; [PENDING-05c] strings not copy-asserted) ----------
    for slug in SENTINELS:
        raw = read(slug)
        for needle in ("fab-feedback", 'id="feedback-modal"'):
            if needle not in raw:
                fails.append(f"[06C] {slug} missing {needle}")
        if slug == "pt-jfif-para-jpg":
            if "social-slots" in raw:
                fails.append("[06C] PT page must NOT carry social slots (neutral tool page)")
        else:
            if "social-slots" not in raw:
                fails.append(f"[06C] {slug} missing footer social slots")
    for slug in ("home", "png-to-dxf", "jpg-to-dxf", "svg-to-dxf-converter", "screenshot-to-svg", "jfif-to-jpg", "pt-jfif-para-jpg"):
        with open(os.path.join(BASE, slug, "states.html"), encoding="utf-8") as f:
            rs = f.read()
        for needle in ("share-block", "feedback FAB — 4 states", "feedback modal — 4 states"):
            if needle not in rs:
                fails.append(f"[06C] {slug}/states.html missing {needle}")
    if 'id="community"' not in read("samples"):
        fails.append("[06C] /samples missing Community slot")
    if "Featured examples" not in texts["home"]:
        fails.append("[06C] home missing Featured examples strip")

    # ---------- §12 frozen strings (28 strings, EN+PT) — positive sentinels ----------
    import urllib.parse
    def raw(slug, fn="code.html"):
        with open(os.path.join(BASE, slug, fn), encoding="utf-8") as f:
            return urllib.parse.unquote(f.read())

    EN_MODAL = [  # in every EN page code.html
        "Bugs, ideas, praise, anything — it lands on my workbench, not in a ticket queue.",
        "What worked, what didn't…",
        "Email or handle (optional — only if you'd like a reply)",
        "No contact info needed — please don't include personal info you don't want to share. We auto-attach this page and your language, never your files. We never see your files.",
        "Idea", "Bug", "Praise", "Other",
        "Open feedback", "Close feedback dialog", "Open the feedback dialog →",
    ]
    for slug in SENTINELS:
        if slug == "pt-jfif-para-jpg":
            continue
        t = strip(raw(slug))
        r = raw(slug)
        for s in EN_MODAL:
            if s not in t and s not in r:
                fails.append(f"[S12-EN] {slug}: {s[:70]}")
    PT_PAGE = [  # pt page code.html
        "Bugs, ideias, elogios — cai direto na minha bancada, não numa fila de tickets.",
        "O que funcionou, o que não funcionou…",
        "E-mail ou usuário (opcional — só se quiser resposta)",
        "Não é preciso deixar contato — não inclua dados pessoais que você não quer compartilhar. Anexamos esta página e seu idioma automaticamente, nunca seus arquivos. Nós nunca vemos seus arquivos.",
        "Ideia", "Elogio", "Outro",
        "Abrir feedback", "Fechar feedback", "Enviar feedback",
    ]
    pt_t, pt_r = strip(raw("pt-jfif-para-jpg")), raw("pt-jfif-para-jpg")
    for s in PT_PAGE:
        if s not in pt_t and s not in pt_r:
            fails.append(f"[S12-PT] pt code.html: {s[:70]}")

    EN_STATES_S12 = [  # every EN tool states.html
        "Share your result", "Copy link", "Post to X", "Download share image",
        "Feature my result on the examples wall",
        "Off by default. If you check it, we confirm by email before anything goes up — leave a contact in the feedback form.",
        "Just turned a messy image into clean vector layers — in my browser, no upload. cleanpaths.io",
        "That didn't send — try again, or email feedback@cleanpaths.io directly.",
        "Try again",
        "Thanks — this goes straight to the person building CleanPaths.",
    ]
    PT_STATES_S12 = [
        "Compartilhe seu resultado", "Copiar link", "Postar no X", "Baixar imagem para compartilhar",
        "Mostrar meu resultado no mural de exemplos",
        "Desativado por padrão. Se marcar, confirmamos por e-mail antes de publicar — deixe um contato no formulário de feedback.",
        "Converti minha imagem em camadas vetoriais limpas — direto no navegador, sem upload. cleanpaths.io",
        "Não foi possível enviar — tente de novo, ou escreva para feedback@cleanpaths.io.",
        "Tentar de novo",
        "Obrigado — vai direto para a pessoa que está construindo o CleanPaths.",
        "Enviar feedback",
    ]
    for slug in ("home", "png-to-dxf", "jpg-to-dxf", "svg-to-dxf-converter", "screenshot-to-svg", "jfif-to-jpg"):
        t = strip(raw(slug, "states.html")); r = raw(slug, "states.html")
        for s in EN_STATES_S12:
            if s not in t and s not in r:
                fails.append(f"[S12-EN-STATES] {slug}: {s[:70]}")
    t = strip(raw("pt-jfif-para-jpg", "states.html")); r = raw("pt-jfif-para-jpg", "states.html")
    for s in PT_STATES_S12:
        if s not in t and s not in r:
            fails.append(f"[S12-PT-STATES]: {s[:70]}")

    # C group (EN only)
    for s in ["Featured examples", "See all before / after →"]:
        if s not in texts["home"]:
            fails.append(f"[S12-C] home: {s}")
    for s in ["Community", "Real maker results land here — featured only with explicit opt-in. Nothing yet: the wall opens when the first makers say yes.",
              "Reserved — opens on first opt-ins",
              "Hexagon badge logo", "Coffee mark logo", "Mountain mark logo",
              "Dashboard UI", "Mobile app screen", "Settings panel",
              "Flower line art", "Rocket stencil", "Geometric deer"]:
        if s not in texts["samples"]:
            fails.append(f"[S12-C] samples: {s[:70]}")

    # ---------- §12.8-5 negative assertions ----------
    # anonymous/Anônimo in feedback context — whole site except frozen legal pages (privacy/cookies)
    for slug in SENTINELS:
        if slug in ("privacy", "cookies"):
            continue
        for fn in (["code.html", "states.html"] if os.path.exists(os.path.join(BASE, slug, "states.html")) else ["code.html"]):
            low = raw(slug, fn).lower()
            if "anonymous" in low or "anônimo" in low:
                fails.append(f"[S12-NEG] {slug}/{fn}: anonymous/Anônimo present")
    # B5 old drafts must be gone
    for slug in ("home", "png-to-dxf", "jpg-to-dxf", "svg-to-dxf-converter", "screenshot-to-svg", "jfif-to-jpg", "pt-jfif-para-jpg"):
        r = raw(slug, "states.html")
        if "cut-ready file — in my browser" in r:
            fails.append(f"[S12-NEG] {slug}: old EN B5 draft present")
        if "Converti minha imagem direto no navegador" in r:
            fails.append(f"[S12-NEG] {slug}: old PT B5 draft present")

    # banned words across all pages ('anonymous' handled strictly above per §12.8-5;
    # privacy/cookies analytics wording amended 2026-10-13 for CF WA; anonymous wording
    # remains limited to legal pages pending further zhongshu wording review)
    for slug in list(SENTINELS):
        t = texts[slug].lower()
        for b in BANNED:
            if b == "anonymous" and slug in ("privacy", "cookies"):
                continue
            if b in t:
                fails.append(f"[BANNED] {slug}: '{b}' found")
        # subscription allowed only in negations or the pricing FAQ question
        for m in re.finditer(r"subscription", t):
            ctx = t[max(0, m.start()-40):m.end()+20]
            if not ("no subscriptions" in ctx or "do subscriptions" in ctx or "offer subscriptions?" in ctx):
                fails.append(f"[SUBSCRIPTION-CTX] {slug}: ...{ctx}...")
    # entry matrix: every EN page footer must link all core routes
    core = ["../png-to-dxf/code.html", "../jpg-to-dxf/code.html", "../svg-to-dxf-converter/code.html",
            "../screenshot-to-svg/code.html", "../jfif-to-jpg/code.html", "../samples/code.html",
            "../for-cricut-sellers/code.html", "../for-embroidery/code.html", "../pricing/code.html",
            "../privacy/code.html", "../terms/code.html", "../cookies/code.html", "../refund/code.html"]
    for slug in SENTINELS:
        raw = read(slug)
        if slug == "pt-jfif-para-jpg":
            continue  # PT neutral page has minimal nav by design
        for c in core:
            if c not in raw:
                fails.append(f"[ROUTE-LINK] {slug} missing link {c}")
    if fails:
        print("\n".join(fails))
        print(f"\n{len(fails)} FAILURES")
        sys.exit(1)
    print("AUDIT PASS: all sentinels verbatim, no banned words, route matrix complete")

if __name__ == "__main__":
    main()
