import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Crown, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { GradeBadge, PointDisplay } from '@/components/common/Badges';
import { getRankingService } from '@/services/ranking';
import type { WeeklyLeaderboard } from '@/types/ranking';

export function RankingPage({ hideHeader }: { hideHeader?: boolean }) {
  const navigate = useNavigate();
  const [board, setBoard] = useState<WeeklyLeaderboard | null>(null);

  useEffect(() => {
    void getRankingService().getLeaderboard().then(setBoard);
  }, []);

  const delta = board?.me.deltaRank ?? 0;
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor =
    delta > 0 ? 'text-arena-success' : delta < 0 ? 'text-arena-error' : 'text-arena-text-muted';

  return (
    <div className={`${hideHeader ? '' : 'min-h-screen'} bg-arena-bg text-white pb-20 font-sans`}>
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2">주간 리그</h1>
        </header>
      )}

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {hideHeader && (
          <div className="space-y-1 px-1">
            <h2 className="text-xl font-black">주간 리그 랭킹</h2>
            <p className="text-sm text-arena-text-muted">이번 주 승점으로 순위를 겨룹니다.</p>
          </div>
        )}

        {board && (
          <>
            <div className="bg-arena-card border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-arena-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {board.meta.label}
                </span>
                <span className="font-mono text-[10px]">{board.meta.weekId}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-arena-text-muted mb-1">내 순위</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-arena-gold">{board.me.entry.rank}위</span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${deltaColor}`}>
                      <DeltaIcon className="w-3.5 h-3.5" />
                      {delta === 0 ? '변동 없음' : delta > 0 ? `${delta}↑` : `${Math.abs(delta)}↓`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <GradeBadge grade={String(board.me.entry.grade)} />
                  <div className="mt-2">
                    <PointDisplay points={board.me.entry.weeklyPoints} size="sm" />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-arena-text-muted border-t border-white/5 pt-2">
                {board.meta.rewardNote}
              </p>
            </div>

            <div className="space-y-2">
              {board.entries.slice(0, 15).map((entry, i) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 border ${
                    entry.isMe
                      ? 'bg-arena-cyan/10 border-arena-cyan/30'
                      : 'bg-arena-card border-white/5'
                  }`}
                >
                  <div
                    className={`w-8 text-center font-black text-sm ${
                      entry.rank <= 3 ? 'text-arena-gold' : 'text-arena-text-muted'
                    }`}
                  >
                    {entry.rank <= 3 ? <Crown className="w-4 h-4 mx-auto" /> : entry.rank}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-xl">
                    {entry.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm truncate">
                        {entry.nickname}
                        {entry.isMe ? ' (나)' : ''}
                      </span>
                      <GradeBadge grade={String(entry.grade)} className="shrink-0" />
                    </div>
                    <div className="text-[10px] text-arena-text-muted mt-0.5">
                      {entry.wins}승 {entry.losses}패
                      {entry.streak >= 2 ? ` · ${entry.streak}연승` : ''}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-white">
                      {entry.weeklyPoints.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-arena-gold">WP</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!board && (
          <div className="text-center text-arena-text-muted py-16 text-sm">랭킹을 불러오는 중…</div>
        )}
      </div>
    </div>
  );
}
