import { VICTORY_CLASH_MS } from '@/game/rpsMatchup';

/** 전투 연출 시간 토큰 — 선택→잠금→긴장→공개→판정→다음 */

export const COMBAT_TIMING = {
  /** 손 잠금 연출 */
  lockHoldMs: 220,
  /** 공개 직전 긴장(슬로모) */
  tensionMs: 400,
  /** 손이 흔들리며 대기하는 공개 전 스핀 */
  revealSpinMs: 900,
  /** 스냅 플래시 */
  snapMs: 160,
  /** 충돌 후 판정까지 홀드 — 전체화면 승부 영상(VICTORY_CLASH_MS)이 끝난 뒤 판정 */
  clashHoldMs: VICTORY_CLASH_MS + 120,
  /** 미니 리플레이 / 승부 연출 지연(스냅 후) */
  replayDelayMs: 180,
  /** 판정 문구 읽는 시간 */
  resultReadMs: 1400,
  beginnerResultReadMs: 2400,
  /** 카메라 줌 펀치 */
  cameraPunchMs: 420,
} as const;

export type RevealSchedule = {
  tensionMs: number;
  snapAtMs: number;
  replayAtMs: number;
  logicAtMs: number;
  snapClearMs: number;
};

export function getRevealSchedule(isBeginner: boolean): RevealSchedule {
  const t = COMBAT_TIMING;
  const spin = isBeginner ? t.revealSpinMs + 200 : t.revealSpinMs;
  const snapAtMs = t.tensionMs + spin;
  return {
    tensionMs: t.tensionMs,
    snapAtMs,
    replayAtMs: snapAtMs + t.replayDelayMs,
    logicAtMs: snapAtMs + t.clashHoldMs,
    snapClearMs: snapAtMs + t.snapMs,
  };
}

export function getResultReadMs(isBeginner: boolean, hasMatchupClash = false): number {
  const base = isBeginner ? COMBAT_TIMING.beginnerResultReadMs : COMBAT_TIMING.resultReadMs;
  return hasMatchupClash ? base + 400 : base;
}
