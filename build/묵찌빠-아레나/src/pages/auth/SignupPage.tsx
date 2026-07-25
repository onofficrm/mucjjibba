import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';

type SignupStep = 1 | 2 | 3 | 4;

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignupStep>(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  // Step 1: Terms
  const [terms, setTerms] = useState({
    all: false,
    service: false,
    privacy: false,
    policy: false,
    marketing: false,
  });

  const isStep1Valid = terms.service && terms.privacy && terms.policy;

  const handleNext = () => {
    triggerHaptic('medium');
    setDirection(1);
    if (step < 4) {
      setStep((prev) => (prev + 1) as SignupStep);
    } else {
      // Complete signup
      navigate('/onboarding');
    }
  };

  const handleBack = () => {
    triggerHaptic('light');
    setDirection(-1);
    if (step > 1) {
      setStep((prev) => (prev - 1) as SignupStep);
    } else {
      navigate(-1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col p-6">
      <header className="py-4 flex items-center justify-between">
        <button onClick={handleBack} className="p-2 -ml-2 text-arena-text-muted hover:text-white rounded-full hover:bg-white/5 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex space-x-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-arena-gold' : s < step ? 'w-2 bg-arena-gold/50' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <div className="flex-1 flex flex-col max-w-sm w-full mx-auto relative overflow-hidden mt-6">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
            className="flex-1 flex flex-col w-full h-full"
          >
            {step === 1 && (
              <div className="flex flex-col h-full space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white mb-2">약관 동의</h1>
                  <p className="text-arena-text-muted">서비스 이용을 위해 약관에 동의해주세요.</p>
                </div>

                <div className="space-y-4 flex-1 mt-4">
                  <label className="flex items-center space-x-3 p-4 bg-arena-card border border-white/10 rounded-2xl cursor-pointer">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${terms.all ? 'bg-arena-gold border-arena-gold' : 'border-white/20'}`}>
                      {terms.all && <Check className="w-4 h-4 text-arena-bg stroke-[3]" />}
                    </div>
                    <span className="font-bold text-lg text-white">전체 동의</span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={terms.all}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setTerms({ all: val, service: val, privacy: val, policy: val, marketing: val });
                        triggerHaptic('light');
                      }}
                    />
                  </label>

                  <div className="space-y-4 pl-4 pr-2">
                    {[
                      { id: 'service', label: '서비스 이용약관 동의 (필수)' },
                      { id: 'privacy', label: '개인정보 처리방침 동의 (필수)' },
                      { id: 'policy', label: '게임 이용 정책 동의 (필수)' },
                      { id: 'marketing', label: '마케팅 정보 수신 동의 (선택)' },
                    ].map((item) => (
                      <label key={item.id} className="flex items-center space-x-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${terms[item.id as keyof typeof terms] ? 'bg-arena-cyan border-arena-cyan' : 'border-white/20 group-hover:border-white/40'}`}>
                          {terms[item.id as keyof typeof terms] && <Check className="w-3.5 h-3.5 text-arena-bg stroke-[3]" />}
                        </div>
                        <span className="text-sm text-arena-text-muted group-hover:text-white transition-colors">{item.label}</span>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={terms[item.id as keyof typeof terms] as boolean}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setTerms(prev => {
                              const next = { ...prev, [item.id]: val };
                              next.all = next.service && next.privacy && next.policy && next.marketing;
                              return next;
                            });
                            triggerHaptic('light');
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                
                <PrimaryButton onClick={handleNext} disabled={!isStep1Valid} className={!isStep1Valid ? 'opacity-50 grayscale' : ''}>
                  다음
                </PrimaryButton>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col h-full space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white mb-2">계정 정보</h1>
                  <p className="text-arena-text-muted">로그인에 사용할 정보를 입력해주세요.</p>
                </div>

                <div className="space-y-4 flex-1 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">아이디</label>
                    <input type="text" placeholder="영문, 숫자 조합 4~12자" className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">비밀번호</label>
                    <input type="password" placeholder="영문, 숫자, 특수문자 조합 8자 이상" className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">비밀번호 확인</label>
                    <input type="password" placeholder="비밀번호를 다시 입력해주세요" className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">이메일</label>
                    <input type="email" placeholder="example@email.com" className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">휴대전화 번호</label>
                    <input type="tel" placeholder="010-0000-0000" className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors" />
                  </div>
                </div>

                <PrimaryButton onClick={handleNext}>다음</PrimaryButton>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col h-full space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white mb-2">프로필 설정</h1>
                  <p className="text-arena-text-muted">아레나에서 사용할 멋진 프로필을 만드세요.</p>
                </div>

                <div className="space-y-6 flex-1 mt-4">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-arena-card border-2 border-arena-gold flex items-center justify-center text-4xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        👤
                      </div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-arena-cyan rounded-full flex items-center justify-center border-2 border-arena-bg shadow-lg cursor-pointer">
                        <span className="text-white text-sm">📷</span>
                      </div>
                    </div>
                    <span className="text-sm text-arena-text-muted">프로필 이미지 변경</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">닉네임</label>
                    <input type="text" placeholder="멋진 닉네임을 입력하세요 (2~8자)" className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors text-center text-lg font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">국가/지역</label>
                      <select className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors appearance-none cursor-pointer">
                        <option value="KR">🇰🇷 대한민국</option>
                        <option value="US">🇺🇸 미국</option>
                        <option value="JP">🇯🇵 일본</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-arena-text-muted mb-1.5 ml-1">언어</label>
                      <select className="w-full h-14 bg-arena-card border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors appearance-none cursor-pointer">
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>
                  </div>
                </div>

                <PrimaryButton onClick={handleNext}>다음</PrimaryButton>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col h-full space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white mb-2">성인 인증</h1>
                  <p className="text-arena-text-muted">아레나는 만 18세 이상만 이용 가능합니다.</p>
                </div>

                <div className="space-y-6 flex-1 mt-4">
                  <div className="p-5 bg-arena-error/10 border border-arena-error/30 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 text-arena-error font-bold">
                      <span className="text-xl">🔞</span>
                      <span>성인 전용 서비스 안내</span>
                    </div>
                    <p className="text-sm text-arena-text-muted leading-relaxed">
                      본 서비스는 포인트 베팅 요소가 포함되어 있어 청소년 보호법에 따라 만 18세 미만의 청소년은 이용할 수 없습니다. 서비스 이용을 위해 최초 1회 연령 확인이 필요합니다.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-arena-card border border-white/5 rounded-2xl">
                    <p className="text-xs text-arena-text-muted leading-relaxed">
                      * 접속하신 국가 및 지역의 법률에 따라 서비스 이용이 제한될 수 있습니다. 불법적인 환전 및 양도 행위는 계정 영구 정지 및 법적 제재를 받을 수 있습니다.
                    </p>
                  </div>

                  <div className="pt-4 space-y-4">
                    <SecondaryButton onClick={() => triggerHaptic('light')} className="relative overflow-hidden group">
                      <span className="relative z-10 flex items-center space-x-2">
                        <span>📱</span>
                        <span>휴대폰 본인인증 (외부 API)</span>
                      </span>
                    </SecondaryButton>
                    <SecondaryButton onClick={() => triggerHaptic('light')}>
                      <span className="flex items-center space-x-2">
                        <span>💳</span>
                        <span>신용카드 인증</span>
                      </span>
                    </SecondaryButton>
                  </div>
                  
                  <div className="flex items-center justify-center pt-2">
                    <span className="text-xs text-arena-gold/80 px-4 py-2 bg-arena-gold/10 rounded-lg">
                      [데모 버전] 본인인증을 생략하고 계속 진행할 수 있습니다.
                    </span>
                  </div>
                </div>

                <PrimaryButton onClick={handleNext}>가입 완료 및 입장</PrimaryButton>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
