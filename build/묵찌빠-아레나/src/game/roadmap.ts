import type { GameLog, Hand, PlayerSide, RoundLog } from '@/types/gameLog';
import { listMatchHistory } from '@/services/history/matchHistoryStore';

export type BeadResult = 'WIN' | 'LOSE';

export interface BeadCell {
  result: BeadResult;
  /** 매치 단위 로드일 때 게임 id */
  gameId?: string;
}

export interface RoadColumn {
  result: BeadResult;
  count: number;
}

export type AttackHolder = 'ME' | 'OPPONENT' | 'NONE';

export interface AttackRoadCell {
  holder: AttackHolder;
  /** 이 라운드에서 공격권이 바뀌었는지 */
  changed: boolean;
}

export interface HandWinStats {
  hand: Hand;
  played: number;
  wins: number;
  winRate: number;
}

export interface TendencyMetrics {
  /** 공격권 보유 시 득점 전환율 (0–100) */
  attackConvertPct: number;
  /** 공격권 보유 라운드 수 */
  attackRounds: number;
  /** 공격권 보유 중 득점 */
  attackPoints: number;
  /** 탈환 성공 횟수 */
  steals: number;
  handWins: HandWinStats[];
  signatureHand: Hand | null;
  signatureWinRate: number;
  matchWins: number;
  matchLosses: number;
  matchWinRate: number;
}

const HANDS: Hand[] = ['ROCK', 'SCISSORS', 'PAPER'];

/** 라운드 단위 득점 비드 (POINT만) */
export function beadsFromRounds(rounds: RoundLog[]): BeadCell[] {
  const out: BeadCell[] = [];
  for (const r of rounds) {
    if (r.result === 'POINT_ME') out.push({ result: 'WIN' });
    else if (r.result === 'POINT_OPPONENT') out.push({ result: 'LOSE' });
  }
  return out;
}

/** 매치 승패 비드 (최근 경기 흐름) */
export function beadsFromMatches(logs: GameLog[], limit = 36): BeadCell[] {
  const beads: BeadCell[] = [];
  for (const g of logs) {
    if (g.winner === 'ME') beads.push({ result: 'WIN', gameId: g.gameId });
    else if (g.winner === 'OPPONENT') beads.push({ result: 'LOSE', gameId: g.gameId });
    if (beads.length >= limit) break;
  }
  return beads;
}

/** 바카라 대로: 같은 결과가 이어지면 세로 스택, 바뀌면 새 열 */
export function buildBigRoad(beads: BeadCell[]): RoadColumn[] {
  const cols: RoadColumn[] = [];
  for (const b of beads) {
    const last = cols[cols.length - 1];
    if (last && last.result === b.result) last.count += 1;
    else cols.push({ result: b.result, count: 1 });
  }
  return cols;
}

/** 6행 구슬판 그리드 (열 우선 채움) */
export function buildBeadGrid(beads: BeadCell[], rows = 6): (BeadCell | null)[][] {
  const cols = Math.max(1, Math.ceil(beads.length / rows) || 1);
  const grid: (BeadCell | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null),
  );
  beads.forEach((b, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    if (grid[row]) grid[row][col] = b;
  });
  return grid;
}

/** 공격권 로드 — 라운드별 공격권 보유자 */
export function buildAttackRoad(rounds: RoundLog[]): AttackRoadCell[] {
  return rounds.map((r) => {
    const holder: AttackHolder =
      r.attackerAfter === 'ME'
        ? 'ME'
        : r.attackerAfter === 'OPPONENT'
          ? 'OPPONENT'
          : 'NONE';
    const before = r.attackerBefore;
    const after = r.attackerAfter;
    const changed =
      r.result === 'ATTACK_CHANGE' ||
      r.result === 'ATTACK_GAIN' ||
      (before != null && after != null && before !== after);
    return { holder, changed };
  });
}

function emptyHandWins(): HandWinStats[] {
  return HANDS.map((hand) => ({ hand, played: 0, wins: 0, winRate: 0 }));
}

/** 손별 승률 + 공격권 전환율 */
export function computeTendencyMetrics(logs: GameLog[]): TendencyMetrics {
  const byHand = emptyHandWins();
  let attackRounds = 0;
  let attackPoints = 0;
  let steals = 0;
  let matchWins = 0;
  let matchLosses = 0;

  for (const g of logs) {
    if (g.winner === 'ME') matchWins += 1;
    else if (g.winner === 'OPPONENT') matchLosses += 1;
    steals += g.attackSteals ?? 0;

    for (const r of g.rounds) {
      const idx = HANDS.indexOf(r.myHand);
      if (idx >= 0) {
        byHand[idx].played += 1;
        // 득점 라운드에서 내가 낸 손 = "이긴 손"
        if (r.result === 'POINT_ME') byHand[idx].wins += 1;
      }

      const wasAttacker: PlayerSide | null =
        r.attackerBefore ?? (r.result === 'ATTACK_GAIN' ? null : r.attackerAfter);
      // 공격권 보유 중(시작 시점) 라운드
      if (r.attackerBefore === 'ME') {
        attackRounds += 1;
        if (r.result === 'POINT_ME') attackPoints += 1;
      } else if (r.attackerBefore == null && r.result === 'POINT_ME' && r.attackerAfter === 'ME') {
        // edge: rare
        attackRounds += 1;
        attackPoints += 1;
      }
      void wasAttacker;
    }
  }

  for (const h of byHand) {
    h.winRate = h.played > 0 ? Math.round((h.wins / h.played) * 100) : 0;
  }

  let signatureHand: Hand | null = null;
  let signatureWinRate = 0;
  for (const h of byHand) {
    if (h.played >= 2 && h.winRate >= signatureWinRate) {
      signatureHand = h.hand;
      signatureWinRate = h.winRate;
    }
  }

  const matchTotal = matchWins + matchLosses;
  return {
    attackConvertPct: attackRounds > 0 ? Math.round((attackPoints / attackRounds) * 100) : 0,
    attackRounds,
    attackPoints,
    steals,
    handWins: byHand,
    signatureHand,
    signatureWinRate,
    matchWins,
    matchLosses,
    matchWinRate: matchTotal > 0 ? Math.round((matchWins / matchTotal) * 100) : 0,
  };
}

export function analyzeMyRoadmap(logs?: GameLog[]) {
  const history = logs ?? listMatchHistory();
  const matchBeads = beadsFromMatches(history, 48);
  return {
    matchBeads,
    matchGrid: buildBeadGrid(matchBeads, 6),
    matchBigRoad: buildBigRoad(matchBeads),
    tendency: computeTendencyMetrics(history),
  };
}

export function analyzeMatchRoadmap(log: GameLog) {
  const beads = beadsFromRounds(log.rounds);
  return {
    beads,
    grid: buildBeadGrid(beads, 6),
    bigRoad: buildBigRoad(beads),
    attackRoad: buildAttackRoad(log.rounds),
    tendency: computeTendencyMetrics([log]),
  };
}
