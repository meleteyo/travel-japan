# 도쿄 가족여행 콘텐츠 최신 재검토

작성일: 2026-06-01  
대상 여행: 2026-06-03 ~ 2026-06-06, 도쿄 가족 3명 여행  
검토 범위: 여행 콘텐츠, 일정 현실성, 최신 공식 정보, 2025-2026년 가족 단위 후기 기반 리스크  
검토 제외: 앱 기능, UI 구현, 코드 구조

## 검토 방식

이번 검토는 프로젝트 내 여행 정보가 갱신된 뒤, 최신 웹 정보를 기준으로 다시 교차검증했다. 공식 정보는 공항, 철도, 상업시설, 공공기관, 매장 공식 사이트를 우선했고, 후기성 정보는 광고성·제휴성 글보다 실제 방문자의 대기 시간, 아이 동반 피로도, 혼잡 경험이 드러나는 자료를 더 높게 보았다.

### 우선 반영한 공식 출처

- 나리타공항 공식 Aero K 항공사 정보
- 나리타공항 공식 Terminal 3 - Terminal 2/3 역 이동 안내
- Keisei Skyliner 공식 운임·e-ticket 안내
- JR East Welcome Suica 공식 안내
- 일본 관광청 면세 제도 안내
- Nintendo TOKYO 공식 안내
- Pokemon Center SHIBUYA 공식 안내
- Shibuya PARCO 영업시간·면세 안내
- Tokyo Station Ichibangai 영업시간표
- 국립과학박물관 공식 이용 안내
- Open-Meteo 예보 데이터

### 참고한 후기성 정보

- Reddit `r/JapanTravel`, `r/JapanTravelTips`, `r/SmallShoesBigJapan`의 2025-2026 가족 여행 후기
- 일본 부모 후기 사이트 `いこーよ`
- 일본 현지 블로그의 도쿄 캐릭터 스트리트 혼잡 분석
- 포켓몬센터 시부야를 아이와 방문한 부모 후기

광고성 성격이 강하거나 예약 대행, 봇, 제휴 링크 유도 목적이 강한 글은 핵심 근거에서 제외했다.

## 총평

갱신된 현재 콘텐츠는 지난 검토보다 훨씬 현장성 있게 바뀌었다. 특히 나리타 제3터미널 도착, 도착일 우천 대응, 아키하바라 점심 앵커, 귀국일 도쿄역 혼잡 리스크가 반영된 점은 좋다.

다만 아직 몇몇 항목은 최신 공식 정보와 충돌하거나, 파일별 문구가 서로 다르다. 현장에서 혼란이 생길 수 있는 항목은 다음 다섯 가지다.

1. Skyliner 요금
2. Welcome Suica 보증금/발급비 안내
3. Shibuya PARCO 6층 영업시간
4. Nintendo TOKYO 면세 가능 여부
5. 귀국편 Terminal 3 표기 통일

또한 가족 단위 실제 후기 기준으로 보면, 현재 일정은 "가능한 일정"이지만 일부 날은 여전히 체크리스트처럼 보일 수 있다. 특히 D2 시부야·하라주쿠와 D4 도쿄역은 필수/선택 구분을 더 강하게 나누는 것이 좋다.

## 핵심 수정 우선순위

