/* Verify A.ttsParams picks a different voice (or pitch) for female vs male
   across realistic device voice lists. No browser/DOM needed. */
const path = require('path');
const ROOT = path.dirname(__dirname);
global.window = global;
global.localStorage = { store: {}, getItem: () => null, setItem() {} };
require(path.join(ROOT, 'js', 'util.js'));
const A = global.App;

const V = (name, lang = 'ja-JP') => ({ name, lang });
const devices = {
  'iOS/macOS (Kyoko+Otoya)': [V('Kyoko'), V('Otoya'), V('Samantha', 'en-US')],
  'Windows (Haruka+Ichiro)': [V('Microsoft Haruka Desktop - Japanese'), V('Microsoft Ichiro - Japanese')],
  'Android Google (단일 여성)': [V('Google 日本語')],
  'Android 중립 단일': [V('日本語'), V('en-US Voice', 'en-US')],
  'ja 음성 없음': [V('Google US English', 'en-US')],
};

let fail = 0;
for (const [label, voices] of Object.entries(devices)) {
  A.voices = voices;
  const f = A.ttsParams('female');
  const m = A.ttsParams('male');
  const fKey = (f.voice && f.voice.name) + '@' + f.pitch;
  const mKey = (m.voice && m.voice.name) + '@' + m.pitch;
  const distinct = fKey !== mKey;
  if (!distinct) fail++;
  console.log(`${distinct ? 'ok  ' : 'FAIL'}  ${label}`);
  console.log(`        여자 → ${f.voice ? f.voice.name : '(기본)'} pitch ${f.pitch} ${f.matched ? '(실제 여성음)' : '(음높이 보정)'}`);
  console.log(`        남자 → ${m.voice ? m.voice.name : '(기본)'} pitch ${m.pitch} ${m.matched ? '(실제 남성음)' : '(음높이 보정)'}`);
}
console.log(fail ? `\n❌ ${fail} device(s) produce identical 여/남` : '\n✅ 모든 기기에서 여자/남자가 구분됨');
process.exit(fail ? 1 : 0);
