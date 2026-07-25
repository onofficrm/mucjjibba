# STEP 36 — 경기 검증

| 항목 | 내용 |
|------|------|
| 완료일 | 2026-07-25 |
| 검증 | `npm run test:step36` ✅ · lint ✅ · build ✅ |

## 구현 요약

- `buildPublicVerification(gameLog)` — 일반 사용자용 검증 뷰
- 결과 화면 **더보기 → 경기 검증**에 표시
- 포함: 게임 ID, 시작/종료, 라운드별 선택·접수·잠금·공개 시각, 공격권, 결과, 예치/지급 상태, 거래번호(서버일 때만), 검증 상태
- 제외: 내부 보안 로그, IP, 기기, 관리자 세션

## 검증 상태

| status | 의미 |
|--------|------|
| `VERIFIED` | `source === 'server'` |
| `DEMO_ONLY` | 데모/목 세션 |
| `PENDING` | 기타 |

## 파일

- `src/game/verification.ts`
- `src/pages/game/GameResultPage.tsx` (더보기 메뉴)