| 우선순위 | 항목 | 현재 상태 | 권장 수정 |
| --- | --- | --- | --- |
| 높음 | Skyliner 요금 | 일부 데이터가 2,580엔·2,310엔 기준 | Keisei 최신 공식 운임 기준으로 재확인 및 갱신 |
| 높음 | Welcome Suica | 발급비 500엔 반환 불가 문구 존재 | 보증금 없음, 잔액 환불 없음으로 수정 |
| 높음 | 귀국 터미널 | 일부 가이드에 T2 출국 문구 잔존 | Aero K T3 출국으로 통일 |
| 높음 | PARCO 6F 영업시간 | 일부 가이드에 11:00 시작 문구 | Nintendo/Pokemon 공식 기준 10:00-21:00으로 수정 |
| 높음 | Nintendo 면세 | 일부 쇼핑 문구가 면세 가능처럼 단정 | 계산 전 확인 필요로 통일 |
| 중간 | Pokemon Center 혼잡 | 자유입장·목요일 한산으로 단정 | 기본 자유입장, 인기 코너·이벤트는 대기 가능으로 수정 |
| 중간 | D1 박물관 Plan B | 좋은 대안이나 시간 제한이 약함 | 15:30 이전 도착 가능 시에만 추천 |
| 중간 | D2 일정 구조 | stop 목록은 여전히 전부 순차 방문처럼 보임 | 필수/선택형 구조로 재편 |
| 중간 | D4 도쿄역 | 토요일 11:30 방문은 빡빡함 | 10:00 도착 플랜과 11:30 축소 플랜 분리 |

## 1. 교통 콘텐츠 검토

### 1.1 Aero K Terminal 3 반영은 잘 됨

나리타공항 공식 Aero K 정보는 국제선 터미널을 `T3 / 2F`로 표시한다. 현재 일정 본문과 도착 가이드에는 Terminal 3 도착이 반영되어 있어 방향은 맞다.

다만 일부 귀국 가이드에는 아직 `나리타 T2 19:35 출발` 같은 표현이 남아 있다. Aero K 출국도 Terminal 3 기준으로 보는 것이 자연스럽다. 철도는 `Narita Airport Terminal 2·3 Station`을 이용하되, 실제 출국 터미널은 Terminal 3라는 점을 모든 섹션에서 통일해야 한다.

### 권장 문구

> Aero K는 나리타 제3터미널(T3) 이용. Skyliner는 제2·3터미널역에서 승하차하며, 역과 T3 사이에는 도보 약 10분 이동이 필요하다.

### 확인할 파일

- `data/itinerary.json`
- `data/guides.json`
- `data/transit.json`
- `data/checklist.json`

## 2. Skyliner 요금 콘텐츠

현재 프로젝트에는 Skyliner 요금이 `2,580엔`, 온라인 `2,310엔`, 왕복 `4,500엔` 등으로 적힌 부분이 있다. 하지만 Keisei 공식 운임표 기준으로는 나리타공항 Terminal 1/Terminal 2·3에서 닛포리까지 `2,470엔`, IC 이용 시 `2,465엔`으로 표시된다.

Skyliner는 특급권 성격이 있어 운임 체계가 시점별로 바뀔 수 있으므로, 출발 직전 공식 사이트 기준으로 최종 확인해야 한다. 앱 내 고정 데이터는 최신 공식 운임과 맞춰야 한다.

### 권장 수정

- `2,580엔` 표기는 공식 운임표 재확인 후 갱신
- 온라인 할인권 가격도 Keisei e-ticket 페이지 기준으로 재확인
- 왕복권은 "공항에서 교환 가능한 조건"을 함께 표기
- "Suica로 Skyliner 요금 결제 불가" 식의 단정은 완화 필요  
  일부 경우 IC로 기본 운임을 처리하고 특급권을 별도 구매하는 구조가 가능하므로, "Skyliner 이용에는 별도 특급권/지정석권이 필요"라고 쓰는 편이 정확하다.

### 권장 문구

> Skyliner는 일반 JR/지하철처럼 IC카드만 터치해서 끝나는 열차가 아니라, 지정석 특급권이 필요한 열차다. 요금과 할인권 조건은 Keisei 공식 사이트에서 출발 전 재확인한다.

## 3. Welcome Suica 콘텐츠

JR East 공식 안내 기준 Welcome Suica는 2025년 3월 27일부터 나리타공항 Terminal 1 Station, Terminal 2·3 Station 등에서 판매된다. 유효기간은 구매일 포함 28일이며, 보증금은 필요 없다.

