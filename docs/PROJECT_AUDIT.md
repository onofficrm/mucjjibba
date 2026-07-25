# 묵찌빠 아레나 — 프로젝트 감사 보고서

| 항목 | 내용 |
|------|------|
| 대상 | `build/묵찌빠-아레나` (Google AI Studio → Cursor 이관) |
| 작성일 | 2026-07-25 |
| 목적 | 현재 구현 상태 파악, 이후 Cursor 개발 기준선 확정 |
| 검증 | `npm run lint` (tsc) ✅ · `npm run build` ✅ · ESLint 없음 |

---

## 1. 기술 스택

| 구분 | 기술 | 버전 / 비고 |
|------|------|-------------|
| UI | React | `^19.0.1` |
| 번들러 | Vite | `^6.2.3` (실측 6.4.3) |
| 언어 | TypeScript | `~5.8.2` (`strict` 미사용) |
| 라우팅 | react-router-dom | `^7.18.1` — **HashRouter** (`#/lobby` 형태) |
| 스타일 | Tailwind CSS v4 | `@tailwindcss/vite` — `index.css`의 `@theme`로 `arena-*` 팔레트 |
| 애니메이션 | motion | `^12.23.24` (`motion/react`) |
| 차트 | recharts | `^3.10.0` (관리자·분석 화면) |
| 아이콘 | lucide-react | `^0.546.0` |
| 미사용 의존성 | `@google/genai`, `express`, `dotenv` | `src/`에서 import 없음 |
| 린트 | `npm run lint` = `tsc --noEmit` | ESLint 설정 없음 |

배포 연동(그누보드): `plugin/onoff-builder-bridge/imports/mucjjibba-arena/` + `_site.config.php`의 `home_builder_bridge_id = mucjjibba-arena`.

---

## 2. 실행 및 빌드 방법

```bash
cd build/묵찌빠-아레나
npm install
npm run dev      # http://0.0.0.0:3000
npm run build    # dist/ 생성
npm run preview  # 빌드 미리보기
npm run lint     # tsc --noEmit
npm run clean    # dist 삭제 (server.js는 현재 없음)
```

그누보드 홈 반영 시: `dist` 내용을 `plugin/onoff-builder-bridge/imports/mucjjibba-arena/`에 복사 후 FTP/Git 배포.

---

## 3. 전체 폴더 구조

```
build/묵찌빠-아레나/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example          # GEMINI_API_KEY, APP_URL (미사용)
├── assets/               # AI Studio 잔여 (.aistudio)
├── dist/                 # 빌드 산출물 (gitignore)
├── src/
│   ├── App.tsx           # 라우트 정의
│   ├── main.tsx
│   ├── index.css         # Tailwind + arena 디자인 토큰
│   ├── components/
│   │   ├── common/       # Buttons, Cards, Badges, Feedback, Inputs, Overlays, StateScreens, AdvisoryBanner
│   │   ├── game/         # CharacterAvatar, DealerCharacter, GameReactions, VsIntro
│   │   ├── layouts/      # Layout (유저), AdminLayout
│   │   └── lobby/        # DailyMissions
│   ├── pages/
│   │   ├── auth/         # Splash, Login, Signup, Onboarding
│   │   ├── lobby/
│   │   ├── match/
│   │   ├── game/
│   │   ├── arena/, competition/, tournament/, spectate/, tutorial/
│   │   ├── user/
│   │   ├── admin/
│   │   ├── UserPages.tsx   # re-export + 일부 스텁
│   │   └── AdminPages.tsx  # re-export + 일부 스텁
│   ├── services/         # 10개 — 전부 빈 async 스텁
│   ├── data/             # demoData, decorations, mockData
│   ├── types/            # websocket.ts (프로토콜 타입만)
│   └── utils/            # audio, gameSettings, haptics
```

소스 규모: 약 **66 TS/TSX 파일**, **~11,900 LOC**.

---

## 4. 페이지와 라우팅 목록

HashRouter 기준. URL은 `#/path` 형태.

### 인증 (레이아웃 없음)

