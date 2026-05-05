/* ============================================================
   GHANA HOUSE — SHARED JS
   ============================================================ */
(function () {
  'use strict';

  var WA_NUMBER = '31687030400';
  var html = document.documentElement;

  /* -- Language toggle ------------------------------------------------ */
  var saved = null;
  try { saved = localStorage.getItem('gh-lang'); } catch (e) {}
  var initial = saved
    || (navigator.language && navigator.language.toLowerCase().indexOf('en') === 0 ? 'en' : 'nl');
  setLang(initial);

  function setLang(lang) {
    html.lang = lang;
    try { localStorage.setItem('gh-lang', lang); } catch (e) {}
    updateLocalizedWALinks();
    updateOpeningStatus();
  }

  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      setLang(html.lang === 'nl' ? 'en' : 'nl');
    });
  }

  /* -- Mobile menu ---------------------------------------------------- */
  var menu = document.getElementById('mobileMenu');
  var menuToggle = document.getElementById('menuToggle');
  var menuClose = document.getElementById('menuClose');
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }
  if (menuClose && menu) {
    menuClose.addEventListener('click', closeMenu);
  }
  document.querySelectorAll('.mobile-menu .m-link').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* -- Opening hours: today highlight + open/closed indicator -------- */
  var schedule = {
    0: null,                 // Sunday closed
    1: null,                 // Monday closed
    2: [10*60+30, 19*60],    // Tuesday  10:30-19:00
    3: [10*60+30, 19*60],    // Wednesday
    4: [10*60+30, 20*60],    // Thursday until 20:00
    5: [10*60+30, 19*60],    // Friday
    6: [10*60+30, 19*60]     // Saturday
  };

  var today = new Date().getDay();
  var todayRow = document.querySelector('.hours-table tr[data-day="' + today + '"]');
  if (todayRow) todayRow.classList.add('today');

  function updateOpeningStatus() {
    var now = new Date();
    var dow = now.getDay();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var todayHours = schedule[dow];
    var isOpen = todayHours && nowMin >= todayHours[0] && nowMin < todayHours[1];

    var openNowEl = document.getElementById('openingNow');
    if (openNowEl) {
      if (isOpen) {
        openNowEl.classList.remove('closed');
        openNowEl.innerHTML = html.lang === 'en' ? 'Open now' : 'Nu open';
      } else {
        openNowEl.classList.add('closed');
        openNowEl.innerHTML = html.lang === 'en' ? 'Closed now' : 'Nu gesloten';
      }
    }
    var miniEl = document.getElementById('openingStatusMini');
    if (miniEl) {
      miniEl.textContent = isOpen
        ? (html.lang === 'en' ? 'Open now' : 'Nu open')
        : (html.lang === 'en' ? 'Closed now' : 'Nu gesloten');
    }
  }
  updateOpeningStatus();

  /* -- Year in footer ------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* -- WhatsApp order buttons (per-product) -------------------------- */
  document.querySelectorAll('.order-wa').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var product = btn.getAttribute('data-product') || '';
      var price = btn.getAttribute('data-price') || '';
      var msg;
      if (html.lang === 'en') {
        msg = 'Hi Ghana House, I\'d like to order the ' + product +
              ' (' + price + '). My delivery address is: [your address]. ' +
              'How can I pay?';
      } else {
        msg = 'Hallo Ghana House, ik wil graag de ' + product +
              ' (' + price + ') bestellen. Mijn bezorgadres is: [jouw adres]. ' +
              'Hoe kan ik betalen?';
      }
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  /* -- Localized WhatsApp links (booking, generic) ------------------- */
  function updateLocalizedWALinks() {
    var bookingMsg = html.lang === 'en'
      ? 'Hi Ghana House, I\'d like to book an appointment. I\'m interested in:'
      : 'Hallo Ghana House, ik wil graag een afspraak maken. Ik ben geïnteresseerd in:';
    var genericMsg = html.lang === 'en'
      ? 'Hi Ghana House!'
      : 'Hallo Ghana House!';

    document.querySelectorAll('[data-wa="booking"]').forEach(function (a) {
      a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(bookingMsg);
    });
    document.querySelectorAll('[data-wa="generic"]').forEach(function (a) {
      a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(genericMsg);
    });
  }
  updateLocalizedWALinks();

  /* -- Cookie banner -------------------------------------------------- */
  var banner = document.getElementById('cookieBanner');
  var seen = null;
  try { seen = localStorage.getItem('gh-cookie-seen'); } catch (e) {}
  if (!seen && banner) {
    setTimeout(function () { banner.classList.add('visible'); }, 1500);
  }
  function dismissBanner() {
    if (banner) banner.classList.remove('visible');
    try { localStorage.setItem('gh-cookie-seen', '1'); } catch (e) {}
  }
  var ca = document.getElementById('cookieAccept');
  var cd = document.getElementById('cookieDecline');
  if (ca) ca.addEventListener('click', dismissBanner);
  if (cd) cd.addEventListener('click', dismissBanner);

  /* -- Active nav link ------------------------------------------------ */
  var pathname = window.location.pathname.replace(/\/$/, '') || '/';
  var basename = pathname.split('/').pop() || 'index';
  if (basename === '' || basename === 'index.html') basename = 'index';
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var hrefBase = href.replace('.html', '').replace(/^\//, '') || 'index';
    if (hrefBase === basename || (basename === 'index' && (href === '/' || href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

/* ============================================================
   ONLINE BOOKING FORM HANDLER
   ============================================================ */
(function () {
  'use strict';

  // CONFIG: Update this to your deployed Render backend URL after deploy
  // Example: 'https://ghanahouse-admin.onrender.com'
  var API_BASE = window.GHANAHOUSE_API || 'https://ghanahouse-admin.onrender.com';

  var form = document.getElementById('bookingForm');
  if (!form) return;

  var submitBtn = document.getElementById('bk-submit');
  var status = document.getElementById('bk-status');

  // Set min date to today
  var dateInput = document.getElementById('bk-date');
  if (dateInput) {
    var today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = 'form-status ' + (type || '');
  }

  function clearErrors() {
    form.querySelectorAll('.form-field.has-error').forEach(function (el) {
      el.classList.remove('has-error');
    });
  }

  function markError(fieldId) {
    var input = document.getElementById(fieldId);
    if (input) input.closest('.form-field').classList.add('has-error');
  }

  function validate(data) {
    clearErrors();
    var errors = [];
    if (!data.name || data.name.length < 2) { errors.push('name'); markError('bk-name'); }
    if (!data.phone || data.phone.length < 6) { errors.push('phone'); markError('bk-phone'); }
    if (!data.service) { errors.push('service'); markError('bk-service'); }
    if (!data.date) { errors.push('date'); markError('bk-date'); }
    if (!data.time) { errors.push('time'); markError('bk-time'); }
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) { errors.push('email'); markError('bk-email'); }
    return errors;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var html = document.documentElement;
    var data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value,
      date: form.date.value,
      time: form.time.value,
      message: form.message.value.trim(),
      lang: html.lang || 'nl'
    };

    var errors = validate(data);
    if (errors.length) {
      setStatus(html.lang === 'en'
        ? 'Please fill in the required fields.'
        : 'Vul de verplichte velden in.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '...';
    setStatus(html.lang === 'en' ? 'Sending...' : 'Versturen...', '');

    fetch(API_BASE + '/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Server returned ' + res.status);
        return res.json();
      })
      .then(function () {
        form.reset();
        setStatus(html.lang === 'en'
          ? 'Request sent! We\'ll be in touch soon.'
          : 'Aanvraag verstuurd! We nemen snel contact op.', 'success');
        submitBtn.disabled = false;
        submitBtn.textContent = html.lang === 'en' ? 'Send request' : 'Aanvraag versturen';
      })
      .catch(function (err) {
        console.error('Booking submit failed:', err);
        setStatus(html.lang === 'en'
          ? 'Could not send. Please try WhatsApp instead.'
          : 'Kon niet versturen. Probeer anders WhatsApp.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = html.lang === 'en' ? 'Send request' : 'Aanvraag versturen';
      });
  });
})();
