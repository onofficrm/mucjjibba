import assert from 'node:assert/strict';
import {
  describePlayPath,
  easyRoundLabel,
  easyStatusMessage,
  getResumeButtonCopy,
  saveLastPlayPath,
  getLastPlayPath,
  getLastPlayLabel,
} from './playEase';

assert.equal(easyRoundLabel('WIN'), '이겼어요!');
assert.equal(easyRoundLabel('결과 공개'), '패 공개');
assert.equal(easyRoundLabel('FINAL ROUND'), '마지막 판');

assert.equal(
  easyStatusMessage({
    phase: 'ATTACK_DECISION',
    attacker: null,
    roundMessage: '',
    myHand: false,
    isLastRound: false,
  }),
  '아래에서 하나를 눌러주세요',
);

assert.equal(
  easyStatusMessage({
    phase: 'SELECTING',
    attacker: 'ME',
    roundMessage: '',
    myHand: false,
    isLastRound: true,
  }),
  '마지막! 아래에서 골라주세요',
);

assert.equal(describePlayPath('/game/beginner-ai'), '무료 연습');
assert.equal(describePlayPath('/game/quick-start'), '빠른 대전');
assert.equal(describePlayPath('/game/abc/result'), '최근 대전');

// memory storage shim for node
const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => {
    mem.set(k, v);
  },
  removeItem: (k: string) => {
    mem.delete(k);
  },
};

saveLastPlayPath('/game/beginner-ai');
assert.equal(getLastPlayPath(), '/game/beginner-ai');
assert.equal(getLastPlayLabel(), '무료 연습');

saveLastPlayPath('/game/foo/result');
assert.equal(getLastPlayPath(), '/game/beginner-ai', 'result path must not overwrite');

saveLastPlayPath('/game/live-42', '실버 테이블');
assert.equal(getLastPlayLabel(), '실버 테이블');

const copy = getResumeButtonCopy();
assert.ok(copy);
assert.ok(copy!.title.includes('다시 시작'));
assert.ok(copy!.hint.includes('진행 중 복구 아님'));

console.log('playEase.test.ts OK');
