import type {
  ClaimResult,
  Mission,
  MissionEvent,
  MissionProgressSummary,
  MissionService,
} from '@/types/mission';
import { DemoMissionService } from './DemoMissionService';

type FetchLike = typeof fetch;

/**
 * 운영용 API 미션 서비스.
 * 백엔드가 없을 때는 로컬 DemoMissionService로 위임하되,
 * 동일 인터페이스를 유지해 교체 가능하게 한다.
 */
export class ApiMissionService implements MissionService {
  private fallback: DemoMissionService | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike = fetch.bind(globalThis),
    private readonly allowFallback = true,
  ) {
    if (!baseUrl && allowFallback) {
      this.fallback = new DemoMissionService();
    }
  }

  setNow(iso: string | null) {
    this.fallback?.setNow(iso);
  }

  async resetForDay(dayId?: string) {
    if (this.fallback) {
      await this.fallback.resetForDay(dayId);
      return;
    }
    await this.request('POST', '/missions/daily/reset', { dayId });
  }

  private url(path: string) {
    return `${this.baseUrl.replace(/\/$/, '')}${path}`;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('VITE_MISSION_API_BASE가 설정되지 않았습니다.');
    }
    const res = await this.fetchImpl(this.url(path), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = new Error(`Mission API ${res.status}`);
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }
    return res.json() as Promise<T>;
  }

  async getMissions(): Promise<Mission[]> {
    if (this.fallback) return this.fallback.getMissions();
    try {
      return await this.request<Mission[]>('GET', '/missions/daily');
    } catch (e) {
      if (this.allowFallback) {
        this.fallback = new DemoMissionService();
        return this.fallback.getMissions();
      }
      throw e;
    }
  }

  async getSummary(): Promise<MissionProgressSummary> {
    if (this.fallback) return this.fallback.getSummary();
    return this.request<MissionProgressSummary>('GET', '/missions/daily/summary');
  }

  async handleEvent(event: MissionEvent): Promise<Mission[]> {
    if (this.fallback) return this.fallback.handleEvent(event);
    return this.request<Mission[]>('POST', '/missions/daily/events', event);
  }

  async claimReward(missionId: string, requestId: string): Promise<ClaimResult> {
    if (this.fallback) return this.fallback.claimReward(missionId, requestId);
    return this.request<ClaimResult>('POST', `/missions/daily/${missionId}/claim`, { requestId });
  }
}
