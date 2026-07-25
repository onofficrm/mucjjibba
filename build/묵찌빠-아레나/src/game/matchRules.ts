/** 매치 룰 — 1·2·3차 로드맵 (선승 / 한판 / 연승피니시 / 더블 / 손봉인 / 리벤지) */

export type Hand = 'ROCK' | 'SCISSORS' | 'PAPER';

export type WinMode =
  | 'first_to'
  | 'sudden_death'
  | 'streak_finish'
  | 'double_or_nothing';

export type HandModifier = 'none' | 'hand_seal' | 'revenge' | 'seal_and_revenge';

export type MatchRuleId =
  | 'classic_bo3'
  | 'classic_bo5'
  | 'classic_bo7'
  | 'sudden_death'
  | 'streak_finish'
  | 'double_or_nothing'
  | 'hand_seal'
  | 'revenge'
  | 'vip_mix';

export interface MatchRules {
  id: MatchRuleId;
  /** 목록/배지용 짧은 이름 */
  shortLabel: string;
  /** 테이블·설정용 이름 */
  label: string;
  /** 한 줄 설명 */
  description: string;
  winMode: WinMode;
  /** first_to / double_or_nothing 목표 점수 (sudden=1) */
  pointsToWin: number;
  /** streak_finish 필요 연속 승점 */
  streakNeeded: number;
  handModifier: HandModifier;
  /** 라이프바 칸 수 */
  lifeBarMax: number;
}

export const MATCH_RULES: Record<MatchRuleId, MatchRules> = {
  classic_bo3: {
    id: 'classic_bo3',
    shortLabel: '3판2승',
    label: '클래식 3판 2승',
    description: '먼저 2승점을 가져가면 승리합니다.',
    winMode: 'first_to',
    pointsToWin: 2,
    streakNeeded: 2,
    handModifier: 'none',
    lifeBarMax: 2,
  },
  classic_bo5: {
    id: 'classic_bo5',
    shortLabel: '5판3승',
    label: '클래식 5판 3승',
    description: '먼저 3승점을 가져가면 승리합니다.',
    winMode: 'first_to',
    pointsToWin: 3,
    streakNeeded: 2,
    handModifier: 'none',
    lifeBarMax: 3,
  },
  classic_bo7: {
    id: 'classic_bo7',
    shortLabel: '7판4승',
    label: '클래식 7판 4승',
    description: '먼저 4승점을 가져가면 승리합니다.',
    winMode: 'first_to',
    pointsToWin: 4,
    streakNeeded: 2,
    handModifier: 'none',
    lifeBarMax: 4,
  },
  sudden_death: {
    id: 'sudden_death',
    shortLabel: '한판승부',
    label: '한 판 승부',
    description: '첫 승점을 내는 순간 경기가 끝납니다.',
    winMode: 'sudden_death',
    pointsToWin: 1,
    streakNeeded: 1,
    handModifier: 'none',
    lifeBarMax: 1,
  },
  streak_finish: {
    id: 'streak_finish',
    shortLabel: '연승피니시',
    label: '연승 피니시',
    description: '연속 2승점을 먼저 내면 총점과 관계없이 승리합니다.',
    winMode: 'streak_finish',
    pointsToWin: 2,
    streakNeeded: 2,
    handModifier: 'none',
    lifeBarMax: 2,
  },
  double_or_nothing: {
    id: 'double_or_nothing',
    shortLabel: '더블승부',
    label: '더블 오어 낫싱',
    description: '1-1(동점 매치포인트)에서 다음 승점은 2점으로 처리됩니다.',
    winMode: 'double_or_nothing',
    pointsToWin: 2,
    streakNeeded: 2,
    handModifier: 'none',
    lifeBarMax: 2,
  },
  hand_seal: {
    id: 'hand_seal',
    shortLabel: '손봉인',
    label: '손 봉인',
    description: '매 선택마다 손 하나가 봉인됩니다. 3판 2승.',
    winMode: 'first_to',
    pointsToWin: 2,
    streakNeeded: 2,
    handModifier: 'hand_seal',
    lifeBarMax: 2,
  },
  revenge: {
    id: 'revenge',
    shortLabel: '리벤지',
    label: '리벤지 룰',
    description: '방금 진 손은 다음 선택에 쓸 수 없습니다. 3판 2승.',
    winMode: 'first_to',
    pointsToWin: 2,
    streakNeeded: 2,
    handModifier: 'revenge',
    lifeBarMax: 2,
  },
  vip_mix: {
    id: 'vip_mix',
    shortLabel: 'VIP믹스',
    label: 'VIP 봉인+리벤지',
    description: '5판 3승 + 손 봉인 + 리벤지. 최고난이도.',
    winMode: 'first_to',
    pointsToWin: 3,
    streakNeeded: 2,
    handModifier: 'seal_and_revenge',
    lifeBarMax: 3,
  },
};

