import { DEMO_ACTIVITIES } from '@/data/demoData';

const EXTRA = [
  '🔥 GOLDKING 6연승 달성!',
  '⚔️ VIP 테이블 진검승부 진행 중',
  '🏆 8인 토너먼트 결승 곧 시작',
  '👀 인기 경기 128명 관전 중',
  '💎 MEGA WIN 연속 등장!',
];

export function ActivityMarquee() {
  const items = [
    ...DEMO_ACTIVITIES.map((a) => a.text),
    ...EXTRA,
  ];
  const line = items.join('   ·   ');

  return (
    <div className="relative overflow-hidden rounded-xl border border-arena-gold/25 bg-gradient-to-r from-black via-zinc-900 to-black py-2.5 md:py-3.5 mb-1 md:mb-0">
      <div className="absolute left-0 top-0 bottom-0 w-10 md:w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 md:w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      <div className="flex whitespace-nowrap animate-marquee will-change-transform">
        <span className="text-xs md:text-sm font-bold text-arena-gold/90 px-4">{line}</span>
        <span className="text-xs md:text-sm font-bold text-arena-gold/90 px-4" aria-hidden>
          {line}
        </span>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  );
}
