# P0-2 文案变更附录 — CTA 统一 + jfif 隐私段压缩

日期: 2026-11-24 · 执行: chuangkou (窗口) · 裁决来源: **王刚 GO「2026-11-24 修改完善计划」**
(open-items.md §174-184, P0-2 派单, 督办 wangduoyu)。本附录即该裁决的真源落位记录。

## R1 — CTA 统一（工单项 4）

全站 dropzone 主按钮 + header CTA：

| 语种 | 旧串（冻结 v1.18 及更早） | 新串 |
|---|---|---|
| EN | `Convert now — free` | `Try it free` |
| PT | `Converter agora — grátis` | `Testar grátis` |
| PT（2 页旧变体） | `Converter grátis` (pt-jfif-para-png, pt-webp-para-svg) | `Testar grátis` |

- 触达: components.py (header CTA + dropzone 默认 btn)、pages_home.py、pages_light.py、
  pages_new.py、laser_batch_build.py (NAV_CTA)、batch2_copy.json (8 EN DZ_BTN + 8 PT DZ)、
  batch3_copy.json (3 PT_HERO_DZ_BTN)、audit.py 哨兵 (home pin / PT pin ×3 / laser 负哨兵)、
  src/components/SiteHeader.tsx、ToolController.tsx 水合改写 matcher。
- **未动**（相邻冻结变体，属二批扩展裁决范围）: 正文/带区 CTA
  `Convert free now`（home/pricing band）、`Convert screenshot free now`、
  `Convert JFIF to PNG free now`、`Convert WebP to SVG free now`、
  `Converter JFIF grátis agora`、PT 带区 `Converter <页关键词> grátis` 类。

## R2 — jfif-to-jpg 第三处隐私段压缩（工单项 3）

该页隐私信任陈述原有 5 处（hero sub、dropzone 徽章×2、正文隐私段 #1、#2、#3）。
压缩目标 = 正文**第三处**隐私段（h2 "Convert JFIF to JPG free, without uploading" 下段落），
去重后仅保留该段非重复信息（与上传型转换器的速度对比）。按原文残序落位，无新写句子:

- 旧: `Many online converters ask you to upload files first. CleanPaths is different: the
  conversion happens on your device. That means faster results for normal images and better
  privacy for personal or client work.`
- 新: `Many online converters ask you to upload files first. CleanPaths is different:
  faster results for normal images.`

（删除: "the conversion happens on your device."——与 hero sub "no upload step" 及徽章
"PROCESSED LOCALLY" 重复; 删除: "and better privacy for personal or client work"——与
正文隐私段 #1 "not uploading private images to a server" 重复。）

## Seal 与落位方式（重要勘误）

- **弃用全量再生成**：实跑 4 生成器发现 builder 输出 ≠ 提交真源（home `<title>`、persona
  卡等构建后人工冻结修正会被抹平，batch3 断言失败、laser md 路径失效）。已
  `git checkout` 恢复真源后改用**外科手术式字符串替换**（47 文件 / 53 EN + 14 PT + 2 PT 变体
  + 1 item3 段），零残留。
- v1.13 laser 冻结 md 的 4 个 DZ_BTN 槽位值同步迁移（附修订注）。
- 真源与外部目录 design-handoff-v1 逐字节同步（gate-diff ALL IDENTICAL），
  truth-manifest.sha256 由 `truth_manifest.py gen > truth-manifest.sha256` 重锚（50 锚点 PASS）。
- ⚠️ builder 与提交真源存在既存漂移——全量再生成在漂移对账完成前一律禁止。
- ⚠️ extract_batch2_copy.py / extract_batch3_copy.py 若再运行，会从冻结摘要反向覆盖
  batch2/batch3_copy.json 的本次 R1 修改——再生成前须先按本附录重放 JSON 补丁。
- audit.py 哨兵同步更新；`npm run gate` 必须全绿方可出 out/。
