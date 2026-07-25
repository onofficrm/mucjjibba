import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { creditDemoPoints } from '@/utils/demoWallet';
import { addSeasonXp } from '@/utils/seasonPass';

type CardReward = {
  id: string;
  label: string;
  detail: string;
  emoji: string;
  points: number;
  xp: number;
};

const POOL: CardReward[] = [
  { id: 'p50', label: '+50 P', detail: '보너스 포인트', emoji: '🪙', points: 50, xp: 10 },
  { id: 'p120', label: '+120 P', detail: '럭키 포인트', emoji: '💎', points: 120, xp: 20 },
  { id: 'xp30', label: '+30 XP', detail: '시즌 경험치', emoji: '⚡', points: 0, xp: 30 },
  { id: 'xp60', label: '+60 XP', detail: '핫 스트릭 XP', emoji: '🔥', points: 20, xp: 60 },
  { id: 'emote', label: '이모트', detail: '응원 이모트 해금(데모)', emoji: '👏', points: 30, xp: 15 },
];

function shuffleThree(): CardReward[] {
  const copy = [...POOL].sort(() => Math.random() - 0.5);
  return copy.slice(0, 3);
}

/** 결과 화면 — 보너스 카드 3장 중 1장 뒤집기 */
export function BonusCardFlip({ enabled, onDone }: { enabled: boolean; onDone?: () => void }) {
  const [cards] = useState(shuffleThree);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (!enabled) return null;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    triggerHaptic('heavy');
    audioManager.playSFX('card_select');
    window.setTimeout(() => {
      setRevealed(true);
      const reward = cards[i];
      if (reward.points > 0) creditDemoPoints(reward.points);
      if (reward.xp > 0) addSeasonXp(reward.xp);
      audioManager.playSFX(reward.points >= 100 ? 'jackpot' : 'point_count');
      triggerHaptic('success');
      window.setTimeout(() => onDone?.(), 1400);
    }, 450);
  };

  return (
    <div className="w-full max-w-sm mt-4 mb-2">
      <p className="text-center text-[11px] font-black text-arena-gold tracking-wider mb-2">
        BONUS PICK · 카드 1장 선택
      </p>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, i) => {
          const isPicked = picked === i;
          const showFace = isPicked && revealed;
          const dim = picked !== null && !isPicked;
          return (
            <motion.button
              key={card.id}
              type="button"
              disabled={picked !== null}
              onClick={() => pick(i)}
              whileTap={picked === null ? { scale: 0.94 } : undefined}
              className={`relative aspect-[3/4] rounded-xl border-2 overflow-hidden ${
                dim ? 'opacity-40 border-white/10' : 'border-arena-gold/50'
              }`}
              style={{ perspective: 800 }}
            >
              <AnimatePresence mode="wait">
                {!showFace ? (
                  <motion.div
                    key="back"
                    initial={false}
                    animate={{ rotateY: isPicked ? 90 : 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 bg-gradient-to-br from-amber-500 via-arena-gold to-amber-700 flex flex-col items-center justify-center"
                  >
                    <span className="font-display text-2xl font-black text-black">?</span>
                    <span className="text-[9px] font-black text-black/70 mt-1">TAP</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="face"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center px-1"
                  >
                    <span className="text-2xl mb-1">{card.emoji}</span>
                    <span className="text-sm font-black text-arena-gold">{card.label}</span>
                    <span className="text-[9px] font-bold text-gray-400 text-center mt-0.5">{card.detail}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
