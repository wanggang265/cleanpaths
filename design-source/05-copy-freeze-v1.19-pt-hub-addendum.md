# 05-copy-freeze-v1.19-pt-hub-addendum（/pt/ hub 导航枢纽文案冻结附录）

> 派工：wangduoyu（督办，2026-11-24 修改完善计划派单 · P0-3a 任务 2）｜ 执行：wenshu ｜ 日期：2026-11-24
> 前置：①open-items.md「2026-11-24 修改完善计划派单」小节 ✓ ②必引 skill：site-copywriting-student 已加载（v2.3.0）✓ ③诊断报告 D1（/pt/ hub）为裁决来源，数据基线 = GSC 6 周 18 点击/1122 展示 + 巴西 9 点击/78 曝光（全站 50% 点击）
> 性质：文案冻结附录（addendum），随 v1.15→v1.18 先例入账；**本单只出冻结串，不改代码、不改真源、不改 audit.py、不动 sitemap**。落位归 chuangkou 落站单（前置 = 本附录核销 + 404 侦察报告 §6 处置批准）；设计归 sheji（route-mapping v1.9→v1.10 + seal 流程照旧，open-items 联动注意条款）。

---

## 结论速览

- **§A**：/pt/ hub 全量槽位冻结（META×2 + HERO×2 + INTRO×2 + 分组×4 + 工具网格 16 链接（锚文本+标签各 16 串）+ FAQ×5 对 + CTA×5 + 语言切换×2 + 页脚×4），共 **53 串**，逐槽字符数实算（§A 表内列）。
- 硬上限全部通过：META_T 56≤60、META_D 134≤150（兼符 skill ≤150 与项目 ≤155 双口径）、H1 55≤70。
- **§C**：8 串复用生产冻结原子（hero 徽章 3 + 页脚信任行/隐私/语言/支持 4 + nav 语言行），2026-11-24 out/ 生产 HTML 逐字节命中实证。
- **§B**：禁词/红线机检零命中（ilimitado/sem limites/vitalício/garantido/oficial/perfeito/100%/assinatura/$/preço/Pro/U+2019 全零；grátis 仅既定口径语境）。
- **PT 中性红线**：零价格、零 Pro、零付费入口、零订阅表述（沿 v1.18 同款红线）。
- **hub 定位纪律**：导航枢纽——16 链接 + 每链接一行 ≤6 词导航标签，零工具页内容重复（无对比表、无 How-to 步骤、无工具级 FAQ 语义）。
- 需督办拍板项：**零**（D1 已由用户 GO；语言切换形态沿 v1.17 §7 先例；hub 短名 `Todos os conversores` 为本附录新冻结名，见 §E-2）。
- 哨兵冲突：**无**（纯新增页面零删串；§H 登记新增哨兵建议，归落站单）。

## §0 前置校验记录

1. **route-mapping v1.9 核对**（design-source/route-mapping.json，version=design-handoff-v1.9，generated 2026-11-23）：现役 47 路由 = 31 EN + **16 PT**；本附录 16 链接 slug 与 16 条 PT 路由逐字对照 **16/16 覆盖、零多余零缺失**（机检 §4 记录）。工单要求「以 route-mapping v1.9 为准，勿用记忆清单」已执行——清单来自当日 json 解析，非记忆。
2. **生产实测（2026-11-24）**：16/16 PT 路由生产 200（Googlebot UA）；`/pt/` 现为 404（hub 缺位实证，与 404 侦察报告 §2.1 #6 一致）。
3. **现行 PT 冻结串采集**：hero 徽章/CTA（Testar grátis）/页脚信任行/语言切换（`English version →`）/[at] 邮箱串全部自 out/pt/png-para-dxf/ 等页生产 HTML 提取，非转引文档。
4. **05 全链口径继承**：PT 中性（v1.18 红线）、`Testar grátis`（P0-2 R1 统一）、`English version →`（v1.17 §7）、`support [at] cleanpaths.io`（#107）、免费口径 `Grátis, 10 conversões por dia`（工具页既有 PT 冻结串）。
5. **语言区域标注**：pt-BR（GSC 信号全在巴西；沿 #114 偏差登记①裁定——后续工单语言标注须写明 region）。