| 경로 | 컴포넌트 | 파일 | 상태 |
|------|----------|------|------|
| `/` | SplashPage | `pages/auth/SplashPage.tsx` | UI 완료 |
| `/login` | LoginPage | `pages/auth/LoginPage.tsx` | UI 완료 (데모 로그인) |
| `/signup` | SignupPage | `pages/auth/SignupPage.tsx` | UI 완료 (검증 없음) |
| `/onboarding` | OnboardingPage | `pages/auth/OnboardingPage.tsx` | UI 완료 |
| `/terms` | TermsPage | `UserPages.tsx` 스텁 | 미구현 |

### 유저 앱 (`Layout`)

| 경로 | 컴포넌트 | 파일 | 상태 |
|------|----------|------|------|
| `/lobby` | LobbyPage | `pages/lobby/LobbyPage.tsx` | UI 완료 |
| `/tutorial` | TutorialPage | `pages/tutorial/TutorialPage.tsx` | UI 완료 |
| `/match`, `/match/quick` | QuickMatchPage | `UserPages.tsx` 스텁 | 미구현 |
| `/match/tables` | TableSelectPage | `pages/match/TableSelectPage.tsx` | UI 완료 |
| `/match/waiting` | RealtimeMatchingPage | `pages/match/RealtimeMatchingPage.tsx` | UI 시뮬 |
| `/match/friend` | FriendMatchPage | `pages/match/FriendMatchPage.tsx` | UI 완료 (공유 미연결) |
| `/game/:id` | GamePlayPage | `pages/game/GamePlayPage.tsx` | 로컬 규칙 동작 |
| `/game/:id/result` | GameResultPage | `pages/game/GameResultPage.tsx` | **도달 불가** |
| `/game/:id/rematch` | RematchPage | `UserPages.tsx` 스텁 | 미구현 |
| `/arena` | ArenaPage | `pages/arena/ArenaPage.tsx` | UI 완료 |
| `/competition` | CompetitionPage | `pages/competition/CompetitionPage.tsx` | UI 부분 |
| `/tournament` | TournamentListPage | `pages/tournament/TournamentListPage.tsx` | UI 완료 |
| `/tournament/:id` | TournamentBracketPage | `pages/tournament/TournamentBracketPage.tsx` | UI 완료 |
| `/spectate/:id` | SpectatePage | `pages/spectate/SpectatePage.tsx` | UI 시뮬 |
| `/ranking` | RankingPage | `UserPages.tsx` 스텁 | 미구현 |
| `/history` | MatchHistoryPage | `pages/user/MatchHistoryPage.tsx` | UI 완료 |
| `/analysis` | PlayPatternAnalysisPage | `pages/user/PlayPatternAnalysisPage.tsx` | UI 완료 |
| `/point-history` | PointHistoryPage | `pages/user/PointHistoryPage.tsx` | UI 완료 |
| `/notifications` | NotificationsPage | `UserPages.tsx` 스텁 | 미구현 |
| `/friends` | FriendsListPage | `pages/user/FriendsListPage.tsx` | UI 완료 |
| `/mypage` | MyPage | `pages/user/MyPage.tsx` | UI 완료 |
| `/settings` | GameSettingsPage | `pages/user/GameSettingsPage.tsx` | **실동작** (localStorage) |
| `/decoration` | DecorationPage | `pages/user/DecorationPage.tsx` | 2/7 탭 |
| `/support` | CustomerSupportPage | `UserPages.tsx` 스텁 | 미구현 |
| `/usage-limits` | UsageLimitsPage | `pages/user/UsageLimitsPage.tsx` | UI만 (저장 없음) |

### 관리자 (`AdminLayout`)

| 경로 | 컴포넌트 | 상태 |
|------|----------|------|
| `/admin/login` | AdminLoginPage | 폼만 (동작 없음) |
| `/admin` | AdminDashboardPage | UI + 차트 |
| `/admin/users` | AdminUsersPage | UI |
| `/admin/games` | AdminGamesPage | UI |
| `/admin/points` | AdminPointsPage | UI |
| `/admin/tables` | AdminTablesPage | 스텁 |
| `/admin/tournaments` | AdminTournamentsPage | 스텁 |
| `/admin/reports` | AdminReportsPage | UI |
| `/admin/anomalies` | AdminAnomaliesPage | UI |
| `/admin/notices` | AdminNoticesPage | 스텁 |
| `/admin/settings` | AdminSettingsPage | 스텁 |

404/catch-all 라우트 없음.

