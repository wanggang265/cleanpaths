# cleanpaths.io — Open Items 账本

> 建账 2026-11-25（P0-5c 核销后，总控独立复核 9/9 GREEN）。
> 规则：每批核销时由总控登记；任何「未落站 / 待拍板 / 移交下批」事项必须入账防烂尾。状态：OPEN / DONE。

## OPEN

### OI-3 P0-4a GA4 前端事件实现（2026-11-26 派工，chuangkou）
- 工单：`/home/ubuntu/demand-signals/2026-09-22-format-friction/PROMPT_chuangkou_p0-4a_ga4_fe.md`；规格事实源=analytics-spec §8 @ 4069ee9（督办终审 PASS，见 OD-5）
- 文件域 `src/**`；含 T0 规格修订（督办授权 §8.2 row8 覆盖域表述）；跨单契约：POST /api/checkout body 可选 `client_id`（与 OI-4 写死一致）
- 交付含 §8.6 DebugView/Network 证据 → docs/evidence/p0-4-ga4-debugview/（前缀 p0-4a-）+ scripts/qa-p0-4a.cjs

### OI-4 P0-4b GA4 服务端 purchase MP（2026-11-26 派工，jishi）
- 工单：`/home/ubuntu/demand-signals/2026-09-22-format-friction/PROMPT_jishi_p0-4b_ga4_mp.md`；规格=§8.4
- 文件域 `functions/**`（与 OI-3 零重叠可并行）；硬前置=OI-5 secret + [待确认]①②实证（②已收窄：creem.ts L148 现行分支 checkout.completed）
- 交付含 §8.4 四步 debug 证据（前缀 p0-4b-）

- **进展（2026-11-26 晚，jishi 预研，督办已核销）**：[待确认]① Creem metadata 透传=官方 OpenAPI 实证（CreateCheckoutRequest.metadata object+additionalProperties，与现行 checkout.ts L141 同通道，回读 object.metadata 原样）；[待确认]② 事件类型文档侧已闭（checkout.completed=支付完成返回订单信息，目录无发起类事件，样本 order.status:paid；真实日志实证留 T6）。**载荷形状发现**：官方样本 object.order 是对象（id/amount/amount_paid/currency），现行 creem.ts L153/L155 按 string 读=历史误猜 → Telegram 通知 Amount/Order 长期 n/a 根因坐实，T2 双形状防御。阻塞不变=OI-5。证据：docs/evidence/p0-4-ga4-debugview/p0-4b-preflight-docs-evidence.md
### OI-5 GA4_API_SECRET 创建（boss UI 任务，OI-4 硬前置；2026-11-26 实测缺失）
- secret list 实测 10 键无 GA4_API_SECRET（2026-11-26，wrangler 4.168.0）
- 路径：GA4 后台 admin → 数据流 → G-9T8XY5EB0Y → Measurement Protocol API secrets → 创建 → 终端 `CLOUDFLARE_API_TOKEN=$(cat /home/ubuntu/.cloudflare/api-token.pages) npx wrangler pages secret put GA4_API_SECRET --project-name=cleanpaths`（值走终端 stdin，严禁进聊天）

（上述 OI-3/4/5 之外的 OPEN 项：无——账面其余清零，2026-11-25 起数据观察期并行不冲突。）

## DONE

### OD-6 P1 动工前 CF 权限侦察核销（2026-11-26，纯只读零变更）
- 交付：`docs/cf-p1-preflight-2026-11-26.md`（jishi，工单 PROMPT_jishi_cf_p1_preflight.md；skill cloudflare-token-permissions-ui-2026 督办同步后执行）
- 督办复核 PASS：报告在盘 + 泄漏扫描零命中 + 关键探针独立复跑全对上（verify ID 9775632c=skill 台账 / rulesets list 200×5 phases / security_header HSTS 全关逐字段一致 / GraphQL 账号级 /graphql 200 真数据：11-25 requests 3639, uniques 433, cached 0）
- **销账**：跨会话遗留「补 Zone Analytics Read」就此销账——11-24 已补加生效（token-switching §3 台账在先），11-26 双重实证；demand-signals 账本闸门句已加日期注记防再引用
- Go/No-Go：P1-2 WAF **GO**（现代 WAF 读侧零缺口，当前 0 条自定义规则）；P1-1 缓存 / P1-3 HSTS **条件 GO**（Read✓，三个 Edit 待用户 UI 核对；P1-1 另受「P0 全验收」闸门；P1-3 动工需用户显式 GO——半不可逆）
- 用户代办：token 编辑页核对 Cache Rules Edit / Zone WAF Edit / Zone Settings Edit（DNS & Zones 组下半段）→ Summary 页完整截图回传闭环；补 legacy Firewall Services Read 仅可选
- 工单纪律记档：`waf/overrides` 端点 410 已退役，后续工单禁引用；jishi 首轮「skill 全机不存在」误报已归档（搜索口径漏类别子目录，dispatch skill 已 patch 防复发）

