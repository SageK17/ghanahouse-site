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
   ONLINE BOOKING FORM HANDLER v2 — with availability picker
   ============================================================ */
(function () {
  'use strict';

  var API_BASE = window.GHANAHOUSE_API || 'https://admin.ghanahouse.nl';

  var form = document.getElementById('bookingForm');
  if (!form) return;

  var submitBtn = document.getElementById('bk-submit');
  var status = document.getElementById('bk-status');
  var availWeek = document.getElementById('availWeek');
  var availLoading = document.getElementById('availLoading');
  var hiddenDate = document.getElementById('bk-date');
  var hiddenSlot = document.getElementById('bk-slot-start');
  var hiddenTime = document.getElementById('bk-time');

  // Load availability for next 14 days
  function loadAvailability() {
    fetch(API_BASE + '/api/availability')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        renderAvailability(data);
      })
      .catch(function (err) {
        console.error('Availability load failed:', err);
        if (availLoading) availLoading.textContent =
          document.documentElement.lang === 'en'
            ? 'Could not load availability. Refresh the page.'
            : 'Beschikbaarheid kon niet geladen worden. Ververs de pagina.';
      });
  }

  function dowName(dow, lang) {
    if (lang === 'en') {
      return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow];
    }
    return ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'][dow];
  }

  function renderAvailability(data) {
    if (!data || !data.days) {
      if (availLoading) availLoading.textContent = 'Geen data.';
      return;
    }
    var lang = document.documentElement.lang || 'nl';
    if (availLoading) availLoading.style.display = 'none';

    // Only show open days, plus today even if closed (so they see what's happening)
    var html = '';
    var openCount = 0;
    data.days.forEach(function (d) {
      var dateLabel = d.date.slice(8,10) + '/' + d.date.slice(5,7);
      var dayClass = d.isOpen ? '' : 'closed';
      var statusClass, statusLabel;
      if (!d.isOpen) {
        statusClass = 'closed';
        statusLabel = lang === 'en' ? 'Closed' : 'Gesloten';
      } else {
        openCount++;
        var anyFree = d.slots.some(function (s) { return s.capacityRemaining > 0; });
        if (anyFree) { statusClass = 'open'; statusLabel = lang === 'en' ? 'Available' : 'Beschikbaar'; }
        else { statusClass = 'full'; statusLabel = lang === 'en' ? 'Full' : 'Volgeboekt'; }
      }
      html += '<div class="avail-day ' + dayClass + '">' +
        '<div class="avail-day-head">' +
          '<div class="avail-day-name">' + dowName(d.dow, lang) + '</div>' +
          '<div class="avail-day-date">' + dateLabel + '</div>' +
          '<div class="avail-day-status ' + statusClass + '">' + statusLabel + '</div>' +
        '</div>';
      if (d.isOpen) {
        html += '<div class="avail-slots">';
        d.slots.forEach(function (s) {
          var slotClass;
          if (s.capacityRemaining === 0) slotClass = 'full';
          else if (s.capacityRemaining < s.capacityTotal) slotClass = 'partial';
          else slotClass = '';
          var disabled = s.capacityRemaining === 0 ? ' disabled' : '';
          html += '<button type="button" class="avail-slot ' + slotClass + '" data-date="' + d.date + '" data-slot="' + s.start + '" data-time="' + s.time + '"' + disabled + '>' + s.time + '</button>';
        });
        html += '</div>';
      }
      html += '</div>';
    });

    if (!openCount) {
      availWeek.innerHTML = '<div class="empty-state">' + (lang === 'en' ? 'No availability in the next 14 days. Try WhatsApp instead.' : 'Geen beschikbaarheid in de komende 14 dagen. Probeer anders WhatsApp.') + '</div>';
      return;
    }
    availWeek.innerHTML = html;

    // Wire up slot selection
    availWeek.querySelectorAll('.avail-slot:not([disabled])').forEach(function (btn) {
      btn.addEventListener('click', function () {
        availWeek.querySelectorAll('.avail-slot.selected').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        hiddenDate.value = btn.getAttribute('data-date');
        hiddenSlot.value = btn.getAttribute('data-slot');
        hiddenTime.value = btn.getAttribute('data-time');
      });
    });
  }

  loadAvailability();

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = 'form-status ' + (type || '');
  }

  function clearErrors() {
    form.querySelectorAll('.form-field.has-error').forEach(function (el) { el.classList.remove('has-error'); });
  }

  function markError(fieldId) {
    var input = document.getElementById(fieldId);
    if (input && input.closest('.form-field')) input.closest('.form-field').classList.add('has-error');
  }

  function validate(data) {
    clearErrors();
    var errors = [];
    if (!data.name || data.name.length < 2) { errors.push('name'); markError('bk-name'); }
    if (!data.phone || data.phone.length < 6) { errors.push('phone'); markError('bk-phone'); }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) { errors.push('email'); markError('bk-email'); }
    if (!data.service) { errors.push('service'); markError('bk-service'); }
    if (!data.date || !data.time) errors.push('slot');
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
      date: hiddenDate.value,
      time: hiddenTime.value,
      slot_start: hiddenSlot.value ? parseInt(hiddenSlot.value, 10) : null,
      slot_count: 1,
      message: form.message.value.trim(),
      lang: html.lang || 'nl'
    };

    var errors = validate(data);
    if (errors.length) {
      if (errors.indexOf('slot') !== -1) {
        setStatus(html.lang === 'en' ? 'Please pick a time slot.' : 'Kies een tijdslot.', 'error');
      } else {
        setStatus(html.lang === 'en' ? 'Please fill in the required fields.' : 'Vul de verplichte velden in.', 'error');
      }
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
        if (!res.ok) {
          return res.json().then(function (err) {
            throw new Error(err.error || ('Server ' + res.status));
          });
        }
        return res.json();
      })
      .then(function () {
        form.reset();
        hiddenDate.value = ''; hiddenSlot.value = ''; hiddenTime.value = '';
        availWeek.querySelectorAll('.avail-slot.selected').forEach(function (b) { b.classList.remove('selected'); });
        setStatus(html.lang === 'en'
          ? 'Request sent! We\'ll be in touch soon, and you\'ll get a confirmation email.'
          : 'Aanvraag verstuurd! We nemen snel contact op, en je krijgt een bevestigingsmail.', 'success');
        submitBtn.disabled = false;
        submitBtn.textContent = html.lang === 'en' ? 'Send request' : 'Aanvraag versturen';
        // Reload availability — the slot might now be partial/full
        setTimeout(loadAvailability, 500);
      })
      .catch(function (err) {
        console.error('Booking submit failed:', err);
        var msg = err && err.message === 'Slot full'
          ? (html.lang === 'en' ? 'That slot just filled up. Pick another.' : 'Dat slot is net volgeboekt. Kies een ander.')
          : (html.lang === 'en' ? 'Could not send. Please try WhatsApp instead.' : 'Kon niet versturen. Probeer anders WhatsApp.');
        setStatus(msg, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = html.lang === 'en' ? 'Send request' : 'Aanvraag versturen';
        // Reload availability if slot filled
        if (err && err.message === 'Slot full') loadAvailability();
      });
  });
})();
