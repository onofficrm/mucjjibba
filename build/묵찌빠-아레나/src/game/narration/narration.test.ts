import assert from 'node:assert/strict';
import { narrationEngine, pickNarration, pickNarrationText } from './engine';
import { linesFor } from './lines';

// 풀 크기
assert.ok(linesFor('start', 'hype').length >= 12);
assert.ok(linesFor('point_win', 'hype').length >= 12);
assert.ok(linesFor('final_win', 'fun').length >= 8);
assert.ok(linesFor('start', 'minimal').length >= 2);

// 반복 방지: 연속 픽이 항상 같지 않도록 (충분히 큰 풀)
narrationEngine.resetMatch('test-1');
const seen = new Set<string>();
for (let i = 0; i < 8; i++) {
  const p = pickNarration('point_win', { style: 'hype', force: true });
  assert.ok(p);
  seen.add(p!.text);
}
assert.ok(seen.size >= 4, `expected variety, got ${seen.size}`);

// 컨텍스트 승격: 연승
narrationEngine.resetMatch('test-2');
const streakPick = pickNarration('point_win', {
  style: 'hype',
  force: true,
  streak: 3,
});
assert.ok(streakPick);
assert.ok(
  streakPick!.cue === 'streak_3' || streakPick!.cue === 'rare' || streakPick!.cue === 'point_win',
);

// 손 편중 문구
const bias = pickNarrationText('pattern_hand_bias', {
  style: 'calm',
  dominantHand: 'ROCK',
  dominantPct: 62,
});
assert.ok(bias.includes('묵') || bias.includes('비중') || bias.includes('편중') || bias.includes('쏠'));

// minimal 은 짧게
const mini = pickNarrationText('final_win', { style: 'minimal' });
assert.ok(mini.length <= 12);

console.log('narration.test.ts OK');
