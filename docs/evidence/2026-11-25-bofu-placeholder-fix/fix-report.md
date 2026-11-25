# P0-BOFU 占位修复批 · 2026-11-25

## 事故
4 个 BOFU 竞品替代页（vectorizer/convertio/cloudconvert/vector-magic-alternative）带 42 处生产命中
（真源 19+1 唯一占位，含 span 重复与错位变体）[待确认-落站前核实…] 标记上生产。另有
deploy-gate step6 盲区（占位扫描只覆盖 legal 4 页）与 audit.py 误把占位串当 positive sentinel
双重防线漏网。

## 修复
1. 真源 4 页占位全清（seal 链：unlock→precheck→edit→seal→lock，3 轮 seal，最终 manifest 51 PASS）
   - vectorizer：3 格填入官网核实值（subscription plans + per-image credits / DXF export advertised
     no cut variants / cleanup×13 佐证，denoise/upscale 措辞对齐 vendor）
   - convertio：DXF output 格补 (DXF supported as generic output)（官网 dxf-converter 页实锤）
   - cloudconvert / vector-magic：定性文字已与官网核实一致，纯删占位；无来源数字一律不填
2. gate step 6b 新增：src/content/pages/*.ts 全目录占位扫描（防再犯）
3. audit.py：4 行误正 pin 删除 + E10 清空 + NEGATIVE 挂 防-回潮 断言（缩进修正后语法验证前置）
4. 镜像 design-handoff-v1 双副本同步（pages 4 html + build/audit.py），check 51 PASS
5. gitignore 补 zip/snapshot 漏项；seal 新 zip 归位 /home/ubuntu/design-handoffs/cleanpaths/

## 部署与验证
- commit ecb434e（主体）+ 1b46179（convertio 补句）+ docs(qa) 本件
- 部署 ID 35db58bb → fedac00f（api-token.pages env，deploy.sh 默认 token 无 Pages 权限的坑已记录）
- 生产终扫 PASS：4 页占位 0 / convertio note 在场 / vectorizer 核实事实 3/3 / sitemap 48 /
  jfif baseline FAQ 4/4/7/9 精确保持 / 全部 dxf-jfif 路由 200

## 待用户决策（open）
- mock 工件（6 mock HTML + 4 构建脚本）现寄存 /home/ubuntu/jfif-ctr-mocks-preserved/，
  是否回归仓库待指定位置
