import { extractFeatureTags } from './physiognomyInterpretation.js';

export function renderIntegrationReport(winner, parts, saju, features) {
    const tags = extractFeatureTags(features);
    const outer = tags.smilingMouth || tags.softEyes ? '밝고 편하게 다가갈 수 있는 사람' : tags.sharpEyes || tags.sharpJaw ? '차분하지만 존재감이 분명한 사람' : '잔잔하고 균형 잡힌 사람';
    const aligned = isAligned(winner, saju);
    const inner = innerFlow(saju.dayMaster.elementKey);
    return [
        block('겉으로 보이는 나', `얼굴 분석에서는 ${winner.name}과 ${parts.energy.name} 계열의 ${winner.keywords[0]}이 강하게 보입니다. 처음 보는 사람은 당신을 ${outer}으로 느낄 가능성이 큽니다. 특히 눈은 ${parts.eyes.name}, 입가는 ${parts.mouth.name}으로 읽혀 첫인상에서 ${winner.keywords.slice(0, 2).join('과 ')}이 먼저 전달됩니다.`),
        block('실제 내면의 흐름', `생년 정보로 읽은 중심 기질은 ${saju.dayMaster.stem}(${saju.element.name})입니다. ${inner} 즉 겉으로 보이는 분위기와 별개로, 안쪽에서는 ${saju.element.keywords.slice(0, 2).join('과 ')}을 중요하게 여기는 흐름이 있습니다. 혼자 생각을 정리하는 방식이나 관계에서 에너지를 쓰는 방식도 이 기질의 영향을 받을 수 있습니다.`),
        block('사람들이 나를 쉽게 오해하는 지점', `사람들은 얼굴에서 먼저 보이는 ${winner.keywords[0]}만 보고 당신을 단순하게 판단할 수 있습니다. 하지만 실제로는 사주의 ${saju.element.name} 기질 때문에 생각보다 더 신중하거나, 더 깊이 고민하거나, 더 분명한 기준을 가지고 있을 가능성이 큽니다. 그래서 첫인상은 맞는 부분도 있지만 당신의 전부를 설명하지는 못합니다.`),
        block('겉과 속이 잘 맞는 부분', aligned
            ? `${winner.name}의 ${winner.keywords[1]}과 ${saju.element.name}의 ${saju.element.keywords[0]}은 비교적 같은 방향을 봅니다. 겉으로 보이는 분위기와 실제 반응 방식이 크게 어긋나지 않아, 가까워질수록 “처음 봤던 느낌이 어느 정도 맞다”는 말을 들을 수 있습니다. 이럴 때 당신은 꾸미지 않아도 자연스럽게 신뢰를 얻기 쉽습니다.`
            : `${winner.name}의 ${winner.keywords[0]}은 사주의 ${saju.element.keywords[0]}을 밖으로 보여주는 통로가 됩니다. 얼굴의 인상이 내면의 일부를 먼저 드러내기 때문에, 사람들은 당신의 장점을 비교적 빨리 알아차릴 수 있습니다. 다만 사주가 말하는 깊은 기질은 시간이 지나야 더 분명해집니다.`),
        block('겉과 속이 다르게 보이는 부분', `겉으로는 ${winner.firstImpression}처럼 보이지만, 안쪽에서는 ${saju.element.rest} 이 차이 때문에 사람들과 잘 어울리는 것처럼 보여도 실제로는 혼자 정리할 시간이 꼭 필요할 수 있습니다. 반대로 차분해 보이는 사람이라도 마음속에서는 강한 몰입이나 욕구가 움직이고 있을 수 있습니다.`),
        block('관계에서 이 차이가 나타나는 방식', `관계에서는 첫인상의 장점 덕분에 시작이 비교적 자연스러울 수 있습니다. 하지만 오래 가는 관계에서는 사주의 기질이 더 크게 드러납니다. 예를 들어 겉으로는 편해 보여도 실제로는 신뢰를 천천히 확인하거나, 겉으로는 단단해 보여도 가까운 사람에게는 깊게 마음을 쓰는 식입니다. 그래서 가까운 사람일수록 당신을 더 입체적으로 느낄 가능성이 큽니다.`),
        block('연애에서 드러나는 모습', `연애에서는 얼굴이 주는 첫 끌림과 사주가 말하는 애정 방식이 함께 작용합니다. 처음에는 ${winner.name}의 ${winner.keywords[0]} 때문에 관심이 생기고, 시간이 지나면 ${saju.element.name} 기질의 ${saju.element.keywords[0]}이 관계의 분위기를 만듭니다. 상대에게는 편안함, 깊이, 설렘, 기준 중 무엇이 먼저 보이느냐에 따라 당신의 매력이 다르게 전달될 수 있습니다. 중요한 것은 처음의 이미지에 갇히지 않고 실제 마음을 말로 확인해주는 것입니다.`),
        block('일과 진로에서 나타나는 모습', `일과 진로에서는 얼굴의 인상이 첫 신뢰나 존재감을 만들고, 사주의 기질이 오래 버티는 방식을 결정합니다. ${winner.name}의 장점은 사람들에게 ${winner.keywords[0]}의 이미지를 주고, ${saju.element.name} 기질은 ${saju.element.work} 이 두 가지가 잘 맞으면 처음 보는 자리에서도 좋은 인상을 주고, 시간이 지나며 실력과 태도로 다시 신뢰를 얻을 수 있습니다.`),
        block('나에게 가장 필요한 균형감', `${saju.element.challenge} 여기에 얼굴의 ${winner.keywords[0]}이 더해지면, 사람들에게 보이는 이미지와 실제 에너지 사용량 사이에 차이가 생길 수 있습니다. 남들이 기대하는 모습만 계속 유지하려 하기보다, 내가 편하게 오래 쓸 수 있는 속도를 찾는 것이 중요합니다.`),
        block('나를 더 잘 이해하기 위한 한 문장', `당신은 ${winner.name}의 인상으로 사람들에게 먼저 기억되고, ${saju.element.name}의 기질로 가까운 관계 안에서 더 깊이 이해되는 사람입니다. 쉽게 보이는 장점과 천천히 드러나는 내면이 함께 있을 때 당신의 매력이 가장 자연스럽게 살아납니다.`),
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
