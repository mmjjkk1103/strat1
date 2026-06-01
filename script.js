import { researchDB } from './researchDB.js';

const elementProfiles = {
    wood: { label: '목(木)', traits: ['개방성', '성장', '가능성 탐색'], tone: '새로운 가능성을 먼저 보고 관계나 일을 조금씩 확장하려는 흐름' },
    fire: { label: '화(火)', traits: ['외향성', '표현 강도', '정서 반응'], tone: '마음이 움직일 때 표정과 행동에 온도가 생기는 흐름' },
    earth: { label: '토(土)', traits: ['성실성', '안정감', '지속성'], tone: '관계와 생활에서 오래 지키고 쌓으려는 흐름' },
    metal: { label: '금(金)', traits: ['자기통제', '기준', '판단'], tone: '상황을 한 발 물러서서 정리하고 기준을 세우려는 흐름' },
    water: { label: '수(水)', traits: ['정서적 민감성', '내면 몰입', '직관'], tone: '겉으로 바로 드러내기보다 안쪽에서 오래 감정을 정리하는 흐름' },
};

const concernProfiles = {
    love: { categories: ['관계심리학', '정서심리학'], noun: '연애', focus: '표현 방식과 확인 욕구' },
    relationship: { categories: ['관계심리학', '사회심리학'], noun: '관계', focus: '거리 조절과 첫인상 이후의 신뢰 형성' },
    money: { categories: ['성격심리학'], noun: '돈', focus: '충동 조절과 선택 기준' },
    career: { categories: ['성격심리학'], noun: '진로', focus: '지속 가능한 루틴과 목표 유지' },
    self: { categories: ['성격심리학', '상징심리학'], noun: '자기이해', focus: '반복되는 반응 패턴을 알아차리는 일' },
    today: { categories: ['상징해석', '상징심리학'], noun: '오늘의 기운', focus: '현재 감정과 선택지를 비춰보는 메시지' },
};

export function getResearchHints(category) {
    if (!category) return [...researchDB];
    return researchDB.filter((item) => item.category === category || item.concept.includes(category) || item.usableVariables.includes(category));
}

export function getReportStyleRules() {
    return [...new Set(researchDB.map((item) => item.reportStyleRule))];
}

export function getCautions() {
    return [...new Set(researchDB.map((item) => item.caution))];
}

export function generateResearchBasedSentence(element, animalType, concern) {
    const elementKey = typeof element === 'string' ? element : element?.elementKey || element?.key || 'water';
    const elementProfile = elementProfiles[elementKey] || elementProfiles.water;
    const animalName = typeof animalType === 'string' ? animalType : animalType?.name || '대표 동물상';
    const concernProfile = concernProfiles[concern] || concernProfiles.self;
    const hints = concernProfile.categories.flatMap((category) => getResearchHints(category));
    const styleRule = getReportStyleRules()[0];
    const conceptNames = [...new Set(hints.map((item) => item.concept))].slice(0, 2).join('과 ');

    return `${animalName}의 인상은 ${concernProfile.noun} 장면에서 ${elementProfile.tone}과 연결해 볼 수 있습니다. ${conceptNames || '성향심리학'} 관점으로 보면 핵심은 ${concernProfile.focus}에 가깝고, ${elementProfile.traits.slice(0, 2).join('·')} 변수가 함께 작동하는 경향이 있습니다. ${styleRule}`;
}

if (typeof window !== 'undefined') {
    window.researchDB = researchDB;
    window.getResearchHints = getResearchHints;
    window.getReportStyleRules = getReportStyleRules;
    window.getCautions = getCautions;
    window.generateResearchBasedSentence = generateResearchBasedSentence;
}
