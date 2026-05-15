export function extractFeatureTags(features) {
    return {
        softEyes: features.eyeSoftness > 0.62,
        sharpEyes: features.eyeSlenderness > 0.58 || features.eyeTailUp > 0.58,
        roundEyes: features.eyeRoundness > 0.58 || features.bigEyes > 0.58,
        smilingMouth: features.mouthCornerUp > 0.58 || features.smileCurve > 0.58,
        expressiveMouth: features.expressiveMouth > 0.56,
        smallMouth: features.smallMouth > 0.58,
        sharpJaw: features.sharpJaw > 0.58,
        softJaw: features.softJaw > 0.58,
        longMidface: features.longMidface > 0.58,
        broadCheekbone: features.cheekDefinition > 0.5,
        groundedFace: features.groundednessIndex > 0.58 || features.wideFace > 0.58,
        compactFeatures: features.compactFeatures > 0.58,
        longFace: features.longFace > 0.58,
    };
}

export function renderPartAnimals(parts, features = {}) {
    const tags = extractFeatureTags(features);
    return Object.entries(parts)
        .map(([key, animal]) => `
            <details class="report-disclosure part-item" open>
                <summary>${partLabel(key)}: ${animal.emoji} ${animal.name}</summary>
                ${buildPartReason(key, animal, tags)}
            </details>
        `)
        .join('');
}

export function renderAnimalTypeReport(winner) {
    const report = winner.report;
    return [
        reportBlock('대표 동물상', `당신은 ${winner.name}에 가까운 인상입니다. 숫자로 딱 잘라 말하기보다, 사람들이 처음 봤을 때 “아, 이런 분위기 있네” 하고 느끼기 쉬운 쪽에 가깝습니다.`),
        reportBlock('한 줄로 말하면', oneLineAnimal(winner.id)),
        reportBlock('얼굴에서 그렇게 읽힌 이유', `${report.why} 어렵게 말하면 관상 포인트지만, 쉽게 말하면 얼굴에서 먼저 풍기는 공기가 이쪽에 가깝다는 뜻입니다.`),
        reportBlock('당신을 처음 본 사람은', `${report.first} 낯을 가리는 날에도 얼굴만 보면 그렇게 안 보일 수 있습니다. 그래서 실제 성격보다 첫인상이 먼저 오해를 만들기도 하고, 반대로 좋은 시작점을 만들어주기도 합니다.`),
        reportBlock('친해지고 나면 보이는 모습', report.close),
        reportBlock('관계 속에서 보이는 모습', report.relation),
        reportBlock('연애에서 느껴질 수 있는 분위기', report.romance),
        reportBlock('이 동물상의 강점', report.strength),
        reportBlock('너무 강하게 드러날 때 생길 수 있는 오해', report.caution),
        reportBlock('나에게 어울리는 분위기나 스타일 제안', report.style),
        reportBlock('마무리', report.closeLine),
    ].join('');
}

function oneLineAnimal(id) {
    return {
        dog: '처음부터 “이 사람 괜찮을 것 같다”는 느낌을 주는 편입니다.',
        cat: '쉽게 다가가긴 어렵지만, 그래서 더 궁금해지는 타입입니다.',
        rabbit: '세게 튀지는 않아도 묘하게 보호 본능을 건드리는 인상입니다.',
        fox: '눈치 빠르고 센스 있어 보여서, 가만히 있어도 분위기를 읽는 사람처럼 보입니다.',
        deer: '조용한데 이상하게 오래 기억나는 맑은 인상입니다.',
        bear: '옆에 있으면 괜히 마음이 좀 안정될 것 같은 얼굴입니다.',
        wolf: '말이 많지 않아도 자기 기준이 있어 보이는 타입입니다.',
        monkey: '대화가 시작되면 얼굴이 더 살아나는 사람입니다.',
        horse: '서두르지 않을수록 단정한 매력이 커지는 인상입니다.',
        dinosaur: '무난하게 묻히기보다 한 번 보면 기억에 남는 얼굴입니다.',
        camel: '빨리 친해지는 타입은 아니어도 볼수록 여운이 남는 쪽입니다.',
        quokka: '말 걸기 전부터 왠지 편한 사람입니다.',
    }[id] || '처음보다 볼수록 설명할 말이 많아지는 인상입니다.';
}

