/* ============================================================
   GHANA HOUSE — Webshop (cart + Mollie checkout)
   ============================================================ */
(function () {
  'use strict';
  var API_BASE = window.GHANAHOUSE_API || 'https://admin.ghanahouse.nl';
  var grid = document.getElementById('shopGrid');
  if (!grid) return;

  var loadingEl = document.getElementById('shopLoading');
  var comingEl = document.getElementById('shopComing');
  var mainEl = document.getElementById('shopMain');
  var filtersEl = document.getElementById('shopFilters');
  var cartLinesEl = document.getElementById('cartLines');
  var cartTotalsEl = document.getElementById('cartTotals');
  var toCheckoutBtn = document.getElementById('toCheckout');
  var form = document.getElementById('checkoutForm');
  var statusEl = document.getElementById('checkoutStatus');
  // Cart drawer + floating button
  var fab = document.getElementById('cartFab');
  var fabCount = document.getElementById('cartFabCount');
  var fabTotal = document.getElementById('cartFabTotal');
  var drawer = document.getElementById('cartDrawer');
  var drawerScrim = document.getElementById('cartDrawerScrim');
  var drawerClose = document.getElementById('cartDrawerClose');
  var keepShopping = document.getElementById('cartKeepShopping');

  var PRODUCTS = [];
  var SHIPPING = { cents: 0, freeOverCents: 0 };
  var byId = {};
  var cart = loadCart();
  var activeFilter = 'all';

  function t(nl, en) { return document.documentElement.lang === 'en' ? en : nl; }
  function eur(cents) { return (cents / 100).toFixed(2).replace('.', ','); }
  function loadCart() { try { return JSON.parse(localStorage.getItem('gh-cart') || '{}') || {}; } catch (e) { return {}; } }
  function saveCart() { try { localStorage.setItem('gh-cart', JSON.stringify(cart)); } catch (e) {} }

  fetch(API_BASE + '/api/shop/products')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (loadingEl) loadingEl.style.display = 'none';
      PRODUCTS = data.products || [];
      SHIPPING = data.shipping || SHIPPING;
      PRODUCTS.forEach(function (p) { byId[p.id] = p; });
      // prune cart of removed/disabled products
      Object.keys(cart).forEach(function (id) { if (!byId[id]) delete cart[id]; });
      saveCart();
      var costEl = document.querySelector('[data-ship-cost]');
      if (costEl) costEl.textContent = t('NL & BE · € ' + eur(SHIPPING.cents) + ' (gratis vanaf € ' + eur(SHIPPING.freeOverCents) + ')',
        'NL & BE · € ' + eur(SHIPPING.cents) + ' (free from € ' + eur(SHIPPING.freeOverCents) + ')');
      if (!data.enabled) { if (comingEl) comingEl.hidden = false; return; }
      if (mainEl) mainEl.hidden = false;
      renderFilters();
      renderGrid();
      renderCart();
      wireCheckout();
      // Deep-link: /shop#cart opens the cart drawer straight away
      if (location.hash === '#cart' && cartCount() > 0) openDrawer();
      // Re-render shop UI when the visitor toggles NL/EN (labels, totals, ship cost).
      var lt = document.getElementById('langToggle');
      if (lt) lt.addEventListener('click', function () {
        setTimeout(function () {
          if (mainEl && !mainEl.hidden) { renderFilters(); renderGrid(); renderCart(); }
          var costEl = document.querySelector('[data-ship-cost]');
          if (costEl) costEl.textContent = t('NL & BE · € ' + eur(SHIPPING.cents) + ' (gratis vanaf € ' + eur(SHIPPING.freeOverCents) + ')',
            'NL & BE · € ' + eur(SHIPPING.cents) + ' (free from € ' + eur(SHIPPING.freeOverCents) + ')');
        }, 0);
      });
    })
    .catch(function () {
      if (loadingEl) loadingEl.style.display = 'none';
      if (comingEl) comingEl.hidden = false;
    });

  // Category label computed at render time so it follows the NL/EN toggle.
  function catLabel(c) {
    return ({ all: t('Alles', 'All'), bundles: 'Bundles', frontals: 'Frontals & Closures', care: t('Verzorging', 'Care'), styling: 'Styling', accessories: t('Accessoires', 'Accessories') })[c] || c;
  }
  function renderFilters() {
    var cats = ['all'].concat(PRODUCTS.map(function (p) { return p.category; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    filtersEl.innerHTML = cats.map(function (c) {
      return '<button class="shop-filter' + (c === activeFilter ? ' active' : '') + '" data-cat="' + c + '">' + catLabel(c) + '</button>';
    }).join('');
    filtersEl.querySelectorAll('.shop-filter').forEach(function (b) {
      b.addEventListener('click', function () { activeFilter = b.getAttribute('data-cat'); renderFilters(); renderGrid(); });
    });
  }

  function renderGrid() {
    var list = PRODUCTS.filter(function (p) { return activeFilter === 'all' || p.category === activeFilter; });
    grid.innerHTML = list.map(function (p) {
      return '<div class="shop-card fx-sheen-host">' +
        '<i class="fx-sheen" aria-hidden="true"></i>' +
        '<span class="shop-card-cat">' + catLabel(p.category) + '</span>' +
        '<div class="shop-card-name">' + esc(p.name) + '</div>' +
        (p.description ? '<div class="shop-card-desc">' + esc(p.description) + '</div>' : '<div class="shop-card-desc"></div>') +
        '<div class="shop-card-foot">' +
          '<span class="shop-card-price">€ ' + eur(p.priceCents) + '</span>' +
          '<button class="shop-card-add" data-add="' + esc(p.id) + '">' + t('In mand', 'Add') + '</button>' +
        '</div></div>';
    }).join('');
    grid.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-add');
        cart[id] = (cart[id] || 0) + 1; saveCart(); renderCart();
        b.classList.add('added'); b.textContent = t('Toegevoegd', 'Added');
        flyToCart(b); bumpCart();
        setTimeout(function () { b.classList.remove('added'); b.textContent = t('In mand', 'Add'); }, 1100);
      });
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bumpCart() {
    if (!fab) return;
    fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
  }
  function flyToCart(btn) {
    if (!fab || reduceMotion || !btn.animate || fab.hidden) return;
    var s = btn.getBoundingClientRect(), e = fab.getBoundingClientRect();
    var dot = document.createElement('div'); dot.className = 'fly-dot';
    dot.style.left = (s.left + s.width / 2 - 8) + 'px';
    dot.style.top = (s.top + s.height / 2 - 8) + 'px';
    document.body.appendChild(dot);
    var dx = (e.left + e.width / 2) - (s.left + s.width / 2);
    var dy = (e.top + e.height / 2) - (s.top + s.height / 2);
    dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.3)', opacity: 0.15 }
    ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = function () { dot.remove(); };
  }

  /* -- Drawer open/close ------------------------------------------------ */
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function selectedDelivery() {
    var r = form && form.querySelector('input[name="delivery"]:checked');
    return r ? r.value : 'pickup';
  }
  function cartSubtotal() {
    return Object.keys(cart).reduce(function (s, id) { return s + (byId[id] ? byId[id].priceCents * cart[id] : 0); }, 0);
  }
  function shippingCost(subtotal) {
    if (selectedDelivery() !== 'ship') return 0;
    return subtotal >= SHIPPING.freeOverCents ? 0 : SHIPPING.cents;
  }

  function cartCount() {
    return Object.keys(cart).reduce(function (s, id) { return s + (byId[id] ? cart[id] : 0); }, 0);
  }
  function updateFab() {
    if (!fab) return;
    var n = cartCount();
    if (!n) { fab.hidden = true; return; }
    fab.hidden = false;
    if (fabCount) fabCount.textContent = n;
    var sub = cartSubtotal();
    if (fabTotal) fabTotal.textContent = '€ ' + eur(sub + shippingCost(sub));
  }

  function renderCart() {
    updateFab();
    var ids = Object.keys(cart).filter(function (id) { return byId[id] && cart[id] > 0; });
    if (!ids.length) {
      cartLinesEl.innerHTML = '<div class="cart-empty">' + t('Je mand is nog leeg.', 'Your cart is empty.') + '</div>';
      cartTotalsEl.hidden = true; toCheckoutBtn.hidden = true; if (form) form.hidden = true;
      return;
    }
    cartLinesEl.innerHTML = ids.map(function (id) {
      var p = byId[id];
      return '<div class="cart-line"><div class="cart-line-info">' +
        '<div class="cart-line-name">' + esc(p.name) + '</div>' +
        '<div class="cart-line-price">€ ' + eur(p.priceCents) + '</div></div>' +
        '<div class="cart-qty"><button data-dec="' + esc(id) + '" aria-label="minder">−</button>' +
        '<span>' + cart[id] + '</span>' +
        '<button data-inc="' + esc(id) + '" aria-label="meer">+</button></div>' +
        '<button class="cart-line-rm" data-rm="' + esc(id) + '" aria-label="verwijder">×</button></div>';
    }).join('');
    cartLinesEl.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { cart[b.getAttribute('data-inc')]++; saveCart(); renderCart(); }; });
    cartLinesEl.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { var id = b.getAttribute('data-dec'); cart[id] = Math.max(0, cart[id] - 1); if (!cart[id]) delete cart[id]; saveCart(); renderCart(); }; });
    cartLinesEl.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { delete cart[b.getAttribute('data-rm')]; saveCart(); renderCart(); }; });

    var sub = cartSubtotal();
    var ship = shippingCost(sub);
    cartTotalsEl.hidden = false;
    cartTotalsEl.innerHTML =
      '<div class="cart-totals-row"><span>' + t('Subtotaal', 'Subtotal') + '</span><span>€ ' + eur(sub) + '</span></div>' +
      (selectedDelivery() === 'ship' ? '<div class="cart-totals-row"><span>' + t('Verzending', 'Shipping') + '</span><span>' + (ship ? '€ ' + eur(ship) : t('Gratis', 'Free')) + '</span></div>' : '') +
      '<div class="cart-totals-row grand"><span>' + t('Totaal', 'Total') + '</span><span>€ ' + eur(sub + ship) + '</span></div>';
    // Keep "Afrekenen" hidden once the form is already open
    toCheckoutBtn.hidden = !!(form && !form.hidden);
  }

  function wireCheckout() {
    // Floating cart button + drawer controls
    if (fab) fab.addEventListener('click', openDrawer);
    if (drawerScrim) drawerScrim.addEventListener('click', closeDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (keepShopping) keepShopping.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer();
    });

    toCheckoutBtn.addEventListener('click', function () {
      form.hidden = false;
      toCheckoutBtn.hidden = true;
      var body = document.querySelector('.cart-drawer-body');
      if (body) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
      var firstInput = form.querySelector('input[name="name"]');
      if (firstInput) setTimeout(function () { firstInput.focus(); }, 350);
    });
    form.querySelectorAll('input[name="delivery"]').forEach(function (r) {
      r.addEventListener('change', function () {
        document.getElementById('optPickup').classList.toggle('active', selectedDelivery() === 'pickup');
        document.getElementById('optShip').classList.toggle('active', selectedDelivery() === 'ship');
        document.getElementById('shipFields').classList.toggle('show', selectedDelivery() === 'ship');
        renderCart();
      });
    });
    form.addEventListener('submit', onCheckout);
  }

  function onCheckout(e) {
    e.preventDefault();
    var items = Object.keys(cart).filter(function (id) { return cart[id] > 0; }).map(function (id) { return { id: id, qty: cart[id] }; });
    if (!items.length) return;
    var deliv = selectedDelivery();
    var payload = {
      items: items, delivery: deliv, lang: document.documentElement.lang,
      customer: { name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim() }
    };
    if (deliv === 'ship') {
      payload.address = { street: form.street.value.trim(), postal: form.postal.value.trim(), city: form.city.value.trim(), country: form.country.value };
      if (!payload.address.street || !payload.address.postal || !payload.address.city) {
        return setStatus(t('Vul je verzendadres volledig in.', 'Please complete your shipping address.'), 'error');
      }
    }
    if (!payload.customer.name || !/^\S+@\S+\.\S+$/.test(payload.customer.email)) {
      return setStatus(t('Vul je naam en een geldig e-mailadres in.', 'Enter your name and a valid email.'), 'error');
    }
    var btn = document.getElementById('payBtn');
    btn.disabled = true; setStatus(t('Je wordt doorgestuurd naar de betaalpagina…', 'Redirecting to payment…'), '');
    fetch(API_BASE + '/api/shop/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.checkoutUrl) throw new Error(res.d.error || 'Checkout failed');
        window.location.href = res.d.checkoutUrl;
      })
      .catch(function (err) {
        btn.disabled = false;
        setStatus(t('Afrekenen mislukt: ', 'Checkout failed: ') + err.message, 'error');
      });
  }

  function setStatus(msg, type) { if (!statusEl) return; statusEl.textContent = msg; statusEl.className = 'form-status' + (type ? ' ' + type : ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
})();
