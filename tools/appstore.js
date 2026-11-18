#!/usr/bin/env node
/* ===========================================================================
   App Store screenshots, built from the app's own screens.

   The pictures in img/app/<lang>/ are captures of the real app, so these are
   the real thing in a frame rather than a drawing of it — which is what App
   Review Guideline 2.3.3 asks for. The captions are the site's own alt text
   for those same screens (the shot* keys), so they are already translated into
   every language the app ships in, and they already describe what is on the
   screen rather than selling something that is not.

   One caveat, and it is the only one: those captures are 640px wide. Blown up
   to fill a 1320px frame they are noticeably soft. Re-export them from the
   simulator at device resolution and drop them in the same folders — this tool
   will pick them up and the output gets sharp with no other change.

   Sizes: 6.9" is 1320 x 2868 and 6.5" is 1284 x 2778. Both are laid out at a
   third of those numbers and photographed at 3x, so the files land exactly on
   the sizes App Store Connect asks for.
   =========================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'appstore');
const SIZES = [
  { name: '6.9', w: 440, h: 956, dpr: 3 },   // 1320 x 2868
  { name: '6.5', w: 428, h: 926, dpr: 3 }    // 1284 x 2778
];
const LANGS = ['ru', 'uk', 'en', 'el', 'hr', 'es'];

/* Each frame: the app screen to show, and the dictionary key that captions it. */
const FESTIVE = [
  { shot: 'christmas',    cap: 'shotXmas' },
  { shot: '01-home',      cap: 'shotHome' },
  { shot: '05-assistant', cap: 'shotAssistant' },
  { shot: '06-plan',      cap: 'shotPlan' },
  { shot: '07-companion', cap: 'shotCompanion' }
];
/* Used for a language whose New Year screen has not been captured yet: every
   one of these is a genuinely localised picture. */
const PLAIN = [
  { shot: '01-home',      cap: 'shotHome' },
  { shot: '05-assistant', cap: 'shotAssistant' },
  { shot: '06-plan',      cap: 'shotPlan' },
  { shot: '07-companion', cap: 'shotCompanion' },
  { shot: '10-meteora',   cap: 'shotMeteora' }
];

/* A screen that is byte-for-byte the Russian one has not been localised, and
   putting it in a Spanish listing would show a Spanish reader a Russian app. */
function localised(lang, shot) {
  if (lang === 'ru') return true;
  const mine = path.join(ROOT, 'img/app', lang, shot + '.webp');
  const ru = path.join(ROOT, 'img/app/ru', shot + '.webp');
  if (!fs.existsSync(mine)) return false;
  const h = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
  return h(mine) !== h(ru);
}

/* The same evening the site runs on, in five steps. */
const SKY = [
  { bg: 'linear-gradient(176deg,#FBF7F0,#F4D5B1)', ink: '#0B1533', sub: '#3C4668' },
  { bg: 'linear-gradient(176deg,#F3CFA8,#E09B7E)', ink: '#0B1533', sub: '#43304A' },
  { bg: 'linear-gradient(176deg,#D98A72,#6E3A4B)', ink: '#FFFFFF', sub: '#F6DFD8' },
  { bg: 'linear-gradient(176deg,#4A2B42,#241934)', ink: '#FFFFFF', sub: '#DCC9DA' },
  { bg: 'linear-gradient(176deg,#1C1733,#070E24)', ink: '#FFFFFF', sub: '#C3C9E4' }
];

function dict() {
  const g = {};
  const src = fs.readFileSync(path.join(ROOT, 'assets/i18n.js'), 'utf8');
  new Function('window', src)(g);
  if (!g.I18N) throw new Error('could not read assets/i18n.js');
  return g.I18N;
}

