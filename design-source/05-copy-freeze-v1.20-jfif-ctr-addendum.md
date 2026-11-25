# 05-copy-freeze-v1.20-jfif-ctr-addendum（JFIF 集群 CTR 文案冻结附录）

> 派工：wangduoyu（督办，工单 P0-5a，QA=齿轮）｜ 执行：wenshu ｜ 日期：2026-11-24
> 前置校验：①open-items.md「2026-11-24 修改完善计划派单」（D2=JFIF 升一级增长集群为本单裁决来源）+ P0-1/P0-2/P0-3a 三份核销小节已读 ✓ ②必引 skill：site-copywriting-student 已加载（v2.3.0，05 [DONE] 标准+机检建议适用）✓
> 流水线位：P0-5 三波（wenshu 文案 → moyun 截图 → chuangkou 落位），本附录=文案冻结交付物；**本单不动代码、不动真源、不动 audit.py、零路由变更**（落位归 chuangkou，设计素材归 moyun）。
> 现役文案基线：out/ 生产构建 4 页逐字节提取（2026-11-24，P0-2 落位后状态）。

---

## §0 数据基线留档（效果验收基线，督办口径 6 周窗）

| 路由 | 展示 | CTR | 备注 |
|---|---|---|---|
| `/jfif-to-jpg/` | 460 | **1.09%** | 主攻对象（展示最大、CTR 最弱） |
| `/jfif-to-png/` | 132 | **2.27%** | 主攻对象 |
| `/pt/jfif-para-jpg/` | 77 | **7.79%** | 集群表现最优 → **克制原则适用**（只做结构对齐+最低限度修改，禁推倒重写） |
| `/pt/jfif-para-png/` | — | — | **[待确认]** 督办口径未提供该行基线；效果验收并入同窗对照，不单列数字 |

**效果验收口径**：本附录落位后，以上三行 CTR 对照下一次 GSC 基线复测批（#101 节奏 ~12-05 或督办指定窗口）；EN 两页主攻 CTR 提升幅度、PT 两页负向验收=**不跌破现值**（克制原则的量化表达）。

## §A 槽位表（逐字冻结 · 字符数实算，JS `.length` 口径）

### A-1 EN `/jfif-to-jpg/`（主攻页 1）

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `META_T` | `JFIF to JPG (JPEG) Converter — Fix .jfif Free \| CleanPaths` | 58 |
| `META_D` | `File saved as .jfif that forms and apps refuse? Convert JFIF to JPG free in your browser — no upload, no account, a standard .jpg every app accepts.` | 148 |
| `H1` | **不变**（`JFIF to JPG (JPEG) Converter — Free, No Upload`，哨兵 L132 依赖，本单纯动 `<title>`/`<meta>`/FAQ） | 46 |

**FAQ 重写：12 条 → 4 条（四问方向，顺序=冻结顺序）**

| # | `FAQ_N_Q`（字符） | `FAQ_N_A`（字符） | 方向 |
|---|---|---|---|
| 1 | `Why does Windows show my photo as a JFIF file?` (46) | `Some Windows apps still save pictures with the older JFIF container and a .jfif extension, so Photos labels the file JFIF even though the image data inside is identical to a JPG. Only the packaging differs — which is exactly why some upload forms and apps refuse the file.` (272) | ① Windows 显示为 JFIF |
| 2 | `How do I change a JFIF file back to JPG?` (40) | `Rename .jfif to .jpg — it is the same JPEG data, so most apps open it immediately — or convert it properly: drop the file above, check the preview, and download a standard .jpg. The conversion repackages the same image data into the standard JPG format. Need a PNG instead, for transparency or lossless editing? The JFIF to PNG converter works under the same no-upload rules.` (375) | ② 改回 JPG（内嵌姊妹互链，见 §D-2） |
| 3 | `Is the JFIF to JPG conversion free?` (35) | `Free, 10 conversions a day, no account needed. Heavy users can remove the cap with Pro — $59, one time — via the pricing page.` (126) | ③ 是否免费（A=生产现文**逐字节复用**，已核 `in` html ✓） |
| 4 | `Do you upload or store my files?` (32) | `No. Conversion runs entirely in your browser — there is no upload step. We never receive, see, or store your images or the files you generate. Close the tab and they're gone; we never had them. This is how the tool is built, not a marketing claim. Details in our Privacy Policy.` (278，纯文本口径；`Privacy Policy` 保留既有 `<a href="/privacy/">` 内联链接) | ④ 是否需上传（Q+A **逐字节复用** v1.11 恢复批信任串，已核 ✓） |

