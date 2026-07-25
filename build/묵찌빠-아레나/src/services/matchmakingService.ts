import type { MatchOpponent, MatchTable } from '@/types/match';
import { DEMO_OPPONENTS, canEnterTable } from '@/types/match';
import {
  clearMatchSession,
  createMatchSession,
  loadMatchSession,
  saveMatchSession,
  updateMatchSession,
} from '@/services/match/matchSession';
import { depositMatchPoints, getDemoPoints, loadDemoWallet, creditDemoPoints } from '@/utils/demoWallet';
import { DEMO_USER } from '@/data/demoData';

export type MatchmakingListener = (payload: {
  status: string;
  stepIndex: number;
  opponent: MatchOpponent | null;
  error?: string;
}) => void;

type InternalJob = {
  timers: number[];
  cancelled: boolean;
  listener: MatchmakingListener | null;
};

let activeJob: InternalJob | null = null;

const MATCHING_STEPS = [
  '매칭 요청 전송',
  '상대 검색',
  '상대 후보 발견',
  '상대 연결 확인',
  '양쪽 참가 포인트 예치 확인',
  '게임 준비 완료',
];

function pickOpponent(table: MatchTable): MatchOpponent {
  const pool = DEMO_OPPONENTS.filter((o) => {
    if (table.id === 'practice') return true;
    if (table.minGrade === '플래티넘' || table.minGrade === '다이아') {
      return ['골드', '플래티넘', '다이아'].includes(o.grade);
    }
    return true;
  });
  return pool[Math.floor(Math.random() * pool.length)] ?? DEMO_OPPONENTS[0];
}

function clearTimers(job: InternalJob) {
  job.timers.forEach((t) => window.clearTimeout(t));
  job.timers = [];
}

function isJobAlive(job: InternalJob | null): boolean {
  return !!(job && !job.cancelled);
}

/** 완료·이탈 후 남은 잡이 다음 매칭을 막는 경우 정리 */
function clearStaleJob() {
  if (!activeJob) return;
  if (activeJob.cancelled) {
    activeJob = null;
    return;
  }
  const session = loadMatchSession();
  // 세션 없음 / 이미 준비·실패·취소 → 더 이상 매칭 중이 아님
  if (
    !session ||
    session.status === 'ready' ||
    session.status === 'failed' ||
    session.status === 'cancelled' ||
    session.settled
  ) {
    clearTimers(activeJob);
    activeJob.cancelled = true;
    activeJob = null;
  }
}

export const matchmakingService = {
  getSteps() {
    return MATCHING_STEPS;
  },

  getActiveSession() {
    return loadMatchSession();
  },

  /** 실제로 검색 타이머가 돌고 있는지 */
  isSearching() {
    clearStaleJob();
    return isJobAlive(activeJob);
  },

  async joinQueue(table: MatchTable): Promise<{ ok: boolean; gameId?: string; error?: string }> {
    clearStaleJob();

    // 진짜로 검색 중일 때만 거부. 완료된 잡이 남아 있으면 위에서 이미 정리됨.
    if (isJobAlive(activeJob)) {
      return { ok: false, error: '이미 매칭 중입니다.' };
    }

    const wallet = loadDemoWallet();
    const check = canEnterTable(wallet.points, DEMO_USER.grade, table);
    if (!check.ok) {
      return { ok: false, error: check.reason ?? '입장할 수 없습니다.' };
    }

    const prev = loadMatchSession();
    if (prev && !prev.settled && prev.deposited && !prev.table.isFree) {
      creditDemoPoints(prev.table.entryPoint);
    }
    clearMatchSession();

    const session = createMatchSession(table, wallet.points);
    return { ok: true, gameId: session.gameId };
  },

  startSearch(listener: MatchmakingListener) {
    const session = loadMatchSession();
    if (!session) {
      listener({ status: 'failed', stepIndex: 0, opponent: null, error: '매칭 세션이 없습니다.' });
      return;
    }

    if (activeJob) {
      activeJob.cancelled = true;
      clearTimers(activeJob);
      activeJob = null;
    }

    const job: InternalJob = { timers: [], cancelled: false, listener };
    activeJob = job;

    updateMatchSession({ status: 'searching', stepIndex: 0, opponent: null });
    listener({ status: 'searching', stepIndex: 0, opponent: null });

    const finishJob = () => {
      if (activeJob === job) {
        clearTimers(job);
        job.cancelled = true;
        activeJob = null;
      }
    };

    const schedule = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (job.cancelled) return;
        fn();
      }, ms);
      job.timers.push(id);
    };

    schedule(900, () => {
      updateMatchSession({ stepIndex: 1 });
      listener({ status: 'searching', stepIndex: 1, opponent: null });
    });
    schedule(2200, () => {
      updateMatchSession({ stepIndex: 2 });
      listener({ status: 'searching', stepIndex: 2, opponent: null });
    });
    schedule(3400, () => {
      updateMatchSession({ stepIndex: 3 });
      listener({ status: 'searching', stepIndex: 3, opponent: null });
    });
    schedule(4500, () => {
      updateMatchSession({ stepIndex: 4, status: 'depositing' });
      listener({ status: 'depositing', stepIndex: 4, opponent: null });
    });
    schedule(5600, () => {
      const current = loadMatchSession();
      if (!current || job.cancelled) return;

      if (!current.table.isFree && !current.deposited) {
        const deposited = depositMatchPoints(current.table.entryPoint);
        if (!deposited) {
          updateMatchSession({ status: 'failed' });
          listener({
            status: 'failed',
            stepIndex: 4,
            opponent: null,
            error: '예치 중 포인트가 부족해졌습니다.',
          });
          finishJob();
          return;
        }
        updateMatchSession({ deposited: true });
      }

      const opponent = pickOpponent(current.table);
      updateMatchSession({
        opponent,
        status: 'found',
        stepIndex: 5,
      });
      listener({ status: 'found', stepIndex: 5, opponent });
    });
    schedule(6200, () => {
      updateMatchSession({ status: 'ready', stepIndex: 5 });
      listener({ status: 'ready', stepIndex: 5, opponent: loadMatchSession()?.opponent ?? null });
      // 매칭 성공 후 잡을 반드시 해제 — 다음 무료/유료 입장 차단 방지
      finishJob();
    });
  },

  async leaveQueue(): Promise<void> {
    if (activeJob) {
      activeJob.cancelled = true;
      clearTimers(activeJob);
      activeJob = null;
    }

    const session = loadMatchSession();
    if (!session) return;

    if (session.deposited && !session.settled && !session.table.isFree) {
      creditDemoPoints(session.table.entryPoint);
    }

    updateMatchSession({ status: 'cancelled' });
    clearMatchSession();
  },

  getGamePath(): string | null {
    const s = loadMatchSession();
    if (!s) return null;
    if (s.table.isFree) return `/game/beginner-ai`;
    return `/game/${s.gameId}`;
  },

  snapshotPoints() {
    return getDemoPoints();
  },

  forceClear() {
    if (activeJob) {
      activeJob.cancelled = true;
      clearTimers(activeJob);
      activeJob = null;
    }
    clearMatchSession();
  },
};
