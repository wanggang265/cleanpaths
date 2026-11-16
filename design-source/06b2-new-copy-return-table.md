# 06 batch2 新增文案回传表 → [PENDING-06-batch2]（待 05/总控裁决）

> 发出：sheji（06 batch2 格式摩擦批 v1.7→v1.8）｜ 日期：2026-11-11 ｜ 上游：05-copy-freeze-v1.15 §I（batch2 冻结槽位表）
> 范围：v1.15 未冻结的**结构性/状态板 UI 串**。16 页正文全部键值 100% 来自 05 v1.15 §I，经 `build/extract_batch2_copy.py` 程序化解析进 `build/batch2_copy.json`（16 前缀计数断言），`build/batch2_build.py` 落位，零改写。

| # | 位置 | 建议稿 | 说明 |
|---|---|---|---|
| B1 | footer Converters 组新链接锚文本 ×8（8 个新 EN 页页脚） | `WebP to PNG` / `WebP to JPG` / `SVG to PNG` / `JPEG to JPG` / `SVG to JPG` / `GIF to JPG` / `BMP to JPG` / `JPEG to DXF` | 沿用 06f F6 + 激光批 L1 先例（工具名直白式，同 `JFIF to PNG` / `Image to DXF` 格式）；插入位置 = v1.7 两条之后、Samples gallery 之前。**既有 28 页页脚未动**（本批无全站 footer 工单，与 v1.7 全站 +2 不同——请总控确认是否需要补全站页脚同步批） |
| B2 | 16 页状态板错误态扩展名 | `.WEBP` / `.JPG` / `.SVG` / `.JPEG` / `.GIF` / `.BMP`（大写） | §11.3 错误态模板格式替换；对齐 v1.7 L4/L6 `{FORMATS}` 大写占位惯例与 dropzone 冻结串 `ACCEPTS: .WEBP`（v1.15 §I 键值本身大写）。已入 audit.py STATES 哨兵 + NEGATIVE 小写反向断言 |
| B3 | EN 7 个 bitmap 页状态板结果态下载按钮 | `Download PNG` / `Download JPG` | §11.3 格式替换（既有 `Download DXF (R2000)` 族先例）；PT 对应 `Baixar PNG` / `Baixar JPG`（L5 先例） |
| B4 | /jpeg-to-dxf Proof 区眉标 | `Proof` | 沿用激光批 L2 截短先例：本页 PROOF 串无实测声称，不挂 `— in our tests` 全版（防虚假暗示） |
| B5 | 16 页状态板结果态 layers 行 | `1 image · {EXT} → .{out} · processed locally` | mono spec 格式替换（既有 trace 页 layers 先例）；bitmap 页单层结构事实陈述 |
| B6 | PT 8 页状态板 drag-over 格式行 | `ACEITA: .{EXT} · PROCESSADO LOCALMENTE` | 沿用 L8 PT 形先例（与 PT code.html 冻结串同形），扩展名大写同 B2 |

## 非文案事项登记

1. **guard 首批鸡生蛋缺陷（归 chuangkou/zhongshu，P1）**：`truth_write_guard.sh seal` step 1 用仓库锚定 manifest 做 drift check——获授权批次写完后必然 drift，seal 永远 REFUSE，首批实测复现。本批处置：precheck drift 清单逐行核对 = 100% 授权变更集（MISMATCH×3：DESIGN.md / build/audit.py / route-mapping.json；UNTRACKED×16：新页 code.html），随后用**官方 `truth_manifest.py`**（非自造生成器）手工执行 seal step 2-4（重打包 ZIP + testzip + 新 manifest 草稿 + 回执入账），回执 note 标注 bypass 原因。建议修复方向：precheck 时落 pre-write 快照，seal 比对快照而非锚点；或 seal 接受 zhongshu 签发的授权批次号。
2. **既有 28 页 footer 未同步 +8 链接**：本批工单仅要求新页落位；v1.7 先例是全站页脚同批更新（20 EN 页 +2）。若需全站同步，请总控发增量工单（改动面 = 20 个既有 EN 页脚，audit.py [V18-ROUTE-LINK] 可同法扩员）。
3. **16 页 head 区 hreflang/canonical**：页面层互链已就位（PT↔EN `English version →` / `Versão em português →`），head 标签归 07（沿用 v1.7 分工）。
4. **截图补齐**：16 页 screen.png / screen-mobile.png / states.png 已按 `build/render_screens.py` 同口径渲染（1440×900 / 390×844 / states 板），render_screens.py 的 SLUGS 清单未含本批 16 slug（脚本内清单滞后，归 chuangkou 维护时可并入）。
