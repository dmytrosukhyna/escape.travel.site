/* ESCAPE! — the season's sky, and the phones' screens.
   One script for the parts of the Christmas page that have to measure it:
   where each colour of the sky falls (on the sections themselves, so the
   night always begins where the words turn light), when the stars come out,
   when the header puts on its night glass, and which phone screens are whole
   screenshots rather than the older cut ones. */
(function () {
  'use strict';
  var SKY = {
    dawn: '#F7DCE2', dawn2: '#FBE7D7', morning: '#EFF1F7', pearl: '#EAF2FC', day: '#E2EEFC',
    day2: '#E5F0FC', noon: '#EAF2FC', afternoon: '#F1F1EE', warm: '#F7EADA', golden: '#FBE0BF',
    golden2: '#FAD3AC', amber: '#F8C6A2', sunset: '#F4B39E', sunset2: '#F0A596', mauve: '#93699A',
    dusk: '#3A3373', night0: '#232659', evening: '#2A2B62', night: '#1E2253', night1b: '#1B1F4E', night2: '#181C47', night3: '#13183D',
    deep: '#0F1435', deep2: '#0C1030', abyss: '#0A0D28', end: '#06081B'
  };
  var sky = document.getElementById('sky');
  var stars = document.getElementById('stars');
  var header = document.getElementById('header');
  var santa = document.getElementById('santa');
  if (!sky) return;
  document.documentElement.classList.add('js-season');
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function topOf(el) { var r = el.getBoundingClientRect(); return r.top + window.pageYOffset; }

  var nightAt = Infinity, drawn = [];
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  // the sky's own colour at a height of the page, as the gradient draws it
  function skyAt(y) {
    if (!drawn.length) return null;
    var i = 0;
    while (i < drawn.length - 1 && drawn[i + 1][0] <= y) i++;
    var a = drawn[i], b = drawn[Math.min(i + 1, drawn.length - 1)];
    var t = b[0] > a[0] ? Math.max(0, Math.min(1, (y - a[0]) / (b[0] - a[0]))) : 0;
    var ca = rgb(a[1]), cb = rgb(b[1]);
    return [0, 1, 2].map(function (k) { return Math.round(ca[k] + (cb[k] - ca[k]) * t); });
  }
  function draw() {
    var H = sky.offsetHeight || document.body.scrollHeight;
    var stops = [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-sky]'), function (el) {
      var t = topOf(el), h = el.offsetHeight;
      el.getAttribute('data-sky').split(/\s+/).forEach(function (part) {
        var bits = part.split('@'), c = SKY[bits[0]];
        if (!c) return;
        // "@pad": where the section's top padding ends, so the night is full
        // before its first word; otherwise a fraction of its height
        var y = bits[1] === 'pad'
          ? t + parseFloat(getComputedStyle(el).paddingTop) * .8
          : t + h * (bits[1] ? parseFloat(bits[1]) : 0);
        stops.push([Math.max(0, Math.min(H, y)), c, stops.length]);
      });
    });
    stops.sort(function (a, b) { return a[0] - b[0] || a[2] - b[2]; });
    if (!stops.length) return;
    if (stops[0][0] > 0) stops.unshift([0, stops[0][1], -1]);
    drawn = stops;
    sky.style.backgroundImage = 'linear-gradient(180deg,' + stops.map(function (s) {
      return s[1] + ' ' + Math.round(s[0]) + 'px';
    }).join(',') + ')';

    var together = document.getElementById('together');
    if (together) sky.style.setProperty('--sun-y', Math.round(topOf(together) + together.offsetHeight * .55) + 'px');
    if (santa) {
      var st = topOf(santa);
      sky.style.setProperty('--moon-y', Math.round(st + santa.offsetHeight * .05) + 'px');
      nightAt = st;
    }
    var join = document.getElementById('join');
    if (join) sky.style.setProperty('--sleigh-y', Math.round(topOf(join) + 30) + 'px');
    onScroll();
  }

  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight;
    if (stars) {
      var o = (y + vh - nightAt) / (vh * 0.9);
      stars.style.opacity = o <= 0 ? '0' : o >= 1 ? '1' : o.toFixed(3);
    }
    if (header) {
      // the header wears the sky behind it, and light words once that sky is dark
      var c = skyAt(y + 36);
      if (c) {
        header.style.setProperty('--hdr', 'rgb(' + c.join(',') + ')');
        var L = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
        header.classList.toggle('is-night', L < 0.42);
      }
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  var pending = false;
  function redraw() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; draw(); }); }
  window.addEventListener('resize', redraw);
  window.addEventListener('load', redraw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(document.body);
  draw();

  /* A whole screenshot is 9 : 19.5 (1320 x 2868); the store screens cut from
     their frames are a little taller. Each phone is told which it holds, so a
     whole one fills the glass edge to edge. Called again when the language
     swaps the pictures. */
  function fit(img) {
    var view = img.closest('.device__view');
    if (!view || !img.naturalWidth) return;
    view.classList.toggle('is-full', img.naturalHeight / img.naturalWidth < 2.19);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.device__img'), function (img) {
    if (img.complete) fit(img);
    img.addEventListener('load', function () { fit(img); });
  });

  /* Day and night pairs: the night screen slides out from behind the day
     one when the pair is on screen, once. */
  var pairs = document.querySelectorAll('[data-pair]');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(pairs, function (p) { p.classList.add('is-night-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-night-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(pairs, function (p) { io.observe(p); });
  }

  if (reduced && stars) stars.querySelector('i:last-child') && (stars.querySelector('i:last-child').style.opacity = '.8');
})();
