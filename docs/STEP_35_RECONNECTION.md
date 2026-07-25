# STEP 35 — 연결 복구

| 항목 | 내용 |
|------|------|
| 완료일 | 2026-07-25 |
| 검증 | `npm run test:step35` ✅ · lint ✅ · build ✅ |

## 흐름

1. 기존 게임 화면 유지  
2. `ReconnectOverlay` 표시  
3. Mock 자동 재접속  
4. `requestSnapshot()`  
5~9. phase·점수·공격권·선택·타이머 복구  
10. `resumed` → `connected`

## 어댑터

| 클래스 | 용도 |
|--------|------|
| `MockGameSocketAdapter` | 서버 없을 때 전체 흐름 검증 |
| `RealGameSocketAdapter` | `VITE_GAME_WS_URL` WebSocket 스켈레톤 |
| `createGameSocketAdapter()` | `VITE_GAME_SOCKET_MODE=mock\|real` |

## UI

- 게임 중 `ConnectionBadge`
- INFO 메뉴: 연결 끊김 시뮬레이션
- 복구 중에도 슬롯머신 화면 유지

## 파일

- `src/realtime/*`
- `src/components/game/ReconnectOverlay.tsx`
- `src/pages/game/GamePlayPage.tsx`
