import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, Lock, PlayCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gameSettings } from '@/utils/gameSettings';
import { audioManager } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

import { CHARACTERS, HAND_SKINS } from '@/data/decorations';

const TABS = [
  { id: 'character', label: '캐릭터' },
  { id: 'hand', label: '손 스킨' },
  { id: 'border', label: '프로필 테두리' },
  { id: 'intro', label: '입장 연출' },
  { id: 'win', label: '승리 연출' },
  { id: 'table', label: '테이블 테마' },
  { id: 'sound', label: '효과음 세트' },
];



export function DecorationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('character');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const currentOptions = gameSettings.options;

  const handleSelectCharacter = (id: string) => {
    gameSettings.updateOption('characterId', id);
    audioManager.playSFX('btn_select');
    triggerHaptic('medium');
  };

  const handleSelectSkin = (id: string) => {
    gameSettings.updateOption('handSkinId', id);
    audioManager.playSFX('btn_select');
    triggerHaptic('medium');
  };

  const previewSkinAction = (skinId: string) => {
    // Show visual preview or play sound
    audioManager.playSFX('rock_btn');
    triggerHaptic('light');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 shrink-0 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black tracking-tight">내 꾸미기</h1>
        <div className="w-10"></div>
      </header>

      {/* Tabs - Horizontal Scroll */}
      <div className="w-full overflow-x-auto hide-scrollbar bg-gray-900 border-b border-gray-800 shrink-0 sticky top-[65px] z-10">
        <div className="flex px-4 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpandedId(null); triggerHaptic('light'); }}
              className={`px-4 py-4 font-bold text-sm transition-colors relative ${
                activeTab === tab.id ? 'text-arena-cyan' : 'text-gray-400'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="decoTab" className="absolute bottom-0 inset-x-0 h-1 bg-arena-cyan rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {activeTab === 'character' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHARACTERS.map((char) => (
              <div 
                key={char.id} 
                className={`bg-gray-900 rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
                  currentOptions.characterId === char.id ? 'border-arena-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === char.id ? null : char.id)}
                >
                  <div className="w-16 h-16 rounded-2xl bg-black border border-gray-800 flex items-center justify-center text-3xl shrink-0">
                    {char.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      {char.name}
                      {currentOptions.characterId === char.id && (
                        <span className="bg-arena-cyan/20 text-arena-cyan text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                          적용됨
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                      {char.owned ? <Check className="w-3 h-3 text-arena-success" /> : <Lock className="w-3 h-3 text-arena-error" />}
                      {char.owned ? '보유 중' : '미보유'}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === char.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-800 overflow-hidden"
                    >
                      <div className="p-4 bg-black/50">
                        <p className="text-sm text-gray-300 mb-4">{char.description}</p>
                        
                        <div className="flex gap-2">
                          {char.owned ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSelectCharacter(char.id); }}
                              disabled={currentOptions.characterId === char.id}
                              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                currentOptions.characterId === char.id
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  : 'bg-arena-cyan text-black hover:bg-cyan-400'
                              }`}
                            >
                              {currentOptions.characterId === char.id ? '사용 중' : '선택하기'}
                            </button>
                          ) : (
                            <button className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-800 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2">
                              <Lock className="w-4 h-4" /> 잠김
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hand' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HAND_SKINS.map((skin) => (
              <div 
                key={skin.id} 
                className={`bg-gray-900 rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
                  currentOptions.handSkinId === skin.id ? 'border-arena-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        {skin.name}
                        {currentOptions.handSkinId === skin.id && (
                          <span className="bg-arena-cyan/20 text-arena-cyan text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                            적용됨
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                        {skin.owned ? <Check className="w-3 h-3 text-arena-success" /> : <Lock className="w-3 h-3 text-arena-error" />}
                        {skin.owned ? '보유 중' : '미보유'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 h-10">{skin.description}</p>

                  <div className="flex gap-2 mb-4 bg-black p-3 rounded-2xl justify-around border border-gray-800">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl drop-shadow-lg">{skin.emojis.ROCK}</span>
                      <span className="text-[10px] text-gray-500 mt-1">묵</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl drop-shadow-lg">{skin.emojis.SCISSORS}</span>
                      <span className="text-[10px] text-gray-500 mt-1">찌</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl drop-shadow-lg">{skin.emojis.PAPER}</span>
                      <span className="text-[10px] text-gray-500 mt-1">빠</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => previewSkinAction(skin.id)}
                      className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-800 text-white hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 border border-gray-700"
                    >
                      <PlayCircle className="w-4 h-4" /> 미리보기
                    </button>
                    {skin.owned ? (
                      <button
                        onClick={() => handleSelectSkin(skin.id)}
                        disabled={currentOptions.handSkinId === skin.id}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                          currentOptions.handSkinId === skin.id
                            ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                            : 'bg-arena-cyan text-black hover:bg-cyan-400'
                        }`}
                      >
                        {currentOptions.handSkinId === skin.id ? '사용 중' : '사용하기'}
                      </button>
                    ) : (
                      <button className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-800 text-gray-500 border border-gray-800 cursor-not-allowed flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" /> 잠김
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {['border', 'intro', 'win', 'table', 'sound'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
            <Info className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">준비 중인 꾸미기 아이템입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
