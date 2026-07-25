import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { CoinBurst } from '@/components/casino/CoinBurst';
import { HostessAvatar, HostessBanner } from '@/components/casino/HostessAvatar';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { applyRouletteReward } from '@/utils/demoWallet';
import { useDemoWallet } from '@/hooks/useDemoWallet';

const STORAGE_KEY = 'arena_daily_roulette_v1';

const PRIZES = [
  { id: 'p100', label: '100 P', weight: 30, kind: 'points' as const, amount: 100 },
  { id: 'p300', label: '300 P', weight: 22, kind: 'points' as const, amount: 300 },
  { id: 'p500', label: '500 P', weight: 14, kind: 'points' as const, amount: 500 },
  { id: 'skin', label: '손 스킨 조각', weight: 18, kind: 'skin' as const, amount: 0 },
  { id: 'title', label: '칭호 티켓', weight: 10, kind: 'title' as const, amount: 0 },
  { id: 'jack', label: '1,000 P', weight: 6, kind: 'points' as const, amount: 1000 },
];

const SEGMENT = 360 / PRIZES.length;
const WEIGHT_TOTAL = PRIZES.reduce((s, p) => s + p.weight, 0);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type SpinRecord = { day: string; prizeId: string; rewarded?: boolean };

function readRecord(): SpinRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpinRecord;
  } catch {
    return null;
  }
}

function alreadySpunToday(): boolean {
  const rec = readRecord();
  return !!rec && rec.day === todayKey();
}

function loadTodayPrize() {
  const rec = readRecord();
  if (!rec || rec.day !== todayKey()) return null;
  return PRIZES.find((p) => p.id === rec.prizeId) ?? null;
}

function angleForPrizeIndex(idx: number, spins = 5) {
  // 포인터(위쪽 ▼)에 세그먼트 중앙이 오도록
  const target = (360 - (idx * SEGMENT + SEGMENT / 2)) % 360;
  return spins * 360 + target;
}

function markSpun(prizeId: string) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ day: todayKey(), prizeId, rewarded: true } satisfies SpinRecord),
  );
}

