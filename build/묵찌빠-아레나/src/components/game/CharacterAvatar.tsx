import React from 'react';
import { motion } from 'motion/react';
import { getCharacterEmoji } from '@/data/decorations';

interface CharacterAvatarProps {
  characterId: string;
  isMe: boolean;
  phase: string;
  attacker: 'ME' | 'OPPONENT' | null;
  winner: 'ME' | 'OPPONENT' | null;
  hand: string | null;
  emojiFallback?: string;
}

export function CharacterAvatar({ characterId, isMe, phase, attacker, winner, hand, emojiFallback }: CharacterAvatarProps) {
  const emoji = characterId ? getCharacterEmoji(characterId) : (emojiFallback || '👤');

  // Determine the current animation state based on game phase
  let animateProps = {};
  let transitionProps = {};

  if (phase === 'INIT' || phase === 'WAITING_OPPONENT') {
    // 대기 / 게임 입장
    animateProps = { y: [0, -5, 0] };
    transitionProps = { repeat: Infinity, duration: 2, ease: "easeInOut" };
  } else if (phase === 'SELECTING' && hand) {
    // 묵/찌/빠 선택
    if (hand === 'ROCK') {
      animateProps = { scale: [1, 0.9, 1.1, 1], y: [0, 5, -2, 0] }; // 단단한 느낌
    } else if (hand === 'SCISSORS') {
      animateProps = { scale: [1, 1.1, 1], rotate: [0, isMe ? 15 : -15, isMe ? -5 : 5, 0] }; // 날카로운 느낌
    } else {
      animateProps = { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }; // 부드러운 느낌
    }
    transitionProps = { duration: 0.4 };
  } else if (phase === 'SELECTING' && attacker) {
    // 공격권 획득 / 상실
    if ((isMe && attacker === 'ME') || (!isMe && attacker === 'OPPONENT')) {
      animateProps = { scale: [1, 1.2, 1], filter: ['drop-shadow(0 0 0px rgba(245,158,11,0))', 'drop-shadow(0 0 15px rgba(245,158,11,1))', 'drop-shadow(0 0 5px rgba(245,158,11,0.5))'] };
      transitionProps = { duration: 0.5 };
    } else {
      animateProps = { opacity: 0.5, scale: 0.9 };
      transitionProps = { duration: 0.3 };
    }
  } else if (phase === 'ROUND_RESULT') {
    // 라운드 승리
    if ((isMe && winner === 'ME') || (!isMe && winner === 'OPPONENT')) {
      animateProps = { y: [0, -15, 0], scale: [1, 1.1, 1] };
      transitionProps = { duration: 0.5, ease: "easeOut" };
    } else if (winner) {
      animateProps = { rotate: isMe ? -15 : 15, x: isMe ? -5 : 5, opacity: 0.7 };
      transitionProps = { duration: 0.3 };
    }
  } else if (phase === 'END') {
    // 최종 승리 / 패배
    if ((isMe && winner === 'ME') || (!isMe && winner === 'OPPONENT')) {
      animateProps = { y: [0, -20, 0], scale: [1, 1.2, 1], filter: 'drop-shadow(0 0 20px rgba(245,158,11,1))' };
      transitionProps = { repeat: Infinity, duration: 1 };
    } else {
      animateProps = { rotate: isMe ? -90 : 90, opacity: 0.5, y: 10 };
      transitionProps = { duration: 0.5 };
    }
  }

  return (
    <motion.div
      className="w-12 h-12 rounded-xl bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10"
      animate={animateProps}
      transition={transitionProps}
    >
      {emoji}
    </motion.div>
  );
}
