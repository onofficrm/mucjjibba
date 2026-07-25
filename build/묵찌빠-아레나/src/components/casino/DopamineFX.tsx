import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings } from '@/utils/gameSettings';
import { missionEventHandler } from '@/services/mission';
import { HandGlyph } from '@/components/game/HandGlyph';
import { getWinningHand } from '@/game/rpsMatchup';

const reduce = () =>
  gameSettings.options.reduceAnimations || gameSettings.options.performanceMode === 'low';

/** Step1 — 슬로모션 리빌: 디밍 + 미세 줌 + 스냅 플래시 */
export function SlowMoReveal({ active, snap }: { active: boolean; snap?: boolean }) {
  if (reduce() || (!active && !snap)) return null;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="slowmo"
          className="pointer-events-none absolute inset-0 z-[26]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-black"
            animate={{ opacity: [0.2, 0.55, 0.35] }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.85) 100%)',
            }}
            animate={{ scale: [1.08, 1, 1.04] }}
            transition={{ duration: 1.1 }}
          />
        </motion.div>
      )}
      {snap && (
        <motion.div
          key="snap"
          className="pointer-events-none absolute inset-0 z-[27] bg-white"
          initial={{ opacity: 0.24 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}

/** Step1 — 니어미스 / 한 끗 차이 플래시 */
export function NearMissFlash({
  open,
  label = '한 끗 차이!',
}: {
  open: boolean;
  label?: string;
}) {
  useEffect(() => {
    if (!open || reduce()) return;
    audioManager.playSFX('near_miss');
    triggerHaptic('heavy');
  }, [open]);

  return (
    <AnimatePresence>
      {open && !reduce() && (
        <motion.div
          key="nearmiss"
          className="pointer-events-none absolute inset-0 z-[45] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              boxShadow: 'inset 0 0 80px rgba(251,191,36,0.45)',
            }}
            animate={{ opacity: [0.3, 0.9, 0.2] }}
            transition={{ duration: 0.5 }}
          />
          <motion.p
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.2, 1], opacity: 1 }}
            className="font-display text-3xl md:text-5xl font-black text-amber-300 tracking-wider"
            style={{
              WebkitTextStroke: '2px #000',
              textShadow: '0 4px 0 #000, 0 0 28px rgba(245,158,11,0.7)',
            }}
          >
            {label}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Step2 — 콤보 히트 카운터 */
export function ComboHitCounter({ hits, inline = false }: { hits: number; inline?: boolean }) {
  if (hits < 2 || reduce()) return null;
  const rainbow = hits >= 4;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={hits}
        className={
          inline
            ? 'pointer-events-none flex justify-center'
            : 'pointer-events-none absolute top-[13%] inset-x-0 z-[46] flex justify-center px-4'
        }
        initial={{ scale: 0.4, y: -14, opacity: 0 }}
        animate={{ scale: [0.4, 1.15, 1], y: 0, opacity: 1 }}
        exit={{ scale: 1.25, opacity: 0, y: -12 }}
        transition={{ type: 'spring', bounce: 0.45, duration: 0.5 }}
      >
        <span
          className={`inline-flex items-center rounded-full border-2 border-black bg-black/65 backdrop-blur-sm px-4 py-1 font-display text-2xl md:text-4xl font-black tracking-tight shadow-[3px_4px_0_#000] ${
            rainbow
              ? 'bg-gradient-to-r from-fuchsia-400 via-amber-300 to-cyan-300 bg-clip-text text-transparent'
              : hits >= 3
                ? 'text-amber-300'
                : 'text-lime-300'
          }`}
          style={
            rainbow
              ? { filter: 'drop-shadow(0 2px 0 #000)' }
              : { textShadow: '0 0 18px rgba(163,230,53,0.5)' }
          }
        >
          {hits} HIT!
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

/** Step2 — 결정 깨짐 / 결정타 임팩트 */
export function ScreenCrack({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active || reduce()) return;
    audioManager.playSFX('final_win');
    triggerHaptic('heavy');
  }, [active]);

  return (
    <AnimatePresence>
      {active && !reduce() && (
        <motion.div
          key="crack"
          className="pointer-events-none absolute inset-0 z-[48] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0] }}
          transition={{ duration: 1.1, times: [0, 0.55, 1] }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-amber-100"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M50 0 L48 35 L30 40 L50 55 L55 100" stroke="rgba(251,191,36,0.85)" strokeWidth="0.6" fill="none" />
            <path d="M50 55 L70 48 L85 60" stroke="rgba(253,224,71,0.7)" strokeWidth="0.5" fill="none" />
            <path d="M48 35 L20 28 L8 45" stroke="rgba(245,158,11,0.65)" strokeWidth="0.45" fill="none" />
            <path d="M50 55 L35 70 L40 90" stroke="rgba(252,211,77,0.55)" strokeWidth="0.4" fill="none" />
          </svg>
          <div
            className="absolute inset-0"
            style={{ boxShadow: 'inset 0 0 0 3px rgba(245,158,11,0.7), inset 0 0 100px rgba(245,158,11,0.35)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Step3 — ON FIRE 뱃지 */
export function OnFireBadge({
  streak,
  show,
  inline = false,
}: {
  streak: number;
  show: boolean;
  inline?: boolean;
}) {
  if (!show || streak < 3 || reduce()) return null;
  return (
    <motion.div
      className={
        inline
          ? 'pointer-events-none flex justify-center'
          : 'pointer-events-none absolute top-[4.75rem] sm:top-16 left-1/2 -translate-x-1/2 z-[40]'
      }
      initial={{ y: -20, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: [1, 1.06, 1] }}
      transition={{ scale: { duration: 1.2, repeat: Infinity } }}
    >
      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 border-2 border-black shadow-[0_0_24px_rgba(249,115,22,0.65)] flex items-center gap-1.5">
        <span className="text-sm">🔥</span>
        <span className="font-display text-[11px] md:text-xs font-black text-black tracking-[0.15em]">
          ON FIRE · {streak}
        </span>
      </div>
    </motion.div>
  );
}

/** Step3 — 연승 불꽃 테두리 강화 (StreakScreenFrame 위에 레이어) */
export function StreakFlameGrowth({ streak }: { streak: number }) {
  if (streak < 3 || reduce()) return null;
  const intensity = streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[16]"
      animate={{ opacity: [0.35, 0.85, 0.35] }}
      transition={{ duration: intensity === 3 ? 0.55 : intensity === 2 ? 0.75 : 1.1, repeat: Infinity }}
      style={{
        background:
          intensity >= 3
            ? 'radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.35) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(232,121,249,0.2) 0%, transparent 40%)'
            : intensity === 2
              ? 'radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.28) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 50% 100%, rgba(251,146,60,0.18) 0%, transparent 45%)',
        boxShadow:
          intensity >= 2
            ? `inset 0 0 0 ${intensity + 1}px rgba(249,115,22,0.55), inset 0 0 80px rgba(245,158,11,0.25)`
            : 'inset 0 0 0 2px rgba(251,146,60,0.4)',
      }}
      aria-hidden
    />
  );
}

/** 카운트다운 3-2-1 긴박감 */
export function CountdownUrgency({ timeLeft, active }: { timeLeft: number; active: boolean }) {
  const visible = active && timeLeft <= 3 && timeLeft >= 0 && !reduce();

  useEffect(() => {
    if (!active || timeLeft > 3 || timeLeft < 0 || reduce()) return;
    if (timeLeft === 3) audioManager.playSFX('countdown_3');
    triggerHaptic(timeLeft <= 1 ? 'heavy' : 'medium');
  }, [timeLeft, active]);

  if (!visible) return null;

  // 화면 테두리 비네트만 — 숫자는 기존 타이머가 담당(중복 표시 방지)
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[22]"
      animate={{ opacity: [0.25, 0.55, 0.25] }}
      transition={{ duration: 0.45, repeat: Infinity }}
      style={{
        boxShadow: `inset 0 0 0 4px rgba(239,68,68,${0.35 + (3 - timeLeft) * 0.2}), inset 0 0 ${40 + (3 - timeLeft) * 30}px rgba(220,38,38,0.4)`,
      }}
      aria-hidden
    />
  );
}

/** 손 선택 타격 파티클 */
export function PickBurst({ burstKey, x = 50 }: { burstKey: number; x?: number }) {
  if (!burstKey || reduce()) return null;
  const particles = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 z-[35] overflow-hidden" aria-hidden>
      {particles.map((i) => (
        <motion.span
          key={`${burstKey}-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-300"
          style={{ left: `${x}%`, bottom: '22%' }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (i - 5) * 14,
            y: -40 - (i % 4) * 18,
            scale: 0.2,
          }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/** 결과 직전 — 손을 한 번 더 슬로우로 재생하는 미니 리플레이 */
export function MiniClashReplay({
  playKey,
  myHand,
  opponentHand,
  skinId = 'classic',
  comboBoost = 0,
}: {
  playKey: number;
  myHand: 'ROCK' | 'SCISSORS' | 'PAPER' | null;
  opponentHand: 'ROCK' | 'SCISSORS' | 'PAPER' | null;
  skinId?: string;
  comboBoost?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!playKey || !myHand || !opponentHand || reduce()) return;
    // 매치업 전용 연출(HandVictoryClash)이 있을 때는 코너 리플레이 생략
    if (getWinningHand(myHand, opponentHand)) return;
    setOpen(true);
    audioManager.playSFX('tension_before_reveal');
    triggerHaptic('medium');
    const t = window.setTimeout(() => setOpen(false), 980);
    return () => clearTimeout(t);
  }, [playKey, myHand, opponentHand]);

  return (
    <AnimatePresence>
      {open && myHand && opponentHand && (
        <motion.div
          key={playKey}
          className="pointer-events-none absolute top-[18%] right-3 md:right-6 z-[45]"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 1.05 }}
          transition={{ duration: 0.25 }}
          aria-hidden
        >
          <div className="relative rounded-xl border border-white/15 bg-black/80 backdrop-blur-md px-3 py-2 shadow-[3px_4px_0_#000] min-w-[154px]">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-arena-gold text-black text-[9px] font-black tracking-[0.18em] border border-black">
              REPLAY
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <motion.div
                initial={{ x: -40, rotate: -25, scale: 0.6, opacity: 0.4 }}
                animate={{ x: 0, rotate: 0, scale: 1.15, opacity: 1 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                <HandGlyph hand={myHand} theme={skinId} size={38} comboBoost={comboBoost} />
              </motion.div>
              <motion.span
                className="font-display text-[10px] font-black text-white/45"
                animate={{ scale: [1, 1.35, 1], opacity: [0.4, 1, 0.6] }}
                transition={{ duration: 0.75 }}
              >
                VS
              </motion.span>
              <motion.div
                initial={{ x: 40, rotate: 25, scale: 0.6, opacity: 0.4 }}
                animate={{ x: 0, rotate: 0, scale: 1.15, opacity: 1 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
              >
                <span className="inline-block" style={{ transform: 'scaleX(-1)' }}>
                  <HandGlyph hand={opponentHand} theme={skinId} size={38} comboBoost={0} />
                </span>
              </motion.div>
            </div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 1.6] }}
              transition={{ duration: 0.55, delay: 0.45 }}
            >
              <span className="text-xl">💥</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Step5 — 잭팟 라운드 배너 */
export function JackpotRoundBanner({
  active,
  inline = false,
}: {
  active: boolean;
  inline?: boolean;
}) {
  useEffect(() => {
    if (!active || reduce()) return;
    audioManager.playSFX('jackpot');
    triggerHaptic('heavy');
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={
            inline
              ? 'pointer-events-none flex justify-center px-4'
              : 'pointer-events-none absolute top-[5.75rem] sm:top-20 inset-x-0 z-[41] flex justify-center px-4'
          }
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <motion.div
            className="px-4 py-2 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-fuchsia-600 via-amber-400 to-cyan-400 shadow-[0_0_40px_rgba(245,158,11,0.55)]"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          >
            <p className="font-display text-sm md:text-base font-black text-black tracking-[0.2em] text-center">
              JACKPOT ROUND ×2
            </p>
            <p className="text-[10px] font-bold text-black/70 text-center">이번 승점 포인트 2배</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 미션 완료 팡파레 토스트 */
export function MissionFanfareToast({
  title,
  open,
  onDone,
}: {
  title: string;
  open: boolean;
  onDone?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    audioManager.playSFX('rank_up');
    triggerHaptic('success');
    const t = window.setTimeout(() => onDone?.(), 2200);
    return () => clearTimeout(t);
  }, [open, onDone]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] w-[min(92vw,360px)]"
          initial={{ y: -30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0 }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-arena-gold/50 bg-gradient-to-r from-zinc-950 via-amber-950/80 to-zinc-950 px-4 py-3 shadow-[0_0_32px_rgba(245,158,11,0.4)]">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.8 }}
            />
            <p className="relative text-[10px] font-black text-arena-gold tracking-[0.2em]">MISSION CLEAR</p>
            <p className="relative text-sm font-black text-white mt-0.5 truncate">{title}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 미션 완료 구독 훅 — 새로 completed 된 미션 감지 */
export function useMissionFanfare() {
  const [fanfare, setFanfare] = useState<{ title: string; id: number } | null>(null);
  useEffect(() => {
    let prevCompleted = new Set<string>();
    let primed = false;
    const unsub = missionEventHandler.subscribe((missions) => {
      const completed = new Set(missions.filter((m) => m.completed).map((m) => m.id));
      if (!primed) {
        prevCompleted = completed;
        primed = true;
        return;
      }
      for (const m of missions) {
        if (m.completed && !prevCompleted.has(m.id)) {
          setFanfare({ title: m.title, id: Date.now() });
          audioManager.playSFX('final_win');
          break;
        }
      }
      prevCompleted = completed;
    });
    return unsub;
  }, []);
  return {
    fanfare,
    clear: () => setFanfare(null),
  };
}
