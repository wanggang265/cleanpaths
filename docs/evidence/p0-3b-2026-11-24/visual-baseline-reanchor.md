# VR 基线重锚说明（P0-3b 批，2026-11-24）

## 重锚范围
- scripts/visual-baseline/home-{360,768,1024}.png（3/9）

## 理由（预期内有意视觉变化，非回归）
- EN 首页按 05-copy-freeze-v1.19 §E-2 新增语言行：
  `<a href="/pt/">Versão em português: Todos os conversores →</a>`（页尾 <main> 末、CTA band 之后）
- VR 实测：home 三档页面高度 +98/+75/+76 px，唯一变化源即该行（本批未改 home 其他任何区块）
- p2d / laser 六图 0.0000% 像素漂移（0 px changed）——证明重锚范围最小化
- A 溢出 9/9 PASS、B 768 网格 3/3 PASS 未受影响

## 复核口径
- 重锚后复跑 VR 必须 22/22 全绿（9A+3B+9C+1 baseline-set）
- 旧基线（949473f 锚）不删除，由 git 历史保留
