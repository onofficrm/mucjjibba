import assert from 'node:assert/strict';
import { SOUND_PRESETS, SOUND_PRESET_IDS } from '../utils/soundPresets';
import { jitter, pickVariant } from '../utils/audioSynth';

assert.equal(SOUND_PRESET_IDS.length, 5);
assert.ok(SOUND_PRESETS.dynamic.intensityBoost > SOUND_PRESETS.quiet.intensityBoost);
assert.equal(SOUND_PRESETS.sfx_only.bgm, 0);
assert.equal(SOUND_PRESETS.voice_off.voice, 0);
assert.equal(SOUND_PRESETS.quiet.voiceCalls, false);
assert.equal(SOUND_PRESETS.dynamic.voiceCalls, true);

// 변형 선택: 연속 동일 인덱스 회피
{
  let last = 0;
  for (let i = 0; i < 20; i++) {
    const next = pickVariant(4, last);
    assert.notEqual(next, last);
    assert.ok(next >= 0 && next < 4);
    last = next;
  }
}

assert.equal(pickVariant(1, 0), 0);

// 지터 범위
for (let i = 0; i < 30; i++) {
  const v = jitter(100, 0.05);
  assert.ok(v >= 95 && v <= 105);
}

console.log('audioEnhance.test.ts OK');
