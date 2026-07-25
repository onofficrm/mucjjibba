import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCharacterEmoji, getHandSkinEmojis } from '@/data/decorations';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

interface PlayerInfo {
  nickname: string;
  grade: string;
  winStreak: number;
  playStyle: string;
  avatar: string;
  characterId: string;
  handSkinId: string;
}

interface VsIntroProps {
  myInfo: PlayerInfo;
  opponentInfo: PlayerInfo;
  entryPoints: number;
  winningPoints: number;
  onComplete: () => void;
  reduceAnimations?: boolean;
  muteAudio?: boolean;
}

export function VsIntro({ myInfo, opponentInfo, entryPoints, winningPoints, onComplete, reduceAnimations = false, muteAudio = false }: VsIntroProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const playSound = (sfx: string) => {
      if (!muteAudio) audioManager.playSFX(sfx as any);
    };

    const timers = [
      setTimeout(() => setStep(1), 500), // VS
      setTimeout(() => {
        setStep(2); // Info
        playSound('menu_open');
      }, 1000), 
      setTimeout(() => {
        setStep(3); // Points & 3
        playSound('countdown_3');
        triggerHaptic('light');
      }, 1500),
      setTimeout(() => {
        setStep(4); // 2
        playSound('countdown_3');
        triggerHaptic('light');
      }, 2000),
      setTimeout(() => {
        setStep(5); // 1
        playSound('countdown_3');
        triggerHaptic('light');
      }, 2500),
      setTimeout(() => {
        playSound('start_sfx');
        triggerHaptic('heavy');
        onComplete();
      }, 3000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const PlayerCard = ({ info, isMe }: { info: PlayerInfo, isMe: boolean }) => (
    <motion.div 
      initial={{ x: isMe ? '-100vw' : '100vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'left-4 md:left-20' : 'right-4 md:right-20'} flex flex-col items-center gap-4 z-20 w-[120px] md:w-[160px]`}
    >
      <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gray-900 border-4 ${isMe ? 'border-arena-cyan' : 'border-arena-error'} flex items-center justify-center text-6xl shadow-2xl overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-t ${isMe ? 'from-arena-cyan/20' : 'from-arena-error/20'} to-transparent`} />
        {info.characterId ? getCharacterEmoji(info.characterId) : info.avatar}
      </div>
      
      <div className="text-center w-full">
        <h3 className="font-black text-white text-lg truncate drop-shadow-md">{info.nickname}</h3>
        
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 space-y-1"
            >
              <div className="flex justify-center gap-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold text-black ${isMe ? 'bg-arena-cyan' : 'bg-arena-error'}`}>
                  {info.grade}
                </span>
                {info.winStreak > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-sm font-bold bg-arena-gold text-black">
                    {info.winStreak}연승
                  </span>
                )}
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded border border-gray-600 bg-black/50 text-gray-300 font-bold">
                {info.playStyle}
              </div>
              <div className="text-xs text-gray-400 mt-2 flex justify-center gap-1">
                스킨: {getHandSkinEmojis(info.handSkinId).ROCK}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Background Darken */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      {/* Background Grid / Effects */}
      {!reduceAnimations && (
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      )}

      {/* Players */}
      <PlayerCard info={myInfo} isMe={true} />
      <PlayerCard info={opponentInfo} isMe={false} />

      {/* VS Neon */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.div
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          >
            <div className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] mb-8">
              VS
            </div>
            
            {/* Points / Countdown */}
            {step >= 3 && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center bg-black/60 p-4 rounded-3xl border border-white/10 backdrop-blur-md"
              >
                <div className="flex gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-bold mb-1">참가비</span>
                    <span className="text-xl font-black text-gray-300 flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-gray-600 border border-gray-400 flex items-center justify-center text-[10px]">P</div>
                      {entryPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-arena-gold font-bold mb-1">우승 상금</span>
                    <span className="text-xl font-black text-arena-gold flex items-center gap-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                      <div className="w-5 h-5 rounded-full bg-arena-gold border-2 border-yellow-200 flex items-center justify-center text-[10px] text-black">P</div>
                      {winningPoints.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                  {step === 3 ? '3' : step === 4 ? '2' : '1'}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
