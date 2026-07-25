import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Check, Gift, Sparkles, X, ChevronRight, Info, Eye, MessageSquare, FileText, Book } from 'lucide-react';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings } from '@/utils/gameSettings';

export interface Mission {
  id: string;
  title: string;
  max: number;
  current: number;
  rewardType: 'exp' | 'badge' | 'emoticon' | 'hand_skin' | 'intro' | 'character' | 'table';
  rewardDesc: string;
  completed: boolean;
  rewardClaimed: boolean;
  icon: React.ReactNode;
}

const INITIAL_MISSIONS: Mission[] = [
  { id: '1', title: '무료 연습 1회 완료', max: 1, current: 1, rewardType: 'exp', rewardDesc: '경험치 +50', completed: true, rewardClaimed: false, icon: <Target className="w-5 h-5 text-blue-400" /> },
  { id: '2', title: 'AI 데모 경기 1회 관전', max: 1, current: 0, rewardType: 'hand_skin', rewardDesc: '로봇 손 스킨 (1일)', completed: false, rewardClaimed: false, icon: <Eye className="w-5 h-5 text-purple-400" /> },
  { id: '3', title: '리액션 1회 보내기', max: 1, current: 0, rewardType: 'emoticon', rewardDesc: '무료 이모티콘 팩', completed: false, rewardClaimed: false, icon: <MessageSquare className="w-5 h-5 text-yellow-400" /> },
  { id: '4', title: '경기 기록 확인', max: 1, current: 1, rewardType: 'badge', rewardDesc: '초보자 배지 +10%', completed: true, rewardClaimed: true, icon: <FileText className="w-5 h-5 text-green-400" /> },
  { id: '5', title: '초보자 가이드 완료', max: 1, current: 0, rewardType: 'character', rewardDesc: '초보 캐릭터 체험', completed: false, rewardClaimed: false, icon: <Book className="w-5 h-5 text-arena-cyan" /> },
];

export function DailyMissions() {
  const [isOpen, setIsOpen] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [particleMissionId, setParticleMissionId] = useState<string | null>(null);

  const completedCount = missions.filter(m => m.completed).length;
  const totalCount = missions.length;

  const handleClaim = (id: string) => {
    triggerHaptic('medium');
    audioManager.playSFX('point_count');
    setParticleMissionId(id);
    
    setTimeout(() => {
      setMissions(prev => prev.map(m => m.id === id ? { ...m, rewardClaimed: true } : m));
      setParticleMissionId(null);
    }, 1000);
  };

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
          {missions.some(m => m.completed && !m.rewardClaimed) && (
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
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full bg-gray-900 border-t border-white/10 rounded-t-3xl pb-safe flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-center pt-3 pb-2 w-full absolute top-0 z-10" onClick={() => setIsOpen(false)}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              <div className="px-5 pt-8 pb-4 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    데일리 미션
                    <span className="bg-arena-cyan/20 text-arena-cyan text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">새로고침 14:00</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">게임을 즐기고 비현금성 보상을 획득하세요.</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
                {missions.map(mission => (
                  <div 
                    key={mission.id} 
                    className={`relative w-full rounded-2xl border p-4 overflow-hidden transition-all duration-300 ${
                      mission.rewardClaimed 
                        ? 'bg-gray-800/50 border-white/5 opacity-60' 
                        : mission.completed 
                          ? 'bg-gray-800 border-arena-cyan/50 shadow-[0_0_15px_rgba(45,212,191,0.1)]' 
                          : 'bg-gray-900 border-white/10'
                    }`}
                  >
                    {/* Background particle effect when claiming */}
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
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border border-white/5 ${mission.rewardClaimed ? 'grayscale' : ''}`}>
                        {mission.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white mb-1">{mission.title}</h3>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-arena-gold font-bold flex items-center gap-1">
                            <Gift className="w-3 h-3" /> {mission.rewardDesc}
                          </span>
                          <span className="text-gray-400 font-bold">
                            {mission.current}/{mission.max}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-black/50 rounded-full mt-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (mission.current / mission.max) * 100)}%` }}
                            className={`h-full rounded-full ${mission.rewardClaimed ? 'bg-gray-500' : 'bg-arena-cyan'}`}
                          />
                        </div>
                      </div>
                      
                      <div className="ml-2 flex-shrink-0 relative">
                        {mission.rewardClaimed ? (
                          <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                            <Check className="w-5 h-5 text-gray-500" />
                          </div>
                        ) : mission.completed ? (
                          <button 
                            onClick={() => handleClaim(mission.id)}
                            className="h-9 px-3 rounded-xl bg-arena-cyan text-black font-black text-xs hover:bg-teal-400 active:scale-95 transition-all shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                          >
                            받기
                          </button>
                        ) : (
                          <div className="h-9 px-3 rounded-xl bg-white/5 text-gray-500 font-bold text-xs flex items-center justify-center border border-white/5">
                            진행중
                          </div>
                        )}
                        
                        {/* Check mark animation on claim */}
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
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
