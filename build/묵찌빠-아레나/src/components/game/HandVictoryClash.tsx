import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandGlyph } from '@/components/game/HandGlyph';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings } from '@/utils/gameSettings';
import {
  getMatchupKind,
  getWinningHand,
  MATCHUP_LABEL,
  VICTORY_CLASH_MS,
  type MatchupKind,
  type RpsHand,
} from '@/game/rpsMatchup';

const reduce = () =>
  gameSettings.options.reduceAnimations || gameSettings.options.performanceMode === 'low';

type Side = 'left' | 'right';

function ShredBits({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2.5 rounded-[1px] bg-amber-200/90 border border-black/40"
          style={{ left: '52%', top: '42%' }}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: (i % 2 === 0 ? -1 : 1) * (18 + (i % 4) * 14),
            y: -12 - (i % 5) * 16,
            rotate: (i - 4) * 40,
          }}
          transition={{ duration: 0.7, delay: 0.45 + i * 0.03, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

function CrackSparks({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-orange-300"
          style={{ left: '48%', top: '48%' }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos((i / 6) * Math.PI * 2) * (28 + i * 4),
            y: Math.sin((i / 6) * Math.PI * 2) * (22 + i * 3),
            scale: [0.4, 1.2, 0.2],
          }}
          transition={{ duration: 0.55, delay: 0.4 + i * 0.02 }}
        />
      ))}
    </>
  );
}

function CutScene({
  winnerSide,
  skinId,
}: {
  winnerSide: Side;
  skinId: string;
}) {
  const scissorsOnLeft = winnerSide === 'left';
  return (
    <div className="relative flex items-center justify-center w-[min(92vw,22rem)] h-36">
      {/* Paper splits after snip */}
      <motion.div
        className={`absolute ${scissorsOnLeft ? 'right-[10%]' : 'left-[10%]'} top-1/2 -translate-y-1/2 flex`}
        initial={{ opacity: 1 }}
      >
        <motion.div
          className="overflow-hidden w-9"
          initial={{ opacity: 1 }}
          animate={{ x: scissorsOnLeft ? -6 : 6, y: -8, rotate: scissorsOnLeft ? -24 : 24, opacity: 0.75 }}
          transition={{ duration: 0.5, delay: 0.48 }}
        >
          <span className={`inline-block ${scissorsOnLeft ? '' : 'scale-x-[-1]'}`} style={{ marginRight: -36 }}>
            <HandGlyph hand="PAPER" theme={skinId} size={72} />
          </span>
        </motion.div>
        <motion.div
          className="overflow-hidden w-9"
          initial={{ opacity: 1 }}
          animate={{ x: scissorsOnLeft ? 14 : -14, y: 10, rotate: scissorsOnLeft ? 28 : -28, opacity: 0.7 }}
          transition={{ duration: 0.5, delay: 0.48 }}
        >
          <span className={`inline-block ${scissorsOnLeft ? '' : 'scale-x-[-1]'}`} style={{ marginLeft: -36 }}>
            <HandGlyph hand="PAPER" theme={skinId} size={72} />
          </span>
        </motion.div>
      </motion.div>
      {/* Scissors snips */}
      <motion.div
        className={`absolute z-10 ${scissorsOnLeft ? 'left-[8%]' : 'right-[8%]'} top-1/2 -translate-y-1/2`}
        initial={{ x: scissorsOnLeft ? -48 : 48, rotate: scissorsOnLeft ? -35 : 35, scale: 0.85 }}
        animate={{
          x: [scissorsOnLeft ? -48 : 48, 0, scissorsOnLeft ? 10 : -10, 0],
          rotate: scissorsOnLeft ? [-35, 0, -16, 14, -6, 0] : [35, 0, 16, -14, 6, 0],
          scale: [0.85, 1.15, 1.22, 1.1],
        }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={scissorsOnLeft ? '' : 'inline-block scale-x-[-1]'}>
          <HandGlyph hand="SCISSORS" theme={skinId} size={80} comboBoost={2} />
        </span>
      </motion.div>
      <ShredBits active />
    </div>
  );
}

function WrapScene({
  winnerSide,
  skinId,
}: {
  winnerSide: Side;
  skinId: string;
}) {
  const paperOnLeft = winnerSide === 'left';
  return (
    <div className="relative flex items-center justify-center w-[min(92vw,22rem)] h-36">
      {/* Rock underneath */}
      <motion.div
        className="absolute z-[1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 1, opacity: 1 }}
        animate={{
          scale: [1, 0.92, 0.78],
          x: [0, -3, 3, -2, 0],
          opacity: [1, 1, 0.75],
        }}
        transition={{ duration: 0.9, delay: 0.25 }}
      >
        <span className={paperOnLeft ? 'inline-block scale-x-[-1]' : ''}>
          <HandGlyph hand="ROCK" theme={skinId} size={64} />
        </span>
      </motion.div>
      {/* Paper wraps over */}
      <motion.div
        className={`absolute z-10 ${paperOnLeft ? 'left-[6%]' : 'right-[6%]'} top-1/2 -translate-y-1/2`}
        initial={{
          x: paperOnLeft ? -56 : 56,
          scale: 0.7,
          rotate: paperOnLeft ? -20 : 20,
          opacity: 0.85,
        }}
        animate={{
          x: paperOnLeft ? 28 : -28,
          scale: [0.7, 1.05, 1.35],
          rotate: [paperOnLeft ? -20 : 20, 0, 0],
          opacity: 1,
        }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={paperOnLeft ? '' : 'inline-block scale-x-[-1]'}>
          <HandGlyph hand="PAPER" theme={skinId} size={88} comboBoost={2} />
        </span>
      </motion.div>
      {/* Squeeze ring */}
      <motion.div
        className="absolute z-[5] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-amber-300/50"
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: [1.4, 0.85, 0.7], opacity: [0, 0.7, 0] }}
        transition={{ duration: 0.7, delay: 0.35 }}
      />
    </div>
  );
}