현재 `data/guides.json`에는 `카드 발급비 500엔은 반환 불가`라는 문구가 있다. 이는 일반 Suica 보증금 개념과 섞인 것으로 보인다. Welcome Suica는 보증금이 없고, 대신 잔액 환불이 안 되는 구조로 안내해야 한다.

### 권장 수정

- `카드 발급비 500엔` 문구 삭제
- `보증금 없음` 추가
- `잔액 환불 없음` 추가
- 아동용 Welcome Suica는 아이 여권 등 신분 확인 필요하다는 점 유지
- 12세 아동의 경우 "12번째 생일 이후 다음 3월 31일까지" 조건을 반영

### 권장 문구

> Welcome Suica는 보증금 없이 구입 가능하다. 단, 유효기간은 구매일 포함 28일이며 남은 잔액은 환불되지 않으므로 마지막 날 편의점·자판기에서 소진하는 것이 좋다.

## 4. 면세 콘텐츠

일본 관광청 공식 안내에 따르면, 현재 2026년 10월 31일까지는 기존 즉시 면세 방식이 유지되고, 2026년 11월 1일부터는 출국 시 환급 방식으로 전환될 예정이다. 이번 여행은 2026년 6월이므로 기존 방식이 적용된다.

현재 `data/tips.json`의 면세 설명은 상당히 잘 고쳐져 있다. 문제는 일부 쇼핑 가이드와 `data/shopping.json`에 아직 Nintendo TOKYO도 면세 가능하다는 식으로 읽히는 문구가 남아 있다는 점이다.

Shibuya PARCO 공식 면세 페이지는 "면세 카운터 없음, 매장별 처리 방식 상이"라고 안내한다. Pokémon Center SHIBUYA는 면세 목록에서 확인되지만, Nintendo TOKYO는 해당 목록에서 명확히 확인되지 않는다.

### 권장 수정

- `Nintendo·포켓몬센터·로프트도 같은 매장 5천엔 이상이면 면세` 문구 수정
- `Pokemon Center SHIBUYA는 면세 확인, Nintendo TOKYO는 계산 전 확인 필요`로 통일
- `공항 환급 없음` 문구는 2026년 6월 여행 기준으로 유지
- 2026년 11월 이후 변경 예정이라는 주석은 유지

### 권장 문구

> 2026년 6월 여행 기준 일본 면세는 대부분 매장에서 즉시 처리한다. Shibuya PARCO는 별도 면세 카운터가 없고 매장별 처리 방식이 다르므로, 계산 전 "Tax free available here?"라고 확인한다. Pokemon Center SHIBUYA는 면세 대상 매장으로 확인되지만 Nintendo TOKYO는 현장 확인이 필요하다.

## 5. D1 도착일 콘텐츠 검토

### 현재 장점

갱신된 D1은 Terminal 3, 우천, 호텔 휴식, 가벼운 첫 끼가 반영되어 훨씬 현실적이다. 도착일을 "많이 보는 날"이 아니라 "무사히 도착하고 컨디션을 살리는 날"로 잡은 점이 좋다.

### 남은 리스크

Open-Meteo 기준 2026-06-03 닛포리 부근은 강수확률이 매우 높고 최고기온도 약 19도 수준으로 나온다. 현재 `data/weather.json`의 `80%`, `18~21도`도 방향은 맞지만, 최신 예보 기준으로는 더 강한 우천 플랜이 필요하다.

국립과학박물관은 좋은 실내 대안이다. 공식 안내 기준 운영시간은 9:00-17:00, 입장은 폐관 30분 전까지이며, 고등학생 이하는 무료다. 하지만 도착일 체크인 후 방문하면 실제 관람 시간이 짧다.

### 권장 수정

- D1 날씨를 `강한 비 가능성 높음`으로 상향
- 야나카긴자는 조건부 일정으로 유지
- 국립과학박물관은 `15:30 이전 도착 가능 시`로 조건 추가
- 비가 계속 오면 `호텔 휴식 + 닛포리/우에노 식사`를 메인 Plan B로 제시

