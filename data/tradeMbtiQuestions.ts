export interface MbtiQuestion {
  id: number;
  dimension: 'control' | 'risk' | 'cost' | 'logistics' | 'relationship';
  question: string;
  emoji: string;
  options: {
    text: string;
    score: number;
    label: string;
  }[];
}

export interface MbtiProfile {
  code: string;
  name: string;
  fullName: string;
  emoji: string;
  nickname: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  bestMatch: string;
  worstMatch: string;
  color: string;
}

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  {
    id: 1,
    dimension: 'control',
    emoji: '🗺️',
    question: '해외여행을 계획할 때, 당신의 스타일은?',
    options: [
      { label: 'A', text: '항공편, 숙소, 맛집, 교통까지 분 단위로 짠다', score: 3 },
      { label: 'B', text: '핵심 일정만 잡고 나머지는 현지에서 결정한다', score: 1 },
      { label: 'C', text: '친구나 동행이 짜준 일정에 따라간다', score: -1 },
      { label: 'D', text: '패키지 여행! 가이드님께 올인한다', score: -3 },
    ],
  },
  {
    id: 2,
    dimension: 'control',
    emoji: '👥',
    question: '팀 프로젝트에서 당신의 포지션은?',
    options: [
      { label: 'A', text: '전체 일정과 역할을 배분하는 총괄 PM', score: 3 },
      { label: 'B', text: '핵심 파트를 맡되 전체 방향에도 의견을 낸다', score: 1 },
      { label: 'C', text: '맡은 파트에만 집중하고 나머지는 믿고 맡긴다', score: -1 },
      { label: 'D', text: '시키는 대로 하는 게 가장 효율적이다', score: -3 },
    ],
  },
  {
    id: 3,
    dimension: 'risk',
    emoji: '💸',
    question: '여윳돈 100만원이 생겼다면?',
    options: [
      { label: 'A', text: '코인이나 레버리지 ETF에 풀베팅한다', score: 3 },
      { label: 'B', text: '주식이나 펀드에 분산 투자한다', score: 1 },
      { label: 'C', text: '적금이나 CMA에 넣어둔다', score: -1 },
      { label: 'D', text: '비상금 통장에 그대로 모아둔다', score: -3 },
    ],
  },
  {
    id: 4,
    dimension: 'risk',
    emoji: '🍜',
    question: '새로 오픈한 맛집이 있다면?',
    options: [
      { label: 'A', text: '오픈 당일에 달려간다. 줄 서는 것도 경험이다', score: 3 },
      { label: 'B', text: '일주일 정도 지켜보다가 간다', score: 1 },
      { label: 'C', text: '블로그 리뷰가 3개 이상 올라오면 검토한다', score: -1 },
      { label: 'D', text: '별점 4.5 이상, 리뷰 50개 이상일 때만 간다', score: -3 },
    ],
  },
  {
    id: 5,
    dimension: 'cost',
    emoji: '🛒',
    question: '같은 제품인데 가격이 다르다면?',
    options: [
      { label: 'A', text: '최저가 알리미 설정하고 10원이라도 싸게 산다', score: 3 },
      { label: 'B', text: '3~4곳 비교하고 가장 합리적인 곳에서 산다', score: 1 },
      { label: 'C', text: '믿을 수 있는 곳이면 조금 비싸도 괜찮다', score: -1 },
      { label: 'D', text: '시간이 돈이다. 눈에 보이면 바로 산다', score: -3 },
    ],
  },
  {
    id: 6,
    dimension: 'cost',
    emoji: '📦',
    question: '이사할 때 당신의 선택은?',
    options: [
      { label: 'A', text: '셀프 이사 + 중고나라에서 박스 조달', score: 3 },
      { label: 'B', text: '반포장이사로 적당히 아낀다', score: 1 },
      { label: 'C', text: '포장이사 서비스를 이용한다', score: -1 },
      { label: 'D', text: '프리미엄 이사로 정리정돈까지 맡긴다', score: -3 },
    ],
  },
  {
    id: 7,
    dimension: 'logistics',
    emoji: '🎁',
    question: '중요한 선물을 보내야 할 때?',
    options: [
      { label: 'A', text: '직접 포장 + 완충재 + 보험 배송 + 실시간 추적', score: 3 },
      { label: 'B', text: '직접 포장하고 안전한 택배사를 고른다', score: 1 },
      { label: 'C', text: '쇼핑몰 선물 포장 옵션을 선택한다', score: -1 },
      { label: 'D', text: '기프티콘이나 상품권을 보낸다. 배송 걱정 끝!', score: -3 },
    ],
  },
  {
    id: 8,
    dimension: 'logistics',
    emoji: '🧳',
    question: '해외여행 짐 싸기 스타일은?',
    options: [
      { label: 'A', text: '체크리스트 + 짐 무게 측정 + 압축팩 필수', score: 3 },
      { label: 'B', text: '필요한 것 리스트업하고 꼼꼼하게 챙긴다', score: 1 },
      { label: 'C', text: '옷 몇 벌이면 충분, 부족하면 현지에서 산다', score: -1 },
      { label: 'D', text: '여권이랑 카드만 있으면 된다. 나머지는 현지 해결', score: -3 },
    ],
  },
  {
    id: 9,
    dimension: 'relationship',
    emoji: '🤝',
    question: '비즈니스 거래에서 가장 중요한 것은?',
    options: [
      { label: 'A', text: '계약서 한 글자까지 검토하는 꼼꼼함', score: 3 },
      { label: 'B', text: '서면 합의 위에 신뢰를 쌓아가는 것', score: 1 },
      { label: 'C', text: '오래된 관계에서 오는 암묵적 신뢰', score: -1 },
      { label: 'D', text: '좋은 사람과의 관계가 곧 최고의 계약서', score: -3 },
    ],
  },
  {
    id: 10,
    dimension: 'relationship',
    emoji: '💬',
    question: '공동 작업 시 선호하는 소통 방식은?',
    options: [
      { label: 'A', text: '모든 내용을 문서화하고 히스토리를 남긴다', score: 3 },
      { label: 'B', text: '중요한 건 문서, 나머지는 메신저로 빠르게', score: 1 },
      { label: 'C', text: '전화 한 통이면 메일 열 통보다 낫다', score: -1 },
      { label: 'D', text: '만나서 밥 먹으면서 이야기하는 게 최고', score: -3 },
    ],
  },
];

