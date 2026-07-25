import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Frown, Clock, X, Swords, Play } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { trackMission } from '@/services/mission';
import {
  listMatchHistory,
  relativeTimeLabel,
  tableLabelForMode,
} from '@/services/history/matchHistoryStore';
import type { GameLog, RoundLog } from '@/types/gameLog';
import { triggerHaptic } from '@/utils/haptics';

const HAND_LABELS = {
  ROCK: '✊',
  SCISSORS: '✌️',
  PAPER: '🖐️',
} as const;

const RESULT_KO: Record<RoundLog['result'], string> = {
  POINT_ME: '승리 (1점 획득)',
  POINT_OPPONENT: '패배 (상대 1점)',
  ATTACK_CHANGE: '공격권 교체',
  DRAW_RPS: '무승부',
  ATTACK_GAIN: '공격권 획득',
};

export function MatchHistoryPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [selected, setSelected] = useState<GameLog | null>(null);

  useEffect(() => {
    void trackMission('MATCH_HISTORY_VIEWED');
    setLogs(listMatchHistory());
  }, []);

  const rows = useMemo(
    () =>
      logs.map((log) => ({
        log,
        isWin: log.winner === 'ME',
        score: `${log.myScore}:${log.opponentScore}`,
        time: relativeTimeLabel(log.endedAt),
        table: tableLabelForMode(log.mode),
      })),
    [logs],
  );

  const openReplay = (log: GameLog) => {
    triggerHaptic('medium');
    navigate(`/replay/${log.gameId}`, { state: { gameLog: log } });
  };

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 font-sans relative">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2">경기 기록</h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {rows.map(({ log, isWin, score, time, table }) => (
          <motion.div
            key={log.gameId}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`bg-arena-card border rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors ${
              isWin ? 'border-arena-cyan/20' : 'border-arena-error/20'
            }`}
            onClick={() => setSelected(log)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isWin
                      ? 'bg-arena-cyan/10 border-arena-cyan/30 text-arena-cyan'
                      : 'bg-arena-error/10 border-arena-error/30 text-arena-error'
                  }`}
                >
                  {isWin ? <Trophy className="w-5 h-5" /> : <Frown className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {log.opponent.nickname}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-arena-text-muted">
                      {log.opponent.grade}
                    </span>
                  </div>
                  <div className="text-xs text-arena-text-muted flex items-center gap-2 mt-0.5">
                    <span>{table}</span>
                    <span>•</span>
                    <span>{time}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-black ${isWin ? 'text-arena-cyan' : 'text-arena-error'}`}>
                  {isWin ? '승리' : '패배'}
                </div>
                <div className="text-xs font-bold text-white tracking-widest">{score}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-sm">
              <div className="flex items-center space-x-2 text-arena-text-muted">
                <Swords className="w-4 h-4" />
                <span>{log.rounds.length}라운드</span>
              </div>
              <button
                className="text-xs font-bold text-arena-cyan bg-arena-cyan/10 px-3 py-1.5 rounded-lg hover:bg-arena-cyan/20 transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  openReplay(log);
                }}
              >
                <Play className="w-3.5 h-3.5" /> 리플레이
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-arena-card border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white">경기 상세 정보</h3>
                <button onClick={() => setSelected(null)} className="p-2 -mr-2 text-arena-text-muted hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <div className="flex justify-between items-center bg-black/30 p-4 rounded-2xl mb-4">
                  <div className="text-center w-1/3">
                    <div className="text-sm font-bold text-white mb-1">나</div>
                    <div className={`text-2xl font-black ${selected.winner === 'ME' ? 'text-arena-cyan' : 'text-white'}`}>
                      {selected.myScore}
                    </div>
                  </div>
                  <div className="text-xl font-black text-arena-text-muted">VS</div>
                  <div className="text-center w-1/3">
                    <div className="text-sm font-bold text-white mb-1">{selected.opponent.nickname}</div>
                    <div className={`text-2xl font-black ${selected.winner === 'OPPONENT' ? 'text-arena-error' : 'text-white'}`}>
                      {selected.opponentScore}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <PrimaryButton className="flex-1 py-3 text-sm" onClick={() => openReplay(selected)}>
                    <span className="flex items-center justify-center gap-1.5">
                      <Play className="w-4 h-4" /> 리플레이
                    </span>
                  </PrimaryButton>
                  <SecondaryButton
                    className="flex-1 py-3 text-sm"
                    onClick={() =>
                      navigate(`/game/${selected.gameId}/result`, {
                        state: { gameLog: selected, winner: selected.winner },
                      })
                    }
                  >
                    결과 보기
                  </SecondaryButton>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-arena-text-muted flex items-center mb-2">
                    <Clock className="w-4 h-4 mr-2" /> 라운드별 상세 내역
                  </h4>
                  {selected.rounds.map((round) => (
                    <div key={round.round} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-arena-gold bg-arena-gold/10 px-2 py-0.5 rounded">
                          Round {round.round}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            round.result === 'POINT_ME'
                              ? 'text-arena-cyan'
                              : round.result === 'POINT_OPPONENT'
                                ? 'text-arena-error'
                                : 'text-white'
                          }`}
                        >
                          {RESULT_KO[round.result]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-center w-1/3 relative">
                          {round.attackerAfter === 'ME' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-cyan text-black px-1 rounded">
                              ATTACK
                            </div>
                          )}
                          <div className="text-3xl mb-1">{HAND_LABELS[round.myHand]}</div>
                          <div className="text-[10px] text-arena-text-muted">
                            {(round.selectDurationMs / 1000).toFixed(1)}s
                          </div>
                        </div>
                        <div className="text-xs text-white/30 font-bold">VS</div>
                        <div className="text-center w-1/3 relative">
                          {round.attackerAfter === 'OPPONENT' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black bg-arena-error text-white px-1 rounded">
                              ATTACK
                            </div>
                          )}
                          <div className="text-3xl mb-1">{HAND_LABELS[round.opponentHand]}</div>
                          <div className="text-[10px] text-arena-text-muted">상대</div>
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
