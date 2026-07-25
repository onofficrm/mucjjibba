import { motion, HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';

interface ButtonProps extends HTMLMotionProps<"button"> {
  hapticFeedback?: boolean;
}

export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', hapticFeedback = true, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('medium');
          audioManager.playSFX('btn_select');
          if (onClick) onClick(e);
        }}
        className={`w-full py-4 px-6 bg-arena-gold hover:bg-arena-gold-light text-arena-bg font-bold rounded-2xl transition-colors shadow-lg shadow-arena-gold/20 flex items-center justify-center space-x-2 ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', hapticFeedback = true, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          if (onClick) onClick(e);
        }}
        className={`w-full py-4 px-6 bg-arena-card hover:bg-arena-card-hover border border-white/10 text-white font-medium rounded-2xl transition-colors flex items-center justify-center space-x-2 ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
SecondaryButton.displayName = 'SecondaryButton';

export const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', hapticFeedback = true, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('heavy');
          audioManager.playSFX('error');
          if (onClick) onClick(e);
        }}
        className={`w-full py-4 px-6 bg-arena-error/10 hover:bg-arena-error/20 border border-arena-error/50 text-arena-error font-medium rounded-2xl transition-colors flex items-center justify-center space-x-2 ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
DangerButton.displayName = 'DangerButton';

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', hapticFeedback = true, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          if (onClick) onClick(e);
        }}
        className={`p-3 bg-arena-card hover:bg-arena-card-hover border border-white/10 text-white rounded-xl transition-colors flex items-center justify-center ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
IconButton.displayName = 'IconButton';

export const FilterButton = forwardRef<HTMLButtonElement, ButtonProps & { active?: boolean }>(
  ({ children, active, className = '', hapticFeedback = true, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          if (hapticFeedback) triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          if (onClick) onClick(e);
        }}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
          active 
            ? 'bg-arena-gold/10 border-arena-gold text-arena-gold' 
            : 'bg-arena-card border-white/10 text-arena-text-muted hover:text-white hover:bg-arena-card-hover'
        } ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
FilterButton.displayName = 'FilterButton';
