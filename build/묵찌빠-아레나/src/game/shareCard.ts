import { getCharacterEmoji } from '@/data/decorations';
import { pickPrimaryHighlight } from '@/game/highlights';
import type { GameLog, ShareCardData, SharePrivacyOptions } from '@/types/gameLog';

export function maskNickname(name: string): string {
  if (!name) return '***';
  if (name.length <= 2) return `${name[0]}*`;
  return `${name.slice(0, 2)}${'*'.repeat(Math.min(4, name.length - 2))}`;
}

export function buildShareCardData(
  log: GameLog,
  privacy: SharePrivacyOptions,
): ShareCardData {
  const highlight = pickPrimaryHighlight(log);
  const date = new Date(log.endedAt);
  const playedAt = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

  return {
    logoText: '묵찌빠 아레나',
    characterEmoji: privacy.hideProfileImage
      ? '🎭'
      : getCharacterEmoji(log.me.characterId) || log.me.avatar,
    myScore: log.myScore,
    opponentScore: log.opponentScore,
    highlightText: highlight?.title ?? '경기 완료',
    grade: log.me.grade,
    streak: log.currentStreakAfter ?? 0,
    playedAt,
    myNickname: log.me.nickname,
    opponentNickname: privacy.maskOpponentNickname
      ? maskNickname(log.opponent.nickname)
      : log.opponent.nickname,
    pointsDeltaLabel: undefined,
    showPoints: !privacy.hidePoints,
    showProfileImage: !privacy.hideProfileImage,
  };
}

export function buildShareLink(gameId: string): string {
  if (typeof window === 'undefined') {
    return `#/game/${encodeURIComponent(gameId)}/result`;
  }
  return `${window.location.origin}${window.location.pathname}#/game/${encodeURIComponent(gameId)}/result`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallthrough */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}
