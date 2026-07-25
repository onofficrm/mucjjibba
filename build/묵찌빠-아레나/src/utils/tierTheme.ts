import type { AmbienceTier } from '@/utils/audio';

/** 테이블 등급별 UI 스킨 토큰 — 무료=실버 미니멀 / 일반=앰버 골드 / VIP=블랙+플래티넘 */
export interface TierTheme {
  tier: AmbienceTier;
  label: string;
  /** 스테이지/화면 프레임 보더 + 글로우 */
  frame: string;
  /** 패널 보더 톤 */
  panelBorder: string;
  /** 포인트 컬러 텍스트 */
  accentText: string;
  /** 인그레이빙 디스플레이 텍스트 클래스 */
  engraved: string;
  /** 상단 헤어라인 그라데이션 */
  hairline: string;
  /** HUD 배지 배경 */
  badge: string;
}

const THEMES: Record<AmbienceTier, TierTheme> = {
  free: {
    tier: 'free',
    label: 'PRACTICE',
    frame: 'border-slate-400/25 shadow-[inset_0_0_60px_rgba(148,163,184,0.06)]',
    panelBorder: 'border-slate-400/25',
    accentText: 'text-slate-300',
    engraved: 'text-engraved-platinum',
    hairline: 'from-transparent via-slate-400/50 to-transparent',
    badge: 'bg-slate-400/10 border-slate-400/30 text-slate-300',
  },
  normal: {
    tier: 'normal',
    label: 'ARENA',
    frame: 'border-arena-gold/30 shadow-[inset_0_0_60px_rgba(245,158,11,0.07)]',
    panelBorder: 'border-arena-gold/30',
    accentText: 'text-arena-gold',
    engraved: 'text-engraved-gold',
    hairline: 'from-transparent via-arena-gold/60 to-transparent',
    badge: 'bg-arena-gold/10 border-arena-gold/35 text-arena-gold',
  },
  vip: {
    tier: 'vip',
    label: 'VIP',
    frame: 'border-slate-200/35 shadow-[inset_0_0_70px_rgba(226,232,240,0.08)]',
    panelBorder: 'border-slate-200/30',
    accentText: 'text-slate-100',
    engraved: 'text-engraved-platinum',
    hairline: 'from-transparent via-slate-200/70 to-transparent',
    badge: 'bg-slate-200/10 border-slate-200/40 text-slate-100',
  },
};

export function getTierTheme(tier: AmbienceTier): TierTheme {
  return THEMES[tier] ?? THEMES.normal;
}
