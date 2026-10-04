#!/usr/bin/env python3
"""Generate SYNTHETIC before/after sample assets for the design handoff.
These are placeholders (05-copy §1.7: v1 uses synthetic samples, marked [待确认]).
Each group: *_before.png (degraded input look) + *_after.png (clean flat-color vector look).
"""
from PIL import Image, ImageDraw, ImageFilter
import io, math, os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "samples")
os.makedirs(OUT, exist_ok=True)
W, H = 900, 675

def save_jpg_degraded(img, path, small_w=150, quality=28, blur=0.6):
    """Simulate a low-res compressed client image."""
    r = small_w / img.width
    small = img.resize((small_w, max(1, int(img.height * r))), Image.LANCZOS)
    buf = io.BytesIO()
    small.convert("RGB").save(buf, "JPEG", quality=quality)
    small = Image.open(buf)
    up = small.resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(blur))
    up.save(path)

def canvas(bg=(255, 255, 255)):
    return Image.new("RGB", (W, H), bg)

def grid_bg(img, step=45, color=(230, 232, 236)):
    d = ImageDraw.Draw(img)
    for x in range(0, W, step):
        d.line([(x, 0), (x, H)], fill=color, width=1)
    for y in range(0, H, step):
        d.line([(0, y), (W, y)], fill=color, width=1)
    return img

# ---------- LOW-RES LOGOS ----------
def logo_acme():
    img = canvas(); d = ImageDraw.Draw(img)
    d.polygon([(450,95),(715,248),(715,427),(450,580),(185,427),(185,248)], fill=(31,78,121))
    d.polygon([(450,150),(655,268),(655,407),(450,525),(245,407),(245,268)], fill=(240,143,28))
    d.polygon([(450,205),(595,288),(595,387),(450,470),(305,387),(305,288)], fill=(31,78,121))
    d.rectangle([330,305,570,370], fill=(255,255,255))
    return img

def logo_bean():
    img = canvas(); d = ImageDraw.Draw(img)
    d.ellipse([330,140,570,420], fill=(74,48,32))
    d.ellipse([365,175,535,385], fill=(196,137,88))
    d.arc([395,205,505,355], 90, 270, fill=(74,48,32), width=14)
    d.rectangle([300,460,600,500], fill=(74,48,32))
    d.rectangle([300,520,600,545], fill=(156,102,62))
    return img

def logo_peak():
    img = canvas(); d = ImageDraw.Draw(img)
    d.polygon([(180,540),(420,180),(520,320),(600,220),(760,540)], fill=(38,92,80))
    d.polygon([(420,180),(520,320),(470,320)], fill=(245,245,240))
    d.polygon([(600,220),(680,340),(640,340)], fill=(245,245,240))
    d.ellipse([620,120,700,200], fill=(224,122,58))
    return img

# ---------- UI SCREENSHOTS ----------
def ui_shot(variant):
    img = canvas((244,246,248)); d = ImageDraw.Draw(img)
    # browser chrome
    d.rectangle([60,60,840,615], fill=(255,255,255), outline=(210,214,220), width=2)
    d.rectangle([60,60,840,105], fill=(236,238,241))
    for i, c in enumerate([(238,106,88),(245,196,83),(96,190,120)]):
        d.ellipse([85+i*26,75,99+i*26,89], fill=c)
    d.rectangle([190,72,720,93], fill=(255,255,255), outline=(220,223,228))
    if variant == 0:  # dashboard
        d.rectangle([60,105,220,615], fill=(34,40,54))
        for i in range(5):
            d.rounded_rectangle([80,140+i*52,200,170+i*52], 6, fill=(52,60,80) if i else (224,87,46))
        for i in range(3):
            d.rounded_rectangle([250+i*195,140,425+i*195,260], 10, fill=(247,248,250), outline=(222,226,232))
            d.rectangle([270+i*195,165,340+i*195,178], fill=(120,130,145))
            d.rectangle([270+i*195,195,390+i*195,235], fill=(224,87,46) if i==0 else (36,109,92))
        d.rounded_rectangle([250,290,815,560], 10, fill=(247,248,250), outline=(222,226,232))
        for i in range(6):
            d.rectangle([270,320+i*38,790,344+i*38], fill=(255,255,255), outline=(232,235,240))
    elif variant == 1:  # mobile app screen
        d.rectangle([330,130,570,590], fill=(20,24,32))
        d.rectangle([345,145,555,575], fill=(250,250,252))
        d.rounded_rectangle([365,175,535,215], 8, fill=(36,109,92))
        for i in range(3):
            d.rounded_rectangle([365,240+i*70,535,295+i*70], 10, fill=(238,240,243))
            d.ellipse([378,252+i*70,404,278+i*70], fill=(224,87,46))
            d.rectangle([415,258+i*70,520,270+i*70], fill=(120,128,140))
        d.rounded_rectangle([365,480,535,530], 25, fill=(224,87,46))
    else:  # settings panel
        d.rectangle([90,130,810,590], fill=(255,255,255))
        d.rectangle([90,130,810,175], fill=(250,250,251))
        d.rectangle([110,143,300,162], fill=(60,66,80))
        for i in range(4):
            y = 210 + i*80
            d.rectangle([120,y,420,y+18], fill=(120,128,140))
            on = i % 2 == 0
            d.rounded_rectangle([700,y-6,760,y+26], 16, fill=(36,109,92) if on else (205,210,218))
            d.ellipse([(716 if on else 704),y-2,(740 if on else 728),y+22], fill=(255,255,255))
        d.rounded_rectangle([120,530,320,570], 8, fill=(224,87,46))
    return img

