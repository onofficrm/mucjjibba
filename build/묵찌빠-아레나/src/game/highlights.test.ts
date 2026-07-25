import assert from 'node:assert/strict';
import { analyzeHighlights } from './highlights';
import { createSampleGameLog } from './sampleGameLog';

async function run() {
  assert.deepEqual(analyzeHighlights(null), []);
  assert.deepEqual(analyzeHighlights({} as any), []);

  const log = createSampleGameLog();
  const hs = analyzeHighlights(log);
  const types = hs.map((h) => h.type);
  assert.ok(types.includes('SWEEP_2_0'));
  assert.ok(types.includes('LAST_SECOND_SELECT'));
  assert.ok(types.includes('STREAK_RECORD'));
  assert.ok(types.includes('QUICK_MATCH'));

  const comeback = createSampleGameLog({
    myScore: 2,
    opponentScore: 1,
    attackSteals: 3,
    rounds: [
      {
        round: 1,
        myHand: 'ROCK',
        opponentHand: 'ROCK',
        attackerBefore: 'OPPONENT',
        attackerAfter: 'OPPONENT',
        result: 'POINT_OPPONENT',
        timeLeftOnSelect: 3,
        timerLimit: 5,
        selectDurationMs: 2000,
        selectedAt: new Date().toISOString(),
        lockedAt: new Date().toISOString(),
        revealedAt: new Date().toISOString(),
      },
      {
        round: 2,
        myHand: 'PAPER',
        opponentHand: 'PAPER',
        attackerBefore: 'ME',
        attackerAfter: 'ME',
        result: 'POINT_ME',
        timeLeftOnSelect: 2,
        timerLimit: 5,
        selectDurationMs: 2000,
        selectedAt: new Date().toISOString(),
        lockedAt: new Date().toISOString(),
        revealedAt: new Date().toISOString(),
      },
      {
        round: 3,
        myHand: 'SCISSORS',
        opponentHand: 'SCISSORS',
        attackerBefore: 'ME',
        attackerAfter: 'ME',
        result: 'POINT_ME',
        timeLeftOnSelect: 2,
        timerLimit: 5,
        selectDurationMs: 2000,
        selectedAt: new Date().toISOString(),
        lockedAt: new Date().toISOString(),
        revealedAt: new Date().toISOString(),
      },
    ],
  });
  const cTypes = analyzeHighlights(comeback).map((h) => h.type);
  assert.ok(cTypes.includes('COMEBACK'));
  assert.ok(cTypes.includes('ATTACK_STEAL_3'));

  console.log('✓ highlight tests passed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