### 권장 D1 흐름

1. 11:50 나리타 T3 도착
2. 입국, 수하물, T3에서 Terminal 2·3 Station 이동
3. 가능한 Skyliner 탑승
4. 호텔 체크인 또는 짐 보관
5. 가벼운 식사와 휴식
6. 비가 약하면 야나카긴자 짧게
7. 비가 강하면 호텔 주변 식사 또는 국립과학박물관 짧은 관람

## 6. D2 시부야·하라주쿠 콘텐츠 검토

### 현재 장점

PARCO, Nintendo TOKYO, Pokemon Center SHIBUYA, LOFT를 핵심으로 둔 것은 매우 좋다. 12세 전후 아이의 관심사와 잘 맞고, 실제 2025-2026 가족 여행 후기에서도 Shibuya PARCO는 Nintendo, Pokemon, Capcom, Sega 등 캐릭터·게임 매장이 한 층에 모여 있어 가족에게 효율적인 장소로 언급된다.

### 남은 리스크

현재 moveNote에는 "오후는 1~2곳만"이라고 잘 적혀 있지만, stop 목록은 PARCO, LOFT, Cat Street, Takeshita Street, Omotesando가 모두 순차 방문처럼 보인다. 실제 가족 후기에서는 도쿄의 걷기, 줄, 군중, 자극이 누적되어 오후 피로가 빠르게 온다는 패턴이 반복된다.

또한 Shibuya PARCO 6F 영업시간 안내가 일부 가이드에서 11:00 시작으로 되어 있는데, Nintendo 공식과 PARCO 공식은 Nintendo TOKYO 10:00-21:00을 안내한다. Pokemon Center SHIBUYA 공식도 10:00-21:00이다.

### 권장 수정

- D2 stop 구조를 필수/선택으로 나눔
- PARCO와 LOFT를 필수로 지정
- Cat Street, Takeshita Street, Omotesando는 선택 A/B/C로 분리
- PARCO 6F 영업시간을 10:00-21:00으로 통일
- Pokemon Center는 기본 자유입장이지만 인기 체험·이벤트는 대기 가능하다고 수정

### 권장 D2 구조

#### 필수

- Shibuya PARCO 6F
- Nintendo TOKYO
- Pokemon Center SHIBUYA
- Shibuya LOFT

#### 선택

- 체력 좋음: Takeshita Street 30-60분
- 비가 옴: Omotesando Hills, Shibuya Hikarie 등 실내
- 너무 피곤함: LOFT 후 호텔 복귀 또는 우에노/닛포리 저녁

## 7. D3 아키하바라·긴자 콘텐츠 검토

### 현재 장점

D3는 이번 갱신에서 가장 좋아진 날이다. `11:30-12:30 점심 먼저 확정`이라는 앵커가 생긴 점이 좋다. 아키하바라는 매장 밀도가 높아 시간을 잃기 쉽고, 점심을 놓치면 긴자 이동 후 가족 피로가 크게 올라간다.

Yodobashi Akiba를 먼저 잡고, 가챠·라디오회관·애니메이트를 이후로 둔 것도 현실적이다. 전자기기 목적이면 Yodobashi가 확실한 중심이고, 아키하바라 전체를 무작정 넓게 돌 필요는 없다.

### 후기 기반 보완

2025-2026 후기성 자료에서는 아키하바라가 기대보다 "게임"보다 "애니·피규어·가챠" 쪽으로 강하다는 의견이 많다. 따라서 아이가 전자기기·이어폰·문구·게임 주변기기 쪽을 좋아한다면 Yodobashi 중심 플랜이 맞고, 라디오회관과 가챠는 60-90분 정도로 제한하는 편이 좋다.

### 권장 수정

- `아키하바라 전체 탐험`보다 `Yodobashi + 가챠/라디오회관 맛보기`로 표현
- 가챠 예산은 1인 1,000-2,000엔 유지
- 라디오회관은 관심 없으면 과감히 생략 가능하다고 표시
- 긴자 이토야는 조용한 회복형 쇼핑으로 유지

