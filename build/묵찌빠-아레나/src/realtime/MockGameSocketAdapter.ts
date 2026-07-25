import type { ConnectionStatus, GameSnapshot, GameSocketAdapter, SocketEventMap } from './types';

type Handler<T> = (payload: T) => void;

export class MockGameSocketAdapter implements GameSocketAdapter {
  private status: ConnectionStatus = 'disconnected';
  private gameId = '';
  private listeners: { [K in keyof SocketEventMap]?: Set<Handler<SocketEventMap[K]>> } = {};
  private snapshot: GameSnapshot | null = null;
  private reconnectAttempts = 0;

  constructor(
    private readonly options: {
      failTimes?: number;
      reconnectDelayMs?: number;
      initialSnapshot?: Partial<GameSnapshot>;
    } = {},
  ) {}

  getStatus() {
    return this.status;
  }

  on<K extends keyof SocketEventMap>(event: K, cb: Handler<SocketEventMap[K]>) {
    if (!this.listeners[event]) this.listeners[event] = new Set() as any;
    (this.listeners[event] as Set<Handler<SocketEventMap[K]>>).add(cb);
  }

  off<K extends keyof SocketEventMap>(event: K, cb: Handler<SocketEventMap[K]>) {
    this.listeners[event]?.delete(cb as any);
  }

  private emit<K extends keyof SocketEventMap>(event: K, payload: SocketEventMap[K]) {
    this.listeners[event]?.forEach((cb) => (cb as Handler<SocketEventMap[K]>)(payload));
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.emit('status', status);
  }

  private buildSnapshot(): GameSnapshot {
    return {
      phase: 'SELECTING',
      round: 2,
      myScore: 1,
      opponentScore: 0,
      attacker: 'ME',
      myHand: null,
      opponentHand: null,
      mySelectionLocked: false,
      opponentSelectionLocked: false,
      timeLeft: 4,
      timerLimit: 5,
      winner: null,
      serverTime: new Date().toISOString(),
      ...this.options.initialSnapshot,
      gameId: this.gameId || this.options.initialSnapshot?.gameId || 'mock-game',
    };
  }

  async connect(gameId: string): Promise<void> {
    this.gameId = gameId;
    this.snapshot = this.buildSnapshot();
    this.setStatus('connected');
  }

  disconnect(): void {
    this.setStatus('disconnected');
  }

  simulateDisconnect(): void {
    this.setStatus('disconnected');
    void this.autoReconnect();
  }

  private async autoReconnect() {
    const failTimes = this.options.failTimes ?? 0;
    const delay = this.options.reconnectDelayMs ?? 80;
    this.setStatus('reconnecting');
    this.reconnectAttempts = 0;

    while (this.reconnectAttempts <= failTimes) {
      await sleep(delay);
      this.reconnectAttempts += 1;
      if (this.reconnectAttempts <= failTimes) {
        continue;
      }
    }

    this.setStatus('restoring');
    await sleep(delay);
    const snap = await this.requestSnapshot();
    this.emit('snapshot', snap);
    this.setStatus('resumed');
    this.setStatus('connected');
  }

  async requestSnapshot(): Promise<GameSnapshot> {
    if (!this.snapshot) this.snapshot = this.buildSnapshot();
    this.snapshot = {
      ...this.snapshot,
      serverTime: new Date().toISOString(),
      timeLeft: Math.max(0, this.snapshot.timeLeft),
    };
    return { ...this.snapshot };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