export const INCOTERMS_ORDER = [
  'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CPT', 'CIF', 'CIP', 'DAP', 'DPU', 'DDP',
] as const;

export const MBTI_PROFILES: Record<string, MbtiProfile> = {
  EXW: {
    code: 'EXW',
    name: 'Ex Works',
    fullName: '공장인도',
    emoji: '🏭',
    nickname: '자유로운 공장장',
    personality:
      '최소한의 책임으로 최대한의 자유를 추구하는 타입입니다. 내 할 일만 깔끔하게 끝내고 나머지는 상대방에게 맡기는 편이죠. 효율적이지만 때로는 너무 냉정하다는 소리를 들을 수도 있어요.',
    strengths: ['비용 최소화의 달인', '깔끔한 업무 분리', '빠른 의사결정'],
    weaknesses: ['상대방 부담이 큼', '운송 과정 통제 불가'],
    bestMatch: 'DDP',
    worstMatch: 'EXW',
    color: '#6366f1',
  },
  FCA: {
    code: 'FCA',
    name: 'Free Carrier',
    fullName: '운송인인도',
    emoji: '🚛',
    nickname: '믿음직한 중간관리자',
    personality:
      '적당한 선에서 책임을 지되, 합리적으로 역할을 나누는 균형잡힌 타입입니다. 운송인에게 물건을 넘기는 순간까지만 철저하게 관리하고, 이후는 파트너를 신뢰합니다.',
    strengths: ['균형 잡힌 책임 분배', '유연한 운송 수단 선택', '실용적 접근'],
    weaknesses: ['중간 지점의 모호함', '주도권이 분산됨'],
    bestMatch: 'CIP',
    worstMatch: 'FAS',
    color: '#8b5cf6',
  },
  FAS: {
    code: 'FAS',
    name: 'Free Alongside Ship',
    fullName: '선측인도',
    emoji: '⚓',
    nickname: '항구의 수호자',
    personality:
      '바다와 항구에 로맨스를 느끼는 해상 전문가 타입입니다. 부두까지 완벽하게 준비하지만, 배에 싣는 순간부터는 미련 없이 손을 뗍니다. 전통적이고 원칙을 중시해요.',
    strengths: ['해상 물류 전문성', '명확한 인도 시점', '전통적 안정감'],
    weaknesses: ['해상 전용 한계', '현대 물류 유연성 부족'],
    bestMatch: 'CFR',
    worstMatch: 'CIP',
    color: '#06b6d4',
  },
  FOB: {
    code: 'FOB',
    name: 'Free On Board',
    fullName: '본선인도',
    emoji: '🚢',
    nickname: '국민 무역인',
    personality:
      '가장 대중적이고 널리 사랑받는 타입입니다. 배에 물건을 싣는 순간까지 책임지는 깔끔한 기준점이 매력이죠. 실무에서 가장 많이 쓰이는 만큼, 안정적이고 신뢰할 수 있습니다.',
    strengths: ['높은 범용성', '명확한 책임 기준', '업계 표준'],
    weaknesses: ['해상/내수로 한정', '보험 미포함'],
    bestMatch: 'CIF',
    worstMatch: 'DDP',
    color: '#0ea5e9',
  },
  CFR: {
    code: 'CFR',
    name: 'Cost and Freight',
    fullName: '운임포함인도',
    emoji: '💰',
    nickname: '계산 빠른 해결사',
    personality:
      '운임까지 책임지는 적극적인 타입입니다. 비용은 내가 부담하지만, 위험은 선적 후 넘어갑니다. 실용적이면서도 전략적인 사고를 하는 편이에요.',
    strengths: ['운임 비용 통제', '적극적 비용 관리', '거래 단순화'],
    weaknesses: ['위험과 비용의 분리점이 다름', '보험 미포함'],
    bestMatch: 'FAS',
    worstMatch: 'CPT',
    color: '#14b8a6',
  },
  CPT: {
    code: 'CPT',
    name: 'Carriage Paid To',
    fullName: '운송비지급인도',
    emoji: '✈️',
    nickname: '글로벌 네트워커',
    personality:
      '해상이든 항공이든 수단을 가리지 않는 만능 타입입니다. 목적지까지의 운송비를 부담하며, 다양한 운송 수단을 활용하는 유연함이 강점이에요.',
    strengths: ['모든 운송 수단 활용', '목적지까지 운송비 관리', '높은 유연성'],
    weaknesses: ['위험 이전 시점이 복잡', '보험은 별도'],
    bestMatch: 'DAP',
    worstMatch: 'CFR',
    color: '#10b981',
  },
  CIF: {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    fullName: '운임보험료포함인도',
    emoji: '🛡️',
    nickname: '안전제일주의자',
    personality:
      '보험까지 챙기는 꼼꼼한 타입입니다. 비용이 좀 더 들더라도 안전하게 거래하는 것을 선호하죠. 파트너에게도 안심을 주는 신뢰의 아이콘입니다.',
    strengths: ['보험 포함 안전 거래', '바이어 리스크 감소', '신뢰도 높음'],
    weaknesses: ['비용 증가', '해상/내수로 한정'],
    bestMatch: 'FOB',
    worstMatch: 'EXW',
    color: '#22c55e',
  },
  CIP: {
    code: 'CIP',
    name: 'Carriage and Insurance Paid To',
    fullName: '운송비보험료지급인도',
    emoji: '🔒',
    nickname: '철벽 수호자',
    personality:
      '운송비와 보험료를 모두 부담하는 책임감 넘치는 타입입니다. 모든 운송 수단에 대응 가능하면서 보험까지 완벽하게 커버하는 올라운더예요.',
    strengths: ['모든 운송 수단 + 보험 커버', '최고 수준 보험(ICC-A)', '파트너 안심'],
    weaknesses: ['높은 비용 부담', '위험 이전 시점 복잡'],
    bestMatch: 'FCA',
    worstMatch: 'FAS',
    color: '#84cc16',
  },
  DAP: {
    code: 'DAP',
    name: 'Delivered at Place',
    fullName: '도착장소인도',
    emoji: '📦',
    nickname: '끝까지 책임지는 배달왕',
    personality:
      '목적지 도착까지 거의 모든 것을 책임지는 헌신적인 타입입니다. 양하만 빼고 전 과정을 관리하죠. 상대방을 편하게 해주는 서비스 정신이 뛰어납니다.',
    strengths: ['도착지까지 일괄 관리', '바이어 편의 극대화', '높은 서비스 정신'],
    weaknesses: ['높은 리스크 부담', '수입 통관은 바이어 몫'],
    bestMatch: 'CPT',
    worstMatch: 'FOB',
    color: '#eab308',
  },
  DPU: {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    fullName: '도착지양하인도',
    emoji: '🏗️',
    nickname: '완벽주의 현장감독',
    personality:
      '양하(하역)까지 책임지는 유일한 인코텀즈 타입입니다. 물건이 안전하게 내려지는 것까지 확인해야 직성이 풀리는 완벽주의자예요.',
    strengths: ['양하까지 책임', '완벽한 인도 확인', '분쟁 최소화'],
    weaknesses: ['양하 장비/비용 부담', '높은 리스크'],
    bestMatch: 'DDP',
    worstMatch: 'FCA',
    color: '#f97316',
  },
  DDP: {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    fullName: '관세지급인도',
    emoji: '👑',
    nickname: '올인원 무역 황제',
    personality:
      '관세, 통관, 배송까지 모든 것을 책임지는 궁극의 서비스 타입입니다. 매수인은 물건만 받으면 되죠. 최고의 파트너이지만, 그만큼 비용과 리스크도 전부 안고 갑니다.',
    strengths: ['바이어 완전 편의', '원스톱 서비스', '최고의 고객 경험'],
    weaknesses: ['최대 비용/리스크 부담', '수입국 규제 파악 필요'],
    bestMatch: 'EXW',
    worstMatch: 'DDP',
    color: '#ef4444',
  },
};

export function calculateResult(answers: number[]): string {
  const scores: Record<string, number> = {
    control: 0,
    risk: 0,
    cost: 0,
    logistics: 0,
    relationship: 0,
  };

  answers.forEach((ansIdx, qIdx) => {
    const q = MBTI_QUESTIONS[qIdx];
    if (q) {
      scores[q.dimension] += q.options[ansIdx].score;
    }
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  // 총점 범위(-30 ~ +30)를 11구간으로 매핑
  const normalizedIndex = Math.round(((total + 30) / 60) * 10);
  const clampedIndex = Math.max(0, Math.min(10, normalizedIndex));

  return INCOTERMS_ORDER[clampedIndex];
}
