import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hostessForHand } from '@/data/hostessAssets';
import type { ConnectionStatus } from '@/realtime/types';
import { gameSettings } from '@/utils/gameSettings';
import { getTierTheme } from '@/utils/tierTheme';
import type { AmbienceTier } from '@/utils/audio';
import { HandGlyph } from '@/components/game/HandGlyph';
import { DuelHud } from '@/components/game/DuelHud';
import {
  resolveFighterPose,
  hostessForPose,
  poseToMotionKey,
  type FighterPose,
} from '@/game/fighterPose';

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

function Fighter({
  src,
  flip = false,
  highlight = null,
  pose = 'idle',
}: {
  src: string;
  flip?: boolean;
  highlight?: 'gold' | 'red' | null;
  pose?: FighterPose;
}) {
  const reduceMotion = gameSettings.options.performanceMode === 'low';
  const motionKey = poseToMotionKey(pose);

  const bodyAnim =
    motionKey === 'hit'
      ? { x: flip ? [8, -10, 6, -4, 0] : [-8, 10, -6, 4, 0], rotate: flip ? [3, -4, 2, 0] : [-3, 4, -2, 0], y: [0, 6, 0], scale: 1 }
      : motionKey === 'win' && !reduceMotion
        ? { y: [0, -12, 0], rotate: flip ? [2, -2, 2] : [-2, 2, -2], scale: [1, 1.08, 1] }
        : motionKey === 'attack' && !reduceMotion
          ? { y: [0, -4, 0], x: flip ? [0, -6, 0] : [0, 6, 0], rotate: flip ? [3, -1, 3] : [-3, 1, -3], scale: [1, 1.06, 1] }
          : motionKey === 'ready' && !reduceMotion
            ? { y: [0, -8, 0], rotate: flip ? [2, -1, 2] : [-2, 1, -2], scale: [1, 1.04, 1] }
            : !reduceMotion
              ? { y: [0, -6, 0], rotate: flip ? [1.5, -1.5, 1.5] : [-1.5, 1.5, -1.5], scale: [1, 1.02, 1] }
              : { x: 0, rotate: 0, y: 0, scale: 1 };

  const loopDuration =
    motionKey === 'hit' ? 0.4 : motionKey === 'attack' ? 1.1 : motionKey === 'ready' || motionKey === 'win' ? 1.6 : 3.2;

  return (
    <motion.div
      animate={bodyAnim}
      transition={
        motionKey === 'hit'
          ? { duration: 0.4 }
          : { duration: loopDuration, repeat: Infinity, ease: 'easeInOut' }
      }
      className={`relative w-[5.5rem] sm:w-28 md:w-36 lg:w-40 aspect-[3/4] shrink-0 ${
        highlight === 'gold'
          ? 'drop-shadow-[0_0_20px_rgba(245,158,11,0.75)]'
          : highlight === 'red'
            ? 'drop-shadow-[0_0_20px_rgba(239,68,68,0.75)]'
            : pose === 'win'
              ? 'drop-shadow-[0_0_22px_rgba(163,230,53,0.55)]'
              : 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.55)]'
      }`}
    >
      {highlight && (
        <motion.div
          className={`absolute -inset-2 rounded-[1.6rem] pointer-events-none ${
            highlight === 'gold' ? 'bg-arena-gold/30' : 'bg-rose-500/30'
          } blur-md`}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      )}
      <div className="absolute inset-0 rounded-2xl overflow-hidden border-[3px] border-black bg-gradient-to-b from-[#1a1420] to-[#0a0c12] shadow-[4px_6px_0_#000]">
        <motion.img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-[-8%] w-[116%] h-[116%] object-cover object-[center_10%] ${
            flip ? 'scale-x-[-1]' : ''
          }`}
          initial={{ opacity: 0.7, scale: 1.04 }}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : motionKey === 'attack'
                ? { opacity: 1, y: [0, -8, 0], x: flip ? [0, 5, 0] : [0, -5, 0], scale: 1 }
                : motionKey === 'ready' || motionKey === 'win'
                  ? { opacity: 1, y: [0, -10, 0], x: flip ? [0, 4, 0] : [0, -4, 0], scale: 1 }
                  : { opacity: 1, y: [0, -6, 0], x: flip ? [0, 3, 0] : [0, -3, 0], scale: 1 }
          }
          transition={
            motionKey === 'hit'
              ? { duration: 0.25 }
              : { duration: motionKey === 'attack' ? 1.4 : motionKey === 'ready' || motionKey === 'win' ? 2.2 : 3.6, repeat: Infinity, ease: 'easeInOut' }
          }
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15 pointer-events-none" />
        {!reduceMotion && (
          <motion.div
            className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-arena-gold/15 to-transparent pointer-events-none"
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      {highlight === 'gold' && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-gold text-black px-1.5 py-0.5 rounded-full border border-black whitespace-nowrap z-10">
          공격!
        </span>
      )}
      {highlight === 'red' && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full border border-black whitespace-nowrap z-10">
          공격!
        </span>
      )}
      {pose === 'win' && !highlight && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-lime-400 text-black px-1.5 py-0.5 rounded-full border border-black whitespace-nowrap z-10">
          WIN
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
  timerLimit = 8,
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
  timerLimit?: number;
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
  const limit = Math.max(1, timerLimit);
  const timerPct = Math.max(0, Math.min(1, timeLeft / limit));
  const ringColor = timeLeft <= Math.min(3, Math.ceil(limit * 0.4)) ? '#ef4444' : '#f59e0b';

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
    <div className="relative w-full mx-auto grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_7.5rem_minmax(0,1fr)] items-center gap-x-1 sm:gap-x-3 md:gap-x-5 px-0 min-h-[170px] md:min-h-[210px]">
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
            <span className="text-3xl md:text-5xl font-black text-white" style={{ textShadow: '0 0 24px #fff' }}>
              💥
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My giant hand */}
      <motion.div
        key={`my-${String(myDisplay)}-${phase}`}
        className="relative z-10 flex w-full flex-col items-end pr-1 sm:pr-3 md:pr-6"
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
                : 'drop-shadow(0 3px 0 rgba(0,0,0,0.55))',
          }}
        >
          {myDisplay === '?' ? (
            <span
              className="inline-flex items-center justify-center w-[5.5rem] h-[5.5rem] md:w-[7rem] md:h-[7rem] rounded-2xl border-2 border-amber-300/40 bg-black/40 font-display text-5xl md:text-6xl font-black text-amber-300"
              style={{ textShadow: '0 3px 0 #000, 0 0 18px rgba(251,191,36,0.45)' }}
            >
              ?
            </span>
          ) : myDisplay === 'lock' ? (
            <span
              className="inline-flex items-center justify-center w-[5.5rem] h-[5.5rem] md:w-[7rem] md:h-[7rem] rounded-2xl border-2 border-white/20 bg-black/45 text-4xl md:text-5xl"
            >
              🔒
            </span>
          ) : (
            <HandGlyph
              hand={myDisplay}
              theme={skinId}
              size={132}
              comboBoost={comboHits}
              className="w-[7.25rem] h-[7.25rem] md:w-[8.75rem] md:h-[8.75rem]"
            />
          )}
        </span>
        <span className="mt-2 hidden md:inline-flex rounded-full border border-sky-300/30 bg-sky-950/65 px-2.5 py-1 text-xs font-black text-sky-200 shadow-[0_2px_0_#000]">
          나 · {myHand ? HAND_KO[myHand] : '선택'}
        </span>
      </motion.div>

      {/* VS + optional timer under it (링이 VS를 감싸지 않음) */}
      <div className="relative z-10 justify-self-center flex flex-col items-center gap-2">
        <motion.div
          className="flex h-11 min-w-[3.25rem] md:h-14 md:min-w-[4rem] items-center justify-center rounded-xl border border-arena-gold/35 bg-gradient-to-b from-zinc-800/95 to-black px-3 font-display text-base md:text-xl font-black tracking-[0.12em] text-arena-gold shadow-[0_4px_0_#000,inset_0_1px_0_rgba(255,255,255,0.12)]"
          animate={clash && !reduceMotion ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.85] } : {}}
          transition={{ duration: 0.4 }}
        >
          VS
        </motion.div>
        {canPickNow && (
          <div className="relative w-11 h-11 md:w-12 md:h-12">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
              <motion.circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={ringColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 18}
                animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - timerPct) }}
                transition={{ duration: 0.35 }}
                style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }}
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-sm md:text-base font-black tabular-nums ${
                timeLeft <= 3 ? 'text-arena-error' : 'text-white'
              }`}
            >
              {timeLeft}
            </span>
          </div>
        )}
      </div>

      {/* Opponent giant hand */}
      <motion.div
        key={`opp-${String(oppDisplay)}-${phase}`}
        className="relative z-10 flex w-full flex-col items-start pl-1 sm:pl-3 md:pl-6"
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
              : 'drop-shadow(0 3px 0 rgba(0,0,0,0.55))',
          }}
        >
          {oppDisplay === '?' ? (
            <span
              className="inline-flex items-center justify-center w-[5.5rem] h-[5.5rem] md:w-[7rem] md:h-[7rem] rounded-2xl border-2 border-rose-300/35 bg-black/40 font-display text-5xl md:text-6xl font-black text-rose-200"
              style={{ textShadow: '0 3px 0 #000, 0 0 18px rgba(251,113,133,0.35)' }}
            >
              ?
            </span>
          ) : oppDisplay === 'lock' ? (
            <span
              className="inline-flex items-center justify-center w-[5.5rem] h-[5.5rem] md:w-[7rem] md:h-[7rem] rounded-2xl border-2 border-white/20 bg-black/45 text-4xl md:text-5xl"
            >
              🔒
            </span>
          ) : (
            <HandGlyph
              hand={oppDisplay}
              theme={skinId}
              size={132}
              comboBoost={0}
              className="w-[7.25rem] h-[7.25rem] md:w-[8.75rem] md:h-[8.75rem]"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
        </span>
        <span className="mt-2 hidden md:inline-flex rounded-full border border-rose-300/30 bg-rose-950/65 px-2.5 py-1 text-xs font-black text-rose-200 shadow-[0_2px_0_#000]">
          상대 · {showOpp && opponentHand ? HAND_KO[opponentHand] : '비공개'}
        </span>
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
  onToggleMute,
  onInfo,
  onSettings,
  onSelectHand,
  onToggleLayout,
  habitHint = null,
  tier = 'normal',
  comboHits = 0,
  handSkinId,
  onFire = false,
  jackpot = false,
  winner = null,
  ruleShortLabel = '3판2승',
  lifeBarMax = 2,
  bannedHands = [],
  timerLimit = 8,
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
  onToggleMute: () => void;
  onInfo: () => void;
  onSettings?: () => void;
  onSelectHand: (hand: Hand) => void;
  onToggleLayout: () => void;
  habitHint?: string | null;
  tier?: AmbienceTier;
  comboHits?: number;
  handSkinId?: string;
  onFire?: boolean;
  jackpot?: boolean;
  winner?: PlayerId | null;
  ruleShortLabel?: string;
  lifeBarMax?: number;
  bannedHands?: Hand[];
  /** 선택 제한 시간(초) — 타이머 링 기준 */
  timerLimit?: number;
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
      ? { text: '따냈다!', kind: 'win' as const }
      : roundMessage.includes('아쉬') || roundMessage === 'LOSE'
        ? { text: '놓쳤다!', kind: 'lose' as const }
        : roundMessage.includes('비겼') || roundMessage.toLowerCase().includes('draw')
          ? { text: '비겼다!', kind: 'draw' as const }
          : null;

  const theme = getTierTheme(tier);
  const stageZoom = phase === 'REVEAL' && !isSpinning && !gameSettings.shouldReduceAnimations();
  const myPose = resolveFighterPose({
    side: 'me',
    phase,
    attacker,
    myHand,
    canPickNow,
    roundMessage,
    winner,
  });
  const oppPose = resolveFighterPose({
    side: 'opp',
    phase,
    attacker,
    myHand: opponentHand,
    canPickNow: false,
    roundMessage,
    winner,
  });

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

      {/* Top HUD — 점수·타이머·공격권·연승 통합 */}
      <DuelHud
        myName={myName}
        oppName={oppName}
        myScore={myScore}
        opponentScore={opponentScore}
        timeLeft={timeLeft}
        attacker={attacker}
        connStatus={connStatus}
        tier={tier}
        isLastRound={isLastRound}
        soundEnabled={soundEnabled}
        hasKeyboard={hasKeyboard}
        showKeyGuide={showKeyGuide}
        comboHits={comboHits}
        onFire={onFire}
        jackpot={jackpot}
        ruleShortLabel={ruleShortLabel}
        lifeBarMax={lifeBarMax}
        onToggleMute={onToggleMute}
        onInfo={onInfo}
        onSettings={onSettings}
        onToggleLayout={onToggleLayout}
        toggleKeyGuide={toggleKeyGuide}
      />

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
        <div className="absolute top-0 inset-x-0 text-center px-4 z-20 pointer-events-none">
          <p className="text-sm md:text-base font-black text-white/90 drop-shadow-[0_2px_0_#000]">
            {actionText}
          </p>
        </div>

        {habitHint && canPickNow && (
          <p className="absolute top-12 right-3 z-20 max-w-[42%] text-[10px] font-bold text-arena-cyan/95 bg-black/55 border border-arena-cyan/25 rounded-full px-2.5 py-1 pointer-events-none">
            힌트 · {habitHint}
          </p>
        )}

        {/* Result banner overlay */}
        <AnimatePresence>
          {resultBanner && (
            <motion.div
              key={resultBanner.text}
              initial={{ scale: 0.6, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.35, type: 'spring', bounce: 0.4 }}
              className="absolute top-[12%] z-40 pointer-events-none flex flex-col items-center"
            >
              <span
                className={`text-3xl md:text-5xl font-black tracking-tight ${
                  resultBanner.kind === 'win'
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-arena-gold to-amber-500 drop-shadow-[0_0_24px_rgba(245,158,11,0.55)]'
                    : resultBanner.kind === 'lose'
                      ? 'text-rose-300/90 drop-shadow-[0_0_18px_rgba(244,63,94,0.4)]'
                      : 'text-sky-200/95 drop-shadow-[0_0_18px_rgba(56,189,248,0.4)]'
                }`}
              >
                {resultBanner.text}
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className={`mt-2 h-[2px] w-24 md:w-36 origin-center rounded-full ${
                  resultBanner.kind === 'win'
                    ? 'bg-gradient-to-r from-transparent via-arena-gold to-transparent'
                    : resultBanner.kind === 'lose'
                      ? 'bg-gradient-to-r from-transparent via-rose-400/70 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-sky-300/70 to-transparent'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 캐릭터 · 손 · 캐릭터 — 한 줄 정렬, 카드 크기·간격 맞춤 */}
        <div className="relative w-full max-w-5xl mx-auto flex items-end justify-center gap-2 sm:gap-4 md:gap-6 mt-5 sm:mt-7 md:mt-8 px-2 sm:px-4">
          <div className="relative shrink-0 mb-1">
            <Fighter
              src={hostessForPose('me', myPose, myHand)}
              highlight={attacker === 'ME' ? 'gold' : null}
              pose={myPose}
            />
          </div>

          <div className="relative z-10 flex-1 min-w-0 max-w-xl md:max-w-2xl">
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
              timerLimit={timerLimit}
            />
          </div>

          <div className="relative shrink-0 mb-1">
            <Fighter
              src={hostessForPose('opp', oppPose, opponentHand)}
              flip
              highlight={attacker === 'OPPONENT' ? 'red' : null}
              pose={oppPose}
            />
          </div>
        </div>
      </motion.div>

      {/* Controls — arcade style · 모바일 터치 우선 */}
      <div className="relative z-30 shrink-0 px-2.5 sm:px-3 pt-2 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.85rem))] bg-gradient-to-t from-black via-black/95 to-black/70 border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.65)]">
        {(bannedHands.length > 0 || ruleShortLabel) && (
          <div className="max-w-lg mx-auto mb-1.5 flex flex-wrap justify-center gap-1">
            <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
              {ruleShortLabel}
            </span>
            {bannedHands.map((h) => (
              <span
                key={h}
                className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full bg-violet-500/90 text-white border border-black/30"
              >
                {h === 'ROCK' ? '묵' : h === 'SCISSORS' ? '찌' : '빠'} 사용불가
              </span>
            ))}
          </div>
        )}
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
          {(['ROCK', 'SCISSORS', 'PAPER'] as Hand[]).map((hand) => {
            const selected = myHand === hand;
            const banned = bannedHands.includes(hand);
            const recommend = canPickNow && !banned && hand === recommendHand;
            const reduceMotion = gameSettings.options.performanceMode === 'low';
            const dimmed = (!!myHand && !selected) || banned;
            const canPress = canPickNow && !banned;
            return (
              <motion.button
                key={hand}
                type="button"
                disabled={!canPress}
                onClick={() => onSelectHand(hand)}
                aria-label={`${HAND_KO[hand]} 선택${banned ? ' (사용 불가)' : ''}`}
                aria-pressed={selected}
                whileTap={canPress && !reduceMotion ? { scale: 0.92, y: 4 } : undefined}
                animate={
                  !reduceMotion && canPress
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
                {banned && (
                  <span className="absolute top-1.5 right-1.5 z-10 text-[9px] font-black bg-arena-error text-white px-1.5 py-0.5 rounded">
                    금지
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
                    size={72}
                    comboBoost={selected ? Math.max(comboHits, 1) : 0}
                    className="w-[4.25rem] h-[4.25rem] sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]"
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
