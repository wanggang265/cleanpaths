#!/usr/bin/env python3
"""Light tool pages: /screenshot-to-svg, /jfif-to-jpg (EN), /pt/jfif-para-jpg.
Copy verbatim from 05-copy-freeze-v1.md §1.5/§1.6/§3."""
from components import *
from states_common import (generic_states, SVG_DL_BTNS, JPG_DL_BTNS, PT_DL_BTNS, UI_LAYERS,
                           JFIF_LAYERS_EN, STEPS_JFIF, STEPS_PT)

def faq_std_answer():
    return ('No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store '
            'your images or the files you generate. Close the tab and they\'re gone; we never had them. This is how '
            'the tool is built, not a marketing claim. Details in our <a href="../privacy/code.html">Privacy Policy</a>.')

# ------------------------------------------------------- /screenshot-to-svg
def build_shot():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__eyebrow"><span class="spec">Screenshot → SVG · color-separated layers</span></div>
      <h1>Screenshot to SVG — Clean Vector from Any UI Screenshot</h1>
      <p class="hero__sub">UI screenshots are the cleanest input a tracer can get — flat colors, sharp edges. CleanPaths turns them into tidy, editable SVGs in seconds, on your device.</p>
    </div>
    <div>{dropzone(accept=".png screenshots", dz_text="Drop a screenshot here — or browse", shot_preset=True)}</div>
  </div>
</section>"""
    proof = """
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">Proof — in our tests</span>
    <div class="proof" style="margin-top:20px">
      <p class="proof__quote">"Flat colors and crisp edges are exactly what tracing loves. In our tests, a typical UI screenshot converts to about <span class="hl">5 clean color layers</span> — no cleanup pass needed, no node soup."</p>
      <div class="ba">
        <div class="ba__imgs">
          <img src="../../assets/samples/ui-dashboard_before.png" width="900" height="675" alt="UI screenshot input (synthetic sample)" loading="lazy" decoding="async">
          <img src="../../assets/samples/ui-dashboard_after.png" width="900" height="675" alt="Traced SVG layer output (synthetic sample)" loading="lazy" decoding="async">
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
    <h2 style="margin-top:12px">Pixels don't scale. Vectors do.</h2>
    <ul class="plist" style="margin-top:12px">
      <li>"You need that icon, that UI element, that app graphic — bigger, recolored, or editable."</li>
      <li>"Re-drawing it takes an hour. A default auto-trace gives you a muddy single-layer blob."</li>
      <li>"Uploading client screenshots to a random server isn't an option."</li>
    </ul>
  </div>
</section>"""
    solution = f"""
<section class="section">
  <div class="wrap">
    <span class="spec spec--mat">The preset</span>
    <h2 style="margin-top:12px">Purpose-tuned for screenshots</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Screenshot-optimized tracing.</h3><p>A preset tuned for flat UI colors and sharp edges — the input type this engine handles best.</p></li>
      <li><h3>Color-separated layers.</h3><p>Each flat color becomes its own layer, ready to recolor or delete.</p></li>
      <li><h3>Editable everywhere.</h3><p>Open the SVG in Figma, Illustrator, Inkscape — or feed it to a cutter via our SVG to DXF converter.</p></li>
    </ol>
    <div class="info-strip" style="margin-top:24px"><span class="i">→</span><span>Need a DXF for a cutting machine? Run the result through our <a href="../svg-to-dxf-converter/code.html">SVG to DXF converter →</a></span></div>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">How to turn a screenshot into an SVG</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your screenshot.</h3></li>
      <li><h3>Preview the layers — recolor-ready.</h3></li>
      <li><h3>Download the SVG.</h3></li>
    </ol>
  </div>
</section>"""
    pricing = f"""
<section class="section--alt" style="padding:40px 0;border-top:1.5px solid var(--line)">
  <div class="wrap" style="display:flex;gap:32px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <p style="font-size:17.5px;max-width:44em">Free for 10 conversions a day. Pro removes the cap — <b>$59, one time</b>, no subscriptions.</p>
    <a class="btn btn--primary" href="{href('/pricing')}">Get CleanPaths Pro — $59, one time</a>
  </div>
