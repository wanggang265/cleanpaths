# P0-4b 前置校验预研记录（2026-11-26，jishi）

> 状态：**[BLOCKED]**——唯一阻塞项 = OI-5 `GA4_API_SECRET` 未 put（2026-11-26 实测缺失）。
> 本文件 = secret 落地前完成的全部只读预研，落盘防会话丢失；零代码改动、零部署、零 repo 写操作（本文件为 untracked 新增，不与 P0-4a 工作树冲突）。

## 前置① GA4_API_SECRET 实测（2026-11-26 22:47 UTC）

```
CLOUDFLARE_API_TOKEN=$(cat /home/ubuntu/.cloudflare/api-token.pages) \
  npx wrangler pages secret list --project-name=cleanpaths   # wrangler 4.168.0
```

实测 10 键：ADMIN_KEY / BEACON_ADMIN_KEY / CREEM_API_KEY / CREEM_PRODUCT_ID_{BATCH,MONTHLY,PRECISION,PRO_CORE,TEST_DOLLAR} / CREEM_WEBHOOK_SECRET / TELEGRAM_BOT_TOKEN。**无 GA4_API_SECRET** → 与账本 OI-5 一致，BLOCK。

## 前置② Creem metadata 透传 —— 已闭（官方文档分支，文档可得）

来源（官方，2026-11-26 抓取）：
- `https://docs.creem.io/api-reference/endpoint/create-checkout.md`（OpenAPI）
- `https://docs.creem.io/code/webhooks.md`（事件目录 + 载荷样本）

实证要点：
1. **创建侧**：`CreateCheckoutRequest.metadata` = `type: object`，"Metadata for the checkout in the form of key-value pairs"，`additionalProperties: true`（任意 KV，官方示例含 `userId: user_123`）。字段名 = 请求顶层 `metadata` —— 与现行 checkout.ts L141 已在发送的 `metadata:{source,tier}` 同通道。
2. **回读侧**：`checkout.completed` 官方样本载荷中 `event.object.metadata` 原样回读（样本：`{"custom_data": "...", "internal_customer_id": "..."}`）。
3. **结论**：透传路径 = 请求 `metadata.client_id` → webhook `object.metadata.client_id`。P0-4a 契约侧实证：`p0-4a-checkout-contract.json`（2026-11-26）显示 FE 发送 `client_id: "1426147198.1795704169"`（GA4 client_id 格式）。

## 前置③ 事件类型语义 —— 文档侧已闭；真实日志实证留 T6

1. 官方定义：**checkout.completed = "A checkout session was completed, returning all the information about the payment and the order created."**（webhooks.md §Event Types）
2. 事件目录全清单：checkout.completed / subscription.active|paid|canceled|scheduled_cancel|past_due|unpaid|expired|trialing|update / refund.created / dispute.created——**不存在任何「发起/待支付」类事件**，checkout.completed 语义无歧义；样本 `order.status: "paid"`。
3. refund/争议 = 独立事件（refund.created / dispute.created），确在 §8.4 范围外（遇到先修订规格，本单不碰）。
4. **真实日志实证**：留待 T6（secret 落地后），方法 = `wrangler pages deployment tail --project-name=cleanpaths` 实时流 + 代码内**只记订单级字段**（eventType / metadata 键名 / order id / 金额 / 币种；email 压根不打印）+ Telegram 通知 Tier 字段行为核销。

## 载荷形状重要发现（影响 T2/T3 实现）

官方样本中 `event.object.order` 是**对象**（含 `id`(ord_) / `amount`(分) / `amount_paid`(分) / `currency`(大写 ISO) / `status`，amount/currency 为 required）；checkout 顶层**无** amount/currency。而现行 creem.ts L153/L155 按「顶层 amount + order 是 string」读取（历史猜测形状，未实证过）——现行 Telegram 通知 Amount/Order 长期显示 n/a 之谜即此。

T2 取数设计（双形状防御，docs 权威形状优先）：
- `transaction_id` = `order.id`（order 为对象时）→ 兜底 order 为 string 时直接用该 string
- `value` = (`order.amount_paid ?? order.amount`) / 100 → 兜底顶层 `obj.amount` / 100；禁换算禁取整（除以 100 是分→元单位换算，属规格明文）
- `currency` = `order.currency ?? obj.currency` 大写
- 真实形状以 T6 tail 日志为准复核，若与 docs 不符先修订实现再交付

## T6 就绪度（2026-11-26 核对，只看键名未读值）

- `/home/ubuntu/.creem/cleanpaths.env` 在档键名：CREEM_API_KEY_TEST + CREEM_PRODUCT_ID_TEST_{PRO_CORE,BATCH,PRECISION,MONTHLY} + CREEM_PRODUCT_ID_TEST_DOLLAR —— test 模式 E2E 凭据齐备。
- test 基址 `https://test-api.creem.io`（与生产 API key 不同，docs 明文）；4242 系测试卡可用（任意未来有效期/CVV）。
- 支付完成步骤需浏览器过 Creem 托管页（反爬可能拦 headless；不行则请用户手动完成一次 test 单）。

## secret 落地后的续跑顺序（备忘）

1. T1–T4 写码（仅 functions/** 两文件）+ commit（`feat: P0-4b GA4 purchase via Measurement Protocol (webhook server-side)`，pathspec 只加本单文件，P0-4a 的 src/** 改动零接触）
2. deploy（Pages functions 随项目部署；secret 已在绑定快照则一次生效；若 put 晚于 deploy 需再 deploy 一次——pages-secret-rotation 铁律）
3. T5 四步 debug 验证（validationMessages:[] / DebugView / 同 transaction_id 幂等 / 证据入 `docs/evidence/p0-4-ga4-debugview/` 前缀 p0-4b-）
4. T6 test 全链路 + 生产复验（tail 日志留痕）

## 本单已载 skill 清单

backend-auto-site-cloudflare-workers（硬闸）/ cloudflare-token-switching-protocol / cloudflare-pages-secret-rotation / cloudflare-deployment-manifest / payment-funnel-verification（后四者经 cp -r 同构同步入 jishi profile，#114 先例标准化路径）
