import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Volume2, VolumeX, Info, Keyboard } from 'lucide-react';
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
import { HandGlyph } from '@/components/game/HandGlyph';

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
  compact = false,
}: {
  src: string;
  flip?: boolean;
  shake?: boolean;
  highlight?: 'gold' | 'red' | null;
  idle?: boolean;
  compact?: boolean;
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
      className={`relative ${
        compact
          ? 'w-[18%] max-w-[72px] sm:max-w-[88px] md:max-w-[110px] aspect-[3/4] opacity-80'
          : 'w-[38%] max-w-[160px] md:max-w-[200px] aspect-[3/4]'
      } ${
        highlight === 'gold'
          ? 'drop-shadow-[0_0_18px_rgba(245,158,11,0.7)]'
          : highlight === 'red'
            ? 'drop-shadow-[0_0_18px_rgba(239,68,68,0.7)]'
            : ''
      }`}
    >
      {highlight && (
        <motion.div
          className={`absolute -inset-2 rounded-[2.2rem] pointer-events-none ${
            highlight === 'gold' ? 'bg-arena-gold/25' : 'bg-rose-500/25'
          } blur-md`}
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      )}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden border-[3px] border-black bg-gradient-to-b from-[#1a1420] to-[#0a0c12] shadow-[4px_6px_0_#000]">
        <img
          src={src}
          alt=""
          className={`w-full h-full object-cover object-[center_12%] ${flip ? 'scale-x-[-1]' : ''}`}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      </div>
      {highlight === 'gold' && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-gold text-black px-1.5 py-0.5 rounded-full border border-black whitespace-nowrap">
          공격!
        </span>
      )}
      {highlight === 'red' && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full border border-black whitespace-nowrap">
          공격!
        </span>
      )}
    </motion.div>
  );
}

