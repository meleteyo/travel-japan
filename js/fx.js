/* fx.js — live JPY→KRW rate via open.er-api.com (online) with offline fallback.
   Updates A.state.fxRate (KRW per 100 JPY). A manual user override (set-rate input)
   is respected on auto-refresh; the explicit refresh button always applies the live rate.
   Mirrors weather.js: same throttle + status-return + cache-fallback philosophy. */
window.App = window.App || {};
(function (A) {
  'use strict';
  const URL = 'https://open.er-api.com/v6/latest/JPY';
  const THROTTLE = 30 * 60 * 1000; // 30분
  let lastTry = 0;

  function parse(json) {
    if (!json || json.result !== 'success' || !json.rates || typeof json.rates.KRW !== 'number') return null;
    const per100 = Math.round(json.rates.KRW * 100);
    if (!(per100 > 0)) return null;
    return { per100: per100 };
  }

  // 부팅 시 캐시(이전 fetch) 적용 → 오프라인에서도 마지막 실측 환율 표시. 수동 오버라이드면 건드리지 않음.
  A.loadCachedRate = function () {
    const c = A.LS.get('fx', null);
    if (c && c.per100 > 0 && !A.state.fxManual) {
      A.state.fxRate = c.per100;
      A.data.exchange.rateSource = 'live';
      A.data.exchange.rateUpdatedAt = c.ts;
    }
  };

  A.rateUpdatedLabel = function () {
    const ex = A.data.exchange;
    if (!ex || ex.rateSource !== 'live' || !ex.rateUpdatedAt) return '';
    try {
      const t = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(ex.rateUpdatedAt));
      return '🔄 실시간 · ' + t;
    } catch (e) { return '🔄 실시간'; }
  };

  // returns: 'ok'(갱신됨) | 'nochange'(받았으나 값 동일) | 'skip'(수동/쓰로틀) | 'fail'(네트워크/파싱)
  // opts.render(기본 true): 성공 시 A.render() 호출 여부 — 수동 새로고침은 호출부가 직접 제어하도록 false 가능
  A.refreshRate = async function (force, opts) {
    opts = opts || {};
    const doRender = opts.render !== false;
    if (typeof fetch === 'undefined') return 'fail';
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'fail';
    // 사용자가 직접 입력한 환율은 자동 갱신에서 존중. 버튼(force)으로는 항상 최신 적용 + 수동 해제.
    if (!force && A.state.fxManual) return 'skip';
    const now = Date.now();
    if (!force && now - lastTry < THROTTLE) return 'skip';
    lastTry = now;
    try {
      const res = await fetch(URL, { cache: 'no-store' });
      if (!res.ok) return 'fail';
      const p = parse(await res.json());
      if (!p) return 'fail';
      const prev = A.state.fxRate;
      A.state.fxRate = p.per100;
      A.state.fxManual = false;
      A.data.exchange.rateSource = 'live';
      A.data.exchange.rateUpdatedAt = now;
      A.LS.set('fx', { ts: now, per100: p.per100 });
      A.save('fxRate'); A.save('fxManual');
      if (doRender && typeof A.render === 'function') A.render();
      return p.per100 === prev ? 'nochange' : 'ok';
    } catch (e) { return 'fail'; }
  };
})(window.App);
