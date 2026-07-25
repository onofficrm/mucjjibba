import type { GameLog } from '@/types/gameLog';

export type WinTier = 'BIG_WIN' | 'MEGA_WIN' | 'JACKPOT';

export interface WinTierInfo {
  tier: WinTier;
  label: string;
  subtitle: string;
  multiplierLabel: string;
  /** 연출 강도 1–3 */
  intensity: 1 | 2 | 3;
}

function hadComeback(log: GameLog | null, myScore: number, opponentScore: number): boolean {
  if (!log?.rounds?.length) return false;
  let me = 0;
  let opp = 0;
  let trailed = false;
  for (const r of log.rounds) {
    if (r.result === 'POINT_ME') me += 1;
    if (r.result === 'POINT_OPPONENT') opp += 1;
    if (opp > me) trailed = true;
  }
  return trailed && myScore > opponentScore;
}

/** 승리 연출 티어 — 데모 포인트 배수 표기용 (실제 결제 없음) */
export function resolveWinTier(log: GameLog | null, myScore: number, opponentScore: number): WinTierInfo {
  const sweep = myScore >= 2 && opponentScore === 0;
  const comeback = hadComeback(log, myScore, opponentScore);
  const steals = log?.attackSteals ?? 0;
  const streak = log?.currentStreakAfter ?? 0;

  if (sweep && (streak >= 5 || steals >= 2 || log?.isTournamentFinal)) {
    return {
      tier: 'JACKPOT',
      label: 'JACKPOT WIN',
      subtitle: '완벽한 압승!',
      multiplierLabel: 'WP x2.0',
      intensity: 3,
    };
  }
  if (sweep || comeback || steals >= 3 || streak >= 4) {
    return {
      tier: 'MEGA_WIN',
      label: 'MEGA WIN',
      subtitle: sweep ? '2:0 스윕!' : comeback ? '극적인 역전!' : '화려한 승리!',
      multiplierLabel: 'WP x1.5',
      intensity: 2,
    };
  }
  return {
    tier: 'BIG_WIN',
    label: 'BIG WIN',
    subtitle: '승리!',
    multiplierLabel: 'WP x1.2',
    intensity: 1,
  };
}

export function streakAuraLevel(streak: number): 0 | 1 | 2 | 3 | 4 {
  if (streak >= 10) return 4;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  if (streak >= 2) return 1;
  return 0;
}

export function streakMultiplierLabel(streak: number): string | null {
  if (streak >= 10) return 'WP 보너스 x2.0';
  if (streak >= 5) return 'WP 보너스 x1.5';
  if (streak >= 3) return 'WP 보너스 x1.2';
  return null;
}

/** 접전 패배 = 니어미스 연출 대상 */
export function isNearMissLoss(myScore: number, opponentScore: number, winner: string | null): boolean {
  if (winner !== 'OPPONENT' && winner !== 'OPP') return false;
  return myScore >= 1 && opponentScore >= 2;
}
