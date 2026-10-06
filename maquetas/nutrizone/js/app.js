/* NutriZone Maqueta 2.0 — interacciones y motion */
(function () {
  'use strict';
  const D = window.NZ_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const byId = Object.fromEntries(D.products.map((p) => [p.id, p]));
  const aisleById = Object.fromEntries(D.aisles.map((a) => [a.id, a]));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const store = {
    get(k, d) { try { const v = localStorage.getItem('nz-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('nz-' + k, JSON.stringify(v)); } catch (e) { /* sin storage */ } },
  };

  // ───────── Laboratorio (variantes) ─────────
  const lab = Object.assign({ hero: 'pedido', motion: 'full', catalog: 'pasillos', card: 'ilustrada', text: 'normal' }, store.get('lab', {}));
  const motionOn = () => !reduced && document.body.dataset.motion !== 'off';
  function applyLab() {
    Object.entries(lab).forEach(([k, v]) => { document.body.dataset[k] = v; });
    $$('.seg').forEach((seg) => $$('button', seg).forEach((b) => b.classList.toggle('is-on', lab[seg.dataset.lab] === b.dataset.v)));
  }
  applyLab();
  $('#labToggle').addEventListener('click', () => {
    const p = $('#labPanel'); p.hidden = !p.hidden; $('#labToggle').setAttribute('aria-expanded', String(!p.hidden));
  });
  $$('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    lab[seg.dataset.lab] = b.dataset.v; store.set('lab', lab); applyLab();
    if (seg.dataset.lab === 'catalog') renderCatalog(true);
    if (seg.dataset.lab === 'motion' && hasGsap && window.ScrollTrigger) ScrollTrigger.refresh();
    toast('Variante aplicada: ' + b.textContent);
  }));

  // ───────── Utilidades ─────────
  const money = (n) => '$' + Math.round(n).toLocaleString('es-AR');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const W = [100, 250, 500, 1000];
  const wLabel = (q, p) => (p.unit === 'u' ? q + (q > 1 ? ' unidades' : ' unidad') : q >= 1000 ? q / 1000 + ' kg' : q + ' g');
  const priceFor = (p, q) => (p.unit === 'g' ? (p.price * q) / 100 : p.price * q);
  const selW = {};
  const getW = (p) => (p.unit === 'u' ? 1 : selW[p.id] || (p.price > 2000 ? 250 : 500));
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ───────── Carrito ─────────
  let cart = store.get('cart', []); // {id, qty, count, off}
  let delivery = 'retiro';
  const keyOf = (i) => i.id + '|' + i.qty + '|' + (i.off || 0);
  function cartCountFor(id, qty) { return cart.filter((i) => i.id === id && i.qty === qty && !i.off).reduce((a, i) => a + i.count, 0); }
  function addToCart(id, qty, n = 1, off = 0, silent = false) {
    const k = id + '|' + qty + '|' + off;
    const it = cart.find((i) => keyOf(i) === k);
    if (it) it.count += n; else cart.push({ id, qty, count: n, off });
    cart = cart.filter((i) => i.count > 0);
    saveCart();
    if (!silent && n > 0) toast('Agregaste ' + byId[id].name + ' · ' + wLabel(qty, byId[id]), 'Ver carrito', openCart);
  }
  function setLine(k, delta) {
    const it = cart.find((i) => keyOf(i) === k); if (!it) return;
    it.count += delta; cart = cart.filter((i) => i.count > 0); saveCart();
  }
  function totals() {
    let sub = 0, save = 0;
    cart.forEach((i) => { const base = priceFor(byId[i.id], i.qty) * i.count; save += (base * i.off) / 100; sub += base - (base * i.off) / 100; });
    return { sub, save, count: cart.reduce((a, i) => a + i.count, 0) };
  }
  function saveCart() { store.set('cart', cart); renderCartUI(); refreshAddAreas(); }
  function renderCartUI() {
    const t = totals();
    const cc = $('#cartCount'); cc.textContent = t.count; cc.classList.toggle('has', t.count > 0);
    const tb = $('#tabBadge'); tb.textContent = t.count; tb.hidden = t.count === 0;
    $('#tabCartLabel').textContent = t.count ? money(t.sub) : 'Carrito';
    document.querySelector('.tab-cart').classList.toggle('has', t.count > 0);
    $('#cartSubtotal').textContent = money(t.sub);
    const left = D.freeShipping - t.sub;
    const pct = Math.min(100, (t.sub / D.freeShipping) * 100);
    $('#shipBar').style.width = pct + '%'; $('#shipTruck').style.left = pct + '%';
    $('#shipBar').parentElement.classList.toggle('done', left <= 0);
    $('#shipText').innerHTML = delivery === 'retiro'
      ? (t.count ? '🏪 Retiro gratis en Coronel Lacarra 1143 · listo en 30 min' : 'Agregá productos y retirás gratis en el local')
      : left > 0 ? 'Te faltan <b>' + money(left) + '</b> para el envío gratis a Gerli' : '🎉 ¡Tenés <b>envío gratis</b> a Gerli!';
    const list = $('#cartList');
    if (!cart.length) {
      list.innerHTML = '<li class="cart-empty"><div class="big">🧺</div><p><b>Tu pedido está vacío</b></p><p>Empezá por los más vendidos o usá el buscador.</p></li>';
    } else {
      list.innerHTML = cart.map((i) => {
        const p = byId[i.id]; const line = priceFor(p, i.qty) * i.count * (1 - i.off / 100);
        return '<li class="cart-item"><span class="ci-em">' + p.emoji + '</span><div class="ci-n">' + esc(p.name) + '<small>' + wLabel(i.qty, p) + '</small></div><div class="ci-r"><b>' + money(line) + '</b><div class="mini-step"><button type="button" data-line="' + keyOf(i) + '" data-d="-1" aria-label="Quitar uno">−</button><span>' + i.count + '</span><button type="button" data-line="' + keyOf(i) + '" data-d="1" aria-label="Sumar uno">+</button></div></div></li>';
      }).join('');
    }
    const inCart = new Set(cart.map((i) => i.id));
    const sug = D.products.filter((p) => p.starter && !inCart.has(p.id)).slice(0, 4);
    $('#cartUpsell').innerHTML = cart.length && sug.length ? '<b>Completá tu pedido</b><div class="upsell-row">' + sug.map((p) => '<button type="button" data-quickadd="' + p.id + '"><span>' + p.emoji + '</span><span>' + esc(p.name) + '<small>+ ' + money(priceFor(p, getW(p))) + ' · ' + wLabel(getW(p), p) + '</small></span></button>').join('') + '</div>' : '';
  }
  $('#cartList').addEventListener('click', (e) => { const b = e.target.closest('[data-line]'); if (b) setLine(b.dataset.line, +b.dataset.d); });
  $$('[data-delivery]').forEach((b) => b.addEventListener('click', () => {
    delivery = b.dataset.delivery; $$('[data-delivery]').forEach((x) => x.classList.toggle('is-on', x === b)); renderCartUI();
  }));
  $('#checkoutBtn').addEventListener('click', () => {
    if (!cart.length) { toast('Agregá al menos un producto para continuar'); return; }
    toast('Maqueta: acá sigue el checkout real de la web 🙂'); confetti($('#checkoutBtn'));
  });

  // ───────── Overlays ─────────
  const scrim = $('#scrim');
  function lockScroll(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function openCart() { closeAllModals(); $('#cartDrawer').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); scrim.hidden = false; lockScroll(true); }
  function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); $('#filters').classList.remove('open'); scrim.hidden = true; lockScroll(false); }
  $('#cartBtn').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
  function openModal(id) { const m = $(id); m.hidden = false; lockScroll(true); }
  function closeAllModals() { $$('.modal').forEach((m) => { m.hidden = true; }); if (!$('#cartDrawer').classList.contains('open')) lockScroll(false); }
  $$('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) closeAllModals(); }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAllModals(); closeCart(); }
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName))) { e.preventDefault(); openPalette(); }
  });

  // ───────── Toast / fly / confetti ─────────
  function toast(msg, action, fn) {
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = '<span>' + msg + '</span>' + (action ? '<button type="button">' + action + '</button>' : '');
    if (action) t.querySelector('button').addEventListener('click', () => { fn(); t.remove(); });
    $('#toasts').appendChild(t);
    while ($('#toasts').children.length > (innerWidth <= 760 ? 1 : 3)) $('#toasts').firstElementChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2800);
  }
  function cartTarget() {
    const tab = $('.tabbar [data-open-cart]');
    return tab && tab.offsetParent ? tab : $('#cartBtn');
  }
  function flyToCart(fromEl, emoji) {
    const target = cartTarget();
    const bump = () => { $('#cartBtn').classList.remove('bump'); void $('#cartBtn').offsetWidth; $('#cartBtn').classList.add('bump'); };
    if (!fromEl || !motionOn()) { bump(); return; }
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'fly'; f.textContent = emoji; document.body.appendChild(f);
    const x0 = a.left + a.width / 2 - 16, y0 = a.top + a.height / 2 - 20, x1 = b.left + b.width / 2 - 16, y1 = b.top + b.height / 2 - 20;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 120;
    f.animate([
      { transform: `translate(${x0}px,${y0}px) scale(1.4)`, opacity: 1 },
      { transform: `translate(${mx}px,${my}px) scale(1.1) rotate(-20deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${x1}px,${y1}px) scale(.4) rotate(10deg)`, opacity: 0.4 },
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { f.remove(); bump(); };
  }
  function confetti(el) {
    if (!motionOn()) return;
    const r = el.getBoundingClientRect(); const colors = ['#ff691f', '#ffb067', '#6fd6b0', '#c2400b', '#9fcbd8'];
    for (let i = 0; i < 36; i++) {
      const c = document.createElement('i'); c.className = 'confetti'; c.style.background = colors[i % colors.length];
      document.body.appendChild(c);
      const x = r.left + r.width / 2, y = r.top + r.height / 2, ang = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 160;
      c.animate([
        { transform: `translate(${x}px,${y}px) rotate(0)`, opacity: 1 },
        { transform: `translate(${x + Math.cos(ang) * dist}px,${y + Math.sin(ang) * dist - 60}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${x + Math.cos(ang) * dist * 1.2}px,${y + Math.sin(ang) * dist + 120}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 },
      ], { duration: 1200 + Math.random() * 500, easing: 'cubic-bezier(.2,.6,.3,1)' }).onfinish = () => c.remove();
    }
  }

  // ───────── Tarjeta de producto ─────────
  function addArea(p) {
    const q = getW(p); const n = cartCountFor(p.id, q);
    if (!n) return '<button type="button" class="add-btn" data-add="' + p.id + '">Agregar<span aria-hidden="true">+</span></button>';
    return '<div class="stepper"><button type="button" data-dec="' + p.id + '" aria-label="Quitar">−</button><span>' + n + '<small>' + wLabel(q, p) + '</small></span><button type="button" data-inc="' + p.id + '" aria-label="Sumar">+</button></div>';
  }
  function priceHtml(p) {
    const q = getW(p);
    return p.unit === 'g'
      ? '<b>' + money(priceFor(p, q)) + '</b><small>' + money(p.price * 10) + ' /kg</small>'
      : '<b>' + money(p.price) + '</b><small>por unidad</small>';
  }
  function media(p, rank) {
    const h = aisleById[p.aisle].hue;
    return '<button type="button" class="p-media" data-qv="' + p.id + '" style="--h:' + h + '" aria-label="Ver ' + esc(p.name) + '">' +
      (p.badge ? '<span class="p-badge">' + p.badge + '</span>' : '') +
      (p.stock <= 10 ? '<span class="p-stock">Quedan pocas</span>' : '') +
      '<span class="bag"><span class="bag-label"><span class="em">' + p.emoji + '</span><span class="lb">NUTRIZONE</span></span></span><span class="jar">' + p.emoji + '</span>' +
      (rank ? '<span class="rank">' + rank + '</span>' : '') + '</button>';
  }
  function card(p, i = 0, opts = {}) {
    const tags = p.tags.slice(0, 2).map((t) => '<span>' + D.tagsInfo[t].label + '</span>').join('');
    const q = getW(p);
    const weights = p.unit === 'g'
      ? '<div class="weights" role="group" aria-label="Peso"><span class="w-pill" style="transform:translateX(calc(' + W.indexOf(q) + ' * (100% + 4px)))"></span>' + W.map((w) => '<button type="button" data-w="' + w + '" data-pid="' + p.id + '" class="' + (w === q ? 'is-on' : '') + '">' + (w >= 1000 ? '1 kg' : w + ' g') + '</button>').join('') + '</div>'
      : '<div class="weights" style="display:block;text-align:center;font-size:12px;color:var(--muted);padding:7px">Envase cerrado</div>';
    const name = opts.hl ? highlight(p.name, opts.hl) : esc(p.name);
    return '<article class="pcard" style="--i:' + i + '" data-card="' + p.id + '">' + media(p, opts.rank) +
      '<div class="p-body"><div class="p-tags">' + tags + '</div><h3 class="p-name">' + name + '</h3><div class="p-price" data-price="' + p.id + '">' + priceHtml(p) + '</div>' + weights +
      '<div class="p-add" data-pid="' + p.id + '">' + addArea(p) + '</div></div></article>';
  }
  function highlight(text, q) {
    const n = norm(text), k = norm(q); const at = n.indexOf(k);
    if (!k || at < 0) return esc(text);
    return esc(text.slice(0, at)) + '<mark>' + esc(text.slice(at, at + q.length)) + '</mark>' + esc(text.slice(at + q.length));
  }
  function refreshAddAreas() {
    $$('.p-add[data-pid]').forEach((el) => { el.innerHTML = addArea(byId[el.dataset.pid]); });
  }
  document.addEventListener('click', (e) => {
    const w = e.target.closest('[data-w]');
    if (w) {
      const p = byId[w.dataset.pid]; selW[p.id] = +w.dataset.w;
      $$('[data-card="' + p.id + '"], .qv[data-card="' + p.id + '"]').forEach((c) => {
        const ws = $$('.weights button', c); ws.forEach((b) => b.classList.toggle('is-on', +b.dataset.w === selW[p.id]));
        const pill = $('.w-pill', c); if (pill) pill.style.transform = 'translateX(calc(' + W.indexOf(selW[p.id]) + ' * (100% + 4px)))';
        const pr = $('[data-price]', c); if (pr) pr.innerHTML = priceHtml(p);
      });
      refreshAddAreas(); return;
    }
    const add = e.target.closest('[data-add]');
    if (add) { const p = byId[add.dataset.add]; flyToCart(add.closest('.pcard, .qv') ? $('.p-media', add.closest('.pcard, .qv')) : add, p.emoji); addToCart(p.id, getW(p)); return; }
    const inc = e.target.closest('[data-inc]');
    if (inc) { const p = byId[inc.dataset.inc]; addToCart(p.id, getW(p), 1, 0, true); flyToCart(inc, p.emoji); return; }
    const dec = e.target.closest('[data-dec]');
    if (dec) { const p = byId[dec.dataset.dec]; addToCart(p.id, getW(p), -1, 0, true); return; }
    const qa = e.target.closest('[data-quickadd]');
    if (qa) { const p = byId[qa.dataset.quickadd]; addToCart(p.id, getW(p)); flyToCart(qa, p.emoji); return; }
    const qv = e.target.closest('[data-qv]');
    if (qv && !e.target.closest('.carousel.dragging')) { openQuickView(qv.dataset.qv); return; }
    const wz = e.target.closest('[data-open-wizard]');
    if (wz) { openWizard(wz.dataset.openWizard || null); return; }
    const ga = e.target.closest('[data-goto-aisle]');
    if (ga) { e.preventDefault(); go('catalogo', () => focusAisle(ga.dataset.gotoAisle)); closeAllModals(); return; }
  });

  // ───────── Quick view ─────────
  function openQuickView(id) {
    const p = byId[id]; const a = aisleById[p.aisle];
    const goal = D.goals.find((g) => g.items.some(([i]) => i === id));
    const pairs = (goal ? goal.items.map(([i]) => byId[i]) : D.products.filter((x) => x.aisle !== p.aisle)).filter((x) => x.id !== id).slice(0, 3);
    $('#qvCard').className = 'modal-card qv'; $('#qvCard').dataset.card = id;
    $('#qvCard').innerHTML = '<button type="button" class="icon-btn modal-close" data-close aria-label="Cerrar">✕</button>' + media(p).replace('data-qv=', 'data-x=') +
      '<div class="qv-body"><span class="eyebrow">' + a.icon + ' ' + a.name + '</span><h2>' + esc(p.name) + '</h2><p class="desc">' + esc(p.desc) + '</p>' +
      '<div class="p-tags">' + p.tags.map((t) => '<span>' + D.tagsInfo[t].icon + ' ' + D.tagsInfo[t].label + '</span>').join('') + '</div>' +
      '<div class="qv-facts"><div><b>' + (p.unit === 'g' ? money(p.price * 10) : money(p.price)) + '</b>' + (p.unit === 'g' ? 'por kilo' : 'por unidad') + '</div><div><b>Hoy</b>fraccionado</div><div><b>' + (p.stock > 10 ? 'Alto' : 'Bajo') + '</b>stock</div></div>' +
      '<div class="p-price" data-price="' + p.id + '">' + priceHtml(p) + '</div>' +
      card(p).match(/<div class="weights[\s\S]*?<\/div>(?=<div class="p-add)/)[0] +
      '<div class="p-add" data-pid="' + p.id + '">' + addArea(p) + '</div>' +
      (pairs.length ? '<div class="qv-pair"><b>Va bien con</b><div class="upsell-row">' + pairs.map((x) => '<button type="button" data-quickadd="' + x.id + '"><span>' + x.emoji + '</span><span>' + esc(x.name) + '<small>+ ' + money(priceFor(x, getW(x))) + '</small></span></button>').join('') + '</div></div>' : '') +
      '</div>';
    openModal('#quickView');
  }

  // ───────── Objetivos ─────────
  const listTotal = (items) => items.reduce((a, [id, q]) => a + priceFor(byId[id], q), 0);
  // ───────── Asistente ─────────
  const wiz = { step: 0, goal: null, size: null };
  const sizes = [
    { id: 'probar', name: 'Solo yo, para probar', icon: '🙋', f: 0.5, note: 'Porciones chicas' },
    { id: 'semana', name: 'Para la semana', icon: '📅', f: 1, note: 'Lo más elegido' },
    { id: 'familia', name: 'Para toda la familia', icon: '👨‍👩‍👧', f: 2, note: 'Rinde el mes' },
  ];
  function scaleQty(p, q, f) {
    if (p.unit === 'u') return Math.max(1, Math.round(q * f));
    const t = q * f; return W.reduce((best, w) => (Math.abs(w - t) < Math.abs(best - t) ? w : best), W[0]);
  }
  function openWizard(goal) { wiz.goal = goal; wiz.step = goal ? 1 : 0; wiz.size = null; renderWizard(); openModal('#wizard'); }
  function renderWizard() {
    const prog = '<div class="wiz-progress">' + [0, 1, 2].map((i) => '<span class="' + (i <= wiz.step ? 'on' : '') + '"></span>').join('') + '</div>';
    let html = '<button type="button" class="icon-btn modal-close" data-close aria-label="Cerrar">✕</button>' + prog;
    if (wiz.step === 0) {
      html += '<h2>¿Qué querés resolver?</h2><p>Elegí una opción. Te armamos una lista con cantidades sugeridas.</p><div class="wiz-opts">' +
        D.goals.map((g, i) => '<button type="button" class="wiz-opt ' + (wiz.goal === g.id ? 'is-on' : '') + '" style="--i:' + i + '" data-wgoal="' + g.id + '"><span class="gi">' + g.icon + '</span>' + g.name + '<small>' + g.pitch + '</small></button>').join('') + '</div>';
    } else if (wiz.step === 1) {
      html += '<h2>¿Para quién es?</h2><p>Ajustamos los gramos según cuánto vas a consumir.</p><div class="wiz-opts">' +
        sizes.map((s, i) => '<button type="button" class="wiz-opt ' + (wiz.size === s.id ? 'is-on' : '') + '" style="--i:' + i + '" data-wsize="' + s.id + '"><span class="gi">' + s.icon + '</span>' + s.name + '<small>' + s.note + '</small></button>').join('') + '</div>' +
        '<div class="wiz-foot"><button type="button" class="link-btn" data-wback>← Volver</button></div>';
    } else {
      const g = D.goals.find((x) => x.id === wiz.goal); const s = sizes.find((x) => x.id === wiz.size);
      const items = g.items.map(([id, q]) => [id, scaleQty(byId[id], q, s.f)]);
      const tot = listTotal(items);
      html += '<h2>Tu lista: ' + g.name + '</h2><p>' + s.name + '. Podés cambiar cantidades después en el carrito.</p><div class="wiz-result">' +
        items.map(([id, q]) => { const p = byId[id]; return '<div class="cart-item"><span class="ci-em">' + p.emoji + '</span><div class="ci-n">' + esc(p.name) + '<small>' + wLabel(q, p) + '</small></div><div class="ci-r"><b>' + money(priceFor(p, q)) + '</b></div></div>'; }).join('') +
        '</div><div class="wiz-foot"><button type="button" class="link-btn" data-wback>← Volver</button><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><span>Total <b style="font-size:22px">' + money(tot) + '</b></span><button type="button" class="btn btn-primary" data-wadd>Agregar todo al pedido</button></div></div>';
      wiz.items = items;
    }
    $('#wizCard').innerHTML = html;
  }
  $('#wizCard').addEventListener('click', (e) => {
    const g = e.target.closest('[data-wgoal]'); if (g) { wiz.goal = g.dataset.wgoal; wiz.step = 1; return renderWizard(); }
    const s = e.target.closest('[data-wsize]'); if (s) { wiz.size = s.dataset.wsize; wiz.step = 2; return renderWizard(); }
    if (e.target.closest('[data-wback]')) { wiz.step = Math.max(0, wiz.step - 1); return renderWizard(); }
    const a = e.target.closest('[data-wadd]');
    if (a) { wiz.items.forEach(([id, q]) => addToCart(id, q, 1, 0, true)); confetti(a); closeAllModals(); setTimeout(openCart, 350); }
  });

  // ───────── Buscador (⌘K) ─────────
  let palSel = 0;
  function openPalette() { closeCart(); openModal('#palette'); $('#palInput').value = ''; renderPalette(''); setTimeout(() => $('#palInput').focus(), 30); }
  $('#searchTrigger').addEventListener('click', openPalette);
  $$('[data-open-search]').forEach((b) => b.addEventListener('click', openPalette));
  function searchProducts(q) {
    const k = norm(q.trim()); if (!k) return [];
    return D.products.map((p) => {
      const n = norm(p.name); let s = 0;
      if (n.startsWith(k)) s += 3; else if (n.includes(k)) s += 2;
      if (norm(aisleById[p.aisle].name).includes(k)) s += 1;
      if (p.tags.some((t) => norm(D.tagsInfo[t].label).includes(k))) s += 1;
      return [p, s];
    }).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1] || b[0].sales - a[0].sales).map(([p]) => p);
  }
  function renderPalette(q) {
    palSel = 0;
    const res = searchProducts(q);
    let html = '';
    if (!q.trim()) {
      html += '<div class="pal-sec">Búsquedas populares</div><div class="pal-chips">' + ['almendras', 'avena', 'whey', 'chía', 'sin tacc', 'granola'].map((t) => '<button type="button" data-palq="' + t + '">' + t + '</button>').join('') + '</div>';
      html += '<div class="pal-sec">Categorías</div>' + D.aisles.map((a) => '<button type="button" class="pal-item" data-goto-aisle="' + a.id + '"><span class="pe">' + a.icon + '</span><span class="pn">' + a.name + '<small>' + a.blurb + '</small></span></button>').join('');
    } else if (!res.length) {
      html += '<div class="empty" style="margin:8px"><div class="big">🔎</div><h3>No encontramos "' + esc(q) + '"</h3><p>Probá con otra palabra o escribinos por WhatsApp y lo conseguimos.</p></div>';
    } else {
      html += '<div class="pal-sec">' + res.length + ' productos</div>' + res.slice(0, 8).map((p) => '<button type="button" class="pal-item" data-qv="' + p.id + '"><span class="pe">' + p.emoji + '</span><span class="pn">' + highlight(p.name, q.trim()) + '<small>' + aisleById[p.aisle].name + '</small></span><span class="pp">' + (p.unit === 'g' ? money(p.price) + '/100 g' : money(p.price)) + '</span></button>').join('');
      if (res.length > 8) html += '<button type="button" class="pal-item" data-palall><span class="pe">→</span><span class="pn">Ver los ' + res.length + ' resultados en el catálogo</span></button>';
    }
    $('#palBody').innerHTML = html; markPal();
  }
  function markPal() { $$('.pal-item', $('#palBody')).forEach((el, i) => el.classList.toggle('is-on', i === palSel)); }
  $('#palInput').addEventListener('input', (e) => renderPalette(e.target.value));
  $('#palInput').addEventListener('keydown', (e) => {
    const items = $$('.pal-item', $('#palBody'));
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = Math.min(items.length - 1, palSel + 1); markPal(); items[palSel] && items[palSel].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'ArrowUp') { e.preventDefault(); palSel = Math.max(0, palSel - 1); markPal(); items[palSel] && items[palSel].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter' && items[palSel]) { e.preventDefault(); items[palSel].click(); }
  });
  $('#palBody').addEventListener('click', (e) => {
    const c = e.target.closest('[data-palq]'); if (c) { $('#palInput').value = c.dataset.palq; renderPalette(c.dataset.palq); $('#palInput').focus(); return; }
    if (e.target.closest('[data-palall]')) { const q = $('#palInput').value; closeAllModals(); go('catalogo', () => { $('#catSearch').value = q; cat.q = q; renderCatalog(); }); return; }
    if (e.target.closest('[data-qv]')) { $('#palette').hidden = true; }
  });
  // ───────── Router ─────────
  let view = 'inicio';
  function go(v, after) {
    const changed = v !== view; view = v;
    $$('.view').forEach((s) => { s.hidden = s.dataset.view !== v; });
    $$('.nav a[data-go], .tabbar a[data-go]').forEach((a) => a.classList.toggle('is-active', a.dataset.go === v && !a.dataset.scroll));
    moveNavPill();
    if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    if (changed) { window.scrollTo({ top: 0, behavior: 'instant' }); if (v === 'catalogo') renderCatalog(true); }
    if (hasGsap && window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 60);
    if (after) setTimeout(after, changed ? 80 : 0);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault(); closeAllModals();
    const target = a.dataset.scroll;
    go(a.dataset.go, target ? () => { const el = document.getElementById(target); if (el) el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto' }); } : null);
  });
  function moveNavPill() {
    const act = $('.nav a.is-active'); const pill = $('#navPill');
    if (!act || !act.offsetParent) { pill.style.width = '0'; return; }
    pill.style.width = act.offsetWidth + 'px'; pill.style.transform = 'translateX(' + act.offsetLeft + 'px)';
  }
  window.addEventListener('resize', () => { moveNavPill(); moveAislePill(); });

  // ───────── Inicio ─────────
  function renderHome() {
    $('#aisleGrid').innerHTML = D.aisles.map((a, i) => {
      return '<button type="button" class="aisle-card reveal" style="--h:' + a.hue + ';--d:' + (i % 3) * 0.08 + 's" data-goto-aisle="' + a.id + '"><span class="aisle-ic">' + a.icon + '</span><span><h3>' + a.name + '</h3><p>' + a.blurb + '</p></span><span class="aisle-go" aria-hidden="true">→</span></button>';
    }).join('');
    const best = D.products.slice().sort((a, b) => b.sales - a.sales).slice(0, 10);
    $('#bestCarousel').innerHTML = best.map((p, i) => card(p, i)).join('');
    const rv = D.reviews.map(([n, w, t]) => '<article class="review"><div class="stars">★★★★★</div><q>' + t + '</q><div class="who"><span>' + n[0] + '</span><div><b>' + n + '</b><small>' + w + '</small></div></div></article>').join('');
    $('#reviewTrack').innerHTML = rv + rv;
    $('#catCountTotal').textContent = D.products.length;
    renderHours();
  }
  function renderHours() {
    let open = false, label = '';
    try {
      const parts = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      const get = (t) => (parts.find((p) => p.type === t) || {}).value || '';
      const h = +get('hour') + +get('minute') / 60; const sunday = /dom/i.test(get('weekday'));
      open = !sunday && ((h >= 9 && h < 13) || (h >= 17 && h < 20));
      label = open ? 'Abierto ahora · cierra a las ' + (h < 13 ? '13' : '20') + ' h' : sunday ? 'Cerrado hoy · abrimos el lunes a las 9 h' : 'Cerrado ahora · abrimos a las ' + (h < 9 ? '9' : h < 17 ? '17' : '9') + ' h';
    } catch (e) { label = 'Lunes a sábados de 9 a 13 h y de 17 a 20 h'; }
    $('#localHours').className = 'local-hours' + (open ? ' open' : '');
    $('#localHours').innerHTML = '<i></i>' + label;
  }

  // Tarjeta de pedido animada del hero
  (function orderDemo() {
    const seq = [['mix-premium', 250], ['granola', 500], ['chia', 250], ['pasta-mani', 1], ['almendras', 250]];
    let i = 0, total = 0, timer = null, visible = true;
    const list = $('#odList');
    function reset() { i = 0; total = 0; list.innerHTML = ''; paint(); }
    function paint() {
      $('#odTotal').textContent = money(total);
      const left = D.freeShipping - total; const bar = $('#odShipBar');
      bar.style.width = Math.min(100, (total / D.freeShipping) * 100) + '%';
      bar.parentElement.classList.toggle('done', left <= 0);
      $('#odShipText').innerHTML = left > 0 ? 'Te faltan <b>' + money(left) + '</b> para envío gratis' : '🎉 ¡Envío gratis desbloqueado!';
    }
    function tick() {
      if (!visible || document.body.dataset.hero !== 'pedido') return;
      if (i < seq.length) {
        const [id, q] = seq[i++]; const p = byId[id]; total += priceFor(p, q);
        const li = document.createElement('li'); li.className = 'in';
        li.innerHTML = '<span class="od-em">' + p.emoji + '</span><span class="od-n">' + esc(p.name) + '<small>' + wLabel(q, p) + '</small></span><span class="od-p">' + money(priceFor(p, q)) + '</span>';
        list.appendChild(li); while (list.children.length > 4) list.firstElementChild.remove();
        paint();
      } else if (i < seq.length + 2) i++;
      else reset();
    }
    reset();
    if (!motionOn()) { for (let k = 0; k < 4; k++) tick(); return; }
    timer = setInterval(tick, 1800); tick();
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe($('#hero'));
  })();

  // Barra de anuncios rotativa
  (function announce() {
    const items = $$('#announceTrack span'); let k = 0; items[0].classList.add('is-on');
    setInterval(() => {
      if (!motionOn()) return;
      const cur = items[k]; cur.classList.remove('is-on'); cur.classList.add('is-out');
      setTimeout(() => cur.classList.remove('is-out'), 700);
      k = (k + 1) % items.length; items[k].classList.add('is-on');
    }, 3800);
  })();

  // Botón magnético
  $$('.magnetic').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      if (!motionOn() || e.pointerType !== 'mouse') return;
      const r = b.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      b.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.3 + 'px)';
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  // Carrusel con arrastre
  (function carousel() {
    const c = $('#bestCarousel'); let down = false, sx = 0, sl = 0, moved = 0;
    c.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = c.scrollLeft; });
    window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; moved = Math.abs(dx); if (moved > 6) c.classList.add('dragging'); c.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => c.classList.remove('dragging'), 0); });
    $$('[data-car]').forEach((b) => b.addEventListener('click', () => c.scrollBy({ left: +b.dataset.car * 560, behavior: 'smooth' })));
  })();

  // ───────── Catálogo ─────────
  const cat = { q: '', aisle: null, tags: new Set(), max: 40000, stock: false, sort: 'aisle', layout: 'grid', quick: null };
  function filtered() {
    const k = norm(cat.q.trim());
    let list = D.products.filter((p) =>
      (!k || norm(p.name).includes(k) || norm(aisleById[p.aisle].name).includes(k) || p.tags.some((t) => norm(D.tagsInfo[t].label).includes(k))) &&
      (!cat.aisle || p.aisle === cat.aisle) &&
      [...cat.tags].every((t) => p.tags.includes(t)) &&
      p.price <= cat.max && (!cat.stock || p.stock > 10) &&
      (cat.quick !== 'starter' || p.starter));
    const order = D.aisles.map((a) => a.id);
    const sorters = {
      aisle: (a, b) => order.indexOf(a.aisle) - order.indexOf(b.aisle) || b.sales - a.sales,
      sales: (a, b) => b.sales - a.sales,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name, 'es'),
    };
    return list.sort(sorters[cat.sort]);
  }
  const grouped = () => document.body.dataset.catalog === 'pasillos' && !cat.q.trim() && !cat.aisle && !cat.tags.size && cat.max >= 40000 && !cat.stock && cat.sort === 'aisle' && !cat.quick;
  function renderFilters() {
    $('#fAisles').innerHTML = '<button type="button" class="' + (!cat.aisle ? 'is-on' : '') + '" data-fa=""><span>Todas</span><small>' + D.products.length + '</small></button>' +
      D.aisles.map((a) => '<button type="button" class="' + (cat.aisle === a.id ? 'is-on' : '') + '" data-fa="' + a.id + '"><span>' + a.icon + ' ' + a.name + '</span><small>' + D.products.filter((p) => p.aisle === a.id).length + '</small></button>').join('');
    $('#fTags').innerHTML = Object.entries(D.tagsInfo).map(([id, t]) => '<button type="button" class="' + (cat.tags.has(id) ? 'is-on' : '') + '" data-ft="' + id + '">' + t.icon + ' ' + t.label + '</button>').join('');
    const pills = '<span class="ap-pill" id="apPill"></span><button type="button" data-ap="" class="' + (!cat.aisle && !grouped() ? '' : '') + '">Todo <small>' + D.products.length + '</small></button>' +
      D.aisles.map((a) => '<button type="button" data-ap="' + a.id + '">' + a.icon + ' ' + a.name + ' <small>' + D.products.filter((p) => p.aisle === a.id).length + '</small></button>').join('');
    $('#aislePills').innerHTML = pills;
    const n = cat.tags.size + (cat.aisle ? 1 : 0) + (cat.max < 40000 ? 1 : 0) + (cat.stock ? 1 : 0);
    $('#fCount').hidden = !n; $('#fCount').textContent = n;
    $$('.starter[data-quick]').forEach((b) => b.classList.toggle('is-on', b.dataset.quick === cat.quick));
    // chips activos
    const chips = [];
    if (cat.q.trim()) chips.push(['q', '“' + esc(cat.q.trim()) + '”']);
    if (cat.quick === 'starter') chips.push(['quick', '⭐ Lo esencial']);
    if (cat.aisle) chips.push(['aisle', aisleById[cat.aisle].icon + ' ' + aisleById[cat.aisle].name]);
    cat.tags.forEach((t) => chips.push(['tag:' + t, D.tagsInfo[t].label]));
    if (cat.max < 40000) chips.push(['max', 'Hasta ' + money(cat.max)]);
    if (cat.stock) chips.push(['stock', 'Stock alto']);
    $('#activeChips').innerHTML = chips.map(([k, l]) => '<button type="button" data-rm="' + k + '">' + l + ' ✕</button>').join('');
  }
  let skelT = null;
  function renderCatalog(instant) {
    renderFilters();
    const list = filtered();
    $('#resultCount').textContent = list.length;
    const box = $('#catResults');
    box.classList.toggle('is-list', cat.layout === 'list');
    const draw = () => {
      if (!list.length) {
        box.innerHTML = '<div class="empty"><div class="big">🔎</div><h3>No hay productos con esos filtros</h3><p>Probá quitando alguno o buscá algo más general.</p><div class="sugs">' + ['almendras', 'avena', 'chía', 'whey'].map((s) => '<button type="button" class="btn btn-ghost" data-sug="' + s + '">' + s + '</button>').join('') + '<button type="button" class="btn btn-primary" data-clear>Limpiar filtros</button></div></div>';
        return;
      }
      let html = '';
      if (cat.quick === 'starter') html += '<div class="guide-banner"><p><b>Lo esencial para empezar.</b> Los productos que más se repiten en los primeros pedidos. Elegí el peso y agregalos.</p></div>';
      if (grouped()) {
        let gi = 0;
        D.aisles.forEach((a) => {
          const items = list.filter((p) => p.aisle === a.id); if (!items.length) return;
          html += '<section class="aisle-block" id="aisle-' + a.id + '" data-aisle="' + a.id + '"><div class="aisle-block-head" style="--h:' + a.hue + '"><span class="aisle-ic">' + a.icon + '</span><div><h2>' + a.name + '</h2><p>' + a.blurb + '</p></div><span class="aisle-num">' + items.length + ' productos</span></div><div class="p-grid">' + items.map((p) => card(p, gi++)).join('') + '</div></section>';
        });
      } else {
        html += '<div class="p-grid">' + list.map((p, i) => card(p, i, { hl: cat.q.trim() })).join('') + '</div>';
      }
      box.innerHTML = html;
      setupSpy();
    };
    clearTimeout(skelT);
    if (instant || !motionOn()) { draw(); return; }
    box.innerHTML = '<div class="p-grid">' + Array.from({ length: 6 }, () => '<div class="skeleton"></div>').join('') + '</div>';
    skelT = setTimeout(draw, 220);
  }
  let spy = null, activeAisle = '';
  function setupSpy() {
    if (spy) spy.disconnect();
    const blocks = $$('.aisle-block');
    if (!blocks.length) { setActivePill(cat.aisle || ''); return; }
    spy = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) setActivePill(en.target.dataset.aisle); });
    }, { rootMargin: '-150px 0px -65% 0px' });
    blocks.forEach((b) => spy.observe(b));
    setActivePill(blocks[0].dataset.aisle);
  }
  function setActivePill(id) {
    activeAisle = id;
    $$('#aislePills [data-ap]').forEach((b) => b.classList.toggle('is-on', b.dataset.ap === id));
    moveAislePill();
  }
  function moveAislePill() {
    const b = $('#aislePills [data-ap].is-on'); const pill = $('#apPill'); if (!pill) return;
    if (!b) { pill.style.width = '0'; return; }
    pill.style.width = b.offsetWidth + 'px'; pill.style.transform = 'translateX(' + b.offsetLeft + 'px)';
    const wrap = $('#aislePills'); const target = b.offsetLeft - wrap.clientWidth / 2 + b.offsetWidth / 2;
    wrap.scrollTo({ left: target, behavior: motionOn() ? 'smooth' : 'auto' });
  }
  function focusAisle(id) {
    if (grouped()) {
      const el = document.getElementById('aisle-' + id);
      if (el) el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto' });
    } else { cat.aisle = id || null; renderCatalog(); }
  }
  $('#aislePills').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ap]'); if (!b) return;
    if (grouped() && b.dataset.ap) { focusAisle(b.dataset.ap); return; }
    cat.aisle = b.dataset.ap || null; cat.quick = null; renderCatalog();
    if (!cat.aisle && document.body.dataset.catalog === 'pasillos') window.scrollTo({ top: $('#aisleNav').offsetTop - 60, behavior: 'smooth' });
  });
  $('#filters').addEventListener('click', (e) => {
    const a = e.target.closest('[data-fa]'); if (a) { cat.aisle = a.dataset.fa || null; renderCatalog(); return; }
    const t = e.target.closest('[data-ft]'); if (t) { cat.tags.has(t.dataset.ft) ? cat.tags.delete(t.dataset.ft) : cat.tags.add(t.dataset.ft); renderCatalog(); }
  });
  $('#fPrice').addEventListener('input', (e) => { cat.max = +e.target.value; $('#fPriceVal').textContent = cat.max >= 40000 ? 'Sin límite' : money(cat.max); renderCatalog(); });
  $('#fStock').addEventListener('change', (e) => { cat.stock = e.target.checked; renderCatalog(); });
  $('#sortSel').addEventListener('change', (e) => { cat.sort = e.target.value; renderCatalog(); });
  let sT = null;
  $('#catSearch').addEventListener('input', (e) => { clearTimeout(sT); sT = setTimeout(() => { cat.q = e.target.value; renderCatalog(); }, 160); });
  $$('.view-toggle button').forEach((b) => b.addEventListener('click', () => {
    cat.layout = b.dataset.layout; $$('.view-toggle button').forEach((x) => x.classList.toggle('is-on', x === b)); renderCatalog(true);
  }));
  function clearAll() {
    Object.assign(cat, { q: '', aisle: null, max: 40000, stock: false, quick: null }); cat.tags.clear();
    $('#catSearch').value = ''; $('#fPrice').value = 40000; $('#fPriceVal').textContent = 'Sin límite'; $('#fStock').checked = false;
    renderCatalog();
  }
  $('#clearFilters').addEventListener('click', clearAll);
  $('#catResults').addEventListener('click', (e) => {
    if (e.target.closest('[data-clear]')) clearAll();
    const s = e.target.closest('[data-sug]'); if (s) { clearAll(); cat.q = s.dataset.sug; $('#catSearch').value = s.dataset.sug; renderCatalog(); }
  });
  $('#activeChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rm]'); if (!b) return; const k = b.dataset.rm;
    if (k === 'q') { cat.q = ''; $('#catSearch').value = ''; }
    else if (k === 'quick') cat.quick = null;
    else if (k === 'aisle') cat.aisle = null;
    else if (k === 'max') { cat.max = 40000; $('#fPrice').value = 40000; $('#fPriceVal').textContent = 'Sin límite'; }
    else if (k === 'stock') { cat.stock = false; $('#fStock').checked = false; }
    else cat.tags.delete(k.slice(4));
    renderCatalog();
  });
  $$('.starter[data-quick]').forEach((b) => b.addEventListener('click', () => {
    cat.quick = cat.quick === b.dataset.quick ? null : b.dataset.quick; renderCatalog();
    window.scrollTo({ top: $('#aisleNav').offsetTop - 60, behavior: motionOn() ? 'smooth' : 'auto' });
  }));
  $('#filtersBtn').addEventListener('click', () => { $('#filters').classList.add('open'); scrim.hidden = false; lockScroll(true); });
  $('#closeFilters').addEventListener('click', closeCart);
  $('#applyFilters').addEventListener('click', closeCart);

  // ───────── Scroll: header, progreso, reveals, contadores ─────────
  function onScroll() {
    const y = window.scrollY; const max = document.documentElement.scrollHeight - innerHeight;
    $('#header').classList.toggle('is-scrolled', y > 10);
    $('#scrollBar').style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function setupReveals() {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); en.target.classList.remove('pre'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => {
      if (motionOn() && el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); }
    });
  }
  function setupCounters() {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return; io.unobserve(en.target);
        const el = en.target, to = +el.dataset.count, dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
        if (!motionOn()) return;
        const t0 = performance.now();
        (function step(t) {
          const k = Math.min(1, (t - t0) / 1400), v = to * (1 - Math.pow(1 - k, 3));
          el.textContent = v.toFixed(dec).replace('.', ',') + suf; if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    });
    $$('[data-count]').forEach((el) => io.observe(el));
  }
  // Balanza del paso 2
  (function scaleLoop() {
    const el = $('[data-scale]'); const vals = ['100 g', '250 g', '500 g', '1 kg']; let k = 1;
    setInterval(() => { if (!motionOn()) return; k = (k + 1) % vals.length; el.textContent = vals[k]; }, 1400);
  })();

  // ───────── GSAP: entrada del hero + scroll ─────────
  function gsapMotion() {
    if (!hasGsap || !motionOn()) return;
    const soft = document.body.dataset.motion === 'soft';
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('#heroTitle .word', { yPercent: soft ? 30 : 110, opacity: soft ? 0 : 1, duration: soft ? 0.8 : 1.2, stagger: 0.07 })
      .from('[data-hero-in]', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=0.9')
      .from('#orderDemo', { x: soft ? 20 : 80, opacity: 0, duration: 1.2, clearProps: 'transform,opacity' }, '-=1');
    if (!window.ScrollTrigger) return;
    gsap.to('#heroVideo', { yPercent: 18, scale: 1.18, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy', { y: -40, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'center center', end: 'bottom top', scrub: true } });
    $$('.parallax').forEach((el) => gsap.to(el, { y: () => +el.dataset.speed * 600, ease: 'none', scrollTrigger: { trigger: '.local-card', start: 'top bottom', end: 'bottom top', scrub: true } }));
  }

  // ───────── Init ─────────
  renderHome();
  renderCartUI();
  const startView = location.hash === '#catalogo' ? 'catalogo' : 'inicio';
  go(startView);
  if (startView !== 'catalogo') renderCatalog(true);
  setupReveals(); setupCounters(); gsapMotion();
  requestAnimationFrame(moveNavPill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { moveNavPill(); moveAislePill(); });
  window.addEventListener('hashchange', () => { const v = location.hash === '#catalogo' ? 'catalogo' : 'inicio'; if (v !== view) go(v); });
})();
