# analytics-spec.md — CleanPaths 第一方埋点规格（#54 预注册）

> 唯一事实源。日报/周报引用本文件；**复盘产出禁止「转化率待提升」类无落点结论**（裁决 §三.3 原文要求），每次必须输出「最漏层 + 处方 + 派工单」。
> 上游：决策报告 v2.0 §埋点A；`../../../2026-10-12-login-decision-cleanpaths/01-裁决记录-v1.md` §三（预注册硬写入，事件不得自行增删）。

## 1. 事件集（恰好 5 个，预注册）

| event | 前端接入点 | slug | slot |
|---|---|---|---|
| `tool_start` | 转换开始（ToolController.run 过配额闸门后） | 页面路径 | — |
| `tool_complete` | 转换完成（recordConversion 后） | 页面路径 | — |
| `cap_hit` | 触顶态渲染（cap state render） | 页面路径 | — |
| `purchase` | 购买成功页返回（/pricing/?checkout=success，CheckoutLinks） | 页面路径 | — |
| `cta_click` | Pro CTA 点击：pricing 卡 / cap 态 / cricut 页三处既有 CTA | 页面路径 | `pricing` / `cap` / `cricut` |

购买真源 = Creem webhook（08 既有）；beacon `purchase` 仅作漏斗参照。

## 2. 字段与禁收清单

- 收：`event`、`slug`、`slot`（cta_click 专用）、`day`（UTC 日期桶，服务端派生）、`iph`（SHA-256(cf-connecting-ip + 日盐) 单向哈希）。
- 日盐 = 当日 UTC 日期桶派生（`cp-beacon-v1:<day>`），每日轮换、不落盘；昨日哈希无法与今日 join。
- **禁收**：user-agent 指纹、文件内容/文件名、任何可还原个人的字段。

## 3. 存储形态（KV namespace `BEACON_KV`）

| key 形态 | 内容 | TTL |
|---|---|---|
| `d:<day>:<event>` | 日总计数 | 无（长期聚合） |
| `d:<day>:<event>:<slug>` | 页面/工具日计数 | 无 |
| `d:<day>:cta_click:slot:<slot>` | cta_click 位置拆分 | 无 |
| `ip:<day>:<iph>:<event>` | IP 级存在标记（三分类 join 用） | **24h**，与 Privacy「24 小时内删除」逐字对齐；按日桶前缀查询，join 窗口不受影响 |

KV 长期只留日聚合，不留 IP 级明细——与 Privacy「hash deleted within 24 hours」口径对齐（TTL 24h，逐字一致）。
计数为 read-modify-write，高并发下有丢计可能；本站点量级下对聚合分析可忽略。不得因此引入 Durable Objects 等服务端成本——裁决 §三.4 闸门：任何引入服务端成本的功能上线前重跑定价五问。

**CF 绑定方式（2026-10-13 实证）**：`BEACON_KV`（namespace id `2d52124fbac54d0185d052f66bc9743b`）绑定在 Pages 项目 `cleanpaths` 的 production deployment_config（服务端持久，CLI deploy 不丢）。**禁止**在仓内加 wrangler.toml 声明该绑定——wrangler.toml 存在会触发 wrangler 新版 Pages 打包路径（functionsWorker 引入 node:stream，CF 拒绝发布，2026-10-13 实测）。`BEACON_ADMIN_KEY` 走 `wrangler pages secret put`（已在 production）。

## 4. 触顶三分类取数口径（裁决 §三.2 落地方案）

对当日有 `cap_hit` 的 iph，看其 24h 窗口（=当日桶）内其他事件：

| 条件 | 分类 | 含义 |
|---|---|---|
| 无后续任何事件 | **离开** | 触顶后流失 |
| 有 `tool_complete` 但无 `purchase` | **绕过** | 清 localStorage 重置计数器 |
| 有 `purchase` | **付费** | 触顶转化 |

取数接口：`GET /api/beacon-report?days=N`（header `x-beacon-admin-key`，Pages secret `BEACON_ADMIN_KEY`；不带/错带 → 401）。不建 dashboard 页面。

## 5. 预注册裁决规则（裁决记录 §三 原文，禁止改写）

> **§三.1 备忘录预测**（可证伪）：旧模型（次数墙主触发）下触顶后行为将以「离开+绕过」为主。新模型上线后此预测转为对新模型的验证基线。

