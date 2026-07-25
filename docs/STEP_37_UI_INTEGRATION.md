# STEP 37 — 전체 UI 통합

| 항목 | 내용 |
|------|------|
| 완료일 | 2026-07-25 |
| 검증 | `npm run test:steps` ✅ · lint ✅ · build ✅ |

## 로비 기본 노출

- 대표 경기(FEATURED) · 가로 미리보기 레일
- 나도 게임하기 · 초보자 연습
- 오늘의 미션 (`DailyMissions`)
- 보유 포인트 · 현재 등급 (`DEMO_USER`)
- LIVE / AI DEMO / REPLAY / TOURNAMENT 뱃지 구분 유지

## 게임 중 기본 노출

- 양쪽 플레이어 · 스코어 · 공격권 · 타이머 · 묵찌빠 · SFX · 리액션
- 연결 상태 뱃지 + 복구 오버레이 (35)
- INFO에 보조 기능(도움말·끊김 시뮬레이션)

## 결과 화면 기본 노출

- 승패 · 최종 스코어 · 포인트 변화(데모) · 연승 · 하이라이트(33)
- 핵심 버튼 ≤3: 재대결 / 새 상대 (또는 실전·로비) + 하단 공유·더보기·로비

## 펼침(더보기) 메뉴

정산 내역 · 경기 분석 · 경기 검증 · 신고 · 공유 설정 · 기술적 연결 정보

## 공통 원칙 준수

- 슬롯머신/기존 UX 유지
- `reduceAnimations` / `performanceMode` 저사양 지원
- 결제·출금·환전 미구현
- LIVE 판정은 서버 authoritative 전제 (데모는 `demo_session`/`mock` 로그)

## 관련 문서

- `docs/STEP_33_HIGHLIGHTS.md`
- `docs/STEP_34_BROADCAST.md` → `#/broadcast/game/:gameId`
- `docs/STEP_35_RECONNECTION.md`
- `docs/STEP_36_VERIFICATION.md`
- `docs/STEP_32_MISSION_IMPLEMENTATION.md`
