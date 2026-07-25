import type { MissionRewardType } from '@/types/mission';

const STORAGE_KEY = 'arena_mission_rewards_v1';

export interface RewardTrial {
  rewardType: MissionRewardType;
  rewardValue: string;
  claimedAt: string;
  expiresAt: string | null;
  requestId: string;
  missionId: string;
}

export interface RewardInventoryState {
  exp: number;
  badgeProgress: number;
  trials: RewardTrial[];
  claimLog: string[];
}

const defaultState = (): RewardInventoryState => ({
  exp: 0,
  badgeProgress: 0,
  trials: [],
  claimLog: [],
});

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function load(): RewardInventoryState {
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function save(state: RewardInventoryState) {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function trialExpiry(rewardValue: string, claimedAt: Date): string | null {
  if (rewardValue.includes('_1d') || rewardValue.includes('1d')) {
    const exp = new Date(claimedAt.getTime());
    exp.setDate(exp.getDate() + 1);
    return exp.toISOString();
  }
  return null;
}

/** 비현금성 보상만 적용. 포인트/현금 경로 없음. */
export function applyMissionReward(opts: {
  missionId: string;
  rewardType: MissionRewardType;
  rewardValue: string;
  requestId: string;
  now?: Date;
}): RewardInventoryState {
  const now = opts.now ?? new Date();
  const state = load();

  if (state.claimLog.includes(opts.requestId)) {
    return state;
  }

  state.claimLog.push(opts.requestId);

  if (opts.rewardType === 'exp') {
    const amount = opts.rewardValue === 'exp_30' ? 30 : 50;
    state.exp += amount;
  } else if (opts.rewardType === 'badge') {
    state.badgeProgress += 10;
  } else {
    state.trials.push({
      rewardType: opts.rewardType,
      rewardValue: opts.rewardValue,
      claimedAt: now.toISOString(),
      expiresAt: trialExpiry(opts.rewardValue, now),
      requestId: opts.requestId,
      missionId: opts.missionId,
    });
  }

  save(state);
  return state;
}

export function getRewardInventory(): RewardInventoryState {
  return load();
}

export function clearRewardInventory() {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasActiveTrial(rewardValue: string, now: Date = new Date()): boolean {
  const state = load();
  return state.trials.some((t) => {
    if (t.rewardValue !== rewardValue) return false;
    if (!t.expiresAt) return true;
    return new Date(t.expiresAt).getTime() > now.getTime();
  });
}
