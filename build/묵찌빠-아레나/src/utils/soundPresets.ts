/** 사운드 프리셋 — 장시간 플레이 피로도 조절 */

export type SoundPresetId = 'dynamic' | 'default' | 'quiet' | 'sfx_only' | 'voice_off';

export interface SoundPreset {
  id: SoundPresetId;
  label: string;
  description: string;
  master: number;
  bgm: number;
  sfx: number;
  voice: number;
  spectate: number;
  /** 상황 강도 배율 (매치포인트·연승 등) */
  intensityBoost: number;
  voiceCalls: boolean;
  ambience: boolean;
}

export const SOUND_PRESETS: Record<SoundPresetId, SoundPreset> = {
  dynamic: {
    id: 'dynamic',
    label: '역동적',
    description: '효과음·보이스·앰비언스를 풍성하게',
    master: 1,
    bgm: 0.45,
    sfx: 0.95,
    voice: 0.9,
    spectate: 0.55,
    intensityBoost: 1.25,
    voiceCalls: true,
    ambience: true,
  },
  default: {
    id: 'default',
    label: '기본',
    description: '균형 잡힌 기본 사운드',
    master: 1,
    bgm: 0.5,
    sfx: 0.8,
    voice: 0.8,
    spectate: 0.5,
    intensityBoost: 1,
    voiceCalls: true,
    ambience: true,
  },
  quiet: {
    id: 'quiet',
    label: '조용하게',
    description: '볼륨을 낮추고 자극을 줄임',
    master: 0.7,
    bgm: 0.28,
    sfx: 0.5,
    voice: 0.45,
    spectate: 0.3,
    intensityBoost: 0.85,
    voiceCalls: false,
    ambience: false,
  },
  sfx_only: {
    id: 'sfx_only',
    label: '효과음만',
    description: 'BGM·보이스 없이 타격감만',
    master: 1,
    bgm: 0,
    sfx: 0.9,
    voice: 0,
    spectate: 0.4,
    intensityBoost: 1.1,
    voiceCalls: false,
    ambience: true,
  },
  voice_off: {
    id: 'voice_off',
    label: '보이스 끄기',
    description: '안내 음성만 끄고 효과음 유지',
    master: 1,
    bgm: 0.5,
    sfx: 0.85,
    voice: 0,
    spectate: 0.5,
    intensityBoost: 1,
    voiceCalls: false,
    ambience: true,
  },
};

export const SOUND_PRESET_IDS: SoundPresetId[] = [
  'dynamic',
  'default',
  'quiet',
  'sfx_only',
  'voice_off',
];