**被退休 FAQ（9 条）与去向**：`How do I convert JFIF to JPG?`（步骤并入②）/ `Is this JFIF to JPG converter free?`（并入③）/ `Will converting JFIF to JPG reduce quality?`（"repackages the same image data" 句并入②）/ `Is there a limit?`（Q 改写为③，A 原样）/ `Can I change JFIF to JPG without installing software?`（browser 事实已在②④语义内）/ `What if my file is actually JPEG?`（退休，由 endpoint 出站线承接，见 §D-3）/ `Does JPG support transparency?`（PNG+transparency 事实并入②尾句）/ `Is a JFIF file the same as a JPEG?`（事实已在①）/ `How to open a JFIF file`、`How do I open a JFIF file on a Mac or iPhone?`、`Is there a JFIF viewer?`（open/viewer 事实已在①②；#94 模块 B 三条内容由②承接退休）。**退休≠删信任**：v1.11 恢复批 4 针中 2 条整对保留（③A/④Q+A），1 条 Q 换 A 留（③），徽章行 `No upload. No account. No watermark. Free, 10 conversions a day.` 不在本单范围、原样在页。

### A-2 EN `/jfif-to-png/`（主攻页 2）

| 槽位 | 冻结串 | 字符 |
|---|---|---|
| `META_T` | `JFIF to PNG Converter — Fix .jfif Free \| CleanPaths` | 51 |
| `META_D` | `Stuck with a .jfif an editor or form won't take? Convert JFIF to PNG free in your browser — no upload, lossless PNG, files never leave your device.` | 147 |
| `H1` | **不变**（`JFIF to PNG Converter — Free, No Upload`，哨兵 L357 依赖） | 40 |

**FAQ 重写：7 条 → 4 条**

| # | `FAQ_N_Q`（字符） | `FAQ_N_A`（字符） | 方向 |
|---|---|---|---|
| 1 | `Why does Windows show my photo as a JFIF file?` (46) | 同 A-1 FAQ1_A 逐字节复用（46+272；集群级共问，两页各自出 schema 无重复内容风险） | ① |
| 2 | `How do I change a JFIF file into a PNG?` (39) | `Drop the .jfif into the converter above and download a lossless .png — the JPEG pixels inside are repacked into PNG's lossless format, so no new compression is added. Renaming to .png does not work: the data inside stays JPEG. Just want a file every app opens? The JFIF to JPG converter gives you a standard .jpg.` (313) | ②（PNG 目标地适配，非偏题；内嵌姊妹互链） |
| 3 | `Is the JFIF to PNG conversion free?` (35) | 同 A-1 FAQ3_A 逐字节复用 (126) | ③ |
| 4 | `Do you upload or store my files?` (32) | 同 A-1 FAQ4_A 逐字节复用 (278 + /privacy/ 链接) | ④ |

**被退休 FAQ（3 条）与去向**：`What is a JFIF file?`（①承接）/ `How to open a JFIF file`（②承接 rename 建议）/ `Will converting JFIF to PNG reduce quality?`（"no new compression" 句并入②）/ `Why PNG instead of JPG?`（JPG 分流建议并入②尾句）/ `Will the PNG have a transparent background?`（透明度事实在②尾句 + A-1②尾句覆盖）。注：png 页 FAQ3 原 `Is there a limit?` **无哨兵 pin**，Q 改写零哨兵成本。

