# STEP 34 — 방송 모드

| 항목 | 내용 |
|------|------|
| 완료일 | 2026-07-25 |
| 경로 | `#/broadcast/game/:gameId?ratio=16x9\|9x16` |
| 검증 | `npm run test:step34` ✅ · lint ✅ · build ✅ |

## 구현 요약

- 읽기 전용 `BroadcastPage` (레이아웃/조작 UI 없음)
- `BroadcastGamePublicDTO` — 이메일·회원ID·IP·기기·포인트거래·관리자 정보 제외
- 16:9 / 9:16 전환
- LIVE / AI_DEMO / REPLAY 등 모드 뱃지 표시

## 주요 파일

- `src/types/broadcast.ts`
- `src/game/broadcastDto.ts`
- `src/pages/broadcast/BroadcastPage.tsx`
- `src/App.tsx` 라우트 추가
