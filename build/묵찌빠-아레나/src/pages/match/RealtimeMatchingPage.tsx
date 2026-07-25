import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { DEMO_USER } from '@/data/demoData';
import { gameSettings } from '@/utils/gameSettings';
import { getCharacterEmoji } from '@/data/decorations';

const DEMO_OPPONENT = {
  nickname: 'GHOST***',
  grade: '골드',
  winRate: '68%',
  currentStreak: 3,
  maxStreak: 12,
  avatar: '👻'
};

const MATCHING_STEPS = [
  '매칭 요청 전송',
  '상대 검색',
  '상대 후보 발견',
  '상대 연결 확인',
  '양쪽 참가 포인트 예치 확인',
  '게임 준비 완료'
];

// Random avatars for the spinning reel
const CANDIDATES = ['🦊', '🐻', '🐼', '🐯', '🦁', '🐸', '🐵', '🦉', '🐺', '🐗'];

export function RealtimeMatchingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const table = location.state?.table;

  const [matchState, setMatchState] = useState<'searching' | 'found' | 'countdown'>('searching');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCandidate, setCurrentCandidate] = useState(CANDIDATES[0]);
  const [showStatusDetails, setShowStatusDetails] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showOpponentDetails, setShowOpponentDetails] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Redirect if no table selected
  useEffect(() => {
    if (!table) {
      navigate('/match/tables', { replace: true });
    }
  }, [table, navigate]);

  // Timer & Candidate Reel Logic
  useEffect(() => {
    if (matchState !== 'searching') return;

    // Elapsed time counter
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Fast candidate reel spinner
    const reelInterval = setInterval(() => {
      setCurrentCandidate(CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)]);
    }, 100);

    // Step progression (demo)
    const stepTimeouts = [
      setTimeout(() => { setCurrentStepIndex(1); }, 1000),
      setTimeout(() => { setCurrentStepIndex(2); }, 2500),
      setTimeout(() => { setCurrentStepIndex(3); }, 3500),
      setTimeout(() => { setCurrentStepIndex(4); }, 4500),
      setTimeout(() => { setCurrentStepIndex(5); }, 5500),
      setTimeout(() => { 
        setMatchState('found'); 
        triggerHaptic('success');
      }, 6500),
    ];

    return () => {
      clearInterval(timeInterval);
      clearInterval(reelInterval);
      stepTimeouts.forEach(clearTimeout);
    };
  }, [matchState]);

  // Countdown Logic
  useEffect(() => {
    if (matchState === 'found') {
      setTimeout(() => setMatchState('countdown'), 2500);
    }
    
    if (matchState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
          triggerHaptic('light');
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        triggerHaptic('heavy');
        navigate('/game/demo-1234');
      }
    }
  }, [matchState, countdown, navigate]);

  if (!table) return null;

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col relative font-sans text-white overflow-hidden pb-safe">
      
      {/* Dynamic Background Effects */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${
        matchState === 'searching' ? 'bg-arena-bg' : 
        matchState === 'found' ? 'bg-arena-gold/10' : 
        'bg-arena-cyan/10'
      }`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_rgba(10,14,23,0)_70%)] blur-[50px]" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto z-10">
        
        {/* Title / Status */}
        <div className="mb-12 text-center h-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={matchState}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {matchState === 'searching' && (
                <>
                  <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
                    상대 찾는 중<span className="animate-pulse">...</span>
                  </h2>
                  <div className="text-arena-text-muted font-mono bg-white/5 rounded-full px-4 py-1 inline-block border border-white/5">
                    {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}
                  </div>
                </>
              )}
              {matchState === 'found' && (
                <h2 className="text-3xl font-black text-arena-gold drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  상대 발견!
                </h2>
              )}
              {matchState === 'countdown' && (
                <h2 className="text-3xl font-black tracking-tight">
                  게임 시작 준비
                </h2>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The Reels / Match Display */}
        <div className="flex items-center justify-center w-full gap-4 mb-16 relative">
          {/* Left Reel (Me) */}
          <div className="flex flex-col items-center w-28">
            <div className="w-24 h-24 bg-gradient-to-b from-gray-800 to-black rounded-[2rem] border border-white/10 flex items-center justify-center text-4xl shadow-xl z-10 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/60 pointer-events-none" />
               {getCharacterEmoji(gameSettings.options.characterId)}
            </div>
            {matchState !== 'searching' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
                <div className="text-xs text-arena-text-muted font-bold">{DEMO_USER.grade}</div>
                <div className="font-bold text-sm truncate w-24">{DEMO_USER.nickname}</div>
              </motion.div>
            )}
          </div>

          {/* Center (VS / Countdown) */}
          <div className="w-20 flex justify-center z-20">
             <AnimatePresence mode="wait">
               {matchState === 'countdown' ? (
                 <motion.div
                   key={countdown}
                   initial={{ scale: 0.5, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 1.5, opacity: 0 }}
                   className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] italic"
                 >
                   {countdown > 0 ? countdown : 'GO'}
                 </motion.div>
               ) : (
                 <motion.div
                   key="vs"
                   className="w-16 h-16 rounded-full bg-arena-gold flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] border-4 border-arena-bg"
                 >
                   <span className="font-black italic text-arena-bg text-xl tracking-tighter">VS</span>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Right Reel (Opponent) */}
          <div className="flex flex-col items-center w-28 relative">
            <div className={`w-24 h-24 bg-gradient-to-b from-gray-800 to-black rounded-[2rem] border-2 flex items-center justify-center text-4xl shadow-xl z-10 relative overflow-hidden transition-colors duration-300 ${matchState !== 'searching' ? 'border-arena-error shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'border-white/10'}`}>
               <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/60 pointer-events-none z-20" />
               <AnimatePresence mode="popLayout">
                 {matchState === 'searching' ? (
                   <motion.div
                     key={currentCandidate}
                     initial={{ y: -40, opacity: 0.5 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ y: 40, opacity: 0.5 }}
                     transition={{ duration: 0.1 }}
                     className="absolute"
                   >
                     {currentCandidate}
                   </motion.div>
                 ) : (
                   <motion.div
                     key="found"
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="relative z-10"
                   >
                     {DEMO_OPPONENT.avatar}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
            
            {matchState !== 'searching' && (
              <motion.button 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                onClick={() => setShowOpponentDetails(true)}
                className="mt-4 text-center cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="text-xs text-arena-error font-bold">{DEMO_OPPONENT.grade}</div>
                <div className="font-bold text-sm truncate w-24 flex items-center justify-center gap-1">
                  {DEMO_OPPONENT.nickname}
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </div>
              </motion.button>
            )}
          </div>
        </div>

        {/* Table Details (Shown when found) */}
        {matchState !== 'searching' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="w-full max-w-xs bg-black/40 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md"
           >
              <h3 className="text-xs font-bold text-gray-400 mb-2">{table.name}</h3>
              {table.isFree ? (
                <div className="text-white font-bold text-lg">참가비 무료</div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <div className="text-[10px] text-gray-500">참가 포인트</div>
                    <div className="font-bold">{table.entryPoint.toLocaleString()}</div>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div>
                    <div className="text-[10px] text-arena-gold">승리 시 지급</div>
                    <div className="font-black text-arena-gold text-lg">+{table.winnerPoint.toLocaleString()}</div>
                  </div>
                </div>
              )}
           </motion.div>
        )}

      </div>

      {/* Bottom Area (Searching State only) */}
      <AnimatePresence>
        {matchState === 'searching' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full px-4 pb-8 flex flex-col space-y-4"
          >
            {/* Status Details Toggle */}
            <div className="w-full max-w-sm mx-auto">
              <button 
                onClick={() => { triggerHaptic('light'); setShowStatusDetails(!showStatusDetails); }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                상태 보기
                {showStatusDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              <AnimatePresence>
                {showStatusDetails && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-black/50 border border-white/5 rounded-2xl p-4 mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {MATCHING_STEPS.map((step, idx) => {
                        const isCompleted = currentStepIndex > idx;
                        const isCurrent = currentStepIndex === idx;
                        return (
                          <div key={idx} className={`flex items-center gap-2 text-xs transition-colors ${isCompleted ? 'text-gray-400' : isCurrent ? 'text-arena-gold font-bold' : 'text-gray-700'}`}>
                             {isCompleted ? <Check className="w-3 h-3 text-arena-success" /> : (isCurrent ? <div className="w-1.5 h-1.5 rounded-full bg-arena-gold animate-pulse ml-1 mr-0.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-700 ml-1 mr-0.5" />)}
                             {step}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cancel Button */}
            <button 
              onClick={() => { triggerHaptic('light'); navigate('/match/tables'); }}
              className="w-full max-w-sm mx-auto py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-colors"
            >
              매칭 취소
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opponent Details Modal */}
      <AnimatePresence>
        {showOpponentDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowOpponentDetails(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xs bg-arena-card border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center"
            >
              <button onClick={() => setShowOpponentDetails(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 rounded-2xl bg-black border border-arena-error/30 flex items-center justify-center text-3xl mb-3">
                {DEMO_OPPONENT.avatar}
              </div>
              <div className="text-xs text-arena-error font-bold mb-1">{DEMO_OPPONENT.grade}</div>
              <div className="font-black text-lg mb-6">{DEMO_OPPONENT.nickname}</div>
              
              <div className="grid grid-cols-2 gap-3 w-full text-left">
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-gray-500 mb-1">최근 승률</div>
                  <div className="font-bold text-white">{DEMO_OPPONENT.winRate}</div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-gray-500 mb-1">최고 연승</div>
                  <div className="font-bold text-white">{DEMO_OPPONENT.maxStreak}연승</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
