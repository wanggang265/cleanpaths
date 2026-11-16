# WRITE-PROTOCOL — design-handoff-v1 真源写操作协议（#96）

> 生效：2026-11-05（#96 truth guard 落地）。真源目录常态 = **locked（a-w）**。
> 工具：`build/truth_write_guard.sh`（unlock / lock / precheck / seal）

## 唯一合法写流程

```
build/truth_write_guard.sh unlock      # 1. 解除写保护
build/truth_write_guard.sh precheck    # 2. 基线确认：真源 == 仓库锚定 manifest
                                       #    不符 = 停手，报总控，禁止继续
# 3. 执行获授权的写操作（设计批交付 / 同步工单落文件）
build/truth_write_guard.sh seal        # 4. 封口：拒带病 → 重打包 ZIP → 出新 manifest 草稿 → 回执入账
build/truth_write_guard.sh lock        # 5. 恢复写保护
```

## 回执协议（机制化既有 sha256 回执惯例）

- 设计批交付回执**必须附 seal 输出的 hash 段**（changed_files + zip_sha256），与既有「ZIP + sha256 回执」惯例一致，只是从人工变成脚本产出。
- seal 产出两个文件：
  - `build/truth-manifest.sha256.new` —— 新 manifest 草稿
  - `build/truth-receipts.log` —— 回执流水（ISO 时间 / actor / note / 变更文件数 / ZIP sha256）
- **真源合法前移后**，下游同步工单必须把 `truth-manifest.sha256.new` 拷入仓库
  `design-source/build/truth-manifest.sha256`，且与 design-source 同步**同 commit**。
  否则 deploy-gate step 1 的 anti-rollback 校验红——**这是特性不是故障**：
  闸红 = 提醒「真源动了、锚点没跟」，绝不是闸坏了。

## 边界与明示

- chmod 是**工作流减速带，不是权限墙**（同用户 `chmod u+w` 可逆）。
  它防的是「无意识的旧基线覆写」（11-04 #94 事故类），不防恶意操作。
- chmod 只许经 guard 脚本执行；严禁直接对真源 `chmod/chown`。
- 闸机侧（仓库 `scripts/deploy-gate.sh` step 1）每跑一次 build 都会执行
  `truth_manifest.py check`：真源被回退或未授权改写 → 闸红并逐行列出。
- seal 第一步永远先 check：有 drift 拒绝封口（防「带病封口」把漂移洗成合法）。
