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

/** 화면 배경용 반투명 호스티스 */
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
        className="absolute right-[-8%] bottom-0 h-[78%] w-auto max-w-none object-cover object-top select-none"
        style={{ opacity }}
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
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
        className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}
