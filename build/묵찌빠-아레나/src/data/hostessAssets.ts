import hostessDealer from '@/assets/hostess/hostess-dealer.png';
import hostessVictory from '@/assets/hostess/hostess-victory.png';
import hostessLobby from '@/assets/hostess/hostess-lobby.png';
import hostessIcon from '@/assets/hostess/hostess-icon.png';
import hostessPlay from '@/assets/hostess/hostess-play.png';

export type HostessRole = 'dealer' | 'victory' | 'lobby' | 'icon' | 'play';

export const HOSTESS: Record<HostessRole, string> = {
  dealer: hostessDealer,
  victory: hostessVictory,
  lobby: hostessLobby,
  icon: hostessIcon,
  play: hostessPlay,
};

/** 화면/버튼용 순환 롤 — 생동감 */
export const HOSTESS_ROSTER: HostessRole[] = ['icon', 'dealer', 'lobby', 'play', 'victory'];

export function hostessByIndex(i: number): string {
  return HOSTESS[HOSTESS_ROSTER[Math.abs(i) % HOSTESS_ROSTER.length]];
}
