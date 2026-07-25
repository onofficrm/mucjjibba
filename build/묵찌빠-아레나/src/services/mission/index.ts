import type { MissionService } from '@/types/mission';
import { ApiMissionService } from './ApiMissionService';
import { DemoMissionService } from './DemoMissionService';

export type MissionMode = 'demo' | 'api';

let singleton: MissionService | null = null;
let forcedMode: MissionMode | null = null;

function readViteEnv(key: string): string | undefined {
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
    return env?.[key];
  } catch {
    return undefined;
  }
}

export function getMissionMode(): MissionMode {
  if (forcedMode) return forcedMode;
  const env = readViteEnv('VITE_MISSION_MODE')?.toLowerCase();
  return env === 'api' ? 'api' : 'demo';
}

export function getMissionApiBase(): string {
  return readViteEnv('VITE_MISSION_API_BASE') || '';
}

/** 테스트용 모드 강제 */
export function setMissionModeForTest(mode: MissionMode | null) {
  forcedMode = mode;
  singleton = null;
}

export function resetMissionServiceSingleton() {
  singleton = null;
}

export function getMissionService(): MissionService {
  if (singleton) return singleton;

  const mode = getMissionMode();
  if (mode === 'api') {
    singleton = new ApiMissionService(getMissionApiBase(), fetch.bind(globalThis), true);
  } else {
    singleton = new DemoMissionService();
  }
  return singleton;
}

export { DemoMissionService, ApiMissionService };
export { missionEventHandler, trackMission } from './MissionEventHandler';
