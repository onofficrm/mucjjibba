import { motion, AnimatePresence } from 'motion/react';

/** 지금 할 일만 크게 보여주는 안내 배너 */
export function ActionCue({
  text,
  highlight = false,
  tip,
}: {
  text: string;
  highlight?: boolean;
  tip?: string | null;
}) {
  return (
    <div className="w-full max-w-md mx-auto px-4 mb-3 relative z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className={`rounded-2xl px-4 py-3 text-center border ${
            highlight
              ? 'bg-arena-gold/15 border-arena-gold/50 shadow-[0_0_24px_rgba(245,158,11,0.25)]'
              : 'bg-black/70 border-white/10'
          }`}
        >
          <p
            className={`font-black tracking-tight ${
              highlight ? 'text-arena-gold text-lg' : 'text-white text-base'
            }`}
          >
            {text}
          </p>
          {tip && (
            <p className="text-[11px] text-gray-400 font-bold mt-1 leading-snug">{tip}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** 첫 게임용 손가락 유도 (묵찌빠 버튼 위) */
export function FirstPlayCoach({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute -top-14 inset-x-0 flex justify-center z-30 pointer-events-none"
    >
      <div className="bg-arena-gold text-black text-xs font-black px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
        <span className="animate-bounce text-base">👇</span>
        하나를 눌러보세요
        <button
          type="button"
          className="pointer-events-auto ml-1 text-[10px] underline opacity-70"
          onClick={onDismiss}
        >
          닫기
        </button>
      </div>
    </motion.div>
  );
}
