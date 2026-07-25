import {
  createRoomBus,
  jitter,
  pickVariant,
  playNoise,
  playTone,
} from '@/utils/audioSynth';
import {
  SOUND_PRESETS,
  type SoundPresetId,
} from '@/utils/soundPresets';

export type SoundEffectType =
  | 'btn_touch' | 'btn_select' | 'menu_open' | 'menu_close' | 'popup_open' | 'alert' | 'error' | 'confirm'
  | 'lobby_bgm' | 'live_switch' | 'card_select' | 'game_start' | 'slot_spin' | 'counter_up' | 'tournament_alert'
  | 'match_start' | 'search_loop' | 'profile_spin' | 'opponent_found' | 'vs_appear' | 'countdown_3' | 'start_sfx'
  | 'rock_btn' | 'scissors_btn' | 'paper_btn' | 'lock_select' | 'opponent_ready' | 'tension_before_reveal'
  | 'attack_get' | 'attack_move' | 'attack_keep' | 'attack_fail'
  | 'round_win' | 'round_lose' | 'final_win' | 'streak_up' | 'rank_up' | 'point_count' | 'final_lose' | 'game_void'
  | 'coin_tick' | 'heartbeat' | 'jackpot' | 'near_miss'
  | 'clash_crush' | 'clash_cut' | 'clash_wrap'
  | 'match_point' | 'comeback' | 'crowd_swell';

export type BgmType = 'lobby' | 'normal_game' | 'attack_game' | 'last_round' | 'tournament_final' | 'win_result';

export type AmbienceTier = 'free' | 'normal' | 'vip';

export type VoiceCue =
  | 'attack'
  | 'rock'
  | 'scissors'
  | 'paper'
  | 'match_point'
  | 'comeback'
  | 'streak'
  | 'win'
  | 'lose'
  | 'steal'
  | 'start';

export type ClashKind = 'cut' | 'wrap' | 'crush';

export interface VolumeSettings {
  master: number;
  bgm: number;
  sfx: number;
  voice: number;
  spectate: number;
  mute: boolean;
  vibration: boolean;
  /** 사운드 프리셋 */
  soundPreset: SoundPresetId;
}

export interface SfxOptions {
  spectate?: boolean;
  pan?: number;
  /** 0.5~1.8 상황 강도 */
  intensity?: number;
  /** 강제 변형 인덱스 */
  variant?: number;
}

export interface RoundOutcomeAudio {
  won: boolean;
  isFinal?: boolean;
  isMatchPoint?: boolean;
  isComeback?: boolean;
  streak?: number;
  awarded?: number;
  pan?: number;
}

const defaultSettings: VolumeSettings = {
  master: 1.0,
  bgm: 0.5,
  sfx: 0.8,
  voice: 0.8,
  spectate: 0.5,
  mute: false,
  vibration: true,
  soundPreset: 'dynamic',
};

export const AUDIO_SETTINGS_EVENT = 'arena:audio-settings';

