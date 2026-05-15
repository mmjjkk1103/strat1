import { weeklySentences } from './reading-data.js';

export function createWeeklyFortune(winner, saju, profile, animalProfiles, baseDate = new Date()) {
    const seed = getDateSeed(getWeekStart(baseDate)) + saju.daySeed;
    const guardian = animalProfiles[Math.abs(seed + 3) % animalProfiles.length];
    return {
        keyword: `${saju.element.keywords[Math.abs(seed + 1) % saju.element.keywords.length]}과 ${winner.keywords[1]}`,
        relation: `관계에서는 ${saju.element.relationship} 이번 주에는 먼저 설득하기보다 서로의 문턱이 어디에 있는지 살피는 편이 좋습니다.`,
        work: `${saju.element.work} ${winner.name} 특유의 ${winner.keywords[0]}을 결과물의 첫 기운으로 쓰면 길이 납니다.`,
        emotion: `${saju.element.rest} 감정은 완만하지만 오래 머무르니 사소한 피로를 가볍게 넘기지 않는 것이 좋습니다.`,
        choice: '중요한 선택 앞에서는 빠른 확신보다 여러 번 남는 징조를 살피세요.',
        avoid: `${saju.element.challenge} 모두에게 좋은 상으로 보이려는 과한 조율도 피하는 편이 좋습니다.`,
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
