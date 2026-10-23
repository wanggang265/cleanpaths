# 06 视觉设计真源 — cleanpaths.io（design-handoff-v1 · v1.6）

- 执行：moyun ｜ 日期：2026-10-22 ｜ Skill：site-design-student v2.3.0
- **Changelog**：
  - v1.6（2026-10-22）——06f 增量（工单 PROMPT_sheji_06f_newpages）：4 新路由（/jfif-to-png + /pt/jfif-para-png + /webp-to-svg + /pt/webp-para-svg，含 4 状态板）+ CookieNotice 真源补位（#66，镜像线上 CookieNotice.tsx，零行为改动）+ footer Tools 槽位加两条 + **v1.6 商用授权附录回填进 builders**（pricing hero/权益行/FAQ#9、cricut 支撑句+FAQ#7、cap 态转化行——修 audit 漂移）。注：工单写 v1.4→v1.5，但 v1.5 已被 05e 落位占用，本批实际升 v1.6。新增设计侧串走 [PENDING-06f] 回传表（`06f-new-copy-return-table.md`）。
  - v1.5（2026-10-20）——05e 冻结落位（v1.7 附录 E1-E10）+ [PENDING-05e] 清零 + audit.py 哨兵扩充（E5 落位条件为自动断言）。
  - v1.4（2026-10-20）——06e BOFU 增量：4 个 comparison 新路由（模板 A 骨架：`/vector-magic-alternative` `/cloudconvert-alternative` `/vectorizer-ai-alternative` `/convertio-alternative`）+ /png-to-dxf FAQ#2 插入 pixel-to-path 条目（05d §5）+ footer 新增 Compare 分组（全站 EN 页脚；PT 页不加，中性约束）。上游对齐：法律页按 03 现行 md 重建（GA4/Clarity/Creem 回填后文本）；footer 信任行删除 "No tracking cookies"（EN+PT，open-items #60 用户 10-14 拍板，05e 附录 §4-3 已追认登记）。
  - v1.3（2026-09-30）——06d 文案微换（05c §12 冻结落位）：FB_COPY 4 处 + SHARE_COPY 3 处 + PT 表单补译；哨兵升级 PASS。
  - v1.2（2026-09-28）——06c 返修：反馈 FAB + 四分弹窗、社媒槽位、结果页 Share CTA、展示墙升级。
  - v1.1（2026-09-26）——06b：05 §11 裁决 6 动作核销。
- 文案唯一来源：`05-copy-freeze-v1.md` v1.2（含 §11/§12，**逐字引用，零改写**；审计脚本 `build/audit.py` 全量哨兵校验通过）
- 法律页正文来源：`03-compliance-v1/*.md`（容器引导句来自 05 §0.9）
- 路由范围：Route Contract 全集 15 路由（10+1 内容 + 4 法律），见 `route-mapping.json`

---

## 1. Visual Style Rationale（≥3 风格对比）

### 候选 A：Cutting Mat / 工坊精度 ✅ 选定

暖纸底 + 墨蓝文字 + 刀片橙主色 + 切割垫绿辅色；切割垫网格纹理只出现在 Hero/Dropzone；规格标注全部用等宽字体（像图纸上的尺寸标注）；按钮/卡片用硬偏移投影（盖章感）而非弥散阴影。

- **受众适配**：Cricut 卖家/手工制造者每天看的界面是 Design Space、切割垫、快递单——暖纸+网格+等宽标注是这个人群的「工作台语言」，不是 SaaS 极客语言。
- **内容密度适配**：本站每页有 6-8 条 FAQ、对比表、Proof 数据——高可读正文（Hanken）+ 可扫描的 mono 数据徽章，正好承接高密度内容而不显乱。
- **SERP 预期**：搜 "png to dxf" 的人要的是「现在就能传文件」的工具台，工具优先首屏（上传区右置大图位）与该风格的「工作台」隐喻天然一致。
- **诚实叙事承载**：mono spec 标注 + before/after 统计徽章让「in our tests」这类限定声明看起来像实验记录而非广告词，与品牌核心叙事（质量诚实）互相强化。

### 候选 B：Blueprint CAD 深色蓝图 ❌

深蓝底 + 青色技术线 + 尺寸标注。DXF/CAD 共鸣最强，但：① 深色优先伤害长 FAQ/SEO 正文可读性；② 深色+技术网格是 2024-26 开发者工具的烂大街语言，对 Etsy 卖家有距离感；③ 与「照片=stylized」的诚实降级提示所需的温暖口吻冲突。弃。

