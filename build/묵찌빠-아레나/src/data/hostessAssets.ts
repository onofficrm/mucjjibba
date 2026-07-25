import hostessDealer from '@/assets/hostess/hostess-dealer.png';
import hostessVictory from '@/assets/hostess/hostess-victory.png';
import hostessLobby from '@/assets/hostess/hostess-lobby.png';
import hostessIcon from '@/assets/hostess/hostess-icon.png';
import hostessPlay from '@/assets/hostess/hostess-play.png';
import { resolveAssetUrl } from '@/utils/assetUrl';

export type HostessRole = 'dealer' | 'victory' | 'lobby' | 'icon' | 'play';

/** Vite가 만든 `/assets/...` 경로 — 사용 시 resolveAssetUrl 적용 */
const HOSTESS_RAW: Record<HostessRole, string> = {
  dealer: hostessDealer,
  victory: hostessVictory,
  lobby: hostessLobby,
  icon: hostessIcon,
  play: hostessPlay,
};

export const HOSTESS: Record<HostessRole, string> = new Proxy(HOSTESS_RAW, {
  get(target, prop: string) {
    if (prop in target) {
      return resolveAssetUrl(target[prop as HostessRole]);
    }
    return undefined;
  },
}) as Record<HostessRole, string>;

/** 화면/버튼용 순환 롤 — 생동감 */
export const HOSTESS_ROSTER: HostessRole[] = ['icon', 'dealer', 'lobby', 'play', 'victory'];

export function hostessByIndex(i: number): string {
  return HOSTESS[HOSTESS_ROSTER[Math.abs(i) % HOSTESS_ROSTER.length]];
}
