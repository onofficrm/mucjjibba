/** ISO week id: YYYY-Www (월요일 시작) */
export function getWeekId(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getWeekRange(date = new Date()): { startsAt: string; endsAt: string; label: string } {
  const local = new Date(date);
  const day = local.getDay() || 7;
  const monday = new Date(local);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(local.getDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    `${d.getMonth() + 1}/${d.getDate()}`;
  return {
    startsAt: monday.toISOString(),
    endsAt: sunday.toISOString(),
    label: `${fmt(monday)} ~ ${fmt(sunday)} 주간 리그`,
  };
}

export function gradeFromWeeklyPoints(points: number): string {
  if (points >= 8000) return '마스터';
  if (points >= 5000) return '다이아';
  if (points >= 3000) return '플래티넘';
  if (points >= 1500) return '골드';
  if (points >= 600) return '실버';
  return '브론즈';
}
