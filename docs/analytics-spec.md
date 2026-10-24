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
