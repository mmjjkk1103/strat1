import { dailyFortuneTemplates } from './reading-data.js';

export function createDailyFortune(winner, saju, profile, animalProfiles, baseDate = new Date()) {
    const todayStemElement = getDayElement(baseDate);
    const seed = getDateSeed(baseDate) + saju.daySeed + winner.id.length;
    const guardian = animalProfiles[Math.abs(seed) % animalProfiles.length];
    const keyword = saju.element.keywords[Math.abs(seed) % saju.element.keywords.length];
    const harmony = todayStemElement === saju.dayMaster.elementKey ? '오늘은 타고난 기질과 하루의 흐름이 비교적 비슷하게 움직입니다.' : '오늘은 평소 기질과 다른 흐름이 들어와 균형을 맞추기 좋은 날입니다.';
    const actionTone = actionByElement(saju.dayMaster.elementKey);
    return {
        title: `${guardian.name}이 지키는 ${keyword}의 날`,
        flow: `${harmony} 급하게 새 일을 벌이기보다 이미 진행 중인 일을 정리하고 방향을 맞추는 쪽이 더 잘 맞습니다. ${pick(dailyFortuneTemplates.flow, seed)} 오늘은 작은 결정을 서두르지 않고 한 번 더 살펴보면 불필요한 실수를 줄일 수 있습니다.`,
        relation: `${pick(dailyFortuneTemplates.relation, seed + 1)} 말을 많이 하기보다 상대가 무엇을 불편해하는지 한 번 더 살펴보는 태도가 도움이 됩니다. 짧은 안부나 가벼운 칭찬이 생각보다 좋은 분위기를 만들 수 있습니다. ${winner.name}의 ${winner.keywords[0]}을 자연스럽게 쓰면 관계의 문이 부드럽게 열립니다.`,
        love: `연애운은 큰 고백이나 강한 밀어붙임보다 자연스러운 관심 표현에 더 가깝습니다. 상대가 편하게 반응할 수 있는 작은 메시지, 짧은 약속, 부담 없는 대화가 좋습니다. 이미 가까운 사이에서는 “알아서 알겠지”보다 오늘 느낀 마음을 한 문장으로 말해주는 것이 도움이 됩니다.`,
        focus: `${pick(dailyFortuneTemplates.focus, seed + 2)} 일과 공부에서는 먼저 해야 할 일을 세 가지 이하로 줄이는 편이 좋습니다. 많은 일을 동시에 붙잡으면 집중이 흩어질 수 있으니, 가장 결과가 남는 일부터 처리하세요. ${saju.element.keywords[0]}을 살리는 방식으로 움직이면 효율이 올라갑니다.`,
        emotion: `${pick(dailyFortuneTemplates.emotion, seed + 3)} 감정이 올라오는 순간 바로 결론 내리기보다, 몸의 피로와 마음의 피로를 나누어 보는 것이 좋습니다. 오늘은 예민함을 잘못된 신호로만 보지 말고, 내가 무엇을 쉬어야 하는지 알려주는 알림으로 받아들이면 편합니다.`,
        money: `${pick(dailyFortuneTemplates.money, seed + 4)} 오늘의 소비는 기분 전환에는 도움이 되지만, 오래 만족할 물건인지 한 번 더 확인하는 편이 좋습니다. 큰 금액보다 작은 자동 결제나 습관적인 지출을 살펴보면 의외의 이득이 있습니다.`,
        caution: `${winner.name}의 ${winner.keywords[0]}이 좋은 길을 열 수 있지만, ${saju.element.challenge} 특히 사람을 맞추느라 내 일정이 밀리거나, 반대로 내 기준만 앞세워 분위기가 굳지 않도록 주의하면 좋습니다.`,
        action: `${profile.name}님에게 오늘 필요한 행동은 ${actionTone} 작은 행동 하나만 실천해도 하루의 방향이 훨씬 정돈됩니다.`,
        keyword,
        color: pick(['연한 금빛', '짙은 남색', '안개 보라', '크림 화이트', '차분한 녹색'], seed),
        guardian,
        meditation: '오늘은 크게 증명하기보다, 나에게 필요한 속도를 다시 맞추는 날입니다.',
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

function actionByElement(key) {
    return {
        wood: '미뤄둔 일을 아주 작게 시작하고, 시작한 일에는 짧은 마감 시간을 정하는 것입니다.',
        fire: '바로 반응하기 전에 한 번 숨을 고르고, 좋은 마음은 따뜻한 말로 표현하는 것입니다.',
        earth: '흐트러진 공간이나 일정을 정리하고, 참아둔 불편을 작은 말로 꺼내는 것입니다.',
        metal: '해야 할 일의 기준을 정하되, 완벽하지 않아도 공유할 수 있는 중간 결과를 만드는 것입니다.',
        water: '생각을 글로 적고, 혼자 정리한 뒤 아주 작은 실행 하나를 밖으로 꺼내는 것입니다.',
    }[key] || '오늘 가장 신경 쓰이는 일을 작게 나누어 첫 단계만 처리하는 것입니다.';
}
