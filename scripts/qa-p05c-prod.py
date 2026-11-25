#!/usr/bin/env python3
"""P0-5c production QA — 9 assertions per PROMPT_chuangkou_12_p05c_jfif_ctr_landing."""
import json, re, sys, time, urllib.request, html as H

BASE = 'https://cleanpaths.io'
ROUTES = ['jfif-to-jpg', 'jfif-to-png', 'pt/jfif-para-jpg', 'pt/jfif-para-png']
ADD = open('/home/ubuntu/projects/cleanpaths/design-source/05-copy-freeze-v1.20-jfif-ctr-addendum.md', encoding='utf-8').read().replace('\\|', '|')
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) qa-p05c'}

def get(path, rt='text'):
    req = urllib.request.Request(BASE + path, headers=UA)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.status, (r.read().decode('utf-8', 'replace') if rt == 'text' else None), (r.status if rt != 'text' else None)

def retry_get(path):
    for i in range(3):
        try:
            return get(path)
        except Exception as e:
            print(f'  retry {i+1} {path}: {e}')
            time.sleep(30)
    raise RuntimeError(f'give up {path}')

fails = []
def check(name, ok, detail=''):
    print(f'  [{"PASS" if ok else "FAIL"}] {name}' + (f' — {detail}' if detail else ''))
    if not ok: fails.append(name)

print('== fetch 4 production pages ==')
pages = {}
for r in ROUTES:
    st, body, _ = retry_get(f'/{r}/')
    pages[r] = (st, body)
    check(f'GET /{r}/ == 200', st == 200, str(st))

print('== A1: FAQPage mainEntity counts 4/4/7/9 + verbatim vs addendum ==')
EXPECT = {'jfif-to-jpg': 4, 'jfif-to-png': 4, 'pt/jfif-para-jpg': 7, 'pt/jfif-para-png': 9}
for r, n in EXPECT.items():
    s = pages[r][1]
    ok_count = None; details = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try: j = json.loads(m.group(1))
        except Exception: continue
        if isinstance(j, list): j = next((x for x in j if isinstance(x, dict) and x.get('@type') == 'FAQPage'), None)
        if isinstance(j, dict) and j.get('@type') == 'FAQPage':
            qs = j['mainEntity']; ok_count = len(qs) == n
            details = [(q.get('name', ''), re.sub(r'<[^>]+>', '', (q.get('acceptedAnswer') or {}).get('text', ''))) for q in qs]
    check(f'{r}: mainEntity=={n}', ok_count is True and details, f'got {len(details)}')
    if r.startswith('pt/'):
        new_qs = [q for q, a in details if q in ADD]
        check(f'{r}: 新增 Q verbatim in v1.20（≥2 对）', len(new_qs) >= 2, f'{len(new_qs)} of {len(details)}（其余为 v1.10/v1.18 既有串，克制保留）')
    else:
        new_verbatim = all(q in ADD for q, a in details)
        check(f'{r}: all Q names verbatim in v1.20 addendum', new_verbatim)

print('== A2: ④Q full form present ==')
for r in ['jfif-to-jpg', 'jfif-to-png']:
    check(f'{r}: ④Q full form（EN 域）', 'Do you upload or store my files?' in pages[r][1])
for r in ['pt/jfif-para-jpg', 'pt/jfif-para-png']:
    vis = re.sub(r'<script[^>]*>.*?</script>', '', pages[r][1], flags=re.S)
    check(f'{r}: PT 对应④=PT 串在场且零英文④残留（克制）',
          'Meu arquivo é enviado para algum servidor?' in pages[r][1] and 'Do you upload or store my files?' not in vis)

print('== A3: NEGATIVE 判删串零回潮 ==')
NEG = ['Is JFIF the same as JPG?', 'Do you upload my files?',
       'There is no account, no watermark, and no file upload.', 'It does not normalize metadata',
       'Precision', 'Tracing paths', 'Download DXF', 'AI HD rescue', 'How to open a JFIF file',
       'Is there a JFIF viewer?', 'Is there a limit?', 'Is a JFIF file the same as a JPEG?',
       'Will converting JFIF to JPG reduce quality?', 'Will the PNG have a transparent background?']
all4 = '\n'.join(pages[r][1] for r in ROUTES)
for neg in NEG:
    check(f'NEG zero: {neg[:44]!r}', neg not in all4)

print('== A4: PT 克制 — 既有 5/7 对 Q 名在生产在场 + META 未动 ==')
PT_OLD = {
 'pt/jfif-para-jpg': ['O que é um arquivo JFIF?', 'A conversão para JPG reduz a qualidade?',
                      'Meu arquivo é enviado para algum servidor?', 'Preciso criar conta?', 'Tem limite de uso?'],
 'pt/jfif-para-png': ['O que é um arquivo JFIF?', 'Como abrir um arquivo JFIF', 'A conversão para PNG reduz a qualidade?',
                      'O PNG terá fundo transparente?', 'Por que PNG em vez de JPG?',
                      'Meu arquivo é enviado para algum servidor?', 'Tem limite de uso?'],
}
for r, old in PT_OLD.items():
    missing = [q for q in old if q not in pages[r][1]]
    check(f'{r}: 既有 {len(old)} Q 全在场', not missing, f'missing={missing}')
    check(f'{r}: 新增①在场', 'Por que o Windows mostra meu JPG como arquivo JFIF?' in pages[r][1])

