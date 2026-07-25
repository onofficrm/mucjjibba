import type { Mission, MissionCategory, MissionIconKey, MissionRewardType } from '@/types/mission';
import { getMissionDayId, getMissionExpiresAt } from './day';

export interface MissionDefinition {
  id: string;
  title: string;
  description: string;
  icon: MissionIconKey;
  category: MissionCategory;
  target: number;
  rewardType: MissionRewardType;
  rewardValue: string;
  /** 연결된 이벤트 (집계형 제외) */
  event?: string;
}

/** 초보자 체험용 데일리 미션 정의 — 포인트 베팅 유도 목적 아님 */
export const DAILY_MISSION_DEFINITIONS: MissionDefinition[] = [
  {
    id: 'practice_once',
    title: '무료 연습 1회 완료',
    description: '초보자 AI와 연습 대결을 한 판 끝까지 플레이하세요.',
    icon: 'target',
    category: 'practice',
    target: 1,
    rewardType: 'exp',
    rewardValue: 'exp_50',
    event: 'PRACTICE_COMPLETED',
  },
  {
    id: 'ai_demo_watch',
    title: 'AI 데모 경기 1회 관전',
    description: '로비의 AI DEMO 경기를 선택해 한 번 관전해 보세요.',
    icon: 'eye',
    category: 'spectate',
    target: 1,
    rewardType: 'hand_skin',
    rewardValue: 'trial_robot_1d',
    event: 'AI_DEMO_WATCHED',
  },
  {
    id: 'spectate_3min',
    title: '경기 3분 관전',
    description: '아무 경기나 합쳐 3분 이상 관전하면 완료됩니다.',
    icon: 'clock',
    category: 'spectate',
    target: 180,
    rewardType: 'emoticon',
    rewardValue: 'emote_pack_free',
    event: 'SPECTATE_DURATION_UPDATED',
  },
  {
    id: 'hands_each_once',
    title: '묵·찌·빠 각각 1회 사용',
    description: '연습 또는 대전에서 묵, 찌, 빠를 각각 한 번씩 선택하세요.',
    icon: 'hands',
    category: 'gameplay',
    target: 3,
    rewardType: 'badge',
    rewardValue: 'badge_hand_master_10',
  },
  {
    id: 'tutorial_complete',
    title: '초보자 가이드 완료',
    description: '초보자 가이드 슬라이드를 끝까지 확인하세요.',
    icon: 'book',
    category: 'guide',
    target: 1,
    rewardType: 'character',
    rewardValue: 'trial_comic_noob_1d',
    event: 'TUTORIAL_COMPLETED',
  },
  {
    id: 'reaction_once',
    title: '리액션 1회 보내기',
    description: '경기 중 리액션 버튼으로 감정을 한 번 보내보세요.',
    icon: 'message',
    category: 'gameplay',
    target: 1,
    rewardType: 'emoticon',
    rewardValue: 'emote_pack_cheer',
    event: 'REACTION_SENT',
  },
  {
    id: 'history_view',
    title: '경기 기록 1회 확인',
    description: '내 경기 기록 화면을 열어 지난 대전을 확인하세요.',
    icon: 'file',
    category: 'guide',
    target: 1,
    rewardType: 'badge',
    rewardValue: 'badge_beginner_10',
    event: 'MATCH_HISTORY_VIEWED',
  },
  {
    id: 'friend_room',
    title: '친구 대전방 1회 만들기',
    description: '친구 대전에서 새 방을 하나 만들어 보세요.',
    icon: 'users',
    category: 'social',
    target: 1,
    rewardType: 'intro',
    rewardValue: 'trial_intro_1d',
    event: 'FRIEND_ROOM_CREATED',
  },
  {
    id: 'tournament_watch',
    title: '토너먼트 경기 1회 관전',
    description: '토너먼트 타입 경기를 선택해 관전해 보세요.',
    icon: 'trophy',
    category: 'spectate',
    target: 1,
    rewardType: 'table',
    rewardValue: 'trial_table_neon_1d',
    event: 'TOURNAMENT_WATCHED',
  },
  {
    id: 'settings_view',
    title: '게임 설정 1회 확인',
    description: '게임 설정 화면에서 옵션을 한 번 확인하세요.',
    icon: 'settings',
    category: 'settings',
    target: 1,
    rewardType: 'exp',
    rewardValue: 'exp_30',
    event: 'SETTINGS_VIEWED',
  },
  {
    id: 'match_win_once',
    title: '대전 1승 달성',
    description: '연습·퀵매치 등에서 한 판 승리하세요.',
    icon: 'flame',
    category: 'gameplay',
    target: 1,
    rewardType: 'exp',
    rewardValue: 'exp_50',
    event: 'MATCH_WON',
  },
  {
    id: 'share_highlight',
    title: '하이라이트 카드 열기',
    description: '결과 화면에서 공유 카드를 한 번 열어보세요.',
    icon: 'share',
    category: 'social',
    target: 1,
    rewardType: 'emoticon',
    rewardValue: 'emote_pack_cheer',
    event: 'SHARE_CARD_OPENED',
  },
  {
    id: 'analysis_view',
    title: '패턴 분석 확인',
    description: '내 손 습관·플레이 패턴 분석 화면을 열어보세요.',
    icon: 'brain',
    category: 'guide',
    target: 1,
    rewardType: 'badge',
    rewardValue: 'badge_beginner_10',
    event: 'ANALYSIS_VIEWED',
  },
];

export function buildFreshMissions(now: Date = new Date()): Mission[] {
  const startedAt = now.toISOString();
  const expiresAt = getMissionExpiresAt(now);
  return DAILY_MISSION_DEFINITIONS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    category: def.category,
    target: def.target,
    progress: 0,
    completed: false,
    claimed: false,
    rewardType: def.rewardType,
    rewardValue: def.rewardValue,
    startedAt,
    expiresAt,
  }));
}

export function rewardLabel(rewardType: MissionRewardType, rewardValue: string): string {
  switch (rewardType) {
    case 'exp':
      return rewardValue === 'exp_30' ? '경험치 +30' : '경험치 +50';
    case 'badge':
      return rewardValue.includes('hand') ? '핸드 마스터 배지 +10%' : '초보자 배지 +10%';
    case 'emoticon':
      return rewardValue.includes('cheer') ? '응원 이모티콘 체험' : '무료 이모티콘 팩';
    case 'hand_skin':
      return '로봇 손 스킨 (1일)';
    case 'intro':
      return '입장 연출 체험 (1일)';
    case 'character':
      return '초보 캐릭터 체험 (1일)';
    case 'table':
      return '네온 테이블 테마 (1일)';
    default:
      return '비현금성 보상';
  }
}

export { getMissionDayId };