</section>"""
    faq_items = [
        ("What screenshots convert best?",
         "UI screens, icons, app graphics, flat illustrations — anything with flat colors and hard edges. Screenshots of photos come out stylized, not clean-edged."),
        ("Can I edit the SVG afterwards?",
         "Yes — output is color-separated vector layers that open in Figma, Illustrator, Inkscape and any SVG editor."),
        ("Can I cut it on a Cricut or laser?",
         "Yes — convert the SVG to DXF with our SVG to DXF converter, or import the SVG directly where supported (e.g., Cricut Design Space)."),
        ("Do you upload or store my screenshot?",
         faq_std_answer() + " Screenshots can contain sensitive UI — that's exactly why this runs on your device."),
        ("Is there a daily limit?",
         "Free tier: 10 conversions a day, full quality. Pro removes the cap — $59, one time."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <h2>That screenshot you just took is five seconds from being a vector.</h2>
    <a class="btn btn--primary btn--lg" href="#convert">Convert screenshot free now</a>
  </div>
</section>"""
    body = hero + proof + problem + solution + how + pricing + faq_sec + final
    return page("Screenshot to SVG Converter — Clean Vectors | CleanPaths",
                "Turn any UI screenshot into a clean, editable SVG — color-separated layers, sharp edges, right in your browser. Free, no upload, no account.",
                body, active_route="/screenshot-to-svg")

def build_shot_states():
    return generic_states("/screenshot-to-svg", ".PNG SCREENSHOTS", "ui-mobile_before.png", "ui-mobile_after.png",
                          UI_LAYERS, SVG_DL_BTNS, error_ext=".PNG")

# ------------------------------------------------------- /jfif-to-jpg (EN)
def build_jfif():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:820px">
    <div class="hero__eyebrow"><span class="spec">JFIF → JPG · instant repackaging</span></div>
    <h1>JFIF to JPG Converter — Free, No Upload</h1>
    <p class="hero__sub">Drag in a JFIF, download a JPG. The conversion happens entirely in your browser — there's no upload step, and nothing to sign up for.</p>
    <div style="margin-top:32px">{dropzone(accept=".jfif", dz_text="Drop a .jfif file here — or browse", btn="Convert now — free", micro=None)}</div>
  </div>
</section>"""
    explainer = """
<section class="section">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Explainer</span>
    <h2 style="margin-top:12px">Why do I even have a JFIF file?</h2>
    <p style="color:var(--ink-2);max-width:62em">JFIF is the original JPEG interchange format — some apps and browsers still save images with the .jfif extension. The picture inside is ordinary JPEG data; many tools just refuse the file extension. This converter repackages it as a standard .jpg that everything accepts.</p>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Workflow</span>
    <h2 style="margin-top:12px">Convert JFIF to JPG in three steps</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Drop your .jfif file.</h3></li>
      <li><h3>It converts in your browser — instantly.</h3></li>
      <li><h3>Download the .jpg.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">No upload. No account. No watermark. Free, 10 conversions a day.</p>
  </div>
</section>"""
    faq_items = [
        ("What is a JFIF file?",
         "JFIF (JPEG File Interchange Format) is the original container for JPEG images. The image data is identical to a JPG — only the packaging and extension differ. Some Windows apps and older browsers still save images as .jfif."),
        ("Will converting JFIF to JPG reduce quality?",
         "The conversion repackages the same image data into standard JPG format. The preview shows the result before you download."),
        ("Do you upload or store my files?", faq_std_answer()),
        ("Is there a limit?",
         "Free, 10 conversions a day, no account needed. Heavy users can remove the cap with Pro — $59, one time — via the pricing page."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap" style="max-width:820px"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = f"""
<section class="section section--alt cta-band">
  <div class="wrap">
    <a class="btn btn--primary btn--lg" href="#convert">Convert JFIF free now</a>
    <p class="sub" style="margin-top:16px"><a href="{href('/pt/jfif-para-jpg')}">Versão em português: JFIF para JPG →</a></p>
  </div>
</section>"""
    body = hero + explainer + how + faq_sec + final
    return page("JFIF to JPG Converter — Free, No Upload | CleanPaths",
                "Convert JFIF to JPG free, right in your browser. No upload, no account, no watermark — your files never leave your device.",
                body, active_route="/jfif-to-jpg")

def build_jfif_states():
    # §11.12-①: no Precision slider, no AI HD rescue switch (no tracing step on this page)
    return generic_states("/jfif-to-jpg", ".JFIF", "ui-settings_before.png", "ui-settings_before.png",
                          JFIF_LAYERS_EN, JPG_DL_BTNS, steps=STEPS_JFIF, error_ext=".JFIF",
                          show_precision=False, show_ai_hd=False)

# ------------------------------------------------------- /pt/jfif-para-jpg
def build_pt():
    hero = f"""
