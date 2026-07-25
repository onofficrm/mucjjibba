import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, Search, Share2, Home, ChevronDown, ChevronUp, Clock, 
  XCircle, ShieldAlert, CheckCircle2, ChevronRight, Activity, Zap
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { DEMO_USER } from '@/data/demoData';

type RematchState = 'idle' | 'requesting' | 'accepted' | 'declined' | 'timeout' | 'disconnected';

export function GameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isBeginnerMode = id === 'beginner-ai';
  
  const winner = location.state?.winner || 'ME';
  const myScore = location.state?.myScore || 2;
  const opponentScore = location.state?.opponentScore || 0;
  
  const isWin = winner === 'ME';

  const [rematchState, setRematchState] = useState<RematchState>('idle');
  const [rematchTimeLeft, setRematchTimeLeft] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const tableInfo = {
    name: isBeginnerMode ? '초보자 연습장' : '골드 테이블',
    entryPoint: isBeginnerMode ? 0 : 10000,
    fee: isBeginnerMode ? 0 : 1000,
    winnerPoint: isBeginnerMode ? 0 : 19000,
  };

  const pointsBefore = DEMO_USER.points;
  const pointsAfter = isWin ? pointsBefore + tableInfo.winnerPoint - tableInfo.entryPoint : pointsBefore - tableInfo.entryPoint;

  useEffect(() => {
    if (isWin) {
      audioManager.playSFX('final_win');
      audioManager.playBGM('win_result');
    } else {
      audioManager.playSFX('final_lose');
      audioManager.stopBGM();
    }
  }, [isWin]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rematchState === 'requesting' && rematchTimeLeft > 0) {
      timer = setTimeout(() => {
        setRematchTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (rematchState === 'requesting' && rematchTimeLeft === 0) {
      setRematchState('timeout');
    }
    return () => clearTimeout(timer);
  }, [rematchState, rematchTimeLeft]);

  const handleRequestRematch = () => {
    triggerHaptic('medium');
    setRematchState('requesting');
    setRematchTimeLeft(5);
    
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setRematchState('accepted');
        triggerHaptic('success');
        setTimeout(() => setShowConfirmModal(true), 1000);
      } else {
        setRematchState('declined');
        triggerHaptic('error');
      }
    }, 2000);
  };

  const handleStartRematch = () => {
    triggerHaptic('heavy');
    navigate(`/game/${id || 'demo-1234'}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none overflow-hidden pb-safe relative">
      {/* Background Ambience */}
      <div className={`absolute inset-0 z-0 ${
        isWin ? 'bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15)_0%,_rgba(0,0,0,1)_80%)]' 
              : 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05)_0%,_rgba(0,0,0,1)_80%)]'
      }`} />

      {/* Main Result Content */}
      <div className="flex-1 overflow-y-auto px-6 py-10 relative z-10 flex flex-col items-center">
        
        {/* Result Header */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="flex flex-col items-center text-center mt-8 mb-12 w-full max-w-sm"
        >
          {isWin ? (
            <>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] tracking-widest mb-4">
                VICTORY
              </h1>
              <div className="text-arena-gold font-black text-4xl mb-4">
                +{tableInfo.winnerPoint.toLocaleString()} <span className="text-xl">P</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex justify-between items-center mt-2 shadow-lg">
                <span className="text-gray-400 font-bold">현재 연승</span>
                <span className="text-white font-black text-2xl tracking-tighter">{DEMO_USER.streak + 1} 연승 🔥</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex justify-between items-center mt-3 shadow-lg">
                <span className="text-gray-400 font-bold">랭킹 변화</span>
                <span className="text-arena-success font-black text-xl flex items-center">
                  <ChevronUp className="w-5 h-5 mr-1" /> 124위 (▲ 12)
                </span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-black text-gray-500 tracking-widest mb-4">
                RESULT
              </h1>
              <div className="text-gray-400 font-black text-4xl mb-4">
                -{tableInfo.entryPoint.toLocaleString()} <span className="text-xl">P</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full flex justify-between items-center mt-2">
                <span className="text-gray-500 font-bold">현재 등급</span>
                <span className="text-white font-black text-xl">{DEMO_USER.grade}</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full flex justify-between items-center mt-3">
                <span className="text-gray-500 font-bold">획득 경험치</span>
                <span className="text-gray-300 font-black text-xl">+120 EXP</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Expandable Sections */}
        <div className="w-full max-w-sm space-y-3 mb-24">
          
          {/* Settlement Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button 
              onClick={() => { triggerHaptic('light'); setShowSettlement(!showSettlement); }}
              className="w-full p-4 flex justify-between items-center text-sm font-bold text-gray-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-gray-400" /> 정산 내역</span>
              {showSettlement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showSettlement && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-black/50"
                >
                  <div className="p-4 space-y-3 text-sm border-t border-gray-800">
                    <div className="flex justify-between text-gray-400">
                      <span>게임 전 포인트</span>
                      <span>{pointsBefore.toLocaleString()} P</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>운영 수수료</span>
                      <span className="text-arena-error">-{tableInfo.fee.toLocaleString()} P</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-gray-800">
                      <span>게임 후 포인트</span>
                      <span className={isWin ? 'text-arena-gold' : 'text-white'}>{pointsAfter.toLocaleString()} P</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Match Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button 
              onClick={() => { triggerHaptic('light'); setShowAnalysis(!showAnalysis); }}
              className="w-full p-4 flex justify-between items-center text-sm font-bold text-gray-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400" /> 이번 경기 분석</span>
              {showAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showAnalysis && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-black/50"
                >
                  <div className="p-4 space-y-3 text-sm border-t border-gray-800">
                    <div className="flex justify-between text-gray-400">
                      <span>최종 스코어</span>
                      <span className="text-white font-bold">{myScore} : {opponentScore}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>선택 (묵/찌/빠)</span>
                      <span className="text-white">1 / 2 / 0</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>평균 선택 시간</span>
                      <span className="text-white">1.8초</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>공격 성공률</span>
                      <span className="text-white">{(myScore / (myScore + opponentScore) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Action Area */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-20 pb-safe pt-8">
        <div className="max-w-sm mx-auto flex flex-col gap-3">
          
          {/* Status Alert for Rematch */}
          <AnimatePresence mode="wait">
            {rematchState === 'requesting' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 mr-3 animate-pulse text-white" />
                  <span className="text-sm font-bold">재대결 응답 대기중...</span>
                </div>
                <span className="text-lg font-black text-white">{rematchTimeLeft}</span>
              </motion.div>
            )}
            {rematchState === 'declined' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gray-900 border border-red-900/50 rounded-xl p-4 flex items-center justify-between text-arena-error shadow-lg">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 mr-3" />
                  <span className="text-sm font-bold">상대가 거절했습니다.</span>
                </div>
                <button onClick={() => setRematchState('idle')} className="text-xs px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 font-bold text-white transition-colors">확인</button>
              </motion.div>
            )}
            {(rematchState === 'timeout' || rematchState === 'disconnected') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center justify-between text-gray-400 shadow-lg">
                <div className="flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-3" />
                  <span className="text-sm font-bold">응답 시간이 초과되었습니다.</span>
                </div>
                <button onClick={() => setRematchState('idle')} className="text-xs px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 font-bold text-white transition-colors">확인</button>
              </motion.div>
            )}
            {rematchState === 'accepted' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-arena-success/10 border border-arena-success/30 rounded-xl p-4 flex items-center justify-center text-arena-success shadow-lg">
                <CheckCircle2 className="w-5 h-5 mr-3" />
                <span className="text-sm font-bold">상대가 수락했습니다!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary Action Buttons */}
          {rematchState === 'idle' && (
            <div className="flex gap-3">
              {isBeginnerMode ? (
                <>
                  <PrimaryButton 
                    onClick={() => navigate('/match/tables')} 
                    className="flex-1 py-5 text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-arena-success hover:bg-emerald-500 border-none flex flex-col items-center justify-center gap-1"
                  >
                    실전 대전하기
                  </PrimaryButton>
                  <SecondaryButton 
                    onClick={() => navigate('/lobby')} 
                    className="flex-1 py-5 text-lg bg-gray-800 hover:bg-gray-700 border-gray-700 flex flex-col items-center justify-center gap-1"
                  >
                    로비로 가기
                  </SecondaryButton>
                </>
              ) : (
                <>
                  <PrimaryButton 
                    onClick={handleRequestRematch} 
                    className={`flex-1 py-5 text-lg shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center gap-1 ${isWin ? 'bg-arena-gold text-black hover:bg-yellow-500 border-none' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5" /> 재대결
                    </div>
                  </PrimaryButton>
                  <SecondaryButton 
                    onClick={() => navigate('/match/tables')} 
                    className="flex-1 py-5 text-lg bg-gray-800 hover:bg-gray-700 border-gray-700 flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5" /> 새 상대
                    </div>
                  </SecondaryButton>
                </>
              )}
            </div>
          )}

          {/* Secondary Icons */}
          <div className="flex justify-center gap-6 mt-2 pt-4 border-t border-gray-900">
            <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors" onClick={() => triggerHaptic('light')}>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">기록</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors" onClick={() => triggerHaptic('light')}>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">공유</span>
            </button>
            <button onClick={() => { triggerHaptic('light'); navigate('/lobby'); }} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">로비</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rematch Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-gray-800">
                <h3 className="text-lg font-black text-white text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-arena-success" /> 재대결 수락됨
                </h3>
              </div>
              
              <div className="p-6 space-y-4 bg-black/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold">참가 테이블</span>
                  <span className="text-white font-bold">{tableInfo.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold">참가 포인트</span>
                  <span className="text-white font-bold">{tableInfo.entryPoint.toLocaleString()} P</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-400 font-bold">현재 포인트</span>
                    <span className={`font-bold ${pointsAfter < tableInfo.entryPoint ? 'text-arena-error' : 'text-arena-gold'}`}>
                      {pointsAfter.toLocaleString()} P
                    </span>
                  </div>
                  {pointsAfter < tableInfo.entryPoint && (
                    <p className="text-xs text-arena-error text-right">포인트가 부족합니다.</p>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex gap-3 border-t border-gray-800 bg-black/40">
                <SecondaryButton 
                  onClick={() => { setShowConfirmModal(false); setRematchState('idle'); }} 
                  className="flex-1 bg-gray-800 border-none text-white hover:bg-gray-700"
                >
                  취소
                </SecondaryButton>
                <PrimaryButton 
                  onClick={handleStartRematch}
                  disabled={pointsAfter < tableInfo.entryPoint}
                  className="flex-1 bg-arena-gold text-black border-none hover:bg-yellow-500 disabled:opacity-50 disabled:grayscale"
                >
                  게임 시작
                </PrimaryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