---

## §A hub 槽位表（页级键名 `pt-hub` · 逐字冻结 · 字符数实算）

> 转义约定：正文串一律 UTF-8 直写；撇号 U+0027（`d'água`）；meta 属性域由 builder 按 `&#x27;` 转义（同现行 meta 描述形态）。计数 = JS `.length` 口径（全部新串无 emoji，len 即字符数；复用原子含 🔒 = 2 UTF-16 单位，系生产已验证形态不重计）。

### A-1 META

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `META_T` | `Conversores DXF e SVG em Português — Grátis \| CleanPaths` | 56 |
| `META_D` | `Todos os conversores do CleanPaths em português: imagens para DXF pronto para corte e conversões de formato. Sem upload, sem cadastro.` | 134 |

### A-2 HERO

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `H1` | `Conversores DXF e SVG em Português — Grátis, sem Upload` | 55 |
| `HERO_SUB` | `Todas as 16 ferramentas em um só lugar: escolha o formato de origem e converta direto no navegador — seus arquivos nunca saem do seu dispositivo.` | 145 |
| `HERO_BADGES`（复用 ×3） | `🔒 Seus arquivos não saem do seu dispositivo` · `Sem cadastro` · `Sem marca d'água` | 生产原子，见 §C |

### A-3 INTRO（导航定位声明，紧随 hero）

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `INTRO_SPEC`（眉标） | `Todos os conversores` | 20 |
| `INTRO_P` | `O CleanPaths converte imagens em arquivos prontos para corte — direto no navegador, sem upload. Esta página reúne as 16 ferramentas disponíveis em português.` | 157 |

### A-4 工具网格（16 链接 · 分组 ×2 · 锚文本+导航标签）

**组 A**：

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `GRP_A_H2` | `DXF pronto para corte (CNC, laser, plotter)` | 43 |
| `GRP_A_SUB` | `Trajetórias fechadas, camadas por cor e unidades embutidas.` | 59 |

**组 B**：

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `GRP_B_H2` | `Conversões de formato` | 21 |
| `GRP_B_SUB` | `Abra o formato problemático e salve no formato que seu software aceita.` | 71 |

**链接网格（16 项 · 顺序=冻结顺序 · slug=route-mapping v1.9 逐字 · 标签均取自各页冻结前提，零新承诺）**：

| # | href | 锚文本 `GRID_N_ANCHOR` | 导航标签 `GRID_N_TAG` | 标签字符 |
|---|---|---|---|---|
| 1 | `/pt/png-para-dxf/` | `PNG para DXF` | `logo e ícone em cores chapadas` | 30 |
| 2 | `/pt/jpg-para-dxf/` | `JPG para DXF` | `foto de logo, limpeza embutida` | 30 |
| 3 | `/pt/svg-para-dxf/` | `SVG para DXF` | `R12 e R2000, com unidades` | 25 |
| 4 | `/pt/jpeg-para-dxf/` | `JPEG para DXF` | `seu .jpeg pronto para corte` | 27 |
| 5 | `/pt/imagem-para-dxf/` | `Imagem para DXF` | `qualquer imagem, comece por aqui` | 32 |
| 6 | `/pt/foto-para-dxf/` | `Foto para DXF` | `foto → resultado estilizado` | 27 |
| 7 | `/pt/jfif-para-jpg/` | `JFIF para JPG` | `corrija a extensão .jfif` | 24 |
| 8 | `/pt/jfif-para-png/` | `JFIF para PNG` | `JFIF vira PNG no navegador` | 26 |
| 9 | `/pt/jpeg-para-jpg/` | `JPEG para JPG` | `mesma imagem, extensão certa` | 28 |
| 10 | `/pt/webp-para-svg/` | `WebP para SVG` | `WebP para vetor SVG` | 19 |
| 11 | `/pt/webp-para-png/` | `WebP para PNG` | `abra WebP, salve PNG` | 20 |
| 12 | `/pt/webp-para-jpg/` | `WebP para JPG` | `abra WebP, salve JPG` | 20 |
| 13 | `/pt/svg-para-png/` | `SVG para PNG` | `vetor para imagem .png` | 22 |
| 14 | `/pt/svg-para-jpg/` | `SVG para JPG` | `vetor para imagem .jpg` | 22 |
| 15 | `/pt/gif-para-jpg/` | `GIF para JPG` | `GIF para imagem JPG` | 19 |
| 16 | `/pt/bmp-para-jpg/` | `BMP para JPG` | `BMP vira JPG mais leve` | 22 |

