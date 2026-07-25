import { getRankingService } from '@/services/ranking';

/** 하위 호환 — 새 코드는 getRankingService() 사용 */
export const rankingService = {
  getLeaderboard: () => getRankingService().getLeaderboard(),
  recordMatchResult: (won: boolean, pointsDelta?: number) =>
    getRankingService().recordMatchResult(won, pointsDelta),
};
