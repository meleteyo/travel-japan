/* Headless smoke test: stub a minimal DOM, load the app, render every screen. */
const fs = require('fs');
const path = require('path');
const ROOT = path.dirname(__dirname);

const noopEl = () => ({ style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  setAttribute() {}, appendChild() {}, replaceWith() {}, querySelector: () => null, querySelectorAll: () => [],
  addEventListener() {}, dataset: {}, textContent: '', innerHTML: '', hidden: false });

global.window = global;
global.scrollTo = () => {};
global.localStorage = { store: {}, getItem(k) { return k in this.store ? this.store[k] : null; }, setItem(k, v) { this.store[k] = v; } };
global.navigator = { onLine: true, serviceWorker: { register() { return Promise.resolve(); } }, wakeLock: { request() { return Promise.resolve({ release() {} }); } } };
global.location = { hash: '#/', search: '', pathname: '/travel-japan/' };
global.matchMedia = () => ({ matches: false, addEventListener() {} });
const appEl = noopEl();
global.document = Object.assign(noopEl(), { readyState: 'loading',
  createElement: () => noopEl(), querySelector: (s) => (s === '#app' ? appEl : null), querySelectorAll: () => [],
  body: noopEl(), documentElement: { dataset: {}, style: { setProperty() {} } } });

for (const f of ['util', 'data', 'screens', 'panzoom', 'router', 'app'])
  require(path.join(ROOT, 'js', f + '.js'));
const App = global.App;

const FILES = ['itinerary', 'phrases', 'emergency', 'info', 'transit', 'exchange', 'weather',
  'checklist', 'shopping', 'tips', 'restaurants', 'musteat', 'places', 'photospots', 'medical'];
FILES.forEach((f) => { App.data[f] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f + '.json'))); });
App.buildPlaceIndex();
App.phraseIndex = {}; (App.data.phrases.phrases || []).forEach((p) => { App.phraseIndex[p.id] = p; });
App.state.fav = (App.data.phrases.phrases || []).filter((p) => p.fav).map((p) => p.id);
App.state.fxRate = App.data.exchange.ratePer100;

let fail = 0;
const S = App.screens;
const cases = {
  home: () => S.home(), 'day(d2)': () => S.day('d2'), 'day(bad)': () => S.day('zzz'),
  talk: () => S.talk(), subway: () => S.subway(), sos: () => S.sos(),
  'food(d3)': () => S.food('d3'), tips: () => S.tips(), shopping: () => S.shopping(),
  photo: () => S.photo(), medical: () => S.medical(), exchange: () => S.exchange(),
  check: () => S.check(), info: () => S.info(), settings: () => S.settings(),
};
for (const [k, fn] of Object.entries(cases)) {
  try {
    const h = fn();
    if (typeof h !== 'string' || h.length < 20) throw new Error('empty/short output');
    if (/undefined|\[object Object\]|NaN/.test(h)) throw new Error('suspicious token in output: ' + (h.match(/undefined|\[object Object\]|NaN/) || [])[0]);
    console.log('ok   ', k.padEnd(12), h.length);
  } catch (e) { fail++; console.log('FAIL ', k.padEnd(12), e.message); }
}
// helpers
try { console.log('fmtYen', App.fmtYen(1930).replace(/<[^>]+>/g, '')); } catch (e) { fail++; console.log('FAIL fmtYen', e.message); }
try { console.log('fmtRange', App.fmtRange('¥3,960–¥19,800').replace(/<[^>]+>/g, '')); } catch (e) { fail++; console.log('FAIL fmtRange', e.message); }
try { const t = App.tripDay(); console.log('tripDay', t.phase, t.day && t.day.id); } catch (e) { fail++; console.log('FAIL tripDay', e.message); }

// regression: food day-tabs must follow the URL (?d=), not snap back
try {
  global.location.hash = '#/food?d=d2'; App.render();
  const a = App._foodDay;
  global.location.hash = '#/food?d=d3'; App.render();   // simulate tapping "3일" tab
  const b = App._foodDay;
  global.location.hash = '#/food?d=d4'; App.render();
  const c = App._foodDay;
  if (a === 'd2' && b === 'd3' && c === 'd4') console.log('ok    food-day-switch d2→d3→d4');
  else { fail++; console.log(`FAIL  food-day-switch got ${a},${b},${c}`); }
} catch (e) { fail++; console.log('FAIL food-day-switch', e.message); }

console.log(fail ? `\n❌ ${fail} failures` : '\n✅ all screens rendered');
process.exit(fail ? 1 : 0);
