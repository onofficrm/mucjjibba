import assert from 'node:assert/strict';
import {
  MATCH_RULES,
  applyPointGain,
  availableHands,
  getMatchRules,
  hasWonMatch,
  isMatchPoint,
  resolveMatchRules,
  usesHandSeal,
  usesRevenge,
} from './matchRules';

assert.equal(getMatchRules('classic_bo3').pointsToWin, 2);
assert.equal(getMatchRules('classic_bo5').pointsToWin, 3);
assert.equal(getMatchRules(null).id, 'classic_bo3');

assert.equal(resolveMatchRules({ bestOf: 7 }).id, 'classic_bo7');
assert.equal(resolveMatchRules({ tableId: 'vip' }).id, 'vip_mix');
assert.equal(resolveMatchRules({ ruleId: 'sudden_death' }).pointsToWin, 1);

// first_to
assert.equal(hasWonMatch(MATCH_RULES.classic_bo3, 2, 0, 0, 0), 'ME');
assert.equal(hasWonMatch(MATCH_RULES.classic_bo3, 1, 1, 0, 0), null);
assert.equal(hasWonMatch(MATCH_RULES.sudden_death, 1, 0, 1, 0), 'ME');

// streak_finish — 총점과 무관하게 연속 승점
assert.equal(hasWonMatch(MATCH_RULES.streak_finish, 0, 1, 2, 0), 'ME');
assert.equal(hasWonMatch(MATCH_RULES.streak_finish, 1, 1, 1, 1), null);

// double_or_nothing — 1-1에서 다음 승점 2점
{
  const d = applyPointGain(MATCH_RULES.double_or_nothing, 1, 1, 'ME');
  assert.equal(d.awarded, 2);
  assert.equal(d.myScore, 3);
  assert.equal(hasWonMatch(MATCH_RULES.double_or_nothing, d.myScore, d.opponentScore, 0, 0), 'ME');
}
{
  const n = applyPointGain(MATCH_RULES.double_or_nothing, 0, 0, 'OPPONENT');
  assert.equal(n.awarded, 1);
}

assert.equal(isMatchPoint(MATCH_RULES.classic_bo3, 1, 0, 0, 0), true);
assert.equal(isMatchPoint(MATCH_RULES.sudden_death, 0, 0, 0, 0), true);
assert.equal(isMatchPoint(MATCH_RULES.double_or_nothing, 1, 1, 0, 0), true);

assert.equal(usesHandSeal(MATCH_RULES.hand_seal), true);
assert.equal(usesRevenge(MATCH_RULES.revenge), true);
assert.equal(usesHandSeal(MATCH_RULES.vip_mix) && usesRevenge(MATCH_RULES.vip_mix), true);

assert.deepEqual(
  availableHands({ sealed: 'ROCK', revengeBan: 'SCISSORS' }).sort(),
  ['PAPER'],
);

console.log('matchRules.test.ts OK');
