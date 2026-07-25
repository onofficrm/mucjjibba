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
    <div className="mt-3 rounded-2xl border border-arena-gold/25 bg-gradient-to-r from-arena-gold/10 via-black/40 to-zinc-900/80 px-3.5 py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-arena-gold/20 border border-arena-gold/40 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-arena-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-arena-gold tracking-wider uppercase">Season Pass</p>
            <p className="text-sm font-black text-white truncate">
              {tier.label} · {state.weekId}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-black text-white tabular-nums">{state.xp} XP</p>
          <p className="text-[10px] text-gray-500 font-bold">
            {tier.nextAt != null ? `다음 ${tier.nextAt} XP` : '최고 티어'}
          </p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-black/50 overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-arena-gold transition-all duration-500"
          style={{ width: `${tier.progressPct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500 font-bold mt-1.5">
        승리·미션·공유로 XP 적립 · 데모 주간 시즌
      </p>
    </div>
  );
}
