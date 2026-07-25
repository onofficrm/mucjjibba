import { buildFreshMissions, getMissionDayId } from '@/missions/catalog';
import { getMissionExpiresAt } from '@/missions/day';
import { applyMissionReward } from '@/missions/rewardInventory';
import type {
  ClaimResult,
  Mission,
  MissionEvent,
  MissionProgressSummary,
  MissionService,
} from '@/types/mission';

const STORAGE_KEY = 'arena_daily_missions_v1';

interface PersistedState {
  dayId: string;
  missions: Mission[];
  usedRequestIds: string[];
  handsUsed: Array<'ROCK' | 'SCISSORS' | 'PAPER'>;
  spectateSeconds: number;
}

export class DemoMissionService implements MissionService {
  private memory: PersistedState | null = null;
  private nowOverride: Date | null = null;
  private storage: Storage | null;

  constructor(storage?: Storage | null) {
    this.storage = storage === undefined
      ? (typeof localStorage !== 'undefined' ? localStorage : null)
      : storage;
  }

  setNow(iso: string | null) {
    this.nowOverride = iso ? new Date(iso) : null;
  }

  private now(): Date {
    return this.nowOverride ? new Date(this.nowOverride.getTime()) : new Date();
  }

  private load(): PersistedState {
    const dayId = getMissionDayId(this.now());
    if (this.memory && this.memory.dayId === dayId) {
      return this.memory;
    }

    let parsed: PersistedState | null = null;
    if (this.storage) {
      try {
        const raw = this.storage.getItem(STORAGE_KEY);
        if (raw) parsed = JSON.parse(raw) as PersistedState;
      } catch {
        parsed = null;
      }
    }

    if (!parsed || parsed.dayId !== dayId) {
      parsed = this.createDayState(dayId);
      this.persist(parsed);
    }

    this.memory = parsed;
    return parsed;
  }

  private createDayState(dayId: string): PersistedState {
    const missions = buildFreshMissions(this.now());
    return {
      dayId,
      missions,
      usedRequestIds: [],
      handsUsed: [],
      spectateSeconds: 0,
    };
  }

  private persist(state: PersistedState) {
    this.memory = state;
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }

  private cloneMissions(state: PersistedState): Mission[] {
    return state.missions.map((m) => ({ ...m }));
  }

  async getMissions(): Promise<Mission[]> {
    return this.cloneMissions(this.load());
  }

  async getSummary(): Promise<MissionProgressSummary> {
    const state = this.load();
    const completedCount = state.missions.filter((m) => m.completed).length;
    const claimableCount = state.missions.filter((m) => m.completed && !m.claimed).length;
    return {
      completedCount,
      totalCount: state.missions.length,
      claimableCount,
      dayId: state.dayId,
      expiresAt: state.missions[0]?.expiresAt ?? getMissionExpiresAt(this.now()),
    };
  }

  async resetForDay(dayId?: string): Promise<void> {
    const id = dayId ?? getMissionDayId(this.now());
    const state = this.createDayState(id);
    state.dayId = id;
    this.persist(state);
  }

  private bump(mission: Mission, amount: number) {
    if (mission.claimed) return;
    mission.progress = Math.min(mission.target, mission.progress + amount);
    if (mission.progress >= mission.target) {
      mission.completed = true;
      mission.progress = mission.target;
    }
  }

  private setProgress(mission: Mission, value: number) {
    if (mission.claimed) return;
    mission.progress = Math.min(mission.target, Math.max(mission.progress, value));
    if (mission.progress >= mission.target) {
      mission.completed = true;
      mission.progress = mission.target;
    }
  }

  async handleEvent(event: MissionEvent): Promise<Mission[]> {
    const state = this.load();
    const byId = (id: string) => state.missions.find((m) => m.id === id);
    const bumpId = (id: string, amount: number) => {
      const m = byId(id);
      if (m) this.bump(m, amount);
    };

    switch (event.type) {
      case 'PRACTICE_COMPLETED':
        bumpId('practice_once', 1);
        break;
      case 'AI_DEMO_WATCHED':
        bumpId('ai_demo_watch', 1);
        break;
      case 'TOURNAMENT_WATCHED':
        bumpId('tournament_watch', 1);
        break;
      case 'TUTORIAL_COMPLETED':
        bumpId('tutorial_complete', 1);
        break;
      case 'REACTION_SENT':
        bumpId('reaction_once', 1);
        break;
      case 'MATCH_HISTORY_VIEWED':
        bumpId('history_view', 1);
        break;
      case 'FRIEND_ROOM_CREATED':
        bumpId('friend_room', 1);
        break;
      case 'SETTINGS_VIEWED':
        bumpId('settings_view', 1);
        break;
      case 'SPECTATE_DURATION_UPDATED': {
        const add = Math.max(0, Number(event.payload?.seconds ?? 0));
        state.spectateSeconds += add;
        const m = byId('spectate_3min');
        if (m) this.setProgress(m, state.spectateSeconds);
        break;
      }
      case 'ROCK_SELECTED':
      case 'SCISSORS_SELECTED':
      case 'PAPER_SELECTED': {
        const hand =
          event.type === 'ROCK_SELECTED'
            ? 'ROCK'
            : event.type === 'SCISSORS_SELECTED'
              ? 'SCISSORS'
              : 'PAPER';
        if (!state.handsUsed.includes(hand)) {
          state.handsUsed.push(hand);
        }
        const handsMission = byId('hands_each_once');
        if (handsMission) this.setProgress(handsMission, state.handsUsed.length);
        break;
      }
      default:
        break;
    }

    this.persist(state);
    return this.cloneMissions(state);
  }

  async claimReward(missionId: string, requestId: string): Promise<ClaimResult> {
    const state = this.load();

    if (state.usedRequestIds.includes(requestId)) {
      return {
        ok: false,
        requestId,
        error: 'ALREADY_CLAIMED',
        message: '이미 처리된 요청입니다.',
      };
    }

    const mission = state.missions.find((m) => m.id === missionId);
    if (!mission) {
      return { ok: false, requestId, error: 'NOT_FOUND', message: '미션을 찾을 수 없습니다.' };
    }

    if (new Date(mission.expiresAt).getTime() <= this.now().getTime()) {
      return { ok: false, requestId, error: 'EXPIRED', message: '미션이 만료되었습니다.' };
    }

    if (!mission.completed) {
      return { ok: false, requestId, error: 'NOT_COMPLETED', message: '아직 완료되지 않았습니다.' };
    }

    if (mission.claimed) {
      return { ok: false, requestId, error: 'ALREADY_CLAIMED', message: '이미 보상을 받았습니다.' };
    }

    mission.claimed = true;
    state.usedRequestIds.push(requestId);
    this.persist(state);

    applyMissionReward({
      missionId,
      rewardType: mission.rewardType,
      rewardValue: mission.rewardValue,
      requestId,
      now: this.now(),
    });

    return { ok: true, requestId, mission: { ...mission } };
  }
}