## 8. D4 도쿄역·공항 콘텐츠 검토

### 현재 장점

도쿄 캐릭터 스트리트 10:00 오픈, 토요일 혼잡, 목표 매장 3곳 제한, 라멘 줄 길면 대체식 전환이 반영된 점은 좋다.

### 남은 리스크

현재 stop 시간은 여전히 `11:00 체크아웃`, `11:30 도쿄역 캐릭터스트리트`다. 토요일 11:30 도착이면 이미 관광객, 신칸센 이용객, 가족 단위 방문객이 늘어나는 시간대다. 후기성 자료에서도 도쿄 캐릭터 스트리트는 통로가 좁고, 오후에는 이동이 어려울 정도로 붐빈다는 평가가 반복된다.

특히 귀국일은 쇼핑보다 공항 이동 안정성이 우선이다. 19:35 비행기라면 16:00경 닛포리 Skyliner 탑승 목표는 적절하지만, 도쿄역에서 지체되면 짐 회수와 공항 이동이 압박된다.

### 권장 수정

D4는 두 가지 플랜으로 분리하는 것이 좋다.

#### 플랜 A: 캐릭터 쇼핑 우선

1. 09:00-09:30 체크아웃 및 짐 보관
2. 10:00 도쿄 캐릭터 스트리트 도착
3. 10:00-12:00 목표 매장 3곳 방문
4. 12:00-13:00 점심
5. 13:30-14:00 닛포리 복귀
6. 15:00 짐 회수
7. 16:00 전후 Skyliner 탑승

#### 플랜 B: 현재 시간 유지

1. 11:00 체크아웃
2. 11:30 도쿄역 도착
3. 목표 매장 3곳만 방문
4. 라멘 줄이 길면 즉시 에키벤·역 식당가·체인 식당으로 전환
5. 14:30 쇼핑 마감
6. 15:00 닛포리 짐 회수

## 9. 식당 콘텐츠 검토

현재 식당 데이터는 맛집 정보가 풍부하고, 가격·현금·웨이팅·외국인 친화성까지 적혀 있어 유용하다. 다만 가족 단위 후기 기준으로는 `맛집`과 `회복식`을 분리하는 편이 더 안전하다.

### 현재 리스크

- 돈카츠, 규카츠, 라멘, 텐동, 튀김 비중이 높다.
- 작은 카운터석 맛집은 12세 아이 동반이라도 피로도가 높을 수 있다.
- 줄이 긴 맛집은 여행 만족도를 올리기도 하지만, 가족 컨디션이 나쁘면 즉시 리스크가 된다.

### 후기 기반 보강

2026년 Reddit 가족식당 후기에서는 Gusto, Saizeriya, Sushiro, Royal Host, 백화점/쇼핑몰 식당가가 아이 동반 스트레스를 줄이는 안전망으로 반복 언급된다. 특히 넓은 좌석, 드링크바, 터치패널, 로봇 서빙, 메뉴 다양성이 가족에게 도움이 된다는 후기가 많다.

### 권장 수정

- 각 날짜마다 `맛집`, `안전식`, `비상식` 3단계로 식당 분류
- `웨이팅 20분 이상이면 대체` 기준 추가
- 카운터석 위주 식당은 가족 난이도 표시
- 편의점/에키벤/패밀리레스토랑을 부끄러운 대안이 아니라 정상 플랜으로 격상

### 일자별 보강안

| 날짜 | 맛집 | 안전식 | 비상식 |
| --- | --- | --- | --- |
| D1 | 부라리, 스시로 | 사이제리야, 우에노 식당가 | 편의점 도시락, 호텔 휴식 |
| D2 | 우오베이, 마이센 | Hikarie/PARCO 식당가 | Saizeriya, 카페 |
| D3 | 규슈잔가라, 마루고 | Yodobashi 식당가, Tenya | 편의점, 역 소바 |
| D4 | 로쿠린샤 | Tokyo Station 식당가 | 에키벤, 편의점, 빠른 체인 |

