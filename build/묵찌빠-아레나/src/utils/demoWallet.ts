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
