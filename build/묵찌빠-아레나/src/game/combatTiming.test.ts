import assert from 'node:assert/strict';
import {
  getOpponentThinkMs,
  getPickTimeLimit,
  getResultReadMs,
  getRevealSchedule,
  resolveCombatPace,
  tempoScale,
} from './combatTiming';

assert.equal(resolveCombatPace({}), 'calm');
assert.equal(resolveCombatPace({ isMatchPoint: true }), 'urgent');
assert.equal(resolveCombatPace({ isSuddenDeath: true }), 'urgent');
assert.equal(resolveCombatPace({ timeLeft: 2 }), 'urgent');
assert.equal(resolveCombatPace({ timeLeft: 5 }), 'calm');

assert.equal(getPickTimeLimit(false, 'calm', 'default'), 8);
assert.equal(getPickTimeLimit(false, 'urgent', 'default'), 5);
assert.equal(getPickTimeLimit(true, 'calm', 'default'), 12);
assert.ok(getPickTimeLimit(false, 'calm', 'comfortable') > getPickTimeLimit(false, 'calm', 'default'));
assert.ok(getPickTimeLimit(false, 'calm', 'fast') < getPickTimeLimit(false, 'calm', 'default'));

assert.ok(tempoScale('comfortable') > 1);
assert.ok(tempoScale('fast') < 1);

const calm = getRevealSchedule(false, 'calm', 'default');
const urgent = getRevealSchedule(false, 'urgent', 'default');
const calmFast = getRevealSchedule(false, 'calm', 'fast');
const calmSlow = getRevealSchedule(false, 'calm', 'comfortable');
assert.ok(calm.snapAtMs > urgent.snapAtMs);
assert.ok(calm.logicAtMs > urgent.logicAtMs);
assert.ok(calmSlow.snapAtMs > calm.snapAtMs);
assert.ok(calmFast.snapAtMs < calm.snapAtMs);
assert.ok(getResultReadMs(false, false, 'calm', 'default') > getResultReadMs(false, false, 'urgent', 'default'));

const thinkCalm = getOpponentThinkMs('calm', 'default');
const thinkUrgent = getOpponentThinkMs('urgent', 'default');
assert.ok(thinkCalm >= 750);
assert.ok(thinkUrgent < 700);

console.log('combatTiming.test.ts OK');
