import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCharacterEmoji, getHandSkinEmojis } from '@/data/decorations';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { HOSTESS } from '@/data/hostessAssets';

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

export function VsIntro({
  myInfo,
  opponentInfo,
  entryPoints,
  winningPoints,
  onComplete,
  reduceAnimations = false,
  muteAudio = false,
}: VsIntroProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const playSound = (sfx: string) => {
      if (!muteAudio) audioManager.playSFX(sfx as any);
    };

    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => {
        setStep(2);
        playSound('menu_open');
      }, 1000),
      setTimeout(() => {
        setStep(3);
        playSound('countdown_3');
        triggerHaptic('light');
      }, 1500),
      setTimeout(() => {
        setStep(4);
        playSound('countdown_3');
        triggerHaptic('light');
      }, 2000),
      setTimeout(() => {
        setStep(5);
        playSound('countdown_3');
        triggerHaptic('light');
      }, 2500),
      setTimeout(() => {
        playSound('start_sfx');
        triggerHaptic('heavy');
        onComplete();
      }, 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete, muteAudio]);

  const PlayerCard = ({ info, isMe }: { info: PlayerInfo; isMe: boolean }) => (
    <motion.div
      initial={
        reduceAnimations
          ? { opacity: 0 }
          : { x: isMe ? -48 : 48, opacity: 0 }
      }
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 220 }}
      className="flex flex-col items-center gap-2 z-20 w-[42%] max-w-[140px] min-w-0"
    >
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border-[3px] ${
          isMe ? 'border-arena-cyan shadow-[0_0_20px_rgba(34,211,238,0.35)]' : 'border-arena-error shadow-[0_0_20px_rgba(220,38,38,0.35)]'
        } flex items-center justify-center text-4xl sm:text-5xl overflow-hidden shrink-0`}
      >
        <img
          src={isMe ? HOSTESS.play : HOSTESS.spectate}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top opacity-55"
          draggable={false}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isMe ? 'from-arena-cyan/30' : 'from-arena-error/30'
          } to-transparent`}
        />
        <span className="relative z-10 drop-shadow-lg">
          {info.characterId ? getCharacterEmoji(info.characterId) : info.avatar}
        </span>
      </div>

      <div className="text-center w-full min-w-0">
        <h3 className="font-black text-white text-sm sm:text-base truncate drop-shadow-md px-1">
          {info.nickname}
        </h3>

        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 space-y-1"
            >
              <div className="flex justify-center flex-wrap gap-1">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold text-black ${
                    isMe ? 'bg-arena-cyan' : 'bg-arena-error'
                  }`}
                >
                  {info.grade}
                </span>
                {info.winStreak > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-arena-gold text-black">
                    {info.winStreak}연승
                  </span>
                )}
              </div>
              <div className="text-[9px] px-1.5 py-0.5 rounded border border-gray-600 bg-black/50 text-gray-300 font-bold truncate">
                {info.playStyle}
              </div>
              <div className="text-[10px] text-gray-400 flex justify-center gap-1">
                {getHandSkinEmojis(info.handSkinId).ROCK}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const ui = (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none overflow-hidden px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      {!reduceAnimations && (
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      )}

      {/* Safe viewport column — 잘림 방지 */}
      <div className="relative z-10 w-full max-w-lg max-h-[100dvh] flex flex-col items-center justify-center gap-3 sm:gap-5 py-4">
        {/* Players + VS row */}
        <div className="w-full flex items-start justify-between gap-2 sm:gap-4">
          <PlayerCard info={myInfo} isMe />

          <div className="flex flex-col items-center justify-center pt-2 sm:pt-4 shrink-0 min-w-[88px]">
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ scale: 2.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl sm:text-7xl font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] px-4 pb-3 pt-1"
                >
                  VS
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <PlayerCard info={opponentInfo} isMe={false} />
        </div>

        {/* Points + countdown — 플레이어 아래 (겹침/잘림 없음) */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center bg-black/70 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md w-full max-w-xs"
            >
              <div className="flex gap-6 mb-2">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 font-bold mb-0.5">참가비</span>
                  <span className="text-lg font-black text-gray-300 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-gray-600 border border-gray-400 flex items-center justify-center text-[9px]">
                      P
                    </span>
                    {entryPoints.toLocaleString()}
                  </span>
                </div>
                <div className="w-px bg-white/20 self-stretch" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-arena-gold font-bold mb-0.5">우승 상금</span>
                  <span className="text-lg font-black text-arena-gold flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-arena-gold border border-yellow-200 flex items-center justify-center text-[9px] text-black">
                      P
                    </span>
                    {winningPoints.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] leading-none">
                {step === 3 ? '3' : step === 4 ? '2' : '1'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return ui;
  return createPortal(ui, document.body);
}
