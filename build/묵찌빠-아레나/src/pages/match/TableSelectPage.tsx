import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { PrimaryButton } from '@/components/common/Buttons';
import { triggerHaptic } from '@/utils/haptics';
import { DEMO_USER } from '@/data/demoData';

interface TableData {
  id: string;
  name: string;
  entryPoint: number;
  totalPoint: number;
  fee: number;
  winnerPoint: number;
  minGrade: string;
  isFree: boolean;
  color: string;
}

const TABLES: TableData[] = [
  {
    id: 'practice',
    name: '연습 게임',
    entryPoint: 0,
    totalPoint: 0,
    fee: 0,
    winnerPoint: 0,
    minGrade: '입문',
    isFree: true,
    color: 'border-white text-white',
  },
  {
    id: 'bronze',
    name: '브론즈 테이블',
    entryPoint: 1000,
    totalPoint: 2000,
    fee: 100,
    winnerPoint: 1900,
    minGrade: '브론즈',
    isFree: false,
    color: 'border-orange-400 text-orange-400 bg-orange-400/10',
  },
  {
    id: 'silver',
    name: '실버 테이블',
    entryPoint: 5000,
    totalPoint: 10000,
    fee: 500,
    winnerPoint: 9500,
    minGrade: '실버',
    isFree: false,
    color: 'border-slate-300 text-slate-300 bg-slate-300/10',
  },
  {
    id: 'gold',
    name: '골드 테이블',
    entryPoint: 10000,
    totalPoint: 20000,
    fee: 1000,
    winnerPoint: 19000,
    minGrade: '골드',
    isFree: false,
    color: 'border-yellow-400 text-yellow-400 bg-yellow-400/10',
  },
  {
    id: 'platinum',
    name: '플래티넘 테이블',
    entryPoint: 50000,
    totalPoint: 100000,
    fee: 5000,
    winnerPoint: 95000,
    minGrade: '플래티넘',
    isFree: false,
    color: 'border-cyan-400 text-cyan-400 bg-cyan-400/10',
  },
  {
    id: 'vip',
    name: 'VIP 테이블',
    entryPoint: 100000,
    totalPoint: 200000,
    fee: 10000,
    winnerPoint: 190000,
    minGrade: '다이아',
    isFree: false,
    color: 'border-purple-500 text-purple-400 bg-purple-500/10',
  },
];

