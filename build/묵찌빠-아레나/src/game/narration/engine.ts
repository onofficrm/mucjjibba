import { linesFor } from './lines';
import { HAND_KO, type NarrationContext, type NarrationCue, type NarrationPick, type VoiceStyle } from './types';

const RECENT_LIMIT = 5;
const MIN_GAP_MS = 2200;
const MATCH_VOICE_CAP = 18;
const RARE_CHANCE = 0.04;

class NarrationEngine {
  private recentGlobal: string[] = [];
  private recentByCue = new Map<NarrationCue, string[]>();
  private lastAt = 0;
  private matchCount = 0;
  private matchId: string | null = null;

  resetMatch(matchId?: string) {
    this.matchCount = 0;
    this.matchId = matchId ?? `m-${Date.now()}`;
  }

  private pushRecent(cue: NarrationCue, text: string) {
    this.recentGlobal = [...this.recentGlobal, text].slice(-RECENT_LIMIT);
    const arr = this.recentByCue.get(cue) ?? [];
    arr.push(text);
    this.recentByCue.set(cue, arr.slice(-RECENT_LIMIT));
  }

  private banned(cue: NarrationCue): Set<string> {
    return new Set([...(this.recentByCue.get(cue) ?? []), ...this.recentGlobal]);
  }

  /** 컨텍스트로 더 재밌는 큐로 승격 */
  resolveCue(cue: NarrationCue, ctx: NarrationContext = {}): NarrationCue {
    const hands = ctx.recentHands ?? [];
    if (hands.length >= 3) {
      const a = hands[hands.length - 1];
      const b = hands[hands.length - 2];
      const c = hands[hands.length - 3];
      if (a === b && b === c && (cue === 'point_win' || cue === 'ask_select' || cue === 'point_lose')) {
        if (Math.random() < 0.55) return 'pattern_repeat';
      }
    }
    if (
      ctx.dominantHand &&
      (ctx.dominantPct ?? 0) >= 55 &&
      (cue === 'ask_select' || cue === 'point_lose') &&
      Math.random() < 0.4
    ) {
      return 'pattern_hand_bias';
    }
    if (
      typeof ctx.selectMs === 'number' &&
      ctx.selectMs > 0 &&
      ctx.selectMs < 1200 &&
      cue === 'point_win' &&
      Math.random() < 0.5
    ) {
      return 'clutch_select';
    }
    if (cue === 'point_win' && ctx.wasBehind) return 'comeback';
    if (cue === 'point_win' && (ctx.streak ?? 0) >= 5) return 'streak_5';
    if (cue === 'point_win' && (ctx.streak ?? 0) >= 4) return 'streak_4';
    if (cue === 'point_win' && (ctx.streak ?? 0) >= 3) return 'streak_3';
    if (cue === 'point_win' && (ctx.streak ?? 0) >= 2) return 'streak_2';
    return cue;
  }

  private contextualize(text: string, cue: NarrationCue, ctx: NarrationContext): string {
    if (cue === 'pattern_hand_bias' && ctx.dominantHand) {
      const name = HAND_KO[ctx.dominantHand];
      const pct = ctx.dominantPct ?? 0;
      const alts = [
        `오늘은 ${name} 비중이 ${pct}%네요. 한 번 비틀어볼까요?`,
        `${name} 선택이 많아요. 상대도 눈치챌 수 있습니다.`,
        `${name}에 기대지 말고 한 수 섞어보세요.`,
      ];
      return alts[Math.floor(Math.random() * alts.length)];
    }
    if (cue === 'pattern_repeat' && ctx.recentHands?.length) {
      const last = ctx.recentHands[ctx.recentHands.length - 1];
      const name = HAND_KO[last];
      const alts = [
        `${name}을 연속으로 냈어요. 상대도 눈치챘을 수 있습니다.`,
        `${name} 반복 중! 변주가 필요한 타이밍입니다.`,
        `같은 ${name}, 세 번째입니다. 예측당하기 쉬워요.`,
      ];
      return alts[Math.floor(Math.random() * alts.length)];
    }
    if (cue === 'steal' && (ctx.steals ?? 0) >= 3) {
      return `벌써 ${ctx.steals}번째 탈환! 주도권 싸움은 압도적입니다.`;
    }
    if (cue === 'match_point' && ctx.myScore != null && ctx.opponentScore != null) {
      return `매치포인트! 지금 ${ctx.myScore}:${ctx.opponentScore}. 한 점이면 끝입니다.`;
    }
    return text;
  }

  pick(cue: NarrationCue, ctx: NarrationContext = {}): NarrationPick | null {
    const style: VoiceStyle = ctx.style ?? 'hype';
    const now = Date.now();

    if (!ctx.force) {
      if (style === 'minimal' && this.matchCount > 10) return null;
      if (this.matchCount >= MATCH_VOICE_CAP) return null;
      const short = cue === 'rock' || cue === 'scissors' || cue === 'paper';
      const gap = short ? 450 : MIN_GAP_MS;
      if (now - this.lastAt < gap) return null;
    }

    let resolved = this.resolveCue(cue, ctx);

    // 희귀 멘트 — 중요 순간에만
    const canRare =
      ['point_win', 'steal', 'final_win', 'comeback', 'streak_3', 'streak_5'].includes(resolved) &&
      style !== 'minimal';
    if (canRare && Math.random() < RARE_CHANCE) {
      resolved = 'rare';
    }

    let pool = linesFor(resolved, style);
    if (!pool.length) pool = linesFor(cue, style);
    if (!pool.length) return null;

    const banned = this.banned(resolved);
    let candidates = pool.filter((t) => !banned.has(t));
    if (!candidates.length) candidates = pool;

    const textRaw = candidates[Math.floor(Math.random() * candidates.length)];
    const text = this.contextualize(textRaw, resolved, ctx);

    this.pushRecent(resolved, text);
    this.lastAt = now;
    this.matchCount += 1;

    return { cue: resolved, text, rare: resolved === 'rare' };
  }

  /** TTS 없이 텍스트만 (쿨다운 무시, 최근 회피는 적용) */
  pickText(cue: NarrationCue, ctx: NarrationContext = {}): string {
    const style: VoiceStyle = ctx.style ?? 'hype';
    const resolved = this.resolveCue(cue, ctx);
    let pool = linesFor(resolved, style);
    if (!pool.length) pool = linesFor(cue, style);
    const banned = this.banned(resolved);
    let candidates = pool.filter((t) => !banned.has(t));
    if (!candidates.length) candidates = pool;
    const text = this.contextualize(
      candidates[Math.floor(Math.random() * candidates.length)] ?? '',
      resolved,
      ctx,
    );
    if (text) this.pushRecent(resolved, text);
    return text;
  }
}

export const narrationEngine = new NarrationEngine();

export function pickNarration(
  cue: NarrationCue,
  ctx?: NarrationContext,
): NarrationPick | null {
  return narrationEngine.pick(cue, ctx);
}

export function pickNarrationText(cue: NarrationCue, ctx?: NarrationContext): string {
  return narrationEngine.pickText(cue, ctx);
}
