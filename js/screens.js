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
  const wBadge = (w) => w ? `<span class="wbadge">${w.icon} ${w.summary} · 비 ${w.rainPct}% · ${w.tempMin}~${w.tempMax}°</span>` : '';
  const showBtn = (jp, pron, ko, level) =>
    `<button class="show-btn" data-action="show-text" data-jp="${esc(jp)}" data-pron="${esc(pron || '')}" data-ko="${esc(ko || '')}" data-level="${level || ''}">📢 보여주기</button>`;
  const telBtn = (tel, label) => tel ? `<a class="tel-btn" href="${A.telHref(tel)}">📞 ${esc(label || '전화')}</a>` : '';
  const mapBtn = (q, label) => q ? `<a class="map-btn" href="${A.gmap(q)}" target="_blank" rel="noopener">🗺 ${esc(label || '지도')}</a>` : '';

  // ====================================================== HOME
  S.home = function () {
    const t = A.tripDay();
    const trip = A.data.itinerary.trip || {};
    let hero = '';
    if (t.phase === 'before') {
      hero = `<div class="today-card before">
        <div class="dday">D-${t.dleft}</div>
        <div class="tc-body"><strong>출발까지 ${t.dleft}일</strong>
        <p>준비물 체크리스트부터 확인해요.</p>
        <a class="btn-primary" href="#/check">✅ 출발 전 체크리스트</a></div></div>`;
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
    // budget widget
    const total = (A.state.expenses || []).reduce((s, e) => s + (e.amountYen || 0), 0);
    const budget = `<a class="widget" href="#/shopping"><span class="w-ic">💴</span><span class="w-k">지출 합계</span>
      <span class="w-v">${total ? A.fmtYen(total) : '<span class="muted">기록 없음</span>'}</span></a>`;
    // clothing widget
    const w = weatherOf((t.day || {}).id) || (A.data.weather.days || [])[0];
    const cloth = w ? `<a class="widget" href="#/day/${(t.day||{}).id||'d1'}"><span class="w-ic">${w.icon}</span>
      <span class="w-k">오늘 옷차림</span><span class="w-v small">${(w.clothing||[]).map(esc).join(' · ')}</span></a>` : '';

    const big = [
      ['#/talk', '💬', '회화', 'big primary'],
      ['#/sos', '🆘', '긴급', 'big danger'],
      ['#/subway', '🗺', '노선도', 'big'],
      ['#/food', '🍜', '맛집', 'big'],
    ];
    const small = [
      ['#/day/' + ((t.day || {}).id || 'd1'), '📅', '일정'],
      ['#/shopping', '🛍', '쇼핑'],
      ['#/tips', '💡', '정보·꿀팁'],
      ['#/photo', '📸', '포토'],
      ['#/exchange', '💱', '환율'],
      ['#/medical', '🏥', '병원·약국'],
      ['#/check', '✅', '체크'],
      ['#/info', '📋', '예약·정보'],
    ];
    return `<section class="home">
      <header class="home-top"><div><h1>${esc(trip.title || '도쿄 여행')}</h1>
      <p>${esc(trip.subtitle || '')}</p></div></header>
      ${hero}
      <div class="widgets">${budget}${cloth}</div>
      <div class="grid-big">${big.map(([h, i, l, c]) => `<a class="card-act ${c}" href="${h}"><span class="ca-ic">${i}</span><span>${l}</span></a>`).join('')}</div>
      <h2 class="sec">더 보기</h2>
      <div class="grid-small">${small.map(([h, i, l]) => `<a class="card-act sm" href="${h}"><span class="ca-ic">${i}</span><span>${l}</span></a>`).join('')}</div>
      <p class="foot-note">📥 출발 전 와이파이에서 <a href="#/settings">오프라인 전체 저장</a>을 한 번 실행하면 인터넷 없이도 모두 열려요.</p>
    </section>`;
  };

  // ====================================================== DAY
  S.day = function (id) {
    const days = A.data.itinerary.days || [];
    const d = days.find((x) => x.id === id) || days[0];
    if (!d) return head('일정');
    const w = weatherOf(d.id);
    const chips = days.map((x) => `<a class="chip ${x.id === d.id ? 'on' : ''}" href="#/day/${x.id}">${x.n}일 ${x.dow}</a>`).join('');
    const stops = (d.stops || []).map((s) => {
      const tips = (s.tips || []).length ? `<ul class="tips">${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
      return `<div class="stop">
        <div class="stop-time">${esc(s.time || '')}</div>
        <div class="stop-card">
          ${A.img(A.placeImg(s.img), s.name, 'stop-img')}
          <div class="stop-body">
            <h3>${esc(s.name)} ${s.nameJa ? `<small>${esc(s.nameJa)}</small>` : ''}</h3>
            ${s.station ? `<div class="stn">🚉 ${esc(s.station)}</div>` : ''}
            ${s.desc ? `<p>${esc(s.desc)}</p>` : ''}
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
      ${w ? `<div class="weather-band">${w.icon} <strong>${esc(w.summary)} · 비 ${w.rainPct}% · ${w.tempMin}~${w.tempMax}°</strong><br><span>${esc(w.advice)}</span></div>` : ''}
      ${d.moveNote ? `<p class="movenote">🧭 ${esc(d.moveNote)}</p>` : ''}
      <div class="timeline">${stops}</div>
      <a class="btn-block" href="#/food?d=${d.id}">🍜 이 날 맛집·식사 보기</a>
    </section>`;
  };

  // ====================================================== TALK
  S.talk = function () {
    const cats = A.data.phrases.categories || [];
    const chipFav = `<button class="tchip on" data-action="talk-cat" data-cat="fav">⭐ 즐겨찾기</button>`;
    const chipAll = `<button class="tchip" data-action="talk-cat" data-cat="all">전체</button>`;
    const chips = cats.map((c) => `<button class="tchip" data-action="talk-cat" data-cat="${c.id}">${c.icon} ${esc(c.label)}</button>`).join('');
    const rows = (A.data.phrases.phrases || []).map((p) => {
      const on = A.state.fav.includes(p.id);
      return `<div class="prow lvl-${p.level || 'n'}" data-cat="${p.cat}" data-ko="${esc(p.ko)}" data-id="${p.id}">
        <button class="prow-main" data-action="show" data-id="${p.id}">
          <div class="p-ko">${esc(p.ko)}</div>
          <div class="p-jp" lang="ja">${esc(p.jp)}</div>
          <div class="p-pron">${esc(p.pron)}</div>
        </button>
        <button class="fav ${on ? 'on' : ''}" data-action="fav" data-id="${p.id}" aria-label="즐겨찾기">${on ? '★' : '☆'}</button>
      </div>`;
    }).join('');
    const usage = (A.data.phrases.usage || []).map((u) => `<li>${esc(u)}</li>`).join('');
    return `<section class="talk">
      ${head('회화', '문장을 탭하면 크게 — 점원에게 보여주세요')}
      <details class="usage"><summary>💡 사용 요령</summary><ul>${usage}</ul></details>
      <input class="search" type="search" placeholder="한국어로 검색 (예: 카드, 화장실)" data-action="talk-search" aria-label="회화 검색">
      <div class="tchips">${chipFav}${chipAll}${chips}</div>
      <div class="plist" id="plist">${rows}</div>
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
      <div class="r-path"><strong>${esc(r.from)}</strong> → <strong>${esc(r.to)}</strong></div>
      <div class="r-meta">${esc(r.line)} · ${r.min}분 · ${A.fmtYen(r.fareYen)}</div>
      ${r.note ? `<div class="r-note">${esc(r.note)}</div>` : ''}</div>`).join('');
    const stns = (t.stations || []).map((s) =>
      `<button class="stn-chip" data-action="show-text" data-jp="${esc(s.ja)}" data-pron="${esc(s.roma)}" data-ko="${esc(s.ko)}역">${esc(s.ko)} <small lang="ja">${esc(s.ja)}</small></button>`).join('');
    const how = (t.howto || []).map((h) => `<div class="howto"><h3>${h.icon} ${esc(h.title)}</h3><p>${esc(h.body)}</p></div>`).join('');
    const map = t.map || {};
    return `<section class="subway">
      ${head('교통 · 지하철', t.hub ? '거점 ' + t.hub : '')}
      <p class="summary">${esc(t.summary || '')}</p>
      <button class="map-thumb" data-action="lightbox" data-src="${esc(map.webp || map.png || '')}" data-alt="${esc(map.alt || '노선도')}">
        ${A.img(map.webp || map.png, map.alt, 'mapimg', '🗺')}<span class="zoom-hint">🔍 탭하면 크게 (핀치 줌)</span></button>
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
      </div>
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
    const me = (A.data.musteat.items || []).map((m) => `<button class="me-card" data-action="lightbox" data-src="${esc(m.imageUrl || '')}" data-alt="${esc(m.name)}">
      ${A.img(m.imageUrl, m.name, 'me-img', '🍱')}<span>${esc(m.name)}</span></button>`).join('');
    const cards = ((cur || {}).restaurants || []).map(restoCard).join('');
    return `<section class="food">
      ${head('맛집', '하루 1끼는 대표 음식 제대로, 2끼는 간단히')}
      <div class="chips">${tabs}</div>
      <h2 class="sec">🍱 도쿄에서 꼭 먹어볼 음식</h2>
      <div class="me-strip">${me}</div>
      <h2 class="sec">${esc((cur || {}).area || '')} 추천</h2>
      <p class="muted small">※ 소형 식당은 영업·메뉴가 바뀔 수 있어요. 방문 전 지도에서 한 번 더 확인하세요.</p>
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
    const wish = (sh.wishlist || []).map((w) => {
      const on = !!A.state.wish[w.id];
      return `<button class="wish ${on ? 'on' : ''}" data-action="wish" data-id="${w.id}">
        ${A.img(A.placeImg(w.img), w.store, 'wish-img', '🛍')}
        <div class="wish-b"><div class="wish-s">${esc(w.store)}</div><div class="wish-l">${esc(w.label)}</div></div>
        <span class="wcheck">${on ? '✅' : '⬜'}</span></button>`;
    }).join('');
    const tips = (sh.giftTips || []).map((g) => `<li>${esc(g)}</li>`).join('');
    // expense tracker
    const exps = (A.state.expenses || []).slice().reverse().map((e) => `<div class="exp-row"><span>${esc(e.label || '지출')}</span>
      <span class="exp-v">${A.fmtYen(e.amountYen)}</span><button class="exp-x" data-action="del-expense" data-id="${e.id}" aria-label="삭제">✕</button></div>`).join('');
    const total = (A.state.expenses || []).reduce((s, e) => s + (e.amountYen || 0), 0);
    return `<section class="shopv">
      ${head('쇼핑 · 예산', (sh.budget && sh.budget.free) || '')}
      <div class="budget-note">${sh.budget ? `🎯 ${esc(sh.budget.free)} · ${esc(sh.budget.gacha)}` : ''}</div>
      <h2 class="sec">🧾 지출 메모</h2>
      <form class="exp-form" data-action="add-expense">
        <input name="label" placeholder="항목 (예: 가챠)" aria-label="항목">
        <input name="yen" type="number" inputmode="numeric" placeholder="¥ 금액" aria-label="금액">
        <button type="submit">＋</button>
      </form>
      <div class="exp-total">합계 ${A.fmtYen(total)}</div>
      <div class="exps">${exps || '<p class="muted small">아직 기록이 없어요.</p>'}</div>
      <h2 class="sec">⭐ 사고 싶은 것 (은재)</h2>
      <div class="wishlist">${wish}</div>
      <h2 class="sec">🎁 친구 선물 팁</h2><ul class="bullets">${tips}</ul>
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
      <button class="show-btn" data-action="show-text" data-jp="${esc(x.ja)}" data-pron="${esc(x.pron)}" data-ko="${esc(x.ko)}">📢</button></div>`).join('');
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
    const groups = (A.data.checklist.groups || []).map((g) => {
      const done = g.items.filter((i) => A.state.check[i.id]).length;
      const items = g.items.map((i) => {
        const on = !!A.state.check[i.id];
        return `<button class="chk ${on ? 'on' : ''}" data-action="check" data-id="${i.id}">
          <span class="chk-box">${on ? '✓' : ''}</span>
          <span class="chk-t">${esc(i.text)}</span>
          ${i.owner ? `<span class="chk-o">${esc(i.owner)}</span>` : ''}</button>`;
      }).join('');
      return `<details class="cgroup" ${done < g.items.length ? 'open' : ''}>
        <summary>${g.icon} ${esc(g.label)} <span class="cg-prog">${done}/${g.items.length}</span></summary>
        ${items}</details>`;
    }).join('');
    return `<section class="checkv">${head('체크리스트', '출발 전 · 매일 · 귀국일')}${groups}</section>`;
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
  S.settings = function () {
    const st = A.state;
    const opt = (cur, val, lbl, act) => `<button class="seg ${cur === val ? 'on' : ''}" data-action="${act}" data-val="${val}">${lbl}</button>`;
    return `<section class="setv">
      ${head('설정')}
      <h2 class="sec">📥 오프라인</h2>
      <p class="muted">출발 전 와이파이에서 한 번 눌러 사진까지 모두 저장하면, 인터넷 없이도 전부 열려요.</p>
      <button class="btn-primary wide" data-action="prefetch">📥 오프라인 전체 저장</button>
      <div id="pf-status" class="muted small"></div>
      <h2 class="sec">🎨 테마</h2>
      <div class="segs">${opt(st.theme, 'auto', '자동', 'theme')}${opt(st.theme, 'light', '밝게', 'theme')}${opt(st.theme, 'dark', '어둡게', 'theme')}</div>
      <h2 class="sec">🔤 글자 크기</h2>
      <div class="segs">${opt(st.font, 1, '보통', 'font')}${opt(st.font, 1.1, '크게', 'font')}${opt(st.font, 1.22, '더 크게', 'font')}</div>
      <h2 class="sec">🔊 일본어 음성</h2>
      <p class="muted small">회화·주소·역 이름 등 일본어 '보여주기' 화면에서 🔊 듣기를 누르면 이 목소리로 읽어줘요. 기기에 일본어 음성이 하나뿐이면 음높이로 남/여를 구분합니다.</p>
      <div class="segs">${opt(st.voice, 'female', '👩 여자', 'voice')}${opt(st.voice, 'male', '👨 남자', 'voice')}</div>
      <h2 class="sec">ℹ️ 정보</h2>
      <p class="muted small">2026 도쿄 가족여행 가이드 · 오프라인 PWA. 홈 화면에 추가하면 앱처럼 쓸 수 있어요 (아이폰: 공유 → 홈 화면에 추가).</p>
    </section>`;
  };

})(window.App);
