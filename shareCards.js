const cardLabels = {
    summary: '종합 상 리포트',
    face: '관상 리포트',
    saju: '사주 리포트',
    daily: '오늘의 운세',
};

export function createShareSummaries(result) {
    const { userProfile, winner, partAnimals, saju, daily } = result;
    const name = userProfile.name;
    const oneLine = `${name}는 ${winner.name}. 겉은 ${winner.keywords[0]}, 속은 ${saju.element.keywords[0]}이 깊은 사람.`;
    const face = `${name}의 얼굴은 ${winner.name}에 가깝습니다. 눈은 ${plainAnimal(partAnimals.eyes)}, 입가는 ${plainAnimal(partAnimals.mouth)} 분위기가 함께 보여요.`;
    const gyeokText = saju.gyeokguk?.name ? `${saju.gyeokguk.name}의 그릇 위에 ` : '';
    const sajuText = `${name}의 일간은 ${saju.dayMaster.stem}(${saju.element.name})입니다. ${gyeokText}${saju.element.keywords[0]}과 ${saju.element.keywords[1]}이 중요한 사람으로 읽혔어요.`;
    const today = `오늘의 수호 동물은 ${daily.guardian.name}. 행운 키워드는 ${daily.keyword}, 조언은 "${daily.meditation}"`;

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
        title: `보이는 나, 진짜 나 ${cardLabels[type] || '리포트'}`,
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
    ctx.fillStyle = '#f7e8bd';
    ctx.font = '700 34px serif';
    ctx.fillText('나', 540, 118);
    ctx.font = '700 28px sans-serif';
    ctx.fillStyle = '#d9b86f';
    ctx.fillText(payload.kicker, 540, 164);

    ctx.fillStyle = '#fff8ea';
    ctx.font = '800 58px sans-serif';
    drawWrappedText(ctx, payload.title, 540, 250, 820, 70, 'center');

    ctx.font = '700 34px sans-serif';
    ctx.fillStyle = '#d9b86f';
    drawWrappedText(ctx, payload.subtitle, 540, 365, 820, 46, 'center');

    drawSeal(ctx, payload.seal, 540, 520);

    let y = 660;
    payload.rows.forEach((row) => {
        y = drawCardRow(ctx, row.label, row.value, y);
    });

    ctx.fillStyle = '#fff8ea';
    ctx.font = '700 34px sans-serif';
    ctx.fillText('오늘의 결', 540, 1288);
    ctx.font = '400 31px sans-serif';
    ctx.fillStyle = '#e7dcc9';
    drawWrappedText(ctx, payload.quote, 540, 1342, 800, 48, 'center', 4);

    ctx.strokeStyle = 'rgba(228, 191, 114, 0.46)';
    ctx.beginPath();
    ctx.moveTo(280, 1490);
    ctx.lineTo(800, 1490);
    ctx.stroke();
    ctx.fillStyle = '#b9ad9a';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('보이는 나, 진짜 나', 540, 1538);
    return canvas;
}

function getCardPayload(type, result) {
    const { userProfile, winner, symbol, partAnimals, saju, daily, weekly } = result;
    const name = userProfile.name;
    const common = {
        summary: {
            kicker: 'OVERALL READING',
            title: `${name}의 상`,
            subtitle: `${symbol.title} · ${winner.name}`,
            seal: winner.emoji,
            rows: [
                { label: '대표 동물상', value: `${winner.name}에 가까운 인상` },
                { label: '관상 총평', value: `겉은 ${winner.keywords[0]}, 가까워질수록 ${winner.keywords[1]}이 보이는 타입.` },
                { label: '사주 총평', value: `${saju.element.name} · ${saju.element.keywords.slice(0, 2).join('과 ')}` },
                { label: '오늘의 흐름', value: daily.keyword },
            ],
            quote: daily.meditation,
        },
        face: {
            kicker: 'FACE READING',
            title: `${name}의 첫인상`,
            subtitle: `눈 ${plainAnimal(partAnimals.eyes)} · 입 ${plainAnimal(partAnimals.mouth)} · 윤곽 ${plainAnimal(partAnimals.outline)}`,
            seal: '相',
            rows: [
                { label: '눈의 상', value: `${partAnimals.eyes.name} · ${partAnimals.eyes.keywords[0]}` },
                { label: '입의 상', value: `${partAnimals.mouth.name} · ${partAnimals.mouth.keywords[0]}` },
                { label: '윤곽의 상', value: `${partAnimals.outline.name} · ${partAnimals.outline.keywords[1]}` },
                { label: '관계의 기운', value: winner.mood },
            ],
            quote: `${winner.name}의 장점은 처음보다 가까워질수록 더 재밌게 보입니다.`,
        },
        saju: {
            kicker: 'SAJU RECORD',
            title: `${name}의 사주 결`,
            subtitle: saju.pillars ? `${saju.pillars.year.label} · ${saju.pillars.month.label} · ${saju.pillars.day.label} · ${saju.pillars.hour?.label ?? '시 미상'}` : '생년의 흐름',
            seal: saju.dayMaster.stem,
            rows: [
                { label: '일간', value: `${saju.dayMaster.stem} · ${saju.element.name}` },
                { label: '격국', value: saju.gyeokguk?.name ?? '월령 미상' },
                { label: '오행', value: elementSpread(saju.elements) },
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
    gradient.addColorStop(0, type === 'daily' ? '#10182a' : '#080b14');
    gradient.addColorStop(0.56, '#151022');
    gradient.addColorStop(1, type === 'face' ? '#2a1d30' : '#302512');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 248, 234, 0.06)';
    roundRect(ctx, 74, 74, 932, 1472, 54);
    ctx.fill();
    ctx.strokeStyle = 'rgba(228, 191, 114, 0.38)';
    ctx.lineWidth = 2;
    roundRect(ctx, 104, 104, 872, 1412, 38);
    ctx.stroke();

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#e4bf72';
    for (let x = 150; x < 960; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x, 130);
        ctx.lineTo(x - 130, 1500);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(247, 232, 189, 0.34)';
    for (let i = 0; i < 60; i += 1) {
        const x = 130 + ((i * 173) % 820);
        const y = 130 + ((i * 277) % 1360);
        ctx.beginPath();
        ctx.arc(x, y, i % 5 === 0 ? 1.8 : 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSeal(ctx, seal, x, y) {
    ctx.save();
    ctx.fillStyle = '#0a0f1c';
    ctx.strokeStyle = '#e4bf72';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 92, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff8ea';
    ctx.font = seal.length > 1 ? '700 74px sans-serif' : '700 88px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seal, x, y + 4);
    ctx.restore();
}

function drawCardRow(ctx, label, value, y) {
    ctx.fillStyle = 'rgba(255, 248, 234, 0.075)';
    roundRect(ctx, 160, y, 760, 116, 26);
    ctx.fill();
    ctx.fillStyle = '#e4bf72';
    ctx.font = '800 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 198, y + 38);
    ctx.fillStyle = '#fff8ea';
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
