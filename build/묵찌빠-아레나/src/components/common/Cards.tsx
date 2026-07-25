import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  isHoverable?: boolean;
  isGlass?: boolean;
  onClick?: () => void;
}

export function GameCard({ children, className = '', isHoverable = false, isGlass = false, onClick }: CardProps) {
  const baseClasses = `rounded-3xl p-6 ${isGlass ? 'glass-panel' : 'bg-arena-card border border-white/5'}`;
  
  if (isHoverable || onClick) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`${baseClasses} cursor-pointer transition-shadow hover:shadow-xl hover:shadow-arena-gold/5 ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
}

export function PlayerCard({ 
  name, 
  profileImg, 
  isTurn, 
  isWinner,
  isLoser,
  className = '' 
}: { 
  name: string; 
  profileImg?: string; 
  isTurn?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  className?: string;
}) {
  let stateClasses = 'border-white/10';
  if (isTurn) stateClasses = 'neon-gold-border';
  if (isWinner) stateClasses = 'border-arena-success shadow-[0_0_15px_rgba(16,185,129,0.3)]';
  if (isLoser) stateClasses = 'border-arena-error/50 opacity-50';

  return (
    <div className={`relative flex flex-col items-center p-4 bg-arena-card rounded-2xl border transition-all duration-300 ${stateClasses} ${className}`}>
      <div className="w-16 h-16 rounded-full bg-arena-card-hover border-2 border-white/10 mb-3 overflow-hidden flex items-center justify-center">
        {profileImg ? (
          <img src={profileImg} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">👤</span>
        )}
      </div>
      <span className="font-medium text-white truncate w-full text-center">{name}</span>
      
      {isTurn && (
        <motion.div 
          layoutId="turn-indicator"
          className="absolute -top-2 left-1/2 -translate-x-1/2 bg-arena-gold text-arena-bg text-xs font-bold px-3 py-1 rounded-full shadow-lg"
        >
          공격
        </motion.div>
      )}
    </div>
  );
}
