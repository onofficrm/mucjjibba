import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, Swords, Users, Trophy } from 'lucide-react';
import { createSampleGameLog } from '@/game/sampleGameLog';
import { toBroadcastPublicDTO } from '@/game/broadcastDto';
import type { BroadcastGamePublicDTO } from '@/types/broadcast';
import { gameSettings } from '@/utils/gameSettings';

const HAND = { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' };

/**
 * 읽기 전용 방송 화면 — 조작 UI 없음, 공개 DTO만 사용
 * 경로: #/broadcast/game/:gameId?ratio=16x9|9x16
 */
export function BroadcastPage() {
  const { gameId } = useParams();
  const [params, setParams] = useSearchParams();
  const ratio = params.get('ratio') === '9x16' ? '9x16' : '16x9';
  const [dto, setDto] = useState<BroadcastGamePublicDTO | null>(null);

  useEffect(() => {
    const log = createSampleGameLog({
      gameId: gameId || 'broadcast-demo',
      mode: gameId?.includes('tournament') ? 'TOURNAMENT' : 'LIVE',
      isTournamentFinal: !!gameId?.includes('final'),
      winner: null,
      myScore: 1,
      opponentScore: 1,
      source: 'mock',
    });
    setDto(
      toBroadcastPublicDTO(log, {
        status: 'IN_PROGRESS',
        spectatorCount: 256,
        nextChallengerName: 'CHALLENGER_07',
      }),
    );
  }, [gameId]);

  const frameClass = useMemo(() => {
    if (ratio === '9x16') {
      return 'w-full max-w-[420px] aspect-[9/16]';
    }
    return 'w-full max-w-5xl aspect-video';
  }, [ratio]);

  if (!dto) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">방송 준비 중…</div>;
  }

  const reduce = gameSettings.shouldReduceAnimations() || gameSettings.options.performanceMode === 'low';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-3 md:p-6 font-sans">
      <div className="w-full max-w-5xl flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-black text-arena-gold">
          <Swords className="w-4 h-4" /> 묵찌빠 아레나 · BROADCAST
        </div>
        <div className="flex gap-2">
          {(['16x9', '9x16'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setParams({ ratio: r })}
              className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                ratio === r ? 'bg-arena-cyan text-black border-arena-cyan' : 'border-white/20 text-gray-400'
              }`}
            >
              {r === '16x9' ? '16:9' : '9:16'}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout={!reduce}
        className={`${frameClass} relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#111827] to-black shadow-2xl`}
      >
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <span
            className={`px-2 py-1 rounded text-[10px] font-black ${
              dto.mode === 'AI_DEMO'
                ? 'bg-arena-cyan/20 text-arena-cyan'
                : dto.mode === 'REPLAY'
                  ? 'bg-white/10 text-gray-300'
                  : 'bg-red-500/20 text-red-400'
            }`}
          >
            {dto.mode}
          </span>
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-300">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {dto.spectatorCount}
            </span>
            {dto.tournament.active && (
              <span className="flex items-center gap-1 text-purple-300">
                <Trophy className="w-3.5 h-3.5" /> {dto.tournament.roundLabel}
              </span>
            )}
          </div>
        </div>

        <div className="h-full flex flex-col items-center justify-center px-4 md:px-10">
          <div className="w-full flex items-center justify-between gap-2 md:gap-8 mb-6">
            <PlayerBlock player={dto.player1} side="P1" isAttacker={dto.attacker === 'P1'} />
            <div className="text-center shrink-0">
              <div className={`font-black tracking-tighter ${ratio === '9x16' ? 'text-5xl' : 'text-6xl md:text-7xl'}`}>
                {dto.player1.score}
                <span className="text-gray-600 mx-2">:</span>
                {dto.player2.score}
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-2">공격권 {dto.attacker ?? '-'}</p>
            </div>
            <PlayerBlock player={dto.player2} side="P2" isAttacker={dto.attacker === 'P2'} />
          </div>

          <div className="flex items-center gap-6 md:gap-10 mb-6">
            <HandShow label="P1" hand={dto.lastReveal.p1Hand} />
            <div className="text-xs font-black text-arena-gold">{dto.lastReveal.message}</div>
            <HandShow label="P2" hand={dto.lastReveal.p2Hand} />
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-[10px] font-bold">
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              P1 연승 {dto.player1.winStreak}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
              <Users className="w-3 h-3" /> 다음 도전자 {dto.nextChallengerName ?? '-'}
            </span>
            {dto.tournament.active && (
              <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                토너먼트 {dto.tournament.statusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="absolute bottom-2 inset-x-0 text-center text-[9px] text-gray-600 font-bold">
          READ-ONLY · 이메일/회원ID/IP/기기/포인트거래/관리자정보 비표시
        </div>
      </motion.div>
    </div>
  );
}

function PlayerBlock({
  player,
  side,
  isAttacker,
}: {
  player: BroadcastGamePublicDTO['player1'];
  side: string;
  isAttacker: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-0 text-center rounded-2xl border p-3 ${
        isAttacker ? 'border-arena-gold/50 bg-arena-gold/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="text-3xl md:text-4xl mb-1">{player.avatarEmoji}</div>
      <p className="text-xs md:text-sm font-black truncate">{player.displayName}</p>
      <p className="text-[10px] text-gray-400 font-bold">
        {side} · {player.grade}
      </p>
    </div>
  );
}

function HandShow({
  label,
  hand,
}: {
  label: string;
  hand: 'ROCK' | 'SCISSORS' | 'PAPER' | null;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-5xl mb-1">{hand ? HAND[hand] : '❔'}</div>
      <p className="text-[10px] text-gray-500 font-bold">{label}</p>
    </div>
  );
}
