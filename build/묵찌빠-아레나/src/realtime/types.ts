import type { Hand, PlayerSide } from '@/types/gameLog';

export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'restoring'
  | 'resumed'
  | 'failed';

export interface GameSnapshot {
  gameId: string;
  phase: string;
  round: number;
  myScore: number;
  opponentScore: number;
  attacker: PlayerSide | null;
  myHand: Hand | null;
  opponentHand: Hand | null;
  mySelectionLocked: boolean;
  opponentSelectionLocked: boolean;
  timeLeft: number;
  timerLimit: number;
  winner: PlayerSide | null;
  serverTime: string;
}

export type SocketEventMap = {
  status: ConnectionStatus;
  snapshot: GameSnapshot;
  error: string;
};

export interface GameSocketAdapter {
  connect(gameId: string): Promise<void>;
  disconnect(): void;
  requestSnapshot(): Promise<GameSnapshot>;
  simulateDisconnect?(): void;
  on<K extends keyof SocketEventMap>(event: K, cb: (payload: SocketEventMap[K]) => void): void;
  off<K extends keyof SocketEventMap>(event: K, cb: (payload: SocketEventMap[K]) => void): void;
  getStatus(): ConnectionStatus;
}
