import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Pause, Play, SkipForward, SkipBack, FastForward, Share2,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { getMatchLog } from '@/services/history/matchHistoryStore';
import { createSampleGameLog } from '@/game/sampleGameLog';
import { ShareCardModal } from '@/components/share/ShareCardModal';
import type { GameLog, RoundLog } from '@/types/gameLog';

const HAND_EMOJI = { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' } as const;

const RESULT_LABEL: Record<RoundLog['result'], string> = {
  POINT_ME: '내 득점',
  POINT_OPPONENT: '상대 득점',
  ATTACK_CHANGE: '공격권 교체',
  DRAW_RPS: '무승부',
  ATTACK_GAIN: '공격권 획득',
};

function scoreUpTo(log: GameLog, upToRound: number): { me: number; opp: number } {
  let me = 0;
  let opp = 0;
  for (const r of log.rounds) {
    if (r.round > upToRound) break;
    if (r.result === 'POINT_ME') me += 1;
    if (r.result === 'POINT_OPPONENT') opp += 1;
  }
  return { me, opp };
}

export function ReplayPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const log: GameLog = useMemo(() => {
    const fromState = location.state?.gameLog as GameLog | undefined;
    if (fromState?.rounds?.length) return fromState;
    if (id) {
      const stored = getMatchLog(id);
      if (stored) return stored;
    }
    return createSampleGameLog({ gameId: id || 'replay-demo', mode: 'REPLAY' });
  }, [id, location.state]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [showShare, setShowShare] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const round = log.rounds[index];
  const total = log.rounds.length;
  const score = scoreUpTo(log, round?.round ?? 0);
  const finished = index >= total - 1 && revealed;

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
    setPlaying(true);
  }, [log.gameId]);

  useEffect(() => {
    if (!playing || !round) return;
    setRevealed(false);
    const revealMs = 700 / speed;
    const nextMs = 1600 / speed;
    const t1 = window.setTimeout(() => setRevealed(true), revealMs);
    const t2 = window.setTimeout(() => {
      if (index < total - 1) {
        setIndex((i) => i + 1);
      } else {
        setPlaying(false);
      }
    }, nextMs);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [playing, index, speed, round, total]);

  const goPrev = () => {
    triggerHaptic('light');
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
    setRevealed(true);
  };

  const goNext = () => {
    triggerHaptic('light');
    setPlaying(false);
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setRevealed(true);
    } else {
      setRevealed(true);
    }
  };

  const cycleSpeed = () => {
    triggerHaptic('light');
    setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1));
  };

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-24 font-sans flex flex-col">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="ml-2">
            <h1 className="text-lg font-bold">리플레이</h1>
            <p className="text-[10px] text-arena-text-muted">
              vs {log.opponent.nickname} · Round {round?.round ?? 0}/{total}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-arena-gold/15 text-arena-gold border border-arena-gold/30">
          REPLAY
        </span>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full p-4 flex flex-col gap-6">
        <div className="flex items-center justify-between bg-arena-card border border-white/10 rounded-2xl px-6 py-5">
          <div className="text-center">
            <div className="text-2xl mb-1">{log.me.avatar}</div>
            <div className="text-xs text-arena-text-muted mb-1 truncate max-w-[100px]">{log.me.nickname}</div>
            <div className="text-3xl font-black text-arena-cyan">{score.me}</div>
          </div>
          <div className="text-arena-text-muted font-black">VS</div>
          <div className="text-center">
            <div className="text-2xl mb-1">{log.opponent.avatar}</div>
            <div className="text-xs text-arena-text-muted mb-1 truncate max-w-[100px]">{log.opponent.nickname}</div>
            <div className="text-3xl font-black text-arena-error">{score.opp}</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {round && (
            <motion.div
              key={`${round.round}-${revealed}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="bg-arena-card border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6"
            >
              <div className="text-xs font-bold text-arena-gold bg-arena-gold/10 px-3 py-1 rounded-full">
                Round {round.round}
              </div>
              <div className="flex items-center justify-center gap-10 w-full">
                <div className="text-center relative">
                  {round.attackerAfter === 'ME' && revealed && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-cyan text-black px-1.5 rounded">
                      ATTACK
                    </div>
                  )}
                  <div className="text-6xl">
                    {revealed ? HAND_EMOJI[round.myHand] : '❔'}
                  </div>
                  <div className="text-xs text-arena-text-muted mt-2">나</div>
                </div>
                <div className="text-white/20 font-bold text-sm">VS</div>
                <div className="text-center relative">
                  {round.attackerAfter === 'OPPONENT' && revealed && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-error text-white px-1.5 rounded">
                      ATTACK
                    </div>
                  )}
                  <div className="text-6xl">
                    {revealed ? HAND_EMOJI[round.opponentHand] : '❔'}
                  </div>
                  <div className="text-xs text-arena-text-muted mt-2">상대</div>
                </div>
              </div>
              <div
                className={`text-sm font-bold ${
                  revealed ? 'text-white' : 'text-arena-text-muted'
                }`}
              >
                {revealed ? RESULT_LABEL[round.result] : '선택 공개 중…'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <p className="text-lg font-black">
              {log.winner === 'ME' ? '승리 리플레이 완료' : log.winner === 'OPPONENT' ? '패배 리플레이 완료' : '리플레이 완료'}
            </p>
            <div className="flex gap-2 justify-center">
              <PrimaryButton
                className="px-5 py-3 text-sm"
                onClick={() => {
                  setIndex(0);
                  setRevealed(false);
                  setPlaying(true);
                }}
              >
                다시 보기
              </PrimaryButton>
              <SecondaryButton
                className="px-5 py-3 text-sm"
                onClick={() =>
                  navigate(`/game/${log.gameId}/result`, { state: { gameLog: log, winner: log.winner } })
                }
              >
                결과로
              </SecondaryButton>
            </div>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-arena-bg/95 border-t border-white/5 backdrop-blur-md pb-safe">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <button onClick={goPrev} className="p-3 rounded-xl bg-white/5 hover:bg-white/10" aria-label="이전">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              triggerHaptic('medium');
              setPlaying((p) => !p);
            }}
            className="p-4 rounded-2xl bg-arena-cyan text-black hover:bg-cyan-300"
            aria-label={playing ? '일시정지' : '재생'}
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={goNext} className="p-3 rounded-xl bg-white/5 hover:bg-white/10" aria-label="다음">
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={cycleSpeed}
            className="px-3 py-2 rounded-xl bg-white/5 text-xs font-bold flex items-center gap-1"
          >
            <FastForward className="w-4 h-4" /> {speed}x
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowShare(true);
            }}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10"
            aria-label="공유"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ShareCardModal open={showShare} log={log} onClose={() => setShowShare(false)} />
    </div>
  );
}
