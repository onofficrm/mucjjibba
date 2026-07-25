import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, Search, Share2, Home, ChevronDown, ChevronUp, Clock, 
  XCircle, ShieldAlert, CheckCircle2, ChevronRight, Activity, Zap, Play
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { DEMO_USER } from '@/data/demoData';
import { analyzeHighlights, pickPrimaryHighlight } from '@/game/highlights';
import { createSampleGameLog } from '@/game/sampleGameLog';
import { buildPublicVerification } from '@/game/verification';
import { ShareCardModal } from '@/components/share/ShareCardModal';
import type { GameLog } from '@/types/gameLog';
import { getRankingService } from '@/services/ranking';
import { saveMatchLog } from '@/services/history/matchHistoryStore';
import { resolveWinTier, isNearMissLoss } from '@/game/winTier';
import { RollingPoints } from '@/components/casino/RollingPoints';
import { CoinBurst } from '@/components/casino/CoinBurst';
import { WinTierBanner } from '@/components/casino/WinTierBanner';
import { VegasSpotlight, ChaseLightTitle } from '@/components/casino/VegasSpotlight';
import { StreakAura } from '@/components/casino/StreakAura';
import { NearMissOverlay } from '@/components/casino/NearMissOverlay';
import { HostessAvatar, HostessBackdrop } from '@/components/casino/HostessAvatar';

type RematchState = 'idle' | 'requesting' | 'accepted' | 'declined' | 'timeout' | 'disconnected';

