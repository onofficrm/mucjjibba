import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Crown, Users, Play, Clock, 
  History, Info, Swords, Flame, X, Trophy,
  Activity, Star
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { DEMO_USER } from '@/data/demoData';

type ViewState = 'main' | 'queue' | 'records' | 'rules';

const CURRENT_KING = {
  nickname: 'SHADOW_MASTER',
  grade: '다이아',
  currentStreak: 7,
  maxStreak: 12,
  table: '골드 테이블',
  entryPoint: 10000,
  waitingCount: 15,
  status: 'playing', // playing, waiting
  timeLeft: 45 // seconds left until timeout if waiting
};

const RECORDS = {
  allTime: { nickname: 'KING_MAKER', streak: 42, date: '2023.10.15' },
  today: { nickname: 'LUCKY_SEVEN', streak: 15, date: '오늘 14:30' },
  week: { nickname: 'PRO_GAMER', streak: 28, date: '이번 주 월요일' },
  current: [
    { nickname: 'SHADOW_MASTER', streak: 7, table: '골드' },
    { nickname: 'BEGINNER_LUCK', streak: 4, table: '실버' }
  ],
  recentEnded: [
    { nickname: 'TIGER_88', streak: 9, endBy: 'GHOST***', time: '10분 전' },
    { nickname: 'DRAGON_X', streak: 14, endBy: 'SHADOW_MASTER', time: '45분 전' }
  ]
};

const getBadgeForStreak = (streak: number) => {
  if (streak >= 20) return { icon: <Star className="w-4 h-4" />, color: 'bg-purple-500 text-white', label: '20연승 마스터' };
  if (streak >= 10) return { icon: <Trophy className="w-4 h-4" />, color: 'bg-arena-gold text-black', label: '10연승 챔피언' };
  if (streak >= 5) return { icon: <Flame className="w-4 h-4" />, color: 'bg-arena-error text-white', label: '5연승 파괴자' };
  if (streak >= 3) return { icon: <Activity className="w-4 h-4" />, color: 'bg-arena-cyan text-black', label: '3연승 달성' };
  return null;
};