> **§三.2 触顶三分类诊断→处方映射**：离开占主导=墙位置错→评估挪墙；绕过占主导=加固（指纹/Turnstile，P2）；付费健康=不动放量。

> **§三.3 漏斗层→处方→责任人固定映射**：使用率低→改首屏（设计/文案）；完成率低→改工具（工程）；导出率低→改价值表达（产品）；触顶付费率低→三分类表裁决（数据）；注册率低→才轮到登录（数据触发）。**复盘产出禁止「转化率待提升」类无落点结论**，每次必须输出「最漏层+处方+派工单」。

> **§三.4 架构两闸门**：①任何引入服务端成本的功能（如未来服务端 AI 超分）上线前，定价五问（成本→锚点→意愿→漏斗→上限）整串重跑；②任何额度争论先答单次成本（当前恒≈0），自动转化为转化调参问题。

## 6. 事件→漏斗层对照（读数时强制引用）

| 层 | 事件口径 | 低 → 处方（§三.3 固定映射） |
|---|---|---|
| 使用 | `tool_start` / UV（CF WA） | 改首屏（设计/文案） |
| 完成 | `tool_complete` / `tool_start` | 改工具（工程） |
| 触顶 | `cap_hit` / `tool_start` | — |
| 触顶付费 | 三分类表（§4） | 数据裁决（离开→挪墙 / 绕过→加固 P2 / 付费→不动放量） |
| 购买 | `purchase`（参照）+ Creem webhook（真源） | — |
| CTA | `cta_click` by slot | 位置诊断输入，不单独下结论 |

## 7. 变更纪律

事件集、字段、存储形态、三分类口径的任何变更 = 修订本文件 + zhongshu 复核，与 05 文案冻结同级。前端新增埋点点位必须落在预注册事件上；新事件一律先修订本文件。

## 8. GA4 事件规格（P0-4，2026-11-26 冻结）

> 本节是 GA4 规格冻结单（P0-4s）交付物，与上方 §1–7 的第一方 beacon 规格互不隶属：两套系统、两条通道、各自事实源。改本节不动 §1–7，改 §1–7 不动本节。前端实现归 P0-4a，服务端 purchase 归 jishi（P0-4b），均以本节为唯一规格依据；偏离 = 打回。

### 8.0 背景对账（防止后人再踩）

- **线上已活 GA4 事件（3 枚）**：`upload_start` / `convert_success` / `download`，#112 阶段 1 落地，经 P0-2（2026-11-24 修改完善计划，王刚 GO）调整：`upload_start` 已移至**文件选取时刻**（two-stage flow），Convert 点击不重发。三枚均走 gtag 存在性守卫（`gtagEvent()`，ToolController.tsx L98-101，脚本被拦/无 JS 时 no-op）。
- **代码级证据**：`src/app/layout.tsx` L39-48（gtag.js 加载 + `gtag('config', 'G-9T8XY5EB0Y')`）；`src/components/tool/ToolController.tsx` L276（upload_start）/ L366（convert_success）/ L735（download + file_type）；QA 断言：`scripts/qa-stage1-local.cjs`（T6 chunk 含三事件名 + file_type）、`scripts/qa-ga4-events.cjs`、`scripts/qa-p0-2.cjs`（upload_start-once 断言）。
- **P0-4a 草案名冲突**：草案里的 `file_selected` / `convert_completed` / `download_clicked` 与上述三事件是**同一用户动作的换名**。同一动作两个名字 = 要么同刻双发、要么无裁决换名（换名 = 历史数据断代）——两者都禁止。处置见 §8.1。
- **beacon 隔离**：第一方 beacon 5 事件（tool_start/tool_complete/cap_hit/purchase/cta_click，`src/lib/beacon.ts`）是另一套系统，本节一个字不动。「禁止同刻双发」仅指 GA4 集内部；GA4 事件与 beacon 事件同刻各发各的属于两套系统并行，不算双发。
- **账本出处偏差（非阻塞）**：工单引用的 open-items.md「2026-11-24 修改完善计划派单」+「P0-2 核销」两小节已随 2026-11-25 账本重建归档，现行账本（建账 2026-11-25，账面清零）已无此两节。本节以上述仓内代码 + QA 脚本为替代事实源完成对账，结论与工单背景描述一致。
- **GA4 资产**：网页 gtag 与服务端 Measurement Protocol 用同一资产，measurement_id = `G-9T8XY5EB0Y`。

### 8.1 命名裁决（冻结）

