const CODE_RE = /^[A-Z0-9]{4,8}$/;

export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function isValidRoomCode(code: string): boolean {
  return CODE_RE.test(normalizeRoomCode(code));
}

export function generateRoomCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** HashRouter 딥링크: `#/match/friend?code=XXXXXX` */
export function buildInviteLink(code: string): string {
  const c = encodeURIComponent(normalizeRoomCode(code));
  if (typeof window === 'undefined') {
    return `#/match/friend?code=${c}`;
  }
  return `${window.location.origin}${window.location.pathname}#/match/friend?code=${c}`;
}

export function buildSpectateInviteLink(code: string): string {
  const c = encodeURIComponent(normalizeRoomCode(code));
  if (typeof window === 'undefined') {
    return `#/spectate/${c}`;
  }
  return `${window.location.origin}${window.location.pathname}#/spectate/${c}`;
}

export function parseInviteCodeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const code = params.get('code');
  if (!code) return null;
  const normalized = normalizeRoomCode(code);
  return isValidRoomCode(normalized) ? normalized : null;
}

export function buildInviteShareText(code: string, roomTitle?: string): string {
  const link = buildInviteLink(code);
  const title = roomTitle?.trim() || '친구 대전';
  return `[묵찌빠 아레나] ${title}\n방 코드: ${normalizeRoomCode(code)}\n입장: ${link}`;
}
