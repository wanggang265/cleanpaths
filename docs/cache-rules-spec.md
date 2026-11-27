# P1-1 缓存规则规格草案（冻结候选）— cleanpaths.io（纯文档，零变更零部署）

**工单**：`demand-signals/2026-09-22-format-friction/PROMPT_jishi_p1-1_cache_spec_freeze.md`（zhongshu 派，2026-11-27）
**执行**：jishi，2026-11-27
**通道声明**：本文档是**规格草案**，非批准实施项。所有规则零创建、零修改——实现属未来另单（督办终审 GO 后派）。T1 全部只读探针，证据在 `docs/evidence/cf-p1-1/`。
**必引 skill**：`cloudflare-token-switching-protocol`（token/端点口径）✓ 已按此执行；`frontend-site-automation`（CF Pages 部署/缓存交付域）✓ 已加载对齐。
**前置校验**：token active（ID 前缀 `9775632c`）✓；zid 前缀 `cc6a8a96` ✓；cache_settings 空 entrypoint（`b73d642b…`，rules=[]）实测确认 ✓；退役端点零引用 ✓。

---

## 0. 上游草稿（11-24 计划原文附录 A）三态裁定

| 草稿条目 | 状态 | 裁定 |
|---|---|---|
| 先修 504 再开缓存 | **已满足** | P0-1 已核销（OD 记录）；12-01 效果复核在齿轮侧走，本规格不干扰（见 §8） |
| 当前 API 无 Rulesets 读权限 | **需修正** | 已过时：读 11-24 已有，Edit 11-27 三探针全实证（OD-6） |
| `/checkout*`、`/success*` bypass | **需修正** | T1-③ 实证 `out/` 无 checkout/success 路由（glob 空集），现役 checkout 走 `/api/checkout`（Functions 层）→ bypass 表达式收敛为 `/api/*` + `/admin/*`（R3），不抄不存在的路由 |
| 「下载接口」bypass | **需修正（空集显式注销）** | T1-③ 实证 `out/**/*download*` 空集；站内转换全在浏览器本地，无下载接口。规格不设下载 bypass 条目，此行即注销记录 |
| 验收：静态 hit>80%、HTML hit>50% | **照抄 + 口径补全** | 验收线采纳；HTML hit 基线度量口径在 §4 设计题④ 定死（GraphQL zone 级口径不可按路径切分，改为探针口径为主 + zone 级代理指标） |
| css/js/png/webp/svg/fonts 长缓存；HTML 5–15min；sitemap/robots 短缓存 | **采纳并细化** | → R1/R2/R4 |

## 1. T1 缓存现状盘点（2026-11-27 实测）

### 1.1 响应头实测（curl -sI，verbatim 证据 `t1-header-probe.json`）

| 路径 | 状态 | cf-cache-status | cache-control | set-cookie | age |
|---|---|---|---|---|---|
| `/` | 200 | **DYNAMIC** | public, max-age=0, must-revalidate | 无 | 无 |
| `/pricing/` | 200 | **DYNAMIC** | public, max-age=0, must-revalidate | 无 | 无 |
| `/pt/jfif-para-jpg/` | 200 | **DYNAMIC** | public, max-age=0, must-revalidate | 无 | 无 |
| `/_next/static/chunks/webpack-0f3dc8da88f1c143.js` | 200 | **REVALIDATED** | public, max-age=14400, must-revalidate | 无 | 无 |
| `/api/feedback` | 405 | DYNAMIC | （无 cache-control） | 无 | 无 |
| `/sitemap.xml` | 200 | **DYNAMIC** | public, max-age=0, must-revalidate | 无 | 无 |
| `/robots.txt` | 200 | REVALIDATED | public, max-age=14400, must-revalidate | 无 | 无 |
| `/llms.txt` | 200 | DYNAMIC | public, max-age=0, must-revalidate | 无 | 无 |

关键读数：
1. **HTML 全线 DYNAMIC**（Pages 默认 `max-age=0 must-revalidate` → zone 缓存资格关闭）——草稿「HTML Edge TTL」有实施空间
2. **`_next/static` 已部分进边缘缓存**（REVALIDATED = ETag 重验证命中；Pages 静态资产默认 4h browser TTL）
3. **全部 8 个端点 set-cookie 为空** → 无 per-user 内容面（§6 隐私一致性的实证基础）
4. `/api/feedback` 405 正常（Functions 层，DYNAMIC 语义正确）

### 1.2 GraphQL 近 3 天 cacheStatus 分布（账号级 `POST /graphql`，zoneTag 入查询体，dataset `httpRequestsAdaptiveGroups`，count 口径；证据 `t1-graphql-cached-requests.json`）