### A-3 PT `/pt/jfif-para-jpg/`（克制页：结构对齐 + 最低限度修改）

**META：维持现役冻结串不动**（表现最优页零风险原则）——`JFIF para JPG — Conversor Grátis, sem Upload`（T，44）/ `Converta JFIF para JPG grátis, direto no navegador. Sem upload, sem cadastro, sem marca d'água — seus arquivos nunca saem do seu dispositivo.`（D，146；`d'água` U+0027，HTML 源码 `&#x27;` 形态为既有转义惯例）。

**FAQ：结构对齐 = 四问方向全部在场；最低限度 = 新增仅 2 对、既有 5 对逐字保留、零删除零重排**。冻结顺序：新增 2 对置于 FAQ 列表**顶部**（对齐 EN 方向序），既有 5 对保持现役相对顺序：

| 序 | Q/A | 字符 | 状态 |
|---|---|---|---|
| 1 | `Por que o Windows mostra meu JPG como arquivo JFIF?` | 51 | **新增** ① |
| 2 | `Alguns aplicativos do Windows ainda salvam imagens no contêiner JFIF antigo, com extensão .jfif. Os dados da imagem são idênticos aos de um JPG — muda só a embalagem, e é por isso que alguns formulários de upload recusam o arquivo.` | 231 | **新增** ①A |
| 3 | `Como transformar um arquivo JFIF em JPG?` | 40 | **新增** ② |
| 4 | `Renomeie .jfif para .jpg — são os mesmos dados JPEG, então a maioria dos programas abre na hora — ou converta do jeito certo: arraste o arquivo para o conversor acima, confira a pré-visualização e baixe um .jpg padrão. Precisa de PNG? O nosso conversor de JFIF para PNG gera um .png no mesmo navegador, sem upload.` | 314 | **新增** ②A（内嵌 PT 姊妹互链，见 §D-4；措辞复用现役词料 "renomeie…a maioria dos programas abre"） |
| 5-9 | `O que é um arquivo JFIF?` / `A conversão para JPG reduz a qualidade?` / `Meu arquivo é enviado para algum servidor?` / `Preciso criar conta?` / `Tem limite de uso?` 五对 | — | **逐字保留**（现役生产字节；其中 "Meu arquivo é enviado"=方向④、"Tem limite de uso?" 起句 `Grátis, 10 conversões por dia, sem cadastro.`=方向③，方向③④已由既有串覆盖） |

四问方向对齐核对：①=新增#1 ✓ ②=新增#3 ✓ ③=既有"Tem limite de uso?"（A 起句 Free 口径）✓ ④=既有"Meu arquivo é enviado" ✓。

### A-4 PT `/pt/jfif-para-png/`（同口径）

**META：维持现役冻结串不动**（T 44 / D 146，形态同 A-3 注）。

**FAQ：新增 2 对置顶，既有 7 对逐字保留零删除**：

| 序 | Q/A | 字符 | 状态 |
|---|---|---|---|
| 1-2 | ①Q+A：与 A-3 #1-#2 逐字相同 | 51+231 | **新增**（集群级共问，PT 两页复用） |
| 3 | `Como transformar um arquivo JFIF em PNG?` | 40 | **新增** ② |
| 4 | `Arraste o .jfif para o conversor acima e baixe um .png sem perdas — os pixels JPEG dentro do JFIF são reempacotados no formato PNG, sem compressão nova. Renomear para .png não resolve: os dados por dentro continuam JPEG. Só quer um arquivo que tudo abre? O nosso conversor de JFIF para JPG gera um .jpg padrão.` | 310 | **新增** ②A（内嵌既有锚 `conversor de JFIF para JPG` → `/pt/jfif-para-jpg/`，现役互链词汇复用） |
| 5-11 | 既有 7 对（`O que é` / `Como abrir um arquivo JFIF` / `qualidade` / `transparência` / `Por que PNG em vez de JPG` / `Meu arquivo é enviado` / `Tem limite de uso?`） | — | **逐字保留**（`Como abrir` 含哨兵依赖，见 §B） |

