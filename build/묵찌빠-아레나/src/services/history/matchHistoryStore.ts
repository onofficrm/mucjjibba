import type { GameLog } from '@/types/gameLog';
import { createSampleGameLog } from '@/game/sampleGameLog';

const STORAGE_KEY = 'arena_match_history_v1';
const MAX_ENTRIES = 40;

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function seedLogs(): GameLog[] {
  return [
    createSampleGameLog({
      gameId: 'hist-sweep-1',
      mode: 'LIVE',
      source: 'mock',
      myScore: 2,
      opponentScore: 0,
      winner: 'ME',
      opponent: { nickname: 'GHOST***', grade: '골드', avatar: '👻' },
      endedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    }),
    createSampleGameLog({
      gameId: 'hist-loss-2',
      mode: 'LIVE',
      source: 'mock',
      myScore: 0,
      opponentScore: 2,
      winner: 'OPPONENT',
      opponent: { nickname: 'TIGER_88', grade: '실버', avatar: '🐯' },
      endedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
      rounds: [
        {
          round: 1,
          myHand: 'PAPER',
          opponentHand: 'ROCK',
          attackerBefore: null,
          attackerAfter: 'OPPONENT',
          result: 'ATTACK_GAIN',
          timeLeftOnSelect: 2,
          timerLimit: 5,
          selectDurationMs: 2100,
          selectedAt: new Date().toISOString(),
          lockedAt: new Date().toISOString(),
          revealedAt: new Date().toISOString(),
        },
        {
          round: 2,
          myHand: 'ROCK',
          opponentHand: 'ROCK',
          attackerBefore: 'OPPONENT',
          attackerAfter: 'OPPONENT',
          result: 'POINT_OPPONENT',
          timeLeftOnSelect: 1,
          timerLimit: 5,
          selectDurationMs: 1800,
          selectedAt: new Date().toISOString(),
          lockedAt: new Date().toISOString(),
          revealedAt: new Date().toISOString(),
        },
        {
          round: 3,
          myHand: 'SCISSORS',
          opponentHand: 'SCISSORS',
          attackerBefore: 'OPPONENT',
          attackerAfter: 'OPPONENT',
          result: 'POINT_OPPONENT',
          timeLeftOnSelect: 2,
          timerLimit: 5,
          selectDurationMs: 1200,
          selectedAt: new Date().toISOString(),
          lockedAt: new Date().toISOString(),
          revealedAt: new Date().toISOString(),
        },
      ],
    }),
    createSampleGameLog({
      gameId: 'hist-friend-3',
      mode: 'FRIEND',
      source: 'mock',
      myScore: 2,
      opponentScore: 1,
      winner: 'ME',
      opponent: { nickname: 'SHADOW', grade: '골드', avatar: '🌑' },
      endedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    }),
  ];
}

export function listMatchHistory(): GameLog[] {
  const raw = storage()?.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedLogs();
    storage()?.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as GameLog[];
    return Array.isArray(parsed) ? parsed : seedLogs();
  } catch {
    return seedLogs();
  }
}

export function getMatchLog(gameId: string): GameLog | null {
  return listMatchHistory().find((g) => g.gameId === gameId) ?? null;
}

export function saveMatchLog(log: GameLog): void {
  const list = listMatchHistory().filter((g) => g.gameId !== log.gameId);
  list.unshift(log);
  storage()?.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}

export function relativeTimeLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

export function tableLabelForMode(mode: GameLog['mode']): string {
  switch (mode) {
    case 'FRIEND':
      return '친구 대전';
    case 'PRACTICE':
      return '연습';
    case 'TOURNAMENT':
      return '토너먼트';
    case 'ARENA':
      return '아레나';
    case 'REPLAY':
      return '리플레이';
    default:
      return '일반 테이블';
  }
}
