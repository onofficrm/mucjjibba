import { VICTORY_CLASH_MS } from '@/game/rpsMatchup';

/**
 * 전투 연출 템포
 * - calm: 기본 — 여유 있게 읽고 반응할 수 있는 호흡
 * - urgent: 매치포인트·한판승부·시간 압박 등 — 빠르게 전개
 */

export type CombatPace = 'calm' | 'urgent';

const CALM = {
  lockHoldMs: 320,
  tensionMs: 700,
  revealSpinMs: 1250,
  snapMs: 200,
  clashHoldMs: VICTORY_CLASH_MS + 220,
  replayDelayMs: 260,
  resultReadMs: 2100,
  beginnerResultReadMs: 2900,
  cameraPunchMs: 480,
  /** 라운드 시작 / VS 이후 첫 선택까지 */
  roundStartMs: 2000,
  /** 게임 종료 → 결과 화면 */
  toResultMs: 2000,
} as const;

const URGENT = {
  lockHoldMs: 180,
  tensionMs: 320,
  revealSpinMs: 720,
  snapMs: 140,
  clashHoldMs: VICTORY_CLASH_MS + 80,
  replayDelayMs: 140,
  resultReadMs: 1100,
  beginnerResultReadMs: 1600,
  cameraPunchMs: 320,
  roundStartMs: 900,
  toResultMs: 1200,
} as const;

/** 하위 호환 — 기본(calm) 값 */
export const COMBAT_TIMING = {
  ...CALM,
  urgent: URGENT,
} as const;

export type RevealSchedule = {
  pace: CombatPace;
  tensionMs: number;
  snapAtMs: number;
  replayAtMs: number;
  logicAtMs: number;
  snapClearMs: number;
};

export function resolveCombatPace(opts: {
  isMatchPoint?: boolean;
  isSuddenDeath?: boolean;
  timeLeft?: number;
  forceUrgent?: boolean;
}): CombatPace {
  if (opts.forceUrgent) return 'urgent';
  if (opts.isSuddenDeath) return 'urgent';
  if (opts.isMatchPoint) return 'urgent';
  if (typeof opts.timeLeft === 'number' && opts.timeLeft > 0 && opts.timeLeft <= 2) {
    return 'urgent';
  }
  return 'calm';
}

function pack(pace: CombatPace) {
  return pace === 'urgent' ? URGENT : CALM;
}

export function getRevealSchedule(
  isBeginner: boolean,
  pace: CombatPace = 'calm',
): RevealSchedule {
  const t = pack(pace);
  const spin = isBeginner && pace === 'calm' ? t.revealSpinMs + 250 : t.revealSpinMs;
  const snapAtMs = t.tensionMs + spin;
  return {
    pace,
    tensionMs: t.tensionMs,
    snapAtMs,
    replayAtMs: snapAtMs + t.replayDelayMs,
    logicAtMs: snapAtMs + t.clashHoldMs,
    snapClearMs: snapAtMs + t.snapMs,
  };
}

export function getResultReadMs(
  isBeginner: boolean,
  hasMatchupClash = false,
  pace: CombatPace = 'calm',
): number {
  const t = pack(pace);
  const base = isBeginner ? t.beginnerResultReadMs : t.resultReadMs;
  const clashExtra = pace === 'urgent' ? 200 : hasMatchupClash ? 500 : 0;
  return base + clashExtra;
}

/** 선택 제한 시간(초) — 여유롭게, 긴박 시에만 짧게 */
export function getPickTimeLimit(isBeginner: boolean, pace: CombatPace = 'calm'): number {
  if (pace === 'urgent') return isBeginner ? 8 : 5;
  return isBeginner ? 12 : 8;
}

/** 첫 라운드(INIT) 타이머 */
export function getOpeningPickLimit(isBeginner: boolean): number {
  return isBeginner ? 16 : 9;
}

export function getRoundStartDelayMs(pace: CombatPace = 'calm'): number {
  return pack(pace).roundStartMs;
}

export function getToResultDelayMs(pace: CombatPace = 'calm'): number {
  return pack(pace).toResultMs;
}

/** 상대 AI 생각 시간 — 평소 여유, 긴박 시 즉시감 */
export function getOpponentThinkMs(pace: CombatPace = 'calm'): number {
  if (pace === 'urgent') return 180 + Math.random() * 420;
  return 750 + Math.random() * 1200;
}
