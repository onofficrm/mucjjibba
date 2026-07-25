import React, { useState } from 'react';
import { TournamentListPage } from '../tournament/TournamentListPage';
import { RankingPage } from '../UserPages';
import { triggerHaptic } from '@/utils/haptics';
import { Eye } from 'lucide-react';

type Tab = 'tournament' | 'ranking' | 'spectate';

export function CompetitionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tournament');

  const tabs = [
    { id: 'tournament', label: '토너먼트' },
    { id: 'ranking', label: '랭킹' },
    { id: 'spectate', label: '관전' },
  ] as const;

  return (
    <div className="bg-arena-bg text-white h-full flex flex-col font-sans">
      <div className="flex bg-white/5 p-1 rounded-2xl m-4 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic('light');
              setActiveTab(tab.id);
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-arena-card shadow-sm text-white' 
                : 'text-arena-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tournament' && (
          <div className="pb-10">
            <TournamentListPage hideHeader />
          </div>
        )}
        
        {activeTab === 'ranking' && (
          <div className="pb-10">
            <RankingPage hideHeader />
          </div>
        )}

        {activeTab === 'spectate' && (
          <div className="p-8 flex flex-col items-center justify-center text-center h-full opacity-60">
            <Eye className="w-16 h-16 mb-4 text-gray-500" />
            <h3 className="text-xl font-bold mb-2">현재 진행 중인 경기가 없습니다</h3>
            <p className="text-sm text-gray-400">나중에 다시 확인해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
