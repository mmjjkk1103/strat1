import { branchAnimals, elementProfiles } from './reading-data.js';
import { getGyeokFaceReference } from './gyeokguk-data.js';

const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const stemElements = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
const branchElements = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'];
const stemYinYang = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin'];
const branchYinYang = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin'];
const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
const elementLabels = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' };
const generates = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
const controls = { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' };
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
            gyeokguk: null,
            calendarNote: '생년월일이 없어 기본 리듬으로만 해석했습니다.',
            engineNote: '입력 정보가 부족한 경우에는 기본 기질 흐름만 참고해 해석합니다.',
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
    const gyeokguk = createGyeokgukProfile(dayMaster, pillars.month);

    return {
        element: elementProfiles[dayMaster.elementKey],
        branch: branchAnimals[mod(year - 4, 12)],
        daySeed: seed,
        pillars,
        elements,
        yinYang: yinYangBalance,
        dayMaster,
        dominantElement: elementProfiles[dominantElementKey],
        gyeokguk,
        calendarNote: `${profile.calendarType === 'lunar' ? '음력 입력값' : '양력'} 기준으로 생년 흐름을 계산했습니다.`,
        engineNote: '입력한 생년월일과 출생시간을 바탕으로 기본 기질, 관계 방식, 감정 흐름을 해석합니다.',
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
        stemYinYang: stemYinYang[stemIndex],
        branchYinYang: branchYinYang[branchIndex],
    };
}

function createGyeokgukProfile(dayMaster, monthPillar) {
    const tenGod = getTenGod(dayMaster, {
        elementKey: monthPillar.branchElement,
        yinYang: monthPillar.branchYinYang,
    });
    const name = `${tenGod}격`;
    const reference = getGyeokFaceReference(name);
    return {
        name,
        tenGod,
        monthBranch: monthPillar.branch,
        monthElement: monthPillar.branchElement,
        basis: `월지 ${monthPillar.branch}(${elementLabels[monthPillar.branchElement]})를 일간 ${dayMaster.stem} 기준으로 보았습니다.`,
        reference,
    };
}

function getTenGod(dayMaster, target) {
    const samePolarity = dayMaster.yinYang === target.yinYang;
    if (target.elementKey === dayMaster.elementKey) return samePolarity ? '비견' : '겁재';
    if (generates[target.elementKey] === dayMaster.elementKey) return samePolarity ? '편인' : '정인';
    if (generates[dayMaster.elementKey] === target.elementKey) return samePolarity ? '식신' : '상관';
    if (controls[dayMaster.elementKey] === target.elementKey) return samePolarity ? '편재' : '정재';
    if (controls[target.elementKey] === dayMaster.elementKey) return samePolarity ? '편관' : '정관';
    return '미정';
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
