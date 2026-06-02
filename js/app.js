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
      case 'refresh-weather': refreshWeatherUI(t); break;
      case 'refresh-rate': refreshRateUI(t); break;
      case 'force-update': forceUpdate(); break;
      case 'search-eg': { const i = A.$('#gsearch'); if (i) { i.value = t.dataset.q; A.runGlobalSearch(t.dataset.q); } break; }
      case 'pick-member': pickMember(t.dataset.val); break;
      case 'make-code': makeCode(); break;
      case 'link-family': linkFamily(); break;
      case 'copy-invite': copyInvite(); break;
      case 'unlink-family': unlinkFamily(); break;
      case 'exp-cur': setExpCur(t.dataset.val); break;
    }
  });

  // 지출 입력 통화 토글 (₩/¥) — 재렌더 없이 제자리 (입력한 항목 보존)
  function setExpCur(c) {
    A.state.expCur = (c === 'jpy') ? 'jpy' : 'krw';
    A.save('expCur');
    A.$$('[data-action="exp-cur"]').forEach((b) => b.classList.toggle('on', b.dataset.val === A.state.expCur));
    const amt = A.$('.exp-form input[name="amt"]');
    if (amt) amt.placeholder = A.state.expCur === 'krw' ? '₩ 금액' : '¥ 금액';
  }

  async function refreshWeatherUI(btn) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { A.toast('오프라인 — 저장된 예보를 보여드려요'); return; }
    if (!A.refreshWeather || A._wxBusy) return;
    A._wxBusy = true;
    // 진행 표시는 버튼에 (토스트 깜빡임 방지). 결과 토스트는 마지막에 1번만.
    if (btn) { btn.dataset.label = btn.textContent; btn.textContent = '🔄 새로고침 중…'; btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true'); }
    let status = 'fail';
    try { status = await A.refreshWeather(true, { render: false }); } catch (e) {}
    A._wxBusy = false;
    if (status === 'ok') { A.render(); A.toast('최신 날씨로 업데이트됐어요'); return; } // render가 버튼 새로 그림
    if (btn) { btn.textContent = btn.dataset.label || '🔄 새로고침'; btn.classList.remove('busy'); btn.removeAttribute('aria-busy'); }
    A.toast(status === 'nochange' ? '예보 변동이 없어요' : '업데이트를 못 했어요 — 잠시 후 다시 시도');
  }

  async function refreshRateUI(btn) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { A.toast('오프라인 — 저장된 환율을 보여드려요'); return; }
    if (!A.refreshRate || A._fxBusy) return;
    A._fxBusy = true;
    if (btn) { btn.dataset.label = btn.textContent; btn.textContent = '🔄 새로고침 중…'; btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true'); }
    let status = 'fail';
    try { status = await A.refreshRate(true, { render: false }); } catch (e) {}
    A._fxBusy = false;
    if (status === 'ok' || status === 'nochange') { A.render(); A.toast(status === 'ok' ? '최신 환율로 업데이트됐어요' : '환율 변동이 없어요'); return; }
    if (btn) { btn.textContent = btn.dataset.label || '🔄 실시간 환율 새로고침'; btn.classList.remove('busy'); btn.removeAttribute('aria-busy'); }
    A.toast('환율을 못 가져왔어요 — 잠시 후 다시 시도');
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
      case 'set-rate': { const v = parseFloat(t.value); if (v > 0) { A.state.fxRate = v; A.state.fxManual = true; A.save('fxRate'); A.save('fxManual'); calcFrom('jpy', parseFloat((A.$('#cjpy') || {}).value) || null); } break; }
      case 'calc-jpy': calcFrom('jpy', parseFloat(t.value)); break;
      case 'calc-krw': calcFrom('krw', parseFloat(t.value)); break;
      case 'global-search': A.runGlobalSearch(t.value); break;
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
    const raw = parseInt(t.amt.value, 10);
    if (!raw || raw <= 0) { A.toast('금액을 입력하세요'); return; }
    // 엔(amountYen)이 표준 저장값. 원화 입력은 현재 환율로 엔 환산해 저장(가족 동기화 스키마 그대로 유지).
    const yen = (A.state.expCur === 'jpy') ? raw : Math.max(1, Math.round(raw * 100 / A.rate()));
    if (A.linked && A.linked() && A.sync && A.sync.addExpense(label, yen)) {
      try { t.reset(); } catch (e) {}            // 폼 비우기 — 목록/총합은 동기화 리스너가 갱신
      A.toast('가족 가계부에 기록했어요');
    } else {
      A.state.expenses.push({ id: 'e' + Date.now(), label, amountYen: yen });
      A.save('expenses'); A.render();
    }
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
    if (el.tagName === 'DETAILS') el.open = true;   // 접힌 섹션이면 펼치고 이동
    const bar = A.$('.appbar');
    const offset = (bar ? bar.offsetHeight : 56) + 8;
    const y = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - offset);
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
    const on = !btn.classList.contains('on');   // 목표 상태 (소스: 연결 시 공유, 아니면 로컬)
    if (A.linked && A.linked() && A.sync && A.sync.setCheck(id, on)) {
      // 클라우드 동기화 — 로컬 check는 소스가 아니므로 건드리지 않음. 리스너가 확정 반영.
    } else {
      A.state.check[id] = on; A.save('check');
    }
    // 낙관적 즉시 반영 + 그룹 진행도 제자리 갱신 (전체 재렌더 없이 → 스크롤 안 튐)
    btn.classList.toggle('on', on);
    A.$('.chk-box', btn).innerHTML = on ? A.icon('check') : '';
    const grp = btn.closest('.cgroup'); if (!grp) return;
    const boxes = A.$$('.chk', grp);
    const done = boxes.filter((b) => b.classList.contains('on')).length;
    const total = boxes.length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const allDone = total > 0 && done === total;
    const ring = A.$('.cg-ring', grp);
    if (ring) { ring.style.setProperty('--p', pct); ring.classList.toggle('done', allDone); }
    const num = A.$('.cg-num', grp); if (num) num.innerHTML = allDone ? A.icon('check') : String(done);
    const prog = A.$('.cg-prog', grp); if (prog) prog.textContent = done + '/' + total;
  }
  function toggleWish(id, btn) {
    A.state.wish[id] = !A.state.wish[id]; A.save('wish');
    const card = (btn.closest && btn.closest('.wish-card')) || btn;
    card.classList.toggle('on', A.state.wish[id]);
    const chk = A.$('.wcheck', btn); if (chk) chk.textContent = A.state.wish[id] ? '✅' : '⬜';
  }
  function delExpense(id) {
    if (A.linked && A.linked()) {
      const e = (A.shared.expenses || []).find((x) => x.id === id);
      if (e && e.by && e.by !== A.state.member && !confirm(A.memberKo(e.by) + '님이 기록한 지출이에요. 삭제할까요?')) return;
      if (A.sync && A.sync.delExpense(id)) return;   // 리스너가 목록/총합 갱신
    }
    A.state.expenses = A.state.expenses.filter((e) => e.id !== id); A.save('expenses'); A.render();
  }

  // ---------------- 가족 공유 (Firebase) ----------------
  function pickMember(m) {
    if (!A.MEMBERS[m]) return;
    A._joinMember = m;
    A.$$('[data-action="pick-member"]').forEach((b) => b.classList.toggle('on', b.dataset.val === m));
  }
  function makeCode() {
    const inp = A.$('#fc-input');
    if (inp && A.sync) inp.value = A.sync.newCode();
  }
  function linkFamily() {
    const inp = A.$('#fc-input');
    const code = ((inp && inp.value) || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const member = A._joinMember || A.state.member;
    if (!member) { A.toast('먼저 "나는 누구"를 골라주세요'); return; }
    if (code.length < 12) { A.toast('가족 코드는 12자 이상이어야 해요'); return; }
    A.state.familyCode = code; A.state.member = member;
    A.save('familyCode'); A.save('member');
    if (A.sync) A.sync.init();
    A.toast('가족과 연결됐어요 · ' + A.memberKo(member));
    location.hash = '#/check';
  }
  function copyInvite() {
    const code = A.state.familyCode;
    if (!code) { A.toast('먼저 가족 코드를 만들어 연결하세요'); return; }
    const link = location.origin + location.pathname + '#/join?fc=' + code;
    const msg = '우리 가족 도쿄 여행 가이드 공유 링크예요. 열고 "나는 누구"만 고르면 체크리스트·지출이 함께 보여요:\n' + link;
    const done = () => A.toast('초대 링크를 복사했어요 · 카톡에 붙여넣기');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(done).catch(() => prompt('이 링크를 복사해 공유하세요', link));
    else prompt('이 링크를 복사해 공유하세요', link);
  }
  function unlinkFamily() {
    if (!confirm('가족 공유를 해제할까요? (내 기기에서만 끊기고, 가족 데이터는 그대로 남아요)')) return;
    if (A.sync) A.sync.unlink();
    else { A.state.familyCode = null; A.state.member = null; A.save('familyCode'); A.save('member'); }
    A.toast('가족 공유를 해제했어요');
    A.render();
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
    if (name === 'docs' || name === 'sos') A.loadDocs();
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
    if (!q) { el.innerHTML = ''; return; }
    const hits = A.buildSearchIndex().filter((x) => x.t.indexOf(q) >= 0).slice(0, 40);
    if (!hits.length) { el.innerHTML = '<div class="empty"><div class="e-ic">' + A.icon('search') + '</div><strong>결과가 없어요</strong><p>다른 단어로 검색해 보세요. (한국어)</p></div>'; return; }
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
    if (A.loadCachedRate) A.loadCachedRate();
    if (A.sync) A.sync.loadMirror();   // 가족 공유: 오프라인에서도 마지막 동기화본 표시
    // bottom tab "일정" → today's day
    const today = A.tripDay();
    const dayHref = '#/day/' + ((today.day && today.day.id) || 'd1');
    const tabDay = A.$('.tabbar a[data-tab="day"]'); if (tabDay) tabDay.setAttribute('href', dayHref);
    A.startRouter();
    if (A.refreshWeather) {
      A.refreshWeather();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) A.refreshWeather(); });
    }
    if (A.refreshRate) {
      A.refreshRate();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) A.refreshRate(); });
    }
    if (A.sync) {
      A.sync.init();   // 가족 연결돼 있으면 실시간 리스너 연결 (미연결/오프라인이면 조용히 무시)
      document.addEventListener('visibilitychange', () => { if (!document.hidden && A.sync) A.sync.init(); });
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
