import { extractFeatureTags } from './physiognomyInterpretation.js';

export function renderIntegrationReport(winner, parts, saju, features) {
    const tags = extractFeatureTags(features);
    const outer = tags.smilingMouth || tags.softEyes ? '부드럽고 접근하기 쉬운 인상' : tags.sharpEyes || tags.sharpJaw ? '선명하고 쉽게 잊히지 않는 인상' : '차분하고 균형 잡힌 인상';
    const aligned = isAligned(winner, saju);
    return [
        `<p><strong>얼굴이 드러내는 현재의 인상</strong><br>얼굴에서는 ${winner.name}과 ${parts.energy.name} 계열의 ${winner.keywords[0]}이 강하게 나타나며, 바깥으로는 ${outer}으로 읽힙니다.</p>`,
        `<p><strong>사주가 보여주는 타고난 기질</strong><br>일간은 ${saju.dayMaster.stem}(${saju.element.name}) 흐름입니다. 이는 ${saju.element.keywords.join(', ')} 같은 방향으로 해석됩니다.</p>`,
        `<p><strong>둘이 일치하는 지점</strong><br>${aligned ? `${winner.name}의 ${winner.keywords[1]}과 ${saju.element.name}의 ${saju.element.keywords[0]}이 비슷한 결을 만들어, 겉과 속이 비교적 일관되게 보입니다.` : `${winner.name}의 ${winner.keywords[0]}이 사주의 ${saju.element.keywords[0]}을 표현하는 입구가 되어, 타인에게는 기질이 더 쉽게 전달됩니다.`}</p>`,
        `<p><strong>둘이 어긋나는 지점</strong><br>겉으로는 ${winner.firstImpression}처럼 보이지만, 안쪽에서는 ${saju.element.rest}</p>`,
        `<p><strong>타인에게 보이는 나 vs 내면의 나</strong><br>타인에게는 ${outer}이 먼저 닿고, 내면에는 ${saju.element.tone}과 ${saju.dominantElement.name}의 축적감이 남습니다.</p>`,
        `<p><strong>지금 균형을 잡으면 좋은 방향</strong><br>${saju.element.challenge} 얼굴의 상을 과하게 관리하기보다, ${winner.keywords[0]}을 자연스럽게 쓸 수 있는 환경을 만들 때 균형이 좋아집니다.</p>`,
    ].join('');
}

function isAligned(winner, saju) {
    const softAnimals = ['dog', 'rabbit', 'deer', 'bear', 'quokka'];
    const activeElements = ['wood', 'fire'];
    if (softAnimals.includes(winner.id) && ['earth', 'water', 'wood'].includes(saju.dayMaster.elementKey)) return true;
    return activeElements.includes(saju.dayMaster.elementKey) && ['fox', 'monkey', 'dinosaur'].includes(winner.id);
}
