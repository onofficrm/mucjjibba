/** 3전 시리즈(BO3) 재대결 — sessionStorage에 유지 */

export interface RematchSeries {
  id: string;
  bestOf: 3;
  /** 시리즈 승리 목표 (2) */
  winsNeeded: number;
  myWins: number;
  oppWins: number;
  opponentNickname: string;
  tableId: string;
  ruleId?: string;
  active: boolean;
  /** 시리즈 종료 시 승자 */
  winner?: 'ME' | 'OPPONENT' | null;
  /** 이미 반영한 gameId — 결과 새로고침 중복 방지 */
  lastRecordedGameId?: string;
  updatedAt: string;
}

const KEY = 'arena_rematch_series_v1';

function storage(): Storage | null {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  } catch {
    return null;
  }
}

export function loadRematchSeries(): RematchSeries | null {
  try {
    const raw = storage()?.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RematchSeries;
  } catch {
    return null;
  }
}

export function saveRematchSeries(series: RematchSeries | null) {
  try {
    if (!series) storage()?.removeItem(KEY);
    else storage()?.setItem(KEY, JSON.stringify(series));
  } catch {
    /* ignore */
  }
}

export function clearRematchSeries() {
  saveRematchSeries(null);
}

export function seriesGameLabel(series: RematchSeries): string {
  const played = series.myWins + series.oppWins;
  return `${played + 1}번째 경기`;
}

export function seriesScoreLabel(series: RematchSeries): string {
  return `${series.myWins} – ${series.oppWins}`;
}

export function isSeriesInProgress(series: RematchSeries | null | undefined): boolean {
  return !!series?.active && !series.winner;
}

export function isSeriesComplete(series: RematchSeries | null | undefined): boolean {
  return !!series?.winner;
}

/** 새 시리즈 시작 (0–0) */
export function beginRematchSeries(opts: {
  opponentNickname: string;
  tableId: string;
  ruleId?: string;
}): RematchSeries {
  const series: RematchSeries = {
    id: `ser-${Date.now().toString(36)}`,
    bestOf: 3,
    winsNeeded: 2,
    myWins: 0,
    oppWins: 0,
    opponentNickname: opts.opponentNickname,
    tableId: opts.tableId,
    ruleId: opts.ruleId,
    active: true,
    winner: null,
    updatedAt: new Date().toISOString(),
  };
  saveRematchSeries(series);
  return series;
}

/**
 * 한 경기 결과 반영.
 * 같은 gameId로 중복 기록하지 않음.
 */
export function recordSeriesGameResult(
  won: boolean,
  gameId?: string,
): RematchSeries | null {
  const cur = loadRematchSeries();
  if (!cur || !cur.active || cur.winner) return cur;
  if (gameId && cur.lastRecordedGameId === gameId) return cur;

  const next: RematchSeries = {
    ...cur,
    myWins: cur.myWins + (won ? 1 : 0),
    oppWins: cur.oppWins + (won ? 0 : 1),
    lastRecordedGameId: gameId ?? cur.lastRecordedGameId,
    updatedAt: new Date().toISOString(),
  };

  if (next.myWins >= next.winsNeeded) {
    next.winner = 'ME';
    next.active = false;
  } else if (next.oppWins >= next.winsNeeded) {
    next.winner = 'OPPONENT';
    next.active = false;
  }

  saveRematchSeries(next);
  return next;
}

/** 상대·테이블이 바뀌면 시리즈 무효 */
export function seriesMatchesContext(
  series: RematchSeries | null,
  opts: { opponentNickname?: string; tableId?: string },
): boolean {
  if (!series) return false;
  if (opts.opponentNickname && series.opponentNickname !== opts.opponentNickname) return false;
  if (opts.tableId && series.tableId !== opts.tableId) return false;
  return true;
}