### A-5 FAQ ×5（问题式；FAQPage schema 同源内容见 §D）

| # | `FAQ_N_Q`（字符） | `FAQ_N_A`（字符） |
|---|---|---|
| 1 | `Quais conversores posso usar em português?` (42) | `Os 16 conversores do CleanPaths têm versão em português: 6 convertem imagens para DXF pronto para corte (PNG, JPG, SVG, JPEG, imagem e foto) e 10 resolvem conversões de formato (JFIF, WebP, JPEG, SVG, GIF e BMP). A lista completa está nesta página.` (248) |
| 2 | `Qual conversor devo usar para gerar um DXF?` (43) | `Depende do seu arquivo: logo em cores chapadas vai para PNG para DXF; foto de logo vai para JPG para DXF; vetor vai para SVG para DXF; em caso de dúvida, comece por Imagem para DXF. Cada página explica o resultado esperado antes de você converter.` (247) |
| 3 | `Meus arquivos são enviados para um servidor?` (44) | `Não. Todas as conversões acontecem no seu navegador — não existe etapa de upload. Nós não recebemos, não vemos e não armazenamos seus arquivos.` (143) |
| 4 | `Preciso de cadastro para converter?` (35) | `Não. Sem cadastro: cada conversor é grátis, com 10 conversões por dia.` (70) |
| 5 | `Existe versão em inglês de cada ferramenta?` (43) | `Sim — cada conversor tem página equivalente em inglês, acessível pelo link English version no topo e no rodapé de cada página.` (126) |

### A-6 CTA band（导航型 CTA——hub 无转换器 UI，按钮=快捷链接）

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `CTA_H2` | `Comece pelo formato do seu arquivo` | 34 |
| `CTA_SUB` | `Logos e ícones em cores chapadas: PNG ou SVG. Fotos de logo: JPG. Em dúvida: Imagem para DXF.` | 93 |
| `CTA_BTN1`（→ `/pt/png-para-dxf/`） | `Abrir PNG para DXF` | 18 |
| `CTA_BTN2`（→ `/pt/jpg-para-dxf/`） | `Abrir JPG para DXF` | 18 |
| `CTA_BTN3`（→ `/pt/svg-para-dxf/`） | `Abrir SVG para DXF` | 18 |

### A-7 语言切换与页脚（PT 侧）

| 槽位 | 冻结串 | 形态 |
|---|---|---|
| `NAV_LANG`（→ `/`） | `English version →` | 复用 v1.17 §7 冻结串（生产逐字命中） |
| `FOOT_EN`（→ `/`） | `English version` | 复用（生产逐字命中） |
| `FOOT_TRUST` | `🔒 Seus arquivos nunca saem do seu dispositivo · Sem cadastro` | 复用生产页脚原子 |
| `FOOT_PRIVACY`（→ `/privacy/`） | `Política de Privacidade` | 复用（生产逐字命中） |
| `FOOT_SUPPORT` | `Suporte: support [at] cleanpaths.io` | 复用 #107 C1（生产逐字命中；防 CF /cdn-cgi/ 注入，mailto=0） |

## §B 机检记录（2026-11-24 全串扫描）

| 检查项 | 结果 |
|---|---|
| 禁词 EN/PT（unlimited / free forever / no limits / lifetime / ilimitado / grátis para sempre / sem limites / vitalício / garantido / oficial / perfeito / 100%） | **零命中** ✓ |
| PT 中性红线（$ / preço / Pro / assinatura / subscription / pago / 付费入口） | **零命中** ✓ |
| U+2019（弯撇号） | **零命中** ✓（`d'água` = U+0027，与生产字节一致） |
| 数量口径一致性 | `16` 在 HERO_SUB / INTRO_P / FAQ-A1 三处一致；网格实测 16 项；「6 DXF + 10 formato」与网格分组 6/10 一致 ✓ |
| slug 覆盖 | 16/16 = route-mapping v1.9 PT 全集，零差集 ✓ |
| 锚文本唯一性 | 16/16 唯一 ✓ |

