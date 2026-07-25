import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Info,
  Play,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  Bot,
} from 'lucide-react';
import { PrimaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { DEMO_USER } from '@/data/demoData';
import { useDemoWallet } from '@/hooks/useDemoWallet';
import { MATCH_TABLES, canEnterTable, type MatchTable } from '@/types/match';
import { getMatchRules } from '@/game/matchRules';
import { matchmakingService } from '@/services/matchmakingService';
import { HOSTESS } from '@/data/hostessAssets';

function chipLabel(table: MatchTable) {
  if (table.isFree) return '무료';
  if (table.entryPoint >= 10000) return `${table.entryPoint / 10000}만`;
  return `${table.entryPoint / 1000}천`;
}

function chipAccent(table: MatchTable, selected: boolean) {
  if (table.isFree) {
    return selected
      ? 'border-white bg-gradient-to-b from-zinc-100 to-zinc-400 text-black shadow-[0_0_28px_rgba(255,255,255,0.35)]'
      : 'border-white/25 bg-zinc-900/80 text-white/70';
  }
  if (selected) {
    return `${table.color} shadow-[0_0_28px_rgba(245,158,11,0.28)]`;
  }
  return 'border-white/15 bg-zinc-900/70 text-white/45';
}

export function TableSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useDemoWallet();
  const preferFree = !!(location.state as { preferFree?: boolean } | null)?.preferFree;

  const [selectedIndex, setSelectedIndex] = useState(() =>
    preferFree ? Math.max(0, MATCH_TABLES.findIndex((t) => t.isFree)) : 0,
  );
  const [showInfo, setShowInfo] = useState(false);
  const [isAnimatingStart, setIsAnimatingStart] = useState(false);
  const [toast, setToast] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!preferFree) return;
    const idx = MATCH_TABLES.findIndex((t) => t.isFree);
    if (idx >= 0) setSelectedIndex(idx);
  }, [preferFree]);

  const selectedTable = MATCH_TABLES[selectedIndex];
  const entryCheck = canEnterTable(wallet.points, DEMO_USER.grade, selectedTable);
  const canStart = entryCheck.ok && !starting && !isAnimatingStart;
  const isPractice = selectedTable.isFree;

  const summary = useMemo(
    () => [
      {
        label: '참가',
        value: isPractice ? '무료' : selectedTable.entryPoint.toLocaleString(),
        tone: 'text-white',
      },
      {
        label: '룰',
        value: getMatchRules(selectedTable.ruleId).shortLabel,
        tone: 'text-arena-cyan',
      },
      {
        label: '승리',
        value: isPractice ? '연습' : selectedTable.winnerPoint.toLocaleString(),
        tone: 'text-arena-gold',
      },
    ],
    [isPractice, selectedTable],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  const handleChipClick = (index: number) => {
    triggerHaptic('light');
    audioManager.playSFX('btn_touch');
    setSelectedIndex(index);
    setShowInfo(false);
  };

  const handleStart = async () => {
    if (starting || isAnimatingStart) return;

    const check = canEnterTable(wallet.points, DEMO_USER.grade, selectedTable);
    if (!check.ok) {
      triggerHaptic('error');
      audioManager.playSFX('error');
      showToast(check.reason ?? '입장할 수 없습니다.');
      return;
    }

    setStarting(true);
    const result = await matchmakingService.joinQueue(selectedTable);
    if (!result.ok) {
      setStarting(false);
      triggerHaptic('error');
      audioManager.playSFX('error');
      showToast(result.error ?? '매칭을 시작할 수 없습니다.');
      return;
    }

    triggerHaptic('heavy');
    audioManager.playSFX('game_start');
    setIsAnimatingStart(true);

    window.setTimeout(() => {
      navigate('/match/waiting', {
        state: { table: selectedTable, gameId: result.gameId },
      });
    }, 700);
  };

  return (
    <div className="h-full flex flex-col relative font-sans overflow-hidden bg-[#07090f] pb-[max(4.5rem,calc(env(safe-area-inset-bottom,0px)+3.5rem))] md:pb-8">
      {/* Stage atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.12)_0%,transparent_50%),linear-gradient(180deg,#121826_0%,#07090f_55%,#050608_100%)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-arena-gold/40 to-transparent" />
        <img
          src={HOSTESS.table}
          alt=""
          className="absolute right-[-8%] bottom-0 h-[58%] w-auto max-w-[46%] object-cover object-[center_12%] opacity-55"
          style={{
            maskImage: 'linear-gradient(to left, black 35%, transparent 92%), linear-gradient(to top, black 55%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to left, black 35%, transparent 92%), linear-gradient(to top, black 55%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090f] via-[#07090f]/88 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-20 px-4 pt-4 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            navigate(-1);
          }}
          className="w-10 h-10 rounded-xl bg-black/50 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0 text-center pt-0.5">
          <p className="font-display text-[10px] font-bold tracking-[0.28em] text-arena-gold/80">
            TABLE SELECT
          </p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={selectedTable.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="font-display text-xl md:text-2xl font-black text-white tracking-tight truncate"
            >
              {selectedTable.name}
            </motion.h1>
          </AnimatePresence>
        </div>

        <div className="shrink-0 rounded-xl bg-black/55 border border-arena-gold/25 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-[9px] font-bold text-white/45 leading-none">보유</p>
          <p className="text-sm font-black text-white mt-0.5 tabular-nums">
            {wallet.points.toLocaleString()}
            <span className="text-arena-gold text-[10px] ml-0.5">P</span>
          </p>
        </div>
      </header>

      {/* Practice callout / stake summary */}
      <div className="relative z-20 px-4 mt-4">
        <AnimatePresence mode="wait">
          {isPractice ? (
            <motion.div
              key="practice-banner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-md mx-auto rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 via-white/[0.04] to-transparent px-4 py-3.5 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black tracking-[0.18em] text-white/55 uppercase">
                  Free Practice
                </p>
                <p className="text-sm font-bold text-white truncate">
                  AI 상대 · 포인트 차감 없음 · 부담 없이 한 판
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-arena-gold shrink-0" />
            </motion.div>
          ) : (
            <motion.div
              key="stake-summary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-black/45 backdrop-blur-sm px-2 py-3 flex items-stretch shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              {summary.map((item, i) => (
                <div key={item.label} className="flex flex-1 items-stretch">
                  {i > 0 && <div className="w-px self-stretch bg-white/10 mx-1" />}
                  <div className="flex-1 flex flex-col items-center justify-center py-0.5">
                    <span className="text-[10px] font-bold text-white/40 mb-1">{item.label}</span>
                    <span className={`text-sm font-black tabular-nums ${item.tone}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chip grid */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 min-h-0">
        <p className="text-[10px] font-black tracking-[0.22em] text-white/35 uppercase mb-4">
          참가 테이블
        </p>
        <div
          className={`grid grid-cols-3 gap-x-4 gap-y-5 max-w-sm w-full mx-auto transition-opacity duration-300 ${
            isAnimatingStart ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {MATCH_TABLES.map((table, i) => {
            const isSelected = i === selectedIndex;
            const locked = !canEnterTable(wallet.points, DEMO_USER.grade, table).ok;
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => handleChipClick(i)}
                className="relative flex flex-col items-center justify-center focus:outline-none touch-manipulation group"
              >
                <motion.div
                  animate={{
                    scale: isSelected ? 1.08 : 1,
                    y: isSelected ? -6 : 0,
                  }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className={`relative w-[4.75rem] h-[4.75rem] rounded-full flex items-center justify-center border-[3px] ${chipAccent(
                    table,
                    isSelected,
                  )} ${locked && !isSelected ? 'opacity-45' : ''}`}
                >
                  {isSelected && (
                    <motion.span
                      className="absolute -inset-1 rounded-full border border-white/35 pointer-events-none"
                      animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.04, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}
                  {table.isFree && isSelected && (
                    <motion.span
                      className="absolute inset-[7px] rounded-full border border-dashed border-black/25 pointer-events-none"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  {locked && (
                    <span className="absolute -top-1 -right-1 z-40 bg-black/90 rounded-full p-1 border border-white/20 shadow-lg">
                      <Lock className="w-3 h-3 text-white/70" />
                    </span>
                  )}
                  <span
                    className={`relative z-10 font-black tracking-tight ${
                      table.isFree ? 'text-base' : 'text-lg'
                    }`}
                  >
                    {chipLabel(table)}
                  </span>
                </motion.div>
                <span
                  className={`mt-2 text-[10px] font-bold truncate max-w-[5.5rem] ${
                    isSelected ? 'text-white' : 'text-white/35'
                  }`}
                >
                  {table.isFree ? '연습' : table.name.replace(' 테이블', '')}
                </span>
                <span
                  className={`text-[9px] font-black truncate max-w-[5.5rem] ${
                    isSelected ? 'text-arena-gold' : 'text-white/25'
                  }`}
                >
                  {getMatchRules(table.ruleId).shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnimatingStart && (
            <motion.div
              initial={{ scale: 1.1, opacity: 1 }}
              animate={{
                scale: [1.1, 1.45, 0.2],
                y: [0, -30, 80],
                rotate: [0, 180, 360],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.75, ease: 'easeInOut' }}
              className={`absolute w-24 h-24 rounded-full flex items-center justify-center border-[3px] z-50 ${chipAccent(
                selectedTable,
                true,
              )}`}
            >
              <span className="font-black text-xl tracking-tight">{chipLabel(selectedTable)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info accordion */}
        <div
          className={`w-full max-w-sm mt-8 transition-opacity duration-300 ${
            isAnimatingStart ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {!entryCheck.ok && (
            <p className="text-center text-xs font-bold text-arena-error mb-3 px-2">{entryCheck.reason}</p>
          )}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowInfo(!showInfo);
            }}
            className="flex items-center justify-center w-full gap-2 py-2.5 rounded-xl text-xs font-bold text-white/55 hover:text-white/80 transition-colors border border-white/10 bg-black/30"
          >
            <Info className="w-3.5 h-3.5" />
            게임 정보
            {showInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 mt-2 bg-black/50 border border-white/10 rounded-2xl text-xs text-white/55 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span>경기 룰</span>
                    <span className="font-bold text-arena-gold">
                      {getMatchRules(selectedTable.ruleId).label}
                    </span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {getMatchRules(selectedTable.ruleId).description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span>최소 입장</span>
                    <span className="font-bold text-white">{selectedTable.minGrade} 이상</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>내 등급 / 보유</span>
                    <span className="font-bold text-white">
                      {DEMO_USER.grade} · {wallet.points.toLocaleString()} P
                    </span>
                  </div>
                  {isPractice ? (
                    <p className="pt-2 border-t border-white/10 text-white/70 leading-relaxed">
                      무료 연습은 포인트 변동이 없으며 AI와 매칭됩니다. 손 감각·타이밍을 익히기 좋아요.
                    </p>
                  ) : (
                    <div className="pt-2 border-t border-white/10 space-y-1 text-white/55">
                      <p>• 매칭 성사 시 참가 포인트가 예치됩니다.</p>
                      <p>• 취소 시 예치금은 즉시 반환됩니다.</p>
                      <p>• 데모 가상 포인트 · 결제/출금 없음</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CTA */}
      <div
        className={`relative z-30 px-4 pt-2 pb-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] transition-transform duration-500 ${
          isAnimatingStart ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-md mx-auto">
          {isPractice ? (
            <motion.button
              type="button"
              whileTap={canStart ? { scale: 0.97 } : undefined}
              onClick={() => void handleStart()}
              disabled={!canStart}
              className="relative w-full py-5 rounded-2xl font-black text-lg tracking-wide overflow-hidden disabled:opacity-55 disabled:cursor-not-allowed bg-gradient-to-r from-zinc-100 via-white to-zinc-300 text-black border border-white/50 shadow-[0_0_32px_rgba(255,255,255,0.22)] flex items-center justify-center gap-2"
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/5" />
              <span className="relative z-10 flex items-center gap-2">
                {starting ? '연습장 입장 중…' : '연습 시작'}
                {canStart && <Play className="w-5 h-5 fill-current" />}
              </span>
            </motion.button>
          ) : (
            <PrimaryButton
              onClick={() => void handleStart()}
              disabled={!canStart}
              className="w-full py-5 text-lg tracking-wide group overflow-hidden relative disabled:opacity-55 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(245,158,11,0.28)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="flex items-center justify-center gap-2 relative z-10 font-black">
                {!entryCheck.ok ? '입장 불가' : starting ? '매칭 준비 중…' : '상대 찾기'}
                {canStart && <Play className="w-5 h-5 fill-current" />}
              </span>
            </PrimaryButton>
          )}
          {isPractice && (
            <p className="text-center text-[10px] font-bold text-white/35 mt-2 tracking-wide">
              포인트 · 랭킹 변동 없음
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="overlay-center-x fixed bottom-28 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-3 rounded-2xl bg-black/90 border border-arena-error/40 text-sm font-bold text-white text-center shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 다른 모듈에서 테이블 타입 재사용 */
export type { MatchTable };
