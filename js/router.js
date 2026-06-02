/* router.js — hash routing into #app */
window.App = window.App || {};
(function (A) {
  'use strict';

  function parse() {
    let h = location.hash.replace(/^#/, '') || '/';
    const qi = h.indexOf('?');
    let query = '';
    if (qi >= 0) { query = h.slice(qi + 1); h = h.slice(0, qi); }
    const parts = h.split('/').filter(Boolean); // ["day","d2"]
    return { parts, q: new URLSearchParams(query) };
  }

  // ---- 제자리 DOM 패치(morph): 같은 화면 데이터 갱신 시 통째 교체 대신 바뀐 노드만 수정 ----
  // 변하지 않은 요소(특히 <img>)를 재생성하지 않아 백그라운드 갱신 시 깜박임이 없다.
  function morphInner(parent, html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    morphChildren(parent, tmp);
  }
  function morphChildren(oldP, newP) {
    let oldN = oldP.firstChild, newN = newP.firstChild;
    while (newN) {
      const nextNew = newN.nextSibling;
      if (!oldN) { oldP.appendChild(newN); newN = nextNew; continue; }   // newN 이동
      const nextOld = oldN.nextSibling;
      const same = oldN.nodeType === newN.nodeType && (oldN.nodeType !== 1 || oldN.tagName === newN.tagName);
      if (same) { morphNode(oldN, newN); }
      else { oldP.replaceChild(newN, oldN); }                             // 위치 교체(태그 다를 때만)
      oldN = nextOld; newN = nextNew;
    }
    while (oldN) { const n = oldN.nextSibling; oldP.removeChild(oldN); oldN = n; }
  }
  function morphNode(oldN, newN) {
    if (oldN.nodeType === 3 || oldN.nodeType === 8) { if (oldN.nodeValue !== newN.nodeValue) oldN.nodeValue = newN.nodeValue; return; }
    if (oldN.nodeType !== 1) return;
    const na = newN.attributes;
    for (let i = 0; i < na.length; i++) { const a = na[i]; if (oldN.getAttribute(a.name) !== a.value) oldN.setAttribute(a.name, a.value); }
    const oa = oldN.attributes;
    for (let i = oa.length - 1; i >= 0; i--) { const a = oa[i]; if (!newN.hasAttribute(a.name)) oldN.removeAttribute(a.name); }
    morphChildren(oldN, newN);
  }

  // 백그라운드 갱신 합치기(날씨·환율·sync): 여러 갱신을 한 번의 제자리 렌더로 코얼레스.
  let _softT = 0;
  A.softRender = function () {
    clearTimeout(_softT);
    _softT = setTimeout(function () {
      const sheet = A.$('#sheet'), lb = A.$('#lightbox');
      if ((sheet && sheet.classList.contains('open')) || (lb && lb.classList.contains('open'))) return;
      A.render({ keepScroll: true });
    }, 120);
  };

  A.render = function (opts) {
    // opts.keepScroll: 동기화로 인한 제자리 갱신 — 스크롤 초기화·전환 애니메이션 생략.
    // (hashchange는 Event를 넘기므로 keepScroll이 없어 기존 동작 유지)
    const keep = !!(opts && opts.keepScroll === true);
    const { parts, q } = parse();
    const name = parts[0] || 'home';
    const S = A.screens;
    let html = '', tab = name;
    try {
      switch (name) {
        case 'home': html = S.home(); tab = 'home'; break;
        case 'day': html = S.day(parts[1]); tab = 'day'; break;
        case 'talk': html = S.talk(); break;
        case 'subway': html = S.subway(); break;
        case 'sos': html = S.sos(); break;
        case 'food': html = S.food(q.get('d')); tab = 'food'; break;
        case 'tips': html = S.tips(); tab = 'home'; break;
        case 'shopping': html = S.shopping(); tab = 'home'; break;
        case 'photo': html = S.photo(); tab = 'home'; break;
        case 'medical': html = S.medical(); tab = 'sos'; break;
        case 'docs': html = S.docs(); tab = 'home'; break;
        case 'search': html = S.search(); tab = 'home'; break;
        case 'guide': html = S.guide(parts[1]); tab = 'day'; break;
        case 'eat': html = S.eat(parts[1]); tab = 'food'; break;
        case 'exchange': html = S.exchange(); tab = 'home'; break;
        case 'check': html = S.check(); tab = 'home'; break;
        case 'info': html = S.info(); tab = 'home'; break;
        case 'join': html = S.join(q); tab = 'home'; break;
        case 'settings': html = S.settings(); tab = 'home'; break;
        default: html = S.home(); tab = 'home';
      }
    } catch (e) {
      console.error('render error', name, e);
      html = '<section class="scr-head"><h1>문제가 발생했어요</h1><p>' + A.esc(String(e)) + '</p><a class="btn-primary" href="#/">홈으로</a></section>';
    }
    const app = A.$('#app');
    const paint = function () {
      // 같은 화면 백그라운드 갱신(keep)은 morph로 제자리 패치 → 이미지 재생성·깜박임 없음.
      // 화면 이동(첫 렌더 포함)은 통째 교체.
      if (keep && app.childNodes && app.childNodes.length) {
        try { morphInner(app, html); } catch (e) { app.innerHTML = html; }
      } else {
        app.innerHTML = html;
      }
      if (!keep) { app.scrollTop = 0; window.scrollTo(0, 0); }
      setActiveTab(tab);
      toggleBack(name);
      A.afterRender(name);
    };
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce && !keep) {
      document.documentElement.dataset.vt = (name === 'home' || name === A._prevName) ? 'fade' : 'push';
      A._prevName = name;
      document.startViewTransition(paint);
    } else {
      A._prevName = name;
      paint();
    }
  };

  // tab-root screens reachable from the bottom bar — no back arrow needed.
  const ROOTS = { home: 1, day: 1, talk: 1, subway: 1, food: 1, sos: 1 };
  function toggleBack(name) {
    const b = A.$('#ab-back');
    if (b) b.hidden = !!ROOTS[name];
  }

  function setActiveTab(tab) {
    A.$$('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  }

  A.startRouter = function () {
    window.addEventListener('hashchange', A.render);
    A.render();
  };
})(window.App);