const VOICE_LINES: Record<VoiceCue, string[]> = {
  attack: ['공격권!', '공격이에요!', '자, 공격!'],
  rock: ['묵!', '묵!'],
  scissors: ['찌!', '찌!'],
  paper: ['빠!', '빠!'],
  match_point: ['매치 포인트!', '결정구!', '마지막!'],
  comeback: ['역전!', '뒤집어!', '역전 찬스!'],
  streak: ['연승!', '연속!', '불꽃 연승!'],
  win: ['승리!', '이겼어요!', '굿 게임!'],
  lose: ['아쉬워요', '다음 판!', '분발해요'],
  steal: ['탈환!', '공격권 가져왔어요!', '스틸!'],
  start: ['시작!', '레디!', '대결 시작!'],
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private currentBgm: BgmType | null = null;
  private currentBgmGainNode: GainNode | null = null;
  private bgmLoopTimer: ReturnType<typeof setInterval> | null = null;
  private bgmActiveOscillators: OscillatorNode[] = [];
  private speechSynthesis: SpeechSynthesis | null = null;
  private voiceInstance: SpeechSynthesisUtterance | null = null;
  public ambienceTier: AmbienceTier = 'normal';

  private masterBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private roomBus: ReturnType<typeof createRoomBus> | null = null;
  private duckGain: GainNode | null = null;

  private ambienceTimer: ReturnType<typeof setInterval> | null = null;
  private ambienceOn = false;

  private lastVariant = new Map<string, number>();
  private lastVoiceCue: VoiceCue | null = null;
  private lastVoiceAt = 0;

  public settings: VolumeSettings = { ...defaultSettings };

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', this.initContext, { once: true });
      window.addEventListener('click', this.initContext, { once: true });
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
      }
    }
  }

  private initContext = () => {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterBus = this.ctx.createGain();
      this.duckGain = this.ctx.createGain();
      this.duckGain.gain.value = 1;
      this.sfxBus = this.ctx.createGain();
      this.roomBus = createRoomBus(this.ctx, 0.16);
      this.sfxBus.connect(this.roomBus.input);
      this.roomBus.output.connect(this.duckGain);
      this.duckGain.connect(this.masterBus);
      this.masterBus.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  };

  private ensureGraph() {
    this.initContext();
    return !!(this.ctx && this.sfxBus && this.masterBus);
  }

  public loadSettings() {
    try {
      const saved = localStorage.getItem('arena_audio_settings');
      if (saved) {
        this.settings = { ...defaultSettings, ...JSON.parse(saved) };
        if (!this.settings.soundPreset) this.settings.soundPreset = 'dynamic';
      }
    } catch (e) {
      console.error('Failed to load audio settings', e);
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem('arena_audio_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save audio settings', e);
    }
    this.updateCurrentBgmVolume();
  }

  public updateSetting<K extends keyof VolumeSettings>(key: K, value: VolumeSettings[K]) {
    this.settings[key] = value;
    this.applyMuteState();
    this.saveSettings();
    this.broadcastSettings();
  }

  /** 프리셋 적용 — 볼륨·보이스 콜 정책 일괄 반영 */
  public applySoundPreset(id: SoundPresetId) {
    const p = SOUND_PRESETS[id];
    this.settings.soundPreset = id;
    this.settings.master = p.master;
    this.settings.bgm = p.bgm;
    this.settings.sfx = p.sfx;
    this.settings.voice = p.voice;
    this.settings.spectate = p.spectate;
    this.applyMuteState();
    this.saveSettings();
    this.broadcastSettings();
    if (p.ambience && this.ambienceOn) this.startAmbience();
    else if (!p.ambience) this.stopAmbience();
  }

  public getPreset(): SoundPresetId {
    return this.settings.soundPreset ?? 'default';
  }

  public getIntensityBoost(): number {
    return SOUND_PRESETS[this.getPreset()]?.intensityBoost ?? 1;
  }

  public voiceCallsEnabled(): boolean {
    if (this.settings.mute) return false;
    return SOUND_PRESETS[this.getPreset()]?.voiceCalls !== false && this.settings.voice > 0.05;
  }

  private broadcastSettings() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(AUDIO_SETTINGS_EVENT, { detail: { ...this.settings } }),
      );
    }
  }

  private applyMuteState() {
    this.updateCurrentBgmVolume();
    if (this.settings.mute && this.speechSynthesis) {
      try {
        this.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
  }

  public reloadAndApplySettings() {
    this.loadSettings();
    this.applyMuteState();
    this.broadcastSettings();
  }

  public setAmbienceTier(tier: AmbienceTier) {
    this.ambienceTier = tier;
    if (this.ambienceOn) {
      this.stopAmbience();
      this.startAmbience();
    }
  }

  private getEffectiveVolume(type: 'sfx' | 'bgm' | 'voice' | 'spectate') {
    if (this.settings.mute) return 0;
    return this.settings.master * this.settings[type];
  }

  private nextVariant(key: string, count: number, forced?: number): number {
    if (forced != null) {
      this.lastVariant.set(key, forced);
      return forced % count;
    }
    const last = this.lastVariant.get(key) ?? -1;
    const next = pickVariant(count, last);
    this.lastVariant.set(key, next);
    return next;
  }

  /** 중요 순간 BGM 덕킹 */
  public duckBgm(ms = 450, depth = 0.22) {
    if (!this.ensureGraph() || !this.duckGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.duckGain.gain;
    try {
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(depth, t + 0.04);
      g.linearRampToValueAtTime(1, t + ms / 1000);
    } catch {
      /* ignore */
    }
  }

  // --- Ambience ---

  public startAmbience() {
    if (!SOUND_PRESETS[this.getPreset()]?.ambience) return;
    this.ambienceOn = true;
    if (this.ambienceTimer) return;
    if (!this.ensureGraph() || !this.ctx || !this.sfxBus) return;

    const tick = () => {
      if (!this.ambienceOn || !this.ctx || !this.sfxBus || this.settings.mute) return;
      const vol = this.getEffectiveVolume('sfx') * (this.ambienceTier === 'vip' ? 0.08 : this.ambienceTier === 'free' ? 0.035 : 0.055);
      if (vol <= 0) return;
      const t = this.ctx.currentTime;
      // 홀 소음: 저역 노이즈 펄스
      playNoise(this.ctx, this.sfxBus, {
        start: t,
        duration: jitter(0.35, 0.2),
        peak: vol,
        filterFreq: this.ambienceTier === 'vip' ? 600 : 900,
        filterType: 'lowpass',
        pan: jitter(0, 0.4),
      });
      if (this.ambienceTier === 'vip' && Math.random() > 0.55) {
        playTone(this.ctx, this.sfxBus, {
          type: 'sine',
          freq: jitter(180, 0.1),
          start: t,
          duration: 0.5,
          peak: vol * 0.4,
          pan: jitter(0, 0.6),
        });
      }
    };
    tick();
    this.ambienceTimer = setInterval(tick, this.ambienceTier === 'vip' ? 2200 : 3200);
  }

  public stopAmbience() {
    this.ambienceOn = false;
    if (this.ambienceTimer) {
      clearInterval(this.ambienceTimer);
      this.ambienceTimer = null;
    }
  }

  // --- Voice ---

  public speak(text: string) {
    if (this.settings.mute || !this.speechSynthesis) return;
    const vol = this.getEffectiveVolume('voice');
    if (vol <= 0) return;

    this.speechSynthesis.cancel();
    this.voiceInstance = new SpeechSynthesisUtterance(text);
    this.voiceInstance.volume = vol;
    const voices = this.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.includes('ko'));
    if (koVoice) this.voiceInstance.voice = koVoice;
    this.voiceInstance.pitch = 1.12;
    this.voiceInstance.rate = 1.08;
    this.speechSynthesis.speak(this.voiceInstance);
  }

  /** 짧은 보이스 콜 — 변형·쿨다운 */
  public callVoice(cue: VoiceCue, force = false) {
    if (!this.voiceCallsEnabled() && !force) return;
    const now = Date.now();
    if (!force && now - this.lastVoiceAt < 900 && this.lastVoiceCue === cue) return;
    const lines = VOICE_LINES[cue];
    if (!lines?.length) return;
    let idx = Math.floor(Math.random() * lines.length);
    if (lines.length > 1 && cue === this.lastVoiceCue) {
      idx = (idx + 1) % lines.length;
    }
    this.lastVoiceCue = cue;
    this.lastVoiceAt = now;
    this.speak(lines[idx]);
  }

  // --- High-level gameplay helpers ---

  public playClashImpact(kind: ClashKind, opts?: SfxOptions) {
    const map: Record<ClashKind, SoundEffectType> = {
      crush: 'clash_crush',
      cut: 'clash_cut',
      wrap: 'clash_wrap',
    };
    this.duckBgm(520, 0.18);
    this.playSFX(map[kind], { ...opts, intensity: (opts?.intensity ?? 1.15) * this.getIntensityBoost() });
  }

  public playRoundOutcome(opts: RoundOutcomeAudio) {
    const boost = this.getIntensityBoost();
    const intensity =
      (opts.isFinal ? 1.4 : opts.isMatchPoint ? 1.25 : opts.isComeback ? 1.2 : 1) * boost;

    if (opts.isFinal) {
      this.duckBgm(900, 0.12);
      this.playSFX(opts.won ? 'final_win' : 'final_lose', { intensity, pan: opts.pan });
      if (opts.won) this.playSFX('crowd_swell', { intensity: intensity * 0.9 });
      this.callVoice(opts.won ? 'win' : 'lose');
      return;
    }

    if (opts.won) {
      this.duckBgm(400, 0.28);
      this.playSFX('round_win', { intensity, pan: opts.pan });
      if ((opts.awarded ?? 1) >= 2) this.playSFX('jackpot', { intensity: intensity * 0.7 });
      if (opts.isComeback) {
        this.playSFX('comeback', { intensity });
        this.callVoice('comeback');
      } else if (opts.isMatchPoint) {
        this.playSFX('match_point', { intensity: intensity * 0.85 });
      }
      if ((opts.streak ?? 0) >= 2) {
        this.playSFX('streak_up', { intensity: 0.9 + Math.min(0.5, (opts.streak ?? 0) * 0.08) });
        if ((opts.streak ?? 0) >= 3) this.callVoice('streak');
      }
    } else {
      this.playSFX('round_lose', { intensity, pan: opts.pan });
    }
  }

  public playHandSelect(hand: 'ROCK' | 'SCISSORS' | 'PAPER', opts?: SfxOptions) {
    const type: SoundEffectType =
      hand === 'ROCK' ? 'rock_btn' : hand === 'SCISSORS' ? 'scissors_btn' : 'paper_btn';
    this.playSFX(type, opts);
    if (Math.random() > 0.55) {
      this.callVoice(hand === 'ROCK' ? 'rock' : hand === 'SCISSORS' ? 'scissors' : 'paper');
    }
  }

  // --- Sound Effects ---

  public playSFX(type: SoundEffectType, options?: SfxOptions) {
    if (this.settings.mute) return;
    const vol = this.getEffectiveVolume(options?.spectate ? 'spectate' : 'sfx');
    if (vol <= 0) return;
    if (!this.ensureGraph() || !this.ctx || !this.sfxBus) return;

    const intensity = Math.max(0.4, Math.min(1.8, options?.intensity ?? 1));
    const peak = vol * intensity;
    const t = this.ctx.currentTime + Math.random() * 0.008;
    const pan = options?.pan;
    const v = this.nextVariant(type, 4, options?.variant);
    const pitch = jitter(1, 0.04);
    const dest = this.sfxBus;

    switch (type) {
      case 'btn_touch':
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 600 * pitch,
          endFreq: 820 * pitch,
          start: t,
          duration: 0.09,
          peak: peak * 0.28,
          pan,
        });
        break;

      case 'btn_select':
      case 'confirm':
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 420 * pitch,
          endFreq: 680 * pitch,
          start: t,
          duration: 0.14,
          peak: peak * 0.35,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 840 * pitch,
          start: t + 0.04,
          duration: 0.1,
          peak: peak * 0.18,
          pan,
        });
        break;

      case 'error':
      case 'alert':
        playTone(this.ctx, dest, {
          type: 'sawtooth',
          freq: 320 * pitch,
          endFreq: 180 * pitch,
          start: t,
          duration: 0.28,
          peak: peak * 0.35,
          pan,
        });
        break;

      case 'game_start':
      case 'start_sfx':
      case 'match_start': {
        const notes = [440, 554, 659, 880].map((f) => f * pitch);
        notes.forEach((freq, i) => {
          playTone(this.ctx!, dest, {
            type: i % 2 ? 'triangle' : 'square',
            freq,
            start: t + i * 0.09,
            duration: 0.28,
            peak: peak * (0.32 - i * 0.03),
            pan,
          });
        });
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.12,
          peak: peak * 0.15,
          filterFreq: 2000,
          pan,
        });
        break;
      }

      case 'rock_btn':
      case 'clash_crush': {
        // 묵: 저음 임팩트 + 노이즈 충돌
        const vars = [
          { f: 90, n: 280 },
          { f: 110, n: 320 },
          { f: 75, n: 240 },
          { f: 100, n: 360 },
        ][v];
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: vars.f * pitch,
          endFreq: vars.f * 0.55 * pitch,
          start: t,
          duration: 0.28,
          peak: peak * 0.7,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'square',
          freq: vars.f * 1.8 * pitch,
          endFreq: vars.f * pitch,
          start: t,
          duration: 0.16,
          peak: peak * 0.28,
          pan,
        });
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.14,
          peak: peak * 0.45,
          filterFreq: vars.n,
          filterType: 'lowpass',
          pan,
        });
        break;
      }

      case 'scissors_btn':
      case 'clash_cut': {
        const vars = [1400, 1600, 1200, 1800][v];
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.1,
          peak: peak * 0.4,
          filterFreq: vars * pitch,
          filterType: 'highpass',
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'sawtooth',
          freq: vars * 0.6 * pitch,
          endFreq: vars * pitch,
          start: t,
          duration: 0.12,
          peak: peak * 0.32,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: vars * 1.2 * pitch,
          endFreq: vars * 0.8 * pitch,
          start: t + 0.04,
          duration: 0.1,
          peak: peak * 0.2,
          pan,
        });
        break;
      }

      case 'paper_btn':
      case 'clash_wrap': {
        const vars = [380, 420, 340, 460][v];
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.22,
          peak: peak * 0.28,
          filterFreq: 2400,
          filterType: 'bandpass',
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: vars * pitch,
          endFreq: vars * 1.35 * pitch,
          start: t,
          duration: 0.32,
          peak: peak * 0.42,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: vars * 2 * pitch,
          start: t + 0.05,
          duration: 0.2,
          peak: peak * 0.18,
          pan,
        });
        break;
      }

      case 'lock_select':
        playTone(this.ctx, dest, {
          type: 'square',
          freq: 520 * pitch,
          start: t,
          duration: 0.08,
          peak: peak * 0.3,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 780 * pitch,
          start: t + 0.06,
          duration: 0.1,
          peak: peak * 0.25,
          pan,
        });
        break;

      case 'opponent_ready':
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 660 * pitch,
          endFreq: 880 * pitch,
          start: t,
          duration: 0.18,
          peak: peak * 0.3,
          pan: pan ?? 0.4,
        });
        break;

      case 'tension_before_reveal':
      case 'heartbeat': {
        // 심장박동 2연타 + 상승 톤
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 85 * pitch,
          endFreq: 50 * pitch,
          start: t,
          duration: 0.14,
          peak: peak * 0.5,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 95 * pitch,
          endFreq: 55 * pitch,
          start: t + 0.16,
          duration: 0.14,
          peak: peak * 0.42,
          pan,
        });
        if (type === 'tension_before_reveal') {
          playTone(this.ctx, dest, {
            type: 'sine',
            freq: 220 * pitch,
            endFreq: 480 * pitch,
            start: t,
            duration: 0.55,
            peak: peak * 0.18,
            curve: 'lin',
            pan,
          });
          playNoise(this.ctx, dest, {
            start: t + 0.2,
            duration: 0.35,
            peak: peak * 0.08,
            filterFreq: 700,
            filterType: 'lowpass',
            pan,
          });
        }
        break;
      }

      case 'slot_spin': {
        for (let i = 0; i < 5; i++) {
          playTone(this.ctx, dest, {
            type: 'sawtooth',
            freq: (220 - i * 28) * pitch,
            start: t + i * 0.05,
            duration: 0.08,
            peak: peak * (0.18 - i * 0.02),
            pan: pan ?? (i % 2 ? -0.3 : 0.3),
          });
        }
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.28,
          peak: peak * 0.12,
          filterFreq: 1500,
          pan,
        });
        break;
      }

      case 'attack_get': {
        [600, 900, 1200, 1600].forEach((f, i) => {
          playTone(this.ctx!, dest, {
            type: 'sine',
            freq: f * pitch,
            start: t + i * 0.06,
            duration: 0.22,
            peak: peak * 0.28,
            pan,
          });
        });
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.15,
          peak: peak * 0.15,
          filterFreq: 3000,
          pan,
        });
        break;
      }

      case 'attack_fail':
        playTone(this.ctx, dest, {
          type: 'sawtooth',
          freq: 360 * pitch,
          endFreq: 160 * pitch,
          start: t,
          duration: 0.35,
          peak: peak * 0.35,
          pan,
        });
        break;

      case 'attack_move':
      case 'attack_keep': {
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 520 * pitch,
          endFreq: 320 * pitch,
          start: t,
          duration: 0.28,
          peak: peak * 0.38,
          pan: pan ?? 0,
        });
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 780 * pitch,
          endFreq: 520 * pitch,
          start: t + 0.05,
          duration: 0.22,
          peak: peak * 0.2,
          pan: pan ?? 0,
        });
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.18,
          peak: peak * 0.12,
          filterFreq: 1800,
          pan: pan ?? 0,
        });
        break;
      }

      case 'round_win': {
        const chords = [
          [523.25, 659.25, 783.99],
          [554.37, 698.46, 830.61],
          [587.33, 739.99, 880],
          [523.25, 698.46, 987.77],
        ][v];
        chords.forEach((freq, i) => {
          playTone(this.ctx!, dest, {
            type: i === 0 ? 'square' : 'triangle',
            freq: freq * pitch,
            start: t + i * 0.07,
            duration: 0.35,
            peak: peak * (0.32 - i * 0.04),
            pan,
          });
        });
        break;
      }

      case 'round_lose':
        playTone(this.ctx, dest, {
          type: 'sawtooth',
          freq: 280 * pitch,
          endFreq: 140 * pitch,
          start: t,
          duration: 0.4,
          peak: peak * 0.35,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 210 * pitch,
          endFreq: 120 * pitch,
          start: t + 0.08,
          duration: 0.35,
          peak: peak * 0.2,
          pan,
        });
        break;

      case 'final_win':
      case 'jackpot': {
        const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1046.5];
        fanfare.forEach((freq, i) => {
          playTone(this.ctx!, dest, {
            type: i % 2 ? 'triangle' : 'square',
            freq: freq * pitch,
            start: t + i * 0.09,
            duration: 0.35,
            peak: peak * 0.4,
            pan: pan ?? (i % 2 ? -0.2 : 0.2),
          });
        });
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.4,
          peak: peak * 0.18,
          filterFreq: 2500,
          pan,
        });
        break;
      }

      case 'final_lose':
        playTone(this.ctx, dest, {
          type: 'sawtooth',
          freq: 300 * pitch,
          endFreq: 90 * pitch,
          start: t,
          duration: 0.7,
          peak: peak * 0.4,
          pan,
        });
        break;

      case 'streak_up':
      case 'rank_up': {
        [660, 880, 1100, 1320].forEach((freq, i) => {
          playTone(this.ctx!, dest, {
            type: 'sine',
            freq: freq * pitch,
            start: t + i * 0.05,
            duration: 0.2,
            peak: peak * 0.28,
            pan,
          });
        });
        break;
      }

      case 'match_point':
        playTone(this.ctx, dest, {
          type: 'square',
          freq: 440 * pitch,
          start: t,
          duration: 0.12,
          peak: peak * 0.4,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'square',
          freq: 440 * pitch,
          start: t + 0.16,
          duration: 0.12,
          peak: peak * 0.4,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 880 * pitch,
          start: t + 0.32,
          duration: 0.28,
          peak: peak * 0.35,
          pan,
        });
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.45,
          peak: peak * 0.1,
          filterFreq: 800,
          filterType: 'lowpass',
          pan,
        });
        break;

      case 'comeback': {
        [392, 494, 587, 784, 988].forEach((freq, i) => {
          playTone(this.ctx!, dest, {
            type: 'triangle',
            freq: freq * pitch,
            start: t + i * 0.07,
            duration: 0.28,
            peak: peak * 0.32,
            pan: pan ?? (i % 2 ? -0.25 : 0.25),
          });
        });
        break;
      }

      case 'crowd_swell':
        playNoise(this.ctx, dest, {
          start: t,
          duration: 0.7,
          peak: peak * 0.22,
          filterFreq: 1200,
          filterType: 'bandpass',
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 180 * pitch,
          endFreq: 240 * pitch,
          start: t,
          duration: 0.6,
          peak: peak * 0.15,
          curve: 'lin',
          pan,
        });
        break;

      case 'game_void':
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 300 * pitch,
          endFreq: 260 * pitch,
          start: t,
          duration: 0.15,
          peak: peak * 0.28,
          pan,
        });
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 260 * pitch,
          endFreq: 300 * pitch,
          start: t + 0.12,
          duration: 0.15,
          peak: peak * 0.24,
          pan,
        });
        break;

      case 'near_miss':
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: 620 * pitch,
          endFreq: 240 * pitch,
          start: t,
          duration: 0.55,
          peak: peak * 0.35,
          pan,
        });
        playNoise(this.ctx, dest, {
          start: t + 0.1,
          duration: 0.35,
          peak: peak * 0.12,
          filterFreq: 900,
          pan,
        });
        break;

      case 'countdown_3':
        playTone(this.ctx, dest, {
          type: 'square',
          freq: 880 * pitch,
          start: t,
          duration: 0.1,
          peak: peak * 0.4,
          pan,
        });
        break;

      case 'coin_tick':
      case 'counter_up':
      case 'point_count': {
        const base = type === 'point_count' ? 900 : 720 + Math.random() * 200;
        playTone(this.ctx, dest, {
          type: 'triangle',
          freq: base * pitch,
          endFreq: base * 1.35 * pitch,
          start: t,
          duration: 0.07,
          peak: peak * 0.22,
          pan,
        });
        break;
      }

      case 'card_select':
      case 'menu_open':
      case 'popup_open':
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 540 * pitch,
          endFreq: 720 * pitch,
          start: t,
          duration: 0.12,
          peak: peak * 0.3,
          pan,
        });
        break;

      case 'menu_close':
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 720 * pitch,
          endFreq: 480 * pitch,
          start: t,
          duration: 0.1,
          peak: peak * 0.25,
          pan,
        });
        break;

      default:
        playTone(this.ctx, dest, {
          type: 'sine',
          freq: 500 * pitch,
          endFreq: 320 * pitch,
          start: t,
          duration: 0.1,
          peak: peak * 0.28,
          pan,
        });
        break;
    }
  }

  // --- BGM ---

  private getBgmPattern(type: BgmType): { notes: number[]; stepMs: number; wave: OscillatorType } {
    switch (type) {
      case 'lobby':
        return {
          notes: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25],
          stepMs: 220,
          wave: 'triangle',
        };
      case 'normal_game':
        return {
          notes: [392.0, 493.88, 587.33, 659.25, 587.33, 493.88, 523.25, 659.25],
          stepMs: 180,
          wave: 'triangle',
        };
      case 'attack_game':
        return {
          notes: [440.0, 554.37, 659.25, 880.0, 659.25, 554.37, 493.88, 659.25],
          stepMs: 145,
          wave: 'square',
        };
      case 'last_round':
        return {
          notes: [523.25, 622.25, 783.99, 932.33, 783.99, 622.25, 698.46, 932.33],
          stepMs: 120,
          wave: 'square',
        };
      case 'tournament_final':
        return {
          notes: [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 523.25, 783.99],
          stepMs: 160,
          wave: 'triangle',
        };
      case 'win_result':
        return {
          notes: [523.25, 659.25, 783.99, 1046.5, 1174.66, 1046.5, 783.99, 659.25],
          stepMs: 200,
          wave: 'sine',
        };
      default:
        return {
          notes: [523.25, 659.25, 783.99, 659.25],
          stepMs: 200,
          wave: 'triangle',
        };
    }
  }

  private stopBgmLoop(fadeMs = 400) {
    if (this.bgmLoopTimer != null) {
      clearInterval(this.bgmLoopTimer);
      this.bgmLoopTimer = null;
    }
    if (this.currentBgmGainNode && this.ctx) {
      const t = this.ctx.currentTime;
      const fade = Math.max(0.05, fadeMs / 1000);
      try {
        this.currentBgmGainNode.gain.cancelScheduledValues(t);
        this.currentBgmGainNode.gain.setValueAtTime(this.currentBgmGainNode.gain.value, t);
        this.currentBgmGainNode.gain.linearRampToValueAtTime(0, t + fade);
      } catch {
        /* ignore */
      }
    }
    const oscs = this.bgmActiveOscillators.splice(0);
    window.setTimeout(() => {
      oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          /* ignore */
        }
      });
    }, fadeMs + 50);
    this.currentBgmGainNode = null;
  }

  private playBgmPluck(
    freq: number,
    wave: OscillatorType,
    gainBus: GainNode,
    peak: number,
  ) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    noteGain.gain.setValueAtTime(0.0001, t);
    noteGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(noteGain);
    noteGain.connect(gainBus);
    osc.start(t);
    osc.stop(t + 0.18);
    this.bgmActiveOscillators.push(osc);
    osc.onended = () => {
      const idx = this.bgmActiveOscillators.indexOf(osc);
      if (idx >= 0) this.bgmActiveOscillators.splice(idx, 1);
      try {
        osc.disconnect();
        noteGain.disconnect();
      } catch {
        /* ignore */
      }
    };
  }

  public playBGM(type: BgmType) {
    if (this.currentBgm === type) return;
    this.initContext();
    if (!this.ctx || !this.masterBus) return;

    this.stopBgmLoop(350);
    this.currentBgm = type;

    const vol = this.getEffectiveVolume('bgm');
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    if (vol > 0) {
      gain.gain.linearRampToValueAtTime(vol * 0.22, this.ctx.currentTime + 0.25);
    }
    // BGM은 duckGain 앞단에 연결해 중요 SFX 때 자동 덕킹
    if (this.duckGain) gain.connect(this.duckGain);
    else gain.connect(this.masterBus);
    this.currentBgmGainNode = gain;

    const pattern = this.getBgmPattern(type);
    let step = 0;
    const tick = () => {
      if (!this.ctx || this.currentBgm !== type || !this.currentBgmGainNode) return;
      const bus = this.currentBgmGainNode;
      const tier = this.ambienceTier;
      const tierGain = tier === 'vip' ? 0.32 : tier === 'free' ? 0.22 : 0.28;
      // last_round / attack 은 타악기 느낌 추가 피크
      const modeBoost =
        type === 'last_round' ? 1.15 : type === 'attack_game' ? 1.08 : type === 'win_result' ? 1.05 : 1;
      const peak = this.getEffectiveVolume('bgm') * tierGain * modeBoost;
      if (peak <= 0) return;
      const freq = pattern.notes[step % pattern.notes.length];
      this.playBgmPluck(freq, pattern.wave, bus, peak);

      if (step % 2 === 0) {
        this.playBgmPluck(freq * 1.5, 'sine', bus, peak * 0.35);
      }

      // 공격/라스트: 킥 느낌의 저음
      if ((type === 'attack_game' || type === 'last_round') && step % 2 === 0) {
        this.playBgmPluck(freq / 2, 'sine', bus, peak * 0.4);
      }

      if (tier === 'vip') {
        this.playBgmPluck(freq * 2, 'sine', bus, peak * 0.22);
        if (step % 4 === 0) {
          this.playBgmPluck(freq / 2, 'triangle', bus, peak * 0.3);
        }
      } else if (tier === 'free') {
        if (step % 4 === 0) {
          this.playBgmPluck(freq * 1.5, 'sine', bus, peak * 0.25);
        }
      }
      step += 1;
    };
    tick();
    this.bgmLoopTimer = setInterval(tick, pattern.stepMs);
  }

  public stopBGM() {
    this.stopBgmLoop(500);
    this.currentBgm = null;
  }

  public updateCurrentBgmVolume() {
    if (this.currentBgmGainNode && this.ctx) {
      const vol = this.getEffectiveVolume('bgm');
      const t = this.ctx.currentTime;
      try {
        this.currentBgmGainNode.gain.cancelScheduledValues(t);
        this.currentBgmGainNode.gain.setValueAtTime(this.currentBgmGainNode.gain.value, t);
        this.currentBgmGainNode.gain.linearRampToValueAtTime(vol * 0.22, t + 0.1);
      } catch {
        /* ignore */
      }
    }
  }
}

export const audioManager = new AudioManager();
