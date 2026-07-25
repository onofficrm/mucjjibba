import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

export function GradeBadge({ grade, className = '' }: { grade: string, className?: string }) {
  // Map grades to colors
  const gradeColors: Record<string, string> = {
    '브론즈': 'bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/50',
    '실버': 'bg-slate-300/20 text-slate-300 border-slate-300/50',
    '골드': 'bg-arena-gold/20 text-arena-gold border-arena-gold/50',
    '플래티넘': 'bg-arena-cyan/20 text-arena-cyan border-arena-cyan/50',
    '다이아': 'bg-purple-400/20 text-purple-400 border-purple-400/50',
    '마스터': 'bg-rose-500/20 text-rose-500 border-rose-500/50',
  };

  const colorClass = gradeColors[grade] || 'bg-white/10 text-white border-white/20';

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${colorClass} ${className}`}>
      {grade}
    </span>
  );
}

export function WinningStreakBadge({ count, className = '' }: { count: number, className?: string }) {
  if (count < 2) return null;
  
  return (
    <div className={`flex items-center space-x-1 bg-gradient-to-r from-arena-warning to-arena-error px-3 py-1 rounded-full shadow-lg ${className}`}>
      <span className="text-white text-xs font-black italic">{count}연승!🔥</span>
    </div>
  );
}

export function StatusBadge({ status, type = 'default', className = '' }: { status: string, type?: 'success' | 'warning' | 'error' | 'info' | 'default', className?: string }) {
  const typeClasses = {
    success: 'bg-arena-success/10 text-arena-success border-arena-success/30',
    warning: 'bg-arena-warning/10 text-arena-warning border-arena-warning/30',
    error: 'bg-arena-error/10 text-arena-error border-arena-error/30',
    info: 'bg-arena-cyan/10 text-arena-cyan border-arena-cyan/30',
    default: 'bg-white/5 text-arena-text-muted border-white/10',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${typeClasses[type]} ${className}`}>
      {status}
    </span>
  );
}

export function PointDisplay({ points, size = 'md', className = '' }: { points: number, size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  // Animated number counter
  const springValue = useSpring(points, { bounce: 0, duration: 1000 });
  const displayValue = useTransform(springValue, (latest: any) => Math.round(latest).toLocaleString());

  useEffect(() => {
    springValue.set(points);
  }, [points, springValue]);

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
  };

  return (
    <div className={`flex items-center space-x-2 font-bold ${className}`}>
      <span className="text-arena-gold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">P</span>
      <motion.span className={`text-white tracking-tight ${sizes[size]}`}>
        {displayValue}
      </motion.span>
    </div>
  );
}
