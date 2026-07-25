import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { hostessByIndex } from '@/data/hostessAssets';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';

export type CardTone = 'mint' | 'cyan' | 'gold' | 'purple' | 'silver';

interface Chip {
  label: string;
}

const TONE: Record<
  CardTone,
  { glow: string; ring: string; text: string; grad: string; badge: string }
> = {
  mint: {
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.35)]',
    ring: 'ring-arena-success/50',
    text: 'text-arena-success',
    grad: 'from-emerald-500/25 via-emerald-500/5 to-transparent',
    badge: 'bg-arena-success text-black',
  },
  cyan: {
    glow: 'shadow-[0_0_24px_rgba(34,211,238,0.35)]',
    ring: 'ring-arena-cyan/50',
    text: 'text-arena-cyan',
    grad: 'from-cyan-500/25 via-cyan-500/5 to-transparent',
    badge: 'bg-arena-cyan text-black',
  },
  gold: {
    glow: 'shadow-[0_0_34px_rgba(245,158,11,0.5)]',
    ring: 'ring-arena-gold/70',
    text: 'text-arena-gold',
    grad: 'from-amber-400/35 via-amber-500/10 to-transparent',
    badge: 'bg-arena-gold text-black',
  },
  purple: {
    glow: 'shadow-[0_0_24px_rgba(167,139,250,0.4)]',
    ring: 'ring-purple-400/50',
    text: 'text-purple-300',
    grad: 'from-purple-500/25 via-purple-500/5 to-transparent',
    badge: 'bg-purple-400 text-black',
  },
  silver: {
    glow: 'shadow-[0_0_18px_rgba(255,255,255,0.18)]',
    ring: 'ring-white/25',
    text: 'text-gray-300',
    grad: 'from-white/15 via-white/5 to-transparent',
    badge: 'bg-white/80 text-black',
  },
};

export function GameSelectCard({
  title,
  subtitle,
  tone,
  hostessIndex,
  chips = [],
  hot = false,
  jackpot = false,
  featured = false,
  delayIndex = 0,
  onClick,
}: {
  title: string;
  subtitle: string;
  tone: CardTone;
  hostessIndex: number;
  chips?: Chip[];
  hot?: boolean;
  jackpot?: boolean;
  featured?: boolean;
  delayIndex?: number;
  onClick: () => void;
}) {
  const t = TONE[tone];

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayIndex * 0.06, type: 'spring', bounce: 0.4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        triggerHaptic('medium');
        audioManager.playSFX('card_select');
        onClick();
      }}
      className={`group relative w-full h-24 rounded-2xl overflow-hidden ring-2 ${t.ring} ${t.glow} bg-zinc-900`}
    >
      {/* Hostess hero cut — soft left fade, face kept in clear zone */}
      <img
        src={hostessByIndex(hostessIndex)}
        alt=""
        className="absolute right-0 top-0 h-full w-[48%] object-cover object-[68%_12%] pointer-events-none select-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 38%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 38%)',
        }}
        draggable={false}
      />
      {/* Gradient overlay: readable left, faded right */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/25" />
      <div className={`absolute inset-0 bg-gradient-to-br ${t.grad} opacity-70`} />

      {/* Sheen sweep on hover */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-y-2 -left-1/3 w-1/3 rotate-12 bg-white/15 blur-md opacity-0 group-hover:opacity-100 group-hover:translate-x-[350%] transition-all duration-700" />
      </div>

      {/* Featured chase-light frame */}
      {featured && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl ring-2 ring-arena-gold/60 animate-pulse" />
        </div>
      )}

      {/* HOT / JACKPOT badge */}
      {(hot || jackpot) && (
        <div className="absolute top-2 right-2 z-20">
          <motion.span
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg ${
              jackpot ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-black' : t.badge
            }`}
          >
            {jackpot ? 'JACKPOT' : 'HOT'}
          </motion.span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center pl-4 pr-24 text-left">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-white drop-shadow">{title}</span>
          <ChevronRight className={`w-4 h-4 ${t.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
        </div>
        <span className={`text-xs font-bold ${t.text} mb-1.5`}>{subtitle}</span>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chips.map((c) => (
              <span
                key={c.label}
                className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-black/50 text-white/90 border border-white/10"
              >
                {c.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bevel highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50" />
    </motion.button>
  );
}