沿用线上已活名（数据连续性优先，裁决依据：三事件已上线产数，换名 = 历史断代 + 必须引入双发窗口，成本大于收益）：

| canonical（代码/GA4 后台/报表唯一用名） | 草案名（deprecated alias，禁用于实现） |
|---|---|
| `upload_start` | `file_selected` |
| `convert_success` | `convert_completed` |
| `download` | `download_clicked` |

- alias 仅允许在文档/讨论中作解释用途；代码、GA4 事件注册、报表查询一律 canonical。
- 本裁决不引入双发窗口（不换名即无需迁移）。未来如必须换名：先修订本文件、写明迁移与双发窗口方案、报督办裁决，禁止实现侧自行换名。

### 8.2 事件表（恰好 9 行，冻结后实现不得增删）

device / country / 语言等走 GA4 标准维度自动采集，不在自定义参数中重复。`page_location` 为 GA4 自动参数，无需手传。

| # | name | 发送方 | 触发时机（代码级锚点） | 参数（自定义） | 去重规则 |
|---|---|---|---|---|---|
| 1 | `upload_start` | FE | 文件选取落定：picker `onchange` / drop → `showSelected()` 入口（ToolController.tsx L276，已上线）。P0-2 冻结：选取时刻即发，非法扩展名 fast-fail 照发 | `file_type` = 选中小写扩展名（无点，如 `jfif`/`webp`/`svg`；非法值原样记录） | 一次选取发一次；Convert 点击/重试严禁重发 |
| 2 | `convert_started` | FE | `run()` 通过配额闸门后（L317 `beacon('tool_start')` 同点旁新增；P0-4a 实现） | `file_type` = 输入扩展名 | 每次 Convert 点击一次；cap 拒绝时**不发**；选取阶段不发 |
| 3 | `convert_success` | FE | `produce()` resolve 且非 stale run（`myRun===runSeq`），`renderResult()` 前（L366，已上线） | `file_type` = 输出格式 key（下划线形式） | 转换失败 / watchdog 超时 / 中途取消均不发 |
| 4 | `download` | FE | 结果区下载按钮 click（L735，已上线） | `file_type` = `dxf_r2000`/`dxf_r12`/`svg`/`png`/`jpg` | 每次点击发一次；结果渲染时严禁自动补发 |
| 5 | `pricing_view` | FE | `/pricing/` 整页加载（CheckoutLinks mount，该组件仅包裹 pricing 页；P0-4a 实现） | — | 每次页面加载一次；`?checkout=success` 返回落地也算一次（页面加载真实发生） |
| 6 | `buy_click` | FE | 付费 CTA 点击（CtaBeacon onClick，冻结串命中；P0-4a 实现） | `slot` = `pricing`/`cap`/`cricut`（与 beacon cta_click 三 slot 判定逻辑同源，便于两套数据交叉验证） | 仅三个预注册 slot；其余 CTA 文案不命中不发；每次点击一次 |
| 7 | `checkout_started` | FE | 实际跳转发起：`/api/checkout` 成功后 `assign(url)` 前 / fallback `assign(CREEM_PRODUCT_URL[plan])` 前（CheckoutLinks.tsx L110/L114；P0-4a 实现） | `plan` = `pro`/`monthly-pass`/`batch-pack`/`precision-pack`；`path` = `api`/`fallback` | 每次 assign 发一次；offline `.catch`（用户留在页上）不发 |
| 8 | `language_switch` | FE | 点击语言互切链接：PT 页 header「English version →」（SiteHeader.tsx L91 桌面 / L98 移动）与 PT 页 footer「English version」（SiteFooter.tsx L48；P0-4a 实现） | `from_lang`=`pt`，`to_lang`=`en`（本规格覆盖**组件级**互切入口：PT 页 SiteHeader L91/L98 + SiteFooter L48；EN 页正文 content 文件内的 Versão 链接——如 jfif-to-jpg.ts L115——**不在本批覆盖**，纳入须先修订本节） | 每次点击一次；落地页 page_view 自动另计 |
| 9 | `purchase` | BE | Creem webhook（functions/api/webhooks/creem.ts）收到**支付成功类**事件后经 Measurement Protocol 发送（§8.4；P0-4b 实现） | `transaction_id`、`currency`、`value`、`items[item_id/item_name/price/quantity]` | `transaction_id` = Creem 收据号幂等：GA4 对重复 transaction_id 原生去重，webhook 重试不双计 |