export function TableSelectPage() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isAnimatingStart, setIsAnimatingStart] = useState(false);

  const selectedTable = TABLES[selectedIndex];

  const handleChipClick = (index: number) => {
    triggerHaptic('light');
    setSelectedIndex(index);
    setShowInfo(false); // reset info state when changing chip
  };

  const handleStart = () => {
    if (DEMO_USER.points < selectedTable.entryPoint) {
      triggerHaptic('error');
      // Here you could show a toast or alert that points are insufficient
      return;
    }
    
    triggerHaptic('heavy');
    setIsAnimatingStart(true);
    
    setTimeout(() => {
      navigate('/match/waiting', { state: { table: selectedTable } });
    }, 800);
  };

  return (
    <div className="h-full flex flex-col relative font-sans overflow-hidden bg-arena-bg pb-16 md:pb-8">
      {/* Top Header & Status */}
      <div className="relative z-10 flex flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { triggerHaptic('light'); navigate(-1); }} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-1.5 shadow-lg">
             <span className="text-xs text-gray-400 font-bold">보유 포인트</span>
             <span className="text-sm font-black text-white">{DEMO_USER.points.toLocaleString()} <span className="text-arena-gold text-xs">P</span></span>
          </div>
        </div>

        {/* Selected Chip Info (Simple numbers) */}
        <div className="flex flex-col items-center justify-center space-y-2 mt-4 transition-all h-24">
           <AnimatePresence mode="wait">
             <motion.div
               key={selectedTable.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="flex items-center justify-center gap-8 w-full max-w-sm bg-black/30 border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-sm"
             >
                <div className="flex flex-col items-center flex-1">
                   <span className="text-[10px] font-bold text-gray-500 mb-1">참가</span>
                   <span className="font-bold text-white">{selectedTable.isFree ? '무료' : selectedTable.entryPoint.toLocaleString()}</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center flex-1">
                   <span className="text-[10px] font-bold text-gray-500 mb-1">수수료</span>
                   <span className="font-bold text-arena-error">{selectedTable.fee.toLocaleString()}</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center flex-1">
                   <span className="text-[10px] font-bold text-arena-gold mb-1">승리</span>
                   <span className="font-black text-arena-gold">{selectedTable.winnerPoint.toLocaleString()}</span>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>

      {/* Center: Chip Grid & Animation Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* Chips Grid */}
        <div className={`grid grid-cols-3 gap-6 max-w-sm w-full mx-auto relative z-20 transition-opacity duration-300 ${isAnimatingStart ? 'opacity-0' : 'opacity-100'}`}>
          {TABLES.map((table, i) => {
            const isSelected = i === selectedIndex;
            return (
              <button
                key={table.id}
                onClick={() => handleChipClick(i)}
                className="relative flex flex-col items-center justify-center focus:outline-none group"
              >
                <motion.div
                  animate={{ 
                    scale: isSelected ? 1.15 : 1,
                    y: isSelected ? -10 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl relative
                    ${isSelected ? table.color + ' shadow-[0_0_30px_rgba(255,255,255,0.2)] z-30' : 'border-gray-700 bg-gray-800 text-gray-500 grayscale group-hover:grayscale-0 transition-all'}
                  `}
                >
                  {/* Dashed inner border for casino chip look */}
                  <div className={`absolute inset-2 rounded-full border-2 border-dashed ${isSelected ? 'border-current opacity-50' : 'border-gray-600'} pointer-events-none`} />
                  
                  <span className={`font-black tracking-tighter ${table.isFree ? 'text-lg' : 'text-xl'}`}>
                    {table.isFree ? '무료' : (table.entryPoint >= 10000 ? `${table.entryPoint/10000}만` : `${table.entryPoint/1000}천`)}
                  </span>
                </motion.div>
                
                {/* Active Indicator Glow */}
                {isSelected && (
                  <motion.div 
                    layoutId="activeChipGlow"
                    className="absolute -bottom-4 w-12 h-2 rounded-full bg-white blur-md opacity-30 pointer-events-none" 
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Start Game Animation Chip (Only visible when starting) */}
        <AnimatePresence>
          {isAnimatingStart && (
            <motion.div
              initial={{ scale: 1.15, y: -10, opacity: 1 }}
              animate={{ 
                scale: [1.15, 1.5, 0], 
                y: [-10, -50, 100], 
                rotateX: [0, 180, 360],
                opacity: [1, 1, 0] 
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl z-50 ${selectedTable.color}`}
            >
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-current opacity-50" />
              <span className="font-black text-2xl tracking-tighter">
                {selectedTable.isFree ? '무료' : (selectedTable.entryPoint >= 10000 ? `${selectedTable.entryPoint/10000}만` : `${selectedTable.entryPoint/1000}천`)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Info Dropdown (Expandable) */}
        <div className={`w-full max-w-sm mt-12 z-10 transition-opacity duration-300 ${isAnimatingStart ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={() => { triggerHaptic('light'); setShowInfo(!showInfo); }}
            className="flex items-center justify-center w-full gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-gray-300 transition-colors border border-white/5"
          >
            <Info className="w-4 h-4" />
            게임 정보
            {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {showInfo && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 mt-2 bg-black/40 border border-white/5 rounded-2xl text-xs text-gray-400 space-y-3 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span>최소 입장 조건</span>
                    <span className="font-bold text-white">{selectedTable.minGrade} 등급 이상</span>
                  </div>
                  {selectedTable.isFree ? (
                    <div className="text-gray-300 pt-2 border-t border-white/10">무료 연습 모드는 포인트 변동이 없으며 AI와 매칭됩니다.</div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>운영 수수료</span>
                        <span className="font-bold text-arena-error">승리 시 5% 차감</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <p className="font-bold text-gray-300 mb-1">주의사항</p>
                        <p>• 게임 중 앱을 종료하면 기권패 처리됩니다.</p>
                        <p>• 선택 제한 시간 5초 초과 시 임의 선택됩니다.</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className={`p-4 z-20 pb-safe transition-transform duration-500 ${isAnimatingStart ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <PrimaryButton 
          onClick={handleStart}
          className="w-full py-5 text-xl tracking-wide group overflow-hidden relative shadow-[0_0_40px_rgba(245,158,11,0.2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          <span className="flex items-center justify-center gap-2 relative z-10">
            {DEMO_USER.points < selectedTable.entryPoint ? '포인트가 부족합니다' : '상대 찾기'}
            {DEMO_USER.points >= selectedTable.entryPoint && <Play className="w-5 h-5 fill-current" />}
          </span>
        </PrimaryButton>
      </div>

    </div>
  );
}
