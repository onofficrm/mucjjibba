import type { Mission, MissionEvent, MissionEventPayload, MissionEventType, MissionService } from '@/types/mission';
import { DemoMissionService } from './DemoMissionService';

type Listener = (missions: Mission[]) => void;
type ServiceResolver = () => MissionService;

/**
 * 페이지에 미션 로직을 흩뿌리지 않고, 이벤트만 emit 하도록 중앙 처리.
 */
class MissionEventHandlerImpl {
  private resolver: ServiceResolver = () => new DemoMissionService();
  private override: MissionService | null = null;
  private listeners = new Set<Listener>();
  private queue: Promise<void> = Promise.resolve();

  /** app bootstrap에서 getMissionService 연결 */
  configure(resolver: ServiceResolver) {
    this.resolver = resolver;
  }

  /** 테스트에서 서비스 직접 주입 */
  setService(service: MissionService | null) {
    this.override = service;
  }

  private getService() {
    return this.override ?? this.resolver();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(missions: Mission[]) {
    this.listeners.forEach((l) => {
      try {
        l(missions);
      } catch {
        /* ignore */
      }
    });
  }

  emit(type: MissionEventType, payload?: MissionEventPayload): Promise<Mission[]> {
    const event: MissionEvent = {
      type,
      payload,
      at: new Date().toISOString(),
    };

    const run = async () => {
      const missions = await this.getService().handleEvent(event);
      this.notify(missions);
      return missions;
    };

    const next = this.queue.then(run, run);
    this.queue = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  async refresh(): Promise<Mission[]> {
    const missions = await this.getService().getMissions();
    this.notify(missions);
    return missions;
  }
}

export const missionEventHandler = new MissionEventHandlerImpl();

export function trackMission(type: MissionEventType, payload?: MissionEventPayload) {
  return missionEventHandler.emit(type, payload);
}
