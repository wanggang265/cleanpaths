# 06c 新增文案回传表 → 05c 冻结（已完成，存档）

> ⚠️ 状态：**已闭环（v1.3）**——28 串全部经 05 §12 裁决冻结（采纳 23 / 改稿 5 / 驳回 0），落位措辞以 05 §12 为准；本表仅作历史建议稿存档。
> 发出：moyun（06c 设计修订）｜ 日期：2026-09-28 ｜ 上游：PROMPT_sheji_06c_revision.md
> 纪律：以下全部为**建议稿**，已在设计稿落位并标 [PENDING-05c]；05c 冻结后若有改串 → 06d 微换 + audit.py 哨兵锁定。
> 集中管理点：`build/components.py` 顶部 `FB_COPY / SHARE_COPY / SHOWCASE_COPY` 三个 dict —— 06d 只改这三处 + 重跑 build/audit/render。

## A. 反馈系统（FAB + 弹窗）

| # | 位置 | 用途 | EN 建议稿 | PT 建议稿 |
|---|---|---|---|---|
| A1 | FAB 标签 | 悬浮按钮文字 | `Feedback`（复用 §0.7 冻结词，大写样式） | `Feedback` |
| A2 | FAB aria | 无障碍标注 | `Open feedback` | `Abrir feedback` |
| A3 | 弹窗标题 | 标题 | `Feedback`（复用冻结词） | `Feedback` |
| A4 | 弹窗副文案 | 第一人称语气（对标 toontone "Bugs, ideas, anything…"） | `Bugs, ideas, praise, anything — it lands on my workbench, not in a ticket queue.` | `Bugs, ideias, elogios — cai direto na minha bancada, não numa fila de tickets.` |
| A5 | 类型四分 | segmented 单选，默认不选 | `Idea` / `Bug` / `Praise` / `Other` | `Ideia` / `Bug` / `Elogio` / `Outro` |
| A6 | 文本域占位 | 自由文本 | `What worked, what didn't…` | `O que funcionou, o que não funcionou…` |
| A7 | 联系方式占位 | 可选联系 | `Email or handle (optional — only if you'd like a reply)` | `E-mail ou usuário (opcional — só se quiser resposta)` |
| A8 | 信任行 | 匿名默认 + 自动上下文 + 文件红线（zhongshu 强制：必须含 "We never see your files" 类表述） | `Anonymous by default — we auto-attach this page and your language, never your files. We never see your files.` | `Anônimo por padrão — anexamos esta página e seu idioma automaticamente, nunca seus arquivos. Nós nunca vemos seus arquivos.` |
| A9 | 提交按钮 | 提交 | `Send feedback`（**已冻结** §0.7，复用） | 同左（§0.7 无 PT 版，05c 定夺是否补 PT） |
| A10 | 成功态 | 致谢 | `Thanks — this goes straight to the person building CleanPaths.`（**已冻结** §0.7，复用） | 同上待 05c |
| A11 | 失败态 | 错误+兜底 | `That didn't send — try again, or email feedback@cleanpaths.io directly.` | `Não foi possível enviar — tente de novo, ou escreva para feedback@cleanpaths.io.` |
| A12 | 重试按钮 | 失败态按钮 | `Try again` | `Tentar de novo` |
| A13 | 关闭 aria | 弹窗关闭 | `Close feedback dialog` | `Fechar feedback` |
| A14 | footer 次级入口按钮 | footer 反馈区打开同一弹窗 | `Open the feedback dialog →` | —（PT 页无此区块） |

⚠️ A8 提示 05c/03 复核：03 禁词表禁「anonymous」用于反馈表单语境；本串为 zhongshu 06c 派活明确要求（"弹窗内必须明示匿名默认"），且语义为「默认匿名、可选留联系方式」，与 03 §3 口径不冲突——请 05c 裁决最终措辞。

## B. 社媒引流

| # | 位置 | 用途 | EN 建议稿 | PT 建议稿 |
|---|---|---|---|---|
| B1 | footer 社媒槽位 | 图标 aria（URL 为 open-items 空槽，无编造 handle） | aria: `X` / `YouTube` / `Pinterest`（可见文字=无） | —（PT 页**不放**社媒槽位：中性工具页约束延伸，06c 设计侧决定，可否决） |
| B2 | 结果页 Share 标题 | 分享区块 | `Share your result` | `Compartilhe seu resultado` |
| B3 | 复制链接按钮 | | `Copy link`（成功态 `Link copied`） | `Copiar link`（`Link copiado`） |
| B4 | X 分享按钮 | intent 链接 | `Post to X` | `Postar no X` |
| B5 | X 预填文案 | 分享预填 | `Just turned a messy image into a cut-ready file — in my browser, no upload. cleanpaths.io` | `Converti minha imagem direto no navegador, sem upload. cleanpaths.io` |
| B6 | 下载成品图按钮 | 下载分享素材 | `Download share image` | `Baixar imagem para compartilhar` |
| B7 | 上墙 opt-in 勾选 | 默认不勾（红线） | `Feature my result on the examples wall` | `Mostrar meu resultado no mural de exemplos` |
| B8 | opt-in 说明 | 勾选下行 microcopy | `Off by default. If you check it, we confirm by email before anything goes up — leave a contact in the feedback form.` | `Desativado por padrão. Se marcar, confirmamos por e-mail antes de publicar.` |

## C. 成品展示

| # | 位置 | 用途 | EN 建议稿 | PT 建议稿 |
|---|---|---|---|---|
| C1 | 首页 Featured 横条标签 | spec 注 | `Featured examples` | —（/samples EN only） |
| C2 | 首页 Featured 横条链接 | 去样本墙 | `See all before / after →` | — |
| C3 | /samples Community 槽位标题 | H2 | `Community` | — |
| C4 | Community 槽位说明 | 冷启动诚实说明 | `Real maker results land here — featured only with explicit opt-in. Nothing yet: the wall opens when the first makers say yes.` | — |
| C5 | Community 槽位 spec 注 | 槽位标注 | `Reserved — opens on first opt-ins` | — |
| C6 | /samples 样本卡标题 ×9 | 可见卡题（索引结构需要） | `Hexagon badge logo` / `Coffee mark logo` / `Mountain mark logo` / `Dashboard UI` / `Mobile app screen` / `Settings panel` / `Flower line art` / `Rocket stencil` / `Geometric deer` | — |

## 复用既有冻结串（不计新增，仅登记）

- `Feedback`（§0.7 页脚入口词）→ FAB 标签/弹窗标题
- `Send feedback` + 成功感谢句（§0.7）→ 弹窗提交与成功态
- 样本卡 9 句说明 + 统计徽章（§11.6 已冻结）→ 首页 Featured 横条复用其中 3 句
