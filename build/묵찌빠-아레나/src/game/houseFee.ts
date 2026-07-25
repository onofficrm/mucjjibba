/**
 * 하우스 수수료 정산 계산
 * 정책: docs/HOUSE_FEE_POLICY.md · houseFeePolicy.ts
 */

import type { GameLog } from '@/types/gameLog';
import {
  feeModelForTable,
  HOUSE_FEE_POLICY,
  type FeeModel,
} from '@/game/houseFeePolicy';

export interface HouseSettlementInput {
  entryPoint: number;
  tableId?: string | null;
  isFree?: boolean;
  /** 내가 승리했는지 */
  won: boolean;
  /** 공격 프리미엄 판정용 로그(없으면 프리미엄 미적용) */
  gameLog?: GameLog | null;
  /** 잭팟 배수(기본 1) — 수수료 차감 후 승자 지급액에만 적용 */
  jackpotMultiplier?: number;
}

export interface HouseSettlementBreakdown {
  version: string;
  model: FeeModel;
  entryPoint: number;
  pot: number;
  /** 기본 모델 수수료(레이크 or 이익세) */
  baseFee: number;
  /** 공격권 프리미엄 추가분 */
  attackPremiumFee: number;
  /** 총 하우스 수수료 */
  houseFee: number;
  /** 잭팟 적용 전 승자 지급 */
  winnerPayoutBeforeJackpot: number;
  jackpotMultiplier: number;
  /** 실제 승자 크레딧(승리 시). 패배면 0 */
  winnerCredit: number;
  /** UI용 짧은 설명 */
  modelLabel: string;
  lines: { label: string; amount: number; tone?: 'muted' | 'fee' | 'win' }[];
  attackPremiumApplied: boolean;
}

function roundFee(n: number): number {
  return Math.max(0, Math.round(n));
}

/** 공격권으로 승점을 딴 적이 있는지 */
export function didScoreWithAttack(gameLog: GameLog | null | undefined, side: 'ME' | 'OPPONENT' = 'ME'): boolean {
  if (!gameLog?.rounds?.length) return false;
  const pointResult = side === 'ME' ? 'POINT_ME' : 'POINT_OPPONENT';
  return gameLog.rounds.some(
    (r) => r.result === pointResult && r.attackerBefore === side,
  );
}

export function computeBaseFee(opts: {
  entryPoint: number;
  model: FeeModel;
}): { pot: number; baseFee: number; winnerPayout: number } {
  const pot = Math.max(0, opts.entryPoint) * 2;
  if (opts.model === 'none' || opts.entryPoint <= 0) {
    return { pot: 0, baseFee: 0, winnerPayout: 0 };
  }
  if (opts.model === 'winner_profit_tax') {
    const profit = opts.entryPoint;
    const baseFee = roundFee(profit * HOUSE_FEE_POLICY.winnerProfitTaxRate);
    return { pot, baseFee, winnerPayout: pot - baseFee };
  }
  // pot_rake
  const baseFee = roundFee(pot * HOUSE_FEE_POLICY.potRakeRate);
  return { pot, baseFee, winnerPayout: pot - baseFee };
}

/**
 * 정식 정산 명세
 * - 승리: winnerCredit 만큼 지갑 크레딧
 * - 패배: winnerCredit = 0 (예치분은 이미 차감된 상태 가정)
 */
export function computeHouseSettlement(input: HouseSettlementInput): HouseSettlementBreakdown {
  const isFree = !!input.isFree || input.entryPoint <= 0;
  const model = feeModelForTable(input.tableId, isFree);
  const { pot, baseFee, winnerPayout } = computeBaseFee({
    entryPoint: input.entryPoint,
    model,
  });

  let attackPremiumFee = 0;
  let attackPremiumApplied = false;
  if (
    !isFree &&
    input.won &&
    HOUSE_FEE_POLICY.attackPremium.enabled &&
    didScoreWithAttack(input.gameLog, 'ME')
  ) {
    attackPremiumFee = roundFee(pot * HOUSE_FEE_POLICY.attackPremium.potExtraRate);
    attackPremiumApplied = attackPremiumFee > 0;
  }

  const houseFee = baseFee + attackPremiumFee;
  const winnerPayoutBeforeJackpot = Math.max(0, winnerPayout - attackPremiumFee);
  const jackpotMultiplier = Math.max(1, input.jackpotMultiplier ?? 1);
  const winnerCredit = input.won
    ? Math.floor(winnerPayoutBeforeJackpot * jackpotMultiplier)
    : 0;

  const modelLabel =
    model === 'none'
      ? '무료 · 수수료 없음'
      : model === 'winner_profit_tax'
        ? `승자 이익세 ${(HOUSE_FEE_POLICY.winnerProfitTaxRate * 100).toFixed(0)}%`
        : `팟 레이크 ${(HOUSE_FEE_POLICY.potRakeRate * 100).toFixed(0)}%`;

  const lines: HouseSettlementBreakdown['lines'] = [];
  if (!isFree) {
    lines.push({ label: '내 예치', amount: input.entryPoint, tone: 'muted' });
    lines.push({ label: '팟 (양쪽 합)', amount: pot, tone: 'muted' });
    lines.push({ label: `기본 수수료 (${modelLabel})`, amount: -baseFee, tone: 'fee' });
    if (attackPremiumApplied) {
      lines.push({
        label: `공격권 프리미엄 (+${(HOUSE_FEE_POLICY.attackPremium.potExtraRate * 100).toFixed(0)}% 팟)`,
        amount: -attackPremiumFee,
        tone: 'fee',
      });
    }
    if (input.won) {
      if (jackpotMultiplier > 1) {
        lines.push({
          label: `잭팟 ×${jackpotMultiplier}`,
          amount: winnerCredit - winnerPayoutBeforeJackpot,
          tone: 'win',
        });
      }
      lines.push({ label: '승자 실지급', amount: winnerCredit, tone: 'win' });
    } else {
      lines.push({ label: '패배 · 예치 소멸', amount: -input.entryPoint, tone: 'fee' });
    }
  } else {
    lines.push({ label: '연습 · 포인트 변동 없음', amount: 0, tone: 'muted' });
  }

  return {
    version: HOUSE_FEE_POLICY.version,
    model,
    entryPoint: input.entryPoint,
    pot,
    baseFee,
    attackPremiumFee,
    houseFee,
    winnerPayoutBeforeJackpot,
    jackpotMultiplier,
    winnerCredit,
    modelLabel,
    lines,
    attackPremiumApplied,
  };
}

/** 테이블 카드/매칭 UI용 — 프리미엄·잭팟 미적용 기본값 */
export function buildTableEconomy(tableId: string, entryPoint: number, isFree = false) {
  const preview = computeHouseSettlement({
    entryPoint,
    tableId,
    isFree: isFree || entryPoint <= 0,
    won: true,
    gameLog: null,
    jackpotMultiplier: 1,
  });
  return {
    entryPoint,
    totalPoint: preview.pot,
    fee: preview.baseFee,
    winnerPoint: preview.winnerPayoutBeforeJackpot,
    model: preview.model,
    modelLabel: preview.modelLabel,
  };
}

export function formatFeeRateLabel(tableId: string, isFree: boolean): string {
  if (isFree) return '수수료 없음';
  const model = feeModelForTable(tableId, false);
  if (model === 'winner_profit_tax') {
    return `이익세 ${(HOUSE_FEE_POLICY.winnerProfitTaxRate * 100).toFixed(0)}%`;
  }
  return `팟 ${(HOUSE_FEE_POLICY.potRakeRate * 100).toFixed(0)}%`;
}
