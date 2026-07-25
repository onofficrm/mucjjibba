import assert from 'node:assert/strict';
import { buildMatchDebrief } from './matchDebrief';
import { createSampleGameLog } from './sampleGameLog';

const win = createSampleGameLog({
  myScore: 2,
  opponentScore: 1,
  winner: 'ME',
});
const d = buildMatchDebrief(win);
assert.ok(d);
assert.ok(d!.headline.length > 0);
assert.ok(d!.bullets.length >= 1);
assert.ok(d!.tip.length > 0);

assert.equal(buildMatchDebrief(null), null);

console.log('matchDebrief.test.ts OK');
