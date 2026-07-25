import type { GameLog, GameModeTag, Hand, PlayerSide, RoundLog } from '@/types/gameLog';

/** 세션 중 라운드 로그를 누적 (데모/목 검증용). LIVE 서버 로그와 별개. */
export class GameSessionLogBuilder {
  private rounds: RoundLog[] = [];
  private attackSteals = 0;
  private startedAt: string;
  private pendingSelectAt: number | null = null;
  private pendingTimeLeft = 0;
  private pendingTimerLimit = 5;
  private lastAttacker: PlayerSide | null = null;

  constructor(
    private readonly meta: {
      gameId: string;
      mode: GameModeTag;
      me: GameLog['me'];
      opponent: GameLog['opponent'];
      previousBestStreak?: number;
      isTournamentFinal?: boolean;
    },
  ) {
    this.startedAt = new Date().toISOString();
  }

  markSelectStart(timeLeft: number, timerLimit: number) {
    this.pendingSelectAt = Date.now();
    this.pendingTimeLeft = timeLeft;
    this.pendingTimerLimit = timerLimit;
  }

  recordSelect(hand: Hand) {
    if (this.pendingSelectAt == null) {
      this.pendingSelectAt = Date.now();
    }
    return {
      hand,
      selectedAt: new Date().toISOString(),
      selectDurationMs: Date.now() - this.pendingSelectAt,
      timeLeftOnSelect: this.pendingTimeLeft,
      timerLimit: this.pendingTimerLimit,
    };
  }

  pushRound(partial: Omit<RoundLog, 'round'> & { attackerBefore: PlayerSide | null; attackerAfter: PlayerSide | null }) {
    if (
      partial.attackerBefore === 'OPPONENT' &&
      partial.attackerAfter === 'ME'
    ) {
      this.attackSteals += 1;
    }
    this.lastAttacker = partial.attackerAfter;
    this.rounds.push({
      ...partial,
      round: this.rounds.length + 1,
    });
  }

  finalize(opts: {
    myScore: number;
    opponentScore: number;
    winner: PlayerSide | null;
    currentStreakAfter?: number;
    source?: GameLog['source'];
  }): GameLog {
    return {
      gameId: this.meta.gameId,
      mode: this.meta.mode,
      startedAt: this.startedAt,
      endedAt: new Date().toISOString(),
      myScore: opts.myScore,
      opponentScore: opts.opponentScore,
      winner: opts.winner,
      rounds: [...this.rounds],
      attackSteals: this.attackSteals,
      isTournamentFinal: this.meta.isTournamentFinal,
      previousBestStreak: this.meta.previousBestStreak,
      currentStreakAfter: opts.currentStreakAfter,
      me: this.meta.me,
      opponent: this.meta.opponent,
      source: opts.source ?? 'demo_session',
    };
  }

  getLastAttacker() {
    return this.lastAttacker;
  }
}
