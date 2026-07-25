import { motion } from 'motion/react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';

export function NearMissOverlay({
  open,
  scoreLabel,
  onRematch,
  onSkip,
}: {
  open: boolean;
  scoreLabel: string;
  onRematch: () => void;
  onSkip: () => void;
}) {
  if (!open) return null;

  return (
    <motion.div
      className="overlay-gutter fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.35 }}
        className="w-full max-w-sm text-center"
      >
        <motion.p
          className="text-arena-gold font-black text-sm tracking-[0.35em] mb-3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          NEAR MISS
        </motion.p>
        <h2 className="text-3xl font-black text-white mb-2">한 끗 차이!</h2>
        <p className="text-sm text-gray-400 mb-1">접전 끝에 아쉽게 패배했습니다.</p>
        <p className="text-2xl font-black text-white/90 mb-8 tracking-widest">{scoreLabel}</p>
        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={onRematch} className="w-full py-4 text-lg">
            바로 재대결
          </PrimaryButton>
          <SecondaryButton onClick={onSkip} className="w-full py-3">
            결과 보기
          </SecondaryButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
