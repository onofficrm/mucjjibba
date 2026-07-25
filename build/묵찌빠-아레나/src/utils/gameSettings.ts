export interface GameOptions {
  dealerVisible: boolean;
  voiceEnabled: boolean;
  beginnerHelpVoice: boolean;
  voiceMode: 'all' | 'result_only';
  reduceAnimations: boolean;
  performanceMode: 'fancy' | 'basic' | 'low';
  characterId: string;
  handSkinId: string;
  introMode: 'always' | 'first_only' | 'tournament_only' | 'skip';
  introMute: boolean;
  reactionMute: boolean;
}

const defaultOptions: GameOptions = {
  dealerVisible: true,
  voiceEnabled: true,
  beginnerHelpVoice: true,
  voiceMode: 'all',
  reduceAnimations: false,
  performanceMode: 'fancy',
  characterId: 'classic_dealer',
  handSkinId: 'classic',
  introMode: 'always',
  introMute: false,
  reactionMute: false,
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
