# 06e 新增文案回传表 → 05e 冻结（已闭环，存档）

> ⚠️ 状态：**已闭环（v1.5）**——E1-E10 全部经 05-copy-freeze-v1.7-06e-chrome-addendum §1 裁决冻结（冻结 9 组 / 附落位条件冻结 1 组 / 打回 0），建议稿与最终冻结串逐字一致；本表仅作历史存档。E5 落位条件（§4-1）已写入 DESIGN.md 并落实为 audit.py 自动断言。
> 发出：moyun（06e BOFU 设计增量）｜ 日期：2026-10-20 ｜ 上游：PROMPT_sheji_06e_bofu_pages.md
> 纪律：以下全部为**建议稿**，已落位并标 [PENDING-05e]；冻结后改串走微换 + audit.py 哨兵锁定。
> 范围说明：4 个 comparison 页的正文文案 100% 来自 05d（零新增）；本表只收**设计 chrome**（footer 分组、区块 spec 注、徽章格式）。EN-only 批次，无 PT 列。

| # | 位置 | 用途 | EN 建议稿 |
|---|---|---|---|
| E1 | footer 新增分组标题（全站 EN 页脚） | Compare 分组槽位 | `Compare` |
| E2 | footer 锚文本 ×4 | 4 个新路由链接 | `vs Vector Magic` / `vs CloudConvert` / `vs Vectorizer.ai` / `vs Convertio` |
| E3 | 4 页 Hero eyebrow spec 注 | 关键词眉标 | `Vector Magic alternative` / `CloudConvert alternative` / `Vectorizer.ai alternative` / `Convertio alternative`（= 各页目标关键词原文） |
| E4 | 区块 spec 注 ×5（4 页共用） | 板块眉标 | `The friction` / `Facts, side by side` / `The difference` / `Real results` / `Pricing` |
| E5 | Real Results 统计徽章 ×3 | 88→9 数据徽章 | `BEFORE 88 color layers` / `AFTER as few as 9 layers` / `CLOSED PATHS ✓`（数字为 05 §6-18 冻结值，格式沿用既有徽章） |
| E6 | ②「Where files go」强调行图标标注 | 上传 vs 本地对照（事实标注，无贬低） | `☁️ Uploaded to CloudConvert's servers` / `💻 Nowhere — conversion runs 100% in your browser`（文字=05d 表格原文，仅加图标与 chip 容器） |
| E7 | ② NDA 高亮卡 spec 注 | 正文高亮卡眉标 | `Client work · NDA` |
| E8 | ③ 技术注脚卡 spec 注 | POLYLINE 注脚眉标 | `Technical footnote · in our tests` |
| E9 | 对比表移动端堆叠列名 | `data-col` 属性输出 | 竞对名 / `CleanPaths`（既有名称，零新词，仅登记呈现方式） |
| E10 | [待确认] 注记呈现 | 未核实竞对事实的文字 chip | 原文 `[待确认-落站前核实…]` 逐字保留 + caution 色 chip 容器（呈现方式登记，非文案变更） |

## 复用既有冻结串（不计新增，仅登记）

- 徽章行 `🔒 Files stay on your device · No account · No watermark`（05 §0.2 短版）
- 质量诚实块 H2+正文（05 §0.3 原样）
- 退款原子（§0.5）/ 买断原子（§0.4）/ CTA `Convert free now` + `Get CleanPaths Pro — $59, one time`（§0.8）
- BEFORE/AFTER/SYNTHETIC SAMPLE 标签纪律（§11.6）
- /png-to-dxf 新 FAQ 条目全文（05d §5 原样，插位 #1 后 #2 前）
- 页尾内链块（05d §1-§4 原样）

## 回传 zhongshu 的非文案事项（随 06e 交付）

1. **CookieNotice 设计真源缺口**：线上 10-14 已上线通知式 cookie 条，本包无对应组件设计。建议 06f 补真源（含 EN/PT 文案槽）或确认线上为准。
2. **footer 信任行变更**：本包已按 open-items #60 删除 "No tracking cookies"（EN+PT），与包内新 /cookies 页自洽。
