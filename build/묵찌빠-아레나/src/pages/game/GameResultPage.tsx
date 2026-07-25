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
import { ResultRevealSequence } from '@/components/casino/ResultRevealSequence';
import { HostessAvatar, HostessBackdrop } from '@/components/casino/HostessAvatar';
import { BonusCardFlip } from '@/components/casino/BonusCardFlip';
import { MatchRoadmapPanel } from '@/components/stats/RoadmapPanel';
import { analyzeMatchRoadmap } from '@/game/roadmap';
import { useDemoWallet } from '@/hooks/useDemoWallet';
import { settleMatchPoints, getDemoPoints } from '@/utils/demoWallet';
import { loadMatchSession, updateMatchSession, clearMatchSession, hasSettledGame, markSettledGame } from '@/services/match/matchSession';
import type { MatchTable } from '@/types/match';
import { getTableTier } from '@/types/match';
import { gameSettings } from '@/utils/gameSettings';
import { isJackpotRoundActive, clearJackpotRound, jackpotPointMultiplier } from '@/utils/jackpotRound';

type RematchState = 'idle' | 'requesting' | 'accepted' | 'declined' | 'timeout' | 'disconnected';

export function GameResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const wallet = useDemoWallet();
  const isBeginnerMode = id === 'beginner-ai';
  const matchSession = loadMatchSession();
  const tableFromState = (location.state?.table as MatchTable | undefined) ?? matchSession?.table;
  
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
        mode: isBeginnerMode || tableFromState?.isFree ? 'PRACTICE' : 'LIVE',
      });
    }
    return createSampleGameLog({ gameId: id || 'demo-result' });
  }, [location.state, id, myScore, opponentScore, winner, isBeginnerMode, tableFromState?.isFree]);
  
  const isWin = winner === 'ME';
  const highlights = analyzeHighlights(gameLog);
  const primaryHighlight = pickPrimaryHighlight(gameLog);
  const winTier = useMemo(
    () => resolveWinTier(gameLog, myScore, opponentScore),
    [gameLog, myScore, opponentScore],
  );
  const streakAfter = gameLog.currentStreakAfter ?? (isWin ? DEMO_USER.streak + 1 : 0);
  const nearMiss = !isWin && isNearMissLoss(myScore, opponentScore, winner);
  const matchRoad = useMemo(() => analyzeMatchRoadmap(gameLog), [gameLog]);

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
  const reduceAnim = gameSettings.options.reduceAnimations;
  const [revealDone, setRevealDone] = useState(() => reduceAnim || nearMiss);

  useEffect(() => {
    if (!gameLog || showNearMiss || !revealDone) return;
    const key = `arena_share_auto_${gameLog.gameId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
    const delay = isWin ? 700 : 1200;
    const t = window.setTimeout(() => setShowShare(true), delay);
    return () => window.clearTimeout(t);
  }, [gameLog.gameId, isWin, showNearMiss, revealDone]);
  const [settledOnce] = useState(() => {
    const session = loadMatchSession();
    const table = (location.state?.table as MatchTable | undefined) ?? session?.table;
    const gameId = session?.gameId ?? id ?? 'demo-result';
    const isFree = id === 'beginner-ai' || !!table?.isFree;
    const won = (location.state?.winner || 'ME') === 'ME';
    const pointsNow = getDemoPoints();
    const pointsBefore =
      session?.pointsBeforeDeposit ??
      pointsNow + (session?.deposited && table && !table.isFree ? table.entryPoint : 0);

    const tableInfo = table
      ? {
          name: table.name,
          entryPoint: table.entryPoint,
          fee: table.fee,
          winnerPoint: table.winnerPoint,
          isFree: table.isFree,
        }
      : {
          name: isFree ? '초보자 연습장' : '골드 테이블',
          entryPoint: isFree ? 0 : 10000,
          fee: isFree ? 0 : 1000,
          winnerPoint: isFree ? 0 : 19000,
          isFree,
        };

    const jackpot = isJackpotRoundActive();
    const mult = jackpotPointMultiplier();
    const winnerPoint = tableInfo.winnerPoint * (won && jackpot ? mult : 1);
    const tableWithJackpot = { ...tableInfo, winnerPoint };

    if (hasSettledGame(gameId) || session?.settled) {
      clearJackpotRound();
      return {
        pointsBefore: session?.pointsBeforeDeposit ?? pointsBefore,
        pointsAfter: pointsNow,
        table: tableWithJackpot,
        jackpot,
      };
    }

    const after = settleMatchPoints({
      isFree: tableInfo.isFree,
      winnerPoint,
      won,
      alreadyDeposited: !!session?.deposited,
      entryPoint: tableInfo.entryPoint,
    });

    // settle already credits winnerPoint; if jackpot was applied via winnerPoint we're done
    markSettledGame(gameId);
    if (session) updateMatchSession({ settled: true });
    clearJackpotRound();
    window.setTimeout(() => {
      const cur = loadMatchSession();
      if (cur?.settled) clearMatchSession();
    }, 60_000);

    return {
      pointsBefore,
      pointsAfter: after.points,
      table: tableWithJackpot,
      jackpot,
    };
  });

  const tableInfo = settledOnce.table;
  const pointsBefore = settledOnce.pointsBefore;
  const pointsAfter = settledOnce.pointsAfter;
  const wasJackpot = settledOnce.jackpot;
  const verification = buildPublicVerification(gameLog);

  useEffect(() => {
    saveMatchLog(gameLog);
    void getRankingService().getLeaderboard().then((board) => {
      const d = board.me.deltaRank;
      const arrow = d > 0 ? `▲ ${d}` : d < 0 ? `▼ ${Math.abs(d)}` : '—';
      setRankLabel(`${board.me.entry.rank}위 (${arrow}) · 주간 ${board.me.entry.weeklyPoints.toLocaleString()} WP`);
    });
  }, [gameLog.gameId]);

  useEffect(() => {
    audioManager.setAmbienceTier(getTableTier(tableFromState));
    return () => audioManager.setAmbienceTier('normal');
  }, [tableFromState?.id]);

  useEffect(() => {
    // 리빌 시퀀스가 판정 SFX를 담당하므로, 시퀀스가 끝난 뒤(또는 스킵 시) BGM/보조 연출만 처리
    if (!revealDone) return;
    if (isWin) {
      if (winTier.tier === 'JACKPOT') {
        audioManager.playSFX('jackpot');
        triggerHaptic('jackpot');
      } else {
        triggerHaptic('success');
      }
      audioManager.playBGM('win_result');
    } else if (nearMiss) {
      audioManager.playSFX('near_miss');
      triggerHaptic('warning');
      audioManager.stopBGM();
    } else {
      audioManager.stopBGM();
    }
  }, [isWin, winTier.tier, nearMiss, revealDone]);

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
    <div className="h-full min-h-0 bg-black text-white flex flex-col font-sans select-none overflow-hidden relative">
      {/* Background Ambience */}
      <div className={`absolute inset-0 z-0 ${
        isWin ? 'bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.22)_0%,_rgba(0,0,0,1)_80%)]' 
              : 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05)_0%,_rgba(0,0,0,1)_80%)]'
      }`} />

      <HostessBackdrop role={isWin ? 'jackpot' : 'comfort'} opacity={isWin ? 0.38 : 0.22} />
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

      {!revealDone && !showNearMiss && (
        <ResultRevealSequence
          verdict={isWin ? 'win' : myScore === opponentScore ? 'draw' : 'lose'}
          tierLabel={isWin ? winTier.label : undefined}
          tableName={tableInfo.name}
          pointsDelta={pointsAfter - pointsBefore}
          isFree={tableInfo.isFree}
          tableTier={getTableTier(tableFromState)}
          reduceAnimations={reduceAnim}
          onDone={() => setRevealDone(true)}
        />
      )}

      {/* Main Result Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-6 relative z-10 flex flex-col items-center">
        
        {/* Result Header */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="flex flex-col items-center text-center mt-8 mb-12 w-full max-w-sm"
        >
          {isWin ? (
            <>
              <HostessAvatar role={isWin ? 'jackpot' : 'comfort'} size="xl" pulse className="mb-3" />
              <WinTierBanner info={winTier} />
              <ChaseLightTitle>
                <h1 className="font-display text-5xl font-black text-engraved-gold tracking-widest">
                  VICTORY
                </h1>
              </ChaseLightTitle>
              <RollingPoints
                target={tableInfo.winnerPoint}
                durationMs={1400 + winTier.intensity * 200}
                className="text-arena-gold font-black text-4xl mb-4"
              />
              {wasJackpot && (
                <p className="text-xs font-black text-fuchsia-300 mb-2 tracking-wider">
                  JACKPOT ROUND ×2 적용
                </p>
              )}
              <StreakAura streak={streakAfter} className="w-full flex flex-col items-center mb-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex justify-between items-center shadow-lg">
                  <span className="text-gray-400 font-bold">현재 연승</span>
                  <span className="text-white font-black text-2xl tracking-tighter">{streakAfter} 연승 🔥</span>
                </div>
              </StreakAura>
              {revealDone && !showNearMiss && (
                <BonusCardFlip enabled={isWin || wasJackpot} />
              )}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex justify-between items-center mt-3 shadow-lg gap-3">
                <span className="text-gray-400 font-bold shrink-0">주간 리그</span>
                <span className="text-arena-success font-black text-sm text-right flex items-center justify-end">
                  <ChevronUp className="w-4 h-4 mr-1 shrink-0" /> {rankLabel}
                </span>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-5xl font-black text-gray-500 tracking-widest mb-4">
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
          <div className="w-full max-w-sm mb-4 luxe-panel px-4 py-3">
            <p className="font-display text-[10px] font-black text-arena-gold uppercase tracking-[0.25em] mb-1">Highlight</p>
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
        <div className="w-full max-w-sm pb-4">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowMore((v) => !v);
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border border-arena-gold/25 flex justify-between items-center text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-arena-gold/45 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-arena-gold shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              더보기 · 상세 정보
            </span>
            {showMore ? <ChevronUp className="w-4 h-4 text-arena-gold" /> : <ChevronDown className="w-4 h-4 text-arena-gold/70" />}
          </button>
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {(
                    [
                      {
                        key: 'replay',
                        label: '리플레이',
                        Icon: Play,
                        tone: 'gold',
                        onClick: () => {
                          if (gameLog) navigate(`/replay/${gameLog.gameId}`, { state: { gameLog } });
                        },
                      },
                      {
                        key: 'find',
                        label: '새 상대 찾기',
                        Icon: Search,
                        tone: 'cyan',
                        onClick: () => navigate('/match/tables'),
                      },
                      {
                        key: 'settlement',
                        label: '정산 내역',
                        Icon: Zap,
                        tone: 'gold',
                        onClick: () => setMoreTab('settlement'),
                      },
                      {
                        key: 'analysis',
                        label: '경기 분석',
                        Icon: Activity,
                        tone: 'cyan',
                        onClick: () => setMoreTab('analysis'),
                      },
                      {
                        key: 'verify',
                        label: '경기 검증',
                        Icon: ShieldAlert,
                        tone: 'mint',
                        onClick: () => setMoreTab('verify'),
                      },
                      {
                        key: 'report',
                        label: '신고',
                        Icon: XCircle,
                        tone: 'rose',
                        onClick: () => setMoreTab('report'),
                      },
                      {
                        key: 'share',
                        label: '공유하기',
                        Icon: Share2,
                        tone: 'gold',
                        onClick: () => setShowShare(true),
                      },
                      {
                        key: 'tech',
                        label: '기술 연결',
                        Icon: Clock,
                        tone: 'silver',
                        onClick: () => setMoreTab('tech'),
                      },
                    ] as const
                  ).map((item) => {
                    const active = moreTab === item.key;
                    const toneRing =
                      item.tone === 'gold'
                        ? 'border-arena-gold/35 hover:border-arena-gold/60'
                        : item.tone === 'cyan'
                          ? 'border-arena-cyan/30 hover:border-arena-cyan/55'
                          : item.tone === 'mint'
                            ? 'border-emerald-400/30 hover:border-emerald-400/55'
                            : item.tone === 'rose'
                              ? 'border-rose-400/30 hover:border-rose-400/55'
                              : 'border-white/15 hover:border-white/30';
                    const iconTone =
                      item.tone === 'gold'
                        ? 'text-arena-gold bg-arena-gold/15'
                        : item.tone === 'cyan'
                          ? 'text-arena-cyan bg-arena-cyan/15'
                          : item.tone === 'mint'
                            ? 'text-emerald-300 bg-emerald-400/15'
                            : item.tone === 'rose'
                              ? 'text-rose-300 bg-rose-400/15'
                              : 'text-gray-300 bg-white/10';
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          item.onClick();
                        }}
                        className={`group relative flex items-center gap-2.5 p-3.5 rounded-2xl text-left transition-all overflow-hidden border backdrop-blur-sm ${
                          active
                            ? 'bg-gradient-to-br from-arena-gold/20 via-zinc-900 to-zinc-950 border-arena-gold/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            : `bg-gradient-to-br from-white/[0.07] to-black/40 ${toneRing}`
                        }`}
                      >
                        <span
                          className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${iconTone}`}
                        >
                          <item.Icon className="w-4 h-4" />
                        </span>
                        <span
                          className={`relative z-10 text-xs font-black tracking-tight ${
                            active ? 'text-arena-gold' : 'text-gray-200 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                      </button>
                    );
                  })}
                </div>

                {moreTab === 'settlement' && (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-arena-gold/10 to-black/60 border border-arena-gold/25 text-sm space-y-2.5 shadow-inner">
                    <p className="text-[10px] font-black text-arena-gold tracking-wider uppercase">Settlement</p>
                    <div className="flex justify-between text-gray-400"><span>게임 전</span><span className="tabular-nums">{pointsBefore.toLocaleString()} P</span></div>
                    <div className="flex justify-between text-gray-400"><span>수수료</span><span className="text-arena-error tabular-nums">-{tableInfo.fee.toLocaleString()} P</span></div>
                    <div className="flex justify-between text-white font-bold"><span>게임 후</span><span className="text-arena-gold tabular-nums">{pointsAfter.toLocaleString()} P</span></div>
                    <p className="text-[10px] text-gray-500 pt-1 border-t border-white/5">데모 가상 포인트 · 결제/출금/환전 없음</p>
                  </div>
                )}
                {moreTab === 'analysis' && (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-arena-cyan/10 to-black/60 border border-arena-cyan/25 text-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-arena-cyan tracking-wider uppercase">Analysis</p>
                      <span className="text-[10px] font-bold text-gray-500">
                        {myScore}:{opponentScore} · 탈환 {gameLog?.attackSteals ?? 0}
                      </span>
                    </div>
                    <MatchRoadmapPanel
                      grid={matchRoad.grid}
                      bigRoad={matchRoad.bigRoad}
                      attackRoad={matchRoad.attackRoad}
                      metrics={matchRoad.tendency}
                    />
                    <button
                      type="button"
                      onClick={() => navigate('/analysis')}
                      className="w-full text-center text-[11px] font-black text-arena-gold/90 hover:text-arena-gold py-2 border-t border-white/5"
                    >
                      전체 로드맵 · 성향 분석 →
                    </button>
                  </div>
                )}
                {moreTab === 'verify' && verification && (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-black/60 border border-emerald-400/25 text-xs space-y-2 max-h-64 overflow-y-auto">
                    <p className="text-[10px] font-black text-emerald-300 tracking-wider uppercase mb-1">Verification</p>
                    <div className="flex justify-between"><span className="text-gray-500">게임 고유번호</span><span className="font-mono text-gray-200">{verification.gameId}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">시작</span><span className="text-gray-300">{new Date(verification.startedAt).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">종료</span><span className="text-gray-300">{new Date(verification.endedAt).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">검증 상태</span><span className="text-arena-cyan font-bold">{verification.statusLabel}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">예치</span><span>{verification.points.depositStatus}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">지급/반환</span><span>{verification.points.settleStatus}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">거래번호</span><span className="font-mono">{verification.points.transactionId ?? '-'}</span></div>
                    <div className="h-px bg-white/10 my-2" />
                    {verification.rounds.map((r) => (
                      <div key={r.round} className="border border-white/5 rounded-lg p-2 mb-1 bg-black/30">
                        <p className="font-bold text-white mb-1">R{r.round} · {r.result}</p>
                        <p className="text-gray-400">선택 {r.myHand}/{r.opponentHand} · 공격권 {r.attacker}</p>
                        <p className="text-gray-500">접수 {new Date(r.serverReceivedAt).toLocaleTimeString()} · 잠금 {new Date(r.lockedAt).toLocaleTimeString()} · 공개 {new Date(r.revealedAt).toLocaleTimeString()}</p>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-500 pt-1">{verification.note}</p>
                  </div>
                )}
                {moreTab === 'report' && (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-black/60 border border-rose-400/25 text-xs text-gray-300">
                    신고는 운영 정책에 따라 검토됩니다. (데모: UI만)
                  </div>
                )}
                {moreTab === 'tech' && (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-white/5 to-black/60 border border-white/15 text-xs space-y-2 text-gray-400">
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

      {/* Bottom Action Area — 스크롤 영역과 분리된 고정 푸터 (겹침 방지) */}
      <div className="relative shrink-0 z-20 border-t border-white/10 bg-black/95 backdrop-blur-md px-4 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))]">
        <div className="max-w-sm mx-auto flex flex-col gap-2.5">
          
          {/* Status Alert for Rematch */}
          <AnimatePresence mode="wait">
            {rematchState === 'requesting' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-zinc-900/90 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur">
                <div className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 mr-3 animate-pulse text-arena-gold" />
                  <span className="text-sm font-bold">재대결 응답 대기중...</span>
                </div>
                <span className="text-lg font-black text-white tabular-nums">{rematchTimeLeft}</span>
              </motion.div>
            )}
            {rematchState === 'declined' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-zinc-950 border border-red-900/50 rounded-2xl p-4 flex items-center justify-between text-arena-error shadow-lg">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 mr-3" />
                  <span className="text-sm font-bold">상대가 거절했습니다.</span>
                </div>
                <button type="button" onClick={() => setRematchState('idle')} className="text-xs px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 font-bold text-white transition-colors">확인</button>
              </motion.div>
            )}
            {(rematchState === 'timeout' || rematchState === 'disconnected') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-gray-400 shadow-lg">
                <div className="flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-3" />
                  <span className="text-sm font-bold">응답 시간이 초과되었습니다.</span>
                </div>
                <button type="button" onClick={() => setRematchState('idle')} className="text-xs px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 font-bold text-white transition-colors">확인</button>
              </motion.div>
            )}
            {rematchState === 'accepted' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-arena-success/10 border border-arena-success/30 rounded-2xl p-4 flex items-center justify-center text-arena-success shadow-lg">
                <CheckCircle2 className="w-5 h-5 mr-3" />
                <span className="text-sm font-bold">상대가 수락했습니다!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary — 한 판 더 / 로비로 */}
          {rematchState === 'idle' && (
            <div className="flex gap-3">
              <PrimaryButton
                hostessIndex={11}
                onClick={() => {
                  triggerHaptic('heavy');
                  if (isBeginnerMode) {
                    navigate('/game/beginner-ai', { replace: true });
                  } else {
                    navigate(`/game/${id || 'quick-start'}`, { replace: true });
                  }
                }}
                className={`flex-1 py-4 text-base tracking-wide min-w-0 ${
                  isWin
                    ? 'bg-gradient-to-r from-amber-300 via-arena-gold to-amber-500 text-black border border-amber-200/40 shadow-[0_0_28px_rgba(245,158,11,0.35)]'
                    : 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                }`}
              >
                <RotateCcw className="w-5 h-5 shrink-0" /> 한 판 더
              </PrimaryButton>
              <SecondaryButton
                hostessIndex={4}
                onClick={() => navigate('/lobby')}
                className="flex-1 py-4 text-base min-w-0 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/15 hover:border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <Home className="w-5 h-5 shrink-0" /> 로비로
              </SecondaryButton>
            </div>
          )}

          {/* Secondary shortcuts */}
          <div className="flex justify-center gap-8 pt-1">
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-arena-gold transition-colors"
              onClick={() => {
                triggerHaptic('light');
                setShowMore((v) => !v);
              }}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border border-arena-gold/30">
                {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-bold">상세 정보</span>
            </button>
            {!isBeginnerMode && (
              <button
                type="button"
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-arena-cyan transition-colors"
                onClick={() => {
                  triggerHaptic('light');
                  handleRequestRematch();
                }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border border-arena-cyan/30">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">상대에게 재대결</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ShareCardModal
        open={showShare}
        log={gameLog}
        settlement={{
          tableName: tableInfo.name,
          pointsDelta: pointsAfter - pointsBefore,
          isWin,
          isFree: tableInfo.isFree,
        }}
        onClose={() => setShowShare(false)}
      />

      {/* Rematch Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="overlay-area z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
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
