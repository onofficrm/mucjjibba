export type SoundEffectType = 
  | 'btn_touch' | 'btn_select' | 'menu_open' | 'menu_close' | 'popup_open' | 'alert' | 'error' | 'confirm'
  | 'lobby_bgm' | 'live_switch' | 'card_select' | 'game_start' | 'slot_spin' | 'counter_up' | 'tournament_alert'
  | 'match_start' | 'search_loop' | 'profile_spin' | 'opponent_found' | 'vs_appear' | 'countdown_3' | 'start_sfx'
  | 'rock_btn' | 'scissors_btn' | 'paper_btn' | 'lock_select' | 'opponent_ready' | 'tension_before_reveal'
  | 'attack_get' | 'attack_move' | 'attack_keep' | 'attack_fail'
  | 'round_win' | 'round_lose' | 'final_win' | 'streak_up' | 'rank_up' | 'point_count' | 'final_lose' | 'game_void';

export type BgmType = 'lobby' | 'normal_game' | 'attack_game' | 'last_round' | 'tournament_final' | 'win_result';

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

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmOscillators: Map<BgmType, any> = new Map();
  private currentBgm: BgmType | null = null;
  private currentBgmGainNode: GainNode | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private voiceInstance: SpeechSynthesisUtterance | null = null;
  
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

  // --- Background Music ---

  public playBGM(type: BgmType) {
    if (this.currentBgm === type) return;
    this.initContext();
    if (!this.ctx) return;

    // Fade out current BGM
    if (this.currentBgmGainNode) {
      const t = this.ctx.currentTime;
      this.currentBgmGainNode.gain.linearRampToValueAtTime(0, t + 1.0); // 1 sec fade out
      // In a real app we'd stop the audio element here after fade out
    }

    this.currentBgm = type;
    
    // Create new synthetic BGM (a soft droning chord) for demonstration
    // Real implementation would use HTMLAudioElement or buffer source
    const vol = this.getEffectiveVolume('bgm');
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    if (vol > 0) {
      gain.gain.linearRampToValueAtTime(vol * 0.1, this.ctx.currentTime + 1.0); // 1 sec fade in
    }
    gain.connect(this.ctx.destination);
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    switch (type) {
      case 'lobby':
        osc1.frequency.value = 261.63; // C4
        osc2.frequency.value = 329.63; // E4
        break;
      case 'normal_game':
        osc1.frequency.value = 196.00; // G3
        osc2.frequency.value = 246.94; // B3
        break;
      case 'attack_game':
        osc1.type = 'triangle';
        osc1.frequency.value = 293.66; // D4
        osc2.frequency.value = 349.23; // F4
        break;
      case 'last_round':
        osc1.type = 'sawtooth';
        osc1.frequency.value = 130.81; // C3
        osc2.frequency.value = 196.00; // G3
        break;
      case 'win_result':
        osc1.frequency.value = 523.25; // C5
        osc2.frequency.value = 659.25; // E5
        break;
      default:
        osc1.frequency.value = 440;
        osc2.frequency.value = 554;
    }

    osc1.connect(gain);
    osc2.connect(gain);
    osc1.start();
    osc2.start();

    // Store references to clean up later (synthetic demo cleanup)
    if (this.currentBgmGainNode) {
        setTimeout(() => {
           // We just let the old one fade out then we would stop it in a real implementation
           // With synth we can just leave it or manage oscillators array
        }, 1000);
    }
    
    this.currentBgmGainNode = gain;
  }

  public stopBGM() {
    if (this.currentBgmGainNode && this.ctx) {
      const t = this.ctx.currentTime;
      this.currentBgmGainNode.gain.linearRampToValueAtTime(0, t + 1.0);
      this.currentBgmGainNode = null;
    }
    this.currentBgm = null;
  }

  public updateCurrentBgmVolume() {
    if (this.currentBgmGainNode && this.ctx) {
      const vol = this.getEffectiveVolume('bgm');
      const t = this.ctx.currentTime;
      this.currentBgmGainNode.gain.linearRampToValueAtTime(vol * 0.1, t + 0.1);
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
