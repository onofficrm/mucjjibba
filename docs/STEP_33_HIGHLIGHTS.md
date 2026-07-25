# STEP 33 — 경기 하이라이트와 공유 카드

| 항목 | 내용 |
|------|------|
| 완료일 | 2026-07-25 |
| 검증 | `npm run test:step33` ✅ · `npm run lint` ✅ · `npm run build` ✅ |

## 구현 요약

- `GameLog` / `RoundLog` 타입과 세션 로그 빌더로 실제 라운드 기록 수집
- `analyzeHighlights(log)` — **로그가 있을 때만** 하이라이트 생성
- 공유 카드 UI + 개인정보 옵션 + 링크 복사 (외부 공유 API 없음)
- 게임 종료 시 `#/game/:id/result`로 이동하며 `gameLog` 전달

## 하이라이트 종류

마지막 1초 선택 · 2대0 완승 · 역전승 · 공격권 3회+ 탈환 · 최고 연승 갱신 · 토너먼트 결승 승리 · 빠른 평균 선택 · 긴 경기 · 빠른 경기

## 주요 파일

- `src/types/gameLog.ts`
- `src/game/highlights.ts`, `GameSessionLogBuilder.ts`, `sampleGameLog.ts`, `shareCard.ts`
- `src/components/share/ShareCard.tsx`, `ShareCardModal.tsx`
- `src/pages/game/GamePlayPage.tsx`, `GameResultPage.tsx`

## 테스트

`npm run test:step33` — 로그 없을 때 빈 배열, 샘플 로그 하이라이트 판정, 역전/탈환 판정