### 8.3 时序关系图（冻结；GA4 集内部禁止同刻双发）

工具主线（一动作一事件）：

```
选取文件 ──► upload_start            仅此一刻；Convert 点击/重试严禁重发（P0-2 冻结）
   │  非法格式 fast-fail → 流程终止，此后无任何 GA4 工具事件（重选文件才重新开始）
   ▼
[Convert 点击，通过配额闸门] ──► convert_started
   │  cap 拒绝 → convert_started / convert_success 都不发（beacon cap_hit 照旧，属另一套系统）
   ▼
produce() 成功（且非 stale run）──► convert_success
   │  失败 / watchdog 超时 / 中途取消 → 不发
   ▼
[下载点击] ──► download              结果渲染时严禁自动补发；convert_success 后不发任何自动事件
```

购买支线（独立于工具主线）：

```
/pricing/ 加载 ──► pricing_view
   ▼
[付费 CTA 点击] ──► buy_click (slot=pricing) ──► checkout_started (path=api|fallback) ──► 跳 Creem 托管页
   ▼
（Creem 托管页：GA4 网页端不覆盖，无前端事件）
   ▼
支付成功 → Creem webhook ──► purchase（仅 BE，Measurement Protocol，§8.4）
```

cap 态入口：`buy_click (slot=cap)` → 落地 `/pricing/` 触发 `pricing_view` → 进入上述支线。cricut 页同理（slot=cricut）。

谁不发（禁止项）：

- FE **永不发** `purchase`：成功页 `beacon('purchase')` 是第一方 beacon 集的既有行为（CheckoutLinks.tsx L60），照旧不动；GA4 的 purchase 只有 BE 一条通道。
- `checkout_started`（FE）与 `purchase`(BE) 分属两端，严禁任何形式的同名双发；两事件的关联靠 §8.4 关联键 join，不靠事件名。
- beacon 5 事件照常独立发送，本节不改变其任何行为。

### 8.4 服务端 purchase（GA4 Measurement Protocol）— 实现归 jishi（P0-4b），本节只冻规格

- **通道**：GA4 MP，`POST https://www.google-analytics.com/mp/collect?measurement_id=G-9T8XY5EB0Y&api_secret=<GA4_API_SECRET>`。measurement_id 与网页 gtag 同一资产。
- **鉴权**：api_secret 走 Pages secret `GA4_API_SECRET`（`wrangler pages secret put GA4_API_SECRET`；本文档只写引用名，不写值，与 BEACON_ADMIN_KEY 同一管理方式）。
- **幂等**：`transaction_id` = Creem 收据/订单号（webhook payload 中的 order id）。GA4 对相同 transaction_id 的 purchase 原生去重 → Creem webhook 重试（同单多投）不双计。
- **金额/币种**：与收据一致——`value` = 收据金额（分转元 ÷100），`currency` = 收据币种大写（当前全部 USD）；两者同源同值，禁止换算、禁止取整。
- **与前端 `checkout_started` 的关联键（二选一，写死：client_id）**：
  - 链路：FE 从 `_ga` cookie 解析 GA4 client_id → 随 `POST /api/checkout` 请求体附上 → `/api/checkout` 创建 Creem checkout 时以 metadata/custom 字段透传 → Creem webhook 事件回读该字段 → MP payload `clientId` 字段填它。
  - 否决 transaction_id 方案的理由：FE 发 `checkout_started` 时（跳 Creem 前）拿不到 order id，无法构成等值 join。
  - fallback：`/api/checkout` 5xx 直接跳 `CREEM_PRODUCT_URL` 公共页（无 metadata 通道）、或 `_ga` 缺失/被禁时，`clientId` 用随机 UUID 兜底——purchase 照发（购买计数不丢，仅用户级关联弱化）。
  - [待确认]（P0-4b 实现时以 Creem 官方文档/实测 webhook 日志核对，不得靠猜上线）：①Creem checkout metadata 透传字段名与 webhook 回读路径（如 custom_request_data）；②「支付成功」类 webhook 事件类型名（refund/退款类不在本规格内，需要时先修订本文件）。
