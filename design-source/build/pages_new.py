#!/usr/bin/env python3
"""06f new pages: /jfif-to-png (EN) + /pt/jfif-para-png (PT) + /webp-to-svg (EN) + /pt/webp-para-svg (PT).
Copy verbatim from 05-copy-freeze-v1.8-newpages-addendum.md (§A/§B).
PT dropzone button = "Converter grátis" per zhongshu ruling (overrides v1.8 §E-2 registration).
[PENDING-06f] strings: states-board steps/download labels for the two new tools — see 06f return table."""
from components import *
from states_common import (generic_states, JPG_DL_BTNS, PT_DL_BTNS, SVG_DL_BTNS, JFIF_LAYERS_EN,
                           STEPS_JFIF, STEPS_TRACE, STEPS_PT)

def faq_std_answer():
    return ('No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store '
            'your images or the files you generate. Close the tab and they\'re gone; we never had them. This is how '
            'the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>.')

PT_PRIVACY_A = ("Não. A conversão acontece inteiramente no seu navegador — não existe etapa de upload. "
                "Nós não recebemos, não vemos e não armazenamos suas imagens. É assim que a ferramenta é "
                "construída, não é só uma frase de marketing. Detalhes na <a href=\"../privacy/code.html\">Política de Privacidade</a>.")

def pt_header(route_en):
    """Minimal PT header (language switch + privacy), same pattern as /pt/jfif-para-jpg."""
    return None  # handled by page(lang="pt") via components.header

# ============================================================ /jfif-to-png (EN)
def build_jfif_png():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:820px">
    <div class="hero__eyebrow"><span class="spec">JFIF → PNG · instant conversion</span></div>
    <h1>JFIF to PNG Converter — Free, No Upload</h1>
    <p class="hero__sub">Drag in a JFIF, download a PNG. The conversion happens entirely in your browser — there's no upload step, and nothing to sign up for.</p>
    <div style="margin-top:32px">{dropzone(accept=".jfif", dz_text="Drop a .jfif file here — or browse", btn="Convert now — free", micro=None)}</div>
  </div>
</section>"""
    explainer = """
<section class="section">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Explainer</span>
    <h2 style="margin-top:12px">Why convert JFIF to PNG?</h2>
    <p style="color:var(--ink-2);max-width:62em">JFIF is the original JPEG interchange format — some apps and browsers still save images with the .jfif extension, and plenty of tools refuse to open them. PNG is the most widely accepted lossless image format: converting decodes the JPEG pixels inside your JFIF and stores them without adding new compression loss. One honest note: PNG can't bring back quality the original JPEG compression already removed, and it doesn't add transparency — you get the same picture, in a container everything opens.</p>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">Convert JFIF to PNG in three steps</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your .jfif file.</h3></li>
      <li><h3>It converts in your browser — instantly.</h3></li>
      <li><h3>Download the .png.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">No upload. No account. No watermark. Free, 10 conversions a day.</p>
  </div>
</section>"""
    faq_items = [
        ("What is a JFIF file?",
         "JFIF (JPEG File Interchange Format) is the original container for JPEG images. The image data is identical to a JPG — only the packaging and extension differ. Some Windows apps and older browsers still save images as .jfif."),
        ("How to open a JFIF file",
         "Often you don't need a converter at all — rename the file from .jfif to .jpg and most apps will open it, or drag it into any modern browser. When a tool refuses the file or you need a different format, convert it: this page gives you a PNG, and our <a href=\"../jfif-to-jpg/code.html\">JFIF to JPG converter</a> gives you a standard .jpg. Both run locally in your browser — no upload step."),
        ("Will converting JFIF to PNG reduce quality?",
         "No new loss is added: the JPEG pixels inside your JFIF are decoded and stored in PNG's lossless format. What PNG can't do is bring back detail the original JPEG compression already discarded — the result looks exactly like the JFIF, just in a format more tools accept. The preview shows the result before you download."),
        ("Will the PNG have a transparent background?",
         "No. JFIF/JPEG doesn't store transparency, so there is no alpha channel to carry over — the PNG keeps the same solid pixels. Transparent cut-outs require background removal, which this converter doesn't do."),
        ("Why PNG instead of JPG?",
         "Both formats fix the JFIF problem — it depends what you do next. JPG keeps files small and opens everywhere. PNG is lossless and is what most editors and design tools prefer; if you plan to edit or re-export the image, PNG avoids stacking new compression on top of old. If you just need the file to open, our <a href=\"../jfif-to-jpg/code.html\">JFIF to JPG converter</a> does that too."),
        ("Do you upload or store my files?", faq_std_answer()),
        ("Is there a limit?",
         "Free, 10 conversions a day, no account needed. Heavy users can remove the cap with Pro — $59, one time — via the pricing page."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap" style="max-width:820px"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    links = f"""