function CrushScene({
  winnerSide,
  skinId,
}: {
  winnerSide: Side;
  skinId: string;
}) {
  const rockOnLeft = winnerSide === 'left';
  return (
    <div className="relative flex items-center justify-center w-[min(92vw,22rem)] h-36">
      {/* Scissors (loser) flattens */}
      <motion.div
        className={`absolute z-[1] ${rockOnLeft ? 'right-[18%]' : 'left-[18%]'} top-1/2 -translate-y-1/2`}
        initial={{ scale: 1, y: 0, rotate: 0 }}
        animate={{
          scaleY: [1, 1, 0.35, 0.28],
          scaleX: [1, 1.05, 1.25, 1.3],
          y: [0, 0, 10, 12],
          rotate: rockOnLeft ? [0, -8, 12, 0] : [0, 8, -12, 0],
          opacity: [1, 1, 0.85, 0.7],
        }}
        transition={{ duration: 0.85, times: [0, 0.35, 0.55, 1] }}
      >
        <span className={rockOnLeft ? 'inline-block scale-x-[-1]' : ''}>
          <HandGlyph hand="SCISSORS" theme={skinId} size={70} />
        </span>
      </motion.div>
      {/* Rock drops */}
      <motion.div
        className={`absolute z-10 ${rockOnLeft ? 'left-[14%]' : 'right-[14%]'} top-1/2 -translate-y-1/2`}
        initial={{ y: -64, scale: 0.9, rotate: rockOnLeft ? -15 : 15 }}
        animate={{
          y: [-64, -8, 6, 0],
          scale: [0.9, 1.2, 1.05, 1.12],
          rotate: rockOnLeft ? [-15, 8, -4, 0] : [15, -8, 4, 0],
        }}
        transition={{ duration: 0.75, ease: [0.34, 1.4, 0.64, 1] }}
      >
        <span className={rockOnLeft ? '' : 'inline-block scale-x-[-1]'}>
          <HandGlyph hand="ROCK" theme={skinId} size={84} comboBoost={2} />
        </span>
      </motion.div>
      <CrackSparks active />
      {/* Impact flash */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-amber-200/40 blur-md"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.6, 2] }}
        transition={{ duration: 0.45, delay: 0.38 }}
      />
    </div>
  );
}

function MatchupStage({
  kind,
  winnerSide,
  skinId,
}: {
  kind: MatchupKind;
  winnerSide: Side;
  skinId: string;
}) {
  if (kind === 'cut') return <CutScene winnerSide={winnerSide} skinId={skinId} />;
  if (kind === 'wrap') return <WrapScene winnerSide={winnerSide} skinId={skinId} />;
  return <CrushScene winnerSide={winnerSide} skinId={skinId} />;
}

/**
 * Standard 패키지 — 찌>빠 가위질 / 빠>묵 감싸기 / 묵>찌 부수기
 * playKey가 바뀌고 양손이 다른 승부일 때 중앙 오버레이로 재생
 */
export function HandVictoryClash({
  playKey,
  leftHand,
  rightHand,
  winnerSide,
  skinId = 'classic',
}: {
  playKey: number;
  leftHand: RpsHand | null;
  rightHand: RpsHand | null;
  /** 내가 이기면 'left', 상대가 이기면 'right' — 없으면 손 규칙으로 추론 */
  winnerSide?: Side | null;
  skinId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MatchupKind | null>(null);
  const [side, setSide] = useState<Side>('left');

  useEffect(() => {
    if (!playKey || !leftHand || !rightHand || reduce()) return;
    const winHand = getWinningHand(leftHand, rightHand);
    if (!winHand) return;
    const loseHand = winHand === leftHand ? rightHand : leftHand;
    const matchup = getMatchupKind(winHand, loseHand);
    if (!matchup) return;

    const resolvedSide: Side =
      winnerSide ?? (winHand === leftHand ? 'left' : 'right');

    setKind(matchup);
    setSide(resolvedSide);
    setOpen(true);

    if (matchup === 'cut') audioManager.playSFX('scissors_btn');
    else if (matchup === 'wrap') audioManager.playSFX('paper_btn');
    else audioManager.playSFX('rock_btn');
    triggerHaptic('heavy');

    const t = window.setTimeout(() => setOpen(false), VICTORY_CLASH_MS);
    return () => clearTimeout(t);
    // playKey 기준으로만 스냅샷 — 이후 손 초기화에 연출이 끊기지 않게
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  return (
    <AnimatePresence>
      {open && kind && (
        <motion.div
          key={`clash-${playKey}`}
          className="pointer-events-none absolute inset-0 z-[48] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.88, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 1.04, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.45 }}
          >
            <motion.div
              className="mb-2 px-3 py-0.5 rounded-full bg-arena-gold text-black text-[10px] font-black tracking-[0.2em] border-2 border-black shadow-[2px_2px_0_#000]"
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              {MATCHUP_LABEL[kind]}
            </motion.div>
            <div className="rounded-2xl border-[3px] border-black bg-gradient-to-b from-[#1a2030] to-[#0a0c12] shadow-[4px_6px_0_#000] px-2 py-3">
              <MatchupStage kind={kind} winnerSide={side} skinId={skinId} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
