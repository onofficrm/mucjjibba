import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, ShieldAlert, Info, Clock, Calendar, Lock } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';

export function UsageLimitsPage() {
  const navigate = useNavigate();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [limits, setLimits] = useState({
    dailyLimit: 500000,
    weeklyLimit: 2000000,
    playTimeAlert: 60,
    breakAlert: true,
    selfExclusion: 0,
  });

  const handleSave = () => {
    setShowConfirm(true);
  };

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black ml-2">책임 있는 이용 설정</h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        <div className="bg-arena-error/10 border border-arena-error/30 rounded-2xl p-4 flex gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-arena-error shrink-0" />
          <div className="text-arena-error/90 leading-relaxed">
            건전한 게임 이용을 위해 사용자 스스로 제한을 설정할 수 있습니다. 
            <strong className="block mt-1">설정한 제한은 7일간 즉시 해제할 수 없습니다.</strong>
          </div>
        </div>

        {/* Limits Setting */}
        <section className="bg-arena-card border border-white/10 rounded-2xl p-5 space-y-6">
          
          {/* Point Limits */}
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-arena-text-muted" /> 참가 포인트 한도 설정
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs text-arena-text-muted">일일 한도</label>
              <select 
                value={limits.dailyLimit}
                onChange={e => setLimits({...limits, dailyLimit: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none"
              >
                <option value={100000}>100,000 P</option>
                <option value={500000}>500,000 P</option>
                <option value={1000000}>1,000,000 P</option>
                <option value={0}>제한 없음</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-arena-text-muted">주간 한도</label>
              <select 
                value={limits.weeklyLimit}
                onChange={e => setLimits({...limits, weeklyLimit: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none"
              >
                <option value={500000}>500,000 P</option>
                <option value={2000000}>2,000,000 P</option>
                <option value={5000000}>5,000,000 P</option>
                <option value={0}>제한 없음</option>
              </select>
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Time Alerts */}
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-arena-text-muted" /> 플레이 시간 알림
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs text-arena-text-muted">연속 플레이 시간 알림</label>
              <select 
                value={limits.playTimeAlert}
                onChange={e => setLimits({...limits, playTimeAlert: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none"
              >
                <option value={30}>30분마다</option>
                <option value={60}>1시간마다</option>
                <option value={120}>2시간마다</option>
                <option value={0}>사용 안 함</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between bg-black/40 border border-white/10 p-4 rounded-xl">
              <div className="text-sm">휴식 권고 알림</div>
              <button 
                onClick={() => setLimits({...limits, breakAlert: !limits.breakAlert})} 
                className={`w-12 h-7 rounded-full transition-colors relative ${limits.breakAlert ? 'bg-arena-cyan' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${limits.breakAlert ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Self Exclusion */}
          <div className="space-y-4">
            <h3 className="font-bold text-arena-error flex items-center text-sm">
              <Lock className="w-4 h-4 mr-2" /> 계정 이용 중단
            </h3>
            <p className="text-xs text-arena-text-muted">설정한 기간 동안 게임에 접속할 수 없으며 취소가 불가능합니다.</p>
            
            <select 
              value={limits.selfExclusion}
              onChange={e => setLimits({...limits, selfExclusion: Number(e.target.value)})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-arena-error font-bold outline-none appearance-none"
            >
              <option value={0}>설정 안 함</option>
              <option value={1}>1일 이용 중단</option>
              <option value={7}>7일 이용 중단</option>
              <option value={30}>30일 이용 중단</option>
              <option value={999}>영구 탈퇴 요청</option>
            </select>
          </div>

        </section>

        <PrimaryButton onClick={handleSave} className="w-full py-4 bg-arena-error text-white hover:bg-arena-error/90 border-none shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          제한 설정 적용하기
        </PrimaryButton>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-arena-card border border-arena-error/30 rounded-3xl p-6 w-full max-w-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-arena-error/10 border-2 border-arena-error flex items-center justify-center mx-auto text-arena-error">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">제한 설정 적용</h3>
                <p className="text-sm text-arena-text-muted">
                  적용 후 7일간은 설정을 완화하거나<br/>해제할 수 없습니다. 계속하시겠습니까?
                </p>
              </div>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => setShowConfirm(false)} className="flex-1 py-3">취소</SecondaryButton>
                <button 
                  onClick={() => {
                    alert('설정이 적용되었습니다.');
                    setShowConfirm(false);
                  }} 
                  className="flex-1 py-3 bg-arena-error text-white rounded-xl font-bold"
                >
                  확인 및 적용
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
