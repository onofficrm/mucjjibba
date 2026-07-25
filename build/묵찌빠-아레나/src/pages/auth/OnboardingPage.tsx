import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      title: '묵찌빠 기본 규칙',
      icon: '✌️',
      items: [
        '묵은 찌를 이긴다.',
        '찌는 빠를 이긴다.',
        '빠는 묵을 이긴다.',
      ],
    },
    {
      title: '공격권 결정',
      icon: '⚔️',
      items: [
        '첫 번째 가위바위보로 공격권을 결정한다.',
        '가위바위보에서 이긴 플레이어가 공격권을 가진다.',
      ],
    },
    {
      title: '공격 성공',
      icon: '💥',
      items: [
        '공격권을 가진 상태에서 상대방과 같은 손을 내면 해당 라운드에서 승리한다.',
        '서로 다른 손이 나오면 가위바위보 결과에 따라 공격권이 이동한다.',
      ],
    },
    {
      title: '참가 포인트',
      icon: '💰',
      items: [
        '양쪽 플레이어가 동일한 포인트를 참가 포인트로 예치한다.',
        '게임이 종료되면 운영 수수료를 제외한 포인트가 승자에게 지급된다.',
        '모든 금액은 현재 데모용 가상 포인트다.',
      ],
    },
    {
      title: '게임 이용 규칙',
      icon: '⚖️',
      items: [
        '제한 시간 안에 손을 선택해야 한다.',
        '고의적인 연결 종료와 부정 이용은 제한될 수 있다.',
        '포인트와 운영 수수료는 게임 시작 전에 확인할 수 있다.',
      ],
    }
  ];

  const handleNext = () => {
    triggerHaptic('light');
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    triggerHaptic('light');
    if (step > 0) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col p-6 items-center justify-between relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-96 bg-arena-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col h-full mt-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handlePrev} 
            className={`p-2 -ml-2 text-arena-text-muted hover:text-white rounded-full hover:bg-white/5 transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 px-8">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-arena-gold"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <button 
            onClick={handleNext} 
            className={`p-2 -mr-2 text-arena-text-muted hover:text-white rounded-full hover:bg-white/5 transition-colors ${step === steps.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-3xl bg-arena-card border border-arena-gold/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)] mt-8 mb-10 bg-gradient-to-br from-arena-card to-arena-card-hover">
                <span className="text-6xl drop-shadow-lg">{steps[step].icon}</span>
              </div>
              
              <div className="w-full bg-arena-card/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 space-y-6">
                <h2 className="text-2xl font-black text-white text-center">{steps[step].title}</h2>
                <ul className="space-y-4">
                  {steps[step].items.map((item, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="flex items-start space-x-3 text-arena-text-muted leading-relaxed"
                    >
                      <span className="text-arena-gold mt-1 shrink-0">•</span>
                      <span className="font-medium text-[15px]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-8 pb-4 space-y-4">
          {step === steps.length - 1 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <PrimaryButton onClick={() => { triggerHaptic('success'); navigate('/match/quick'); }}>
                무료 연습 시작
              </PrimaryButton>
              <SecondaryButton onClick={() => { triggerHaptic('light'); navigate('/lobby'); }}>
                메인 로비로 이동
              </SecondaryButton>
              
              <div className="flex items-center justify-center pt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-arena-gold border-arena-gold' : 'border-white/20 group-hover:border-white/40'}`}>
                    {dontShowAgain && <Check className="w-3.5 h-3.5 text-arena-bg stroke-[3]" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={dontShowAgain}
                    onChange={(e) => {
                      setDontShowAgain(e.target.checked);
                      triggerHaptic('light');
                    }}
                  />
                  <span className="text-sm font-medium text-arena-text-muted group-hover:text-white transition-colors">다시 보지 않기</span>
                </label>
              </div>
            </motion.div>
          ) : (
            <PrimaryButton onClick={handleNext}>
              다음
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
