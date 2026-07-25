export const DEMO_USER = {
  nickname: '도전자_8921',
  grade: '골드',
  points: 15000,
  streak: 3,
  avatar: '🐯',
  today: {
    played: 12,
    wins: 8,
    losses: 4,
    winRate: 66.7,
    maxStreak: 4,
    pointChange: '+2,500'
  }
};

export const DEMO_ACTIVITIES = [
  { id: 1, type: 'streak', text: 'BLUECAT님이 5연승을 달성했습니다.', time: '방금 전', icon: '🔥' },
  { id: 2, type: 'tournament', text: 'RICHARD님이 토너먼트 결승에 진출했습니다.', time: '1분 전', icon: '🏆' },
  { id: 3, type: 'system', text: '8인 토너먼트가 3분 후 시작됩니다.', time: '3분 전', icon: '⏰' },
  { id: 4, type: 'match', text: '골드 테이블에서 새로운 대전이 시작되었습니다.', time: '5분 전', icon: '⚔️' },
  { id: 5, type: 'streak', text: 'GHOST님이 10연승에 성공했습니다!', time: '10분 전', icon: '👑' },
];

export const DEMO_NOTICES = [
  { id: 1, type: '공지', title: '정기 서버 점검 안내 (7/25 02:00~06:00)', date: '2026.07.24', tagColor: 'bg-arena-error/20 text-arena-error' },
  { id: 2, type: '이벤트', title: '주말 핫타임! 승리 포인트 1.5배 이벤트', date: '2026.07.23', tagColor: 'bg-arena-gold/20 text-arena-gold' },
  { id: 3, type: '안내', title: '게임 이용 정책 변경 사전 안내', date: '2026.07.20', tagColor: 'bg-white/10 text-arena-text-muted' },
];
