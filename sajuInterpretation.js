import { guardianTitles } from './reading-data.js';

const elementLabels = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' };

export function renderSajuReport(saju) {
    const element = saju.element;
    const pillarLine = saju.pillars
        ? `년주 ${saju.pillars.year.label}, 월주 ${saju.pillars.month.label}, 일주 ${saju.pillars.day.label}, 시주 ${saju.pillars.hour?.label ?? '미상'}`
        : '생년월일 미입력으로 사주팔자 계산을 생략했습니다.';
    return [
        `<p><strong>사주팔자 · 네 기둥의 기록</strong><br>${pillarLine}</p>`,
        `<p><strong>일간 중심 기질 · ${saju.dayMaster.stem} · ${element.name}</strong><br>${element.temperament}</p>`,
        `<p><strong>오행 분포 · 기운의 자리</strong><br>${renderElementSpread(saju.elements)}</p>`,
        `<p><strong>음양 분포 · 드러남과 머묾</strong><br>양 ${saju.yinYang.yang} / 음 ${saju.yinYang.yin}. ${saju.yinYang.yang >= saju.yinYang.yin ? '밖으로 움직이는 결이 조금 더 앞섭니다.' : '안쪽에서 살피고 축적하는 결이 조금 더 깊습니다.'}</p>`,
        `<p><strong>관계의 경향 · 인연의 문</strong><br>${element.relationship}</p>`,
        `<p><strong>일과 배움 · 길이 나는 자리</strong><br>${element.work}</p>`,
        `<p><strong>재물의 결 · 모이고 흩어짐</strong><br>${element.money}</p>`,
        `<p><strong>해석 기준 · 만세력 기록</strong><br>${saju.calendarNote} ${saju.engineNote}</p>`,
    ].join('');
}

export function createSymbolicAnimalName(winner, saju, profile) {
    const seed = saju.daySeed + winner.name.length + profile.name.length;
    const prefix = guardianTitles[Math.abs(seed) % guardianTitles.length];
    return {
        title: `${prefix} ${winner.name.replace('상', '')}`,
        description: `${winner.tagline}과 ${saju.element.tone}이 겹쳐, 바깥에는 ${winner.keywords[0]}이 먼저 닿고 안쪽에는 ${saju.element.keywords[0]}의 물길이 남습니다.`,
    };
}

function renderElementSpread(elements) {
    return Object.entries(elements)
        .map(([key, value]) => `${elementLabels[key]} ${value}`)
        .join(' · ');
}
