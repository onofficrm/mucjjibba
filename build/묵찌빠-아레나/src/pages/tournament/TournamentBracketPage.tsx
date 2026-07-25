import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Users, Clock, AlertCircle, Info, 
  Trophy, Share2, Home, X, Bell, Shield, Medal, Crown
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { DEMO_USER } from '@/data/demoData';

type ViewState = 'lobby' | 'bracket' | 'result';

const PLAYERS = [
  { id: '1', nickname: DEMO_USER.nickname, grade: '다이아', status: 'ready', avatar: '👤' },
  { id: '2', nickname: 'GHOST***', grade: '다이아', status: 'ready', avatar: '👻' },
  { id: '3', nickname: 'TIGER_88', grade: '플래티넘', status: 'ready', avatar: '🐯' },
  { id: '4', nickname: 'DRAGON_X', grade: '골드', status: 'ready', avatar: '🐉' },
  { id: '5', nickname: 'LUCKY_SEVEN', grade: '플래티넘', status: 'ready', avatar: '🍀' },
  { id: '6', nickname: 'KING_MAKER', grade: '마스터', status: 'ready', avatar: '👑' },
  { id: '7', nickname: 'SHADOW_M', grade: '다이아', status: 'ready', avatar: '🌑' },
  { id: '8', nickname: 'BEGINNER', grade: '브론즈', status: 'ready', avatar: '🐣' },
];

