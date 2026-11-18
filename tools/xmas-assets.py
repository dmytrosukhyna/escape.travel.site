#!/usr/bin/env python3
"""Christmas season pictures for the site, taken from the app's own assets.

The garlands, Santa, the sleigh and the winter photographs were made for the
app (apps/mobile/assets/christmas, see its ASSETS.md) and are ours. They are
only resized and re-encoded here: nothing is redrawn, and the owner's own
launch picture is used exactly as he made it.

    python3 tools/xmas-assets.py /path/to/Escape.travel.app
"""
import sys, os
from PIL import Image

app = sys.argv[1] if len(sys.argv) > 1 else '/home/user/Escape.travel.app'
src = os.path.join(app, 'apps/mobile/assets')
out = os.path.join(os.path.dirname(__file__), '..', 'img', 'xmas')
os.makedirs(out, exist_ok=True)

JOBS = [  # source, output name, width, quality
  ('christmas/decorations/corner-branch.png',    'branch',       520, 84),
  ('christmas/decorations/holly-bow.png',        'holly',        240, 84),
  ('christmas/mascot/santa.png',                 'santa',        520, 86),
  ('christmas/mascot/santa-wave-body.png',       'santa-body',   620, 86),
  ('christmas/mascot/santa-wave-hand.png',       'santa-hand',   620, 86),
  ('christmas/mascot/sleigh.png',                'sleigh',       700, 86),
  ('christmas/photos/snowy-peaks.jpg',           'ski',          760, 80),
  ('christmas/photos/chalet-village.jpg',        'cosy',         760, 80),
  ('christmas/photos/christmas-market.jpg',      'market',       760, 80),
  ('christmas/photos/near-stay.jpg',             'spa',          600, 82),
  ('launch-christmas.jpg',                       'launch',       720, 86),
]

for rel, name, w, q in JOBS:
    im = Image.open(os.path.join(src, rel))
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    dst = os.path.join(out, name + '.webp')
    im.save(dst, 'WEBP', quality=q, method=6)
    print(f'{os.path.getsize(dst)//1024:5d} KB  {im.width}x{im.height}  img/xmas/{name}.webp')

# The two strands of lights the app hangs along its tab bar, joined into one
# swag: both outer ends sit on the top edge, so the pair repeats across any
# width without a break in the wire.
L = Image.open(os.path.join(src, 'christmas/decorations/bar-lights-left.png')).convert('RGBA')
R = Image.open(os.path.join(src, 'christmas/decorations/bar-lights-right.png')).convert('RGBA')
pair = Image.new('RGBA', (L.width + R.width, max(L.height, R.height)))
pair.paste(L, (0, 0)); pair.paste(R, (L.width, 0))
dst = os.path.join(out, 'garland.webp')
pair.save(dst, 'WEBP', quality=88, method=6)
print(f'{os.path.getsize(dst)//1024:5d} KB  {pair.width}x{pair.height}  img/xmas/garland.webp')
