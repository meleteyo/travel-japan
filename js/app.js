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
      case 'nav-back': navBack(); break;
      case 'guide-jump': guideJump(t.dataset.target); break;
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
      case 'tts': A.speak(t.dataset.text); break;
      case 'voice': setVoice(t.dataset.val); break;
      case 'tts-rate': setTtsRate(parseFloat(t.dataset.val)); break;
      case 'doc-pick': A._docTarget = t.dataset.slot; { const inp = A.$('#doc-file'); if (inp) inp.click(); } break;
      case 'doc-view': A.viewDoc(t.dataset.slot); break;
      case 'doc-del': delDoc(t.dataset.slot); break;
      case 'doc-add': addDoc(); break;
      case 'refresh-weather': refreshWeatherUI(); break;
    }
  });

  async function refreshWeatherUI() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { A.toast('오프라인 — 저장된 예보 표시 중'); return; }
    if (!A.refreshWeather) return;
    A.toast('날씨 새로고침 중…');
    const before = (A.data.weather || {}).updatedAt;
    await A.refreshWeather(true);
    const after = (A.data.weather || {}).updatedAt;
    if (after && after !== before) A.toast('최신 날씨로 업데이트됐어요');
    else A.toast('업데이트 실패 — 잠시 후 다시 시도');
  }

  // ---- 서류함 (기기 저장 캡처) ----
  document.addEventListener('change', async function (e) {
    const inp = e.target.closest && e.target.closest('#doc-file');
    if (!inp || !inp.files || !inp.files[0]) return;
    const slot = A._docTarget;
    if (!slot || !A.idb || !A.idb.available()) { A.toast('이 브라우저는 기기 저장을 지원하지 않아요'); inp.value = ''; return; }
    try {
      const url = await A.downscaleToDataURL(inp.files[0]);
      await A.idb.set(slot, { dataURL: url, ts: Date.now() });
      await A.fillDocSlot(slot);
      A.toast('저장됐어요 · 이 기기에만');
    } catch (err) { A.toast('불러오기 실패'); }
    inp.value = '';
  });

  A.docSlotIds = function () {
    const ids = [];
    (((A.data.docs || {}).groups) || []).forEach((g) => (g.slots || []).forEach((s) => ids.push(s.id)));
    (A.state.docExtra || []).forEach((s) => ids.push(s.id));
    return ids;
  };
  A.fillDocSlot = async function (id) {
    const body = document.getElementById('docbody-' + id);
    if (!body) return;
    let rec = null;
    try { if (A.idb && A.idb.available()) rec = await A.idb.get(id); } catch (e) {}
    if (rec && rec.dataURL) {
      body.innerHTML = `<button class="doc-thumb" data-action="doc-view" data-slot="${id}"><img src="${rec.dataURL}" alt="저장된 캡처"></button>
        <div class="doc-acts"><button class="doc-act" data-action="doc-pick" data-slot="${id}">교체</button>
        <button class="doc-act del" data-action="doc-del" data-slot="${id}">삭제</button></div>`;
    } else {
      body.innerHTML = `<button class="doc-pick" data-action="doc-pick" data-slot="${id}">＋ 불러오기</button>`;
    }
  };
  A.loadDocs = function () { A.docSlotIds().forEach((id) => A.fillDocSlot(id)); };
  A.viewDoc = async function (id) {
    try { const r = (A.idb && A.idb.available()) ? await A.idb.get(id) : null; if (r && r.dataURL) A.lightbox(r.dataURL, '저장된 캡처'); else A.toast('아직 불러온 캡처가 없어요'); } catch (e) {}
  };
  async function delDoc(id) {
    if (!confirm('이 캡처를 삭제할까요?')) return;
    try { if (A.idb && A.idb.available()) await A.idb.del(id); } catch (e) {}
    if (/^extra-/.test(id)) { A.state.docExtra = (A.state.docExtra || []).filter((s) => s.id !== id); A.save('docExtra'); A.render(); }
    else A.fillDocSlot(id);
    A.toast('삭제했어요');
  }
  function addDoc() {
    const label = (prompt('어떤 캡처인가요? (이름)', '추가 캡처') || '').trim();
    if (!label) return;
    const id = 'extra-' + Date.now();
    A.state.docExtra = (A.state.docExtra || []).concat([{ id, label }]);
    A.save('docExtra');
    A._docTarget = id;
    A.render();
    setTimeout(() => { const inp = A.$('#doc-file'); if (inp) inp.click(); }, 60);
  }

  function setVoice(g) {
    A.state.voice = g; A.save('voice');
    A.$$('[data-action="voice"]').forEach((b) => b.classList.toggle('on', b.dataset.val === g));
    // 즉시 들려주기: 보여주기 시트가 열려 있으면 그 문장을, 아니면 샘플을
    const sheetOpen = A.$('#sheet') && A.$('#sheet').classList.contains('open');
    A.speak(sheetOpen && A._lastShownJp ? A._lastShownJp : 'ありがとうございます', g);
  }
  function setTtsRate(r) {
    if (!(r > 0)) return;
    A.state.ttsRate = r; A.save('ttsRate');
    A.$$('[data-action="tts-rate"]').forEach((b) => b.classList.toggle('on', parseFloat(b.dataset.val) === r));
    A.speak('すみません、ありがとうございます'); // 미리듣기
  }

  document.addEventListener('input', function (e) {
    const t = e.target.closest('[data-action]'); if (!t) return;
    switch (t.dataset.action) {
      case 'talk-search': A.talkState.q = t.value.trim(); filterTalk(); break;
      case 'set-rate': { const v = parseFloat(t.value); if (v > 0) { A.state.fxRate = v; A.save('fxRate'); calcFrom('jpy', parseFloat((A.$('#cjpy') || {}).value) || null); } break; }
      case 'calc-jpy': calcFrom('jpy', parseFloat(t.value)); break;
      case 'calc-krw': calcFrom('krw', parseFloat(t.value)); break;
      case 'global-search': A.runGlobalSearch(t.value); break;
      case 'force-update': forceUpdate(); break;
    }
  });

  async function forceUpdate() {
    A.toast('업데이트 확인 중…');
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) { await reg.update(); if (reg.waiting) reg.waiting.postMessage('skipWaiting'); }
      }
    } catch (e) {}
    setTimeout(() => { try { location.reload(); } catch (e) {} }, 700);
  }

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

  // ---------------- navigation: universal back ----------------
  function navBack() {
    // a sheet/lightbox open? close that first.
    const sheet = A.$('#sheet'), lb = A.$('#lightbox');
    if (lb && lb.classList.contains('open')) { A.closeLightbox(); return; }
    if (sheet && sheet.classList.contains('open')) { A.closeSheet(); return; }
    if (window.history.length > 1) history.back();
    else location.hash = '#/';
  }

  // ---------------- guide: jump to a section ----------------
  function guideJump(idx) {
    const el = document.getElementById('g-sec-' + idx);
    if (!el) return;
    const bar = A.$('.appbar');
    const offset = (bar ? bar.offsetHeight : 56) + 8;
    const y = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - offset);
    // positional scroll works everywhere; html{scroll-behavior:smooth} adds easing where supported.
    window.scrollTo(0, y);
  }

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
    const card = (btn.closest && btn.closest('.wish-card')) || btn;
    card.classList.toggle('on', A.state.wish[id]);
    const chk = A.$('.wcheck', btn); if (chk) chk.textContent = A.state.wish[id] ? '✅' : '⬜';
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
    if (name === 'docs') A.loadDocs();
    if (name === 'search') { const i = A.$('#gsearch'); if (i) { try { i.focus(); } catch (e) {} A.runGlobalSearch(i.value); } }
  };

  // ---------------- 전역 검색 ----------------
  A._sidx = null;
  A.buildSearchIndex = function () {
    if (A._sidx) return A._sidx;
    const idx = [];
    const add = (text, label, route, icon, sub) => { if (text && label) idx.push({ t: String(text).toLowerCase(), label, route, icon: icon || '🔎', sub: sub || '' }); };
    const D = A.data || {};
    (((D.phrases || {}).phrases) || []).forEach((p) => add(p.ko + ' ' + (p.pron || '') + ' ' + (p.note || ''), p.ko, '#/talk', '💬', p.jp));
    (((D.tips || {}).manners) || []).forEach((m) => add(m.title + ' ' + m.body, '매너 · ' + m.title, '#/tips', m.icon || '💡', m.body));
    (((D.tips || {}).facilities) || []).forEach((f) => add(f.title + ' ' + f.body, '편의시설 · ' + f.title, '#/tips', f.icon || '💡', f.body));
    (((D.tips || {}).ordering) || []).forEach((o) => add(o.title + ' ' + o.step, '주문법 · ' + o.title, '#/tips', o.icon || '🎟️', o.step));
    ((((D.tips || {}).taxfree) || {}).points || []).forEach((p) => add('면세 ' + p, '면세 · ' + p.slice(0, 16), '#/tips', '🏷️', p));
    (((D.tips || {}).konbini) || []).forEach((k) => add('편의점 ' + k, '편의점 꿀팁', '#/tips', '🏪', k));
    (((D.transit || {}).howto) || []).forEach((h) => add(h.title + ' ' + h.body, '교통 · ' + h.title, '#/subway', h.icon || '🚇', h.body));
    (((D.transit || {}).routes) || []).forEach((r) => add(r.from + ' ' + r.to + ' ' + r.line, r.from + ' → ' + r.to, '#/subway', '🚇', r.line));
    (((D.transit || {}).stations) || []).forEach((s) => add(s.ko + ' ' + s.ja + ' ' + s.roma, s.ko + '역', '#/subway', '🚉', s.ja));
    (((D.restaurants || {}).days) || []).forEach((day) => (day.restaurants || []).forEach((r) => add(r.name + ' ' + (r.nameJa || '') + ' ' + r.food, r.name, '#/food?d=' + day.dayId, '🍜', r.food)));
    (((D.musteat || {}).items) || []).forEach((m) => add(m.name + ' ' + (m.nameJa || ''), '꼭 먹어볼 · ' + m.name, '#/eat/' + m.key, '🍱', m.note));
    (((D.photospots || {}).items) || []).forEach((p) => add(p.name + ' ' + (p.nameJa || '') + ' ' + (p.note || ''), '포토스팟 · ' + p.name, '#/photo', '📸', p.area));
    (((D.shopping || {}).wishlist) || []).forEach((w) => add(w.store + ' ' + w.label, '쇼핑 · ' + w.store, '#/shopping', '🛍', w.label));
    (((D.emergency || {}).flows) || []).forEach((f) => add(f.title + ' ' + (f.steps || []).join(' '), '긴급 · ' + f.title, '#/sos', f.icon || '🆘', ''));
    (((D.emergency || {}).contacts) || []).forEach((c) => add(c.label + ' ' + c.tel, '긴급 · ' + c.label, '#/sos', c.icon || '📞', c.tel));
    (((D.medical || {}).hospitals) || []).forEach((h) => add(h.name + ' ' + (h.note || ''), '병원 · ' + h.name, '#/medical', '🏥', ''));
    (((D.medical || {}).meds) || []).forEach((m) => add(m.ko + ' ' + m.ja + ' ' + (m.use || ''), '약 · ' + m.ko, '#/medical', '💊', m.ja));
    (((D.exchange || {}).tips) || []).forEach((t) => add('환율 돈 예산 ' + t, '돈 · 환율', '#/exchange', '💴', t));
    (((D.checklist || {}).groups) || []).forEach((g) => (g.items || []).forEach((i) => add(i.text, '체크 · ' + g.label, '#/check', '✅', i.text)));
    (((D.itinerary || {}).days) || []).forEach((d) => { add(d.title + ' ' + d.summary, d.n + '일차 · ' + d.title, '#/day/' + d.id, '📅', d.summary); (d.stops || []).forEach((s) => add(s.name + ' ' + (s.nameJa || '') + ' ' + (s.desc || ''), d.n + '일차 · ' + s.name, '#/day/' + d.id, '📍', s.station || '')); });
    (((D.info || {}).reservations) || []).forEach((r) => add(r.name + ' ' + r.note, '예약 · ' + r.name, '#/info', r.icon || '🎫', r.note));
    const G = ((D.guides || {}).guides) || {};
    Object.keys(G).forEach((gid) => { const g = G[gid]; add(g.title + ' ' + (g.subtitle || '') + ' ' + (g.sections || []).map((s) => s.heading).join(' '), '상세가이드 · ' + g.title, '#/guide/' + gid, '📖', g.subtitle || ''); });
    A._sidx = idx; return idx;
  };
  A.runGlobalSearch = function (q) {
    const el = document.getElementById('gresults'); if (!el) return;
    q = (q || '').trim().toLowerCase();
    if (!q) { el.innerHTML = '<p class="muted small">검색어를 입력하세요. (한국어)</p>'; return; }
    const hits = A.buildSearchIndex().filter((x) => x.t.indexOf(q) >= 0).slice(0, 40);
    if (!hits.length) { el.innerHTML = '<p class="muted small">결과가 없어요. 다른 단어로 검색해 보세요.</p>'; return; }
    el.innerHTML = hits.map((h) => `<a class="gres" href="${h.route}"><span class="gres-ic">${h.icon}</span><span class="gres-b"><strong>${A.esc(h.label)}</strong>${h.sub ? `<small>${A.esc(h.sub)}</small>` : ''}</span></a>`).join('');
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
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    if (A.ttsOk()) { A.loadVoices(); try { window.speechSynthesis.onvoiceschanged = A.loadVoices; } catch (e) {} }
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', A.applyTheme);
    try { await A.load(); } catch (e) { console.error(e); }
    if (A.loadCachedWeather) A.loadCachedWeather();
    // bottom tab "일정" → today's day
    const today = A.tripDay();
    const dayHref = '#/day/' + ((today.day && today.day.id) || 'd1');
    const tabDay = A.$('.tabbar a[data-tab="day"]'); if (tabDay) tabDay.setAttribute('href', dayHref);
    A.startRouter();
    if (A.refreshWeather) {
      A.refreshWeather();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) A.refreshWeather(); });
    }
    // service worker — with prompt update + auto-refresh on new version
    if ('serviceWorker' in navigator) {
      try {
        const hadController = !!navigator.serviceWorker.controller;
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing || !hadController) return; // 첫 설치 땐 새로고침 안 함
          refreshing = true; window.location.reload();
        });
        const reg = await navigator.serviceWorker.register('service-worker.js', { scope: './', updateViaCache: 'none' });
        const apply = (w) => { if (w) w.postMessage('skipWaiting'); };
        if (reg.waiting) apply(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (nw) nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) { A.toast('새 버전 적용 중…'); apply(nw); }
          });
        });
        const check = () => { try { reg.update(); } catch (e) {} };
        check();
        document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
      } catch (e) { console.warn('sw', e); }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.App);