### 候选 C：手作市集暖编辑风（陶土色 + 衬线 + 贴纸徽章）❌

人群亲和度高，但：① 工具affordance 弱——像博客不像工具，「5 秒内开始转换」的首屏任务被编辑化排版稀释；② 衬线大标题 + 贴纸风与「cut-ready / closed paths / POLYLINE」的精度承诺气质不符；③ 转化页（/pricing）需要的工程感信任（license、退款、版本号）在贴纸风里会显得不严肃。弃。

### 排除项：remove.bg 式极简白蓝工具风

上一个项目（removepdfpages.net）即此路线——白底、蓝主色、居中工具、弥散阴影。为避免撞脸，本方案**主动反向选择**：暖纸≠白、橙≠蓝、硬阴影≠弥散、左文右件≠居中、mono 标注≠纯无饰线。两套站放一起无混淆风险。

### 反 AI 味自检（对照 Skill references/anti-ai-design-rules）

| 检查项 | 结果 |
|---|---|
| 非默认字体 | ✅ Bricolage Grotesque + Hanken Grotesk + IBM Plex Mono（全部本地化 OFL） |
| 非紫蓝白模板 | ✅ 暖纸 #FAF6EE / 刀片橙 #E4572E / 垫绿 #1F6E5C，无紫无渐变 |
| 非「居中 hero + 三卡片」 | ✅ 左文右件工具首屏；三卡网格仅用于工具矩阵/对比事实行 |
| 非统一圆角阴影 | ✅ 硬偏移投影 + 1.5px 发线边框 + 6/10px 两档圆角 |
| 无通用占位图 | ✅ 样本为程序生成的项目专属合成图（标注合成来源） |
| Logo 16px 可辨识 | ✅ logo.svg 为独立贝塞尔锚点图形，脱离字标可用 |

---

## 2. 设计系统 Token（assets/design-system.css :root 可直接提取）

| 组 | Token | 值 | 用途 |
|---|---|---|---|
| 色 | --paper / --paper-2 / --card | #FAF6EE / #F3ECDD / #FFFDF7 | 底色/区分段/卡片 |
| 色 | --ink / --ink-2 / --ink-3 | #1E2430 / #4C5262 / #717789 | 文字三级 |
| 色 | --blade / --blade-dark / --blade-soft | #E4572E / #C2431F / #FBE9DF | 主行动色 |
| 色 | --mat / --mat-soft | #1F6E5C / #E1EFE6 | 辅色/成功态/链接 |
| 色 | --caution / --error（+soft） | #9A6A14 / #A6261F | 期望前置提示/错误态 |
| 字 | --font-display / --font-body / --font-mono | Bricolage / Hanken / IBM Plex Mono | 标题/正文/规格标注 |
| 形 | --r-btn 6px / --r-card 10px；--stamp 硬偏移投影 | 见 CSS | 全站两档圆角 |
| 距 | --s1..--s8（4→64px 8 档） | 见 CSS | 间距刻度 |
| 版心 | --maxw 1120px | — | 内容宽度 |

签名元素：① `.matgrid` 切割垫网格（仅 Hero/Dropzone/Manifesto）；② `.spec` mono 尺寸标注（色块小方块+全大写）；③ `.badge` 信任徽章行；④ `.ba` before/after 对比（手柄⇔，移动端保持双图并排）。

---

## 3. 组件清单（前端可还原）

header（含 Tools 下拉 + 移动汉堡，CSS-only details/summary）/ footer（四栏路由矩阵 + 反馈表单 + 信任行）/ dropzone（is-dragover 修饰类）/ seg 分段控件（DXF 版本）/ switch 开关（cleanup / screenshot preset / AI HD rescue）/ steps 编号步骤 / plist 痛点列表 / proof 实证条 / cmp 对比表 / faq 手风琴 / diag 症状诊断卡（cricut 页）/ persona 人群卡 / price-card × 4 结构 / contrast 反差信任块 / manifesto 全宽宣言排版 / feedback 反馈表单（Amend A001）/ state-note 状态提示条 / result 结果预览双栏 + layers 列表 / anchor-nav 样本墙锚点 / legal 法律排版 + .fill 占位符高亮。

## 4. 状态规格（7 个工具页各有 states.html + states.png，v1.1 按 05 §11.3 核销）