---

## 5. 공통 컴포넌트 목록

### 사용 중

| 파일 | export | 용도 |
|------|--------|------|
| `common/Buttons.tsx` | Primary/Secondary/Danger/Icon/FilterButton | 클릭 시 햅틱·SFX |
| `common/Cards.tsx` | GameCard, PlayerCard | 카드 패널 |
| `common/AdvisoryBanner.tsx` | AdvisoryBanner | 상단 운영 안내 배너 |
| `game/CharacterAvatar.tsx` | CharacterAvatar | 손패 캐릭터 모션 |
| `game/DealerCharacter.tsx` | DealerCharacter | 딜러 음성/말풍선 |
| `game/GameReactions.tsx` | ReactionButton, ReactionBubble | 리액션 |
| `game/VsIntro.tsx` | VsIntro | 대결 인트로 |
| `layouts/Layout.tsx` | Layout | 유저 셸·하단 네비 |
| `layouts/AdminLayout.tsx` | AdminLayout | 관리자 사이드바 |
| `lobby/DailyMissions.tsx` | DailyMissions | 데일리 미션 UI |

### 존재하나 import 없음 (유지 권장 — 삭제 금지)

| 파일 | export | 비고 |
|------|--------|------|
| `common/Badges.tsx` | GradeBadge, WinningStreakBadge, StatusBadge, PointDisplay | 미연결 |
| `common/Feedback.tsx` | ProgressBar, CountdownTimer, Empty/Loading/ErrorState, Skeleton | 미연결 |
| `common/Inputs.tsx` | SearchInput, TabMenu | 미연결 |
| `common/Overlays.tsx` | Modal, BottomSheet | 미연결 (페이지마다 시트 중복 구현) |
| `common/StateScreens.tsx` | Loading/Empty/ServerError/NetworkError 등 | 미연결 · Feedback과 이름 충돌 주의 |

---

## 6. 사용자 / 관리자 페이지 구분

| | 사용자 | 관리자 |
|--|--------|--------|
| 레이아웃 | `Layout` — 다크 아레나, 모바일 하단 네비 + 데스크톱 사이드바 | `AdminLayout` — 라이트 콘솔, `md+` 사이드바 |
| 경로 prefix | `/`, `/lobby`, `/game/...` 등 | `/admin/...` |
| 권한 | **가드 없음** (URL 직접 접근 가능) | **가드 없음** (`#/admin` 즉시 대시보드) |
| 테마 | `arena-*` 다크 | Atlassian 스타일 라이트 |

시각적으로는 분리되어 있으나, 인증·역할 검증은 전무하다.

---

## 7. 현재 정상 작동하는 기능

- 라우팅·네비게이션·페이지 전환 애니메이션
- **게임 설정 영속화** (`utils/gameSettings.ts` → `localStorage` `arena_game_options`)
- **오디오 설정 영속화** (`utils/audio.ts` → `arena_audio_settings`)
- **로컬 묵찌빠 규칙** (`GamePlayPage`: 가위바위보 → 공격권 → 동일 손이면 득점, 2점 선승)
- 꾸미기 중 **캐릭터·손 스킨** ↔ 인게임 반영 (`decorations.ts` + gameSettings)
- Web Audio 합성 SFX/BGM, SpeechSynthesis 딜러 보이스, `navigator.vibrate` 햅틱
- 매칭/관전/토너먼트/아레나 대기 등 **setTimeout 기반 UI 시뮬레이션**
- 관리자 6개 화면의 표·차트·드로어 렌더링 (목 데이터)

---

## 8. 화면만 존재하고 기능이 연결되지 않은 부분

- `services/*` 10개 전부 — import·호출 없음
- `GameResultPage` — 빌드는 됐으나 `GamePlayPage`가 인라인 GAME_OVER만 사용 → **라우트 도달 불가**
- 로그인/회원가입 — 데모 분기·미검증 입력; 소셜 버튼은 햅틱만
- 공유 버튼 (결과/토너먼트/친구대전) — 핸들러 없거나 햅틱만
- 스텁 페이지: Terms, QuickMatch, Rematch, **Ranking**, Notifications, Support
- 관리자 스텁: Tables, Tournaments, Notices, Settings + AdminLogin 미동작
- 관리자 파괴적 액션 모달(정지/포인트 조정/무효) — submit 미연결, 페이지네이션 disabled
- Decoration 5탭 “준비 중”
- UsageLimits 저장 없음
- Spectate 메뉴(채팅/신고/상세) 미연결
- Layout의 `openGameSelect` 커스텀 이벤트 — dispatch 하는 곳 없음

