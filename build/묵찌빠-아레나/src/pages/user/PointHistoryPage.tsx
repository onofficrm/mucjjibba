import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Download, Filter } from 'lucide-react';
import { DEMO_USER } from '@/data/demoData';

type FilterType = 'all' | 'game' | 'win' | 'fee' | 'tournament' | 'admin' | 'refund';

const POINT_HISTORY = [
  { id: 'tx-1', date: '2023.10.25 15:30', type: 'win', title: '실버 테이블 승리', amount: 5000, balance: 125000, gameId: 'g-1234', status: 'completed' },
  { id: 'tx-2', date: '2023.10.25 15:20', type: 'game', title: '실버 테이블 참가', amount: -5000, balance: 120000, gameId: 'g-1234', status: 'completed' },
  { id: 'tx-3', date: '2023.10.25 14:00', type: 'tournament', title: '제 1회 하이롤러 우승 상금', amount: 700000, balance: 125000, gameId: 't-1', status: 'completed' },
  { id: 'tx-4', date: '2023.10.25 13:00', type: 'fee', title: '토너먼트 참가 수수료', amount: -10000, balance: 425000, gameId: 't-1', status: 'completed' },
  { id: 'tx-5', date: '2023.10.25 13:00', type: 'tournament', title: '토너먼트 참가', amount: -100000, balance: 435000, gameId: 't-1', status: 'completed' },
  { id: 'tx-6', date: '2023.10.24 18:20', type: 'refund', title: '매칭 취소 반환', amount: 1000, balance: 535000, gameId: 'g-1122', status: 'completed' },
  { id: 'tx-7', date: '2023.10.24 10:00', type: 'admin', title: '이벤트 포인트 지급', amount: 50000, balance: 534000, gameId: '-', status: 'completed' },
];

export function PointHistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredHistory = filter === 'all' ? POINT_HISTORY : POINT_HISTORY.filter(h => h.type === filter);

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black ml-2">포인트 이용 내역</h1>
        </div>
        <button className="text-arena-text-muted hover:text-white p-2">
          <Download className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Point Summary Info */}
        <section className="bg-arena-card border border-white/10 rounded-3xl p-6">
          <div className="text-center mb-6">
            <div className="text-sm text-arena-text-muted mb-2">현재 보유 포인트</div>
            <div className="text-4xl font-black text-arena-gold">{DEMO_USER.points.toLocaleString()} P</div>
          </div>
          
          <div className="space-y-3 bg-black/40 rounded-2xl p-4 border border-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-arena-text-muted">사용 가능 포인트</span>
              <span className="font-bold text-white">{(DEMO_USER.points - 15000).toLocaleString()} P</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-arena-text-muted flex items-center">
                게임 예치 중 <Info className="w-3 h-3 ml-1" />
              </span>
              <span className="font-bold text-white">15,000 P</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-arena-text-muted">지급 대기</span>
              <span className="font-bold text-arena-cyan">0 P</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-arena-text-muted">반환 처리 중</span>
              <span className="font-bold text-arena-error">0 P</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-arena-text-muted flex items-center">
              <Filter className="w-4 h-4 mr-2" /> 내역 필터
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {[
              { id: 'all', label: '전체' },
              { id: 'game', label: '참가' },
              { id: 'win', label: '승리' },
              { id: 'fee', label: '수수료' },
              { id: 'tournament', label: '토너먼트' },
              { id: 'admin', label: '관리자 조정' },
              { id: 'refund', label: '반환' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id as FilterType)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === f.id ? 'bg-arena-cyan text-black' : 'bg-white/5 text-arena-text-muted hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* History List */}
        <section className="space-y-3">
          {filteredHistory.length > 0 ? (
            filteredHistory.map(tx => (
              <div key={tx.id} className="bg-arena-card border border-white/10 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-[10px] text-arena-text-muted mb-1">{tx.date}</div>
                    <div className="font-bold text-sm text-white">{tx.title}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-lg ${tx.amount > 0 ? 'text-arena-gold' : 'text-arena-error'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-arena-text-muted mt-1">잔액: {tx.balance.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <div className="flex gap-3">
                    <span className="text-[10px] text-arena-text-muted">거래 ID: {tx.id}</span>
                    <span className="text-[10px] text-arena-text-muted">게임 ID: {tx.gameId}</span>
                  </div>
                  <button className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors">
                    상세
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-arena-card border border-white/10 rounded-2xl p-8 text-center text-sm text-arena-text-muted">
              조건에 맞는 내역이 없습니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
