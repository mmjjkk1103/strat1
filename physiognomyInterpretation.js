export function extractFeatureTags(features) {
    return {
        softEyes: features.eyeSoftness > 0.62,
        sharpEyes: features.eyeSlenderness > 0.58 || features.eyeTailUp > 0.58,
        smilingMouth: features.mouthCornerUp > 0.58,
        smallMouth: features.smallMouth > 0.58,
        sharpJaw: features.sharpJaw > 0.58,
        softJaw: features.softJaw > 0.58,
        longMidface: features.longMidface > 0.58,
        broadCheekbone: features.cheekDefinition > 0.5,
        groundedFace: features.groundednessIndex > 0.58,
        compactFeatures: features.compactFeatures > 0.58,
    };
}

export function renderPartAnimals(parts) {
    return Object.entries(parts)
        .map(([key, animal]) => `<div class="part-item"><strong>${partLabel(key)}: ${animal.emoji} ${animal.name}</strong><p>${buildPartReason(key, animal)}</p></div>`)
        .join('');
}

export function renderPhysiognomyReport(winner, parts, features) {
    const tags = extractFeatureTags(features);
    const eyeTone = tags.softEyes ? '눈빛은 물처럼 부드럽게 머뭅니다' : tags.sharpEyes ? '눈매 끝에는 바람처럼 선명한 방향이 서 있습니다' : '눈빛은 한쪽으로 치우치지 않고 잔잔히 놓입니다';
    const mouthTone = tags.smilingMouth ? '입꼬리에는 봄볕 같은 밝음이 서려 있습니다' : tags.smallMouth ? '입매는 말을 아끼듯 단정히 닫혀 있습니다' : '입가에는 표정의 결이 자연스럽게 드러납니다';
    const outlineTone = tags.sharpJaw ? '윤곽은 칼끝처럼 또렷해 결단의 기운을 남깁니다' : tags.groundedFace ? '윤곽은 흙처럼 안정되어 묵직한 기운을 줍니다' : '윤곽은 강하게 밀어붙이기보다 완만한 여백을 남깁니다';
    return [
        `<p><strong>전체 인상 총평 · 얼굴에 머문 결</strong><br>${winner.resultMessage} 이는 정해진 운명이라기보다, 지금 사진 위에 드러난 상의 흐름으로 읽는 편이 좋습니다.</p>`,
        `<p><strong>눈의 상 · 마음이 먼저 비치는 자리</strong><br>${eyeTone}. 이 흐름 때문에 ${parts.eyes.name} 계열의 ${parts.eyes.keywords[0]}이 앞에 놓입니다.</p>`,
        `<p><strong>입의 상 · 인연이 드나드는 문</strong><br>${mouthTone}. 가까워질수록 ${parts.mouth.name} 특유의 ${parts.mouth.keywords[0]}이 편안히 살아납니다.</p>`,
        `<p><strong>얼굴 윤곽의 상 · 기운을 담는 그릇</strong><br>${outlineTone}. ${parts.outline.name}처럼 ${parts.outline.keywords[1]}의 그릇을 만드는 쪽입니다.</p>`,
        `<p><strong>첫인상 · 문 앞의 기운</strong><br>${winner.firstImpression}처럼 읽히기 쉽습니다. 사진 속 상은 ${winner.keywords.slice(0, 2).join('과 ')}을 먼저 전합니다.</p>`,
        `<p><strong>가까워졌을 때 드러나는 매력 · 안쪽의 빛</strong><br>${winner.smileCharm}</p>`,
        `<p><strong>관계에서 읽히는 분위기 · 머무는 온도</strong><br>${winner.mood} 좋은 인상을 더하려 애쓰기보다 몸과 얼굴의 긴장을 덜어낼 때 본래의 결이 맑아집니다.</p>`,
    ].join('');
}

function buildPartReason(key, animal) {
    const copy = {
        eyes: `눈의 크기와 꼬리의 방향을 따로 살피면 ${animal.name} 특유의 ${animal.keywords.slice(0, 2).join('과 ')}이 먼저 떠오릅니다.`,
        mouth: `입 너비와 입꼬리의 흐름을 중심으로 보면 ${animal.name}의 ${animal.keywords[0]}이 입가에 머뭅니다.`,
        outline: `얼굴의 비율, 광대의 폭, 턱선의 각도가 ${animal.name} 계열의 ${animal.keywords[1]}으로 이어집니다.`,
        energy: `눈·입·윤곽의 결을 함께 놓고 보면 종합적으로 ${animal.name}의 ${animal.keywords[0]}이 앞섭니다.`,
    };
    return copy[key];
}

function partLabel(key) {
    return { eyes: '눈의 상', mouth: '입의 상', outline: '윤곽의 상', energy: '종합 상' }[key];
}
