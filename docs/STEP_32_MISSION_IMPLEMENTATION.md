# STEP 32 — 데일리 미션과 비현금성 보상 구현

| 항목 | 내용 |
|------|------|
| 대상 | `build/묵찌빠-아레나` |
| 기준 문서 | `docs/PROJECT_AUDIT.md` |
| 완료일 | 2026-07-25 |
| 검증 | `npm run test:missions` ✅ · `npm run lint` ✅ · `npm run build` ✅ |

---

## 목적

데일리 미션은 **포인트 베팅 반복 유도가 아니라**, 초보자가 게임·서비스 기능을 자연스럽게 체험하도록 구성한다.  
보상은 **비현금성**만 허용한다 (경험치, 배지 진행, 이모티콘/손스킨/입장연출/캐릭터/테이블 체험권).

---

## 구현한 기능

### 미션 목록 (10)

1. 무료 연습 1회 완료 — `PRACTICE_COMPLETED`
2. AI 데모 경기 1회 관전 — `AI_DEMO_WATCHED`
3. 경기 3분 관전 — `SPECTATE_DURATION_UPDATED` (180초 누적)
4. 묵·찌·빠 각각 1회 사용 — `ROCK/SCISSORS/PAPER_SELECTED` (유니크 집계)
5. 초보자 가이드 완료 — `TUTORIAL_COMPLETED`
6. 리액션 1회 보내기 — `REACTION_SENT`
7. 경기 기록 1회 확인 — `MATCH_HISTORY_VIEWED`
8. 친구 대전방 1회 만들기 — `FRIEND_ROOM_CREATED`
9. 토너먼트 경기 1회 관전 — `TOURNAMENT_WATCHED`
10. 게임 설정 1회 확인 — `SETTINGS_VIEWED`

### 아키텍처

| 계층 | 역할 |
|------|------|
| `Mission` 타입 | id, title, description, icon, category, target, progress, completed, claimed, rewardType, rewardValue, startedAt, expiresAt |
| `DemoMissionService` | localStorage 샘플 데이터, 일자 경계 14:00 |
| `ApiMissionService` | REST 인터페이스 (`/missions/daily` 등), base 없으면 Demo 폴백 |
| `MissionEventHandler` / `trackMission()` | 이벤트 중앙 처리 (페이지는 emit만) |
| `rewardInventory` | 비현금 보상 적용 (requestId 중복 방지) |
| `DailyMissions` UI | 기존 디자인 유지 — 로비 `완료/전체`, 모바일 바텀시트 / PC 우측 패널, 설명 펼침 |

### 처리 규칙

- 미완료 시 보상 불가 (`NOT_COMPLETED`)
- 동일 미션·동일 requestId 중복 수령 차단 (`ALREADY_CLAIMED`)
- 수령 시 고유 `requestId` (`createRequestId`)
- 로컬 14:00 기준으로 dayId 변경 시 새 미션 세트 로드
- `VITE_MISSION_MODE=demo|api` 로 서비스 선택

---

## 변경한 파일

### 신규

| 파일 |
|------|
| `src/types/mission.ts` |
| `src/missions/day.ts` |
| `src/missions/catalog.ts` |
| `src/missions/rewardInventory.ts` |
| `src/missions/missionIcons.tsx` |
| `src/services/mission/DemoMissionService.ts` |
| `src/services/mission/ApiMissionService.ts` |
| `src/services/mission/MissionEventHandler.ts` |
| `src/services/mission/index.ts` |
| `src/services/mission/missionService.test.ts` |
| `src/hooks/useDailyMissions.ts` |

### 수정

| 파일 | 변경 |
|------|------|
| `src/components/lobby/DailyMissions.tsx` | 서비스 연동, PC 패널, 설명 펼침 (시각 구조 유지) |
| `src/main.tsx` | missionEventHandler 서비스 연결 |
| `src/pages/game/GamePlayPage.tsx` | 연습 완료·손 선택·리액션 `trackMission` |
| `src/pages/spectate/SpectatePage.tsx` | AI/토너먼트 관전, 1초 누적 |
| `src/pages/lobby/LobbyPage.tsx` | 관전 시 `gameType` state 전달 |
| `src/pages/tutorial/TutorialPage.tsx` | 가이드 완료 이벤트 |
| `src/pages/match/FriendMatchPage.tsx` | 방 만들기 이벤트 |
| `src/pages/user/MatchHistoryPage.tsx` | 기록 조회 이벤트 |
| `src/pages/user/GameSettingsPage.tsx` | 설정 조회 이벤트 |
| `.env.example` | `VITE_MISSION_MODE`, `VITE_MISSION_API_BASE` |
| `package.json` | `test:missions` 스크립트 |

---

## 테스트 결과

```bash
cd build/묵찌빠-아레나
npm run test:missions
```

| 케이스 | 결과 |
|--------|------|
| 미션 진행도 증가 | ✅ |
| 목표 달성 | ✅ |
| 보상 수령 | ✅ |
| 중복 보상 차단 | ✅ |
| 날짜 변경 (14:00 경계) | ✅ |
| 여러 선택 이벤트 집계 (묵·찌·빠) | ✅ |
| 관전 시간 누적 (180초) | ✅ |
| 데모/API 모드 전환 | ✅ |

추가: `npm run lint` (tsc) ✅ · `npm run build` ✅

---

## 향후 API 연결 방법

1. 백엔드에 아래 엔드포인트 구현 (권장)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/missions/daily` | 오늘 미션 목록 (`Mission[]`) |
| GET | `/missions/daily/summary` | 진행 요약 |
| POST | `/missions/daily/events` | `{ type, payload, at }` → 갱신된 `Mission[]` |
| POST | `/missions/daily/:id/claim` | `{ requestId }` → `ClaimResult` |
| POST | `/missions/daily/reset` | (옵션) 일자 리셋 |

2. 환경 변수

```env
VITE_MISSION_MODE=api
VITE_MISSION_API_BASE=https://your-api.example.com
```

3. 서버 측 필수

- 보상 지급·requestId 멱등 처리는 **서버가 authoritative**
- 게임 포인트/현금/환전 가능 재화는 미션 보상으로 절대 지급하지 않음
- `DemoMissionService`는 클라이언트 데모 전용으로 유지

4. 폴백

- `ApiMissionService`는 base URL이 비어 있으면 Demo로 폴백한다.  
  운영에서는 base를 반드시 설정하고, 필요 시 `allowFallback=false`로 생성하도록 팩토리를 조정한다.

---

## 수동 확인 가이드

1. `#/lobby` → 오늘의 미션 `0/10` 표시
2. `#/settings` 진입 → `게임 설정 1회 확인` 완료
3. `#/history` 진입 → `경기 기록` 완료
4. 로비 AI DEMO 카드 관전 → AI 데모 미션 완료, 체류 시 3분 관전 진행
5. `#/tutorial` 마지막까지 다음 → 가이드 완료
6. `#/game/beginner-ai` 한 판 종료 → 무료 연습 완료
7. 미션 시트에서 **받기** → 체크 표시, 재클릭 시 중복 차단

---

## 유지·금지 사항

- 기존 `DailyMissions` 시각 언어(시안 진행바, 받기 버튼, 파티클) 유지
- 미션 UI를 새로 복제하지 않음
- 미션 보상으로 참가 포인트·현금·환전 포인트 추가 금지
