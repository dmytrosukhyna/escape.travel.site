/* ==========================================================================
   ESCAPE! — AI Travel Agent
   Interaction layer: localisation, scroll storytelling, modals, consent
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse  = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------------------------------------------------------- i18n */
  var LANGS = ['ru', 'uk', 'en'];
  var HTML_LANG = { ru: 'ru', uk: 'uk', en: 'en' };
  var lang = 'ru';

  function detectLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS.indexOf(q) > -1) return q;
    var stored = LS.get('escape.lang');
    if (stored && LANGS.indexOf(stored) > -1) return stored;
    var nav = (navigator.languages || [navigator.language || 'ru']).join(',').toLowerCase();
    if (/\buk\b|\buk-/.test(nav)) return 'uk';
    if (/\bru\b|\bru-/.test(nav)) return 'ru';
    if (/\ben\b|\ben-/.test(nav)) return 'en';
    return 'ru';
  }

  function t(key) {
    var d = window.I18N && window.I18N[lang];
    if (d && d[key] != null) return d[key];
    var f = window.I18N && window.I18N.ru;
    return (f && f[key] != null) ? f[key] : '';
  }

  function applyLang(next, announce) {
    if (LANGS.indexOf(next) < 0) next = 'ru';
    lang = next;
    LS.set('escape.lang', lang);
    document.documentElement.lang = HTML_LANG[lang];

    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v) el.textContent = v;
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (v) el.innerHTML = v;
    });
    $$('[data-i18n-alt]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-alt'));
      if (v) el.setAttribute('alt', v);
    });
    $$('[data-i18n-placeholder]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-placeholder'));
      if (v) el.setAttribute('placeholder', v);
    });
    $$('[data-i18n-aria-label]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-aria-label'));
      if (v) el.setAttribute('aria-label', v);
    });

    // The app's own screens, in the language being read (store screenshots, cut
    // out of their frames — /img/app/<lang>/<screen>.webp).
    $$('[data-shot]').forEach(function (el) {
      var src = '/img/app/' + lang + '/' + el.dataset.shot + '.webp';
      if (el.getAttribute('src') !== src) el.setAttribute('src', src);
    });

    $$('.langs button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });

    // section-specific strings owned by JS
    var amsNote = $('#amsNote');
    if (amsNote) amsNote.textContent = t(amsNote.dataset.state === 'rain' ? 'amsNoteRain' : 'amsNoteDry');
    var rainBtn = $('#rainBtn');
    if (rainBtn) rainBtn.textContent = t(rainBtn.dataset.state === 'rain' ? 'amsDry' : 'amsRain') || t('amsRain');
    var answer = $('#worldAnswer');
    if (answer && answer.dataset.intent) answer.innerHTML = t('ia' + answer.dataset.intent);

    document.title = t('metaTitle') || document.title;
    var md = document.querySelector('meta[name="description"]');
    if (md && t('metaDesc')) md.setAttribute('content', t('metaDesc'));
    reformatCounters();
    brandify();
    if (waitlistRelabel) waitlistRelabel();
    if (announce) toast(t('tLang'));
  }

  /* ---------------------------------------------------------- brand marks */
  // Body copy should read the product name as a brand, and should make it
  // obvious that the agent does the work itself — so both get marked up here
  // instead of carrying markup around in every dictionary entry.
  var SELF = {
    ru: ['сам', 'сама', 'сами', 'самостоятельно'],
    uk: ['сам', 'сама', 'самі', 'самостійно'],
    en: ['itself', 'on its own', 'by itself']
  };
  var BRAND_SCOPE = '.lead, .hero__text, .hero__sub, .cta__lead, .fcard p, .amb__t p, .vision p';

  function wrapMatches(el, re, cls) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentNode && n.parentNode.classList && n.parentNode.classList.contains(cls)) continue;
      if (re.test(n.nodeValue)) nodes.push(n);
      re.lastIndex = 0;
    }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var text = node.nodeValue, last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var b = document.createElement('b');
        b.className = cls;
        b.textContent = m[0];
        frag.appendChild(b);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function brandify() {
    var words = SELF[lang] || SELF.ru;
    var selfRe;
    try {
      selfRe = new RegExp('(?<!\\p{L})(' + words.join('|') + ')(?!\\p{L})', 'giu');
    } catch (e) {
      selfRe = new RegExp('\\b(' + words.join('|') + ')\\b', 'gi');
    }
    $$(BRAND_SCOPE).forEach(function (el) {
      $$('b.hl, b.hl-self', el).forEach(function (b) {
        b.parentNode.replaceChild(document.createTextNode(b.textContent), b);
      });
      el.normalize();
      wrapMatches(el, /Escape!/g, 'hl');
      wrapMatches(el, selfRe, 'hl-self');
    });
  }

  /* --------------------------------------------------------------- toast */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!msg) return;
    toastEl = toastEl || $('#toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3600);
  }

  /* -------------------------------------------------------------- header */
  function initHeader() {
    var header = $('#header');
    var burger = $('#burger');
    var drawer = $('#drawer');
    var sections = $$('main section[id]');
    var navLinks = $$('.nav a');

    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
      var y = window.scrollY + 140, current = '';
      sections.forEach(function (s) { if (s.offsetTop <= y) current = s.id; });
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setDrawer(open) {
      burger.setAttribute('aria-expanded', String(open));
      if (open) {
        drawer.hidden = false;
        requestAnimationFrame(function () { drawer.classList.add('is-open'); });
        document.body.style.overflow = 'hidden';
      } else {
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
        setTimeout(function () { if (burger.getAttribute('aria-expanded') === 'false') drawer.hidden = true; }, 340);
      }
    }
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setDrawer(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && burger.getAttribute('aria-expanded') === 'true') setDrawer(false);
    });

    $$('.langs button').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.dataset.lang, true); });
    });
  }

  /* ------------------------------------------------------------- reveals */
  function initReveal() {
    var items = $$('.rv');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------- generic observer */
  function whenVisible(el, cb, ratio) {
    if (!el) return;
    if (reduced || !('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { cb(); io.disconnect(); } });
    }, { threshold: ratio == null ? 0.3 : ratio });
    io.observe(el);
  }

  // A ratio is the wrong measure for a block taller than the screen: fifteen
  // chips on a phone can only ever reach about half a viewport of ratio, so a
  // 0.55 threshold fired at the very bottom of the block. This fires when the
  // block's own top has come a quarter of the way up the screen, whatever its
  // height.
  function whenTopReached(el, cb, frac) {
    if (!el) return;
    if (reduced || !('IntersectionObserver' in window)) { cb(); return; }
    var pct = Math.round((frac == null ? 0.28 : frac) * 100);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { cb(); io.disconnect(); } });
    }, { threshold: 0, rootMargin: '0px 0px -' + pct + '% 0px' });
    io.observe(el);
  }

  /* --- progress of an element through the viewport, 0..1 --------------- */
  function scrollProgress(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    // p = 0 as the block's top enters at 92% of the viewport,
    // p = 1 once its bottom reaches 75% — the whole block is still on screen.
    var from = vh * 0.92;
    var to = vh * 0.75 - r.height;
    var span = from - to;
    if (span < vh * 0.4) span = vh * 0.4;
    return Math.max(0, Math.min(1, (from - r.top) / span));
  }

  // How many items of a sequence are lit at progress p. The sequence finishes
  // at 82% of the window so the last item never lands after the block has gone.
  function reachedCount(p, total) {
    return Math.floor((p / 0.82) * total);
  }

  var progressTargets = [];
  function onProgressScroll() {
    for (var i = 0; i < progressTargets.length; i++) {
      var tgt = progressTargets[i];
      tgt.fn(scrollProgress(tgt.el));
    }
  }
  function trackProgress(el, fn) {
    if (!el) return;
    if (reduced) { fn(1); return; }
    progressTargets.push({ el: el, fn: fn });
    fn(scrollProgress(el));
  }

  /* ------------------------------------------------------ fragmentation */
  function initFrag() {
    var frag = $('#frag');
    // let the chips be read in full colour first, then let them fall away
    whenTopReached(frag, function () {
      setTimeout(function () {
        // Promote the chips only for the length of the move: keeping fifteen
        // layers alive afterwards costs more than the animation saves.
        frag.classList.add('is-armed', 'is-collapsed');
        setTimeout(function () { frag.classList.remove('is-armed'); }, 1400);
      }, reduced ? 0 : 900);
    }, 0.3);
  }

  /* --------------------------------------------------------- stat counts */
  var counters = [];
  function localeTag() { return lang === 'en' ? 'en-US' : (lang === 'uk' ? 'uk-UA' : 'ru-RU'); }
  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var dec = parseInt(el.dataset.dec || '0', 10);
      var rec = { el: el, target: target, dec: dec, value: 0 };
      counters.push(rec);
      var write = function (v) {
        rec.value = v;
        el.textContent = v.toLocaleString(localeTag(), { minimumFractionDigits: dec, maximumFractionDigits: dec });
      };
      rec.write = write;
      whenVisible(el, function () {
        if (reduced) { write(target); return; }
        var start = performance.now(), dur = 1500;
        (function step(now) {
          var p = Math.min(1, (now - start) / dur);
          write(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(start);
      }, 0.5);
    });
  }
  function reformatCounters() {
    counters.forEach(function (c) { c.write(c.value); });
  }

  /* ------------------------------------------------------- AI think pipe */
  function initThink() {
    var pipe = $('#pipe');
    var out = $('#thinkOut');
    if (!pipe) return;
    var steps = $$('li', pipe);

    trackProgress(pipe, function (p) {
      var reach = reachedCount(p, steps.length + 1);
      steps.forEach(function (li, i) {
        li.classList.toggle('is-on', i <= reach);
        li.classList.toggle('is-done', i < reach);
      });
      if (out) out.classList.toggle('is-on', reach >= steps.length);
    });
  }

  /* ----------------------------------------------------- live timeline */
  function initTimeline() {
    var tl = $('#tl');
    if (!tl) return;
    var items = $$('li', tl);
    var prog = $('#tlProg');
    var notes = $$('#notes .note');

    trackProgress(tl, function (p) {
      var reach = reachedCount(p, items.length);
      items.forEach(function (li, i) { li.classList.toggle('is-on', i <= reach); });
      if (prog) prog.style.setProperty('--p', Math.min(100, (reach + 1) / items.length * 100) + '%');
      var nReach = reachedCount(p, notes.length);
      notes.forEach(function (n, i) { n.classList.toggle('is-on', i <= nReach); });
    });
  }

  /* ------------------------------------------------------- replan demo */
  function initReplan() {
    var box = $('#replan');
    var btn = $('#replanBtn');
    if (!box || !btn) return;
    var fire = function () {
      box.classList.add('is-on');
      btn.disabled = true;
      btn.style.opacity = '.5';
    };
    btn.addEventListener('click', fire);
    whenVisible(box, function () { setTimeout(fire, reduced ? 0 : 900); }, 0.4);
  }

  /* ---------------------------------------------------------- EV route */
  function initRoute() {
    var route = $('#route');
    if (!route) return;
    var nodes = $$('.route__node', route);
    var fill = $('#routeFill');
    trackProgress(route, function (p) {
      var reach = reachedCount(p, nodes.length);
      nodes.forEach(function (n, i) { n.classList.toggle('is-on', i <= reach); });
      if (fill) fill.style.setProperty('--p', Math.min(100, (reach + 1) / nodes.length * 100) + '%');
    });
  }

  /* ------------------------------------------------- hero: the two modes */
  // The two scenarios are the whole proposition, so the hero shows both rather
  // than describing them. These buttons switch the phone; they promise nothing
  // the product cannot already do on this page.
  function initModes() {
    var group = $('#modes');
    if (!group) return;
    var panes = $$('[data-pane]');
    if (!panes.length) return;
    $$('button', group).forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.dataset.mode;
        $$('button', group).forEach(function (o) {
          o.setAttribute('aria-pressed', String(o === b));
        });
        panes.forEach(function (p) { p.hidden = p.dataset.pane !== mode; });
      });
    });
  }

  /* --------------------------------------------------- Amsterdam swap */
  function initAmsterdam() {
    var btn = $('#rainBtn');
    var note = $('#amsNote');
    var chain = $('#chain');
    if (!btn || !chain) return;
    var items = $$('li', chain);
    var original = items.map(function (li) {
      return { t: li.querySelector('b').textContent, s: li.querySelector('span:last-child').textContent };
    });

    var scene = $('#amsScene');
    var swapping = false;

    // Swap the two affected steps out, rewrite them, fade them back in — so the
    // plan visibly rebuilds instead of blinking into a different one.
    function rewrite(rain) {
      if (rain) {
        items[1].classList.add('is-alt');
        items[3].classList.add('is-alt');
        items[1].querySelector('b').textContent = t('amRain2');
        items[1].querySelector('span:last-child').textContent = t('amRain2s');
        items[1].querySelector('.ic use').setAttribute('href', '#i-tram');
        items[3].querySelector('span:last-child').textContent = t('amRainSlot') || '12:30';
      } else {
        items[1].classList.remove('is-alt');
        items[3].classList.remove('is-alt');
        items[1].querySelector('b').textContent = original[1].t;
        items[1].querySelector('span:last-child').textContent = original[1].s;
        items[1].querySelector('.ic use').setAttribute('href', '#i-bike');
        items[3].querySelector('span:last-child').textContent = original[3].s;
      }
    }

    btn.addEventListener('click', function () {
      if (swapping) return;
      var rain = btn.dataset.state !== 'rain';
      btn.dataset.state = rain ? 'rain' : 'dry';
      note.dataset.state = rain ? 'rain' : 'dry';
      note.textContent = t(rain ? 'amsNoteRain' : 'amsNoteDry');
      btn.textContent = t(rain ? 'amsDry' : 'amsRain') || t('amsRain');
      if (scene) scene.classList.toggle('is-rain', rain);

      if (reduced) { rewrite(rain); return; }

      swapping = true;
      items[1].classList.add('is-swap');
      items[3].classList.add('is-swap');
      setTimeout(function () {
        rewrite(rain);
        items[1].classList.remove('is-swap');
        items[3].classList.remove('is-swap');
        swapping = false;
      }, 280);
    });
  }

  /* -------------------------------------------------------- world globe */
  function initWorld() {
    var globe = $('#globe');
    var pins = $$('.pinpt');
    var intents = $$('#intents button');
    var answer = $('#worldAnswer');

    if (pins.length) {
      var i = 0;
      whenVisible(globe, function () {
        pins.forEach(function (p, k) {
          setTimeout(function () { p.classList.add('is-on'); }, reduced ? 0 : k * 210);
        });
      }, 0.2);
      pins.forEach(function (p) {
        p.addEventListener('mouseenter', function () { p.classList.add('is-on'); });
      });
    }

    var svgEl = globe && globe.querySelector('svg');
    if (svgEl && svgEl.pauseAnimations) {
      if (reduced) {
        svgEl.pauseAnimations();
      } else if ('IntersectionObserver' in window) {
        // The globe keeps a dozen SMIL animations running; off-screen they are
        // pure battery and pure jank, so they only tick while it is in view.
        svgEl.pauseAnimations();
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) svgEl.unpauseAnimations();
            else svgEl.pauseAnimations();
          });
        }, { rootMargin: '120px' }).observe(globe);
      }
    }

    if (globe && !reduced && !coarse) {
      var g = $('#globeG');
      globe.addEventListener('pointermove', function (e) {
        var r = globe.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        if (g) g.setAttribute('transform', 'translate(' + (dx * 14).toFixed(1) + ',' + (dy * 10).toFixed(1) + ')');
      });
      globe.addEventListener('pointerleave', function () {
        if (g) g.setAttribute('transform', 'translate(0,0)');
      });
    }

    intents.forEach(function (b) {
      b.addEventListener('click', function () {
        intents.forEach(function (o) { o.classList.remove('is-on'); });
        b.classList.add('is-on');
        if (answer) {
          answer.dataset.intent = b.dataset.intent;
          answer.style.opacity = '0';
          setTimeout(function () {
            answer.innerHTML = t('ia' + b.dataset.intent);
            answer.style.opacity = '1';
          }, reduced ? 0 : 180);
        }
      });
    });
    if (answer && !answer.dataset.intent) answer.dataset.intent = '1';
    if (answer) answer.style.transition = 'opacity .22s ease';
  }


  /* --------------------------------------------------------- hero parallax */
  function initHeroParallax() {
    // Touch devices repaint the hero image on every scroll frame for this, and
    // it is the one effect nobody misses — so it stays on pointer hardware.
    if (reduced || coarse) return;
    var img = $('.hero__media img');
    if (!img) return;
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 700);
        img.style.transform = 'scale(1.06) translate3d(0,' + (y * 0.075).toFixed(1) + 'px,0)';
        raf = false;
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------- modals */
  var lastFocus = null;
  var waitlistReopen = null;
  var waitlistRelabel = null;
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.hidden = false;
    requestAnimationFrame(function () { m.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    var focusable = m.querySelector('input, button, textarea, a[href]');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { m.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initModals() {
    $$('[data-waitlist]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (waitlistReopen) waitlistReopen();
        openModal('waitlist');
      });
    });
    $$('[data-toast]').forEach(function (b) {
      b.addEventListener('click', function () { toast(t(b.dataset.toast === 'proLater' ? 'tLater' : b.dataset.toast)); });
    });
    $$('.modal').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target === m) closeModal(m); });
      $$('[data-close]', m).forEach(function (b) {
        b.addEventListener('click', function () { closeModal(m); });
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = $('.modal.is-open');
      if (open) closeModal(open);
    });
    // focus trap
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var m = $('.modal.is-open');
      if (!m) return;
      var f = $$('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])', m)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ----------------------------------------------------------- waitlist */
  // Where an application is actually delivered. The endpoint reports whether a
  // destination is configured; until one is, the form hands the visitor a
  // composed email rather than thanking them for an address that goes nowhere.
  var WAITLIST_ENDPOINT = '/api/waitlist';
  var intakeReady = false;
  var WAITLIST_EMAIL = 'escape.travel.ai@gmail.com';
  var WAITLIST_KEY = 'escape.waitlist';

  function readWaitlist() {
    try { return JSON.parse(LS.get(WAITLIST_KEY) || '[]'); } catch (e) { return []; }
  }
  function writeWaitlist(list) { LS.set(WAITLIST_KEY, JSON.stringify(list)); }

  function waitlistLetter(entry) {
    var platforms = { ios: 'iOS', android: 'Android', any: t('wlAny') };
    var lines = [
      t('wlfName') + ': ' + entry.name,
      t('wlEmail') + ': ' + entry.email,
      t('wlfPlat') + ': ' + (platforms[entry.platform] || entry.platform)
    ];
    if (entry.message) lines.push(t('wlfMsg') + ': ' + entry.message);
    lines.push('', '— www.escapetravel.site');
    return { subject: t('wlMailSubj'), body: lines.join('\n') };
  }

  function initWaitlist() {
    var form = $('#wlFormEl');
    if (!form) return;
    var panes = ['wlForm', 'wlDone', 'wlHand', 'wlFail'];
    var submit = $('#wlSubmitLabel');
    var pending = null;

    function show(id) {
      panes.forEach(function (p) { var el = $('#' + p); if (el) el.hidden = p !== id; });
    }

    // The submit button names what pressing it does. Without an endpoint it
    // composes a letter; it does not send anything.
    function labelSubmit() {
      if (submit) submit.textContent = t(intakeReady ? 'wlSubmit' : 'wlSubmitMail');
      var lead = $('#wlLead');
      if (lead) lead.textContent = t(intakeReady ? 'wlLead' : 'wlLeadMail');
    }

    // Ask the endpoint once whether it has somewhere to put an application.
    // Anything other than a clear yes is treated as no.
    var probed = false;
    function probe() {
      if (probed || !WAITLIST_ENDPOINT) return;
      probed = true;
      fetch(WAITLIST_ENDPOINT, { method: 'GET' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { intakeReady = !!(d && d.configured); labelSubmit(); })
        .catch(function () { intakeReady = false; labelSubmit(); });
    }

    var plat = 'ios';
    $$('#wlPlat button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#wlPlat button').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        plat = b.dataset.plat;
      });
    });

    function handOff(entry) {
      var letter = waitlistLetter(entry);
      var pre = $('#wlPre');
      var text = letter.subject + '\n\n' + letter.body;
      if (pre) pre.textContent = text;
      var link = $('#wlMailto');
      if (link) {
        link.href = 'mailto:' + WAITLIST_EMAIL +
          '?subject=' + encodeURIComponent(letter.subject) +
          '&body=' + encodeURIComponent(letter.body);
      }
      var copy = $('#wlCopy');
      if (copy) {
        copy.textContent = t('wlHandCopy');
        copy.onclick = function () {
          var done = function () { copy.textContent = t('wlHandCopied'); };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
          } else { fallbackCopy(text, done); }
        };
      }
      var note = $('#wlHandDone');
      if (note) note.hidden = true;
      if (link) {
        link.onclick = function () {
          if (note) note.hidden = false;
          // Nag once. We cannot know whether they pressed send, so after the
          // letter has been handed over we stop treating the entry as unseen.
          markHandedOff(entry);
        };
      }
      show('wlHand');
    }

    function markHandedOff(entry) {
      var list = readWaitlist();
      for (var i = 0; i < list.length; i++) {
        if (list[i].at === entry.at) { list[i].status = 'handed'; }
      }
      writeWaitlist(list);
    }

    function fallbackCopy(text, done) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }

    function send(entry) {
      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: entry.name, email: entry.email, platform: entry.platform,
          message: entry.message, lang: entry.lang, company: $('#wlCompany') ? $('#wlCompany').value : ''
        })
      }).then(function (r) {
        return r.json().catch(function () { return null; }).then(function (d) {
          return { status: r.status, ok: r.ok, data: d };
        });
      }).then(function (res) {
        if (res.ok) {
          // Delivered, so the local copy has no further purpose.
          writeWaitlist(readWaitlist().filter(function (e) { return e.at !== entry.at; }));
          show('wlDone');
          return;
        }
        // No destination configured yet: fall back to the letter rather than
        // showing an error the visitor can do nothing about.
        if (res.status === 503 && res.data && res.data.configured === false) {
          intakeReady = false;
          labelSubmit();
          handOff(entry);
          return;
        }
        show('wlFail');
      }).catch(function () {
        show('wlFail');
      }).then(function () {
        if (btn) btn.disabled = false;
      });
    }

    var retry = $('#wlRetry');
    if (retry) retry.addEventListener('click', function () {
      if (pending && WAITLIST_ENDPOINT) send(pending); else show('wlForm');
    });
    // Sending can fail for reasons the visitor cannot fix. The letter always
    // works, so it stays one click away rather than leaving them at a wall.
    var failMail = $('#wlFailMail');
    if (failMail) failMail.addEventListener('click', function () {
      if (pending) handOff(pending); else show('wlForm');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#wlName'), mail = $('#wlMail');
      var okName = name.value.trim().length > 0;
      var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim());
      $('#fName').classList.toggle('is-err', !okName);
      $('#fMail').classList.toggle('is-err', !okMail);
      if (!okName) { name.focus(); return; }
      if (!okMail) { mail.focus(); return; }

      var entry = {
        name: name.value.trim(), email: mail.value.trim(), platform: plat,
        message: $('#wlMsg').value.trim(), lang: lang, at: new Date().toISOString(),
        status: 'pending'
      };
      pending = entry;
      var list = readWaitlist();
      list.push(entry);
      writeWaitlist(list);

      // The probe already said whether there is anywhere to send this. Asking
      // again just to be refused would cost a round trip and log an error the
      // visitor cannot act on.
      if (WAITLIST_ENDPOINT && intakeReady) send(entry); else handOff(entry);
      form.reset();
    });

    // Anyone who applied while the form only wrote to localStorage is still
    // sitting in their own browser, believing they were signed up. Say so and
    // offer the letter, rather than letting them keep waiting.
    waitlistReopen = function () {
      probe();
      labelSubmit();
      var stale = readWaitlist().filter(function (e) { return e.status !== 'handed'; }).pop();
      var note = $('#wlStale');
      if (!stale || intakeReady) { if (note) note.hidden = true; show('wlForm'); return; }
      if (note) note.hidden = false;
      $('#wlName').value = stale.name || '';
      $('#wlMail').value = stale.email || '';
      if (stale.message) $('#wlMsg').value = stale.message;
      show('wlForm');
    };
    waitlistRelabel = labelSubmit;
    labelSubmit();
  }

  /* ------------------------------------------------------------ consent */
  var CONSENT_KEY = 'escape.consent.v1';
  function readConsent() {
    try { return JSON.parse(LS.get(CONSENT_KEY) || 'null'); } catch (e) { return null; }
  }
  function writeConsent(c) {
    c.necessary = true;
    c.at = new Date().toISOString();
    LS.set(CONSENT_KEY, JSON.stringify(c));
    document.documentElement.dataset.consent = [
      c.analytics ? 'analytics' : '', c.functional ? 'functional' : '', c.marketing ? 'marketing' : ''
    ].filter(Boolean).join(' ') || 'necessary';
  }

  function initConsent() {
    var bar = $('#cookieBar');
    var prefsModal = $('#cookiePrefs');
    var switches = $$('.switch[data-cat]');
    var current = readConsent();

    function paint(c) {
      switches.forEach(function (s) {
        var cat = s.dataset.cat;
        var on = cat === 'necessary' ? true : !!(c && c[cat]);
        s.setAttribute('aria-checked', String(on));
      });
    }

    function showBar(show) {
      if (show) { bar.hidden = false; requestAnimationFrame(function () { bar.classList.add('is-open'); }); }
      else { bar.classList.remove('is-open'); setTimeout(function () { bar.hidden = true; }, 520); }
    }

    switches.forEach(function (s) {
      if (s.disabled) return;
      s.addEventListener('click', function () {
        s.setAttribute('aria-checked', s.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
      });
    });

    function decide(c) {
      writeConsent(c);
      paint(c);
      showBar(false);
      toast(t('tSaved'));
    }

    $('#ckAll').addEventListener('click', function () {
      decide({ analytics: true, functional: true, marketing: true });
    });
    $('#ckNone').addEventListener('click', function () {
      decide({ analytics: false, functional: false, marketing: false });
    });
    $('#ckMore').addEventListener('click', function () {
      paint(readConsent());
      openModal('cookiePrefs');
    });
    $('#cookieOpen').addEventListener('click', function () {
      paint(readConsent());
      openModal('cookiePrefs');
    });
    $('#cpSave').addEventListener('click', function () {
      var c = {};
      switches.forEach(function (s) {
        if (s.dataset.cat === 'necessary') return;
        c[s.dataset.cat] = s.getAttribute('aria-checked') === 'true';
      });
      decide(c);
      closeModal(prefsModal);
    });

    if (current) { paint(current); writeConsent(current); }
    else { paint(null); setTimeout(function () { showBar(true); }, 900); }
  }

  /* --------------------------------------------------------------- boot */
  function boot() {
    applyLang(detectLang(), false);
    initHeader();
    initReveal();
    initFrag();
    initCounters();
    initThink();
    initTimeline();
    initReplan();
    initRoute();
    initAmsterdam();
    initModes();
    initWorld();
    initHeroParallax();
    initModals();
    initWaitlist();
    initConsent();

    if (progressTargets.length) {
      var ticking = false;
      var handler = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { onProgressScroll(); ticking = false; });
      };
      window.addEventListener('scroll', handler, { passive: true });
      window.addEventListener('resize', handler);
      onProgressScroll();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
