import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, Crown, Zap, Radio, PlayCircle, Trophy, Sparkles, Swords
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { gameSettings } from '@/utils/gameSettings';

import { DailyMissions } from '@/components/lobby/DailyMissions';

type GameType = 'LIVE' | 'TOURNAMENT' | 'ARENA' | 'REPLAY' | 'AI DEMO' | 'PRACTICE';
type Hand = 'ROCK' | 'SCISSORS' | 'PAPER';

interface LiveGame {
  id: string;
  type: GameType;
  player1: { name: string; grade: string; avatar: string; score: number };
  player2: { name: string; grade: string; avatar: string; score: number };
  attacker: 'P1' | 'P2' | null;
  round: number;
  timeLeft: number;
  spectators: number;
}

const FEATURED_GAME: LiveGame = {
  id: 'game-001',
  type: 'ARENA',
  player1: { name: 'GOLDKING', grade: '다이아', avatar: '👑', score: 1 },
  player2: { name: 'CHALLENGER', grade: '골드', avatar: '🔥', score: 1 },
  attacker: 'P1',
  round: 3,
  timeLeft: 4,
  spectators: 128,
};

const OTHER_GAMES: LiveGame[] = [
  {
    id: 'game-002',
    type: 'LIVE',
    player1: { name: 'SPEEDY', grade: '실버', avatar: '⚡', score: 2 },
    player2: { name: 'SLOWPOKE', grade: '실버', avatar: '🐢', score: 0 },
    attacker: 'P2',
    round: 3,
    timeLeft: 2,
    spectators: 45,
  },
  {
    id: 'game-003',
    type: 'TOURNAMENT',
    player1: { name: 'PRO_PLAYER', grade: '마스터', avatar: '⭐', score: 1 },
    player2: { name: 'NEWBIE', grade: '입문', avatar: '🌱', score: 0 },
    attacker: 'P1',
    round: 2,
    timeLeft: 5,
    spectators: 312,
  },
  {
    id: 'game-004',
    type: 'AI DEMO',
    player1: { name: 'AI Alpha', grade: 'AI', avatar: '🤖', score: 0 },
    player2: { name: 'AI Beta', grade: 'AI', avatar: '🤖', score: 0 },
    attacker: null,
    round: 1,
    timeLeft: 5,
    spectators: 12,
  },
  {
    id: 'game-005',
    type: 'REPLAY',
    player1: { name: 'LEGEND', grade: '챔피언', avatar: '🏆', score: 2 },
    player2: { name: 'MASTER_K', grade: '마스터', avatar: '🦊', score: 1 },
    attacker: 'P1',
    round: 4,
    timeLeft: 0,
    spectators: 856,
  }
];

const TICKER_MESSAGES = [
  { text: "🔥 GOLDKING 6연승 달성!", type: 'LIVE' },
  { text: "⚔️ VIP 테이블 1:1 진검승부 진행 중", type: 'LIVE' },
  { text: "🏆 8인 토너먼트 결승 곧 시작", type: 'TOURNAMENT' },
  { text: "👀 인기 경기 128명 관전 중", type: 'INFO' },
];