总采样 20,422（11-24 ~ 11-27）：

| cacheStatus | count | 占比 |
|---|---|---|
| dynamic | 11,377 | 55% |
| **revalidated** | 5,308 | 26% |
| none | 1,890 | 9% |
| miss | 1,252 | 6% |
| **hit** | 400 | 2% |
| bypass | 186 | <1% |
| expired | 9 | <1% |

判定：**Pages 资产确实进 zone 缓存统计**——静态资产已产生 28%（revalidated+hit+expired）边缘缓存行为，HTML/API 构成 dynamic 55%。基线（对照 11-25「cachedRequests=0」口径）：现役缓存行为仅限 immutable 静态资产，HTML 零缓存。

> schema 探路记录（如实）：`httpRequestsCacheAdaptiveGroups` 不存在（unknown field）；`orderBy: sum_requests_DESC` 非法枚举；`sum.requests` 非法字段——终版查询 = `httpRequestsAdaptiveGroups { dimensions { cacheStatus } count }` 无 orderBy。

### 1.3 `out/` 产物对照（本地只读）

- `_routes.json` include = `['/api/*', '/admin/*']`，exclude = `[]` → 全部 HTML/静态资产走 Pages 资产层（P0-1 拆根级 middleware 口径一致）
- 50 个 HTML、119 个 `_next/static` 文件；checkout/success/download 路由 glob 全空集

## 2. 设计题④（必答）：CF zone Cache Rules 对 Pages 项目资产响应是否生效

**裁决：生效。** 论证链：
1. **通道事实**：`cleanpaths.io` 是 zone 自定义域挂 Pages（O2O），请求经 CF zone 代理 → zone Cache Rules 作用于全部经代理响应，Pages 资产响应同在管道内（frontend-site-automation CF 交付域 + Pages 官方文档口径：Pages 自定义域流量受 zone 级缓存配置影响）[实施单上线时以 Cache Rules 官方文档当日版复核一次，本文档标注待复核]
2. **现状实证**：`_next/static` 已出现 REVALIDATED/hit——zone 缓存引擎已在处理 Pages 资产响应，缺的只是 HTML 的缓存资格（origin `max-age=0` 默认关资格）→ Cache Rules 的 **Edge TTL「override origin」** 正是打开该资格的机制
3. **实测验证方案（写进实施单验收步骤）**：规则上线后 `curl -sI https://cleanpaths.io/pricing/` 两次——第一次预期 `cf-cache-status: MISS`（回源填充），第二次预期 `HIT`（5 分钟 TTL 窗口内）；HTML 从 DYNAMIC→HIT 即实证生效。上线前该方案不可预演（零变更约束），此为唯一实测点，留实施单执行

## 3. §规则清单（逐条冻结候选；表达式为草案，实施单可在语义不变下微调语法）

> 统一约束：动作面板 = 缓存资格 eligible + Edge TTL override + Browser TTL override；四条规则按 R3→R2→R1→R4 顺序上线（§7）；**优先级上 bypass（R3）必须排在最前命中**。

### R3（第一条上线）：`/api/*` 与 `/admin/*` 显式 bypass

| 项 | 内容 |
|---|---|
| 表达式 | `starts_with(http.request.uri.path, "/api/") or starts_with(http.request.uri.path, "/admin/")` |
| 动作 | Bypass cache |
| 理由 | 支付/回环/管理端点零缓存是硬边界；现状虽 DYNAMIC，显式 bypass 是**防御性固定**——防 R1/R2 表达式未来误覆盖（表达式顺序变动、路径新增时兜底） |
| 真实用户影响面 | 零（这些路径本就不缓存，行为不变） |
| 回滚方式 | Cache Rules 单条开关 disable（秒级生效） |
| 验证探针 | `curl -sI https://cleanpaths.io/api/feedback` → 405 + `cf-cache-status: BYPASS`（DYNAMIC→BYPASS 的语义切换即为生效实证） |

### R2：`/_next/static/*` immutable 长缓存

