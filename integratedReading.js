import { extractFeatureTags } from './physiognomyInterpretation.js';

export function renderIntegrationReport(winner, parts, saju, features) {
    const tags = extractFeatureTags(features);
    const outer = tags.smilingMouth || tags.softEyes ? '부드럽게 문을 여는 인상' : tags.sharpEyes || tags.sharpJaw ? '선명해 오래 남는 인상' : '잔잔히 균형 잡힌 인상';
    const aligned = isAligned(winner, saju);
    return [
        `<p><strong>얼굴이 드러내는 현재의 인상 · 바깥의 상</strong><br>얼굴에서는 ${winner.name}과 ${parts.energy.name} 계열의 ${winner.keywords[0]}이 강하게 나타나며, 바깥으로는 ${outer}으로 읽힙니다.</p>`,
        `<p><strong>사주가 보여주는 타고난 기질 · 안쪽의 결</strong><br>일간은 ${saju.dayMaster.stem}(${saju.element.name})의 흐름입니다. 이는 ${saju.element.keywords.join(', ')}의 방향으로 해석됩니다.</p>`,
        `<p><strong>둘이 일치하는 지점 · 같은 물길</strong><br>${aligned ? `${winner.name}의 ${winner.keywords[1]}과 ${saju.element.name}의 ${saju.element.keywords[0]}이 비슷한 물길을 만들어, 겉과 속이 비교적 한 방향으로 흐릅니다.` : `${winner.name}의 ${winner.keywords[0]}이 사주의 ${saju.element.keywords[0]}을 밖으로 드러내는 문이 되어, 타인에게 기질이 더 또렷하게 닿습니다.`}</p>`,
        `<p><strong>둘이 어긋나는 지점 · 다른 바람</strong><br>겉으로는 ${winner.firstImpression}처럼 보이지만, 안쪽에서는 ${saju.element.rest}</p>`,
        `<p><strong>타인에게 보이는 나 vs 내면의 나 · 문과 방</strong><br>타인에게는 ${outer}이 먼저 닿고, 내면에는 ${saju.element.tone}과 ${saju.dominantElement.name}의 축적감이 남습니다.</p>`,
        `<p><strong>지금 균형을 잡으면 좋은 방향 · 오늘의 처방</strong><br>${saju.element.challenge} 얼굴의 상을 과하게 꾸미기보다, ${winner.keywords[0]}을 자연스럽게 쓸 수 있는 자리를 만들 때 기운이 바르게 섭니다.</p>`,
    ].join('');
}

function isAligned(winner, saju) {
    const softAnimals = ['dog', 'rabbit', 'deer', 'bear', 'quokka'];
    const activeElements = ['wood', 'fire'];
    if (softAnimals.includes(winner.id) && ['earth', 'water', 'wood'].includes(saju.dayMaster.elementKey)) return true;
    return activeElements.includes(saju.dayMaster.elementKey) && ['fox', 'monkey', 'dinosaur'].includes(winner.id);
}
