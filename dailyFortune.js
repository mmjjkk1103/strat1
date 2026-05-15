import { dailyFortuneTemplates } from './reading-data.js';

export function createDailyFortune(winner, saju, profile, animalProfiles, baseDate = new Date()) {
    const todayStemElement = getDayElement(baseDate);
    const seed = getDateSeed(baseDate) + saju.daySeed + winner.id.length;
    const guardian = animalProfiles[Math.abs(seed) % animalProfiles.length];
    const keyword = saju.element.keywords[Math.abs(seed) % saju.element.keywords.length];
    const harmony = todayStemElement === saju.dayMaster.elementKey ? '오늘의 흐름과 타고난 결이 잘 맞아 작은 추진력이 살아납니다.' : '오늘은 타고난 결과 다른 자극이 들어와 균형을 조절하기 좋은 날입니다.';
    return {
        title: `${guardian.name}이 지키는 ${keyword}의 날`,
        flow: `${harmony} ${pick(dailyFortuneTemplates.flow, seed)}`,
        relation: pick(dailyFortuneTemplates.relation, seed + 1),
        focus: pick(dailyFortuneTemplates.focus, seed + 2),
        emotion: pick(dailyFortuneTemplates.emotion, seed + 3),
        money: pick(dailyFortuneTemplates.money, seed + 4),
        caution: `${winner.name}의 ${winner.keywords[0]}이 장점이 되는 날이지만, ${saju.element.challenge}`,
        action: `${profile.name}님에게 오늘 필요한 행동은 ${saju.element.keywords[0]}을 작게 실천하는 것입니다.`,
        keyword,
        color: pick(['연한 금빛', '짙은 남색', '안개 보라', '크림 화이트', '차분한 녹색'], seed),
        guardian,
        meditation: '좋은 인상은 더하려 할 때보다, 불필요한 긴장을 덜어낼 때 드러납니다.',
    };
}

function getDayElement(date) {
    return ['wood', 'fire', 'earth', 'metal', 'water'][Math.abs(getDateSeed(date)) % 5];
}

function pick(items, seed) {
    return items[Math.abs(seed) % items.length];
}

function getDateSeed(date) {
    return date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
}
