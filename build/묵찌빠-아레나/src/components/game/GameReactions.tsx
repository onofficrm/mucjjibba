import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings } from '@/utils/gameSettings';

export type ReactionType = 'CHALLENGE' | 'GOOD' | 'CLOSE' | 'FAST' | 'SURPRISE' | 'CLAP' | 'LAUGH' | 'REMATCH';

export interface ReactionConfig {
  id: ReactionType;
  icon: string;
  text: string;
}

export const REACTIONS: ReactionConfig[] = [
  { id: 'CHALLENGE', icon: '⚔️', text: '도전!' },
  { id: 'GOOD', icon: '👍', text: '좋아!' },
  { id: 'CLOSE', icon: '🤦', text: '아깝다' },
  { id: 'FAST', icon: '⚡', text: '빠르다' },
  { id: 'SURPRISE', icon: '😲', text: '놀람' },
  { id: 'CLAP', icon: '👏', text: '박수' },
  { id: 'LAUGH', icon: '😆', text: '웃음' },
  { id: 'REMATCH', icon: '🔄', text: '다시 한 판' },
];

interface GameReactionsProps {
  onSendReaction: (reactionId: ReactionType) => void;
  cooldownRemaining: number;
}

export function ReactionButton({ onSendReaction, cooldownRemaining }: GameReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: ReactionType) => {
    if (cooldownRemaining > 0) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic('medium');
    audioManager.playSFX('btn_touch');
    onSendReaction(id);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          setIsOpen(true);
        }}
        className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900 border border-white/10 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center z-40 hover:bg-gray-800 transition-colors"
      >
        <MessageCircle className="w-6 h-6 text-arena-cyan" />
        {cooldownRemaining > 0 && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{Math.ceil(cooldownRemaining / 1000)}</span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full bg-gray-900 border-t border-white/10 rounded-t-3xl pb-safe"
            >
              <div className="px-5 pt-6 pb-2 flex justify-between items-center">
                <h2 className="text-lg font-black text-white">리액션</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 grid grid-cols-4 gap-3">
                {REACTIONS.map(reaction => (
                  <button
                    key={reaction.id}
                    onClick={() => handleSelect(reaction.id)}
                    disabled={cooldownRemaining > 0}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      cooldownRemaining > 0 
                        ? 'bg-gray-800/50 border-white/5 opacity-50' 
                        : 'bg-gray-800 border-white/10 hover:border-arena-cyan hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{reaction.icon}</span>
                    <span className="text-[10px] font-bold text-gray-300">{reaction.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/** 인매치 상시 노출 퀵바 (도발·박수·미안 등) */
export const QUICK_EMOTES: ReactionType[] = ['CHALLENGE', 'GOOD', 'CLOSE', 'CLAP', 'SURPRISE'];

interface EmoteQuickBarProps {
  onSend: (id: ReactionType) => void;
  cooldownRemaining: number;
  className?: string;
}

export function EmoteQuickBar({ onSend, cooldownRemaining, className = '' }: EmoteQuickBarProps) {
  const items = REACTIONS.filter((r) => QUICK_EMOTES.includes(r.id));
  return (
    <div
      className={`flex items-center justify-center gap-1.5 ${className}`}
      role="toolbar"
      aria-label="이모트 퀵바"
    >
      {items.map((r) => (
        <button
          key={r.id}
          type="button"
          disabled={cooldownRemaining > 0}
          title={r.text}
          onClick={() => {
            if (cooldownRemaining > 0) {
              triggerHaptic('error');
              return;
            }
            triggerHaptic('medium');
            audioManager.playSFX('btn_touch');
            onSend(r.id);
          }}
          className={`w-10 h-10 md:w-11 md:h-11 rounded-xl border flex flex-col items-center justify-center transition-all ${
            cooldownRemaining > 0
              ? 'bg-black/40 border-white/5 opacity-45'
              : 'bg-gradient-to-b from-zinc-800/95 to-zinc-950 border-white/15 hover:border-arena-gold/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] active:scale-95'
          }`}
        >
          <span className="text-base leading-none">{r.icon}</span>
        </button>
      ))}
      {cooldownRemaining > 0 && (
        <span className="text-[10px] font-black text-white/50 tabular-nums ml-1 w-5">
          {Math.ceil(cooldownRemaining / 1000)}
        </span>
      )}
    </div>
  );
}

export interface FloatingEmote {
  id: number;
  icon: string;
  side: 'me' | 'opp';
}

interface FloatingEmotesLayerProps {
  emotes: FloatingEmote[];
}

export function FloatingEmotesLayer({ emotes }: FloatingEmotesLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {emotes.map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className={`absolute bottom-[28%] text-3xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] ${
              e.side === 'me' ? 'left-[18%]' : 'right-[18%]'
            }`}
          >
            {e.icon}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ReactionBubbleProps {
  reactionId: ReactionType;
  isMe?: boolean;
}

export function ReactionBubble({ reactionId, isMe = false }: ReactionBubbleProps) {
  const reaction = REACTIONS.find(r => r.id === reactionId);

  useEffect(() => {
    if (!gameSettings.options.reactionMute) {
      audioManager.playSFX('popup_open');
    }
  }, []);

  if (!reaction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: isMe ? 20 : -20, x: isMe ? -20 : 20 }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: isMe ? -10 : 10 }}
      transition={{ type: 'spring', damping: 15 }}
      className={`absolute ${isMe ? '-top-10 -right-4' : '-bottom-10 -left-4'} bg-white text-black px-3 py-1.5 rounded-full rounded-${isMe ? 'bl' : 'tr'}-none shadow-lg z-50 flex items-center gap-2`}
    >
      <span className="text-xl">{reaction.icon}</span>
      <span className="text-xs font-black whitespace-nowrap">{reaction.text}</span>
    </motion.div>
  );
}
