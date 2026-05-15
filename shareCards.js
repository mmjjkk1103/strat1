const cardLabels = {
    summary: '종합 상 리포트',
    face: '관상 리포트',
    saju: '사주 리포트',
    daily: '오늘의 운세',
};

export function createShareSummaries(result) {
    const { userProfile, winner, partAnimals, saju, daily } = result;
    const name = userProfile.name;
    const oneLine = `${name}의 상에는 눈의 ${plainAnimal(partAnimals.eyes)}, 입가의 ${plainAnimal(partAnimals.mouth)}이 함께 머뭅니다. 타고난 결은 ${saju.element.name}의 ${saju.element.keywords[0]}에 닿아 있고, 오늘은 ${daily.keyword}의 기운이 길을 엽니다.`;
    const face = `${name}의 얼굴은 ${winner.name}의 결이 가장 앞섭니다. 눈에는 ${partAnimals.eyes.keywords[0]}이, 입가에는 ${partAnimals.mouth.keywords[0]}이 머물러 사람의 마음을 밀어붙이기보다 곁에 머물게 하는 상으로 읽힙니다.`;
    const sajuText = `${name}의 일간은 ${saju.dayMaster.stem}(${saju.element.name})입니다. 겉으로 드러나는 말보다 안쪽에서 익어가는 생각이 힘이 되며, 이번 주에는 ${saju.element.keywords[0]}의 결을 가지런히 할수록 운이 바르게 섭니다.`;
    const today = `오늘의 수호 동물은 ${daily.guardian.name}. ${daily.flow} 행운의 말은 ${daily.keyword}, 오늘의 한 문장은 "${daily.meditation}"입니다.`;

    return { oneLine, face, saju: sajuText, daily: today };
}

