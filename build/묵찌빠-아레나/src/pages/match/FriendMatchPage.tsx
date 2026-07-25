import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Plus, Key, Users, History, Settings, 
  Share2, Copy, MessageCircle, Send, CheckCircle2,
  Swords, Clock, Lock, Globe, UserPlus, Play
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { DEMO_USER } from '@/data/demoData';

type ViewState = 'menu' | 'create' | 'room';

export function FriendMatchPage() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('menu');

  // Room settings state
  const [isPrivate, setIsPrivate] = useState(true);
  const [roomTitle, setRoomTitle] = useState(`${DEMO_USER.nickname}님의 방`);
  const [entryPoint, setEntryPoint] = useState(1000);
  const [bestOf, setBestOf] = useState<3 | 5>(3);
  const [timeLimit, setTimeLimit] = useState(7);
  const [allowSpectator, setAllowSpectator] = useState(false);
  const [allowChat, setAllowChat] = useState(true);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [password, setPassword] = useState('');

  // Room state
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  // Simulate opponent joining and readying
  useEffect(() => {
    if (viewState === 'room' && !opponentJoined) {
      const timer = setTimeout(() => {
        setOpponentJoined(true);
        triggerHaptic('success');
      }, 5000); // Opponent joins after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [viewState, opponentJoined]);

  useEffect(() => {
    if (viewState === 'room' && opponentJoined && !opponentReady) {
      const timer = setTimeout(() => {
        setOpponentReady(true);
        triggerHaptic('light');
      }, 3000); // Opponent readies after 3 seconds of joining
      return () => clearTimeout(timer);
    }
  }, [viewState, opponentJoined, opponentReady]);

  // Handle Game Start
  useEffect(() => {
    if (myReady && opponentReady) {
      const timer = setTimeout(() => {
        triggerHaptic('success');
        navigate(`/game/${roomCode || 'friend-1234'}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [myReady, opponentReady, navigate, roomCode]);

  const handleCreateRoom = () => {
    triggerHaptic('medium');
    setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    setViewState('room');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    triggerHaptic('light');
    // Ideally show a toast
    alert('방 코드가 복사되었습니다.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://game.com/join/${roomCode}`);
    triggerHaptic('light');
    alert('초대 링크가 복사되었습니다.');
  };

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 font-sans relative">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center">
        <button onClick={() => {
          if (viewState === 'create') setViewState('menu');
          else if (viewState === 'room') setViewState('menu'); // Ideally leave room
          else navigate(-1);
        }} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2">
          {viewState === 'menu' ? '친구 대전' : viewState === 'create' ? '방 만들기' : '대기실'}
        </h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          {viewState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setViewState('create')}
                  className="bg-arena-card border border-arena-cyan/30 hover:bg-arena-cyan/10 transition-colors p-5 rounded-2xl flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-arena-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-arena-cyan" />
                  </div>
                  <span className="font-bold text-white">새로운 방 만들기</span>
                </button>
                
                <div className="bg-arena-card border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <div className="w-full flex items-center bg-black/40 rounded-xl px-3 py-2 border border-white/10">
                    <Key className="w-4 h-4 text-arena-text-muted mr-2 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="방 코드 입력" 
                      className="bg-transparent border-none outline-none text-sm text-white w-full uppercase placeholder:normal-case"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  <PrimaryButton 
                    disabled={joinCode.length < 6}
                    onClick={() => { triggerHaptic('medium'); setRoomCode(joinCode); setViewState('room'); }}
                    className="w-full py-2.5 text-sm"
                  >
                    입장하기
                  </PrimaryButton>
                </div>
              </div>

              {/* Lists */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-arena-text-muted flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" /> 초대받은 방
                </h3>
                <div className="bg-arena-card border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-arena-gold/20 flex items-center justify-center">
                      <span className="text-xl">🐯</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">TIGER_88님의 방</div>
                      <div className="text-xs text-arena-text-muted flex gap-2">
                        <span>3판 2선승</span>
                        <span>•</span>
                        <span>참가 5,000 P</span>
                      </div>
                    </div>
                  </div>
                  <SecondaryButton onClick={() => { setRoomCode('TIGER'); setViewState('room'); }} className="px-4 py-2 text-xs">
                    입장
                  </SecondaryButton>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-arena-text-muted flex items-center">
                  <History className="w-4 h-4 mr-2" /> 최근 이용한 방
                </h3>
                <div className="bg-arena-card border border-white/10 rounded-2xl p-4 text-center text-sm text-arena-text-muted">
                  최근 이용한 방이 없습니다.
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-arena-text-muted flex items-center">
                  <Users className="w-4 h-4 mr-2" /> 친구 목록에서 초대
                </h3>
                <div className="bg-arena-card border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                      <span className="text-xl">👻</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">GHOST***</div>
                      <div className="text-xs text-arena-success">접속 중</div>
                    </div>
                  </div>
                  <SecondaryButton className="px-4 py-2 text-xs bg-arena-cyan/10 text-arena-cyan border-none hover:bg-arena-cyan/20">
                    초대
                  </SecondaryButton>
                </div>
              </div>

            </motion.div>
          )}

          {viewState === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-arena-text-muted">방 제목</label>
                  <input 
                    type="text" 
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-arena-cyan"
                  />
                </div>

                {/* Privacy */}
                <div className="flex bg-black/40 p-1 rounded-xl">
                  <button 
                    onClick={() => setIsPrivate(false)}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-bold transition-colors ${!isPrivate ? 'bg-white/10 text-white' : 'text-arena-text-muted'}`}
                  >
                    <Globe className="w-4 h-4 mr-2" /> 공개방
                  </button>
                  <button 
                    onClick={() => setIsPrivate(true)}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-bold transition-colors ${isPrivate ? 'bg-white/10 text-white' : 'text-arena-text-muted'}`}
                  >
                    <Lock className="w-4 h-4 mr-2" /> 비공개방
                  </button>
                </div>

                {isPrivate && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-arena-text-muted">비밀번호 (선택)</label>
                    <input 
                      type="password" 
                      placeholder="입력하지 않으면 코드나 링크로만 입장 가능"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-arena-cyan"
                    />
                  </div>
                )}

                {/* Entry Point */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-arena-text-muted">참가 포인트 (내 보유: {DEMO_USER.points.toLocaleString()} P)</label>
                  <select 
                    value={entryPoint}
                    onChange={(e) => setEntryPoint(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-arena-cyan appearance-none"
                  >
                    <option value={0}>무료 (0 P)</option>
                    <option value={100}>100 P</option>
                    <option value={1000}>1,000 P</option>
                    <option value={5000}>5,000 P</option>
                    <option value={10000}>10,000 P</option>
                  </select>
                </div>
              </div>

              <div className="bg-arena-card border border-white/10 rounded-2xl p-5 space-y-5">
                <h3 className="font-bold text-sm text-white flex items-center border-b border-white/5 pb-3 mb-2">
                  <Settings className="w-4 h-4 mr-2 text-arena-text-muted" /> 상세 설정
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white/90">게임 방식</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setBestOf(3)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${bestOf === 3 ? 'bg-arena-cyan text-black' : 'bg-white/5 text-arena-text-muted'}`}
                      >3판 2선승</button>
                      <button 
                        onClick={() => setBestOf(5)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${bestOf === 5 ? 'bg-arena-cyan text-black' : 'bg-white/5 text-arena-text-muted'}`}
                      >5판 3선승</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white/90">선택 제한 시간</span>
                    <div className="flex gap-2">
                      {[5, 7, 10].map(t => (
                        <button 
                          key={t}
                          onClick={() => setTimeLimit(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeLimit === t ? 'bg-arena-cyan text-black' : 'bg-white/5 text-arena-text-muted'}`}
                        >{t}초</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white/90">관전 허용</span>
                    <button 
                      onClick={() => setAllowSpectator(!allowSpectator)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${allowSpectator ? 'bg-arena-cyan' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowSpectator ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white/90">채팅 허용</span>
                    <button 
                      onClick={() => setAllowChat(!allowChat)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${allowChat ? 'bg-arena-cyan' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowChat ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white/90">친구만 입장</span>
                    <button 
                      onClick={() => setFriendsOnly(!friendsOnly)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${friendsOnly ? 'bg-arena-cyan' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${friendsOnly ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <PrimaryButton onClick={handleCreateRoom} className="w-full py-4 text-lg">
                  방 만들기
                </PrimaryButton>
              </div>
            </motion.div>
          )}

          {viewState === 'room' && (
            <motion.div
              key="room"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Room Header Info */}
              <div className="bg-arena-card border border-white/10 rounded-2xl p-5 text-center">
                <div className="inline-flex items-center bg-white/5 rounded-full px-3 py-1 mb-3">
                  {isPrivate ? <Lock className="w-3 h-3 mr-1.5 text-arena-text-muted" /> : <Globe className="w-3 h-3 mr-1.5 text-arena-text-muted" />}
                  <span className="text-xs text-arena-text-muted font-bold">{isPrivate ? '비공개방' : '공개방'}</span>
                </div>
                <h2 className="text-xl font-black text-white mb-4">{roomTitle}</h2>
                
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-arena-text-muted">게임 방식</span>
                    <span className="font-bold text-white">{bestOf}판 {Math.floor(bestOf/2)+1}선승</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-arena-text-muted">참가 포인트</span>
                    <span className="font-bold text-arena-gold">{entryPoint.toLocaleString()} P</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-arena-text-muted">제한 시간</span>
                    <span className="font-bold text-white">{timeLimit}초</span>
                  </div>
                </div>
              </div>

              {/* Player Status Area */}
              <div className="flex items-center justify-between gap-4">
                {/* My Profile */}
                <div className="flex-1 bg-arena-card border border-arena-cyan/30 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden">
                  {myReady && <div className="absolute inset-0 bg-arena-cyan/10" />}
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl mb-3 relative z-10">
                    👤
                  </div>
                  <span className="font-bold text-white mb-1 relative z-10">{DEMO_USER.nickname}</span>
                  <span className="text-xs text-arena-text-muted relative z-10">보유: {DEMO_USER.points.toLocaleString()} P</span>
                  
                  <div className="mt-4 relative z-10 w-full">
                    {myReady ? (
                      <div className="bg-arena-cyan text-black text-xs font-bold py-2 rounded-lg text-center flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> 준비 완료
                      </div>
                    ) : (
                      <div className="bg-white/10 text-arena-text-muted text-xs font-bold py-2 rounded-lg text-center">
                        준비 중
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center px-2">
                  <Swords className="w-6 h-6 text-arena-text-muted opacity-50" />
                </div>

                {/* Opponent Profile */}
                <div className={`flex-1 bg-arena-card border rounded-2xl p-4 flex flex-col items-center relative overflow-hidden transition-colors ${
                  opponentJoined ? (opponentReady ? 'border-arena-error/30' : 'border-white/10') : 'border-white/5 border-dashed'
                }`}>
                  {opponentReady && <div className="absolute inset-0 bg-arena-error/10" />}
                  
                  {opponentJoined ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl mb-3 relative z-10">
                        👻
                      </div>
                      <span className="font-bold text-white mb-1 relative z-10">GHOST***</span>
                      <span className="text-xs text-arena-text-muted relative z-10">보유 확인 완료</span>
                      
                      <div className="mt-4 relative z-10 w-full">
                        {opponentReady ? (
                          <div className="bg-arena-error text-white text-xs font-bold py-2 rounded-lg text-center flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> 준비 완료
                          </div>
                        ) : (
                          <div className="bg-white/10 text-arena-text-muted text-xs font-bold py-2 rounded-lg text-center flex items-center justify-center">
                            <Clock className="w-3 h-3 mr-1 animate-spin" /> 준비 중
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 border-dashed flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-white/20" />
                      </div>
                      <span className="font-bold text-white/40 mb-1">상대방 대기 중</span>
                      <span className="text-[10px] text-white/20 text-center">초대 링크를 통해<br/>친구가 입장합니다.</span>
                      <div className="mt-4 w-full bg-white/5 text-transparent text-xs font-bold py-2 rounded-lg">.</div>
                    </>
                  )}
                </div>
              </div>

              {/* Ready / Start Status */}
              <div className="text-center py-2 h-8">
                <AnimatePresence mode="wait">
                  {myReady && opponentReady ? (
                    <motion.div 
                      key="start"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-arena-gold font-bold flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" /> 곧 게임이 시작됩니다...
                    </motion.div>
                  ) : opponentJoined ? (
                    <motion.div 
                      key="wait-ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-arena-text-muted"
                    >
                      모두 준비가 완료되면 게임이 시작됩니다.
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Actions Area */}
              <div className="space-y-4">
                {/* Invite Methods (Only when opponent hasn't joined) */}
                {!opponentJoined && (
                  <div className="bg-arena-card border border-white/10 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-xs text-arena-text-muted flex items-center">
                      <Share2 className="w-4 h-4 mr-2" /> 친구 초대하기
                    </h3>
                    
                    <div className="flex gap-2">
                      <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 flex justify-between items-center border border-white/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-arena-text-muted">방 코드</span>
                          <span className="font-mono font-bold text-white tracking-wider">{roomCode}</span>
                        </div>
                        <button onClick={handleCopyCode} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 flex justify-between items-center border border-white/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-arena-text-muted">초대 링크</span>
                          <span className="text-sm font-bold text-white truncate max-w-[80px]">game.com/j...</span>
                        </div>
                        <button onClick={handleCopyLink} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black py-3 rounded-xl flex items-center justify-center font-bold text-sm transition-colors">
                        <MessageCircle className="w-4 h-4 mr-1.5" /> 카카오톡
                      </button>
                      <button className="flex-1 bg-[#229ED9] hover:bg-[#229ED9]/90 text-white py-3 rounded-xl flex items-center justify-center font-bold text-sm transition-colors">
                        <Send className="w-4 h-4 mr-1.5" /> 텔레그램
                      </button>
                      <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl flex items-center justify-center font-bold text-sm transition-colors">
                        <Share2 className="w-4 h-4 mr-1.5" /> 기타
                      </button>
                    </div>
                  </div>
                )}

                {/* Ready Button */}
                <div className="pt-2">
                  <PrimaryButton 
                    disabled={!opponentJoined || myReady}
                    onClick={() => {
                      triggerHaptic('medium');
                      setMyReady(true);
                    }}
                    className={`w-full py-4 text-lg ${myReady ? 'bg-arena-cyan/20 border-arena-cyan/50 text-arena-cyan' : ''}`}
                  >
                    {myReady ? '준비 대기 중' : '준비 완료'}
                  </PrimaryButton>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
