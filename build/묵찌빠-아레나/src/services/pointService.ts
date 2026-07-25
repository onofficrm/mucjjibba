// 포인트 처리 원칙 준수
export const pointService = {
  // 프론트엔드에서 포인트 잔액을 직접 변경하지 않음
  // 모든 포인트 이동에 고유 거래 ID 사용
  depositForGame: async () => {}, // 게임 시작 전에 양쪽 참가 포인트 예치
  refundForInvalidGame: async () => {} // 게임 무효 시 양쪽 참가 포인트 반환
};
