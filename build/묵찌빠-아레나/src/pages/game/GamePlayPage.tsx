import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, Volume2, VolumeX, Info, Check, 
  Zap, Crown, Lock, ChevronDown, RefreshCw, Sparkles, X, AlertTriangle
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { audioManager } from '@/utils/audio';
import { DEMO_USER } from '@/data/demoData';
import { DealerCharacter, DealerState } from '@/components/game/DealerCharacter';
import { CharacterAvatar } from '@/components/game/CharacterAvatar';
import { VsIntro } from '@/components/game/VsIntro';
import { gameSettings } from '@/utils/gameSettings';
import { getHandSkinEmojis, getCharacterEmoji } from '@/data/decorations';
import { trackMission } from '@/services/mission';
import { GameSessionLogBuilder } from '@/game/GameSessionLogBuilder';
import { createSampleGameLog } from '@/game/sampleGameLog';
import type { GameModeTag, Hand as LogHand, PlayerSide } from '@/types/gameLog';
import { createGameSocketAdapter } from '@/realtime/createGameSocket';
import type { ConnectionStatus, GameSnapshot } from '@/realtime/types';
import { ConnectionBadge, ReconnectOverlay } from '@/components/game/ReconnectOverlay';
import { saveMatchLog } from '@/services/history/matchHistoryStore';
import { getRankingService } from '@/services/ranking';
import { RevealTension, LastRoundNeon } from '@/components/casino/RevealTension';
import { StreakScreenFrame } from '@/components/casino/StreakAura';
import { HostessAvatar, HostessBackdrop } from '@/components/casino/HostessAvatar';
import { hostessForHand } from '@/data/hostessAssets';
import { ActionCue, FirstPlayCoach } from '@/components/game/ActionCue';
import { BattleDuelStage } from '@/components/game/BattleDuelStage';
import { HostessCutIn, rollCutInRarity, type CutInEvent } from '@/components/game/HostessCutIn';
import {
  SlowMoReveal,
  NearMissFlash,
  ComboHitCounter,
  ScreenCrack,
  OnFireBadge,
  StreakFlameGrowth,
  CountdownUrgency,
  PickBurst,
  JackpotRoundBanner,
  MiniClashReplay,
} from '@/components/casino/DopamineFX';
import { HandGlyph } from '@/components/game/HandGlyph';
import { HandVictoryClash } from '@/components/game/HandVictoryClash';
import { MatchRuleCard } from '@/components/game/MatchRuleCard';
import { InGameSettingsModal } from '@/components/game/InGameSettingsModal';
import {
  loadRematchSeries,
  seriesMatchesContext,
} from '@/services/match/rematchSeries';
import { rollJackpotRound } from '@/utils/jackpotRound';
import { analyzeOpponentPatterns, pickLiveHabitHint } from '@/game/patternStats';
import {
  getOpponentThinkMs,
  getOpeningPickLimit,
  getPickTimeLimit,
  getResultReadMs,
  getRevealSchedule,
  getRoundStartDelayMs,
  getToResultDelayMs,
  resolveCombatPace,
} from '@/game/combatTiming';
import { getMatchupKind, getWinningHand } from '@/game/rpsMatchup';
import {
  applyPointGain,
  availableHands,
  handKo,
  hasWonMatch,
  isMatchPoint,
  pickRandomAvailable,
  pickSealedHand,
  resolveMatchRules,
  usesHandSeal,
  usesRevenge,
  type MatchRuleId,
} from '@/game/matchRules';
import { useSoundMuted } from '@/hooks/useSoundMuted';
import {
  saveLastPlayPath,
  bumpGamesPlayed,
  markFirstGuideDone,
  isFirstGuideDone,
  easyStatusMessage,
  easyRoundLabel,
} from '@/utils/playEase';
import { useDemoWallet } from '@/hooks/useDemoWallet';
import { loadMatchSession } from '@/services/match/matchSession';
import type { MatchOpponent, MatchTable } from '@/types/match';
import { getTableTier } from '@/types/match';

type Hand = 'ROCK' | 'SCISSORS' | 'PAPER';
type PlayerId = 'ME' | 'OPPONENT';
type GamePhase = 
  | 'VS_INTRO'
  | 'RULE_CARD'
  | 'INIT' 
  | 'ATTACK_DECISION' 
  | 'SELECTING' 
  | 'WAITING_OPPONENT' 
  | 'REVEAL' 
  | 'ROUND_RESULT' 
  | 'GAME_OVER';

interface GameState {
  phase: GamePhase;
  round: number;
  myScore: number;
  opponentScore: number;
  attacker: PlayerId | null;
  myHand: Hand | null;
  opponentHand: Hand | null;
  timeLeft: number;
  winner: PlayerId | null;
  roundMessage: string;
}


const DEMO_OPPONENT = {
  nickname: 'GHOST***',
  grade: '골드',
  avatar: '👻'
};

const ALL_HANDS: Hand[] = ['ROCK', 'SCISSORS', 'PAPER'];

const getRpsWinner = (myHand: Hand, opponentHand: Hand): PlayerId | null => {
  if (myHand === opponentHand) return null;
  if (
    (myHand === 'ROCK' && opponentHand === 'SCISSORS') ||
    (myHand === 'SCISSORS' && opponentHand === 'PAPER') ||
    (myHand === 'PAPER' && opponentHand === 'ROCK')
  ) {
    return 'ME';
  }
  return 'OPPONENT';
};

const ImpactEffect = ({ hand, isOpponent }: { hand: Hand, isOpponent?: boolean }) => {
  if (hand === 'ROCK') {
    return (
      <motion.div
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', damping: 10, stiffness: 300 }}
        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
      >
        <span className="text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">✊</span>
      </motion.div>
    );
  }
  if (hand === 'SCISSORS') {
    return (
      <motion.div
        initial={{ width: 0, opacity: 1, rotate: isOpponent ? -45 : 45 }}
        animate={{ width: '150%', opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 bg-white shadow-[0_0_20px_white] z-30 origin-center pointer-events-none"
      />
    );
  }
  if (hand === 'PAPER') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute inset-0 m-auto w-24 h-24 rounded-full border-8 border-white shadow-[0_0_30px_white] z-30 pointer-events-none"
      />
    );
  }
  return null;
}

const AnimatedScore = ({ score, colorClass }: { score: number, colorClass: string }) => (
  <div className={`relative h-12 w-10 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center font-black text-2xl overflow-hidden shadow-inner ${colorClass}`}>
    <AnimatePresence mode="popLayout">
      <motion.div
        key={score}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        {score}
      </motion.div>
    </AnimatePresence>
  </div>
);