方向对齐：①新增 ✓ ②新增 ✓ ③既有"Tem limite" ✓ ④既有"Meu arquivo é enviado" ✓。

### A-5 辅助冻结串（内链与出站，见 §D）

> 督办修正（2026-11-25，zhongshu 口径，DESIGN.md v1.21 同源）：`HOME_PNG_GUIDE` / `SAMPLES_PNG_GUIDE` 两串**作废不落**（生产 NEG ×14 全站复扫零命中，账目见 docs/open-items.md OI-1）；`EN-JPG_ENDPOINT` / `EN-PNG_ENDPOINT` 照常落位（§D-3）。

| 槽位 | 冻结串 | 字符 | 落点 |
|---|---|---|---|
| `HOME_PNG_GUIDE` | `Need a lossless PNG instead? The JFIF to PNG converter repacks the same file — free, no upload.` | 95 | **作废不落** — 原落点：首页既有 jfif 交叉引导段（`Got a .jfif file instead of a JPG? …` 行相邻） |
| `SAMPLES_PNG_GUIDE` | `Want a PNG for editing instead? The JFIF to PNG converter is the same drag-and-drop fix.` | 88 | **作废不落** — 原落点：/samples/ 既有 jfif 引导句（`Need a compatible JPG first? You can convert JFIF to JPG free, right in your browser.` 行相邻） |
| `EN-JPG_ENDPOINT` | `Already have a .jpeg? The JPEG to JPG converter does the same repackaging for files that are named .jpeg.` | 105 | /jfif-to-jpg/ FAQ 区块之后（FAQ 列表与页脚之间，前端裁量精确位） |
| `EN-PNG_ENDPOINT` | `Other formats giving you trouble? The WebP to PNG converter handles WebP files the same way — in your browser, nothing uploaded.` | 128 | /jfif-to-png/ FAQ 区块之后（同上） |

锚文本冻结：`JFIF to PNG converter`（→`/jfif-to-png/`，出现于 HOME_PNG_GUIDE / SAMPLES_PNG_GUIDE / EN-JPG FAQ2_A）/ `JPEG to JPG converter`（→`/jpeg-to-jpg/`）/ `WebP to PNG converter`（→`/webp-to-png/`）/ PT：`conversor de JFIF para PNG`（→`/pt/jfif-para-png/`，PT-JPG FAQ2_A 内）/ `conversor de JFIF para JPG`（→`/pt/jfif-para-jpg/`，既有锚复用）。

## §B 哨兵影响与机检记录

**机检结果（2026-11-24 全部新串扫描，脚本可复跑）**：

| 检查项 | 结果 |
|---|---|
| BANNED 9 词（unlimited/infinite/lifetime/guaranteed/100% accurate/official partner/anonymous/secure & private/permanent guarantee） | **零命中** ✓ |
| NEGATIVE 判删串回潮（`Is JFIF the same as JPG?` / `Do you upload my files?` / `There is no account, no watermark, and no file upload.` / `It does not normalize metadata…` / Precision / Tracing paths / Download DXF / AI HD rescue） | **零命中** ✓（注意④Q 保持 "Do you upload **or store** my files?" 完整形态，勿漂移为判删变体） |
| PT 红线（`$` / `\bPro\b` 大小写敏感词边界 / preço / assinatura / pago） | **零命中** ✓（首扫 "Pro" 命中系 `programas` 普通词的大小写不敏感误报，复扫按词边界口径通过） |
| U+2019 弯撇号 | **零命中** ✓（全部 U+0027） |
| META 硬上限 ≤60/≤150 双口径 | 58+148 / 51+147 ✓（EN 两页）；PT 维持串 44+146 ✓ |
| verbatim 复用字节核对 | ③A（LIMIT_A）与 ④Q+A（TRUST_A 含 `/privacy/` 链接）在两 EN 页生产 HTML `in` 核对 **True** ✓ |
| 方向偏题检查 | ② PNG 页为目的地适配（change into a PNG），与工单②"如何改回 JPG"同族意图（JFIF 恢复常规格式），未偏题；附录显式登记供 QA 复核 |

