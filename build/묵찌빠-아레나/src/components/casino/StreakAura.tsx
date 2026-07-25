import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { streakAuraLevel, streakMultiplierLabel } from '@/game/winTier';

const LEVEL_RING: Record<number, string> = {
  0: '',
  1: 'ring-2 ring-sky-400/50 shadow-[0_0_24px_rgba(56,189,248,0.35)]',
  2: 'ring-2 ring-amber-400/60 shadow-[0_0_32px_rgba(245,158,11,0.45)]',
  3: 'ring-2 ring-rose-400/70 shadow-[0_0_40px_rgba(251,113,133,0.5)]',
  4: 'ring-[3px] ring-transparent bg-gradient-to-r from-fuchsia-500 via-amber-300 to-cyan-400 p-[2px] shadow-[0_0_48px_rgba(232,121,249,0.55)]',
};

export function StreakAura({
  streak,
  className = '',
  children,
}: {
  streak: number;
  className?: string;
  children?: ReactNode;
}) {
  const level = streakAuraLevel(streak);
  const mult = streakMultiplierLabel(streak);
  if (level === 0 && !children) return null;

  return (
    <div className={`relative ${className}`}>
      {level > 0 && (
        <motion.div
          className={`absolute -inset-1 rounded-2xl ${LEVEL_RING[level]} pointer-events-none`}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
      {children}
      {mult && (
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-arena-warning to-arena-error text-white shadow-lg"
        >
          🔥 {streak}연승! {mult}
        </motion.div>
      )}
    </div>
  );
}

/** 게임 중 화면 테두리 네온 */
export function StreakScreenFrame({ streak }: { streak: number }) {
  const level = streakAuraLevel(streak);
  if (level === 0) return null;

  const colors = [
    '',
    'rgba(56,189,248,0.45)',
    'rgba(245,158,11,0.55)',
    'rgba(251,113,133,0.6)',
    'rgba(232,121,249,0.65)',
  ];

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[15] rounded-none"
      style={{ boxShadow: `inset 0 0 0 3px ${colors[level]}, inset 0 0 60px ${colors[level]}` }}
      animate={{ opacity: [0.4, 0.95, 0.4] }}
      transition={{ duration: level >= 3 ? 0.8 : 1.6, repeat: Infinity }}
      aria-hidden
    />
  );
}
