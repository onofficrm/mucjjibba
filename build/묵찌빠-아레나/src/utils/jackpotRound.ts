const KEY = 'arena_jackpot_round';

/** 매치 시작 시 ~8% 확률로 잭팟 라운드 발동 (세션 단위) */
export function rollJackpotRound(force?: boolean): boolean {
  if (force) {
    sessionStorage.setItem(KEY, '1');
    return true;
  }
  const hit = Math.random() < 0.08;
  if (hit) sessionStorage.setItem(KEY, '1');
  else sessionStorage.removeItem(KEY);
  return hit;
}

export function isJackpotRoundActive(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function clearJackpotRound() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** 잭팟 라운드 승점 배수 */
export function jackpotPointMultiplier(): number {
  return isJackpotRoundActive() ? 2 : 1;
}
