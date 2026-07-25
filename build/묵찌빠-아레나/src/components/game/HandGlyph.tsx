import type { CSSProperties } from 'react';

export type GlyphHand = 'ROCK' | 'SCISSORS' | 'PAPER';
export type GlyphTheme = 'classic' | 'gold' | 'neon' | 'fire' | 'ice' | 'comic' | string;

const THEME_FALLBACK_EMOJI: Record<string, Record<GlyphHand, string>> = {
  classic: { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' },
  gold: { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' },
  neon: { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' },
  fire: { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' },
  ice: { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' },
  comic: { ROCK: '🥊', SCISSORS: '✌️', PAPER: '🖐️' },
  robot: { ROCK: '🦾', SCISSORS: '🔧', PAPER: '⚙️' },
  dokkaebi: { ROCK: '✊', SCISSORS: '⚔️', PAPER: '🖐️' },
};

const SVG_THEMES = new Set(['classic', 'gold', 'neon', 'fire', 'ice', 'comic']);

function themePaint(theme: GlyphTheme) {
  switch (theme) {
    case 'gold':
      return {
        fill: 'url(#hg-gold)',
        stroke: '#fbbf24',
        glow: 'drop-shadow(0 0 14px rgba(245,158,11,0.85)) drop-shadow(0 4px 0 rgba(0,0,0,0.55))',
      };
    case 'neon':
      return {
        fill: 'url(#hg-neon)',
        stroke: '#22d3ee',
        glow: 'drop-shadow(0 0 16px rgba(34,211,238,0.95)) drop-shadow(0 0 8px rgba(217,70,239,0.7))',
      };
    case 'fire':
      return {
        fill: 'url(#hg-fire)',
        stroke: '#fb923c',
        glow: 'drop-shadow(0 0 16px rgba(249,115,22,0.95)) drop-shadow(0 0 6px rgba(220,38,38,0.7))',
      };
    case 'ice':
      return {
        fill: 'url(#hg-ice)',
        stroke: '#7dd3fc',
        glow: 'drop-shadow(0 0 14px rgba(56,189,248,0.85))',
      };
    case 'comic':
      return {
        fill: '#fff7ed',
        stroke: '#111827',
        glow: 'drop-shadow(0 5px 0 #000) drop-shadow(3px 3px 0 #f59e0b)',
      };
    default:
      return {
        fill: 'url(#hg-classic)',
        stroke: '#e5e7eb',
        glow: 'drop-shadow(0 6px 0 rgba(0,0,0,0.75)) drop-shadow(0 0 10px rgba(255,255,255,0.15))',
      };
  }
}

function HandPaths({ hand }: { hand: GlyphHand }) {
  if (hand === 'ROCK') {
    return (
      <g transform="translate(8,10)">
        <path d="M28 62c-10 0-18-8-18-18V30c0-5 4-9 9-9s9 4 9 9v6c0-6 4-10 9-10s9 4 9 10v4c0-5 4-9 9-9s9 4 9 9v8c0-4 3-7 7-7 5 0 8 4 8 9v14c0 14-12 26-26 26H38c-6 0-10-4-10-8z" />
        <path d="M22 34c0-4 3-7 7-7s7 3 7 7" fill="none" strokeWidth="3" opacity="0.35" />
      </g>
    );
  }
  if (hand === 'SCISSORS') {
    return (
      <g transform="translate(6,6)">
        <path d="M34 78c-9 0-16-7-16-16V48c0-4 3-7 7-7s7 3 7 7v8c0-5 3-8 8-8s8 3 8 8v4c2-4 6-7 11-7 6 0 10 5 10 11v15c0 9-7 16-16 16H42z" />
        <path d="M48 12c-3-2-7 0-8 4L28 52c-1 3 1 6 4 7 3 1 6-1 7-4l12-36c1-3-1-6-3-7z" />
        <path d="M68 10c3-2 7 0 8 4l12 36c1 3-1 6-4 7-3 1-6-1-7-4L65 17c-1-3 1-6 3-7z" />
      </g>
    );
  }
  // PAPER
  return (
    <g transform="translate(10,4)">
      <path d="M22 82c-8 0-14-6-14-14V36c0-5 4-9 9-9s9 4 9 9v4c0-7 5-12 11-12s11 5 11 12V22c0-5 4-9 9-9s9 4 9 9v18c0-5 4-9 9-9s9 4 9 9v10c0-4 3-7 7-7 5 0 8 4 8 9v16c0 14-11 25-25 25H34c-7 0-12-5-12-11z" />
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="hg-classic" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id="hg-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="45%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="hg-neon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="55%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <linearGradient id="hg-fire" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="40%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="hg-ice" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
  );
}

export function resolveGlyphTheme(skinId?: string): GlyphTheme {
  if (!skinId) return 'classic';
  return skinId;
}

/** 테마 SVG 손 — 이모지 한계를 넘는 골드/네온/불꽃 손 */
export function HandGlyph({
  hand,
  theme = 'classic',
  size = 96,
  className = '',
  style,
  comboBoost = 0,
}: {
  hand: GlyphHand;
  theme?: GlyphTheme;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** 콤보 HIT 수 — 2 이상이면 크기·글로우 강화 */
  comboBoost?: number;
}) {
  const t = resolveGlyphTheme(theme);
  const useSvg = SVG_THEMES.has(t);
  const boost = Math.max(0, Math.min(comboBoost, 5));
  const scale = 1 + boost * 0.1;
  const paint = themePaint(t);
  const mergedStyle: CSSProperties = {
    ...style,
    transform: [style?.transform, `scale(${scale})`].filter(Boolean).join(' '),
    filter:
      boost >= 2
        ? `${paint.glow} drop-shadow(0 0 22px rgba(250,204,21,0.95))`
        : style?.filter ?? paint.glow,
  };

  if (!useSvg) {
    const emoji =
      THEME_FALLBACK_EMOJI[t]?.[hand] ?? THEME_FALLBACK_EMOJI.classic[hand];
    return (
      <span
        className={`inline-flex items-center justify-center leading-none select-none ${className}`}
        style={{
          fontSize: size * 0.92,
          ...mergedStyle,
        }}
        aria-hidden
      >
        {emoji}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center leading-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        ...mergedStyle,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 112 112"
        width="100%"
        height="100%"
        className="overflow-visible"
      >
        <Defs />
        <g
          fill={paint.fill}
          stroke={paint.stroke}
          strokeWidth={theme === 'comic' ? 5 : 3.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <HandPaths hand={hand} />
        </g>
        {theme === 'fire' && (
          <g opacity="0.85">
            <path d="M28 88c4-10 2-16-2-22 8 4 14 12 12 22z" fill="#fbbf24" />
            <path d="M78 86c-3-9 1-15 6-20-9 5-12 12-10 20z" fill="#fb923c" />
          </g>
        )}
        {theme === 'neon' && (
          <circle cx="56" cy="56" r="48" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.35" />
        )}
        {boost >= 2 && (
          <circle
            cx="56"
            cy="56"
            r="52"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            opacity="0.45"
            strokeDasharray="6 8"
          />
        )}
      </svg>
    </span>
  );
}