**audit.py 哨兵影响清单（授权写范围=audit.py 仅此一处，归 chuangkou 落位批执行，wenshu 本单不改）**：

| 页 | 退休 pin（落位批从 SENTINELS 删除） | 保留 pin（核对项） |
|---|---|---|
| jfif-to-jpg | L133 `Is a JFIF file the same as a JPEG?` / L142 `Will converting JFIF to JPG reduce quality?` / L146 `How to open a JFIF file` / L147 `How do I open a JFIF file on a Mac or iPhone?` / L148 `Is there a JFIF viewer?`；**换 Q**：L144 `Is there a limit?` → `Is the JFIF to JPG conversion free?`（A 串不变，L144 信任语义保留） | L132 H1 / L134-139 页面串 / L141 徽章行 / L143 ④Q+A / 其余 FAQ 外 pin 全部不动 |
| jfif-to-png | L362 `How to open a JFIF file` / L363 `Will the PNG have a transparent background?` | L357 H1 / L358-361、L364-369 全部不动（含 L366 `JFIF to JPG converter`——本单 FAQ2_A 内再添 1 处该锚，pin 存续无忧） |
| pt-jfif-para-jpg | **零影响**（只增不删不重排，全部 pin 原样在场） | — |
| pt-jfif-para-png | **零影响** | — |

states.json 哨兵段（L582-600）零触碰。#88 教训落实：本单即 wenshu 主导的 FAQ 改动，冻结→落位全程过 wenshu 文案，哨兵增删随落位批一次性授权。

## §C FAQPage schema 同源（机制说明 + QA 断言）

- 现役机制：schema 由页面 `<details>` FAQ 块**自动派生**（faqPageFromHtml，#94 核销口径"FAQPage schema 零手工动作"），四页现役 schema Q 数=FAQ 块数（12/7/5/7，今日实测吻合）。
- 本单冻结的 FAQ 串即 schema 唯一来源；**无独立 schema 文案槽**。落位后 QA 断言：mainEntity 计数 = `/jfif-to-jpg/` **4** / `/jfif-to-png/` **4** / `/pt/jfif-para-jpg/` **7** / `/pt/jfif-para-png/` **9**，且逐 Q 与本附录 §A 串逐字一致。
- ②A 内嵌链接在 schema `text` 中呈现为锚文本纯文本（标签剥离），属机制既有行为，非缺陷。

## §D 内链方案（只出锚文本+落点清单，落地归前端）

**D-1 存量盘点（今日生产实测，防重复落点）**：首页 5→jpg（含 #98 E2 交叉引导 `Got a .jfif file instead of a JPG?…`）+1→png（仅 footer）；samples 1→jpg（`convert JFIF to JPG`）+footer；jpeg-to-jpg `Have a .jfif file instead?…`→jpg；for/cricut-sellers `turn .jfif into .jpg`→jpg；png-to-dxf `free JFIF to JPG tool`→jpg；cloudconvert-alternative `change a JFIF file to JPG`→jpg；全站 footer 双页已在；jfif-to-png→jpg ×3 上下文互链 ✓；pt-jfif-para-png→pt-jfif-para-jpg（`conversor de JFIF para JPG`，FAQ 答内）✓。

**D-2 缺口新增（4 条，锚文本=§A-5 冻结串）**：