- **MP payload 形状（字段冻结）**：`{client_id, events:[{name:"purchase", params:{transaction_id, currency, value, items:[{item_id:<plan>, item_name:<plan>, price, quantity:1}]}}]}`。webhook 原始事件含客户 email 等 PII（creem.ts 的 maskEmail 即为其存在证据）——MP 载荷**只取订单级字段**，严禁带 email/姓名。
- **MP debug 验证步骤（P0-4b 交付物）**：①先打 debug endpoint `https://www.google-analytics.com/debug/mp/collect?measurement_id=G-9T8XY5EB0Y&api_secret=***` 带真实 payload，期望返回 `{"validationMessages":[]}`；②GA4 DebugView 命中 purchase；③用同一 transaction_id 重发一次 → DebugView 不再新增（幂等实证）；④debug 请求/响应与 DebugView 截图入 `docs/evidence/`。

### 8.5 隐私一致性声明

- GA4（网页 gtag）与 Clarity 已在 Privacy/Cookies 政策披露并上线（CookieNotice 组件 + `/cookies/` 页，#60）。本批 9 事件**不扩大披露范围**：全部是既有 GA4 通道上的动作标记，无新增第三方。
- **参数白名单（禁收清单与 beacon §2 同级）**：只收动作元数据——`file_type`（来自 `extOf()` 的扩展名枚举，不是文件名）、URL 路径/slug、`slot`/`plan`/`lang` 枚举、BE 侧订单级字段（transaction_id/金额/币种）。禁收：文件内容、文件名、任何可还原个人的字段（email/UA 指纹等）；服务端 MP 载荷同样禁收 webhook 里的客户 PII。
- **与「files never leave your device」不冲突**：GA4 只记录「发生了什么动作」（选了哪类文件、转换是否成功、点了哪个按钮），不接触文件内容与文件名；转换引擎全在浏览器内本地执行，文件字节从不离开设备。GA4 脚本被拦截/禁用时 gtag 守卫 no-op（ToolController.tsx L98-101），工具功能完全不受影响。
- 服务端 `purchase` 同样不含文件数据——它只证明「一笔订单完成」。

### 8.6 DebugView 验收计划（P0-4a/4b 交付证据，齿轮 QA 复核）

环境：GA4 DebugView（debug_mode 设备流）+ DevTools Network（可见 `google-analytics.com/g/collect?...en=<event>` 请求）。逐事件过一遍：

| 事件 | 触发动作 | DebugView / network 期望 |
|---|---|---|
| upload_start | `/jfif-to-jpg/` 选取 .jfif | 命中，`file_type=jfif`；再点 Convert 确认计数仍为 1（不重发） |
| convert_started | 同流程点 Convert | 命中，`file_type=jfif` |
| convert_success | 转换完成 | 命中；对照：Convert 阶段喂非法文件 → 不命中 |
| download | 点结果区下载 | 命中，`file_type` 与所点格式一致 |
| pricing_view | 打开 `/pricing/` | 命中（含 `?checkout=success` 返回落地一次） |
| buy_click | pricing 卡 CTA / cap 态 CTA / cricut 页 CTA | 三次命中，`slot` 分别 = pricing / cap / cricut |
| checkout_started | pricing 卡 CTA 跳转前 | 命中 `plan` + `path=api`；staging 模拟 `/api/checkout` 5xx → `path=fallback` |
| language_switch | `/pt/jfif-para-jpg/` 点「English version →」 | 命中 `from_lang=pt, to_lang=en`（header 与 footer 各验一次） |
| purchase | §8.4 debug 步骤 ①–③ | debug endpoint 零 validationMessages + DebugView 命中 + 同 transaction_id 重发不新增 |

- **page_location 抽查**：EN `/jfif-to-jpg/` 与 PT `/pt/jfif-para-jpg/` 各 1 页——事件自动参数 page_location 须为规范 URL（PT 页含 `/pt/` 前缀、无 query 残留），各留截图。
- **证据落档**：`docs/evidence/p0-4-ga4-debugview/`（DebugView 截图 + network 导出 + MP debug 日志），P0-4a/4b 提交，QA 复核后才算实现完成。

### 8.7 变更纪律（沿用 §7 口径）

- 本节 9 事件冻结后，实现偏离规格（改名 / 增删事件 / 改参数 / 改触发点）= 打回。
- 新增 GA4 事件一律先修订本文件 + 督办复核，与 §7「新事件一律先修订本文件」同权。
- §1–7（beacon）与本节互不隶属：改 beacon 不动本节，改本节不动 beacon。
- 换名/迁移必须先修订本文件、附双发窗口方案、报督办裁决（§8.1）；禁止实现侧自行换名。
