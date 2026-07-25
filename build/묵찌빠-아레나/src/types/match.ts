/** 빠른 대전 테이블 · 매칭 세션 타입 */

export interface MatchTable {
  id: string;
  name: string;
  entryPoint: number;
  totalPoint: number;
  fee: number;
  winnerPoint: number;
  minGrade: string;
  isFree: boolean;
  color: string;
}

export interface MatchOpponent {
  nickname: string;
  grade: string;
  winRate: string;
  currentStreak: number;
  maxStreak: number;
  avatar: string;
}

export type MatchQueueStatus =
  | 'idle'
  | 'queued'
  | 'searching'
  | 'found'
  | 'depositing'
  | 'ready'
  | 'cancelled'
  | 'failed';

export interface MatchSession {
  gameId: string;
  table: MatchTable;
  opponent: MatchOpponent | null;
  status: MatchQueueStatus;
  stepIndex: number;
  deposited: boolean;
  settled: boolean;
  pointsBeforeDeposit: number;
  createdAt: string;
}

export const MATCH_TABLES: MatchTable[] = [
  {
    id: 'practice',
    name: '연습 게임',
    entryPoint: 0,
    totalPoint: 0,
    fee: 0,
    winnerPoint: 0,
    minGrade: '입문',
    isFree: true,
    color: 'border-white text-white',
  },
  {
    id: 'bronze',
    name: '브론즈 테이블',
    entryPoint: 1000,
    totalPoint: 2000,
    fee: 100,
    winnerPoint: 1900,
    minGrade: '브론즈',
    isFree: false,
    color: 'border-orange-400 text-orange-400 bg-orange-400/10',
  },
  {
    id: 'silver',
    name: '실버 테이블',
    entryPoint: 5000,
    totalPoint: 10000,
    fee: 500,
    winnerPoint: 9500,
    minGrade: '실버',
    isFree: false,
    color: 'border-slate-300 text-slate-300 bg-slate-300/10',
  },
  {
    id: 'gold',
    name: '골드 테이블',
    entryPoint: 10000,
    totalPoint: 20000,
    fee: 1000,
    winnerPoint: 19000,
    minGrade: '골드',
    isFree: false,
    color: 'border-yellow-400 text-yellow-400 bg-yellow-400/10',
  },
  {
    id: 'platinum',
    name: '플래티넘 테이블',
    entryPoint: 50000,
    totalPoint: 100000,
    fee: 5000,
    winnerPoint: 95000,
    minGrade: '플래티넘',
    isFree: false,
    color: 'border-cyan-400 text-cyan-400 bg-cyan-400/10',
  },
  {
    id: 'vip',
    name: 'VIP 테이블',
    entryPoint: 100000,
    totalPoint: 200000,
    fee: 10000,
    winnerPoint: 190000,
    minGrade: '다이아',
    isFree: false,
    color: 'border-purple-500 text-purple-400 bg-purple-500/10',
  },
];

const GRADE_RANK: Record<string, number> = {
  입문: 0,
  브론즈: 1,
  실버: 2,
  골드: 3,
  플래티넘: 4,
  다이아: 5,
  마스터: 6,
  챔피언: 7,
};

export function gradeRank(grade: string): number {
  return GRADE_RANK[grade] ?? 0;
}

export function canEnterTable(points: number, userGrade: string, table: MatchTable): {
  ok: boolean;
  reason: string | null;
} {
  if (!table.isFree && points < table.entryPoint) {
    return {
      ok: false,
      reason: `포인트가 부족합니다 (필요 ${table.entryPoint.toLocaleString()} P)`,
    };
  }
  if (gradeRank(userGrade) < gradeRank(table.minGrade)) {
    return {
      ok: false,
      reason: `${table.minGrade} 등급 이상만 입장할 수 있습니다`,
    };
  }
  return { ok: true, reason: null };
}

export const DEMO_OPPONENTS: MatchOpponent[] = [
  { nickname: 'GHOST***', grade: '골드', winRate: '68%', currentStreak: 3, maxStreak: 12, avatar: '👻' },
  { nickname: 'SPEEDY', grade: '실버', winRate: '55%', currentStreak: 1, maxStreak: 7, avatar: '⚡' },
  { nickname: 'FOX_K', grade: '골드', winRate: '61%', currentStreak: 2, maxStreak: 9, avatar: '🦊' },
  { nickname: 'BEAR87', grade: '브론즈', winRate: '48%', currentStreak: 0, maxStreak: 4, avatar: '🐻' },
  { nickname: 'NIGHT_OWL', grade: '플래티넘', winRate: '72%', currentStreak: 5, maxStreak: 15, avatar: '🦉' },
  { nickname: 'LUCKY7', grade: '골드', winRate: '59%', currentStreak: 0, maxStreak: 6, avatar: '🎰' },
];