## 10. 쇼핑 콘텐츠 검토

쇼핑 관심사는 가족 여행 콘텐츠 중 가장 강점이 크다. Nintendo, Pokemon, LOFT, 가챠, Yodobashi, Itoya, Tokyo Character Street는 12세 전후 아이에게 기억에 남을 확률이 높다.

다만 예산과 면세 문구는 더 정교해야 한다.

### 좋은 점

- 매장별 예산 상한이 생겼다.
- 가챠 예산을 별도 관리한다.
- 한정 굿즈 품절 가능성을 안내한다.
- 도쿄역 캐릭터 스트리트 목표 매장 제한이 들어갔다.

### 보완점

- `Nintendo 면세` 단정 문구 수정
- `포켓몬 TCG 박스`처럼 예산을 크게 잡아먹는 항목은 주의 표시
- 도쿄 캐릭터 스트리트는 "모두 둘러보기"가 아니라 "목표 매장 3곳"을 기본값으로 설정
- 쇼핑백이 늘어날 경우 코인락커/호텔 복귀 기준 추가

### 권장 예산 구조

| 항목 | 권장 상한 |
| --- | --- |
| Nintendo TOKYO | 5,000-8,000엔 |
| Pokemon Center SHIBUYA | 5,000-8,000엔 |
| Shibuya LOFT | 3,000-5,000엔 |
| Akihabara gacha | 1,000-2,000엔 |
| Yodobashi Akiba | 구매 목적별 별도 예산 |
| Ginza Itoya | 3,000-5,000엔 |
| Tokyo Character Street | 3,000-5,000엔 |

## 11. 의료·안전 콘텐츠 검토

의료와 안전 콘텐츠는 전반적으로 좋다. 다만 가족 단위 실제 사용성을 기준으로 보면 긴급 정보는 여러 섹션에 흩어지기보다 최상단에 모여 있어야 한다.

### 보완 권장

- 긴급 연락처, 호텔 주소, 여권 사진, 보험증서 위치를 SOS 섹션에 모으기
- 아이용 약 안내는 제품명을 단정하기보다 약사에게 보여줄 문장 중심으로 구성
- `カロナール`은 일본에서 처방약 맥락으로 이해될 수 있으므로, OTC 구매는 약사 상담 유도 표현이 안전
- 비 오는 날 신발·양말·방수팩·휴대폰 배터리 관리 안내 추가

## 12. 콘텐츠별 최종 판단

| 영역 | 현재 품질 | 판단 |
| --- | --- | --- |
| 공항·입국 | 좋음 | T3 반영은 좋으나 일부 T2 문구 제거 필요 |
| 교통 | 보통~좋음 | Skyliner 요금·Welcome Suica 문구 수정 필요 |
| 날씨 | 좋음 | D1은 더 강한 우천 플랜으로 격상 권장 |
| D1 일정 | 좋음 | 박물관은 시간 조건 추가 필요 |
| D2 일정 | 보통 | stop 목록을 선택형으로 바꿔야 함 |
| D3 일정 | 좋음 | 점심 앵커 반영이 좋음 |
| D4 일정 | 보통 | 10:00 도착 플랜과 11:30 축소 플랜 분리 필요 |
| 식당 | 보통~좋음 | 맛집보다 가족 안전식 보강 필요 |
| 쇼핑 | 좋음 | 면세·예산 문구 정리 필요 |
| 의료·안전 | 좋음 | SOS 정보 집중화 필요 |

## 수정 체크리스트

