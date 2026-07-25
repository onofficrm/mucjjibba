import { Link } from 'react-router-dom';
import type { BeadCell, RoadColumn, AttackRoadCell, TendencyMetrics } from '@/game/roadmap';
import type { Hand } from '@/types/gameLog';
import { analyzeMyRoadmap } from '@/game/roadmap';
import { listMatchHistory } from '@/services/history/matchHistoryStore';
import { useMemo } from 'react';

const HAND_KO: Record<Hand, string> = { ROCK: '묵', SCISSORS: '찌', PAPER: '빠' };
const HAND_EMOJI: Record<Hand, string> = { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' };
const HAND_COLOR: Record<Hand, string> = {
  ROCK: 'from-sky-500 to-blue-600',
  SCISSORS: 'from-emerald-400 to-teal-600',
  PAPER: 'from-amber-400 to-orange-500',
};

function BeadDot({ result, size = 'md' }: { result: BeadResultLike; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 md:w-4 md:h-4';
  return (
    <span
      className={`${dim} rounded-full border shrink-0 ${
        result === 'WIN'
          ? 'bg-arena-cyan border-cyan-200/40 shadow-[0_0_6px_rgba(34,211,238,0.45)]'
          : 'bg-rose-500 border-rose-200/30 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
      }`}
      title={result === 'WIN' ? '승' : '패'}
    />
  );
}

type BeadResultLike = 'WIN' | 'LOSE';

/** A — 구슬판 (6행) */
export function BeadPlate({
  grid,
  title = '구슬판',
  subtitle = '득점/승패 흐름',
}: {
  grid: (BeadCell | null)[][];
  title?: string;
  subtitle?: string;
}) {
  const hasAny = grid.some((row) => row.some(Boolean));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-display text-[10px] font-black text-arena-gold/85 tracking-[0.2em] uppercase">
          {title}
        </p>
        <p className="text-[10px] text-gray-500 font-bold">{subtitle}</p>
      </div>
      {!hasAny ? (
        <p className="text-xs text-gray-500 py-3">기록이 쌓이면 표시됩니다</p>
      ) : (
        <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-black/40 border border-white/8 overflow-x-auto max-w-full">
          {grid.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className="w-4 h-4 md:w-[18px] md:h-[18px] flex items-center justify-center"
                >
                  {cell ? <BeadDot result={cell.result} size="sm" /> : (
                    <span className="w-2.5 h-2.5 rounded-full bg-white/5" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-gray-500">
        <span className="flex items-center gap-1"><BeadDot result="WIN" size="sm" /> 승</span>
        <span className="flex items-center gap-1"><BeadDot result="LOSE" size="sm" /> 패</span>
      </div>
    </div>
  );
}

/** A — 대로 (연승/연패 열) */
export function BigRoad({
  columns,
  title = '대로',
  subtitle = '연속 흐름',
}: {
  columns: RoadColumn[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-display text-[10px] font-black text-arena-gold/85 tracking-[0.2em] uppercase">
          {title}
        </p>
        <p className="text-[10px] text-gray-500 font-bold">{subtitle}</p>
      </div>
      {columns.length === 0 ? (
        <p className="text-xs text-gray-500 py-3">기록이 쌓이면 표시됩니다</p>
      ) : (
        <div className="flex items-end gap-1 overflow-x-auto pb-1 max-w-full">
          {columns.map((col, i) => (
            <div key={i} className="flex flex-col-reverse gap-0.5 items-center min-w-[14px]">
              {Array.from({ length: Math.min(col.count, 8) }, (_, j) => (
                <BeadDot key={j} result={col.result} size="sm" />
              ))}
              {col.count > 8 && (
                <span className="text-[8px] font-black text-gray-500">+{col.count - 8}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** A — 공격권 로드 */
export function AttackRoad({
  cells,
  title = '공격권 로드',
}: {
  cells: AttackRoadCell[];
  title?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-display text-[10px] font-black text-arena-gold/85 tracking-[0.2em] uppercase">
          {title}
        </p>
        <p className="text-[10px] text-gray-500 font-bold">라운드별 보유자</p>
      </div>
      {cells.length === 0 ? (
        <p className="text-xs text-gray-500 py-3">라운드 데이터 없음</p>
      ) : (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`relative w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black border shrink-0 ${
                c.holder === 'ME'
                  ? 'bg-arena-cyan/20 border-arena-cyan/50 text-arena-cyan'
                  : c.holder === 'OPPONENT'
                    ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                    : 'bg-white/5 border-white/10 text-gray-500'
              }`}
              title={`R${i + 1} · ${c.holder === 'ME' ? '내 공격' : c.holder === 'OPPONENT' ? '상대 공격' : '미정'}`}
            >
              {c.holder === 'ME' ? '나' : c.holder === 'OPPONENT' ? '상' : '·'}
              {c.changed && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-arena-gold" />
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-[9px] text-gray-600 font-bold mt-1.5">골드 점 = 공격권 변동</p>
    </div>
  );
}

/** B — 손 성향 + 공격권 승률 */
export function HandTendencyPanel({
  metrics,
  compact = false,
}: {
  metrics: TendencyMetrics;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-[10px] font-black text-arena-gold/85 tracking-[0.2em] uppercase">
          Hand Tendency
        </p>
        {metrics.signatureHand && (
          <p className="text-[10px] font-black text-white">
            시그니처 {HAND_EMOJI[metrics.signatureHand]} {HAND_KO[metrics.signatureHand]}{' '}
            <span className="text-arena-gold">{metrics.signatureWinRate}%</span>
          </p>
        )}
      </div>

      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
        <div className="rounded-xl border border-white/8 bg-black/35 p-3">
          <p className="text-[10px] font-bold text-gray-500 mb-2">이긴 손 분포</p>
          <div className="space-y-2">
            {metrics.handWins.map((h) => (
              <div key={h.hand}>
                <div className="flex justify-between text-[11px] font-bold mb-0.5">
                  <span className="text-gray-300">
                    {HAND_EMOJI[h.hand]} {HAND_KO[h.hand]}
                  </span>
                  <span className="text-white tabular-nums">
                    {h.winRate}% <span className="text-gray-600">({h.wins}/{h.played})</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${HAND_COLOR[h.hand]}`}
                    style={{ width: `${Math.min(100, h.winRate)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/8 bg-black/35 p-3 flex flex-col justify-center gap-3">
          <div>
            <p className="text-[10px] font-bold text-gray-500">공격권 전환율</p>
            <p className="text-2xl font-black text-arena-cyan tabular-nums mt-0.5">
              {metrics.attackConvertPct}
              <span className="text-sm text-gray-500 font-bold ml-0.5">%</span>
            </p>
            <p className="text-[10px] text-gray-600 font-bold mt-0.5">
              공격 중 득점 {metrics.attackPoints}/{metrics.attackRounds}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/5 px-2.5 py-2">
              <p className="text-[9px] text-gray-500 font-bold">매치 승률</p>
              <p className="text-sm font-black text-white tabular-nums">{metrics.matchWinRate}%</p>
            </div>
            <div className="rounded-lg bg-white/5 px-2.5 py-2">
              <p className="text-[9px] text-gray-500 font-bold">공격권 탈환</p>
              <p className="text-sm font-black text-arena-gold tabular-nums">{metrics.steals}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 결과/분석용 풀 패널 */
export function MatchRoadmapPanel({
  grid,
  bigRoad,
  attackRoad,
  metrics,
}: {
  grid: (BeadCell | null)[][];
  bigRoad: RoadColumn[];
  attackRoad?: AttackRoadCell[];
  metrics: TendencyMetrics;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BeadPlate grid={grid} subtitle="이번 경기 득점" />
        <BigRoad columns={bigRoad} subtitle="연속 득점/실점" />
      </div>
      {attackRoad && <AttackRoad cells={attackRoad} />}
      <HandTendencyPanel metrics={metrics} compact />
    </div>
  );
}

/** 로비용 컴팩트 최근 승패 스트립 */
export function CompactRoadStrip() {
  const data = useMemo(() => analyzeMyRoadmap(listMatchHistory()), []);
  const beads = data.matchBeads.slice(0, 20);
  if (beads.length === 0) return null;

  const streak = (() => {
    if (beads.length === 0) return null;
    const first = beads[0].result;
    let n = 0;
    for (const b of beads) {
      if (b.result !== first) break;
      n += 1;
    }
    return { result: first, n };
  })();

  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/80 px-3.5 py-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-display text-[9px] font-black text-arena-gold/80 tracking-[0.22em] uppercase">
            Recent Road
          </p>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">
            최근 {beads.length}경기 · 승률 {data.tendency.matchWinRate}%
            {streak && streak.n >= 2 && (
              <span className={streak.result === 'WIN' ? ' text-arena-cyan' : ' text-rose-400'}>
                {' '}· {streak.n}{streak.result === 'WIN' ? '연승' : '연패'}
              </span>
            )}
          </p>
        </div>
        <Link
          to="/analysis"
          className="text-[10px] font-black text-arena-gold/90 hover:text-arena-gold shrink-0"
        >
          상세 →
        </Link>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {beads.map((b, i) => (
          <BeadDot key={i} result={b.result} size="md" />
        ))}
      </div>
      {data.tendency.signatureHand && (
        <p className="text-[10px] text-gray-500 font-bold mt-2">
          시그니처 {HAND_EMOJI[data.tendency.signatureHand]} {HAND_KO[data.tendency.signatureHand]}{' '}
          승률 {data.tendency.signatureWinRate}% · 공격권 전환 {data.tendency.attackConvertPct}%
        </p>
      )}
    </div>
  );
}