function page(lang, sz, i, I, frames) {
  const f = frames[i], sky = SKY[i];
  const cap = (I[lang] && I[lang][f.cap]) || (I.en && I.en[f.cap]) || '';
  const shot = `file://${path.join(ROOT, 'img/app', lang, f.shot + '.webp')}`;
  const garland = `file://${path.join(ROOT, 'img/xmas/garland.webp')}`;
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8">
<link rel="stylesheet" href="file://${path.join(ROOT, 'assets/fonts.css')}">
<link rel="stylesheet" href="file://${path.join(ROOT, 'assets/styles.css')}">
<style>
  html,body{margin:0;padding:0;background:${sky.bg.match(/#\w+/g).pop()}}
  .shot{
    position:relative;width:${sz.w}px;height:${sz.h}px;overflow:hidden;isolation:isolate;
    display:flex;flex-direction:column;align-items:center;background:${sky.bg};
    font-family:var(--font-ui);
  }
  .shot__garland{
    position:absolute;top:-6px;left:-4%;width:108%;z-index:4;pointer-events:none;
    filter:drop-shadow(0 3px 12px rgba(255,150,60,.3));
  }
  .shot__snow{position:absolute;inset:0;z-index:2;pointer-events:none}
  .shot__cap{padding:${Math.round(sz.w * 0.115)}px ${Math.round(sz.w * 0.08)}px 0;text-align:center;position:relative;z-index:3}
  .shot__cap p{
    margin:0;color:${sky.ink};text-wrap:balance;
    font-family:var(--font-display);font-weight:800;letter-spacing:-.028em;line-height:1.14;
    font-size:${Math.round(sz.w * 0.072)}px;
  }
  .shot__phone{margin-top:${Math.round(sz.w * 0.06)}px;position:relative;z-index:3}
  .device--store{
    box-shadow:0 ${Math.round(sz.w * 0.04)}px ${Math.round(sz.w * 0.1)}px rgba(4,8,22,.4);
  }
  .device--store .device__img{width:100%;height:auto;display:block}
</style>
<section class="shot">
  <img class="shot__garland" src="${garland}" alt="">
  <canvas class="shot__snow"></canvas>
  <div class="shot__cap"><p>${cap}</p></div>
  <div class="shot__phone">
    <div class="device device--shot device--store" style="--w:${Math.round(sz.w * 0.79)}px">
      <span class="device__hw" aria-hidden="true"></span><span class="device__island" aria-hidden="true"></span>
      <div class="device__screen"><img class="device__img" src="${shot}" alt=""></div>
    </div>
  </div>
</section>
<script>
  var s = document.querySelector('.shot'), c = s.querySelector('.shot__snow');
  var r = s.getBoundingClientRect();
  c.width = r.width * 3; c.height = r.height * 3;
  c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
  var x = c.getContext('2d'); x.scale(3, 3); x.fillStyle = '#FFFBF4';
  var seed = 1337 + ${i} * 977;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  for (var k = 0, n = 52 + ${i} * 10; k < n; k++) {
    x.globalAlpha = 0.18 + rnd() * (0.26 + ${i} * 0.08);
    x.beginPath(); x.arc(rnd() * r.width, rnd() * r.height, 0.9 + rnd() * 2.3, 0, 6.2832); x.fill();
  }
</script>
</html>`;
}

(async () => {
  const I = dict();
  for (const l of LANGS) if (!I[l]) throw new Error('no dictionary for ' + l);
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (f.endsWith('.png')) fs.unlinkSync(path.join(OUT, f));

  const b = await chromium.launch();
  let made = 0;
  const fellBack = [];
  for (const lang of LANGS) {
    const frames = localised(lang, 'christmas') ? FESTIVE : PLAIN;
    if (frames === PLAIN) fellBack.push(lang);
    for (const sz of SIZES) {
      const p = await b.newPage({ viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: sz.dpr });
      for (let i = 0; i < frames.length; i++) {
        const file = path.join(OUT, `_${lang}-${sz.name}-${i}.html`);
        fs.writeFileSync(file, page(lang, sz, i, I, frames));
        await p.goto('file://' + file, { waitUntil: 'networkidle' });
        await p.waitForTimeout(380);
        await p.screenshot({ path: path.join(OUT, `${lang}-${sz.name}-${String(i + 1).padStart(2, '0')}.png`) });
        if (!process.env.KEEP_HTML) fs.unlinkSync(file);
        made++;
      }
      await p.close();
    }
  }
  await b.close();
  console.log(`${made} screenshots -> appstore/  (${LANGS.length} languages x ${SIZES.length} sizes x 5 frames)`);
  if (fellBack.length) {
    console.log(`\nNOTE: img/app/<lang>/christmas.webp is the Russian capture in: ${fellBack.join(', ')}.`);
    console.log('Those languages got a set of localised screens instead, so the New Year');
    console.log('screen is missing from their listing. Capture it in each language and');
    console.log('re-run — the festive set comes back on its own.');
  }
})();
