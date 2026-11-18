#!/usr/bin/env python3
"""Real screens of the app, as the phone on the site shows them.

Raw iPhone screenshots (1320 x 2868, the whole screen with its status bar)
go in as <src>/<lang>/<name>.png and come out as img/app/<lang>/<name>.webp
at 720 px wide: the largest phone on the page is about 340 CSS px across,
so 720 covers a 2x display and stays near 100 KB. The picture is not cropped
or framed: the frame is drawn by the page (.device in assets/styles.css), and
a screen of the iPhone's own 9 : 19.5 fills it exactly, status bar and all.

    python3 tools/app-shots.py [/tmp/claude-0/shots/site] [--width 720]
"""
import sys, os, glob
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith('--')]
src = args[0] if args else '/tmp/claude-0/shots/site'
width = 720
if '--width' in sys.argv:
    width = int(sys.argv[sys.argv.index('--width') + 1])
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img', 'app')

done = 0
for path in sorted(glob.glob(os.path.join(src, '*', '*.png'))):
    lang = os.path.basename(os.path.dirname(path))
    name = os.path.splitext(os.path.basename(path))[0]
    im = Image.open(path).convert('RGB')
    ratio = im.height / im.width
    if abs(ratio - 2868 / 1320) > 0.03:
        print(f'  ! {lang}/{name}: {im.width}x{im.height} is not a 9:19.5 phone screen, skipped')
        continue
    im = im.resize((width, round(width * ratio)), Image.LANCZOS)
    os.makedirs(os.path.join(root, lang), exist_ok=True)
    dst = os.path.join(root, lang, name + '.webp')
    im.save(dst, 'WEBP', quality=82, method=6)
    done += 1
    print(f'{os.path.getsize(dst)//1024:4d} KB  img/app/{lang}/{name}.webp')
print(f'{done} screen(s) written')