> 督办修正（2026-11-25，zhongshu 口径，DESIGN.md v1.21 同源）：#1/#2 home/samples 新增**作废不落**（生产 NEG ×14 全站复扫零命中，账目见 docs/open-items.md OI-1）；#3/#4 随 §A-1/§A-3 FAQ 落位已上生产。

| # | 源页 | 目标 | 锚文本 | 落点 |
|---|---|---|---|---|
| 1 | `/`（首页） | `/jfif-to-png/` | `JFIF to PNG converter` | **作废不落** — 原落点：既有 jfif 交叉引导段，jpg 行相邻（HOME_PNG_GUIDE 串） |
| 2 | `/samples/` | `/jfif-to-png/` | `JFIF to PNG converter` | **作废不落** — 原落点：既有 `Need a compatible JPG first?…` 行相邻（SAMPLES_PNG_GUIDE 串） |
| 3 | `/jfif-to-jpg/` | `/jfif-to-png/` | `JFIF to PNG converter` | FAQ2_A 答内（随 §A-1 ②落位，无需独立接线） |
| 4 | `/pt/jfif-para-jpg/` | `/pt/jfif-para-png/` | `conversor de JFIF para PNG` | PT FAQ②A 答内（随 §A-3 ②落位；与 pt-para-png 现役反向链对称成环） |

**D-3 出站到 jpg/png 终点页（2 条，EN 主攻页，PT 克制不加）**：

| 源页 | 目标 | 锚文本 | 冻结串 | 落点 |
|---|---|---|---|---|
| `/jfif-to-jpg/` | `/jpeg-to-jpg/` | `JPEG to JPG converter` | §A-5 `EN-JPG_ENDPOINT` | FAQ 区块后 |
| `/jfif-to-png/` | `/webp-to-png/` | `WebP to PNG converter` | §A-5 `EN-PNG_ENDPOINT` | FAQ 区块后 |

**D-4 不扩项裁决**：webp-to-png / svg-to-png 等页反挂 JFIF 入链意图弱（用户持有文件格式不同，相关性行），不做——防内链稀释；jpg 页入链侧存量已富（5 处上下文），本单零新增。

## §E before/after 截图素材需求清单（给 moyun 的输入）

通用规格：PNG 格式，桌面 1200×750（@1x，含系统窗口边框更真实）；en-US 或 pt-BR locale 对应目标页语言；示例文件统一用站内 samples 既有人像/Logo 样张（**禁用真实个人照片**）；每图附建议 alt 文本（en/pt 对应页面语言）；文件名 `jfif-<页>-<槽>-<before|after>.png`。

| # | 页 | 区块（槽） | 素材内容 | alt 建议 |
|---|---|---|---|---|
| 1 | /jfif-to-jpg/ | FAQ①旁（explainer 位） | **before**：Windows 资源管理器文件列表，可见 `photo.jfif` 文件名与"JFIF File"类型列；**after**：同文件已重命名 `photo.jpg` | `Windows Explorer showing photo.jfif before renaming to photo.jpg` |
| 2 | /jfif-to-jpg/ | 转换器/结果区 | **before**：dropzone 拖入 `photo.jfif` 后的预览态；**after**：结果态 `Download .jpg` 按钮 + "This page accepts .JFIF" 徽标行 | `JFIF dropped in converter and resulting JPG download state` |
| 3 | /jfif-to-png/ | FAQ②旁 | **before**：文件属性对话框显示 `Type: JFIF File`（data 为 JPEG 的佐证）；**after**：本页转换输出 .png 预览（透明度警示注记：背景保持原样） | `File properties showing JFIF type, and converted PNG preview` |
| 4 | /pt/jfif-para-jpg/ | FAQ①旁 | 同 #1 但 **pt-BR Windows locale**（"Renomear"/"Arquivo JFIF" 界面词） | `Explorador do Windows mostrando foto.jfif renomeada para foto.jpg` |
| 5 | /pt/jfif-para-png/ | FAQ②旁 | 同 #3 但 **pt-BR locale**（"Tipo: Arquivo JFIF"） | `Propriedades do arquivo mostrando tipo JFIF e pré-visualização PNG` |
| 6 | 两 EN 页共用 | hero/proof 区（可选增强） | 一张双联 before/after：左 `.jfif 被上传表单拒绝（错误提示）`→右 `.jpg 上传成功`（mock 表单，标注 illustrative） | `Upload form rejecting .jfif versus accepting converted .jpg` |

