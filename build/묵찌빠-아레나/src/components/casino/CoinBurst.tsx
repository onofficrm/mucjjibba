import { motion } from 'motion/react';

const COINS = Array.from({ length: 28 }, (_, i) => i);

export function CoinBurst({ intensity = 2, active = true }: { intensity?: 1 | 2 | 3; active?: boolean }) {
  if (!active) return null;
  const count = intensity === 3 ? 28 : intensity === 2 ? 20 : 12;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[5]" aria-hidden>
      {COINS.slice(0, count).map((i) => {
        const left = 10 + ((i * 37) % 80);
        const delay = (i % 8) * 0.06;
        const dur = 1.4 + (i % 5) * 0.15;
        const xDrift = ((i % 7) - 3) * 18;
        return (
          <motion.div
            key={i}
            className="absolute text-xl md:text-2xl"
            style={{ left: `${left}%`, bottom: '-8%' }}
            initial={{ y: 0, x: 0, opacity: 0, rotate: 0, scale: 0.6 }}
            animate={{
              y: [0, -220 - (i % 5) * 40, -380 - (i % 3) * 60],
              x: [0, xDrift, xDrift * 1.4],
              opacity: [0, 1, 1, 0],
              rotate: [0, 180, 360],
              scale: [0.6, 1.1, 0.9],
            }}
            transition={{ duration: dur, delay, ease: 'easeOut' }}
          >
            {i % 3 === 0 ? '✨' : '🪙'}
          </motion.div>
        );
      })}
    </div>
  );
}
