/* weather.js — live weather via Open-Meteo (online) with offline fallback.
   Overrides only the numeric/icon fields of A.data.weather.days in place;
   curated advice/clothing are preserved. */
window.App = window.App || {};
(function (A) {
  'use strict';
  const LAT = 35.7281, LON = 139.7707; // 닛포리 인근
  const URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&timezone=Asia%2FTokyo&forecast_days=16';
  const THROTTLE = 30 * 60 * 1000; // 30분
  let lastTry = 0;

  // WMO weather_code → 한국어 요약 + 이모지
  A.wmoIcon = function (code) {
    if (code === 0) return { icon: '☀️', summary: '맑음' };
    if (code === 1 || code === 2) return { icon: '⛅', summary: '대체로 맑음' };
    if (code === 3) return { icon: '☁️', summary: '흐림' };
    if (code === 45 || code === 48) return { icon: '🌫️', summary: '안개' };
    if (code >= 51 && code <= 57) return { icon: '🌦️', summary: '이슬비' };
    if (code >= 61 && code <= 67) return { icon: '🌧️', summary: '비' };
    if (code >= 71 && code <= 77) return { icon: '🌨️', summary: '눈' };
    if (code >= 80 && code <= 82) return { icon: '🌦️', summary: '소나기' };
    if (code === 85 || code === 86) return { icon: '🌨️', summary: '소낙눈' };
    if (code >= 95) return { icon: '⛈️', summary: '뇌우' };
    return { icon: '⛅', summary: '흐림' };
  };

  function dayIdToDate() {
    const m = {};
    ((A.data.itinerary && A.data.itinerary.days) || []).forEach((d) => { m[d.id] = d.date; });
    return m;
  }

  // map: { 'YYYY-MM-DD': {code,tmax,tmin,pop} }
  A.applyWeather = function (map, ts) {
    const wx = A.data.weather; if (!wx || !wx.days) return 0;
    const id2date = dayIdToDate();
    let n = 0;
    wx.days.forEach((d) => {
      const date = id2date[d.dayId];
      const f = date && map[date];
      if (!f) return;
      const wi = A.wmoIcon(f.code);
      d.icon = wi.icon; d.summary = wi.summary;
      if (typeof f.pop === 'number') d.rainPct = f.pop;
      if (typeof f.tmin === 'number') d.tempMin = Math.round(f.tmin);
      if (typeof f.tmax === 'number') d.tempMax = Math.round(f.tmax);
      d.live = true; n++;
    });
    if (n) { wx.source = 'live'; wx.updatedAt = ts || Date.now(); }
    return n;
  };

  A.weatherUpdatedLabel = function () {
    const wx = A.data.weather;
    if (!wx || wx.source !== 'live' || !wx.updatedAt) return '';
    try {
      const t = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(wx.updatedAt));
      return `🔄 실시간 · ${t}`;
    } catch (e) { return '🔄 실시간'; }
  };

  A.loadCachedWeather = function () {
    const c = A.LS.get('wx', null);
    if (c && c.map) A.applyWeather(c.map, c.ts);
  };

  function parse(json) {
    const dy = json && json.daily; if (!dy || !dy.time) return null;
    const map = {};
    dy.time.forEach((date, i) => {
      map[date] = {
        code: dy.weather_code ? dy.weather_code[i] : undefined,
        tmax: dy.temperature_2m_max ? dy.temperature_2m_max[i] : undefined,
        tmin: dy.temperature_2m_min ? dy.temperature_2m_min[i] : undefined,
        pop: dy.precipitation_probability_max ? dy.precipitation_probability_max[i] : undefined,
      };
    });
    return map;
  }

  A.refreshWeather = async function (force) {
    if (typeof fetch === 'undefined') return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const now = Date.now();
    if (!force && now - lastTry < THROTTLE) return;
    lastTry = now;
    try {
      const res = await fetch(URL, { cache: 'no-store' });
      if (!res.ok) return;
      const map = parse(await res.json());
      if (!map) return;
      const n = A.applyWeather(map, now);
      if (n) {
        A.LS.set('wx', { ts: now, map });
        if (typeof A.render === 'function') A.render();
      }
    } catch (e) { /* offline/blocked — keep fallback silently */ }
  };
})(window.App);
