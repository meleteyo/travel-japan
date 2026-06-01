/* data.js — load all data/*.json into App.data */
window.App = window.App || {};
(function (A) {
  'use strict';
  const FILES = ['itinerary', 'phrases', 'emergency', 'info', 'transit', 'exchange',
    'weather', 'checklist', 'shopping', 'tips', 'restaurants', 'musteat', 'places',
    'photospots', 'medical', 'docs'];

  A.data = {};
  A.load = async function () {
    const results = await Promise.all(FILES.map((f) =>
      fetch('data/' + f + '.json', { cache: 'no-cache' })
        .then((r) => { if (!r.ok) throw new Error(f); return r.json(); })
        .catch((e) => { console.warn('data load fail', f, e); return null; })
    ));
    FILES.forEach((f, i) => { A.data[f] = results[i] || {}; });
    // indexes
    A.buildPlaceIndex();
    A.phraseIndex = {};
    (A.data.phrases.phrases || []).forEach((p) => { A.phraseIndex[p.id] = p; });
    // default favorites
    if (A.state.fav == null) {
      A.state.fav = (A.data.phrases.phrases || []).filter((p) => p.fav).map((p) => p.id);
    }
    // default fx rate
    if (A.state.fxRate == null && A.data.exchange.ratePer100) {
      A.state.fxRate = A.data.exchange.ratePer100;
    }
  };

  // ---- "today" resolution in JST ----
  A.tripDay = function () {
    const days = (A.data.itinerary.days) || [];
    // allow ?day=d2 override
    const q = new URLSearchParams(location.search).get('day');
    if (q && days.some((d) => d.id === q)) return { phase: 'during', day: days.find((d) => d.id === q) };
    let jst;
    try {
      jst = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) { jst = new Date().toISOString().slice(0, 10); }
    const today = jst; // YYYY-MM-DD
    const match = days.find((d) => d.date === today);
    if (match) return { phase: 'during', day: match };
    if (days.length) {
      if (today < days[0].date) return { phase: 'before', day: days[0], dleft: A.daysBetween(today, days[0].date) };
      if (today > days[days.length - 1].date) return { phase: 'after', day: days[days.length - 1] };
    }
    return { phase: 'before', day: days[0], dleft: days[0] ? A.daysBetween(today, days[0].date) : 0 };
  };
  A.daysBetween = function (a, b) {
    return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  };
})(window.App);
