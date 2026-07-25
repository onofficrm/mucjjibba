import type { ConnectionStatus, GameSnapshot, GameSocketAdapter, SocketEventMap } from './types';

type Handler<T> = (payload: T) => void;

/**
 * 실제 WebSocket 어댑터 스켈레톤.
 * VITE_GAME_WS_URL 이 없으면 connect 시 에러를 emit하고 상태를 failed로 둔다.
 */
export class RealGameSocketAdapter implements GameSocketAdapter {
  private status: ConnectionStatus = 'disconnected';
  private ws: WebSocket | null = null;
  private listeners: { [K in keyof SocketEventMap]?: Set<Handler<SocketEventMap[K]>> } = {};
  private gameId = '';

  constructor(private readonly url = (import.meta as any).env?.VITE_GAME_WS_URL as string | undefined) {}

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

  async connect(gameId: string): Promise<void> {
    this.gameId = gameId;
    if (!this.url) {
      this.setStatus('failed');
      this.emit('error', 'VITE_GAME_WS_URL 미설정 — RealGameSocketAdapter 사용 불가');
      return;
    }
    this.setStatus('reconnecting');
    await new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?gameId=${encodeURIComponent(gameId)}`);
        this.ws.onopen = () => {
          this.setStatus('connected');
          resolve();
        };
        this.ws.onclose = () => this.setStatus('disconnected');
        this.ws.onerror = () => {
          this.setStatus('failed');
          this.emit('error', 'WebSocket 연결 실패');
          reject(new Error('ws error'));
        };
        this.ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(String(ev.data));
            if (msg.type === 'snapshot') this.emit('snapshot', msg.payload as GameSnapshot);
          } catch {
            /* ignore */
          }
        };
      } catch (e) {
        this.setStatus('failed');
        reject(e);
      }
    });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.setStatus('disconnected');
  }

  async requestSnapshot(): Promise<GameSnapshot> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('socket not connected');
    }
    this.setStatus('restoring');
    this.ws.send(JSON.stringify({ type: 'game:snapshot', gameId: this.gameId }));
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('snapshot timeout')), 5000);
      const onSnap = (snap: GameSnapshot) => {
        window.clearTimeout(timer);
        this.off('snapshot', onSnap);
        this.setStatus('resumed');
        this.setStatus('connected');
        resolve(snap);
      };
      this.on('snapshot', onSnap);
    });
  }
}
