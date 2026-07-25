import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, Crown, Zap, Radio, PlayCircle, Trophy, Sparkles, Swords,
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { gameSettings } from '@/utils/gameSettings';

import { DailyMissions } from '@/components/lobby/DailyMissions';
import { ActivityMarquee } from '@/components/lobby/ActivityMarquee';
import { DailyRoulette } from '@/components/lobby/DailyRoulette';
import { SeasonPassStrip } from '@/components/lobby/SeasonPassStrip';
import { HostessAvatar, HostessBackdrop } from '@/components/casino/HostessAvatar';
import { CompactRoadStrip } from '@/components/stats/RoadmapPanel';
import { DEMO_USER } from '@/data/demoData';
import { HOSTESS } from '@/data/hostessAssets';
import { getQuickStartPath, getResumePath, getResumeButtonCopy } from '@/utils/playEase';
import { useDemoWallet } from '@/hooks/useDemoWallet';

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
  },
];

const TICKER_MESSAGES = [
  { text: '🔥 GOLDKING 6연승 달성!', type: 'LIVE' },
  { text: '⚔️ VIP 테이블 1:1 진검승부 진행 중', type: 'LIVE' },
  { text: '🏆 8인 토너먼트 결승 곧 시작', type: 'TOURNAMENT' },
  { text: '👀 인기 경기 128명 관전 중', type: 'INFO' },
];

