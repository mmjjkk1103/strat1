export const manseryeokReference = {
    packageName: '@fullstackfamily/manseryeok',
    version: '1.0.8',
    sourceName: '한국천문연구원(KASI) 음양력변환계산',
    supportedYears: '1900년 ~ 2050년',
    features: [
        '한국 음력 기준의 양력-음력 변환 데이터',
        '입춘 기준 년주 계산',
        '24절기 기준 월주 계산',
        '60갑자와 12지지 동물 매핑',
        '진태양시 기반 시주 보정 옵션',
        'TypeScript 타입 지원',
    ],
    whyKoreanDataMatters: [
        '한국 음력과 중국 음력은 윤달 위치가 달라질 수 있습니다.',
        '사주 계산에서는 한국 표준시와 절기 기준을 함께 고려해야 합니다.',
        '월주는 음력 월초가 아니라 절기 기준으로 바뀌기 때문에 월주 계산 기준이 중요합니다.',
    ],
    latestNotes: [
        'v1.0.8: CJS 호환성 개선, ESM 출력 파일을 .mjs로 분리',
        'v1.0.7: 월주를 음력 월초 기준이 아니라 절기 기준으로 재계산',
        'v1.0.6: 진, 오, 술 지지 오행 매핑 수정',
        'v1.0.5: 24절기 사주월 매핑 오류 수정',
        'v1.0.4: 12지지 동물 매핑 오류 수정',
    ],
    staticSiteNote: '현재 상결은 별도 빌드 과정이 없는 정적 사이트라 자체 계산 모듈을 사용합니다. 다만 기준 설명과 향후 교체 기준은 @fullstackfamily/manseryeok v1.0.8 정보를 반영했습니다.',
};

export function renderManseryeokReferenceBlock() {
    return `
        <section class="report-block">
            <h4>만세력 기준 업데이트</h4>
            <p>
                기준 데이터는 ${manseryeokReference.packageName} ${manseryeokReference.version} 정보를 참고했습니다.
                이 라이브러리는 ${manseryeokReference.sourceName} 데이터를 바탕으로 ${manseryeokReference.supportedYears} 범위의 한국 음력과 사주 계산 기준을 제공합니다.
                한국 사주에서는 입춘 기준 년주, 24절기 기준 월주, 한국 표준시와 진태양시 보정 여부가 중요하므로 향후 정밀 계산 엔진으로 교체할 때 이 기준을 우선 적용합니다.
            </p>
        </section>
        <section class="report-block">
            <h4>왜 한국 만세력 기준이 중요한가요?</h4>
            <p>${manseryeokReference.whyKoreanDataMatters.join(' ')}</p>
        </section>
    `;
}
