import React from 'react';
import { Trophy, Clock, Swords } from 'lucide-react';
import { DEMO_USER } from '@/data/demoData';
import { gameSettings } from '@/utils/gameSettings';
import { getCharacterEmoji } from '@/data/decorations';

export function MyPage() {
  return (
    <div className="bg-arena-bg text-white pb-10">
      <div className="max-w-xl mx-auto p-5 space-y-6">
        {/* Profile Card */}
        <div className="bg-arena-card border border-white/10 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-arena-card-hover border border-arena-cyan/30 flex items-center justify-center text-3xl">
              {getCharacterEmoji(gameSettings.options.characterId)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{DEMO_USER.nickname}</h2>
              <div className="text-sm font-bold text-arena-cyan mt-1">{DEMO_USER.grade}</div>
            </div>
          </div>
        </div>

        {/* Core Stats (Simplified) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-arena-card border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-arena-text-muted mb-1">보유 포인트</span>
            <span className="text-2xl font-black text-arena-gold">{DEMO_USER.points.toLocaleString()} P</span>
          </div>
          <div className="bg-arena-card border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-arena-text-muted mb-1">전체 승률</span>
            <span className="text-2xl font-black text-arena-cyan">62.2%</span>
          </div>
        </div>

        {/* Recent Matches (Simplified list) */}
        <div className="bg-arena-card border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">최근 경기</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 1, result: '승리', opponent: 'TIGER_88', score: '3:1', time: '10분 전', point: '+1,900', isWin: true },
              { id: 2, result: '패배', opponent: 'KING_MAKER', score: '2:3', time: '1시간 전', point: '-1,000', isWin: false },
              { id: 3, result: '승리', opponent: 'BEGINNER', score: '3:0', time: '어제', point: '+1,900', isWin: true },
            ].map((match) => (
              <div key={match.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${match.isWin ? 'bg-arena-cyan/20 text-arena-cyan' : 'bg-arena-error/20 text-arena-error'}`}>
                    {match.isWin ? <Trophy className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-white mb-0.5">{match.opponent}</div>
                    <div className="text-xs text-arena-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {match.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-black text-lg ${match.isWin ? 'text-arena-cyan' : 'text-arena-error'}`}>
                    {match.result}
                  </div>
                  <div className="text-sm font-bold text-white opacity-80">{match.point} P</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