trace 类五页（首页/png/jpg/svg-dxf/screenshot）9 态：① empty（=code.html 首屏）② drag-over ③ processing（进度条 + 冻结步骤标签；svg-dxf 中间步为 `Converting curves to polylines`）④ result（双栏预览 + 分层列表 + Precision 滑杆 + 下载按钮组 + **反馈表单**，Amend A001 落位 1）⑤ error ⑥ daily-cap（§11.2 EN 专属文案）⑦ Pro-locked（AI HD rescue + 试用徽章）⑧ Pro active ⑨ feedback-sent。**jfif EN/PT 两页 7 态**（§11.12-①：删 Precision 滑杆 + AI HD 开关，无 trace 环节；PT 板整组 PT 措辞，cap 态为 §11.2 PT 中性变体、无 $59）。法律页/人群页/样本墙/定价页无工具态，已在 route-mapping.json 逐页标注。

## 5. 五个埋点落位核验

| # | 埋点 | 落位 | 证据 |
|---|---|---|---|
| 1 | 工具优先首屏 | 首页+全部工具页 Hero = 左（H1+副标题+信任长句）右（dropzone 本体），营销叙事全部在上传区下方 | home/png/jpg/svg/screenshot/jfif/pt 的 screen.png |
| 2 | 入口矩阵全集 | header（3 工具直链 + More tools 下拉 + Samples + 2 人群 + Pricing）+ 首页「All converters」六卡区 + footer 四栏全路由；audit.py 对 13 条核心路由链接做全页扫描通过；PT 页经 /jfif-to-jpg 底部语言切换互链 | audit.py PASS |
| 3 | Before/After 样本墙 | /samples 三分区 9 组（logo×3/截图×3/线稿×3，**无照片类**）+ 首页/png/jpg/screenshot 页内嵌对比模块 + cricut 页 3 组精选 | samples/screen.png |
| 4 | 诚实叙事视觉化 | /for/embroidery 宣言式全宽排版（.manifesto 双栏长文）；§0.3 期望前置 microcopy 在每个工具页 dropzone 正下方（警示色块，非 FAQ 藏匿） | for-embroidery/screen.png |
| 5 | 反馈表单落位 | 结果下载态（states.html STATE 4）+ 全站 footer（含 emoji 三选一 + 选填框 + 提交后感谢态），视觉为虚线轻容器，不打断下载动作 | home/states.png、任意页 footer |

**无 Cookie 横幅**：全站 15 页零横幅（03 架构性决策）；/cookies 页本身说明此决策。

## 6. 硬约束合规

- ✅ 文案一字未改写：`build/audit.py` 对 15 页做 200+ 条冻结文案哨兵逐字校验 + 禁词扫描（unlimited/lifetime/guaranteed/anonymous[反馈表单语境] 等 9 项）+ subscription 语境检查（仅否定式/疑问式），全过
- ✅ SEO 零裁剪：每页 FAQ 全文落位（手风琴/诊断卡），转化结构全模块落位；H1 全部唯一且含目标关键词；问题式 H2/H3
- ✅ PT 页中性：无品牌叙事/无人群卡/无定价区/无 Pro 强推，仅语言切换 + 法律链接
- ✅ 与 removepdfpages.net 不撞脸（见 §1 排除项）
- ✅ route-mapping.json 覆盖 15 路由（含 /cookies /refund）
- ✅ 价格/CTA/权益数字零偏差（$59/$29/$10/$117/10 次/30 天全部与 04 §1.2/§6 一致，哨兵校验）
- ✅ 照片=stylized 期望前置在上传区附近（microcopy 警示块），非 FAQ 藏匿

## 7. 设计补位文案 — 十项全部已裁决（05 §11，v1.1 翻正）

| # | 06 回传项 | 05 §11 裁决 | 落位状态 |
|---|---|---|---|
| 1 | 对比表单元格「有限」的英文 | §11.1 改写：`Limited (default settings)` | ✅ 已应用（png/jpg/svg 三页共享组件） |
| 2 | daily-cap 付费墙专属文案 | §11.2 改写：EN 专属组（`That's your 10 for today…` 主信息 + 转化行 + aria-label）；**PT 中性变体**（无价格，`Ver opções →`） | ✅ 已应用（7 状态板；PT 板整组 PT） |
| 3 | 状态板 UI 标注组 | §11.3 逐串采纳 + 3 处改写（svg 中间步 / jfif EN 整组 / PT 整组）+ 2 处组件级删除（jfif 两页 Precision 滑杆、AI HD 开关） | ✅ 已应用 |
| 4 | footer 反馈区引导句 | §11.4 采纳原句 | ✅ 维持现稿 |
| 5 | 首页 All converters 标签 + Who it's for | §11.5 采纳 | ✅ 维持现稿 |
| 6 | 样本卡说明句 ×9 + 统计徽章 | §11.6 采纳 + 强制条件：可见 `SYNTHETIC SAMPLE` mono 标签 | ✅ 已应用（/samples ×9；cricut 页内嵌 3 卡同步加签） |
| 7 | /samples 页眉标注 | §11.7 采纳 | ✅ 维持现稿 |
| 8 | 人群页末屏 CTA 标题 ×2 | §11.8 采纳 | ✅ 维持现稿 |
| 9 | 法律页眉 + 定价页 spec 标注组 | §11.9 全组采纳 | ✅ 维持现稿 |
| 10 | cricut 诊断卡 SYMPTOM 标签 | §11.10 采纳 | ✅ 维持现稿 |

