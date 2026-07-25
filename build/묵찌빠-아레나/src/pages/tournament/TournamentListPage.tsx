import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Users, Clock, AlertCircle, Coins, ChevronRight } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { DEMO_USER } from '@/data/demoData';

type TournamentStatus = 'recruiting' | 'full' | 'waiting' | 'playing' | 'final' | 'finished' | 'cancelled';

interface Tournament {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  entryPoint: number;
  fee: number;
  reward: number;
  startTime: string;
  allowedGrade: string;
  status: TournamentStatus;
  gameRule: string;
  estimatedTime: string;
  cancelLimit: string;
}

const TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    name: '제 1회 하이롤러 챔피언십',
    maxPlayers: 8,
    currentPlayers: 8,
    entryPoint: 100000,
    fee: 10000,
    reward: 700000,
    startTime: '오늘 20:00',
    allowedGrade: '플래티넘 이상',
    status: 'waiting',
    gameRule: '3판 2선승 (결승 5판 3선승)',
    estimatedTime: '약 30분',
    cancelLimit: '시작 5분 전까지'
  },
  {
    id: 't-2',
    name: '주말 8인 단기 토너먼트',
    maxPlayers: 8,
    currentPlayers: 5,
    entryPoint: 10000,
    fee: 1000,
    reward: 70000,
    startTime: '오늘 21:00',
    allowedGrade: '브론즈 이상',
    status: 'recruiting',
    gameRule: '3판 2선승',
    estimatedTime: '약 20분',
    cancelLimit: '시작 10분 전까지'
  },
  {
    id: 't-3',
    name: '심야 데스매치',
    maxPlayers: 8,
    currentPlayers: 8,
    entryPoint: 50000,
    fee: 5000,
    reward: 350000,
    startTime: '오늘 23:00',
    allowedGrade: '골드 이상',
    status: 'full',
    gameRule: '단판승부 (결승 3판 2선승)',
    estimatedTime: '약 15분',
    cancelLimit: '시작 5분 전까지'
  },
  {
    id: 't-4',
    name: '오후 스피드 런',
    maxPlayers: 8,
    currentPlayers: 8,
    entryPoint: 5000,
    fee: 500,
    reward: 35000,
    startTime: '오늘 15:00',
    allowedGrade: '제한 없음',
    status: 'playing',
    gameRule: '3판 2선승',
    estimatedTime: '약 20분',
    cancelLimit: '시작 10분 전'
  }
];

const getStatusBadge = (status: TournamentStatus) => {
  switch (status) {
    case 'recruiting': return <span className="bg-arena-cyan/20 text-arena-cyan px-2 py-0.5 rounded text-xs font-bold">모집 중</span>;
    case 'full': return <span className="bg-arena-gold/20 text-arena-gold px-2 py-0.5 rounded text-xs font-bold">모집 완료</span>;
    case 'waiting': return <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold">시작 대기</span>;
    case 'playing': return <span className="bg-arena-error/20 text-arena-error px-2 py-0.5 rounded text-xs font-bold">진행 중</span>;
    case 'final': return <span className="bg-arena-error/20 text-arena-error px-2 py-0.5 rounded text-xs font-bold animate-pulse">결승전 진행 중</span>;
    case 'finished': return <span className="bg-white/10 text-arena-text-muted px-2 py-0.5 rounded text-xs font-bold">종료</span>;
    case 'cancelled': return <span className="bg-white/10 text-arena-text-muted px-2 py-0.5 rounded text-xs font-bold">취소됨</span>;
  }
};