---

## 9. 데모 데이터가 하드코딩된 위치

| 위치 | 내용 |
|------|------|
| `src/data/demoData.ts` | DEMO_USER, DEMO_ACTIVITIES, DEMO_NOTICES |
| `src/data/decorations.ts` | CHARACTERS, HAND_SKINS |
| `src/data/mockData.ts` | GAME_CONSTANTS만 — **미사용** |
| `LobbyPage.tsx` | FEATURED_GAME, OTHER_GAMES, TICKER_MESSAGES |
| `GamePlayPage.tsx` | DEMO_OPPONENT, 포인트 문자열 |
| `DailyMissions.tsx` | INITIAL_MISSIONS |
| `ArenaPage`, `RealtimeMatchingPage`, `TableSelectPage` | 킹/테이블/매칭 스텝 |
| `Tournament*`, `TutorialPage`, `MatchHistoryPage`, `MyPage`, `PointHistoryPage`, `FriendsListPage`, `PlayPatternAnalysisPage` | 각 페이지 상수 배열 |
| `pages/admin/*` | MOCK_USERS, MOCK_GAMES, MOCK_TRANSACTIONS 등 |

포인트는 전부 **데모용 가상 포인트**이며, 실제 결제·출금·환전 코드는 없다 (유지 원칙과 일치).

---

## 10. 게임 상태 관리 방식

- **전역 스토어 없음** (Context / Zustand / Redux 없음)
- `GamePlayPage` 내부 `useState` 다수 (GameState + 모달·연출 플래그 ~14개)
- 페이지 간: `location.state` 일부, 대부분은 페이지 이탈 시 소실
- 영속: `gameSettings` / `audioManager` 싱글톤 + `sessionStorage` (`arena_intro_played`)
- `Hand` / `GamePhase` 타입이 페이지마다 재선언되어 중복

---

## 11. 효과음과 애니메이션 구현 방식

### 오디오 (`utils/audio.ts`)

- Web Audio API 오실레이터 합성 (실사운드 파일 없음)
- 첫 터치/클릭 시 AudioContext 생성 (오토플레이 대응)
- BGM: 이중 사인파 드론 (주석상 데모용)
- 딜러: `speechSynthesis` 한국어 보이스
- 주의: `playBGM` 교체 시 이전 oscillator `stop` 누락 가능 (누적 리스크)

### 애니메이션

- `motion/react`: AnimatePresence, spring, layoutId 네비 인디케이터
- `performanceMode` / `reduceAnimations`로 파티클·딜러 등 축소
- 핸드 임팩트·슬롯 릴·VS 인트로 등 페이지 로컬 구현

### 햅틱 (`utils/haptics.ts`)

- `navigator.vibrate` 패턴

---

## 12. API 및 WebSocket 연결 준비 상태

| 항목 | 상태 |
|------|------|
| `types/websocket.ts` | 이벤트 유니온 설계만 존재 (15종) |
| `services/*.ts` | 빈 async 함수 + 주석 스펙 |
| `new WebSocket` / `fetch` / axios | **코드베이스에 없음** |
| `import.meta.env` / `process.env` 사용 | `src/`에 없음 |
| 실제 연결 준비도 | **~0%** (설계 문서 수준) |

서비스 파일 목록: `auth`, `user`, `game`, `matchmaking`, `friend`, `notification`, `ranking`, `tournament`, `point`, `admin`.

---

## 13. 데일리 미션 기능 구현 범위 (32단계)

**종합: 일부 완료 (~40%)**

| 세부 | 상태 |
|------|------|
| 로비 트리거 버튼 (완료 수 / 미수령 점) | ✅ |
| 바텀시트 UI·진행 바·받기 CTA·클레임 연출 | ✅ |
| 미션 5종 정의 (INITIAL_MISSIONS) | ✅ (하드코딩) |
| 진행도 추적 (연습/관전/리액션/기록/튜토리얼 연동) | ❌ |
| 보상 지급 (스킨·배지·캐릭터 unlock) | ❌ (플래그만) |
| 일일 리셋 (14:00) | ❌ (뱃지 문구만) |
| 영속화 (localStorage/서버) | ❌ |
| 언마운트 후 상태 유지 | ❌ |

