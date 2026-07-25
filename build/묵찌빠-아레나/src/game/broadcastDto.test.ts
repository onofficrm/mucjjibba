import assert from 'node:assert/strict';
import { BROADCAST_FORBIDDEN_KEYS, toBroadcastPublicDTO } from './broadcastDto';
import { createSampleGameLog } from './sampleGameLog';

function hasForbidden(obj: unknown, keys = BROADCAST_FORBIDDEN_KEYS): boolean {
  const json = JSON.stringify(obj).toLowerCase();
  return keys.some((k) => json.includes(k.toLowerCase()));
}

async function run() {
  const dto = toBroadcastPublicDTO(createSampleGameLog());
  assert.ok(dto.player1.displayName.includes('*'));
  assert.equal(typeof dto.spectatorCount, 'number');
  assert.equal(hasForbidden(dto), false);
  assert.ok(!('email' in (dto as object)));
  console.log('✓ broadcast dto tests passed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
