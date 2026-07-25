export type Hand = 'ROCK' | 'SCISSORS' | 'PAPER';
export type PlayerSide = 'ME' | 'OPPONENT';
export type GameModeTag = 'LIVE' | 'AI_DEMO' | 'REPLAY' | 'PRACTICE' | 'TOURNAMENT' | 'ARENA' | 'FRIEND';

export interface RoundLog {
  round: number;
  myHand: Hand;
  opponentHand: Hand;
  attackerBefore: PlayerSide | null;
  attackerAfter: PlayerSide | null;
  result: 'POINT_ME' | 'POINT_OPPONENT' | 'ATTACK_CHANGE' | 'DRAW_RPS' | 'ATTACK_GAIN';
  /** 선택 시점 남은 타이머(초) */
  timeLeftOnSelect: number;
  /** 라운드 타이머 제한(초) */
  timerLimit: number;
  selectDurationMs: number;
  selectedAt: string;
  lockedAt: string;
  revealedAt: string;
  serverReceivedAt?: string;
}

export interface GameLog {
  gameId: string;
  mode: GameModeTag;
  startedAt: string;
  endedAt: string;
  myScore: number;
  opponentScore: number;
  winner: PlayerSide | null;
  rounds: RoundLog[];
  /** 공격권 탈환 횟수 (상대→나) */
  attackSteals: number;
  isTournamentFinal?: boolean;
  previousBestStreak?: number;
  currentStreakAfter?: number;
  me: {
    nickname: string;
    grade: string;
    avatar: string;
    characterId: string;
  };
  opponent: {
    nickname: string;
    grade: string;
    avatar: string;
  };
  /** 데모/목 로그 여부 — 서버 authoritative 아님을 표시 */
  source: 'server' | 'demo_session' | 'mock';
}

export type HighlightType =
  | 'LAST_SECOND_SELECT'
  | 'SWEEP_2_0'
  | 'COMEBACK'
  | 'ATTACK_STEAL_3'
  | 'STREAK_RECORD'
  | 'TOURNAMENT_FINAL_WIN'
  | 'FAST_AVG_SELECT'
  | 'LONG_MATCH'
  | 'QUICK_MATCH';

export interface Highlight {
  type: HighlightType;
  title: string;
  description: string;
  priority: number;
}

export interface SharePrivacyOptions {
  maskOpponentNickname: boolean;
  hidePoints: boolean;
  hideProfileImage: boolean;
}

export interface ShareCardData {
  logoText: string;
  characterEmoji: string;
  myScore: number;
  opponentScore: number;
  highlightText: string;
  highlightDetail?: string;
  grade: string;
  streak: number;
  playedAt: string;
  myNickname: string;
  opponentNickname: string;
  pointsDeltaLabel?: string;
  tableName?: string;
  modeLabel?: string;
  resultLabel?: string;
  showPoints: boolean;
  showProfileImage: boolean;
}

export interface ShareSettlementExtras {
  tableName?: string;
  pointsDelta?: number;
  isWin?: boolean;
  isFree?: boolean;
}
