#!/usr/bin/env python3
"""build_pt_hub.py — /pt/ hub 导航枢纽页 builder（落站单 P0-3b · 2026-11-24）。

文案真源 = 05-copy-freeze-v1.19-pt-hub-addendum.md §A（53 串逐字冻结，本文件只做落位不做改写）。
定位纪律（附录 §F-2）：导航枢纽 —— 无 dropzone、无转换器 UI、无状态机（states.html 不适用）。
骨架（§F-1）：Header(PT 现款) → Hero(H1+SUB+BADGES) → INTRO(眉标+INTRO_P) → 组A网格(6卡)
→ 组B网格(10卡) → CTA band(3 快捷钮) → FAQ ×5 → Footer(PT 现款 + hub 回链行)。

Chrome 复用 batch3 先例：header/footer/fab/modal/cookie 逐字取自 pt-png-para-dxf/code.html
（PT 现款），仅做两处 hub 专属 href 改写：
  1. header/footer 的 English version 链接 → ../home/code.html（hub 的 EN 对 = `/`，附录 §E-1）
  2. footer links 行新增 `Todos os conversores` 回链（→ ../pt-hub/code.html），
     与 16 个 PT 工具页 SiteFooter 生产落位同序（Política · English · hub · Suporte）。

窄屏红线（§F-4）：badge 行 overflow-wrap:break-word; max-width:100%；
网格用 .grid-3（3→2→1 列，375px 档单列，无横向溢出）。

自检：写入前断言 16 链接 / FAQ 5 对 / 禁词零命中 / PT 中性红线。
输出：design-source/pages/pt-hub/code.html
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = os.path.join(HERE, "..", "pages")
REF_SLUG = "pt-png-para-dxf"
OUT_SLUG = "pt-hub"

def read(slug):
    with open(os.path.join(PAGES, slug, "code.html"), encoding="utf-8") as f:
        return f.read()

REF = read(REF_SLUG)

# ---------------------------------------------------------------- §A 冻结串（05 v1.19，逐字）
META_T = "Conversores DXF e SVG em Português — Grátis | CleanPaths"           # 56
META_D = ("Todos os conversores do CleanPaths em português: imagens para DXF "
          "pronto para corte e conversões de formato. Sem upload, sem cadastro.")  # 134
H1 = "Conversores DXF e SVG em Português — Grátis, sem Upload"                # 55
HERO_SUB = ("Todas as 16 ferramentas em um só lugar: escolha o formato de origem "
            "e converta direto no navegador — seus arquivos nunca saem do seu dispositivo.")  # 145
BADGES = ["🔒 Seus arquivos não saem do seu dispositivo", "Sem cadastro", "Sem marca d'água"]  # §C 复用×3
INTRO_SPEC = "Todos os conversores"                                            # 20
INTRO_P = ("O CleanPaths converte imagens em arquivos prontos para corte — direto no navegador, "
           "sem upload. Esta página reúne as 16 ferramentas disponíveis em português.")        # 157
GRP_A_H2 = "DXF pronto para corte (CNC, laser, plotter)"                       # 43
GRP_A_SUB = "Trajetórias fechadas, camadas por cor e unidades embutidas."      # 59
GRP_B_H2 = "Conversões de formato"                                             # 21
GRP_B_SUB = "Abra o formato problemático e salve no formato que seu software aceita."  # 71

# 16 链接（顺序=冻结顺序；slug=route-mapping v1.9 PT 全集逐字；锚文本+导航标签=§A-4）
GRID = [
    ("pt-png-para-dxf",    "PNG para DXF",    "logo e ícone em cores chapadas"),
    ("pt-jpg-para-dxf",    "JPG para DXF",    "foto de logo, limpeza embutida"),
    ("pt-svg-para-dxf",    "SVG para DXF",    "R12 e R2000, com unidades"),
    ("pt-jpeg-para-dxf",   "JPEG para DXF",   "seu .jpeg pronto para corte"),
    ("pt-imagem-para-dxf", "Imagem para DXF", "qualquer imagem, comece por aqui"),
    ("pt-foto-para-dxf",   "Foto para DXF",   "foto → resultado estilizado"),
    ("pt-jfif-para-jpg",   "JFIF para JPG",   "corrija a extensão .jfif"),
    ("pt-jfif-para-png",   "JFIF para PNG",   "JFIF vira PNG no navegador"),
    ("pt-jpeg-para-jpg",   "JPEG para JPG",   "mesma imagem, extensão certa"),
    ("pt-webp-para-svg",   "WebP para SVG",   "WebP para vetor SVG"),
    ("pt-webp-para-png",   "WebP para PNG",   "abra WebP, salve PNG"),
    ("pt-webp-para-jpg",   "WebP para JPG",   "abra WebP, salve JPG"),
    ("pt-svg-para-png",    "SVG para PNG",    "vetor para imagem .png"),
    ("pt-svg-para-jpg",    "SVG para JPG",    "vetor para imagem .jpg"),
    ("pt-gif-para-jpg",    "GIF para JPG",    "GIF para imagem JPG"),
    ("pt-bmp-para-jpg",    "BMP para JPG",    "BMP vira JPG mais leve"),
]

FAQ = [  # (Q, A) — §A-5 逐字；§D FAQPage schema 由页面可见 FAQ 标记同源解析生成
    ("Quais conversores posso usar em português?",
     "Os 16 conversores do CleanPaths têm versão em português: 6 convertem imagens para DXF pronto "
     "para corte (PNG, JPG, SVG, JPEG, imagem e foto) e 10 resolvem conversões de formato (JFIF, "
     "WebP, JPEG, SVG, GIF e BMP). A lista completa está nesta página."),
    ("Qual conversor devo usar para gerar um DXF?",
     "Depende do seu arquivo: logo em cores chapadas vai para PNG para DXF; foto de logo vai para "
     "JPG para DXF; vetor vai para SVG para DXF; em caso de dúvida, comece por Imagem para DXF. "
     "Cada página explica o resultado esperado antes de você converter."),
    ("Meus arquivos são enviados para um servidor?",
     "Não. Todas as conversões acontecem no seu navegador — não existe etapa de upload. Nós não "
     "recebemos, não vemos e não armazenamos seus arquivos."),
    ("Preciso de cadastro para converter?",
     "Não. Sem cadastro: cada conversor é grátis, com 10 conversões por dia."),
    ("Existe versão em inglês de cada ferramenta?",
     "Sim — cada conversor tem página equivalente em inglês, acessível pelo link English version "
     "no topo e no rodapé de cada página."),
]

CTA_H2 = "Comece pelo formato do seu arquivo"           # 34
CTA_SUB = ("Logos e ícones em cores chapadas: PNG ou SVG. Fotos de logo: JPG. "
           "Em dúvida: Imagem para DXF.")                # 93
CTA_BTNS = [("pt-png-para-dxf", "Abrir PNG para DXF"),
            ("pt-jpg-para-dxf", "Abrir JPG para DXF"),
            ("pt-svg-para-dxf", "Abrir SVG para DXF")]

# ---------------------------------------------------------------- builder 自检（写入前）
def self_check():
    assert len(GRID) == 16, "grid must have 16 links (frozen order)"
    assert len({a for _, a, _ in GRID}) == 16, "anchor uniqueness 16/16"
    assert len(FAQ) == 5, "FAQ must be 5 pairs"
    assert len(META_T) == 56 and len(META_D) == 134 and len(H1) == 55, "META/H1 hard caps"
    full = META_T + META_D + H1 + HERO_SUB + INTRO_P + GRP_A_H2 + GRP_A_SUB + GRP_B_H2 + GRP_B_SUB \
        + CTA_H2 + CTA_SUB + "".join(q + a for q, a in FAQ) + "".join(t for _, t, _ in GRID)
    banned = ["ilimitado", "sem limites", "vitalício", "garantido", "oficial", "perfeito",
              "100%", "assinatura", "r$", "preço"]
    for b in banned:
        assert b.lower() not in full.lower(), f"banned word in hub copy: {b}"
    assert "$" not in full, "PT neutral: '$' must not appear"
    # 数量口径一致性（§B）：16 在 HERO_SUB / INTRO_P / FAQ-A1 三处一致
    assert "16 ferramentas" in HERO_SUB and "16 ferramentas" in INTRO_P
    assert "16 conversores" in FAQ[0][1]

def chrome():
    header = REF[REF.index("<header"):REF.index("</header>") + len("</header>")]
    # hub 的 English version 对 = EN 首页（附录 §E-1：形态与工具页同构，仅目标不同）
    header = header.replace('href="../jfif-to-jpg/code.html"', 'href="../home/code.html"')
    assert 'href="../home/code.html"' in header

    footer = REF[REF.index("<footer"):REF.index("</footer>") + len("</footer>")]
    footer = footer.replace('href="../jfif-to-jpg/code.html"', 'href="../home/code.html"')
    # links 行新增 hub 回链：Política · English version · Todos os conversores · Suporte
    footer = footer.replace(
        ">English version</a><span>·</span>",
        '>English version</a><span>·</span>\n      <a href="../pt-hub/code.html">Todos os conversores</a><span>·</span>')
    assert 'href="../pt-hub/code.html"' in footer

    tail = REF[REF.index('<a class="fab-feedback"'):]
    tail = tail.replace('data-page-context="/pt/png-para-dxf/"', 'data-page-context="/pt/"')
    return header, footer, tail

def badges_html():
    inner = ' · '.join(f'<span class="badge">{b}</span>' for b in BADGES)
    # §F-4 窄屏红线：badge 行 break-word + max-width 100%
    return f'<div class="badges" style="overflow-wrap:break-word;max-width:100%">{inner}</div>'

def card(slug, anchor, tag):
    return (f'<a class="card" href="../{slug}/code.html" style="display:block;text-decoration:none;color:inherit">'
            f'<span style="font-weight:600">{anchor}</span><br>'
            f'<span style="color:var(--ink-2);font-size:14px">{tag}</span></a>')

def grid(items):
    return '<div class="grid-3">' + "\n".join(card(*i) for i in items) + "</div>"

def faq_html():
    rows = "".join(f"<details><summary>{q}</summary><div class='a'>{a}</div></details>" for q, a in FAQ)
    return f"<div class='faq'>{rows}</div>"

def main_html():
    return f"""<section class="hero matgrid">
  <div class="wrap" style="max-width:860px">
    <!-- PT_HUB_H1 --><h1>{H1}</h1>
    <!-- PT_HUB_SUB --><p class="hero__sub">{HERO_SUB}</p>
    <div style="margin-top:14px"><!-- PT_HUB_BADGES -->{badges_html()}</div>
  </div>
