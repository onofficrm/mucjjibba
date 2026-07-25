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
  /** 전투 연출·선택 시간 템포 */
  combatTempo: 'comfortable' | 'default' | 'fast';
  /** 경기 시작 전 룰 카드 표시 */
  showRuleCard: boolean;
  /** 나레이션 말투 */
  voiceStyle: 'calm' | 'hype' | 'fun' | 'minimal';
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
  combatTempo: 'default',
  showRuleCard: true,
  voiceStyle: 'hype',
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

  /**
   * 수동 설정 ON 이거나 OS `prefers-reduced-motion: reduce` 이면 true.
   * 접근성 OS 설정이 수동 OFF보다 우선한다.
   */
  public shouldReduceAnimations(): boolean {
    if (this.options.reduceAnimations) return true;
    try {
      return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch {
      return false;
    }
  }

  /** OS가 동작 줄이기를 켜 둔 상태인지 (설정 UI 안내용) */
  public isOsReduceMotion(): boolean {
    try {
      return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch {
      return false;
    }
  }
}

export const gameSettings = new GameSettingsManager();
