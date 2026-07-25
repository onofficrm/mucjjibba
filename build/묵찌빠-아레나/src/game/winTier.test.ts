import assert from 'node:assert/strict';
import { createSampleGameLog } from './sampleGameLog';
import { isNearMissLoss, resolveWinTier, streakAuraLevel, streakMultiplierLabel } from './winTier';

const sweep = createSampleGameLog({ myScore: 2, opponentScore: 0, winner: 'ME', currentStreakAfter: 6 });
assert.equal(resolveWinTier(sweep, 2, 0).tier, 'JACKPOT');

const normal = createSampleGameLog({
  myScore: 2,
  opponentScore: 1,
  winner: 'ME',
  currentStreakAfter: 1,
  attackSteals: 0,
  isTournamentFinal: false,
});
// 2:1 일반승 (스윕 아님, 연승·탈환 낮음)
assert.equal(resolveWinTier(normal, 2, 1).tier, 'BIG_WIN');

assert.equal(isNearMissLoss(1, 2, 'OPPONENT'), true);
assert.equal(isNearMissLoss(0, 2, 'OPPONENT'), false);

assert.equal(streakAuraLevel(5), 3);
assert.ok(streakMultiplierLabel(5)?.includes('1.5'));

console.log('winTier.test.ts OK');
