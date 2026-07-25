import { motion, HTMLMotionProps } from 'motion/react';
import { forwardRef, useId } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { HostessAvatar } from '@/components/casino/HostessAvatar';

interface ButtonProps extends HTMLMotionProps<'button'> {
  hapticFeedback?: boolean;
  /** 호스티스 아바타 표시 (기본 true) */
  showHostess?: boolean;
  hostessIndex?: number;
}

function useHostessSeed(explicit?: number) {
  const id = useId();
  if (explicit !== undefined) return explicit;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 97;
  return h;
}

export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      hapticFeedback = true,
      showHostess = true,
      hostessIndex,
      onClick,
      ...props
    },
    ref,
  ) => {
    const seed = useHostessSeed(hostessIndex);
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('medium');
          audioManager.playSFX('btn_select');
          if (onClick) onClick(e);
        }}
        className={`relative w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-arena-gold to-amber-500 hover:from-amber-300 hover:via-amber-400 hover:to-arena-gold text-arena-bg font-bold rounded-2xl transition-all shadow-[0_0_24px_rgba(245,158,11,0.28)] border border-amber-200/30 flex items-center justify-center gap-2 overflow-hidden ${className}`}
        {...props}
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10" />
        {showHostess && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 opacity-95 z-10">
            <HostessAvatar index={seed} size="sm" ring={false} className="ring-2 ring-black/25 shadow-md" />
          </span>
        )}
        <span className={`relative z-10 flex items-center justify-center gap-2 ${showHostess ? 'pl-8' : ''}`}>
          {children}
        </span>
      </motion.button>
    );
  },
);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      hapticFeedback = true,
      showHostess = true,
      hostessIndex,
      onClick,
      ...props
    },
    ref,
  ) => {
    const seed = useHostessSeed(hostessIndex);
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          if (onClick) onClick(e);
        }}
        className={`relative w-full py-4 px-6 bg-gradient-to-b from-zinc-800/95 to-zinc-950 hover:from-zinc-700 hover:to-zinc-900 border border-white/15 hover:border-white/25 text-white font-medium rounded-2xl transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center gap-2 overflow-hidden backdrop-blur-sm ${className}`}
        {...props}
      >
        {showHostess && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <HostessAvatar index={seed + 1} size="sm" />
          </span>
        )}
        <span className={`relative z-10 flex items-center justify-center gap-2 ${showHostess ? 'pl-8' : ''}`}>
          {children}
        </span>
      </motion.button>
    );
  },
);
SecondaryButton.displayName = 'SecondaryButton';

export const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      hapticFeedback = true,
      showHostess = true,
      hostessIndex,
      onClick,
      ...props
    },
    ref,
  ) => {
    const seed = useHostessSeed(hostessIndex);
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('heavy');
          audioManager.playSFX('error');
          if (onClick) onClick(e);
        }}
        className={`relative w-full py-4 px-6 bg-arena-error/10 hover:bg-arena-error/20 border border-arena-error/50 text-arena-error font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 overflow-hidden ${className}`}
        {...props}
      >
        {showHostess && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2">
            <HostessAvatar index={seed + 2} size="sm" ring={false} className="ring-2 ring-arena-error/40" />
          </span>
        )}
        <span className={`relative z-10 flex items-center justify-center gap-2 ${showHostess ? 'pl-8' : ''}`}>
          {children}
        </span>
      </motion.button>
    );
  },
);
DangerButton.displayName = 'DangerButton';

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      hapticFeedback = true,
      showHostess = false,
      hostessIndex,
      onClick,
      ...props
    },
    ref,
  ) => {
    const seed = useHostessSeed(hostessIndex);
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          if (onClick) onClick(e);
        }}
        className={`relative p-3 bg-arena-card hover:bg-arena-card-hover border border-white/10 text-white rounded-xl transition-colors flex items-center justify-center overflow-hidden ${className}`}
        {...props}
      >
        {showHostess && (
          <span className="absolute inset-0 opacity-30">
            <HostessAvatar index={seed} size="md" ring={false} className="w-full h-full rounded-xl" />
          </span>
        )}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  },
);
IconButton.displayName = 'IconButton';

export const FilterButton = forwardRef<HTMLButtonElement, ButtonProps & { active?: boolean }>(
  (
    {
      children,
      active,
      className = '',
      hapticFeedback = true,
      showHostess = true,
      hostessIndex,
      onClick,
      ...props
    },
    ref,
  ) => {
    const seed = useHostessSeed(hostessIndex);
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          if (onClick) onClick(e);
        }}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border inline-flex items-center gap-1.5 ${
          active
            ? 'bg-arena-gold/10 border-arena-gold text-arena-gold'
            : 'bg-arena-card border-white/10 text-arena-text-muted hover:text-white hover:bg-arena-card-hover'
        } ${className}`}
        {...props}
      >
        {showHostess && <HostessAvatar index={seed} size="xs" ring={false} className="ring-1 ring-white/20" />}
        {children}
      </motion.button>
    );
  },
);
FilterButton.displayName = 'FilterButton';
