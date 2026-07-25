import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { HOSTESS } from '@/data/hostessAssets';
import type { HostessRole } from '@/data/hostessAssets';

export type DealerState = 'idle' | 'start' | 'ask_select' | 'surprise' | 'congrats' | 'comfort' | 'error';

interface DealerCharacterProps {
  state: DealerState;
  message?: string;
  reducedAnimations?: boolean;
}

const STATE_ROLE: Record<DealerState, HostessRole> = {
  idle: 'dealer',
  start: 'play',
  ask_select: 'match',
  surprise: 'arena',
  congrats: 'jackpot',
  comfort: 'comfort',
  error: 'spectate',
};

export function DealerCharacter({ state, message, reducedAnimations = false }: DealerCharacterProps) {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (message) {
      setShowBubble(true);
      const timer = setTimeout(() => setShowBubble(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowBubble(false);
  }, [message]);

  const bounceAnimation = reducedAnimations
    ? {}
    : {
        y: [0, -10, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      };

  const surpriseAnimation = reducedAnimations
    ? {}
    : {
        scale: [1, 1.12, 1],
        transition: { duration: 0.3 },
      };

  return (
    <div className="fixed bottom-[min(42vh,320px)] right-3 z-40 flex flex-col items-end pointer-events-none max-md:bottom-[min(48vh,360px)]">
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 bg-white text-black px-3 py-1.5 rounded-2xl rounded-br-sm shadow-lg max-w-[160px] text-xs font-bold border-2 border-arena-gold/40"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={state === 'surprise' ? surpriseAnimation : bounceAnimation}
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full border-[3px] border-arena-gold shadow-[0_0_16px_rgba(245,158,11,0.45)] overflow-hidden bg-zinc-900 ring-2 ring-black/60"
      >
        <img
          src={HOSTESS[STATE_ROLE[state]]}
          alt="딜러 호스티스"
          className="w-full h-full object-cover object-[center_12%]"
          draggable={false}
        />
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
      </motion.div>
    </div>
  );
}
