"""
Genera las texturas de las etiquetas a partir de las fotos de labels-src/.

    python3 scripts/make_labels.py

- pritty-etiqueta.jpg: banda envolvente 3:1. El frente sale de la foto, "desenrollado" (se corrige la curvatura del
  cilindro); el resto de la vuelta es dorado inventado con las bandas verdes.
- toro-frente.jpg: el frente del brik enderezado (perspectiva) y sin la marca de agua de la foto.
- toro-dorso.jpg y toro-lateral.jpg: inventados con el mismo estilo (franja roja con parras, crema, banda oscura).

Las caras del brik van en 5:9 (frente/dorso) y 466:1296 (laterales), como los paneles de src/scene/Box.tsx.
"""

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'labels-src'
OUT = ROOT / 'src' / 'assets' / 'labels'
SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
NARROW = '/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf'


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def smooth(a, b, x):
    t = min(1, max(0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- Pritty
def pritty():
    src = Image.open(SRC / 'pritty-foto.jpg').convert('RGB')
    # medidas de la etiqueta en la foto (px): eje, radio y bordes de la banda
    cx, r, y0, y1 = 296.0, 67.0, 248, 396
    w, h = 1536, 512

    # fondo dorado: mismos tonos que la foto, con cepillado
    stops = [(0, (178, 158, 66)), (0.12, (226, 212, 128)), (0.25, (244, 234, 168)), (0.38, (206, 188, 92)),
             (0.5, (184, 164, 72)), (0.62, (206, 188, 92)), (0.75, (244, 234, 168)), (0.88, (226, 212, 128)),
             (1, (178, 158, 66))]
    bg = Image.new('RGB', (w, h))
    px = bg.load()
    for x in range(w):
        f = x / (w - 1)
        for i in range(len(stops) - 1):
            if stops[i][0] <= f <= stops[i + 1][0]:
                c = lerp(stops[i][1], stops[i + 1][1], (f - stops[i][0]) / (stops[i + 1][0] - stops[i][0]))
                break
        for y in range(h):
            px[x, y] = c
    d = ImageDraw.Draw(bg, 'RGBA')
    rnd = random.Random(3)
    for _ in range(2600):
        x, y = rnd.random() * w, rnd.random() * h
        col = (255, 248, 210) if rnd.random() < 0.5 else (110, 90, 30)
        d.line([(x, y), (x + 60 + rnd.random() * 200, y)], fill=col + (int(8 + rnd.random() * 14),))

    # frente: la foto desenrollada, centrada en x = w/2, con bordes fundidos
    strip = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for u in range(w):
        th = (u - w / 2) / w * 2 * math.pi
        deg = math.degrees(th)
        if not -64 < deg < 71:
            continue
        x = cx + r * math.sin(th)
        col = src.transform((1, h), Image.EXTENT, (x - 0.5, y0, x + 0.5, y1), Image.BICUBIC)
        a = smooth(-64, -53, deg) * (1 - smooth(64, 71, deg))
        col = col.convert('RGBA')
        col.putalpha(int(255 * a))
        strip.paste(col, (u, 0))
    strip = strip.filter(ImageFilter.UnsharpMask(radius=2.2, percent=90, threshold=2))
    bg.paste(strip, (0, 0), strip)

    # bandas verdes parejas en toda la vuelta
    d = ImageDraw.Draw(bg, 'RGBA')
    for top, bot in ((0, int(h * 0.07)), (int(h * 0.915), h)):
        for y in range(top, bot):
            t = (y - top) / max(1, bot - top - 1)
            d.line([(0, y), (w, y)], fill=lerp((86, 140, 34), (128, 182, 52), 1 - abs(t - 0.5) * 2) + (255,))
    d.line([(0, int(h * 0.07)), (w, int(h * 0.07))], fill=(255, 255, 230, 90), width=2)
    d.line([(0, int(h * 0.915) - 1), (w, int(h * 0.915) - 1)], fill=(255, 255, 230, 90), width=2)
    bg.save(OUT / 'pritty-etiqueta.jpg', quality=90)


# ---------------------------------------------------------------- Toro
FW, FH = 720, 1296
BAND = (46, 52, 66)
CREAM = (226, 221, 200)
WINE = (168, 38, 40)
INK = (28, 28, 34)
BAND_V = 0.936  # dónde empieza la banda oscura de abajo


def toro_front():
    src = Image.open(SRC / 'toro-frente-foto.jpg').convert('RGB')
    # esquinas de la cara en la foto: arriba-izq, abajo-izq, abajo-der, arriba-der
    quad = (42.5, 47.5, 50, 565, 320, 565, 325, 46)
    face = src.transform((FW, FH), Image.QUAD, quad, Image.BICUBIC)
    face = face.filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=2))
    d = ImageDraw.Draw(face)
    # la marca de agua de la foto tapa la punta derecha de la banda: se repinta con el color de la propia banda
    by = int(FH * BAND_V)
    band = face.crop((int(FW * 0.55), by + 10, int(FW * 0.7), FH - 10)).resize((1, 1), Image.BOX).getpixel((0, 0))
    d.rectangle([int(FW * 0.74), by, FW, FH], fill=band)
    f = ImageFont.truetype(NARROW, 26)
    for i, t in enumerate(('INDUSTRIA', 'ARGENTINA')):
        tw = d.textlength(t, font=f)
        d.text((FW - 26 - tw, by + 14 + i * 28), t, font=f, fill=(214, 214, 220))
    face.save(OUT / 'toro-frente.jpg', quality=90)
    return face


