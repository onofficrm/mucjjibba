import hostessDealer from '@/assets/hostess/hostess-dealer.png';
import hostessVictory from '@/assets/hostess/hostess-victory.png';
import hostessLobby from '@/assets/hostess/hostess-lobby.png';
import hostessIcon from '@/assets/hostess/hostess-icon.png';
import hostessPlay from '@/assets/hostess/hostess-play.png';
import hostessRock from '@/assets/hostess/hostess-rock.png';
import hostessScissors from '@/assets/hostess/hostess-scissors.png';
import hostessPaper from '@/assets/hostess/hostess-paper.png';
import hostessMatch from '@/assets/hostess/hostess-match.png';
import hostessRoulette from '@/assets/hostess/hostess-roulette.png';
import hostessSpectate from '@/assets/hostess/hostess-spectate.png';
import hostessJackpot from '@/assets/hostess/hostess-jackpot.png';
import hostessComfort from '@/assets/hostess/hostess-comfort.png';
import hostessTable from '@/assets/hostess/hostess-table.png';
import hostessArena from '@/assets/hostess/hostess-arena.png';
import { resolveAssetUrl } from '@/utils/assetUrl';

export type HostessRole =
  | 'dealer'
  | 'victory'
  | 'lobby'
  | 'icon'
  | 'play'
  | 'rock'
  | 'scissors'
  | 'paper'
  | 'match'
  | 'roulette'
  | 'spectate'
  | 'jackpot'
  | 'comfort'
  | 'table'
  | 'arena';

/** Vite가 만든 `/assets/...` 경로 — 사용 시 resolveAssetUrl 적용 */
const HOSTESS_RAW: Record<HostessRole, string> = {
  dealer: hostessDealer,
  victory: hostessVictory,
  lobby: hostessLobby,
  icon: hostessIcon,
  play: hostessPlay,
  rock: hostessRock,
  scissors: hostessScissors,
  paper: hostessPaper,
  match: hostessMatch,
  roulette: hostessRoulette,
  spectate: hostessSpectate,
  jackpot: hostessJackpot,
  comfort: hostessComfort,
  table: hostessTable,
  arena: hostessArena,
};

export const HOSTESS: Record<HostessRole, string> = new Proxy(HOSTESS_RAW, {
  get(target, prop: string) {
    if (prop in target) {
      return resolveAssetUrl(target[prop as HostessRole]);
    }
    return undefined;
  },
}) as Record<HostessRole, string>;

/** 화면/버튼용 순환 롤 — 다양성 */
export const HOSTESS_ROSTER: HostessRole[] = [
  'icon',
  'dealer',
  'lobby',
  'play',
  'victory',
  'rock',
  'scissors',
  'paper',
  'match',
  'roulette',
  'spectate',
  'jackpot',
  'comfort',
  'table',
  'arena',
];

export function hostessByIndex(i: number): string {
  return HOSTESS[HOSTESS_ROSTER[Math.abs(i) % HOSTESS_ROSTER.length]];
}

export function hostessForHand(hand: 'ROCK' | 'SCISSORS' | 'PAPER'): string {
  if (hand === 'ROCK') return HOSTESS.rock;
  if (hand === 'SCISSORS') return HOSTESS.scissors;
  return HOSTESS.paper;
}
