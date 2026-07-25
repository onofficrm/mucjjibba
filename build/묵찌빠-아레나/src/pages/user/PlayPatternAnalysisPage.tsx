import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Brain,
  Lightbulb,
  BarChart2,
  Crosshair,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { listMatchHistory } from '@/services/history/matchHistoryStore';
import { analyzeMyPatterns } from '@/game/patternStats';
import { analyzeMyRoadmap } from '@/game/roadmap';
import { BeadPlate, BigRoad, HandTendencyPanel } from '@/components/stats/RoadmapPanel';
import { trackMission } from '@/services/mission';
import type { Hand } from '@/types/gameLog';

const HAND_COLORS: Record<Hand, string> = {
  ROCK: '#60a5fa',
  SCISSORS: '#34d399',
  PAPER: '#fbbf24',
};
const HAND_KO: Record<Hand, string> = { ROCK: '묵', SCISSORS: '찌', PAPER: '빠' };

function dominantLabel(counts: Record<Hand, number>): string {
  const total = counts.ROCK + counts.SCISSORS + counts.PAPER;
  if (total === 0) return '데이터 부족';
  let best: Hand = 'ROCK';
  let max = -1;
  (['ROCK', 'SCISSORS', 'PAPER'] as Hand[]).forEach((h) => {
    if (counts[h] > max) {
      max = counts[h];
      best = h;
    }
  });
  return `${HAND_KO[best]} (${Math.round((max / total) * 100)}%)`;
}

export function PlayPatternAnalysisPage() {
  const navigate = useNavigate();
  const logs = useMemo(() => listMatchHistory(), []);
  const pattern = useMemo(() => analyzeMyPatterns(logs), [logs]);
  const roadmap = useMemo(() => analyzeMyRoadmap(logs), [logs]);

  const wins = logs.filter((g) => g.winner === 'ME').length;
  const losses = logs.filter((g) => g.winner === 'OPPONENT').length;
  const total = logs.length;
  const winRate = total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : '-';
  const maxStreak = logs.reduce((m, g) => Math.max(m, g.currentStreakAfter ?? 0), 0);
  const currentStreak = logs[0]?.currentStreakAfter ?? 0;
  const avgTime =
    pattern.avgSelectMs > 0 ? `${(pattern.avgSelectMs / 1000).toFixed(1)}초` : '-';

  const handRatioData = (['ROCK', 'SCISSORS', 'PAPER'] as Hand[]).map((h) => ({
    name: HAND_KO[h],
    value: pattern.handRatioPct[h],
    color: HAND_COLORS[h],
  }));

  const situational = [
    {
      context: '첫 선택에서 주로',
      mostUsed: pattern.firstHandBias
        ? HAND_KO[pattern.firstHandBias]
        : '데이터 부족',
    },
    { context: '공격권을 잡았을 때', mostUsed: dominantLabel(pattern.whenAttacking) },
    { context: '수비 상황에서 주로', mostUsed: dominantLabel(pattern.whenDefending) },
    {
      context: '같은 손 반복 비율',
      mostUsed: `${Math.round(pattern.repeatRate * 100)}%`,
    },
  ];

  useEffect(() => {
    void trackMission('ANALYSIS_VIEWED');
  }, []);

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 font-sans">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2">플레이 패턴 분석</h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-arena-cyan/20 to-arena-bg border border-arena-cyan/30 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-arena-cyan/10 blur-[40px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-arena-cyan/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-arena-cyan" />
              </div>
              <span className="text-arena-cyan font-bold text-sm">
                {pattern.sampleRounds > 0 ? '기록 기반 분석' : '샘플 대기'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">{pattern.playTypeName}</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-6">{pattern.playTypeDescription}</p>

            <div className="space-y-3">
              <div className="bg-black/40 rounded-xl p-3">
                <div className="text-xs text-arena-success font-bold mb-1">장점</div>
                <ul className="text-sm text-white/90 list-disc list-inside space-y-1">
                  {pattern.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-black/40 rounded-xl p-3">
                <div className="text-xs text-arena-error font-bold mb-1">약점</div>
                <ul className="text-sm text-white/90 list-disc list-inside space-y-1">
                  {pattern.weaknesses.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-arena-gold/10 border border-arena-gold/20 rounded-xl p-3 flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-arena-gold shrink-0 mt-0.5" />
                <span className="text-xs text-arena-gold">{pattern.tip}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-arena-card border border-white/10 rounded-2xl p-5"
        >
          <h3 className="font-bold text-base text-white mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-arena-text-muted" />
            전체 전적 요약
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <span className="block text-xs text-arena-text-muted mb-1">기록 경기</span>
              <span className="block text-lg font-black text-white">{total}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <span className="block text-xs text-arena-text-muted mb-1">승리</span>
              <span className="block text-lg font-black text-arena-cyan">{wins}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <span className="block text-xs text-arena-text-muted mb-1">패배</span>
              <span className="block text-lg font-black text-arena-error">{losses}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">승률</span>
              <span className="font-bold text-white">{winRate}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">최고 연승</span>
              <span className="font-bold text-arena-gold">{maxStreak}연승</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">최근 연승</span>
              <span className="font-bold text-arena-warning">{currentStreak}연승</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">평균 선택</span>
              <span className="font-bold text-white">{avgTime}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 col-span-2">
              <span className="text-arena-text-muted">분석 라운드</span>
              <span className="font-bold text-arena-cyan">{pattern.sampleRounds}회</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-arena-card border border-white/10 rounded-2xl p-5 space-y-5"
        >
          <h3 className="font-bold text-base text-white flex items-center">
            <Crosshair className="w-5 h-5 mr-2 text-arena-gold" />
            로드맵 · 기준 지표
          </h3>
          <p className="text-[11px] text-gray-500 font-bold -mt-3">
            바카라식 구슬판/대로로 최근 흐름을 읽고, 손·공격권 승률을 기준으로 삼으세요
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BeadPlate grid={roadmap.matchGrid} subtitle="최근 매치 승패" />
            <BigRoad columns={roadmap.matchBigRoad} subtitle="연승·연패 열" />
          </div>
          <HandTendencyPanel metrics={roadmap.tendency} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-arena-card border border-white/10 rounded-2xl p-5"
        >
          <h3 className="font-bold text-base text-white mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-arena-text-muted" />
            선택 비율 (묵/찌/빠)
          </h3>
          <div className="h-48 w-full relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={handRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {handRatioData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1A1F2C', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 space-y-3">
              {handRatioData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white w-8">{item.name}</span>
                  <span className="text-arena-text-muted font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-arena-card border border-white/10 rounded-2xl p-5"
        >
          <h3 className="font-bold text-base text-white mb-4 flex items-center">
            <Crosshair className="w-5 h-5 mr-2 text-arena-text-muted" />
            상황별 패턴 분석
          </h3>
          <div className="space-y-3">
            {situational.map((row) => (
              <div key={row.context} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <span className="text-sm text-arena-text-muted">{row.context}</span>
                <span className="text-sm font-bold text-white">{row.mostUsed}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-arena-card border border-white/10 rounded-2xl p-5"
        >
          <h3 className="font-bold text-base text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-arena-text-muted" />
            주요 인사이트
          </h3>
          <div className="space-y-3">
            {pattern.topHints.map((insight) => (
              <div
                key={insight}
                className="flex items-start space-x-3 text-sm text-white/90 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5"
              >
                <div className="w-1.5 h-1.5 bg-arena-cyan rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
