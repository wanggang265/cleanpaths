# 任务：用本机 Chrome 实测 cleanpaths.io 的 GA4 DebugView，验证埋点事件（最终版 v2）

## 背景（先读完再动手）
- 网站：https://cleanpaths.io（jfif→jpg 图片转换工具站）
- GA4 数据流：G-9T8XY5EB0Y（在用户的 Google 账号里，数据流名称 cleanpaths.io，数据流 ID 16126853743）
- 已知事实：网站埋点已在网络层验证，9 类事件确实发到了 GA4。你本次只做 DebugView 人工复核这一层。
- 铁律：只观察、只记录。禁止改网站代码，禁止在 GA4 后台改任何设置，禁止真实付款。

## 前置检查（逐条确认，不满足直接报告 BLOCKED + 缺什么）
1. 用用户本机「有界面」的 Chrome（不要无头模式、不要隐身模式），且该 Chrome 已登录 analytics.google.com。没登录 → 让用户先登录。
2. 安装扩展：Chrome 网上应用店搜「Google Analytics Debugger」（作者是 Google Analytics），安装后点右上角拼图图标确认「已启用」。
3. 装完扩展后，所有已打开标签页全部刷新（含 GA4 后台）。

## 执行步骤（严格按顺序）
1. 开 GA4：analytics.google.com → 左下角齿轮（管理）→ 找「DebugView」点进去，此页面全程保持可见。
2. 准备测试文件：本地没有 .jfif 就随便找一张 .jpg 重命名成 .jfif（格式兼容），或用 PIL 生成一张小图存成 .jfif。
3. 打开 https://cleanpaths.io/jfif-to-jpg/ → 把 .jfif 拖进上传框 → 点转换 → 完成后点下载。
   （触发：upload_start / convert_started / convert_success / download）
4. 打开 https://cleanpaths.io/pt/jfif-para-jpg/（葡萄牙语页面，文字是葡语属正常）→ 点击页面上的「English version →」链接（顶部和底部各有一个，点任意一个）→ 页面切回英文即成功。
   （触发：language_switch，参数 from_lang=pt、to_lang=en）
   注意：语言切换不在 Pricing 页，Pricing 页没有语言切换控件，不要去那里找。
5. 打开 https://cleanpaths.io/pricing/ → 停留 15 秒以上再进行别的操作。
   （触发：pricing_view，约 10 秒延迟才上报，正常现象不要着急）
6. 在 Pricing 页点 Buy 按钮 → 跳到 Creem 支付页后不付款，直接关掉那个标签页。
   （触发：buy_click / checkout_started）
7. 回 DebugView 等 30 秒，按 F5 刷新，记录所有出现的事件名和参数。

## 验收对照（9 个事件）
- page_view = 打开任意页面
- pricing_view = 进 Pricing 页（延迟约 10 秒）
- upload_start = 上传 .jfif（参数应含 file_type=jfif）
- convert_started = 点转换
- convert_success = 转换完成
- download = 点下载
- language_switch = 点 English version →（参数 from_lang=pt、to_lang=en）
- buy_click = 点 Buy
- checkout_started = 跳到支付页
注意：调试事件只在 DebugView 显示，不进 Realtime / 普通报告。

## 最终回复格式
1. 看到的事件清单（事件名 + 可见参数）
2. 缺失事件清单 + 当时正在做的操作
3. DebugView 设备卡片上显示的名字（如 Windows · Chrome）
4. 结论：PASS(9/9) / PARTIAL(x/9) / BLOCKED(卡在哪一步、缺什么)

## 排查（DebugView 一直空时按顺序试）
① 确认扩展是启用状态，且浏览网站用的就是装了扩展的那个 Chrome
② 完全退出 Chrome 重开，重做步骤 3-7
③ 还不行 → BLOCKED 并说明具体现象（截图最好）