| 项 | 内容 |
|---|---|
| 表达式 | `starts_with(http.request.uri.path, "/_next/static/")` |
| 动作 | Cache eligibility: eligible；Edge TTL: override origin，**2,592,000s（30 天）**；Browser TTL: override origin，**31,536,000s（365 天）** |
| 理由 | Next.js 内容寻址资产（文件名含 hash，`webpack-0f3dc8da88f1c143.js` 实证），内容变更=文件名变更，永不失效；现状 `max-age=14400 must-revalidate` 让浏览器每 4h 回源验证一次，immutable 化后浏览器整年不再验证，revalidated 26% 流量转化为直接 hit |
| 真实用户影响面 | 正面（repeat view 零回源）；风险仅理论场景「部署产物文件名碰撞」——Next.js hash 机制下不存在 |
| 回滚方式 | disable 该规则（回到 Pages 默认 4h must-revalidate，自动收敛） |
| 验证探针 | `curl -sI https://cleanpaths.io/_next/static/chunks/webpack-0f3dc8da88f1c143.js` → `cache-control` 含 `max-age=31536000`（`immutable` 由 Browser TTL override 输出，实施单核）且二次请求 `cf-cache-status: HIT` |

### R1：HTML Edge TTL 300s（草稿「5–15 分钟」取保守下限起步）

| 项 | 内容 |
|---|---|
| 表达式 | `not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/admin/") and not starts_with(http.request.uri.path, "/_next/static/") and not contains(http.request.uri.path, ".")` |
| 动作 | Cache eligibility: eligible；Edge TTL: override origin，**300s**；Browser TTL: 尊重 origin（保持 `max-age=0 must-revalidate`，浏览器侧仍回源验证，新鲜度控制权留在边缘） |
| 理由 | HTML 占 dynamic 大头（§1.2），TTFB 从回源到边缘命中；300s=草稿 5–15min 的保守下限，观察期后可升 900s |
| 真实用户影响面 | ①部署后内容更新边缘可见延迟最多 5 分钟（对工具站文案/页面更新可接受；紧急热修用 §7 回滚路径秒级恢复直源）；②无 per-user 内容（§6 实证）→ 无串缓存风险；③pricing 变价场景受 5 分钟延迟——上线批次避开调价日 |
| 回滚方式 | disable 该规则（HTML 立即回 DYNAMIC 直源） |
| 验证探针 | `curl -sI https://cleanpaths.io/` 首次 `MISS` → 二次 `HIT` + `age ≤ 300`；`curl -sI https://cleanpaths.io/pricing/` 同口径；Googlebot freshness 抽查：`curl -sI -A "Googlebot" https://cleanpaths.io/` 同样 HIT（无 UA 歧视，缓存键不含 UA） |

### R4：`/sitemap.xml` `/robots.txt` `/llms.txt` 短缓存

| 项 | 内容 |
|---|---|
| 表达式 | `http.request.uri.path in {"/sitemap.xml" "/robots.txt" "/llms.txt"}` |
| 动作 | Cache eligibility: eligible；Edge TTL: override origin，**300s**；Browser TTL: 尊重 origin |
| 理由 | 爬虫高频抓取面（GSC 抓取统计里 sitemap 定期拉取），边缘命中降回源；5 分钟 TTL 保证 SEO 文件更新快速可见（robots.txt 现状 REVALIDATED 4h，缩短到 300s 反而提升更新时效） |
| 真实用户影响面 | 近零（爬虫侧 TTFB 改善，内容更新 5 分钟内一致） |
| 回滚方式 | disable 该规则 |
| 验证探针 | `curl -sI https://cleanpaths.io/sitemap.xml` 首次 MISS → 二次 HIT；`curl -sI https://cleanpaths.io/robots.txt` 同口径 |

## 4. 必答清单裁决（工单 T2 六题）

| # | 题 | 裁决 |
|---|---|---|
| ① | HTML 是否进边缘缓存 | **进，Edge TTL 300s**（R1）。TTFB vs Googlebot freshness：300s 内 freshness 损失上限 5 分钟，Googlebot 抓取频率下无实际索引影响；工具站 HTML 内容变更频率低（git 部署驱动），5 分钟延迟可接受。起步 300s，观察期数据稳定后可升 900s（实施单决策点） |
| ② | `/_next/static/*` immutable 长 TTL | **R2：Edge 30 天 + Browser 365 天**。内容寻址机制是安全性前提（§3 R2 理由） |
| ③ | `/api/*` `/admin/*` bypass 断言 | **R3 显式 bypass**，第一条上线。草稿 `/checkout*` `/success*` 无对应路由（实证空集），不设；「下载接口」空集注销（§0） |
| ④ | `/sitemap.xml` `/robots.txt` `/llms.txt` 策略 | **R4 统一 300s Edge**。三文件均存在（out/ 实证）；HTML hit 基线度量口径随本节定死：**验收口径 = 探针口径为主（HTML 页二次 curl cf-cache-status=HIT）+ zone 级 dynamic 占比 55%→下降为辅证**（GraphQL 无路径维度，zone 级口径无法按 HTML 切分——这是本次 schema 实探的硬结论） |
| ⑤ | 带 cookie 请求的行为 | **写死：同缓存键命中，无串内容风险**。实证链：8 端点 set-cookie 全空（§1.1）+ 站点无 per-user HTML（账本：语言偏好走路径不走服务端会话）+ CF 默认缓存键不含 cookie → 带任意 cookie 的 HTML 请求命中同一边缘副本，内容恒等 |
| ⑥ | PT/EN 语言在路径不在 cookie/域名 | **确认无冲突**。语言在路径（`/pt/jfif-para-jpg/` vs `/jfif-para-jpg/` 是不同 URL=不同缓存条目，实证两者均 200 独立响应）；无域名单独语言域（账本 P0-3b 口径）；缓存键含 URI path → 语言天然隔离 |

