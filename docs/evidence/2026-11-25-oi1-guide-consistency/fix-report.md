# OI-1 收尾 fix-report — §A-5 ×2 GUIDE 串 + §D-2 #1/#2 一致性注记

- 日期：2026-11-25 ｜ actor：chilun（QA 线）｜ 工单：OI-1 收尾 micro-batch（总控派活，预算 30min）
- 性质：**纯文档修正**。不触碰 src/、route-mapping.json、audit.py、生产页面与路由；零部署。

## 修正口径（真源）

- zhongshu 督办修正：`§D-2 #1/#2 home/samples 新增` 与 `§A-5 两 GUIDE 串（HOME_PNG_GUIDE / SAMPLES_PNG_GUIDE）` **作废不落**。
- 同源记录：DESIGN.md v1.21 changelog + seal 回执 `2026-11-25T10:28:22+0800`（"D-2 home/samples additions and GUIDE strings NOT landed per zhongshu correction"）。
- 生产安全前置：NEG ×14 全站复扫零命中（P0-5c 批实证），无线上风险。

## 改动内容（design-source/05-copy-freeze-v1.20-jfif-ctr-addendum.md，唯一文件）

1. §A-5：标题下新增督办裁定注记；`HOME_PNG_GUIDE` / `SAMPLES_PNG_GUIDE` 两行落点列标 **作废不落**（保留原落点描述）；`EN-JPG_ENDPOINT` / `EN-PNG_ENDPOINT` 注记照常落位（§D-3）。
2. §D-2：标题下新增督办裁定注记（#1/#2 作废不落；#3/#4 已随 FAQ 落位上生产）；表行 #1/#2 落点列标 **作废不落**。
3. 冻结串字节零改动；仅注记与行内状态标记。§A-5 锚文本冻结行（L101）未改——裁定注记在其上方已覆盖语义。

## 合法写链（WRITE-PROTOCOL 全程）

| 步骤 | 结果 |
|---|---|
| 前置校验 | zip sha 前 16 位 `768774e65baf6908` == 末次回执 ✓；`.new` vs 锚定 manifest diff exit=0 ✓ |
| unlock | design-source u+w ✓ |
| precheck | PASS（baseline=sealed-draft，TRUTH MANIFEST PASS **51 files anchored**，快照落 `.truth-pre-write.snapshot`，授权范围=单文件） |
| 写 | 仅 addendum 一文件（见上） |
| seal | authorized_drift=**1**（仅 addendum）/ undeclared=0；ZIP 重封 testzip OK；manifest 覆盖集零变化 changed_files=0 |
| 回执 | `2026-11-25T23:34:23+08:00 \| actor=chilun \| note=OI-1 closure … \| authorized_drift=1 \| changed_files=0 \| zip_sha256=fae403853e74ad62cb3b7fd0a0bf0c9c23b4fbcf32907b1db3a402d0c8d4adaf` |
| OD-1 窗口收尾 | `.new` 与锚定 manifest diff exit=0 后删除冗余草稿（OD-1 预记事项，本窗口完成） |
| lock | design-source a-w ✓ |

## Gate 终扫（提交前，2026-11-25 23:35 前后）

`bash scripts/deploy-gate.sh` → **✅ all checks passed**：

- TRUTH MANIFEST PASS（51 files anchored，anti-rollback）
- design source in sync with canonical truth
- 48 route files present（data-driven）
- frozen copy audit PASS（FAQ 串 verbatim 字节在场）
- audit.py sentinel：AUDIT PASS（含 NEGATIVE 防回潮断言）
- 6b 全目录占位扫描：零命中（含 BOFU 4 页）
- legal .fill：zero

## 复核指引

```bash
git log --oneline -3 -- design-source/05-copy-freeze-v1.20-jfif-ctr-addendum.md
grep -n '作废不落' design-source/05-copy-freeze-v1.20-jfif-ctr-addendum.md   # 预期 4 处：§A-5 注记+2行、§D-2 注记+2行
sha256sum design-handoff-v1.zip   # fae40385… == 本报告回执 zip_sha256
python3 design-source/build/truth_manifest.py check   # TRUTH MANIFEST PASS (51 files anchored)
```
