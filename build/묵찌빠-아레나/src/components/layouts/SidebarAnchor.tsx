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
    <div className="relative z-10 px-3 pb-4 pt-2 space-y-2 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent">
      {/* Season mini */}
      <div
        className="rounded-xl border border-arena-gold/25 bg-arena-gold/5 px-2.5 py-2"
        title={`시즌 ${tier.label} · ${season.xp} XP`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-arena-gold/15 border border-arena-gold/35 flex items-center justify-center shrink-0">
            <Crown className="w-3.5 h-3.5 text-arena-gold" />
          </div>
          <div className={`min-w-0 flex-1 ${expanded ? '' : 'hidden lg:block'}`}>
            <p className="font-display text-[9px] font-black text-arena-gold tracking-[0.2em] uppercase leading-none">
              Season
            </p>
            <p className="text-[11px] font-black text-white truncate mt-0.5">
              {tier.label} · {season.xp} XP
            </p>
          </div>
        </div>
        <div className={`mt-1.5 h-1 rounded-full bg-black/50 overflow-hidden ${expanded ? '' : 'hidden lg:block'}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-arena-gold"
            style={{ width: `${tier.progressPct}%` }}
          />
        </div>
      </div>

      {/* Missions mini */}
      <Link
        to="/lobby"
        onClick={() => triggerHaptic('light')}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 hover:border-arena-cyan/35 hover:bg-arena-cyan/5 transition-colors"
        title="오늘의 미션"
      >
        <div className="relative w-7 h-7 rounded-lg bg-arena-cyan/10 border border-arena-cyan/30 flex items-center justify-center shrink-0">
          <Target className="w-3.5 h-3.5 text-arena-cyan" />
          {claimable > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-arena-gold shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          )}
        </div>
        <div className={`min-w-0 flex-1 ${expanded ? '' : 'hidden lg:block'}`}>
          <p className="text-[10px] font-bold text-gray-400 leading-none">오늘의 미션</p>
          <p className="text-[11px] font-black text-white mt-0.5">
            {completed}/{total}
            {claimable > 0 && (
              <span className="text-arena-gold ml-1.5">수령 {claimable}</span>
            )}
          </p>
        </div>
      </Link>

      {/* Quick play CTA */}
      <button
        type="button"
        onClick={openGame}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-arena-gold/40 bg-gradient-to-r from-amber-400/90 via-arena-gold to-amber-500 text-black font-black text-xs py-2.5 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:brightness-110 transition-all"
      >
        <Swords className="w-3.5 h-3.5 shrink-0" />
        <span className={expanded ? 'inline' : 'hidden lg:inline'}>한 판 더</span>
      </button>
    </div>
  );
}