/** 친구방·설정에서 고를 수 있는 룰 목록 (순서 = UI) */
export const SELECTABLE_RULE_IDS: MatchRuleId[] = [
  'classic_bo3',
  'classic_bo5',
  'classic_bo7',
  'sudden_death',
  'streak_finish',
  'double_or_nothing',
  'hand_seal',
  'revenge',
  'vip_mix',
];

/** 테이블 ID → 기본 룰 */
export const TABLE_DEFAULT_RULE: Record<string, MatchRuleId> = {
  practice: 'classic_bo3',
  bronze: 'classic_bo3',
  silver: 'classic_bo5',
  gold: 'streak_finish',
  platinum: 'double_or_nothing',
  vip: 'vip_mix',
};

export function getMatchRules(id?: MatchRuleId | null): MatchRules {
  if (id && MATCH_RULES[id]) return MATCH_RULES[id];
  return MATCH_RULES.classic_bo3;
}

export function resolveMatchRules(opts: {
  ruleId?: MatchRuleId | null;
  tableId?: string | null;
  /** 레거시 친구방 bestOf */
  bestOf?: 3 | 5 | 7 | null;
}): MatchRules {
  if (opts.ruleId) return getMatchRules(opts.ruleId);
  if (opts.bestOf === 7) return MATCH_RULES.classic_bo7;
  if (opts.bestOf === 5) return MATCH_RULES.classic_bo5;
  if (opts.bestOf === 3) return MATCH_RULES.classic_bo3;
  if (opts.tableId && TABLE_DEFAULT_RULE[opts.tableId]) {
    return getMatchRules(TABLE_DEFAULT_RULE[opts.tableId]);
  }
  return MATCH_RULES.classic_bo3;
}

export function applyPointGain(
  rules: MatchRules,
  myScore: number,
  opponentScore: number,
  scorer: 'ME' | 'OPPONENT',
): { myScore: number; opponentScore: number; awarded: number } {
  const mp = rules.pointsToWin - 1;
  const isDouble =
    rules.winMode === 'double_or_nothing' &&
    mp >= 1 &&
    myScore === mp &&
    opponentScore === mp;
  const gain = isDouble ? 2 : 1;
  if (scorer === 'ME') {
    return { myScore: myScore + gain, opponentScore, awarded: gain };
  }
  return { myScore, opponentScore: opponentScore + gain, awarded: gain };
}

export function hasWonMatch(
  rules: MatchRules,
  myScore: number,
  opponentScore: number,
  myPointStreak: number,
  opponentPointStreak: number,
): 'ME' | 'OPPONENT' | null {
  if (rules.winMode === 'streak_finish') {
    if (myPointStreak >= rules.streakNeeded) return 'ME';
    if (opponentPointStreak >= rules.streakNeeded) return 'OPPONENT';
    return null;
  }
  // sudden_death / first_to / double_or_nothing — 목표 점수 선착
  if (myScore >= rules.pointsToWin) return 'ME';
  if (opponentScore >= rules.pointsToWin) return 'OPPONENT';
  return null;
}

/** 매치포인트(다음 승점이면 종료) 여부 — UI용 */
export function isMatchPoint(
  rules: MatchRules,
  myScore: number,
  opponentScore: number,
  myPointStreak: number,
  opponentPointStreak: number,
): boolean {
  if (rules.winMode === 'streak_finish') {
    return (
      myPointStreak === rules.streakNeeded - 1 ||
      opponentPointStreak === rules.streakNeeded - 1
    );
  }
  if (rules.winMode === 'sudden_death') return true;
  if (rules.winMode === 'double_or_nothing') {
    const mp = rules.pointsToWin - 1;
    return myScore >= mp && opponentScore >= mp;
  }
  return myScore === rules.pointsToWin - 1 || opponentScore === rules.pointsToWin - 1;
}

export function usesHandSeal(rules: MatchRules): boolean {
  return rules.handModifier === 'hand_seal' || rules.handModifier === 'seal_and_revenge';
}

export function usesRevenge(rules: MatchRules): boolean {
  return rules.handModifier === 'revenge' || rules.handModifier === 'seal_and_revenge';
}

const ALL: Hand[] = ['ROCK', 'SCISSORS', 'PAPER'];

export function pickSealedHand(exclude?: Hand | null): Hand {
  const pool = exclude ? ALL.filter((h) => h !== exclude) : ALL;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function availableHands(opts: {
  sealed: Hand | null;
  revengeBan: Hand | null;
}): Hand[] {
  return ALL.filter((h) => h !== opts.sealed && h !== opts.revengeBan);
}

export function pickRandomAvailable(opts: {
  sealed: Hand | null;
  revengeBan: Hand | null;
}): Hand {
  const pool = availableHands(opts);
  if (pool.length === 0) return ALL[Math.floor(Math.random() * 3)];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function handKo(hand: Hand): string {
  return hand === 'ROCK' ? '묵' : hand === 'SCISSORS' ? '찌' : '빠';
}