export function GameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isBeginnerMode = id === 'beginner-ai';
  
  const winner = location.state?.winner || 'ME';
  const myScore = location.state?.myScore || 2;
  const opponentScore = location.state?.opponentScore || 0;
  const gameLog: GameLog = useMemo(() => {
    const fromState = location.state?.gameLog as GameLog | undefined;
    if (fromState) return fromState;
    if (location.state?.winner) {
      return createSampleGameLog({
        gameId: id || 'demo-result',
        myScore,
        opponentScore,
        winner: winner === 'ME' ? 'ME' : 'OPPONENT',
        mode: isBeginnerMode ? 'PRACTICE' : 'LIVE',
      });
    }
    return createSampleGameLog({ gameId: id || 'demo-result' });
  }, [location.state, id, myScore, opponentScore, winner, isBeginnerMode]);
  
  const isWin = winner === 'ME';
  const highlights = analyzeHighlights(gameLog);
  const primaryHighlight = pickPrimaryHighlight(gameLog);
  const winTier = useMemo(
    () => resolveWinTier(gameLog, myScore, opponentScore),
    [gameLog, myScore, opponentScore],
  );
  const streakAfter = gameLog.currentStreakAfter ?? (isWin ? DEMO_USER.streak + 1 : 0);
  const nearMiss = !isWin && isNearMissLoss(myScore, opponentScore, winner);

  const [rematchState, setRematchState] = useState<RematchState>('idle');
  const [rematchTimeLeft, setRematchTimeLeft] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [moreTab, setMoreTab] = useState<
    'settlement' | 'analysis' | 'verify' | 'report' | 'share' | 'tech' | null
  >(null);
  const [showShare, setShowShare] = useState(false);
  const [rankLabel, setRankLabel] = useState('랭킹 반영 중…');
  const [showNearMiss, setShowNearMiss] = useState(nearMiss);
  const verification = buildPublicVerification(gameLog);

  useEffect(() => {
    saveMatchLog(gameLog);
    void getRankingService().getLeaderboard().then((board) => {
      const d = board.me.deltaRank;
      const arrow = d > 0 ? `▲ ${d}` : d < 0 ? `▼ ${Math.abs(d)}` : '—';
      setRankLabel(`${board.me.entry.rank}위 (${arrow}) · 주간 ${board.me.entry.weeklyPoints.toLocaleString()} WP`);
    });
  }, [gameLog.gameId]);

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
      if (winTier.tier === 'JACKPOT') {
        audioManager.playSFX('jackpot');
        triggerHaptic('jackpot');
      } else {
        audioManager.playSFX('final_win');
        triggerHaptic('success');
      }
      audioManager.playBGM('win_result');
    } else if (nearMiss) {
      audioManager.playSFX('near_miss');
      triggerHaptic('warning');
      audioManager.stopBGM();
    } else {
      audioManager.playSFX('final_lose');
      audioManager.stopBGM();
    }
  }, [isWin, winTier.tier, nearMiss]);

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
        isWin ? 'bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.22)_0%,_rgba(0,0,0,1)_80%)]' 
              : 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05)_0%,_rgba(0,0,0,1)_80%)]'
      }`} />

      <HostessBackdrop role={isWin ? 'victory' : 'dealer'} opacity={isWin ? 0.38 : 0.18} />
      {isWin && <VegasSpotlight active intense={winTier.intensity >= 2} />}
      {isWin && <CoinBurst intensity={winTier.intensity} active />}

      <AnimatePresence>
        {showNearMiss && (
          <NearMissOverlay
            open
            scoreLabel={`${myScore} : ${opponentScore}`}
            onRematch={() => {
              setShowNearMiss(false);
              handleRequestRematch();
            }}
            onSkip={() => setShowNearMiss(false)}
          />
        )}
      </AnimatePresence>

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
              <HostessAvatar role="victory" size="xl" pulse className="mb-3" />
              <WinTierBanner info={winTier} />
              <ChaseLightTitle>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] tracking-widest">
                  VICTORY
                </h1>
              </ChaseLightTitle>
              <RollingPoints
                target={tableInfo.winnerPoint}
                durationMs={1400 + winTier.intensity * 200}
                className="text-arena-gold font-black text-4xl mb-4"
              />
              <StreakAura streak={streakAfter} className="w-full flex flex-col items-center mb-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex justify-between items-center shadow-lg">
                  <span className="text-gray-400 font-bold">현재 연승</span>
                  <span className="text-white font-black text-2xl tracking-tighter">{streakAfter} 연승 🔥</span>
                </div>
              </StreakAura>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex justify-between items-center mt-3 shadow-lg gap-3">
                <span className="text-gray-400 font-bold shrink-0">주간 리그</span>
                <span className="text-arena-success font-black text-sm text-right flex items-center justify-end">
                  <ChevronUp className="w-4 h-4 mr-1 shrink-0" /> {rankLabel}
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

        {/* Highlight strip — only when log exists */}
        {primaryHighlight && (
          <div className="w-full max-w-sm mb-4 rounded-2xl border border-arena-gold/40 bg-arena-gold/10 px-4 py-3">
            <p className="text-[10px] font-black text-arena-gold uppercase tracking-wider mb-1">하이라이트</p>
            <p className="text-base font-black text-white">{primaryHighlight.title}</p>
            <p className="text-xs text-gray-400 mt-1">{primaryHighlight.description}</p>
            {highlights.length > 1 && (
              <p className="text-[10px] text-gray-500 mt-2 font-bold">
                외 {highlights.length - 1}개 · {highlights.slice(1).map((h) => h.title).join(' · ')}
              </p>
            )}
          </div>
        )}

        {/* Score summary — always visible */}
        <div className="w-full max-w-sm mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-bold">최종 스코어</span>
          <span className="text-xl font-black text-white">
            {myScore} : {opponentScore}
          </span>
        </div>

        {/* More menu (정산/분석/검증/신고/공유설정/기술정보) */}
        <div className="w-full max-w-sm mb-28">
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowMore((v) => !v);
            }}
            className="w-full p-4 rounded-2xl bg-gray-900 border border-gray-800 flex justify-between items-center text-sm font-bold text-gray-300"
          >
            <span>더보기 · 상세 정보</span>
            {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (gameLog) navigate(`/replay/${gameLog.gameId}`, { state: { gameLog } });
                    }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-black/50 border border-white/5 text-xs font-bold text-gray-300 hover:text-white"
                  >
                    <Play className="w-3.5 h-3.5 text-gray-500" /> 리플레이
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      navigate('/match/tables');
                    }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-black/50 border border-white/5 text-xs font-bold text-gray-300 hover:text-white"
                  >
                    <Search className="w-3.5 h-3.5 text-gray-500" /> 새 상대 찾기
                  </button>
                  {(
                    [
                      ['settlement', '정산 내역', Zap],
                      ['analysis', '경기 분석', Activity],
                      ['verify', '경기 검증', ShieldAlert],
                      ['report', '신고', XCircle],
                      ['share', '공유하기', Share2],
                      ['tech', '기술 연결', Clock],
                    ] as const
                  ).map(([key, label, Icon]) => (
                    <button
                      key={key}
                      onClick={() => {
                        triggerHaptic('light');
                        if (key === 'share') {
                          setShowShare(true);
                          return;
                        }
                        setMoreTab(key);
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-black/50 border border-white/5 text-xs font-bold text-gray-300 hover:text-white"
                    >
                      <Icon className="w-3.5 h-3.5 text-gray-500" /> {label}
                    </button>
                  ))}
                </div>

                {moreTab === 'settlement' && (
                  <div className="mt-3 p-4 rounded-xl bg-black/50 border border-white/5 text-sm space-y-2">
                    <div className="flex justify-between text-gray-400"><span>게임 전</span><span>{pointsBefore.toLocaleString()} P</span></div>
                    <div className="flex justify-between text-gray-400"><span>수수료</span><span className="text-arena-error">-{tableInfo.fee.toLocaleString()} P</span></div>
                    <div className="flex justify-between text-white font-bold"><span>게임 후</span><span>{pointsAfter.toLocaleString()} P</span></div>
                    <p className="text-[10px] text-gray-500">데모 가상 포인트 · 결제/출금/환전 없음</p>
                  </div>
                )}
                {moreTab === 'analysis' && (
                  <div className="mt-3 p-4 rounded-xl bg-black/50 border border-white/5 text-sm space-y-2">
                    <div className="flex justify-between text-gray-400"><span>스코어</span><span className="text-white font-bold">{myScore}:{opponentScore}</span></div>
                    <div className="flex justify-between text-gray-400"><span>라운드 수</span><span className="text-white">{gameLog?.rounds.length ?? 0}</span></div>
                    <div className="flex justify-between text-gray-400"><span>공격권 탈환</span><span className="text-white">{gameLog?.attackSteals ?? 0}</span></div>
                  </div>
                )}
                {moreTab === 'verify' && verification && (
                  <div className="mt-3 p-4 rounded-xl bg-black/50 border border-white/5 text-xs space-y-2 max-h-64 overflow-y-auto">
                    <div className="flex justify-between"><span className="text-gray-500">게임 고유번호</span><span className="font-mono text-gray-200">{verification.gameId}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">시작</span><span className="text-gray-300">{new Date(verification.startedAt).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">종료</span><span className="text-gray-300">{new Date(verification.endedAt).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">검증 상태</span><span className="text-arena-cyan font-bold">{verification.statusLabel}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">예치</span><span>{verification.points.depositStatus}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">지급/반환</span><span>{verification.points.settleStatus}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">거래번호</span><span className="font-mono">{verification.points.transactionId ?? '-'}</span></div>
                    <div className="h-px bg-white/10 my-2" />
                    {verification.rounds.map((r) => (
                      <div key={r.round} className="border border-white/5 rounded-lg p-2 mb-1">
                        <p className="font-bold text-white mb-1">R{r.round} · {r.result}</p>
                        <p className="text-gray-400">선택 {r.myHand}/{r.opponentHand} · 공격권 {r.attacker}</p>
                        <p className="text-gray-500">접수 {new Date(r.serverReceivedAt).toLocaleTimeString()} · 잠금 {new Date(r.lockedAt).toLocaleTimeString()} · 공개 {new Date(r.revealedAt).toLocaleTimeString()}</p>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-500 pt-1">{verification.note}</p>
                  </div>
                )}
                {moreTab === 'report' && (
                  <div className="mt-3 p-4 rounded-xl bg-black/50 border border-white/5 text-xs text-gray-400">
                    신고는 운영 정책에 따라 검토됩니다. (데모: UI만)
                  </div>
                )}
                {moreTab === 'tech' && (
                  <div className="mt-3 p-4 rounded-xl bg-black/50 border border-white/5 text-xs space-y-2 text-gray-400">
                    <div className="flex justify-between"><span>로그 소스</span><span className="text-white">{gameLog?.source}</span></div>
                    <div className="flex justify-between"><span>모드</span><span className="text-white">{gameLog?.mode}</span></div>
                    <div className="flex justify-between"><span>라우트</span><span className="text-white">HashRouter</span></div>
                    <p className="text-[10px] text-gray-500">IP·기기·관리자 세션은 노출하지 않습니다.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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

          {/* Primary — 한 판 더 / 로비로 */}
          {rematchState === 'idle' && (
            <div className="flex gap-3">
              <PrimaryButton
                onClick={() => {
                  triggerHaptic('heavy');
                  if (isBeginnerMode) {
                    navigate('/game/beginner-ai', { replace: true });
                  } else {
                    navigate(`/game/${id || 'quick-start'}`, { replace: true });
                  }
                }}
                className={`flex-1 py-5 text-lg flex items-center justify-center gap-2 ${
                  isWin ? 'bg-arena-gold text-black hover:bg-yellow-500 border-none shadow-[0_0_20px_rgba(245,158,11,0.25)]' : ''
                }`}
              >
                <RotateCcw className="w-5 h-5" /> 한 판 더
              </PrimaryButton>
              <SecondaryButton
                onClick={() => navigate('/lobby')}
                className="flex-1 py-5 text-lg bg-gray-800 hover:bg-gray-700 border-gray-700 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> 로비로
              </SecondaryButton>
            </div>
          )}

          {/* Secondary — 더보기 안에 리플레이·공유·새 상대 */}
          <div className="flex justify-center gap-6 mt-2 pt-4 border-t border-gray-900">
            <button
              className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
              onClick={() => {
                triggerHaptic('light');
                setShowMore(true);
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                <ChevronDown className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">더보기</span>
            </button>
            {!isBeginnerMode && (
              <button
                className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
                onClick={() => {
                  triggerHaptic('light');
                  handleRequestRematch();
                }}
              >
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">상대에게 재대결</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ShareCardModal open={showShare} log={gameLog} onClose={() => setShowShare(false)} />

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
