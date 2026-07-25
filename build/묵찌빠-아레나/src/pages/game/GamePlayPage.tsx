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
import {
  ReactionBubble,
  EmoteQuickBar,
  FloatingEmotesLayer,
  REACTIONS,
  type ReactionType,
  type FloatingEmote,
} from '@/components/game/GameReactions';
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
import { rollJackpotRound } from '@/utils/jackpotRound';
import { analyzeOpponentPatterns, pickLiveHabitHint } from '@/game/patternStats';
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
  
  const myHandEmojis = getHandSkinEmojis(gameSettings.options.handSkinId);
  const opponentHandEmojis = getHandSkinEmojis('classic');
  const myCharacterEmoji = getCharacterEmoji(gameSettings.options.characterId);
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
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
      initialPhase = 'INIT';
    } else if (introMode === 'first_only' && sessionStorage.getItem('arena_intro_played')) {
      initialPhase = 'INIT';
    } else if (introMode === 'tournament_only' && !isTournament) {
      initialPhase = 'INIT';
    }

    return {
      phase: initialPhase,
      round: 1,
      myScore: 0,
      opponentScore: 0,
      attacker: null,
      myHand: null,
      opponentHand: null,
      timeLeft: isBeginnerMode ? 15 : 7,
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
    return () => audioManager.setAmbienceTier('normal');
  }, [matchTable?.id]);
  
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [opponentReaction, setOpponentReaction] = useState<ReactionType | null>(null);
  const [reactionCooldown, setReactionCooldown] = useState(0);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const floatingIdRef = useRef(0);

  const [cutIn, setCutIn] = useState<CutInEvent | null>(null);
  const cutIdRef = useRef(0);
  const [comboHits, setComboHits] = useState(0);
  const [nearMissFlash, setNearMissFlash] = useState(false);
  const [revealSnap, setRevealSnap] = useState(false);
  const [screenCrack, setScreenCrack] = useState(false);
  const [pickBurstKey, setPickBurstKey] = useState(0);
  const [miniReplayKey, setMiniReplayKey] = useState(0);
  const [jackpotActive, setJackpotActive] = useState(false);

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
        }, 1600);
      }
    } else if (gameState.myScore === 1 && gameState.opponentScore === 1) {
      audioManager.playBGM('last_round');
    } else if (gameState.attacker) {
      audioManager.playBGM('attack_game');
    } else {
      audioManager.playBGM('normal_game');
    }
  }, [gameState.phase, gameState.attacker, gameState.myScore, gameState.opponentScore, gameState.winner, isBeginnerMode]);

  useEffect(() => {
    if (gameState.phase === 'INIT') {
      audioManager.playSFX('start_sfx');
      updateDealer('start', '묵찌빠 대결을 시작합니다.');
      
      const timer = setTimeout(() => {
        setRecommendHand('ROCK');
        updateState({ 
          phase: 'ATTACK_DECISION', 
          roundMessage: '아래에서 선택',
          timeLeft: isBeginnerMode ? 10 : 5
        });
        updateDealer('ask_select', '아래에서 하나를 눌러주세요.');
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (gameState.phase === 'REVEAL') {
      audioManager.playSFX('tension_before_reveal');
      audioManager.playSFX('slot_spin');
      setIsSpinning(true);
      setShowImpact(false);
      setTableShake(false);
      setRevealSnap(false);
      triggerHaptic('heartbeat');

      const spinMs = isBeginnerMode ? 1400 : 1200;
      const stopSpinTimer = setTimeout(() => {
        setIsSpinning(false);
        setRevealSnap(true);
        setShowImpact(true);
        setMiniReplayKey((k) => k + 1);
        window.setTimeout(() => setRevealSnap(false), 200);
        if (gameState.myHand === 'ROCK' || gameState.opponentHand === 'ROCK') {
          setTableShake(true);
          setTimeout(() => setTableShake(false), 300);
          audioManager.playSFX('rock_btn');
        } else if (gameState.myHand === 'SCISSORS' || gameState.opponentHand === 'SCISSORS') {
          audioManager.playSFX('scissors_btn');
        } else {
          audioManager.playSFX('paper_btn');
        }
        triggerHaptic('heavy');
      }, spinMs);

      const timer = setTimeout(() => {
        handleRoundLogic();
      }, isBeginnerMode ? 3200 : 2800);
      return () => {
        clearTimeout(stopSpinTimer);
        clearTimeout(timer);
      };
    }

    if (gameState.phase === 'ROUND_RESULT') {
      const timer = setTimeout(() => {
        if (gameState.myScore >= 2 || gameState.opponentScore >= 2) {
          const isWin = gameState.myScore >= 2;
          updateState({ 
            phase: 'GAME_OVER',
            winner: isWin ? 'ME' : 'OPPONENT',
          });
          if (isWin) {
            updateDealer('congrats', '최종 승리했습니다!', true);
          } else {
            updateDealer('comfort', '최종 패배했습니다.', true);
          }
        } else {
          const isFinalRound = gameState.myScore === 1 && gameState.opponentScore === 1;
          setRecommendHand(ALL_HANDS[Math.floor(Math.random() * 3)]);
          updateState({ 
            phase: 'SELECTING', 
            myHand: null, 
            opponentHand: null, 
            timeLeft: isBeginnerMode ? 10 : 5,
            roundMessage: isFinalRound ? '마지막 판!' : '아래에서 선택',
            round: gameState.round + 1
          });
          if (isFinalRound) {
            updateDealer('surprise', '마지막 판이에요! 아래에서 골라주세요.');
          } else {
            updateDealer('ask_select', '아래에서 하나를 눌러주세요.');
          }
        }
      }, isBeginnerMode ? 2500 : 1000); // 2.5 sec for beginners to read result
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, isBeginnerMode]);

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

  const getRandomHand = (): Hand => ALL_HANDS[Math.floor(Math.random() * ALL_HANDS.length)];

  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout;
    if (reactionCooldown > 0) {
      cooldownTimer = setTimeout(() => {
        setReactionCooldown(prev => Math.max(0, prev - 1000));
      }, 1000);
    }
    return () => clearTimeout(cooldownTimer);
  }, [reactionCooldown]);

  useEffect(() => {
    if (myReaction) {
      const t = setTimeout(() => setMyReaction(null), 2000);
      return () => clearTimeout(t);
    }
  }, [myReaction]);

  useEffect(() => {
    if (opponentReaction) {
      const t = setTimeout(() => setOpponentReaction(null), 2000);
      return () => clearTimeout(t);
    }
  }, [opponentReaction]);

  const handleSendReaction = (id: ReactionType) => {
    setMyReaction(id);
    setReactionCooldown(3000);
    void trackMission('REACTION_SENT');
    const icon = REACTIONS.find((r) => r.id === id)?.icon ?? '✨';
    const fid = ++floatingIdRef.current;
    setFloatingEmotes((prev) => [...prev, { id: fid, icon, side: 'me' }]);
    window.setTimeout(() => {
      setFloatingEmotes((prev) => prev.filter((e) => e.id !== fid));
    }, 1500);

    if (Math.random() > 0.5) {
      setTimeout(() => {
        const reactions: ReactionType[] = ['CHALLENGE', 'GOOD', 'CLOSE', 'FAST', 'SURPRISE', 'CLAP', 'LAUGH', 'REMATCH'];
        const randomOpponentReaction = reactions[Math.floor(Math.random() * reactions.length)];
        setOpponentReaction(randomOpponentReaction);
        const oIcon = REACTIONS.find((r) => r.id === randomOpponentReaction)?.icon ?? '✨';
        const oid = ++floatingIdRef.current;
        setFloatingEmotes((prev) => [...prev, { id: oid, icon: oIcon, side: 'opp' }]);
        window.setTimeout(() => {
          setFloatingEmotes((prev) => prev.filter((e) => e.id !== oid));
        }, 1500);
      }, 1000 + Math.random() * 1000);
    }
  };

  const toggleMute = () => {
    triggerHaptic('light');
    audioManager.updateSetting('mute', !soundEnabled);
    setSoundEnabled(!soundEnabled);
  };

  const handleHandSelect = (hand: Hand, auto = false) => {
    if (gameState.phase !== 'ATTACK_DECISION' && gameState.phase !== 'SELECTING') return;
    if (showCoach) {
      setShowCoach(false);
      markFirstGuideDone();
    }
    if (gameState.myHand) return;
    
    if (!auto) {
      triggerHaptic('medium');
      if (hand === 'ROCK') audioManager.playSFX('rock_btn');
      else if (hand === 'SCISSORS') audioManager.playSFX('scissors_btn');
      else if (hand === 'PAPER') audioManager.playSFX('paper_btn');
      setPickBurstKey((k) => k + 1);

      if (hand === 'ROCK') void trackMission('ROCK_SELECTED');
      else if (hand === 'SCISSORS') void trackMission('SCISSORS_SELECTED');
      else void trackMission('PAPER_SELECTED');

      const limit = isBeginnerMode ? 10 : 5;
      logBuilderRef.current?.markSelectStart(gameState.timeLeft, limit);
      pendingSelectMeta.current = logBuilderRef.current?.recordSelect(hand as LogHand) ?? null;
    }
    
    updateState({ myHand: hand });

    if (gameState.opponentHand) {
      updateState({ phase: 'REVEAL', roundMessage: '결과 공개' });
    } else {
      updateState({ phase: 'WAITING_OPPONENT', roundMessage: '상대 대기' });
      audioManager.playSFX('lock_select');
      
      // Simulate opponent selection
      setTimeout(() => {
        audioManager.playSFX('opponent_ready');
        updateState({ opponentHand: getRandomHand() });
        // Since state updates are async, we handle phase transition here
        updateState({ phase: 'REVEAL', roundMessage: '결과 공개' });
        triggerHaptic('light');
      }, Math.random() * 1000 + 300);
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
      timerLimit: meta?.timerLimit ?? (isBeginnerMode ? 10 : 5),
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

    if (gameState.phase === 'ATTACK_DECISION' || !attacker) {
      const rpsWinner = getRpsWinner(myHand, opponentHand);
      if (rpsWinner === null) {
        audioManager.playSFX('game_void');
        flashNearMiss();
        appendRoundLog('DRAW_RPS', null, null);
        setRecommendHand(ALL_HANDS[Math.floor(Math.random() * 3)]);
        updateState({ 
          phase: 'ATTACK_DECISION', 
          myHand: null, 
          opponentHand: null, 
          timeLeft: isBeginnerMode ? 10 : 5,
          roundMessage: '다시 골라주세요' 
        });
        updateDealer('surprise', '비겼어요. 다시 골라주세요.', true);
      } else {
        let message = '';
        if (rpsWinner === 'ME') {
          audioManager.playSFX('attack_get');
          message = '내 공격이에요! 같은 손을 내면 이겨요.';
        } else {
          audioManager.playSFX('attack_fail');
          message = '상대 공격이에요. 다른 손을 내 막아보세요.';
        }
        
        if (isBeginnerMode && gameSettings.options.beginnerHelpVoice && gameState.round === 1) {
          message += ' 아래에서 골라주세요.';
        }
        
        updateDealer('ask_select', message, true);
        appendRoundLog('ATTACK_GAIN', null, rpsWinner);
        setRecommendHand(rpsWinner === 'ME' ? 'ROCK' : 'PAPER');

        updateState({ 
          attacker: rpsWinner,
          phase: 'SELECTING',
          myHand: null,
          opponentHand: null,
          timeLeft: isBeginnerMode ? 10 : 5,
          roundMessage: rpsWinner === 'ME' ? '내 공격 시작' : '상대 공격 시작',
        });
      }
      return;
    }

    if (myHand === opponentHand) {
      if (attacker === 'ME') {
        audioManager.playSFX('round_win');
        appendRoundLog('POINT_ME', attacker, attacker);
        const nextScore = gameState.myScore + 1;
        const nextCombo = comboHits + 1;
        setComboHits(nextCombo);
        if (nextCombo >= 2) audioManager.playSFX('streak_up');
        if (nextScore >= 2) {
          setScreenCrack(true);
          window.setTimeout(() => setScreenCrack(false), 1200);
        }
        showCutIn({
          role: 'victory',
          title: nextScore >= 2 ? 'FINISH!' : 'POINT!',
          subtitle: nextScore >= 2 ? '결정타!' : nextCombo >= 2 ? `${nextCombo} HIT COMBO` : '승점 획득',
          tone: 'gold',
        });
        updateState({
          myScore: nextScore,
          phase: 'ROUND_RESULT',
          roundMessage: '이겼어요!',
        });
        triggerHaptic('success');
        updateDealer('congrats', '이겼어요!', true);
      } else {
        audioManager.playSFX('round_lose');
        appendRoundLog('POINT_OPPONENT', attacker, attacker);
        setComboHits(0);
        showCutIn({
          role: 'comfort',
          title: 'HIT',
          subtitle: '상대 승점 · 다음 라운드에 만회해요',
          tone: 'red',
        });
        updateState({
          opponentScore: gameState.opponentScore + 1,
          phase: 'ROUND_RESULT',
          roundMessage: '아쉬워요',
        });
        triggerHaptic('error');
        updateDealer('comfort', '아쉬워요. 다음 판!', true);
      }
    } else {
      const rpsWinner = getRpsWinner(myHand, opponentHand);
      flashNearMiss();
      if (rpsWinner === 'ME') {
        audioManager.playSFX('attack_move', { pan: -1 });
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
        audioManager.playSFX('attack_move', { pan: 1 });
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

  const isLastRound = gameState.myScore === 1 && gameState.opponentScore === 1;
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
  const strokeDashoffset = circumference - ((gameState.timeLeft / 5) * circumference);

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
              updateState({ phase: 'INIT' });
            }}
            reduceAnimations={gameSettings.options.performanceMode === 'low'}
            muteAudio={gameSettings.options.introMute}
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
          onExit={() => setShowExitModal(true)}
          onToggleMute={toggleMute}
          onInfo={() => { triggerHaptic('light'); setShowInfo(true); }}
          onSelectHand={(hand) => handleHandSelect(hand)}
          onToggleLayout={toggleBattleLayout}
          onSendEmote={handleSendReaction}
          emoteCooldownMs={reactionCooldown}
          floatingEmotes={floatingEmotes}
          habitHint={habitHint}
          myReaction={myReaction}
          opponentReaction={opponentReaction}
          tier={getTableTier(matchTable)}
          comboHits={comboHits}
          handSkinId={gameSettings.options.handSkinId}
        />
      ) : (
      <>
      {/* Background Ambience */}
      <div className={`absolute inset-0 z-0 transition-colors duration-1000 ${
        gameState.myScore === 1 && gameState.opponentScore === 1 
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

      <LastRoundNeon active={gameState.myScore === 1 && gameState.opponentScore === 1} />
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
      <header className="relative z-20 flex justify-between items-start p-4 w-full">
        <div className="flex gap-2">
          <button onClick={() => setShowExitModal(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5 -ml-1" />
          </button>
          <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <ConnectionBadge status={connStatus} />
          <div className="flex gap-2">
            <button 
              onClick={() => { triggerHaptic('light'); setShowInfo(true); }}
              className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-colors"
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
               <AnimatePresence>
                 {myReaction && <ReactionBubble reactionId={myReaction} isMe={true} />}
               </AnimatePresence>
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
           <div className={`relative w-20 h-20 flex items-center justify-center ${gameState.myScore === 1 && gameState.opponentScore === 1 ? 'scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''} transition-all`}>
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
               <AnimatePresence>
                 {opponentReaction && <ReactionBubble reactionId={opponentReaction} isMe={false} />}
               </AnimatePresence>
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
           gameState.myScore === 1 && gameState.opponentScore === 1 ? 'shadow-[0_0_50px_rgba(220,38,38,0.3)] border-red-900/40' : ''
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

        {/* 이모트 퀵바 — 손 선택 카드와 겹치지 않도록 패널 안 상단에 배치 */}
        <div className="flex justify-center mb-2.5">
          <div className="px-2 py-1 rounded-xl bg-black/40 border border-white/10">
            <EmoteQuickBar
              onSend={handleSendReaction}
              cooldownRemaining={reactionCooldown}
              className="gap-1 [&_button]:w-9 [&_button]:h-9"
            />
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
            const canSelect = canPickNow;
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
                  <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] mb-2">
                    VICTORY
                  </h1>
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
                  <h1 className="text-5xl font-black text-gray-500 mb-8">
                    DEFEAT
                  </h1>
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
                  <span className="text-white">1,000 P</span>
                </div>
                <div className="flex justify-between">
                  <span>운영 수수료</span>
                  <span className="text-arena-error">-100 P</span>
                </div>
                <div className="flex justify-between">
                  <span>승리 지급</span>
                  <span className="text-arena-gold font-bold">+1,900 P</span>
                </div>
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
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
      <HostessCutIn cut={cutIn} />
      {/* Duel layout also needs global dopamine overlays (mounted above for both) */}
      {isDuelLayout && (
        <>
          <SlowMoReveal active={isSpinning || gameState.phase === 'REVEAL'} snap={revealSnap} />
          <NearMissFlash open={nearMissFlash} />
          <ComboHitCounter hits={comboHits} />
          <ScreenCrack active={screenCrack} />
          <OnFireBadge streak={DEMO_USER.streak + gameState.myScore} show={DEMO_USER.streak + gameState.myScore >= 3} />
          <StreakFlameGrowth streak={DEMO_USER.streak + gameState.myScore} />
          <JackpotRoundBanner active={jackpotActive && gameState.phase !== 'GAME_OVER' && gameState.phase !== 'VS_INTRO'} />
          <CountdownUrgency timeLeft={gameState.timeLeft} active={canPickNow} />
          <PickBurst burstKey={pickBurstKey} />
          <MiniClashReplay
            playKey={miniReplayKey}
            myHand={gameState.myHand}
            opponentHand={gameState.opponentHand}
            skinId={gameSettings.options.handSkinId}
            comboBoost={comboHits}
          />
        </>
      )}
      {/* 이모트 퀵바가 양 레이아웃에 있어 플로팅 반응 버튼은 미사용 */}
      {!isDuelLayout && (
        <>
          <FloatingEmotesLayer emotes={floatingEmotes} />
          {habitHint && canPickNow && (
            <div className="fixed top-20 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
              <p className="text-[11px] font-bold text-arena-cyan bg-black/60 border border-arena-cyan/25 rounded-full px-3 py-1.5">
                힌트 · {habitHint}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