export async function downloadReportCard(type, result) {
    const canvas = buildReportCanvas(type, result);
    const link = document.createElement('a');
    link.download = `sanggyeol-${type}-${result.winner.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

export async function shareReport(type, result) {
    const summaries = createShareSummaries(result);
    const text = summaries[type] || summaries.oneLine;
    if (!navigator.share) return copyText(text);

    const canvas = buildReportCanvas(type === 'oneLine' ? 'summary' : type, result);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.96));
    const file = blob ? new File([blob], `sanggyeol-${type}.png`, { type: 'image/png' }) : null;
    const shareData = {
        title: `상결 ${cardLabels[type] || '리포트'}`,
        text,
        url: location.href,
    };

    if (file && navigator.canShare?.({ files: [file] })) shareData.files = [file];
    try {
        await navigator.share(shareData);
        return true;
    } catch (error) {
        if (error.name === 'AbortError') return false;
        return copyText(text);
    }
}

export async function copyText(text) {
    await navigator.clipboard.writeText(text);
    return true;
}

export function buildReportCanvas(type, result) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1620;
    const ctx = canvas.getContext('2d');
    drawBackground(ctx, canvas, type);

    const payload = getCardPayload(type, result);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#17213a';
    ctx.font = '700 34px serif';
    ctx.fillText('相結', 540, 118);
    ctx.font = '700 28px sans-serif';
    ctx.fillStyle = '#9c7445';
    ctx.fillText(payload.kicker, 540, 164);

    ctx.fillStyle = '#111827';
    ctx.font = '800 58px sans-serif';
    drawWrappedText(ctx, payload.title, 540, 250, 820, 70, 'center');

    ctx.font = '700 34px sans-serif';
    ctx.fillStyle = '#9c7445';
    drawWrappedText(ctx, payload.subtitle, 540, 365, 820, 46, 'center');

    drawSeal(ctx, payload.seal, 540, 520);

    let y = 660;
    payload.rows.forEach((row) => {
        y = drawCardRow(ctx, row.label, row.value, y);
    });

    ctx.fillStyle = '#111827';
    ctx.font = '700 34px sans-serif';
    ctx.fillText('오늘의 결', 540, 1288);
    ctx.font = '400 31px sans-serif';
    ctx.fillStyle = '#4c4a45';
    drawWrappedText(ctx, payload.quote, 540, 1342, 800, 48, 'center', 4);

    ctx.strokeStyle = 'rgba(156, 116, 69, 0.42)';
    ctx.beginPath();
    ctx.moveTo(280, 1490);
    ctx.lineTo(800, 1490);
    ctx.stroke();
    ctx.fillStyle = '#7a7167';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('상결 · AI 관상 사주 리포트', 540, 1538);
    return canvas;
}

function getCardPayload(type, result) {
    const { userProfile, winner, symbol, partAnimals, saju, daily, weekly } = result;
    const name = userProfile.name;
    const common = {
        summary: {
            kicker: 'OVERALL READING',
            title: `${name}의 상`,
            subtitle: `${symbol.title} · ${winner.name} ${winner.percent}%`,
            seal: winner.emoji,
            rows: [
                { label: '대표 동물상', value: `${winner.name} · ${winner.percent}%` },
                { label: '관상 총평', value: `눈에는 ${partAnimals.eyes.keywords[0]}이 머물고, 입가에는 ${partAnimals.mouth.keywords[0]}의 빛이 서려 있습니다.` },
                { label: '사주 총평', value: `${saju.element.name}의 결은 ${saju.element.keywords.slice(0, 2).join('과 ')}으로 흐릅니다.` },
                { label: '오늘의 흐름', value: daily.keyword },
            ],
            quote: daily.meditation,
        },
        face: {
            kicker: 'FACE READING',
            title: `${name}의 관상`,
            subtitle: `눈 ${plainAnimal(partAnimals.eyes)} · 입 ${plainAnimal(partAnimals.mouth)} · 윤곽 ${plainAnimal(partAnimals.outline)}`,
            seal: '相',
            rows: [
                { label: '눈의 상', value: `${partAnimals.eyes.name} · ${partAnimals.eyes.keywords[0]}` },
                { label: '입의 상', value: `${partAnimals.mouth.name} · ${partAnimals.mouth.keywords[0]}` },
                { label: '윤곽의 상', value: `${partAnimals.outline.name} · ${partAnimals.outline.keywords[1]}` },
                { label: '관계의 기운', value: winner.mood },
            ],
            quote: `이 상은 사람을 밀어붙이기보다 스스로 곁에 머물게 하는 힘을 품습니다.`,
        },
        saju: {
            kicker: 'SAJU RECORD',
            title: `${name}의 사주 결`,
            subtitle: saju.pillars ? `${saju.pillars.year.label} · ${saju.pillars.month.label} · ${saju.pillars.day.label} · ${saju.pillars.hour?.label ?? '시 미상'}` : '생년의 흐름',
            seal: saju.dayMaster.stem,
            rows: [
                { label: '일간', value: `${saju.dayMaster.stem} · ${saju.element.name}` },
                { label: '오행', value: elementSpread(saju.elements) },
                { label: '기질', value: saju.element.temperament },
                { label: '이번 주 기운', value: weekly.keyword },
            ],
            quote: weekly.sentence,
        },
        daily: {
            kicker: 'DAILY FORTUNE',
            title: `${name}의 오늘 운`,
            subtitle: `${daily.guardian.name}이 지키는 ${daily.keyword}의 날`,
            seal: daily.guardian.emoji,
            rows: [
                { label: '전체 흐름', value: daily.flow },
                { label: '관계운', value: daily.relation },
                { label: '일운', value: daily.focus },
                { label: '행운 키워드', value: daily.keyword },
            ],
            quote: daily.meditation,
        },
    };
    return common[type] || common.summary;
}

function drawBackground(ctx, canvas, type) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, type === 'daily' ? '#f7efe0' : '#fbf6eb');
    gradient.addColorStop(0.58, '#eadcc4');
    gradient.addColorStop(1, type === 'face' ? '#d9c5a7' : '#cdb38b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    roundRect(ctx, 74, 74, 932, 1472, 54);
    ctx.fill();
    ctx.strokeStyle = 'rgba(128, 88, 45, 0.32)';
    ctx.lineWidth = 2;
    roundRect(ctx, 104, 104, 872, 1412, 38);
    ctx.stroke();

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#8c6a3e';
    for (let x = 150; x < 960; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x, 130);
        ctx.lineTo(x - 130, 1500);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawSeal(ctx, seal, x, y) {
    ctx.save();
    ctx.fillStyle = '#17213a';
    ctx.strokeStyle = '#b98b4f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 92, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff8ed';
    ctx.font = seal.length > 1 ? '700 74px sans-serif' : '700 88px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seal, x, y + 4);
    ctx.restore();
}

function drawCardRow(ctx, label, value, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
    roundRect(ctx, 160, y, 760, 116, 26);
    ctx.fill();
    ctx.fillStyle = '#9c7445';
    ctx.font = '800 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 198, y + 38);
    ctx.fillStyle = '#27231d';
    ctx.font = '500 28px sans-serif';
    drawWrappedText(ctx, value, 198, y + 75, 680, 38, 'left', 2);
    return y + 138;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, align = 'left', maxLines = 3) {
    const chars = String(text).split('');
    const lines = [];
    let line = '';
    chars.forEach((char) => {
        const test = line + char;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = char;
        } else {
            line = test;
        }
    });
    if (line) lines.push(line);
    const visible = lines.slice(0, maxLines);
    if (lines.length > maxLines) visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, -1)}…`;
    ctx.textAlign = align;
    visible.forEach((row, index) => ctx.fillText(row, x, y + index * lineHeight));
    return y + visible.length * lineHeight;
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

function plainAnimal(animal) {
    return animal.name.replace('상', '');
}

function elementSpread(elements) {
    const labels = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' };
    return Object.entries(elements).map(([key, value]) => `${labels[key]} ${value}`).join(' · ');
}
