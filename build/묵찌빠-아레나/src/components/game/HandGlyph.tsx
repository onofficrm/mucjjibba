import { useId, type CSSProperties } from 'react';

export type GlyphHand = 'ROCK' | 'SCISSORS' | 'PAPER';
export type GlyphTheme = 'classic' | 'gold' | 'neon' | 'fire' | 'ice' | 'comic' | string;

/** 심플모드와 동일한 노란 손 이모지 */
const YELLOW_EMOJI: Record<GlyphHand, string> = {
  ROCK: '✊',
  SCISSORS: '✌️',
  PAPER: '🖐️',
};

const THEME_EMOJI: Record<string, Record<GlyphHand, string>> = {
  classic: YELLOW_EMOJI,
  gold: YELLOW_EMOJI,
  neon: YELLOW_EMOJI,
  fire: YELLOW_EMOJI,
  ice: YELLOW_EMOJI,
  comic: { ROCK: '🥊', SCISSORS: '✌️', PAPER: '🖐️' },
  robot: { ROCK: '🦾', SCISSORS: '🔧', PAPER: '⚙️' },
  dokkaebi: { ROCK: '✊', SCISSORS: '⚔️', PAPER: '🖐️' },
};

/** 기본·골드·미지정 = 심플모드와 같은 이모지. 특수 스킨만 SVG. */
const EMOJI_THEMES = new Set(['classic', 'gold']);
const SVG_THEMES = new Set(['neon', 'fire', 'ice', 'comic']);

function themePaint(theme: GlyphTheme, id: string) {
  switch (theme) {
    case 'neon':
      return {
        fill: `url(#${id}-neon)`,
        stroke: '#67e8f9',
        edge: '#0e7490',
        glow: 'drop-shadow(0 4px 2px rgba(0,0,0,0.55)) drop-shadow(0 0 10px rgba(34,211,238,0.55))',
      };
    case 'fire':
      return {
        fill: `url(#${id}-fire)`,
        stroke: '#fdba74',
        edge: '#9a3412',
        glow: 'drop-shadow(0 4px 2px rgba(0,0,0,0.55)) drop-shadow(0 0 10px rgba(249,115,22,0.55))',
      };
    case 'ice':
      return {
        fill: `url(#${id}-ice)`,
        stroke: '#bae6fd',
        edge: '#0369a1',
        glow: 'drop-shadow(0 4px 2px rgba(0,0,0,0.5)) drop-shadow(0 0 10px rgba(56,189,248,0.45))',
      };
    case 'comic':
      return {
        fill: `url(#${id}-comic)`,
        stroke: '#111827',
        edge: '#030712',
        glow: 'drop-shadow(0 5px 0 #000)',
      };
    default:
      return {
        fill: `url(#${id}-gold)`,
        stroke: '#fbbf24',
        edge: '#92400e',
        glow: 'drop-shadow(0 4px 2px rgba(0,0,0,0.55)) drop-shadow(0 0 8px rgba(245,158,11,0.35))',
      };
  }
}

function HandPaths({ hand }: { hand: GlyphHand }) {
  if (hand === 'ROCK') {
    return (
      <g transform="translate(8,10)">
        <path d="M28 62c-10 0-18-8-18-18V30c0-5 4-9 9-9s9 4 9 9v6c0-6 4-10 9-10s9 4 9 10v4c0-5 4-9 9-9s9 4 9 9v8c0-4 3-7 7-7 5 0 8 4 8 9v14c0 14-12 26-26 26H38c-6 0-10-4-10-8z" />
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
  return (
    <g transform="translate(10,4)">
      <path d="M22 82c-8 0-14-6-14-14V36c0-5 4-9 9-9s9 4 9 9v4c0-7 5-12 11-12s11 5 11 12V22c0-5 4-9 9-9s9 4 9 9v18c0-5 4-9 9-9s9 4 9 9v10c0-4 3-7 7-7 5 0 8 4 8 9v16c0 14-11 25-25 25H34c-7 0-12-5-12-11z" />
    </g>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id={`${id}-neon`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a5f3fc" />
        <stop offset="55%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <linearGradient id={`${id}-fire`} x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
      <linearGradient id={`${id}-ice`} x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id={`${id}-comic`} x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#fff7ed" />
        <stop offset="100%" stopColor="#fdba74" />
      </linearGradient>
      <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-depth`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="1" floodColor="#020617" floodOpacity="0.55" />
      </filter>
    </defs>
  );
}

export function resolveGlyphTheme(skinId?: string): GlyphTheme {
  if (!skinId) return 'classic';
  return skinId;
}

/** 기본은 심플모드와 같은 노란 이모지. 특수 스킨만 SVG. */
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
  comboBoost?: number;
}) {
  const rawId = useId();
  const id = `hand-${rawId.replace(/:/g, '')}`;
  const t = resolveGlyphTheme(theme);
  const boost = Math.max(0, Math.min(comboBoost, 5));
  const scale = 1 + boost * 0.08;

  // classic / gold / 미지정 스킨 → 심플모드와 동일 이모지
  if (EMOJI_THEMES.has(t) || !SVG_THEMES.has(t)) {
    const emoji = THEME_EMOJI[t]?.[hand] ?? YELLOW_EMOJI[hand];
    const { transform: styleTransform, filter: _f, ...restStyle } = style ?? {};
    return (
      <span
        className={`inline-flex items-center justify-center leading-none select-none ${className}`}
        style={{
          fontSize: size * 0.92,
          transform: [styleTransform, `scale(${scale})`].filter(Boolean).join(' '),
          filter:
            boost >= 2
              ? 'drop-shadow(0 3px 0 rgba(0,0,0,0.55)) drop-shadow(0 0 14px rgba(251,191,36,0.65))'
              : 'drop-shadow(0 3px 0 rgba(0,0,0,0.45)) drop-shadow(0 1px 0 rgba(255,255,255,0.25))',
          ...restStyle,
        }}
        aria-hidden
      >
        {emoji}
      </span>
    );
  }

  const paint = themePaint(t, id);
  return (
    <span
      className={`inline-flex items-center justify-center leading-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: [style?.transform, `scale(${scale})`].filter(Boolean).join(' '),
        filter:
          boost >= 2
            ? `${paint.glow} drop-shadow(0 0 14px rgba(250,204,21,0.7))`
            : paint.glow,
        ...style,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 112 112" width="100%" height="100%" className="overflow-visible">
        <Defs id={id} />
        <g
          fill={paint.edge}
          stroke="#020617"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          transform="translate(0 2)"
          opacity="0.7"
        >
          <HandPaths hand={hand} />
        </g>
        <g
          fill={paint.fill}
          stroke={paint.stroke}
          strokeWidth={t === 'comic' ? 4 : 2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#${id}-depth)`}
        >
          <HandPaths hand={hand} />
        </g>
        <g fill={`url(#${id}-shine)`} stroke="none" transform="translate(-0.5 -0.5)" opacity="0.35">
          <HandPaths hand={hand} />
        </g>
      </svg>
    </span>
  );
}
