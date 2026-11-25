# cleanpaths.io — Open Items 账本

> 建账 2026-11-25（P0-5c 核销后，总控独立复核 9/9 GREEN）。
> 规则：每批核销时由总控登记；任何「未落站 / 待拍板 / 移交下批」事项必须入账防烂尾。状态：OPEN / DONE。

## OPEN

（当前无 OPEN 项——账面清零，2026-11-25 起进入纯数据观察期至 2026-12-02 GSC 复盘。）

## DONE

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
