import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Frown, Clock, Info, X, ShieldAlert, Swords } from 'lucide-react';
import { PrimaryButton } from '@/components/common/Buttons';

const DEMO_HISTORY = [
  { 
    id: 'm1', 
    opponent: 'GHOST***', 
    grade: '골드', 
    table: '브론즈 테이블', 
    entryPoint: 1000, 
    isWin: true, 
    score: '2:1', 
    time: '12분 전',
    rounds: [
      { round: 1, myHand: 'ROCK', oppHand: 'SCISSORS', attacker: 'ME', result: '공격권 획득', myTime: '1.2s', oppTime: '2.5s' },
      { round: 2, myHand: 'ROCK', oppHand: 'ROCK', attacker: 'ME', result: '승리 (1점 획득)', myTime: '0.8s', oppTime: '1.5s' },
      { round: 3, myHand: 'PAPER', oppHand: 'SCISSORS', attacker: 'OPPONENT', result: '패배 (상대 1점)', myTime: '1.5s', oppTime: '1.1s' },
      { round: 4, myHand: 'SCISSORS', oppHand: 'SCISSORS', attacker: 'ME', result: '승리 (1점 획득)', myTime: '0.9s', oppTime: '1.8s' }
    ]
  },
  { 
    id: 'm2', 
    opponent: 'TIGER_88', 
    grade: '실버', 
    table: '브론즈 테이블', 
    entryPoint: 1000, 
    isWin: false, 
    score: '0:2', 
    time: '45분 전',
    rounds: [
      { round: 1, myHand: 'PAPER', oppHand: 'ROCK', attacker: 'OPPONENT', result: '패배 (상대 1점)', myTime: '2.1s', oppTime: '0.5s' },
      { round: 2, myHand: 'ROCK', oppHand: 'ROCK', attacker: 'OPPONENT', result: '패배 (상대 1점)', myTime: '1.8s', oppTime: '1.0s' }
    ]
  },
  { 
    id: 'm3', 
    opponent: 'SHADOW', 
    grade: '골드', 
    table: '무료 테이블', 
    entryPoint: 0, 
    isWin: true, 
    score: '2:0', 
    time: '2시간 전',
    rounds: [
      { round: 1, myHand: 'SCISSORS', oppHand: 'PAPER', attacker: 'ME', result: '공격권 획득', myTime: '1.1s', oppTime: '1.9s' },
      { round: 2, myHand: 'SCISSORS', oppHand: 'SCISSORS', attacker: 'ME', result: '승리 (1점 획득)', myTime: '0.7s', oppTime: '1.5s' },
      { round: 3, myHand: 'ROCK', oppHand: 'ROCK', attacker: 'ME', result: '승리 (1점 획득)', myTime: '0.6s', oppTime: '1.2s' }
    ]
  },
];

const HAND_LABELS = {
  ROCK: '✊',
  SCISSORS: '✌️',
  PAPER: '🖐️',
};

export function MatchHistoryPage() {
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState<typeof DEMO_HISTORY[0] | null>(null);

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 font-sans relative">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2">경기 기록</h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {DEMO_HISTORY.map((match) => (
          <motion.div 
            key={match.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`bg-arena-card border rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors ${
              match.isWin ? 'border-arena-cyan/20' : 'border-arena-error/20'
            }`}
            onClick={() => setSelectedMatch(match)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  match.isWin ? 'bg-arena-cyan/10 border-arena-cyan/30 text-arena-cyan' : 'bg-arena-error/10 border-arena-error/30 text-arena-error'
                }`}>
                  {match.isWin ? <Trophy className="w-5 h-5" /> : <Frown className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {match.opponent}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-arena-text-muted">
                      {match.grade}
                    </span>
                  </div>
                  <div className="text-xs text-arena-text-muted flex items-center gap-2 mt-0.5">
                    <span>{match.table}</span>
                    <span>•</span>
                    <span>{match.time}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-black ${match.isWin ? 'text-arena-cyan' : 'text-arena-error'}`}>
                  {match.isWin ? '승리' : '패배'}
                </div>
                <div className="text-xs font-bold text-white tracking-widest">{match.score}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-sm">
              <div className="flex items-center space-x-2 text-arena-text-muted">
                <Swords className="w-4 h-4" />
                <span>참가 {match.entryPoint.toLocaleString()} P</span>
              </div>
              <button className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
                상세 보기
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedMatch(null)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-arena-card border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white">경기 상세 정보</h3>
                <button onClick={() => setSelectedMatch(null)} className="p-2 -mr-2 text-arena-text-muted hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                {/* Header Summary */}
                <div className="flex justify-between items-center bg-black/30 p-4 rounded-2xl mb-6">
                  <div className="text-center w-1/3">
                    <div className="text-sm font-bold text-white mb-1">나</div>
                    <div className={`text-2xl font-black ${selectedMatch.isWin ? 'text-arena-cyan' : 'text-white'}`}>
                      {selectedMatch.score.split(':')[0]}
                    </div>
                  </div>
                  <div className="text-xl font-black text-arena-text-muted">VS</div>
                  <div className="text-center w-1/3">
                    <div className="text-sm font-bold text-white mb-1">{selectedMatch.opponent}</div>
                    <div className={`text-2xl font-black ${!selectedMatch.isWin ? 'text-arena-error' : 'text-white'}`}>
                      {selectedMatch.score.split(':')[1]}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-arena-text-muted flex items-center mb-2">
                    <Clock className="w-4 h-4 mr-2" /> 라운드별 상세 내역
                  </h4>
                  {selectedMatch.rounds.map((round) => (
                    <div key={round.round} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-arena-gold bg-arena-gold/10 px-2 py-0.5 rounded">
                          Round {round.round}
                        </span>
                        <span className={`text-xs font-bold ${
                          round.result.includes('승리') ? 'text-arena-cyan' : 
                          round.result.includes('패배') ? 'text-arena-error' : 'text-white'
                        }`}>
                          {round.result}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        {/* My Hand */}
                        <div className="text-center w-1/3 relative">
                          {round.attacker === 'ME' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-cyan text-black px-1 rounded">ATTACK</div>
                          )}
                          <div className="text-3xl mb-1">{HAND_LABELS[round.myHand as keyof typeof HAND_LABELS]}</div>
                          <div className="text-[10px] text-arena-text-muted">{round.myTime}</div>
                        </div>

                        <div className="text-xs text-white/30 font-bold">VS</div>

                        {/* Opponent Hand */}
                        <div className="text-center w-1/3 relative">
                          {round.attacker === 'OPPONENT' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-error text-white px-1 rounded">ATTACK</div>
                          )}
                          <div className="text-3xl mb-1">{HAND_LABELS[round.oppHand as keyof typeof HAND_LABELS]}</div>
                          <div className="text-[10px] text-arena-text-muted">{round.oppTime}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
