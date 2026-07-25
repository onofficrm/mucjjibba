/** 미션 일차 경계: 로컬 시각 14:00 */

export function getMissionDayId(now: Date = new Date()): string {
  const d = new Date(now.getTime());
  if (d.getHours() < 14) {
    d.setDate(d.getDate() - 1);
  }
  return formatLocalDate(d);
}

export function getMissionExpiresAt(now: Date = new Date()): string {
  const d = new Date(now.getTime());
  const expires = new Date(d);
  expires.setHours(14, 0, 0, 0);
  if (d.getHours() >= 14) {
    expires.setDate(expires.getDate() + 1);
  }
  return expires.toISOString();
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
