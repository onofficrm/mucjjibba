import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Vibrate,
  Zap,
  MonitorPlay,
  Music,
  Mic,
} from 'lucide-react';
import { audioManager, AUDIO_SETTINGS_EVENT, type VolumeSettings } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { gameSettings, type GameOptions } from '@/utils/gameSettings';
import { SOUND_PRESET_IDS, SOUND_PRESETS, type SoundPresetId } from '@/utils/soundPresets';
import { TEMPO_PRESET_IDS, TEMPO_PRESET_META, type TempoPreset } from '@/game/combatTiming';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** 게임 중 설정 — 페이지 이탈 없이 오버레이로 표시 */
export function InGameSettingsModal({ open, onClose }: Props) {
  const [settings, setSettings] = useState<VolumeSettings>(audioManager.settings);
  const [options, setOptions] = useState<GameOptions>(gameSettings.options);

  useEffect(() => {
    if (!open) return;
    setSettings({ ...audioManager.settings });
    setOptions({ ...gameSettings.options });
    const onChange = () => setSettings({ ...audioManager.settings });
    window.addEventListener(AUDIO_SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(AUDIO_SETTINGS_EVENT, onChange);
  }, [open]);

  if (!open) return null;

  const updateAudio = <K extends keyof VolumeSettings>(key: K, value: VolumeSettings[K]) => {
    audioManager.updateSetting(key, value);
    setSettings({ ...audioManager.settings });
    if (key !== 'mute') audioManager.playSFX('btn_touch');
  };

  const updateOption = <K extends keyof GameOptions>(key: K, value: GameOptions[K]) => {
    gameSettings.updateOption(key, value);
    setOptions({ ...gameSettings.options });
    audioManager.playSFX('btn_touch');
    triggerHaptic('light');
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/95 backdrop-blur-md">
          <h3 className="text-lg font-black text-white">게임 설정</h3>
          <button
            type="button"
            onClick={() => {
              audioManager.playSFX('btn_select');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 pb-8">
          <section className="bg-arena-card/80 border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-arena-text-muted mb-1">
              게임 템포
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TEMPO_PRESET_IDS.map((id) => {
                const p = TEMPO_PRESET_META[id];
                const active = (options.combatTempo ?? 'default') === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateOption('combatTempo', id as TempoPreset)}
                    className={`text-center px-2 py-2.5 rounded-xl border transition-colors ${
                      active
                        ? 'border-arena-cyan bg-arena-cyan/15 text-arena-cyan'
                        : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="text-[11px] font-black">{p.label}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500 leading-snug">
              {TEMPO_PRESET_META[options.combatTempo ?? 'default'].description}
            </p>
            <button
              type="button"
              onClick={() => updateOption('showRuleCard', !(options.showRuleCard !== false))}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium ${
                options.showRuleCard !== false
                  ? 'border-arena-gold/40 bg-arena-gold/10 text-arena-gold'
                  : 'border-white/10 bg-white/5 text-gray-300'
              }`}
            >
              <span>시작 전 룰 카드</span>
              <span className="text-xs font-bold">
                {options.showRuleCard !== false ? 'ON' : 'OFF'}
              </span>
            </button>
          </section>

          <section className="bg-arena-card/80 border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-arena-text-muted mb-1">
              사운드 프리셋
            </div>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
                      active
                        ? 'border-arena-gold bg-arena-gold/15 text-arena-gold'
                        : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="text-xs font-black">{p.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{p.description}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-arena-card/80 border border-white/10 rounded-2xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-arena-text-muted">사운드</span>
              <button
                type="button"
                onClick={() => {
                  updateAudio('mute', !settings.mute);
                  triggerHaptic('medium');
                }}
                className="flex items-center gap-1 text-xs font-bold text-white bg-white/10 px-2 py-1 rounded-md"
              >
                {settings.mute ? (
                  <VolumeX className="w-4 h-4 text-arena-error" />
                ) : (
                  <Volume2 className="w-4 h-4 text-arena-cyan" />
                )}
                {settings.mute ? '음소거' : '소리 ON'}
              </button>
            </div>
            {(
              [
                ['master', '마스터', Volume2],
                ['bgm', 'BGM', Music],
                ['sfx', '효과음', Zap],
                ['voice', '보이스', Mic],
              ] as const
            ).map(([key, label, Icon]) => (
              <label key={key} className="flex items-center gap-3 text-sm">
                <Icon className="w-4 h-4 text-arena-text-muted shrink-0" />
                <span className="w-14 text-gray-300 font-medium">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings[key]}
                  disabled={settings.mute}
                  onChange={(e) => updateAudio(key, Number(e.target.value))}
                  className="flex-1 accent-arena-cyan disabled:opacity-40"
                />
              </label>
            ))}
          </section>

          <section className="bg-arena-card/80 border border-white/10 rounded-2xl p-3 space-y-3">
            <div className="flex items-center text-xs font-bold uppercase tracking-wider text-arena-text-muted mb-1">
              <MonitorPlay className="w-4 h-4 mr-2" /> 화면
            </div>
            <div className="flex gap-2">
              {([
                ['duel', '대결 스테이지'],
                ['simple', '심플 모드'],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateOption('battleLayout', mode)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-colors ${
                    options.battleLayout === mode
                      ? 'bg-arena-gold/20 border-arena-gold text-arena-gold'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {(['fancy', 'basic', 'low'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateOption('performanceMode', mode)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                    options.performanceMode === mode
                      ? 'bg-arena-cyan/20 border-arena-cyan text-arena-cyan'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {mode === 'fancy' ? '화려' : mode === 'basic' ? '기본' : '저사양'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => updateOption('reduceAnimations', !options.reduceAnimations)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium ${
                options.reduceAnimations
                  ? 'border-arena-cyan/40 bg-arena-cyan/10 text-arena-cyan'
                  : 'border-white/10 bg-white/5 text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" /> 애니메이션 줄이기
              </span>
              <span className="text-xs font-bold">{options.reduceAnimations ? 'ON' : 'OFF'}</span>
            </button>
          </section>

          <section className="bg-arena-card/80 border border-white/10 rounded-2xl p-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                audioManager.playSFX('btn_touch');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300"
            >
              <span className="flex items-center gap-2">
                <Vibrate className="w-4 h-4" /> 햅틱 테스트
              </span>
              <span className="text-xs text-arena-text-muted">탭</span>
            </button>
          </section>

          <button
            type="button"
            onClick={() => {
              audioManager.playSFX('confirm');
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-arena-gold text-black font-black text-sm"
          >
            적용하고 계속하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
