/** 경기 종료 한줄 분석 — 하이라이트·패턴·스코어에서 추출 */

import type { GameLog } from '@/types/gameLog';
import { analyzeHighlights, pickPrimaryHighlight } from '@/game/highlights';
import { analyzeHandPatterns } from '@/game/patternStats';
import { analyzeMatchRoadmap } from '@/game/roadmap';

export interface DebriefBullet {
  label: string;
  value: string;
  tone?: 'gold' | 'cyan' | 'muted' | 'rose';
}

export interface MatchDebrief {
  headline: string;
  tip: string;
  bullets: DebriefBullet[];
}

export function buildMatchDebrief(log: GameLog | null | undefined): MatchDebrief | null {
  if (!log?.rounds?.length) return null;

  const highlights = analyzeHighlights(log);
  const primary = pickPrimaryHighlight(log);
  const patterns = analyzeHandPatterns([log], { side: 'me' });
  const road = analyzeMatchRoadmap(log);

  let steals = 0;
  let myPoints = 0;
  let oppPoints = 0;
  let attackPoints = 0;
  for (const r of log.rounds) {
    if (r.result === 'ATTACK_CHANGE' && r.attackerAfter === 'ME' && r.attackerBefore === 'OPPONENT') {
      steals += 1;
    }
    if (r.result === 'POINT_ME') {
      myPoints += 1;
      if (r.attackerBefore === 'ME') attackPoints += 1;
    }
    if (r.result === 'POINT_OPPONENT') oppPoints += 1;
  }
  // fallback: use log fields when available
  if (typeof log.attackSteals === 'number' && log.attackSteals > steals) {
    steals = log.attackSteals;
  }

  const handDom = patterns.handRatioPct;
  const topHand =
    handDom.ROCK >= handDom.SCISSORS && handDom.ROCK >= handDom.PAPER
      ? { name: '묵', pct: handDom.ROCK }
      : handDom.SCISSORS >= handDom.PAPER
        ? { name: '찌', pct: handDom.SCISSORS }
        : { name: '빠', pct: handDom.PAPER };

  const bullets: DebriefBullet[] = [
    {
      label: '스코어',
      value: `${log.myScore} : ${log.opponentScore}`,
      tone: log.winner === 'ME' ? 'gold' : 'muted',
    },
  ];

  if (steals > 0) {
    bullets.push({ label: '공격권 탈환', value: `${steals}회`, tone: 'cyan' });
  }
  if (attackPoints > 0) {
    bullets.push({
      label: '공격으로 딴 승점',
      value: `${attackPoints}점`,
      tone: 'gold',
    });
  }
  if (topHand.pct >= 40) {
    bullets.push({
      label: '가장 많이 낸 손',
      value: `${topHand.name} ${topHand.pct}%`,
      tone: topHand.pct >= 55 ? 'rose' : 'muted',
    });
  }
  if (patterns.repeatRate >= 0.35) {
    bullets.push({
      label: '같은 손 반복',
      value: `${Math.round(patterns.repeatRate * 100)}%`,
      tone: 'rose',
    });
  }
  if (road.tendency) {
    const t = road.tendency;
    if (t.signatureHand) {
      const ko =
        t.signatureHand === 'ROCK' ? '묵' : t.signatureHand === 'SCISSORS' ? '찌' : '빠';
      bullets.push({
        label: '시그니처 손',
        value: `${ko} 승률 ${t.signatureWinRate}%`,
        tone: 'cyan',
      });
    } else if (t.attackRounds > 0) {
      bullets.push({
        label: '공격 전환율',
        value: `${t.attackConvertPct}%`,
        tone: 'cyan',
      });
    }
  }

  const headline =
    primary?.title ??
    (log.winner === 'ME'
      ? '깔끔한 한 판'
      : log.winner === 'OPPONENT'
        ? '다음이 기대되는 한 판'
        : '팽팽한 승부');

  let tip = patterns.tip || '다음 판에서는 손 비율을 조금 더 섞어보세요.';
  if (primary?.description) {
    tip = primary.description;
  } else if (topHand.pct >= 55) {
    tip = `${topHand.name} 비중이 높아요. 다음 판에서는 다른 손으로 리듬을 바꿔보세요.`;
  } else if (steals >= 2 && log.winner !== 'ME') {
    tip = '공격권은 잘 가져왔어요. 다음은 공격 성공률을 올려보세요.';
  } else if (highlights.some((h) => h.type === 'COMEBACK')) {
    tip = '역전 감각이 좋아요. 뒤질 때도 한 템포 더 버티면 됩니다.';
  }

  return { headline, tip, bullets: bullets.slice(0, 5) };
}
