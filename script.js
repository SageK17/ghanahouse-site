/* ============================================================
   GHANA HOUSE v4 — Site script
   ============================================================ */
(function () {
  'use strict';

  var WA_NUMBER = '31687030400';
  var html = document.documentElement;

  /* -- LANGUAGE TOGGLE -------------------------------------------------- */
  function setLang(lang) {
    html.lang = lang;
    try { localStorage.setItem('gh-lang', lang); } catch (e) {}
  }
  try {
    var saved = localStorage.getItem('gh-lang');
    if (saved === 'en' || saved === 'nl') setLang(saved);
  } catch (e) {}

  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      setLang(html.lang === 'nl' ? 'en' : 'nl');
    });
  }

  /* -- HAMBURGER MENU — FIXED ------------------------------------------ */
  var menu = document.getElementById('mobileMenu');
  var menuToggle = document.getElementById('menuToggle');
  var menuClose = document.getElementById('menuClose');

  function openMenu() {
    if (!menu) return;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openMenu();
    });
  }
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  // Close menu when any link inside it is clicked
  document.querySelectorAll('.mobile-menu .m-link').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  // Close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('open')) closeMenu();
  });

  /* -- HEADER SHRINK ON SCROLL ----------------------------------------- */
  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    var lastScroll = 0;
    var ticking = false;
    function onScroll() {
      if (window.scrollY > 30) siteHeader.classList.add('scrolled');
      else siteHeader.classList.remove('scrolled');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  }

  /* -- SCROLL REVEALS via IntersectionObserver ------------------------- */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* -- MARQUEE: duplicate content so the loop is seamless -------------- */
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    var clone = track.innerHTML;
    track.innerHTML = clone + clone;
  });

  /* -- FAQ ACCORDION --------------------------------------------------- */
  document.querySelectorAll('.faq-question').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      if (!item) return;
      item.classList.toggle('open');
    });
  });

  /* -- WHATSAPP PREFILL LINKS ------------------------------------------ */
  function bookingMsg() {
    return html.lang === 'en'
      ? "Hi! I'd like to book an appointment at Ghana House. Service: [SERVICE]. Date/time preference: [DATE/TIME]. Name: [NAME]"
      : "Hoi! Ik wil graag een afspraak maken bij Ghana House. Dienst: [DIENST]. Datum/tijd voorkeur: [DATUM/TIJD]. Naam: [NAAM]";
  }
  function genericMsg() {
    return html.lang === 'en'
      ? "Hi Ghana House, I have a question."
      : "Hoi Ghana House, ik heb een vraag.";
  }
  function updateWaLinks() {
    document.querySelectorAll('[data-wa="booking"]').forEach(function (a) {
      a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(bookingMsg());
    });
    document.querySelectorAll('[data-wa="generic"]').forEach(function (a) {
      a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(genericMsg());
    });
  }
  updateWaLinks();
  if (langToggle) langToggle.addEventListener('click', updateWaLinks);

  /* -- HIGHLIGHT CURRENT NAV LINK -------------------------------------- */
  var current = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var clean = href.replace(/\/$/, '');
    if (clean === current || clean + '.html' === current || (clean === '' && current === '/')) {
      a.classList.add('active');
    }
  });

  /* -- TODAY-IS-OPEN highlight in hours table -------------------------- */
  var hoursTable = document.querySelector('.hours-table');
  if (hoursTable) {
    var dow = new Date().getDay(); // 0=Sun
    var rows = hoursTable.querySelectorAll('tr');
    if (rows[dow]) rows[dow].classList.add('today');
  }

  /* -- COOKIE BANNER (very lightweight, dismiss-only) ------------------ */
  var cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner) {
    try {
      if (localStorage.getItem('gh-cookies-acked')) cookieBanner.style.display = 'none';
    } catch (e) {}
    var accept = document.getElementById('cookieAccept');
    var decline = document.getElementById('cookieDecline');
    function dismissCookies() {
      cookieBanner.style.display = 'none';
      try { localStorage.setItem('gh-cookies-acked', '1'); } catch (e) {}
    }
    if (accept) accept.addEventListener('click', dismissCookies);
    if (decline) decline.addEventListener('click', dismissCookies);
  }
})();

/* ============================================================
   ONLINE BOOKING FORM — Heren knipbeurt + Kids cut only
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

  function loadAvailability() {
    fetch(API_BASE + '/api/availability')
      .then(function (r) { return r.json(); })
      .then(renderAvailability)
      .catch(function (err) {
        console.error('Availability load failed:', err);
        if (availLoading) availLoading.textContent = document.documentElement.lang === 'en'
          ? 'Could not load availability. Refresh the page.'
          : 'Beschikbaarheid kon niet geladen worden. Ververs de pagina.';
      });
  }

  function dowName(dow, lang) {
    if (lang === 'en') return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow];
    return ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'][dow];
  }

  function renderAvailability(data) {
    if (!data || !data.days) {
      if (availLoading) availLoading.textContent = 'Geen data.';
      return;
    }
    var lang = document.documentElement.lang || 'nl';
    if (availLoading) availLoading.style.display = 'none';

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
      if (errors.indexOf('slot') !== -1) setStatus(html.lang === 'en' ? 'Please pick a time slot.' : 'Kies een tijdslot.', 'error');
      else setStatus(html.lang === 'en' ? 'Please fill in the required fields.' : 'Vul de verplichte velden in.', 'error');
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
          return res.json().then(function (err) { throw new Error(err.error || ('Server ' + res.status)); });
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
        if (err && err.message === 'Slot full') loadAvailability();
      });
  });
})();
