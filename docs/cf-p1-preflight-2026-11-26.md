# CF 权限 + P1-1/P1-2/P1-3 动工前侦察报告（只读，零变更）

- **督办**：wangduoyu ｜ **执行**：jishi ｜ **日期**：2026-11-26
- **工单**：`PROMPT_jishi_cf_p1_preflight.md` ｜ **性质**：纯只读侦察，不含任何写操作/规则变更/开启动作
- **对象**：zone `cleanpaths.io`（zid 前缀 `cc6a8a96…`）；token 文件 `~/.cloudflare/api-token`（allzones 主 token，`/user/tokens/verify`=active，ID 前缀 `9775632c…` 与 skill 台账一致——文件与 dashboard 对齐前提成立）。token 值与完整 ID 不落本报告及任何回复。

## 0. 前置校验回执

1. **工单所引 P1 闸门段已读**：现行 cleanpaths 账本（2026-11-25 重建版）已无「2026-11-24 修改完善计划派单」段；原文在 `demand-signals/2026-09-22-format-friction/open-items.md` L174-184 完整在档。P1 闸门句逐字核实：「P0 全验收后才动 P1-1 缓存；P1-2 WAF / P1-3 HSTS 不依赖缓存规则可先行；P1-1 需用户补 CF token Rulesets 读权限或手动截图」。账本出处偏差沿用 `analytics-spec.md` L85 先例，非阻塞。
2. **必引 skill 已加载**：`cloudflare-token-permissions-ui-2026`（jishi profile `skills/devops/` 类别子目录，督办同步后可发现；首次顶层搜索漏检已由督办纠正归档）。本报告 dashboard 操作段全部按该 skill 2026 新版 Policies 卡片 UI 口径书写。

## 1. 探针记录表（端点 / HTTP 状态 / 语义 / 支撑项）

| # | 端点 | HTTP | 结果语义 | 支撑 |
|---|---|---|---|---|
| P0 | GET `/user/tokens/verify` | 200 | active；ID 前缀 9775632c… = skill 台账 allzones 主 token | 身份前提 ✓ |
| P1a | GET `/zones/{zid}/rulesets/phases/http_request_cache_settings/entrypoint` | **404** | `could not find entrypoint ruleset in the http_request_cache_settings phase`——skill 口径：**404=授权已通过**，该 phase 未配置任何缓存规则 | P1-1 Read ✓ |
| P1a2 | GET `/zones/{zid}/rulesets` | 200 | 现有 ruleset phases：`http_request_sanitize` / `http_response_firewall_custom` / `http_request_firewall_managed` / `ddos_l7` / `http_request_dynamic_redirect`；**无 cache_settings、无 http_request_firewall_custom** | P1-1/P1-2 Read ✓ |
| P1b | GET `/zones/{zid}/settings/security_header` | **200** | `strict_transport_security: enabled=false, max_age=0, include_subdomains=false, preload=false, nosniff=false` | P1-3 基线 ✓ |
| P1c | POST `/graphql`（httpRequests1dGroups 最小查询） | **200** | 0 errors，返回真实数据（样例 2026-11-26：requests 830 / cachedRequests 0 / pageViews 190 / uniques 197） | **Analytics Read ✓（预期 403 未发生）** |
| P1d1 | GET `/zones/{zid}/firewall/rules`（legacy） | **403** | `Authentication error`——legacy Firewall Rules 读权限缺失 | P1-2 老端点 ✗ |
| P1d2 | GET `/zones/{zid}/firewall/waf/overrides`（legacy） | **410** | 端点已退役（Gone），非权限问题，补任何权限都不可恢复 | N/A |
| P1d3 | GET `/zones/{zid}/rulesets/phases/http_request_firewall_custom/entrypoint` | **404** | 404=授权已通过，该 phase 无自定义 WAF 规则（当前全站 0 条） | P1-2（现代 WAF）Read ✓ |
| 诊断 | GET `/user/tokens/{id}` | 403 | code 9109 `Unauthorized to access requested resource`——token 无 API Tokens Read，无法 API 拉精确勾选清单；精确权限组勾选状态以用户 **Summary 页截图为地面真相**（skill 闭环口径） | 记录 |

## 2. Go/No-Go 矩阵

| P1 项 | 所需权限 | 当前 token 状态 | 缺口 | dashboard 添加路径（skill 2026 新版 UI） |
|---|---|---|---|---|
| **P1-1 缓存规则** | Rulesets Read + Edit | Read ✓（404 空语义=授权通过）；Edit 无法用只读端点验证 | 待确认 Edit 是否已勾 | `dash.cloudflare.com/profile/api-tokens` → 目标 token 行末 ⋯ → **Edit** → Policies 卡片（Include/All zones 不动）→ 权限组列表**搜索框搜组名不搜权限名**：搜 `Rules` → **Rules & Configuration 组** → 组内滚动（分组只露前 ~6 项）→ 勾 **Cache Rules: Edit** → **绝不改动已勾选项**、Bulk Select 别碰 → 滚到底 **Continue to summary** → **Update Token** → API 实测闭环 |
| **P1-2 WAF** | Firewall/WAF 权限 | 现代 WAF（自定义规则）Read ✓（404 空=授权通过）；legacy `firewall/rules` 403；`waf/overrides` 端点 410 退役（无法恢复） | 现代 WAF 评估**零缺口**；仅 legacy 透明度缺权限（非必需） | 若要 legacy 可见性：同上 → **Security 相关组** → 勾 Legacy Firewall Services: Read；写侧=Zone WAF: Edit 同组 |
| **P1-3 HSTS** | Zone Settings Edit | Read ✓（基线已取：全关）；Edit 无法用只读端点验证 | 待确认 Edit 是否已勾 | 同上 → **DNS & Zones 组**（组内**两段式：上半 account 级、下半 zone 级，Zone Settings 在下半段，必须组内滚动**）→ 勾 **Zone Settings: Edit** → 底部 Continue to summary → Update Token |

