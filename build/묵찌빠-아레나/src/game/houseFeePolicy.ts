/**
 * 하우스 수수료 정책 상수
 * ─────────────────────────────────────────────
 * 문서와 동기화 필수:
 *   docs/HOUSE_FEE_POLICY.md
 * 이 값을 바꾸면 MD §1·§3·§4 도 함께 고치세요.
 */

export type FeeModel = 'pot_rake' | 'winner_profit_tax' | 'none';

export interface HouseFeePolicy {
  /** 문서 버전 / 변경 추적용 */
  version: string;
  /** 기본 테이블: 팟 대비 레이크 */
  potRakeRate: number;
  /** 고액 테이블: 승자 순이익(상대 예치) 과세율 */
  winnerProfitTaxRate: number;
  /** 고액 모델 적용 테이블 id */
  highStakeTableIds: string[];
  /** 공격권으로 승점을 딴 뒤 승리 시 팟 대비 추가 수수료 */
  attackPremium: {
    enabled: boolean;
    /** 팟 대비 추가율 */
    potExtraRate: number;
  };
}

/** ← docs/HOUSE_FEE_POLICY.md 와 동일하게 유지 */
export const HOUSE_FEE_POLICY: HouseFeePolicy = {
  version: '2026-07-25',
  potRakeRate: 0.05,
  winnerProfitTaxRate: 0.05,
  highStakeTableIds: ['platinum', 'vip'],
  attackPremium: {
    enabled: true,
    potExtraRate: 0.01,
  },
};

export function feeModelForTable(tableId: string | null | undefined, isFree: boolean): FeeModel {
  if (isFree) return 'none';
  if (tableId && HOUSE_FEE_POLICY.highStakeTableIds.includes(tableId)) {
    return 'winner_profit_tax';
  }
  return 'pot_rake';
}
