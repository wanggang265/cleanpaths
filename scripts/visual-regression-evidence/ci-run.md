# CI run 核验记录（open-items #111 / T4、T5）

## Run: 45306950102

- **URL**: https://github.com/wanggang265/cleanpaths/actions/runs/45306950102
- **Commit**: 5f68716 `qa(#111): CI visual regression gate — 3x3 screenshot matrix + overflow/grid/pixel assertions`
- **结论**: run success；jobs：gate ✅ + **visual-regression ✅（needs: gate，gate 后串行）**
- **关键 step**: `Build HEAD artifact (out/)`（npm run build，与本地闸同路径）→
  `Install Playwright chromium`（repo lockfile 定版 chromium-1243）→
  `Visual regression gate (open-items #111)` → **22 pass, 0 fail，GATE: PASS**
- **语义核对**：fail = 红 X（#23 语义一致）；step 无 `|| true` / `continue-on-error`；
  design-truth diff 在 CI self-skip（预期，#23 先例未弱化）。
- **跨环境实测（写入 calibration.md §8）**：CI runner 9 图 C 断言全部 **0.0000%**——
  同 chromium-1243 下 ubuntu-latest 与本机渲染逐像素一致，本地基线可直接用于 CI diff。
- Annotations 仅 actions/checkout@v4、setup-node@v4 的 Node 20 deprecation 警告
  （既有 runner 层提示，与本单无关，不处理）。