**结论**：
- **P1-2：GO**（读侧已通；custom phase 空=当前全站 0 条自定义 WAF 规则，P1-2 属新建评估）
- **P1-1：条件 GO**（读侧已通；Edit 待 UI 确认；且受工单闸门「P0 全验收后才动」约束）
- **P1-3：条件 GO**（读侧+基线已通；Edit 待 UI 确认；动工另需用户显式 GO，见 §3）
- **Analytics known-gap：已解除**（跨会话遗留「补 Zone Analytics Read 状态未知」→ 实测 GraphQL 200 真数据，无需再补，就此销账）

## 3. P1-3 HSTS 预研

- **现状基线（实测）**：HSTS 全关——`enabled=false / max_age=0 / include_subdomains=false / preload=false / nosniff=false`
- **建议目标两步走**：
  1. 第一步 `max-age=86400`（1 天）观察期：回滚窗口短，若发现子域 HTTPS 缺口影响可控；建议观察 7–14 天无异常
  2. 第二步稳定后升 `max-age=15552000`（180 天）
- **includeSubDomains：单独评估后再开**。开启前必须盘清 cleanpaths.io 下有无任何走 HTTP 的子域（含第三方托管子域），否则会被强制 HTTPS 而断裂。子域清单本单未盘 [待确认]
- **preload：默认不开**。理由：提交进 HSTS preload list 后**撤出需数月流程**（列表随浏览器派发生效），属半不可逆；当前站点规模收益有限，等长 max-age 稳定 + 子域全 HTTPS 确认后再议
- **半不可逆声明**：HSTS 以长 max-age 生效后，访问过站点的浏览器会在 max-age 内强制 HTTPS，回退只能等过期。故**动工前需用户显式 GO**。**本单为纯侦察，不含任何开启动作。**

## 4. 用户代办清单（每条=权限名 + dashboard 路径 + 补完后验证方式）

1. **【零动作·销账】Zone Analytics Read**：已生效（GraphQL 实测 200 + 真数据），无需再补。跨会话遗留就此关闭。
2. **【确认，若已勾则零动作】三个 Edit 复选项**（dashboard：`dash.cloudflare.com/profile/api-tokens` → 目标 token ⋯ → Edit）：
   - **Cache Rules: Edit** → `Rules & Configuration` 组（P1-1）
   - **Zone WAF: Edit** → `Security` 相关组（P1-2 写侧，如需）
   - **Zone Settings: Edit** → `DNS & Zones` 组 zone 级**下半段**（注意组内两段式，别只看上半段；别与组名相似项选混）（P1-3）
   - 通用坑（skill 原文）：搜索框搜**组名**不搜权限名；分组只露前 ~6 项，目标常在组内下半段；**绝不改动已勾选项**；Bulk Select 别碰；改完必须滚到底 **Continue to summary → Update Token**，少这步一切白改。改权限不轮换 token 值，服务器零改动
3. **【可选】Legacy Firewall Services: Read**：仅当 P1-2 需要看老 firewall rules 时补（同上路径，Security 相关组）；现代 WAF 评估不需要
4. **【闭环验证】**：
   - 三个 Edit：无只读验证端点（skill 红线：不在生产试写）。验证方式=用户回传 token **Summary 页完整截图**（往下滚多截几张）作为地面真相；首次真实写操作兜底确认
   - 若补了 Legacy Firewall Read：我重跑 `GET /zones/{zid}/firewall/rules`，预期 200
   - 若 UI 显示已勾但操作仍 403：按 skill Roll 流程处理（Roll → 新值写回 `~/.cloudflare/api-token` + chmod 600 → 全量探针）
5. **【GO 门】**：P1-3 HSTS 动工前单独显式 GO；P1-1 仍受「P0 全验收」闸门约束；P1-2 不依赖缓存规则可先行

## 5. 偏差与观察（如实记录）

1. **P0-4b 记录出入**：cache_settings entrypoint 在 P0-4b 期间曾实测 200，本次实测 404-empty——说明当时该 phase 有 ruleset、现已不存在（或当次记录口径不同）。原因无法只读确证 [待确认]。现状事实=**缓存规则为空，P1-1 将是「新建规则」而非「改现有」**
2. **缓存价值基线佐证**：今日 GraphQL 样例 cachedRequests=0（requests 830）——与 P0-1 根因（HTML max-age=0 永不进边缘缓存）一致
3. **waf/overrides 端点已死（410）**：任何权限组不可恢复，后续工单不要再引用该端点
4. **token 精确勾选清单 API 不可得（9109）**：属正常权限设计非故障；地面真相=Summary 截图，与 skill 闭环口径一致

## 6. 自检（对照 skill 闭环要求与工单硬约束）

- 只读声明：全部探针为 GET / GraphQL 查询，零写操作、零规则变更、零「顺手开一下」 ✓
- token 值/完整 ID 零泄露：文件内容未读取进任何输出，仅用 ID 前缀 8 位做身份对账（该前缀已在 skill 台账公开记录） ✓
- 403/404/410 全部如实记录，未绕过、未猜结果 ✓
- Edit 权限未在生产试写验证，按 skill 口径转用户确认 + 首次写操作兜底 ✓
- dashboard 操作段全部出自已加载 skill 的 2026 新版 UI 口径，无凭记忆编造 ✓
