export interface GameOptions {
  dealerVisible: boolean;
  voiceEnabled: boolean;
  beginnerHelpVoice: boolean;
  voiceMode: 'all' | 'result_only';
  reduceAnimations: boolean;
  performanceMode: 'fancy' | 'basic' | 'low';
  /** duel = 야간 대결 스테이지 / simple = 기존 카지노 슬롯형 */
  battleLayout: 'duel' | 'simple';
  characterId: string;
  handSkinId: string;
  introMode: 'always' | 'first_only' | 'tournament_only' | 'skip';
  introMute: boolean;
  reactionMute: boolean;
  /** PC 듀얼 모드 Q/W/E 단축키 가이드 오버레이 표시 */
  showKeyGuide: boolean;
}

const defaultOptions: GameOptions = {
  dealerVisible: true,
  voiceEnabled: true,
  beginnerHelpVoice: true,
  voiceMode: 'all',
  reduceAnimations: false,
  performanceMode: 'fancy',
  battleLayout: 'duel',
  characterId: 'classic_dealer',
  handSkinId: 'classic',
  introMode: 'always',
  introMute: false,
  reactionMute: false,
  showKeyGuide: true,
};

class GameSettingsManager {
  public options: GameOptions = { ...defaultOptions };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('arena_game_options');
      if (saved) {
        this.options = { ...defaultOptions, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load game options', e);
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem('arena_game_options', JSON.stringify(this.options));
    } catch (e) {
      console.warn('Failed to save game options', e);
    }
  }

  public updateOption<K extends keyof GameOptions>(key: K, value: GameOptions[K]) {
    this.options[key] = value;
    this.saveSettings();
  }
}

export const gameSettings = new GameSettingsManager();
