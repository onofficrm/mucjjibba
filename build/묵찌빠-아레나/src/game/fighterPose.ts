import { HOSTESS, hostessForHand } from '@/data/hostessAssets';

export type FighterPose = 'idle' | 'select' | 'attack' | 'hit' | 'win';
export type Hand = 'ROCK' | 'SCISSORS' | 'PAPER';
export type GamePhase =
  | 'VS_INTRO'
  | 'INIT'
  | 'ATTACK_DECISION'
  | 'SELECTING'
  | 'WAITING_OPPONENT'
  | 'REVEAL'
  | 'ROUND_RESULT'
  | 'GAME_OVER';

function isWinText(msg: string) {
  return msg.includes('이겼') || msg === 'WIN';
}

function isLoseText(msg: string) {
  return msg.includes('아쉬') || msg === 'LOSE';
}

/** 게임 상태에서 캐릭터 5포즈 결정 */
export function resolveFighterPose(opts: {
  side: 'me' | 'opp';
  phase: GamePhase;
  attacker: 'ME' | 'OPPONENT' | null;
  myHand: Hand | null;
  canPickNow: boolean;
  roundMessage: string;
  winner: 'ME' | 'OPPONENT' | null;
}): FighterPose {
  const { side, phase, attacker, myHand, canPickNow, roundMessage, winner } = opts;
  const iWinRound = isWinText(roundMessage);
  const iLoseRound = isLoseText(roundMessage);

  if (phase === 'GAME_OVER') {
    if (side === 'me') return winner === 'ME' ? 'win' : 'hit';
    return winner === 'ME' ? 'hit' : 'win';
  }

  if (phase === 'ROUND_RESULT') {
    if (side === 'me') {
      if (iWinRound) return 'win';
      if (iLoseRound) return 'hit';
      return 'idle';
    }
    if (iWinRound) return 'hit';
    if (iLoseRound) return 'win';
    return 'idle';
  }

  const isAttacker =
    (side === 'me' && attacker === 'ME') || (side === 'opp' && attacker === 'OPPONENT');

  if (phase === 'REVEAL') {
    return isAttacker ? 'attack' : 'select';
  }

  if (side === 'me') {
    if (myHand && phase === 'WAITING_OPPONENT') return 'select';
    if (canPickNow) return isAttacker ? 'attack' : 'select';
    if (isAttacker && (phase === 'SELECTING' || phase === 'ATTACK_DECISION')) return 'attack';
  }

  if (side === 'opp' && isAttacker && (phase === 'SELECTING' || phase === 'WAITING_OPPONENT' || phase === 'ATTACK_DECISION')) {
    return 'attack';
  }

  return 'idle';
}

/** 포즈별 호스티스 이미지 — 기존 에셋 매핑 */
export function hostessForPose(
  side: 'me' | 'opp',
  pose: FighterPose,
  hand: Hand | null,
): string {
  switch (pose) {
    case 'win':
      return side === 'me' ? HOSTESS.victory : HOSTESS.jackpot;
    case 'hit':
      return HOSTESS.comfort;
    case 'attack':
      return hand ? hostessForHand(hand) : side === 'me' ? HOSTESS.arena : HOSTESS.match;
    case 'select':
      return hand ? hostessForHand(hand) : side === 'me' ? HOSTESS.play : HOSTESS.spectate;
    case 'idle':
    default:
      if (hand) return hostessForHand(hand);
      return side === 'me' ? HOSTESS.play : HOSTESS.spectate;
  }
}

/** Fighter 컴포넌트용 모션 키 (select/attack → ready) */
export function poseToMotionKey(pose: FighterPose): 'idle' | 'ready' | 'hit' | 'win' | 'attack' {
  if (pose === 'select') return 'ready';
  return pose;
}
