export type SoundEffectType = 
  | 'btn_touch' | 'btn_select' | 'menu_open' | 'menu_close' | 'popup_open' | 'alert' | 'error' | 'confirm'
  | 'lobby_bgm' | 'live_switch' | 'card_select' | 'game_start' | 'slot_spin' | 'counter_up' | 'tournament_alert'
  | 'match_start' | 'search_loop' | 'profile_spin' | 'opponent_found' | 'vs_appear' | 'countdown_3' | 'start_sfx'
  | 'rock_btn' | 'scissors_btn' | 'paper_btn' | 'lock_select' | 'opponent_ready' | 'tension_before_reveal'
  | 'attack_get' | 'attack_move' | 'attack_keep' | 'attack_fail'
  | 'round_win' | 'round_lose' | 'final_win' | 'streak_up' | 'rank_up' | 'point_count' | 'final_lose' | 'game_void'
  | 'coin_tick' | 'heartbeat' | 'jackpot' | 'near_miss';

export type BgmType = 'lobby' | 'normal_game' | 'attack_game' | 'last_round' | 'tournament_final' | 'win_result';

/** 테이블 등급별 사운드 앰비언스 톤 */
export type AmbienceTier = 'free' | 'normal' | 'vip';

export interface VolumeSettings {
  master: number;
  bgm: number;
  sfx: number;
  voice: number;
  spectate: number;
  mute: boolean;
  vibration: boolean;
}

const defaultSettings: VolumeSettings = {
  master: 1.0,
  bgm: 0.5,
  sfx: 0.8,
  voice: 0.8,
  spectate: 0.5,
  mute: false,
  vibration: true,
};

/** 오디오 설정 변경 브로드캐스트 — 여러 화면의 음소거 상태 동기화 */
export const AUDIO_SETTINGS_EVENT = 'arena:audio-settings';