function pickPrize() {
  let r = Math.random() * WEIGHT_TOTAL;
  for (const p of PRIZES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PRIZES[0];
}

export function DailyRoulette() {
  const wallet = useDemoWallet();
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(() => alreadySpunToday());
  const [result, setResult] = useState<(typeof PRIZES)[0] | null>(() => loadTodayPrize());
  const [angle, setAngle] = useState(() => {
    const prize = loadTodayPrize();
    if (!prize) return 0;
    const idx = PRIZES.findIndex((p) => p.id === prize.id);
    return angleForPrizeIndex(Math.max(0, idx), 0);
  });
  const [burst, setBurst] = useState(false);
  const [justWon, setJustWon] = useState(false);

  const segments = useMemo(() => PRIZES, []);

  useEffect(() => {
    if (!open) return;
    setDone(alreadySpunToday());
    const prize = loadTodayPrize();
    setResult(prize);
    if (prize) {
      const idx = PRIZES.findIndex((p) => p.id === prize.id);
      setAngle(angleForPrizeIndex(Math.max(0, idx), 0));
    }
  }, [open]);

  const spin = () => {
    if (spinning || done || alreadySpunToday()) return;
    triggerHaptic('heavy');
    audioManager.playSFX('slot_spin');
    setSpinning(true);
    setJustWon(false);
    setBurst(false);

    const prize = pickPrize();
    const idx = segments.findIndex((s) => s.id === prize.id);
    const nextAngle = angleForPrizeIndex(idx, 6);
    // 현재 각도에서 앞으로만 돌도록 보정
    const current = ((angle % 360) + 360) % 360;
    const targetMod = nextAngle % 360;
    const delta = (targetMod - current + 360) % 360;
    setAngle(angle + 6 * 360 + delta);

    window.setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      setDone(true);
      applyRouletteReward(prize);
      markSpun(prize.id);
      setJustWon(true);
      setBurst(true);
      audioManager.playSFX(prize.amount >= 1000 ? 'jackpot' : 'final_win');
      if (prize.kind === 'points') audioManager.playSFX('point_count');
      triggerHaptic('success');
      window.setTimeout(() => setBurst(false), 900);
    }, 3400);
  };

  const modal = createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
          <motion.div
            key="roulette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !spinning && setOpen(false)}
          />
          <motion.div
            key="roulette-panel"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-sm bg-zinc-950 border border-arena-gold/30 rounded-3xl p-5 shadow-2xl overflow-hidden"
          >
            {burst && <CoinBurst />}

            <HostessBanner role="roulette" heightClass="h-24" className="mb-4 border border-arena-gold/30" />

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-white flex items-center gap-2">
                <HostessAvatar role="roulette" size="sm" /> 일일 출석 룰렛
              </h3>
              <button
                type="button"
                disabled={spinning}
                onClick={() => setOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mb-2">
              데모 가상 보상 · 결제/출금 없음 · 하루 1회 · 확률 표기
            </p>
            <p className="text-[11px] text-arena-gold/80 font-bold mb-4">
              현재 보유 {wallet.points.toLocaleString()} P
              {(wallet.skinFragments > 0 || wallet.titleTickets > 0) && (
                <span className="text-gray-500 font-medium">
                  {' '}
                  · 스킨조각 {wallet.skinFragments} · 칭호티켓 {wallet.titleTickets}
                </span>
              )}
            </p>

            <div className="relative mx-auto w-56 h-56 mb-4">
              <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-10 text-arena-gold text-xl drop-shadow">
                ▼
              </div>
              <div className="absolute inset-[42%] rounded-full bg-zinc-950 border-2 border-arena-gold/60 z-[1] shadow-inner" />
              <motion.div
                className="w-full h-full rounded-full border-4 border-arena-gold/50 overflow-hidden relative"
                style={{
                  background:
                    'conic-gradient(#f59e0b 0deg 60deg, #22d3ee 60deg 120deg, #a78bfa 120deg 180deg, #f472b6 180deg 240deg, #34d399 240deg 300deg, #fbbf24 300deg 360deg)',
                }}
                animate={{ rotate: angle }}
                transition={{
                  duration: spinning ? 3.2 : 0,
                  ease: spinning ? [0.12, 0.8, 0.1, 1] : 'linear',
                }}
              >
                {segments.map((s, i) => {
                  const rot = i * SEGMENT + SEGMENT / 2;
                  return (
                    <div
                      key={s.id}
                      className="absolute inset-0 flex items-start justify-center pt-3.5"
                      style={{ transform: `rotate(${rot}deg)` }}
                    >
                      <span className="text-[10px] font-black text-black/85 whitespace-nowrap drop-shadow-sm">
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            <div className="text-[11px] text-gray-400 mb-3 space-y-1 rounded-xl bg-black/40 border border-white/5 px-3 py-2">
              {PRIZES.map((p) => (
                <div key={p.id} className="flex justify-between gap-3">
                  <span className={result?.id === p.id ? 'text-arena-gold font-bold' : ''}>
                    {p.label}
                  </span>
                  <span className="tabular-nums shrink-0">
                    {Math.round((p.weight / WEIGHT_TOTAL) * 100)}%
                  </span>
                </div>
              ))}
            </div>

            {result && (
              <motion.div
                initial={justWon ? { scale: 0.9, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-3 rounded-xl bg-arena-gold/10 border border-arena-gold/30 px-3 py-3 text-center"
              >
                <p className="text-xs text-arena-gold font-bold">
                  {justWon ? '출석 보상 지급!' : '오늘의 당첨'}
                </p>
                <p className="text-xl font-black text-white mt-0.5">{result.label}</p>
                {result.kind === 'points' && justWon && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    보유 포인트에 +{result.amount.toLocaleString()} P 반영됨
                  </p>
                )}
                {result.kind === 'skin' && justWon && (
                  <p className="text-[11px] text-gray-400 mt-1">손 스킨 조각이 인벤토리에 추가됨</p>
                )}
                {result.kind === 'title' && justWon && (
                  <p className="text-[11px] text-gray-400 mt-1">칭호 티켓이 인벤토리에 추가됨</p>
                )}
              </motion.div>
            )}

            {done && !spinning ? (
              <SecondaryButton showHostess={false} className="w-full py-3" onClick={() => setOpen(false)}>
                내일 다시 도전
              </SecondaryButton>
            ) : (
              <PrimaryButton className="w-full py-3" disabled={spinning} onClick={spin}>
                {spinning ? '스핀 중…' : '룰렛 돌리기'}
              </PrimaryButton>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          audioManager.playSFX('menu_open');
          setOpen(true);
        }}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black border transition-colors ${
          done
            ? 'bg-white/5 border-white/10 text-gray-400'
            : 'bg-arena-gold/15 border-arena-gold/40 text-arena-gold animate-pulse'
        }`}
      >
        <HostessAvatar role="roulette" size="xs" ring={false} />
        {done ? '출석 완료' : '출석 룰렛'}
      </button>
      {typeof document !== 'undefined' ? modal : null}
    </>
  );
}
