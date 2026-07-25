import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Volume2, VolumeX, Info, Lock, Keyboard } from 'lucide-react';
import { HOSTESS, hostessForHand } from '@/data/hostessAssets';
import { ConnectionBadge } from '@/components/game/ReconnectOverlay';
import type { ConnectionStatus } from '@/realtime/types';
import { gameSettings } from '@/utils/gameSettings';
import { getTierTheme } from '@/utils/tierTheme';
import type { AmbienceTier } from '@/utils/audio';
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
  idle = true,
}: {
  src: string;
  flip?: boolean;
  shake?: boolean;
  highlight?: 'gold' | 'red' | null;
  idle?: boolean;
}) {
  const reduceMotion = gameSettings.options.performanceMode === 'low';
  return (
    <motion.div
      animate={
        shake
          ? { x: [-6, 6, -4, 4, 0], rotate: [-2, 2, 0] }
          : idle && !reduceMotion
            ? { y: [0, -5, 0], scale: [1, 1.015, 1] }
            : { x: 0, rotate: 0, y: 0 }
      }
      transition={
        shake
          ? { duration: 0.35 }
          : idle && !reduceMotion
            ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
      }
      className={`relative w-[38%] max-w-[160px] md:max-w-[200px] aspect-[3/4] ${
        highlight === 'gold'
          ? 'drop-shadow-[0_0_18px_rgba(245,158,11,0.7)]'
          : highlight === 'red'
            ? 'drop-shadow-[0_0_18px_rgba(239,68,68,0.7)]'
            : ''
      }`}
    >
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden border-[3px] border-black bg-gradient-to-b from-[#1a1420] to-[#0a0c12] shadow-[4px_6px_0_#000]">
        <img
          src={src}
          alt=""
          className={`w-full h-full object-cover object-[center_12%] ${flip ? 'scale-x-[-1]' : ''}`}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
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
  tier = 'normal',
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
  tier?: AmbienceTier;
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
  const theme = getTierTheme(tier);

  return (
    <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden select-none">
      {/* Tier skin — hairline & inner frame */}
      <div className={`absolute top-0 inset-x-0 h-px z-40 bg-gradient-to-r ${theme.hairline} pointer-events-none`} />
      <div
        className={`absolute inset-1.5 md:inset-2.5 rounded-2xl border z-30 pointer-events-none ${theme.frame}`}
      />

      {/* Casino stage background — no moon (HUD readability) */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#07090f]">
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            isLastRound
              ? 'bg-[radial-gradient(ellipse_at_50%_20%,rgba(127,29,29,0.45)_0%,transparent_55%),linear-gradient(180deg,#1a0c10_0%,#0a0c12_45%,#050608_100%)]'
              : 'bg-[radial-gradient(ellipse_at_50%_18%,rgba(245,158,11,0.16)_0%,transparent_50%),linear-gradient(180deg,#121826_0%,#0a0e17_48%,#05070c_100%)]'
          }`}
        />
        {/* Spotlight cones */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[42%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-[12%] left-[18%] w-40 h-40 md:w-56 md:h-56 rounded-full bg-arena-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute top-[10%] right-[16%] w-36 h-36 md:w-52 md:h-52 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        {/* Dust particles */}
        {gameSettings.options.performanceMode === 'fancy' &&
          [...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-amber-100/50"
              style={{
                top: `${12 + ((i * 41) % 55)}%`,
                left: `${8 + ((i * 57) % 84)}%`,
              }}
              animate={{ y: [0, -18, 0], opacity: [0.15, 0.55, 0.15] }}
              transition={{ duration: 4 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
            />
          ))}
        {/* Stage floor wash */}
        <div className="absolute bottom-0 inset-x-0 h-[28%] bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute bottom-[14%] inset-x-[10%] h-px bg-gradient-to-r from-transparent via-arena-gold/35 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-6 bg-[#03050a]" />
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
            <div className="mt-0.5 flex flex-col items-center rounded-xl bg-black/75 border border-white/15 px-2.5 py-1 shadow-[0_0_20px_rgba(0,0,0,0.55)] backdrop-blur-sm">
              <div
                className={`font-display text-[9px] md:text-[10px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full border ${
                  isLastRound
                    ? 'bg-red-500/25 border-red-400/50 text-red-200'
                    : theme.badge
                }`}
              >
                {isLastRound ? 'FINAL' : theme.label}
              </div>
              <div
                className={`text-xl md:text-2xl font-black tabular-nums leading-none mt-0.5 ${
                  timeLeft <= 3 ? 'text-arena-error' : 'text-arena-gold'
                }`}
                style={{ textShadow: '0 1px 0 #000, 0 0 12px rgba(0,0,0,0.8)' }}
              >
                {timeLeft}
              </div>
            </div>
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
                transition={{ delay: 0.4, type: 'spring', bounce: 0.45 }}
                className={`font-display text-4xl md:text-6xl font-black tracking-tight ${
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

        {/* Hand reveal chips under fighters — 내 손 먼저, 상대 손은 한 박자 늦게 공개 */}
        <div className="relative z-20 w-full max-w-lg flex justify-between px-10 md:px-16 -mt-2 mb-2">
          <div className="text-3xl drop-shadow">{myHand ? HAND_EMOJI[myHand] : '❔'}</div>
          <div className="text-3xl drop-shadow">
            {phase === 'REVEAL' || phase === 'ROUND_RESULT' ? (
              opponentHand ? (
                <motion.span
                  key={`opp-${opponentHand}-${phase === 'REVEAL' ? 'r' : 'rr'}`}
                  initial={phase === 'REVEAL' ? { opacity: 0, scale: 0.4, rotate: -12 } : false}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.22, type: 'spring', bounce: 0.5 }}
                  className="inline-block"
                >
                  {HAND_EMOJI[opponentHand]}
                </motion.span>
              ) : (
                '❔'
              )
            ) : showLock ? (
              '🔒'
            ) : (
              '❔'
            )}
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
            const reduceMotion = gameSettings.options.performanceMode === 'low';
            return (
              <motion.button
                key={hand}
                type="button"
                disabled={!canPickNow}
                onClick={() => onSelectHand(hand)}
                whileTap={canPickNow && !reduceMotion ? { scale: 0.94, y: 2 } : undefined}
                animate={
                  !reduceMotion && canPickNow
                    ? selected
                      ? { scale: [1, 1.04, 1], y: [0, -2, 0] }
                      : recommend
                        ? { scale: [1, 1.03, 1] }
                        : { y: [0, -2, 0] }
                    : undefined
                }
                transition={
                  selected || recommend
                    ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: hand === 'SCISSORS' ? 0.2 : hand === 'PAPER' ? 0.4 : 0 }
                }
                className={`relative rounded-2xl border-[3px] border-black px-2 py-3 md:py-4 flex flex-col items-center gap-1 shadow-[3px_4px_0_#000] transition-colors overflow-hidden ${
                  !canPickNow
                    ? 'bg-slate-700/80 opacity-50'
                    : selected
                      ? 'bg-sky-400'
                      : recommend
                        ? 'bg-amber-400 ring-2 ring-white'
                        : 'bg-red-500 hover:bg-red-400'
                }`}
              >
                {/* 1) Hostess idle breath */}
                <motion.img
                  src={hostessForHand(hand)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-[center_12%] pointer-events-none"
                  animate={
                    !reduceMotion && canPickNow
                      ? { scale: [1.05, 1.1, 1.05], opacity: selected ? [0.45, 0.55, 0.45] : [0.32, 0.4, 0.32] }
                      : { opacity: canPickNow ? 0.35 : 0.15 }
                  }
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none" />
                {recommend && !reduceMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-[0.9rem] ring-2 ring-white/80 pointer-events-none"
                    animate={{ opacity: [0.35, 0.9, 0.35] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                )}
                <span className="relative z-10 text-[10px] font-black bg-black/50 text-white px-1.5 py-0.5 rounded">
                  {KEY_HINT[hand]}
                </span>
                {/* 2) Hand emoji pop / 3) recommend shake */}
                <motion.span
                  key={`${hand}-${selected ? 'on' : 'off'}-${recommend ? 'rec' : ''}`}
                  initial={reduceMotion ? false : { scale: 0.55, opacity: 0.4 }}
                  animate={
                    reduceMotion
                      ? { scale: 1 }
                      : selected
                        ? { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] }
                        : recommend
                          ? { scale: [1, 1.12, 1], rotate: [0, -8, 8, 0] }
                          : { scale: 1, rotate: 0, opacity: 1 }
                  }
                  transition={
                    selected || recommend
                      ? { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
                      : { type: 'spring', bounce: 0.55, duration: 0.45 }
                  }
                  className="relative z-10 text-2xl md:text-3xl drop-shadow"
                >
                  {HAND_EMOJI[hand]}
                </motion.span>
                <span className="relative z-10 text-sm md:text-base font-black text-white drop-shadow-[0_1px_0_#000]">
                  {HAND_KO[hand]}
                </span>
              </motion.button>
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
