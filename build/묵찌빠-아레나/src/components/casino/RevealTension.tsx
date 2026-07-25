import { useEffect } from 'react';
import { motion } from 'motion/react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

/** 리빌 직전 화면 디밍 + 심박 진동 */
export function RevealTension({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    audioManager.playSFX('heartbeat');
    const id = window.setInterval(() => {
      triggerHaptic('heartbeat');
      audioManager.playSFX('heartbeat');
    }, 420);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[25] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.15, 0.45, 0.2, 0.5, 0.25] }}
      transition={{ duration: 1.0, ease: 'easeInOut' }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.75) 100%)',
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 0.42, repeat: Infinity }}
      />
    </motion.div>
  );
}

/** 라스트 라운드 붉은 네온 펄스 */
export function LastRoundNeon({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[12]"
      style={{
        boxShadow: 'inset 0 0 0 4px rgba(239,68,68,0.75), inset 0 0 80px rgba(220,38,38,0.35)',
      }}
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 0.7, repeat: Infinity }}
      aria-hidden
    />
  );
}
