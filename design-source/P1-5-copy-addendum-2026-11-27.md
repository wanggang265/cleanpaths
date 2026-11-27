# P1-5 文案变更附录 — 首页 $29 batch pack 交叉引用行（+ P1-4③ schema name 记录）

日期: 2026-11-27 · 执行: chuangkou (窗口) · 授权源: **工单 PROMPT_chuangkou_p1-4c_p1-5_home_batch.md**
（派单 zhongshu/wangduoyu 2026-11-27；上游冻结源 = 2026-11-24 修改完善计划原文第 4/5 项，
王刚 GO 口径，zhongshu 会话档考古寻回）。本附录即该工单 C1/C2 的真源落位记录。

## C1（P1-5）— EN 首页价格条加购交叉引用行

冻结串（逐字照用，禁改写）:

```
or add a $29 batch pack
```

- 位置: EN 首页价格条 `<p>`（$59 句）内、`30-day money-back guarantee.` 之后追加同段
  交叉引用链接，锚文本 = 冻结串全文，指向 `/pricing/`（真源形态 `../pricing/code.html`）。
  不加新卡片、不加新 section、不做价格重构。
- 语义一致性: 定价页 Batch Pack = `$29 each, one-time`（2026-11-27 总控实探实证），
  本行指向语义与之对齐（batch pack = $29 一次性）。
- 旧串零改动红线自检: `$59` 冻结句、`Free for 10 conversions a day`（原串含 for，
  即 "Free, 10 conversions a day" 红线所指价格域）、`30-day money-back guarantee.`
  表述均逐字未动（audit.py line-40 既有 pin 未改、容差未调，追加不破坏 substring 断言）。

触达（外科手术式替换，禁全量再生成——P0-2 勘误继续有效）:

| 文件 | 改动 |
|---|---|
| design-source/pages/home/code.html | 价格条 `<p>` 追加交叉引用锚 |
| design-source/build/audit.py | home 哨兵 +1: `or add a $29 batch pack`（工单授权 +2 pin 之一） |
| design-handoff-v1（外部真源目录） | 以上两文件逐字节镜像（gate diff + anti-rollback 覆盖） |
| src/content/pages/home.ts | 由 `scripts/extract-pages.mjs` 从真源再生成（href 改写 `/pricing/`） |

builder 页 `design-source/build/pages_home.py` **未动**: 其价格条与提交真源存在 P0-2
已登记的既存漂移（"Need more? CleanPaths Pro is..." 旧句），全量再生成在漂移对账前一律禁止，
故按 P0-2 先例只做提交真源外科手术，不对已漂移 builder 做无效同步。

## C2（P1-4③）— EN 首页 SoftwareApplication.name

```
现值: "Convert PNG, JPG, SVG to Cut-Ready DXF — Free, in Your Browser"
改值: "CleanPaths"
```

- 落位: `src/app/page.tsx` `name` prop（ToolPage 注释即 schema name，唯一进入
  SoftwareApplication JSON-LD 的通道；H1/OG title/description 均不取此 prop，零波及）。
- 其余字段零改动: url/description/offers/applicationCategory 等全部保持；FAQPage schema
  零改动；pricing 页 Product/Offer 零改动；PT 页零改动。
- 哨兵 +1: `scripts/audit-copy.mjs` 新增 schema-name pin（`name="CleanPaths"` 恰现一次 +
  旧值归零断言；工单授权 +2 pin 之二）。design-source 页无 JSON-LD，该字段唯一 QA 面在
  src 侧，故 pin 落 audit-copy.mjs 而非 audit.py。

## 真源 seal 与流程记录

- 写链: unlock → precheck PASS（51 anchored，repo-anchor 基线）→ 写 → seal → lock。
- precheck 前卫生清理: 外部真源目录遗留孤儿草稿 `build/truth-manifest.sha256.new`
  （2026-11-23 49 锚旧态，早于现行 11-25 51 锚 repo 锚点，pt-hub 缺失，会被 precheck
  误选为基线）→ 删除；guard 根本在 repo design-source，外部目录不归 guard 管，
  该草稿无消费者，删除属基线卫生非内容变更。
- 授权漂移（snapshot vs 写后）: `pages/home/code.html`、`build/audit.py`、
  `P1-5-copy-addendum-2026-11-27.md`（本文件）。
- 边界自检: PT 首页零动作 ✓（本批零 PT 文件）；路由/sitemap/route-mapping 零变化 ✓；
  CI 视觉回归预期红（价格条高度微变），核销后 update-baseline 重锚（工单边界 #4）。

## 验收对账（zhongshu 复跑口径）

1. 生产 `/` raw HTML 含 `or add a $29 batch pack`（view-source 断言）
2. 生产 `/` SoftwareApplication.name == `CleanPaths` 且其余字段逐字未动
3. 生产 `/pt/` 零 diff（本批 git 范围零 PT 文件）
4. 桌面+移动价格条截图无溢出/无破相
5. audit.py AUDIT PASS（含新 pin）；deploy.sh 全闸通过
6. 本附录落库（repo + 外部镜像）