**结论：无未决文案项。全站可见文案 100% 可追溯至 05 v1.1 冻结口径。**

## 7b. 06c 新增系统（A/B/C 核销明细）

### A. 反馈系统（对标 toontone，06c-A）
- **FAB**：全站 15 页右下角悬浮（`position:fixed; z-index:40`）。四态见任一 states.html STATE 10：default / hover / focus-visible（3px blade 描边）/ reduced-motion+quiet。**避让规则（07 实现）**：工具工作态（拖拽中/处理中/结果未下载）给 FAB 加 `.is-quiet`（图标态 + 35% 透明）；FAB 固定在右下 20px 安全区，结果态的下载按钮组与付费墙 CTA 居中偏左，不重叠；modal 打开时 z-index 70 高于一切。
- **弹窗**：标题 + 第一人称副文案 + 类型四分 segmented（默认不选）+ 自由文本 + 可选联系 + **信任行（匿名默认 + 自动带页面/语言上下文 + "We never see your files" 加粗明示）**。提交=Send feedback（§0.7 冻结复用）；成功态=§0.7 冻结感谢句；失败态=重试 + mailto 兜底。四态见 states.html STATE 11。
- **footer 表单保留为次级入口**：原 Amend A001 内联表单不动，新增 "Open the feedback dialog →" 按钮打开同一弹窗。
- 静态包内弹窗用 CSS `:target` 演示（无需 JS 即可预览）；07 可换 `<dialog>`+JS，结构与文案不变。

### B. 社媒（06c-B）
- **footer 槽位**：X / YouTube / Pinterest 三图标，`href="#"` + `data-pending="account-url"` 空槽（账号 URL 归 open-items，**未编造 handle**）；虚线边框标示占位。**PT 页不放社媒槽位**（中性工具页约束延伸，设计侧决定，zhongshu 可否决）。
- **结果页 Share 区块**（优先级高于 footer 图标）：结果态内 `share-block`——Copy link / Post to X（intent 预填）/ Download share image + **"Feature my result on the examples wall" opt-in 勾选（默认不勾）**。**显隐规则**：仅结果态渲染（`data-visible-when="result"`），无结果/处理中/错误/付费墙态一律不出现。7 个工具页状态板 STATE 4 均已落位（PT 页 PT 措辞）。

### C. 成品展示（06c-C）
- **可索引为前提**：/samples 全静态语义化 HTML，无 iframe/无前端动态加载；每卡新增可见**卡题 + 场景描述槽位**（结构化字段，07 落 ImageObject/ItemList schema，route-mapping.json 已标注）。**明确不抄 toontone 的 iframe 墙**。
- **冷启动**：v1 策展精选沿用 `SYNTHETIC SAMPLE` 可见标签纪律；新增 **Community 分组预留槽**（#community，虚线空槽 + 诚实说明），真实投稿到位后启用。
- **首页 Featured examples 横条**：Proof 下方 3 卡（before/after + 冻结场景句 + 锚到 /samples 对应分区）。
- **隐私红线落位**：真实用户成品上墙唯一入口 = 结果页 Share 区块的显式 opt-in 勾选（默认不勾 + 邮件二次确认说明）。

### 新增文案纪律（v1.3 已冻结）
06c 新增串 **28 串已全部经 05c §12 冻结**（采纳 23 / 改稿 5 / 驳回 0），集中于 `build/components.py` 的 `FB_COPY / SHARE_COPY / SHOWCASE_COPY` 三 dict；[PENDING-05c] 标记清零。audit.py 哨兵集含 §12 全部冻结串（EN+PT）+ `anonymous`/`Anônimo` 反馈语境全站负向扫描 + B5 旧稿反向哨兵——任何改动都会触发 FAIL。历史建议稿存档见包根 `06c-new-copy-return-table.md`（裁决对照以 05 §12 为准）。

