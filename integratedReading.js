import { extractFeatureTags } from './physiognomyInterpretation.js';

export function renderIntegrationReport(winner, parts, saju, features) {
    const tags = extractFeatureTags(features);
    const outer = tags.smilingMouth || tags.softEyes ? '밝고 편하게 다가갈 수 있는 사람' : tags.sharpEyes || tags.sharpJaw ? '차분하지만 존재감이 분명한 사람' : '잔잔하고 균형 잡힌 사람';
    const aligned = isAligned(winner, saju);
    const inner = innerFlow(saju.dayMaster.elementKey);
    return [
        block('당신을 처음 본 사람은', `얼굴에서는 ${winner.name} 쪽의 ${winner.keywords[0]}이 먼저 보입니다. 그래서 처음 보는 사람은 당신을 ${outer}으로 느끼기 쉽습니다. 아직 한마디도 안 했는데, 이미 상대 머릿속에는 “이 사람은 이런 느낌일 것 같다”는 작은 메모가 생기는 셈입니다.`),
        block('그런데 속을 보면 조금 다릅니다', `생년 정보로 읽은 흐름에서는 ${inner} 겉으로 보이는 분위기와 별개로, 안쪽에서는 ${saju.element.keywords.slice(0, 2).join('과 ')}을 꽤 중요하게 여길 수 있습니다. 쉽게 말해, 얼굴은 힌트고 생일은 단서입니다. 둘을 같이 보면 당신이 훨씬 입체적으로 보입니다.`),
        block('사람들이 나를 쉽게 오해하는 지점', `사람들은 얼굴에서 먼저 보이는 ${winner.keywords[0]}만 보고 당신을 단순하게 판단할 수 있습니다. 하지만 실제로는 생각보다 더 신중하거나, 더 깊이 고민하거나, 더 분명한 기준을 가지고 있을 가능성이 큽니다. “그냥 그런 사람인 줄 알았는데, 은근히 자기 생각 있네?”라는 반응을 들을 수 있는 지점입니다.`),
        block('겉과 속이 잘 맞는 부분', aligned
            ? `겉으로 보이는 분위기와 속의 흐름이 꽤 비슷한 편입니다. 그래서 가까워질수록 “처음 봤던 느낌이 어느 정도 맞네”라는 말을 듣기 쉽습니다. 꾸미지 않아도 자연스럽게 설득되는 타입입니다.`
            : `겉으로 보이는 분위기와 속에서 실제로 굴러가는 생각이 살짝 다를 수 있습니다. 이 간극이 재미있는 포인트입니다. 처음엔 쉽게 읽히는 사람처럼 보여도, 막상 가까워지면 생각보다 층이 많습니다.`),
        block('의외로 다른 지점', `겉으로는 ${winner.firstImpression}처럼 보이지만, 안쪽에서는 ${saju.element.rest} 그래서 사람들과 잘 어울리는 것처럼 보여도, 진짜 회복은 혼자 있을 때 되는 편일 수 있습니다. 웃고 대화는 잘해도 배터리는 따로 충전해야 하는 타입일 수 있습니다.`),
        block('관계에서 자주 생길 수 있는 장면', `관계에서는 첫인상의 장점 덕분에 시작이 비교적 자연스럽습니다. 다만 오래 가는 관계에서는 속의 기준이 더 또렷하게 나옵니다. 가볍게 친해지는 것처럼 보여도, 정말 가까워지는 사람은 따로 고르는 쪽에 가깝습니다. 이게 매력으로 보이면 깊이 있는 사람이고, 오해받으면 “생각보다 속을 잘 안 보여준다”는 말이 될 수 있습니다.`),
        block('연애에서 보일 수 있는 모습', `연애에서는 첫인상이 먼저 문을 열고, 속의 기질이 관계의 온도를 정합니다. 처음에는 ${winner.name}의 ${winner.keywords[0]} 때문에 끌릴 수 있고, 시간이 지나면 ${saju.element.keywords[0]}을 중요하게 여기는 모습이 보입니다. 상대가 당신을 더 알고 싶어지는 지점도 바로 여기입니다.`),
        block('일할 때 드러나는 습관', `일할 때는 얼굴이 주는 이미지가 첫 신뢰를 만들고, 속의 기질이 버티는 방식을 정합니다. ${winner.name}의 장점은 사람들에게 ${winner.keywords[0]}의 인상을 주고, 안쪽 흐름은 ${saju.element.work} 그래서 첫인상으로 시작하고, 태도로 다시 신뢰를 얻는 타입에 가깝습니다.`),
        block('지금의 나에게 필요한 한마디', `남들이 기대하는 모습만 계속 유지하려고 하면 금방 피곤해질 수 있습니다. 오늘의 핵심은 간단합니다. 보이는 모습도 나고, 속에서 오래 생각하는 모습도 나입니다. 둘 중 하나만 맞추려 하지 말고, 둘 다 내 편으로 쓰면 됩니다.`),
    ].join('');
}

function isAligned(winner, saju) {
    const softAnimals = ['dog', 'rabbit', 'deer', 'bear', 'quokka'];
    const activeElements = ['wood', 'fire'];
    if (softAnimals.includes(winner.id) && ['earth', 'water', 'wood'].includes(saju.dayMaster.elementKey)) return true;
    return activeElements.includes(saju.dayMaster.elementKey) && ['fox', 'monkey', 'dinosaur'].includes(winner.id);
}

function innerFlow(key) {
    return {
        wood: '안쪽에서는 새로운 가능성을 찾고 조금씩 성장하려는 마음이 움직입니다.',
        fire: '안쪽에서는 표현하고 몰입하며 마음의 온도를 나누고 싶은 흐름이 강합니다.',
        earth: '안쪽에서는 안정과 신뢰를 중요하게 여기고 오래 지키려는 마음이 큽니다.',
        metal: '안쪽에서는 기준을 세우고 핵심을 정리하려는 흐름이 강합니다.',
        water: '안쪽에서는 깊이 관찰하고 혼자 마음을 정리하려는 시간이 중요합니다.',
    }[key] || '안쪽에서는 자신의 리듬을 지키며 천천히 판단하려는 흐름이 있습니다.';
}

function block(title, body) {
    return `<section class="report-block"><h4>${title}</h4><p>${body}</p></section>`;
}
