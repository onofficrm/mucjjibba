import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export type DealerState = 'idle' | 'start' | 'ask_select' | 'surprise' | 'congrats' | 'comfort' | 'error';

interface DealerCharacterProps {
  state: DealerState;
  message?: string;
  reducedAnimations?: boolean;
}

const DEALER_FACES: Record<DealerState, string> = {
  idle: '😊',
  start: '😎',
  ask_select: '🤔',
  surprise: '😲',
  congrats: '🥳',
  comfort: '🥺',
  error: '😵',
};

export function DealerCharacter({ state, message, reducedAnimations = false }: DealerCharacterProps) {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (message) {
      setShowBubble(true);
      const timer = setTimeout(() => setShowBubble(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowBubble(false);
    }
  }, [message]);

  const bounceAnimation = reducedAnimations ? {} : {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const surpriseAnimation = reducedAnimations ? {} : {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  };

  return (
    <div className="fixed bottom-[240px] right-4 z-40 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-3 bg-white text-black px-4 py-2 rounded-2xl rounded-br-sm shadow-lg max-w-[200px] text-sm font-bold border-2 border-gray-200"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={state === 'surprise' ? surpriseAnimation : bounceAnimation}
        className="w-16 h-16 bg-gray-800 rounded-full border-4 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center text-3xl relative"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800" />
        {DEALER_FACES[state]}
      </motion.div>
    </div>
  );
}