export function TournamentListPage({ hideHeader }: { hideHeader?: boolean }) {
  const navigate = useNavigate();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  const handleJoin = (t: Tournament) => {
    triggerHaptic('light');
    setSelectedTournament(t);
  };

  const confirmJoin = () => {
    triggerHaptic('success');
    navigate(`/tournament/${selectedTournament?.id}`);
  };

  return (
    <div className={`min-h-screen bg-arena-bg text-white ${!hideHeader && 'pb-20'} font-sans`}>
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2">토너먼트</h1>
        </header>
      )}

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {TOURNAMENTS.map(t => (
          <div key={t.id} className="bg-arena-card border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(t.status)}
                  <span className="text-[10px] bg-white/10 text-arena-text-muted px-1.5 py-0.5 rounded font-bold">{t.allowedGrade}</span>
                </div>
                <h3 className="font-bold text-xl text-white">{t.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-xs text-arena-text-muted mb-1 flex items-center justify-end">
                  <Users className="w-3 h-3 mr-1" /> 참가 현황
                </div>
                <div className="font-bold text-white text-lg">
                  <span className={t.currentPlayers === t.maxPlayers ? 'text-arena-error' : 'text-arena-cyan'}>
                    {t.currentPlayers}
                  </span>
                  <span className="text-arena-text-muted"> / {t.maxPlayers}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 flex justify-between items-center mb-4 border border-white/5">
              <div>
                <span className="text-xs text-arena-text-muted block mb-1">참가비</span>
                <span className="font-bold text-white text-lg">{t.entryPoint.toLocaleString()} P</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-arena-text-muted flex items-center justify-end mb-1">
                  <Trophy className="w-3 h-3 mr-1 text-arena-gold" /> 우승 상금
                </span>
                <span className="font-black text-arena-gold text-xl">{t.reward.toLocaleString()} P</span>
              </div>
            </div>

            <PrimaryButton 
              disabled={t.status !== 'recruiting' && t.status !== 'waiting'} 
              onClick={() => handleJoin(t)}
              className="w-full py-4 text-lg"
            >
              {t.status === 'recruiting' ? '참가하기' : t.status === 'waiting' ? '대기실 입장' : '관전하기'}
            </PrimaryButton>
          </div>
        ))}
      </div>

      {/* Join Confirm Modal */}
      <AnimatePresence>
        {selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTournament(null)}
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-arena-card border border-white/10 rounded-3xl p-6 shadow-2xl mb-safe"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              
              <h2 className="text-xl font-bold text-white mb-2">{selectedTournament.name}</h2>
              <p className="text-sm text-arena-text-muted mb-6">토너먼트 참가 규정을 확인해주세요.</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-sm text-arena-text-muted">내 보유 포인트</span>
                  <span className="font-bold text-white">{DEMO_USER.points.toLocaleString()} P</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-sm text-arena-text-muted">참가 포인트</span>
                  <span className="font-bold text-arena-error">-{selectedTournament.entryPoint.toLocaleString()} P</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-sm text-arena-text-muted">운영 수수료</span>
                  <span className="font-bold text-arena-error">-{selectedTournament.fee.toLocaleString()} P</span>
                </div>
                <div className="flex justify-between items-center bg-arena-gold/10 p-3 rounded-xl border border-arena-gold/30">
                  <span className="text-sm font-bold text-arena-gold flex items-center">
                    <Trophy className="w-4 h-4 mr-2" /> 최종 우승 보상
                  </span>
                  <span className="font-bold text-arena-gold">+{selectedTournament.reward.toLocaleString()} P</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-arena-text-muted">진행 방식</span>
                  <span className="text-white font-bold">{selectedTournament.gameRule}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-arena-text-muted">예상 진행 시간</span>
                  <span className="text-white font-bold">{selectedTournament.estimatedTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-arena-text-muted">참가 취소 가능 시간</span>
                  <span className="text-white font-bold">{selectedTournament.cancelLimit}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-6 p-3 bg-arena-error/10 rounded-xl border border-arena-error/20 text-xs text-arena-error">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>취소 가능 시간이 지나거나 진행 중 이탈 시 참가 포인트와 수수료는 반환되지 않습니다.</p>
              </div>

              <div className="flex gap-3">
                <SecondaryButton onClick={() => setSelectedTournament(null)} className="flex-1 py-4">
                  취소
                </SecondaryButton>
                <PrimaryButton onClick={confirmJoin} className="flex-1 py-4">
                  결제 후 참가
                </PrimaryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
