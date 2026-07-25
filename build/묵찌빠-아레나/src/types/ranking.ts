export type LeagueGrade = '브론즈' | '실버' | '골드' | '플래티넘' | '다이아' | '마스터';

export interface WeeklyLeagueMeta {
  weekId: string;
  label: string;
  startsAt: string;
  endsAt: string;
  /** 데모 가상 포인트 — 결제/출금/환전 없음 */
  rewardNote: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  grade: LeagueGrade | string;
  avatar: string;
  weeklyPoints: number;
  wins: number;
  losses: number;
  streak: number;
  isMe?: boolean;
}

export interface MyWeeklyStanding {
  entry: LeaderboardEntry;
  deltaRank: number;
  weekPointsEarned: number;
}

export interface WeeklyLeaderboard {
  meta: WeeklyLeagueMeta;
  entries: LeaderboardEntry[];
  me: MyWeeklyStanding;
}