export function ArenaPage() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('main');
  const [queueOrder, setQueueOrder] = useState(16);
  const [waitTime, setWaitTime] = useState(120);

  // Mock queue progression
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (viewState === 'queue') {
      timer = setInterval(() => {
        setWaitTime(prev => Math.max(0, prev - 1));
        if (Math.random() > 0.7) {
          setQueueOrder(prev => Math.max(1, prev - 1));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [viewState]);

  // Handle transition to game when queue reaches 0
  useEffect(() => {
    if (viewState === 'queue' && queueOrder === 1 && waitTime === 0) {
      triggerHaptic('success');
      navigate('/game/arena-1234');
    }
  }, [viewState, queueOrder, waitTime, navigate]);

  const handleChallenge = () => {
    triggerHaptic('medium');
    setViewState('queue');
    setQueueOrder(CURRENT_KING.waitingCount + 1);
    setWaitTime((CURRENT_KING.waitingCount + 1) * 30); // 30s per person mock
  };

  const badge = getBadgeForStreak(CURRENT_KING.currentStreak);

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 font-sans relative">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => {
            if (viewState !== 'main') setViewState('main');
            else navigate(-1);
          }} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2">
            {viewState === 'main' ? '연승 아레나' : 
             viewState === 'queue' ? '도전자 대기열' : 
             viewState === 'records' ? '아레나 명예의 전당' : '아레나 규칙'}
          </h1>
        </div>
        {viewState === 'main' && (
          <button onClick={() => setViewState('rules')} className="p-2 text-arena-text-muted hover:text-white">
            <Info className="w-5 h-5" />
          </button>
        )}
      </header>

      <div className="max-w-xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {viewState === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Current King Spotlight */}
              <div className="bg-gradient-to-b from-arena-gold/20 to-arena-card border border-arena-gold/30 rounded-3xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-arena-gold/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="absolute top-0 right-0 flex items-center bg-black/40 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                    <span className="w-2 h-2 rounded-full bg-arena-error animate-pulse mr-2" />
                    경기 진행 중
                  </div>

                  <div className="w-24 h-24 rounded-3xl bg-black/50 border-2 border-arena-gold flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(250,204,21,0.3)] mb-4 relative">
                    👑
                    <div className="absolute -bottom-3 px-3 py-1 bg-arena-gold text-black text-xs font-black rounded-full shadow-lg">
                      연승왕
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
                    {CURRENT_KING.nickname}
                    <span className="text-[10px] bg-white/10 text-arena-text-muted px-2 py-0.5 rounded align-middle font-bold">
                      {CURRENT_KING.grade}
                    </span>
                  </h2>

                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-arena-text-muted mb-1">현재 연승</span>
                      <span className="text-4xl font-black text-arena-gold flex items-center">
                        {CURRENT_KING.currentStreak}<span className="text-xl ml-1">연승</span>
                      </span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-arena-text-muted mb-1">최고 기록</span>
                      <span className="text-xl font-bold text-white">{CURRENT_KING.maxStreak}연승</span>
                    </div>
                  </div>

                  {badge && (
                    <div className={`mt-5 flex items-center px-4 py-2 rounded-full font-bold text-sm shadow-lg ${badge.color}`}>
                      {badge.icon}
                      <span className="ml-2">{badge.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arena Info */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
                      <Swords className="w-5 h-5 text-arena-text-muted" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{CURRENT_KING.table}</div>
                      <div className="text-xs text-arena-text-muted">도전자 대기 {CURRENT_KING.waitingCount}명</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-arena-text-muted mb-1">참가 포인트</div>
                    <div className="font-bold text-arena-gold">{CURRENT_KING.entryPoint.toLocaleString()} P</div>
                  </div>
                </div>

                <PrimaryButton onClick={handleChallenge} className="w-full py-4 text-lg mb-3 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                  연승왕에게 도전하기
                </PrimaryButton>

                <div className="grid grid-cols-2 gap-3">
                  <SecondaryButton onClick={() => navigate('/spectate/arena-1234')} className="flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" /> 경기 관전
                  </SecondaryButton>
                  <SecondaryButton onClick={() => setViewState('records')} className="flex items-center justify-center">
                    <History className="w-4 h-4 mr-2" /> 기록실
                  </SecondaryButton>
                </div>
              </div>

              {/* Timeout Warning (Demo) */}
              <div className="bg-black/40 border border-arena-warning/30 rounded-xl p-4 flex items-center">
                <Clock className="w-5 h-5 text-arena-warning mr-3 shrink-0" />
                <div className="text-sm">
                  <span className="text-arena-warning font-bold">도전자 대기 중</span>
                  <p className="text-arena-text-muted text-xs mt-0.5">연승왕이 3분 이내에 경기를 시작하지 않으면 연승이 자동 종료됩니다.</p>
                </div>
              </div>
            </motion.div>
          )}

          {viewState === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[calc(100vh-120px)]"
            >
              <div className="flex-1 flex flex-col items-center justify-center bg-arena-card border border-white/10 rounded-3xl p-6 text-center space-y-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-arena-cyan/5 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-arena-text-muted mb-6">나의 대기 순서</h2>
                  <div className="w-40 h-40 rounded-full border-4 border-arena-cyan/30 flex items-center justify-center relative mx-auto mb-8 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <div className="absolute inset-0 border-4 border-arena-cyan rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-6xl font-black text-white">{queueOrder}</span>
                    <span className="absolute -bottom-2 bg-arena-bg px-2 text-sm text-arena-text-muted font-bold">번째</span>
                  </div>

                  <div className="space-y-4 max-w-xs mx-auto">
                    <div className="flex justify-between items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5">
                      <span className="text-sm text-arena-text-muted flex items-center"><Clock className="w-4 h-4 mr-2" /> 예상 대기 시간</span>
                      <span className="font-bold text-white">약 {Math.floor(waitTime / 60)}분 {waitTime % 60}초</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5">
                      <span className="text-sm text-arena-text-muted flex items-center"><Users className="w-4 h-4 mr-2" /> 앞 대기 인원</span>
                      <span className="font-bold text-white">{queueOrder - 1}명</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5">
                      <span className="text-sm text-arena-text-muted flex items-center"><Swords className="w-4 h-4 mr-2" /> 참가 포인트</span>
                      <span className="font-bold text-arena-gold">{CURRENT_KING.entryPoint.toLocaleString()} P</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-3 shrink-0">
                <SecondaryButton 
                  onClick={() => {
                    triggerHaptic('medium');
                    setViewState('main');
                  }} 
                  className="flex items-center justify-center py-4 bg-arena-error/10 text-arena-error hover:bg-arena-error/20 border-arena-error/20"
                >
                  <X className="w-5 h-5 mr-2" /> 매칭 취소
                </SecondaryButton>
                <SecondaryButton 
                  onClick={() => navigate('/spectate/arena-1234')}
                  className="flex items-center justify-center py-4"
                >
                  <Play className="w-5 h-5 mr-2" /> 현재 경기 관전
                </SecondaryButton>
              </div>
            </motion.div>
          )}

          {viewState === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Top Records */}
              <div className="bg-arena-card border border-arena-gold/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-arena-gold/10 blur-[40px] pointer-events-none" />
                <h3 className="font-bold text-lg text-arena-gold flex items-center mb-4 relative z-10">
                  <Trophy className="w-5 h-5 mr-2" /> 역대 최고 연승
                </h3>
                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <div className="font-black text-2xl text-white mb-1">{RECORDS.allTime.nickname}</div>
                    <div className="text-xs text-arena-text-muted">{RECORDS.allTime.date}</div>
                  </div>
                  <div className="text-5xl font-black text-arena-gold drop-shadow-lg">
                    {RECORDS.allTime.streak}<span className="text-xl">승</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-arena-card border border-white/10 rounded-2xl p-4">
                  <h3 className="font-bold text-sm text-white mb-3">오늘 최고 연승</h3>
                  <div className="font-bold text-lg text-white truncate">{RECORDS.today.nickname}</div>
                  <div className="text-2xl font-black text-arena-cyan mt-1">{RECORDS.today.streak}승</div>
                  <div className="text-[10px] text-arena-text-muted mt-2">{RECORDS.today.date}</div>
                </div>
                <div className="bg-arena-card border border-white/10 rounded-2xl p-4">
                  <h3 className="font-bold text-sm text-white mb-3">이번 주 최고 연승</h3>
                  <div className="font-bold text-lg text-white truncate">{RECORDS.week.nickname}</div>
                  <div className="text-2xl font-black text-arena-cyan mt-1">{RECORDS.week.streak}승</div>
                  <div className="text-[10px] text-arena-text-muted mt-2">{RECORDS.week.date}</div>
                </div>
              </div>

              {/* Current Streaks */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-arena-text-muted mb-4 flex items-center">
                  <Flame className="w-4 h-4 mr-2" /> 현재 연승 중인 플레이어
                </h3>
                <div className="space-y-3">
                  {RECORDS.current.map((player, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-arena-gold w-4">{idx + 1}</span>
                        <div>
                          <div className="font-bold text-white text-sm">{player.nickname}</div>
                          <div className="text-xs text-arena-text-muted">{player.table} 테이블</div>
                        </div>
                      </div>
                      <div className="font-black text-arena-cyan">{player.streak}연승</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Ended */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-arena-text-muted mb-4 flex items-center">
                  <History className="w-4 h-4 mr-2" /> 최근 연승 종료
                </h3>
                <div className="space-y-4">
                  {RECORDS.recentEnded.map((record, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div>
                        <div className="font-bold text-white line-through opacity-70 mb-1">{record.nickname}</div>
                        <div className="text-xs text-arena-error">저지: {record.endBy}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white opacity-70 mb-1">{record.streak}연승 마감</div>
                        <div className="text-[10px] text-arena-text-muted">{record.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {viewState === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-arena-card border border-white/10 rounded-2xl p-6 space-y-6"
            >
              <div className="w-12 h-12 rounded-full bg-arena-gold/20 flex items-center justify-center mb-2 mx-auto">
                <Info className="w-6 h-6 text-arena-gold" />
              </div>
              <h2 className="text-xl font-black text-center text-white mb-6">아레나 이용 규칙</h2>
              
              <div className="space-y-4 text-sm text-white/90">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <h3 className="font-bold text-arena-gold mb-2">1. 연승왕 도전</h3>
                  <p className="leading-relaxed">도전자는 정해진 테이블의 참가 포인트를 지불하고 대기열에 진입합니다. 순서가 되면 현재 연승왕과 대결합니다.</p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <h3 className="font-bold text-arena-gold mb-2">2. 연승 보상</h3>
                  <p className="leading-relaxed">연승왕은 승리할 때마다 누적 보상을 받습니다. 3연승, 5연승, 10연승 등 특정 구간 도달 시 추가 배지와 특별 포인트를 획득합니다.</p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <h3 className="font-bold text-arena-error mb-2">3. 패배 시 규칙</h3>
                  <p className="leading-relaxed">연승왕이 패배하면 승리한 도전자가 새로운 연승왕이 되며, 누적된 포인트는 정산되어 지급됩니다. 아레나의 모든 포인트 정산은 중앙 서버에서 안전하게 처리됩니다.</p>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <h3 className="font-bold text-arena-warning mb-2">4. 시간 초과 (자동 종료)</h3>
                  <p className="leading-relaxed">연승왕이 다음 도전자와의 경기를 3분 이내에 시작하지 않거나 접속을 종료하면, 연승은 자동 종료되며 대기 중인 다음 도전자가 새로운 방을 개설하게 됩니다.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