</section>
<section class="section">
  <div class="wrap" style="max-width:860px">
    <!-- PT_HUB_INTRO_SPEC --><span class="spec">{INTRO_SPEC}</span>
    <!-- PT_HUB_INTRO_P --><p style="margin-top:12px">{INTRO_P}</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <!-- PT_HUB_GRP_A_H2 --><h2>{GRP_A_H2}</h2>
    <!-- PT_HUB_GRP_A_SUB --><p style="margin-top:10px;color:var(--ink-2)">{GRP_A_SUB}</p>
    <div style="margin-top:20px"><!-- PT_HUB_GRP_A_GRID -->{grid(GRID[:6])}</div>
  </div>
</section>
<section class="section section--alt">
  <div class="wrap">
    <!-- PT_HUB_GRP_B_H2 --><h2>{GRP_B_H2}</h2>
    <!-- PT_HUB_GRP_B_SUB --><p style="margin-top:10px;color:var(--ink-2)">{GRP_B_SUB}</p>
    <div style="margin-top:20px"><!-- PT_HUB_GRP_B_GRID -->{grid(GRID[6:])}</div>
  </div>
</section>
<section class="section section--alt cta-band">
  <div class="wrap">
    <!-- PT_HUB_CTA_H2 --><h2>{CTA_H2}</h2>
    <!-- PT_HUB_CTA_SUB --><p class="sub">{CTA_SUB}</p>
    <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap"><!-- PT_HUB_CTA_BTNS -->{''.join(f'<a class="btn btn--primary" href="../{s}/code.html">{b}</a>' for s, b in CTA_BTNS)}</div>
  </div>