# ---------- LINE ART ----------
def line_art(variant):
    img = canvas((252,251,247)); d = ImageDraw.Draw(img)
    ink = (42,44,52)
    if variant == 0:  # flower
        cx, cy = 450, 340
        for k in range(8):
            a = k * math.pi / 4
            x, y = cx + 150 * math.cos(a), cy + 150 * math.sin(a)
            d.ellipse([x-85, y-85, x+85, y+85], outline=ink, width=9)
        d.ellipse([cx-70, cy-70, cx+70, cy+70], outline=ink, width=9)
        d.line([(cx, cy+70), (cx, 600)], fill=ink, width=9)
        d.arc([cx-120, 470, cx, 560], 180, 300, fill=ink, width=9)
        d.arc([cx, 490, cx+120, 580], 240, 0, fill=ink, width=9)
    elif variant == 1:  # rocket
        d.arc([330,90,570,420], 180, 360, fill=ink, width=10)
        d.line([(330,255),(330,470)], fill=ink, width=10)
        d.line([(570,255),(570,470)], fill=ink, width=10)
        d.polygon([(330,470),(570,470),(450,560)], outline=ink, width=10)
        d.ellipse([405,220,495,310], outline=ink, width=10)
        d.polygon([(330,400),(250,520),(330,470)], outline=ink, width=10)
        d.polygon([(570,400),(650,520),(570,470)], outline=ink, width=10)
    else:  # deer head (angular)
        pts = [(450,140),(380,260),(300,200),(340,330),(380,420),(450,560),(520,420),(560,330),(600,200),(520,260)]
        d.line(pts + [pts[0]], fill=ink, width=10, joint="curve")
        d.line([(380,260),(450,340),(520,260)], fill=ink, width=10)
        d.ellipse([395,330,425,360], fill=ink)
        d.ellipse([475,330,505,360], fill=ink)
        d.polygon([(430,470),(470,470),(450,510)], fill=ink)
    return img

def flat_after(img, colors):
    """Simulate vectorized output: quantize to flat palette, crisp edges, subtle mat grid."""
    q = img.convert("RGB").quantize(colors=colors, method=Image.MEDIANCUT).convert("RGB")
    q = q.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    q = grid_bg(q, step=45, color=(232, 234, 238))
    return q

jobs = [
    ("logo-acme", logo_acme(), 3, 140, 24),
    ("logo-bean", logo_bean(), 4, 130, 22),
    ("logo-peak", logo_peak(), 4, 150, 26),
    ("ui-dashboard", ui_shot(0), 6, None, None),
    ("ui-mobile", ui_shot(1), 5, None, None),
    ("ui-settings", ui_shot(2), 5, None, None),
    ("line-flower", line_art(0), 2, 170, 45),
    ("line-rocket", line_art(1), 2, 160, 40),
    ("line-deer", line_art(2), 2, 175, 42),
]

for name, img, colors, small_w, q in jobs:
    after = flat_after(img, colors)
    after.save(os.path.join(OUT, f"{name}_after.png"), optimize=True)
    if small_w:  # degraded before (logo / scan)
        save_jpg_degraded(img, os.path.join(OUT, f"{name}_before.png"), small_w, q)
    else:  # screenshot before = crisp raster (that's honest: screenshots are clean input)
        img.resize((W, H)).save(os.path.join(OUT, f"{name}_before.png"), optimize=True)
    print("built", name)
print("DONE samples")
