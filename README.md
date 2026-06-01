# 도쿄 가족여행 가이드 · Tokyo Family Trip Guide

2026 도쿄 가족여행(6/3–6/6)을 위한 **모바일 오프라인 가이드**(설치형 PWA).
일정 · 회화(보여주기) · 교통/지하철 · 맛집(메뉴·가격·사진) · 긴급 · 체크리스트 · 환율(원화 병기) · 쇼핑 · 정보·꿀팁 · 병원/약국 · 포토스팟.

- **빌드 없는 정적 사이트**(HTML/CSS/vanilla JS) + Service Worker로 **오프라인 100%**
- 모든 금액 **¥+₩ 병기**, 긴급/식당/호텔 **전화 클릭 즉시 통화**
- 배포: GitHub Pages → `https://meleteyo.github.io/travel-japan/`
- 비공개 가족용: `robots.txt`/`noindex`로 검색엔진 비노출

## 폴더
- `index.html` · `service-worker.js` · `manifest.webmanifest`
- `css/` `js/` — 앱 셸·화면
- `data/*.json` — 일정·회화·맛집·긴급 등 콘텐츠
- `assets/img/` — 음식·장소 사진(webp), `assets/maps/` — 지하철 노선도
- `tools/` — 데이터/이미지/아이콘/캐시 생성 스크립트

## 콘텐츠 수정 후
이미지/데이터를 바꾸면 **반드시** 캐시 목록과 버전을 갱신:
```bash
python3 tools/gen-precache.py   # Service Worker PRECACHE + VERSION 갱신
node     tools/smoke.js         # 전 화면 렌더 점검
```
`VERSION`을 올리지 않으면 기기 캐시가 갱신되지 않습니다.

## 가족 사용 팁
- 출발 전 **와이파이에서 설정 → "오프라인 전체 저장"** 1회 실행(사진까지 캐시).
- 아이폰: 공유 → **홈 화면에 추가**로 설치하면 앱처럼 오프라인 사용.