print('== A5: 保留 pin（H1/徽章/mono 行）在场 ==')
PINS = {
 'jfif-to-jpg': ['JFIF to JPG (JPEG) Converter — Free, No Upload',
                 'No upload. No account. No watermark. Free, 10 conversions a day.'],
 'jfif-to-png': ['JFIF to PNG Converter — Free, No Upload'],
}
for r, pins in PINS.items():
    for p in pins:
        check(f'{r}: pin {p[:40]!r}', p in pages[r][1])

print('== A6: 11 PNG 生产 200 + alt/lazy/dims ==')
IMGS = ['jfif-en-shared-uploadform-pair', 'jfif-to-jpg-faq1-before', 'jfif-to-jpg-faq1-after',
        'jfif-to-jpg-converter-before', 'jfif-to-jpg-converter-after', 'jfif-to-png-faq2-before',
        'jfif-to-png-faq2-after', 'pt-jfif-para-jpg-faq1-before', 'pt-jfif-para-jpg-faq1-after',
        'pt-jfif-para-png-faq2-before', 'pt-jfif-para-png-faq2-after']
for img in IMGS:
    st, _, _ = retry_get(f'/assets/jfif-ctr/png/{img}.png')
    check(f'img {img}.png == 200', st == 200, str(st))
img_tags = re.findall(r'<img[^>]+>', all4)
wired = [t for t in img_tags if '/assets/jfif-ctr/png/' in t]
srcs = set(re.search(r'src="([^"]+)"', t).group(1) for t in wired)
pair_n = sum(1 for t in wired if 'uploadform-pair' in t)
check('wired <img> tags == 12（pair 双联×2，其余 10）', len(wired) == 12 and pair_n == 2, f'tags={len(wired)} pair={pair_n}')
check('unique img src == 11', len(srcs) == 11, f'got {len(srcs)}')
check('all wired imgs lazy+1200x750', all('loading="lazy"' in t and 'width="1200"' in t and 'height="750"' in t for t in wired))
ALT = open('/home/ubuntu/projects/cleanpaths/public/assets/jfif-ctr/ALT.md', encoding='utf-8').read()
bad_alt = [t for t in wired if H.unescape(re.search(r'alt="([^"]*)"', t).group(1)) not in ALT]
check('all alts verbatim from ALT.md', not bad_alt, f'bad={len(bad_alt)}')

print('== A7: 内链成环 + D-4 防稀释 ==')
check('EN-JPG endpoint → /jpeg-to-jpg/', 'href="/jpeg-to-jpg/"' in pages['jfif-to-jpg'][1])
check('EN-PNG endpoint → /webp-to-png/', 'href="/webp-to-png/"' in pages['jfif-to-png'][1])
check('EN-JPG FAQ② → /jfif-to-png/', '/jfif-to-png/' in pages['jfif-to-jpg'][1])
check('EN-PNG FAQ② → /jfif-to-jpg/', '/jfif-to-jpg/' in pages['jfif-to-png'][1])
check('PT-JPG FAQ② → /pt/jfif-para-png/', '/pt/jfif-para-png/' in pages['pt/jfif-para-jpg'][1])
check('PT-PNG FAQ② → /pt/jfif-para-jpg/', '/pt/jfif-para-jpg/' in pages['pt/jfif-para-png'][1])
for guard_r in ['webp-to-png', 'svg-to-png']:
    st, body, _ = retry_get(f'/{guard_r}/')
    check(f'{guard_r} == 200', st == 200, str(st))
    check(f'{guard_r}: D-4 零新增反挂（无 jfif FAQ② 串/endpoint 串）',
          'Other formats giving you trouble?' not in body and 'Already have a .jpeg?' not in body
          and 'Por que o Windows mostra' not in body)

print('== A8: sitemap 48 零变化 + 旧路由回归 ==')
st, sm, _ = retry_get('/sitemap.xml')
locs = re.findall(r'<loc>(.*?)</loc>', sm)
check('sitemap loc == 48', len(locs) == 48, f'got {len(locs)}')
check('sitemap jfif 4 路由在场', all(any(f'/{r}' in l for l in locs) for r in ROUTES))
OLD = ['/', '/pricing/', '/samples/', '/png-to-dxf/', '/jpg-to-dxf/', '/jpeg-to-jpg/', '/webp-to-png/', '/pt/']
for o in OLD:
    st, _, _ = retry_get(o)
    check(f'GET {o} == 200', st == 200, str(st))

print('== A9: META 长度渲染口径 ≤60/≤150 ==')
for r in ['jfif-to-jpg', 'jfif-to-png']:
    s = pages[r][1]
    t = H.unescape(re.search(r'<title>(.*?)</title>', s).group(1))
    d = H.unescape(re.search(r'name="description" content="([^"]*)"', s).group(1))
    check(f'{r}: T {len(t)}≤60 + D {len(d)}≤150', len(t) <= 60 and len(d) <= 150)
    check(f'{r}: T 冻结串在场', t in ADD, t)

print()
if fails:
    print(f'QA RESULT: {len(fails)} FAIL ->'); [print('  -', f) for f in fails]; sys.exit(1)
print('QA RESULT: ALL 9 ASSERTIONS GREEN (production)')