## 7c. 06e BOFU 增量（4 comparison 页 + FAQ 插入 + footer Compare）

### 模板 A 骨架（四页共用，`build/bofu_template.py`）
Hero（H1+副标题+上传组件+徽章行）→ Intro → Why-alternative 痛点 → 对比表（`.cmp-versus`）→ 差异化三条 → Real Results（§0 共用 88→9，"in our tests" 进 H2 视觉层级，非脚注）→ 定价块（v2 卖点序原文）→ 质量诚实块（真 H2 + 警示条）→ FAQ×7 手风琴 → Final CTA → 页尾内链块。④零定制组件全复用；②FAQ#2 提为正文高亮卡（contrast 块）+「Where files go」行 mat-soft 强调（☁️/💻 事实标注）；③POLYLINE/SPLINE 技术注脚卡（in our tests）。

### 对比表红线执行
竞对列纯事实文字，**无 ❌/✅**；`[待确认-落站前核实]` 渲染为 caution 色文字 chip（可见、非视觉断言）；CleanPaths 列（我方事实）打 ✅；移动端 `.cmp-versus` 堆叠（`data-col` 属性出列名，零新增文案）。②「Where files go」= 强调行。

### E5 落位条件（05e §4-1，07 硬约束）
`in our tests` 限定由 Real Results 区块 H2 `What cleanup actually changes (in our tests)` + E8 技术注脚承担；E5 三枚徽章**不得脱离这两个承载体**单独复用到其他页面位置。audit.py 已将其写为自动断言（区块级 DOM 邻近检查 + 全局反向断言），07 实现后仍列为人工 QA 复核点。v1.6 起 /webp-to-svg  Proof 块为合法承载页（"Proof — in our tests" spec + 88→9 冻结串同块）。

## 7d. 06f 新增（4 路由 + CookieNotice 真源）

- **/jfif-to-png**（+PT）：镜像 /jfif-to-jpg 单栏骨架；无定价锚点模块、无 §0.3 microcopy、**全页零 cut-ready/DXF 叙事**（audit 负向断言守卫 main 区）；FAQ#2 = "How to open a JFIF file"（dengta 必含项）；页尾内链块置 Final CTA 上方；7 态状态板（无 Precision/AI HD，同 jfif 纪律）。
- **/webp-to-svg**（+PT）：镜像 /png-to-dxf 骨架；Hero **无 DXF 版本选择器**（audit 负向断言 `class="seg"`）；DXF 仅以交叉引导块（info-strip，明示 "This page outputs SVG."）出现；质量诚实块落位；Proof 复用 88→9 冻结串（zhongshu 已放行 PENDING-08，"in our tests" 语境保留）；9 态状态板、下载仅 SVG。
- **PT 两页**：中性约束（零价格/零 Pro/零品牌叙事）；dropzone CTA = `Converter grátis`（zhongshu 裁决覆盖 v1.8 §E-2 复用串）；PT webp 保留诚实块（合规口径非品牌叙事）。
- **CookieNotice 真源（#66）**：镜像线上 CookieNotice.tsx（2026-10-14 版）回画——底部通栏通知条（非 opt-in）、ink 底/blade 按钮、EN/PT 按路由、localStorage `cookie-notice-dismissed` 记忆、role="status"；z-index 90 高于 FAB（40），FAB 避让规则 `body:has(.cookie-notice) .fab-feedback { bottom: 84px }`。**线上行为零改动**，本包仅补设计真源。
- **footer Tools 槽位**：Converters 分组 +JFIF to PNG / WebP to SVG（全站 EN 页脚）；Compare 分组不动。
- **v1.6 漂移修复**：audit.py 已被上游更新为 v1.6 商用授权口径哨兵，本批把 builders（pricing/cricut/cap-states）补齐至 v1.6 附录原文，哨兵-真源闭环恢复。
- **C 组捎带**：/jfif-to-jpg、/jpg-to-dxf、/png-to-dxf 三页 copy-only 变更（05 v1.8 §C）**不进本包**（07 直落），route-mapping 已备注。

### 开放点（归 07，不裁决）
Hero 上传组件转换完成后的流向（停留本页 vs 跳 /png-to-dxf 结果流）——05d §1 注记原样保留，DESIGN 仅落组件位。

