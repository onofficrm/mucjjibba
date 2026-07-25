import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager, type AmbienceTier } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { getTierTheme } from '@/utils/tierTheme';

type Verdict = 'win' | 'lose' | 'draw';
type Phase = 'verdict' | 'settle' | 'out';

interface Props {
  verdict: Verdict;
  tierLabel?: string;
  tableName: string;
  pointsDelta: number;
  isFree: boolean;
  tableTier?: AmbienceTier;
  reduceAnimations?: boolean;
  onDone: () => void;
}

const VERDICT_TEXT: Record<Verdict, string> = {
  win: 'VICTORY',
  lose: 'DEFEAT',
  draw: 'DRAW',
};

function useCountUp(target: number, run: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    const abs = Math.abs(target);
    if (abs === 0) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(abs * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, durationMs]);
  return value;
}

export function ResultRevealSequence({
  verdict,
  tierLabel,
  tableName,
  pointsDelta,
  isFree,
  tableTier = 'normal',
  reduceAnimations = false,
  onDone,
}: Props) {
  const [phase, setPhase] = useState<Phase>('verdict');
  const isWin = verdict === 'win';
  const theme = getTierTheme(tableTier);
  const settleRun = phase === 'settle';
  const counted = useCountUp(pointsDelta, settleRun);

  useEffect(() => {
    if (reduceAnimations) {
      onDone();
      return;
    }
    triggerHaptic(isWin ? 'success' : 'warning');
    const toSettle = window.setTimeout(() => setPhase('settle'), 1250);
    const toOut = window.setTimeout(() => setPhase('out'), isFree ? 2200 : 2750);
    const finish = window.setTimeout(() => onDone(), isFree ? 2600 : 3150);
    return () => {
      window.clearTimeout(toSettle);
      window.clearTimeout(toOut);
      window.clearTimeout(finish);
    };
  }, [reduceAnimations, isFree, isWin, onDone]);

  const skip = () => {
    triggerHaptic('light');
    audioManager.playSFX('btn_touch');
    onDone();
  };

  if (reduceAnimations) return null;

  const deltaSign = pointsDelta >= 0 ? '+' : '-';
  const deltaColor = pointsDelta >= 0 ? 'text-arena-gold' : 'text-arena-error';

  return (
    <AnimatePresence>
      {phase !== 'out' && (
        <motion.div
          key="reveal"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden"
          onClick={skip}
        >
          {/* Curtain background */}
          <div
            className={`absolute inset-0 ${
              isWin
                ? 'bg-[radial-gradient(circle_at_center,_rgba(30,20,0,0.96)_0%,_rgba(0,0,0,0.99)_70%)]'
                : 'bg-[radial-gradient(circle_at_center,_rgba(10,12,20,0.97)_0%,_rgba(0,0,0,0.99)_70%)]'
            }`}
          />

          {/* Spotlight sweep for win */}
          {isWin && (
            <motion.div
              initial={{ opacity: 0, rotate: -12 }}
              animate={{ opacity: [0, 0.6, 0.25], rotate: 8 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[60%] h-[160%] bg-gradient-to-b from-arena-gold/30 via-arena-gold/5 to-transparent blur-2xl"
            />
          )}

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {tierLabel && isWin && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={`font-display text-xs font-black tracking-[0.35em] mb-3 uppercase ${theme.accentText}`}
              >
                {tierLabel}
              </motion.p>
            )}

            <motion.h1
              initial={{ scale: 0.5, opacity: 0, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ type: 'spring', bounce: 0.45, duration: 0.9 }}
              onAnimationComplete={() => {
                audioManager.playSFX(isWin ? 'final_win' : 'final_lose');
              }}
              className={`font-display text-6xl md:text-7xl font-black tracking-widest ${
                isWin ? theme.engraved : 'text-gray-400'
              }`}
            >
              {VERDICT_TEXT[verdict]}
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={`mt-4 h-[2px] w-40 origin-center bg-gradient-to-r ${
                isWin ? theme.hairline : 'from-transparent via-white/25 to-transparent'
              }`}
            />

            <AnimatePresence>
              {settleRun && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-7 flex flex-col items-center"
                >
                  <span className="text-[11px] font-bold text-gray-500 tracking-wider mb-1">
                    {tableName}
                  </span>
                  {isFree ? (
                    <span className="text-2xl font-black text-gray-300">연습 · 포인트 변동 없음</span>
                  ) : (
                    <span className={`text-4xl md:text-5xl font-black tabular-nums ${deltaColor}`}>
                      {deltaSign}
                      {counted.toLocaleString()}
                      <span className="text-xl ml-1">P</span>
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            onClick={skip}
            className="absolute bottom-10 text-[11px] font-bold text-white/60 border border-white/15 rounded-full px-4 py-2 bg-white/5 backdrop-blur-sm"
          >
            탭하여 건너뛰기
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
