# WAF/边缘安全态势评估 P1-2 — cleanpaths.io（纯只读评估，零实施）

**工单**：`demand-signals/2026-09-22-format-friction/PROMPT_jishi_p1-2_waf_eval.md`（zhongshu 派，2026-11-27）
**执行**：jishi，2026-11-27
**通道声明**：本单零实施、零部署、零 CF 资源变更。所有 CF 请求为只读（GET + 账号级 GraphQL 查询）。任何"改"的建议只进本报告 §T3，实施属未来另单（需 boss 补对应 Edit 权限 + 拍板）。
**事实源**：preflight 报告 `docs/cf-p1-preflight-2026-11-26.md`（OD-6 认定）+ 本单实测探针。禁引用历史 WO 过期口径——已遵守。
**必引 skill**：`cloudflare-token-switching-protocol`（token 选型 + 退役端点台账 + GraphQL 账号级通道，全程照此执行）。表外不引：`cloudflare-deployment-manifest`（无部署）、`agent-security-audit-tiering`（非代码审计）、`cloudflare-token-permissions-ui-2026`（无 UI 动作）——理由见工单前置校验 4。

## 前置校验记录（2026-11-27 实测）

| 项 | 结果 |
|---|---|
| token `/home/ubuntu/.cloudflare/api-token` | `/user/tokens/verify` → active，ID 前缀 `9775632c`（与工单/skill 台账一致）。api-token.pages 未使用 |
| zone | zid 前缀 `cc6a8a96`（API 实测取全值，仅入脚本内存与证据 JSON，报告/回复打码） |
| preflight 报告在盘 | ✓ `docs/cf-p1-preflight-2026-11-26.md` |
| 总控空 entrypoint 注记 | ✓ 实测 `http_request_cache_settings` 与 `http_request_firewall_custom` entrypoint 均 200 + rules=[]，按注记判读为 0 条规则，未误判 |

## T1 边缘安全现状盘点

### T1-① Rulesets phases 全列（GET `/zones/{zid}/rulesets` → 200）

7 个 entrypoint ruleset：

| phase | name | kind | entrypoint 探测 |
|---|---|---|---|
| http_request_sanitize | Cloudflare Normalization Ruleset | managed | 403（内容读权限缺，列表确认挂载） |
| http_response_firewall_custom | Cloudflare Managed Response Firewall Default | managed | 404（无 zone entrypoint = 空） |
| **http_request_firewall_managed** | **Cloudflare Managed Free Ruleset** | **managed** | 404（entrypoint 无 zone 层配置；**managed 本体另探，见 T1-②**） |
| ddos_l7 | DDoS L7 ruleset | managed | 403（内容读权限缺，列表确认挂载） |
| http_request_dynamic_redirect | default | zone | 403（读权限缺口，如实记录） |
| http_request_cache_settings | default | zone | 200，rules=[]（总控空 entrypoint） |
| http_request_firewall_custom | default | zone | 200，rules=[]（总控空 entrypoint） |

- `http_request_sbfm` → **400 `unknown phase`**：Free 计划无 Super BFM phase，如实记录。
- `http_ratelimit` → **404**：无 entrypoint = **Rate Limiting 0 条规则**（见 T1-④）。
- 403 语义如实记录：`http_request_sanitize` / `ddos_l7` / `http_request_dynamic_redirect` entrypoint 内容读取被拒（token 无对应读权限），列表层已确认挂载事实，不绕过、不猜内容。

### T1-② Managed Ruleset 启用状态与版本

**结论：已挂载，非空。** `Cloudflare Managed Free Ruleset`（kind=managed）内容 GET 200：

- **44 条规则，全部 enabled，action 全部 = block**
- 版本号混杂 v1–v60，覆盖：Log4j（Headers/URI, v60）、Shellshock（v49）、WordPress 全家桶 SQLi/XSS/RCE/Code Injection（v43 系列）、Atlassian Confluence CVE-2022-26134 / CVE-2023-22515、React CVE-2025-55182/55183、PHP RCE 2026 系列（CVE-2026-109618/109619 ×7 条）、Ruby 2026 系列、Generic Authentication Bypass、Anomaly Embedded Application Request
- 规则明细 verbatim：`docs/evidence/cf-p1-2/t1-managed-ruleset-and-graphql.json`
- 注：这是 **Free 计划托管规则集**（非付费完整版 CF Managed Ruleset + OWASP Core 全集），由 CF 自动维护更新，zone 侧不可增删条目

### T1-③ Bot Fight Mode / Super BFM

`GET /zones/{zid}/bot_management` → 200，verbatim（证据 JSON 同步落盘）：

```
fight_mode: false          ← BFM 关闭
enable_js: false
ai_bots_protection: disabled
content_bots_protection: disabled
crawler_protection: disabled
ai_training / ai_search / ai_user / ai_agents: 全 disabled
is_robots_txt_managed: false
using_latest_model: true
```

- **BFM = OFF**；SBFM = Free 不可用（`http_request_sbfm` 400 unknown phase）
- **AI 爬虫防护全线 disabled，robots.txt 托管未开启**（`bot_management/ai_crawlers` → 404，端点对 Free zone 不开放，如实记录）

