import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import {
  getSeasonTier,
  loadSeasonPass,
  SEASON_PASS_EVENT,
  type SeasonPassState,
} from '@/utils/seasonPass';

export function SeasonPassStrip() {
  const [state, setState] = useState<SeasonPassState>(() => loadSeasonPass());

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SeasonPassState>).detail;
      if (detail) setState(detail);
      else setState(loadSeasonPass());
    };
    window.addEventListener(SEASON_PASS_EVENT, onUpdate);
    return () => window.removeEventListener(SEASON_PASS_EVENT, onUpdate);
  }, []);

  const tier = getSeasonTier(state.xp);

  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/80 px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Crown className="w-3.5 h-3.5 text-arena-gold shrink-0" />
          <p className="font-display text-[10px] font-black text-arena-gold/85 tracking-[0.22em] uppercase">
            Season Pass
          </p>
          <span className="text-xs font-black text-white truncate">{tier.label}</span>
        </div>
        <p className="text-xs font-black text-white tabular-nums shrink-0">{state.xp} XP</p>
      </div>
      <div className="h-1.5 rounded-full bg-black/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-arena-gold transition-all duration-500"
          style={{ width: `${tier.progressPct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500 font-bold mt-1.5">
        {tier.nextAt != null ? `다음 티어까지 ${tier.nextAt} XP` : '최고 티어 달성'}
      </p>
    </div>
  );
}
