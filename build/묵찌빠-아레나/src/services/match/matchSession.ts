import type { MatchSession, MatchTable, MatchOpponent } from '@/types/match';

const SESSION_KEY = 'arena_match_session_v1';
const EVENT = 'arena-match-session';

function storage(): Storage | null {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  } catch {
    return null;
  }
}

export function loadMatchSession(): MatchSession | null {
  try {
    const raw = storage()?.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MatchSession;
  } catch {
    return null;
  }
}

export function saveMatchSession(session: MatchSession | null) {
  try {
    if (!session) storage()?.removeItem(SESSION_KEY);
    else storage()?.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: session }));
  }
}

export function clearMatchSession() {
  saveMatchSession(null);
}

export function createMatchSession(table: MatchTable, pointsBefore: number): MatchSession {
  const gameId = `qm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const session: MatchSession = {
    gameId,
    table,
    opponent: null,
    status: 'queued',
    stepIndex: 0,
    deposited: false,
    settled: false,
    pointsBeforeDeposit: pointsBefore,
    createdAt: new Date().toISOString(),
  };
  saveMatchSession(session);
  return session;
}

export function updateMatchSession(patch: Partial<MatchSession>): MatchSession | null {
  const current = loadMatchSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  saveMatchSession(next);
  return next;
}

export function setMatchOpponent(opponent: MatchOpponent) {
  return updateMatchSession({ opponent, status: 'found' });
}

export function subscribeMatchSession(
  listener: (session: MatchSession | null) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = (e: Event) => {
    listener((e as CustomEvent<MatchSession | null>).detail ?? loadMatchSession());
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

const SETTLED_KEY = 'arena_match_settled_ids_v1';

function loadSettledIds(): string[] {
  try {
    const raw = localStorage.getItem(SETTLED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

export function hasSettledGame(gameId: string): boolean {
  return loadSettledIds().includes(gameId);
}

export function markSettledGame(gameId: string) {
  try {
    const ids = loadSettledIds().filter((id) => id !== gameId);
    ids.push(gameId);
    localStorage.setItem(SETTLED_KEY, JSON.stringify(ids.slice(-40)));
  } catch {
    /* ignore */
  }
}
