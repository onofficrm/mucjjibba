import { motion } from 'motion/react';
import type { WinTierInfo } from '@/game/winTier';

const TIER_STYLE: Record<WinTierInfo['tier'], string> = {
  BIG_WIN: 'from-amber-300 via-yellow-400 to-amber-600 text-black shadow-[0_0_40px_rgba(245,158,11,0.55)]',
  MEGA_WIN: 'from-cyan-300 via-sky-400 to-blue-500 text-black shadow-[0_0_50px_rgba(34,211,238,0.55)]',
  JACKPOT: 'from-fuchsia-400 via-amber-300 to-rose-500 text-black shadow-[0_0_60px_rgba(244,114,182,0.65)]',
};

export function WinTierBanner({ info }: { info: WinTierInfo }) {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0, rotate: -6 }}
      animate={{ scale: [0.4, 1.12, 1], opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', bounce: 0.45, duration: 0.7 }}
      className="w-full flex flex-col items-center mb-3"
    >
      <div
        className={`px-5 py-2 rounded-xl bg-gradient-to-r font-black tracking-[0.2em] text-lg md:text-2xl ${TIER_STYLE[info.tier]}`}
      >
        {info.label}
      </div>
      <p className="text-xs text-arena-gold font-bold mt-2">{info.subtitle}</p>
      <span className="mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
        {info.multiplierLabel} · 데모 가상 포인트
      </span>
    </motion.div>
  );
}
