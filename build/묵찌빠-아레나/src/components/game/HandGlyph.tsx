import { useId, type CSSProperties } from 'react';

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

function themePaint(theme: GlyphTheme, id: string) {
  switch (theme) {
    case 'gold':
      return {
        fill: `url(#${id}-gold)`,
        stroke: '#fcd34d',
        edge: '#78350f',
        glow: 'drop-shadow(0 0 16px rgba(245,158,11,0.65)) drop-shadow(0 8px 3px rgba(0,0,0,0.7))',
      };
    case 'neon':
      return {
        fill: `url(#${id}-neon)`,
        stroke: '#a5f3fc',
        edge: '#164e63',
        glow: 'drop-shadow(0 0 16px rgba(34,211,238,0.8)) drop-shadow(0 8px 3px rgba(0,0,0,0.7))',
      };
    case 'fire':
      return {
        fill: `url(#${id}-fire)`,
        stroke: '#fdba74',
        edge: '#7f1d1d',
        glow: 'drop-shadow(0 0 17px rgba(249,115,22,0.8)) drop-shadow(0 8px 3px rgba(0,0,0,0.7))',
      };
    case 'ice':
      return {
        fill: `url(#${id}-ice)`,
        stroke: '#e0f2fe',
        edge: '#075985',
        glow: 'drop-shadow(0 0 15px rgba(56,189,248,0.7)) drop-shadow(0 8px 3px rgba(0,0,0,0.65))',
      };
    case 'comic':
      return {
        fill: `url(#${id}-comic)`,
        stroke: '#111827',
        edge: '#030712',
        glow: 'drop-shadow(0 7px 0 #000) drop-shadow(3px 3px 0 #f59e0b)',
      };
    default:
      return {
        fill: `url(#${id}-classic)`,
        stroke: '#f8fafc',
        edge: '#475569',
        glow: 'drop-shadow(0 9px 3px rgba(0,0,0,0.75)) drop-shadow(0 0 10px rgba(255,255,255,0.12))',
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

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-classic`} x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="38%" stopColor="#e2e8f0" />
        <stop offset="72%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stopColor="#fff7c2" />
        <stop offset="25%" stopColor="#fcd34d" />
        <stop offset="58%" stopColor="#d97706" />
        <stop offset="82%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
      <linearGradient id={`${id}-neon`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ecfeff" />
        <stop offset="24%" stopColor="#67e8f9" />
        <stop offset="60%" stopColor="#7e22ce" />
        <stop offset="100%" stopColor="#164e63" />
      </linearGradient>
      <linearGradient id={`${id}-fire`} x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stopColor="#fff7ad" />
        <stop offset="28%" stopColor="#facc15" />
        <stop offset="60%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
      <linearGradient id={`${id}-ice`} x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="32%" stopColor="#bae6fd" />
        <stop offset="68%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
      <linearGradient id={`${id}-comic`} x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#ffedd5" />
        <stop offset="100%" stopColor="#fdba74" />
      </linearGradient>
      <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="34%" stopColor="#ffffff" stopOpacity="0.24" />
        <stop offset="64%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-depth`} x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="5" stdDeviation="1.5" floodColor="#020617" floodOpacity="0.9" />
        <feDropShadow dx="-1" dy="-1" stdDeviation="0.8" floodColor="#ffffff" floodOpacity="0.35" />
      </filter>
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
  const rawId = useId();
  const id = `hand-${rawId.replace(/:/g, '')}`;
  const t = resolveGlyphTheme(theme);
  const useSvg = SVG_THEMES.has(t);
  const boost = Math.max(0, Math.min(comboBoost, 5));
  const scale = 1 + boost * 0.1;
  const paint = themePaint(t, id);
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
        <Defs id={id} />
        {/* Extruded lower edge gives the hand a substantial 3D silhouette. */}
        <g
          fill={paint.edge}
          stroke="#020617"
          strokeWidth={theme === 'comic' ? 6 : 4.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          transform="translate(0 5)"
          opacity="0.95"
        >
          <HandPaths hand={hand} />
        </g>
        <g
          fill={paint.fill}
          stroke={paint.stroke}
          strokeWidth={theme === 'comic' ? 5 : 3.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#${id}-depth)`}
        >
          <HandPaths hand={hand} />
        </g>
        {/* Upper-left specular bevel; clipped by the same hand silhouette. */}
        <g
          fill={`url(#${id}-shine)`}
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          transform="translate(-1 -1)"
          opacity="0.62"
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
