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
  ask_select: 'icon',
  surprise: 'lobby',
  congrats: 'victory',
  comfort: 'dealer',
  error: 'icon',
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
    <div className="fixed bottom-[240px] right-4 z-40 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-3 bg-white text-black px-4 py-2 rounded-2xl rounded-br-sm shadow-lg max-w-[200px] text-sm font-bold border-2 border-arena-gold/40"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={state === 'surprise' ? surpriseAnimation : bounceAnimation}
        className="relative w-20 h-20 rounded-full border-4 border-arena-gold shadow-[0_0_20px_rgba(245,158,11,0.55)] overflow-hidden bg-zinc-900"
      >
        <img
          src={HOSTESS[STATE_ROLE[state]]}
          alt="딜러 호스티스"
          className="w-full h-full object-cover object-top"
          draggable={false}
        />
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900" />
      </motion.div>
    </div>
  );
}
