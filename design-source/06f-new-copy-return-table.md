# 06f 新增文案回传表 → [PENDING-06f]（待 05/总控裁决）

> 发出：moyun（06f 新页 + CookieNotice 补位）｜ 日期：2026-10-22 ｜ 上游：PROMPT_sheji_06f_newpages.md + 05-copy-freeze-v1.8
> 范围：v1.8 未冻结的**状态板 UI 串**与**真源补位串**。页面正文 100% 来自 v1.8 §A/§B 键名表，零新增。

| # | 位置 | 建议稿 | 说明 |
|---|---|---|---|
| F1 | /jfif-to-png 状态板 processing 步骤中步 | `▸ Converting to PNG` | v1.8 未冻结该页状态串；§11.3 jfif 模板是 "Repackaging as JPG"（重打包），但 JFIF→PNG 为 decode→PNG encode（v1.8 P1 口径），"Repackaging" 不实——建议新串 |
| F2 | /jfif-to-png 状态板下载按钮 | `Download PNG` | §11.3 按钮组模板格式替换（jfif 页为 `Download JPG`） |
| F3 | /pt/jfif-para-png 状态板步骤中步 + 下载按钮 | `▸ Convertendo para PNG` / `Baixar PNG` | F1/F2 的 PT 对应（§11.3 PT 表格式替换） |
| F4 | /pt/webp-para-svg 状态板步骤中步 | `▸ Vetorizando — parâmetros ajustados à imagem` | §11.3 PT 表只有 jfif 三串；trace 中步需 PT 新串（EN 侧复用 §11.3 冻结 "Tracing paths — auto-tuned parameters" ✅ 无新增） |
| F5 | CookieNotice EN/PT 文案 + 按钮 | EN: `We use analytics cookies (Google Analytics & Microsoft Clarity) to see how the site is used — no ads, no cross-site tracking. Your files still never leave your device.` + `Details` + `Got it`；PT: `Usamos cookies de análise (Google Analytics e Microsoft Clarity) para entender como o site é usado — sem anúncios e sem rastreamento entre sites. Seus arquivos continuam 100% no seu dispositivo.` + `Detalhes` + `Entendi` | **逐字镜像线上 CookieNotice.tsx**（2026-10-14 已上线）。该串未经 05 冻结即上线（10-14 批次），本包按「以线上为准」回画；请 05 追认冻结或改稿后我微换 |
| F6 | footer Converters 新链接锚文本 | `JFIF to PNG` / `WebP to SVG` | 沿用既有 `JFIF to JPG` 同格式（工具名直白式） |
| F7 | /webp-to-svg DXF 交叉引导块 spec 注 | `Output note` | 眉标新串；PT 侧 `Nota de saída` |
| F8 | /jfif-to-png 状态板结果层说明行 | `decoded + stored as lossless .png · same pixels, no new compression`（PT: `decodificado e salvo como .png sem perdas · mesmos pixels, sem nova compressão`） | 结果态 layer 列表内容（运行时数据位，§11.3 动态模板同族） |

## 非文案事项登记

1. **v1.6 商用授权附录回填**：audit.py 已被上游更新至 v1.6 哨兵口径，本批把 builders（pricing hero/Free "Personal use"/Pro Core 权益重排/Monthly Pass "Includes commercial use."/FAQ#9 新增、cricut 支撑句重排+FAQ#7 整段替换、cap 态 conv 行改值）补齐至附录原文——漂移闭环，非新增设计。
2. **C 组三页**（/jfif-to-jpg、/jpg-to-dxf、/png-to-dxf）copy-only 变更按工单不进本包，07 直落；route-mapping 已备注。
3. **版本号偏差**：工单写 v1.4→v1.5，实际 v1.5 已被 05e 落位占用（2026-10-20），本批升 **v1.6**，请总控知悉。
