#!/usr/bin/env node
/* ===========================================================================
   App Store screenshots, rendered from the same components the site uses.

   These are MARKETING MOCK-UPS of the product's screens, not captures taken
   from a running build. Apple requires store screenshots to show the app as it
   actually is, so before these are uploaded they should be re-shot from the
   real app — or checked, screen by screen, against it.

   Sizes: 6.9" is 1320 x 2868, 6.5" is 1284 x 2778. Both are rendered by laying
   the frame out at a third of those numbers and photographing at 3x, so the
   output lands on the exact pixel size Apple asks for.
   =========================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'appstore');
const SIZES = [
  { name: '6.9', w: 440, h: 956, dpr: 3 },   // 1320 x 2868
  { name: '6.5', w: 428, h: 926, dpr: 3 }    // 1284 x 2778
];

/* --- the app screens, lifted out of the page so they cannot drift from it -- */
function sprite() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const a = html.indexOf('<defs>');
  const b = html.indexOf('</defs>', a);
  if (a < 0 || b < 0) throw new Error('icon sprite not found in index.html');
  return '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
         html.slice(a, b + 7) + '</svg>';
}

function screens() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const out = [];
  let i = 0;
  while (true) {
    const a = html.indexOf('<div class="device__screen">', i);
    if (a < 0) break;
    // walk the tags to find this div's own close
    let depth = 0, p = a;
    const re = /<\/?div\b[^>]*>/g;
    re.lastIndex = a;
    let m;
    while ((m = re.exec(html))) {
      if (m[0][1] === '/') { depth--; if (depth === 0) { p = m.index + m[0].length; break; } }
      else if (!m[0].endsWith('/>')) depth++;
    }
    out.push(html.slice(a, p)
      .replace(/(src|srcset)="\/img\//g, '$1="' + 'file://' + path.join(ROOT, 'img') + '/')
      .replace(/(\d+w,?\s*)\/img\//g, '$1' + 'file://' + path.join(ROOT, 'img') + '/'));
    i = p;
  }
  return out;
}


/* --- a fifth screen, the season's own, built from the same components ----- */
const NY = {
  ru: { bar:'AI Travel Agent', ask:'Вы написали', q:'«Новый год вдвоём, город с ёлкой и огнями, до €1 200»',
        done:'Поездка собрана', secs:'за 38 секунд', cap:'Париж · 30 декабря — 3 января', caps:'Новогодняя ночь на месте',
        r1:'Перелёт 30 декабря', r1s:'Утром, без ночной пересадки', p1:'€165',
        r2:'Отель у площади', r2s:'Десять минут пешком до ёлки', p2:'€470',
        r3:'Ужин 31 декабря', r3s:'Стол на 21:00 забронирован', p3:'бронь',
        r4:'Где смотреть салют', r4s:'Точка без толпы, двенадцать минут пешком', p4:'00:00',
        sum:'€1 140 из €1 200', sums:'Всё уложилось в бюджет', cta:'Подтвердить поездку' },
  en: { bar:'AI Travel Agent', ask:'You wrote', q:'"New Year for two, a city with a tree and lights, under €1,200"',
        done:'Trip assembled', secs:'in 38 seconds', cap:'Paris · 30 Dec — 3 Jan', caps:'There for New Year\'s Eve',
        r1:'Flight on 30 December', r1s:'In the morning, no overnight connection', p1:'€165',
        r2:'Hotel by the square', r2s:'Ten minutes on foot from the tree', p2:'€470',
        r3:'Dinner on 31 December', r3s:'Table booked for 21:00', p3:'booked',
        r4:'Where to watch the fireworks', r4s:'A spot without the crowd, twelve minutes away', p4:'00:00',
        sum:'€1,140 of €1,200', sums:'All inside the budget', cta:'Confirm the trip' }
};
function nyScreen(lang) {
  const t = NY[lang], img = 'file://' + path.join(ROOT, 'img');
  const row = (ic, sym, a, b, c) => `<li><span class="ui__ic ui__ic--${ic}"><svg aria-hidden="true"><use href="#${sym}"/></svg></span>` +
    `<span class="t"><b>${a}</b><span>${b}</span></span><span class="m">${c}</span></li>`;
  return `<div class="device__screen"><div class="ui">
    <div class="ui__bar"><span class="ui__burger"><i></i></span><span class="ui__brand">${t.bar}</span><span class="ui__avatar"></span></div>
    <div class="ui__body">
      <div class="ui__ask"><span class="ui__asklab">${t.ask}</span><p>${t.q}</p></div>
      <div class="ui__done"><span class="pill pill--green">${t.done}</span><span class="src">${t.secs}</span></div>
      <figure class="ui__shot">
        <img src="${img}/paris-sm.webp" alt="" width="400" height="225">
        <span class="fav"><svg aria-hidden="true"><use href="#i-heart-o"/></svg></span>
        <figcaption><b>${t.cap}</b><span>${t.caps}</span></figcaption>
      </figure>
      <ul class="ui__steps">
        ${row('blue', 'i-plane', t.r1, t.r1s, `<em>${t.p1}</em>`)}
        ${row('purple', 'i-hotel', t.r2, t.r2s, `<em>${t.p2}</em>`)}
        ${row('orange', 'i-coffee', t.r3, t.r3s, `<span class="pill">${t.p3}</span>`)}
        ${row('teal', 'i-star', t.r4, t.r4s, `<em>${t.p4}</em>`)}
      </ul>
      <div class="ui__banner">
        <span class="ui__ic ui__ic--green"><svg aria-hidden="true"><use href="#i-check"/></svg></span>
        <span class="t"><b>${t.sum}</b><span>${t.sums}</span></span>
      </div>
      <div class="ui__cta">${t.cta}</div>
    </div>
  </div></div>`;
}

const COPY = {
  ru: [
    ['Одна просьба —<br>и поездка собрана', 'Билеты, отель, маршрут и ужин. Escape! решает всё сам.'],
    ['Новый год там,<br>где вы захотите', 'Перелёт, отель у площади, стол на 31-е и место, откуда видно салют.'],
    ['Поездка —<br>по-вашему', 'Утренний рейс вместо ночного, отель потише. Агент объясняет каждый выбор.'],
    ['Агент едет<br>вместе с вами', 'Даже восемь часов на пересадке он превращает в день в городе.'],
    ['Три дня,<br>расписанные по часам', 'Не список мест, а порядок: во сколько выйти и сколько идти пешком.']
  ],
  en: [
    ['Ask once —<br>the trip is assembled', 'Flights, the hotel, the route and dinner. Escape! decides all of it.'],
    ['New Year wherever<br>you want it', 'The flight, a hotel by the square, a table on the 31st and where to watch the fireworks.'],
    ['The trip,<br>your way', 'A morning flight instead of the night one, a quieter hotel. It explains every choice.'],
    ['The agent travels<br>with you', 'It turns even eight hours on a layover into a day in the city.'],
    ['Three days,<br>planned to the hour', 'Not a list of places: when to leave and how far it is on foot.']
  ]
};

const FRAME = (copy, screen, idx) => `
<section class="shot shot--${idx + 1}">
  <span class="shot__garland"></span>
  <canvas class="shot__snow"></canvas>
  <div class="shot__cap">
    <h2>${copy[0]}</h2>
    <p>${copy[1]}</p>
  </div>
  <div class="shot__phone">
    <div class="device device--shot">
      <div class="device__island"></div>
      <div class="device__status">
        <span class="device__time">9:41</span>
        <span class="device__ind">
          <svg class="device__sig" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
          <svg class="device__wifi" viewBox="0 0 16 12"><path d="M8 10.7 9.9 8.3a2.9 2.9 0 0 0-3.8 0ZM8 6.4c1.3 0 2.5.5 3.4 1.3l1.3-1.6A7.3 7.3 0 0 0 8 4.3c-1.8 0-3.4.7-4.7 1.8l1.3 1.6A5 5 0 0 1 8 6.4ZM8 2.3c2.3 0 4.4.8 6.1 2.3L15.5 3A10.5 10.5 0 0 0 8 .2 10.5 10.5 0 0 0 .5 3l1.4 1.6A8.6 8.6 0 0 1 8 2.3Z"/></svg>
          <span class="device__bat"><i></i></span>
        </span>
      </div>
      <span class="device__home"></span>
      ${screen}
    </div>
  </div>
</section>`;

function page(lang, sz, scr, only) {
  const copy = COPY[lang];
  const order = [0, 'ny', 1, 2, 3];          // which app screen each frame shows
  // One frame to a page, photographed as a whole viewport. Shooting six frames
  // out of one tall document left the odd capture misaligned by a few dozen
  // pixels, with the page's own background showing at the foot of it.
  const pick = order[only] === 'ny' ? nyScreen(lang) : (scr[order[only]] || scr[0]);
  const frames = FRAME(copy[only], pick, only);
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8">
${sprite()}
<link rel="stylesheet" href="file://${path.join(ROOT, 'assets/fonts.css')}">
<link rel="stylesheet" href="file://${path.join(ROOT, 'assets/styles.css')}">
<style>
  html,body{margin:0;padding:0;background:#0B1026}
  .shot{
    position:relative;width:${sz.w}px;height:${sz.h}px;overflow:hidden;isolation:isolate;
    display:flex;flex-direction:column;align-items:center;
    font-family:var(--font-ui);
  }
  .shot__cap{padding:${Math.round(sz.w * 0.13)}px 28px 0;text-align:center;position:relative;z-index:3}
  .shot__cap h2{
    font-family:var(--font-display);font-weight:800;letter-spacing:-.03em;line-height:1.08;
    font-size:${Math.round(sz.w * 0.092)}px;margin:0;color:#fff;text-wrap:balance;
  }
  .shot__cap p{
    margin:${Math.round(sz.w * 0.034)}px auto 0;max-width:30ch;line-height:1.45;
    font-size:${Math.round(sz.w * 0.038)}px;font-weight:500;
  }
  .shot__phone{margin-top:${Math.round(sz.w * 0.07)}px;position:relative;z-index:3}
  .device--shot{--w:${Math.round(sz.w * 0.78)}px;box-shadow:0 ${Math.round(sz.w*0.04)}px ${Math.round(sz.w*0.1)}px rgba(4,8,22,.34)}
  .shot__snow{position:absolute;inset:0;z-index:2;pointer-events:none}
  .shot__garland{
    position:absolute;top:0;left:0;right:0;height:46px;z-index:4;pointer-events:none;
    background:var(--garland-tile) repeat-x top center;background-size:120px 44px;
    filter:drop-shadow(0 2px 10px rgba(255,150,60,.34));
  }
  /* each frame sits a step further into the evening */
  .shot--1{background:linear-gradient(176deg,#FBF7F0,#F6DCBC)}
  .shot--1 .shot__cap h2{color:#0B1533}  .shot--1 .shot__cap p{color:#3C4668}
  .shot--2{background:linear-gradient(176deg,#F7E0C3,#EFB88E)}
  .shot--2 .shot__cap h2{color:#0B1533}  .shot--2 .shot__cap p{color:#3C4668}
    .shot--3{background:linear-gradient(176deg,#EFB88E,#7E4450)}
  .shot--3 .shot__cap h2{color:#fff}     .shot--3 .shot__cap p{color:#F8E7DD}
  .shot--4{background:linear-gradient(176deg,#4A2B42,#241934)}
  .shot--4 .shot__cap h2{color:#fff}     .shot--4 .shot__cap p{color:#DCC9DA}
  .shot--5{background:linear-gradient(176deg,#1C1733,#070E24)}
  .shot--5 .shot__cap h2{color:#fff}     .shot--5 .shot__cap p{color:#C3C9E4}
</style>
${frames}
<script src="file://${path.join(ROOT, 'assets/i18n.js')}"></script>
<script>
  /* the screens are lifted out of the Russian page; put them in this one's language */
  (function (lang) {
    var d = (window.I18N || {})[lang];
    if (!d) return;
    var map = { 'data-i18n': 'text', 'data-i18n-html': 'html', 'data-i18n-alt': 'alt',
                'data-i18n-placeholder': 'placeholder', 'data-i18n-aria-label': 'aria-label' };
    Object.keys(map).forEach(function (attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var v = d[el.getAttribute(attr)];
        if (v == null) return;
        if (map[attr] === 'text') el.textContent = v;
        else if (map[attr] === 'html') el.innerHTML = v;
        else el.setAttribute(map[attr], v);
      });
    });
  })('${lang}');

  /* snow, drawn once per frame — no animation, these are stills */
  document.querySelectorAll('.shot').forEach(function (s, i) {
    var c = s.querySelector('.shot__snow'), r = s.getBoundingClientRect();
    c.width = r.width * 3; c.height = r.height * 3;
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    var x = c.getContext('2d'); x.scale(3, 3);
    x.fillStyle = '#FFFBF4';
    var seed = 1337 + i * 977;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    var n = 54 + i * 8;
    for (var k = 0; k < n; k++) {
      x.globalAlpha = 0.2 + rnd() * (0.3 + i * 0.07);
      x.beginPath();
      x.arc(rnd() * r.width, rnd() * r.height, 0.9 + rnd() * 2.4, 0, 6.2832);
      x.fill();
    }
  });
</script>
</html>`;
}

(async () => {
  const scr = screens();
  if (scr.length < 3) { console.error('could not lift the app screens out of index.html'); process.exit(1); }
  // the garland tile, read back out of the stylesheet so there is one copy of it
  const css = fs.readFileSync(path.join(ROOT, 'assets/styles.css'), 'utf8');
  const tile = css.match(/\.garland\{[^}]*background:(url\("data:image\/svg\+xml,[^"]+"\))/);
  if (!tile) { console.error('garland tile not found in styles.css'); process.exit(1); }

  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  let made = 0;
  for (const lang of ['ru', 'en']) {
    for (const sz of SIZES) {
      const p = await b.newPage({ viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: sz.dpr });
      for (let i = 0; i < COPY[lang].length; i++) {
        const file = path.join(OUT, `_${lang}-${sz.name}-${i}.html`);
        fs.writeFileSync(file, page(lang, sz, scr, i).replace('</style>', `  :root{--garland-tile:${tile[1]}}\n</style>`));
        await p.goto('file://' + file, { waitUntil: 'networkidle' });
        await p.waitForTimeout(420);
        const name = `${lang}-${sz.name}-${String(i + 1).padStart(2, '0')}.png`;
        await p.screenshot({ path: path.join(OUT, name) });
        if (!process.env.KEEP_HTML) fs.unlinkSync(file);
        made++;
      }
      await p.close();
    }
  }
  await b.close();
  console.log(`${made} screenshots -> appstore/`);
})();
