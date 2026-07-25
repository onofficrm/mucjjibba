import { MockGameSocketAdapter } from './MockGameSocketAdapter';
import { RealGameSocketAdapter } from './RealGameSocketAdapter';
import type { GameSocketAdapter } from './types';

export function createGameSocketAdapter(): GameSocketAdapter {
  const mode = ((import.meta as any).env?.VITE_GAME_SOCKET_MODE as string | undefined)?.toLowerCase();
  if (mode === 'real') return new RealGameSocketAdapter();
  return new MockGameSocketAdapter({ failTimes: 1, reconnectDelayMs: 400 });
}
