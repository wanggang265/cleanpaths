# /png-to-dxf/ 参数面板技术方案（阶段 1 · 评估与方案）

> 执行：chuangkou ｜ 日期：2026-10-29 ｜ 工单：PROMPT_chuangkou_png_to_dxf_param_panel.md
> 性质：**阶段 1 纯方案，零上线动作**（本文件未 commit、未部署；阶段 2 待 zhongshu 裁决 + wenshu 冻结后另派）
> Skill：frontend-site-automation v2.3.1 + backend-auto-site-cloudflare-workers v2.4.0（均已加载确认）

---

## 1. 参数清单核实（逐项：引擎已支持仅缺 UI / 引擎也需改）

| # | 参数 | 引擎现状（代码实证） | 判定 | 重跑成本 |
|---|---|---|---|---|
| P-W | **mm 宽度** | `src/lib/dxf.ts` `buildDxf(layers, version, flipY, scale)` —— scale 参数现成，默认 `PX_TO_MM = 25.4/96`（96dpi 换算）；R2000 已带 `$INSUNITS=4 (mm)`。用户给定目标宽度 W_mm → `scale = W_mm / svgWidthPx` | ✅ **引擎已支持仅缺 UI** | **零重跑**：prepared layers 已在内存，重建 DXF 字符串 <50ms，可实时 |
| P-T | **阈值** | VTracer config 全参数经 `engine-client.ts` worker RPC 传递：`colorPrecision`（当前 4-9，Precision 滑杆联动）、`cornerThreshold`（固定 60）、`lengthThreshold`（固定 4）、`spliceThreshold`（固定 45） | ✅ **引擎已支持仅缺 UI**。建议暴露 `colorPrecision` 为主控件（用户语义「颜色阈值」），`cornerThreshold` 列专家备选 | 全管线重跑（同 Precision 滑杆现状） |
| P-N | **节点简化** | 双机制：① VTracer `pathPrecision`（1-8，已随 Precision 滑杆 `precisionConfig()` 联动）② flatten `step` 采样步长——svg-dxf 路径已参数化（`stepForPrecision`），**raster 路径固定 0.8**（ToolController.tsx L425，要动） | ✅ **引擎已支持仅缺 UI** | 可解耦：只重跑 flatten+buildDxf（flatten-worker 内，秒级），不需重跑 trace |
| P-M | **切割 vs 雕刻模式** | VTracer `hierarchical` 开关现成：`1=Cutout`（当前固定，01.5「no overlapping lines」硬要求来源）/ `0=Stacked` | ⚠️ **底层开关已支持，但产品语义映射需上游裁决 [待确认]**——两种候选语义：ⓐ Cutout=叠色分层（多色印刷/雕刻向）vs Stacked=邻接不重叠（单色切割向）；ⓑ 若用户语义是「cut=闭合轮廓 / engrave=中心线描线」，VTracer 是色块 vectorizer、**无 centerline trace 能力 → 引擎需改（不建议本期）**。按语义 ⓐ 落地则零引擎改动 | 全管线重跑 |
| P-X | 其他可暴露（不建议） | `filterSpeckle`、`layerDifference`、`mode`（Spline/Polygon）、`maxIterations` | 引擎已支持，**建议不暴露**——专家噪音，Precision 滑杆联动已覆盖主流调节意图 | — |

**结论：4 个目标参数中 3.5 个零引擎改动**（P-W/P-T/P-N 全 UI 层，P-M 仅语义裁决）；无任何参数需要把计算拉回主线程（open-items #18 红线：引擎 vectorize + flatten 均在 worker，参数全部经 postMessage 传递，本方案不触碰该架构）。

## 2. UI 方案

**落位**：结果态（renderResult）现有 Precision 滑杆区扩为参数组——滑杆组上方加 spec 眉标，下方依次排新控件。结构（与 `state-templates.ts` resultHtml 既有段落同构）：

```
[spec] CUT SETTINGS（眉标，mono 全大写，同 c.precision 样式）
├─ Width (mm)  [number input]  Output size: {w} × {h} mm（只读行）
├─ Precision   [range 1-10]（既有，不动）
├─ Color threshold  [range 4-9]  辅助行
├─ Node smoothing   [range]      辅助行
└─ Mode  [seg 分段控件：Cut / Engrave]（DXF 版本 seg 同款，P-M 裁决后启用）
```

- **控件形态全部复用设计系统既有组件**：spec 眉标 / range（accent-color #E4572E，与 precision 同款）/ seg 分段（DXF R2000/R12 选择器同款）/ 辅助行 microcopy 风格。number input 为新形态——用 `input[type=text] inputmode="decimal"` + 数字校验（design-system.css 无 number 原生样式，避免新视觉元素）。
- **移动端（#37 教训）**：控件全部纵向堆叠、`width:100%`；range/input 无固定像素宽度；375/360/320px 三断点零溢出为验收硬指标。
- **PT 页**：/png-to-dxf/ 无 PT 版，本批 EN-only；PT 工具页（jfif/webp 系）不带本面板（中性页约束 + 骨架不同）。
- **默认态诚实口径**：mm 输入框预填当前换算宽度（`svgWidth × 25.4/96`），只读行同步显示——默认尺寸是「96 DPI 换算值」这一事实必须在辅助行明示（建议稿见 §3-N6），避免「用户以为默认就是真实尺寸」的误导。

