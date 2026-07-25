/** 시즌 패스(데모) — 주간 XP / 티어, localStorage */

const STORAGE_KEY = 'arena_season_pass_v1';
const EVENT = 'arena-season-pass';

export interface SeasonPassState {
  /** ISO week key e.g. 2026-W30 */
  weekId: string;
  xp: number;
  claimedTiers: number[];
}

const TIER_THRESHOLDS = [0, 50, 120, 220, 350, 500];
const TIER_LABELS = ['브론즈', '실버', '골드', '플래티넘', '다이아', '마스터'];

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function getWeekId(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function defaultState(weekId = getWeekId()): SeasonPassState {
  return { weekId, xp: 0, claimedTiers: [0] };
}

export function loadSeasonPass(): SeasonPassState {
  const weekId = getWeekId();
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (!raw) return defaultState(weekId);
    const parsed = JSON.parse(raw) as SeasonPassState;
    if (parsed.weekId !== weekId) return defaultState(weekId);
    return {
      weekId,
      xp: Math.max(0, Number(parsed.xp) || 0),
      claimedTiers: Array.isArray(parsed.claimedTiers) ? parsed.claimedTiers : [0],
    };
  } catch {
    return defaultState(weekId);
  }
}

function save(state: SeasonPassState) {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
  }
}

export function addSeasonXp(amount: number): SeasonPassState {
  const state = loadSeasonPass();
  if (amount > 0) {
    state.xp += amount;
    save(state);
  }
  return state;
}

export function getSeasonTier(xp = loadSeasonPass().xp): {
  tierIndex: number;
  label: string;
  xp: number;
  nextAt: number | null;
  progressPct: number;
} {
  let tierIndex = 0;
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= TIER_THRESHOLDS[i]) {
      tierIndex = i;
      break;
    }
  }
  const cur = TIER_THRESHOLDS[tierIndex];
  const next = TIER_THRESHOLDS[tierIndex + 1] ?? null;
  const progressPct =
    next == null ? 100 : Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100));
  return {
    tierIndex,
    label: TIER_LABELS[tierIndex] ?? '브론즈',
    xp,
    nextAt: next,
    progressPct,
  };
}

export const SEASON_PASS_EVENT = EVENT;
export const SEASON_TIER_LABELS = TIER_LABELS;
