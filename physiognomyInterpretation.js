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
    const eyeTone = tags.softEyes ? '부드럽고 경계를 낮추는 눈매' : tags.sharpEyes ? '선명하고 방향성이 강한 눈매' : '차분하게 균형 잡힌 눈매';
    const mouthTone = tags.smilingMouth ? '입꼬리의 상승감이 밝은 인상을 만듭니다' : tags.smallMouth ? '입매가 조심스럽고 단정하게 읽힙니다' : '입의 폭과 표정감이 자연스럽게 드러납니다';
    const outlineTone = tags.sharpJaw ? '윤곽은 또렷하고 결단력 있는 인상으로 읽힙니다' : tags.groundedFace ? '윤곽은 안정적이고 묵직한 분위기를 줍니다' : '윤곽은 강하게 압도하기보다 완만하게 남습니다';
    return [
        `<p><strong>전체 인상 총평</strong><br>당신의 얼굴은 ${winner.resultMessage} 단정적 예언이라기보다, 현재 사진에서 읽히는 인상상의 흐름으로 보는 것이 좋습니다.</p>`,
        `<p><strong>눈의 상</strong><br>${eyeTone}가 먼저 읽힙니다. 이 흐름 때문에 ${parts.eyes.name} 계열의 ${parts.eyes.keywords[0]}이 강하게 나타납니다.</p>`,
        `<p><strong>입의 상</strong><br>${mouthTone}. 가까워질수록 ${parts.mouth.name} 특유의 ${parts.mouth.keywords[0]}이 편안하게 살아납니다.</p>`,
        `<p><strong>얼굴 윤곽의 상</strong><br>${outlineTone}. ${parts.outline.name}처럼 ${parts.outline.keywords[1]}을 만드는 쪽입니다.</p>`,
        `<p><strong>첫인상</strong><br>${winner.firstImpression}처럼 보이기 쉽습니다. 사진 속 상은 ${winner.keywords.slice(0, 2).join('과 ')}을 먼저 전달합니다.</p>`,
        `<p><strong>가까워졌을 때 드러나는 매력</strong><br>${winner.smileCharm}</p>`,
        `<p><strong>관계에서 읽히는 분위기</strong><br>${winner.mood} 좋은 인상을 더하려 하기보다 얼굴과 몸의 긴장을 덜어낼 때 본래의 결이 더 자연스럽게 드러납니다.</p>`,
    ].join('');
}

function buildPartReason(key, animal) {
    const copy = {
        eyes: `눈매 관련 특징값을 따로 계산했을 때 ${animal.name} 특유의 ${animal.keywords.slice(0, 2).join('과 ')}이 강하게 나타났습니다.`,
        mouth: `입 너비와 입꼬리 상승 정도를 중심으로 보면 ${animal.name}의 ${animal.keywords[0]}이 잘 읽힙니다.`,
        outline: `얼굴 가로세로 비율, 광대 폭, 턱선 지표가 ${animal.name} 계열의 ${animal.keywords[1]}으로 이어집니다.`,
        energy: `눈·입·윤곽의 가공 지표를 합치면 종합적으로 ${animal.name}의 ${animal.keywords[0]}이 가장 앞섭니다.`,
    };
    return copy[key];
}

function partLabel(key) {
    return { eyes: '눈의 상', mouth: '입의 상', outline: '윤곽의 상', energy: '종합 상' }[key];
}