## 3. 新增文案串清单（EN 建议稿 · 回传 wenshu 冻结 · 零自行遣词上线）

| # | 建议稿（EN） | 槽位 | 备注 |
|---|---|---|---|
| N1 | `Cut settings` | 参数组眉标 spec | 同族：既有 `PRECISION` 滑杆标签的组级眉标 |
| N2 | `Width (mm)` | mm 输入标签 | — |
| N3 | `Output size: {w} × {h} mm` | 尺寸只读行（含占位符） | 占位符运行时替换 |
| N4 | `Color threshold` | 阈值滑杆标签 | — |
| N5 | `Lower = fewer colors, cleaner paths` | 阈值辅助行 | — |
| N6 | `Default size assumes 96 DPI — set the width you actually cut at.` | mm 辅助行（诚实口径） | 防「默认即真实尺寸」误导 |
| N7 | `Node smoothing` | 节点简化滑杆标签 | — |
| N8 | `Higher = fewer nodes, smaller file` | 节点简化辅助行 | — |
| N9 | `Cut` / `Engrave` | 模式 seg 两档 | **P-M 语义裁决后定稿** |
| N10 | `Re-tracing…` | 重跑中提示（或复用既有 processing 串，零新增） | 建议复用，不新增 |

禁词自检（建议稿层）：零 unlimited/guaranteed/official；无新数字声称（96 DPI 为技术事实说明，非营销数字）。PT 串本批不需要（EN-only）。

## 4. 性能影响评估

| 参数 | 重跑路径 | 耗时口径 | 交互预期管理 |
|---|---|---|---|
| mm 宽度 | **无重跑**——prepared layers 内存重建 DXF | <50ms | `oninput` 实时（250ms debounce），零等待 |
| Color threshold | 全管线 rerun（同 Precision 滑杆现状） | 小图 p95 ~100ms + 引擎秒级；大图/AI HD 路径极端 141s 现状 | 复用既有 processing 进度 + BIGFILE_NOTE 模式；与 Precision 滑杆同交互（oninput → 250ms debounce → rerun） |
| Node smoothing | 可解耦：只 flatten+buildDxf（flatten-worker） | 秒级 | 首期建议绑 rerun（实现简），二期解耦优化 |
| Mode | 全管线 rerun | 同阈值 | 同上 |

架构红线核对：引擎 vectorize（engine-worker）+ flatten（flatten-worker）均留 worker；参数全部经 postMessage 传递；无任何主线程回拉（open-items #18 合规）。mm 宽度的本地重建为主线程字符串拼接（<50ms，不涉计算密集）。

## 5. 工作量估算与建议排期

| 子项 | 估时 | 依赖 |
|---|---|---|
| P-W mm 宽度（UI + 实时重算 + QA） | 0.5 天 | 文案冻结 |
| P-T 阈值独立滑杆 | 0.5 天 | 文案冻结 |
| P-N 节点简化独立控件（含 raster 路径 flatten step 参数化） | 0.5 天 | 文案冻结 |
| P-M 模式 seg（hierarchical 接线） | 0.5 天 | **语义裁决（[待确认]）** + 文案冻结 |
| 文案冻结往返 + QA（375/360/320 + 重跑路径 E2E）+ 部署 | 1 天 | — |
| **合计** | **~3 天纯实现**（P-M 另计裁决等待） | — |

建议排期：zhongshu 裁决 → wenshu 冻结 N1-N10 → 单批落站（P-W/P-T/P-N 先行，P-M 随裁决拼接或同批）。回归风险面：仅结果态 renderResult + rerun 路径，既有 Precision 滑杆行为零改动（新增控件并列，不改联动逻辑）。

## 6. 风险与待裁决项

1. **[待确认-zhongshu] P-M 语义**：切割/雕刻的产品定义（ⓐ hierarchical 映射，零引擎改动，推荐 / ⓑ 中心线描线，引擎需改，不建议本期）。未裁决前 N9 串与 P-M 子项冻结。
2. **mm 默认值叙事**：96 DPI 换算默认 vs 用户真实切割尺寸——N6 辅助行承担诚实口径，建议保留。
3. **raster flatten step 固定 0.8**：P-N 落地需改 ToolController L425 参数化（现状仅 svg-dxf 路径可调）——已在估算内。
4. **jfif/webp-svg 页不带面板**：jfif 族无 trace、webp-svg 输出 SVG-only（mm 宽度概念仍适用于 DXF 输出页；webp-to-svg 是否也挂面板归后续裁决，本方案默认仅 /png-to-dxf/ + 同构 trace-raster 页 /jpg-to-dxf/ 可复用）。

---

阶段 1 交付物：本文件（未 commit 未部署）+ 新串建议稿 10 条（§3）+ 待裁决 1 项（§6-1）。
[DONE]