const HAND_ICONS = { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' };
const ALL_HANDS: Hand[] = ['ROCK', 'SCISSORS', 'PAPER'];

function GameTypeBadge({ type }: { type: GameType }) {
  let bg = 'bg-gray-800';
  let text = 'text-gray-400';
  let icon = null;

  if (type === 'LIVE') {
    bg = 'bg-red-500/20';
    text = 'text-red-400';
    icon = <Radio className="w-3 h-3 mr-1 animate-pulse" />;
  } else if (type === 'ARENA') {
    bg = 'bg-arena-gold/20';
    text = 'text-arena-gold';
    icon = <Sparkles className="w-3 h-3 mr-1" />;
  } else if (type === 'TOURNAMENT') {
    bg = 'bg-purple-500/20';
    text = 'text-purple-400';
    icon = <Trophy className="w-3 h-3 mr-1" />;
  } else if (type === 'AI DEMO') {
    bg = 'bg-arena-cyan/20';
    text = 'text-arena-cyan';
    icon = <Zap className="w-3 h-3 mr-1" />;
  } else if (type === 'REPLAY') {
    bg = 'bg-white/10';
    text = 'text-gray-300';
    icon = <PlayCircle className="w-3 h-3 mr-1" />;
  }

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold tracking-wide ${bg} ${text}`}
    >
      {icon}
      {type}
    </div>
  );
}

function LiveMatchCard({
  game,
  onSpectate,
  layout = 'compact',
}: {
  game: LiveGame;
  onSpectate: () => void;
  layout?: 'compact' | 'comfortable';
}) {
  const comfortable = layout === 'comfortable';
  return (
    <button
      type="button"
      onClick={onSpectate}
      className={`w-full text-left bg-zinc-950/80 border border-white/8 hover:border-arena-gold/35 rounded-2xl transition-colors ${
        comfortable ? 'px-4 py-3.5' : 'p-4 min-w-[280px]'
      }`}
    >
      <div className="flex justify-between items-center mb-2.5 gap-2">
        <GameTypeBadge type={game.type} />
        <div className="flex items-center text-[11px] text-gray-500 font-bold shrink-0">
          <Eye className="w-3.5 h-3.5 mr-1" />
          {game.spectators.toLocaleString()}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-base shrink-0">
            {game.player1.avatar}
          </div>
          <span className="font-bold text-xs truncate text-gray-200">{game.player1.name}</span>
        </div>

        <div className="flex flex-col items-center px-1.5 shrink-0">
          <div className="text-[9px] text-gray-600 font-bold leading-none">R{game.round}</div>
          <div className="font-black text-sm tracking-wider tabular-nums text-white mt-0.5">
            {game.player1.score}:{game.player2.score}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-row-reverse min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-base shrink-0">
            {game.player2.avatar}
          </div>
          <span className="font-bold text-xs truncate text-right text-gray-200">{game.player2.name}</span>
        </div>
      </div>
    </button>
  );
}

function PlayActions({
  onQuickStart,
  onResume,
  resumeCopy,
  onPractice,
  onOtherModes,
}: {
  onQuickStart: () => void;
  onResume: (() => void) | null;
  resumeCopy: { title: string; hint: string } | null;
  onPractice: () => void;
  onOtherModes: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onQuickStart}
        className="w-full relative group overflow-hidden rounded-[1.75rem] md:rounded-2xl p-[3px] bg-gradient-to-r from-arena-gold via-yellow-300 to-arena-gold shadow-[0_0_30px_rgba(245,158,11,0.3)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-arena-gold via-yellow-200 to-arena-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-black rounded-[calc(1.75rem-3px)] md:rounded-[calc(1rem-1px)] px-5 py-4 md:py-5 flex items-center justify-center gap-3 transition-transform duration-200 group-active:scale-[0.98] overflow-hidden">
          {/* Soft gold wash — no full hostess crop (avoids double-face / logo clip) */}
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-arena-gold/15 via-arena-gold/5 to-transparent pointer-events-none" />
          <HostessAvatar role="icon" size="md" pulse className="relative z-10" />
          <div className="relative z-10 text-left min-w-0">
            <span className="block text-lg md:text-xl font-black text-white tracking-wide">바로 게임 시작</span>
            <span className="block text-[11px] md:text-xs text-arena-gold font-bold">원탭 · 자동 매칭</span>
          </div>
          <Swords className="w-5 h-5 text-arena-gold relative z-10 shrink-0" />
        </div>
      </button>

      {onResume && resumeCopy && (
        <button
          type="button"
          onClick={onResume}
          className="w-full rounded-2xl px-4 py-3 bg-arena-cyan/10 border border-arena-cyan/30 text-left hover:bg-arena-cyan/15 transition-colors"
        >
          <span className="block text-sm font-bold text-arena-cyan">{resumeCopy.title}</span>
          <span className="block text-[10px] font-medium text-arena-cyan/70 mt-0.5">{resumeCopy.hint}</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPractice}
          className="rounded-2xl px-3 py-3.5 bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <HostessAvatar role="dealer" size="xs" />
          <span className="text-sm font-bold text-gray-200">무료 연습</span>
        </button>
        <button
          type="button"
          onClick={onOtherModes}
          className="rounded-2xl px-3 py-3.5 bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <HostessAvatar role="lobby" size="xs" />
          <span className="text-sm font-bold text-gray-200">다른 모드</span>
        </button>
      </div>
    </div>
  );
}

export function LobbyPage() {
  const navigate = useNavigate();
  const { openGameSelect } = useOutletContext<{ openGameSelect: () => void }>();
  const wallet = useDemoWallet();

  const [tickerIndex, setTickerIndex] = useState(0);
  const [randomHandP1, setRandomHandP1] = useState<Hand>('ROCK');
  const [randomHandP2, setRandomHandP2] = useState<Hand>('SCISSORS');

  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
    }, 3000);
    return () => clearInterval(tickerTimer);
  }, []);

  useEffect(() => {
    audioManager.playBGM('lobby');
  }, []);

  useEffect(() => {
    const handTimer = setInterval(() => {
      setRandomHandP1((prev) => ALL_HANDS[(ALL_HANDS.indexOf(prev) + 1) % 3]);
      setRandomHandP2((prev) => ALL_HANDS[(ALL_HANDS.indexOf(prev) + 2) % 3]);
    }, 300);
    return () => clearInterval(handTimer);
  }, []);

  const handleSpectate = (gameId: string, gameType?: GameType) => {
    triggerHaptic('light');
    audioManager.playSFX('game_start');
    navigate(`/spectate/${gameId}`, { state: { gameType: gameType ?? 'LIVE' } });
  };

  const resumePath = getResumePath();
  const resumeCopy = getResumeButtonCopy();
  const quickPath = getQuickStartPath();
  const playProps = {
    onQuickStart: () => {
      triggerHaptic('heavy');
      audioManager.playSFX('game_start');
      navigate(quickPath);
    },
    onResume:
      resumePath && resumePath !== quickPath
        ? () => {
            triggerHaptic('medium');
            navigate(resumePath);
          }
        : null,
    resumeCopy: resumePath && resumePath !== quickPath ? resumeCopy : null,
    onPractice: () => {
      triggerHaptic('medium');
      navigate('/game/beginner-ai');
    },
    onOtherModes: () => {
      triggerHaptic('light');
      openGameSelect();
    },
  };

  return (
    <div className="h-full bg-black text-white flex flex-col font-sans overflow-hidden relative">
      <HostessBackdrop role="lobby" opacity={0.18} className="opacity-70 md:opacity-50" />

      <div className="flex-1 overflow-y-auto relative z-10 pb-40 md:pb-10">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-5 md:px-8 pt-5 md:pt-8">
          {/* Title — 한 줄 헤더, 보조 액션만 우측 */}
          <div className="flex items-center justify-between gap-4 mb-4 md:mb-5">
            <div className="min-w-0">
              <p className="font-display text-[10px] font-black text-arena-gold/80 tracking-[0.3em] uppercase">
                Arena Lobby
              </p>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
                묵찌빠 아레나
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-arena-gold/12 text-arena-gold border border-arena-gold/25">
                  {DEMO_USER.grade}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DailyRoulette />
              <DailyMissions />
            </div>
          </div>

          {/* Desktop: 2-column / Mobile: stack */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            {/* Left: hero + featured */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Hero — 와이드 시네마틱, 얼굴 클로즈업 대신 무대 컷 */}
              <div className="relative overflow-hidden rounded-3xl h-32 md:h-40 border border-arena-gold/25 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <img
                  src={HOSTESS.arena}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-[65%_22%] scale-[1.05]"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-arena-gold/50 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-center px-5 md:px-7 max-w-[70%]">
                  <p className="font-display text-[10px] md:text-[11px] font-black text-arena-gold tracking-[0.28em] uppercase">
                    Live Tonight
                  </p>
                  <p className="text-lg md:text-2xl font-black text-white mt-1 leading-tight">
                    오늘의 아레나
                  </p>
                  <p className="text-[11px] md:text-xs text-gray-400 font-bold mt-1">
                    대표 경기 관전 · 원탭 자동 매칭
                  </p>
                </div>
              </div>

              <ActivityMarquee />

              <CompactRoadStrip />

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSpectate(FEATURED_GAME.id, FEATURED_GAME.type)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSpectate(FEATURED_GAME.id, FEATURED_GAME.type);
                  }
                }}
                className="w-full bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/8 rounded-3xl p-4 md:p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer group hover:border-arena-gold/35 transition-colors"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-arena-gold/35 to-transparent pointer-events-none" />
                {gameSettings.options.performanceMode !== 'low' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.1)_0%,_transparent_70%)] pointer-events-none" />
                )}

                <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
                  <GameTypeBadge type={FEATURED_GAME.type} />
                  <div className="flex items-center text-[11px] md:text-xs text-gray-400 font-bold">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    {FEATURED_GAME.spectators.toLocaleString()}명 관전
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-4 md:mb-6 relative z-10">
                  <div className="flex flex-col items-center gap-2 w-[30%] min-w-0">
                    <div className="relative">
                      <div
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-800 border-2 flex items-center justify-center text-2xl md:text-3xl shadow-lg ${
                          FEATURED_GAME.attacker === 'P1'
                            ? 'border-arena-gold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'border-gray-700'
                        }`}
                      >
                        {FEATURED_GAME.player1.avatar}
                      </div>
                      {FEATURED_GAME.attacker === 'P1' && (
                        <div className="absolute -top-3 -right-3 bg-arena-gold text-black rounded-full p-1 shadow-lg">
                          <Crown className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center min-w-0 w-full">
                      <span className="text-[10px] md:text-xs text-gray-400 font-bold">
                        {FEATURED_GAME.player1.grade}
                      </span>
                      <span className="font-bold text-sm md:text-base truncate max-w-full px-1 text-center">
                        {FEATURED_GAME.player1.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-[40%] min-w-0">
                    <div className="text-xs md:text-sm font-bold text-gray-400 mb-2">
                      Round {FEATURED_GAME.round}
                    </div>
                    <div className="flex gap-2 md:gap-3 items-center bg-black/60 p-2 md:p-3 rounded-xl border border-gray-800 shadow-inner">
                      <motion.div
                        key={`p1-${randomHandP1}`}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-2xl md:text-3xl w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"
                      >
                        {HAND_ICONS[randomHandP1]}
                      </motion.div>
                      <span className="text-xs md:text-sm font-black text-gray-500 italic">VS</span>
                      <motion.div
                        key={`p2-${randomHandP2}`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-2xl md:text-3xl w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"
                      >
                        {HAND_ICONS[randomHandP2]}
                      </motion.div>
                    </div>
                    <div className="text-xl md:text-3xl font-black mt-2 md:mt-3 tracking-widest text-white tabular-nums">
                      {FEATURED_GAME.player1.score} : {FEATURED_GAME.player2.score}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 w-[30%] min-w-0">
                    <div className="relative">
                      <div
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-800 border-2 flex items-center justify-center text-2xl md:text-3xl shadow-lg ${
                          FEATURED_GAME.attacker === 'P2'
                            ? 'border-arena-error shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                            : 'border-gray-700'
                        }`}
                      >
                        {FEATURED_GAME.player2.avatar}
                      </div>
                      {FEATURED_GAME.attacker === 'P2' && (
                        <div className="absolute -top-2 -right-2 bg-arena-error text-white rounded-full p-1 shadow-lg">
                          <Zap className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center min-w-0 w-full">
                      <span className="text-[10px] md:text-xs text-gray-400 font-bold">
                        {FEATURED_GAME.player2.grade}
                      </span>
                      <span className="font-bold text-sm md:text-base truncate max-w-full px-1 text-center">
                        {FEATURED_GAME.player2.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center pt-3 md:pt-4 border-t border-white/8 relative z-10">
                  <span className="text-sm font-bold text-arena-gold group-hover:text-yellow-400 transition-colors flex items-center">
                    관전하기 <PlayCircle className="w-4 h-4 ml-1.5" />
                  </span>
                </div>
              </div>

              {/* Mobile-only: season + live matches under featured */}
              <div className="lg:hidden">
                <SeasonPassStrip />
              </div>
              <div className="lg:hidden pt-1">
                <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center">
                  실시간 매치
                  <span className="ml-2 text-[10px] bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">
                    {OTHER_GAMES.length}
                  </span>
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x hide-scrollbar">
                  {OTHER_GAMES.map((game) => (
                    <div key={game.id} className="snap-start shrink-0 w-[280px]">
                      <LiveMatchCard
                        game={game}
                        onSpectate={() => handleSpectate(game.id, game.type)}
                        layout="compact"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: desktop CTA + season + live matches */}
            <aside className="hidden lg:block lg:col-span-5 xl:col-span-4">
              <div className="sticky top-4 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/85 backdrop-blur-md p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-display text-[10px] font-black text-arena-gold/80 tracking-[0.25em] uppercase">
                      Quick Start
                    </p>
                    <span className="text-xs font-black text-white tabular-nums">
                      {wallet.points.toLocaleString()} P
                    </span>
                  </div>
                  <PlayActions {...playProps} />
                </div>

                <SeasonPassStrip />

                <div>
                  <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center">
                    실시간 매치
                    <span className="ml-2 text-[10px] bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">
                      {OTHER_GAMES.length}
                    </span>
                  </h2>
                  <div className="space-y-2.5">
                    {OTHER_GAMES.map((game) => (
                      <LiveMatchCard
                        key={game.id}
                        game={game}
                        onSpectate={() => handleSpectate(game.id, game.type)}
                        layout="comfortable"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile fixed CTA only — PC에서는 우측 패널로 분리 */}
      <div className="lg:hidden absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-10 pb-safe px-4 z-20">
        <div className="max-w-md mx-auto mb-4">
          <PlayActions {...playProps} />
        </div>
        <div className="h-8 bg-gray-900 border-t border-arena-gold/20 flex items-center justify-center overflow-hidden mx-auto max-w-sm rounded-t-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-bold text-arena-gold/80 tracking-wide"
            >
              {TICKER_MESSAGES[tickerIndex].text}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
