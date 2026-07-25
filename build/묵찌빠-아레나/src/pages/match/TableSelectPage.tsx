import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Play, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { PrimaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { DEMO_USER } from '@/data/demoData';
import { useDemoWallet } from '@/hooks/useDemoWallet';
import { MATCH_TABLES, canEnterTable, type MatchTable } from '@/types/match';
import { matchmakingService } from '@/services/matchmakingService';
import { HostessAvatar, HostessBanner } from '@/components/casino/HostessAvatar';
import { HOSTESS } from '@/data/hostessAssets';

export function TableSelectPage() {
  const navigate = useNavigate();
  const wallet = useDemoWallet();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isAnimatingStart, setIsAnimatingStart] = useState(false);
  const [toast, setToast] = useState('');
  const [starting, setStarting] = useState(false);

  const selectedTable = MATCH_TABLES[selectedIndex];
  const entryCheck = canEnterTable(wallet.points, DEMO_USER.grade, selectedTable);
  const canStart = entryCheck.ok && !starting && !isAnimatingStart;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  const handleChipClick = (index: number) => {
    triggerHaptic('light');
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
    <div className="h-full flex flex-col relative font-sans overflow-hidden bg-arena-bg pb-16 md:pb-8">
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <img
          src={HOSTESS.table}
          alt=""
          className="absolute right-0 bottom-0 h-[55%] w-auto object-cover object-top"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-arena-bg via-arena-bg/90 to-transparent" />
      </div>
      <div className="relative z-10 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              navigate(-1);
            }}
            className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-1.5 shadow-lg">
            <HostessAvatar role="table" size="xs" ring={false} />
            <span className="text-xs text-gray-400 font-bold">보유 포인트</span>
            <span className="text-sm font-black text-white">
              {wallet.points.toLocaleString()} <span className="text-arena-gold text-xs">P</span>
            </span>
          </div>
        </div>

        <HostessBanner role="table" heightClass="h-20 md:h-28" className="mb-3 border border-white/10" />

        <div className="flex flex-col items-center justify-center space-y-2 mt-2 transition-all h-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTable.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-8 w-full max-w-sm bg-black/30 border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-sm"
            >
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-bold text-gray-500 mb-1">참가</span>
                <span className="font-bold text-white">
                  {selectedTable.isFree ? '무료' : selectedTable.entryPoint.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-bold text-gray-500 mb-1">수수료</span>
                <span className="font-bold text-arena-error">{selectedTable.fee.toLocaleString()}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-bold text-arena-gold mb-1">승리</span>
                <span className="font-black text-arena-gold">
                  {selectedTable.winnerPoint.toLocaleString()}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        <div
          className={`grid grid-cols-3 gap-6 max-w-sm w-full mx-auto relative z-20 transition-opacity duration-300 ${
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
                className="relative flex flex-col items-center justify-center focus:outline-none group"
              >
                <motion.div
                  animate={{
                    scale: isSelected ? 1.15 : 1,
                    y: isSelected ? -10 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl relative
                    ${
                      isSelected
                        ? `${table.color} shadow-[0_0_30px_rgba(255,255,255,0.2)] z-30`
                        : 'border-gray-700 bg-gray-800 text-gray-500 grayscale group-hover:grayscale-0 transition-all'
                    }
                    ${locked && !isSelected ? 'opacity-50' : ''}
                  `}
                >
                  <div
                    className={`absolute inset-2 rounded-full border-2 border-dashed ${
                      isSelected ? 'border-current opacity-50' : 'border-gray-600'
                    } pointer-events-none`}
                  />
                  {locked && (
                    <span className="absolute -top-1 -right-1 z-40 bg-black/80 rounded-full p-1 border border-white/20">
                      <Lock className="w-3 h-3 text-gray-300" />
                    </span>
                  )}
                  <span className={`font-black tracking-tighter ${table.isFree ? 'text-lg' : 'text-xl'}`}>
                    {table.isFree
                      ? '무료'
                      : table.entryPoint >= 10000
                        ? `${table.entryPoint / 10000}만`
                        : `${table.entryPoint / 1000}천`}
                  </span>
                </motion.div>
                {isSelected && (
                  <motion.div
                    layoutId="activeChipGlow"
                    className="absolute -bottom-4 w-12 h-2 rounded-full bg-white blur-md opacity-30 pointer-events-none"
                  />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnimatingStart && (
            <motion.div
              initial={{ scale: 1.15, y: -10, opacity: 1 }}
              animate={{
                scale: [1.15, 1.5, 0],
                y: [-10, -50, 100],
                rotateX: [0, 180, 360],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl z-50 ${selectedTable.color}`}
            >
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-current opacity-50" />
              <span className="font-black text-2xl tracking-tighter">
                {selectedTable.isFree
                  ? '무료'
                  : selectedTable.entryPoint >= 10000
                    ? `${selectedTable.entryPoint / 10000}만`
                    : `${selectedTable.entryPoint / 1000}천`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`w-full max-w-sm mt-12 z-10 transition-opacity duration-300 ${
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
            className="flex items-center justify-center w-full gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-gray-300 transition-colors border border-white/5"
          >
            <Info className="w-4 h-4" />
            게임 정보
            {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 mt-2 bg-black/40 border border-white/5 rounded-2xl text-xs text-gray-400 space-y-3 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span>최소 입장 조건</span>
                    <span className="font-bold text-white">{selectedTable.minGrade} 등급 이상</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>내 등급 / 보유</span>
                    <span className="font-bold text-white">
                      {DEMO_USER.grade} · {wallet.points.toLocaleString()} P
                    </span>
                  </div>
                  {selectedTable.isFree ? (
                    <div className="text-gray-300 pt-2 border-t border-white/10">
                      무료 연습 모드는 포인트 변동이 없으며 AI와 매칭됩니다.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>운영 수수료</span>
                        <span className="font-bold text-arena-error">승리 시 5% 차감 (표기 반영)</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <p className="font-bold text-gray-300 mb-1">주의사항</p>
                        <p>• 매칭 성사 시 참가 포인트가 예치됩니다.</p>
                        <p>• 매칭 취소 시 예치금은 즉시 반환됩니다.</p>
                        <p>• 데모 가상 포인트 · 결제/출금 없음</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        className={`p-4 z-20 pb-safe transition-transform duration-500 ${
          isAnimatingStart ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <PrimaryButton
          onClick={() => void handleStart()}
          disabled={!canStart}
          className="w-full py-5 text-xl tracking-wide group overflow-hidden relative shadow-[0_0_40px_rgba(245,158,11,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          <span className="flex items-center justify-center gap-2 relative z-10">
            {!entryCheck.ok ? '입장 불가' : starting ? '매칭 준비 중…' : '상대 찾기'}
            {canStart && <Play className="w-5 h-5 fill-current" />}
          </span>
        </PrimaryButton>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-3 rounded-2xl bg-black/90 border border-arena-error/40 text-sm font-bold text-white text-center shadow-xl"
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