export function renderPhysiognomyReport(winner, parts, features) {
    const tags = extractFeatureTags(features);
    const socialImage = tags.sharpJaw || tags.sharpEyes
        ? '사회적인 자리에서는 기준이 분명하고 쉽게 흔들리지 않는 사람처럼 보일 수 있습니다. 그래서 처음에는 조금 단단하거나 차분한 사람으로 받아들여질 가능성이 큽니다.'
        : tags.smilingMouth || tags.softEyes
            ? '사회적인 자리에서는 상대가 말을 꺼내기 쉽게 만드는 부드러운 사람으로 보일 수 있습니다. 강하게 앞서기보다 분위기를 편하게 만드는 쪽의 존재감이 큽니다.'
            : '사회적인 자리에서는 튀기보다 균형을 잡는 사람처럼 보일 수 있습니다. 어느 한쪽으로 과하게 치우치지 않아 상황에 맞춰 이미지를 조절하기 좋습니다.';
    const misunderstanding = tags.smilingMouth
        ? '다만 편안하고 밝아 보이는 인상이 강하면, 힘들거나 예민한 순간에도 주변이 잘 알아차리지 못할 수 있습니다.'
        : tags.sharpEyes || tags.sharpJaw
            ? '다만 선명한 인상이 강하면, 실제보다 더 차갑거나 단호한 사람으로 오해받을 수 있습니다.'
            : '다만 차분한 인상이 강하면, 속마음이 늦게 전달되어 상대가 거리감을 느낄 수 있습니다.';

    return [
        reportBlock('전체 첫인상', `${winner.resultMessage} 전체적으로는 ${winner.firstImpression}으로 읽히기 쉽습니다. 이 결과는 얼굴의 한 부분만 본 것이 아니라 눈, 입가, 윤곽, 전체 분위기를 함께 놓고 읽은 해석입니다.`),
        reportBlock('사람들이 편하게 느끼는 지점', `${parts.mouth.name} 계열의 입가와 ${parts.eyes.name} 계열의 눈매가 함께 보이면서, 사람들은 당신에게서 ${winner.keywords.slice(0, 2).join('과 ')}을 먼저 느낄 수 있습니다. 처음부터 모든 것을 드러내지 않아도 표정의 긴장이 크지 않으면 상대가 편하게 다가오기 쉽습니다. 특히 대화가 시작되면 사진보다 실제 분위기가 더 부드럽게 느껴질 수 있습니다.`),
        reportBlock('사람들이 쉽게 오해할 수 있는 지점', `${misunderstanding} 얼굴에서 먼저 보이는 분위기가 실제 성격의 전부는 아니기 때문에, 가까운 관계에서는 말과 행동으로 내 상태를 조금 더 알려주는 것이 좋습니다. 특히 첫인상만으로 판단되는 상황에서는 작은 미소나 짧은 설명이 오해를 줄여줍니다.`),
        reportBlock('가까운 관계에서 보이는 진짜 모습', `가까워질수록 ${winner.name}의 장점은 더 자연스럽게 드러납니다. 처음에는 ${winner.firstImpression}처럼 보이더라도, 친해진 사람은 당신에게서 ${winner.report.close} 이 흐름은 겉모습의 인상과 실제 관계 방식이 만나는 지점입니다.`),
        reportBlock('사회적 상황에서의 이미지', `${socialImage} 발표, 회의, 모임처럼 여러 사람이 보는 자리에서는 표정의 긴장도와 말의 속도에 따라 이미지가 크게 달라질 수 있습니다. 너무 애쓰지 않고 본래의 장점을 편하게 쓰는 쪽이 더 자연스럽습니다.`),
        reportBlock('리더형인지, 다정형인지, 자유형인지', buildRoleTone(winner, tags)),
        reportBlock('이 인상이 살아나는 상황', `당신의 인상은 ${winner.keywords[0]}이 필요한 자리에서 잘 살아납니다. 낯선 사람과 처음 만나는 자리, 관계의 긴장을 낮춰야 하는 순간, 또는 자기 기준을 차분히 보여줘야 하는 상황에서 얼굴의 장점이 더 분명해질 수 있습니다. 사진보다 실제 대화 속에서 표정과 말투가 함께 움직일 때 매력이 커질 가능성이 큽니다.`),
        reportBlock('이 인상이 다르게 보일 수 있는 상황', `피곤하거나 긴장한 날에는 ${winner.name}의 좋은 장점이 덜 보이고, 반대로 ${parts.outline.name} 계열의 윤곽 인상이 더 앞에 나올 수 있습니다. 조명, 표정, 촬영 각도에 따라서도 첫인상은 달라집니다. 그래서 이 해석은 고정된 결론이 아니라 현재 사진에서 잘 보이는 분위기를 바탕으로 한 자기 이해 자료로 보는 것이 좋습니다.`),
    ].join('');
}

