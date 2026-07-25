/** 나레이션 큐·스타일·컨텍스트 */

export type VoiceStyle = 'calm' | 'hype' | 'fun' | 'minimal';

export type NarrationCue =
  | 'start'
  | 'ask_select'
  | 'draw'
  | 'attack_get'
  | 'attack_fail'
  | 'steal'
  | 'attack_lost'
  | 'point_win'
  | 'point_lose'
  | 'streak_2'
  | 'streak_3'
  | 'streak_4'
  | 'streak_5'
  | 'match_point'
  | 'comeback'
  | 'final_win'
  | 'final_lose'
  | 'pattern_repeat'
  | 'pattern_hand_bias'
  | 'clutch_select'
  | 'rock'
  | 'scissors'
  | 'paper'
  | 'rare';

export interface NarrationContext {
  style?: VoiceStyle;
  myScore?: number;
  opponentScore?: number;
  streak?: number;
  steals?: number;
  /** 최근 내가 낸 손들 (최신 마지막) */
  recentHands?: Array<'ROCK' | 'SCISSORS' | 'PAPER'>;
  dominantHand?: 'ROCK' | 'SCISSORS' | 'PAPER' | null;
  dominantPct?: number;
  selectMs?: number;
  isMatchPoint?: boolean;
  wasBehind?: boolean;
  force?: boolean;
  /** TTS 없이 텍스트만 */
  silent?: boolean;
}

export interface NarrationPick {
  cue: NarrationCue;
  text: string;
  rare: boolean;
}

export const VOICE_STYLE_META: Record<
  VoiceStyle,
  { label: string; description: string }
> = {
  calm: { label: '차분함', description: '분석형·담백한 안내' },
  hype: { label: '열혈', description: '응원·도파민 멘트가 많음' },
  fun: { label: '유쾌함', description: '가벼운 도발·코믹 톤' },
  minimal: { label: '최소 안내', description: '짧은 멘트만, 밀도 낮음' },
};

export const VOICE_STYLE_IDS: VoiceStyle[] = ['calm', 'hype', 'fun', 'minimal'];

export const HAND_KO = {
  ROCK: '묵',
  SCISSORS: '찌',
  PAPER: '빠',
} as const;
