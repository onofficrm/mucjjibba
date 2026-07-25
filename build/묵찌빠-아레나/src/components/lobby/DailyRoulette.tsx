import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';

const STORAGE_KEY = 'arena_daily_roulette_v1';

const PRIZES = [
  { id: 'p100', label: '100 P', weight: 30, kind: 'points' as const, amount: 100 },
  { id: 'p300', label: '300 P', weight: 22, kind: 'points' as const, amount: 300 },
  { id: 'p500', label: '500 P', weight: 14, kind: 'points' as const, amount: 500 },
  { id: 'skin', label: '손 스킨 조각', weight: 18, kind: 'cosmetic' as const, amount: 0 },
  { id: 'title', label: '칭호 티켓', weight: 10, kind: 'cosmetic' as const, amount: 0 },
  { id: 'jack', label: '1,000 P', weight: 6, kind: 'points' as const, amount: 1000 },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function alreadySpunToday(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { day: string };
    return parsed.day === todayKey();
  } catch {
    return false;
  }
}

function markSpun(prizeId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: todayKey(), prizeId }));
}

function pickPrize() {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PRIZES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PRIZES[0];
}

export function DailyRoulette() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(alreadySpunToday);
  const [result, setResult] = useState<(typeof PRIZES)[0] | null>(null);
  const [angle, setAngle] = useState(0);

  const segments = useMemo(() => PRIZES, []);

  const spin = () => {
    if (spinning || done) return;
    triggerHaptic('heavy');
    audioManager.playSFX('slot_spin');
    setSpinning(true);
    const prize = pickPrize();
    const idx = segments.findIndex((s) => s.id === prize.id);
    const seg = 360 / segments.length;
    const extra = 360 * 5 + (360 - idx * seg - seg / 2);
    setAngle((prev) => prev + extra);
    window.setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      setDone(true);
      markSpun(prize.id);
      audioManager.playSFX(prize.amount >= 1000 ? 'jackpot' : 'final_win');
      triggerHaptic('success');
    }, 3200);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          audioManager.playSFX('menu_open');
          setOpen(true);
        }}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border transition-colors ${
          done
            ? 'bg-white/5 border-white/10 text-gray-400'
            : 'bg-arena-gold/15 border-arena-gold/40 text-arena-gold animate-pulse'
        }`}
      >
        <Gift className="w-3.5 h-3.5" />
        {done ? '출석 완료' : '출석 룰렛'}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !spinning && setOpen(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-sm bg-zinc-950 border border-arena-gold/30 rounded-3xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-arena-gold" /> 일일 출석 룰렛
                </h3>
                <button
                  type="button"
                  disabled={spinning}
                  onClick={() => setOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">
                데모 가상 보상 · 결제/출금 없음 · 하루 1회 · 확률 표기
              </p>

              <div className="relative mx-auto w-56 h-56 mb-4">
                <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-10 text-arena-gold text-xl">▼</div>
                <motion.div
                  className="w-full h-full rounded-full border-4 border-arena-gold/50 overflow-hidden relative"
                  style={{
                    background:
                      'conic-gradient(#f59e0b 0deg 60deg, #22d3ee 60deg 120deg, #a78bfa 120deg 180deg, #f472b6 180deg 240deg, #34d399 240deg 300deg, #fbbf24 300deg 360deg)',
                  }}
                  animate={{ rotate: angle }}
                  transition={{ duration: spinning ? 3.1 : 0, ease: [0.15, 0.85, 0.2, 1] }}
                >
                  {segments.map((s, i) => {
                    const rot = i * (360 / segments.length) + 360 / segments.length / 2;
                    return (
                      <div
                        key={s.id}
                        className="absolute inset-0 flex items-start justify-center pt-3"
                        style={{ transform: `rotate(${rot}deg)` }}
                      >
                        <span className="text-[9px] font-black text-black/80">{s.label}</span>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              <div className="text-[10px] text-gray-500 mb-3 space-y-0.5">
                {PRIZES.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span>{p.label}</span>
                    <span>{Math.round((p.weight / PRIZES.reduce((a, b) => a + b.weight, 0)) * 100)}%</span>
                  </div>
                ))}
              </div>

              {result && (
                <div className="mb-3 rounded-xl bg-arena-gold/10 border border-arena-gold/30 px-3 py-2 text-center">
                  <p className="text-xs text-arena-gold font-bold">당첨!</p>
                  <p className="text-lg font-black text-white">{result.label}</p>
                </div>
              )}

              {done && !spinning ? (
                <SecondaryButton className="w-full py-3" onClick={() => setOpen(false)}>
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
      </AnimatePresence>
    </>
  );
}
