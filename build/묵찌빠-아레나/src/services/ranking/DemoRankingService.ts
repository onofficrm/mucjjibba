import { DEMO_USER } from '@/data/demoData';
import type { LeaderboardEntry, WeeklyLeaderboard } from '@/types/ranking';
import { getWeekId, getWeekRange, gradeFromWeeklyPoints } from './weekId';

const STORAGE_KEY = 'arena_weekly_league_v1';

interface StoredWeek {
  weekId: string;
  myPoints: number;
  wins: number;
  losses: number;
  streak: number;
  previousRank: number;
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function loadStored(): StoredWeek {
  const weekId = getWeekId();
  const raw = storage()?.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredWeek;
      if (parsed.weekId === weekId) return parsed;
    } catch {
      /* reset */
    }
  }
  const fresh: StoredWeek = {
    weekId,
    myPoints: 1240,
    wins: 8,
    losses: 4,
    streak: DEMO_USER.streak,
    previousRank: 18,
  };
  storage()?.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveStored(data: StoredWeek) {
  storage()?.setItem(STORAGE_KEY, JSON.stringify(data));
}

function buildNpcBoard(my: StoredWeek): LeaderboardEntry[] {
  const others: Omit<LeaderboardEntry, 'rank'>[] = [
    { userId: 'u1', nickname: 'BLUECAT', grade: '마스터', avatar: '🐱', weeklyPoints: 9120, wins: 42, losses: 8, streak: 7 },
    { userId: 'u2', nickname: 'RICHARD', grade: '다이아', avatar: '🦁', weeklyPoints: 7840, wins: 35, losses: 11, streak: 4 },
    { userId: 'u3', nickname: 'NIGHTOWL', grade: '다이아', avatar: '🦉', weeklyPoints: 6510, wins: 29, losses: 14, streak: 2 },
    { userId: 'u4', nickname: 'GHOST99', grade: '플래티넘', avatar: '👻', weeklyPoints: 4320, wins: 22, losses: 16, streak: 5 },
    { userId: 'u5', nickname: 'TIGER_88', grade: '플래티넘', avatar: '🐯', weeklyPoints: 3980, wins: 20, losses: 12, streak: 1 },
    { userId: 'u6', nickname: 'SHADOW', grade: '골드', avatar: '🌑', weeklyPoints: 2710, wins: 16, losses: 10, streak: 3 },
    { userId: 'u7', nickname: 'PIXEL', grade: '골드', avatar: '👾', weeklyPoints: 2100, wins: 14, losses: 9, streak: 0 },
    { userId: 'u8', nickname: 'KOALA', grade: '실버', avatar: '🐨', weeklyPoints: 980, wins: 9, losses: 11, streak: 0 },
    { userId: 'u9', nickname: 'MINTY', grade: '실버', avatar: '🐸', weeklyPoints: 720, wins: 7, losses: 8, streak: 2 },
    { userId: 'u10', nickname: 'ZERO', grade: '브론즈', avatar: '🎲', weeklyPoints: 310, wins: 3, losses: 6, streak: 0 },
  ];

  const meEntry: Omit<LeaderboardEntry, 'rank'> = {
    userId: 'me',
    nickname: DEMO_USER.nickname,
    grade: gradeFromWeeklyPoints(my.myPoints),
    avatar: DEMO_USER.avatar,
    weeklyPoints: my.myPoints,
    wins: my.wins,
    losses: my.losses,
    streak: my.streak,
    isMe: true,
  };

  const merged = [...others, meEntry].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  return merged.map((e, i) => ({ ...e, rank: i + 1 }));
}

export class DemoRankingService {
  async getLeaderboard(): Promise<WeeklyLeaderboard> {
    const stored = loadStored();
    const range = getWeekRange();
    const entries = buildNpcBoard(stored);
    const me = entries.find((e) => e.isMe)!;
    const deltaRank = stored.previousRank - me.rank;

    return {
      meta: {
        weekId: stored.weekId,
        label: range.label,
        startsAt: range.startsAt,
        endsAt: range.endsAt,
        rewardNote: '데모 가상 포인트 · 결제/출금/환전 없음',
      },
      entries,
      me: {
        entry: me,
        deltaRank,
        weekPointsEarned: stored.myPoints,
      },
    };
  }

  /** 경기 결과 반영 (데모 주간 점수) */
  recordMatchResult(won: boolean, pointsDelta = 100): void {
    const stored = loadStored();
    const board = buildNpcBoard(stored);
    const prevRank = board.find((e) => e.isMe)?.rank ?? stored.previousRank;
    stored.previousRank = prevRank;

    if (won) {
      stored.myPoints += Math.max(40, pointsDelta);
      stored.wins += 1;
      stored.streak += 1;
    } else {
      stored.myPoints = Math.max(0, stored.myPoints + Math.min(-20, -Math.floor(pointsDelta / 4)));
      stored.losses += 1;
      stored.streak = 0;
    }
    saveStored(stored);
  }
}