<section class="section--tight"><div class="wrap" style="max-width:820px">
  <p style="font-size:15.5px;color:var(--ink-2)">Need a JPG instead? Try the <a href="{href('/jfif-to-jpg')}">JFIF to JPG converter</a> → ｜ <a href="{href('/')}">All converters live on the CleanPaths home page</a> →</p>
</div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <a class="btn btn--primary btn--lg" href="#convert">Convert JFIF to PNG free now</a>
  </div>
</section>"""
    body = hero + explainer + how + faq_sec + links + final
    return page("JFIF to PNG Converter — Free, No Upload | CleanPaths",
                "Convert JFIF to PNG free, right in your browser. No upload, no account, no watermark — your files never leave your device.",
                body, active_route="/jfif-to-png")

# [PENDING-06f] states strings for JFIF→PNG (decode→PNG encode, NOT repackaging)
JFIF2PNG_STEPS_EN = ["✓ Reading file (local)", "▸ Converting to PNG", "○ Preparing download"]
PNG_DL_BTN = '<button class="btn btn--primary" type="button">Download PNG</button>'

def build_jfif_png_states():
    layers = '<li><span class="sw" style="background:#E0E4EA"></span>decoded + stored as lossless .png · same pixels, no new compression</li>'
    return generic_states("/jfif-to-png", ".JFIF", "ui-settings_before.png", "ui-settings_before.png",
                          layers, PNG_DL_BTN, steps=JFIF2PNG_STEPS_EN, error_ext=".JFIF",
                          show_precision=False, show_ai_hd=False)

# ============================================================ /pt/jfif-para-png
def build_pt_jfif_png():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:820px">
    <div class="hero__eyebrow"><span class="spec">JFIF → PNG · conversão instantânea</span></div>
    <h1>Conversor de JFIF para PNG — Grátis, sem Upload</h1>
    <p class="hero__sub">Arraste sua imagem JFIF e baixe o PNG em segundos. A conversão acontece 100% no seu navegador — não existe etapa de upload.</p>
    <div style="margin-top:32px">
      <div class="dropzone matgrid" id="convert">
        {UPLOAD_ICON}
        <div class="dz-text">Arraste seu arquivo .jfif aqui — ou clique para escolher</div>
        <div class="dz-or">— ou —</div>
        <button class="btn btn--primary btn--lg" type="button">Converter grátis</button>
        <div class="dz-formats">ACEITA: .JFIF · PROCESSADO LOCALMENTE</div>
      </div>
      <div style="margin-top:14px"><div class="badges"><span class="badge">🔒 Seus arquivos não saem do seu dispositivo</span><span class="badge">Sem cadastro</span><span class="badge">Sem marca d'água</span></div></div>
    </div>
  </div>
</section>"""
    explainer = """
<section class="section">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Explicação</span>
    <h2 style="margin-top:12px">Por que converter JFIF para PNG?</h2>
    <p style="color:var(--ink-2);max-width:62em">JFIF é o formato original de intercâmbio de imagens JPEG — alguns aplicativos e navegadores ainda salvam imagens com a extensão .jfif, e muitos programas se recusam a abri-las. PNG é o formato de imagem sem perdas mais aceito: a conversão decodifica os pixels JPEG dentro do seu JFIF e os armazena sem adicionar nova perda de compressão. Um aviso honesto: o PNG não recupera a qualidade que a compressão JPEG original já removeu, e não adiciona transparência — você recebe a mesma imagem, num contêiner que tudo abre.</p>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Passo a passo</span>
    <h2 style="margin-top:12px">Como converter JFIF para PNG</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Arraste seu arquivo .jfif.</h3></li>
      <li><h3>A conversão acontece no seu navegador — na hora.</h3></li>
      <li><h3>Baixe o .png.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">Sem upload. Sem cadastro. Sem marca d'água. Grátis, 10 conversões por dia.</p>
  </div>
</section>"""
    faq_items = [
        ("O que é um arquivo JFIF?",
         "JFIF (JPEG File Interchange Format) é o contêiner original para imagens JPEG. Os dados da imagem são idênticos aos de um JPG — só mudam a embalagem e a extensão. Alguns aplicativos do Windows e navegadores antigos ainda salvam imagens como .jfif."),
        ("Como abrir um arquivo JFIF",
         "Muitas vezes você nem precisa de conversor — renomeie o arquivo de .jfif para .jpg e a maioria dos programas abre, ou arraste-o para qualquer navegador moderno. Quando um programa recusa o arquivo ou você precisa de outro formato, converta: esta página gera um PNG, e o nosso <a href=\"../pt-jfif-para-jpg/code.html\">conversor de JFIF para JPG</a> gera um .jpg padrão. Ambos rodam localmente no seu navegador — sem etapa de upload."),
        ("A conversão para PNG reduz a qualidade?",
         "Nenhuma perda nova é adicionada: os pixels JPEG dentro do seu JFIF são decodificados e armazenados no formato PNG, que é sem perdas. O que o PNG não faz é recuperar detalhes que a compressão JPEG original já descartou — o resultado fica exatamente igual ao JFIF, só que num formato que mais programas aceitam. A pré-visualização mostra o resultado antes de você baixar."),
        ("O PNG terá fundo transparente?",
         "Não. JFIF/JPEG não armazena transparência, então não há canal alfa para aproveitar — o PNG mantém os mesmos pixels sólidos. Recortes transparentes exigem remoção de fundo, que este conversor não faz."),
        ("Por que PNG em vez de JPG?",
         "Os dois formatos resolvem o problema do JFIF — depende do que você fará depois. JPG mantém os arquivos pequenos e abre em tudo. PNG é sem perdas e é o que a maioria dos editores prefere; se você vai editar ou reexportar a imagem, o PNG evita empilhar compressão nova sobre a antiga. Se você só precisa abrir o arquivo, o nosso conversor de JFIF para JPG também resolve."),
        ("Meu arquivo é enviado para algum servidor?", PT_PRIVACY_A),
        ("Tem limite de uso?", "Grátis, 10 conversões por dia, sem cadastro."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap" style="max-width:820px"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <a class="btn btn--primary btn--lg" href="#convert">Converter JFIF para PNG grátis</a>
  </div>
</section>"""
    body = hero + explainer + how + faq_sec + final
    return page("JFIF para PNG — Conversor Grátis, sem Upload",
                "Converta JFIF para PNG grátis, direto no navegador. Sem upload, sem cadastro, sem marca d'água — seus arquivos nunca saem do seu dispositivo.",
                body, active_route="/pt/jfif-para-png", lang="pt")

# [PENDING-06f] PT states steps for JFIF→PNG
JFIF2PNG_STEPS_PT = ["✓ Lendo o arquivo (local)", "▸ Convertendo para PNG", "○ Preparando o download"]
PNG_DL_BTN_PT = '<button class="btn btn--primary" type="button">Baixar PNG</button>'

def build_pt_jfif_png_states():
    layers = '<li><span class="sw" style="background:#E0E4EA"></span>decodificado e salvo como .png sem perdas · mesmos pixels, sem nova compressão</li>'
    return generic_states("/pt/jfif-para-png", ".JFIF", "ui-settings_before.png", "ui-settings_before.png",
                          layers, PNG_DL_BTN_PT, steps=JFIF2PNG_STEPS_PT, lang="pt", error_ext=".JFIF",
                          show_precision=False, show_ai_hd=False)


# ============================================================ /webp-to-svg (EN)
def build_webp():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><span class="spec">WEBP → SVG · decoded natively in your browser</span></div>
      <h1>WebP to SVG Converter — Cut-Ready Output</h1>
      <p class="hero__sub">Drop a WebP, get a clean SVG that actually cuts — closed paths, color-separated layers. Processed on your device, never uploaded.</p>
    </div>
    <div>{dropzone(accept=".webp", dz_text="Drop a WebP here — or browse")}</div>
  </div>
</section>"""
    proof = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof — in our tests</span>
    <div class="proof" style="margin-top:20px">
      <div>
        <p class="proof__quote">"In our tests, a heavily compressed logo that default auto-tracing explodes into <span class="hl">88 messy color layers</span> comes out with <span class="hl">as few as 9</span> — closed paths, color-separated, no overlapping lines."</p>
        <div class="stats" style="margin-top:16px">
          <span class="stat">BEFORE <b>88 color layers</b></span>
          <span class="stat">AFTER <b>as few as 9 layers</b></span>
          <span class="stat">CLOSED PATHS <b>✓</b></span>
        </div>
      </div>
      <div class="ba">
        <div class="ba__imgs">
          <img src="../../assets/samples/logo-acme_before.png" alt="Compressed WebP/JPG-style logo input (synthetic sample)">
          <img src="../../assets/samples/logo-acme_after.png" alt="Same logo after cleanup pipeline (synthetic sample)">
        </div>
        <div class="ba__divider"></div><div class="ba__handle">⇔</div>
        <span class="ba__tag ba__tag--before">BEFORE</span><span class="ba__tag ba__tag--after">AFTER</span>
        <span class="synth-tag">SYNTHETIC SAMPLE</span>
      </div>
    </div>
  </div>
</section>"""
    problem = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">The problem</span>
    <h2 style="margin-top:12px">WebP is built for the web. Your cutter needs paths.</h2>
    <ul class="plist" style="margin-top:12px">
      <li>"You saved a logo or icon from the web and it came down as .webp — great for browsers, useless for cut software."</li>
      <li>"Your plotter, laser or CNC can't read pixels — it follows paths. A raw auto-trace gives you thousands of loose segments."</li>
      <li>"And most of them want your file on their server first."</li>
    </ul>
  </div>
</section>"""
    solution = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The pipeline</span>
    <h2 style="margin-top:12px">From WebP to cut-ready SVG, in your browser</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Clean the image first:</h3><p>denoise and upscale before a single path is traced.</p></li>
      <li><h3>Trace with parameters tuned to your image</h3><p>— not one-size-fits-all defaults.</p></li>
      <li><h3>Export clean SVG:</h3><p>closed, color-separated paths that open in any vector editor — ready for Cricut Design Space, or convert to DXF for machines that need it.</p></li>
    </ol>
  </div>
</section>"""
    honesty = """
<section class="section" style="padding-top:0">
  <div class="wrap">
    <h2>An honest note before you convert</h2>
    <div class="info-strip" style="border-color:var(--caution);background:var(--caution-soft)">
      <span class="i" style="background:var(--caution)">!</span>
      <span>Best on flat-color graphics — logos, icons, screenshots, line art: output is designed to be cut-ready. Photos come out stylized (posterized), not cut-ready — we'll tell you which one you have before you convert.</span>
    </div>
  </div>
</section>"""
    how = f"""
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">How to convert WebP to SVG (and get a file that cuts)</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your WebP.</h3></li>
      <li><h3>Check the layer preview; slide precision if you want a smaller or smoother file.</h3></li>
      <li><h3>Download the SVG — done.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">No sign-up. No watermark. Your WebP never left your machine.</p>
    <div class="info-strip" style="margin-top:24px"><span class="i">→</span><span>Need DXF for LightBurn, AutoCAD or CNC CAM? Run the result through our <a href="{href('/svg-to-dxf-converter')}">SVG to DXF converter →</a></span></div>
  </div>
</section>"""
    dxfblock = f"""
<section class="section">
  <div class="wrap">
    <span class="spec">Output note</span>
    <h2 style="margin-top:12px">Need DXF instead of SVG?</h2>
    <div class="info-strip"><span class="i">i</span><span>This page outputs SVG. Some machines — LightBurn, AutoCAD, most CNC CAM — speak DXF. Run your new SVG through our <a href="{href('/svg-to-dxf-converter')}">SVG to DXF converter</a>: R2000 with units for modern software, R12 compatibility mode for older CAM. Working with PNGs rather than WebP? The <a href="{href('/png-to-dxf')}">PNG to DXF converter</a> goes straight to DXF.</span></div>
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
        ("What is a WebP file?",
         "WebP is Google's image format for the web — smaller files, supported by every modern browser. Many sites serve images as .webp without telling you, so downloads often arrive in that format. Your browser reads it natively, which is why this converter runs entirely on your device."),
        ("What converts best from WebP to SVG?",
         "Flat-color graphics — logos, icons, stickers, line art: output is designed to be cut-ready. Photos come out stylized (posterized), not cut-ready — the preview tells you which one you have before you convert."),
        ("Can I convert a WebP photo to SVG?",
         "You can, but expect a stylized, posterized result — not cut-ready. This page's promise covers flat-color graphics: logos, icons, line art."),
        ("Will the SVG work with my cutting machine?",
         'It depends on the machine. Cricut Design Space imports SVG directly. LightBurn, AutoCAD and most CNC CAM prefer DXF — run the SVG through our <a href="../svg-to-dxf-converter/code.html">SVG to DXF converter</a>, which offers R2000 with units and R12 compatibility mode. Always run a test cut before production.'),
        ("Can I edit the SVG afterwards?",
         "Yes — output is color-separated vector layers that open in Inkscape, Illustrator, Figma and any SVG editor."),
        ("Do you upload or store my WebP?", faq_std_answer()),
        ("Is there a daily limit?",
         "Free tier: 10 conversions a day, full quality. Pro removes the cap — $59, one time, no subscriptions."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>That WebP you just saved? Convert it before the tab gets cold.</h2>
    <a class="btn btn--primary btn--lg" href="#convert">Convert WebP to SVG free now</a>
  </div>
</section>"""
    body = hero + proof + problem + solution + honesty + how + dxfblock + pricing + faq_sec + final
    return page("WebP to SVG Converter — Cut-Ready & Free | CleanPaths",
                "Convert WebP to SVG with closed paths and color-separated layers. Free, in your browser — no upload, no account, no watermark.",
                body, active_route="/webp-to-svg")

def build_webp_states():
    # §11.3 trace trio reused (tracing applies); SVG-only downloads; no DXF version selector anywhere
    layers = """
<li><span class="sw" style="background:#1F4E79"></span>layer-1 · #1F4E79 · closed</li>
<li><span class="sw" style="background:#F08F1C"></span>layer-2 · #F08F1C · closed</li>
<li style="color:var(--ink-3)">… 7 more layers, all closed paths</li>"""
    return generic_states("/webp-to-svg", ".WEBP", "logo-acme_before.png", "logo-acme_after.png",
                          layers, SVG_DL_BTNS, steps=STEPS_TRACE, error_ext=".WEBP")

# ============================================================ /pt/webp-para-svg
def build_pt_webp():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:820px">
    <div class="hero__eyebrow"><span class="spec">WEBP → SVG · decodificado no seu navegador</span></div>
    <h1>Conversor de WebP para SVG — Grátis, sem Upload</h1>
    <p class="hero__sub">Arraste sua imagem WebP e baixe um SVG limpo em segundos. A conversão acontece 100% no seu navegador — não existe etapa de upload.</p>
    <div style="margin-top:32px">
      <div class="dropzone matgrid" id="convert">
        {UPLOAD_ICON}
        <div class="dz-text">Arraste seu arquivo .webp aqui — ou clique para escolher</div>
        <div class="dz-or">— ou —</div>
        <button class="btn btn--primary btn--lg" type="button">Converter grátis</button>
        <div class="dz-formats">ACEITA: .WEBP · PROCESSADO LOCALMENTE</div>
        <div style="margin-top:12px"><span class="microcopy">Gráficos de cores chapadas → <b>pronto para corte</b> · Fotos → <b>resultado estilizado</b></span></div>
      </div>
      <div style="margin-top:14px"><div class="badges"><span class="badge">🔒 Seus arquivos não saem do seu dispositivo</span><span class="badge">Sem cadastro</span><span class="badge">Sem marca d'água</span></div></div>
    </div>
  </div>
</section>"""
    explainer = """
<section class="section">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Explicação</span>
    <h2 style="margin-top:12px">Por que converter WebP para SVG?</h2>
    <p style="color:var(--ink-2);max-width:62em">WebP é o formato de imagem do Google para a web — arquivos menores, suportado por todos os navegadores modernos. Muitos sites servem imagens como .webp sem avisar, então downloads chegam nesse formato. Para cortar ou editar como vetor, você precisa de SVG: este conversor transforma o WebP em um SVG com camadas separadas por cor, direto no seu navegador.</p>
  </div>
</section>"""
    honesty = """
<section class="section" style="padding-top:0">
  <div class="wrap" style="max-width:820px">
    <h2>Um aviso honesto antes de converter</h2>
    <div class="info-strip" style="border-color:var(--caution);background:var(--caution-soft)">
      <span class="i" style="background:var(--caution)">!</span>
      <span>Funciona melhor com gráficos de cores chapadas — logos, ícones, capturas de tela, line art: o resultado é projetado para corte. Fotos saem estilizadas (posterizadas), não prontas para corte — avisamos qual dos dois você tem antes de converter.</span>
    </div>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Passo a passo</span>
    <h2 style="margin-top:12px">Como converter WebP para SVG</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Arraste seu arquivo .webp.</h3></li>
      <li><h3>A conversão acontece no seu navegador — na hora.</h3></li>
      <li><h3>Baixe o .svg.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">Sem upload. Sem cadastro. Sem marca d'água. Grátis, 10 conversões por dia.</p>
  </div>
</section>"""
    dxfblock = """
<section class="section">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Nota de saída</span>
    <h2 style="margin-top:12px">Precisa de DXF em vez de SVG?</h2>
    <div class="info-strip"><span class="i">i</span><span>Esta página gera SVG. Algumas máquinas — LightBurn, AutoCAD, a maioria dos CAM de CNC — falam DXF. Passe o seu SVG novo pelo nosso <a href="../svg-to-dxf-converter/code.html">conversor de SVG para DXF</a>: R2000 com unidades para programas modernos, modo de compatibilidade R12 para CAM mais antigo.</span></div>
  </div>
</section>"""
    faq_items = [
        ("O que é um arquivo WebP?",
         "WebP é o formato de imagem do Google para a web — arquivos menores, suportado por todos os navegadores modernos. Muitos sites servem imagens como .webp sem avisar, por isso downloads costumam chegar nesse formato. Seu navegador lê WebP nativamente — é por isso que este conversor roda inteiramente no seu dispositivo."),
        ("Quais imagens convertem melhor de WebP para SVG?",
         "Gráficos de cores chapadas — logos, ícones, adesivos, line art: o resultado é projetado para corte. Fotos saem estilizadas (posterizadas), não prontas para corte — a pré-visualização mostra qual dos dois você tem antes de converter."),
        ("Posso converter uma foto WebP para SVG?",
         "Pode, mas espere um resultado estilizado (posterizado), não pronto para corte. A promessa desta página vale para gráficos de cores chapadas: logos, ícones, line art."),
        ("Meu arquivo é enviado para algum servidor?", PT_PRIVACY_A),
        ("Tem limite de uso?", "Grátis, 10 conversões por dia, sem cadastro."),
        ("O SVG funciona na minha máquina de corte?",
         'Depende da máquina. O Cricut Design Space importa SVG diretamente. LightBurn, AutoCAD e a maioria dos CAM de CNC preferem DXF — passe o SVG pelo nosso <a href="../svg-to-dxf-converter/code.html">conversor de SVG para DXF</a>. Sempre faça um corte de teste antes da produção.'),
    ]
    faq_sec = f"""<section class="section"><div class="wrap" style="max-width:820px"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <a class="btn btn--primary btn--lg" href="#convert">Converter WebP para SVG grátis</a>
  </div>
</section>"""
    body = hero + explainer + honesty + how + dxfblock + faq_sec + final
    return page("WebP para SVG — Conversor Grátis, sem Upload",
                "Converta WebP para SVG grátis, direto no navegador. Sem upload, sem cadastro, sem marca d'água — seus arquivos nunca saem do seu dispositivo.",
                body, active_route="/pt/webp-para-svg", lang="pt")

# [PENDING-06f] PT states steps for WebP→SVG (trace pipeline)
WEBP_STEPS_PT = ["✓ Lendo o arquivo (local)", "▸ Vetorizando — parâmetros ajustados à imagem", "○ Preparando o download"]
SVG_DL_BTN_PT = '<button class="btn btn--primary" type="button">Baixar SVG</button>'

def build_pt_webp_states():
    layers = """
<li><span class="sw" style="background:#1F4E79"></span>layer-1 · #1F4E79 · closed</li>
<li style="color:var(--ink-3)">… camadas separadas por cor, todos os caminhos fechados</li>"""
    return generic_states("/pt/webp-para-svg", ".WEBP", "logo-acme_before.png", "logo-acme_after.png",
                          layers, SVG_DL_BTN_PT, steps=WEBP_STEPS_PT, lang="pt", error_ext=".WEBP")
