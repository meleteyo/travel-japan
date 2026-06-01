/* util.js — global helpers, state, ¥→₩ formatter, image helpers */
window.App = window.App || {};
(function (A) {
  'use strict';

  // ---- tiny DOM ----
  A.$ = (sel, root) => (root || document).querySelector(sel);
  A.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  A.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- persistent state ----
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('tj:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('tj:' + k, JSON.stringify(v)); } catch (e) {} },
  };
  A.LS = LS;
  A.state = {
    fav: LS.get('fav', null),               // array of phrase ids (null = use defaults)
    check: LS.get('check', {}),             // {itemId:true}
    wish: LS.get('wish', {}),
    gift: LS.get('gift', {}),
    expenses: LS.get('expenses', []),       // [{id,dayId,label,amountYen,ts}]
    fxRate: LS.get('fxRate', null),         // KRW per 100 JPY
    theme: LS.get('theme', 'auto'),         // light|dark|auto
    font: LS.get('font', 1),                // 1 | 1.1 | 1.22
    voice: LS.get('voice', 'female'),       // female | male (일본어 TTS)
    docExtra: LS.get('docExtra', []),       // 서류함 커스텀 슬롯 [{id,label}]
  };
  A.save = (k) => LS.set(k, A.state[k]);

  // ---- money: ¥ with KRW alongside ----
  A.rate = () => A.state.fxRate || (A.data && A.data.exchange && A.data.exchange.ratePer100) || 920;
  A.krw = (yen) => Math.round(yen * A.rate() / 100 / 10) * 10;
  const comma = (n) => n.toLocaleString('ko-KR');
  // number -> "¥1,930 (약 ₩17,760)"
  A.fmtYen = (yen) =>
    `<span class="yen"><span class="jpy">¥${comma(yen)}</span> <span class="krw">약 ₩${comma(A.krw(yen))}</span></span>`;
  // free-form price string ("¥3,960–¥19,800", "1,930~3,060") -> original + KRW range
  A.fmtRange = (str) => {
    const nums = (String(str).match(/[\d,]+/g) || []).map((x) => parseInt(x.replace(/,/g, ''), 10)).filter((n) => n >= 50);
    let krw = '';
    if (nums.length) {
      const lo = Math.min.apply(null, nums), hi = Math.max.apply(null, nums);
      krw = lo === hi ? `약 ₩${comma(A.krw(lo))}` : `약 ₩${comma(A.krw(lo))}~₩${comma(A.krw(hi))}`;
    }
    const s = String(str).trim();
    const body = /¥/.test(s) ? s : '¥' + s;
    return `<span class="yen"><span class="jpy">${A.esc(body)}</span>${krw ? ` <span class="krw">${krw}</span>` : ''}</span>`;
  };

  // ---- images (local webp, graceful fallback) ----
  A.placeIndex = {};
  A.buildPlaceIndex = () => {
    A.placeIndex = {};
    ((A.data.places && A.data.places.items) || []).forEach((p) => { A.placeIndex[p.key] = p; });
  };
  A.placeImg = (key) => (A.placeIndex[key] && A.placeIndex[key].imageUrl) || '';
  // returns HTML for an image with fallback; emoji shown if no src
  A.img = (src, alt, cls, emoji) => {
    cls = cls || '';
    if (!src) return `<div class="img-ph ${cls}" role="img" aria-label="${A.esc(alt || '')}">${emoji || '🗾'}</div>`;
    return `<img class="${cls}" src="${A.esc(src)}" alt="${A.esc(alt || '')}" loading="lazy" decoding="async"
      onerror="App.imgFail(this,'${emoji || '🗾'}')">`;
  };
  A.imgFail = (el, emoji) => {
    const d = document.createElement('div');
    d.className = 'img-ph ' + el.className;
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', el.alt || '');
    d.textContent = emoji || '🗾';
    el.replaceWith(d);
  };

  // ---- tel / maps ----
  A.telHref = (t) => 'tel:' + String(t).replace(/[^+\d]/g, '');
  A.gmap = (q) => /^https?:/.test(q) ? q : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);

  // ---- toast ----
  A.toast = (msg) => {
    let t = A.$('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(A._tt); A._tt = setTimeout(() => t.classList.remove('show'), 2200);
  };

  // ---- fullscreen "show to staff" sheet ----
  A.openSheet = (html) => {
    let s = A.$('#sheet');
    if (!s) {
      s = document.createElement('div'); s.id = 'sheet';
      s.innerHTML = '<div class="sheet-inner"></div>';
      s.addEventListener('click', (e) => { if (e.target === s) A.closeSheet(); });
      document.body.appendChild(s);
    }
    A.$('.sheet-inner', s).innerHTML = html;
    s.classList.add('open');
    document.body.style.overflow = 'hidden';
    A.wakeLock(true);
  };
  A.closeSheet = () => {
    const s = A.$('#sheet'); if (s) s.classList.remove('open');
    document.body.style.overflow = '';
    A.wakeLock(false);
  };

  // ---- wake lock (keep screen on while showing phrase) ----
  A._wl = null;
  A.wakeLock = async (on) => {
    try {
      if (on && 'wakeLock' in navigator) { A._wl = await navigator.wakeLock.request('screen'); }
      else if (A._wl) { A._wl.release(); A._wl = null; }
    } catch (e) {}
  };

  // ---- theme & font ----
  A.applyTheme = () => {
    const t = A.state.theme;
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.setProperty('--font-scale', A.state.font);
  };

  // ---- 일본어 TTS (Web Speech API) ----
  A.ttsOk = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
  A.voices = [];
  A.loadVoices = () => { try { A.voices = window.speechSynthesis.getVoices() || []; } catch (e) { A.voices = []; } };
  const MALE = /otoya|ichiro|hattori|daichi|takumi|kenji|男性|男/i;
  const FEMALE = /kyoko|haruka|ayumi|nanami|sayaka|mizuki|o-?ren|google|female|女性|女/i;
  // returns {voice, matched, pitch, rate}: matched=true means a real gendered
  // voice exists; otherwise we fake gender with pitch (works on 1-voice phones).
  A.ttsParams = (gender) => {
    const g = gender || A.state.voice || 'female';
    const ja = A.voices.filter((v) => /^ja(-|_|$)/i.test(v.lang));
    const female = ja.find((v) => FEMALE.test(v.name));
    const male = ja.find((v) => MALE.test(v.name));
    let voice = null, matched = false;
    if (g === 'male') {
      if (male) { voice = male; matched = true; }
      else voice = ja.find((v) => !FEMALE.test(v.name)) || ja[0] || null;
    } else {
      if (female) { voice = female; matched = true; }
      else voice = ja.find((v) => !MALE.test(v.name)) || ja[0] || null;
    }
    const pitch = matched ? 1.0 : (g === 'male' ? 0.7 : 1.4);
    const rate = matched ? 0.92 : (g === 'male' ? 0.9 : 0.96);
    return { voice, matched, pitch, rate, gender: g };
  };
  A.speak = (text, gender) => {
    if (!text) return;
    if (!A.ttsOk()) { A.toast('이 기기는 음성 재생을 지원하지 않아요'); return; }
    try {
      const ss = window.speechSynthesis;
      ss.cancel();
      if (!A.voices.length) A.loadVoices();
      const p = A.ttsParams(gender);
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'ja-JP'; u.pitch = p.pitch; u.rate = p.rate;
      if (p.voice) u.voice = p.voice;
      ss.speak(u);
    } catch (e) { A.toast('음성 재생 실패'); }
  };

  // ---- 서류 캡처: 파일 → 다운스케일된 dataURL (기기 저장용) ----
  A.downscaleToDataURL = (file, max) => new Promise((resolve, reject) => {
    max = max || 1600;
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        if (Math.max(w, h) > max) { const s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        try { resolve(c.toDataURL('image/jpeg', 0.82)); } catch (e) { reject(e); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
})(window.App);
