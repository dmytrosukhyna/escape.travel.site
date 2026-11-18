/* ===========================================================================
   The season, laid over the evening the page already is.

   Snow that thickens as the page darkens, and one crossing of the sky in the
   section that is actually a sky. Both stand down entirely for anyone who has
   asked for less motion, and the snow stops when the tab is not being looked
   at — it is decoration, and decoration should never be the reason a laptop
   fan comes on.
   =========================================================================== */
(function () {
  'use strict';
  var reduced = !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- snow --------------------------------------------------------------- */
  var cv = document.createElement('canvas');
  cv.className = 'snow';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);

  var ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, flakes = [], raf = 0, last = 0;

  function make(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: 0.7 + Math.random() * 2.1,          // radius
      v: 10 + Math.random() * 30,            // fall, px per second
      a: 0.34 + Math.random() * 0.5,         // opacity
      p: Math.random() * Math.PI * 2,        // phase of the sideways drift
      d: 6 + Math.random() * 16              // how far it drifts
    };
  }

  function size() {
    w = window.innerWidth; h = window.innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var want = Math.round(Math.max(26, Math.min(110, w * h / 15000)));
    while (flakes.length > want) flakes.pop();
    while (flakes.length < want) flakes.push(make(true));
  }

  function paint(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#FFFBF4';
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(f.x + Math.sin(t / 1400 + f.p) * f.d, f.y, f.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function step(now) {
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.v * dt;
      if (f.y - f.r > h) { flakes[i] = make(false); flakes[i].x = Math.random() * w; }
    }
    paint(now);
    raf = requestAnimationFrame(step);
  }

  function start() { if (!raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(step); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* It falls lightly over the morning and properly over the night. */
  function depth() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var k = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    cv.style.opacity = (0.22 + 0.78 * k).toFixed(3);
  }

  size(); depth();
  if (reduced) paint(0); else start();

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () { size(); if (reduced) paint(0); }, 160);
  });
  window.addEventListener('scroll', depth, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  /* --- one crossing of the sky -------------------------------------------- */
  var sleigh = document.querySelector('.santa');
  if (sleigh) {
    if (reduced) {
      sleigh.classList.add('is-parked');
    } else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { sleigh.classList.add('is-flying'); io.disconnect(); }
        });
      }, { threshold: 0, rootMargin: '0px 0px -22% 0px' });
      io.observe(sleigh.parentElement || sleigh);
    } else {
      sleigh.classList.add('is-flying');
    }
  }
})();
