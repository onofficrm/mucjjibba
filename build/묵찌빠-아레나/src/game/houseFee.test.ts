import assert from 'node:assert/strict';
import { computeBaseFee, computeHouseSettlement, didScoreWithAttack } from './houseFee';
import { HOUSE_FEE_POLICY } from './houseFeePolicy';
import { createSampleGameLog } from './sampleGameLog';

// pot rake (bronze–gold)
{
  const { pot, baseFee, winnerPayout } = computeBaseFee({
    entryPoint: 10_000,
    model: 'pot_rake',
  });
  assert.equal(pot, 20_000);
  assert.equal(baseFee, Math.round(20_000 * HOUSE_FEE_POLICY.potRakeRate));
  assert.equal(winnerPayout, pot - baseFee);
}

// winner profit tax (platinum/vip)
{
  const { pot, baseFee, winnerPayout } = computeBaseFee({
    entryPoint: 50_000,
    model: 'winner_profit_tax',
  });
  assert.equal(pot, 100_000);
  assert.equal(baseFee, Math.round(50_000 * HOUSE_FEE_POLICY.winnerProfitTaxRate));
  assert.equal(winnerPayout, pot - baseFee);
}

// free
{
  const s = computeHouseSettlement({
    entryPoint: 0,
    tableId: 'practice',
    isFree: true,
    won: true,
  });
  assert.equal(s.model, 'none');
  assert.equal(s.houseFee, 0);
  assert.equal(s.winnerCredit, 0);
}

// bronze win — pot rake, no attack premium
{
  const s = computeHouseSettlement({
    entryPoint: 1_000,
    tableId: 'bronze',
    won: true,
  });
  assert.equal(s.model, 'pot_rake');
  assert.equal(s.pot, 2_000);
  assert.equal(s.attackPremiumFee, 0);
  assert.equal(s.winnerCredit, s.winnerPayoutBeforeJackpot);
  assert.ok(s.winnerCredit > 0);
}

// loss — no credit
{
  const s = computeHouseSettlement({
    entryPoint: 1_000,
    tableId: 'bronze',
    won: false,
  });
  assert.equal(s.winnerCredit, 0);
  assert.ok(s.houseFee >= 0);
}

// attack premium when scored with attack
{
  const log = createSampleGameLog({
    myScore: 2,
    opponentScore: 0,
    winner: 'ME',
  });
  // force an attack-scored point round if sample doesn't have one
  if (log.rounds.length > 0) {
    log.rounds[0] = {
      ...log.rounds[0],
      result: 'POINT_ME',
      attackerBefore: 'ME',
    };
  }
  assert.equal(didScoreWithAttack(log, 'ME'), true);

  const s = computeHouseSettlement({
    entryPoint: 10_000,
    tableId: 'gold',
    won: true,
    gameLog: log,
  });
  if (HOUSE_FEE_POLICY.attackPremium.enabled) {
    assert.ok(s.attackPremiumApplied);
    assert.ok(s.attackPremiumFee > 0);
    assert.equal(s.houseFee, s.baseFee + s.attackPremiumFee);
  }
}

// jackpot multiplier on credit only
{
  const base = computeHouseSettlement({
    entryPoint: 1_000,
    tableId: 'bronze',
    won: true,
  });
  const jack = computeHouseSettlement({
    entryPoint: 1_000,
    tableId: 'bronze',
    won: true,
    jackpotMultiplier: 2,
  });
  assert.equal(jack.winnerCredit, Math.floor(base.winnerPayoutBeforeJackpot * 2));
}

console.log('houseFee.test.ts OK');
