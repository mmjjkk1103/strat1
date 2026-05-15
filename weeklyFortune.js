import { weeklySentences } from './reading-data.js';

export function createWeeklyFortune(winner, saju, profile, animalProfiles, baseDate = new Date()) {
    const seed = getDateSeed(getWeekStart(baseDate)) + saju.daySeed;
    const guardian = animalProfiles[Math.abs(seed + 3) % animalProfiles.length];
    return {
        keyword: `${saju.element.keywords[Math.abs(seed + 1) % saju.element.keywords.length]}과 ${winner.keywords[1]}`,
        relation: `관계에서는 ${saju.element.relationship} 이번 주에는 먼저 설득하기보다 서로의 기준을 확인해보세요.`,
        work: `${saju.element.work} ${winner.name} 특유의 ${winner.keywords[0]}을 결과물의 첫인상으로 쓰면 좋습니다.`,
        emotion: `${saju.element.rest} 감정의 흐름은 완만하지만 오래 가므로 사소한 피로를 무시하지 않는 것이 균형입니다.`,
        choice: '중요한 선택 앞에서는 빠른 확신보다 반복해서 남는 신호를 믿어보세요.',
        avoid: `${saju.element.challenge} 모두에게 좋은 인상을 남기려는 과한 조율도 피하는 편이 좋습니다.`,
        guardian,
        sentence: pick(weeklySentences, seed),
        name: profile.name,
    };
}

function pick(items, seed) {
    return items[Math.abs(seed) % items.length];
}

function getDateSeed(date) {
    return date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
}

function getWeekStart(date) {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(12, 0, 0, 0);
    return start;
}