## §C 复用原子清单（生产逐字节校验，2026-11-24）

8 串复用均以 `out/pt/png-para-dxf/index.html`（生产构建产物）`in` 逐字节命中实证：NAV_LANG ✓ / FOOT_EN ✓ / FOOT_TRUST ✓ / FOOT_PRIVACY ✓ / FOOT_SUPPORT ✓ / BADGE1 ✓ / BADGE2 ✓ / BADGE3 ✓。**零改串复用**——不新增 R 号映射（R 号对号归复核时按 v1.15 §D 原表执行，本附录以生产字节为真源）。

## §D FAQPage schema 内容（与页面可见 FAQ 逐字同源）

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "<FAQ_1_Q>", "acceptedAnswer": {"@type": "Answer", "text": "<FAQ_1_A>"}},
    {"@type": "Question", "name": "<FAQ_2_Q>", "acceptedAnswer": {"@type": "Answer", "text": "<FAQ_2_A>"}},
    {"@type": "Question", "name": "<FAQ_3_Q>", "acceptedAnswer": {"@type": "Answer", "text": "<FAQ_3_A>"}},
    {"@type": "Question", "name": "<FAQ_4_Q>", "acceptedAnswer": {"@type": "Answer", "text": "<FAQ_4_A>"}},
    {"@type": "Question", "name": "<FAQ_5_Q>", "acceptedAnswer": {"@type": "Answer", "text": "<FAQ_5_A>"}}
  ]
}
```

`<FAQ_N_Q/A>` = §A-5 对应冻结串原样注入（builder 渲染时转义照现行惯例）。hub 页 schema = **仅 FAQPage**（无 SoftwareApplication——hub 无转换器，诚实结构；工具页语义留在 16 个工具页自身）。

## §E 语言切换与互链

**E-1 PT 侧（hub 页内，本附录冻结）**：§A-7 五串，形态与 16 个 PT 工具页完全同构（nav `English version →` + footer 同款），hub 不引入新形态。

**E-2 EN 侧新增行（归 EN 首页落位，落站单捎带）**：

| 槽位 | 冻结串 | 落位 |
|---|---|---|
| `EN_LANG_ROW_HUB` | `Versão em português: Todos os conversores →`（43 字符，→ `/pt/`） | EN 首页（`/`）语言行位（v1.17 §7 行式：`Versão em português: {PT 页短名} →`；hub 短名 = `Todos os conversores`，本附录新冻结名） |

**E-3 hreflang（hub 上线后全站对照关系，归落站单接线）**：
- hub 自身：`en` → `https://cleanpaths.io/` ｜ `pt-BR` → `https://cleanpaths.io/pt/` ｜ `x-default` → `https://cleanpaths.io/`
- EN 首页反向：`pt-BR` → `https://cleanpaths.io/pt/`（随 E-2 同批）

## §F 设计落位建议（给 sheji/builder）

1. 骨架：Header（同 PT 页现款：logo → `/` + nav `English version →`）→ Hero（H1 + HERO_SUB + BADGES 行）→ INTRO（SPEC 眉标 + INTRO_P）→ 组 A 网格（H2 + SUB + 6 卡）→ 组 B 网格（H2 + SUB + 10 卡）→ CTA band（H2 + SUB + 3 快捷钮）→ FAQ ×5 → Footer（同 PT 页现款极简版）。
2. hub **无 dropzone、无转换器 UI、无状态机**（导航枢纽定位；states.html 不适用本页——归 sheji 裁量，若模板强制 states 需出 hub 专用空态说明）。
3. 卡片 = 锚文本（GRID_N_ANCHOR）+ 一行标签（GRID_N_TAG），**不加**价格/评分/字数类装饰，防导航页承载工具承诺。
4. PT 窄屏红线（#37 教训 + v1.18 同款）：badge 行 `overflow-wrap: break-word; max-width: 100%`；16 卡网格 375px 档单列实测无横向溢出。
5. route-mapping v1.9→v1.10：hub 登记为 `route: /pt/`、`dir: pages/pt-hub`、`type: hub`（命名归 sheji，本附录仅供语义词）；truth-manifest seal 流程照旧。