class AudioManager {
  private ctx: AudioContext | null = null;
  private currentBgm: BgmType | null = null;
  private currentBgmGainNode: GainNode | null = null;
  private bgmLoopTimer: ReturnType<typeof setInterval> | null = null;
  private bgmActiveOscillators: OscillatorNode[] = [];
  private speechSynthesis: SpeechSynthesis | null = null;
  private voiceInstance: SpeechSynthesisUtterance | null = null;
  /** 현재 테이블 등급 앰비언스 (BGM 레이어링에 반영) */
  public ambienceTier: AmbienceTier = 'normal';
  
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
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  };

  public loadSettings() {
    try {
      const saved = localStorage.getItem('arena_audio_settings');
      if (saved) {
        this.settings = { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load audio settings', e);
    }
  }

  public saveSettings() {
    localStorage.setItem('arena_audio_settings', JSON.stringify(this.settings));
    this.updateCurrentBgmVolume();
  }

  public updateSetting<K extends keyof VolumeSettings>(key: K, value: VolumeSettings[K]) {
    this.settings[key] = value;
    this.saveSettings();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(AUDIO_SETTINGS_EVENT, { detail: { ...this.settings } }),
      );
    }
  }

  /** 테이블 등급별 앰비언스 톤 설정 (무료=담백 / 일반=기본 / VIP=풍성) */
  public setAmbienceTier(tier: AmbienceTier) {
    this.ambienceTier = tier;
  }

  private getEffectiveVolume(type: 'sfx' | 'bgm' | 'voice' | 'spectate') {
    if (this.settings.mute) return 0;
    return this.settings.master * this.settings[type];
  }

  // --- Sound Effects ---

  public playSFX(type: SoundEffectType, options?: { spectate?: boolean, pan?: number }) {
    if (this.settings.mute) return;
    const vol = this.getEffectiveVolume(options?.spectate ? 'spectate' : 'sfx');
    if (vol <= 0) return;
    
    this.initContext();
    if (!this.ctx) return;

    // Use synthetic oscillator based sounds as placeholders for SFX
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Optional Panner
    let targetNode: AudioNode = gain;
    if (options?.pan !== undefined && this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = options.pan; // -1 to 1
      gain.connect(panner);
      targetNode = panner;
    }

    targetNode.connect(this.ctx.destination);
    
    const t = this.ctx.currentTime;
    
    // Sound design based on type
    switch (type) {
      case 'btn_touch':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
        gain.gain.setValueAtTime(vol * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      case 'btn_select':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(vol * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      case 'game_start':
      case 'start_sfx':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.setValueAtTime(554, t + 0.1); // C#
        osc.frequency.setValueAtTime(659, t + 0.2); // E
        gain.gain.setValueAtTime(vol * 0.4, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;
      case 'rock_btn':
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
        gain.gain.setValueAtTime(vol * 0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'scissors_btn':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
        gain.gain.setValueAtTime(vol * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      case 'paper_btn':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.3);
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      case 'attack_get':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.setValueAtTime(1200, t + 0.1);
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      case 'attack_move':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.3);
        gain.gain.setValueAtTime(vol * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      case 'round_win':
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
        gain.gain.setValueAtTime(vol * 0.4, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;
      case 'round_lose':
      case 'attack_fail':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
        gain.gain.setValueAtTime(vol * 0.4, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      case 'final_win':
        // Short fanfare
        osc.type = 'square';
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          osc.frequency.setValueAtTime(freq, t + i * 0.15);
        });
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.linearRampToValueAtTime(0, t + 1.0);
        osc.start(t);
        osc.stop(t + 1.0);
        break;
      case 'coin_tick':
      case 'counter_up':
      case 'point_count': {
        osc.type = 'triangle';
        const base = type === 'point_count' ? 880 : 720 + Math.random() * 180;
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * 1.3, t + 0.05);
        gain.gain.setValueAtTime(vol * 0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }
      case 'heartbeat':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.12);
        gain.gain.setValueAtTime(vol * 0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      case 'slot_spin':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.35);
        gain.gain.setValueAtTime(vol * 0.25, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      case 'jackpot':
        osc.type = 'square';
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1046.5].forEach((freq, i) => {
          osc.frequency.setValueAtTime(freq, t + i * 0.1);
        });
        gain.gain.setValueAtTime(vol * 0.55, t);
        gain.gain.linearRampToValueAtTime(0, t + 1.2);
        osc.start(t);
        osc.stop(t + 1.2);
        break;
      case 'near_miss':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.5);
        gain.gain.setValueAtTime(vol * 0.35, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.55);
        osc.start(t);
        osc.stop(t + 0.55);
        break;
      case 'tension_before_reveal':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(440, t + 0.5);
        gain.gain.setValueAtTime(vol * 0.2, t);
        gain.gain.linearRampToValueAtTime(vol * 0.4, t + 0.4);
        gain.gain.linearRampToValueAtTime(0, t + 0.7);
        osc.start(t);
        osc.stop(t + 0.7);
        break;
      default:
        // Generic pop sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        gain.gain.setValueAtTime(vol * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
    }
  }

  // --- Background Music (경쾌한 아르페지오 루프, 지속 드론 없음) ---

  private getBgmPattern(type: BgmType): { notes: number[]; stepMs: number; wave: OscillatorType } {
    // C major / bright pentatonic-ish patterns
    switch (type) {
      case 'lobby':
        return {
          notes: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25], // C5 E5 G5 C6 …
          stepMs: 220,
          wave: 'triangle',
        };
      case 'normal_game':
        return {
          notes: [392.0, 493.88, 587.33, 659.25, 587.33, 493.88, 523.25, 659.25], // G4 B4 D5 E5 …
          stepMs: 180,
          wave: 'triangle',
        };
      case 'attack_game':
        return {
          notes: [440.0, 554.37, 659.25, 880.0, 659.25, 554.37], // A4 C#5 E5 A5
          stepMs: 150,
          wave: 'square',
        };
      case 'last_round':
        return {
          notes: [523.25, 622.25, 783.99, 932.33, 783.99, 622.25], // 긴박하지만 밝게
          stepMs: 130,
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
    // 짧은 스타카토 — 웅~ 지속음 방지
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
    if (!this.ctx) return;

    this.stopBgmLoop(350);
    this.currentBgm = type;

    const vol = this.getEffectiveVolume('bgm');
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    if (vol > 0) {
      gain.gain.linearRampToValueAtTime(vol * 0.22, this.ctx.currentTime + 0.25);
    }
    gain.connect(this.ctx.destination);
    this.currentBgmGainNode = gain;

    const pattern = this.getBgmPattern(type);
    let step = 0;
    const tick = () => {
      if (!this.ctx || this.currentBgm !== type || !this.currentBgmGainNode) return;
      const bus = this.currentBgmGainNode;
      const tier = this.ambienceTier;
      // 등급별 볼륨 톤: 무료는 담백, VIP는 살짝 풍성
      const tierGain = tier === 'vip' ? 0.32 : tier === 'free' ? 0.22 : 0.28;
      const peak = this.getEffectiveVolume('bgm') * tierGain;
      if (peak <= 0) return;
      const freq = pattern.notes[step % pattern.notes.length];
      this.playBgmPluck(freq, pattern.wave, bus, peak);

      // 가벼운 하모닉 (5도) — 경쾌한 층
      if (step % 2 === 0) {
        this.playBgmPluck(freq * 1.5, 'sine', bus, peak * 0.35);
      }

      // VIP: 옥타브 위 반짝임 + 저음 드론으로 고급스러운 홀 느낌
      if (tier === 'vip') {
        this.playBgmPluck(freq * 2, 'sine', bus, peak * 0.22);
        if (step % 4 === 0) {
          this.playBgmPluck(freq / 2, 'triangle', bus, peak * 0.3);
        }
      } else if (tier === 'free') {
        // 무료: 담백하게 4스텝마다 하모닉만 살짝
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
      this.currentBgmGainNode.gain.cancelScheduledValues(t);
      this.currentBgmGainNode.gain.linearRampToValueAtTime(vol * 0.22, t + 0.1);
    }
  }

  // --- Voice Announcements ---
  public speak(text: string) {
    if (this.settings.mute || !this.speechSynthesis) return;
    
    const vol = this.getEffectiveVolume('voice');
    if (vol <= 0) return;

    this.speechSynthesis.cancel();
    this.voiceInstance = new SpeechSynthesisUtterance(text);
    this.voiceInstance.volume = vol;
    
    const voices = this.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.includes('ko'));
    if (koVoice) {
      this.voiceInstance.voice = koVoice;
    }
    
    this.voiceInstance.pitch = 1.1;
    this.voiceInstance.rate = 1.05;

    this.speechSynthesis.speak(this.voiceInstance);
  }
}

export const audioManager = new AudioManager();
