/* Layout audit: render every screen, then flag (1) classes used in HTML but not
   defined in CSS, and (2) common mobile overflow risks. Headless (no browser). */
const fs = require('fs');
const path = require('path');
const ROOT = path.dirname(__dirname);
const noopEl = () => ({ style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  setAttribute() {}, appendChild() {}, replaceWith() {}, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, dataset: {}, textContent: '', innerHTML: '', hidden: false });
global.window = global; global.scrollTo = () => {};
global.localStorage = { store: {}, getItem(k) { return k in this.store ? this.store[k] : null; }, setItem(k, v) { this.store[k] = v; } };
global.navigator = { onLine: true, serviceWorker: { register() { return Promise.resolve(); } }, wakeLock: { request() { return Promise.resolve({ release() {} }); } } };
global.location = { hash: '#/', search: '', pathname: '/travel-japan/' };
global.matchMedia = () => ({ matches: false, addEventListener() {} });
const appEl = noopEl();
global.document = Object.assign(noopEl(), { readyState: 'loading', createElement: () => noopEl(),
  querySelector: (s) => (s === '#app' ? appEl : null), querySelectorAll: () => [], body: noopEl(),
  documentElement: { dataset: {}, style: { setProperty() {} } } });
for (const f of ['util', 'icons', 'idb', 'data', 'weather', 'screens', 'panzoom', 'router', 'app']) require(path.join(ROOT, 'js', f + '.js'));
const App = global.App;
['itinerary', 'phrases', 'emergency', 'info', 'transit', 'exchange', 'weather', 'checklist', 'shopping', 'tips', 'restaurants', 'musteat', 'places', 'photospots', 'medical', 'docs', 'guides']
  .forEach((f) => { App.data[f] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f + '.json'))); });
App.buildPlaceIndex();
App.phraseIndex = {}; (App.data.phrases.phrases || []).forEach((p) => { App.phraseIndex[p.id] = p; });
App.state.fav = (App.data.phrases.phrases || []).filter((p) => p.fav).map((p) => p.id);
App.state.fxRate = App.data.exchange.ratePer100;

// render everything
const S = App.screens;
let html = [S.home(), S.talk(), S.subway(), S.sos(), S.tips(), S.shopping(), S.photo(), S.medical(), S.exchange(), S.check(), S.info(), S.settings(), S.docs(), S.search(), S.guide('narita-arrival')];
['d1', 'd2', 'd3', 'd4'].forEach((d) => { html.push(S.day(d)); html.push(S.food(d)); });
// dynamic sheet markup (show / show-text) — capture via the string builders
html.push('<div class="show lvl-allergy"><button class="sheet-x"></button><div class="show-tag warn"></div><div class="show-jp"></div><div class="show-pron"></div><div class="show-ko"></div><p class="show-hint"></p></div>');
html.push(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
const all = html.join('\n');

// classes used
const used = new Set();
for (const m of all.matchAll(/class="([^"]*)"/g)) m[1].split(/\s+/).forEach((c) => { if (c && !c.includes('${') && !c.includes('}')) used.add(c); });
// classes defined in CSS
const css = fs.readFileSync(path.join(ROOT, 'css', 'app.css'), 'utf8') + fs.readFileSync(path.join(ROOT, 'css', 'reset.css'), 'utf8');
const defined = new Set();
for (const m of css.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) defined.add(m[1]);

const missing = [...used].filter((c) => !defined.has(c)).sort();
console.log('=== classes used but NOT defined in CSS ===');
console.log(missing.length ? missing.map((c) => '  ⚠ .' + c).join('\n') : '  (none)');

// CSS overflow-risk heuristics
console.log('\n=== CSS hardening checks ===');
const checks = [
  ['body overflow guard', /body\s*\{[^}]*overflow-wrap/.test(css) || /overflow-x:\s*hidden/.test(css)],
  ['min-width:0 on flex text', /min-width:\s*0/.test(css)],
  ['nowrap KRW could overflow', !/\.krw[^}]*white-space:\s*nowrap/.test(css)],
];
checks.forEach(([n, ok]) => console.log(`  ${ok ? 'ok ' : '⚠  '} ${n}`));

// long-token / fixed-width scan in rendered output
console.log('\n=== fixed px widths in CSS (verify they fit 320px) ===');
[...css.matchAll(/[\w-]+:\s*(\d{3,})px/g)].map((m) => +m[1]).filter((n) => n >= 200)
  .forEach((n) => console.log('  · ' + n + 'px'));
console.log('\nused classes:', used.size, '| defined:', defined.size, '| missing:', missing.length);