파일: `src/components/lobby/DailyMissions.tsx` ← `LobbyPage.tsx`에서 사용.

---

## 14. 미완성 코드와 오류

- TODO/FIXME 주석: **없음** (한글 placeholder로 표현)
- 빈 서비스 메서드 다수
- 루트 `test.js` 0바이트
- `GameResultPage` 고아 페이지
- `GamePlayPage` 타이머 링이 5초 기준으로 하드코딩 → 초보 모드 10/15초와 불일치
- `handleRoundLogic` phase 판정이 타이밍에 의존 (우연히 동작)
- unused import 다수 (`noUnusedLocals` off라 미검출)
- AppleDouble `._*` 파일이 볼륨에 다수 (도구 노이즈)

빌드/타입 검사: **현재 통과** (아래 §검증).

---

## 15. 중복 컴포넌트

| 유형 | 설명 |
|------|------|
| 결과 화면 이중화 | `GamePlayPage` 인라인 GAME_OVER vs `GameResultPage` |
| 규칙 로직 이중화 | `GamePlayPage` vs `SpectatePage` reveal |
| 타입/상수 중복 | `Hand`, HAND_ICONS 등 3곳 이상 |
| BottomSheet 중복 | `Overlays.BottomSheet` 미사용, 페이지마다 재구현 |
| Empty/Loading 이중 정의 | `Feedback.tsx` vs `StateScreens.tsx` (둘 다 미사용) |
| Barrel 혼재 | `UserPages`/`AdminPages`가 re-export + 스텁 혼재 |

파일 단위 완전 복제는 거의 없고, **로직·UI 패턴 중복**이 주된 문제다.

---

## 16. 모바일 반응형 문제

| 문제 | 영향 |
|------|------|
| `pb-safe`, `hide-scrollbar`, `scrollbar-hide` 클래스 **미정의** | 노치/홈 인디케이터 패딩 무효, 스크롤바 노출 |
| `index.html`에 `viewport-fit=cover` 없음 | safe-area env 값 0에 가까움 |
| `h-screen` 사용 (`dvh` 아님) | 모바일 주소창에 잘림 |
| `DealerCharacter` `fixed bottom-[240px]` | 짧은/긴 화면에서 버튼과 충돌 |
| Admin 모바일 네비 없음 | 사이드바 `hidden md:flex`, 햄버거 없음 |
| Lobby `overflow-hidden` vs Layout `overflow-y-auto` | 스크롤 계약 불일치 |

---

## 17. 빌드 오류와 타입 오류

| 검사 | 결과 |
|------|------|
| `npm run lint` (`tsc --noEmit`) | ✅ 오류 0 |
| `npm run build` | ✅ 성공 (~4s) |
| ESLint | 설정 없음 → 미실행 |
| 번들 | JS ~1.2MB / gzip ~316KB 단일 청크 (경고만) |

느슨한 tsconfig 때문에 잠재 타입 이슈가 숨겨져 있을 수 있다 (`any` 캐스트, `NodeJS.Timeout` 등).

---

## 18. 보안상 문제가 될 수 있는 코드

| 위험 | 설명 | 심각도 |
|------|------|--------|
| 관리자 미인증 | `#/admin` 즉시 접근 | 높음 (데모에서도 가드 권장) |
| 클라이언트 인증 위장 | 임의 입력으로 `/lobby` 이동 | 중간 (데모 전제) |
| 클라이언트 포인트·승패 판정 | 서버 권한 없음 — `pointService` 주석과 모순 | 운영 시 치명적 / 현재는 데모 허용 |
| 시크릿 커밋 | 없음 · `.env.example`만 | 양호 |
| `dangerouslySetInnerHTML` / `eval` | 없음 | 양호 |
| CDN Pretendard (SRI 없음) | 렌더 경로 외부 의존 | 낮음 |
| 이용 한도 UI 미저장 | 책임 게임 문구만 | 운영 시 컴플라이언스 갭 |