<section class="hero matgrid">
  <div class="wrap" style="max-width:820px">
    <div class="hero__eyebrow"><span class="spec">JFIF → JPG · conversão instantânea</span></div>
    <h1>Conversor de JFIF para JPG — Grátis, sem Upload</h1>
    <p class="hero__sub">Arraste sua imagem JFIF e baixe o JPG em segundos. A conversão acontece 100% no seu navegador — não existe etapa de upload.</p>
    <div style="margin-top:32px">
      <div class="dropzone matgrid" id="convert">
        {UPLOAD_ICON}
        <div class="dz-text">Arraste seu arquivo .jfif aqui — ou clique para escolher</div>
        <div class="dz-or">— ou —</div>
        <button class="btn btn--primary btn--lg" type="button">Converter agora — grátis</button>
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
    <h2 style="margin-top:12px">Por que meu arquivo veio como JFIF?</h2>
    <p style="color:var(--ink-2);max-width:62em">JFIF é o formato original de intercâmbio de imagens JPEG — alguns aplicativos e navegadores ainda salvam imagens com a extensão .jfif. A imagem dentro do arquivo é JPEG comum; muitos programas simplesmente recusam a extensão. Este conversor transforma o arquivo em um .jpg padrão, aceito por tudo.</p>
  </div>
</section>"""
    how = """
<section class="section section--alt">
  <div class="wrap" style="max-width:820px">
    <span class="spec">Passo a passo</span>
    <h2 style="margin-top:12px">Como converter JFIF para JPG</h2>
    <ol class="steps" style="margin-top:20px">
      <li><h3>Arraste seu arquivo .jfif.</h3></li>
      <li><h3>A conversão acontece no seu navegador — na hora.</h3></li>
      <li><h3>Baixe o .jpg.</h3></li>
    </ol>
    <p style="margin-top:20px;font-family:var(--font-mono);font-size:13px;color:var(--ink-2)">Sem upload. Sem cadastro. Sem marca d'água. Grátis, 10 conversões por dia.</p>
  </div>
</section>"""
    faq_items = [
        ("O que é um arquivo JFIF?",
         "JFIF (JPEG File Interchange Format) é o contêiner original para imagens JPEG. Os dados da imagem são idênticos aos de um JPG — só mudam a embalagem e a extensão. Alguns aplicativos do Windows e navegadores antigos ainda salvam imagens como .jfif."),
        ("A conversão para JPG reduz a qualidade?",
         "A conversão reempacota os mesmos dados da imagem no formato JPG padrão. A pré-visualização mostra o resultado antes de você baixar."),
        ("Meu arquivo é enviado para algum servidor?",
         "Não. A conversão acontece inteiramente no seu navegador — não existe etapa de upload. Nós não recebemos, não vemos e não armazenamos suas imagens. É assim que a ferramenta é construída, não é só uma frase de marketing. Detalhes na <a href=\"../privacy/code.html\">Política de Privacidade</a>."),
        ("Preciso criar conta?",
         "Não. Sem cadastro, sem e-mail, sem login — é só arrastar e converter."),
        ("Tem limite de uso?",
         "Grátis, 10 conversões por dia, sem cadastro."),
    ]
    faq_sec = f"""<section class="section"><div class="wrap" style="max-width:820px"><span class="spec">FAQ</span><div style="margin-top:12px">{faq(faq_items)}</div></div></section>"""
    final = """
<section class="section section--alt cta-band">
  <div class="wrap">
    <a class="btn btn--primary btn--lg" href="#convert">Converter JFIF grátis agora</a>
  </div>
</section>"""
    body = hero + explainer + how + faq_sec + final
    return page("JFIF para JPG — Conversor Grátis, sem Upload",
                "Converta JFIF para JPG grátis, direto no navegador. Sem upload, sem cadastro, sem marca d'água — seus arquivos nunca saem do seu dispositivo.",
                body, active_route="/pt/jfif-para-jpg", lang="pt")

def build_pt_states():
    # §11.12-①: full PT wording per §11.3 PT table; cap state = §11.2 PT neutral variant (no $59 paywall);
    # no Precision slider / no AI HD rescue (neutral tool page, no tracing step)
    layers = '<li><span class="sw" style="background:#E0E4EA"></span>contêiner reembalado · .jfif → .jpg · dados da imagem intactos</li>'
    return generic_states("/pt/jfif-para-jpg", ".JFIF", "ui-settings_before.png", "ui-settings_before.png",
                          layers, PT_DL_BTNS, steps=STEPS_PT, lang="pt", error_ext=".JFIF",
                          show_precision=False, show_ai_hd=False)
