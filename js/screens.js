/* screens.js — render functions for every route */
window.App = window.App || {};
(function (A) {
  'use strict';
  const esc = A.esc;
  const S = {};
  A.screens = S;

  // ---------- shared bits ----------
  const head = (title, sub) =>
    `<header class="scr-head"><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</header>`;
  const weatherOf = (dayId) => ((A.data.weather.days || []).find((w) => w.dayId === dayId)) || null;
  const wLive = () => (A.weatherUpdatedLabel ? A.weatherUpdatedLabel() : '');
  const wBadge = (w) => w ? `<span class="wbadge">${w.icon} ${w.summary} · 비 ${w.rainPct}% · ${w.tempMin}~${w.tempMax}°${wLive() ? ` <small>${wLive()}</small>` : ''}</span>` : '';
  const showBtn = (jp, pron, ko, level) =>
    `<button class="show-btn" data-action="show-text" data-jp="${esc(jp)}" data-pron="${esc(pron || '')}" data-ko="${esc(ko || '')}" data-level="${level || ''}">📢 보여주기</button>`;
  const telBtn = (tel, label) => tel ? `<a class="tel-btn" href="${A.telHref(tel)}">📞 ${esc(label || '전화')}</a>` : '';
  const mapBtn = (q, label) => q ? `<a class="map-btn" href="${A.gmap(q)}" target="_blank" rel="noopener">🗺 ${esc(label || '지도')}</a>` : '';

  // ====================================================== HOME
  S.home = function () {
    const t = A.tripDay();
    const trip = A.data.itinerary.trip || {};
    let hero = '';
    if (t.phase === 'before' && t.dleft >= 1) {
      hero = `<div class="today-card before">
        <div class="dday">D-${t.dleft}</div>
        <div class="tc-body"><strong>출발까지 ${t.dleft}일</strong>
        <p>준비물 체크리스트부터 확인해요.</p>
        <a class="btn-primary" href="#/check">출발 전 체크리스트</a></div></div>`;
    } else if (t.phase === 'after') {
      hero = `<div class="today-card"><div class="tc-body"><strong>여행이 끝났어요 🎉</strong><p>즐거운 추억 되었길 바라요!</p></div></div>`;
    } else {
      const d = t.day; const next = (d.stops || [])[0];
      hero = `<a class="today-card" href="#/day/${d.id}">
        ${A.img(A.placeImg(d.hero), d.title, 'tc-img')}
        <div class="tc-body"><span class="tc-tag">오늘 · ${d.n}일차 (${d.dow})</span>
        <strong>${esc(d.title)}</strong><p>${esc(d.summary)}</p>
        ${wBadge(weatherOf(d.id))}</div></a>`;
    }
    // budget widget — 가족 연결 시 공유 가계부, 아니면 로컬 (쇼핑 화면과 같은 소스)
    const total = (A.expenseList ? A.expenseList() : (A.state.expenses || [])).reduce((s, e) => s + (e.amountYen || 0), 0);
    const budgetVal = total
      ? `<span class="yen"><span class="krw">₩${(A.krw(total)).toLocaleString('ko-KR')}</span> <span class="jpy">¥${total.toLocaleString('ko-KR')}</span></span>`
      : '<span class="muted">기록 없음</span>';
    const budget = `<a class="widget" href="#/shopping"><span class="w-ic">💴</span><span class="w-k">지출 합계</span>
      <span class="w-v">${budgetVal}</span></a>`;
    // clothing widget
    const w = weatherOf((t.day || {}).id) || (A.data.weather.days || [])[0];
    const cloth = w ? `<a class="widget" href="#/day/${(t.day||{}).id||'d1'}"><span class="w-ic">${w.icon}</span>
      <span class="w-k">오늘 옷차림</span><span class="w-v small">${(w.clothing||[]).map(esc).join(' · ')}</span></a>` : '';

    const small = [
      ['#/day/' + ((t.day || {}).id || 'd1'), 'calendar', '일정'],
      ['#/info', 'clipboard', '예약·정보'],
      ['#/docs', 'folder', '서류함'],
      ['#/tips', 'bulb', '꿀팁'],
      ['#/photo', 'camera', '포토'],
      ['#/exchange', 'swap', '환율'],
      ['#/medical', 'medical', '병원'],
      ['#/check', 'check', '체크'],
    ];
    const greet = t.phase === 'before' ? '여행 준비 중' : t.phase === 'after' ? '다녀온 여행' : '여행 중';
    return `<section class="home">
      <header class="home-top">
        <span class="home-eyebrow">${esc(greet)}</span>
        <h1>${esc(trip.title || '도쿄 여행')}</h1>
        <p>${esc(trip.subtitle || '')}</p>
      </header>
      <a class="home-search" href="#/search">${A.icon('search')}<span>무엇이든 검색 — 회화·맛집·교통·꿀팁…</span></a>
      ${hero}
      <div class="widgets">${budget}${cloth}</div>
      <h2 class="sec">바로가기</h2>
      <div class="bento">
        <a class="tile feature" href="#/talk">
          <span class="tile-ic">${A.icon('chat')}</span>
          <span class="tile-txt"><b>회화 · 보여주기</b><small>말이 안 통할 땐 화면으로 보여주세요</small></span>
          <span class="tile-go">${A.icon('next')}</span>
        </a>
        <a class="tile danger" href="#/sos"><span class="tile-ic">${A.icon('alert')}</span><b>긴급</b></a>
        <a class="tile" href="#/subway"><span class="tile-ic">${A.icon('map')}</span><b>노선도</b></a>
        <a class="tile" href="#/food"><span class="tile-ic">${A.icon('food')}</span><b>맛집</b></a>
        <a class="tile" href="#/shopping"><span class="tile-ic">${A.icon('bag')}</span><b>쇼핑</b></a>
      </div>
      <h2 class="sec">더 보기</h2>
      <div class="grid-small">${small.map(([h, i, l]) => `<a class="card-act sm" href="${h}"><span class="ca-ic">${A.icon(i)}</span><span>${l}</span></a>`).join('')}</div>
      <p class="foot-note">출발 전 와이파이에서 <a href="#/settings">오프라인 전체 저장</a>을 한 번 실행하면 인터넷 없이도 모두 열려요.</p>
    </section>`;
  };

  // ====================================================== DAY
  S.day = function (id) {
    const days = A.data.itinerary.days || [];
    const d = days.find((x) => x.id === id) || days[0];
    if (!d) return head('일정');
    const w = weatherOf(d.id);
    const chips = days.map((x) => `<a class="chip ${x.id === d.id ? 'on' : ''}" href="#/day/${x.id}">${x.n}일 ${x.dow}</a>`).join('');
    // 오늘 보는 날이면 현재 시각 기준으로 지난/지금 스팟 표시
    const tnow = A.tripDay();
    const isToday = tnow.phase === 'during' && tnow.day && tnow.day.id === d.id;
    let nowMin = -1, curIdx = -1;
    if (isToday) {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
        const hh = +parts.find((p) => p.type === 'hour').value, mm = +parts.find((p) => p.type === 'minute').value;
        nowMin = hh * 60 + mm;
      } catch (e) { nowMin = -1; }
      const mins = (d.stops || []).map((s) => { const m = /(\d{1,2}):(\d{2})/.exec(s.time || ''); return m ? (+m[1]) * 60 + (+m[2]) : -1; });
      for (let i = 0; i < mins.length; i++) { if (mins[i] >= 0 && mins[i] <= nowMin) curIdx = i; }
    }
    const stops = (d.stops || []).map((s, i) => {
      const tips = (s.tips || []).length ? `<ul class="tips">${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
      const state = isToday ? (i < curIdx ? ' past' : (i === curIdx ? ' now' : '')) : '';
      return `<div class="stop${state}">
        <div class="stop-rail"><span class="stop-time">${esc(s.time || '')}</span><span class="stop-node"></span></div>
        <div class="stop-card">
          ${i === curIdx ? '<span class="now-tag">지금</span>' : ''}
          ${A.img(A.placeImg(s.img), s.name, 'stop-img')}
          <div class="stop-body">
            <h3>${esc(s.name)} ${s.nameJa ? `<small>${esc(s.nameJa)}</small>` : ''}</h3>
            ${s.station ? `<div class="stn">${A.icon('pin')} ${esc(s.station)}</div>` : ''}
            ${s.desc ? (s.guide
              ? `<a class="stop-desc-link" href="#/guide/${s.guide}"><p>${esc(s.desc)}</p><span class="more">상세 가이드 ›</span></a>`
              : (s.link
                ? `<a class="stop-desc-link" href="${esc(s.link)}"><p>${esc(s.desc)}</p><span class="more">${esc(s.linkLabel || '자세히 ›')}</span></a>`
                : `<p>${esc(s.desc)}</p>`)) : ''}
            ${tips}
            <div class="row-btns">${s.nameJa ? showBtn(s.nameJa, '', s.name) : ''}${mapBtn(s.gmap || s.name)}</div>
            ${s.fareYen ? `<div class="fare">이동 요금 ${A.fmtYen(s.fareYen)}</div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
    return `<section class="dayv">
      ${head(d.n + '일차 · ' + d.title, d.date + ' (' + d.dow + ') · ' + d.mood)}
      <div class="chips">${chips}</div>
      ${w ? `<div class="weather-band">${w.icon} <strong>${esc(w.summary)} · 비 ${w.rainPct}% · ${w.tempMin}~${w.tempMax}°</strong> <button class="wlive" data-action="refresh-weather" aria-label="날씨 새로고침">${wLive() || '🔄 예보 · 새로고침'}</button><br><span>${esc(w.advice)}</span></div>` : ''}
      ${d.moveNote ? `<p class="movenote">🧭 ${esc(d.moveNote)}</p>` : ''}
      <div class="timeline${isToday ? ' is-today' : ''}">${stops}</div>
      <a class="btn-block" href="#/food?d=${d.id}">이 날 맛집·식사 보기</a>
    </section>`;
  };

  // ====================================================== TALK
  S.talk = function () {
    const cats = A.data.phrases.categories || [];
    const chipFav = `<button class="tchip on" data-action="talk-cat" data-cat="fav">★ 즐겨찾기</button>`;
    const chipAll = `<button class="tchip" data-action="talk-cat" data-cat="all">전체</button>`;
    const chips = cats.map((c) => `<button class="tchip" data-action="talk-cat" data-cat="${c.id}">${esc(c.label)}</button>`).join('');
    // 즐겨찾기를 저장된 순서대로 먼저, 나머지는 원래 순서로 — 즐겨찾기 탭에서 드래그 정렬 가능
    const all = A.data.phrases.phrases || [];
    const favIds = A.state.fav || [];
    const favSet = new Set(favIds);
    const ordered = favIds.map((id) => all.find((p) => p.id === id)).filter(Boolean)
      .concat(all.filter((p) => !favSet.has(p.id)));
    const rows = ordered.map((p) => {
      const on = favSet.has(p.id);
      return `<div class="prow lvl-${p.level || 'n'}" data-cat="${p.cat}" data-ko="${esc(p.ko)}" data-id="${p.id}">
        <button class="prow-main" data-action="show" data-id="${p.id}">
          <div class="p-ko">${esc(p.ko)}</div>
          <div class="p-jp" lang="ja">${esc(p.jp)}</div>
          <div class="p-pron">${esc(p.pron)}</div>
          ${p.note ? `<div class="p-note">💡 ${esc(p.note)}</div>` : ''}
        </button>
        <button class="fav ${on ? 'on' : ''}" data-action="fav" data-id="${p.id}" aria-label="즐겨찾기">${on ? '★' : '☆'}</button>
        <span class="prow-drag" aria-hidden="true" title="드래그해서 순서 변경">⠿</span>
      </div>`;
    }).join('');
    const usage = (A.data.phrases.usage || []).map((u) => `<li>${esc(u)}</li>`).join('');
    return `<section class="talk">
      ${head('회화', '문장을 탭하면 크게 — 점원에게 보여주세요')}
      <details class="usage"><summary>💡 사용 요령</summary><ul>${usage}</ul></details>
      <div class="talk-filter">
        <input class="search" type="search" placeholder="한국어로 검색 (예: 카드, 화장실)" data-action="talk-search" aria-label="회화 검색">
        <div class="tchips">${chipFav}${chipAll}${chips}</div>
      </div>
      <div class="plist fav-view" id="plist"><p class="fav-hint muted small">⠿ 손잡이를 끌어 즐겨찾기 순서를 바꿀 수 있어요</p>${rows}</div>
    </section>`;
  };

  // show one phrase fullscreen
  A.showPhrase = function (id) {
    const p = A.phraseIndex[id]; if (!p) return;
    A.showText(p.jp, p.pron, p.ko, p.level);
  };
  A.showText = function (jp, pron, ko, level) {
    A._lastShownJp = jp;
    const tts = A.ttsOk() ? `<div class="show-tts"><button class="tts-play" data-action="tts" data-text="${esc(jp)}">🔊 듣기</button></div>` : '';
    A.openSheet(`<div class="show lvl-${level || 'n'}">
      <button class="sheet-x" data-action="close-sheet" aria-label="닫기">✕</button>
      ${level === 'allergy' ? '<div class="show-tag warn">⚠️ 알레르기</div>' : level === 'emergency' ? '<div class="show-tag danger">🆘 긴급</div>' : ''}
      <div class="show-jp" lang="ja">${esc(jp)}</div>
      <div class="show-pron">${esc(pron || '')}</div>
      <div class="show-ko">${esc(ko || '')}</div>
      ${tts}
      <p class="show-hint">이 화면을 상대에게 돌려서 보여주세요</p>
    </div>`);
  };

  // ====================================================== SUBWAY
  S.subway = function () {
    const t = A.data.transit;
    const routes = (t.routes || []).map((r) => `<div class="route">
      <div class="r-path"><strong>${esc(r.from)}</strong><span class="r-arrow">${A.icon('next')}</span><strong>${esc(r.to)}</strong></div>
      <div class="r-meta"><span class="r-line">${esc(r.line)}</span><span>${r.min}분</span><span>${A.fmtYen(r.fareYen)}</span></div>
      ${r.note ? `<div class="r-note">${esc(r.note)}</div>` : ''}</div>`).join('');
    const stns = (t.stations || []).map((s) =>
      `<button class="stn-chip" data-action="show-text" data-jp="${esc(s.ja)}" data-pron="${esc(s.roma)}" data-ko="${esc(s.ko)}역">${esc(s.ko)} <small lang="ja">${esc(s.ja)}</small></button>`).join('');
    const how = (t.howto || []).map((h) => `<div class="howto"><h3>${h.icon} ${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join('');
    const map = t.map || {};
    return `<section class="subway">
      ${head('교통 · 지하철', t.hub ? '거점 ' + t.hub : '')}
      <p class="summary">${esc(t.summary || '')}</p>
      <button class="map-thumb" data-action="lightbox" data-src="${esc(map.webp || map.png || '')}" data-alt="${esc(map.alt || '노선도')}">
        ${A.img(map.webp || map.png, map.alt, 'mapimg', '🗺')}<span class="zoom-hint">${A.icon('search')} 탭하면 크게 · 핀치 줌</span></button>
      <h2 class="sec">주요 경로 (요금 원화 병기)</h2>
      <div class="routes">${routes}</div>
      <h2 class="sec">역 이름 보여주기</h2>
      <div class="stns">${stns}</div>
      <h2 class="sec">이용 방법</h2>
      ${how}
    </section>`;
  };

  // ====================================================== SOS
  S.sos = function () {
    const e = A.data.emergency;
    const contacts = (e.contacts || []).map((c) => `<a class="sos-tel ${c.danger ? 'danger' : ''}" href="${A.telHref(c.tel)}">
      <span class="st-ic">${c.icon}</span><span class="st-l"><strong>${esc(c.label)}</strong><small>${esc(c.sub || '')} · ${esc(c.tel)}</small></span><span class="st-go">📞</span></a>`).join('');
    const hs = e.hotelShow || {};
    const h = (A.data.info || {}).hotel || {};
    const hotelBtns = `${telBtn(h.tel, '호텔 전화')}${mapBtn(h.gmap || h.name, '지도에서 보기')}`;
    // 비상 서류: 여권(3)+보험(1) — docs.json 그룹에서 단일 소스로 라벨/슬롯ID를 읽어 서류함과 절대 어긋나지 않게.
    // 같은 슬롯 ID를 재사용해 IndexedDB의 동일 레코드를 읽음(기기에만 저장, 업로드 없음). SPA는 화면을 하나만 그리므로 docbody- ID 충돌 없음.
    const groups = ((A.data.docs || {}).groups) || [];
    const docGroup = (gid) => groups.find((g) => g.id === gid) || { icon: '📄', slots: [] };
    const slotCard = (s, icon) => `<div class="doc-slot">
      <div class="doc-label">${icon || '📄'} ${esc(s.label)}</div>
      <div class="doc-body" id="docbody-${esc(s.id)}">
        <button class="doc-pick" data-action="doc-pick" data-slot="${esc(s.id)}">＋ 불러오기</button>
      </div></div>`;
    const pp = docGroup('passport');
    const ins = docGroup('insurance');
    const docSlots = (pp.slots || []).map((s) => slotCard(s, pp.icon))
      .concat((ins.slots || []).map((s) => slotCard(s, ins.icon))).join('');
    const flows = (e.flows || []).map((f) => {
      const steps = (f.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
      const ph = (f.phraseIds || []).map((id) => { const p = A.phraseIndex[id]; return p ? `<button class="mini-show" data-action="show" data-id="${id}">📢 ${esc(p.ko)}</button>` : ''; }).join('');
      return `<details class="flow"><summary>${f.icon} ${esc(f.title)}</summary><ol>${steps}</ol>${ph ? `<div class="row-btns">${ph}</div>` : ''}</details>`;
    }).join('');
    return `<section class="sos">
      ${head('긴급', '버튼을 누르면 바로 전화가 걸려요')}
      <div class="sos-tels">${contacts}</div>
      <div class="hotel-show">
        <div class="hs-t">🏨 ${esc(hs.title || '호텔 주소 보여주기')}</div>
        <div class="hs-ja" lang="ja">${esc(hs.nameJa || '')}<br>${esc(hs.addrJa || '')}</div>
        <div class="hs-near">${esc(hs.near || '')}</div>
        <button class="show-btn wide" data-action="show-text" data-jp="${esc((hs.nameJa || '') + '  ' + (hs.addrJa || ''))}" data-pron="" data-ko="우리 호텔로 가주세요">📢 크게 보여주기</button>
        ${hotelBtns ? `<div class="row-btns">${hotelBtns}</div>` : ''}
      </div>
      <h2 class="sec">🛂 비상 서류</h2>
      <div class="doc-note sos-doc-note">🔒 <b>이 기기에만</b> 저장돼요(인터넷에 안 올라감). 미리 폰에 저장해두면 <b>오프라인에서도</b> 바로 보여줄 수 있어요. <a href="#/docs">서류함에서 전체 관리 ›</a></div>
      <div class="doc-grid">${docSlots}</div>
      <input type="file" accept="image/*" id="doc-file" hidden>
      <h2 class="sec">상황별 대처</h2>
      ${flows}
      <a class="btn-block" href="#/medical">🏥 병원 · 약국 · 상비약 보기</a>
    </section>`;
  };

  // ====================================================== FOOD
  A._foodDay = null;
  S.food = function (qDay) {
    const days = A.data.restaurants.days || [];
    if (qDay && days.some((x) => x.dayId === qDay)) A._foodDay = qDay;
    if (!A._foodDay) { const t = A.tripDay(); A._foodDay = (t.day && days.some((x) => x.dayId === t.day.id)) ? t.day.id : (days[0] || {}).dayId; }
    const cur = days.find((x) => x.dayId === A._foodDay) || days[0];
    const dayMeta = (A.data.itinerary.days || []).find((x) => x.id === (cur || {}).dayId) || {};
    const tabs = days.map((x) => {
      const dm = (A.data.itinerary.days || []).find((d) => d.id === x.dayId) || {};
      return `<button class="chip ${x.dayId === (cur || {}).dayId ? 'on' : ''}" data-action="food-day" data-day="${x.dayId}">${dm.n || ''}일 ${esc((x.area || '').split(' · ')[0])}</button>`;
    }).join('');
    // must-eat strip
    const me = (A.data.musteat.items || []).map((m) => `<a class="me-card" href="#/eat/${esc(m.key)}">
      ${A.img(m.imageUrl, m.name, 'me-img', '🍱')}<span>${esc(m.name)}</span></a>`).join('');
    const cards = ((cur || {}).restaurants || []).map(restoCard).join('');
    return `<section class="food">
      ${head('맛집', '하루 1끼는 대표 음식 제대로, 2끼는 간단히')}
      <div class="chips">${tabs}</div>
      <h2 class="sec">🍱 도쿄에서 꼭 먹어볼 음식</h2>
      <div class="me-strip">${me}</div>
      <h2 class="sec">${esc((cur || {}).area || '')} 추천</h2>
      <p class="muted small">※ 소형 식당은 영업·메뉴가 바뀔 수 있어요. 방문 전 지도에서 확인하고, 인기 맛집은 11시 전 도착·구글맵 웨이팅 확인. 🍱 배앓이 예방: 튀김+진한 라멘 연속은 피하고 하루 한 끼는 담백하게(소바·오야코동).</p>
      <div class="restos">${cards}</div>
    </section>`;
  };
  function restoCard(r) {
    const menu = (r.menu || []).map((m) => `<div class="mi">
      ${A.img(m.imageUrl, m.name, 'mi-img', '🍽')}
      <div class="mi-body"><div class="mi-n">${m.mustEat ? '<span class="must">⭐</span>' : ''}${esc(m.name)} ${m.nameJa ? `<small lang="ja">${esc(m.nameJa)}</small>` : ''}</div>
      <div class="mi-p">${A.fmtYen(m.priceYen)}</div></div></div>`).join('');
    const chips = [r.station && '🚉 ' + r.station, r.walk, r.pay && '💳 ' + r.pay].filter(Boolean)
      .map((x) => `<span class="rc-chip">${esc(x)}</span>`).join('');
    return `<article class="resto">
      <div class="resto-hero">${A.img(r.heroImageUrl, r.name, 'rh-img', r.tier === '대표' ? '🍱' : '🍜')}
        <span class="tier ${r.tier === '대표' ? 't-main' : ''}">${esc(r.tier)}</span></div>
      <div class="resto-body">
        <h3>${esc(r.name)} <small lang="ja">${esc(r.nameJa || '')}</small></h3>
        <div class="rc-food">${esc(r.food)} · <b>${A.fmtRange(r.priceRangeYen)}</b></div>
        ${r.why ? `<p class="rc-why">${esc(r.why)}</p>` : ''}
        <div class="rc-chips">${chips}</div>
        ${r.reserve ? `<div class="rc-line">📝 ${esc(r.reserve)}</div>` : ''}
        ${r.foreigner ? `<div class="rc-line">🗣 ${esc(r.foreigner)}</div>` : ''}
        ${r.caution ? `<div class="rc-line warn">⚠️ ${esc(r.caution)}</div>` : ''}
        ${menu ? `<div class="menu"><div class="menu-t">메뉴</div>${menu}</div>` : ''}
        <div class="row-btns">${telBtn(r.phone, '전화')}${mapBtn(r.gmapUrl || r.name, '지도')}</div>
      </div>
    </article>`;
  }

  // ====================================================== EAT (머스트잇 → 추천 식당)
  S.eat = function (key) {
    const m = ((A.data.musteat.items) || []).find((x) => x.key === key);
    if (!m) return `<section>${head('추천 식당')}<a class="btn-primary" href="#/food">맛집으로</a></section>`;
    const recos = (m.recos || []).map((r) => {
      const priceHtml = r.price ? `<div class="rc-food"><b>${A.fmtRange(r.price)}</b></div>` : '';
      const chips = [r.area, r.reserve].filter(Boolean).map((x) => `<span class="rc-chip">${esc(x)}</span>`).join('');
      return `<article class="reco">
        <h3>${esc(r.name)}</h3>
        ${priceHtml}
        ${r.why ? `<p class="rc-why">${esc(r.why)}</p>` : ''}
        <div class="rc-chips">${chips}</div>
        <div class="row-btns">${mapBtn(r.gmapUrl || r.name, '지도·길찾기')}</div>
      </article>`;
    }).join('');
    return `<section class="eatv">
      <a class="g-back" href="#/food">‹ 맛집으로</a>
      ${head(m.name, m.nameJa || '')}
      ${A.img(m.imageUrl, m.name, 'g-hero', '🍱')}
      ${m.note ? `<p class="g-intro">${esc(m.note)}</p>` : ''}
      <h2 class="sec">🍴 이 음식 잘하는 곳</h2>
      ${recos || '<p class="muted small">추천 식당을 준비 중이에요. 맛집 탭의 일자별 추천도 참고하세요.</p>'}
      <p class="muted small">※ 가격·영업은 변동될 수 있어요. 방문 전 지도에서 확인하세요.</p>
    </section>`;
  };

  // ====================================================== TIPS
  S.tips = function () {
    const t = A.data.tips;
    const manners = (t.manners || []).map((m) => `<div class="tip-card">${A.img(A.placeImg(m.img), m.title, 'tip-img', m.icon)}
      <div class="tip-b"><h3>${m.icon} ${esc(m.title)}</h3><p>${esc(m.body)}</p></div></div>`).join('');
    const tf = t.taxfree || {};
    const tax = `<div class="panel"><h3>${tf.icon || '🏷️'} ${esc(tf.title || '면세')}</h3><ul>${(tf.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>`;
    const fac = (t.facilities || []).map((f) => `<div class="line-card"><h3>${f.icon} ${esc(f.title)}</h3><p>${esc(f.body)}</p></div>`).join('');
    const ord = (t.ordering || []).map((o) => `<div class="line-card"><h3>${o.icon} ${esc(o.title)}</h3><p>${esc(o.step)}</p></div>`).join('');
    const kb = `<div class="panel"><h3>🏪 편의점 꿀팁</h3><ul>${(t.konbini || []).map((k) => `<li>${esc(k)}</li>`).join('')}</ul></div>`;
    return `<section class="tips">
      ${head('정보 · 꿀팁', '일본 매너 · 면세 · 편의시설 · 주문법')}
      <h2 class="sec">🙇 일본 여행 매너</h2><div class="tip-grid">${manners}</div>
      <h2 class="sec">🏷️ 면세 쇼핑</h2>${tax}
      <h2 class="sec">🚻 편의시설</h2>${fac}
      <h2 class="sec">🎟️ 주문하는 법</h2>${ord}
      ${kb}
    </section>`;
  };

  // ====================================================== SHOPPING
  S.shopping = function () {
    const sh = A.data.shopping;
    const guideExists = (gid) => !!((((A.data.guides || {}).guides) || {})[gid]);
    const wish = (sh.wishlist || []).map((w) => {
      const on = !!A.state.wish[w.id];
      const gl = (w.guide && guideExists(w.guide)) ? `<a class="wish-guide" href="#/guide/${w.guide}">무엇을 살까 — 추천 굿즈 ›</a>` : '';
      return `<div class="wish-card ${on ? 'on' : ''}">
        <button class="wish-main" data-action="wish" data-id="${w.id}">
          ${A.img(A.placeImg(w.img), w.store, 'wish-img', '🛍')}
          <div class="wish-b"><div class="wish-s">${esc(w.store)}</div><div class="wish-l">${esc(w.label)}</div></div>
          <span class="wcheck ${on ? 'on' : ''}">${on ? A.icon('check') : ''}</span></button>
        ${gl}</div>`;
    }).join('');
    const tips = (sh.giftTips || []).map((g) => `<li>${esc(g)}</li>`).join('');
    // 선물 추천 (대상별) — 지인 초콜릿 / 장인어른 무알코올 / 엄마·아빠 잡화·문구
    const giftPicksHtml = (sh.giftPicks || []).map((b) => `
      <h3 class="gp-h">${b.icon || '🎁'} ${esc(b.title)}</h3>
      <div class="gp-list">${(b.items || []).map((it) => `<div class="gp-card">
        <div class="gp-top"><span class="gp-name">${esc(it.nameKo)}</span><span class="gp-price">${A.fmtRange(it.price)}</span></div>
        ${it.nameJp ? `<div class="gp-jp" lang="ja">${esc(it.nameJp)}</div>` : ''}
        <a class="gp-where" href="${A.gmap(it.gmap || it.where)}" target="_blank" rel="noopener">📍 ${esc(it.where)} <span class="gp-map">🗺 지도</span></a>
        ${it.why ? `<div class="gp-why">${esc(it.why)}</div>` : ''}
      </div>`).join('')}</div>`).join('');
    const giftPickTips = (sh.giftPickTips || []).map((t) => `<li>${esc(t)}</li>`).join('');
    // expense tracker — 연결 시 가족 통합 가계부, 아니면 로컬
    const linked = A.linked && A.linked();
    const cur = A.state.expCur || 'krw';   // 입력 통화 (기본 원화)
    const list = A.expenseList();   // [{id,by,label,amountYen,ts}]
    const exps = list.slice().reverse().map((e) => `<div class="exp-row">
      <div class="exp-info"><span class="exp-label">${esc(e.label || '지출')}</span>${e.by ? `<span class="exp-by">${A.memberKo(e.by)}</span>` : ''}</div>
      <div class="exp-amt"><span class="exp-v">₩${A.krw(e.amountYen).toLocaleString('ko-KR')} <span class="exp-yen">¥${(e.amountYen || 0).toLocaleString('ko-KR')}</span></span><button class="exp-x" data-action="del-expense" data-id="${e.id}" aria-label="삭제">✕</button></div>
    </div>`).join('');
    const total = list.reduce((s, e) => s + (e.amountYen || 0), 0);
    // 예산은 한국 원화 기준(여행 총예산). 지출 합계(엔)는 원화로 환산해 진행률 계산.
    const totalKRW = A.krw(total);
    const budgetKRW = (sh.budgetKRW && sh.budgetKRW > 0) ? sh.budgetKRW : 5000000;
    const won = (n) => '₩' + Math.round(n).toLocaleString('ko-KR');
    const pct = Math.min(100, Math.round(totalKRW / budgetKRW * 100));
    const lvl = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
    const budgetCard = `<div class="budget-card">
      <div class="bc-top"><span class="bc-k">지출 합계</span><span class="bc-v">${won(totalKRW)} <span class="bc-yen">¥${total.toLocaleString('ko-KR')}</span></span></div>
      <div class="bc-bar ${lvl}"><span style="width:${pct}%"></span></div>
      <div class="bc-foot"><span>${pct}% 사용</span><span>여행 총예산 ${won(budgetKRW)}</span></div>
    </div>`;
    return `<section class="shopv">
      ${head('쇼핑 · 예산', (sh.budget && sh.budget.free) || '')}
      ${budgetCard}
      ${sh.budgetNote ? `<p class="muted small">${esc(sh.budgetNote)}</p>` : ''}
      ${(sh.storeBudget || []).length ? `<div class="store-budget">${sh.storeBudget.map((b) => `<div class="sb-row"><span>${esc(b.store)}</span><span class="sb-cap">${esc(b.cap)}</span></div>`).join('')}</div>` : ''}
      <h2 class="sec">지출 메모${linked ? ' <span class="fam-on">👨‍👩‍👧 가족 통합</span>' : ''}</h2>
      <form class="exp-form" data-action="add-expense">
        <div class="exp-cur">
          <button type="button" class="cur-seg ${cur === 'krw' ? 'on' : ''}" data-action="exp-cur" data-val="krw">₩ 원화</button>
          <button type="button" class="cur-seg ${cur === 'jpy' ? 'on' : ''}" data-action="exp-cur" data-val="jpy">¥ 엔화</button>
        </div>
        <div class="exp-row-in">
          <input name="label" placeholder="항목" aria-label="항목">
          <input name="amt" type="number" inputmode="numeric" placeholder="${cur === 'krw' ? '₩ 금액' : '¥ 금액'}" aria-label="금액">
          <button type="submit" aria-label="추가">＋</button>
        </div>
      </form>
      <div class="exps">${exps || '<div class="empty"><div class="e-ic">' + A.icon('bag') + '</div><strong>아직 기록이 없어요</strong><p>위에서 지출을 추가하면 예산이 채워져요.</p></div>'}</div>
      <h2 class="sec">사고 싶은 것 (은재)</h2>
      <div class="wishlist">${wish}</div>
      <h2 class="sec">친구 선물 팁</h2><ul class="bullets">${tips}</ul>
      ${(sh.giftPicks || []).length ? `<h2 class="sec">🎁 선물 추천 (대상별)</h2><p class="muted small">동선·가격(원화 환산)·구매처를 함께 정리했어요. 가격은 대략치입니다.</p>${giftPicksHtml}${giftPickTips ? `<ul class="bullets gp-tips">${giftPickTips}</ul>` : ''}` : ''}
    </section>`;
  };

  // ====================================================== PHOTO
  S.photo = function () {
    const items = (A.data.photospots.items || []).map((p) => `<div class="photo-card">
      <button class="pc-imgbtn" data-action="lightbox" data-src="${esc(p.imageUrl || '')}" data-alt="${esc(p.name)}">${A.img(p.imageUrl, p.name, 'photo-img', '📸')}</button>
      <div class="pc-b"><strong>${esc(p.name)}</strong> <small>${esc(p.area || '')}</small><p>${esc(p.note || '')}</p>
      <div class="row-btns">${mapBtn(p.gmapUrl || p.name)}</div></div></div>`).join('');
    return `<section class="photov">${head('포토스팟', '사진 찍기 좋은 곳')}<div class="photo-grid">${items}</div></section>`;
  };

  // ====================================================== MEDICAL
  S.medical = function () {
    const m = A.data.medical;
    const hos = (m.hospitals || []).map((h) => `<div class="med-card">
      <h3>${esc(h.name)} ${h.korean ? '<span class="tagk">한국어</span>' : ''}${h.english ? '<span class="tage">영어</span>' : ''}</h3>
      <div class="med-ja" lang="ja">${esc(h.nameJa || '')}</div>
      <p class="med-addr">📍 ${esc(h.addr || '')}</p>
      <p>${esc(h.note || '')}</p>
      <div class="row-btns">${telBtn(h.tel, '전화')}${mapBtn(h.gmapUrl || h.name, '지도')}</div></div>`).join('');
    const dr = (m.drugstores || []).map((d) => `<div class="line-card"><h3>💊 ${esc(d.name)}</h3><p>${esc(d.note)}</p></div>`).join('');
    const meds = (m.meds || []).map((x) => `<div class="med-row">
      <div class="med-row-b"><strong>${esc(x.ko)}</strong> <span lang="ja">${esc(x.ja)}</span> <small>${esc(x.pron)}</small><p>${esc(x.use)}</p></div>
      <button class="show-btn" data-action="show-text" data-jp="${esc(x.ja)}" data-pron="${esc(x.pron)}" data-ko="${esc(x.ko)}" aria-label="${esc(x.ko)} 일본어로 보여주기">📢</button></div>`).join('');
    return `<section class="medv">
      ${head('병원 · 약국', '아플 때 — 출발 전 한 번 더 확인하세요')}
      <h2 class="sec">🏥 외국어 가능 병원</h2>${hos}
      <h2 class="sec">💊 약국(드럭스토어)</h2>${dr}
      <h2 class="sec">🗣 약 이름 보여주기</h2><div class="meds">${meds}</div>
    </section>`;
  };

  // ====================================================== EXCHANGE
  S.exchange = function () {
    const ex = A.data.exchange;
    const rate = A.rate();
    const tips = (ex.tips || []).map((t) => `<li>${esc(t)}</li>`).join('');
    return `<section class="exv">
      ${head('환율 · 돈', ex.note || '')}
      <div class="fx-rate">
        <label>100엔 = <input id="rate" type="number" inputmode="decimal" value="${rate}" data-action="set-rate"> 원</label>
        <button class="wlive" data-action="refresh-rate" aria-label="환율 새로고침">${A.rateUpdatedLabel ? (A.rateUpdatedLabel() || '🔄 실시간 환율 새로고침') : '🔄 실시간 환율 새로고침'}</button>
      </div>
      <div class="calc">
        <div class="calc-row"><span>¥</span><input id="cjpy" type="number" inputmode="numeric" placeholder="엔" data-action="calc-jpy"></div>
        <div class="calc-eq">=</div>
        <div class="calc-row"><span>₩</span><input id="ckrw" type="number" inputmode="numeric" placeholder="원" data-action="calc-krw"></div>
      </div>
      <div class="quick">${[500, 1000, 3000, 10000].map((v) => `<button class="qchip" data-action="calc-quick" data-v="${v}">¥${v.toLocaleString()}</button>`).join('')}</div>
      <h2 class="sec">💡 돈 관리 팁</h2><ul class="bullets">${tips}</ul>
    </section>`;
  };

  // ====================================================== CHECK
  S.check = function () {
    const linked = A.linked && A.linked();
    const groups = (A.data.checklist.groups || []).map((g) => {
      const done = g.items.filter((i) => A.checkOn(i.id)).length;
      const total = g.items.length;
      const pct = total ? Math.round(done / total * 100) : 0;
      const allDone = done === total && total > 0;
      const items = g.items.map((i) => {
        const on = A.checkOn(i.id);
        const by = linked ? A.checkBy(i.id) : '';
        const byChip = (on && by) ? `<span class="chk-by">${A.memberKo(by)}</span>` : '';
        return `<button class="chk ${on ? 'on' : ''}" data-action="check" data-id="${i.id}">
          <span class="chk-box">${on ? A.icon('check') : ''}</span>
          <span class="chk-t">${esc(i.text)}</span>
          ${byChip}
          ${i.owner ? `<span class="chk-o">${esc(i.owner)}</span>` : ''}</button>`;
      }).join('');
      return `<details class="cgroup" ${done < total ? 'open' : ''}>
        <summary>
          <span class="cg-ring ${allDone ? 'done' : ''}" style="--p:${pct}"><span class="cg-num">${allDone ? A.icon('check') : done}</span></span>
          <span class="cg-label">${esc(g.label)}</span>
          <span class="cg-prog">${done}/${total}</span>
          <span class="cg-ch">${A.icon('next')}</span>
        </summary>
        <div class="cgroup-body">${items}</div></details>`;
    }).join('');
    // 담당자별 진행 요약 (연결 시): owner('아빠/엄마/은재/가족')별 완료/전체
    let perOwner = '';
    if (linked) {
      const tally = ['아빠', '엄마', '은재', '가족'].map((ow) => {
        const items = [];
        (A.data.checklist.groups || []).forEach((g) => g.items.forEach((i) => { if (i.owner === ow) items.push(i); }));
        if (!items.length) return '';
        const d = items.filter((i) => A.checkOn(i.id)).length;
        return `<span class="own-chip ${d === items.length ? 'done' : ''}"><b>${esc(ow)}</b> ${d}/${items.length}</span>`;
      }).filter(Boolean).join('');
      perOwner = `<div class="own-tally">${tally}</div>`;
    }
    const sub = linked ? `${A.memberKo(A.state.member)}로 가족과 공유 중` : '출발 전 · 매일 · 귀국일';
    return `<section class="checkv">${head('체크리스트', sub)}${perOwner}${groups}</section>`;
  };

  // ====================================================== INFO
  S.info = function () {
    const inf = A.data.info; const h = inf.hotel || {};
    const flights = (inf.flights || []).map((f) => `<div class="flight"><div class="fl-dir">${esc(f.dir)} · ${esc(f.no)}</div>
      <div class="fl-main"><b>${esc(f.dep)}</b> ${esc(f.from)} → <b>${esc(f.arr)}</b> ${esc(f.to)}</div>
      <div class="fl-sub">${esc(f.date)} · ${esc(f.note || '')}</div></div>`).join('');
    const resv = (inf.reservations || []).map((r) => `<div class="line-card"><h3>${r.icon} ${esc(r.name)}</h3><p>${esc(r.note)}${r.fareYen ? ' · ' + A.fmtYen(r.fareYen) : ''}</p></div>`).join('');
    const roles = (inf.roles || []).map((r) => `<div class="role"><h3>${r.icon} ${esc(r.who)}</h3><ul>${r.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
    const arr = (inf.arrival || []).map((a) => `<li><b>${a.n}.</b> ${esc(a.label)} <span>${esc(a.desc)}</span></li>`).join('');
    const five = (inf.firstFive || []).map((x) => `<li>${esc(x)}</li>`).join('');
    return `<section class="infov">
      ${head('예약 · 정보')}
      <a class="doc-link" href="#/docs">🗂 실제 캡처(여권·항공권·호텔·보험·QR)는 <b>서류함</b>에서 불러와 보관하세요 →</a>
      <div class="hotel-card">${A.img(A.placeImg('hotel'), h.name, 'hc-img', '🏨')}
        <div class="hc-b"><h3>🏨 ${esc(h.name)}</h3><div lang="ja" class="hc-ja">${esc(h.nameJa || '')}</div>
        <p>${esc(h.addrEn || '')}</p><p>체크인 ${esc(h.checkin)} · 체크아웃 ${esc(h.checkout)}</p>
        <p class="muted">${esc(h.room || '')} · ${esc(h.confirmMasked || '')}</p>
        <div class="row-btns">${telBtn(h.tel, '호텔 전화')}${mapBtn(h.gmap || h.name, '지도')}${showBtn(h.nameJa || '', '', '우리 호텔')}</div></div></div>
      <h2 class="sec">✈️ 항공편</h2>${flights}
      <h2 class="sec">🎫 예약</h2>${resv}
      <h2 class="sec">⭐ 제일 먼저 할 일</h2><ol class="bullets">${five}</ol>
      <h2 class="sec">🛬 나리타 도착 순서</h2><ol class="arrival">${arr}</ol>
      <h2 class="sec">👨‍👩‍👧 가족 역할</h2><div class="roles">${roles}</div>
    </section>`;
  };

  // ====================================================== SETTINGS
  // 가족 공유 카드 (설정·연결 화면 공용)
  const memSeg = (cur, m) => `<button class="seg ${cur === m ? 'on' : ''}" data-action="pick-member" data-val="${m}">${A.MEMBERS[m].emoji} ${A.MEMBERS[m].ko}</button>`;
  const fcInput = (val) => `<input class="fc-input" id="fc-input" type="text" inputmode="latin" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="가족 코드 (12자 이상)" value="${esc(val || '')}">`;
  function familyBlock(st) {
    if (st.familyCode && st.member) {
      const tail = String(st.familyCode).slice(-4);
      const avail = A.sync && A.sync.available();
      return `<div class="fam-card">
        <p class="fam-stat">✅ <b>${A.memberKo(st.member)}</b>로 연결됨 · 코드 …${esc(tail)}${avail ? '' : ' <span class="muted small">(오프라인/미로드 — 온라인 시 동기화)</span>'}</p>
        <p class="muted small">체크리스트 체크와 지출이 가족 모두의 앱에 실시간으로 함께 보여요. 여권·캡처 등 <b>서류함 사진은 공유되지 않고</b> 이 기기에만 저장돼요.</p>
        <button class="btn-primary wide" data-action="copy-invite">🔗 가족 초대 링크 복사</button>
        <button class="btn-block" data-action="unlink-family">가족 공유 해제</button>
      </div>`;
    }
    return `<div class="fam-card">
      <p class="muted">아빠·엄마·은재가 같은 <b>가족 코드</b>로 연결하면, 체크리스트와 지출이 모두의 앱에 실시간으로 함께 보여요.</p>
      <div class="fam-step"><span class="fam-n">1</span> 나는 누구?</div>
      <div class="segs">${memSeg(st.member, 'dad')}${memSeg(st.member, 'mom')}${memSeg(st.member, 'eunjae')}</div>
      <div class="fam-step"><span class="fam-n">2</span> 가족 코드</div>
      ${fcInput('')}
      <div class="segs"><button class="seg" data-action="make-code">🎲 새 코드 만들기</button></div>
      <p class="muted small">처음 시작하는 사람이 "새 코드 만들기"로 코드를 만들어 연결한 뒤, "가족 초대 링크 복사"로 카톡에 공유하세요. 링크를 받은 사람은 열기만 하면 코드가 자동 입력돼요.</p>
      <button class="btn-primary wide" data-action="link-family">가족과 연결</button>
    </div>`;
  }

  S.join = function (q) {
    const code = (q && q.get && q.get('fc')) || '';
    const cur = A.state.member;
    return `<section class="joinv">
      ${head('가족 공유 연결', '같은 코드로 연결하면 체크리스트·지출이 함께 보여요')}
      <div class="fam-card">
        <div class="fam-step"><span class="fam-n">1</span> 나는 누구?</div>
        <div class="segs">${memSeg(cur, 'dad')}${memSeg(cur, 'mom')}${memSeg(cur, 'eunjae')}</div>
        <div class="fam-step"><span class="fam-n">2</span> 가족 코드</div>
        ${fcInput(code)}
        <div class="segs"><button class="seg" data-action="make-code">🎲 새 코드 만들기</button></div>
        <button class="btn-primary wide" data-action="link-family">가족과 연결</button>
        <p class="muted small">받은 초대 링크를 열면 코드가 자동 입력돼요. 처음 시작하는 사람은 "새 코드 만들기"로 만들어 연결한 뒤 가족에게 링크를 공유하세요.</p>
      </div>
    </section>`;
  };

  S.settings = function () {
    const st = A.state;
    const opt = (cur, val, lbl, act) => `<button class="seg ${cur === val ? 'on' : ''}" data-action="${act}" data-val="${val}">${lbl}</button>`;
    return `<section class="setv">
      ${head('설정')}
      <h2 class="sec">👨‍👩‍👧 가족 공유</h2>
      ${familyBlock(st)}
      <h2 class="sec">📥 오프라인</h2>
      <p class="muted">출발 전 와이파이에서 한 번 눌러 사진까지 모두 저장하면, 인터넷 없이도 전부 열려요.</p>
      <button class="btn-primary wide" data-action="prefetch">📥 오프라인 전체 저장</button>
      <div id="pf-status" class="muted small"></div>
      <h2 class="sec">🔄 업데이트</h2>
      <p class="muted">앱이 옛 화면을 보이거나 변경이 안 보이면 누르세요. 최신 버전을 받아 새로고침합니다.</p>
      <button class="btn-block" data-action="force-update">🔄 최신 버전으로 업데이트</button>
      <h2 class="sec">🎨 테마</h2>
      <div class="segs">${opt(st.theme, 'auto', '자동', 'theme')}${opt(st.theme, 'light', '밝게', 'theme')}${opt(st.theme, 'dark', '어둡게', 'theme')}</div>
      <h2 class="sec">🔤 글자 크기</h2>
      <div class="segs">${opt(st.font, 1, '보통', 'font')}${opt(st.font, 1.1, '크게', 'font')}${opt(st.font, 1.22, '더 크게', 'font')}</div>
      <h2 class="sec">🔊 일본어 음성</h2>
      <p class="muted small">회화·주소·역 이름 등 일본어 '보여주기' 화면에서 🔊 듣기를 누르면 이 목소리로 읽어줘요. 기기에 일본어 음성이 하나뿐이면 음높이로 남/여를 구분합니다.</p>
      <div class="segs">${opt(st.voice, 'female', '👩 여자', 'voice')}${opt(st.voice, 'male', '👨 남자', 'voice')}</div>
      <h2 class="sec">🗣 말하기 속도</h2>
      <p class="muted small">🔊 듣기 음성의 속도. 고르면 바로 미리 들려줘요.</p>
      <div class="segs">${opt(st.ttsRate, 0.8, '느리게', 'tts-rate')}${opt(st.ttsRate, 1, '보통', 'tts-rate')}${opt(st.ttsRate, 1.2, '빠르게', 'tts-rate')}${opt(st.ttsRate, 1.4, '더 빠르게', 'tts-rate')}</div>
      <h2 class="sec">ℹ️ 정보</h2>
      <p class="muted small">2026 도쿄 가족여행 가이드 · 오프라인 PWA. 홈 화면에 추가하면 앱처럼 쓸 수 있어요 (아이폰: 공유 → 홈 화면에 추가).</p>
    </section>`;
  };

  // ====================================================== SEARCH (전역 검색)
  S.search = function () {
    const eg = ['스카이라이너', '환전', '화장실', '가챠', '라멘'];
    return `<section class="searchv">
      ${head('검색', '회화·맛집·교통·꿀팁·일정 무엇이든')}
      <input class="search" id="gsearch" type="search" placeholder="예: 스카이라이너, 환전, 화장실, 가챠, 라멘" data-action="global-search" autocomplete="off">
      <div class="search-eg">${eg.map((w) => `<button class="qchip" data-action="search-eg" data-q="${w}">${w}</button>`).join('')}</div>
      <div id="gresults" class="gresults"></div>
    </section>`;
  };

  // ====================================================== GUIDE (스폿 상세 가이드)
  S.guide = function (id) {
    const g = (((A.data.guides || {}).guides) || {})[id];
    if (!g) return `<section>${head('상세 가이드', '내용을 찾을 수 없어요')}<a class="btn-primary" href="#/">홈으로</a></section>`;
    let backDay = '';
    (A.data.itinerary.days || []).forEach((d) => (d.stops || []).forEach((s) => { if (s.guide === id) backDay = d.id; }));
    const sec = (s, i) => {
      const steps = (s.steps || []).length ? `<ol class="g-steps">${s.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : '';
      const tips = (s.tips || []).length ? `<ul class="g-tips">${s.tips.map((x) => `<li>💡 ${esc(x)}</li>`).join('')}</ul>` : '';
      const cau = (s.cautions || []).length ? `<ul class="g-caution">${s.cautions.map((x) => `<li>⚠️ ${esc(x)}</li>`).join('')}</ul>` : '';
      const ph = (s.phraseIds || []).map((pid) => { const p = A.phraseIndex[pid]; return p ? `<button class="mini-show" data-action="show" data-id="${pid}">📢 ${esc(p.ko)}</button>` : ''; }).join('');
      return `<details class="g-sec" id="g-sec-${i}"${i === 0 ? ' open' : ''}>
        <summary><span class="g-sec-t">${s.icon ? s.icon + ' ' : ''}${esc(s.heading)}</span><span class="g-sec-ch">${A.icon('next')}</span></summary>
        <div class="g-sec-body">${steps}${tips}${cau}${ph ? `<div class="row-btns">${ph}</div>` : ''}</div>
      </details>`;
    };
    const heroSrc = g.heroImg || (g.hero ? A.placeImg(g.hero) : '');
    const gallery = (g.gallery || []).length ? `<div class="g-gallery">${g.gallery.map((im) =>
      `<button class="g-gimg" data-action="lightbox" data-src="${esc(im.src)}" data-alt="${esc(im.caption || '')}">${A.img(im.src, im.caption, 'g-gimg-i', '🛍')}${im.caption ? `<span>${esc(im.caption)}</span>` : ''}</button>`).join('')}</div>` : '';
    const secs = g.sections || [];
    const toc = secs.length >= 3 ? `<nav class="g-toc" aria-label="섹션 바로가기">${secs.map((s, i) =>
      `<button class="g-toc-chip" data-action="guide-jump" data-target="${i}">${s.icon ? s.icon + ' ' : ''}${esc((s.heading || '').replace(/^\d+\.\s*/, ''))}</button>`).join('')}</nav>` : '';
    return `<section class="guidev">
      ${backDay ? `<a class="g-back" href="#/day/${backDay}">‹ 일정으로</a>` : ''}
      ${head(g.title, g.subtitle)}
      ${heroSrc ? A.img(heroSrc, g.title, 'g-hero', '📖') : ''}
      ${g.intro ? `<p class="g-intro">${esc(g.intro)}</p>` : ''}
      ${gallery}
      ${toc}
      ${secs.map(sec).join('')}
      ${g.updated ? `<p class="muted small">📅 ${esc(g.updated)} · 변동 가능하니 방문 전 한 번 더 확인</p>` : ''}
      ${backDay ? `<a class="btn-block" href="#/day/${backDay}">일정으로 돌아가기</a>` : ''}
    </section>`;
  };

  // ====================================================== DOCS (서류함)
  S.docs = function () {
    const d = A.data.docs || { groups: [] };
    const extras = A.state.docExtra || [];
    const slotCard = (s, icon) => `<div class="doc-slot">
      <div class="doc-label">${icon || '📄'} ${esc(s.label)}</div>
      <div class="doc-body" id="docbody-${esc(s.id)}">
        <button class="doc-pick" data-action="doc-pick" data-slot="${esc(s.id)}">＋ 불러오기</button>
      </div></div>`;
    const groups = (d.groups || []).map((g) =>
      `<h2 class="sec">${g.icon} ${esc(g.label)}</h2><div class="doc-grid">${(g.slots || []).map((s) => slotCard(s, g.icon)).join('')}</div>`).join('');
    const extraCards = extras.length ? `<h2 class="sec">📎 추가 캡처</h2><div class="doc-grid">${extras.map((s) => slotCard(s, '📎')).join('')}</div>` : '';
    return `<section class="docsv">
      ${head('서류함', '여권·예약·보험·QR 캡처를 폰에서 불러와 보관')}
      <div class="doc-note">🔒 불러온 캡처는 <b>이 기기에만</b> 저장돼요. 인터넷에 올라가지 않습니다. 한 번 불러오면 다음부터 바로 보여요. <span class="muted">(홈 화면에 추가하면 더 안전)</span></div>
      ${groups}
      ${extraCards}
      <button class="btn-block" data-action="doc-add">➕ 사진 추가</button>
      <input type="file" accept="image/*" id="doc-file" hidden>
    </section>`;
  };

})(window.App);