function buildPartReason(key, animal, tags) {
    const copy = {
        eyes: [
            `당신의 눈매는 ${animal.name} 계열의 ${animal.keywords[0]}이 먼저 읽힙니다.`,
            tags.sharpEyes
                ? '시선의 끝이 비교적 선명해 보여, 조용히 있어도 생각이 분명한 사람처럼 보일 수 있습니다.'
                : tags.softEyes || tags.roundEyes
                    ? '시선이 지나치게 날카롭게 튀지 않아 처음 보는 사람에게 부담을 덜 주는 편입니다.'
                    : '눈의 인상은 한쪽으로 강하게 치우치기보다 차분하게 균형을 잡는 쪽에 가깝습니다.',
            `이런 눈매는 ${animal.name} 특유의 ${animal.keywords.slice(0, 2).join('과 ')}을 얼굴 앞쪽에 놓이게 합니다.`,
            '그래서 첫인상에서는 말보다 먼저 눈빛의 온도와 방향이 기억될 가능성이 큽니다.',
        ],
        mouth: [
            `입과 웃음의 흐름에서는 ${animal.name} 계열의 ${animal.keywords[0]}이 보입니다.`,
            tags.smilingMouth
                ? '입꼬리와 미소의 흐름이 전체 인상을 훨씬 밝게 만들어, 무표정과 웃을 때의 차이가 매력으로 느껴질 수 있습니다.'
                : tags.smallMouth
                    ? '입매가 단정하게 모여 있어 말수가 많지 않아도 차분하고 조심스러운 사람처럼 보일 수 있습니다.'
                    : tags.expressiveMouth
                        ? '입 주변 표정 변화가 잘 보여 대화할 때 분위기가 더 살아나는 타입으로 읽힙니다.'
                        : '입가의 인상은 과하게 튀기보다 자연스럽게 전체 분위기를 받쳐주는 편입니다.',
            `말하거나 웃을 때 ${animal.name}의 ${animal.keywords[1]}이 더 쉽게 드러날 수 있습니다.`,
            '그래서 사진 한 장보다 실제 대화하는 장면에서 매력이 더 선명하게 보일 가능성이 있습니다.',
        ],
        outline: [
            `얼굴 윤곽은 ${animal.name} 계열의 ${animal.keywords[1]}과 연결됩니다.`,
            tags.sharpJaw
                ? '턱선과 하관이 비교적 또렷하게 읽혀 단단하고 자기 기준이 있는 사람처럼 보일 수 있습니다.'
                : tags.groundedFace || tags.softJaw
                    ? '윤곽이 날카롭게 밀고 나오기보다 안정적으로 받쳐주어 편안하고 신뢰감 있는 느낌을 줍니다.'
                    : tags.longFace || tags.longMidface
                        ? '세로의 흐름이 살아 있어 차분하고 성숙한 분위기가 더해질 수 있습니다.'
                        : '윤곽은 강하게 튀기보다 눈과 입의 인상을 자연스럽게 이어주는 역할을 합니다.',
            `이 흐름 때문에 얼굴 전체에서 ${animal.name} 특유의 분위기가 배경처럼 깔립니다.`,
            '윤곽은 첫눈에 가장 크게 느껴지는 부분이라, 사람들은 이 특징을 통해 당신의 안정감이나 존재감을 먼저 판단할 수 있습니다.',
        ],
        energy: [
            `눈, 입, 윤곽을 함께 놓고 보면 종합적으로 ${animal.name}의 ${animal.keywords[0]}이 앞섭니다.`,
            `부위별 특징이 따로 움직이기보다 서로 겹치면서 ${animal.summary}`,
            '즉 한 부위만 강하게 튀어서 나온 결과라기보다, 여러 인상이 같은 방향으로 모인 결과에 가깝습니다.',
            '이 조합은 당신을 처음 보는 사람에게 비교적 일관된 이미지를 남길 가능성이 큽니다.',
        ],
    };
    return copy[key].map((sentence) => `<p>${sentence}</p>`).join('');
}

function buildRoleTone(winner, tags) {
    if (['wolf', 'dinosaur', 'fox'].includes(winner.id) || tags.sharpJaw) {
        return '당신은 다정함만으로 기억되기보다 기준과 존재감이 함께 느껴지는 쪽에 가깝습니다. 리더처럼 앞에 서는 자리에서도 얼굴의 선명함이 힘을 줄 수 있습니다. 다만 너무 강하게 보이면 상대가 긴장할 수 있으니, 중요한 순간에는 표정과 말투를 조금 부드럽게 열어두는 것이 좋습니다.';
    }
    if (['dog', 'rabbit', 'deer', 'bear', 'quokka'].includes(winner.id) || tags.softEyes) {
        return '당신은 다정하고 편안한 사람으로 기억될 가능성이 큽니다. 사람을 압박하기보다 마음을 열게 하는 쪽의 힘이 있어 상담, 협업, 친밀한 관계에서 장점이 잘 드러납니다. 다만 늘 부드러운 사람으로만 보이면 단호함이 늦게 전달될 수 있습니다.';
    }
    return '당신은 한 가지 이미지로만 고정되기보다 상황에 따라 자유롭게 다르게 보일 수 있습니다. 편한 자리에서는 밝고 움직임이 살아나고, 집중하는 자리에서는 차분한 면이 더 보일 수 있습니다. 이런 변화감이 당신의 인상을 더 입체적으로 만듭니다.';
}

function reportBlock(title, body) {
    return `<section class="report-block"><h4>${title}</h4><p>${body}</p></section>`;
}

function partLabel(key) {
    return { eyes: '눈의 인상', mouth: '입과 웃음의 인상', outline: '얼굴 윤곽의 인상', energy: '전체 분위기의 조합' }[key];
}
