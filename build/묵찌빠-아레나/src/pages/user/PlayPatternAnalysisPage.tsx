import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Brain, Target, Zap, Activity, Clock, Crosshair, BarChart2, Lightbulb } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const DEMO_STATS = {
  totalMatches: 128,
  wins: 76,
  losses: 52,
  winRate: '59.4%',
  maxStreak: 8,
  currentStreak: 3,
  avgTime: '1.8초',
  attackAcquisitionRate: '62%',
  attackSuccessRate: '55%'
};

const HAND_RATIO_DATA = [
  { name: '묵', value: 45, color: '#60a5fa' }, // blue
  { name: '찌', value: 25, color: '#34d399' }, // green
  { name: '빠', value: 30, color: '#fbbf24' } // orange
];

const PATTERN_ANALYSIS = [
  { context: '첫 선택에서 주로', mostUsed: '묵 (48%)' },
  { context: '공격권을 잡았을 때', mostUsed: '빠 (55%)' },
  { context: '수비 상황에서 주로', mostUsed: '찌 (42%)' },
  { context: '연속 패배 후에는', mostUsed: '묵 (60%)' },
  { context: '시간이 3초 이하일 때', mostUsed: '찌 (70%)' },
  { context: '상대가 묵을 낸 다음', mostUsed: '빠 (58%)' },
  { context: '같은 손 반복 비율', mostUsed: '15%' },
];

const PLAY_TYPE = {
  name: '역심리형',
  description: '상대의 예상을 깨는 변칙적인 플레이를 선호합니다. 특히 불리한 상황에서 과감한 선택으로 흐름을 뒤집는 능력이 뛰어납니다.',
  strengths: ['위기 상황에서의 높은 승률', '패턴이 잘 읽히지 않음'],
  weaknesses: ['초반 라운드 실점률이 높음', '안정성이 다소 떨어짐'],
  tips: '안정적인 첫 라운드 운영을 연습하면 더 높은 승률을 기대할 수 있습니다.'
};

const INSIGHTS = [
  "공격권을 잡은 후 묵을 선택하는 비율이 높습니다.",
  "선택 시간이 짧을 때 찌를 자주 사용합니다.",
  "같은 손을 두 번 연속 선택하는 경향이 있습니다.",
  "최근 10경기에서 수비 상황의 승률이 상승했습니다."
];

export function PlayPatternAnalysisPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 font-sans">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2">플레이 패턴 분석</h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* Play Type Card */}
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
              <span className="text-arena-cyan font-bold text-sm">AI 분석 완료</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">{PLAY_TYPE.name}</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-6">
              {PLAY_TYPE.description}
            </p>
            
            <div className="space-y-3">
              <div className="bg-black/40 rounded-xl p-3">
                <div className="text-xs text-arena-success font-bold mb-1">장점</div>
                <ul className="text-sm text-white/90 list-disc list-inside space-y-1">
                  {PLAY_TYPE.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="bg-black/40 rounded-xl p-3">
                <div className="text-xs text-arena-error font-bold mb-1">약점</div>
                <ul className="text-sm text-white/90 list-disc list-inside space-y-1">
                  {PLAY_TYPE.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="bg-arena-gold/10 border border-arena-gold/20 rounded-xl p-3 flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-arena-gold shrink-0 mt-0.5" />
                <span className="text-xs text-arena-gold">{PLAY_TYPE.tips}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overall Stats */}
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
              <span className="block text-xs text-arena-text-muted mb-1">전체 경기</span>
              <span className="block text-lg font-black text-white">{DEMO_STATS.totalMatches}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <span className="block text-xs text-arena-text-muted mb-1">승리</span>
              <span className="block text-lg font-black text-arena-cyan">{DEMO_STATS.wins}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <span className="block text-xs text-arena-text-muted mb-1">패배</span>
              <span className="block text-lg font-black text-arena-error">{DEMO_STATS.losses}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">승률</span>
              <span className="font-bold text-white">{DEMO_STATS.winRate}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">최고 연승</span>
              <span className="font-bold text-arena-gold">{DEMO_STATS.maxStreak}연승</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">현재 연승</span>
              <span className="font-bold text-arena-warning">{DEMO_STATS.currentStreak}연승</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">평균 선택 시간</span>
              <span className="font-bold text-white">{DEMO_STATS.avgTime}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">공격권 획득률</span>
              <span className="font-bold text-arena-cyan">{DEMO_STATS.attackAcquisitionRate}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-arena-text-muted">공격 성공률</span>
              <span className="font-bold text-arena-cyan">{DEMO_STATS.attackSuccessRate}</span>
            </div>
          </div>
        </motion.div>

        {/* Hand Choice Ratio */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-arena-card border border-white/10 rounded-2xl p-5"
        >
          <h3 className="font-bold text-base text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-arena-text-muted" />
            선택 비율 (묵/찌/빠)
          </h3>
          <div className="h-48 w-full relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={HAND_RATIO_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {HAND_RATIO_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1A1F2C', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 space-y-3">
              {HAND_RATIO_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white w-8">{item.name}</span>
                  <span className="text-arena-text-muted font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Situational Patterns */}
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
            {PATTERN_ANALYSIS.map((pattern, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <span className="text-sm text-arena-text-muted">{pattern.context}</span>
                <span className="text-sm font-bold text-white">{pattern.mostUsed}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
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
            {INSIGHTS.map((insight, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-sm text-white/90 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
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
