import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HOSTESS, type HostessRole } from '@/data/hostessAssets';

export type CutInTone = 'gold' | 'red' | 'platinum';

export interface CutInEvent {
  id: number;
  role: HostessRole;
  title: string;
  subtitle?: string;
  tone: CutInTone;
}

const TONE = {
  gold: {
    band: 'from-amber-950/95 via-black/90 to-amber-950/95',
    edge: 'via-arena-gold',
    text: 'text-engraved-gold',
    sub: 'text-arena-gold/80',
  },
  red: {
    band: 'from-red-950/95 via-black/90 to-red-950/95',
    edge: 'via-red-500',
    text: 'text-red-400',
    sub: 'text-red-300/80',
  },
  platinum: {
    band: 'from-slate-900/95 via-black/90 to-slate-900/95',
    edge: 'via-slate-200',
    text: 'text-engraved-platinum',
    sub: 'text-slate-300/80',
  },
} as const;

/** 격투게임식 호스티스 리액션 컷인 — 승점·공수탈환·결정타 순간에 짧게 지나감 */
export function HostessCutIn({ cut }: { cut: CutInEvent | null }) {
  return (
    <AnimatePresence>
      {cut && (
        <motion.div
          key={cut.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed inset-0 z-[65] flex items-center overflow-hidden"
        >
          {/* Diagonal band */}
          <motion.div
            initial={{ x: '-110%', skewY: -4 }}
            animate={{ x: 0, skewY: -4 }}
            exit={{ x: '110%', skewY: -4 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className={`relative w-full h-36 md:h-48 bg-gradient-to-r ${TONE[cut.tone].band} backdrop-blur-[2px]`}
          >
            {/* Hairline edges */}
            <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${TONE[cut.tone].edge} to-transparent`} />
            <div className={`absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${TONE[cut.tone].edge} to-transparent`} />

            {/* Hostess portrait — full-bleed right */}
            <motion.img
              src={HOSTESS[cut.role]}
              alt=""
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-[190%] object-cover object-top opacity-90"
              style={{
                maskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
              }}
              draggable={false}
            />

            {/* Copy */}
            <div className="absolute inset-y-0 left-6 md:left-16 flex flex-col justify-center">
              <motion.p
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
                className={`font-display text-3xl md:text-5xl font-black tracking-wider ${TONE[cut.tone].text}`}
              >
                {cut.title}
              </motion.p>
              {cut.subtitle && (
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.22 }}
                  className={`text-xs md:text-sm font-bold mt-1 ${TONE[cut.tone].sub}`}
                >
                  {cut.subtitle}
                </motion.p>
              )}
            </div>

            {/* Light sweep */}
            <motion.div
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{ delay: 0.15, duration: 0.55, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
