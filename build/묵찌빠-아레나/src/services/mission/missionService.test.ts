/**
 * 데일리 미션 단위 테스트 (tsx로 실행)
 * npm run test:missions
 */
import assert from 'node:assert/strict';
import { DemoMissionService } from './DemoMissionService';
import { ApiMissionService } from './ApiMissionService';
import {
  getMissionMode,
  getMissionService,
  resetMissionServiceSingleton,
  setMissionModeForTest,
} from './index';
import { missionEventHandler } from './MissionEventHandler';
import { createRequestId, getMissionDayId } from '../../missions/day';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

function makeService(iso?: string) {
  const storage = new MemoryStorage();
  const svc = new DemoMissionService(storage);
  if (iso) svc.setNow(iso);
  return svc;
}

async function run() {
  let passed = 0;
  const ok = (name: string) => {
    passed += 1;
    console.log(`✓ ${name}`);
  };

  // 1) 진행도 증가
  {
    const svc = makeService('2026-07-25T15:00:00');
    await svc.handleEvent({ type: 'SETTINGS_VIEWED' });
    const m = (await svc.getMissions()).find((x) => x.id === 'settings_view')!;
    assert.equal(m.progress, 1);
    assert.equal(m.completed, true);
    ok('미션 진행도 증가');
  }

  // 2) 목표 달성 (묵찌빠 각각)
  {
    const svc = makeService('2026-07-25T15:00:00');
    await svc.handleEvent({ type: 'ROCK_SELECTED' });
    await svc.handleEvent({ type: 'ROCK_SELECTED' }); // 중복 무시
    await svc.handleEvent({ type: 'SCISSORS_SELECTED' });
    let m = (await svc.getMissions()).find((x) => x.id === 'hands_each_once')!;
    assert.equal(m.progress, 2);
    assert.equal(m.completed, false);
    await svc.handleEvent({ type: 'PAPER_SELECTED' });
    m = (await svc.getMissions()).find((x) => x.id === 'hands_each_once')!;
    assert.equal(m.progress, 3);
    assert.equal(m.completed, true);
    ok('여러 선택 이벤트 집계 / 목표 달성');
  }

  // 3) 관전 시간 누적
  {
    const svc = makeService('2026-07-25T15:00:00');
    for (let i = 0; i < 100; i++) {
      await svc.handleEvent({ type: 'SPECTATE_DURATION_UPDATED', payload: { seconds: 1 } });
    }
    let m = (await svc.getMissions()).find((x) => x.id === 'spectate_3min')!;
    assert.equal(m.progress, 100);
    assert.equal(m.completed, false);
    for (let i = 0; i < 80; i++) {
      await svc.handleEvent({ type: 'SPECTATE_DURATION_UPDATED', payload: { seconds: 1 } });
    }
    m = (await svc.getMissions()).find((x) => x.id === 'spectate_3min')!;
    assert.equal(m.progress, 180);
    assert.equal(m.completed, true);
    ok('관전 시간 누적');
  }

  // 4) 보상 수령 + 중복 차단
  {
    const svc = makeService('2026-07-25T15:00:00');
    await svc.handleEvent({ type: 'PRACTICE_COMPLETED' });
    const req1 = createRequestId();
    const first = await svc.claimReward('practice_once', req1);
    assert.equal(first.ok, true);
    assert.equal(first.mission?.claimed, true);

    const secondSameReq = await svc.claimReward('practice_once', req1);
    assert.equal(secondSameReq.ok, false);
    assert.equal(secondSameReq.error, 'ALREADY_CLAIMED');

    const secondNewReq = await svc.claimReward('practice_once', createRequestId());
    assert.equal(secondNewReq.ok, false);
    assert.equal(secondNewReq.error, 'ALREADY_CLAIMED');

    const incomplete = await svc.claimReward('reaction_once', createRequestId());
    assert.equal(incomplete.ok, false);
    assert.equal(incomplete.error, 'NOT_COMPLETED');
    ok('보상 수령 / 중복 보상 차단');
  }

  // 5) 날짜 변경 (14:00 경계)
  {
    const storage = new MemoryStorage();
    const svc = new DemoMissionService(storage);
    svc.setNow('2026-07-25T15:00:00');
    await svc.handleEvent({ type: 'TUTORIAL_COMPLETED' });
    let m = (await svc.getMissions()).find((x) => x.id === 'tutorial_complete')!;
    assert.equal(m.completed, true);
    const dayA = getMissionDayId(new Date('2026-07-25T15:00:00'));

    // 다음날 15:00 → 새 dayId
    const svc2 = new DemoMissionService(storage);
    svc2.setNow('2026-07-26T15:00:00');
    // storage still has old dayId — load should detect mismatch and refresh
    const list = await svc2.getMissions();
    const dayB = getMissionDayId(new Date('2026-07-26T15:00:00'));
    assert.notEqual(dayA, dayB);
    m = list.find((x) => x.id === 'tutorial_complete')!;
    assert.equal(m.completed, false);
    assert.equal(m.progress, 0);
    ok('날짜 변경 시 새 데일리 미션');
  }

  // 6) EventHandler 통합
  {
    const svc = makeService('2026-07-25T16:00:00');
    missionEventHandler.setService(svc);
    await missionEventHandler.emit('AI_DEMO_WATCHED');
    const m = (await svc.getMissions()).find((x) => x.id === 'ai_demo_watch')!;
    assert.equal(m.completed, true);
    missionEventHandler.setService(null);
    ok('MissionEventHandler 이벤트 처리');
  }

  // 7) 데모 / API 모드 전환
  {
    setMissionModeForTest('demo');
    resetMissionServiceSingleton();
    assert.equal(getMissionMode(), 'demo');
    assert.ok(getMissionService() instanceof DemoMissionService);

    setMissionModeForTest('api');
    resetMissionServiceSingleton();
    assert.equal(getMissionMode(), 'api');
    const apiSvc = getMissionService();
    assert.ok(apiSvc instanceof ApiMissionService);
    // base 없음 → Demo 폴백으로 동작
    await apiSvc.handleEvent({ type: 'FRIEND_ROOM_CREATED' });
    const missions = await apiSvc.getMissions();
    assert.equal(missions.find((m) => m.id === 'friend_room')?.completed, true);

    // mock fetch API
    const mockFetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      if (String(_input).endsWith('/missions/daily/events')) {
        return new Response(JSON.stringify([{ id: 'from_api', title: 'api', description: '', icon: 'target', category: 'practice', target: 1, progress: 1, completed: true, claimed: false, rewardType: 'exp', rewardValue: 'exp_50', startedAt: '', expiresAt: '' }]), { status: 200 });
      }
      if (String(_input).includes('/claim')) {
        return new Response(JSON.stringify({ ok: true, requestId: body.requestId }), { status: 200 });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    }) as typeof fetch;

    const pureApi = new ApiMissionService('https://api.example.com', mockFetch, false);
    const evResult = await pureApi.handleEvent({ type: 'REACTION_SENT' });
    assert.equal(evResult[0]?.id, 'from_api');

    setMissionModeForTest(null);
    resetMissionServiceSingleton();
    ok('데모 모드와 API 모드 전환');
  }

  console.log(`\nAll ${passed} mission tests passed.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
