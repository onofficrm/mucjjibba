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
  private manualClose = false;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private readonly maxReconnectAttempts = 6;

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
    this.manualClose = false;
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
          const wasReconnecting = this.reconnectAttempts > 0;
          this.reconnectAttempts = 0;
          this.setStatus('connected');
          // 재연결 성공 시 최신 상태로 재동기화
          if (wasReconnecting) {
            void this.requestSnapshot().catch(() => {
              /* 스냅샷 실패는 다음 이벤트에서 복구 */
            });
          }
          resolve();
        };
        this.ws.onclose = () => {
          this.setStatus('disconnected');
          this.scheduleReconnect();
        };
        this.ws.onerror = () => {
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

  private scheduleReconnect(): void {
    if (this.manualClose || !this.url) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('failed');
      this.emit('error', '재연결 시도 횟수를 초과했습니다.');
      return;
    }
    if (this.reconnectTimer !== null) return;
    const attempt = this.reconnectAttempts++;
    // 지수 백오프 + 지터 (0.5s → 최대 8s)
    const base = Math.min(8000, 500 * 2 ** attempt);
    const delay = base + Math.random() * 300;
    this.setStatus('reconnecting');
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect(this.gameId).catch(() => {
        this.scheduleReconnect();
      });
    }, delay);
  }

  disconnect(): void {
    this.manualClose = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
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