- [ ] Skyliner 운임을 Keisei 최신 공식 기준으로 갱신
- [ ] Skyliner 온라인 할인권·왕복권 조건 재확인
- [ ] Welcome Suica `발급비 500엔` 문구 삭제
- [ ] Welcome Suica `보증금 없음, 잔액 환불 없음` 문구 추가
- [ ] Aero K 귀국 터미널을 모든 파일에서 T3로 통일
- [ ] Shibuya PARCO 6F 영업시간을 10:00-21:00으로 통일
- [ ] Pokemon Center는 기본 자유입장이나 인기 코너 대기 가능으로 수정
- [ ] Nintendo TOKYO 면세 가능 여부를 현장 확인 필요로 통일
- [ ] D1 날씨를 최신 예보 기준으로 강한 우천 플랜으로 수정
- [ ] 국립과학박물관 Plan B에 15:30 이전 도착 조건 추가
- [ ] D2 stop 목록을 필수/선택형으로 재구성
- [ ] D4를 10:00 도착 플랜과 11:30 축소 플랜으로 분리
- [ ] 식당 정보를 맛집/안전식/비상식으로 재분류
- [ ] 가족 식사용 패밀리레스토랑·백화점 식당가 안전망 추가
- [ ] 쇼핑 예산에 포켓몬 카드·가챠 과소비 주의 문구 추가
- [ ] SOS 섹션에 호텔 주소, 보험, 응급 연락처를 집중 배치

## 주요 참고 출처

### 공식·공공 사이트

- [Narita Airport - Aero K Airlines](https://www.narita-airport.jp/en/flight/airline-search/eok/)
- [Narita Airport - Travel between Airport Terminal 2 Station and Terminal 3](https://www.narita-airport.jp/en/access/train/railway-route-3/)
- [Narita Airport - Rail Access](https://www.narita-airport.jp/en/access/train/)
- [Keisei Skyliner Fares](https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/skyliner_fares.php)
- [Keisei Skyliner e-ticket](https://www.keisei.co.jp/keisei/tetudou/skyliner/e-ticket/en/?sc=tcen1)
- [JR East Welcome Suica](https://www.jreast.co.jp/en/multi/welcomesuica/purchase.html)
- [Japan Tourism Agency Tax-free Shopping System](https://www.mlit.go.jp/kankocho/tax-free/page01_000001_00028.html)
- [Nintendo TOKYO/OSAKA/KYOTO/FUKUOKA](https://www.nintendo.com/jp/officialstore/index.html)
- [Pokemon Center SHIBUYA](https://www.pokemon.co.jp/shop/en/pokecen/shibuya/)
- [Shibuya PARCO Tax Free](https://shibuya.parco.jp/taxfree/)
- [Shibuya PARCO Nintendo TOKYO](https://shibuya.parco.jp/shop/detail/?cd=025793)
- [Tokyo Station Ichibangai](https://www.tokyoeki-1bangai.co.jp/en/)
- [Tokyo Station Ichibangai Opening Hours PDF](https://www.tokyoeki-1bangai.co.jp/uploads/pdfs/tokyoeki1bangai/000002/000002/cd9b9294.pdf)
- [National Museum of Nature and Science](https://www.kahaku.go.jp/english/riyou/nyukan-annai/)
- [Open-Meteo](https://open-meteo.com/)

### 후기·실사용 참고

- [Genki Mama - Pokemon Center Shibuya with child](https://genki-mama.com/articles/vCq7e)
- [Banzoku - Tokyo Character Street crowd analysis](https://banzokubiology.com/tokyo-character-street-konzatsu/)
- [Iko-yo - Tokyo Character Street family reviews](https://iko-yo.net/facilities/1238/experiences)
- [Reddit - 10 Day Tokyo Itinerary with large family](https://www.reddit.com/r/JapanTravel/comments/1td9abr/10_day_tokyo_itinerary_with_large_family/)
- [Reddit - Family Restaurants with Kids](https://www.reddit.com/r/SmallShoesBigJapan/comments/1sytipk/to_the_parent_who_suggested_family_restaurants/)
- [Reddit - Tokyo stores for videogame fans](https://www.reddit.com/r/JapanTravelTips/comments/1o3c364/best_storesbuildings_to_not_miss_in_tokyo_as_a/)

