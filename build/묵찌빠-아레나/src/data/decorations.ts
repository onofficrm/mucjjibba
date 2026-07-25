export const CHARACTERS = [
  { id: 'classic_dealer', name: '클래식 카지노 딜러', emoji: '🤵', description: '기본에 충실한 젠틀한 카지노 딜러입니다.', owned: true },
  { id: 'cyber_warrior', name: '사이버 전사', emoji: '🤖', description: '네온 시티에서 온 사이버 전사입니다.', owned: true },
  { id: 'gold_king', name: '골드 킹', emoji: '👑', description: '화려한 황금 장식을 두른 아레나의 지배자.', owned: false },
  { id: 'neon_robot', name: '네온 로봇', emoji: '👾', description: '번쩍이는 네온 불빛으로 무장한 안드로이드.', owned: true },
  { id: 'dokkaebi_warrior', name: '도깨비 전사', emoji: '👹', description: '전통 도깨비 탈을 쓴 신비로운 전사.', owned: false },
  { id: 'comic_noob', name: '코믹 초보자', emoji: '🤡', description: '우당탕탕 재미있는 코믹 캐릭터.', owned: true },
];

export const HAND_SKINS = [
  { id: 'classic', name: '클래식 손', emojis: { ROCK: '✊', SCISSORS: '✌️', PAPER: '🖐️' }, description: '가장 기본적인 가위바위보 스킨.', owned: true },
  { id: 'gold', name: '황금 손', emojis: { ROCK: '🪙', SCISSORS: '✂️', PAPER: '📜' }, description: '모든 것을 황금으로 바꾸는 미다스의 손.', owned: false },
  { id: 'fire', name: '불꽃 손', emojis: { ROCK: '🔥', SCISSORS: '☄️', PAPER: '💥' }, description: '뜨겁게 타오르는 열정의 불꽃.', owned: true },
  { id: 'neon', name: '네온 손', emojis: { ROCK: '🟣', SCISSORS: '⚡', PAPER: '🟦' }, description: '사이버펑크 스타일의 네온 이펙트.', owned: true },
  { id: 'robot', name: '로봇 손', emojis: { ROCK: '🦾', SCISSORS: '🔧', PAPER: '⚙️' }, description: '강철로 만들어진 기계 팔.', owned: false },
  { id: 'dokkaebi', name: '도깨비 손', emojis: { ROCK: '🌑', SCISSORS: '⚔️', PAPER: '💨' }, description: '도깨비불이 감도는 신비로운 손.', owned: true },
  { id: 'ice', name: '얼음 손', emojis: { ROCK: '🧊', SCISSORS: '❄️', PAPER: '🌨️' }, description: '상대를 얼려버리는 차가운 손.', owned: false },
  { id: 'comic', name: '코믹 장갑', emojis: { ROCK: '🥊', SCISSORS: '✂️', PAPER: '🧤' }, description: '만화에서 튀어나온 듯한 코믹한 장갑.', owned: true },
];

export const getHandSkinEmojis = (id: string) => {
  const skin = HAND_SKINS.find((s) => s.id === id);
  return skin ? skin.emojis : HAND_SKINS[0].emojis;
};

export const getCharacterEmoji = (id: string) => {
  const char = CHARACTERS.find((c) => c.id === id);
  return char ? char.emoji : CHARACTERS[0].emoji;
};
