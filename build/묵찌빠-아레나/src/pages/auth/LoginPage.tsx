import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import { GameCard } from '@/components/common/Cards';

type ErrorType = 'none' | 'invalid' | 'suspended' | 'adult' | 'network' | 'maintenance';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>('none');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      // Demo logic for errors based on email input
      if (email === 'error') {
        setErrorType('invalid');
        triggerHaptic('error');
      } else if (email === 'suspend') {
        setErrorType('suspended');
        triggerHaptic('error');
      } else if (email === 'adult') {
        setErrorType('adult');
        triggerHaptic('error');
      } else if (email === 'network') {
        setErrorType('network');
        triggerHaptic('error');
      } else if (email === 'maintenance') {
        setErrorType('maintenance');
        triggerHaptic('error');
      } else {
        triggerHaptic('success');
        navigate('/lobby');
      }
    }, 1000);
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'invalid': return '아이디 또는 비밀번호가 일치하지 않습니다.';
      case 'suspended': return '이용이 정지된 계정입니다. 고객센터로 문의해주세요.';
      case 'adult': return '성인 확인이 필요한 계정입니다. 본인 인증을 진행해주세요.';
      case 'network': return '네트워크 연결이 원활하지 않습니다. 다시 시도해주세요.';
      case 'maintenance': return '서버 점검 중입니다. 잠시 후 다시 시도해주세요.';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col p-6">
      <header className="py-4">
        <Link to="/" onClick={() => triggerHaptic('light')} className="text-xl font-black text-white flex items-center space-x-2">
          <span className="text-arena-gold">✊</span>
          <span>아레나</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">로그인</h1>
          <p className="text-arena-text-muted">아레나에 입장하여 승부를 시작하세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="아이디 또는 이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorType !== 'none') setErrorType('none');
              }}
              className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 focus:bg-arena-card-hover transition-colors"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorType !== 'none') setErrorType('none');
                }}
                className="w-full h-14 bg-arena-card border border-white/10 rounded-xl pl-4 pr-12 text-white outline-none focus:border-arena-gold/50 focus:bg-arena-card-hover transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  setShowPassword(!showPassword);
                  triggerHaptic('light');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-arena-text-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {errorType !== 'none' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start space-x-2 p-3 bg-arena-error/10 border border-arena-error/30 rounded-lg text-arena-error text-sm font-medium">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{getErrorMessage()}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${keepLoggedIn ? 'bg-arena-gold border-arena-gold' : 'border-white/20 group-hover:border-white/40'}`}>
                {keepLoggedIn && <span className="text-arena-bg text-xs font-bold">✓</span>}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={keepLoggedIn}
                onChange={(e) => {
                  setKeepLoggedIn(e.target.checked);
                  triggerHaptic('light');
                }}
              />
              <span className="text-sm text-arena-text-muted group-hover:text-white transition-colors">로그인 상태 유지</span>
            </label>
            
            <div className="flex space-x-3 text-sm text-arena-text-muted">
              <button type="button" className="hover:text-white transition-colors">아이디 찾기</button>
              <button type="button" className="hover:text-white transition-colors">비밀번호 찾기</button>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <PrimaryButton type="submit" disabled={isLoading} className={isLoading ? 'opacity-80' : ''}>
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-arena-bg/20 border-t-arena-bg rounded-full animate-spin" />
              ) : (
                '로그인'
              )}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => navigate('/signup')}>
              회원가입
            </SecondaryButton>
          </div>
        </form>

        <div className="pt-8">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-arena-text-muted text-sm">또는</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          <button 
            onClick={() => {
              triggerHaptic('light');
              navigate('/lobby');
            }}
            className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-medium rounded-2xl transition-colors border border-white/10 flex items-center justify-center"
          >
            데모 계정으로 체험하기
          </button>
          
          <p className="text-center text-xs text-arena-text-muted mt-6 mb-2">
            데모용 계정 입력 안내 (오류 상태 테스트)
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <button onClick={() => setEmail('error')} className="px-2 py-1 bg-white/5 rounded text-arena-text-muted hover:text-white">error</button>
            <button onClick={() => setEmail('suspend')} className="px-2 py-1 bg-white/5 rounded text-arena-text-muted hover:text-white">suspend</button>
            <button onClick={() => setEmail('adult')} className="px-2 py-1 bg-white/5 rounded text-arena-text-muted hover:text-white">adult</button>
            <button onClick={() => setEmail('network')} className="px-2 py-1 bg-white/5 rounded text-arena-text-muted hover:text-white">network</button>
            <button onClick={() => setEmail('maintenance')} className="px-2 py-1 bg-white/5 rounded text-arena-text-muted hover:text-white">maintenance</button>
          </div>
        </div>
      </div>
    </div>
  );
}
