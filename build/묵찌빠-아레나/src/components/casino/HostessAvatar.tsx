import { motion } from 'motion/react';
import { HOSTESS, hostessByIndex, type HostessRole } from '@/data/hostessAssets';
import { resolveAssetUrl } from '@/utils/assetUrl';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

const SIZE: Record<Size, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  hero: 'w-40 h-52',
};

export function HostessAvatar({
  role = 'icon',
  index,
  size = 'md',
  className = '',
  ring = true,
  pulse = false,
  alt = '아레나 호스티스',
}: {
  role?: HostessRole;
  index?: number;
  size?: Size;
  className?: string;
  ring?: boolean;
  pulse?: boolean;
  alt?: string;
}) {
  const src = resolveAssetUrl(index !== undefined ? hostessByIndex(index) : HOSTESS[role]);

  return (
    <motion.span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${SIZE[size]} ${
        ring ? 'ring-2 ring-arena-gold/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]' : ''
      } ${className}`}
      animate={pulse ? { scale: [1, 1.04, 1] } : undefined}
      transition={pulse ? { duration: 2.2, repeat: Infinity } : undefined}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover object-top" draggable={false} />
    </motion.span>
  );
}

/** 화면 배경용 반투명 호스티스 — 우측 윙, 하단·좌측 페이드로 UI와 겹치지 않게 */
export function HostessBackdrop({
  role = 'lobby',
  className = '',
  opacity = 0.28,
}: {
  role?: HostessRole;
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <img
        src={resolveAssetUrl(HOSTESS[role])}
        alt=""
        className="absolute right-0 top-[8%] h-[72%] w-auto max-w-[46%] object-cover object-[center_12%] select-none"
        style={{
          opacity,
          WebkitMaskImage:
            'linear-gradient(to left, black 35%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 18%, black 55%, transparent 100%)',
          maskImage:
            'linear-gradient(to left, black 35%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 18%, black 55%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

/** 카드/패널 상단 배너 */
export function HostessBanner({
  role = 'play',
  className = '',
  heightClass = 'h-28',
}: {
  role?: HostessRole;
  className?: string;
  heightClass?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${heightClass} ${className}`}>
      <img
        src={resolveAssetUrl(HOSTESS[role])}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-[center_18%] scale-[1.08]"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
    </div>
  );
}
