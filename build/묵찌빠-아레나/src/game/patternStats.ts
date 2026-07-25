import type { GameLog, Hand, RoundLog } from '@/types/gameLog';
import { listMatchHistory } from '@/services/history/matchHistoryStore';

export type HandCounts = Record<Hand, number>;

export interface PatternHints {
  sampleRounds: number;
  handRatio: HandCounts;
  handRatioPct: Record<Hand, number>;
  firstHandBias: Hand | null;
  whenAttacking: HandCounts;
  whenDefending: HandCounts;
  repeatRate: number;
  avgSelectMs: number;
  topHints: string[];
  playTypeName: string;
  playTypeDescription: string;
  strengths: string[];
  weaknesses: string[];
  tip: string;
}

const EMPTY: HandCounts = { ROCK: 0, SCISSORS: 0, PAPER: 0 };
const HAND_KO: Record<Hand, string> = { ROCK: '묵', SCISSORS: '찌', PAPER: '빠' };

function emptyCounts(): HandCounts {
  return { ...EMPTY };
}

function dominant(counts: HandCounts): { hand: Hand | null; pct: number } {
  const total = counts.ROCK + counts.SCISSORS + counts.PAPER;
  if (total === 0) return { hand: null, pct: 0 };
  let best: Hand = 'ROCK';
  let max = -1;
  (['ROCK', 'SCISSORS', 'PAPER'] as Hand[]).forEach((h) => {
    if (counts[h] > max) {
      max = counts[h];
      best = h;
    }
  });
  return { hand: best, pct: Math.round((max / total) * 100) };
}

function toPct(counts: HandCounts): Record<Hand, number> {
  const total = counts.ROCK + counts.SCISSORS + counts.PAPER;
  if (total === 0) return { ROCK: 0, SCISSORS: 0, PAPER: 0 };
  return {
    ROCK: Math.round((counts.ROCK / total) * 100),
    SCISSORS: Math.round((counts.SCISSORS / total) * 100),
    PAPER: Math.round((counts.PAPER / total) * 100),
  };
}

function collectRounds(
  logs: GameLog[],
  side: 'me' | 'opponent',
  opponentNickname?: string,
): RoundLog[] {
  const filtered = opponentNickname
    ? logs.filter((g) => g.opponent.nickname === opponentNickname)
    : logs;
  return filtered.flatMap((g) => g.rounds);
}

function handOf(r: RoundLog, side: 'me' | 'opponent'): Hand {
  return side === 'me' ? r.myHand : r.opponentHand;
}

