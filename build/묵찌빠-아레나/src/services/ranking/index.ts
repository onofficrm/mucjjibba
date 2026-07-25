import { DemoRankingService } from './DemoRankingService';

let singleton: DemoRankingService | null = null;

export function getRankingService(): DemoRankingService {
  if (!singleton) singleton = new DemoRankingService();
  return singleton;
}

export function resetRankingServiceSingleton() {
  singleton = null;
}

export { DemoRankingService };
export { getWeekId, getWeekRange, gradeFromWeeklyPoints } from './weekId';
