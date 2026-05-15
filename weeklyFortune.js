import { weeklySentences } from './reading-data.js';

export function createWeeklyFortune(winner, saju, profile, animalProfiles, baseDate = new Date()) {
    const seed = getDateSeed(getWeekStart(baseDate)) + saju.daySeed;
    const guardian = animalProfiles[Math.abs(seed + 3) % animalProfiles.length];
    const elementAdvice = weeklyByElement(saju.dayMaster.elementKey);
    return {
        keyword: `${saju.element.keywords[Math.abs(seed + 1) % saju.element.keywords.length]}과 ${winner.keywords[1]}`,
        overall: `이번 주는 크게 방향을 바꾸기보다 흐트러진 것을 정리하고, 다음 단계로 넘어갈 준비를 하는 흐름입니다. ${winner.name}의 ${winner.keywords[0]}이 사람들에게 먼저 보이기 때문에 첫인상이나 첫 반응이 중요하게 작용할 수 있습니다. 다만 진짜 성과는 빠른 움직임보다 꾸준한 정리에서 나옵니다.`,
        earlyWeek: `주초에는 할 일이 많아 보이지만, 실제로는 우선순위를 정하는 것이 가장 중요합니다. 급한 메시지나 요청에 모두 반응하기보다 이번 주에 꼭 남겨야 할 결과를 먼저 잡아두세요. ${elementAdvice.early}`,
        midWeek: `주중에는 작은 전환점이 생길 수 있습니다. 누군가의 말, 일정 변경, 새로 들어온 정보가 생각의 방향을 바꿀 수 있습니다. 이때 바로 결론을 내리기보다 한 번 정리한 뒤 움직이면 실수가 줄어듭니다.`,
        weekend: `주말에는 몸과 마음의 속도를 낮추는 것이 좋습니다. 이번 주에 쌓인 피로가 작게 올라올 수 있으니, 사람을 많이 만나기보다 편한 사람이나 익숙한 공간에서 회복하는 시간이 도움이 됩니다. 가벼운 정리나 산책처럼 부담 없는 행동이 운을 부드럽게 만듭니다.`,
        relation: `관계에서는 ${plainRelation(saju.dayMaster.elementKey)} 이번 주에는 먼저 설득하기보다 서로의 문턱이 어디에 있는지 살피는 편이 좋습니다. ${winner.name}의 ${winner.keywords[0]}이 잘 쓰이면 상대가 마음을 열기 쉽지만, 내 속도만 앞서면 오해가 생길 수 있습니다.`,
        work: `${plainWork(saju.dayMaster.elementKey)} ${winner.name} 특유의 ${winner.keywords[0]}을 결과물의 첫인상으로 쓰면 유리합니다. 이번 주에는 완벽한 새 출발보다 진행 중인 일을 더 보기 좋게 다듬는 태도가 성과로 이어집니다.`,
        money: `돈과 소비에서는 작은 지출이 반복되는 부분을 살펴보는 것이 좋습니다. 큰돈을 쓰기 전에는 필요, 기분, 오래 쓸 가능성을 나눠서 생각해보세요. 이번 주에는 나를 위한 소비도 괜찮지만, 피로를 달래기 위한 즉흥 소비는 줄이는 편이 안정적입니다.`,
        emotion: `${elementAdvice.emotion} 감정은 완만하지만 오래 머무를 수 있으니 사소한 피로를 가볍게 넘기지 않는 것이 좋습니다. 마음이 복잡하면 사람에게 바로 풀기보다 먼저 적거나 정리한 뒤 말하는 편이 좋습니다.`,
        choice: `${elementAdvice.practice} 중요한 선택 앞에서는 빠른 확신보다 여러 번 반복해서 남는 신호를 살피세요. 한 번 보고 끌리는 것보다, 시간이 지나도 마음에 남는 선택이 이번 주에는 더 잘 맞습니다.`,
        avoid: `${saju.element.challenge} 모두에게 좋은 사람으로 보이려는 과한 조율도 피하는 편이 좋습니다. 내 역할이 아닌 일까지 떠안으면 주 후반에 피로가 커질 수 있습니다.`,
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

function weeklyByElement(key) {
    return {
        wood: {
            early: '새로운 일을 시작하고 싶어질 수 있지만, 먼저 기존 일의 끝맺음을 확인하는 편이 좋습니다.',
            emotion: '생각이 여러 방향으로 뻗을 수 있는 주입니다.',
            practice: '이번 주 실천 과제는 시작한 일을 하나만 골라 작은 결과까지 마무리하는 것입니다.',
        },
        fire: {
            early: '초반 에너지가 강하니 말과 약속을 너무 빠르게 늘리지 않는 것이 좋습니다.',
            emotion: '감정의 온도가 빨리 오르내릴 수 있는 주입니다.',
            practice: '이번 주 실천 과제는 바로 반응하기 전에 한 박자 쉬고 말하는 것입니다.',
        },
        earth: {
            early: '기존의 책임이 먼저 보일 수 있으니 해야 할 일과 맡지 않아도 될 일을 나눠보세요.',
            emotion: '참아둔 피로가 천천히 올라올 수 있는 주입니다.',
            practice: '이번 주 실천 과제는 작은 불편을 크게 쌓기 전에 부드럽게 말하는 것입니다.',
        },
        metal: {
            early: '기준을 세우기 좋은 시기지만, 모든 것을 완벽하게 정리하려 하면 시작이 늦어질 수 있습니다.',
            emotion: '스스로에게 엄격해지기 쉬운 주입니다.',
            practice: '이번 주 실천 과제는 완벽하지 않아도 중간 결과를 공유하는 것입니다.',
        },
        water: {
            early: '생각이 깊어질 수 있으니 혼자 정리하는 시간과 실제 실행 시간을 따로 잡아두세요.',
            emotion: '마음이 깊게 가라앉으며 많은 것을 곱씹을 수 있는 주입니다.',
            practice: '이번 주 실천 과제는 오래 생각한 일을 아주 작은 행동으로 밖에 꺼내는 것입니다.',
        },
    }[key] || {
        early: '초반에는 우선순위를 정하는 것이 중요합니다.',
        emotion: '감정의 흐름을 천천히 살피면 좋은 주입니다.',
        practice: '이번 주 실천 과제는 가장 중요한 일 하나에 집중하는 것입니다.',
    };
}

function plainRelation(key) {
    return {
        wood: '상대의 가능성을 보고 응원하는 말이 잘 통합니다.',
        fire: '따뜻하고 솔직한 반응이 관계를 부드럽게 만듭니다.',
        earth: '꾸준한 태도와 작은 약속이 신뢰를 만듭니다.',
        metal: '예의와 기준을 지키는 태도가 안정감을 줍니다.',
        water: '말보다 분위기와 뉘앙스를 살피는 힘이 살아납니다.',
    }[key] || '상대의 속도를 살피는 태도가 도움이 됩니다.';
}

function plainWork(key) {
    return {
        wood: '일과 학업에서는 새로운 방향을 잡고 작은 시작을 만드는 데 힘이 있습니다.',
        fire: '일과 학업에서는 표현, 발표, 설득처럼 에너지를 밖으로 쓰는 일에 힘이 있습니다.',
        earth: '일과 학업에서는 기록, 정리, 운영처럼 꾸준함이 필요한 일에 힘이 있습니다.',
        metal: '일과 학업에서는 검토, 마감, 전략처럼 완성도를 높이는 일에 힘이 있습니다.',
        water: '일과 학업에서는 조사, 분석, 글쓰기처럼 깊이 들어가는 일에 힘이 있습니다.',
    }[key] || '일과 학업에서는 정리된 계획이 도움이 됩니다.';
}
