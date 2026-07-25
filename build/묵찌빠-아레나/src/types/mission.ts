/** 비현금성 보상만 허용 (참가 포인트·현금·환전 포인트 제외) */
export type MissionRewardType =
  | 'exp'
  | 'badge'
  | 'emoticon'
  | 'hand_skin'
  | 'intro'
  | 'character'
  | 'table';

export type MissionCategory =
  | 'practice'
  | 'spectate'
  | 'gameplay'
  | 'guide'
  | 'social'
  | 'settings';

export type MissionIconKey =
  | 'target'
  | 'eye'
  | 'clock'
  | 'hands'
  | 'book'
  | 'message'
  | 'file'
  | 'users'
  | 'trophy'
  | 'settings';

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: MissionIconKey;
  category: MissionCategory;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardType: MissionRewardType;
  rewardValue: string;
  startedAt: string;
  expiresAt: string;
}

export type MissionEventType =
  | 'PRACTICE_COMPLETED'
  | 'AI_DEMO_WATCHED'
  | 'SPECTATE_DURATION_UPDATED'
  | 'ROCK_SELECTED'
  | 'SCISSORS_SELECTED'
  | 'PAPER_SELECTED'
  | 'TUTORIAL_COMPLETED'
  | 'REACTION_SENT'
  | 'MATCH_HISTORY_VIEWED'
  | 'FRIEND_ROOM_CREATED'
  | 'TOURNAMENT_WATCHED'
  | 'SETTINGS_VIEWED';

export interface MissionEventPayload {
  /** SPECTATE_DURATION_UPDATED: 추가 초 */
  seconds?: number;
  /** 관전 종류 힌트 */
  spectateKind?: 'ai_demo' | 'tournament' | 'live' | 'arena' | 'replay' | 'unknown';
  [key: string]: unknown;
}

export interface MissionEvent {
  type: MissionEventType;
  payload?: MissionEventPayload;
  at?: string;
}

export interface ClaimResult {
  ok: boolean;
  requestId: string;
  mission?: Mission;
  error?: 'NOT_COMPLETED' | 'ALREADY_CLAIMED' | 'NOT_FOUND' | 'EXPIRED' | 'NETWORK' | 'UNKNOWN';
  message?: string;
}

export interface MissionProgressSummary {
  completedCount: number;
  totalCount: number;
  claimableCount: number;
  dayId: string;
  expiresAt: string;
}

export interface MissionService {
  getMissions(): Promise<Mission[]>;
  getSummary(): Promise<MissionProgressSummary>;
  handleEvent(event: MissionEvent): Promise<Mission[]>;
  claimReward(missionId: string, requestId: string): Promise<ClaimResult>;
  /** 테스트·날짜 변경용 */
  resetForDay?(dayId?: string): Promise<void>;
  /** 테스트용 현재 시각 주입 */
  setNow?(iso: string | null): void;
}
