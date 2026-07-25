const LAST_PATH_KEY = 'arena_last_play_path';
const GUIDE_DONE_KEY = 'arena_first_guide_done';
const GAMES_PLAYED_KEY = 'arena_games_played_count';

const DEFAULT_QUICK = '/match/tables';
const FIRST_PLAY = '/game/beginner-ai';

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function getLastPlayPath(): string | null {
  const v = storage()?.getItem(LAST_PATH_KEY);
  return v && v.startsWith('/game/') ? v : null;
}

export function saveLastPlayPath(path: string) {
  if (!path.startsWith('/game/')) return;
  // result/replay 경로는 저장하지 않음
  if (path.includes('/result') || path.includes('/rematch') || path.startsWith('/replay')) return;
  storage()?.setItem(LAST_PATH_KEY, path.split('?')[0]);
}

export function isFirstGuideDone(): boolean {
  return storage()?.getItem(GUIDE_DONE_KEY) === '1';
}

export function markFirstGuideDone() {
  storage()?.setItem(GUIDE_DONE_KEY, '1');
}

export function getGamesPlayedCount(): number {
  const n = Number(storage()?.getItem(GAMES_PLAYED_KEY) || '0');
  return Number.isFinite(n) ? n : 0;
}

export function bumpGamesPlayed() {
  storage()?.setItem(GAMES_PLAYED_KEY, String(getGamesPlayedCount() + 1));
}

/** 로비 원탭: 첫 유저는 연습, 이후는 마지막 모드 또는 빠른 시작 */
export function getQuickStartPath(): string {
  if (getGamesPlayedCount() === 0 && !isFirstGuideDone()) {
    return FIRST_PLAY;
  }
  return getLastPlayPath() || DEFAULT_QUICK;
}

export function getResumePath(): string | null {
  return getLastPlayPath();
}

/** 상태 문구 — 영어/전문 용어 대신 쉬운 한국어 */
export function easyStatusMessage(opts: {
  phase: string;
  attacker: 'ME' | 'OPPONENT' | null;
  roundMessage: string;
  myHand: boolean;
  isLastRound: boolean;
}): string {
  const { phase, attacker, roundMessage, myHand, isLastRound } = opts;

  if (phase === 'INIT') return '곧 시작해요';
  if (phase === 'WAITING_OPPONENT') return '상대가 고르는 중…';
  if (phase === 'REVEAL') return '패 공개!';
  if (phase === 'GAME_OVER') return roundMessage;

  if (phase === 'ROUND_RESULT') {
    if (roundMessage === 'WIN' || roundMessage === '이겼어요!') return '이겼어요!';
    if (roundMessage === 'LOSE' || roundMessage === '아쉬워요') return '아쉬워요';
    if (roundMessage.includes('공격권')) return roundMessage;
    return roundMessage;
  }

  if (phase === 'ATTACK_DECISION' || phase === 'SELECTING') {
    if (myHand) return '상대 기다리는 중…';
    if (isLastRound) return '마지막! 아래에서 골라주세요';
    if (phase === 'ATTACK_DECISION' || !attacker) return '아래에서 하나를 눌러주세요';
    if (attacker === 'ME') return '내 공격 차례 · 아래에서 선택';
    return '상대 공격 중 · 아래에서 막으세요';
  }

  return roundMessage || '준비';
}

export function easyRoundLabel(msg: string): string {
  if (msg === 'WIN') return '이겼어요!';
  if (msg === 'LOSE') return '아쉬워요';
  if (msg === '결과 공개') return '패 공개';
  if (msg === '상대 대기') return '상대 고르는 중';
  if (msg === '공격권 획득') return '공격권 가져왔어요';
  if (msg === '공격권 이동') return '공격권이 바뀌었어요';
  if (msg === 'FINAL ROUND') return '마지막 판';
  return msg;
}
