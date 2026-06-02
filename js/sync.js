/* sync.js — 가족 실시간 공유 (Firebase Realtime Database, compat SDK).
   체크리스트 '체크 상태'와 '지출'만 동기화한다. 여권/QR/보험 캡처(IndexedDB)는
   절대 참조하지 않으므로 구조적으로 동기화 대상이 될 수 없다.
   미연결·오프라인·SDK 미로드 시 조용히 로컬로 폴백 (weather.js·fx.js와 같은 철학). */
window.App = window.App || {};
(function (A) {
  'use strict';
  let app = null, db = null, ref = null, curCode = null, renderT = 0;

  const fb = () => (typeof firebase !== 'undefined' ? firebase : null);

  A.sync = A.sync || {};

  A.sync.available = function () {
    return !!(fb() && A.firebaseConfig && A.firebaseConfig.apiKey && A.firebaseConfig.databaseURL);
  };
  A.sync.linked = function () { return A.linked(); };

  A.sync.status = function () {
    if (!A.sync.available()) return 'unavailable';
    if (!A.linked()) return 'unlinked';
    return (typeof navigator !== 'undefined' && navigator.onLine === false) ? 'linked-offline' : 'linked';
  };

  // 부팅 시 LS 미러(이전 동기화본) 적용 → 오프라인에서도 마지막 가족 데이터 표시.
  A.sync.loadMirror = function () {
    const m = A.LS.get('shared', null);
    if (m && typeof m === 'object') {
      A.shared.checks = m.checks || {};
      A.shared.expenses = Array.isArray(m.expenses) ? m.expenses : [];
    }
  };
  function saveMirror() {
    A.LS.set('shared', { checks: A.shared.checks, expenses: A.shared.expenses, ts: Date.now() });
  }

  // 다수 value 이벤트를 1회 렌더로 합치고, 스크롤은 보존(체크 후 위로 안 튐), 시트/라이트박스 열려있으면 건너뜀.
  function rerender() {
    clearTimeout(renderT);
    renderT = setTimeout(function () {
      if (typeof A.render !== 'function') return;
      const sheet = A.$ && A.$('#sheet'), lb = A.$ && A.$('#lightbox');
      if ((sheet && sheet.classList.contains('open')) || (lb && lb.classList.contains('open'))) return;
      A.render({ keepScroll: true });
    }, 60);
  }

  // crypto 기반 16자 base32 코드 (0,1,i,l,o 등 모호 문자 제외).
  A.sync.newCode = function () {
    const AB = 'abcdefghjkmnpqrstuvwxyz23456789';
    try {
      const c = (typeof crypto !== 'undefined' && crypto) || (typeof window !== 'undefined' && window.crypto);
      const a = new Uint8Array(16); c.getRandomValues(a);
      let out = ''; for (let i = 0; i < 16; i++) out += AB[a[i] % AB.length];
      return out;
    } catch (e) {
      return ('fam' + Date.now() + '000000000000').slice(0, 16);
    }
  };

  // RTDB expenses 객체 → 배열(ts 오름차순).
  function expArray(obj) {
    const out = [];
    if (obj) Object.keys(obj).forEach(function (k) {
      const e = obj[k];
      if (e && typeof e.amountYen === 'number') out.push({ id: k, by: e.by || '', label: e.label || '지출', amountYen: e.amountYen, ts: e.ts || 0 });
    });
    out.sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    return out;
  }

  A.sync.init = function () {
    if (!A.sync.available() || !A.linked()) return;
    const f = fb();
    try {
      if (!app) app = (f.apps && f.apps.length) ? f.app() : f.initializeApp(A.firebaseConfig);
      if (!db) db = f.database();
    } catch (e) { return; }
    const code = A.state.familyCode;
    if (ref && curCode === code) return;          // 이미 같은 코드로 연결됨
    if (ref) { try { ref.off(); } catch (e) {} ref = null; }
    curCode = code;
    try {
      ref = db.ref('families/' + code);
      migrateOnce(ref);
      ref.child('checks').on('value', function (snap) { A.shared.checks = snap.val() || {}; saveMirror(); rerender(); });
      ref.child('expenses').on('value', function (snap) { A.shared.expenses = expArray(snap.val()); saveMirror(); rerender(); });
    } catch (e) { ref = null; }
  };

  // 연결 후 1회: 이 기기에만 있던 로컬 체크/지출을 가족 노드로 올린다(유실 방지).
  // 서버에 이미 있는 체크는 건드리지 않고, 지출은 올린 뒤 로컬을 비워 중복을 막는다.
  function migrateOnce(r) {
    const flag = 'migrated:' + curCode;
    if (A.LS.get(flag, false)) return;
    r.once('value').then(function (snap) {
      const cur = snap.val() || {};
      const me = A.state.member, now = Date.now();
      const upd = {};
      const lc = A.state.check || {};
      Object.keys(lc).forEach(function (id) {
        if (lc[id] && !(cur.checks && cur.checks[id])) upd['checks/' + id] = { by: me, ts: now };
      });
      (A.state.expenses || []).forEach(function (e) {
        if (e && e.amountYen > 0) { const k = r.child('expenses').push().key; upd['expenses/' + k] = { by: me, label: e.label || '지출', amountYen: e.amountYen, ts: e.ts || now }; }
      });
      if (Object.keys(upd).length) r.update(upd);
      if ((A.state.expenses || []).length) { A.state.expenses = []; A.save('expenses'); } // 클라우드로 이전됨
      A.LS.set(flag, true);
    }).catch(function () {});
  }

  // 쓰기 — 성공 시 true(연결+SDK ready). false면 호출부가 로컬로 폴백.
  A.sync.setCheck = function (id, on) {
    if (!ref) return false;
    try {
      if (on) ref.child('checks/' + id).set({ by: A.state.member, ts: Date.now() });
      else ref.child('checks/' + id).remove();
      return true;
    } catch (e) { return false; }
  };
  A.sync.addExpense = function (label, amountYen) {
    if (!ref) return false;
    try { ref.child('expenses').push({ by: A.state.member, label: label || '지출', amountYen: amountYen, ts: Date.now() }); return true; }
    catch (e) { return false; }
  };
  A.sync.delExpense = function (id) {
    if (!ref) return false;
    try { ref.child('expenses/' + id).remove(); return true; } catch (e) { return false; }
  };

  A.sync.unlink = function () {
    if (ref) { try { ref.off(); } catch (e) {} }
    ref = null; curCode = null;
    A.state.familyCode = null; A.state.member = null;
    A.save('familyCode'); A.save('member');
    // 미러는 남겨두되, 미연결이므로 화면 접근자(A.checkOn 등)는 로컬을 사용한다.
  };
})(window.App);
