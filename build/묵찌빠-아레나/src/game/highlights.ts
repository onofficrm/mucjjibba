import type { GameLog, Highlight } from '@/types/gameLog';

/**
 * 실제 GameLog가 있을 때만 하이라이트 생성.
 * 프론트엔드가 임의로 승패를 만들지 않고, 로그 필드만 분석한다.
 */
export function analyzeHighlights(log: GameLog | null | undefined): Highlight[] {
  if (!log || !log.rounds || log.rounds.length === 0) {
    return [];
  }

  const out: Highlight[] = [];
  const durationMs =
    new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime();
  const selectDurations = log.rounds.map((r) => r.selectDurationMs).filter((n) => n > 0);
  const avgSelect =
    selectDurations.length > 0
      ? selectDurations.reduce((a, b) => a + b, 0) / selectDurations.length
      : Infinity;

  if (log.rounds.some((r) => r.timeLeftOnSelect <= 1 && r.timerLimit > 0)) {
    out.push({
      type: 'LAST_SECOND_SELECT',
      title: '마지막 1초 선택',
      description: '타이머가 1초 이하일 때 손을 확정했습니다.',
      priority: 80,
    });
  }

  if (log.winner === 'ME' && log.myScore === 2 && log.opponentScore === 0) {
    out.push({
      type: 'SWEEP_2_0',
      title: '2대0 완승',
      description: '한 점도 내주지 않고 승리했습니다.',
      priority: 90,
    });
  }

  if (log.winner === 'ME') {
    // 역전: 상대가 한 점이라도 앞서간 뒤 승리
    let my = 0;
    let opp = 0;
    let wasBehind = false;
    for (const r of log.rounds) {
      if (r.result === 'POINT_ME') my += 1;
      if (r.result === 'POINT_OPPONENT') opp += 1;
      if (opp > my) wasBehind = true;
    }
    if (wasBehind) {
      out.push({
        type: 'COMEBACK',
        title: '역전승',
        description: '뒤지던 점수에서 뒤집었습니다.',
        priority: 95,
      });
    }
  }

  if (log.attackSteals >= 3) {
    out.push({
      type: 'ATTACK_STEAL_3',
      title: '공격권 3회 이상 탈환',
      description: `공격권을 ${log.attackSteals}회 빼앗아 왔습니다.`,
      priority: 70,
    });
  }

  if (
    log.winner === 'ME' &&
    typeof log.previousBestStreak === 'number' &&
    typeof log.currentStreakAfter === 'number' &&
    log.currentStreakAfter > log.previousBestStreak
  ) {
    out.push({
      type: 'STREAK_RECORD',
      title: '최고 연승 갱신',
      description: `${log.currentStreakAfter}연승으로 기록을 갱신했습니다.`,
      priority: 85,
    });
  }

  if (log.winner === 'ME' && log.isTournamentFinal) {
    out.push({
      type: 'TOURNAMENT_FINAL_WIN',
      title: '토너먼트 결승 승리',
      description: '결승전에서 우승했습니다.',
      priority: 100,
    });
  }

  if (avgSelect < 1200 && selectDurations.length >= 2) {
    out.push({
      type: 'FAST_AVG_SELECT',
      title: '빠른 평균 선택',
      description: `평균 ${(avgSelect / 1000).toFixed(1)}초 만에 선택했습니다.`,
      priority: 55,
    });
  }

  if (durationMs >= 3 * 60 * 1000) {
    out.push({
      type: 'LONG_MATCH',
      title: '긴 경기',
      description: '3분 이상 이어진 접전이었습니다.',
      priority: 40,
    });
  }

  if (durationMs > 0 && durationMs <= 45 * 1000 && log.rounds.some((r) => r.result.startsWith('POINT'))) {
    out.push({
      type: 'QUICK_MATCH',
      title: '빠른 경기',
      description: '45초 안에 승부가 갈렸습니다.',
      priority: 45,
    });
  }

  return out.sort((a, b) => b.priority - a.priority);
}

export function pickPrimaryHighlight(log: GameLog | null | undefined): Highlight | null {
  const list = analyzeHighlights(log);
  return list[0] ?? null;
}