**실제 결제·출금·환전은 구현되어 있지 않으며, 앞으로도 구현하지 않는 것이 원칙이다.**

---

## 기획 단계별 상태

> 저장소에 단계 문서가 없어 **코드 증거 기준**으로 판정.

### 1~31단계

| 영역 | 판정 | 근거 |
|------|------|------|
| 스플래시 | 완료(UI) | SplashPage |
| 인증 UI | 완료(UI) / 로직 없음 | Login/Signup/Onboarding |
| 로비 | 완료(UI) | LobbyPage |
| 매칭·테이블 | 완료(UI 시뮬) | TableSelect → Waiting |
| 친구 대전 | 완료(UI) | FriendMatchPage |
| 인게임 | 완료(로컬) | GamePlayPage |
| 결과 | **일부** | GameResultPage 미연결 |
| 토너먼트 | 완료(UI) | List + Bracket |
| 관전 | 완료(UI 시뮬) | SpectatePage |
| 랭킹 | **미구현** | RankingPage 스텁 |
| 관리자 | **일부** | 6/10 화면 |
| 튜토리얼 | 완료(UI) | TutorialPage |
| 꾸미기 | **일부** | 2/7 탭 |
| 설정 | 완료(실동작) | GameSettingsPage |
| 알림/고객센터/약관 | **미구현** | 스텁 |
| 백엔드 연동 | **전 단계 미달** | services/WS 미사용 |

요약: 1~31은 **화면 중심 완료**로 보는 것이 타당하나, 스텁·미연결 화면이 있어 “완전 완료”는 과대 평가다.

### 32단계 데일리 미션 — **일부 완료**

- 완료: 시트 UI, 진행 바, 클레임 연출, 로비 진입점  
- 미구현: 진행 추적, 보상 지급, 14:00 리셋, 영속화  

### 33단계 경기 하이라이트 및 공유 카드 — **미구현**

- 하이라이트/카드 생성/Web Share/canvas 코드 없음  
- “공유” 버튼은 장식 수준  

### 34단계 방송 모드 — **미구현**

- broadcast/중계 관련 코드 없음  
- Spectate는 단일 시청자 UI 시뮬만 (audio `spectate` 채널만 선구현)  

### 35단계 연결 복구 — **미구현**

- `websocket.ts`에 `game:reconnect` 문자열만 존재, 사용처 없음  
- 재연결/오프라인/세션 복구 로직 없음  

### 36단계 경기 검증 — **미구현**

- 해시/서명/리플레이 검증 없음  
- 관리자 “무효 처리” 모달·`game:invalid` 타입만 존재  

### 37단계 최종 UI 통합 — **미착수**

- 스텁 다수, 공통 컴포넌트 미사용, safe-area 미정의, 결과 페이지 고아, 코드 스플리팅 없음  

---

## 현재 구현 상태 요약

```
[████████████░░░░░░░░] UI 프로토타입 ~60%
[██░░░░░░░░░░░░░░░░░░] 클라이언트 로직 ~15% (로컬 게임·설정)
[░░░░░░░░░░░░░░░░░░░░] 서버/WS 0%
[████░░░░░░░░░░░░░░░░] 32단계 미션 ~40%
[░░░░░░░░░░░░░░░░░░░░] 33~37단계 0%
```

성격: **고퀄리티 UI 프로토타입**. 운영 가능한 실시간 P2P 게임이 아님.

---

## 완성된 기능 / 미완성 기능

### 완성(또는 데모로 충분)

- 디자인 시스템(`arena-*`), 레이아웃, 주요 화면 플로우  
- 로컬 묵찌빠 플레이·연출·딜러·리액션  
- 설정/오디오 영속화, 캐릭터·손 스킨  
- 관리자 대시보드·유저/게임/포인트/신고/이상 목록 UI  

### 미완성

- 데일리 미션 로직(32)  
- 랭킹·알림·고객센터·약관·빠른대전·재대결 전용 페이지  
- GameResult 연결, 공유/하이라이트(33), 방송(34), 재연결(35), 검증(36), UI 통합(37)  
- 전 services + WebSocket 실체화  
- 관리자 인증·파괴적 액션·페이지네이션  

---

## 문제점