export function GamePlayPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const wallet = useDemoWallet();
  const matchSession = loadMatchSession();
  const tableFromState = (location.state?.table as MatchTable | undefined) ?? matchSession?.table;
  const opponentFromState =
    (location.state?.opponent as MatchOpponent | undefined) ?? matchSession?.opponent ?? null;
  const isTournament = new URLSearchParams(location.search).get('tournament') === 'true';
  const isBeginnerMode = id === 'beginner-ai' || !!tableFromState?.isFree;
  const matchTable = tableFromState;
  const activeOpponent = opponentFromState ?? DEMO_OPPONENT;
  const matchRules = useMemo(
    () =>
      resolveMatchRules({
        ruleId:
          (location.state?.ruleId as MatchRuleId | undefined) ??
          matchSession?.ruleId ??
          tableFromState?.ruleId ??
          null,
        tableId: tableFromState?.id ?? null,
        bestOf: (location.state?.bestOf as 3 | 5 | 7 | undefined) ?? null,
      }),
    [
      location.state?.ruleId,
      location.state?.bestOf,
      matchSession?.ruleId,
      tableFromState?.ruleId,
      tableFromState?.id,
    ],
  );
  const combatTempo = gameSettings.options.combatTempo ?? 'default';
  const rematchSeries = loadRematchSeries();
  const seriesForCard =
    rematchSeries &&
    seriesMatchesContext(rematchSeries, {
      opponentNickname: activeOpponent.nickname,
      tableId: matchTable?.id,
    })
      ? rematchSeries
      : null;
  
  const myHandEmojis = getHandSkinEmojis(gameSettings.options.handSkinId);
  const opponentHandEmojis = getHandSkinEmojis('classic');
  const myCharacterEmoji = getCharacterEmoji(gameSettings.options.characterId);
  
  const { soundEnabled, toggleMuted: toggleMute } = useSoundMuted();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBeginnerHelp, setShowBeginnerHelp] = useState(false);
  const practiceTrackedRef = useRef(false);
  const resultNavigatedRef = useRef(false);
  const pendingSelectMeta = useRef<{
    selectedAt: string;
    selectDurationMs: number;
    timeLeftOnSelect: number;
    timerLimit: number;
  } | null>(null);
  const logBuilderRef = useRef<GameSessionLogBuilder | null>(null);
  const socketRef = useRef(createGameSocketAdapter());
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connected');

  if (!logBuilderRef.current) {
    const mode: GameModeTag = isBeginnerMode
      ? 'PRACTICE'
      : isTournament
        ? 'TOURNAMENT'
        : id?.includes('friend')
          ? 'FRIEND'
          : 'LIVE';
    logBuilderRef.current = new GameSessionLogBuilder({
      gameId: id || 'demo-session',
      mode,
      previousBestStreak: DEMO_USER.today.maxStreak,
      isTournamentFinal: isTournament && id?.includes('final'),
      me: {
        nickname: DEMO_USER.nickname,
        grade: DEMO_USER.grade,
        avatar: DEMO_USER.avatar,
        characterId: gameSettings.options.characterId,
      },
      opponent: {
        nickname: activeOpponent.nickname,
        grade: activeOpponent.grade,
        avatar: activeOpponent.avatar,
      },
    });
  }
  
  const [gameState, setGameState] = useState<GameState>(() => {
    let initialPhase: GamePhase = 'VS_INTRO';
    const { introMode } = gameSettings.options;
    
    if (introMode === 'skip') {
      initialPhase = gameSettings.options.showRuleCard !== false ? 'RULE_CARD' : 'INIT';
    } else if (introMode === 'first_only' && sessionStorage.getItem('arena_intro_played')) {
      initialPhase = gameSettings.options.showRuleCard !== false ? 'RULE_CARD' : 'INIT';
    } else if (introMode === 'tournament_only' && !isTournament) {
      initialPhase = gameSettings.options.showRuleCard !== false ? 'RULE_CARD' : 'INIT';
    }

    return {
      phase: initialPhase,
      round: 1,
      myScore: 0,
      opponentScore: 0,
      attacker: null,
      myHand: null,
      opponentHand: null,
      timeLeft: getOpeningPickLimit(
        isBeginnerMode,
        gameSettings.options.combatTempo ?? 'default',
      ),
      winner: null,
      roundMessage: '준비',
    };
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [tableShake, setTableShake] = useState(false);
  const [showCoach, setShowCoach] = useState(() => !isFirstGuideDone());
  const [recommendHand, setRecommendHand] = useState<Hand>('ROCK');
  const [battleLayout, setBattleLayout] = useState<'duel' | 'simple'>(
    () => gameSettings.options.battleLayout ?? 'duel',
  );
  const isDuelLayout = battleLayout === 'duel';

  const toggleBattleLayout = () => {
    const next = battleLayout === 'duel' ? 'simple' : 'duel';
    setBattleLayout(next);
    gameSettings.updateOption('battleLayout', next);
    triggerHaptic('light');
    audioManager.playSFX('btn_touch');
  };

  useEffect(() => {
    const path = `/game/${id || 'quick-start'}`;
    saveLastPlayPath(path);
  }, [id]);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    audioManager.setAmbienceTier(getTableTier(matchTable));
    audioManager.startAmbience();
    return () => {
      audioManager.stopAmbience();
      audioManager.setAmbienceTier('normal');
    };
  }, [matchTable?.id]);
  
  const [cutIn, setCutIn] = useState<CutInEvent | null>(null);
  const cutIdRef = useRef(0);
  const [comboHits, setComboHits] = useState(0);
  const [myPointStreak, setMyPointStreak] = useState(0);
  const [oppPointStreak, setOppPointStreak] = useState(0);
  const [sealedHand, setSealedHand] = useState<Hand | null>(null);
  const [myRevengeBan, setMyRevengeBan] = useState<Hand | null>(null);
  const [oppRevengeBan, setOppRevengeBan] = useState<Hand | null>(null);
  const [nearMissFlash, setNearMissFlash] = useState(false);
  const [revealSnap, setRevealSnap] = useState(false);
  const [screenCrack, setScreenCrack] = useState(false);
  const [pickBurstKey, setPickBurstKey] = useState(0);
  const [miniReplayKey, setMiniReplayKey] = useState(0);
  const [jackpotActive, setJackpotActive] = useState(false);
  const [victoryClash, setVictoryClash] = useState<{
    key: number;
    left: Hand;
    right: Hand;
    winnerSide: 'left' | 'right';
  } | null>(null);
  /** REVEAL 타이머가 닫힌 손 스냅샷을 쓰도록 (듀얼·심플 공통) */
  const revealHandsRef = useRef<{ left: Hand; right: Hand } | null>(null);

  useEffect(() => {
    setJackpotActive(rollJackpotRound());
  }, []);

  const showCutIn = (partial: Omit<CutInEvent, 'id'>) => {
    if (gameSettings.options.reduceAnimations || gameSettings.options.performanceMode === 'low') return;
    const cid = ++cutIdRef.current;
    const rarity = rollCutInRarity();
    const hold = rarity === 'ultra' ? 1600 : rarity === 'rare' ? 1300 : 1050;
    setCutIn({ ...partial, id: cid, rarity });
    window.setTimeout(() => {
      setCutIn((cur) => (cur?.id === cid ? null : cur));
    }, hold);
  };

  const flashNearMiss = (ms = 700) => {
    setNearMissFlash(true);
    window.setTimeout(() => setNearMissFlash(false), ms);
  };

  const habitHint = useMemo(() => {
    const hints = analyzeOpponentPatterns(activeOpponent.nickname);
    return pickLiveHabitHint(hints);
  }, [activeOpponent.nickname, gameState.myScore, gameState.opponentScore]);

  // Reel scrolling states
  const [myReelIcon, setMyReelIcon] = useState<Hand>('ROCK');
  const [opponentReelIcon, setOpponentReelIcon] = useState<Hand>('SCISSORS');

  useEffect(() => {
    // Reel scrolling logic
    let reelTimer: NodeJS.Timeout;
    if (gameState.phase === 'ATTACK_DECISION' || gameState.phase === 'SELECTING' || gameState.phase === 'INIT' || isSpinning) {
      reelTimer = setInterval(() => {
        if (!gameState.myHand || isSpinning) {
          setMyReelIcon(prev => ALL_HANDS[(ALL_HANDS.indexOf(prev) + 1) % 3]);
        }
        if (!gameState.opponentHand || isSpinning) {
          setOpponentReelIcon(prev => ALL_HANDS[(ALL_HANDS.indexOf(prev) + 2) % 3]);
        }
      }, isSpinning ? 50 : 150);
    }
    return () => clearInterval(reelTimer);
  }, [gameState.phase, gameState.myHand, gameState.opponentHand, isSpinning]);

  const [dealerState, setDealerState] = useState<DealerState>('idle');
  const [dealerMessage, setDealerMessage] = useState<string>('');

  const updateDealer = (state: DealerState, message: string, isResultEvent: boolean = false) => {
    if (gameSettings.options.voiceEnabled) {
      if (gameSettings.options.voiceMode === 'all' || isResultEvent) {
         audioManager.speak(message);
      }
    }
    if (gameSettings.options.dealerVisible) {
      setDealerState(state);
      if (message) {
        setDealerMessage(message);
      }
    }
  };

  const updateState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const socket = socketRef.current;
    const onStatus = (s: ConnectionStatus) => setConnStatus(s);
    const onSnapshot = (snap: GameSnapshot) => {
      setGameState((prev) => ({
        ...prev,
        phase: (snap.phase as GamePhase) || prev.phase,
        round: snap.round,
        myScore: snap.myScore,
        opponentScore: snap.opponentScore,
        attacker: snap.attacker,
        myHand: snap.myHand,
        opponentHand: snap.opponentHand,
        timeLeft: snap.timeLeft,
        winner: snap.winner,
      }));
    };
    socket.on('status', onStatus);
    socket.on('snapshot', onSnapshot);
    void socket.connect(id || 'demo-session');
    return () => {
      socket.off('status', onStatus);
      socket.off('snapshot', onSnapshot);
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    // Determine BGM
    if (gameState.phase === 'GAME_OVER') {
      if (gameState.winner === 'ME') {
        audioManager.playBGM('win_result');
      } else {
        audioManager.stopBGM();
      }
      if (isBeginnerMode && !practiceTrackedRef.current) {
        practiceTrackedRef.current = true;
        void trackMission('PRACTICE_COMPLETED');
      }
      if (gameState.winner === 'ME') {
        void trackMission('MATCH_WON');
      }
      if (!resultNavigatedRef.current) {
        resultNavigatedRef.current = true;
        const winner = gameState.winner as PlayerSide | null;
        const built =
          logBuilderRef.current?.finalize({
            myScore: gameState.myScore,
            opponentScore: gameState.opponentScore,
            winner,
            currentStreakAfter:
              winner === 'ME' ? DEMO_USER.streak + 1 : 0,
            source: 'demo_session',
          }) ??
          createSampleGameLog({
            gameId: id || 'demo-session',
            myScore: gameState.myScore,
            opponentScore: gameState.opponentScore,
            winner,
          });
        // 로그가 비어 있으면 샘플로 보강 (하이라이트는 로그 있을 때만)
        const gameLog =
          built.rounds.length > 0
            ? built
            : createSampleGameLog({
                gameId: id || 'demo-session',
                myScore: gameState.myScore,
                opponentScore: gameState.opponentScore,
                winner,
                mode: isBeginnerMode ? 'PRACTICE' : 'LIVE',
              });
        saveMatchLog(gameLog);
        bumpGamesPlayed();
        markFirstGuideDone();
        if (!isBeginnerMode) {
          getRankingService().recordMatchResult(winner === 'ME', winner === 'ME' ? 120 : 40);
        }
        window.setTimeout(() => {
          navigate(`/game/${id || 'demo-session'}/result`, {
            replace: true,
            state: {
              winner: gameState.winner,
              myScore: gameState.myScore,
              opponentScore: gameState.opponentScore,
              gameLog,
              table: matchTable ?? null,
              opponent: activeOpponent,
              matchSession: loadMatchSession(),
            },
          });
        }, getToResultDelayMs(
          resolveCombatPace({
            isSuddenDeath: matchRules.winMode === 'sudden_death',
            isMatchPoint: true,
            tempo: combatTempo,
          }),
          combatTempo,
        ));
      }
    } else if (
      isMatchPoint(
        matchRules,
        gameState.myScore,
        gameState.opponentScore,
        myPointStreak,
        oppPointStreak,
      )
    ) {
      audioManager.playBGM('last_round');
    } else if (gameState.attacker) {
      audioManager.playBGM('attack_game');
    } else {
      audioManager.playBGM('normal_game');
    }
  }, [
    gameState.phase,
    gameState.attacker,
    gameState.myScore,
    gameState.opponentScore,
    gameState.winner,
    isBeginnerMode,
    matchRules,
    myPointStreak,
    oppPointStreak,
  ]);

  useEffect(() => {
    if (gameState.phase === 'INIT') {
      audioManager.playSFX('start_sfx');
      audioManager.callVoice('start');
      updateDealer('start', '묵찌빠 대결을 시작합니다.');
      
      const timer = setTimeout(() => {
        setRecommendHand('ROCK');
        updateState({ 
          phase: 'ATTACK_DECISION', 
          roundMessage: '아래에서 선택',
          timeLeft: getPickTimeLimit(isBeginnerMode, 'calm', combatTempo),
        });
        updateDealer('ask_select', '아래에서 하나를 눌러주세요.');
      }, getRoundStartDelayMs('calm', combatTempo));
      return () => clearTimeout(timer);
    }

    if (gameState.phase === 'REVEAL') {
      // 선택 잠금 → 긴장 → 스핀 → 스냅 → 충돌 홀드 → 판정 (순차) — 듀얼·심플 동일
      const leftSnap = gameState.myHand;
      const rightSnap = gameState.opponentHand;
      if (!leftSnap || !rightSnap) return;
      revealHandsRef.current = { left: leftSnap, right: rightSnap };

      const mpNow = isMatchPoint(
        matchRules,
        gameState.myScore,
        gameState.opponentScore,
        myPointStreak,
        oppPointStreak,
      );
      const pace = resolveCombatPace({
        isMatchPoint: mpNow,
        isSuddenDeath: matchRules.winMode === 'sudden_death',
        tempo: combatTempo,
      });
      const schedule = getRevealSchedule(isBeginnerMode, pace, combatTempo);
      audioManager.duckBgm(schedule.tensionMs + 200, 0.35);
      audioManager.playSFX('tension_before_reveal', {
        intensity: (pace === 'urgent' ? 1.3 : 1) * audioManager.getIntensityBoost(),
      });
      if (mpNow) {
        audioManager.playSFX('match_point', { intensity: 0.85 });
        audioManager.callVoice('match_point');
      }
      setIsSpinning(true);
      setShowImpact(false);
      setTableShake(false);
      setRevealSnap(false);
      triggerHaptic('heartbeat');

      const timers: number[] = [];

      timers.push(
        window.setTimeout(() => {
          audioManager.playSFX('slot_spin', {
            intensity: (pace === 'urgent' ? 1.2 : 1) * audioManager.getIntensityBoost(),
          });
        }, schedule.tensionMs),
      );

      timers.push(
        window.setTimeout(() => {
          const snap = revealHandsRef.current;
          setIsSpinning(false);
          setRevealSnap(true);
          setShowImpact(true);
          if (snap?.left && snap?.right) {
            const winHand = getWinningHand(snap.left, snap.right);
            const loseHand =
              winHand && winHand === snap.left ? snap.right : winHand ? snap.left : null;
            const matchup =
              winHand && loseHand ? getMatchupKind(winHand, loseHand) : null;
            if (matchup) {
              audioManager.playClashImpact(matchup, {
                intensity: (pace === 'urgent' ? 1.35 : 1.15) * audioManager.getIntensityBoost(),
              });
            } else {
              // 무승부 튕김
              audioManager.playSFX('game_void', { intensity: 1.1 });
            }
            if (snap.left === 'ROCK' || snap.right === 'ROCK') {
              setTableShake(true);
              timers.push(window.setTimeout(() => setTableShake(false), 300));
            }
          }
          triggerHaptic('heavy');
        }, schedule.snapAtMs),
      );

      timers.push(
        window.setTimeout(() => setRevealSnap(false), schedule.snapClearMs),
      );

      timers.push(
        window.setTimeout(() => {
          const snap = revealHandsRef.current;
          if (snap) {
            const winHand = getWinningHand(snap.left, snap.right);
            if (winHand) {
              setVictoryClash({
                key: Date.now(),
                left: snap.left,
                right: snap.right,
                winnerSide: winHand === snap.left ? 'left' : 'right',
              });
            }
          }
          setMiniReplayKey((k) => k + 1);
        }, schedule.replayAtMs),
      );

      timers.push(
        window.setTimeout(() => {
          handleRoundLogic();
        }, schedule.logicAtMs),
      );

      return () => {
        timers.forEach((id) => clearTimeout(id));
      };
    }

    if (gameState.phase === 'ROUND_RESULT') {
      const timer = setTimeout(() => {
        const winner = hasWonMatch(
          matchRules,
          gameState.myScore,
          gameState.opponentScore,
          myPointStreak,
          oppPointStreak,
        );
        if (winner) {
          updateState({
            phase: 'GAME_OVER',
            winner,
          });
          if (winner === 'ME') {
            updateDealer('congrats', '최종 승리했습니다!', true);
          } else {
            updateDealer('comfort', '최종 패배했습니다.', true);
          }
        } else {
          const matchPoint = isMatchPoint(
            matchRules,
            gameState.myScore,
            gameState.opponentScore,
            myPointStreak,
            oppPointStreak,
          );
          const nextSeal = usesHandSeal(matchRules) ? pickSealedHand(sealedHand) : null;
          setSealedHand(nextSeal);
          const avail = availableHands({
            sealed: nextSeal,
            revengeBan: usesRevenge(matchRules) ? myRevengeBan : null,
          });
          setRecommendHand(avail[Math.floor(Math.random() * avail.length)] ?? 'ROCK');
          const nextPace = resolveCombatPace({
            isMatchPoint: matchPoint,
            isSuddenDeath: matchRules.winMode === 'sudden_death',
            tempo: combatTempo,
          });
          updateState({
            phase: 'SELECTING',
            myHand: null,
            opponentHand: null,
            timeLeft: getPickTimeLimit(isBeginnerMode, nextPace, combatTempo),
            roundMessage: matchPoint ? '매치포인트!' : '아래에서 선택',
            round: gameState.round + 1,
          });
          if (matchPoint) {
            audioManager.playSFX('match_point', { intensity: 0.9 });
            audioManager.callVoice('match_point');
            updateDealer('surprise', `매치포인트! (${matchRules.shortLabel})`, true);
          } else {
            updateDealer('ask_select', '아래에서 하나를 눌러주세요.');
          }
        }
      }, getResultReadMs(
        isBeginnerMode,
        !!(gameState.myHand && gameState.opponentHand && getWinningHand(gameState.myHand, gameState.opponentHand)),
        resolveCombatPace({
          isMatchPoint: isMatchPoint(
            matchRules,
            gameState.myScore,
            gameState.opponentScore,
            myPointStreak,
            oppPointStreak,
          ),
          isSuddenDeath: matchRules.winMode === 'sudden_death',
          tempo: combatTempo,
        }),
        combatTempo,
      ));
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, isBeginnerMode, matchRules, myPointStreak, oppPointStreak, sealedHand, myRevengeBan]);

  // Timer Logic
  useEffect(() => {
    if ((gameState.phase === 'ATTACK_DECISION' || gameState.phase === 'SELECTING') && !showBeginnerHelp && !showExitModal) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            if (!prev.myHand) {
              handleHandSelect(getRandomHand(), true);
            }
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState.phase, gameState.myHand, showBeginnerHelp, showExitModal]);

  const banOpts = () => ({
    sealed: usesHandSeal(matchRules) ? sealedHand : null,
    revengeBan: usesRevenge(matchRules) ? myRevengeBan : null,
  });
  const oppBanOpts = () => ({
    sealed: usesHandSeal(matchRules) ? sealedHand : null,
    revengeBan: usesRevenge(matchRules) ? oppRevengeBan : null,
  });

  const getRandomHand = (): Hand => pickRandomAvailable(banOpts());
  const getOpponentRandomHand = (): Hand => pickRandomAvailable(oppBanOpts());

  const handleHandSelect = (hand: Hand, auto = false) => {
    if (gameState.phase !== 'ATTACK_DECISION' && gameState.phase !== 'SELECTING') return;
    if (showCoach) {
      setShowCoach(false);
      markFirstGuideDone();
    }
    if (gameState.myHand) return;
    const allowed = availableHands(banOpts());
    if (!allowed.includes(hand)) {
      if (auto) {
        const fallback = pickRandomAvailable(banOpts());
        handleHandSelect(fallback, true);
      }
      return;
    }
    
    if (!auto) {
      triggerHaptic('medium');
      audioManager.playHandSelect(hand);
      setPickBurstKey((k) => k + 1);

      if (hand === 'ROCK') void trackMission('ROCK_SELECTED');
      else if (hand === 'SCISSORS') void trackMission('SCISSORS_SELECTED');
      else void trackMission('PAPER_SELECTED');

      const limit = getPickTimeLimit(isBeginnerMode, 'calm', combatTempo);
      logBuilderRef.current?.markSelectStart(gameState.timeLeft, limit);
      pendingSelectMeta.current = logBuilderRef.current?.recordSelect(hand as LogHand) ?? null;
    }
    
    updateState({ myHand: hand });

    if (gameState.opponentHand) {
      updateState({ phase: 'REVEAL', roundMessage: '결과 공개' });
    } else {
      updateState({ phase: 'WAITING_OPPONENT', roundMessage: '상대 대기' });
      audioManager.playSFX('lock_select');
      
      const thinkPace = resolveCombatPace({
        isMatchPoint: isMatchPoint(
          matchRules,
          gameState.myScore,
          gameState.opponentScore,
          myPointStreak,
          oppPointStreak,
        ),
        isSuddenDeath: matchRules.winMode === 'sudden_death',
        timeLeft: gameState.timeLeft,
      });
      // Simulate opponent selection
      setTimeout(() => {
        audioManager.playSFX('opponent_ready');
        updateState({ opponentHand: getOpponentRandomHand() });
        // Since state updates are async, we handle phase transition here
        updateState({ phase: 'REVEAL', roundMessage: '결과 공개' });
        triggerHaptic('light');
      }, getOpponentThinkMs(thinkPace, combatTempo));
    }
  };

  useEffect(() => {
    if (!isDuelLayout) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'q') handleHandSelect('ROCK');
      else if (key === 'w') handleHandSelect('SCISSORS');
      else if (key === 'e') handleHandSelect('PAPER');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDuelLayout, gameState.phase, gameState.myHand, gameState.opponentHand]);

  const appendRoundLog = (
    result: 'POINT_ME' | 'POINT_OPPONENT' | 'ATTACK_CHANGE' | 'DRAW_RPS' | 'ATTACK_GAIN',
    attackerBefore: PlayerSide | null,
    attackerAfter: PlayerSide | null,
  ) => {
    const meta = pendingSelectMeta.current;
    const now = new Date().toISOString();
    logBuilderRef.current?.pushRound({
      myHand: gameState.myHand as LogHand,
      opponentHand: gameState.opponentHand as LogHand,
      attackerBefore,
      attackerAfter,
      result,
      timeLeftOnSelect: meta?.timeLeftOnSelect ?? gameState.timeLeft,
      timerLimit: meta?.timerLimit ?? getPickTimeLimit(isBeginnerMode, 'calm', combatTempo),
      selectDurationMs: meta?.selectDurationMs ?? 0,
      selectedAt: meta?.selectedAt ?? now,
      lockedAt: now,
      revealedAt: now,
      serverReceivedAt: now,
    });
    pendingSelectMeta.current = null;
  };

  const handleRoundLogic = () => {
    const { myHand, opponentHand, attacker } = gameState;
    if (!myHand || !opponentHand) return;

    const refreshSealForNextPick = () => {
      if (!usesHandSeal(matchRules)) {
        setSealedHand(null);
        return null;
      }
      const next = pickSealedHand(sealedHand);
      setSealedHand(next);
      return next;
    };

    if (gameState.phase === 'ATTACK_DECISION' || !attacker) {
      const rpsWinner = getRpsWinner(myHand, opponentHand);
      if (rpsWinner === null) {
        audioManager.playSFX('game_void');
        flashNearMiss();
        appendRoundLog('DRAW_RPS', null, null);
        const nextSeal = refreshSealForNextPick();
        const avail = availableHands({
          sealed: nextSeal,
          revengeBan: usesRevenge(matchRules) ? myRevengeBan : null,
        });
        setRecommendHand(avail[Math.floor(Math.random() * avail.length)] ?? 'ROCK');
        updateState({
          phase: 'ATTACK_DECISION',
          myHand: null,
          opponentHand: null,
          timeLeft: getPickTimeLimit(isBeginnerMode, 'calm', combatTempo),
          roundMessage: '다시 골라주세요',
        });
        updateDealer('surprise', '비겼어요. 다시 골라주세요.', true);
      } else {
        let message = '';
        if (rpsWinner === 'ME') {
          audioManager.playSFX('attack_get', { intensity: audioManager.getIntensityBoost() });
          audioManager.callVoice('attack');
          message = '내 공격이에요! 같은 손을 내면 이겨요.';
        } else {
          audioManager.playSFX('attack_fail', { intensity: audioManager.getIntensityBoost() });
          message = '상대 공격이에요. 다른 손을 내 막아보세요.';
        }

        if (isBeginnerMode && gameSettings.options.beginnerHelpVoice && gameState.round === 1) {
          message += ' 아래에서 골라주세요.';
        }

        // 리벤지: 공격권 RPS에서 진 쪽 손 봉인
        if (usesRevenge(matchRules)) {
          if (rpsWinner === 'ME') setOppRevengeBan(opponentHand);
          else setMyRevengeBan(myHand);
        }

        updateDealer('ask_select', message, true);
        appendRoundLog('ATTACK_GAIN', null, rpsWinner);
        const nextSeal = refreshSealForNextPick();
        const avail = availableHands({
          sealed: nextSeal,
          revengeBan: usesRevenge(matchRules)
            ? rpsWinner === 'ME'
              ? myRevengeBan
              : myHand
            : null,
        });
        setRecommendHand(avail[0] ?? 'ROCK');

        updateState({
          attacker: rpsWinner,
          phase: 'SELECTING',
          myHand: null,
          opponentHand: null,
          timeLeft: getPickTimeLimit(isBeginnerMode, 'calm', combatTempo),
          roundMessage: rpsWinner === 'ME' ? '내 공격 시작' : '상대 공격 시작',
        });
      }
      return;
    }

    if (myHand === opponentHand) {
      if (attacker === 'ME') {
        appendRoundLog('POINT_ME', attacker, attacker);
        const scored = applyPointGain(matchRules, gameState.myScore, gameState.opponentScore, 'ME');
        const nextCombo = comboHits + 1;
        const nextMyStreak = myPointStreak + 1;
        setComboHits(nextCombo);
        setMyPointStreak(nextMyStreak);
        setOppPointStreak(0);
        if (usesRevenge(matchRules)) {
          setOppRevengeBan(opponentHand);
          setMyRevengeBan(null);
        }
        const wouldWin =
          hasWonMatch(matchRules, scored.myScore, scored.opponentScore, nextMyStreak, 0) === 'ME';
        const wasBehind = gameState.myScore < gameState.opponentScore;
        const isComeback = wasBehind && scored.myScore > gameState.opponentScore;
        const enteringMp = isMatchPoint(
          matchRules,
          scored.myScore,
          scored.opponentScore,
          nextMyStreak,
          0,
        );
        audioManager.playRoundOutcome({
          won: true,
          isFinal: wouldWin,
          isMatchPoint: enteringMp && !wouldWin,
          isComeback,
          streak: nextMyStreak,
          awarded: scored.awarded,
          pan: -0.15,
        });
        if (wouldWin) {
          setScreenCrack(true);
          window.setTimeout(() => setScreenCrack(false), 1200);
        }
        showCutIn({
          role: 'victory',
          title: wouldWin ? 'FINISH!' : scored.awarded >= 2 ? 'DOUBLE!' : 'POINT!',
          subtitle: wouldWin
            ? '결정타!'
            : scored.awarded >= 2
              ? '더블 승점!'
              : nextCombo >= 2
                ? `${nextCombo} HIT COMBO`
                : '승점 획득',
          tone: 'gold',
        });
        updateState({
          myScore: scored.myScore,
          phase: 'ROUND_RESULT',
          roundMessage: '이겼어요!',
        });
        triggerHaptic('success');
        updateDealer('congrats', '이겼어요!', true);
      } else {
        appendRoundLog('POINT_OPPONENT', attacker, attacker);
        const scored = applyPointGain(matchRules, gameState.myScore, gameState.opponentScore, 'OPPONENT');
        const nextOppStreak = oppPointStreak + 1;
        setComboHits(0);
        setMyPointStreak(0);
        setOppPointStreak(nextOppStreak);
        if (usesRevenge(matchRules)) {
          setMyRevengeBan(myHand);
          setOppRevengeBan(null);
        }
        const wouldLose =
          hasWonMatch(matchRules, scored.myScore, scored.opponentScore, 0, nextOppStreak) ===
          'OPPONENT';
        audioManager.playRoundOutcome({
          won: false,
          isFinal: wouldLose,
          isMatchPoint: isMatchPoint(
            matchRules,
            scored.myScore,
            scored.opponentScore,
            0,
            nextOppStreak,
          ),
          pan: 0.2,
        });
        showCutIn({
          role: 'comfort',
          title: scored.awarded >= 2 ? 'DOUBLE' : 'HIT',
          subtitle:
            scored.awarded >= 2
              ? '상대 더블 승점'
              : '상대 승점 · 다음 라운드에 만회해요',
          tone: 'red',
        });
        updateState({
          opponentScore: scored.opponentScore,
          phase: 'ROUND_RESULT',
          roundMessage: '아쉬워요',
        });
        triggerHaptic('error');
        updateDealer('comfort', '아쉬워요. 다음 판!', true);
      }
    } else {
      const rpsWinner = getRpsWinner(myHand, opponentHand);
      flashNearMiss();
      if (usesRevenge(matchRules)) {
        // 공격권 탈취 시: 진 쪽 손 다음 턴 금지
        if (rpsWinner === 'ME') {
          setOppRevengeBan(opponentHand);
          setMyRevengeBan(null);
        } else {
          setMyRevengeBan(myHand);
          setOppRevengeBan(null);
        }
      }
      if (rpsWinner === 'ME') {
        audioManager.playSFX('attack_move', {
          pan: -1,
          intensity: audioManager.getIntensityBoost(),
        });
        audioManager.callVoice('steal');
        const nextCombo = comboHits + 1;
        setComboHits(nextCombo);
        updateDealer('ask_select', '공격권을 가져왔어요!', true);
        showCutIn({
          role: 'arena',
          title: 'STEAL!',
          subtitle: nextCombo >= 2 ? `${nextCombo} HIT · 공격권 탈환` : '공격권 탈환',
          tone: 'platinum',
        });
      } else {
        audioManager.playSFX('attack_move', {
          pan: 1,
          intensity: audioManager.getIntensityBoost(),
        });
        setComboHits(0);
        updateDealer('ask_select', '공격권이 상대에게 넘어갔어요.', true);
      }
      appendRoundLog('ATTACK_CHANGE', attacker, rpsWinner);
      updateState({
        attacker: rpsWinner,
        phase: 'ROUND_RESULT',
        roundMessage: '공격권이 바뀌었어요',
      });
      triggerHaptic('light');
    }
  };

  const isLastRound = isMatchPoint(
    matchRules,
    gameState.myScore,
    gameState.opponentScore,
    myPointStreak,
    oppPointStreak,
  );
  const pickPace = resolveCombatPace({
    isMatchPoint: !!isLastRound,
    isSuddenDeath: matchRules.winMode === 'sudden_death',
    tempo: combatTempo,
  });
  const pickTimerLimit = getPickTimeLimit(isBeginnerMode, pickPace, combatTempo);
  const isHandBanned = (hand: Hand) =>
    (usesHandSeal(matchRules) && sealedHand === hand) ||
    (usesRevenge(matchRules) && myRevengeBan === hand);

  const canPickNow =
    !gameState.myHand &&
    (gameState.phase === 'ATTACK_DECISION' || gameState.phase === 'SELECTING');
  const actionText = easyStatusMessage({
    phase: gameState.phase,
    attacker: gameState.attacker,
    roundMessage: gameState.roundMessage,
    myHand: !!gameState.myHand,
    isLastRound,
  });
  const actionTip =
    canPickNow && (isBeginnerMode || showCoach)
      ? gameState.phase === 'ATTACK_DECISION' || !gameState.attacker
        ? '아무거나 골라도 괜찮아요 · 시간 끝나면 자동 선택'
        : gameState.attacker === 'ME'
          ? '나와 같은 손을 내면 이겨요'
          : '상대와 다른 손을 내면 공격권을 가져와요'
      : null;

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset =
    circumference - (gameState.timeLeft / Math.max(1, pickTimerLimit)) * circumference;

  return (
    <div className="h-full min-h-0 bg-black text-white flex flex-col font-sans select-none overflow-hidden relative">
      <AnimatePresence>
        {gameState.phase === 'VS_INTRO' && (
          <VsIntro
            myInfo={{
              nickname: DEMO_USER.nickname,
              grade: DEMO_USER.grade,
              winStreak: DEMO_USER.streak,
              playStyle: '신중형',
              avatar: DEMO_USER.avatar,
              characterId: gameSettings.options.characterId,
              handSkinId: gameSettings.options.handSkinId,
            }}
            opponentInfo={{
              nickname: activeOpponent.nickname,
              grade: activeOpponent.grade,
              winStreak: 3,
              playStyle: '공격형',
              avatar: activeOpponent.avatar,
              characterId: 'classic_dealer',
              handSkinId: 'classic',
            }}
            entryPoints={100}
            winningPoints={190}
            onComplete={() => {
              sessionStorage.setItem('arena_intro_played', 'true');
              updateState({
                phase: gameSettings.options.showRuleCard !== false ? 'RULE_CARD' : 'INIT',
              });
            }}
            reduceAnimations={gameSettings.options.performanceMode === 'low'}
            muteAudio={gameSettings.options.introMute}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState.phase === 'RULE_CARD' && (
          <MatchRuleCard
            rules={matchRules}
            series={seriesForCard}
            onContinue={() => updateState({ phase: 'INIT' })}
          />
        )}
      </AnimatePresence>
      
      {/* Dealer Character — 심플 모드에서만 */}
      {!isDuelLayout && gameSettings.options.dealerVisible && gameSettings.options.performanceMode !== 'low' && (
        <DealerCharacter 
          state={dealerState} 
          message={dealerMessage} 
          reducedAnimations={gameSettings.options.performanceMode !== 'fancy'} 
        />
      )}

      <ReconnectOverlay
        status={connStatus}
        onRetry={() => void socketRef.current.connect(id || 'demo-session')}
      />

      {isDuelLayout ? (
        <BattleDuelStage
          myName={DEMO_USER.nickname}
          myGrade={DEMO_USER.grade}
          oppName={activeOpponent.nickname}
          oppGrade={activeOpponent.grade}
          myScore={gameState.myScore}
          opponentScore={gameState.opponentScore}
          phase={gameState.phase}
          attacker={gameState.attacker}
          myHand={gameState.myHand}
          opponentHand={gameState.opponentHand}
          timeLeft={gameState.timeLeft}
          roundMessage={gameState.roundMessage}
          actionText={actionText}
          canPickNow={canPickNow}
          recommendHand={recommendHand}
          soundEnabled={soundEnabled}
          connStatus={connStatus}
          tableShake={tableShake}
          isSpinning={isSpinning}
          isLastRound={!!isLastRound}
          timerLimit={pickTimerLimit}
          ruleShortLabel={matchRules.shortLabel}
          lifeBarMax={matchRules.lifeBarMax}
          bannedHands={[
            ...(usesHandSeal(matchRules) && sealedHand ? [sealedHand] : []),
            ...(usesRevenge(matchRules) && myRevengeBan ? [myRevengeBan] : []),
          ]}
          onToggleMute={toggleMute}
          onInfo={() => { triggerHaptic('light'); setShowInfo(true); }}
          onSettings={() => { triggerHaptic('light'); setShowSettings(true); }}
          onSelectHand={(hand) => handleHandSelect(hand)}
          onToggleLayout={toggleBattleLayout}
          habitHint={habitHint}
          tier={getTableTier(matchTable)}
          comboHits={comboHits}
          handSkinId={gameSettings.options.handSkinId}
          onFire={DEMO_USER.streak + gameState.myScore >= 3}
          jackpot={jackpotActive && gameState.phase !== 'GAME_OVER' && gameState.phase !== 'VS_INTRO'}
          winner={gameState.winner}
        />
      ) : (
      <>
      {/* Background Ambience */}
      <div className={`absolute inset-0 z-0 transition-colors duration-1000 ${
        isLastRound
          ? 'bg-[radial-gradient(circle_at_center,_rgba(40,0,0,1)_0%,_rgba(0,0,0,1)_100%)]' 
          : 'bg-[radial-gradient(circle_at_center,_rgba(24,24,27,1)_0%,_rgba(0,0,0,1)_100%)]'
      }`} />
      <HostessBackdrop role="arena" opacity={0.12} />
      
      {/* Background Particles (Fancy only) */}
      {gameSettings.options.performanceMode === 'fancy' && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
           {[...Array(20)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ y: -10, x: Math.random() * 100 + 'vw', opacity: Math.random() }}
               animate={{ y: '100vh', opacity: [0, 1, 0] }}
               transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'linear' }}
               className="absolute w-1 h-1 bg-white rounded-full"
             />
           ))}
        </div>
      )}

      <LastRoundNeon active={!!isLastRound} />
      <StreakScreenFrame streak={DEMO_USER.streak + gameState.myScore} />
      <StreakFlameGrowth streak={DEMO_USER.streak + gameState.myScore} />
      <RevealTension active={isSpinning || gameState.phase === 'REVEAL'} />
      <SlowMoReveal active={isSpinning || gameState.phase === 'REVEAL'} snap={revealSnap} />
      <NearMissFlash open={nearMissFlash} />
      <ComboHitCounter hits={comboHits} />
      <ScreenCrack active={screenCrack} />
      <CountdownUrgency timeLeft={gameState.timeLeft} active={canPickNow} />
      <PickBurst burstKey={pickBurstKey} />
      <MiniClashReplay
        playKey={miniReplayKey}
        myHand={gameState.myHand}
        opponentHand={gameState.opponentHand}
        skinId={gameSettings.options.handSkinId}
        comboBoost={comboHits}
      />
      
      {/* Top Bar */}
      <header className="relative z-20 flex justify-between items-start px-4 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))] pb-3 w-full">
        <div className="flex gap-2">
          <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <ConnectionBadge status={connStatus} />
          <div className="flex gap-2">
            {/* 정보 버튼은 모바일에서 숨김 — 데스크톱에서만 노출 */}
            <button 
              onClick={() => { triggerHaptic('light'); setShowInfo(true); }}
              className="hidden md:flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              <Info className="w-3 h-3" /> INFO
            </button>
            <button
              type="button"
              onClick={toggleBattleLayout}
              className="px-3 py-1.5 rounded-full text-xs font-black bg-arena-gold/20 text-arena-gold border border-arena-gold/40"
            >
              대결 모드
            </button>
          </div>
        </div>
      </header>

      {/* Profiles & Scores */}
      <div className="relative z-10 px-6 flex justify-between items-center w-full max-w-md mx-auto mb-4">
        {/* Me */}
        <div className="flex flex-col items-start gap-3 w-1/3">
          <div className="flex items-center gap-2">
             <div className="relative">
               <CharacterAvatar 
                 characterId={gameSettings.options.characterId} 
                 isMe={true} 
                 phase={gameState.phase} 
                 attacker={gameState.attacker} 
                 winner={gameState.winner} 
                 hand={gameState.myHand} 
               />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{DEMO_USER.grade}</span>
               <span className="text-sm font-black truncate max-w-[70px] text-white">{DEMO_USER.nickname}</span>
             </div>
          </div>
          <div className="flex flex-col items-start gap-1">
             <div className="flex items-center gap-2">
               <AnimatedScore score={gameState.myScore} colorClass="text-arena-cyan" />
               <div className="text-xs font-bold text-gray-500">승</div>
             </div>
             {DEMO_USER.streak >= 2 && (
               <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-arena-warning to-arena-error text-white">
                 🔥 {DEMO_USER.streak}연승
               </span>
             )}
          </div>
        </div>

        {/* Timer */}
        <div className="flex-1 flex justify-center">
           <div className={`relative w-20 h-20 flex items-center justify-center ${isLastRound ? 'scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''} transition-all`}>
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 44 44">
                 <circle cx="22" cy="22" r="20" className="stroke-gray-800" strokeWidth="4" fill="none" />
                 <motion.circle 
                   cx="22" cy="22" r="20"
                   className={`${gameState.timeLeft <= 3 ? 'stroke-arena-error' : 'stroke-arena-gold'}`}
                   strokeWidth="4" fill="none"
                   strokeDasharray={circumference}
                   animate={{ strokeDashoffset }}
                   transition={{ duration: 1, ease: "linear" }}
                   style={{ strokeLinecap: 'round' }}
                 />
              </svg>
              <motion.div
                key={gameState.timeLeft}
                initial={
                  gameState.timeLeft <= 3 && !gameSettings.options.reduceAnimations
                    ? { scale: 1.5, opacity: 0.5 }
                    : false
                }
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.45, duration: 0.35 }}
                className={`absolute inset-0 flex items-center justify-center font-black tabular-nums leading-none ${
                  gameState.timeLeft <= 3
                    ? 'text-4xl text-arena-error'
                    : 'text-3xl text-white drop-shadow-md'
                }`}
                style={
                  gameState.timeLeft <= 3
                    ? { textShadow: '0 0 18px rgba(239,68,68,0.75), 0 1px 0 #000' }
                    : undefined
                }
              >
                 {gameState.timeLeft}
              </motion.div>
           </div>
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-end gap-3 w-1/3">
          <div className="flex items-center gap-2 flex-row-reverse">
             <div className="relative">
               <CharacterAvatar 
                 characterId="classic_dealer" 
                 emojiFallback={activeOpponent.avatar}
                 isMe={false} 
                 phase={gameState.phase} 
                 attacker={gameState.attacker} 
                 winner={gameState.winner} 
                 hand={gameState.opponentHand} 
               />
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{activeOpponent.grade}</span>
               <span className="text-sm font-black truncate max-w-[70px] text-white">{activeOpponent.nickname}</span>
             </div>
          </div>
          <div className="flex items-center gap-2 flex-row-reverse">
             <AnimatedScore score={gameState.opponentScore} colorClass="text-arena-error" />
             <div className="text-xs font-bold text-gray-500">승</div>
          </div>
        </div>
      </div>

      {/* 상태 배지 — HUD와 겹치지 않게 흐름 안에 배치 */}
      <div className="relative z-20 w-full flex flex-col items-center gap-1.5 px-4">
        <OnFireBadge
          inline
          streak={DEMO_USER.streak + gameState.myScore}
          show={DEMO_USER.streak + gameState.myScore >= 3}
        />
        <JackpotRoundBanner
          inline
          active={jackpotActive && gameState.phase !== 'GAME_OVER' && gameState.phase !== 'VS_INTRO'}
        />
      </div>

      <ActionCue text={actionText} highlight={canPickNow} tip={actionTip} />
      <div className="relative z-20 w-full flex flex-wrap justify-center gap-1.5 px-4 -mt-1 mb-1">
        <span className="text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
          {matchRules.shortLabel}
        </span>
        {usesHandSeal(matchRules) && sealedHand && (
          <span className="text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full bg-violet-500/90 text-white border border-black/30">
            봉인 {handKo(sealedHand)}
          </span>
        )}
        {usesRevenge(matchRules) && myRevengeBan && (
          <span className="text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full bg-rose-500/90 text-white border border-black/30">
            리벤지 금지 {handKo(myRevengeBan)}
          </span>
        )}
      </div>

      {/* Main Reels Area */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full max-w-md mx-auto">
        
        {/* Status Text (Slot Top Display) */}
        <div className="mb-6 w-4/5 h-12 bg-black border-[3px] border-gray-800 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
           <AnimatePresence mode="wait">
             <motion.div
               key={gameState.roundMessage}
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: -30, opacity: 0 }}
               className={`font-black text-lg tracking-tight ${
                 gameState.roundMessage === '이겼어요!' || gameState.roundMessage === 'WIN' ? 'text-arena-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' :
                 gameState.roundMessage === '아쉬워요' || gameState.roundMessage === 'LOSE' ? 'text-arena-error drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]' :
                 gameState.roundMessage.includes('공격') ? 'text-arena-gold drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' :
                 'text-white drop-shadow-md'
               }`}
             >
               {easyRoundLabel(gameState.roundMessage)}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* The 3 Reels */}
        <motion.div 
          animate={tableShake ? { x: [-10, 10, -10, 10, 0], y: [-5, 5, -5, 5, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center gap-3 md:gap-5 p-5 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2rem] border-[8px] border-gray-800 shadow-[0_15px_40px_rgba(0,0,0,0.9)] relative transition-all duration-1000 ${
           isLastRound ? 'shadow-[0_0_50px_rgba(220,38,38,0.3)] border-red-900/40' : ''
        }`}>
          {isLastRound && (
            <div className="absolute -top-10 inset-x-0 text-center font-black text-red-500 tracking-widest text-sm animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              마지막 판!
            </div>
          )}

          {/* Me Reel */}
          <div className={`w-28 h-40 rounded-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-[inset_0_0_20px_rgba(0,0,0,1)] transition-all duration-300 ${
            gameState.attacker === 'ME' ? 'border-[4px] border-arena-gold shadow-[0_0_30px_rgba(245,158,11,0.6)]' : 'border-[4px] border-gray-900'
          }`}>
             <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 pointer-events-none z-20" />
             <AnimatePresence mode="popLayout">
               <motion.div 
                 key={isSpinning ? myReelIcon : (gameState.myHand || myReelIcon)}
                 initial={{ y: isSpinning ? -120 : 0, opacity: isSpinning ? 0.3 : 1 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: isSpinning ? 120 : 0, opacity: isSpinning ? 0.3 : 0 }}
                 transition={{ duration: isSpinning ? 0.08 : 0.2 }}
                 className={`text-8xl md:text-9xl z-10 relative leading-none ${showImpact ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : ''} transition-all`}
                 style={{ filter: showImpact ? undefined : 'drop-shadow(0 6px 0 rgba(0,0,0,0.6))' }}
               >
                 {myHandEmojis[isSpinning ? myReelIcon : (gameState.myHand || myReelIcon)]}
               </motion.div>
             </AnimatePresence>
             {showImpact && gameState.myHand && (
               <ImpactEffect hand={gameState.myHand} />
             )}
          </div>

          {/* Center VS/Attack Reel */}
          <div className="w-16 h-40 rounded-2xl flex items-center justify-center relative overflow-hidden bg-black border-4 border-gray-900 shadow-inner">
             <AnimatePresence mode="wait">
               {gameState.attacker === 'ME' ? (
                 <motion.div key="crown-me" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-arena-gold flex flex-col items-center">
                   <Crown className="w-10 h-10 drop-shadow-[0_0_15px_rgba(245,158,11,1)]" />
                 </motion.div>
               ) : gameState.attacker === 'OPPONENT' ? (
                 <motion.div key="crown-opp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-arena-error flex flex-col items-center">
                   <Zap className="w-10 h-10 drop-shadow-[0_0_15px_rgba(220,38,38,1)]" />
                 </motion.div>
               ) : (
                 <motion.div key="vs" className="text-gray-700 font-black italic text-2xl">VS</motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Opponent Reel */}
          <div className={`w-28 h-40 rounded-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-[inset_0_0_20px_rgba(0,0,0,1)] transition-all duration-300 ${
            gameState.attacker === 'OPPONENT' ? 'border-[4px] border-arena-error shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'border-[4px] border-gray-900'
          }`}>
             <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 pointer-events-none z-20" />
             <AnimatePresence mode="popLayout">
               {gameState.phase === 'REVEAL' || gameState.phase === 'ROUND_RESULT' ? (
                 <motion.div 
                   key={isSpinning ? opponentReelIcon : gameState.opponentHand}
                   initial={{ y: isSpinning ? -120 : 0, opacity: isSpinning ? 0.3 : 1 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: isSpinning ? 120 : 0, opacity: isSpinning ? 0.3 : 0 }}
                   transition={{ duration: isSpinning ? 0.08 : 0.2 }}
                   className={`text-8xl md:text-9xl z-10 relative leading-none ${showImpact ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : ''} transition-all`}
                 >
                   {opponentHandEmojis[isSpinning ? opponentReelIcon : (gameState.opponentHand as Hand)]}
                 </motion.div>
               ) : gameState.opponentHand ? (
                  // Locked by opponent but not revealed
                  <motion.div key="locked" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl text-gray-600 z-10 relative">
                    <Lock className="w-12 h-12 drop-shadow-md" />
                  </motion.div>
               ) : (
                 <motion.div 
                   key={opponentReelIcon}
                   initial={{ y: -120, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: 120, opacity: 0 }}
                   transition={{ duration: 0.1 }}
                   className="text-8xl opacity-40 z-10 relative blur-[2px] leading-none"
                 >
                   {opponentHandEmojis[opponentReelIcon]}
                 </motion.div>
               )}
             </AnimatePresence>
             {showImpact && gameState.opponentHand && (
               <ImpactEffect hand={gameState.opponentHand} isOpponent />
             )}
          </div>
        </motion.div>

      </div>

      {/* Bottom Area: Points and Action Buttons */}
      <div className="relative z-20 w-full max-w-md mx-auto bg-gray-900 border-t border-gray-800 rounded-t-[2rem] pt-4 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] shrink-0">
        
        <div className="flex justify-between items-center mb-2.5 px-2">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold">{isBeginnerMode ? '연습 비용' : '이번 판 참가'}</span>
              <span className="font-bold text-white text-sm">
                {isBeginnerMode
                  ? '무료 · 차감 없음'
                  : matchTable
                    ? `${matchTable.entryPoint.toLocaleString()} P 예치`
                    : '데모 매치'}
              </span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-bold">내 보유 (데모)</span>
              <span className="font-bold text-arena-gold text-sm">{wallet.points.toLocaleString()} P</span>
           </div>
        </div>

        <div className="flex justify-between gap-2.5 sm:gap-3 relative">
          <FirstPlayCoach
            visible={showCoach && canPickNow}
            onDismiss={() => {
              setShowCoach(false);
              markFirstGuideDone();
            }}
          />
          {(['ROCK', 'SCISSORS', 'PAPER'] as Hand[]).map((hand) => {
            const isSelected = gameState.myHand === hand;
            const banned = isHandBanned(hand);
            const canSelect = canPickNow && !banned;
            const isRecommend =
              canSelect &&
              (isBeginnerMode || showCoach) &&
              hand === recommendHand;
            const reduceMotion = gameSettings.options.performanceMode === 'low';

            return (
              <motion.button
                key={hand}
                type="button"
                onClick={() => handleHandSelect(hand)}
                disabled={!canSelect}
                whileTap={canSelect && !reduceMotion ? { scale: 0.94 } : undefined}
                animate={
                  !reduceMotion && canSelect
                    ? isSelected
                      ? { scale: [1, 1.04, 1] }
                      : isRecommend
                        ? { scale: [1, 1.03, 1] }
                        : { y: [0, -2, 0] }
                    : undefined
                }
                transition={{
                  duration: isSelected || isRecommend ? 0.9 : 2.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`flex-1 min-h-[7.5rem] sm:min-h-0 aspect-auto sm:aspect-square rounded-2xl flex flex-col items-center justify-center relative overflow-hidden touch-manipulation ${
                  banned ? 'bg-gray-900 opacity-40 grayscale border-b-8 border-gray-950' :
                  isSelected ? 'bg-gradient-to-b from-gray-700 to-gray-800 border-b-4 border-gray-900 shadow-inner' :
                  !canSelect ? 'bg-gray-800 opacity-35 grayscale border-b-8 border-gray-900' :
                  'bg-gradient-to-b from-gray-600 to-gray-700 border-b-8 border-gray-900 hover:brightness-110 shadow-lg'
                } ${
                  isRecommend
                    ? 'ring-2 ring-arena-gold ring-offset-2 ring-offset-gray-900 z-10'
                    : canSelect
                      ? 'opacity-100'
                      : ''
                }`}
              >
                {banned && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 text-[9px] font-black bg-arena-error text-white px-1.5 py-0.5 rounded-full">
                    {usesHandSeal(matchRules) && sealedHand === hand ? '봉인' : '리벤지'}
                  </span>
                )}
                <motion.img
                  src={hostessForHand(hand)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-[center_12%] pointer-events-none scale-110"
                  animate={
                    !reduceMotion && canSelect
                      ? { opacity: isSelected ? [0.42, 0.55, 0.42] : [0.32, 0.42, 0.32] }
                      : { opacity: canSelect ? 0.4 : 0.12 }
                  }
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15 pointer-events-none" />
                {isRecommend && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 text-[9px] font-black bg-arena-gold text-black px-1.5 py-0.5 rounded-full">
                    추천
                  </span>
                )}
                {isSelected && <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(34,211,238,0.5)] border-2 border-arena-cyan pointer-events-none z-10" />}
                <motion.span
                  key={`${hand}-${isSelected}-${isRecommend}`}
                  initial={reduceMotion ? false : { scale: 0.6, opacity: 0.5 }}
                  animate={
                    reduceMotion
                      ? { scale: 1 }
                      : isSelected
                        ? { scale: [1, 1.16, 1], rotate: [0, -6, 6, 0] }
                        : isRecommend
                          ? { scale: [1, 1.12, 1], rotate: [0, -8, 8, 0] }
                          : { scale: 1, rotate: 0, opacity: 1 }
                  }
                  transition={
                    isSelected || isRecommend
                      ? { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
                      : { type: 'spring', bounce: 0.55, duration: 0.45 }
                  }
                  className={`relative z-10 leading-none mb-1 ${!canSelect && !isSelected ? 'opacity-40' : ''}`}
                >
                  <HandGlyph
                    hand={hand}
                    theme={gameSettings.options.handSkinId}
                    size={64}
                    comboBoost={isSelected ? Math.max(comboHits, 1) : 0}
                    className="w-14 h-14 sm:w-16 sm:h-16"
                  />
                </motion.span>
                <span className={`relative z-10 text-sm font-black ${isSelected ? 'text-arena-cyan' : 'text-gray-200'}`}>
                  {hand === 'ROCK' ? '묵' : hand === 'SCISSORS' ? '찌' : '빠'}
                </span>
              </motion.button>
            );
          })}
        </div>
        {canPickNow && (
          <p className="text-center text-[10px] text-gray-500 font-bold mt-3">
            시간이 끝나면 자동으로 선택돼요
          </p>
        )}
      </div>
      </>
      )}

      {/* Final Game Over Overlay */}
      <AnimatePresence>
        {gameState.phase === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 ${
              gameState.winner === 'ME' ? 'bg-black/90 backdrop-blur-md' : 'bg-black/95'
            }`}
          >
            {gameState.winner === 'ME' && (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(245,158,11,0.3)_360deg)] opacity-50 pointer-events-none"
              />
            )}
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative z-10 flex flex-col items-center w-full max-w-sm text-center"
            >
              {gameState.winner === 'ME' ? (
                <>
                  <HostessAvatar role="jackpot" size="xl" pulse className="mb-4" />
                  <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] mb-1">
                    승리
                  </h1>
                  <p className="text-[11px] font-black text-arena-gold/70 tracking-[0.4em] uppercase mb-3">
                    Winner takes all
                  </p>
                  <p className="text-arena-gold font-bold text-xl mb-8">+1,900 P</p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 w-full flex justify-between items-center">
                    <span className="text-gray-400">현재 연승</span>
                    <span className="text-white font-black text-2xl">{DEMO_USER.streak + 1}연승 🔥</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <LogOut className="w-8 h-8 text-gray-500" />
                  </div>
                  <h1 className="text-4xl font-black text-gray-300 mb-1">
                    아쉬운 한 판
                  </h1>
                  <p className="text-[11px] font-black text-gray-600 tracking-[0.35em] uppercase mb-6">
                    Next round awaits
                  </p>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8 w-full flex justify-between items-center text-gray-500">
                    <span>잃은 포인트</span>
                    <span className="font-bold">-1,000 P</span>
                  </div>
                </>
              )}
              
              <div className="w-full space-y-3">
                <p className="text-xs text-gray-500 font-bold mb-2">결과 화면으로 이동 중…</p>
                <PrimaryButton
                  onClick={() =>
                    navigate(`/game/${id || 'demo-session'}/result`, {
                      replace: true,
                      state: {
                        winner: gameState.winner,
                        myScore: gameState.myScore,
                        opponentScore: gameState.opponentScore,
                      },
                    })
                  }
                  className="w-full py-4 text-lg"
                >
                  결과 바로 보기
                </PrimaryButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Dropdown Overlay */}
      <AnimatePresence>
        {showInfo && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowInfo(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">게임 정보</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>게임 ID</span>
                  <span className="font-mono text-gray-300">{id || 'demo-1234'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>연결 상태</span>
                  <ConnectionBadge status={connStatus} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    socketRef.current.simulateDisconnect?.();
                    setShowInfo(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white"
                >
                  연결 끊김 시뮬레이션 (Mock)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBeginnerHelp(true);
                    setShowInfo(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-arena-gold/10 border border-arena-gold/30 text-xs font-bold text-arena-gold"
                >
                  초보자 도움말
                </button>
                <div className="h-px bg-gray-800 my-2" />
                <div className="flex justify-between">
                  <span>참가 포인트</span>
                  <span className="text-white">
                    {matchTable
                      ? `${matchTable.entryPoint.toLocaleString()} P`
                      : isBeginnerMode
                        ? '무료'
                        : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>운영 수수료</span>
                  <span className="text-arena-error">
                    {matchTable && !matchTable.isFree
                      ? `-${matchTable.fee.toLocaleString()} P`
                      : '없음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>승리 지급</span>
                  <span className="text-arena-gold font-bold">
                    {matchTable && !matchTable.isFree
                      ? `+${matchTable.winnerPoint.toLocaleString()} P`
                      : '연습'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">
                  ※ 공격권으로 승점을 딴 뒤 승리하면 팟의 1%가 추가 수수료로 붙을 수 있습니다.
                </p>
                <div className="h-px bg-gray-800 my-2" />
                <p className="text-xs">
                  • {isBeginnerMode ? '10' : '5'}초 이내 미선택 시 자동 선택됩니다.<br/>
                  • 게임 중 강제 종료 시 패배 처리됩니다.
                </p>
              </div>
              {isBeginnerMode && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button 
                    onClick={() => { setShowInfo(false); setShowExitModal(true); }}
                    className="w-full py-2 bg-red-500/10 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> 게임에서 나가기
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Beginner Help Modal */}
      <AnimatePresence>
        {showBeginnerHelp && (
          <div className="overlay-area z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowBeginnerHelp(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="text-arena-gold text-2xl">?</span> 게임 도움말
                </h3>
                <button onClick={() => setShowBeginnerHelp(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <h4 className="text-arena-cyan font-bold text-sm mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> 가위바위보 관계
                  </h4>
                  <p className="text-sm text-gray-300">
                    주먹(✊) {'>'} 가위(✌️) {'>'} 보(🖐️) {'>'} 주먹(✊)
                  </p>
                </div>

                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <h4 className="text-arena-success font-bold text-sm mb-2 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> 공격권이란?
                  </h4>
                  <p className="text-sm text-gray-300">
                    가위바위보에서 이기면 공격권을 가집니다.<br />
                    공격권이 있을 때 같은 손이 나오면 승리합니다.
                  </p>
                </div>

                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <h4 className="text-arena-gold font-bold text-sm mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> 현재 상황
                  </h4>
                  <p className="text-sm text-gray-300 font-bold">
                    {gameState.attacker === 'ME' ? '내가 공격 중! 같은 손을 내면 이깁니다.' : 
                     gameState.attacker === 'OPPONENT' ? '상대가 공격 중! 다른 손을 내서 방어하세요.' : 
                     '아직 공격권이 없습니다. 이겨서 공격권을 가져오세요!'}
                  </p>
                </div>
              </div>

              <SecondaryButton onClick={() => setShowBeginnerHelp(false)} className="w-full py-4 mt-6">
                이해했습니다
              </SecondaryButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowExitModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-arena-error/10 border border-arena-error/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-arena-error" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">중도 이탈 경고</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                지금 나가시면 <span className="text-arena-error font-bold">기권패</span> 처리됩니다.<br/>
                정말 나가시겠습니까?
              </p>
              
              <div className="flex space-x-3">
                <SecondaryButton onClick={() => setShowExitModal(false)} className="flex-1">
                  계속하기
                </SecondaryButton>
                <PrimaryButton onClick={() => navigate('/lobby')} className="flex-1 bg-arena-error text-white hover:bg-red-600 border-none">
                  나가기
                </PrimaryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <InGameSettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
      {/* 승부 영상 중에는 컷인을 숨겨 심플·듀얼 모두 영상이 가려지지 않게 */}
      {!victoryClash && <HostessCutIn cut={cutIn} />}
      {victoryClash && (
        <HandVictoryClash
          key={victoryClash.key}
          playKey={victoryClash.key}
          leftHand={victoryClash.left}
          rightHand={victoryClash.right}
          winnerSide={victoryClash.winnerSide}
          skinId={gameSettings.options.handSkinId}
          onComplete={() => setVictoryClash(null)}
        />
      )}
      {/* Duel layout also needs global dopamine overlays (mounted above for both) */}
      {isDuelLayout && (
        <>
          <SlowMoReveal active={isSpinning || gameState.phase === 'REVEAL'} snap={revealSnap} />
          <NearMissFlash open={nearMissFlash} />
          <ScreenCrack active={screenCrack} />
          <StreakFlameGrowth streak={DEMO_USER.streak + gameState.myScore} />
          <CountdownUrgency timeLeft={gameState.timeLeft} active={canPickNow} />
          <PickBurst burstKey={pickBurstKey} />
          {/* 배지는 DuelHud 상태 스트립으로 통합 — 중앙 손 위 오버레이 제거 */}
          <MiniClashReplay
            playKey={miniReplayKey}
            myHand={gameState.myHand}
            opponentHand={gameState.opponentHand}
            skinId={gameSettings.options.handSkinId}
            comboBoost={comboHits}
          />
        </>
      )}
      {!isDuelLayout && habitHint && canPickNow && (
        <div className="overlay-gutter fixed top-20 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
          <p className="text-[11px] font-bold text-arena-cyan bg-black/60 border border-arena-cyan/25 rounded-full px-3 py-1.5">
            힌트 · {habitHint}
          </p>
        </div>
      )}
    </div>
  );
}