const HAND_ICONS = { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' };
const ALL_HANDS: Hand[] = ['ROCK', 'SCISSORS', 'PAPER'];

function GameTypeBadge({ type }: { type: GameType }) {
  let bg = 'bg-gray-800';
  let text = 'text-gray-400';
  let icon = null;

  if (type === 'LIVE') {
    bg = 'bg-red-500/20'; text = 'text-red-400'; icon = <Radio className="w-3 h-3 mr-1 animate-pulse" />;
  } else if (type === 'ARENA') {
    bg = 'bg-arena-gold/20'; text = 'text-arena-gold'; icon = <Sparkles className="w-3 h-3 mr-1" />;
  } else if (type === 'TOURNAMENT') {
    bg = 'bg-purple-500/20'; text = 'text-purple-400'; icon = <Trophy className="w-3 h-3 mr-1" />;
  } else if (type === 'AI DEMO') {
    bg = 'bg-arena-cyan/20'; text = 'text-arena-cyan'; icon = <Zap className="w-3 h-3 mr-1" />;
  } else if (type === 'REPLAY') {
    bg = 'bg-white/10'; text = 'text-gray-300'; icon = <PlayCircle className="w-3 h-3 mr-1" />;
  }

  return (
    <div className={`flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wide ${bg} ${text}`}>
      {icon}
      {type}
    </div>
  );
}

export function LobbyPage() {
  const navigate = useNavigate();
  const { openGameSelect } = useOutletContext<{ openGameSelect: () => void }>();
  
  const [tickerIndex, setTickerIndex] = useState(0);
  const [randomHandP1, setRandomHandP1] = useState<Hand>('ROCK');
  const [randomHandP2, setRandomHandP2] = useState<Hand>('SCISSORS');

  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TICKER_MESSAGES.length);
    }, 3000);
    return () => clearInterval(tickerTimer);
  }, []);
  
  useEffect(() => {
    audioManager.playBGM('lobby');
  }, []);

  // Simulate slot animation for the featured game
  useEffect(() => {
    const handTimer = setInterval(() => {
      setRandomHandP1(prev => ALL_HANDS[(ALL_HANDS.indexOf(prev) + 1) % 3]);
      setRandomHandP2(prev => ALL_HANDS[(ALL_HANDS.indexOf(prev) + 2) % 3]);
    }, 300);
    return () => clearInterval(handTimer);
  }, []);

  const handleSpectate = (gameId: string) => {
    triggerHaptic('light');
    audioManager.playSFX('game_start');
    // For demo purposes, we'll navigate to game play with that ID
    navigate(`/spectate/${gameId}`);
  };

  const circumference = 2 * Math.PI * 14; // r=14

  return (
    <div className="h-full bg-black text-white flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* Title Area */}
        <div className="px-5 pt-6 pb-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              라이브 게임 월
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-400 mt-1">지금 진행 중인 흥미진진한 경기들을 관전하세요</p>
          </div>
          <DailyMissions />
        </div>

        {/* 1. Featured Game */}
        <div className="px-4 py-2">
          <div 
            onClick={() => handleSpectate(FEATURED_GAME.id)}
            className="w-full bg-gray-900 border border-gray-800 rounded-3xl p-4 relative overflow-hidden shadow-2xl cursor-pointer group hover:border-gray-700 transition-colors"
          >
            {/* Background Glow */}
            {gameSettings.options.performanceMode !== 'low' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.15)_0%,_transparent_70%)] pointer-events-none" />
            )}
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <GameTypeBadge type={FEATURED_GAME.type} />
              <div className="flex items-center text-xs text-gray-400 font-bold bg-black/40 px-2 py-1 rounded-full border border-white/5">
                <Eye className="w-3 h-3 mr-1" />
                {FEATURED_GAME.spectators.toLocaleString()}명
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
              {/* P1 */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gray-800 border-2 flex items-center justify-center text-2xl shadow-lg ${FEATURED_GAME.attacker === 'P1' ? 'border-arena-gold shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-gray-700'}`}>
                    {FEATURED_GAME.player1.avatar}
                  </div>
                  {FEATURED_GAME.attacker === 'P1' && (
                    <div className="absolute -top-3 -right-3 bg-arena-gold text-black rounded-full p-1 shadow-lg">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-400 font-bold">{FEATURED_GAME.player1.grade}</span>
                  <span className="font-bold text-sm truncate w-20 text-center">{FEATURED_GAME.player1.name}</span>
                </div>
              </div>

              {/* Center Arena */}
              <div className="flex flex-col items-center w-1/3">
                <div className="text-xs font-bold text-gray-500 mb-2">Round {FEATURED_GAME.round}</div>
                
                <div className="flex gap-2 items-center bg-black/60 p-2 rounded-xl border border-gray-800 shadow-inner">
                  <motion.div 
                    key={`p1-${randomHandP1}`}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl w-8 h-8 flex items-center justify-center"
                  >
                    {HAND_ICONS[randomHandP1]}
                  </motion.div>
                  <span className="text-xs font-black text-gray-600 italic">VS</span>
                  <motion.div 
                    key={`p2-${randomHandP2}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl w-8 h-8 flex items-center justify-center"
                  >
                    {HAND_ICONS[randomHandP2]}
                  </motion.div>
                </div>

                <div className="text-xl font-black mt-2 tracking-widest text-white">
                  {FEATURED_GAME.player1.score} : {FEATURED_GAME.player2.score}
                </div>
              </div>

              {/* P2 */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gray-800 border-2 flex items-center justify-center text-2xl shadow-lg ${FEATURED_GAME.attacker === 'P2' ? 'border-arena-error shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'border-gray-700'}`}>
                    {FEATURED_GAME.player2.avatar}
                  </div>
                  {FEATURED_GAME.attacker === 'P2' && (
                    <div className="absolute -top-3 -right-3 bg-arena-error text-white rounded-full p-1 shadow-lg">
                      <Zap className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-400 font-bold">{FEATURED_GAME.player2.grade}</span>
                  <span className="font-bold text-sm truncate w-20 text-center">{FEATURED_GAME.player2.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-3 border-t border-gray-800 mt-2 relative z-10">
              <span className="text-sm font-bold text-arena-gold group-hover:text-yellow-400 transition-colors flex items-center">
                관전하기 <PlayCircle className="w-4 h-4 ml-1" />
              </span>
            </div>
          </div>
        </div>

        {/* 2. Other Games Previews (Horizontal Scroll on Mobile, Grid on PC) */}
        <div className="pl-4 py-4 md:px-4">
          <h2 className="text-sm font-bold text-gray-400 mb-3 flex items-center">
            실시간 매치 <span className="ml-2 text-[10px] bg-gray-800 px-2 py-0.5 rounded-full">{OTHER_GAMES.length}</span>
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 pr-4 snap-x hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible md:pr-0">
            {OTHER_GAMES.map((game) => (
              <div 
                key={game.id}
                onClick={() => handleSpectate(game.id)}
                className="min-w-[280px] md:min-w-0 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 snap-start cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center mb-3">
                  <GameTypeBadge type={game.type} />
                  <div className="flex items-center text-[10px] text-gray-500 font-bold">
                    <Eye className="w-3 h-3 mr-1" /> {game.spectators.toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black/40 rounded-xl p-2 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lg">{game.player1.avatar}</div>
                    <span className="font-bold text-xs truncate max-w-[50px]">{game.player1.name}</span>
                  </div>
                  
                  <div className="flex flex-col items-center px-2">
                    <div className="text-[10px] text-gray-500 font-bold mb-1">R{game.round}</div>
                    <div className="font-black text-sm tracking-widest">{game.player1.score}:{game.player2.score}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-row-reverse">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lg">{game.player2.avatar}</div>
                    <span className="font-bold text-xs truncate max-w-[50px] text-right">{game.player2.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button & Ticker Area (Fixed Bottom) */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black to-transparent pt-12 pb-safe px-4 z-20">
        
        {/* Play Button */}
        <div className="max-w-md mx-auto mb-6 flex flex-col gap-3">
          <button 
            onClick={() => { triggerHaptic('heavy'); openGameSelect(); }}
            className="w-full relative group overflow-hidden rounded-[2rem] p-[3px] bg-gradient-to-r from-arena-gold via-yellow-300 to-arena-gold shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-arena-gold via-yellow-200 to-arena-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black rounded-[calc(2rem-3px)] px-6 py-5 flex items-center justify-center gap-3 transition-transform duration-200 group-active:scale-[0.98]">
              <div className="w-10 h-10 rounded-full bg-arena-gold/20 flex items-center justify-center">
                <Swords className="w-6 h-6 text-arena-gold" />
              </div>
              <span className="text-xl font-black text-white tracking-wide">나도 게임하기</span>
            </div>
          </button>
          
          <button
            onClick={() => { triggerHaptic('medium'); navigate('/game/beginner-ai'); }}
            className="w-full relative group overflow-hidden rounded-[2rem] p-[2px] bg-gray-800"
          >
            <div className="relative bg-black rounded-[calc(2rem-2px)] px-6 py-4 flex items-center justify-center gap-2 transition-transform duration-200 group-active:scale-[0.98]">
              <span className="text-sm font-bold text-gray-300">초보자 연습 (무료)</span>
            </div>
          </button>
        </div>

        {/* Ticker */}
        <div className="h-8 bg-gray-900 border-t border-gray-800 flex items-center justify-center overflow-hidden mx-auto max-w-sm rounded-t-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-bold text-gray-400 tracking-wide"
            >
              {TICKER_MESSAGES[tickerIndex].text}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
    </div>
  );
}