### OD-5 P0-4s GA4 规格冻结核销（2026-11-26，纯文档零部署）
- 交付：4069ee9 docs/analytics-spec.md §8（L75-199，+126/−0 纯追加单文件，未 push 未部署）
- 督办终审实证 PASS（12 项）：commit hash+msg / numstat / diff 零删除行 / 未 push（origin..HEAD 仅此 1 commit）/ §8.0–8.7 结构落位 / 8.2 恰 9 数据行 / 代码锚点全套（ToolController L98-101 守卫、L276、L317 beacon tool_start、L360+L366 stale 守卫与成功点、L735；layout L39-48 G-9T8XY5EB0Y；SiteHeader L83 lang==='pt' 分支+L91/L98；SiteFooter L48；CheckoutLinks L110/L114 assign；beacon.ts 5 事件枚举；creem.ts L103 maskEmail）/ QA 脚本 3 件在盘 / spec G-ID 4 处一致 / 偏差①属实（现行账本无 file_selected/convert_completed，旧两小节确随 11-25 重建归档）
- 审计发现 2 条（不回炉，闭环进下批工单）：F1=upload_start/convert_success 现网裸发无 file_type（L276/L366 实证，工单背景「带 file_type 参数」只对 download 成立）→ P0-4a T2/T4 补齐；F2=§8.2 row8「现状仅 PT→EN 单向」不成立（EN 页 content 反向链实证 jfif-to-jpg.ts L115）→ P0-4a T0 督办授权修订覆盖域表述
- 工单 skill 先验记录：工单原件（demand-signals/…/PROMPT_chuangkou_p0-4s_ga4_spec_freeze.md）7 任务+硬约束逐条对照全覆盖；观察项（不阻塞）：报告未显式回执 frontend-site-automation 加载证据，鉴于纯文档单该 skill 无可执行要求且交付物实证零缺陷，按「轻 bug 不修成重流程」口径放行

### OD-3 OI-1 收尾：§A-5 ×2 GUIDE 串 + §D-2 #1/#2 一致性注记落档（2026-11-25，纯文档零部署）
- 修正：v1.20 addendum §A-5 两 GUIDE 串（HOME_PNG_GUIDE/SAMPLES_PNG_GUIDE）与 §D-2 #1/#2 行注记**作废不落**（zhongshu 督办口径，DESIGN.md v1.21 同源）；冻结串字节零改动；EN-JPG/PNG_ENDPOINT 注记照常落位
- 写链：unlock→precheck PASS（51 anchored）→seal（authorized_drift=1/undeclared=0/changed_files=0，zip `fae40385`）→lock；回执 2026-11-25T23:34:23+08:00 actor=chilun
- 附带：OD-1 预记窗口事项完成（`.new` 冗余草稿 diff==0 后删除）
- Gate 终扫 PASS：truth manifest 51 / 48 routes / frozen copy / audit.py NEGATIVE 断言 / 6b 全目录占位零命中
- 提交：0e67d24（addendum + 证据）；证据：docs/evidence/2026-11-25-oi1-guide-consistency/fix-report.md
- 零部署：不触碰 src/、路由、audit.py；生产维持 P0-5c 后状态（NEG ×14 零命中）

### OD-4 OI-2 JFIF mock 制作工件存档结账（2026-11-25，以本条为账，非阻塞）
- 来源：P0-5c 申报偏差 #1（2026-11-25）
- 现状：6 mock HTML + 4 构建脚本移存 `/home/ubuntu/jfif-ctr-mocks-preserved/`（已 amend 剔除，未上生产）
- 处置：不回归仓库。产物 11 PNG 已上生产，真源在 design-handoff zip + 镜像；DESIGN.md 被 truth-manifest 锚定（v1.21 changelog 已含），注记以本条为账，不再动真源防 seal drift
- 可选：项目复盘时 tar 归档（随本条永久在账，不阻塞任何批次）

### OD-2 P0-BOFU 占位修复批（2026-11-25，42→0 生产实证）
- 事故：4 BOFU 竞品替代页 42 处 `[待确认]` 上生产；gate step6 只扫 legal 4 页 + audit.py 误把占位当 positive pin，双重防线漏网
- 修复：真源 4 页占位清零（3 轮 seal 合法链，manifest 51 PASS，镜像双副本同步）；vectorizer 3 格填官网核实值、convertio DXF 实锤补句、无来源数字零填入；gate 6b 全目录扫描新增；audit.py 误 pin 删除 + NEGATIVE 防回潮断言（缩进修正）；gitignore 补 zip/snapshot 漏项
- 部署：ecb434e + 1b46179 + c4033fe（账本本条随后提交）；部署 ID 35db58bb→fedac00f（须用 api-token.pages env——deploy.sh 默认 token 无 Pages 权限，code 10000）
- 终扫 PASS：4 页占位 0 / convertio note 在场 / vectorizer 事实 3/3 / sitemap 48 / jfif FAQ 4/4/7/9 保持 / 全部 dxf-jfif 路由 200
- 证据：docs/evidence/2026-11-25-bofu-placeholder-fix/（fix-report.md + prod-qa.log + truth-receipts.log）

### OD-1 P0-5c 核销后账面卫生（2026-11-25，seal 零扰动）
- truth-receipts.log：副本入库 `docs/evidence/p0-5c-2026-11-25/`（sha16 `121bd486d9910f46`，源=副本一致）；原件 0444 锁于 build/ seal 现场，gitignore
- truth-manifest.sha256.new：与入库正本 diff exit=0（零漂移），锁内不可删 → gitignore，下次 unlock 窗口删除
- design-handoff-v1.zip → `/home/ubuntu/design-handoffs/cleanpaths/`，sha16 `a1c3ac54216a4a9d` 与 E 申报 `a1c3ac54…d1e5` 前缀一致；.gitignore 防再卷入
- p0-3a 遗留：`qa-evidence-p0-3a/`（7 件 404 侦察证据）→ `docs/evidence/p0-3a/`；`qa-p0-3a-404-recon.cjs` 留 scripts/ 入库
- seal 复验：TRUTH MANIFEST PASS（51 files anchored，exit=0）
