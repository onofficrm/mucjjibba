import assert from 'node:assert/strict';
import { buildPublicVerification } from './verification';
import { createSampleGameLog } from './sampleGameLog';

async function run() {
  assert.equal(buildPublicVerification(null), null);
  const v = buildPublicVerification(createSampleGameLog())!;
  assert.ok(v.gameId);
  assert.ok(v.rounds.length > 0);
  assert.equal(v.status, 'DEMO_ONLY');
  assert.equal(v.points.transactionId, null);
  const json = JSON.stringify(v).toLowerCase();
  assert.ok(!json.includes('password'));
  assert.ok(!json.includes('"ip"'));
  console.log('✓ verification tests passed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
