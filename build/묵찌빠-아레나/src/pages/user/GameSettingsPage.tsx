import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, Vibrate, Zap, MessageSquare, Users, Trophy, Globe, LogOut, Smartphone, VolumeX, Music, Mic, Eye, Bot, MessageCircle, MonitorPlay } from 'lucide-react';
import { audioManager, AUDIO_SETTINGS_EVENT, VolumeSettings } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings, GameOptions } from '@/utils/gameSettings';
import { trackMission } from '@/services/mission';
import { SOUND_PRESET_IDS, SOUND_PRESETS, type SoundPresetId } from '@/utils/soundPresets';
import { TEMPO_PRESET_IDS, TEMPO_PRESET_META, type TempoPreset } from '@/game/combatTiming';

export function GameSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<VolumeSettings>(audioManager.settings);
  const [options, setOptions] = useState<GameOptions>(gameSettings.options);
  
  const [otherSettings, setOtherSettings] = useState({
    chatNotify: true,
    friendNotify: true,
    tournamentNotify: false,
    language: 'ko'
  });

  useEffect(() => {
    setSettings(audioManager.settings);
    void trackMission('SETTINGS_VIEWED');
    // 사이드바·게임 화면에서 바꾼 음소거도 이 페이지에 즉시 반영
    const onChange = () => setSettings({ ...audioManager.settings });
    window.addEventListener(AUDIO_SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(AUDIO_SETTINGS_EVENT, onChange);
  }, []);

  const updateAudioSetting = <K extends keyof VolumeSettings>(key: K, value: VolumeSettings[K]) => {
    audioManager.updateSetting(key, value);
    setSettings({ ...audioManager.settings });
    if (key !== 'mute') {
      audioManager.playSFX('btn_touch');
    }
  };

  const toggleOption = (key: keyof GameOptions) => {
    const newValue = !options[key];
    gameSettings.updateOption(key, newValue as any);
    setOptions({ ...gameSettings.options });
    audioManager.playSFX('btn_touch');
    triggerHaptic('light');
  };

  const toggleOther = (key: keyof typeof otherSettings) => {
    setOtherSettings(prev => ({ ...prev, [key]: !prev[key] as any }));
    audioManager.playSFX('btn_touch');
    triggerHaptic('light');
  };

  return (
    <div className="min-h-screen bg-arena-bg text-white pb-20 overflow-y-auto">
      <header className="sticky top-0 z-40 bg-arena-bg/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => { audioManager.playSFX('btn_select'); navigate(-1); }} className="p-2 -ml-2 text-arena-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black ml-2">게임 설정</h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">

        <section className="bg-arena-card border border-white/10 rounded-2xl p-4">
          <div className="text-arena-text-muted text-xs font-bold uppercase tracking-wider mb-3">
            게임 템포
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {TEMPO_PRESET_IDS.map((id) => {
              const p = TEMPO_PRESET_META[id];
              const active = (options.combatTempo ?? 'default') === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    gameSettings.updateOption('combatTempo', id as TempoPreset);
                    setOptions({ ...gameSettings.options });
                    audioManager.playSFX('btn_touch');
                    triggerHaptic('light');
                  }}
                  className={`text-center px-2 py-3 rounded-xl border transition-colors ${
                    active
                      ? 'border-arena-cyan bg-arena-cyan/15 text-arena-cyan'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-black">{p.label}</div>
                  <div className="text-[10px] text-gray-500 mt-1 leading-snug">{p.description}</div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !(options.showRuleCard !== false);
              gameSettings.updateOption('showRuleCard', next);
              setOptions({ ...gameSettings.options });
              audioManager.playSFX('btn_touch');
              triggerHaptic('light');
            }}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl border text-sm font-medium ${
              options.showRuleCard !== false
                ? 'border-arena-gold/40 bg-arena-gold/10 text-arena-gold'
                : 'border-white/10 bg-white/5 text-gray-300'
            }`}
          >
            <span>시작 전 룰 카드 보기</span>
            <span className="text-xs font-bold">
              {options.showRuleCard !== false ? 'ON' : 'OFF'}
            </span>
          </button>
        </section>

        <section className="bg-arena-card border border-white/10 rounded-2xl p-4">
          <div className="text-arena-text-muted text-xs font-bold uppercase tracking-wider mb-3">
            사운드 프리셋
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SOUND_PRESET_IDS.map((id) => {
              const p = SOUND_PRESETS[id];
              const active = (settings.soundPreset ?? 'default') === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    audioManager.applySoundPreset(id as SoundPresetId);
                    setSettings({ ...audioManager.settings });
                    audioManager.playSFX('confirm');
                    triggerHaptic('light');
                  }}
                  className={`text-left px-3 py-3 rounded-xl border transition-colors ${
                    active
                      ? 'border-arena-gold bg-arena-gold/15 text-arena-gold'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-black">{p.label}</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-snug">{p.description}</div>
                </button>
              );
            })}
          </div>
        </section>
        
        {/* Audio Settings */}
        <section className="bg-arena-card border border-white/10 rounded-2xl p-2">
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center text-arena-text-muted text-xs font-bold uppercase tracking-wider">
            <span>사운드 설정</span>
            <button 
              onClick={() => {
                updateAudioSetting('mute', !settings.mute);
                triggerHaptic('medium');
              }}
              className="flex items-center gap-1 text-white bg-white/10 px-2 py-1 rounded-md"
            >
              {settings.mute ? <VolumeX className="w-4 h-4 text-arena-error" /> : <Volume2 className="w-4 h-4 text-arena-cyan" />}
              {settings.mute ? '음소거 됨' : '음소거 켜기'}
            </button>
          </div>
          
          <div className={`p-4 space-y-5 ${settings.mute ? 'opacity-50 pointer-events-none' : ''}`}>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center"><Volume2 className="w-4 h-4 mr-2 text-arena-text-muted" />전체 음량</span>
                <span className="text-arena-cyan font-bold">{Math.round(settings.master * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={settings.master}
                onChange={(e) => updateAudioSetting('master', parseFloat(e.target.value))}
                className="w-full accent-arena-cyan h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center"><Music className="w-4 h-4 mr-2 text-arena-text-muted" />배경음 (BGM)</span>
                <span className="text-arena-gold font-bold">{Math.round(settings.bgm * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={settings.bgm}
                onChange={(e) => updateAudioSetting('bgm', parseFloat(e.target.value))}
                className="w-full accent-arena-gold h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center"><Zap className="w-4 h-4 mr-2 text-arena-text-muted" />효과음 (SFX)</span>
                <span className="text-arena-success font-bold">{Math.round(settings.sfx * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={settings.sfx}
                onChange={(e) => updateAudioSetting('sfx', parseFloat(e.target.value))}
                className="w-full accent-arena-success h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center"><Mic className="w-4 h-4 mr-2 text-arena-text-muted" />음성 안내</span>
                <span className="text-purple-400 font-bold">{Math.round(settings.voice * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={settings.voice}
                onChange={(e) => updateAudioSetting('voice', parseFloat(e.target.value))}
                className="w-full accent-purple-400 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center"><Eye className="w-4 h-4 mr-2 text-arena-text-muted" />관전 음향</span>
                <span className="text-blue-400 font-bold">{Math.round(settings.spectate * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={settings.spectate}
                onChange={(e) => updateAudioSetting('spectate', parseFloat(e.target.value))}
                className="w-full accent-blue-400 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
          </div>
        </section>

        {/* Play Settings */}
        <section className="bg-arena-card border border-white/10 rounded-2xl p-2">
          <div className="px-4 py-3 border-b border-white/5 flex items-center text-arena-text-muted text-xs font-bold uppercase tracking-wider">
            플레이 설정
          </div>
          <div className="p-2 space-y-1">
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium">
                <Vibrate className="w-5 h-5 mr-3 text-arena-text-muted" /> 진동 (햅틱 피드백)
              </div>
              <button 
                onClick={() => { updateAudioSetting('vibration', !settings.vibration); triggerHaptic('medium'); }} 
                className={`w-12 h-7 rounded-full transition-colors relative ${settings.vibration ? 'bg-arena-cyan' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${settings.vibration ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium">
                <Bot className="w-5 h-5 mr-3 text-arena-text-muted" /> 가상 딜러 표시
              </div>
              <button onClick={() => toggleOption('dealerVisible')} className={`w-12 h-7 rounded-full transition-colors relative ${options.dealerVisible ? 'bg-arena-cyan' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${options.dealerVisible ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium">
                <MessageCircle className="w-5 h-5 mr-3 text-arena-text-muted" /> 음성 안내 (TTS)
              </div>
              <button onClick={() => toggleOption('voiceEnabled')} className={`w-12 h-7 rounded-full transition-colors relative ${options.voiceEnabled ? 'bg-arena-cyan' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${options.voiceEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium pl-8 text-gray-400">
                초보자 음성 설명
              </div>
              <button onClick={() => toggleOption('beginnerHelpVoice')} disabled={!options.voiceEnabled} className={`w-12 h-7 rounded-full transition-colors relative ${options.beginnerHelpVoice ? 'bg-arena-cyan' : 'bg-white/10'} ${!options.voiceEnabled && 'opacity-50'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${options.beginnerHelpVoice ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium pl-8 text-gray-400">
                결과 안내만 사용
              </div>
              <button onClick={() => {
                 gameSettings.updateOption('voiceMode', options.voiceMode === 'all' ? 'result_only' : 'all');
                 setOptions({ ...gameSettings.options });
                 audioManager.playSFX('btn_touch');
                 triggerHaptic('light');
              }} disabled={!options.voiceEnabled} className={`w-12 h-7 rounded-full transition-colors relative ${options.voiceMode === 'result_only' ? 'bg-arena-cyan' : 'bg-white/10'} ${!options.voiceEnabled && 'opacity-50'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${options.voiceMode === 'result_only' ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex flex-col p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium mb-3">
                <MonitorPlay className="w-5 h-5 mr-3 text-arena-text-muted" /> 게임 화면 모드
              </div>
              <div className="flex gap-2 w-full">
                {([
                  ['duel', '대결 스테이지'],
                  ['simple', '심플 모드'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      gameSettings.updateOption('battleLayout', mode);
                      setOptions({ ...gameSettings.options });
                      audioManager.playSFX('btn_touch');
                      triggerHaptic('light');
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors border ${
                      options.battleLayout === mode
                        ? 'bg-arena-gold/20 border-arena-gold text-arena-gold'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-gray-500 text-center">
                {options.battleLayout === 'duel'
                  ? '야간 무대에서 캐릭터가 마주 보고 대결하는 화면입니다.'
                  : '기존 카지노 슬롯형 심플 화면입니다. 게임 중에도 전환할 수 있습니다.'}
              </div>
            </div>

            <div className="flex flex-col p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium mb-3">
                <Zap className="w-5 h-5 mr-3 text-arena-text-muted" /> 성능 모드
              </div>
              <div className="flex gap-2 w-full">
                {(['fancy', 'basic', 'low'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      gameSettings.updateOption('performanceMode', mode);
                      setOptions({ ...gameSettings.options });
                      audioManager.playSFX('btn_touch');
                      triggerHaptic('light');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${
                      options.performanceMode === mode 
                        ? 'bg-arena-cyan/20 border-arena-cyan text-arena-cyan' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {mode === 'fancy' ? '화려하게' : mode === 'basic' ? '기본' : '저사양'}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-gray-500 text-center">
                {options.performanceMode === 'fancy' && '모든 시각 효과 및 파티클이 활성화됩니다.'}
                {options.performanceMode === 'basic' && '불필요한 애니메이션을 줄입니다.'}
                {options.performanceMode === 'low' && '배경 영상, 딜러 애니메이션이 중지되며 최소 효과만 사용합니다.'}
              </div>
            </div>

            <div className="flex flex-col p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium mb-3">
                <MonitorPlay className="w-5 h-5 mr-3 text-arena-text-muted" /> 입장 연출
              </div>
              <div className="flex flex-wrap gap-2 w-full">
                {(['always', 'first_only', 'tournament_only', 'skip'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      gameSettings.updateOption('introMode', mode);
                      setOptions({ ...gameSettings.options });
                      audioManager.playSFX('btn_touch');
                      triggerHaptic('light');
                    }}
                    className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-colors border ${
                      options.introMode === mode 
                        ? 'bg-arena-cyan/20 border-arena-cyan text-arena-cyan' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {mode === 'always' ? '항상' : mode === 'first_only' ? '첫 경기' : mode === 'tournament_only' ? '토너먼트' : '건너뛰기'}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-gray-500 text-center">
                {options.introMode === 'always' && '게임 시작 전 VS 연출을 항상 표시합니다.'}
                {options.introMode === 'first_only' && '접속 후 첫 게임에서만 표시합니다.'}
                {options.introMode === 'tournament_only' && '토너먼트 경기에서만 표시합니다.'}
                {options.introMode === 'skip' && '입장 연출을 생략하고 바로 시작합니다.'}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center text-sm font-medium text-gray-400">
                  연출 음향 끄기
                </div>
                <button 
                  onClick={() => {
                    gameSettings.updateOption('introMute', !options.introMute);
                    setOptions({ ...gameSettings.options });
                    audioManager.playSFX('btn_touch');
                    triggerHaptic('light');
                  }} 
                  className={`w-12 h-7 rounded-full transition-colors relative ${options.introMute ? 'bg-arena-cyan' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${options.introMute ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="flex items-center text-sm font-medium text-gray-400">
                    PC 단축키 가이드 (Q·W·E)
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    대결 스테이지에서 H 키로도 켜고 끌 수 있어요.
                  </span>
                </div>
                <button
                  onClick={() => {
                    gameSettings.updateOption('showKeyGuide', !options.showKeyGuide);
                    setOptions({ ...gameSettings.options });
                    audioManager.playSFX('btn_touch');
                    triggerHaptic('light');
                  }}
                  className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${options.showKeyGuide ? 'bg-arena-gold' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${options.showKeyGuide ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-arena-card border border-white/10 rounded-2xl p-2">
          <div className="px-4 py-3 border-b border-white/5 flex items-center text-arena-text-muted text-xs font-bold uppercase tracking-wider">
            알림 설정
          </div>
          <div className="p-2 space-y-1">
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium">
                <MessageSquare className="w-5 h-5 mr-3 text-arena-text-muted" /> 채팅 알림
              </div>
              <button onClick={() => toggleOther('chatNotify')} className={`w-12 h-7 rounded-full transition-colors relative ${otherSettings.chatNotify ? 'bg-arena-cyan' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${otherSettings.chatNotify ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium">
                <Users className="w-5 h-5 mr-3 text-arena-text-muted" /> 친구 요청 알림
              </div>
              <button onClick={() => toggleOther('friendNotify')} className={`w-12 h-7 rounded-full transition-colors relative ${otherSettings.friendNotify ? 'bg-arena-cyan' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${otherSettings.friendNotify ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center text-sm font-medium">
                <Trophy className="w-5 h-5 mr-3 text-arena-text-muted" /> 토너먼트 알림
              </div>
              <button onClick={() => toggleOther('tournamentNotify')} className={`w-12 h-7 rounded-full transition-colors relative ${otherSettings.tournamentNotify ? 'bg-arena-cyan' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${otherSettings.tournamentNotify ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* System & Account */}
        <section className="bg-arena-card border border-white/10 rounded-2xl p-2">
          <div className="px-4 py-3 border-b border-white/5 flex items-center text-arena-text-muted text-xs font-bold uppercase tracking-wider">
            시스템 및 계정
          </div>
          <div className="p-2 space-y-1">
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center text-sm font-medium">
                <Globe className="w-5 h-5 mr-3 text-arena-text-muted" /> 언어 설정
              </div>
              <span className="text-xs font-bold text-arena-cyan">한국어</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center text-sm font-medium">
                <Smartphone className="w-5 h-5 mr-3 text-arena-text-muted" /> 접속 기기 관리
              </div>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-arena-error">
              <div className="flex items-center text-sm font-medium">
                <LogOut className="w-5 h-5 mr-3" /> 자동 로그아웃 (전체 기기)
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
