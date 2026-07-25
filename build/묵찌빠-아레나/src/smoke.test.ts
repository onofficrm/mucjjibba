/**
 * 출시 전 핵심 계약 스모크 — 로비→플레이→결과 경로의
 * 룰·타이밍·나레이션·재접속·이어하기 의미를 한 번에 검증한다.
 */
import assert from 'node:assert/strict';
import {
  getPickTimeLimit,
  getRevealSchedule,
  getRoundStartDelayMs,
  getToResultDelayMs,
  resolveCombatPace,
} from './game/combatTiming';
import { getMatchRules, isMatchPoint } from './game/matchRules';
import { narrationEngine, pickNarrationText } from './game/narration';
import { describePlayPath, getResumeButtonCopy, saveLastPlayPath } from './utils/playEase';
import { MockGameSocketAdapter } from './realtime/MockGameSocketAdapter';

// --- 전투 템포 ---
assert.equal(resolveCombatPace({}), 'calm');
assert.equal(resolveCombatPace({ isMatchPoint: true }), 'urgent');
const calmReveal = getRevealSchedule(false, 'calm', 'default');
const urgentReveal = getRevealSchedule(false, 'urgent', 'default');
assert.ok(calmReveal.logicAtMs > urgentReveal.logicAtMs);
assert.ok(getRoundStartDelayMs('calm', 'default') >= 2000);
assert.ok(getToResultDelayMs('calm', 'default') >= 2000);
assert.equal(getPickTimeLimit(false, 'calm', 'default'), 8);

// --- 매치 룰: 3판2승 매치포인트 ---
const classic = getMatchRules('classic_bo3');
assert.equal(classic.pointsToWin, 2);
assert.ok(isMatchPoint(classic, 1, 0, 0, 0));

// --- 나레이션 ---
narrationEngine.resetMatch('smoke-1');
const line = pickNarrationText('start', {
  style: 'hype',
  force: true,
  myScore: 0,
  opponentScore: 0,
});
assert.ok(typeof line === 'string' && line.length > 0);

// --- 이어하기: 진행 중 복구가 아님 ---
const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => mem.set(k, v),
  removeItem: (k: string) => mem.delete(k),
};
saveLastPlayPath('/game/beginner-ai');
assert.equal(describePlayPath('/game/beginner-ai'), '무료 연습');
const resume = getResumeButtonCopy();
assert.ok(resume?.hint.includes('진행 중 복구 아님'));

// --- 재접속 Mock ---
async function reconnectSmoke() {
  const adapter = new MockGameSocketAdapter({ failTimes: 1, reconnectDelayMs: 20 });
  let gotSnap = false;
  adapter.on('snapshot', () => {
    gotSnap = true;
  });
  await adapter.connect('smoke-game');
  assert.equal(adapter.getStatus(), 'connected');
  adapter.simulateDisconnect();
  const start = Date.now();
  while (Date.now() - start < 2500) {
    if (adapter.getStatus() === 'connected' && gotSnap) break;
    await new Promise((r) => setTimeout(r, 20));
  }
  assert.equal(adapter.getStatus(), 'connected');
  assert.ok(gotSnap, 'reconnect must restore snapshot');
}

reconnectSmoke()
  .then(() => {
    console.log('smoke.test.ts OK');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