1. 결과 페이지 고아 → 정산/분석 UI 사장  
2. safe-area 유틸 미정의 → 모바일 하단 겹침  
3. 관리자 무방비 접근  
4. 공통 컴포넌트 미사용으로 시트/상태 UI 파편화  
5. 단일 1.2MB 번들 (초기 로딩)  
6. 미션 상태 비영속  
7. 타입 strict 미사용으로 잠재 버그 은닉  

---

## 우선 수정 항목

| 순위 | 항목 | 이유 | 규모 |
|------|------|------|------|
| P0 | `pb-safe` / scrollbar 유틸 + `viewport-fit=cover` | 모바일 실사용 깨짐 | 소 |
| P0 | `GamePlayPage` → `GameResultPage` 네비게이션 | 완성 UI 회수 | 소 |
| P1 | 32단계 미션: localStorage + 진행 이벤트 + 14:00 리셋 | 진행 중이던 단계 완료 | 중 |
| P1 | RankingPage 실화면 | 메뉴·대회 탭에서 빈 화면 | 중 |
| P2 | `/admin` 최소 가드 (데모 비번/플래그) | 실수 노출 방지 | 소 |
| P2 | Overlays/Badges 등 공통 컴포넌트 점진 적용 | 파편화 해소 | 중 |
| P3 | WebSocket + services 실체화 | 35~36 전제 | 대 |
| P3 | 라우트 lazy + 청크 분할 | 성능 | 중 |

**현재 단계에서는 신규 기능·대규모 리팩터를 하지 않는다.** (본 감사 시점 기준 빌드/타입 오류 없음 → 코드 수정 없음)

---

## 단계별 개발 순서 (권장)

1. **모바일 기초 결함** (safe-area, viewport) — 디자인 유지  
2. **결과 플로우 연결** — 인라인 overlay와 Result 통합 (디자인 유지)  
3. **32단계 데일리 미션 완성** — UI 재사용, 로직만 추가  
4. **스텁 화면 우선순위**: Ranking → Notifications → Support/Terms  
5. **꾸미기 나머지 탭** (기존 DecorationPage 확장)  
6. **데모 포인트 레이어 정리** (가상 포인트 유지, 서버 권한 모델 주석/인터페이스만)  
7. **Transport**: websocket 타입에 맞춰 services 구현 + GameSession 컨텍스트  
8. **35 재연결 → 36 검증 → 33 공유카드 → 34 방송**  
9. **37 최종 UI 통합** (공통 컴포넌트 적용, 번들 분할, 스텁 제거)

결제·출금·환전은 순서에 넣지 않는다.

---

## 수정이 필요한 파일 목록

### 단기 (P0~P1)

- `src/index.css` — safe-area / scrollbar 유틸  
- `index.html` — `viewport-fit=cover`  
- `src/pages/game/GamePlayPage.tsx` — Result 라우팅, 타이머 링  
- `src/pages/game/GameResultPage.tsx` — 진입 경로 확보  
- `src/components/lobby/DailyMissions.tsx` — 영속·진행·리셋  
- `src/pages/lobby/LobbyPage.tsx` — 미션 연동 보강  
- `src/pages/UserPages.tsx` — Ranking 등 스텁 대체  
- (신규 가능) `src/utils/missions.ts` 또는 `src/data/missions.ts`

### 중기

- `src/components/layouts/AdminLayout.tsx` — 가드  
- `src/pages/AdminPages.tsx` — 로그인 연결  
- `src/services/*`, `src/types/websocket.ts` — 실체화  
- `src/App.tsx` — lazy routes  
- `src/utils/audio.ts` — BGM oscillator cleanup  

### 장기 (33~37)

- 공유 카드·방송·재연결·검증 모듈 (신규 파일 예상)  
- `SpectatePage.tsx`, `GamePlayPage.tsx` 대규모 연동  

---

## 유지해야 할 디자인과 컴포넌트

삭제·전면 교체 금지:

- `src/index.css`의 `arena-*` 토큰, glass/neon 유틸, Pretendard  
- `components/common/Buttons.tsx`, `Cards.tsx`, `AdvisoryBanner.tsx`  
- `components/game/*` (캐릭터·딜러·리액션·VS)  
- `components/layouts/Layout.tsx` 하단 네비·사이드바 구조  
- `components/lobby/DailyMissions.tsx` 시각 구조  
- `GamePlayPage` / `LobbyPage` / `SpectatePage` 시각 연출  
- 데모 가상 포인트 컨셉 (`demoData`, 화면상 P 표기)  
- HashRouter (그누보드 `page.php`/홈 임베드 호환)

