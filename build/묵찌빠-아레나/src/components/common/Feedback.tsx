import React from "react";
import { motion } from 'motion/react';

export function ProgressBar({ progress, color = 'bg-arena-cyan', className = '' }: { progress: number, color?: string, className?: string }) {
  return (
    <div className={`h-2 w-full bg-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div 
        className={`h-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

export function CountdownTimer({ seconds, maxSeconds, onComplete, className = '' }: { seconds: number, maxSeconds: number, onComplete?: () => void, className?: string }) {
  const isWarning = seconds <= 3;
  const progress = (seconds / maxSeconds) * 100;

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <motion.div 
        key={seconds}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-3xl font-black ${isWarning ? 'text-arena-error animate-pulse' : 'text-white'}`}
      >
        {seconds}
      </motion.div>
      <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${isWarning ? 'bg-arena-error' : 'bg-arena-cyan'}`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, icon, action, className = '' }: { title: string, description: string, icon?: React.ReactNode, action?: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      {icon && <div className="text-white/20 mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-arena-text-muted mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ message = '불러오는 중...', className = '' }: { message?: string, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      <div className="w-10 h-10 border-4 border-white/10 border-t-arena-gold rounded-full animate-spin mb-4" />
      <p className="text-arena-text-muted font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({ title = '오류가 발생했습니다', message, onRetry, className = '' }: { title?: string, message?: string, onRetry?: () => void, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-arena-error/10 border border-arena-error/30 rounded-2xl ${className}`}>
      <div className="text-arena-error mb-3 text-4xl">⚠️</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      {message && <p className="text-arena-text-muted text-center mb-6">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
          다시 시도
        </button>
      )}
    </div>
  );
}

export function SkeletonLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  );
}