### 上游对齐记录（v1.4 不得不动的既有像素）
- **法律 4 页**：pages_legal.py 自 03 现行 md 重建（10-13/10-14 上游回填：Creem 实名+隐私链接、GA4/Clarity 入第三方表、Cookie 政策重写为「通知 banner + 分析 cookie 表 + 拦截器退出路径」）。sentinel 已同步。
- **footer 信任行**：删 "No tracking cookies"（EN）/ "Sem cookies de rastreamento"（PT）——open-items #60 用户 10-14 拍板口径；包内 /cookies 页已含分析 cookie 表，footer 旧主张若不删将自相矛盾。
- **CookieNotice 通知条**：线上 10-14 已上线（通知式非 opt-in，localStorage 记忆），本包**尚无**该组件设计真源 —— 回传 zhongshu：建议 06f 补 CookieNotice 设计真源（样式/token/EN/PT 双语文案槽），或确认以线上实现为准不入包。
- **PT 页**：不加 Compare 分组（中性工具页约束延伸，同 B1 先例）。

## 8. 前端实现注意事项（交 07）

- **双源验收**：07 实现必须对照本包 code.html + 05-copy-freeze 双源；schema 预埋按 open-items #6（Product schema 含 image 绝对 URL、hasMerchantReturnPolicy、SoftwareApplication 含 image）
- **交互还原**：before/after 为双图+分隔手柄（建议 input[type=range] 驱动的 clip-path，本包静态呈现）；FAQ/diag/导航下拉全部 details/summary 无 JS 可工作；seg 控件与 switch 为 aria-pressed/label 语义
- **网络断言**：QA 必须跑 Network 面板——转换全程无文件外发请求（03 P1-2），本设计所有「files never leave your device」表述是技术事实声明
- **反馈表单端点**：08 选型（Web3Forms/Formspree/Worker+Resend；勿用 MailChannels 旧教程）；表单两处（结果态+footer）同端点
- **hreflang**：/jfif-to-jpg ↔ /pt/jfif-para-jpg 互链已在页面层落位，head 标签归 07
- **Free 限流**：IP 哈希 + localStorage 计数器（03 收敛口径），禁浏览器指纹
- **字体自托管**：assets/fonts 已本地化，07 直接随站部署，勿引 Google Fonts CDN（避免第三方请求破坏「零外发」叙事的一致性观感）
- **占位符**：法律页 .fill 高亮块 = 03 回填清单项（公司主体/MoR 名称/邮箱等），上线前必须清零
- **样本图**：assets/samples 全部为合成占位 [待确认]，真实语料到位后逐组同名替换即可，版式无需动

## 9. 06 [DONE] 三项标准自检

- [x] **所有页面设计稿 + route-mapping.json**：15 路由 × code.html + desktop/mobile 截图；7 工具页加 states.html + states.png；route-mapping.json 与 05 页面清单一致（含 /cookies /refund）
- [x] **SEO 基础检查**：15 页 H1 全部唯一且含目标关键词（qa 脚本逐页提取核验）；FAQ 全部问题式 H2/H3（手风琴语义可直接进 FAQPage schema）；robots/canonical 意图：全站 index（PRD §4.2），/pt 页 hreflang 互链，canonical 意向已在 route-mapping 标注——07 落 head
- [x] **handoff 与 copy-freeze 逐页一致**：audit.py 200+ 哨兵逐字通过；价格/CTA/权益零偏差；偏差候选已全部列入 §7 [NEEDS_REVIEW] 而非擅自定稿

## 10. 风险

- P0：无
- P1：合成样本若被当真实案例传播损害诚实叙事（v1.1 起每张样本卡有可见 `SYNTHETIC SAMPLE` 标签 + alt 双重标注；真实语料到位后由 05 统一重产 9 句说明与徽章）；jfif 转码若 07 核实存在重压缩，须回传 05 补 quality 滑杆文案（§11.3 删除注），不得自行上架
- P2：vision 审查工具本阶段不可用（401），视觉验收基于程序化 QA（字体应用/图片加载/移动端溢出/控制台零错误）+ 截图人工复核

## 11. 下游交接摘要

- **下一阶段**：07 frontend
- **必须读取**：本文件 §7（补位文案裁决清单）、route-mapping.json、assets/design-system.css（token 真源）、build/audit.py（07 改任何文案前先跑）
- **不能假设**：可增删路由；可改写冻结文案；可用订阅/无限/lifetime 表述；照片类可承诺 cut-ready；样本图为真实用户案例