## 5. §隐私一致性

- 缓存对象 = 公共静态内容（HTML/JS/CSS/SEO 文件），全部响应 **set-cookie 空、无 per-user 变量**（§1.1 实测）→ 缓存层不引入 PII 存储面
- 无 per-user 内容前提写明：站点无服务端会话、无登录态渲染差异、语言在路径（§4-⑤⑥ 实证链）
- 边界：`/api/*` `/admin/*` 在 R3 bypass，动态响应（含任何未来 cookie 写入）永不进缓存——若未来站点引入 per-user HTML（登录/个性化），**本规格 R1 必须重审**，此为规格失效条件，写进实施单前置检查

## 6. 验收线（草稿照抄 + 口径定死）

| 验收项 | 目标 | 度量口径（可执行版） |
|---|---|---|
| 静态 hit>80% | 草稿线采纳 | zone 级 GraphQL `httpRequestsAdaptiveGroups` cacheStatus：`hit+revalidated+expired` 占比 ≥80%（基线 28%，§1.2；R2 上线 7 天后复测） |
| HTML hit>50% | 草稿线采纳 | **探针口径为主**：`/` `/pricing/` `/pt/jfif-para-jpg/` 各连续 3 次 `curl -sI`，HIT≥2/3 判过（首探 MISS 正常）；**辅证**：zone 级 dynamic 占比自 55% 显著下降 |
| pricing/checkout 不串缓存 | 草稿线采纳 | `/pricing/` 与 `/api/checkout`（POST）各自探针：pricing HIT 且内容 hash 稳定；`/api/*` 全程 BYPASS/DYNAMIC 恒不 HIT |

## 7. §上线顺序与回滚

```
批次1  R3 bypass（最安全，行为不变的防御性固定）→ 探针通过
批次2  R2 静态长缓存 → 探针通过 + 24h 观察（cacheStatus 分布 revalidated→hit 迁移）
批次3  R1 HTML 300s → 探针通过 + 48h 观察（504 口径复核，见 §8）
批次4  R4 SEO 三文件 → 探针通过
每批次间隔 ≥24h；任一批次异常 = disable 该条规则（秒级生效，无需删除重建）→ 下次上线重走该批次
一键全回滚 = 四条规则全部 disable（Cache Rules 面板逐条开关，无级联依赖）
```

实施单前置检查（未来单引用）：Token Cache Rules Edit 已实证（11-27 零效果写探针 OD-6）；上线窗口避开调价/大版本发布日（R1 5 分钟延迟面）。

## 8. §与 P0-1 的关系（12-01 齿轮侧 504 七天复核基线）

- 504 复核基线 = **status code 分布**，与 cf-cache-status 口径正交——缓存规则不改变回源错误语义（Edge 缓存命中时甚至减少回源 504 暴露面）
- **口径切换点登记**：R1/R4 上线后 HTML 类 cf-cache-status 从 DYNAMIC→HIT/MISS，齿轮侧复核报表若引用 cacheStatus 字段须按上线日期分段读数（上线日前=基线段，上线日后=缓存段），对照方法 = 本规格 §1.2 基线表
- R1 减少回源量对 504 复核是**改善方向偏差**（正偏差）：如齿轮侧复核发现 504 下降，须区分「P0-1 修复效果」与「缓存吸收回源」两因子——对照方法 = 同时读 origin error 级日志口径（如有）或在报表注明 R1 上线日

## 9. 禁止节遵守声明

- 本文档全部条目为**草案**，未写入任何 CF 资源，账本状态仅记「规格草案待终审」
- 未引用 11-24 诊断报告过时缓存数据（hit 3% 系 P0-1 前口径），全部以 §1 实测为准
- 全文无 token 值，ID 仅 8 位前缀对账
