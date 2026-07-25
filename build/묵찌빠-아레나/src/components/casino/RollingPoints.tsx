import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

export function RollingPoints({
  target,
  durationMs = 1600,
  prefix = '+',
  suffix = ' P',
  className = '',
  playTicks = true,
}: {
  target: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  playTicks?: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    let lastTick = 0;
    const tickEvery = Math.max(40, durationMs / 24);

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      // easeOutExpo-ish
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(target * eased);
      setValue(next);
      if (playTicks && now - lastTick >= tickEvery && p < 1) {
        lastTick = now;
        audioManager.playSFX('coin_tick');
        if (p > 0.7) triggerHaptic('light');
      }
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        audioManager.playSFX('point_count');
        triggerHaptic('success');
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, playTicks]);

  return (
    <motion.div
      key={target}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={className}
    >
      {prefix}
      {value.toLocaleString()}
      <span className="text-[0.55em] font-black ml-1 opacity-90">{suffix.trim()}</span>
    </motion.div>
  );
}
