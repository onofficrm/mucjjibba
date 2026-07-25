import assert from 'node:assert/strict';
import { easyRoundLabel, easyStatusMessage } from './playEase';

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

console.log('playEase.test.ts OK');
