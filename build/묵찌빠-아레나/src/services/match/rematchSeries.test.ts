/**
 * rematchSeries 단위 테스트 — sessionStorage 폴리필
 */
import assert from 'node:assert/strict';

class MemStorage {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

(globalThis as unknown as { sessionStorage: MemStorage }).sessionStorage = new MemStorage();

import {
  beginRematchSeries,
  clearRematchSeries,
  isSeriesComplete,
  isSeriesInProgress,
  loadRematchSeries,
  recordSeriesGameResult,
  seriesScoreLabel,
} from './rematchSeries';

clearRematchSeries();
const s = beginRematchSeries({
  opponentNickname: 'TEST',
  tableId: 'gold',
  ruleId: 'classic_bo3',
});
assert.equal(s.myWins, 0);
assert.equal(s.oppWins, 0);
assert.equal(isSeriesInProgress(s), true);

const a = recordSeriesGameResult(true, 'g1');
assert.equal(a!.myWins, 1);
assert.equal(seriesScoreLabel(a!), '1 – 0');

// 중복 gameId 무시
const a2 = recordSeriesGameResult(true, 'g1');
assert.equal(a2!.myWins, 1);

const b = recordSeriesGameResult(true, 'g2');
assert.equal(b!.myWins, 2);
assert.equal(isSeriesComplete(b), true);
assert.equal(b!.winner, 'ME');

clearRematchSeries();
assert.equal(loadRematchSeries(), null);

console.log('rematchSeries.test.ts OK');
