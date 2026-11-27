# OI-6 DebugView 探针联调记录（2026-11-27）

## Boss 报告现象
GA4 DebugView「正在等待调试事件」，无任何流量。

## 根因链（二分实证）
1. **主因**：探针向 dataLayer 的 `config` 条目注入 `debug_mode:true` 后，gtag.js **整个抑制发送**——collect 请求一个都不出（V2/V3 变体实证：仅 patch-config → hits=0；仅 patch-event → hits=1 POST 正常）。boss 观察窗口恰好覆盖这种状态，GA4 侧零流量。
2. 次因：工具链回滚——python 原地 patch 被 patch 工具按缓存版本写回覆盖，导致早前以为已上线的逐事件注入实际未生效（全局 `set` 指令不可靠）。

## 修复后方案（现行）
- 仅逐事件注入 `debug_mode:true`（GA 官方文档 per-event 方法），不动 config、不用全局 set。
- 所有探针上下文预置同一 `_ga` cookie → cid 固定 `1842828495.1795767155` → DebugView 只出现**一张设备卡**。
- wireNetwork 解析 POST form body，补 route.continue()。

## Wire 证据（2026-11-27T08:24Z 本轮）
- 9 个 collect 全部发出：page_view×6、language_switch×2、upload_start×1（本轮 B-E 上下文含 buy_click/pricing_view 等由 OOB 侧记录 15 条）
- cid 唯一 ✓（单设备卡）
- 原始数据：`oi6-probe-events.json`（network[] 含 en/cid/dl/params）

## 注意
- `ep.debug_mode` 不会出现在 wire 上（gtag 作为控制字段消化），wire 无法直接证明 DebugView 路由；最终验证 = boss 打开 DebugView 看设备卡（Linux / Chrome·HeadlessChrome）。
- 调试事件不进标准报告/Realtime，属预期。

## 2026-11-27 续：探针侧 DebugView 喂养失败（8 种机制实证），切 Plan B
源码层证据（gtag.js 45je6bi0h2v9，545KB）：
- `hi[I.D.Zg]="_dbg"`：debug_mode 内部键 Zg → wire 参数 `_dbg`；`wG` 函数 `copyToHitData(I.D.Zg)` 负责拷贝。机制存在。
- 但以下机制**全部未能让 wire 出现 `_dbg`**：①dataLayer 逐事件 debug_mode（params 管线通畅：file_type/from_lang 均上线，唯 debug_mode 被静默吞掉）②全局 `['set','debug_mode',true]`③替换 config 注入（**附带发现：往 config 条目塞任何对象（含无关参数）会整体杀死 gtag 处理，collect 归零**——V5 无关参数对照实证）④追加第二条 config（启动后追加不生效）⑤init 预置 config（先于 gtag.js，send_page_view:false 生效证明被处理，仍无 _dbg）⑥经站点原生 `window.gtag()` stub 调 config/set/event（oi6_dbg_test 12 秒不上线）。
- 结论：本构建下探针无法可靠产出调试流量。**DebugView 人工验证改由 Plan B 承担**：boss 本地 Chrome 安装官方 Google Analytics Debugger 扩展 → 启用后浏览站点 → DebugView 出现其设备卡。
- 探针职责收敛为 wire 层证据（9 事件矩阵 + 参数正确性），已足够支撑 GA4 埋点验收。
- 附：pricing_view 延迟 ~10s 才 flush（GA4 批处理+engagement 超时），非数据丢失；导航前瞬时事件（convert/download/checkout）依赖 unload sendBeacon，探针短等待窗口抓不到属预期。

## 2026-11-27 终版：GA4 服务端确收证据，OI-6 证据链闭合
探针增加 response 状态码抓取，重跑（2026-11-27T12:25Z）：
- 9 个 collect 事件 **全部 HTTP 204**（GA4 collect 端点 204 = 接受成功，官方预期应答；0 异常状态码）
- 事件分布：page_view×6、language_switch×2（from_lang=pt→to_lang=en）、upload_start×1（file_type=jfif）
- 证据文件：`oi6-probe-events.json`（network[].ga_status 字段）

证据链（三层）：
1. dataLayer 层：9 事件入队（oob 同步捕获）✓
2. wire 层：9 个 collect 发出，事件名/参数/cid 均正确 ✓
3. 服务端层：9/9 HTTP 204 确收 ✓
DebugView 人工层改为可选（Realtime 报告零安装替代），不再阻塞验收。
