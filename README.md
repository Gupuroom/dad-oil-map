# 최저가 주유소

> 실시간 주변 최저가 주유소 찾기 — GPS 기반 모바일 웹 앱

GPS 위치 또는 장소 검색을 기준으로 반경 5km 내 주유소를 실시간으로 조회하고, 가격순/거리순으로 정렬해서 보여줍니다.

---

## 주요 기능

- **GPS 기반 위치 탐색** — 앱 접속 시 현재 위치 자동 감지, 버튼으로 재검색
- **장소 검색** — 카카오맵 API 기반 키워드/주소 검색 (300ms 디바운스)
- **실시간 주유소 가격** — 오피넷 공식 API 연동, 반경 5km / 최대 20개
- **정렬 전환** — 최저가순 / 거리순 즉시 전환
- **브랜드 필터** — SK, GS, HD, S-OIL, 알뜰, NH, E1 등 브랜드별 필터
- **카카오맵 마커** — 최저가 주유소 강조 표시, 내 위치/검색 위치 표시
- **길찾기 연동** — TMap 앱 딥링크 (미설치 시 카카오맵 웹으로 폴백)
- **바텀 시트** — 드래그 가능한 주유소 목록 패널 (Framer Motion)
- **서버 캐싱** — 30분 단위 API 응답 캐시로 오피넷 호출 최소화

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Animation | Framer Motion |
| Map | react-kakao-maps-sdk |
| Coordinate | proj4 (WGS84 ↔ KATEC 변환) |
| Language | TypeScript |
| External API | 오피넷, 카카오맵, TMap |

---

## 시작하기

### 1. 저장소 클론 & 의존성 설치

```bash
git clone https://github.com/<your-username>/dad-oil-navi.git
cd dad-oil-navi
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해서 `.env.local`을 만들고 API 키를 채워주세요.

```bash
cp .env.example .env.local
```

```env
# 오피넷 API 키 — https://www.opinet.co.kr/user/opinarshare/opiInfo.do
OPINET_CODE=

# 카카오 REST API 키 (서버 전용) — https://developers.kakao.com
KAKAO_REST_API_KEY=

# 카카오 JavaScript 앱 키 (클라이언트 지도 SDK용)
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=
```

> **API 키 발급 방법**
> - **오피넷**: [오피넷 Open API 신청](https://www.opinet.co.kr/user/opinarshare/opiInfo.do) → 공공데이터 포털에서 활용신청
> - **카카오**: [카카오 개발자 콘솔](https://developers.kakao.com) → 앱 생성 → 앱 키에서 REST API 키 / JavaScript 키 복사

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 됩니다.

---

## 프로젝트 구조

```
dad-oil-navi/
├── app/
│   ├── page.tsx                    # 홈 페이지
│   ├── layout.tsx                  # 루트 레이아웃 (메타데이터, 폰트)
│   ├── globals.css                 # 전역 스타일
│   └── api/
│       ├── stations/route.ts       # GET /api/stations — 오피넷 주유소 조회
│       └── search/route.ts         # GET /api/search — 카카오맵 장소 검색
├── src/
│   ├── components/
│   │   ├── HomeClient.tsx          # 메인 로직 (상태 관리, GPS, 데이터 패칭)
│   │   ├── MapView.tsx             # 카카오맵 렌더링 및 마커
│   │   ├── SearchBar.tsx           # 장소 검색 입력
│   │   ├── SlidingSheet.tsx        # 드래그 가능한 바텀 시트
│   │   ├── StationList.tsx         # 주유소 목록
│   │   ├── StationCard.tsx         # 주유소 카드 (이름, 거리, 가격)
│   │   ├── ActionButtons.tsx       # 정렬 버튼 (최저가순 / 거리순)
│   │   ├── BrandFilter.tsx         # 브랜드 필터 칩
│   │   ├── BrandLogo.tsx           # 브랜드 로고 컴포넌트
│   │   ├── NavigationConfirmModal.tsx  # 길찾기 확인 모달
│   │   └── SheetHandle.tsx         # 바텀 시트 핸들
│   ├── types/
│   │   └── station.ts              # Station 타입 정의
│   └── lib/
│       └── navigation.ts           # TMap / 카카오맵 길찾기 연동
├── .env.example                    # 환경변수 샘플 (값 없음)
└── .env.local                      # 실제 API 키 (git 제외)
```

---

## API 엔드포인트

### `GET /api/stations`

오피넷에서 주변 주유소 가격 정보를 조회합니다.

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `lat` | float | 위도 |
| `lng` | float | 경도 |
| `sort` | `1` \| `2` | 정렬 (1: 최저가순, 2: 거리순, 기본값: 1) |

```json
[
  {
    "id": "A0000001",
    "brand": "SKE",
    "name": "SK에너지 XX주유소",
    "price": 1720,
    "distance": 320,
    "lat": 37.5665,
    "lng": 126.978
  }
]
```

### `GET /api/search`

카카오맵 API로 장소를 검색합니다 (키워드 + 주소 병렬 호출).

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `query` | string | 검색어 (2자 이상) |

```json
[
  {
    "id": "12345",
    "name": "강남역",
    "address": "서울 강남구 강남대로 396",
    "lat": 37.4979,
    "lng": 127.0276
  }
]
```

---

## 개발 스크립트

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

---

## 라이선스

MIT
