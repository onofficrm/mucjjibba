import assert from 'node:assert/strict';
import { MockGameSocketAdapter } from './MockGameSocketAdapter';

async function waitFor(
  adapter: MockGameSocketAdapter,
  want: string,
  timeoutMs = 3000,
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (adapter.getStatus() === want) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error(`timeout waiting for ${want}, got ${adapter.getStatus()}`);
}

async function run() {
  const adapter = new MockGameSocketAdapter({ failTimes: 1, reconnectDelayMs: 30 });
  const statuses: string[] = [];
  let snapshotReceived = false;

  adapter.on('status', (s) => statuses.push(s));
  adapter.on('snapshot', () => {
    snapshotReceived = true;
  });

  await adapter.connect('g-1');
  assert.equal(adapter.getStatus(), 'connected');

  adapter.simulateDisconnect();
  await waitFor(adapter, 'reconnecting');
  await waitFor(adapter, 'restoring');
  await waitFor(adapter, 'connected');

  assert.ok(snapshotReceived);
  assert.ok(statuses.includes('disconnected'));
  assert.ok(statuses.includes('reconnecting'));
  assert.ok(statuses.includes('restoring'));
  assert.ok(statuses.includes('resumed'));

  const snap = await adapter.requestSnapshot();
  assert.equal(snap.gameId, 'g-1');
  assert.ok(typeof snap.timeLeft === 'number');
  assert.ok(typeof snap.myScore === 'number');

  console.log('✓ reconnect mock flow tests passed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
