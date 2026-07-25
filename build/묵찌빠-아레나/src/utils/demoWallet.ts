/** 데모용 가상 지갑 — 결제/출금 없음, localStorage만 사용 */

const STORAGE_KEY = 'arena_demo_wallet_v1';
const EVENT = 'arena-demo-wallet';

export interface DemoWallet {
  points: number;
  skinFragments: number;
  titleTickets: number;
}

const BASE_POINTS = 15000;

function defaultWallet(): DemoWallet {
  return {
    points: BASE_POINTS,
    skinFragments: 0,
    titleTickets: 0,
  };
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadDemoWallet(): DemoWallet {
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (!raw) return defaultWallet();
    const parsed = JSON.parse(raw) as Partial<DemoWallet>;
    return {
      ...defaultWallet(),
      ...parsed,
      points: typeof parsed.points === 'number' ? Math.max(0, parsed.points) : BASE_POINTS,
    };
  } catch {
    return defaultWallet();
  }
}

function save(wallet: DemoWallet) {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: wallet }));
  }
}

export function getDemoPoints(): number {
  return loadDemoWallet().points;
}

export function creditDemoPoints(amount: number): DemoWallet {
  const wallet = loadDemoWallet();
  if (amount !== 0) {
    wallet.points = Math.max(0, wallet.points + amount);
    save(wallet);
  }
  return wallet;
}

/** 참가 포인트 예치 — 부족하면 null */
export function depositMatchPoints(entryPoint: number): DemoWallet | null {
  const wallet = loadDemoWallet();
  if (entryPoint <= 0) return wallet;
  if (wallet.points < entryPoint) return null;
  wallet.points -= entryPoint;
  save(wallet);
  return wallet;
}

/**
 * 경기 정산 (이미 예치된 경우)
 * - 승리: winnerPoint 지급 (수수료는 테이블 설계에 이미 반영)
 * - 패배: 예치금 소멸 (추가 차감 없음)
 * - 연습: 변동 없음
 */
export function settleMatchPoints(opts: {
  isFree: boolean;
  winnerPoint: number;
  won: boolean;
  alreadyDeposited: boolean;
  entryPoint: number;
}): DemoWallet {
  if (opts.isFree) return loadDemoWallet();
  if (opts.won) {
    return creditDemoPoints(opts.winnerPoint);
  }
  // 패배: 예치 안 됐으면 참가비 차감, 예치됐으면 이미 반영됨
  if (!opts.alreadyDeposited && opts.entryPoint > 0) {
    return creditDemoPoints(-opts.entryPoint);
  }
  return loadDemoWallet();
}

export function creditSkinFragment(count = 1): DemoWallet {
  const wallet = loadDemoWallet();
  wallet.skinFragments += count;
  save(wallet);
  return wallet;
}

export function creditTitleTicket(count = 1): DemoWallet {
  const wallet = loadDemoWallet();
  wallet.titleTickets += count;
  save(wallet);
  return wallet;
}

export type RoulettePrizeKind = 'points' | 'skin' | 'title';

export function applyRouletteReward(prize: {
  kind: RoulettePrizeKind;
  amount: number;
}): DemoWallet {
  if (prize.kind === 'points') return creditDemoPoints(prize.amount);
  if (prize.kind === 'skin') return creditSkinFragment(1);
  return creditTitleTicket(1);
}

export function subscribeDemoWallet(listener: (wallet: DemoWallet) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<DemoWallet>).detail;
    listener(detail ?? loadDemoWallet());
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
