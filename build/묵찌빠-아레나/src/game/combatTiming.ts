import { VICTORY_CLASH_MS } from '@/game/rpsMatchup';

/**
 * 전투 연출 템포
 * - calm / urgent: 상황별 (매치포인트 등)
 * - TempoPreset: 사용자 설정 (편안하게 / 기본 / 빠르게)
 */

export type CombatPace = 'calm' | 'urgent';
export type TempoPreset = 'comfortable' | 'default' | 'fast';

export const TEMPO_PRESET_META: Record<
  TempoPreset,
  { label: string; description: string }
> = {
  comfortable: {
    label: '편안하게',
    description: '선택·연출을 여유 있게',
  },
  default: {
    label: '기본',
    description: '균형 잡힌 기본 템포',
  },
  fast: {
    label: '빠르게',
    description: '선택·공개를 짧게',
  },
};

export const TEMPO_PRESET_IDS: TempoPreset[] = ['comfortable', 'default', 'fast'];

/** 전체 화면·페이즈 전환을 살짝 느리게 (선택 제한 시간은 별도) */
const GLOBAL_TEMPO = 1.12;

const CALM = {
  lockHoldMs: 360,
  tensionMs: 800,
  revealSpinMs: 1400,
  snapMs: 220,
  clashHoldMs: VICTORY_CLASH_MS + 280,
  replayDelayMs: 300,
  resultReadMs: 2400,
  beginnerResultReadMs: 3200,
  cameraPunchMs: 540,
  roundStartMs: 2300,
  toResultMs: 2400,
} as const;

const URGENT = {
  lockHoldMs: 200,
  tensionMs: 360,
  revealSpinMs: 800,
  snapMs: 160,
  clashHoldMs: VICTORY_CLASH_MS + 120,
  replayDelayMs: 160,
  resultReadMs: 1300,
  beginnerResultReadMs: 1800,
  cameraPunchMs: 360,
  roundStartMs: 1050,
  toResultMs: 1400,
} as const;

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

export function tempoScale(tempo: TempoPreset = 'default'): number {
  if (tempo === 'comfortable') return 1.28;
  if (tempo === 'fast') return 0.72;
  return 1;
}

function scaleMs(ms: number, scale: number): number {
  return Math.max(80, Math.round(ms * scale));
}

export function resolveCombatPace(opts: {
  isMatchPoint?: boolean;
  isSuddenDeath?: boolean;
  timeLeft?: number;
  forceUrgent?: boolean;
  /** 빠른 템포에서는 평소도 약간 긴박하게 */
  tempo?: TempoPreset;
}): CombatPace {
  if (opts.forceUrgent) return 'urgent';
  if (opts.isSuddenDeath) return 'urgent';
  if (opts.isMatchPoint) return 'urgent';
  if (typeof opts.timeLeft === 'number' && opts.timeLeft > 0 && opts.timeLeft <= 2) {
    return 'urgent';
  }
  return 'calm';
}

function pack(pace: CombatPace, tempo: TempoPreset = 'default') {
  const base = pace === 'urgent' ? URGENT : CALM;
  // urgent는 템포 영향을 약하게 (결정적 순간 리듬 유지)
  const preset = pace === 'urgent' ? 0.5 + tempoScale(tempo) * 0.5 : tempoScale(tempo);
  const scale = preset * GLOBAL_TEMPO;
  return {
    lockHoldMs: scaleMs(base.lockHoldMs, scale),
    tensionMs: scaleMs(base.tensionMs, scale),
    revealSpinMs: scaleMs(base.revealSpinMs, scale),
    snapMs: scaleMs(base.snapMs, scale),
    clashHoldMs: scaleMs(base.clashHoldMs, scale),
    replayDelayMs: scaleMs(base.replayDelayMs, scale),
    resultReadMs: scaleMs(base.resultReadMs, scale),
    beginnerResultReadMs: scaleMs(base.beginnerResultReadMs, scale),
    cameraPunchMs: scaleMs(base.cameraPunchMs, scale),
    roundStartMs: scaleMs(base.roundStartMs, scale),
    toResultMs: scaleMs(base.toResultMs, scale),
  };
}

export function getRevealSchedule(
  isBeginner: boolean,
  pace: CombatPace = 'calm',
  tempo: TempoPreset = 'default',
): RevealSchedule {
  const t = pack(pace, tempo);
  const spin =
    isBeginner && pace === 'calm' ? t.revealSpinMs + scaleMs(250, tempoScale(tempo)) : t.revealSpinMs;
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
  tempo: TempoPreset = 'default',
): number {
  const t = pack(pace, tempo);
  const base = isBeginner ? t.beginnerResultReadMs : t.resultReadMs;
  const clashExtra = pace === 'urgent' ? 200 : hasMatchupClash ? 500 : 0;
  return base + scaleMs(clashExtra, tempoScale(tempo));
}

export function getPickTimeLimit(
  isBeginner: boolean,
  pace: CombatPace = 'calm',
  tempo: TempoPreset = 'default',
): number {
  let base: number;
  if (pace === 'urgent') base = isBeginner ? 8 : 5;
  else base = isBeginner ? 12 : 8;

  if (tempo === 'comfortable') base += 2;
  else if (tempo === 'fast') base = Math.max(4, base - 2);
  return base;
}

export function getOpeningPickLimit(
  isBeginner: boolean,
  tempo: TempoPreset = 'default',
): number {
  let base = isBeginner ? 16 : 9;
  if (tempo === 'comfortable') base += 2;
  else if (tempo === 'fast') base = Math.max(6, base - 2);
  return base;
}

export function getRoundStartDelayMs(
  pace: CombatPace = 'calm',
  tempo: TempoPreset = 'default',
): number {
  return pack(pace, tempo).roundStartMs;
}

export function getToResultDelayMs(
  pace: CombatPace = 'calm',
  tempo: TempoPreset = 'default',
): number {
  return pack(pace, tempo).toResultMs;
}

export function getOpponentThinkMs(
  pace: CombatPace = 'calm',
  tempo: TempoPreset = 'default',
): number {
  const scale = tempoScale(tempo) * GLOBAL_TEMPO;
  if (pace === 'urgent') return scaleMs(180, scale) + Math.random() * scaleMs(400, scale);
  return scaleMs(850, scale) + Math.random() * scaleMs(1350, scale);
}
