# P0-5b · JFIF 集群 before/after 截图素材 — ALT 终稿与交付说明

工单来源：`/home/ubuntu/demand-signals/2026-09-22-format-friction/05-copy-freeze-v1.20-jfif-ctr-addendum.md` §E
执行：moyun ｜ 督办：wangduoyu ｜ QA：齿轮
落点：`/home/ubuntu/projects/cleanpaths/public/assets/jfif-ctr/`（真源 design-source 为只读 seal 锁定 555，未触碰；素材按 public/assets 站点素材惯例落位，`/assets/jfif-ctr/png/...` 即页面引用路径）

## 合成声明（红线合规）
- 全部素材为 **HTML/CSS 合成系统 UI**，headless Chromium（Playwright 1.58 视口截图）渲染，无任何网上扒取的真实截图。
- 预览内容为合成风景占位（SVG 山景/太阳/草地），**零真人头像/零真实个人照片**。
- 文件名全部示例名（photo.jfif / foto.jfif / banner-2024.png / flyer-draft.pdf / folheto-rascunho.pdf）。
- Windows 11 界面文案：EN/pt-BR 系统词（Type/Tipo、Open with/Abrir com、日期格式、小数逗号）按系统惯例合成。

## §E 逐项对照 + ALT 终稿

### #1 /jfif-to-jpg/ FAQ①旁（explainer 位）· P0
| 文件 | 内容 | ALT 终稿 |
|---|---|---|
| `png/jfif-to-jpg-faq1-before.png` | Win11 资源管理器：photo.jfif，Type=JFIF File | `Windows Explorer showing photo.jfif before renaming to photo.jpg` |
| `png/jfif-to-jpg-faq1-after.png` | 同列表：photo.jpg，Type=JPG File | `Windows Explorer showing photo.jpg after renaming from photo.jfif` |

（#1 before alt = §E 原建议逐字；after 为同词域派生，rename 词来自 FAQ② 冻结串 "Rename .jfif to .jpg"。）

### #2 /jfif-to-jpg/ 转换器/结果区 · P0
| 文件 | 内容 | ALT 终稿 |
|---|---|---|
| `png/jfif-to-jpg-converter-before.png` | dropzone 拖入态：INPUT 预览 + photo.jfif chip + `ACCEPTS: .JFIF · PROCESSED LOCALLY` | `JFIF dropped in converter — input preview state` |
| `png/jfif-to-jpg-converter-after.png` | 结果态：INPUT/OUTPUT PREVIEW + `Download JPG` + 徽标行 `No upload. No account. No watermark. Free, 10 conversions a day.` | `Resulting JPG download state with the Download JPG button` |

（徽标行为页面真实在页串；"This page accepts .JFIF" 的页面真身即 `ACCEPTS: .JFIF · PROCESSED LOCALLY`。）

### #3 /jfif-to-png/ FAQ②旁 · P1
| 文件 | 内容 | ALT 终稿 |
|---|---|---|
| `png/jfif-to-png-faq2-before.png` | Win11 属性对话框 photo Properties：Type=JFIF File (.jfif)、Opens with=Photos、Size=24.3 KB | `File properties dialog showing JFIF type (.jfif)` |
| `png/jfif-to-png-faq2-after.png` | PNG 结果卡：Download PNG + 透明度注记（FAQ 冻结句 "…no alpha channel to carry over — the PNG keeps the same solid pixels."） | `Converted PNG preview with transparency note — same solid pixels, no added transparency` |

### #4 /pt/jfif-para-jpg/ FAQ①旁（pt-BR locale）· P1
| 文件 | 内容 | ALT 终稿 |
|---|---|---|
| `png/pt-jfif-para-jpg-faq1-before.png` | Win11 pt-BR：foto.jfif，Tipo=Arquivo JFIF | `Explorador do Windows mostrando foto.jfif antes de renomear para foto.jpg` |
| `png/pt-jfif-para-jpg-faq1-after.png` | 同列表：foto.jpg，Tipo=Arquivo JPG | `Explorador do Windows mostrando foto.jpg depois de renomear de foto.jfif` |

### #5 /pt/jfif-para-png/ FAQ②旁（pt-BR locale）· P1
| 文件 | 内容 | ALT 终稿 |
|---|---|---|
| `png/pt-jfif-para-png-faq2-before.png` | 属性对话框 Propriedades de foto：Tipo=Arquivo JFIF (.jfif)、Abrir com=Fotos、Tamanho=24,3 KB | `Propriedades do arquivo mostrando o tipo JFIF (.jfif)` |
| `png/pt-jfif-para-png-faq2-after.png` | PNG 结果卡（pt-BR 界面词）：Baixar PNG + 透明度注记 "Não. JFIF/JPEG não armazena transparência…" + 底行 PT 真身 `Sem upload. Sem cadastro. Sem marca d'água. Grátis, 10 conversões por dia.` | `Pré-visualização PNG convertida no conversor de JFIF para PNG — nota de transparência` |

### #6 两 EN 页共用 hero/proof · P2（可选增强，已做）
| 文件 | 内容 | ALT 终稿 |
|---|---|---|
| `png/jfif-en-shared-uploadform-pair.png` | 一张双联（§E 字面）：左 mock 表单拒 .jfif（红警示 Unsupported file type）→ 右 .jpg 成功；右上角 `ILLUSTRATIVE EXAMPLE — MOCK-UP FORM` 标注 | `Upload form rejecting .jfif versus accepting converted .jpg` |

（命名按 §E 内容定义用 `-pair` 后缀：本项 §E 明确"一张双联 before/after"，无独立 before/after 单图。）

## 规格与验收
- 11 张 PNG，全部 **1200×750 @1x**，机器自检通过：尺寸 ✓、无白带（历史 headless 截图 87px 缺口问题已用视口级截图管线规避）✓、DOM 冻结串断言 ✓、零溢出 ✓。
- 文案域一致性：转换器卡全部组件词（eyebrow / dz-formats / badges / Download JPG / Baixar PNG / INPUT / OUTPUT PREVIEW / 徽标行 / 透明度注记 EN+PT）逐字取自 design-source 页面真身；PT 资源管理器/属性框用 pt-BR 系统词；未自创关键词。

## 复渲染
```
cd /home/ubuntu/projects/cleanpaths/public/assets/jfif-ctr/mock
python3 build_mocks.py     # 重写 6 个 mock HTML + 重新渲染 11 张 PNG
python3 qa_dom_check.py    # 冻结串断言 + 溢出机检
```
依赖：playwright（chromium）、Noto Sans + Noto Color Emoji（系统字体，Windows UI 模拟）；站内字体经 file:// 绝对路径引用 `public/assets/fonts/`（迁移目录时同步修改 mocks_common.py 中 CP 路径）。

## 交接给 chuangkou（落位批）
- 页面引用路径：`/assets/jfif-ctr/png/<文件名>.png`
- alt 随图入档：上表「ALT 终稿」列直接复制，en-US 页用 EN alt、pt-BR 页用 PT alt。
- #6 双联图建议落点：两 EN 页 hero/proof 区（§E P2 可选，可按落位批裁量取舍）。
