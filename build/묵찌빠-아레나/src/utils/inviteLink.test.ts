import assert from 'node:assert/strict';
import {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
  parseInviteCodeFromSearch,
  buildInviteLink,
} from './inviteLink';

assert.equal(normalizeRoomCode(' ab12cd '), 'AB12CD');
assert.equal(isValidRoomCode('ABC123'), true);
assert.equal(isValidRoomCode('AB'), false);

const code = generateRoomCode(6);
assert.equal(code.length, 6);
assert.equal(isValidRoomCode(code), true);

assert.equal(parseInviteCodeFromSearch('?code=xy9z12'), 'XY9Z12');
assert.equal(parseInviteCodeFromSearch('code=bad'), null);

const link = buildInviteLink('hello1');
assert.ok(link.includes('#/match/friend?code=HELLO1'));

console.log('inviteLink.test.ts OK');
