# truth_write_guard 快照修复 — 验收证据（PROMPT_chuangkou_guard_snapshot_fix）

日期：2026-11-11 ｜ actor：chuangkou ｜ 裁决来源：06b2-new-copy-return-table.md 非文案事项 #1/#4，zhongshu 裁决 2026-11-11

## 修复内容（按裁决方向：precheck 落快照、seal 比快照）

真源侧 `design-handoff-v1/build/truth_write_guard.sh`（101 行 → 294 行；该脚本自 #96/9415a97 起**只存在于真源侧**，仓库内并无副本——本次随本证据文件把修复版同步进仓库 `design-source/build/truth_write_guard.sh` 作版本留存，**权威副本仍在真源侧**，已随 zip `d35bbffe…58f732` 封版）：

1. `precheck` 通过时落**全树 pre-write 快照**（`$FACTS/.truth-pre-write.snapshot`，sha256sum 同构格式，含时间戳），并声明授权写范围（位置参数和/或 `$TRUTH_ALLOW`，相对路径或 glob；拒绝绝对路径/`..`）。
2. `seal` step 1 改为比对 **当前真源 vs pre-write 快照**；授权范围内 drift 逐条标 `AUTHORIZED-DRIFT` 并放行；范围外 drift 逐条点名 REFUSE。
3. fail-closed 三条铁律全部落地：无快照 → REFUSE；快照 >24h → REFUSE；范围外 drift → REFUSE（MISMATCH/UNTRACKED 逐行列出）。
4. 原仓库锚点比对保留为 WARNING 级（信息用，不阻断）——封版草稿未同步仓库的窗口期不再误伤。
5. 附加（实现时发现必须）：零 drift 幂等 re-seal——drift=0 且 zip 与封版 manifest 草稿均 current 时跳过重打包，zip sha256 跨 re-seal 稳定（否则验收测试 4「回归 zip sha 必须不变」在逻辑上不可达成）。
6. precheck 有效基线：`build/truth-manifest.sha256.new` 存在时以它为基线（最近封版态），否则回退仓库锚点——保持对 #94 类回滚 fail-closed，同时允许批次间的 sealed-but-unsynced 窗口。
7. 快照放在真源目录**之外**（`$FACTS/`）：避免被打进 zip、避免 bump build/ mtime，保证 zip sha 可复现。
8. 路径全部 env 可覆盖（`TRUTH_GUARD_ROOT/FACTS/REPO_MANIFEST/MANIFEST_PY/SNAPSHOT`），供沙盒验收测试不碰真源。

回执语义说明：`changed_files` = 仓库锚定 manifest 与本次新封版 manifest 的差异文件数（非本次授权 drift 数；仓库锚点待 07 batch2 同步前会持续显示全量差异，属预期）。

## 验收测试（裁决要求 4 项，全部自证；另加 1b/2b/3b 三项加强）

沙盒全程在 /tmp/guard-acc（env 覆盖指向），不碰真源。以下为原文输出：

```
##################################################################
## TEST 1: authorized batch  precheck -> write 2 -> seal => PASS
##################################################################
precheck: verifying truth vs sealed-draft (build/truth-manifest.sha256.new)
TRUTH MANIFEST PASS (5 files anchored)
info: truth also matches repo anchor
PRECHECK PASS — truth matches sealed-draft (build/truth-manifest.sha256.new)
  pre-write snapshot: /tmp/guard-acc/facts/.truth-pre-write.snapshot (authorized scope: 2 pattern(s); valid 86400s)
seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)
  AUTHORIZED-DRIFT MISMATCH  pages/pg-a/code.html  (modified vs pre-write snapshot)
  AUTHORIZED-DRIFT MISMATCH  pages/pg-b/code.html  (modified vs pre-write snapshot)
  snapshot OK (age 0s, authorized drift 2 file(s), undeclared drift 0)
  WARNING (non-blocking): truth drifted vs repo anchor — reminder: sync build/truth-manifest.sha256.new into the repo with the next design-source sync commit.
seal: step 2/4 — repack /tmp/guard-acc/facts/design-handoff-v1.zip
  testzip OK
seal: step 3/4 — emit new manifest draft -> /tmp/guard-acc/facts/design-handoff-v1/build/truth-manifest.sha256.new
seal: step 4/4 — receipt
SEALED: changed_files=2 zip_sha256=74ef575882d9fb40527761f7ae71f0ae83fbb2f24b7bce54fafdd1ea6b26c32b
seal exit=0 (expect 0)

##################################################################
## TEST 1b: idempotent re-seal (zero drift) => PASS, zip sha stable
##################################################################
seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)
  snapshot OK (age 0s, authorized drift 0 file(s), undeclared drift 0)
seal: step 2/4 — zero drift vs snapshot; existing zip already represents the truth, SKIP repack (idempotent re-seal)
  testzip OK (existing zip)
SEALED: changed_files=2 zip_sha256=74ef575882d9fb40527761f7ae71f0ae83fbb2f24b7bce54fafdd1ea6b26c32b
seal exit=0 (expect 0)
zip sha before=74ef575882d9fb40527761f7ae71f0ae83fbb2f24b7bce54fafdd1ea6b26c32b
zip sha after =74ef575882d9fb40527761f7ae71f0ae83fbb2f24b7bce54fafdd1ea6b26c32b
SHA STABLE (expect identical)

##################################################################
## TEST 2: out-of-scope injection => REFUSE, names the file
##################################################################
seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)
SEAL REFUSED — drift outside the authorized scope declared at precheck:
  MISMATCH  pages/pg-b/code.html  (modified vs pre-write snapshot)
  Restore these files, or rerun precheck with a corrected authorized scope (report zhongshu first).
seal exit=1 (expect 1)

##################################################################
## TEST 2b: undeclared NEW file => REFUSE, names the file
##################################################################
seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)
SEAL REFUSED — drift outside the authorized scope declared at precheck:
  UNTRACKED pages/pg-c/code.html  (new vs pre-write snapshot)
  Restore these files, or rerun precheck with a corrected authorized scope (report zhongshu first).
seal exit=1 (expect 1)

##################################################################
## TEST 3: seal without snapshot => REFUSE
##################################################################
seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)
SEAL REFUSED — no pre-write snapshot at /tmp/guard-acc/facts/.truth-pre-write.snapshot.
  Sealing without a precheck is forbidden. Run: truth_write_guard.sh precheck [authorized files...]
seal exit=1 (expect 1)

##################################################################
## TEST 3b: stale snapshot (>24h) => REFUSE
##################################################################
seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)
SEAL REFUSED — pre-write snapshot is stale (age 794365497s > 86400s). Rerun precheck.
seal exit=1 (expect 1)
```