## §G canonical / lang / sitemap（归口标注）

| 项 | 冻结值 | 归口 |
|---|---|---|
| canonical | `https://cleanpaths.io/pt/` | 落站单 |
| `<html lang>` | `pt-BR`（新页直接正确值） | 落站单；**联动 P2**：PT_PAGES 名单补齐 16 旧页时须含 hub=17 |
| sitemap | +1 = `/pt/`（lastmod 见 404 侦察报告 §4 方案 A） | 落站单（lastmod 改造若同批=顺手核销） |
| llms.txt | +`/pt/` 及 PT 16 页覆盖缺口（P2 顺手） | 落站单裁量 |
| IndexNow/GSC | 上线后提交 `/pt/`（hub 即「404 自愈」目标，见侦察报告 §3） | 落站单 E 项 |

## §H 哨兵登记建议（新增，归落站单真源授权）

- 正向 pin：`META_T` 全串、`H1` 全串、`GRID_16` 项数断言（≥16 个 `/pt/` 出链）、`Versão em português: Todos os conversores →`（EN 首页落位后）。
- 负向 pin：hub 页 `$` 零命中（文案域）、`assinatura`/`ilimitado` 零命中。
- 既有哨兵零冲突（纯新增页零删串，audit.py 未动）。

## §I 验收清单自检（site-copywriting-student × 05 [DONE] 标准）

| 检查项 | 结果 |
|---|---|
| 5 秒知 What/Who/Why/CTA | ✓ H1+SUB+徽章直给：是什么（16 conversores）、给谁（PT 用户）、差异（sem upload/本地）、下一步（网格+CTA） |
| 文案可直接给设计排版 | ✓ §A 逐槽 + §F 骨架，无开放占位符 |
| 无空泛 AI 话术 | ✓ 零 "rápido e fácil"/"melhor escolha" 类空话；标签全部承接各工具页冻结前提 |
| 禁词/合规零风险 | ✓ §B 机检全零；PT 中性红线全过 |
| 内链 ≥1 指向工具/定价页 | ✓ 16 条工具页出链 + 1 条 EN 首页回链；PT 中性原则下不含 pricing 入口（设计使然，侦察报告 §2.1 #7） |
| FAQ 问题式 + GEO 友好 | ✓ 5/5 问题式；每答自包含可引用；schema 同源（§D） |
| TDK 冻结完成 | ✓ META_T 56 / META_D 134 |
| 价格数字与 pricing-calibration 一致性 | ✓ 本附录零价格数字（PT 中性），无对齐义务 |
| 输出文件路径 | `/home/ubuntu/demand-signals/2026-09-22-format-friction/05-copy-freeze-v1.19-pt-hub-addendum.md` |
| [待确认] 项 | **零**（hub 短名 `Todos os conversores` 与 EN_LANG_ROW_HUB 已在本附录内冻结，非开放项；仅落位归口待 chuangkou 工单） |

**未通过项：无。**

## §J 联动登记

- **404 侦察报告**（`11-ops/404-recon-report-2026-11-24.md`）：`/pt/` 404 由本 hub 上线自愈；幽灵处置文案已批复并交付 `11-ops/gsc-mark-fixed-runbook-2026-11-24-v1.md`（#5 `/svg-to-dxf/` 经督办裁定 301 → `/svg-to-dxf-converter/`，见侦察报告 §6.1）。
- **sitemap lastmod 真实化**：方案在侦察报告 §4，归口前端，建议随本 hub 落位批顺手核销。
- **诊断报告 D1 验收锚点**：hub 上线后 GSC 巴西语簇曝光/点击为效果口径，对照基线 = `gsc-baseline-2026-11-17` 与 12-15 复测批。

---
*执行人：wenshu ｜ 机检可复跑（本会话执行记录：字符数逐槽、禁词全表、生产字节校验、slug 对照 16/16）｜ 本附录未改动任何代码/真源/audit.py/sitemap。*
