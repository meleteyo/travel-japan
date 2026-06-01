/* app.js — bootstrap, event delegation, dynamic behaviours */
window.App = window.App || {};
(function (A) {
  'use strict';

  // ---------------- click delegation ----------------
  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const act = t.dataset.action;
    const id = t.dataset.id;
    switch (act) {
      case 'show': A.showPhrase(id); break;
      case 'show-text': A.showText(t.dataset.jp, t.dataset.pron, t.dataset.ko, t.dataset.level); break;
      case 'close-sheet': A.closeSheet(); break;
      case 'fav': toggleFav(id, t); break;
      case 'talk-cat': setTalkCat(t.dataset.cat, t); break;
      case 'check': toggleCheck(id, t); break;
      case 'wish': toggleWish(id, t); break;
      case 'del-expense': delExpense(id); break;
      case 'food-day': location.hash = '#/food?d=' + t.dataset.day; break;
      case 'lightbox': A.lightbox(t.dataset.src, t.dataset.alt); break;
      case 'theme': A.state.theme = t.dataset.val; A.save('theme'); A.applyTheme(); A.render(); break;
      case 'font': A.state.font = parseFloat(t.dataset.val); A.save('font'); A.applyTheme(); A.render(); break;
      case 'prefetch': A.prefetchAll(A.$('#pf-status')); break;
      case 'calc-quick': calcFrom('jpy', parseFloat(t.dataset.v)); break;
    }
  });

  document.addEventListener('input', function (e) {
    const t = e.target.closest('[data-action]'); if (!t) return;
    switch (t.dataset.action) {
      case 'talk-search': A.talkState.q = t.value.trim(); filterTalk(); break;
      case 'set-rate': { const v = parseFloat(t.value); if (v > 0) { A.state.fxRate = v; A.save('fxRate'); calcFrom('jpy', parseFloat((A.$('#cjpy') || {}).value) || null); } break; }
      case 'calc-jpy': calcFrom('jpy', parseFloat(t.value)); break;
      case 'calc-krw': calcFrom('krw', parseFloat(t.value)); break;
    }
  });

  document.addEventListener('submit', function (e) {
    const t = e.target.closest('[data-action="add-expense"]'); if (!t) return;
    e.preventDefault();
    const label = (t.label.value || '지출').trim();
    const yen = parseInt(t.yen.value, 10);
    if (!yen || yen <= 0) { A.toast('금액을 입력하세요'); return; }
    A.state.expenses.push({ id: 'e' + Date.now(), label, amountYen: yen });
    A.save('expenses'); A.render();
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { A.closeSheet(); A.closeLightbox(); } });

  // ---------------- favorites ----------------
  function toggleFav(id, btn) {
    const i = A.state.fav.indexOf(id);
    if (i >= 0) A.state.fav.splice(i, 1); else A.state.fav.push(id);
    A.save('fav');
    const on = A.state.fav.includes(id);
    btn.classList.toggle('on', on); btn.textContent = on ? '★' : '☆';
    if (A.talkState && A.talkState.cat === 'fav') filterTalk();
  }

  // ---------------- talk filter ----------------
  A.talkState = { cat: 'fav', q: '' };
  function setTalkCat(cat, btn) {
    A.talkState.cat = cat;
    A.$$('.tchip').forEach((c) => c.classList.toggle('on', c === btn));
    filterTalk();
  }
  function filterTalk() {
    const { cat, q } = A.talkState;
    const ql = q.toLowerCase();
    A.$$('#plist .prow').forEach((row) => {
      const okCat = cat === 'all' ? true : cat === 'fav' ? A.state.fav.includes(row.dataset.id) : row.dataset.cat === cat;
      const okQ = !ql || (row.dataset.ko || '').toLowerCase().indexOf(ql) >= 0;
      row.style.display = (okCat && okQ) ? '' : 'none';
    });
  }

  // ---------------- checklist / wishlist ----------------
  function toggleCheck(id, btn) {
    A.state.check[id] = !A.state.check[id]; A.save('check');
    btn.classList.toggle('on', A.state.check[id]);
    A.$('.chk-box', btn).textContent = A.state.check[id] ? '✓' : '';
    // update group progress
    A.render();
  }
  function toggleWish(id, btn) {
    A.state.wish[id] = !A.state.wish[id]; A.save('wish');
    btn.classList.toggle('on', A.state.wish[id]);
    A.$('.wcheck', btn).textContent = A.state.wish[id] ? '✅' : '⬜';
  }
  function delExpense(id) {
    A.state.expenses = A.state.expenses.filter((e) => e.id !== id); A.save('expenses'); A.render();
  }

  // ---------------- exchange calculator ----------------
  function calcFrom(which, val) {
    const jpy = A.$('#cjpy'), krw = A.$('#ckrw'); if (!jpy || !krw) return;
    const rate = A.rate();
    if (which === 'jpy') { jpy.value = val || ''; krw.value = val ? Math.round(val * rate / 100) : ''; }
    else { krw.value = val || ''; jpy.value = val ? Math.round(val * 100 / rate) : ''; }
  }

  // ---------------- after render hooks ----------------
  A.afterRender = function (name) {
    if (name === 'talk') { A.talkState = { cat: 'fav', q: '' }; filterTalk(); }
  };

  // ---------------- offline prefetch ----------------
  A.prefetchAll = async function (statusEl) {
    const urls = new Set();
    const add = (u) => { if (u && typeof u === 'string' && !/^https?:/.test(u)) urls.add(u); };
    // images referenced in data
    JSON.stringify(A.data, (k, v) => {
      if ((k === 'imageUrl' || k === 'heroImageUrl') && v) add(v);
      return v;
    });
    ['itinerary', 'phrases', 'emergency', 'info', 'transit', 'exchange', 'weather', 'checklist',
      'shopping', 'tips', 'restaurants', 'musteat', 'places', 'photospots', 'medical'].forEach((f) => add('data/' + f + '.json'));
    const t = A.data.transit && A.data.transit.map || {};
    add(t.webp); add(t.png);
    ['assets/icons/icon-192.png', 'assets/icons/icon-512.png'].forEach(add);
    const list = Array.from(urls);
    let done = 0;
    if (statusEl) statusEl.textContent = `저장 중… 0 / ${list.length}`;
    const pool = 6;
    let idx = 0;
    async function worker() {
      while (idx < list.length) {
        const u = list[idx++];
        try { await fetch(u, { cache: 'reload' }); } catch (e) {}
        done++;
        if (statusEl) statusEl.textContent = `저장 중… ${done} / ${list.length}`;
      }
    }
    await Promise.all(Array.from({ length: pool }, worker));
    if (statusEl) statusEl.textContent = `✅ ${done}개 저장 완료 — 이제 오프라인에서도 열려요.`;
    A.toast('오프라인 저장 완료');
  };

  // ---------------- boot ----------------
  async function boot() {
    A.applyTheme();
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', A.applyTheme);
    try { await A.load(); } catch (e) { console.error(e); }
    // bottom tab "일정" → today's day
    const today = A.tripDay();
    const dayHref = '#/day/' + ((today.day && today.day.id) || 'd1');
    const tabDay = A.$('.tabbar a[data-tab="day"]'); if (tabDay) tabDay.setAttribute('href', dayHref);
    A.startRouter();
    // service worker
    if ('serviceWorker' in navigator) {
      try { await navigator.serviceWorker.register('service-worker.js', { scope: './' }); } catch (e) { console.warn('sw', e); }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.App);