/** 중앙 초대형 손 — 대기/? / 선택 / 공개 충돌 */
function StageHandDuel({
  myHand,
  opponentHand,
  phase,
  isSpinning,
  canPickNow,
  timeLeft,
  flyHand,
  skinId = 'classic',
  comboHits = 0,
}: {
  myHand: Hand | null;
  opponentHand: Hand | null;
  phase: GamePhase;
  isSpinning: boolean;
  canPickNow: boolean;
  timeLeft: number;
  flyHand: Hand | null;
  skinId?: string;
  comboHits?: number;
}) {
  const reduceMotion = gameSettings.options.performanceMode === 'low';
  const reveal = phase === 'REVEAL' || phase === 'ROUND_RESULT';
  const showOpp = reveal && !!opponentHand;
  const myDisplay: Hand | '?' | 'lock' = myHand ?? (flyHand ? flyHand : '?');
  const oppDisplay: Hand | '?' | 'lock' =
    showOpp && opponentHand
      ? opponentHand
      : phase === 'WAITING_OPPONENT' || (opponentHand && !reveal)
        ? 'lock'
        : '?';

  const clash = reveal && !!myHand && !!opponentHand;
  const timerPct = Math.max(0, Math.min(1, timeLeft / 5));
  const ringColor = timeLeft <= 3 ? '#ef4444' : '#f59e0b';

  const handMotion = (hand: Hand, side: 'me' | 'opp') => {
    if (reduceMotion) return {};
    if (clash) {
      if (hand === 'ROCK') {
        return side === 'me'
          ? { scale: [0.6, 1.35, 1.1], y: [40, -8, 0], rotate: [-20, 8, 0] }
          : { scale: [0.6, 1.35, 1.1], y: [40, -8, 0], rotate: [20, -8, 0] };
      }
      if (hand === 'SCISSORS') {
        return side === 'me'
          ? { scale: [0.5, 1.4, 1.1], x: [30, -10, 0], rotate: [-40, 15, -5] }
          : { scale: [0.5, 1.4, 1.1], x: [-30, 10, 0], rotate: [40, -15, 5] };
      }
      return side === 'me'
        ? { scale: [0.4, 1.45, 1.15], rotate: [-30, 0] }
        : { scale: [0.4, 1.45, 1.15], rotate: [30, 0] };
    }
    if (side === 'me' && flyHand && myHand === flyHand) {
      return { scale: [0.3, 1.25, 1], y: [80, -10, 0], opacity: [0, 1, 1] };
    }
    return canPickNow && !myHand
      ? { y: [0, -6, 0], scale: [1, 1.03, 1] }
      : { scale: 1 };
  };

  return (
    <div className="relative w-full max-w-xl mx-auto flex items-center justify-center gap-1.5 sm:gap-3 md:gap-6 px-1 sm:px-2 min-h-[168px] sm:min-h-[160px] md:min-h-[200px]">
      {/* Countdown ring behind hands when picking */}
      {canPickNow && (
        <svg className="absolute w-40 h-40 sm:w-40 sm:h-40 md:w-48 md:h-48 -z-0 opacity-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - timerPct) }}
            transition={{ duration: 0.35 }}
            transform="rotate(-90 50 50)"
            style={{ filter: `drop-shadow(0 0 8px ${ringColor})` }}
          />
        </svg>
      )}

      {/* Clash flash */}
      <AnimatePresence>
        {clash && isSpinning === false && phase === 'REVEAL' && (
          <motion.div
            key="clash-flash"
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 1.8] }}
            transition={{ duration: 0.45 }}
          >
            <span className="text-5xl md:text-7xl font-black text-white" style={{ textShadow: '0 0 30px #fff' }}>
              💥
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My giant hand */}
      <motion.div
        key={`my-${String(myDisplay)}-${phase}`}
        className="relative z-10 flex flex-col items-center"
        initial={reduceMotion ? false : { scale: 0.7, opacity: 0.5 }}
        animate={
          typeof myDisplay === 'string' && myDisplay !== '?' && myDisplay !== 'lock'
            ? handMotion(myDisplay, 'me')
            : { scale: 1, opacity: 0.85, y: canPickNow ? [0, -4, 0] : 0 }
        }
        transition={
          clash
            ? { duration: 0.55, type: 'spring', bounce: 0.45 }
            : flyHand
              ? { duration: 0.45, type: 'spring', bounce: 0.5 }
              : { duration: 2.2, repeat: canPickNow && !myHand ? Infinity : 0, ease: 'easeInOut' }
        }
      >
        <span
          className="leading-none select-none"
          style={{
            filter:
              myHand
                ? 'drop-shadow(0 0 24px rgba(56,189,248,0.55))'
                : 'drop-shadow(0 0 12px rgba(255,255,255,0.15))',
          }}
        >
          {myDisplay === '?' ? (
            <span className="text-[6.75rem] sm:text-[6rem] md:text-[8rem]">❔</span>
          ) : myDisplay === 'lock' ? (
            <span className="text-[6.75rem] sm:text-[6rem] md:text-[8rem]">🔒</span>
          ) : (
            <HandGlyph
              hand={myDisplay}
              theme={skinId}
              size={120}
              comboBoost={comboHits}
              className="w-[6.75rem] h-[6.75rem] sm:w-[6.5rem] sm:h-[6.5rem] md:w-[8.25rem] md:h-[8.25rem]"
            />
          )}
        </span>
        {myHand && (
          <span className="mt-1 text-xs md:text-sm font-black text-sky-300 drop-shadow-[0_1px_0_#000]">
            {HAND_KO[myHand]}
          </span>
        )}
      </motion.div>

      <motion.div
        className="relative z-10 font-display text-xl md:text-2xl font-black text-white/40 px-1"
        animate={clash && !reduceMotion ? { scale: [1, 1.6, 1], opacity: [0.4, 1, 0.5] } : {}}
        transition={{ duration: 0.4 }}
      >
        VS
      </motion.div>

      {/* Opponent giant hand */}
      <motion.div
        key={`opp-${String(oppDisplay)}-${phase}`}
        className="relative z-10 flex flex-col items-center"
        initial={reduceMotion ? false : { scale: 0.7, opacity: 0.5 }}
        animate={
          typeof oppDisplay === 'string' && oppDisplay !== '?' && oppDisplay !== 'lock'
            ? handMotion(oppDisplay, 'opp')
            : isSpinning && !reduceMotion
              ? { rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }
              : { scale: 1, opacity: 0.85 }
        }
        transition={
          clash
            ? { delay: 0.18, duration: 0.55, type: 'spring', bounce: 0.45 }
            : isSpinning
              ? { duration: 0.35, repeat: Infinity }
              : { duration: 0.4 }
        }
      >
        <span
          className="leading-none select-none"
          style={{
            filter: showOpp
              ? 'drop-shadow(0 0 24px rgba(244,63,94,0.5))'
              : 'drop-shadow(0 0 12px rgba(255,255,255,0.15))',
          }}
        >
          {oppDisplay === '?' ? (
            <span className="text-[6.75rem] sm:text-[6rem] md:text-[8rem]">❔</span>
          ) : oppDisplay === 'lock' ? (
            <span className="text-[6.75rem] sm:text-[6rem] md:text-[8rem]">🔒</span>
          ) : (
            <HandGlyph
              hand={oppDisplay}
              theme={skinId}
              size={120}
              comboBoost={0}
              className="w-[6.75rem] h-[6.75rem] sm:w-[6.5rem] sm:h-[6.5rem] md:w-[8.25rem] md:h-[8.25rem]"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
        </span>
        {showOpp && opponentHand && (
          <span className="mt-1 text-xs md:text-sm font-black text-rose-300 drop-shadow-[0_1px_0_#000]">
            {HAND_KO[opponentHand]}
          </span>
        )}
      </motion.div>
    </div>
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
  comboHits = 0,
  handSkinId,
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
  comboHits?: number;
  handSkinId?: string;
}) {
  const skinId = handSkinId || gameSettings.options.handSkinId || 'classic';
  const [showKeyGuide, setShowKeyGuide] = useState<boolean>(
    () => gameSettings.options.showKeyGuide,
  );
  // 물리 키보드(=PC) 환경에서만 단축키 가이드를 노출
  const [hasKeyboard, setHasKeyboard] = useState(false);
  const [flyHand, setFlyHand] = useState<Hand | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia?.('(pointer: fine)').matches;
    setHasKeyboard(!!fine);
  }, []);

  useEffect(() => {
    if (!myHand) {
      setFlyHand(null);
      return;
    }
    setFlyHand(myHand);
    const t = window.setTimeout(() => setFlyHand(null), 500);
    return () => clearTimeout(t);
  }, [myHand]);

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

  const resultBanner =
    roundMessage.includes('이겼') || roundMessage === 'WIN'
      ? 'YOU WIN!'
      : roundMessage.includes('아쉬') || roundMessage === 'LOSE'
        ? 'YOU LOSE!'
        : roundMessage.includes('비겼') || roundMessage.toLowerCase().includes('draw')
          ? 'DRAW'
          : null;

  const theme = getTierTheme(tier);
  const stageZoom = phase === 'REVEAL' && !gameSettings.options.reduceAnimations;

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

      {/* Stage — 중앙 초대형 손이 주인공, 파이터는 측면 윙 */}
      <motion.div
        className="relative flex-1 flex flex-col items-center justify-center min-h-0 px-2"
        animate={stageZoom ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="absolute top-1 inset-x-0 text-center px-4 z-20 pointer-events-none">
          <p className="text-sm md:text-base font-black text-white/90 drop-shadow-[0_2px_0_#000]">
            {actionText}
          </p>
          {attacker && (
            <p className="text-[11px] font-bold text-amber-300 mt-0.5">
              {attacker === 'ME' ? '내 공격권' : '상대 공격권'}
            </p>
          )}
        </div>

        {habitHint && canPickNow && (
          <p className="absolute top-12 right-3 z-20 max-w-[42%] text-[10px] font-bold text-arena-cyan/95 bg-black/55 border border-arena-cyan/25 rounded-full px-2.5 py-1 pointer-events-none">
            힌트 · {habitHint}
          </p>
        )}

        <FloatingEmotesLayer emotes={floatingEmotes} />

        {/* Result banner overlay */}
        <AnimatePresence>
          {resultBanner && (
            <motion.div
              key={resultBanner}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35, type: 'spring', bounce: 0.45 }}
              className={`absolute top-[12%] z-40 font-display text-4xl md:text-6xl font-black tracking-tight pointer-events-none ${
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
          )}
        </AnimatePresence>

        {/* Side fighters (compact) + center giant hands */}
        <div className="relative w-full max-w-2xl flex items-center justify-between gap-0.5 sm:gap-1 md:gap-2 mt-3 sm:mt-6 md:mt-8">
          <div className="relative shrink-0">
            <Fighter
              compact
              src={myHand ? hostessForHand(myHand) : HOSTESS.play}
              shake={tableShake && phase === 'ROUND_RESULT' && roundMessage.includes('아쉬')}
              highlight={attacker === 'ME' ? 'gold' : null}
            />
            <AnimatePresence>
              {myReaction && <ReactionBubble key={myReaction} reactionId={myReaction} isMe />}
            </AnimatePresence>
          </div>

          <div className="flex-1 min-w-0">
            <StageHandDuel
              myHand={myHand}
              opponentHand={opponentHand}
              phase={phase}
              isSpinning={isSpinning}
              canPickNow={canPickNow}
              timeLeft={timeLeft}
              flyHand={flyHand}
              skinId={skinId}
              comboHits={comboHits}
            />
          </div>

          <div className="relative shrink-0">
            <Fighter
              compact
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
      </motion.div>

      {/* Controls — arcade style · 모바일 터치 우선 */}
      <div className="relative z-30 shrink-0 px-2.5 sm:px-3 pt-2 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.85rem))] bg-gradient-to-t from-black via-black/95 to-black/70 border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.65)]">
        {onSendEmote && (
          <div className="max-w-lg mx-auto mb-2">
            <EmoteQuickBar
              onSend={onSendEmote}
              cooldownRemaining={emoteCooldownMs}
              className="gap-1 sm:gap-1.5 [&_button]:w-9 [&_button]:h-9 sm:[&_button]:w-10 sm:[&_button]:h-10 md:[&_button]:w-11 md:[&_button]:h-11"
            />
          </div>
        )}
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
          {(['ROCK', 'SCISSORS', 'PAPER'] as Hand[]).map((hand) => {
            const selected = myHand === hand;
            const recommend = canPickNow && hand === recommendHand;
            const reduceMotion = gameSettings.options.performanceMode === 'low';
            const dimmed = !!myHand && !selected;
            return (
              <motion.button
                key={hand}
                type="button"
                disabled={!canPickNow}
                onClick={() => onSelectHand(hand)}
                whileTap={canPickNow && !reduceMotion ? { scale: 0.92, y: 4 } : undefined}
                animate={
                  !reduceMotion && canPickNow
                    ? selected
                      ? { scale: [1, 1.05, 1], y: [0, -4, 0] }
                      : recommend
                        ? { scale: [1, 1.04, 1] }
                        : { y: [0, -2, 0] }
                    : dimmed
                      ? { opacity: 0.4, scale: 0.96 }
                      : undefined
                }
                transition={
                  selected || recommend
                    ? { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: hand === 'SCISSORS' ? 0.15 : hand === 'PAPER' ? 0.3 : 0 }
                }
                className={`relative rounded-2xl border-[3px] border-black min-h-[9.25rem] sm:min-h-[8.25rem] md:min-h-[9rem] px-1.5 pt-2.5 pb-2.5 flex flex-col items-center justify-end shadow-[3px_4px_0_#000] transition-colors overflow-hidden touch-manipulation ${
                  !canPickNow && !selected
                    ? 'bg-slate-700/80 opacity-45'
                    : selected
                      ? 'bg-sky-400 ring-2 ring-white'
                      : recommend
                        ? 'bg-amber-400 ring-2 ring-white'
                        : 'bg-red-500 hover:bg-red-400 active:bg-red-400'
                }`}
              >
                {/* Hostess — bottom silhouette only */}
                <img
                  src={hostessForHand(hand)}
                  alt=""
                  className="absolute inset-x-0 bottom-0 h-[38%] w-full object-cover object-top pointer-events-none opacity-35"
                  style={{
                    maskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
                  }}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
                {recommend && !reduceMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-[0.9rem] ring-2 ring-white/80 pointer-events-none"
                    animate={{ opacity: [0.35, 0.9, 0.35] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                )}
                {/* QWE는 키보드가 있을 때만 */}
                {hasKeyboard && (
                  <span className="absolute top-1.5 left-1.5 z-10 text-[10px] font-black bg-black/55 text-white px-1.5 py-0.5 rounded">
                    {KEY_HINT[hand]}
                  </span>
                )}
                {selected && (
                  <motion.span
                    initial={{ scale: 1.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-1.5 right-1.5 z-20 text-[9px] font-black bg-black text-sky-300 px-1.5 py-0.5 rounded border border-sky-300/50"
                  >
                    LOCK
                  </motion.span>
                )}
                {/* Giant hand — card hero */}
                <motion.span
                  key={`${hand}-${selected ? 'on' : 'off'}-${recommend ? 'rec' : ''}`}
                  initial={reduceMotion ? false : { scale: 0.5, y: 16, opacity: 0.4 }}
                  animate={
                    reduceMotion
                      ? { scale: 1 }
                      : selected
                        ? { scale: [1, 1.14, 1], rotate: [0, -8, 8, 0], y: [0, -6, 0] }
                        : recommend
                          ? { scale: [1, 1.1, 1], rotate: [0, -10, 10, 0] }
                          : { scale: 1, rotate: 0, opacity: 1, y: 0 }
                  }
                  transition={
                    selected || recommend
                      ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                      : { type: 'spring', bounce: 0.55, duration: 0.4 }
                  }
                  className="relative z-10 leading-none"
                >
                  <HandGlyph
                    hand={hand}
                    theme={skinId}
                    size={64}
                    comboBoost={selected ? Math.max(comboHits, 1) : 0}
                    className="w-[3.75rem] h-[3.75rem] sm:w-14 sm:h-14 md:w-16 md:h-16"
                  />
                </motion.span>
                <span className="relative z-10 text-base sm:text-sm md:text-base font-black text-white drop-shadow-[0_1px_0_#000] mt-1 tracking-wide">
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
