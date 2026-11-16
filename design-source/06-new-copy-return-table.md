# 06 激光批新增文案回传表 → [PENDING-06-laser]（待 05/总控裁决）

> 发出：sheji（06 激光批 v1.6→v1.7）｜ 日期：2026-11-03 ｜ 上游：PROMPT_sheji_06_laser_batch.md + 05-copy-freeze-v1.13-laser-batch-addendum.md
> 范围：v1.13 未冻结的**结构性/状态板 UI 串**。五页正文 190 槽 100% 来自 v1.13 §A/§B/§C 键名表，程序化解析落位，零改写。

| # | 位置 | 建议稿 | 说明 |
|---|---|---|---|
| L1 | footer Converters 组新链接锚文本（全站 EN 页脚） | `Image to DXF` / `Photo to DXF` | 沿用 06f F6 先例（工具名直白式，同 `JFIF to PNG` / `WebP to SVG` 格式） |
| L2 | /image-to-dxf、/photo-to-dxf Proof 区眉标 | `Proof` | 既有池全版为 `Proof — in our tests`；本批两页 Proof 串无实测声称，挂全版会虚假暗示——截短为 `Proof` |
| L3 | /png-to-dxf-for-laser-cutting 导语区眉标 | `Guide` | 场景内容页属性标注；既有池无对应（工具页用格式 spec、对比页用 E3 竞品名） |
| L4 | EN 两页状态板错误态接受清单 | `That file can't be converted here. This page accepts {FORMATS}. Nothing was uploaded, so nothing was stored.` | §11.3 错误态模板 **{FORMATS} 占位携带**（[PENDING-07-formats]），非锁清单；占位以 caution chip 渲染，strip 后串连续，已入 audit.py STATES 哨兵防静默锁定 |
| L5 | PT 两页状态板结果态下载按钮组 | `Baixar DXF (R2000)` / `Baixar DXF (R12)` / `Baixar SVG` | §11.3 PT 表格式替换（既有 `Baixar JPG` / `Baixar PNG` / `Baixar SVG` 先例，06f F3 同族） |
| L6 | PT 两页状态板错误态接受清单 | `Este arquivo não pode ser convertido aqui. Esta página aceita {FORMATS}. Nada foi enviado, então nada foi armazenado.` | L4 的 PT 对应（§11.3 PT 错误态模板占位携带），已入 STATES 哨兵 |
| L7 | /photo-to-dxf Proof 样本位 alt ×2 | `Continuous-tone photo input, sunset scene (synthetic sample)` / `Posterized color-layer trace output (synthetic sample)` | §11.6 alt 标注模板格式替换（既有 `...(synthetic sample)` 尾注先例）；可见 `SYNTHETIC SAMPLE` 标为既有串复用，非新造 |
| L8 | PT 两页状态板 drag-over 格式行 | `ACEITA: {FORMATS} · PROCESSADO LOCALMENTE` | 采用 PT 形与 PT code.html 冻结串（v1.13 §A-2/§B-2 键 8）一致；**登记**：/pt/webp-para-svg 状态板现存 EN 形 `ACCEPTS: .WEBP · PROCESSED LOCALLY` 混用（v1.6 遗留），本批不追改旧页 |

## 非文案事项登记

1. **N1 观察项（归 zhongshu，非本批改动）**：/pt/jfif-para-png 与 /pt/webp-para-svg 的 `English version →` 链接（页头+移动菜单+页脚共 3 处/页）均指向 `../jfif-to-jpg/code.html`，疑为 06f 复制漂移（正确对应应为 /jfif-to-png、/webp-to-svg）。本批 PT 新页按 v1.13 §A-2/§B-2 页脚注记指向真实 EN 对应页；旧页是否回修归总控裁决（工单禁改 v1.6 及以前页面）。
2. **changelog 日期偏差**：工单 §4.7 规定文本写 `v1.7（2026-10-31）`，实际执行落盘为 2026-11-03；DESIGN.md 按实际日期登记、工单原文在括号内注明，请总控知悉。
3. **场景页头部 nav CTA 省略**：内容页无 `#convert` 锚点，且 v1.13 §H 负向断言要求 `Convert now — free` 零命中——场景页 header 不挂该按钮（对比页挂是因为嵌 Hero 上传组件），已在 route-mapping notes 登记。
4. **状态板口径**：工单表写「含 4 状态板」，本批按包内统一口径镜像 /png-to-dxf 全量 11 板（route-mapping「same 9-state set」惯例 + 06c 反馈系统 2 板），4 核心上传态（dragover/processing/result/error）为其中子集，无裁剪。
