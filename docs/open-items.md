# cleanpaths.io — Open Items 账本

> 建账 2026-11-25（P0-5c 核销后，总控独立复核 9/9 GREEN）。
> 规则：每批核销时由总控登记；任何「未落站 / 待拍板 / 移交下批」事项必须入账防烂尾。状态：OPEN / DONE。

## OPEN

### OI-1 §A-5 ×2 GUIDE 串 + §D-2 #1/#2 督办修正落站
- 来源：P0-5c 申报偏差 #3（2026-11-25）
- 现状：生产零回潮已实证（NEG ×14 全站复扫零命中），无线上风险；属附录文档一致性收尾
- 处置：并入下批工单「附带修正栏」强制携带；落站需走 unlock→写→seal→lock + deploy-gate
- 兜底：2026-12-09 前无新批次开工 → 升级为 30min micro-batch

### OI-2 JFIF mock 制作工件存档
- 来源：P0-5c 申报偏差 #1（2026-11-25）
- 现状：6 mock HTML + 4 构建脚本移存 `/home/ubuntu/jfif-ctr-mocks-preserved/`（已 amend 剔除，未上生产）
- 处置：不回归仓库。产物 11 PNG 已上生产，真源在 design-handoff zip + 镜像；DESIGN.md 被 truth-manifest 锚定（v1.21 changelog 已含），注记以本条为账，不再动真源防 seal drift
- 可选：项目复盘时 tar 归档

## DONE

### OD-1 P0-5c 核销后账面卫生（2026-11-25，seal 零扰动）
- truth-receipts.log：副本入库 `docs/evidence/p0-5c-2026-11-25/`（sha16 `121bd486d9910f46`，源=副本一致）；原件 0444 锁于 build/ seal 现场，gitignore
- truth-manifest.sha256.new：与入库正本 diff exit=0（零漂移），锁内不可删 → gitignore，下次 unlock 窗口删除
- design-handoff-v1.zip → `/home/ubuntu/design-handoffs/cleanpaths/`，sha16 `a1c3ac54216a4a9d` 与 E 申报 `a1c3ac54…d1e5` 前缀一致；.gitignore 防再卷入
- p0-3a 遗留：`qa-evidence-p0-3a/`（7 件 404 侦察证据）→ `docs/evidence/p0-3a/`；`qa-p0-3a-404-recon.cjs` 留 scripts/ 入库
- seal 复验：TRUTH MANIFEST PASS（51 files anchored，exit=0）
