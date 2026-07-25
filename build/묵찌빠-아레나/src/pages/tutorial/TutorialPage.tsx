import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Zap, Target, Swords, Play } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { trackMission } from '@/services/mission';

const SLIDES = [
  {
    id: 1,
    title: '가위바위보 규칙',
    content: (
      <div className="flex items-center justify-center gap-4 text-4xl">
        <span className="bg-white/10 p-4 rounded-2xl">✊</span>
        <ChevronRight className="w-8 h-8 text-arena-success" />
        <span className="bg-white/5 p-4 rounded-2xl opacity-50">✌️</span>
      </div>
    ),
    text: '주먹은 가위를 이깁니다'
  },
  {
    id: 2,
    title: '가위바위보 규칙',
    content: (
      <div className="flex items-center justify-center gap-4 text-4xl">
        <span className="bg-white/10 p-4 rounded-2xl">✌️</span>
        <ChevronRight className="w-8 h-8 text-arena-success" />
        <span className="bg-white/5 p-4 rounded-2xl opacity-50">🖐️</span>
      </div>
    ),
    text: '가위는 보를 이깁니다'
  },
  {
    id: 3,
    title: '가위바위보 규칙',
    content: (
      <div className="flex items-center justify-center gap-4 text-4xl">
        <span className="bg-white/10 p-4 rounded-2xl">🖐️</span>
        <ChevronRight className="w-8 h-8 text-arena-success" />
        <span className="bg-white/5 p-4 rounded-2xl opacity-50">✊</span>
      </div>
    ),
    text: '보는 주먹을 이깁니다'
  },
  {
    id: 4,
    title: '공격권 획득',
    content: (
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm mb-2 font-bold">나</span>
            <div className="bg-arena-success/20 p-4 rounded-2xl border-2 border-arena-success shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <span className="text-4xl">✊</span>
            </div>
          </div>
          <span className="text-2xl font-black italic text-gray-500">VS</span>
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm mb-2 font-bold">상대</span>
            <div className="bg-white/5 p-4 rounded-2xl border-2 border-transparent">
              <span className="text-4xl">✌️</span>
            </div>
          </div>
        </div>
        <div className="bg-arena-gold text-black px-4 py-2 rounded-full font-black flex items-center gap-2 animate-bounce">
          <Zap className="w-5 h-5" /> 공격권 획득!
        </div>
      </div>
    ),
    text: '처음 이기면 공격권을 가집니다'
  },
  {
    id: 5,
    title: '묵찌빠 승리',
    content: (
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="flex items-center justify-center gap-2 text-arena-gold font-bold bg-arena-gold/10 px-4 py-1.5 rounded-full mb-2">
          <Zap className="w-4 h-4" /> 내 공격 차례
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm mb-2 font-bold">나</span>
            <div className="bg-white/10 p-4 rounded-2xl border-2 border-arena-gold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="text-4xl">🖐️</span>
            </div>
          </div>
          <span className="text-2xl font-black italic text-gray-500">=</span>
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm mb-2 font-bold">상대</span>
            <div className="bg-white/10 p-4 rounded-2xl">
              <span className="text-4xl">🖐️</span>
            </div>
          </div>
        </div>
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mt-2">
          승리!
        </div>
      </div>
    ),
    text: '공격 중 같은 손이면 승리합니다'
  }
];

export function TutorialPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSlide < SLIDES.length - 1) {
        setCurrentSlide(prev => prev + 1);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNext = () => {
    triggerHaptic('light');
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      void trackMission('TUTORIAL_COMPLETED');
      handleStartPractice();
    }
  };

  const handleStartPractice = () => {
    triggerHaptic('heavy');
    navigate('/game/beginner-ai');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Navigation */}
      <div className="p-4 flex justify-between items-center z-10 relative">
        <button 
          onClick={() => navigate('/lobby')}
          className="text-gray-400 hover:text-white px-2 py-1 text-sm font-bold"
        >
          로비로 돌아가기
        </button>
        <button 
          onClick={handleStartPractice}
          className="text-gray-400 hover:text-white px-2 py-1 text-sm font-bold bg-white/10 rounded-full"
        >
          건너뛰기
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background Decorative */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.15)_0%,_transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-sm aspect-square bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <h2 className="text-sm font-black tracking-widest text-gray-500 mb-8">
                {SLIDES[currentSlide].title}
              </h2>
              
              <div className="flex-1 flex items-center justify-center w-full">
                {SLIDES[currentSlide].content}
              </div>

              <p className="text-lg font-bold text-white text-center mt-8">
                {SLIDES[currentSlide].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mt-8">
          {SLIDES.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-arena-success' : 'w-2 bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-6 pb-safe relative z-10">
        <div className="max-w-sm mx-auto">
          {currentSlide === SLIDES.length - 1 ? (
            <PrimaryButton 
              onClick={handleStartPractice}
              className="w-full py-5 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-arena-success to-emerald-500 border-none shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              <Target className="w-5 h-5" /> AI와 연습 게임 시작
            </PrimaryButton>
          ) : (
            <SecondaryButton 
              onClick={handleNext}
              className="w-full py-4 text-base flex items-center justify-center gap-2 border-gray-800 hover:bg-gray-800"
            >
              다음 설명 보기
            </SecondaryButton>
          )}
        </div>
      </div>

    </div>
  );
}