</section>
<section class="section">
  <div class="wrap" style="max-width:860px">
    <span class="spec">FAQ</span>
    <div style="margin-top:12px"><!-- PT_HUB_FAQ -->{faq_html()}</div>
  </div>
</section>"""

def page():
    header, footer, tail = chrome()
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- PT_HUB_META_T --><title>{META_T}</title>
<!-- PT_HUB_META_D --><meta name="description" content="{META_D}">
<link rel="stylesheet" href="../../assets/design-system.css">
<link rel="icon" type="image/svg+xml" href="../../assets/favicon.svg">
</head>
<body>
{header}
<main>
{main_html()}
</main>
{footer}
{tail}</body>
</html>"""

if __name__ == "__main__":
    self_check()
    html = page()
    out_dir = os.path.join(PAGES, OUT_SLUG)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "code.html"), "w", encoding="utf-8") as f:
        f.write(html)
    # 落位后机检（与生产侧 qa 断言同源）
    assert html.count('class="card"') == 16, "16 cards expected"
    assert html.count("<details>") == 5, "5 FAQ items expected"
    assert 'href="../pt-hub/code.html"' in html, "footer hub backlink present"
    print(f"OK — {OUT_SLUG}/code.html written ({len(html)} bytes, 16 cards, 5 FAQ)")
