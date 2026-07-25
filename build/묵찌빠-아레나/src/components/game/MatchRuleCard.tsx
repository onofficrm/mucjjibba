import { motion } from 'motion/react';
import { PrimaryButton } from '@/components/common/Buttons';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import type { MatchRules } from '@/game/matchRules';
import { usesHandSeal, usesRevenge } from '@/game/matchRules';
import type { RematchSeries } from '@/services/match/rematchSeries';
import { seriesGameLabel, seriesScoreLabel } from '@/services/match/rematchSeries';

function modifierTips(rules: MatchRules): string[] {
  const tips: string[] = [rules.description];
  if (usesHandSeal(rules)) tips.push('매 선택마다 손 하나가 봉인됩니다.');
  if (usesRevenge(rules)) tips.push('방금 진 손은 다음 선택에 쓸 수 없습니다.');
  if (rules.winMode === 'double_or_nothing') tips.push('1–1에서 다음 승점은 2점입니다.');
  if (rules.winMode === 'streak_finish') tips.push('연속 승점으로도 경기가 끝납니다.');
  if (rules.winMode === 'sudden_death') tips.push('첫 승점이 곧 최종 결과입니다.');
  return tips.slice(0, 3);
}

/** 경기 시작 전 룰 안내 카드 */
export function MatchRuleCard({
  rules,
  series,
  onContinue,
}: {
  rules: MatchRules;
  series?: RematchSeries | null;
  onContinue: () => void;
}) {
  const tips = modifierTips(rules);
  const showSeries = !!series && (series.active || series.myWins + series.oppWins > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[55] flex items-center justify-center p-5 bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.35, duration: 0.55 }}
        className="relative w-full max-w-sm rounded-3xl border border-arena-gold/35 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 shadow-[0_0_40px_rgba(245,158,11,0.18)]"
      >
        <p className="text-[10px] font-black tracking-[0.35em] uppercase text-arena-gold/80 mb-2">
          이번 판 룰
        </p>
        <h2 className="text-3xl font-black text-white tracking-tight mb-1">{rules.label}</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{rules.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-arena-gold/15 text-arena-gold border border-arena-gold/30">
            {rules.shortLabel}
          </span>
          {rules.winMode !== 'first_to' && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-white/5 text-gray-300 border border-white/10">
              {rules.winMode === 'sudden_death'
                ? '한판'
                : rules.winMode === 'streak_finish'
                  ? '연승피니시'
                  : '더블'}
            </span>
          )}
          {usesHandSeal(rules) && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/30">
              손 봉인
            </span>
          )}
          {usesRevenge(rules) && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-300 border border-rose-400/30">
              리벤지
            </span>
          )}
        </div>

        <ul className="space-y-2 mb-5">
          {tips.map((t) => (
            <li
              key={t}
              className="text-xs text-gray-300 leading-snug pl-3 border-l-2 border-arena-gold/40"
            >
              {t}
            </li>
          ))}
        </ul>

        {showSeries && series && (
          <div className="mb-5 rounded-2xl border border-arena-cyan/30 bg-arena-cyan/10 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-arena-cyan tracking-wider uppercase">
                3전 시리즈
              </p>
              <p className="text-xs text-gray-300 font-bold mt-0.5">{seriesGameLabel(series)}</p>
            </div>
            <p className="text-2xl font-black text-white tabular-nums">
              {seriesScoreLabel(series)}
            </p>
          </div>
        )}

        <PrimaryButton
          className="w-full py-3.5 text-base"
          onClick={() => {
            audioManager.playSFX('confirm');
            triggerHaptic('medium');
            onContinue();
          }}
        >
          이해했어요 · 시작
        </PrimaryButton>
      </motion.div>
    </motion.div>
  );
}