优先级：#1/#2 主攻 jpg 页 P0；#3-#5 P1；#6 P2 可选。moyun 交付后素材归 chuangkou 落位批随文案一并接线（alt 文本随图入档）。

## §F 验收清单自检（site-copywriting-student × 05 [DONE] 标准）

| 检查项 | 结果 |
|---|---|
| 5 秒知 What/Who/Why/CTA | ✓ META_D 痛点问句开头（forms/apps refuse / editor won't take），价值+免费+本地即时给出 |
| 文案可直接给设计排版 | ✓ §A 逐槽+§E 素材清单，无开放占位符 |
| 无空泛 AI 话术 | ✓ 零 "fast and easy"/"best choice" 类空话；FAQ 全部可验证事实句 |
| 禁词/合规零风险 | ✓ §B 机检全零；PT 红线零命中；③A/④Q+A 逐字节复用既有冻结串（pricing-consistency 义务自动满足：10/day + $59 one-time 与 pricing-calibration 既有口径一致，零新数字） |
| FAQ 问题式 + GEO 友好 | ✓ 8 问（EN×4×2）全问题式、段落自包含可引用；PT 方向③④由既有自包含答覆盖 |
| FAQPage schema 同源 | ✓ §C 机制在码 + QA 断言计数 4/4/7/9 |
| 内链 ≥1 指向工具/定价页 | ✓ 新增 6 处（含 FAQ 答内 4 处）+ 存量富余；pricing 出站由③A 既有 "via the pricing page" 承接 |
| TDK 冻结完成 | ✓ EN 两页 T/D 全新冻结；PT 维持（克制原则） |
| 基线留档 | ✓ §0 三行督办口径数字 + [待确认] 1 项 |
| 输出文件路径 | `/home/ubuntu/demand-signals/2026-09-22-format-friction/05-copy-freeze-v1.20-jfif-ctr-addendum.md` |
| [待确认] 项 | ①`/pt/jfif-para-png/` 基线数字未提供（不阻塞，效果验收并入同窗对照）②samples/home 新增行的精确 DOM 位置由前端按"相邻落点"裁量 |

**未通过项：无。**

## §G 落位与归口（给 chuangkou/moyun 的最小必要信息）

1. 落位批授权写范围：4 页文案（EN 2 页 meta+FAQ+endpoint 线、PT 2 页 FAQ 增量）+ audit.py 哨兵（§B 清单：退休 7 pin + 换 Q 1 pin，PT 两页零动作）+ home/samples 各 1 行（§D-2 #1/#2）+ 截图素材接线（moyun 交付后）。**states 零触碰、零路由变更、route-mapping 无新路由**（truth manifest 变更随 seal 流程照旧）。
2. 顺序：wenshu 本附录核销 → moyun 截图（§E 清单）→ chuangkou 落位 → 齿轮 QA → 效果验收挂下次 GSC 基线对照（§0 口径）。
3. QA（齿轮）抽验建议：§C schema 计数断言 ×4、§B NEGATIVE 判删串零回潮 ×4 页、④Q 完整形态（"or store" 在场）、PT FAQ 既有 5/7 对逐字节未动（克制原则验收）。

---
*执行人：wenshu ｜ 机检可复跑（BANNED/NEGATIVE/PT红线/U+2019/长度/verbatim in-html 六项，本会话执行记录在案）｜ 本附录未改动任何代码/真源/audit.py/sitemap。*
