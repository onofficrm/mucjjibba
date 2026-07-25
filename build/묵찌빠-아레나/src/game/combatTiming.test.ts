import assert from 'node:assert/strict';
import {
  getOpponentThinkMs,
  getPickTimeLimit,
  getResultReadMs,
  getRevealSchedule,
  resolveCombatPace,
} from './combatTiming';

assert.equal(resolveCombatPace({}), 'calm');
assert.equal(resolveCombatPace({ isMatchPoint: true }), 'urgent');
assert.equal(resolveCombatPace({ isSuddenDeath: true }), 'urgent');
assert.equal(resolveCombatPace({ timeLeft: 2 }), 'urgent');
assert.equal(resolveCombatPace({ timeLeft: 5 }), 'calm');

assert.equal(getPickTimeLimit(false, 'calm'), 8);
assert.equal(getPickTimeLimit(false, 'urgent'), 5);
assert.equal(getPickTimeLimit(true, 'calm'), 12);

const calm = getRevealSchedule(false, 'calm');
const urgent = getRevealSchedule(false, 'urgent');
assert.ok(calm.snapAtMs > urgent.snapAtMs);
assert.ok(calm.logicAtMs > urgent.logicAtMs);
assert.ok(getResultReadMs(false, false, 'calm') > getResultReadMs(false, false, 'urgent'));

const thinkCalm = getOpponentThinkMs('calm');
const thinkUrgent = getOpponentThinkMs('urgent');
assert.ok(thinkCalm >= 750);
assert.ok(thinkUrgent < 700);

console.log('combatTiming.test.ts OK');
