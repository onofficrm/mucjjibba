import assert from 'node:assert/strict';
import { getWeekId, gradeFromWeeklyPoints, getWeekRange } from './weekId';

const id = getWeekId(new Date('2026-07-25T12:00:00Z'));
assert.match(id, /^\d{4}-W\d{2}$/);

const range = getWeekRange(new Date('2026-07-25T12:00:00'));
assert.ok(range.label.includes('주간 리그'));
assert.ok(new Date(range.startsAt) <= new Date(range.endsAt));

assert.equal(gradeFromWeeklyPoints(100), '브론즈');
assert.equal(gradeFromWeeklyPoints(1500), '골드');
assert.equal(gradeFromWeeklyPoints(9000), '마스터');

console.log('weekId.test.ts OK');