def vines(face, w, h):
    """Franja roja con parras sacada del frente (por encima del arco)."""
    top = face.crop((0, 0, FW, int(FH * 0.25)))
    k = max(w / top.width, h / top.height)  # cubre todo el alto, recorta a lo ancho
    top = top.resize((round(top.width * k), round(top.height * k)), Image.LANCZOS)
    x = (top.width - w) // 2
    return top.crop((x, 0, x + w, h))


def barcode(d, x, y, bw, bh, seed):
    rnd = random.Random(seed)
    d.rectangle([x - 14, y - 12, x + bw + 14, y + bh + 40], fill=(255, 255, 255))
    xx = x
    while xx < x + bw:
        k = 2 + rnd.randrange(4)
        if rnd.random() > 0.42:
            d.rectangle([xx, y, xx + k - 1, y + bh], fill=INK)
        xx += k + 1 + rnd.randrange(2)
    f = ImageFont.truetype(NARROW, 20)
    t = '7 790000 000000'
    d.text((x + (bw - d.textlength(t, font=f)) / 2, y + bh + 10), t, font=f, fill=INK)


def center(d, y, text, font, fill, w=FW):
    d.text(((w - d.textlength(text, font=font)) / 2, y), text, font=font, fill=fill)


def toro_back(face):
    img = Image.new('RGB', (FW, FH), CREAM)
    vh = int(FH * 0.25)
    img.paste(vines(face, FW, vh), (0, 0))
    img.paste(face.crop((0, int(FH * BAND_V), FW, FH)), (0, int(FH * BAND_V)))
    d = ImageDraw.Draw(img)
    d.line([(0, vh), (FW, vh)], fill=(120, 30, 30), width=3)
    d.line([(36, vh + 14), (FW - 36, vh + 14)], fill=(150, 120, 90), width=1)
    center(d, vh + 50, 'TORO', ImageFont.truetype(SERIF, 112), INK)
    center(d, vh + 180, 'VINO TINTO', ImageFont.truetype(SERIF, 46), WINE)
    d.line([(FW / 2 - 120, vh + 250), (FW / 2 + 120, vh + 250)], fill=(150, 120, 90), width=2)
    # letra chica ilegible
    rnd = random.Random(23)
    y = vh + 290
    while y < FH * 0.6:
        for k in range(4):
            ln = 0.6 + rnd.random() * 0.3 if k == 3 else 0.86 + rnd.random() * 0.14
            d.rectangle([60, y, 60 + (FW - 120) * ln, y + 9], fill=(150, 142, 124))
            y += 24
        y += 22
    f = ImageFont.truetype(NARROW, 24)
    center(d, FH * 0.69, 'BEBER CON MODERACIÓN', f, INK)
    center(d, FH * 0.69 + 32, 'PROHIBIDA SU VENTA A MENORES DE 18 AÑOS', f, INK)
    barcode(d, FW / 2 - 130, FH * 0.775, 260, 110, 7)
    img.save(OUT / 'toro-dorso.jpg', quality=90)


def toro_side(face):
    w, h = 466, FH
    img = Image.new('RGB', (w, h), CREAM)
    vh = int(h * 0.25)
    img.paste(vines(face, w, vh), (0, 0))
    img.paste(face.crop((0, int(FH * BAND_V), w, FH)).resize((w, FH - int(FH * BAND_V))), (0, int(h * BAND_V)))
    d = ImageDraw.Draw(img)
    d.rectangle([0, int(h * BAND_V), w, h], fill=BAND)
    d.line([(0, vh), (w, vh)], fill=(120, 30, 30), width=3)
    # "TORO" vertical, leído de abajo hacia arriba
    word = Image.new('RGBA', (int(h * 0.62), 150), (0, 0, 0, 0))
    wd = ImageDraw.Draw(word)
    center(wd, 4, 'TORO', ImageFont.truetype(SERIF, 136), INK, word.width)
    word = word.rotate(90, expand=True)
    img.paste(word, ((w - word.width) // 2 - 40, vh + 40), word)
    f = ImageFont.truetype(NARROW, 26)
    vt = Image.new('RGBA', (int(h * 0.62), 40), (0, 0, 0, 0))
    center(ImageDraw.Draw(vt), 4, 'VINO TINTO · 1 LITRO', f, WINE, vt.width)
    vt = vt.rotate(90, expand=True)
    img.paste(vt, ((w + word.width) // 2 - 10, vh + 40), vt)
    img.save(OUT / 'toro-lateral.jpg', quality=90)


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    pritty()
    f = toro_front()
    toro_back(f)
    toro_side(f)
    print('ok:', ', '.join(sorted(p.name for p in OUT.iterdir())))
