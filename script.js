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
    // Swap the document <title> and meta description to match the language.
    // Elements opt in with data-nl / data-en attributes (NL stays the static
    // default for SEO; EN applies when the visitor toggles).
    var titleEl = document.querySelector('title[data-nl]');
    if (titleEl) {
      var t = titleEl.getAttribute('data-' + lang);
      if (t) document.title = t;
    }
    var descEl = document.querySelector('meta[name="description"][data-nl]');
    if (descEl) {
      var d = descEl.getAttribute('data-' + lang);
      if (d) descEl.setAttribute('content', d);
    }
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
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      if (!item) return;
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
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
   ONLINE BOOKING FORM v4.1 — Month calendar + slot picker
   Heren knipbeurt + Kids cut only
   ============================================================ */
(function () {
  'use strict';

  var API_BASE = window.GHANAHOUSE_API || 'https://admin.ghanahouse.nl';

  var form = document.getElementById('bookingForm');
  if (!form) return;

  var submitBtn = document.getElementById('bk-submit');
  var status = document.getElementById('bk-status');
  var availLoading = document.getElementById('availLoading');
  var hiddenDate = document.getElementById('bk-date');
  var hiddenSlot = document.getElementById('bk-slot-start');
  var hiddenTime = document.getElementById('bk-time');

  var calMonth = document.getElementById('bkCalMonth');
  var calGrid = document.getElementById('bkCalGrid');
  var calPrev = document.getElementById('bkCalPrev');
  var calNext = document.getElementById('bkCalNext');
  var timesWrap = document.getElementById('bkTimes');
  var timesLabel = document.getElementById('bkTimesLabel');
  var timesGrid = document.getElementById('bkTimesGrid');

  // State
  var availabilityData = null;   // raw API response
  var dayMap = {};               // date -> day object
  var cursor = new Date();       // currently displayed month
  cursor.setDate(1);
  cursor.setHours(0,0,0,0);
  var selectedDate = null;       // 'YYYY-MM-DD'
  var autoSelected = false;      // auto-pick the soonest open day once, so times show immediately

  function ymd(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function startOfWeekMon(d) {
    var x = new Date(d); x.setHours(0,0,0,0);
    var dow = x.getDay();
    var diff = (dow === 0 ? -6 : 1 - dow);
    x.setDate(x.getDate() + diff);
    return x;
  }
  function monthLabel(d, lang) {
    var nl = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
    var en = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var arr = lang === 'en' ? en : nl;
    return arr[d.getMonth()] + ' ' + d.getFullYear();
  }

  var availRetried = false;
  function loadAvailability() {
    // Load 60 days ahead (covers ~2 months of viewable calendar)
    var today = new Date(); today.setHours(0,0,0,0);
    var start = ymd(today);
    var endDate = new Date(today); endDate.setDate(endDate.getDate() + 60);
    var end = ymd(endDate);

    fetch(API_BASE + '/api/availability?start=' + start + '&end=' + end)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        availRetried = false;
        availabilityData = data;
        dayMap = {};
        (data.days || []).forEach(function (d) { dayMap[d.date] = d; });
        if (availLoading) availLoading.style.display = 'none';
        renderCalendar();
      })
      .catch(function (err) {
        console.error('Availability load failed:', err);
        // One silent retry for transient network blips, then show a usable fallback.
        if (!availRetried) {
          availRetried = true;
          setTimeout(loadAvailability, 1800);
          return;
        }
        showAvailabilityFallback();
      });
  }

  // When the booking backend is unreachable, the customer should never hit a
  // dead end — offer WhatsApp + phone so they can still book.
  function showAvailabilityFallback() {
    if (!availLoading) return;
    var lang = document.documentElement.lang === 'en' ? 'en' : 'nl';
    var waMsg = lang === 'en'
      ? 'Hi Ghana House! The online calendar is down — I would like to book an appointment.'
      : 'Hoi Ghana House! De online agenda doet het even niet — ik wil graag een afspraak maken.';
    var waLink = 'https://wa.me/31687030400?text=' + encodeURIComponent(waMsg);
    var title = lang === 'en' ? 'Calendar temporarily unavailable' : 'Agenda even niet bereikbaar';
    var body = lang === 'en'
      ? "We can't load live availability right now. No problem — book directly via WhatsApp or call us and we'll sort it out."
      : 'We kunnen de live beschikbaarheid nu niet laden. Geen probleem — boek direct via WhatsApp of bel ons, dan regelen we het.';
    var waBtn = lang === 'en' ? 'Book via WhatsApp' : 'Boek via WhatsApp';
    var callBtn = lang === 'en' ? 'Call us' : 'Bel ons';
    availLoading.style.display = 'block';
    availLoading.innerHTML =
      '<div style="text-align:center;padding:8px 0;">' +
        '<div style="font-family:var(--font-display);font-size:20px;margin-bottom:8px;">' + title + '</div>' +
        '<p style="font-size:14px;opacity:.75;margin:0 auto 18px;max-width:380px;line-height:1.55;">' + body + '</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">' +
          '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn btn-wa">' +
            '<svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor"><path d="M16.003 3C9.382 3 4 8.383 4 15c0 2.124.555 4.193 1.61 6.014L4 28l7.18-1.586A11.94 11.94 0 0 0 16.003 28C22.624 28 28 22.617 28 16S22.624 3 16.003 3z"/></svg>' + waBtn + '</a>' +
          '<a href="tel:+31687030400" class="btn btn-outline">' + callBtn + '</a>' +
        '</div>' +
      '</div>';
  }

  function renderCalendar() {
    var lang = document.documentElement.lang || 'nl';
    calMonth.textContent = monthLabel(cursor, lang);

    // Disable prev if cursor is current month
    var todayMonth = new Date(); todayMonth.setDate(1); todayMonth.setHours(0,0,0,0);
    calPrev.disabled = cursor <= todayMonth;

    var first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    var gridStart = startOfWeekMon(first);
    var todayStr = ymd(new Date());
    var html = '';

    for (var i = 0; i < 42; i++) {
      var d = new Date(gridStart); d.setDate(d.getDate() + i);
      var dateStr = ymd(d);
      var inMonth = d.getMonth() === cursor.getMonth();
      var isPast = dateStr < todayStr;
      var isToday = dateStr === todayStr;
      var day = dayMap[dateStr];

      var classes = ['bk-cal-day'];
      if (!inMonth) classes.push('other-month');
      if (isToday) classes.push('today');
      if (isPast && !isToday) classes.push('past');

      var hasData = !!day;
      var disabled = isPast || !inMonth || !hasData;

      if (hasData && inMonth && !isPast) {
        if (!day.isOpen) {
          classes.push('closed');
          disabled = true;
        } else {
          var anyFree = day.slots.some(function (s) { return s.capacityRemaining > 0; });
          var anyPartial = day.slots.some(function (s) { return s.capacityRemaining > 0 && s.capacityRemaining < s.capacityTotal; });
          var allFull = day.slots.every(function (s) { return s.capacityRemaining === 0; });
          if (allFull) { classes.push('full'); disabled = true; }
          else if (anyPartial) classes.push('partial');
          else classes.push('open');
        }
      } else if (!inMonth || isPast) {
        disabled = true;
      }

      if (selectedDate === dateStr) classes.push('selected');

      var attrs = 'data-date="' + dateStr + '"';
      if (disabled) attrs += ' aria-disabled="true" disabled';

      html += '<button type="button" class="' + classes.join(' ') + '" ' + attrs + '>' + d.getDate() + '</button>';
    }
    calGrid.innerHTML = html;

    // Wire clicks
    calGrid.querySelectorAll('.bk-cal-day').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        if (btn.classList.contains('past') || btn.classList.contains('other-month') || btn.classList.contains('closed') || btn.classList.contains('full')) return;
        selectDate(btn.getAttribute('data-date'));
      });
    });

    // Auto-select the soonest available day once, so the visitor sees times
    // immediately (one less click). Only on first render, not on month navigation.
    if (!autoSelected && !selectedDate) {
      var firstOpen = calGrid.querySelector('.bk-cal-day.open:not([disabled]), .bk-cal-day.partial:not([disabled])');
      if (firstOpen) { autoSelected = true; selectDate(firstOpen.getAttribute('data-date'), true); }
    }
  }

  function selectDate(dateStr, noScroll) {
    selectedDate = dateStr;
    hiddenDate.value = dateStr;
    // Reset time selection — user must pick a time after picking a date
    hiddenSlot.value = '';
    hiddenTime.value = '';

    // Update calendar visual
    calGrid.querySelectorAll('.bk-cal-day.selected').forEach(function (b) { b.classList.remove('selected'); });
    var picked = calGrid.querySelector('[data-date="' + dateStr + '"]');
    if (picked) picked.classList.add('selected');

    renderTimes(dateStr, noScroll);
  }

  function renderTimes(dateStr, noScroll) {
    var lang = document.documentElement.lang || 'nl';
    var day = dayMap[dateStr];
    if (!day || !day.isOpen) { timesWrap.style.display = 'none'; return; }
    timesWrap.style.display = '';

    var dayNames = lang === 'en'
      ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      : ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
    var date = new Date(dateStr + 'T00:00:00');
    var dayName = dayNames[date.getDay()];
    var dateLabel = date.getDate() + ' ' + (lang === 'en'
      ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()]
      : ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'][date.getMonth()]);
    timesLabel.textContent = (lang === 'en' ? 'Pick a time on ' : 'Kies een tijd op ') + dayName + ' ' + dateLabel;

    var html = '';
    day.slots.forEach(function (s) {
      var cls = 'bk-time-btn';
      var disabled = '';
      var label = s.time;
      if (s.capacityRemaining === 0) { cls += ' full'; disabled = ' aria-disabled="true" disabled'; }
      else if (s.capacityRemaining < s.capacityTotal) cls += ' partial';
      html += '<button type="button" class="' + cls + '" data-slot="' + s.start + '" data-time="' + s.time + '"' + disabled + '>' + label + '</button>';
    });
    timesGrid.innerHTML = html;

    timesGrid.querySelectorAll('.bk-time-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        timesGrid.querySelectorAll('.bk-time-btn.selected').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        hiddenSlot.value = btn.getAttribute('data-slot');
        hiddenTime.value = btn.getAttribute('data-time');
      });
    });

    // Smooth scroll into view on mobile (not on the auto-select at page load)
    if (!noScroll && window.innerWidth < 700) {
      setTimeout(function () { timesWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
    }
  }

  calPrev.addEventListener('click', function () {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    renderCalendar();
  });
  calNext.addEventListener('click', function () {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    renderCalendar();
  });

  loadAvailability();

  // Form submission
  function setStatus(msg, type) { status.textContent = msg; status.className = 'form-status ' + (type || ''); }
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
        var needTime = !!hiddenDate.value && !hiddenTime.value;
        setStatus(needTime
          ? (html.lang === 'en' ? 'Almost there — pick a time.' : 'Bijna klaar — kies nog een tijd.')
          : (html.lang === 'en' ? 'Please pick a date and time.' : 'Kies een datum en tijd.'), 'error');
        var calEl = document.getElementById('bkCalendar');
        if (calEl) calEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setStatus(html.lang === 'en' ? 'Please fill in the required fields.' : 'Vul de verplichte velden in.', 'error');
        var firstErr = form.querySelector('.form-field.has-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        if (!res.ok) return res.json().then(function (err) { throw new Error(err.error || ('Server ' + res.status)); });
        return res.json();
      })
      .then(function () {
        form.reset();
        hiddenDate.value = ''; hiddenSlot.value = ''; hiddenTime.value = '';
        selectedDate = null;
        timesWrap.style.display = 'none';
        calGrid.querySelectorAll('.bk-cal-day.selected').forEach(function (b) { b.classList.remove('selected'); });
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

/* -- Clickable service cards on the homepage -------------------------- */
(function () {
  var cards = document.querySelectorAll('.services-grid .service-card');
  cards.forEach(function (card) {
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    var go = function () { window.location.href = '/services'; };
    card.addEventListener('click', function (e) { if (e.target.closest('a')) return; go(); });
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
})();

/* ============================================================
   v5 — "ALL OUT" visual effects (site-wide, progressive)
   Scroll progress, film grain, count-up stats, soft parallax,
   card sheen, staggered scroll reveals. Each piece is guarded
   so a failure never blocks the others.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Inject grain + scroll-progress nodes once */
  try {
    if (!reduce && !document.querySelector('.gh-grain')) {
      var grain = document.createElement('div'); grain.className = 'gh-grain'; document.body.appendChild(grain);
    }
    var prog = document.createElement('div'); prog.className = 'gh-progress'; document.body.appendChild(prog);
    var progTick = false;
    function updateProgress() {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      prog.style.width = Math.min(100, (h.scrollTop / max) * 100) + '%';
      progTick = false;
    }
    window.addEventListener('scroll', function () {
      if (!progTick) { requestAnimationFrame(updateProgress); progTick = true; }
    }, { passive: true });
    updateProgress();
  } catch (e) {}

  /* Count-up numbers when they scroll into view */
  function animateCount(el) {
    var raw = el.getAttribute('data-count-raw') || el.textContent.trim();
    var m = raw.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
    if (!m) return;                                   // skip non-numeric (e.g. ★★★★★)
    el.setAttribute('data-count-raw', raw);
    var target = parseFloat(m[1].replace(',', '.'));
    var decimals = (m[1].split(/[.,]/)[1] || '').length;
    var suffix = m[2];
    var usesComma = m[1].indexOf(',') > -1;
    if (reduce) { el.textContent = raw; return; }
    var start = null, dur = 1100;
    el.classList.add('fx-countup');
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      if (usesComma) val = val.replace('.', ',');
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = raw;
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); countObs.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.hero-stat-num, .stat-n').forEach(function (el) { countObs.observe(el); });
  }

  /* Card sheen — wrap eligible static cards with a sweep overlay */
  try {
    document.querySelectorAll('.service-card, .review-card, .step-card, .gallery-item').forEach(function (card) {
      if (card.querySelector(':scope > .fx-sheen')) return;
      card.classList.add('fx-sheen-host');
      var i = document.createElement('i'); i.className = 'fx-sheen'; i.setAttribute('aria-hidden', 'true');
      card.appendChild(i);
    });
  } catch (e) {}

  /* Staggered scroll-reveal for grid children that weren't already tagged */
  if ('IntersectionObserver' in window) {
    var grids = ['.services-grid', '.gallery-grid', '.reviews-grid', '.steps-grid', '.values-grid'];
    var extraObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); extraObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    grids.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (grid) {
        var kids = grid.children;
        for (var i = 0; i < kids.length; i++) {
          var k = kids[i];
          if (k.classList.contains('reveal')) continue;
          k.classList.add('reveal');
          k.style.transitionDelay = Math.min(i * 0.07, 0.5) + 's';
          extraObs.observe(k);
        }
      });
    });
  }
})();

/* v6 — markeer de huidige pagina in de navigatie (desktop + mobiel menu) */
(function () {
  'use strict';
  var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav a, .mobile-menu .m-link').forEach(function (a) {
    var href = (a.getAttribute('href') || '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (href === path) a.classList.add('is-current');
  });
})();