미사용 common 컴포넌트도 **삭제하지 말고** 이후 통합에 재사용할 것.

---

## 삭제하면 안 되는 파일

| 경로 | 이유 |
|------|------|
| `src/App.tsx` | 전체 라우트 맵 |
| `src/index.css` | 디자인 시스템 |
| `src/components/**` | UI 자산 (미사용 포함) |
| `src/pages/**` | 화면 자산 (스텁·고아 포함) |
| `src/utils/audio.ts`, `haptics.ts`, `gameSettings.ts` | 실동작 인프라 |
| `src/data/decorations.ts`, `demoData.ts` | 꾸미기·데모 유저 |
| `src/types/websocket.ts` | 향후 프로토콜 계약 |
| `src/services/**` | 서버 권한 규칙 주석 스펙 |
| `vite.config.ts`, `package.json` | 빌드 설정 |
| 그누보드 `imports/mucjjibba-arena/**` | 배포 산출물 |

---

## 예상되는 기술적 위험

| 위험 | 설명 |
|------|------|
| 로컬 판정 신뢰 | 실시간 대전 시 치팅 가능 — 서버 authoritative 필수 |
| WS 부재 | 재연결·검증·방송은 현재 아키텍처로 불가 |
| 상태 파편화 | useState-only → 미션/게임/관전 동기화 어려움 |
| 번들 크기 | 저사양 모바일 초기 로딩 지연 |
| BGM 리소스 누수 | 장시간 세션 시 AudioContext 부하 |
| 규제/결제 오인 | 포인트 UI가 현금성으로 오해될 여지 — AdvisoryBanner 유지 |
| 관리자 노출 | 데모 URL 공유 시 콘솔 전체 열람 |
| Tailwind v4 커스텀 유틸 | 플러그인 없이 클래스명만 쓰면 조용히 무시됨 |

---

## 검증 로그 (2026-07-25)

```
$ npm run lint    # tsc --noEmit
→ exit 0

$ npm run build
→ ✓ 2721 modules, dist 생성, chunk size warning only
→ exit 0

$ ESLint
→ 프로젝트에 설정 없음 (lint 스크립트 = tsc)

$ npm run dev
→ Vite 개발 서버 기동 확인 (port 3000)
```

**본 감사 시점: 명백한 빌드/타입 오류 없음 → 기능 추가·대규모 리팩터·임의 삭제 없이 문서화만 수행.**

---

## 부록 A — 18개 확인 항목 체크리스트

| # | 항목 | 결과 |
|---|------|------|
| 1 | 프레임워크 | React 19 + Vite 6 + TS + Tailwind v4 + motion + RRD7 |
| 2 | 실행/빌드 | `npm run dev` / `build` / `lint` |
| 3 | 폴더 구조 | §3 |
| 4 | 라우팅 | §4 |
| 5 | 공통 컴포넌트 | §5 |
| 6 | 유저/관리자 | §6 |
| 7 | 정상 기능 | §7 |
| 8 | 미연결 | §8 |
| 9 | 데모 데이터 | §9 |
| 10 | 상태 관리 | useState + localStorage 싱글톤 |
| 11 | 오디오/애니 | Web Audio 합성 + motion |
| 12 | API/WS | 타입·스텁만, 연결 0% |
| 13 | 데일리 미션 | 일부 완료 ~40% |
| 14 | 미완성/오류 | 스텁·고아 페이지·타이머 버그 등 |
| 15 | 중복 | 결과/규칙/시트 패턴 중복 |
| 16 | 모바일 | safe-area 미정의 등 |
| 17 | 빌드/타입 | 통과 |
| 18 | 보안 | 관리자 미인증, 클라 판정 |

## 부록 B — 관련 경로

- 앱 소스: `/Volumes/onoff/cursor/customer/mucjjibba/build/묵찌빠-아레나`
- 배포 import: `plugin/onoff-builder-bridge/imports/mucjjibba-arena/`
- 홈 설정: `_site.config.php` → `home_builder_bridge_id`
