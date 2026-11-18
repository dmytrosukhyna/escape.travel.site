/* ESCAPE! — legal document renderer (RU / UK / EN) */
(function () {
  'use strict';
  var LANGS = ['ru', 'uk', 'en', 'el', 'hr', 'es'];
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var CHROME = {
    ru: {
      back: '← На главную', updated: 'Действует с', version: 'Редакция',
      toc: 'Содержание', operator: 'Оператор', country: 'Страна', site: 'Сайт',
      email: 'Email', privacyContact: 'Вопросы по данным', support: 'Поддержка',
      hours: '10:00–19:00 UTC+3', greece: 'Греция',
      docs: {
        privacy: 'Политика конфиденциальности', terms: 'Пользовательское соглашение',
        cookies: 'Политика cookie', disclaimer: 'AI и travel-оговорка',
        community: 'Правила сообщества'
      },
      rights: 'Все права защищены.'
    },
    uk: {
      back: '← На головну', updated: 'Чинна з', version: 'Редакція',
      toc: 'Зміст', operator: 'Оператор', country: 'Країна', site: 'Сайт',
      email: 'Email', privacyContact: 'Питання щодо даних', support: 'Підтримка',
      hours: '10:00–19:00 UTC+3', greece: 'Греція',
      docs: {
        privacy: 'Політика конфіденційності', terms: 'Умови користування',
        cookies: 'Політика cookie', disclaimer: 'AI та travel-застереження',
        community: 'Правила спільноти'
      },
      rights: 'Усі права захищено.'
    },
    en: {
      back: '← Back to site', updated: 'In effect from', version: 'Version',
      toc: 'Contents', operator: 'Operator', country: 'Country', site: 'Website',
      email: 'Email', privacyContact: 'Data requests', support: 'Support',
      hours: '10:00–19:00 UTC+3', greece: 'Greece',
      docs: {
        privacy: 'Privacy Policy', terms: 'Terms & Conditions',
        cookies: 'Cookie Policy', disclaimer: 'AI & Travel Disclaimer',
        community: 'Community Guidelines'
      },
      rights: 'All rights reserved.'
    },
    // The documents themselves are in Russian, Ukrainian and English; in
    // these three the page says so and shows the English text.
    el: {
      back: '← Στην αρχική', updated: 'Σε ισχύ από', version: 'Έκδοση',
      toc: 'Περιεχόμενα', operator: 'Υπεύθυνος', country: 'Χώρα', site: 'Ιστότοπος',
      email: 'Email', privacyContact: 'Ερωτήματα για δεδομένα', support: 'Υποστήριξη',
      hours: '10:00–19:00 UTC+3', greece: 'Ελλάδα',
      docs: {
        privacy: 'Πολιτική απορρήτου', terms: 'Όροι χρήσης',
        cookies: 'Πολιτική cookies', disclaimer: 'Δήλωση για AI και ταξίδια',
        community: 'Κανόνες κοινότητας'
      },
      rights: 'Με την επιφύλαξη παντός δικαιώματος.',
      enOnly: 'Το κείμενο αυτού του εγγράφου είναι διαθέσιμο στα αγγλικά, στα ρωσικά και στα ουκρανικά. Παρακάτω η αγγλική έκδοση.'
    },
    hr: {
      back: '← Na početnu', updated: 'Na snazi od', version: 'Verzija',
      toc: 'Sadržaj', operator: 'Voditelj obrade', country: 'Država', site: 'Web-stranica',
      email: 'E-mail', privacyContact: 'Upiti o podacima', support: 'Podrška',
      hours: '10:00–19:00 UTC+3', greece: 'Grčka',
      docs: {
        privacy: 'Pravila privatnosti', terms: 'Uvjeti korištenja',
        cookies: 'Pravila o kolačićima', disclaimer: 'Napomena o AI-ju i putovanjima',
        community: 'Pravila zajednice'
      },
      rights: 'Sva prava pridržana.',
      enOnly: 'Tekst ovog dokumenta dostupan je na engleskom, ruskom i ukrajinskom. U nastavku je engleska verzija.'
    },
    es: {
      back: '← Volver al inicio', updated: 'Vigente desde', version: 'Versión',
      toc: 'Índice', operator: 'Responsable', country: 'País', site: 'Sitio web',
      email: 'Email', privacyContact: 'Consultas sobre datos', support: 'Soporte',
      hours: '10:00–19:00 UTC+3', greece: 'Grecia',
      docs: {
        privacy: 'Política de privacidad', terms: 'Términos y condiciones',
        cookies: 'Política de cookies', disclaimer: 'Aviso sobre IA y viajes',
        community: 'Normas de la comunidad'
      },
      rights: 'Todos los derechos reservados.',
      enOnly: 'El texto de este documento está disponible en inglés, ruso y ucraniano. A continuación, la versión en inglés.'
    }
  };

  var PIN = '<svg class="pin" viewBox="0 0 44 84" aria-hidden="true"><g transform="rotate(13 22 40)" fill="currentColor">' +
    '<path fill-rule="evenodd" d="M22 64C14 46 9 36 9 20A13 13 0 1 1 35 20C35 36 30 46 22 64ZM27.4 18A5.4 5.4 0 1 0 16.6 18A5.4 5.4 0 1 0 27.4 18Z"/>' +
    '<circle cx="22" cy="76" r="5.6"/></g></svg>';
  var BRAND = '<span class="brandmark"><span class="word">Escape</span>' + PIN + '</span>';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function detectLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS.indexOf(q) > -1) return q;
    var stored = LS.get('escape.lang');
    if (stored && LANGS.indexOf(stored) > -1) return stored;
    var nav = (navigator.languages || [navigator.language || 'ru']).join(',').toLowerCase();
    if (/\buk\b|\buk-/.test(nav)) return 'uk';
    if (/\bel\b|\bel-/.test(nav)) return 'el';
    if (/\bhr\b|\bhr-|\bbs\b/.test(nav)) return 'hr';
    if (/\bes\b|\bes-/.test(nav)) return 'es';
    if (/\ben\b|\ben-/.test(nav)) return 'en';
    return 'ru';
  }

  var docKey = document.body.dataset.doc;
  var lang = detectLang();

  function render() {
    var c = CHROME[lang];
    var data = (window.LEGAL && window.LEGAL[lang] && window.LEGAL[lang][docKey]) ||
               (window.LEGAL && window.LEGAL.en && window.LEGAL.en[docKey]);
    if (!data) return;

    document.documentElement.lang = lang;
    document.title = data.title + ' — Escape! AI Travel Agent';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', data.intro ? data.intro.replace(/<[^>]+>/g, '').slice(0, 300) : data.title);

    // header
    document.getElementById('brandSlot').innerHTML = BRAND;
    document.getElementById('backLink').textContent = c.back;
    Array.prototype.forEach.call(document.querySelectorAll('.langs button'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });

    var html = '';
    html += '<h1 class="doc-h1">' + esc(data.title) + '</h1>';
    html += '<p class="meta"><span>' + c.updated + ' ' + esc(data.date) + '</span><span>' + c.version + ' ' + esc(data.version) + '</span></p>';

    html += '<div class="opbox">' +
      '<div><small>' + c.operator + '</small><b>DMYTRO SUKHYNA</b></div>' +
      '<div><small>' + c.country + '</small><b>' + c.greece + '</b></div>' +
      '<div><small>' + c.site + '</small><a href="https://www.escapetravel.site">www.escapetravel.site</a></div>' +
      '<div><small>' + c.email + '</small><a href="mailto:escape.travel.ai@gmail.com">escape.travel.ai@gmail.com</a></div>' +
      '<div><small>' + c.privacyContact + '</small><a href="mailto:escape.travel.ai@gmail.com">escape.travel.ai@gmail.com</a></div>' +
      '<div><small>' + c.support + '</small><b>' + c.hours + '</b></div>' +
      '</div>';

    var ownText = window.LEGAL && window.LEGAL[lang] && window.LEGAL[lang][docKey];
    if (!ownText && c.enOnly) html += '<div class="callout" style="margin-top:26px">' + esc(c.enOnly) + '</div>';
    if (data.intro) html += '<div class="callout" style="margin-top:26px">' + data.intro + '</div>';

    html += '<nav class="toc" aria-label="' + c.toc + '"><b>' + c.toc + '</b><ol>';
    data.sections.forEach(function (s, i) {
      html += '<li><a href="#s' + (i + 1) + '">' + (i + 1) + '. ' + esc(s[0]) + '</a></li>';
    });
    html += '</ol></nav>';

    html += '<div class="doc">';
    data.sections.forEach(function (s, i) {
      html += '<section id="s' + (i + 1) + '"><h2><i>' + (i + 1) + '</i><span>' + esc(s[0]) + '</span></h2>' + s[1] + '</section>';
    });
    html += '</div>';

    document.getElementById('docBody').innerHTML = html;

    // footer links
    var fl = document.getElementById('footLinks');
    var pages = [['privacy', '/privacy.html'], ['terms', '/terms.html'], ['cookies', '/cookies.html'],
                 ['disclaimer', '/disclaimer.html'], ['community', '/community.html']];
    fl.innerHTML = pages.map(function (p) {
      return p[0] === docKey ? '<span style="font-weight:700;color:var(--ink)">' + c.docs[p[0]] + '</span>'
                             : '<a href="' + p[1] + '">' + c.docs[p[0]] + '</a>';
    }).join('');
    document.getElementById('footNote').textContent =
      '© 2026 ESCAPE! · DMYTRO SUKHYNA · ' + c.greece + ' · ' + c.rights;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.langs button'), function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang;
      LS.set('escape.lang', lang);
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  });

  render();
})();
