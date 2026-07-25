import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Check, Gift, X, ChevronDown } from 'lucide-react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings } from '@/utils/gameSettings';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { MissionIcon } from '@/missions/missionIcons';
import { rewardLabel } from '@/missions/catalog';
import type { Mission } from '@/types/mission';

/** @deprecated UI 호환용 — 로직 타입은 types/mission.Mission 사용 */
export type { Mission };

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return desktop;
}

function formatProgress(mission: Mission) {
  if (mission.id === 'spectate_3min') {
    const curMin = Math.floor(mission.progress / 60);
    const tgtMin = Math.floor(mission.target / 60);
    return `${curMin}/${tgtMin}분`;
  }
  return `${mission.progress}/${mission.target}`;
}

export function DailyMissions() {
  const isDesktop = useIsDesktop();
  const { missions, summary, claim, claimingId } = useDailyMissions();
  const [isOpen, setIsOpen] = useState(false);
  const [particleMissionId, setParticleMissionId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completedCount = summary?.completedCount ?? missions.filter((m) => m.completed).length;
  const totalCount = summary?.totalCount ?? missions.length;
  const hasClaimable = missions.some((m) => m.completed && !m.claimed);

  const handleClaim = async (id: string) => {
    const mission = missions.find((m) => m.id === id);
    if (!mission?.completed || mission.claimed) return;

    triggerHaptic('heavy');
    audioManager.playSFX('final_win');
    audioManager.playSFX('point_count');
    setParticleMissionId(id);

    const result = await claim(id);
    if (!result.ok) {
      setParticleMissionId(null);
      triggerHaptic('error');
      return;
    }

    setTimeout(() => setParticleMissionId(null), 1000);
  };

  const panelBody = (
    <>
      <div className="px-5 pt-8 pb-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            데일리 미션
            <span className="bg-arena-cyan/20 text-arena-cyan text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
              새로고침 14:00
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            초보 체험용 미션입니다. 비현금성 보상만 지급됩니다.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
        {missions.map((mission) => {
          const expanded = expandedId === mission.id;
          return (
            <div
              key={mission.id}
              className={`relative w-full rounded-2xl border p-4 overflow-hidden transition-all duration-300 ${
                mission.claimed
                  ? 'bg-gray-800/50 border-white/5 opacity-60'
                  : mission.completed
                    ? 'bg-gray-800 border-arena-cyan/50 shadow-[0_0_15px_rgba(45,212,191,0.1)]'
                    : 'bg-gray-900 border-white/10'
              }`}
            >
              <AnimatePresence>
                {particleMissionId === mission.id && !gameSettings.options.reduceAnimations && (
                  <motion.div
                    initial={{ opacity: 1, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.2)_0%,transparent_70%)]"
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : mission.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border border-white/5 ${
                    mission.claimed ? 'grayscale' : ''
                  }`}
                  aria-label="미션 설명"
                >
                  <MissionIcon name={mission.icon} />
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : mission.id)}
                  className="flex-1 text-left"
                >
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1">
                    {mission.title}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </h3>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-arena-gold font-bold flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      {rewardLabel(mission.rewardType, mission.rewardValue)}
                    </span>
                    <span className="text-gray-400 font-bold">{formatProgress(mission)}</span>
                  </div>
                  <div className="w-full h-1 bg-black/50 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (mission.progress / mission.target) * 100)}%`,
                      }}
                      className={`h-full rounded-full ${mission.claimed ? 'bg-gray-500' : 'bg-arena-cyan'}`}
                    />
                  </div>
                </button>

                <div className="ml-2 flex-shrink-0 relative">
                  {mission.claimed ? (
                    <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                      <Check className="w-5 h-5 text-gray-500" />
                    </div>
                  ) : mission.completed ? (
                    <button
                      onClick={() => void handleClaim(mission.id)}
                      disabled={claimingId === mission.id}
                      className="h-9 px-3 rounded-xl bg-arena-cyan text-black font-black text-xs hover:bg-teal-400 active:scale-95 transition-all shadow-[0_0_10px_rgba(45,212,191,0.4)] disabled:opacity-60"
                    >
                      받기
                    </button>
                  ) : (
                    <div className="h-9 px-3 rounded-xl bg-white/5 text-gray-500 font-bold text-xs flex items-center justify-center border border-white/5">
                      진행중
                    </div>
                  )}

                  <AnimatePresence>
                    {particleMissionId === mission.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1.5, 1], opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center text-arena-cyan pointer-events-none"
                      >
                        <Check className="w-8 h-8" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs text-gray-400 mt-3 relative z-10 overflow-hidden"
                  >
                    {mission.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => {
          triggerHaptic('light');
          audioManager.playSFX('btn_touch');
          setIsOpen(true);
        }}
        className="flex items-center gap-2 bg-gray-900 border border-white/10 rounded-full px-3 py-1.5 hover:bg-gray-800 transition-colors"
      >
        <div className="relative">
          <Target className="w-4 h-4 text-arena-cyan" />
          {hasClaimable && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-arena-error rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center">
          <span className="text-[10px] text-gray-400 font-bold mr-1">오늘의 미션</span>
          <div className="flex flex-col h-4 overflow-hidden items-center justify-center relative min-w-[12px]">
            <motion.div
              key={completedCount}
              initial={{ y: 15 }}
              animate={{ y: 0 }}
              className="text-xs font-black text-white absolute"
            >
              {completedCount}
            </motion.div>
          </div>
          <span className="text-xs font-black text-gray-500">/{totalCount}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            className={`overlay-area z-50 flex ${
              isDesktop ? 'items-stretch justify-end' : 'flex-col justify-end'
            }`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={isDesktop ? { x: '100%' } : { y: '100%' }}
              animate={isDesktop ? { x: 0 } : { y: 0 }}
              exit={isDesktop ? { x: '100%' } : { y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={
                isDesktop
                  ? 'relative w-full max-w-md h-full bg-gray-900 border-l border-white/10 flex flex-col shadow-2xl'
                  : 'relative w-full bg-gray-900 border-t border-white/10 rounded-t-3xl pb-safe flex flex-col max-h-[80vh]'
              }
            >
              {!isDesktop && (
                <div
                  className="flex justify-center pt-3 pb-2 w-full absolute top-0 z-10"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>
              )}
              {panelBody}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
