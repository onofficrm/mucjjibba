import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Volume2, VolumeX, Info, Lock, Keyboard } from 'lucide-react';
import { HOSTESS, hostessForHand } from '@/data/hostessAssets';
import { ConnectionBadge } from '@/components/game/ReconnectOverlay';
import type { ConnectionStatus } from '@/realtime/types';
import { gameSettings } from '@/utils/gameSettings';
import {
  EmoteQuickBar,
  FloatingEmotesLayer,
  ReactionBubble,
  type FloatingEmote,
  type ReactionType,
} from '@/components/game/GameReactions';

type Hand = 'ROCK' | 'SCISSORS' | 'PAPER';
type PlayerId = 'ME' | 'OPPONENT';
type GamePhase =
  | 'VS_INTRO'
  | 'INIT'
  | 'ATTACK_DECISION'
  | 'SELECTING'
  | 'WAITING_OPPONENT'
  | 'REVEAL'
  | 'ROUND_RESULT'
  | 'GAME_OVER';

const HAND_KO: Record<Hand, string> = {
  ROCK: '묵',
  SCISSORS: '찌',
  PAPER: '빠',
};

const HAND_EMOJI: Record<Hand, string> = {
  ROCK: '✊',
  SCISSORS: '✌️',
  PAPER: '🖐️',
};

const KEY_HINT: Record<Hand, string> = {
  ROCK: 'Q',
  SCISSORS: 'W',
  PAPER: 'E',
};

function LifeBar({ score, max = 2, side }: { score: number; max?: number; side: 'left' | 'right' }) {
  const filled = Math.min(max, Math.max(0, score));
  const segments = Array.from({ length: max }, (_, i) => i < filled);
  return (
    <div
      className={`flex-1 h-4 md:h-5 rounded-sm border-2 border-white/90 overflow-hidden flex bg-red-700/90 ${
        side === 'right' ? 'flex-row-reverse' : ''
      }`}
    >
      {segments.map((on, i) => (
        <div
          key={i}
          className={`flex-1 h-full border-white/30 ${on ? 'bg-lime-400' : 'bg-transparent'} ${
            side === 'left' ? 'border-r' : 'border-l'
          }`}
        />
      ))}
    </div>
  );
}

