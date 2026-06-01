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

  A.render = function () {
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
        case 'food': html = S.food(q.get('d')); tab = 'home'; break;
        case 'tips': html = S.tips(); tab = 'home'; break;
        case 'shopping': html = S.shopping(); tab = 'home'; break;
        case 'photo': html = S.photo(); tab = 'home'; break;
        case 'medical': html = S.medical(); tab = 'sos'; break;
        case 'docs': html = S.docs(); tab = 'home'; break;
        case 'search': html = S.search(); tab = 'home'; break;
        case 'guide': html = S.guide(parts[1]); tab = 'day'; break;
        case 'exchange': html = S.exchange(); tab = 'home'; break;
        case 'check': html = S.check(); tab = 'home'; break;
        case 'info': html = S.info(); tab = 'home'; break;
        case 'settings': html = S.settings(); tab = 'home'; break;
        default: html = S.home(); tab = 'home';
      }
    } catch (e) {
      console.error('render error', name, e);
      html = '<section class="scr-head"><h1>문제가 발생했어요</h1><p>' + A.esc(String(e)) + '</p><a class="btn-primary" href="#/">홈으로</a></section>';
    }
    const app = A.$('#app');
    app.innerHTML = html;
    app.scrollTop = 0; window.scrollTo(0, 0);
    setActiveTab(tab);
    toggleBack(name);
    A.afterRender(name);
  };

  // tab-root screens reachable from the bottom bar — no back arrow needed.
  const ROOTS = { home: 1, day: 1, talk: 1, subway: 1, sos: 1 };
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
