import { branchAnimals, elementProfiles } from './reading-data.js';

const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const stemElements = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
const branchElements = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'];
const yinYang = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin'];
const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
const branchAlias = {
    子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사',
    午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해',
};
const solarTermMonthStarts = [
    [2, 4], [3, 6], [4, 5], [5, 6], [6, 6], [7, 7],
    [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6],
];

export function createSajuProfile(profile) {
    if (!profile.birthDate) {
        return {
            element: elementProfiles.water,
            branch: '미상',
            daySeed: 0,
            pillars: null,
            elements: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
            yinYang: { yin: 0, yang: 0 },
            dayMaster: { stem: '계', elementKey: 'water', element: elementProfiles.water, yinYang: 'yin' },
            calendarNote: '생년월일이 없어 기본 리듬으로만 해석했습니다.',
            engineNote: '사주 계산 엔진은 모듈화되어 있으며, 추후 정밀 만세력 라이브러리로 교체할 수 있습니다.',
        };
    }

    const date = profile.birthDate;
    const year = getSajuYear(date);
    const monthIndex = getSajuMonthIndex(date);
    const yearIndex = mod(year - 1984, 60);
    const monthStemIndex = mod((yearIndex % 5) * 2 + monthIndex + 2, 10);
    const monthBranchIndex = branches.indexOf(monthBranches[monthIndex]);
    const dayIndex = mod(julianDayNumber(date) + 49, 60);
    const hourBranchIndex = getHourBranchIndex(profile.birthTime);
    const hourStemIndex = hourBranchIndex === null ? null : mod((dayIndex % 5) * 2 + hourBranchIndex, 10);
    const pillars = {
        year: makePillar(yearIndex),
        month: makePillarFromParts(monthStemIndex, monthBranchIndex),
        day: makePillar(dayIndex),
        hour: hourBranchIndex === null ? null : makePillarFromParts(hourStemIndex, hourBranchIndex),
    };
    const elements = countElements(pillars);
    const yinYangBalance = countYinYang(pillars);
    const dayMaster = {
        stem: pillars.day.stem,
        elementKey: pillars.day.stemElement,
        element: elementProfiles[pillars.day.stemElement],
        yinYang: pillars.day.stemYinYang,
    };
    const dominantElementKey = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0];
    const seed = year * 372 + (date.getMonth() + 1) * 31 + date.getDate() + (hourBranchIndex ?? 0) * 17 + dayIndex;

    return {
        element: elementProfiles[dayMaster.elementKey],
        branch: branchAnimals[mod(year - 4, 12)],
        daySeed: seed,
        pillars,
        elements,
        yinYang: yinYangBalance,
        dayMaster,
        dominantElement: elementProfiles[dominantElementKey],
        calendarNote: `${profile.calendarType === 'lunar' ? '음력 입력값' : '양력'} 기준으로 계산했습니다. 현재 정적 버전은 절기 월주와 간지 일주를 자체 계산하며, 음력-양력 변환은 정밀 만세력 연동 시 보강됩니다.`,
        engineNote: 'npm 번들러가 없는 정적 사이트라 manseryeok/@gracefullight/saju 대신 교체 가능한 자체 계산 모듈을 적용했습니다.',
    };
}

function makePillar(index) {
    return makePillarFromParts(mod(index, 10), mod(index, 12));
}

function makePillarFromParts(stemIndex, branchIndex) {
    return {
        stem: stems[stemIndex],
        branch: branches[branchIndex],
        label: `${stems[stemIndex]}${branches[branchIndex]}`,
        stemElement: stemElements[stemIndex],
        branchElement: branchElements[branchIndex],
        stemYinYang: yinYang[stemIndex],
        branchYinYang: yinYang[branchIndex],
    };
}

function getSajuYear(date) {
    const year = date.getFullYear();
    const ipchun = new Date(`${year}-02-04T00:00:00`);
    return date < ipchun ? year - 1 : year;
}

function getSajuMonthIndex(date) {
    const year = date.getFullYear();
    for (let i = solarTermMonthStarts.length - 1; i >= 0; i -= 1) {
        const [month, day] = solarTermMonthStarts[i];
        const termYear = month === 1 ? year + 1 : year;
        const start = new Date(`${termYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`);
        if (date >= start) return i;
    }
    return 11;
}

function getHourBranchIndex(birthTime) {
    if (!birthTime || birthTime === 'unknown') return null;
    return branches.indexOf(branchAlias[birthTime] ?? birthTime);
}

function countElements(pillars) {
    const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    Object.values(pillars).filter(Boolean).forEach((pillar) => {
        counts[pillar.stemElement] += 1;
        counts[pillar.branchElement] += 1;
    });
    return counts;
}

function countYinYang(pillars) {
    const counts = { yin: 0, yang: 0 };
    Object.values(pillars).filter(Boolean).forEach((pillar) => {
        counts[pillar.stemYinYang] += 1;
        counts[pillar.branchYinYang] += 1;
    });
    return counts;
}

function julianDayNumber(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function mod(value, base) {
    return ((value % base) + base) % base;
}