## TEST 4（真源回归，裁决原文：重跑 precheck+seal → PASS 且 zip sha 与 3a7cbefe…c49fe7142c9f 一致，不得改真源内容）

对 v1.8 已封版真源执行 precheck → seal（零写入），幂等 re-seal 跳过重打包，zip sha 逐字节不变：

```
precheck: verifying truth vs sealed-draft (build/truth-manifest.sha256.new)
TRUTH MANIFEST PASS (47 files anchored)
WARNING (non-blocking): truth drifted vs repo anchor — expected while a sealed draft awaits repo sync (07 batch2 ticket).
PRECHECK PASS — truth matches sealed-draft (build/truth-manifest.sha256.new)
seal: step 1/4 — drift check vs pre-write snapshot (refuse to seal undeclared drift)
  snapshot OK (age 0s, authorized drift 0 file(s), undeclared drift 0)
seal: step 2/4 — zero drift vs snapshot; existing zip already represents the truth, SKIP repack (idempotent re-seal)
  testzip OK (existing zip)
SEALED: changed_files=49 zip_sha256=3a7cbefe6c40c3ba5882f8d30a1da644973ba9e8ffb1f9b048adc49fe7142c9f
seal exit=0
$ sha256sum design-handoff-v1.zip
3a7cbefe6c40c3ba5882f8d30a1da644973ba9e8ffb1f9b048adc49fe7142c9f  design-handoff-v1.zip
```

zip sha `3a7cbefe…c49fe7142c9f` 与 v1.8 回执**完全一致**，真源内容零改动。

## 真源侧后续两次授权 seal（本工单直接产物）

1. **guard 自更新**（授权范围 `build/truth_write_guard.sh` 单文件）：
   `SEALED: changed_files=49 zip_sha256=240c45c0f7a5ae2158937af2c249462902d13ecf9e5aeb1bfa956825ec477d62`（drift 清单确认仅该 1 文件）
2. **render_screens SLUGS 补员 + 重渲染**（授权范围 `build/render_screens.py` + `pages/*/screen{,-mobile}.png` + `pages/*/states.png`）：
   `SEALED: changed_files=49 zip_sha256=d35bbffbe54f2b203e996f7adc3bcf09d3962dae1695bb2180bad2654e58f732`（drift 清单确认 15 文件 = 1 脚本 + 14 states.png；其余 34 张截图与上一版逐字节一致未列入）
   - SLUGS 新增 16：webp-to-png / webp-to-jpg / svg-to-png / jpeg-to-jpg / svg-to-jpg / gif-to-jpg / bmp-to-jpg / jpeg-to-dxf + pt-webp-para-png / pt-webp-para-jpg / pt-svg-para-png / pt-jpeg-para-jpg / pt-svg-para-jpg / pt-gif-para-jpg / pt-bmp-para-jpg / pt-jpeg-para-dxf
   - 16 页 × 3 = **48 张截图全部在位**；宽度校验 desktop/states=1440、mobile=390，**口径不变**
   - 未触碰任何 `pages/*/code.html` 页面内容；真源已重新 lock（a-w）

三条回执（含 TEST 4 回归）均已由 guard 自动追加至真源 `build/truth-receipts.log`，actor=chuangkou，note 注明本工单。

## 边界自查

- pages/ 页面内容：零改动 ✓
- `truth-manifest.sha256.new`：仅由 seal 自动重生成，未手工拷入仓库（留待 07 batch2 派工同步）✓
- work/ 旧副本：未触碰 ✓
- 闸口是否转绿：由 zhongshu 核销裁决，本文件不自宣布 ✓
