import { LogOut, Volume2, VolumeX, Info, Keyboard, Settings } from 'lucide-react';
import { ConnectionBadge } from '@/components/game/ReconnectOverlay';
import type { ConnectionStatus } from '@/realtime/types';
import { getTierTheme } from '@/utils/tierTheme';
import type { AmbienceTier } from '@/utils/audio';

type PlayerId = 'ME' | 'OPPONENT';

function LifeBar({ score, max = 2, side }: { score: number; max?: number; side: 'left' | 'right' }) {
  const filled = Math.min(max, Math.max(0, score));
  const segments = Array.from({ length: Math.max(1, max) }, (_, i) => i < filled);
  return (
    <div
      className={`flex-1 h-4 md:h-5 rounded-sm border-2 border-white/90 overflow-hidden flex bg-red-700/90 ${
        side === 'right' ? 'flex-row-reverse' : ''
      }`}
    >
      {segments.map((on, i) => (
        <div
          key={i}
          className={`flex-1 h-full border-white/30 ${on ? 'bg-lime-400' : 'bg-transparent'} ${
            side === 'left' ? 'border-r' : 'border-l'
          }`}
        />
      ))}
    </div>
  );
}

/** 대결 HUD — 점수·타이머·공격권·연승을 한 언어로 */
export function DuelHud({
  myName,
  oppName,
  myScore,
  opponentScore,
  timeLeft,
  attacker,
  connStatus,
  tier,
  isLastRound,
  soundEnabled,
  hasKeyboard,
  showKeyGuide,
  comboHits,
  onFire,
  jackpot,
  ruleShortLabel = '3판2승',
  lifeBarMax = 2,
  onExit,
  onToggleMute,
  onInfo,
  onSettings,
  onToggleLayout,
  toggleKeyGuide,
}: {
  myName: string;
  oppName: string;
  myScore: number;
  opponentScore: number;
  timeLeft: number;
  attacker: PlayerId | null;
  connStatus: ConnectionStatus;
  tier: AmbienceTier;
  isLastRound: boolean;
  soundEnabled: boolean;
  hasKeyboard: boolean;
  showKeyGuide: boolean;
  comboHits: number;
  onFire: boolean;
  jackpot: boolean;
  ruleShortLabel?: string;
  lifeBarMax?: number;
  onExit: () => void;
  onToggleMute: () => void;
  onInfo: () => void;
  onSettings?: () => void;
  onToggleLayout: () => void;
  toggleKeyGuide: () => void;
}) {
  const theme = getTierTheme(tier);
  const urgent = timeLeft <= 3;
  const attackLabel =
    attacker === 'ME' ? '내 공격' : attacker === 'OPPONENT' ? '상대 공격' : null;

  return (
    <div className="relative z-20 px-3 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.85rem))] md:px-6 md:pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+1rem))] space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onExit}
            className="w-9 h-9 rounded-lg bg-black/50 border-2 border-white/20 flex items-center justify-center text-white/80"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="w-9 h-9 rounded-lg bg-black/50 border-2 border-white/20 flex items-center justify-center text-white/80"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 rounded-md bg-red-600 border-2 border-black items-center justify-center font-black text-white text-lg shadow-[2px_2px_0_#000]">
              1
            </div>
            <div className="min-w-0">
              <div className="text-[9px] md:text-[10px] font-black text-amber-300 leading-none">나</div>
              <div className="text-[11px] md:text-xs font-black text-white truncate max-w-[56px] sm:max-w-[72px]">
                {myName}
              </div>
            </div>
          </div>
          <LifeBar score={myScore} max={lifeBarMax} side="left" />

          <div className="flex flex-col items-center shrink-0 px-1">
            <ConnectionBadge status={connStatus} />
            <div className="mt-0.5 flex flex-col items-center rounded-xl bg-black/80 border border-white/15 px-2.5 py-1 shadow-[0_0_20px_rgba(0,0,0,0.55)] backdrop-blur-sm min-w-[4.5rem]">
              <div
                className={`font-display text-[9px] md:text-[10px] font-bold tracking-[0.18em] px-2 py-0.5 rounded-full border ${
                  isLastRound ? 'bg-red-500/25 border-red-400/50 text-red-200' : theme.badge
                }`}
              >
                {isLastRound ? 'MATCH' : ruleShortLabel}
              </div>
              <div
                className={`text-xl md:text-2xl font-black tabular-nums leading-none mt-0.5 ${
                  urgent ? 'text-arena-error' : 'text-arena-gold'
                }`}
                style={{ textShadow: '0 1px 0 #000, 0 0 12px rgba(0,0,0,0.8)' }}
              >
                {timeLeft}
              </div>
              {attackLabel && (
                <div
                  className={`mt-0.5 text-[8px] font-black tracking-wide px-1.5 py-px rounded ${
                    attacker === 'ME'
                      ? 'bg-arena-gold/90 text-black'
                      : 'bg-rose-500/90 text-white'
                  }`}
                >
                  {attackLabel}
                </div>
              )}
            </div>
          </div>

          <LifeBar score={opponentScore} max={lifeBarMax} side="right" />
          <div className="flex items-center gap-1.5 min-w-0 flex-row-reverse">
            <div className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 rounded-md bg-red-600 border-2 border-black items-center justify-center font-black text-white text-lg shadow-[2px_2px_0_#000]">
              2
            </div>
            <div className="min-w-0 text-right">
              <div className="text-[9px] md:text-[10px] font-black text-amber-300 leading-none">상대</div>
              <div className="text-[11px] md:text-xs font-black text-white truncate max-w-[56px] sm:max-w-[72px]">
                {oppName}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5">
          {hasKeyboard && (
            <button
              type="button"
              onClick={toggleKeyGuide}
              title="단축키 가이드 (H)"
              className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-colors ${
                showKeyGuide
                  ? 'bg-amber-400/90 border-black text-black shadow-[2px_2px_0_#000]'
                  : 'bg-black/50 border-white/20 text-white/80'
              }`}
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onInfo}
            className="hidden md:flex w-9 h-9 rounded-lg bg-black/50 border-2 border-white/20 items-center justify-center text-white/80"
          >
            <Info className="w-4 h-4" />
          </button>
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              title="게임 설정"
              className="hidden md:flex w-9 h-9 rounded-lg bg-black/50 border-2 border-white/20 items-center justify-center text-white/80"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLayout}
            className="px-2 h-9 rounded-lg bg-amber-400/90 border-2 border-black text-[10px] font-black text-black shadow-[2px_2px_0_#000]"
          >
            심플
          </button>
        </div>
      </div>

      {(comboHits >= 2 || onFire || jackpot) && (
        <div className="flex justify-center gap-1.5 pointer-events-none">
          {jackpot && (
            <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full bg-violet-500/90 text-white border border-black/40 shadow-[2px_2px_0_#000]">
              JACKPOT ×2
            </span>
          )}
          {onFire && (
            <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full bg-orange-500/90 text-white border border-black/40 shadow-[2px_2px_0_#000]">
              ON FIRE
            </span>
          )}
          {comboHits >= 2 && (
            <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full bg-lime-400 text-black border border-black/40 shadow-[2px_2px_0_#000]">
              HIT ×{comboHits}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