### T1-④ Rate Limiting

- 现代 rulesets 通道：`http_ratelimit` entrypoint 404 = **0 条限速规则**
- legacy `GET /zones/{zid}/rate_limits` → **403**（10000 Authentication error，verbatim 入证据）——token 无该端点权限，按工单硬性要求 5 如实记录、不现场补救。现代通道 404 语义独立成立，Rate Limiting 现状判定 = 空。

### T1-⑤ Zone settings 安全相关项（GET `/zones/{zid}/settings` → 200）

| 项 | 值 | 判读 |
|---|---|---|
| security_level | medium | 默认档，维持 |
| browser_check | on | ✓ 在岗 |
| challenge_ttl | 1800 | 默认，维持 |
| security_header (HSTS) | enabled=false / max_age=0 / includeSubdomains=false / preload=false / nosniff=false | **全关**，与 preflight P1b 基线一致（P1-3 输入） |
| **min_tls_version** | **1.0** | 偏低，见 T3 P1-α |
| tls_1_3 | on | ✓ |
| automatic_https_rewrites | on | ✓ |
| opportunistic_encryption | on | ✓ |
| 0rtt | off | ✓（0-RTT 重放面已关） |
| waf（legacy 开关） | off | legacy WAF 包关闭；现代 WAF 以 Managed Free Ruleset 为准，**不冲突** |
| hotlink_protection / rocket_loader / mirage | off | 静态站默认，维持 |
| development_mode | off | ✓ |

### T1 附加：GraphQL 账号级安全事件（只读查询）

`POST /graphql`（账号级，zone tag 入查询体，10404 端点陷阱已规避）→ **HTTP 200 envelope 但 errors 非空**：`account does not have access to the path`（Analytics 读权限仍缺，与 preflight 结论一致，boss UI 待补）。7 天 firewall events / 请求量数据**不可得**，本报告威胁评估基于配置面 + 逻辑推断，数据佐证层留待权限补齐后另跑。

## T2 威胁模型对照

资产：浏览器端工具站（转换全在本地、服务器无文件处理面）+ `/api/checkout` + `/api/webhooks/creem`（HMAC 验签已实证：TEST 密钥 200 / 错误密钥 401，OD-9）+ beacon 管理端点（401 secret 防护在岗）。

攻击面排序（配置面事实 × 暴露逻辑）：

| # | 攻击面 | 现状防护 | 残余风险 |
|---|---|---|---|
| 1 | **`/api/checkout` 支付端点滥用** | 边缘层**零防护**（无限速、无 BFM、custom rules 空） | 批量刷 checkout session → Creem 侧成本/风控敏感（boss live $1 曾被风控拒，实证成本敏感）+ 日志噪音 + JWT 无效调用消耗 |
| 2 | `/api/webhooks/creem` 伪造/重放 | HMAC 验签在岗（应用层，已实证） | 伪造必 401；垃圾流量打满 Functions 日志的低成本骚扰面 |
| 3 | **爬虫刷量刷配额** | BFM 关、AI 爬虫全放行、robots.txt 未托管 | beacon/GA4 配额数据可被脚本污染（P0-4 GA4 真源价值受损）；静态资源消耗量级小 |
| 4 | beacon 管理端点暴露 | secret 层 401 在岗 | 无限速；路径存在性可探测 |
| 5 | 应用层漏洞 | — | **归 `agent-security-audit-tiering` 代码审计线，本单不评**（工单明示） |

核心判定：**边缘主力（Managed Free Ruleset 44 条 block）防的是已知 CVE 扫描流，对 1/3 两类"滥用而非攻击"面无覆盖**——这两类是本站真实暴露面。

## T3 建议分级清单（⚠️ 本单零实施——以下全部是给未来实施单的输入，非已批准项）

### P0：无

现状无紧急缺口：Managed Free Ruleset 在岗 + webhook 验签在岗 + 管理端点 secret 在岗 + browser_check 在岗。

### P1-α：min_tls_version 1.0 → 1.2

| 五件套 | 内容 |
|---|---|
| 所需 CF 权限 | Zone Settings Edit——**token 已有**（OD-6：security_level 同值 PATCH 200 实证） |
| 预期影响面 | TLS<1.2 客户端（≈2013 前设备）拒握手；工具站受众浏览器现代，误伤近零 |
| 回滚方式 | PATCH 回 `1.0`（同值 PATCH 通道已实证可用） |
| 验证探针 | `curl --tls-max 1.1 https://cleanpaths.io` 预期 handshake failure；`curl -sS -o /dev/null -w "%{http_code}" https://cleanpaths.io` 预期 200 |
| 优先级理由 | 一行变更、基线安全、零依赖，可随任何实施单捎带 |

### P1-β：Bot Fight Mode 开启（带前置安全阀）

