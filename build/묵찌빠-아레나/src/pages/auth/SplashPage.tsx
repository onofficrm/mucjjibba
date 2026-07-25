import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Casino light background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.15)_0%,_rgba(10,14,23,0)_60%)] blur-[50px]"
        />
        <motion.div 
          animate={{ 
            rotate: [0, -15, 15, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.1)_0%,_rgba(10,14,23,0)_60%)] blur-[50px]"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 space-y-12 mt-10">
        <div className="flex space-x-4">
          {['✊', '✌️', '🖐️'].map((icon, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.2, type: "spring" }}
              className="w-20 h-20 bg-arena-card border border-arena-gold/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-gradient-to-br from-arena-card to-arena-card-hover"
            >
              <span className="text-5xl drop-shadow-lg">{icon}</span>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-5xl font-black text-white tracking-tighter text-shadow-gold"
          >
            묵찌빠 아레나
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-arena-text-muted font-medium text-lg"
          >
            실시간 심리전의 승자가 되어보세요
          </motion.p>
        </div>
      </div>
      
      <div className="w-full max-w-sm space-y-4 z-10 pb-8">
        <PrimaryButton onClick={() => navigate('/login')}>
          로그인
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/signup')}>
          회원가입
        </SecondaryButton>
        
        <div className="pt-4 grid grid-cols-2 gap-3">
          <button onClick={() => { triggerHaptic('light'); navigate('/lobby'); }} className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors border border-white/10 text-center">
            무료 연습 시작
          </button>
          <button onClick={() => triggerHaptic('light')} className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors border border-white/10 text-center">
            이용 방법
          </button>
        </div>
        
        <div className="flex items-center justify-center space-x-4 pt-4 text-xs text-arena-text-muted">
          <Link to="/terms" className="hover:text-white transition-colors">이용약관</Link>
          <span>|</span>
          <Link to="/terms" className="hover:text-white transition-colors">개인정보 처리방침</Link>
        </div>
      </div>
    </div>
  );
}
