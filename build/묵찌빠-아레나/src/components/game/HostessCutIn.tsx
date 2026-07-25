import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HOSTESS, type HostessRole } from '@/data/hostessAssets';
import { audioManager } from '@/utils/audio';

export type CutInTone = 'gold' | 'red' | 'platinum';
export type CutInRarity = 'normal' | 'rare' | 'ultra';

export interface CutInEvent {
  id: number;
  role: HostessRole;
  title: string;
  subtitle?: string;
  tone: CutInTone;
  rarity?: CutInRarity;
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

/** 80% normal / 15% rare / 5% ultra */
export function rollCutInRarity(): CutInRarity {
  const r = Math.random();
  if (r < 0.05) return 'ultra';
  if (r < 0.2) return 'rare';
  return 'normal';
}

/** 격투게임식 호스티스 리액션 컷인 — 레어/울트라 가변 보상 */
export function HostessCutIn({ cut }: { cut: CutInEvent | null }) {
  const rarity = cut?.rarity ?? 'normal';
  const isUltra = rarity === 'ultra';
  const isRare = rarity === 'rare' || isUltra;

  useEffect(() => {
    if (!cut) return;
    if (cut.rarity === 'ultra') audioManager.playSFX('jackpot');
    else if (cut.rarity === 'rare') audioManager.playSFX('streak_up');
  }, [cut?.id]);

  return (
    <AnimatePresence>
      {cut && (
        <motion.div
          key={cut.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`overlay-gutter pointer-events-none fixed inset-0 z-[65] flex items-center overflow-hidden ${
            isUltra ? 'bg-black/50' : ''
          }`}
        >
          {isUltra && (
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35)_0%,transparent_70%)]"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 0.6, repeat: 2 }}
            />
          )}

          <motion.div
            initial={{ x: '-110%', skewY: -4 }}
            animate={{ x: 0, skewY: -4 }}
            exit={{ x: '110%', skewY: -4 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className={`relative w-full ${isUltra ? 'h-52 md:h-64' : 'h-36 md:h-48'} bg-gradient-to-r ${TONE[cut.tone].band} backdrop-blur-[2px] ${
              isRare ? 'ring-2 ring-arena-gold/70 shadow-[0_0_40px_rgba(245,158,11,0.45)]' : ''
            }`}
          >
            <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${TONE[cut.tone].edge} to-transparent`} />
            <div className={`absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${TONE[cut.tone].edge} to-transparent`} />

            {isRare && (
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-2 right-4 text-[10px] font-black px-2 py-0.5 rounded-full bg-arena-gold text-black tracking-wider"
              >
                {isUltra ? '★ ULTRA' : 'RARE'}
              </motion.span>
            )}

            <motion.img
              src={HOSTESS[cut.role]}
              alt=""
              initial={{ x: 60, opacity: 0, scale: isUltra ? 1.1 : 1 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className={`absolute right-0 top-1/2 -translate-y-1/2 object-cover object-top opacity-90 ${
                isUltra ? 'h-[220%]' : 'h-[190%]'
              }`}
              style={{
                maskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
              }}
              draggable={false}
            />

            <div className="absolute inset-y-0 left-6 md:left-16 flex flex-col justify-center">
              <motion.p
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
                className={`font-display font-black tracking-wider ${TONE[cut.tone].text} ${
                  isUltra ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'
                }`}
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

            <motion.div
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{ delay: 0.15, duration: isUltra ? 0.75 : 0.55, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