| 五件套 | 内容 |
|---|---|
| 所需 CF 权限 | BFM 是 dashboard 一键开关（无需 API token 权限）；前置 skip 规则需 **Zone WAF Edit（token 已有）** |
| 预期影响面 | **直接开有真实误伤风险**：BFM 可能 challenge 无浏览器特征的 API 流量——`/api/webhooks/creem`（Creem 服务器间回调）首当其冲，webhook 断 = 支付状态失联。正确顺序：①先建 custom skip 规则豁免 `/api/webhooks/*` 与 `/api/checkout`（http.request.uri.path 匹配 + skip action）→ ②dash 开 BFM → ③行为核销（触发 test webhook，看 200 到账） |
| 回滚方式 | dash 一键关 BFM；skip 规则删除（PUT 空 ruleset，总控零效果探针通道已实证） |
| 验证探针 | `curl -A "python-requests/2.0" https://cleanpaths.io/api/feedback` 预期仍 405（路由存在，未被 BFM 拦）；Creem dashboard test webhook 200 |
| 优先级理由 | 当前爬虫/脚本零防护（配额污染真实发生面）；但支付链路误伤风险 > 收益，**skip 前置不可省**。Free 计划 custom rules 条数上限 [待确认]（印象 1 条）——若确认仅 1 条，与 P2-β AI 爬虫 block 路线互斥，须 boss 裁决名额分配 |

### P1-γ：HSTS（已有独立预研，不重复展开）

preflight 报告 §P1-3 已覆盖：两步走 `max-age=86400` 观察期 → 稳定后 `15552000`；includeSubDomains 单独评估；preload 默认不开（半不可逆）。需 boss 显式 GO，属另单。本单仅确认基线未变（settings 读 200，全关）。

### P2-α：Rate Limiting on `/api/*`

| 五件套 | 内容 |
|---|---|
| 所需 CF 权限 | Zone Rate Limit Edit（**token 现缺**——legacy 403 实证；boss UI 待补） |
| 预期影响面 | 真实用户单次点转零影响；脚本批量滥用被限。阈值量级（如 /api/checkout POST 10 req/10min/IP）由实施单定 |
| 回滚方式 | 删规则（API 或 dash） |
| 验证探针 | 循环 curl 超阈后预期 429；正常单发预期 200/405 不变 |
| 优先级理由 | 攻击面 #1/#2 的精准解，但 Free 计划限速额度 [待确认]（印象 1 条规则），且权限缺口需 boss 补——排 P2 因 P1-β 已部分覆盖滥用面 |

### P2-β：AI 爬虫政策（两条路线只评不实施）

| 路线 | 机制 | 优点 | 缺点 |
|---|---|---|---|
| A：托管 robots.txt + AI Crawl Control | `is_robots_txt_managed` 开启后 dash 逐 bot 设 Allow/Block（`bot_management` 读 200 但 ai_crawlers API 404 → **API 路线不可行，仅 dash 路线**） | 声明式、可细分、零维护成本 | robots.txt 是君子协定，无强制力；需 boss dash 操作 |
| B：WAF custom rule block AI bots | http.user_agent / verified_bot 表达式 block | 强制拦截边缘生效 | **吃掉 Free 唯一 custom rule 名额，与 P1-β skip 规则互斥**；UA 可伪造绕过 |

**本站立场建议**：维持 AI 爬虫放行不动。理由：cleanpaths.io 是内容站，GEO/SEO 吃 AI 爬虫引用流量（GPTBot/ClaudeBot 放行是获客面）；配额污染的精准解在服务端防刷（归代码审计线），边缘强拦是杀敌一百自损八十。

### P2-γ：维持项（无需动）

security_level=medium、challenge_ttl=1800、browser_check=on、0rtt=off——均为合理默认，不建议变更。

## 权限缺口台账（boss UI 待补，不现场补救）

| 缺口 | 实证 | 影响的任务 |
|---|---|---|
| Zone Analytics Read（GraphQL） | 账号级查询 envelope errors "does not have access" | 7 天安全事件数据佐证层 |
| Rate Limiting Edit/Read（legacy 端点亦 403） | `GET /zones/{zid}/rate_limits` → 403 | P2-α 实施单前置 |
| managed ruleset 内容读（sanitize/ddos_l7/dynamic_redirect） | entrypoint 403 | 仅影响深度审计，列表层事实已确认，不阻塞 |

## 硬约束遵守声明

1. 零写操作：全程 GET + 1 发账号级 GraphQL 查询，零 PUT/PATCH/POST-CF 资源
2. 未触碰 `src/**` `functions/**`，未跑 deploy.sh，未改任何 CF 资源
3. 退役端点零引用：`waf/overrides`（410）、`firewall/rules`（403）均未探测，全部走 rulesets 现代端点
4. GraphQL 仅账号级通道，zone tag 入查询体
5. 403/404/400 全部如实记录于本报告与证据 JSON，零绕过零猜测
6. 未在生产域名发送任何激活性 payload

## 证据清单

- `docs/evidence/cf-p1-2/t1-edge-security-probe.json`（rulesets 全列 + 9 phase entrypoint verbatim + bot_management verbatim + rate_limits 403 verbatim + zone settings 安全项）
- `docs/evidence/cf-p1-2/t1-managed-ruleset-and-graphql.json`（Managed Free Ruleset 44 条规则 verbatim + GraphQL 响应 verbatim）