function Fighter({
  src,
  flip,
  shake,
  highlight,
}: {
  src: string;
  flip?: boolean;
  shake?: boolean;
  highlight?: 'gold' | 'red' | null;
}) {
  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -4, 4, 0], rotate: [-2, 2, 0] } : { x: 0, rotate: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative w-[38%] max-w-[160px] md:max-w-[200px] aspect-[3/4] ${
        highlight === 'gold'
          ? 'drop-shadow-[0_0_18px_rgba(245,158,11,0.7)]'
          : highlight === 'red'
            ? 'drop-shadow-[0_0_18px_rgba(239,68,68,0.7)]'
            : ''
      }`}
    >
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden border-[3px] border-black bg-gradient-to-b from-[#1e3a5f] to-[#0b1220] shadow-[4px_6px_0_#000]">
        <img
          src={src}
          alt=""
          className={`w-full h-full object-cover object-top ${flip ? 'scale-x-[-1]' : ''}`}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}

export function BattleDuelStage({
  myName,
  myGrade,
  oppName,
  oppGrade,
  myScore,
  opponentScore,
  phase,
  attacker,
  myHand,
  opponentHand,
  timeLeft,
  roundMessage,
  actionText,
  canPickNow,
  recommendHand,
  soundEnabled,
  connStatus,
  tableShake,
  isSpinning,
  isLastRound,
  onExit,
  onToggleMute,
  onInfo,
  onSelectHand,
  onToggleLayout,
  onSendEmote,
  emoteCooldownMs = 0,
  floatingEmotes = [],
  habitHint = null,
  myReaction = null,
  opponentReaction = null,
}: {
  myName: string;
  myGrade: string;
  oppName: string;
  oppGrade: string;
  myScore: number;
  opponentScore: number;
  phase: GamePhase;
  attacker: PlayerId | null;
  myHand: Hand | null;
  opponentHand: Hand | null;
  timeLeft: number;
  roundMessage: string;
  actionText: string;
  canPickNow: boolean;
  recommendHand: Hand;
  soundEnabled: boolean;
  connStatus: ConnectionStatus;
  tableShake: boolean;
  isSpinning: boolean;
  isLastRound: boolean;
  onExit: () => void;
  onToggleMute: () => void;
  onInfo: () => void;
  onSelectHand: (hand: Hand) => void;
  onToggleLayout: () => void;
  onSendEmote?: (id: ReactionType) => void;
  emoteCooldownMs?: number;
  floatingEmotes?: FloatingEmote[];
  habitHint?: string | null;
  myReaction?: ReactionType | null;
  opponentReaction?: ReactionType | null;
}) {
  const [showKeyGuide, setShowKeyGuide] = useState<boolean>(
    () => gameSettings.options.showKeyGuide,
  );
  // 물리 키보드(=PC) 환경에서만 단축키 가이드를 노출
  const [hasKeyboard, setHasKeyboard] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia?.('(pointer: fine)').matches;
    setHasKeyboard(!!fine);
  }, []);

  const toggleKeyGuide = () => {
    setShowKeyGuide((prev) => {
      const next = !prev;
      gameSettings.updateOption('showKeyGuide', next);
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleKeyGuide();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const centerHand: Hand | null =
    phase === 'REVEAL' || phase === 'ROUND_RESULT'
      ? myHand
      : myHand && phase === 'WAITING_OPPONENT'
        ? myHand
        : isSpinning
          ? recommendHand
          : null;

  const resultBanner =
    roundMessage.includes('이겼') || roundMessage === 'WIN'
      ? 'YOU WIN!'
      : roundMessage.includes('아쉬') || roundMessage === 'LOSE'
        ? 'YOU LOSE!'
        : roundMessage.includes('비겼') || roundMessage.toLowerCase().includes('draw')
          ? 'DRAW'
          : null;

  const showLock = phase !== 'REVEAL' && phase !== 'ROUND_RESULT' && phase !== 'GAME_OVER' && !!opponentHand;

  return (
    <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden select-none">
      {/* Night stage background */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#071428]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f3d] via-[#0b1830] to-[#050a12]" />
        {/* Moon */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#f5f7ff] shadow-[0_0_40px_rgba(255,255,255,0.55)]" />
        {/* Stars */}
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/70 rounded-full"
            style={{
              top: `${8 + ((i * 37) % 40)}%`,
              left: `${5 + ((i * 53) % 90)}%`,
              opacity: 0.35 + (i % 5) * 0.1,
            }}
          />
        ))}
        {/* Cloud / tree silhouettes */}
        <svg className="absolute left-0 bottom-[18%] w-[42%] h-40 text-[#06101f]" viewBox="0 0 200 100" fill="currentColor">
          <ellipse cx="40" cy="70" rx="50" ry="28" />
          <ellipse cx="90" cy="60" rx="40" ry="22" />
          <path d="M120 100 L135 30 L150 100 Z" />
          <path d="M145 100 L160 45 L175 100 Z" />
        </svg>
        <svg className="absolute right-0 bottom-[16%] w-[48%] h-48 text-[#06101f]" viewBox="0 0 220 120" fill="currentColor">
          <rect x="130" y="40" width="50" height="80" />
          <rect x="120" y="25" width="70" height="18" />
          <rect x="125" y="10" width="60" height="16" />
          <rect x="135" y="0" width="40" height="12" />
          <ellipse cx="40" cy="90" rx="55" ry="25" />
        </svg>
        <div className="absolute bottom-0 inset-x-0 h-[22%] bg-gradient-to-t from-[#03060c] via-[#071018] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-8 bg-[#02040a]" />
      </div>

      {/* Top HUD */}
      <div className="relative z-20 px-3 pt-3 md:px-6 flex items-start gap-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onExit}
            className="w-9 h-9 rounded-lg bg-black/50 border-2 border-white/20 flex items-center justify-center text-white/80"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="w-9 h-9 rounded-lg bg-black/50 border-2 border-white/20 flex items-center justify-center text-white/80"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-red-600 border-2 border-black flex items-center justify-center font-black text-white text-lg shadow-[2px_2px_0_#000]">
              1
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-[10px] font-black text-amber-300 leading-none">1P</div>
              <div className="text-xs font-black text-white truncate max-w-[72px]">{myName}</div>
            </div>
          </div>
          <LifeBar score={myScore} side="left" />

          <div className="flex flex-col items-center shrink-0 px-1">
            <ConnectionBadge status={connStatus} />
            <div className="text-[10px] md:text-xs font-black">
              <span className="text-amber-300">Level</span>{' '}
              <span className="text-white">{isLastRound ? 'Last' : 'Normal'}</span>
            </div>
            <div className="text-lg md:text-xl font-black text-white tabular-nums drop-shadow">{timeLeft}</div>
          </div>

          <LifeBar score={opponentScore} side="right" />
          <div className="flex items-center gap-1.5 min-w-0 flex-row-reverse">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-red-600 border-2 border-black flex items-center justify-center font-black text-white text-lg shadow-[2px_2px_0_#000]">
              2
            </div>
            <div className="hidden sm:block min-w-0 text-right">
              <div className="text-[10px] font-black text-amber-300 leading-none">2P</div>
              <div className="text-xs font-black text-white truncate max-w-[72px]">{oppName}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5">
          {hasKeyboard && (
            <button
              type="button"
              onClick={toggleKeyGuide}
              title="단축키 가이드 (H)"
              className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-colors ${
                showKeyGuide
                  ? 'bg-amber-400/90 border-black text-black shadow-[2px_2px_0_#000]'
                  : 'bg-black/50 border-white/20 text-white/80'
              }`}
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onInfo}
            className="w-9 h-9 rounded-lg bg-black/50 border-2 border-white/20 flex items-center justify-center text-white/80"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleLayout}
            className="px-2 h-9 rounded-lg bg-amber-400/90 border-2 border-black text-[10px] font-black text-black shadow-[2px_2px_0_#000]"
          >
            심플
          </button>
        </div>
      </div>

      {/* Grades row (mobile) */}
      <div className="relative z-20 px-4 mt-1 flex justify-between text-[10px] font-bold text-white/70 sm:hidden">
        <span>
          {myGrade} · {myName}
        </span>
        <span>
          {oppName} · {oppGrade}
        </span>
      </div>

      {/* Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-end pb-2 min-h-0">
        <div className="absolute top-[8%] inset-x-0 text-center px-4 z-20">
          <p className="text-sm md:text-base font-black text-white/90 drop-shadow-[0_2px_0_#000]">
            {actionText}
          </p>
          {attacker && (
            <p className="text-[11px] font-bold text-amber-300 mt-1">
              {attacker === 'ME' ? '내 공격권' : '상대 공격권'}
            </p>
          )}
          {habitHint && canPickNow && (
            <p className="mt-2 inline-flex max-w-[90%] mx-auto text-[10px] md:text-[11px] font-bold text-arena-cyan/95 bg-black/55 border border-arena-cyan/25 rounded-full px-3 py-1">
              힌트 · {habitHint}
            </p>
          )}
        </div>

        <FloatingEmotesLayer emotes={floatingEmotes} />

        {/* Big move glyph */}
        <div className="absolute top-[22%] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <AnimatePresence mode="wait">
            {resultBanner ? (
              <motion.div
                key={resultBanner}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-4xl md:text-6xl font-black tracking-tight ${
                  resultBanner.includes('WIN')
                    ? 'text-lime-300'
                    : resultBanner.includes('LOSE')
                      ? 'text-red-400'
                      : 'text-amber-300'
                }`}
                style={{
                  WebkitTextStroke: '3px #000',
                  textShadow: '0 4px 0 #000, 0 0 20px rgba(0,0,0,0.5)',
                }}
              >
                {resultBanner}
              </motion.div>
            ) : centerHand ? (
              <motion.div
                key={centerHand}
                initial={{ scale: 0.6, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-6xl md:text-8xl font-black text-sky-300"
                style={{
                  WebkitTextStroke: '4px #0b1220',
                  textShadow: '0 6px 0 #000, 0 0 24px rgba(56,189,248,0.45)',
                }}
              >
                {HAND_KO[centerHand]}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          className={`relative z-10 w-full max-w-lg flex items-end justify-center gap-3 md:gap-8 px-4 ${
            tableShake ? '' : ''
          }`}
        >
          <div className="relative">
            <Fighter
              src={myHand ? hostessForHand(myHand) : HOSTESS.play}
              shake={tableShake && phase === 'ROUND_RESULT' && roundMessage.includes('아쉬')}
              highlight={attacker === 'ME' ? 'gold' : null}
            />
            <AnimatePresence>
              {myReaction && <ReactionBubble key={myReaction} reactionId={myReaction} isMe />}
            </AnimatePresence>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-[42%] z-20">
            {showLock && (
              <div className="w-12 h-12 rounded-xl bg-black/70 border-2 border-white/30 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white/70" />
              </div>
            )}
          </div>

          <div className="relative">
            <Fighter
              src={
                phase === 'REVEAL' || phase === 'ROUND_RESULT'
                  ? opponentHand
                    ? hostessForHand(opponentHand)
                    : HOSTESS.spectate
                  : HOSTESS.spectate
              }
              flip
              shake={tableShake && phase === 'ROUND_RESULT' && (roundMessage.includes('이겼') || roundMessage === 'WIN')}
              highlight={attacker === 'OPPONENT' ? 'red' : null}
            />
            <AnimatePresence>
              {opponentReaction && (
                <ReactionBubble key={opponentReaction} reactionId={opponentReaction} isMe={false} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Hand reveal chips under fighters */}
        <div className="relative z-20 w-full max-w-lg flex justify-between px-10 md:px-16 -mt-2 mb-2">
          <div className="text-3xl drop-shadow">{myHand ? HAND_EMOJI[myHand] : '❔'}</div>
          <div className="text-3xl drop-shadow">
            {phase === 'REVEAL' || phase === 'ROUND_RESULT'
              ? opponentHand
                ? HAND_EMOJI[opponentHand]
                : '❔'
              : showLock
                ? '🔒'
                : '❔'}
          </div>
        </div>
      </div>

      {/* Controls — arcade style */}
      <div className="relative z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {onSendEmote && (
          <div className="max-w-lg mx-auto mb-2.5">
            <EmoteQuickBar onSend={onSendEmote} cooldownRemaining={emoteCooldownMs} />
          </div>
        )}
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2 md:gap-3">
          {(['ROCK', 'SCISSORS', 'PAPER'] as Hand[]).map((hand) => {
            const selected = myHand === hand;
            const recommend = canPickNow && hand === recommendHand;
            return (
              <button
                key={hand}
                type="button"
                disabled={!canPickNow}
                onClick={() => onSelectHand(hand)}
                className={`relative rounded-2xl border-[3px] border-black px-2 py-3 md:py-4 flex flex-col items-center gap-1 shadow-[3px_4px_0_#000] active:translate-y-0.5 active:shadow-[1px_2px_0_#000] transition-all overflow-hidden ${
                  !canPickNow
                    ? 'bg-slate-700/80 opacity-50'
                    : selected
                      ? 'bg-sky-400'
                      : recommend
                        ? 'bg-amber-400 ring-2 ring-white'
                        : 'bg-red-500 hover:bg-red-400'
                }`}
              >
                <img
                  src={hostessForHand(hand)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-35 pointer-events-none"
                  draggable={false}
                />
                <span className="relative z-10 text-[10px] font-black bg-black/50 text-white px-1.5 py-0.5 rounded">
                  {KEY_HINT[hand]}
                </span>
                <span className="relative z-10 text-2xl md:text-3xl drop-shadow">{HAND_EMOJI[hand]}</span>
                <span className="relative z-10 text-sm md:text-base font-black text-white drop-shadow-[0_1px_0_#000]">
                  {HAND_KO[hand]}
                </span>
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {hasKeyboard && showKeyGuide && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="max-w-lg mx-auto mt-2.5 rounded-xl border border-white/10 bg-black/55 backdrop-blur-sm px-3 py-2 flex items-center justify-center gap-3 flex-wrap"
            >
              <span className="text-[10px] font-black text-arena-gold/90 tracking-wider uppercase">
                단축키
              </span>
              {(
                [
                  ['Q', '묵'],
                  ['W', '찌'],
                  ['E', '빠'],
                ] as const
              ).map(([key, ko]) => (
                <span key={key} className="flex items-center gap-1.5 text-white/85">
                  <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md bg-white/10 border border-white/25 text-[11px] font-black">
                    {key}
                  </kbd>
                  <span className="text-xs font-bold">{ko}</span>
                </span>
              ))}
              <span className="text-[10px] text-white/40 font-bold">H · 가이드 접기</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
