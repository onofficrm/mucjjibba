import type { GameLog } from '@/types/gameLog';

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'DEMO_ONLY' | 'UNAVAILABLE';

/** 일반 사용자용 검증 뷰 — 내부 보안 로그 제외 */
export interface PublicMatchVerification {
  gameId: string;
  startedAt: string;
  endedAt: string;
  status: VerificationStatus;
  statusLabel: string;
  rounds: Array<{
    round: number;
    myHand: string;
    opponentHand: string;
    attacker: string;
    result: string;
    selectedAt: string;
    serverReceivedAt: string;
    lockedAt: string;
    revealedAt: string;
  }>;
  points: {
    depositStatus: 'HELD' | 'NONE' | 'DEMO';
    settleStatus: 'PAID' | 'REFUNDED' | 'NONE' | 'DEMO';
    transactionId: string | null;
  };
  note: string;
}

const HAND_KO = { ROCK: '묵', SCISSORS: '찌', PAPER: '빠' } as const;

export function buildPublicVerification(log: GameLog | null | undefined): PublicMatchVerification | null {
  if (!log) return null;

  const status: VerificationStatus =
    log.source === 'server' ? 'VERIFIED' : log.source === 'mock' || log.source === 'demo_session' ? 'DEMO_ONLY' : 'PENDING';

  return {
    gameId: log.gameId,
    startedAt: log.startedAt,
    endedAt: log.endedAt,
    status,
    statusLabel:
      status === 'VERIFIED'
        ? '서버 검증 완료'
        : status === 'DEMO_ONLY'
          ? '데모 세션 (서버 미검증)'
          : '검증 대기',
    rounds: log.rounds.map((r) => ({
      round: r.round,
      myHand: HAND_KO[r.myHand],
      opponentHand: HAND_KO[r.opponentHand],
      attacker: r.attackerAfter === 'ME' ? '나' : r.attackerAfter === 'OPPONENT' ? '상대' : '-',
      result: r.result,
      selectedAt: r.selectedAt,
      serverReceivedAt: r.serverReceivedAt || r.selectedAt,
      lockedAt: r.lockedAt,
      revealedAt: r.revealedAt,
    })),
    points: {
      depositStatus: log.mode === 'PRACTICE' ? 'NONE' : log.source === 'server' ? 'HELD' : 'DEMO',
      settleStatus: log.mode === 'PRACTICE' ? 'NONE' : log.source === 'server' ? 'PAID' : 'DEMO',
      transactionId: log.source === 'server' ? `tx_${log.gameId}` : null,
    },
    note: '내부 보안 로그·IP·기기 지문은 표시하지 않습니다. 실제 판정은 서버 authoritative 기준입니다.',
  };
}
