import React from 'react';
import type { ShareCardData } from '@/types/gameLog';

export function ShareCard({ data }: { data: ShareCardData }) {
  const isVictory = data.resultLabel === 'VICTORY';
  return (
    <div
      data-testid="share-card"
      className="w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden border border-arena-gold/40 bg-gradient-to-b from-[#1a1520] via-[#0A0E17] to-black shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col relative"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.18),_transparent_55%)]" />

      <div className="relative px-5 pt-6 pb-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-arena-gold/20 border border-arena-gold/40 flex items-center justify-center text-sm">
            ✊
          </div>
          <span className="text-sm font-black tracking-wide text-arena-gold">{data.logoText}</span>
        </div>
        <span className="text-[10px] text-gray-500 font-bold">{data.playedAt}</span>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        {data.resultLabel && (
          <p
            className={`font-display text-[13px] font-black tracking-[0.3em] mb-3 ${
              isVictory ? 'text-engraved-gold' : 'text-gray-400'
            }`}
          >
            {data.resultLabel}
          </p>
        )}

        {data.showProfileImage ? (
          <div className="text-6xl mb-3 drop-shadow-lg">{data.characterEmoji}</div>
        ) : (
          <div className="w-16 h-16 mb-3 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-gray-500">
            ?
          </div>
        )}
        <p className="text-xs text-gray-400 font-bold mb-0.5">{data.myNickname}</p>
        <p className="text-[10px] text-arena-cyan font-black mb-1">{data.grade}</p>
        {(data.tableName || data.modeLabel) && (
          <p className="text-[10px] text-gray-500 font-bold mb-3">
            {[data.modeLabel, data.tableName].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="text-5xl font-black tracking-tighter mb-2">
          <span className={isVictory ? 'text-arena-gold' : 'text-white'}>{data.myScore}</span>
          <span className="text-gray-600 mx-2">:</span>
          <span className="text-gray-300">{data.opponentScore}</span>
        </div>
        <p className="text-[10px] text-gray-500 mb-5">vs {data.opponentNickname}</p>

        <div className="w-full rounded-2xl border border-arena-gold/35 bg-gradient-to-br from-arena-gold/15 to-transparent px-4 py-3.5 mb-4">
          <p className="font-display text-[10px] text-arena-gold/80 font-bold uppercase tracking-[0.25em] mb-1">
            Highlight
          </p>
          <p className="text-base font-black text-white leading-snug">{data.highlightText}</p>
          {data.highlightDetail && (
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{data.highlightDetail}</p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white">
            {data.streak}연승
          </span>
          {data.showPoints && data.pointsDeltaLabel && (
            <span className="px-3 py-1.5 rounded-full bg-arena-gold/10 border border-arena-gold/30 text-arena-gold">
              {data.pointsDeltaLabel}
            </span>
          )}
        </div>
      </div>

      <div className="relative px-5 py-4 border-t border-white/5 text-[10px] text-gray-600 text-center font-bold">
        데모용 하이라이트 카드 · 외부 공유 API 미연동
      </div>
    </div>
  );
}
