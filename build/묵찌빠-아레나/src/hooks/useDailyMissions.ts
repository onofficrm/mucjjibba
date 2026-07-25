import { useCallback, useEffect, useState } from 'react';
import { createRequestId } from '@/missions/day';
import { rewardLabel } from '@/missions/catalog';
import { getMissionService, missionEventHandler } from '@/services/mission';
import type { ClaimResult, Mission, MissionProgressSummary } from '@/types/mission';

export function useDailyMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [summary, setSummary] = useState<MissionProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [lastClaim, setLastClaim] = useState<ClaimResult | null>(null);

  const refresh = useCallback(async () => {
    const service = getMissionService();
    const [list, sum] = await Promise.all([service.getMissions(), service.getSummary()]);
    setMissions(list);
    setSummary(sum);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    return missionEventHandler.subscribe((list) => {
      setMissions(list);
      const completedCount = list.filter((m) => m.completed).length;
      const claimableCount = list.filter((m) => m.completed && !m.claimed).length;
      setSummary((prev) => ({
        completedCount,
        totalCount: list.length,
        claimableCount,
        dayId: prev?.dayId ?? '',
        expiresAt: list[0]?.expiresAt ?? prev?.expiresAt ?? '',
      }));
    });
  }, [refresh]);

  const claim = useCallback(async (missionId: string) => {
    setClaimingId(missionId);
    const requestId = createRequestId();
    try {
      const result = await getMissionService().claimReward(missionId, requestId);
      setLastClaim(result);
      if (result.ok) {
        await refresh();
      }
      return result;
    } finally {
      setClaimingId(null);
    }
  }, [refresh]);

  return {
    missions,
    summary,
    loading,
    claimingId,
    lastClaim,
    claim,
    refresh,
    rewardLabel,
  };
}
