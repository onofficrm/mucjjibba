export type RpsHand = 'ROCK' | 'SCISSORS' | 'PAPER';
export type MatchupKind = 'cut' | 'wrap' | 'crush';

/** 이긴 손 기준 매치업 연출 종류 */
export function getMatchupKind(winner: RpsHand, loser: RpsHand): MatchupKind | null {
  if (winner === 'SCISSORS' && loser === 'PAPER') return 'cut';
  if (winner === 'PAPER' && loser === 'ROCK') return 'wrap';
  if (winner === 'ROCK' && loser === 'SCISSORS') return 'crush';
  return null;
}

export function getWinningHand(a: RpsHand, b: RpsHand): RpsHand | null {
  if (a === b) return null;
  if (
    (a === 'ROCK' && b === 'SCISSORS') ||
    (a === 'SCISSORS' && b === 'PAPER') ||
    (a === 'PAPER' && b === 'ROCK')
  ) {
    return a;
  }
  return b;
}

export const MATCHUP_LABEL: Record<MatchupKind, string> = {
  cut: '가위질!',
  wrap: '감싸기!',
  crush: '부수기!',
};

/** 전체화면 승부 연출 길이 */
export const VICTORY_CLASH_MS = 1700;
