#!/usr/bin/env python3
"""Ink on white -> tinted sprite on alpha. See ../PIPELINE.md for the why."""
import sys
import numpy as np
from PIL import Image

GOLD = (0xFF, 0xD4, 0x5A)          # --q-gold on the live page
GROUND = (0x02, 0x08, 0x06, 255)   # the field ground, for the preview

def sprite(src, out_base, tint=GOLD, margin=24):
    im = Image.open(src).convert('RGB')
    lum = np.asarray(im).astype(int).mean(axis=2)
    # 0.85 keeps hatch lines crisp; linear alpha greys them out
    alpha = (((255 - lum) / 255.0) ** 0.85 * 255).clip(0, 255).astype('uint8')
    ys, xs = np.where(alpha > 24)
    if len(xs) == 0:
        raise SystemExit(f'empty sprite: {src}')
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    x0, y0 = max(0, x0 - margin), max(0, y0 - margin)
    x1, y1 = min(im.size[0] - 1, x1 + margin), min(im.size[1] - 1, y1 + margin)
    side = max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    bx, by = max(0, cx - side // 2), max(0, cy - side // 2)
    box = (bx, by, min(im.size[0], bx + side), min(im.size[1], by + side))
    rgba = np.zeros((*lum.shape, 4), 'uint8')
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = tint
    rgba[..., 3] = alpha
    sp = Image.fromarray(rgba, 'RGBA').crop(box)
    for size in (1024, 256, 96):
        sp.resize((size, size), Image.LANCZOS).save(f'{out_base}-{size}.png')
    bg = Image.new('RGBA', (1024, 1024), GROUND)
    bg.alpha_composite(sp.resize((1024, 1024), Image.LANCZOS))
    bg.convert('RGB').save(f'{out_base}-preview.png')
    return side

if __name__ == '__main__':
    for name in sys.argv[1:]:
        print(name, 'side', sprite(f'{name}.png', name))
