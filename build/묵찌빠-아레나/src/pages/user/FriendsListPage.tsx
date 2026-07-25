import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, UserPlus, ShieldAlert, Check, X, UserMinus, Search } from 'lucide-react';

type FriendTab = 'list' | 'requests' | 'recent' | 'blocked';

const FRIENDS = [
  { id: 'f-1', nickname: 'GHOST***', grade: '다이아', status: 'online', avatar: '👻' },
  { id: 'f-2', nickname: 'TIGER_88', grade: '플래티넘', status: 'playing', avatar: '🐯' },
  { id: 'f-3', nickname: 'KING_MAKER', grade: '마스터', status: 'offline', avatar: '👑', lastSeen: '2시간 전' },
];

const REQUESTS = [
  { id: 'r-1', nickname: 'BEGINNER', grade: '브론즈', type: 'received', avatar: '🐣', date: '오늘 12:00' },
  { id: 'r-2', nickname: 'SHADOW_M', grade: '다이아', type: 'sent', avatar: '🌑', date: '어제 15:30' },
];

export function FriendsListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FriendTab>('list');

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black ml-2">친구 관리</h1>
        </div>
        <button className="text-arena-text-muted hover:text-white p-2">
          <UserPlus className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Search */}
        <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center">
          <Search className="w-5 h-5 text-arena-text-muted mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="닉네임으로 검색" 
            className="w-full bg-transparent border-none outline-none text-sm text-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1">
          {[
            { id: 'list', label: '친구 목록' },
            { id: 'requests', label: '요청 (1)' },
            { id: 'recent', label: '최근 대전' },
            { id: 'blocked', label: '차단' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id as FriendTab)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                tab === t.id ? 'bg-arena-cyan text-black' : 'text-arena-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="space-y-3">
          {tab === 'list' && FRIENDS.map(f => (
            <div key={f.id} className="bg-arena-card border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-xl border border-white/5">
                    {f.avatar}
                  </div>
                  {f.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-arena-success rounded-full border-2 border-arena-bg" />}
                  {f.status === 'playing' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-arena-error rounded-full border-2 border-arena-bg" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    {f.nickname}
                    <span className="text-[9px] bg-white/10 text-arena-text-muted px-1 rounded">{f.grade}</span>
                  </div>
                  <div className={`text-xs mt-0.5 ${f.status === 'online' ? 'text-arena-success' : f.status === 'playing' ? 'text-arena-error' : 'text-arena-text-muted'}`}>
                    {f.status === 'online' ? '접속 중' : f.status === 'playing' ? '게임 중' : f.lastSeen}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-arena-text-muted">
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {tab === 'requests' && REQUESTS.map(r => (
            <div key={r.id} className="bg-arena-card border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-xl border border-white/5">
                  {r.avatar}
                </div>
                <div>
                  <div className="text-[10px] text-arena-text-muted mb-0.5">{r.type === 'received' ? '받은 요청' : '보낸 요청'} ({r.date})</div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    {r.nickname}
                    <span className="text-[9px] bg-white/10 text-arena-text-muted px-1 rounded">{r.grade}</span>
                  </div>
                </div>
              </div>
              {r.type === 'received' ? (
                <div className="flex gap-2">
                  <button className="p-2 bg-arena-success/20 hover:bg-arena-success/30 text-arena-success rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/5 hover:bg-white/10 text-arena-text-muted rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button className="text-xs text-arena-text-muted bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10">
                  취소
                </button>
              )}
            </div>
          ))}

          {tab === 'recent' && (
            <div className="bg-arena-card border border-white/10 rounded-2xl p-8 text-center text-sm text-arena-text-muted">
              최근 대전 상대가 없습니다.
            </div>
          )}

          {tab === 'blocked' && (
            <div className="bg-arena-card border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center text-sm text-arena-text-muted">
              <ShieldAlert className="w-8 h-8 opacity-20 mb-3" />
              차단된 사용자가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
