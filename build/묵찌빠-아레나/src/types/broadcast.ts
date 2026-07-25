/** 방송용 공개 DTO — 민감정보 제외 */
export interface BroadcastPlayerPublic {
  displayName: string;
  grade: string;
  avatarEmoji: string;
  score: number;
  winStreak: number;
}

export interface BroadcastGamePublicDTO {
  gameId: string;
  mode: 'LIVE' | 'AI_DEMO' | 'REPLAY' | 'TOURNAMENT' | 'ARENA' | 'PRACTICE';
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  player1: BroadcastPlayerPublic;
  player2: BroadcastPlayerPublic;
  attacker: 'P1' | 'P2' | null;
  lastReveal: {
    p1Hand: 'ROCK' | 'SCISSORS' | 'PAPER' | null;
    p2Hand: 'ROCK' | 'SCISSORS' | 'PAPER' | null;
    message: string;
  };
  spectatorCount: number;
  nextChallengerName: string | null;
  tournament: {
    active: boolean;
    roundLabel: string | null;
    statusLabel: string | null;
  };
  updatedAt: string;
}
