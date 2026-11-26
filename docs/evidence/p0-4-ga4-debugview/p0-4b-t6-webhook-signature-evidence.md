# P0-4b T6 — Test-store webhook 签名验证证据（2026-11-26）

## 背景
T6 真实 Resend 期间发现：test 店 webhook endpoint 使用独立 signing secret（与 live 的 CREEM_WEBHOOK_SECRET 不同），首轮验签 401。修复 = 双密钥接受逻辑 + 新增 CREEM_WEBHOOK_SECRET_TEST。

## 变更
- commit `fd96387` `fix(webhook): accept live OR test signing secret (P0-4b T6)` — functions/api/webhooks/creem.ts：secrets 数组（live ∪ test），任一命中即 verified；全不中且配置了至少一个 secret → 401（语义不变）。TS2802 伪报已按惯例用项目 tsconfig `npx tsc --noEmit` 排除（TSC_OK）。
- secret：`/home/ubuntu/.cleanpaths/creem-webhook-secret-test`（boss 归档）→ `wrangler pages secret put CREEM_WEBHOOK_SECRET_TEST`（stdin，零回显）。密钥清单实证：CREEM_WEBHOOK_SECRET / CREEM_WEBHOOK_SECRET_TEST / GA4_API_SECRET 三键齐。
- deploy.sh L7 token 源 `api-token` → `api-token.pages`（旧 token 对 Pages API 401 code 10000，本轮实证；`bash -n` 过）。

## 部署
- Production `20dcfaec`（https://20dcfaec.cleanpaths.pages.dev），`wrangler pages deploy out`（Pages token）。deploy.sh 全量脚本因 npm build 阶段 token 401 中途折戟，改直跑最终部署步骤。

## 双对照签名探针（本地 HMAC-SHA256，Standard Webhooks v1 规范，payload=probe.signature_test 无副作用事件）
| 探针 | 签名密钥 | 预期 | 实测 |
|---|---|---|---|
| 正对照 | TEST secret（本地文件，补 padding base64 解码） | 200 | **HTTP 200 `{"ok":true}`** |
| 负对照 | 错误密钥 | 401 | **HTTP 401 `{"ok":false,"error":"invalid_signature"}`** |
| 活性前置 | 无签名 | 401 | HTTP 401 invalid_signature |

结论：TEST 密钥在 live 端点验签通过，错误密钥正确拒绝，dual-secret 机制闭环。

## 备注
- `wrangler pages deployment tail` 对 20dcfaec 报 8000098「无 Pages Function」误报（bundle 实际含 Functions，_routes.json 已传），改用双对照探针取证，证据强度更高。
- 本轮 boss 已在 Creem 后台对 test endpoint 点过一次 Resend（结果看 Creem 投递状态回执 + 是否触发 💰 TG 通知，探针已独立证明验签机制）。
- **Runtime 确认（2026-11-26，boss 口述）**：Resend 触发的 💰 checkout.completed TG 通知已送达 boss TG（chat 5190008355）→ Creem→webhook→验签200→extractOrder→TG 全链路生产实证，T6 运行时侧闭环。[待确认]② 真实日志实证随之收口。
- **真实载荷字段核验 + Product 形状补修（2026-11-26）**：boss 回传 TG 通知实文 — Amount USD 1.00 / Order ord_* / Checkout ch_* 全实数 = T2 订单双形状修复生产验证通过；Product 显示 n/a 暴露 object.product 是对象非字符串（与 order 同款历史误猜）→ commit 补 productLabel 双形状（name→id→n/a），TSC_OK，部署 `15e9b92a`，无签名 POST 401 复验通过。GA4 路径不读 product（全文件单点引用），无连带影响。