export function TournamentBracketPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [viewState, setViewState] = useState<ViewState>('lobby');
  const [countdown, setCountdown] = useState(10);
  const [notify, setNotify] = useState(true);

  // Mock countdown for lobby
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (viewState === 'lobby') {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            triggerHaptic('success');
            setViewState('bracket');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [viewState]);

  // Handle fake navigation to match from bracket
  const handlePlayMatch = () => {
    triggerHaptic('medium');
    navigate('/game/tourney-match?tournament=true');
  };

  // Skip to result for demo
  const handleSkipToResult = () => {
    triggerHaptic('success');
    setViewState('result');
  };

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 font-sans">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2">
            {viewState === 'lobby' ? '토너먼트 대기실' : viewState === 'bracket' ? '대진표' : '최종 결과'}
          </h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {viewState === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="bg-arena-card border border-white/10 rounded-3xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-arena-cyan/10 to-transparent pointer-events-none" />
                <h2 className="text-2xl font-black text-white mb-2 relative z-10">제 1회 하이롤러 챔피언십</h2>
                
                <div className="flex items-center justify-center gap-2 mb-6 text-sm relative z-10">
                  <span className="bg-white/10 text-arena-text-muted px-2 py-0.5 rounded font-bold">8인 풀리그</span>
                  <span className="bg-arena-gold/20 text-arena-gold px-2 py-0.5 rounded font-bold flex items-center">
                    <Trophy className="w-3 h-3 mr-1" /> 우승 700,000 P
                  </span>
                </div>

                <div className="bg-black/40 rounded-2xl p-5 border border-white/5 relative z-10">
                  <div className="text-arena-text-muted text-sm mb-2">대진표 생성까지 남은 시간</div>
                  <div className="text-5xl font-black text-white font-mono flex items-center justify-center">
                    00:<span className={countdown <= 5 ? 'text-arena-error animate-pulse' : 'text-arena-cyan'}>
                      {countdown.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Players Grid */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                  <h3 className="font-bold text-sm text-white flex items-center">
                    <Users className="w-4 h-4 mr-2 text-arena-text-muted" /> 참가자 명단
                  </h3>
                  <span className="text-arena-cyan font-bold text-sm">8 / 8 모집 완료</span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {PLAYERS.map(p => (
                    <div key={p.id} className={`flex flex-col items-center bg-black/40 p-2 rounded-xl border ${p.id === '1' ? 'border-arena-cyan' : 'border-white/5'}`}>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl mb-2 relative">
                        {p.avatar}
                        {p.status === 'ready' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-arena-success rounded-full border-2 border-black" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-white truncate w-full text-center">{p.nickname}</span>
                      <span className="text-[9px] text-arena-text-muted">{p.grade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Actions */}
              <div className="space-y-4">
                <div className="bg-arena-card border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-arena-text-muted shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-white font-bold mb-1">대회 규칙 안내</p>
                    <p className="text-arena-text-muted text-xs leading-relaxed">
                      모든 경기는 3판 2선승으로 진행되며, 결승전은 5판 3선승입니다. 매칭이 성사된 후 1분 이내에 입장하지 않으면 실격 처리됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <SecondaryButton className="flex-1 flex items-center justify-center bg-arena-error/10 text-arena-error hover:bg-arena-error/20 border-arena-error/20 py-3.5 text-sm">
                    <X className="w-4 h-4 mr-2" /> 참가 취소
                  </SecondaryButton>
                  <SecondaryButton onClick={() => setNotify(!notify)} className="flex-1 flex items-center justify-center py-3.5 text-sm">
                    {notify ? <Bell className="w-4 h-4 mr-2 text-arena-cyan" /> : <Bell className="w-4 h-4 mr-2 opacity-50" />} 
                    시작 알림 {notify ? 'ON' : 'OFF'}
                  </SecondaryButton>
                </div>
              </div>
            </motion.div>
          )}

          {viewState === 'bracket' && (
            <motion.div
              key="bracket"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Top Banner */}
              <div className="bg-arena-card border border-arena-cyan/30 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white mb-1 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-arena-cyan" /> 8강전 진행 중
                  </h3>
                  <p className="text-xs text-arena-text-muted">나의 다음 경기까지 대기해주세요.</p>
                </div>
                <PrimaryButton onClick={handlePlayMatch} className="px-4 py-2 text-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  경기 입장
                </PrimaryButton>
              </div>

              {/* Bracket Visualization (Simplified for mobile) */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5 overflow-x-auto relative">
                 <div className="min-w-[500px] pb-4">
                   <div className="flex justify-between items-end mb-6 px-4">
                     <span className="text-sm font-bold text-white bg-black/40 px-3 py-1 rounded-lg border border-white/10">8강</span>
                     <span className="text-sm font-bold text-white bg-black/40 px-3 py-1 rounded-lg border border-white/10">4강</span>
                     <span className="text-sm font-bold text-arena-gold bg-arena-gold/10 px-3 py-1 rounded-lg border border-arena-gold/30">결승</span>
                   </div>
                   
                   {/* Visual lines for bracket */}
                   <div className="relative">
                      {/* Match 1 */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-32 space-y-1 relative z-10">
                          <div className="bg-arena-cyan/20 border border-arena-cyan rounded-lg p-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate w-20">{DEMO_USER.nickname}</span>
                            <span className="text-[10px] text-arena-cyan font-bold">승</span>
                          </div>
                          <div className="bg-black/60 border border-white/10 rounded-lg p-2 flex items-center justify-between opacity-50">
                            <span className="text-xs text-white truncate w-20 line-through">BEGINNER</span>
                            <span className="text-[10px] text-arena-text-muted">패</span>
                          </div>
                        </div>

                        {/* Connector line 1 */}
                        <div className="absolute left-32 w-12 border-t-2 border-arena-cyan top-4"></div>
                        <div className="absolute left-44 w-2 h-16 border-l-2 border-b-2 border-arena-cyan top-4 rounded-bl"></div>

                        {/* Semi Final 1 */}
                        <div className="w-32 space-y-1 relative z-10 mr-12 mt-8">
                          <div className="bg-black/60 border border-white/10 border-dashed rounded-lg p-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate w-20">{DEMO_USER.nickname}</span>
                            <span className="text-[10px] text-arena-text-muted">대기</span>
                          </div>
                          <div className="bg-black/60 border border-white/10 border-dashed rounded-lg p-2 flex items-center justify-between">
                            <span className="text-xs text-white truncate w-20">LUCKY_SEVEN</span>
                            <span className="text-[10px] text-arena-text-muted">대기</span>
                          </div>
                        </div>

                        {/* Connector line Semi to Final */}
                        <div className="absolute right-44 w-12 border-t-2 border-white/20 top-[4.5rem]"></div>
                        <div className="absolute right-44 w-2 h-20 border-r-2 border-b-2 border-white/20 top-[4.5rem] rounded-br"></div>

                        {/* Final */}
                        <div className="w-32 bg-arena-gold/10 border border-arena-gold/30 border-dashed rounded-xl p-3 flex items-center justify-center h-20 relative z-10">
                          <Trophy className="w-6 h-6 text-arena-gold/50" />
                        </div>
                      </div>

                      {/* Match 2 */}
                      <div className="flex items-center justify-start mb-12">
                        <div className="w-32 space-y-1 relative z-10">
                          <div className="bg-black/60 border border-white/10 rounded-lg p-2 flex items-center justify-between opacity-50">
                            <span className="text-xs text-white truncate w-20 line-through">DRAGON_X</span>
                            <span className="text-[10px] text-arena-text-muted">패</span>
                          </div>
                          <div className="bg-white/10 border border-white/30 rounded-lg p-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate w-20">LUCKY_SEVEN</span>
                            <span className="text-[10px] text-arena-success font-bold">승</span>
                          </div>
                        </div>
                        {/* Connector line 2 */}
                        <div className="absolute left-32 w-12 border-t-2 border-white/30 top-[8.5rem]"></div>
                        <div className="absolute left-44 w-2 h-[3.5rem] border-l-2 border-t-2 border-white/30 top-20 rounded-tl"></div>
                      </div>

                      {/* Mock remaining bracket lines (Simplified) */}
                      <div className="text-center text-xs text-arena-text-muted py-4 border-t border-white/5">
                        하위 대진은 스크롤하여 확인...
                      </div>
                   </div>
                 </div>
              </div>

              {/* Player Status List */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-4">
                <h3 className="font-bold text-sm text-white mb-3">내 대진 요약</h3>
                <div className="space-y-3">
                  <div className="bg-arena-success/10 border border-arena-success/30 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-arena-success mb-0.5">8강 - 승리</div>
                      <div className="text-sm text-white">vs BEGINNER</div>
                    </div>
                    <span className="text-xs text-arena-text-muted">2:0 승</span>
                  </div>
                  <div className="bg-black/40 border border-arena-cyan/30 rounded-xl p-3 flex justify-between items-center shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                    <div>
                      <div className="text-xs font-bold text-arena-cyan mb-0.5">4강 - 경기 대기 중</div>
                      <div className="text-sm text-white">vs LUCKY_SEVEN</div>
                    </div>
                    <span className="text-xs text-arena-text-muted animate-pulse">상대 대기 중...</span>
                  </div>
                </div>
              </div>

              <SecondaryButton onClick={handleSkipToResult} className="w-full text-xs opacity-30 mt-4">
                [테스트용] 결과 화면으로 건너뛰기
              </SecondaryButton>
            </motion.div>
          )}

          {viewState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pt-4"
            >
              {/* Winner Celebration */}
              <div className="bg-gradient-to-b from-arena-gold/30 to-arena-card border border-arena-gold/50 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.2)]">
                {/* Confetti simulation elements */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                <div className="absolute top-8 right-8 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                <div className="absolute bottom-12 left-12 w-2 h-2 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                
                <div className="w-24 h-24 rounded-full bg-black/60 border-4 border-arena-gold mx-auto mb-4 flex items-center justify-center text-4xl relative z-10 shadow-2xl">
                  👤
                  <div className="absolute -top-4 bg-arena-bg rounded-full p-1 border-2 border-arena-gold">
                    <Crown className="w-6 h-6 text-arena-gold" />
                  </div>
                </div>
                
                <h2 className="text-xs font-bold text-arena-gold tracking-widest mb-1 uppercase">Final Winner</h2>
                <h3 className="text-3xl font-black text-white mb-6">{DEMO_USER.nickname}</h3>
                
                <div className="bg-black/40 rounded-2xl p-4 border border-arena-gold/20 inline-block w-full">
                  <div className="text-sm text-arena-text-muted mb-1">우승 상금</div>
                  <div className="text-3xl font-black text-arena-gold flex items-center justify-center">
                    <Trophy className="w-6 h-6 mr-2" />
                    +700,000 <span className="text-xl ml-1">P</span>
                  </div>
                </div>
              </div>

              {/* Tournament Ranking */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-white mb-4 border-b border-white/5 pb-3">최종 순위</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-arena-gold/10 border border-arena-gold/30 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <Medal className="w-5 h-5 text-arena-gold" />
                      <span className="font-bold text-white text-sm">{DEMO_USER.nickname} (나)</span>
                    </div>
                    <span className="font-bold text-arena-gold text-sm">+700,000 P</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white/50 w-5 text-center">2</span>
                      <span className="text-white text-sm">KING_MAKER</span>
                    </div>
                    <span className="text-arena-text-muted text-sm">+100,000 P</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white/50 w-5 text-center">3</span>
                      <span className="text-white text-sm">LUCKY_SEVEN</span>
                    </div>
                    <span className="text-arena-text-muted text-sm">-10,000 P</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <SecondaryButton className="flex items-center justify-center py-4">
                  <Share2 className="w-5 h-5 mr-2" /> 결과 공유
                </SecondaryButton>
                <PrimaryButton onClick={() => navigate('/')} className="flex items-center justify-center py-4">
                  <Home className="w-5 h-5 mr-2" /> 로비로 이동
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