export function analyzeHandPatterns(
  logs: GameLog[],
  opts: { side?: 'me' | 'opponent'; opponentNickname?: string } = {},
): PatternHints {
  const side = opts.side ?? 'me';
  const rounds = collectRounds(logs, side, opts.opponentNickname);
  const handRatio = emptyCounts();
  const whenAttacking = emptyCounts();
  const whenDefending = emptyCounts();
  let firstHandBias: Hand | null = null;
  let repeats = 0;
  let selectSum = 0;
  let selectN = 0;
  let prev: Hand | null = null;

  for (const r of rounds) {
    const h = handOf(r, side);
    handRatio[h] += 1;
    if (r.selectDurationMs > 0) {
      selectSum += r.selectDurationMs;
      selectN += 1;
    }
    if (prev && prev === h) repeats += 1;
    prev = h;

    const isAttacker =
      side === 'me' ? r.attackerBefore === 'ME' || r.attackerAfter === 'ME' : r.attackerBefore === 'OPPONENT';
    if (r.attackerBefore === null && !firstHandBias) {
      firstHandBias = h;
    }
    if (isAttacker) whenAttacking[h] += 1;
    else whenDefending[h] += 1;
  }

  const sampleRounds = rounds.length;
  const handRatioPct = toPct(handRatio);
  const overall = dominant(handRatio);
  const atk = dominant(whenAttacking);
  const def = dominant(whenDefending);
  const repeatRate = sampleRounds > 1 ? repeats / (sampleRounds - 1) : 0;
  const avgSelectMs = selectN > 0 ? Math.round(selectSum / selectN) : 0;

  const topHints: string[] = [];
  if (overall.hand && overall.pct >= 40) {
    topHints.push(
      side === 'opponent'
        ? `상대는 ${HAND_KO[overall.hand]} 비중 ${overall.pct}%`
        : `나는 ${HAND_KO[overall.hand]}를 ${overall.pct}% 사용`,
    );
  }
  if (atk.hand && atk.pct >= 45) {
    topHints.push(
      side === 'opponent'
        ? `공격 시 ${HAND_KO[atk.hand]} ${atk.pct}%`
        : `공격권일 때 ${HAND_KO[atk.hand]} ${atk.pct}%`,
    );
  }
  if (def.hand && def.pct >= 45) {
    topHints.push(
      side === 'opponent'
        ? `수비 시 ${HAND_KO[def.hand]} ${def.pct}%`
        : `수비일 때 ${HAND_KO[def.hand]} ${def.pct}%`,
    );
  }
  if (repeatRate >= 0.25) {
    topHints.push(`같은 손 반복 ${Math.round(repeatRate * 100)}%`);
  }
  if (avgSelectMs > 0 && avgSelectMs < 1500) {
    topHints.push(`평균 선택 ${(avgSelectMs / 1000).toFixed(1)}초 · 빠른 편`);
  }
  if (topHints.length === 0) {
    topHints.push(sampleRounds === 0 ? '데이터 부족 · 경기를 더 플레이하세요' : '균형형 패턴');
  }

  const rockHeavy = handRatioPct.ROCK >= 40;
  const scissorsHeavy = handRatioPct.SCISSORS >= 40;
  const paperHeavy = handRatioPct.PAPER >= 40;
  const fast = avgSelectMs > 0 && avgSelectMs < 1600;
  const variable = overall.pct < 40;

  let playTypeName = '균형형';
  let playTypeDescription =
    '특정 손에 치우치지 않고 상황에 맞게 선택하는 안정적인 플레이 성향입니다.';
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let tip = '공격권·수비 상황에서 손 비율을 의식하면 승률이 올라갑니다.';

  if (variable && !rockHeavy && !scissorsHeavy && !paperHeavy) {
    playTypeName = '역심리형';
    playTypeDescription =
      '상대의 예상을 깨는 변칙적인 플레이를 선호합니다. 패턴이 잘 읽히지 않습니다.';
    strengths.push('패턴이 잘 읽히지 않음', '상황 전환에 강함');
    weaknesses.push('초반 실점 가능', '안정성 다소 부족');
    tip = '첫 라운드만 안정적으로 가져가면 승률이 더 좋아집니다.';
  } else if (rockHeavy) {
    playTypeName = '정면돌파형';
    playTypeDescription = '묵을 중심으로 공격권을 정면으로 밀어붙이는 성향입니다.';
    strengths.push('공격권 유지력', '직관적 선택');
    weaknesses.push('묵 편중이 읽히기 쉬움');
    tip = '수비 상황에서 찌·빠 비율을 조금 높이면 좋습니다.';
  } else if (scissorsHeavy) {
    playTypeName = '카운터형';
    playTypeDescription = '찌로 상대 공격을 끊는 카운터 플레이를 선호합니다.';
    strengths.push('카운터 타이밍', '빠른 판단');
    weaknesses.push('찌 편중 시 빠에 취약');
    tip = '공격권일 때는 묵·빠 비중을 올려보세요.';
  } else if (paperHeavy) {
    playTypeName = '압박형';
    playTypeDescription = '빠로 상대를 압박하며 흐름을 가져가는 성향입니다.';
    strengths.push('공격 전환력', '흐름 장악');
    weaknesses.push('빠 편중이 보이면 카운터 당함');
    tip = '반복 빠 후에는 묵으로 리듬을 바꿔보세요.';
  }
  if (fast) {
    strengths.push('빠른 선택 속도');
  }

  return {
    sampleRounds,
    handRatio,
    handRatioPct,
    firstHandBias,
    whenAttacking,
    whenDefending,
    repeatRate,
    avgSelectMs,
    topHints: topHints.slice(0, 4),
    playTypeName,
    playTypeDescription,
    strengths: strengths.length ? strengths : ['데이터 축적 중'],
    weaknesses: weaknesses.length ? weaknesses : ['더 많은 경기 필요'],
    tip,
  };
}

export function analyzeMyPatterns(logs?: GameLog[]): PatternHints {
  return analyzeHandPatterns(logs ?? listMatchHistory(), { side: 'me' });
}

export function analyzeOpponentPatterns(
  opponentNickname: string,
  logs?: GameLog[],
  sessionRounds?: RoundLog[],
): PatternHints {
  const base = logs ?? listMatchHistory();
  const withSession: GameLog[] =
    sessionRounds && sessionRounds.length > 0
      ? [
          ...base,
          {
            gameId: 'session-live',
            mode: 'LIVE',
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            myScore: 0,
            opponentScore: 0,
            winner: null,
            rounds: sessionRounds,
            attackSteals: 0,
            me: { nickname: 'ME', grade: '', avatar: '', characterId: '' },
            opponent: { nickname: opponentNickname, grade: '', avatar: '' },
            source: 'demo_session',
          },
        ]
      : base;
  return analyzeHandPatterns(withSession, { side: 'opponent', opponentNickname });
}

/** 인매치 한 줄 힌트 */
export function pickLiveHabitHint(hints: PatternHints): string | null {
  if (hints.sampleRounds < 2) return null;
  return hints.topHints[0] ?? null;
}
