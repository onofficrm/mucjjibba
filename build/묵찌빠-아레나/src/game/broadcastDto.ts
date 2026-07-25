import { maskNickname } from '@/game/shareCard';
import type { BroadcastGamePublicDTO } from '@/types/broadcast';
import type { GameLog } from '@/types/gameLog';

/** 민감 필드가 절대 들어가지 않도록 공개 DTO만 생성 */
export function toBroadcastPublicDTO(
  log: GameLog,
  extras?: {
    spectatorCount?: number;
    nextChallengerName?: string | null;
    status?: BroadcastGamePublicDTO['status'];
  },
): BroadcastGamePublicDTO {
  const last = log.rounds[log.rounds.length - 1];
  const modeMap: Record<string, BroadcastGamePublicDTO['mode']> = {
    LIVE: 'LIVE',
    AI_DEMO: 'AI_DEMO',
    REPLAY: 'REPLAY',
    TOURNAMENT: 'TOURNAMENT',
    ARENA: 'ARENA',
    PRACTICE: 'PRACTICE',
    FRIEND: 'LIVE',
  };

  return {
    gameId: log.gameId,
    mode: modeMap[log.mode] ?? 'LIVE',
    status: extras?.status ?? (log.winner ? 'FINISHED' : 'IN_PROGRESS'),
    player1: {
      displayName: maskNickname(log.me.nickname),
      grade: log.me.grade,
      avatarEmoji: log.me.avatar,
      score: log.myScore,
      winStreak: log.currentStreakAfter ?? 0,
    },
    player2: {
      displayName: maskNickname(log.opponent.nickname),
      grade: log.opponent.grade,
      avatarEmoji: log.opponent.avatar,
      score: log.opponentScore,
      winStreak: 0,
    },
    attacker: last?.attackerAfter === 'ME' ? 'P1' : last?.attackerAfter === 'OPPONENT' ? 'P2' : null,
    lastReveal: {
      p1Hand: last?.myHand ?? null,
      p2Hand: last?.opponentHand ?? null,
      message:
        last?.result === 'POINT_ME'
          ? 'P1 득점'
          : last?.result === 'POINT_OPPONENT'
            ? 'P2 득점'
            : last?.result === 'ATTACK_CHANGE'
              ? '공격권 이동'
              : '진행 중',
    },
    spectatorCount: extras?.spectatorCount ?? 128,
    nextChallengerName: extras?.nextChallengerName ?? '대기열 #3',
    tournament: {
      active: log.mode === 'TOURNAMENT' || !!log.isTournamentFinal,
      roundLabel: log.isTournamentFinal ? '결승' : log.mode === 'TOURNAMENT' ? '준결승' : null,
      statusLabel: log.winner ? '종료' : '진행',
    },
    updatedAt: log.endedAt || new Date().toISOString(),
  };
}

/** DTO에 금지 키가 없는지 검증 (테스트용) */
export const BROADCAST_FORBIDDEN_KEYS = [
  'email',
  'mb_id',
  'userId',
  'ip',
  'device',
  'password',
  'token',
  'admin',
  'pointLedger',
  'transaction',
];
