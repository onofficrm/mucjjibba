import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Target, Swords } from 'lucide-react';
import {
  getSeasonTier,
  loadSeasonPass,
  SEASON_PASS_EVENT,
  type SeasonPassState,
} from '@/utils/seasonPass';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { triggerHaptic } from '@/utils/haptics';

/** PC 사이드바 하단 앵커 — 시즌 패스 · 미션 · 퀵 대전 */
export function SidebarAnchor({ expanded }: { expanded: boolean }) {
  const [season, setSeason] = useState<SeasonPassState>(() => loadSeasonPass());
  const { summary, missions } = useDailyMissions();
  const tier = getSeasonTier(season.xp);
  const completed = summary?.completedCount ?? 0;
  const total = summary?.totalCount ?? missions.length;
  const claimable = summary?.claimableCount ?? 0;

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SeasonPassState>).detail;
      setSeason(detail ?? loadSeasonPass());
    };
    window.addEventListener(SEASON_PASS_EVENT, onUpdate);
    return () => window.removeEventListener(SEASON_PASS_EVENT, onUpdate);
  }, []);

  const openGame = () => {
    triggerHaptic('medium');
    window.dispatchEvent(new CustomEvent('openGameSelect'));
  };

  return (
    <div className="relative z-10 px-3 pb-4 pt-3 space-y-2.5 border-t border-white/5">
      {/* Season + missions — 한 줄 요약 */}
      <div className={`${expanded ? 'block' : 'hidden lg:block'} space-y-1.5`}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-[9px] font-black text-arena-gold/80 tracking-[0.2em] uppercase">
            Season
          </span>
          <span className="text-[10px] font-black text-white tabular-nums">{season.xp} XP</span>
        </div>
        <div className="h-1 rounded-full bg-black/60 overflow-hidden" title={`${tier.label} · ${season.xp} XP`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-arena-gold"
            style={{ width: `${tier.progressPct}%` }}
          />
        </div>
        <Link
          to="/lobby"
          onClick={() => triggerHaptic('light')}
          className="flex items-center justify-between gap-2 text-[10px] font-bold text-gray-500 hover:text-gray-300 transition-colors"
          title="오늘의 미션"
        >
          <span className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-arena-cyan/70" />
            미션 {completed}/{total}
          </span>
          {claimable > 0 && (
            <span className="text-arena-gold font-black">수령 {claimable}</span>
          )}
        </Link>
      </div>

      {/* Collapsed state — 아이콘만 */}
      {!expanded && (
        <div className="lg:hidden flex justify-center">
          <Crown className="w-4 h-4 text-arena-gold/70" />
        </div>
      )}

      {/* Quick play CTA */}
      <button
        type="button"
        onClick={openGame}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-arena-gold/35 bg-arena-gold/10 text-arena-gold font-black text-[11px] py-2.5 hover:bg-arena-gold hover:text-black transition-all"
      >
        <Swords className="w-3.5 h-3.5 shrink-0" />
        <span className={expanded ? 'inline' : 'hidden lg:inline'}>한 판 더</span>
      </button>
    </div>
  );
}
