import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/** 결과 화면용 스포트라이트 + 전구 chase light */
export function VegasSpotlight({ active = true, intense = false }: { active?: boolean; intense?: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -top-1/3 left-1/2 w-[140%] h-[70%] -translate-x-1/2 origin-top"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 0%, transparent 0deg, rgba(245,158,11,0.18) 40deg, transparent 80deg, rgba(255,255,255,0.08) 120deg, transparent 160deg)',
        }}
        animate={{ rotate: [0, 18, -12, 0] }}
        transition={{ duration: intense ? 6 : 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-1/4 left-1/3 w-[90%] h-[60%] origin-top"
        style={{
          background:
            'conic-gradient(from 160deg at 40% 0%, transparent 0deg, rgba(34,211,238,0.12) 50deg, transparent 100deg)',
        }}
        animate={{ rotate: [0, -22, 10, 0] }}
        transition={{ duration: intense ? 8 : 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Chase light frame */}
      <div className="absolute top-3 inset-x-4 flex justify-between gap-1">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-arena-gold"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.9, delay: i * 0.08, repeat: Infinity }}
          />
        ))}
      </div>
      <div className="absolute bottom-28 inset-x-4 flex justify-between gap-1 opacity-70">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={`b-${i}`}
            className="w-1.5 h-1.5 rounded-full bg-yellow-200"
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 0.8, delay: (14 - i) * 0.07, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

/** VICTORY 텍스트용 전구 테두리 */
export function ChaseLightTitle({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-block px-4 py-2 mb-2">
      <div className="absolute -inset-1 rounded-xl border border-arena-gold/40" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 52;
        const y = 50 + Math.sin(angle) * 38;
        return (
          <motion.span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_6px_rgba(253,224,71,0.9)]"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 0.7, delay: i * 0.06, repeat: Infinity }}
          />
        );
      })}
      {children}
    </div>
  );
}
