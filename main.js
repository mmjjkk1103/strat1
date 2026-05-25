import { animalProfiles, featureLabels, quizQuestions } from './animal-data.js';
import { detectFaceLandmarks } from './faceLandmark.js';
import { extractFaceFeatures as extractLandmarkFeatures } from './faceFeatureExtraction.js';
import { calculateAnimalScores as scoreAnimalTypes, calculatePartAnimals as scorePartAnimals } from './animalTypeScoring.js';
import { renderAnimalTypeReport, renderPartAnimals as renderPartAnimalReport, renderPhysiognomyReport as renderFaceReadingReport } from './physiognomyInterpretation.js';
import { createSajuProfile } from './sajuCalculation.js';
import { createSymbolicAnimalName as createSajuSymbol, renderSajuReport as renderSajuProfileReport } from './sajuInterpretation.js';
import { createDailyFortune as createRuleDailyFortune } from './dailyFortune.js';
import { createWeeklyFortune as createRuleWeeklyFortune } from './weeklyFortune.js';
import { renderIntegrationReport as renderIntegratedReading } from './integratedReading.js';
import { copyText, createShareSummaries, downloadReportCard, shareReport } from './shareCards.js';

const animalById = Object.fromEntries(animalProfiles.map((animal) => [animal.id, animal]));
const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const loadingSteps = [
    '눈매와 윤곽에서 먼저 뜨는 분위기를 보고 있습니다...',
    '얼굴 비율과 표정의 결을 맞춰보고 있습니다...',
    '태어난 날의 흐름을 조용히 겹쳐보고 있습니다...',
    '연애, 돈, 관계 카드로 나누는 중입니다...',
    '상몽패가 열렸습니다.',
];

const themeButtons = document.querySelectorAll('.theme-toggle');
const imageUpload = document.getElementById('image-upload');
const dropZone = document.getElementById('drop-zone');
const startCameraButton = document.getElementById('start-camera');
const cameraPanel = document.getElementById('camera-panel');
const cameraVideo = document.getElementById('camera-video');
const capturePhotoButton = document.getElementById('capture-photo');
const retakePhotoButton = document.getElementById('retake-photo');
const previewPanel = document.getElementById('preview-panel');
const imagePreview = document.getElementById('image-preview');
const analysisOverlay = document.getElementById('analysis-overlay');
const analysisBadge = document.getElementById('analysis-badge');
const removeImageButton = document.getElementById('remove-image');
const analyzeButton = document.getElementById('analyze-button');
const statusMessage = document.getElementById('status-message');
const readerNameInput = document.getElementById('reader-name');
const birthDateInput = document.getElementById('birth-date');
const calendarTypeInput = document.getElementById('calendar-type');
const birthTimeInput = document.getElementById('birth-time');
const readerGenderInput = document.getElementById('reader-gender');
const moodReferenceInput = document.getElementById('mood-reference');
const toneReferenceInput = document.getElementById('tone-reference');
const avoidExpressionInput = document.getElementById('avoid-expression');
const focusElementsInput = document.getElementById('focus-elements');
const promptHelper = document.getElementById('prompt-helper');
const loadingPanel = document.getElementById('loading-panel');
const loadingStep = document.getElementById('loading-step');
const loadingProgress = document.getElementById('loading-progress');
const progressBar = document.getElementById('progress-bar');
const resultPanel = document.getElementById('result-panel');
const winnerCard = document.getElementById('winner-card');
const resultCardDeck = document.getElementById('result-card-deck');
const saveCardButton = document.getElementById('save-card');
const copyLinkButton = document.getElementById('copy-link');
const shareResultButton = document.getElementById('share-result');
const shareOneLine = document.getElementById('share-one-line');
const downloadCardButtons = document.querySelectorAll('[data-card-type]');
const copySummaryButtons = document.querySelectorAll('[data-copy-summary]');
const shareReportButtons = document.querySelectorAll('[data-share-report]');
const compareToggle = document.getElementById('compare-toggle');
const comparePanel = document.getElementById('compare-panel');
const compareModeInput = document.getElementById('compare-mode');
const compareUpload = document.getElementById('compare-upload');
const compareCameraButton = document.getElementById('compare-camera');
const comparePreview = document.getElementById('compare-preview');
const compareImage = document.getElementById('compare-image');
const compareOverlay = document.getElementById('compare-overlay');
const compareBadge = document.getElementById('compare-badge');
const analyzeCompareButton = document.getElementById('analyze-compare');
const compareResult = document.getElementById('compare-result');
const resetButton = document.getElementById('reset-button');
const animalGuideGrid = document.getElementById('animal-guide-grid');
const guideModal = document.getElementById('guide-modal');
const modalContent = document.getElementById('modal-content');

let cameraStream;
let captureTarget = 'main';
let capturedCanvas;
let compareCanvas;
let currentResult;
let comparePersonResult;
let loadingTimer;

init();

function init() {
    setTheme(localStorage.getItem('theme') || 'dark');
    renderAnimalGuide();
    bindEvents();
}

function bindEvents() {
    themeButtons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.theme)));
    imageUpload.addEventListener('change', (event) => handleImageFile(event.target.files[0], 'main'));
    [moodReferenceInput, toneReferenceInput, avoidExpressionInput, focusElementsInput].forEach((input) => {
        input.addEventListener('input', updatePromptHelper);
    });
    compareUpload.addEventListener('change', (event) => handleImageFile(event.target.files[0], 'compare'));
    dropZone.addEventListener('click', (event) => {
        if (event.target !== imageUpload) imageUpload.click();
    });
    dropZone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            imageUpload.click();
        }
    });
    ['dragenter', 'dragover'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.add('is-dragover');
        });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.remove('is-dragover');
        });
    });
    dropZone.addEventListener('drop', (event) => handleImageFile(event.dataTransfer.files[0], 'main'));
    startCameraButton.addEventListener('click', () => startCamera('main'));
    compareCameraButton.addEventListener('click', () => startCamera('compare'));
    capturePhotoButton.addEventListener('click', capturePhoto);
    retakePhotoButton.addEventListener('click', () => startCamera(captureTarget));
    removeImageButton.addEventListener('click', clearMainImage);
    analyzeButton.addEventListener('click', () => analyzeCurrentImage('main'));
    analyzeCompareButton.addEventListener('click', () => analyzeCurrentImage('compare'));
    saveCardButton.addEventListener('click', saveResultCard);
    copyLinkButton.addEventListener('click', copyResultLink);
    shareResultButton.addEventListener('click', shareResult);
    downloadCardButtons.forEach((button) => button.addEventListener('click', () => saveReportCard(button.dataset.cardType)));
    copySummaryButtons.forEach((button) => button.addEventListener('click', () => copySummary(button.dataset.copySummary)));
    shareReportButtons.forEach((button) => button.addEventListener('click', () => shareSelectedReport(button.dataset.shareReport)));
    compareToggle.addEventListener('click', () => {
        comparePanel.hidden = !comparePanel.hidden;
        if (!comparePanel.hidden) comparePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    resetButton.addEventListener('click', resetTester);
    guideModal.addEventListener('click', (event) => {
        if (event.target.matches('[data-close-modal]')) closeGuideModal();
    });
    resultCardDeck.addEventListener('click', (event) => {
        const toggle = event.target.closest('.oracle-card-toggle');
        if (!toggle) return;
        const card = toggle.closest('.oracle-card');
        const isOpen = card.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !guideModal.hidden) closeGuideModal();
    });
}

function setTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    themeButtons.forEach((button) => {
        const isActive = button.dataset.theme === theme;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function handleImageFile(file, target) {
    if (!file) return;
    if (!validImageTypes.includes(file.type)) {
        showStatus('jpg, jpeg, png, webp 형식의 사진만 운세첩에 올릴 수 있습니다.', true);
        return;
    }

    stopCamera();
    const imageURL = URL.createObjectURL(file);

    if (target === 'compare') {
        compareCanvas = null;
        clearAnalysisOverlay('compare');
        compareImage.onload = () => URL.revokeObjectURL(imageURL);
        compareImage.src = imageURL;
        comparePreview.hidden = false;
        compareResult.innerHTML = '';
        showStatus('비교할 얼굴이 준비되었습니다. 친구의 상도 펼쳐보세요.', false);
        return;
    }

    hideResult();
    hideLoading();
    capturedCanvas = null;
    clearAnalysisOverlay('main');
    imagePreview.onload = () => URL.revokeObjectURL(imageURL);
    imagePreview.src = imageURL;
    previewPanel.hidden = false;
    cameraPanel.hidden = true;
    showStatus('얼굴이 준비되었습니다. 나의 상 읽기를 눌러주세요.', false);
}

async function startCamera(target = 'main') {
    captureTarget = target;
    hideLoading();
    if (target === 'main') hideResult();
    clearAnalysisOverlay(target);
    cameraPanel.hidden = false;
    previewPanel.hidden = target === 'main';
    retakePhotoButton.hidden = true;
    capturePhotoButton.hidden = false;
    document.getElementById('start-test').scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        stopCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } },
            audio: false,
        });
        cameraVideo.srcObject = cameraStream;
        showStatus(target === 'compare' ? '비교할 얼굴이 중앙에 머물면 촬영해주세요.' : '얼굴이 빛 안에 들어오면 촬영하기를 눌러주세요.', false);
    } catch (error) {
        console.error(error);
        cameraPanel.hidden = true;
        showStatus('카메라 문이 열리지 않았습니다. 브라우저 권한과 HTTPS 접속 상태를 확인해 주세요.', true);
    }
}

function capturePhoto() {
    if (!cameraVideo.videoWidth) {
        showStatus('화면이 맺힌 뒤 다시 촬영해주세요.', true);
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    const context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    stopCamera();
    capturePhotoButton.hidden = true;
    retakePhotoButton.hidden = false;

    if (captureTarget === 'compare') {
        compareCanvas = canvas;
        clearAnalysisOverlay('compare');
        compareImage.src = canvas.toDataURL('image/png');
        comparePreview.hidden = false;
        showStatus('비교할 얼굴이 준비되었습니다. 친구의 상도 펼쳐보세요.', false);
        comparePanel.hidden = false;
        comparePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    capturedCanvas = canvas;
    clearAnalysisOverlay('main');
    imagePreview.src = canvas.toDataURL('image/png');
    previewPanel.hidden = false;
    showStatus('촬영한 얼굴이 준비되었습니다. 나의 상 읽기를 눌러주세요.', false);
}

async function analyzeCurrentImage(target) {
    const isCompare = target === 'compare';
    const source = isCompare ? (compareCanvas || compareImage) : (capturedCanvas || imagePreview);
    const button = isCompare ? analyzeCompareButton : analyzeButton;
    const userProfile = getUserProfile();

    if (!source || (!isCompare && !capturedCanvas && !imagePreview.src) || (isCompare && !compareCanvas && !compareImage.src)) {
        showStatus(isCompare ? '비교할 얼굴을 먼저 올려주세요.' : '상을 읽을 얼굴 사진을 먼저 올려주세요.', true);
        return;
    }

    if (!isCompare && !userProfile.birthDate) {
        showStatus('태어난 날을 더하면 얼굴의 상과 생년의 결을 함께 읽을 수 있습니다.', true);
        birthDateInput.focus();
        return;
    }

    button.disabled = true;
    showLoading();

    try {
        await waitForImageReady(source);
        await runLoadingSequence();
        const landmarks = await detectFaceLandmarks(source);
        const features = extractLandmarkFeatures(landmarks);
        const scores = scoreAnimalTypes(features, animalProfiles);
        const partAnimals = scorePartAnimals(features, animalProfiles);
        const saju = createSajuProfile(userProfile);
        const daily = createRuleDailyFortune(scores[0], saju, userProfile, animalProfiles);
        const weekly = createRuleWeeklyFortune(scores[0], saju, userProfile, animalProfiles);
        const symbol = createSajuSymbol(scores[0], saju, userProfile);
        const analysis = {
            scores,
            features,
            faceFeatures: features,
            partAnimals,
            saju,
            sajuProfile: saju,
            daily,
            weekly,
            symbol,
            userProfile,
            winner: scores[0],
            top: scores.slice(0, 3),
        };
        drawAnalysisOverlay(isCompare ? 'compare' : 'main', landmarks, source);

        if (isCompare) {
            comparePersonResult = analysis;
            renderCompareResult();
            resultPanel.hidden = false;
            comparePanel.hidden = false;
            comparePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showStatus('친구의 상도 함께 펼쳤습니다.', false);
        } else {
            currentResult = analysis;
            renderResult(analysis);
            showStatus('운세첩이 완성되었습니다. 카드로 저장하거나 나누어보세요.', false);
        }
    } catch (error) {
        console.error(error);
        handleAnalyzeError(error);
    } finally {
        hideLoading();
        button.disabled = false;
    }
}

function renderResult({ scores, features, winner, top, partAnimals, saju, daily, weekly, symbol, userProfile }) {
    const shareSummaries = createShareSummaries({ winner, partAnimals, saju, daily, userProfile });
    const coreSummary = buildCoreResultSummary(winner, saju);
    const readingTone = buildReadingTone({ winner, top, saju, userProfile, daily });
    winnerCard.innerHTML = `
        <div class="winner-main">
            <div class="winner-emoji">${winner.emoji}</div>
            <p class="winner-label">상몽 대표패</p>
            <h2>${coreSummary.title}</h2>
            <p class="winner-subtitle">대표 동물상: ${winner.name} · 속의 힌트: ${saju.element.name}</p>
            <p class="winner-message">${coreSummary.body}</p>
            <div class="keyword-row">
                <span>첫인상: ${winner.keywords[0]}</span>
                <span>숨은 나: ${saju.element.keywords[0]}</span>
                <span>접점: ${coreSummary.keyword}</span>
            </div>
        </div>
    `;

    const comments = buildFeatureComments(winner, top, features);
    const firstImpression = comments.slice(0, 3).map((comment) => `<p>${comment}</p>`).join('');
    const compatibilityHtml = `
        ${winner.compat.map((id) => {
            const animal = animalById[id];
            return `<div class="compat-chip"><span>${animal.emoji}</span><span>${animal.name}</span></div>`;
        }).join('')}
        <p class="combo-summary">${winner.compatText}</p>
    `;
    const detailHtml = `
        <details class="report-disclosure">
            <summary>${winner.emoji} ${winner.name} 상세 리포트</summary>
            ${renderAnimalTypeReport(winner)}
        </details>
        <details class="report-disclosure">
            <summary>관상 총평</summary>
            ${renderFaceReadingReport(winner, partAnimals, features)}
        </details>
    `;
    const cardItems = buildOracleCards({
        winner,
        top,
        features,
        partAnimals,
        saju,
        daily,
        weekly,
        symbol,
        userProfile,
        readingTone,
        firstImpression,
        detailHtml,
        compatibilityHtml,
    });

    resultCardDeck.innerHTML = cardItems.map(renderOracleCard).join('');
    renderSelfQuiz();
    shareOneLine.textContent = shareSummaries.oneLine;
    resultPanel.hidden = false;
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildOracleCards({ winner, top, features, partAnimals, saju, daily, weekly, symbol, userProfile, readingTone, firstImpression, detailHtml, compatibilityHtml }) {
    const supportAnimal = top[1] || winner;
    const timeNotice = userProfile.birthTime === 'unknown'
        ? '<p class="time-note">출생시간이 입력되지 않아 시주 분석은 제외하고, 입력된 정보 기준으로 해석했습니다.</p>'
        : '';
    const userRefs = renderUserReferenceNote(userProfile);
    return [
        {
            glyph: '獸',
            title: '대표 동물상',
            tease: `${winner.name}이 가장 앞에 뜨고, ${supportAnimal.name}이 분위기를 받칩니다.`,
            body: renderShortBlocks([
                ['대표 상', readingTone.animalLead],
                ['보조 상', `${supportAnimal.name}의 ${supportAnimal.keywords[0]}이 뒤에서 섞입니다. 그래서 한 가지 인상으로만 고정되지 않고, 상황에 따라 부드러움과 선명함이 번갈아 보일 수 있습니다.`],
            ]),
            isOpen: true,
        },
        {
            glyph: '相',
            title: '첫인상 요약',
            tease: '처음엔 살짝 어려운데, 이상하게 계속 눈이 가는 얼굴.',
            body: `<div class="feature-comments">${firstImpression}</div><p class="feature-summary">사진 기준으로는 ${winner.name} 쪽 분위기가 먼저 뜹니다. 닮았다는 말보다, 남이 처음 붙이는 인상에 가깝습니다.</p>`,
        },
        {
            glyph: '心',
            title: '내면 성향 요약',
            tease: '겉보다 속이 더 예민합니다. 그냥 넘긴 척하고 혼자 오래 복기하는 편.',
            body: `${timeNotice}${renderShortBlocks([
                ['안쪽의 결', readingTone.innerEssay],
                ['겉과 속의 차이', readingTone.outerInnerGap],
                ['사용자 입력 반영', userRefs],
            ])}`,
        },
        {
            glyph: '五',
            title: '주요 오행 분석',
            tease: `${readingTone.strongLabel}이 앞서지만, 한 가지 색으로만 읽히진 않습니다.`,
            body: renderShortBlocks([
                ['강한 오행', readingTone.strongEssay],
                ['약한 오행', readingTone.weakEssay],
                ['오행 분포', readingTone.elementSpread],
            ]),
        },
        {
            glyph: '缺',
            title: '부족하거나 과한 오행',
            tease: '강한 기운보다 비어 있는 쪽이 일상에서 더 티 날 때가 있습니다.',
            body: renderShortBlocks([
                ['부족한 흐름', readingTone.missingEssay],
                ['과한 흐름', readingTone.excessEssay],
                ['계절감', readingTone.seasonEssay],
            ]),
        },
        {
            glyph: '人',
            title: '관계에서의 모습',
            tease: '넓게 친한 척보다, 진짜 편한 몇 명에게 에너지를 씁니다.',
            body: `${renderShortBlocks([['사회적 관계', readingTone.relationEssay]])}<div class="compatibility-list">${compatibilityHtml}</div>`,
        },
        {
            glyph: '戀',
            title: '연애 또는 친밀한 관계',
            tease: '좋아하면 티 안 나는 척하는데, 눈은 이미 말하고 있음.',
            body: renderShortBlocks([
                ['끌리는 방식', readingTone.loveEssay],
                ['친밀해진 뒤', `${supportAnimal.name}의 결이 가까운 관계에서 더 드러납니다. 편해질수록 말보다 행동, 표정보다 작은 습관에서 마음이 보일 수 있습니다.`],
                ['조심할 점', '괜찮은 척을 너무 잘하면 상대가 신호를 놓칩니다. 싫은 것보다 필요한 것을 먼저 말하는 편이 좋습니다.'],
            ]),
        },
        {
            glyph: '學',
            title: '시험/집중 스타일',
            tease: '몰입이 오면 오래 가는데, 시작 전까지 마음의 예열이 깁니다.',
            body: renderShortBlocks([
                ['집중 방식', daily.focus],
                ['막히는 순간', readingTone.focusEssay],
            ]),
        },
        {
            glyph: '氣',
            title: '나에게 어울리는 분위기 키워드',
            tease: readingTone.moodKeywords.join(' · '),
            body: renderShortBlocks([
                ['분위기 키워드', readingTone.moodKeywords.join(' · ')],
                ['이미지 방향', readingTone.imageDirection],
            ]),
        },
        {
            glyph: '日',
            title: '오늘의 조언 한 문장',
            tease: daily.meditation,
            body: renderShortBlocks([
                ['오늘의 조언', daily.meditation],
                ['오늘의 행동', daily.action],
            ]),
        },
        {
            glyph: '面',
            title: '얼굴 부위별 상',
            tease: '눈, 턱, 윤곽이 각자 다른 말을 합니다.',
            body: renderPartAnimalReport(partAnimals, features),
        },
        {
            glyph: '合',
            title: '겉과 속 종합',
            tease: '보이는 분위기와 실제 반응이 완전히 같진 않습니다.',
            body: renderIntegratedReading(winner, partAnimals, saju, features),
        },
        {
            glyph: '符',
            title: '저장용 부적 카드',
            tease: `${userProfile.name}님의 오늘 상징은 ${symbol.title}.`,
            body: `<div id="talisman-card" class="talisman-preview">${renderTalismanCard(symbol, winner, daily, userProfile)}</div>`,
        },
        {
            glyph: '問',
            title: '내가 느끼는 나',
            tease: '사진 속 나와 내가 아는 나를 맞춰보는 카드.',
            body: '<div id="self-quiz" class="self-quiz"></div><p id="quiz-result" class="quiz-result">문항을 고르면 스스로 느끼는 상과 사진에서 읽힌 상을 나란히 비춰봅니다.</p>',
        },
        {
            glyph: '詳',
            title: '상세 리포트',
            tease: '길게 보고 싶을 때만 펼치는 깊은 해석.',
            body: `${timeNotice}${renderSajuProfileReport(saju)}${detailHtml}`,
        },
    ];
}

function renderOracleCard(card, index) {
    const openClass = card.isOpen ? ' is-open' : '';
    return `
        <article class="oracle-card${openClass}" style="--card-index:${index}">
            <button class="oracle-card-toggle" type="button" aria-expanded="${card.isOpen ? 'true' : 'false'}">
                <span class="oracle-glyph">${card.glyph}</span>
                <span class="oracle-copy">
                    <strong>${card.title}</strong>
                    <small>${card.tease}</small>
                </span>
                <span class="oracle-action">펼치기</span>
            </button>
            <div class="oracle-card-body">${card.body}</div>
        </article>
    `;
}

function renderShortBlocks(items) {
    return items.map(([title, body]) => reportBlock(title, body)).join('');
}


function buildFeatureComments(winner, top, features) {
    const activeFeatures = Object.entries(winner.weights)
        .filter(([, weight]) => weight > 0)
        .sort((a, b) => (features[b[0]] ?? 0) * b[1] - (features[a[0]] ?? 0) * a[1])
        .slice(0, 2)
        .map(([feature]) => featureLabels[feature])
        .filter(Boolean);
    const comments = [...winner.commentTemplates];
    if (activeFeatures.length) comments.splice(1, 0, `${activeFeatures.join(', ')}의 결이 사진 안에서 또렷하게 드러났습니다.`);
    comments.push(`그래서 사진만 보면 ${winner.name} 쪽의 분위기가 먼저 떠오릅니다. 꼭 닮았다기보다, 사람들이 당신을 처음 볼 때 받는 느낌에 가깝습니다.`);
    return comments.slice(0, 4);
}

function buildComboSummary(top) {
    const [first, second, third] = top;
    const softIds = ['dog', 'rabbit', 'deer', 'bear', 'quokka'];
    const sharpIds = ['cat', 'fox', 'wolf', 'dinosaur', 'camel'];
    const activeIds = ['monkey', 'quokka', 'dog'];
    const ids = top.map((animal) => animal.id);
    const sharpCount = ids.filter((id) => sharpIds.includes(id)).length;
    const softCount = ids.filter((id) => softIds.includes(id)).length;
    const activeCount = ids.filter((id) => activeIds.includes(id)).length;

    const base = `${first.name}이 가장 앞에 있고, ${second.name}과 ${third.name}이 뒤에서 분위기를 보태는 조합입니다. `;
    if (sharpCount >= 2) return `${base}이 조합은 눈매와 윤곽에서 선명함이 먼저 살아나 조용히 있어도 존재감이 남기 쉽습니다. 사람들은 당신을 쉽게 휩쓸리지 않는 사람, 자기 기준이 있는 사람으로 볼 수 있습니다. 다만 첫인상이 강하게 느껴질 수 있으니 편한 자리에서는 표정과 말투를 조금 부드럽게 열어두면 매력이 더 잘 전달됩니다.`;
    if (softCount >= 2 && activeCount >= 1) return `${base}부드러운 인상과 밝은 에너지가 함께 있어 사람의 경계를 낮추는 힘이 큽니다. 처음 만난 사람도 당신을 어렵게 느끼기보다 편하게 다가갈 가능성이 높습니다. 다만 늘 괜찮고 밝아 보이면 내 피로가 늦게 보일 수 있으니, 가까운 사람에게는 힘든 마음도 조금씩 드러내는 것이 좋습니다.`;
    if (ids.includes('horse') || ids.includes('camel')) return `${base}긴 호흡과 차분한 분위기가 강해 빨리 소비되는 인상보다 시간이 지날수록 더 안정적으로 보입니다. 처음에는 조금 느긋하거나 조용해 보여도, 오래 볼수록 생각이 깊고 쉽게 흔들리지 않는 사람으로 느껴질 수 있습니다. 중요한 관계에서는 반응을 너무 늦추지 않고 관심을 표현하면 장점이 더 잘 살아납니다.`;
    return `${base}한 가지 분위기로만 고정되지 않고 부드러움과 선명함, 밝음과 차분함이 번갈아 드러납니다. 그래서 상황에 따라 사람들에게 다른 매력을 남길 수 있습니다. 이 조합은 처음엔 편안하게 보이다가 가까워질수록 생각보다 입체적인 사람이라는 느낌을 줄 가능성이 큽니다.`;
}

function buildCoreResultSummary(winner, saju) {
    const softAnimals = ['dog', 'rabbit', 'deer', 'bear', 'quokka'];
    const sharpAnimals = ['cat', 'fox', 'wolf', 'dinosaur', 'camel'];
    const activeAnimals = ['monkey', 'fox', 'quokka'];
    const elementTone = {
        wood: { label: '성장과 가능성을 찾는 기질', short: '성장', hidden: '새로운 가능성을 찾고 조금씩 방향을 넓히려는 마음' },
        fire: { label: '표현과 몰입이 강한 기질', short: '표현', hidden: '마음이 움직이면 표현하고 몰입하려는 흐름' },
        earth: { label: '안정과 신뢰를 중시하는 기질', short: '안정', hidden: '쉽게 흔들리기보다 오래 지키고 쌓으려는 마음' },
        metal: { label: '기준과 판단이 분명한 기질', short: '기준', hidden: '흐린 것을 정리하고 기준을 세우려는 흐름' },
        water: { label: '관찰과 깊이가 강한 기질', short: '깊이', hidden: '겉으로 크게 드러내기보다 안쪽에서 오래 생각을 정리하는 흐름' },
    }[saju.dayMaster.elementKey] || { label: '자기 리듬을 지키는 기질', short: '균형', hidden: '자신의 속도로 판단하고 움직이려는 흐름' };
    const outer = softAnimals.includes(winner.id)
        ? '편안하고 부드럽게 보이는 사람'
        : sharpAnimals.includes(winner.id)
            ? '차분하지만 존재감이 분명한 사람'
            : activeAnimals.includes(winner.id)
                ? '밝고 반응이 살아 있는 사람'
                : '균형감 있게 기억되는 사람';
    const title = `${winner.keywords[0]} 얼굴에 ${elementTone.short} 기운`;
    const body = `처음엔 ${outer}으로 남습니다. 그런데 가까이 보면 바로 읽히는 사람은 아닙니다. 겉은 ${winner.keywords[0]} 쪽인데, 속에는 ${elementTone.hidden}이 깔려 있습니다. 친해질수록 “생각보다 깊네?”라는 말을 듣기 쉬운 상입니다.`;
    return { title, body, keyword: elementTone.short };
}

const elementVariantLibrary = {
    wood: [
        '새 가지가 뻗듯 가능성을 먼저 봅니다. 시작이 늦어 보여도, 마음속에서는 이미 여러 방향을 재고 있습니다.',
        '목(木)이 강하게 뜨면 사람과 일의 성장 가능성을 빨리 알아봅니다. 대신 모든 가능성을 다 붙잡으면 중심이 흐려질 수 있습니다.',
        '부드럽지만 가만히 있지는 않는 기운입니다. 조용히 방향을 바꾸고, 어느 순간 자기 길을 넓혀갑니다.',
        '새로운 사람이나 환경 앞에서 의외로 회복이 빠릅니다. 막히면 오래 버티기보다 다른 문을 찾는 쪽입니다.',
        '말보다 흐름을 중요하게 봅니다. 관계도 일도 “앞으로 좋아질 수 있나”를 먼저 보는 타입입니다.',
    ],
    fire: [
        '화(火)는 단순히 밝은 기운이 아니라, 마음이 움직일 때 표정과 행동에 온도가 생기는 감각에 가깝습니다.',
        '좋아하는 일 앞에서는 속도가 빨라집니다. 반대로 마음이 식으면 몸도 같이 느려지는 편입니다.',
        '사람들 사이에서 분위기를 살리는 힘이 있습니다. 다만 오래 밝게 타려면 혼자 식히는 시간도 필요합니다.',
        '확신이 오면 먼저 움직입니다. 그 추진력은 장점이지만, 뜨거운 순간의 말은 한 박자 늦추는 편이 좋습니다.',
        '표현하고 싶은 마음이 강합니다. 인정받고 싶은 욕구도 있지만, 그만큼 누군가를 따뜻하게 비추는 힘도 있습니다.',
    ],
    earth: [
        '토(土)는 느린 기운이 아니라 오래 버티는 감각입니다. 한 번 마음을 주면 쉽게 걷어내지 않습니다.',
        '관계와 일에서 안정감을 먼저 봅니다. 화려한 말보다 꾸준한 행동을 더 믿는 쪽입니다.',
        '겉으로는 무던해 보여도 속으로는 기준과 책임을 많이 계산합니다. 그래서 가끔 혼자 무거워질 수 있습니다.',
        '변화 앞에서 바로 뛰기보다 땅을 먼저 고릅니다. 느려 보일 수 있지만, 자리 잡으면 쉽게 흔들리지 않습니다.',
        '사람을 챙길 때 말보다 행동으로 갑니다. 다만 표현이 늦으면 상대가 마음을 못 알아볼 수 있습니다.',
    ],
    metal: [
        '금(金)은 단순히 차가운 기운이라기보다, 상황을 한 발 물러서서 정리하려는 감각에 가깝습니다.',
        '판단이 빠르고 기준이 분명합니다. 다만 마음이 없는 게 아니라, 감정을 정리한 뒤에야 말이 나오는 쪽입니다.',
        '날카롭지만 섬세한 금입니다. 작은 어긋남을 빨리 알아차리지만, 가까운 사람에게는 의외로 약해질 수 있습니다.',
        '원칙을 중시하지만 속은 생각보다 여립니다. 그래서 실망하면 크게 화내기보다 조용히 거리를 둡니다.',
        '완성도를 보는 눈이 있습니다. 다만 여덟 할의 결과도 세상에 내보내는 연습이 필요합니다.',
    ],
    water: [
        '수(水)는 조용한 기운이 아니라 깊이 스며드는 감각입니다. 말은 적어도 장면을 오래 기억합니다.',
        '겉으로는 담담해 보여도 안쪽에서는 많은 감정이 흐릅니다. 그래서 혼자 정리하는 시간이 꼭 필요합니다.',
        '사람을 넓게보다 깊게 봅니다. 한 번 신뢰하면 오래 마음을 쓰는 쪽입니다.',
        '상황의 숨은 맥락을 잘 봅니다. 대신 생각이 깊어질수록 시작이 늦어질 수 있습니다.',
        '차분한 관찰력이 강합니다. 말하지 않아도 분위기의 온도 변화를 빨리 알아차립니다.',
    ],
};

const elementLabelsKo = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' };
const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water'];

function buildReadingTone({ winner, top, saju, userProfile, daily }) {
    const spread = analyzeElementSpread(saju.elements);
    const season = getSeasonTone(userProfile.birthDate);
    const variantSeed = saju.daySeed + winner.id.length * 13 + (top[1]?.id.length || 0) * 7 + userProfile.name.length;
    const strongText = pickElementVariant(spread.strong.key, variantSeed);
    const weakText = pickElementVariant(spread.weak.key, variantSeed + 2);
    const missingText = spread.missing.length
        ? `${spread.missing.map((key) => elementLabelsKo[key]).join(', ')} 쪽이 비어 있어, 그 기운은 의식적으로 빌려와야 편합니다. 예를 들면 ${missingElementAdvice(spread.missing[0])}`
        : '완전히 비어 있는 오행은 없습니다. 대신 강한 쪽이 목소리를 크게 내면 다른 기운이 묻힐 수 있습니다.';
    const excessText = spread.excess.length
        ? `${spread.excess.map((key) => elementLabelsKo[key]).join(', ')}이 과하게 잡힙니다. 장점이 선명한 만큼 피곤할 때는 그 장점이 고집처럼 보일 수 있습니다.`
        : '특정 오행이 지나치게 몰리지는 않습니다. 이 경우에는 상황에 따라 얼굴의 인상과 생년의 기운이 번갈아 앞에 나옵니다.';
    const hourText = userProfile.birthTime === 'unknown'
        ? '출생시간이 없어 시주의 세밀한 결은 제외했습니다.'
        : `${userProfile.birthTime}에 가까운 시간대는 하루의 리듬에서 ${hourMood(userProfile.birthTime)} 쪽을 더합니다.`;
    const focusText = userProfile.focusElements
        ? `사용자가 특히 보고 싶다고 적은 “${userProfile.focusElements}”를 결과 문장에 우선 반영했습니다.`
        : '강조 항목을 따로 적지 않아, 관계와 내면 성향을 균형 있게 보았습니다.';
    const moodKeywords = createMoodKeywords(winner, spread, userProfile);

    return {
        strongLabel: elementLabelsKo[spread.strong.key],
        animalLead: `${winner.name}은 ${winner.keywords[0]}이 먼저 남는 상입니다. 여기에 ${top[1]?.name || winner.name}의 ${top[1]?.keywords[0] || winner.keywords[0]}이 섞여, 첫인상은 단순한 동물상보다 조금 더 입체적으로 보입니다.`,
        innerEssay: `${strongText} ${hourText} ${season.inner}`,
        outerInnerGap: `겉으로는 ${winner.keywords[0]}이 먼저 보이지만, 속에서는 ${elementLabelsKo[saju.dayMaster.elementKey]}의 방식으로 상황을 처리하려는 흐름이 있습니다. 그래서 처음 보는 사람과 가까운 사람이 말하는 인상이 다를 수 있습니다.`,
        strongEssay: `${strongText} 대표 동물상 ${winner.name}의 분위기와 만나면, 이 오행은 말보다 표정과 선택 방식에서 더 잘 드러납니다.`,
        weakEssay: `${weakText} 약한 오행은 단점이라기보다 덜 쓰는 근육에 가깝습니다. 필요할 때 의식적으로 꺼내 쓰면 균형이 좋아집니다.`,
        missingEssay: missingText,
        excessEssay: excessText,
        seasonEssay: season.text,
        elementSpread: elementOrder.map((key) => `${elementLabelsKo[key]} ${saju.elements[key]}`).join(' · '),
        relationEssay: `${winner.name}상은 관계에서 첫 접근보다 “시간이 지나며 남는 인상”이 중요합니다. ${spread.strong.label}이 강하게 잡혀, 사람을 대할 때도 ${relationByElement(spread.strong.key)} ${focusText}`,
        loveEssay: `${loveByElement(spread.strong.key)} ${top[1] ? `${top[1].name}의 보조 인상 때문에 가까운 사람 앞에서는 생각보다 다른 얼굴이 나올 수 있습니다.` : ''}`,
        focusEssay: `${daily.focus} ${spread.weak.label}이 약하게 잡힐 때는 집중이 안 되는 이유를 의지 부족으로만 보면 안 됩니다. 환경, 시간, 감정의 노이즈를 먼저 줄이는 편이 더 현실적입니다.`,
        moodKeywords,
        imageDirection: userProfile.moodReference
            ? `입력한 이미지 방향 “${userProfile.moodReference}”을 기준으로 보면, 이 결과는 ${moodKeywords.join(', ')} 쪽으로 정리하는 것이 잘 맞습니다.`
            : `구체적인 이미지 레퍼런스가 없어서 기본 톤은 딥네이비, 먹색, 흐릿한 달빛, 얇은 금색 라인 쪽으로 잡았습니다.`,
    };
}

function analyzeElementSpread(elements) {
    const sorted = Object.entries(elements).sort((a, b) => b[1] - a[1]);
    const strong = { key: sorted[0][0], value: sorted[0][1], label: elementLabelsKo[sorted[0][0]] };
    const weak = { key: sorted[sorted.length - 1][0], value: sorted[sorted.length - 1][1], label: elementLabelsKo[sorted[sorted.length - 1][0]] };
    return {
        strong,
        weak,
        missing: Object.entries(elements).filter(([, value]) => value === 0).map(([key]) => key),
        excess: Object.entries(elements).filter(([, value]) => value >= 3).map(([key]) => key),
    };
}

function pickElementVariant(elementKey, seed) {
    const list = elementVariantLibrary[elementKey] || elementVariantLibrary.water;
    return list[Math.abs(seed) % list.length];
}

function getSeasonTone(date) {
    if (!date) return { text: '출생월 정보가 없어 계절감은 약하게만 반영했습니다.', inner: '계절 정보는 약하게만 보았습니다.' };
    const month = date.getMonth() + 1;
    if ([3, 4, 5].includes(month)) return { text: '봄의 계절감이 있어 시작과 확장에 마음이 빨리 반응합니다.', inner: '봄 기운이 섞여 새로운 가능성에 민감합니다.' };
    if ([6, 7, 8].includes(month)) return { text: '여름의 계절감이 있어 표현과 반응 속도가 비교적 살아납니다.', inner: '여름 기운이 섞여 마음이 움직이면 티가 나는 편입니다.' };
    if ([9, 10, 11].includes(month)) return { text: '가을의 계절감이 있어 정리, 기준, 선택의 감각이 더 또렷해집니다.', inner: '가을 기운이 섞여 관계와 일에서 기준을 세우려 합니다.' };
    return { text: '겨울의 계절감이 있어 속으로 축적하고 오래 생각하는 흐름이 더 깊어집니다.', inner: '겨울 기운이 섞여 바로 말하기보다 안에서 정리하는 쪽입니다.' };
}

function hourMood(timeValue) {
    const hour = Number(timeValue.split(':')[0]);
    if (hour >= 5 && hour < 11) return '시작, 정리, 준비';
    if (hour >= 11 && hour < 17) return '표현, 활동, 외부 반응';
    if (hour >= 17 && hour < 23) return '관계, 감정 정리, 선택';
    return '내면, 관찰, 깊은 생각';
}

function missingElementAdvice(elementKey) {
    return {
        wood: '새로운 시도를 너무 늦추지 않는 것',
        fire: '마음을 말과 표정으로 조금 더 보여주는 것',
        earth: '생활 리듬과 기준을 작게라도 고정하는 것',
        metal: '거절과 선택의 선을 분명히 세우는 것',
        water: '혼자 정리할 시간과 깊은 휴식을 확보하는 것',
    }[elementKey] || '부족한 리듬을 생활 속에서 조금씩 보충하는 것';
}

function relationByElement(elementKey) {
    return {
        wood: '상대의 가능성을 먼저 보고 기다려주는 편입니다.',
        fire: '반응과 표현으로 분위기를 여는 편입니다.',
        earth: '말보다 꾸준한 행동으로 신뢰를 쌓는 편입니다.',
        metal: '예의와 기준을 중요하게 보며 천천히 가까워지는 편입니다.',
        water: '많은 사람보다 깊게 통하는 사람에게 마음을 쓰는 편입니다.',
    }[elementKey];
}

function loveByElement(elementKey) {
    return {
        wood: '연애에서는 함께 성장하는 느낌이 중요합니다. 상대가 내 세계를 넓혀준다고 느끼면 마음이 오래 갑니다.',
        fire: '연애에서는 표현의 온도가 중요합니다. 설렘이 살아 있어야 마음도 움직입니다.',
        earth: '연애에서는 안정감과 생활의 호흡이 중요합니다. 말보다 반복되는 행동에서 사랑을 확인합니다.',
        metal: '연애에서는 신뢰와 태도가 중요합니다. 마음이 있어도 먼저 상대의 기준과 책임감을 봅니다.',
        water: '연애에서는 정서적 깊이가 중요합니다. 쉽게 열리진 않아도 한 번 깊어지면 오래 마음을 씁니다.',
    }[elementKey];
}

function createMoodKeywords(winner, spread, userProfile) {
    const base = ['흐릿한 달빛', '얇은 금색 선', '먹색 배경'];
    const byElement = {
        wood: ['안개 낀 정원', '청록빛 비단'],
        fire: ['바랜 홍색', '촛불 같은 온도'],
        earth: ['오래된 종이', '차분한 황토빛'],
        metal: ['차가운 황동', '정제된 선'],
        water: ['딥네이비', '물안개'],
    };
    const requested = [userProfile.moodReference, userProfile.toneReference].filter(Boolean).join(' ');
    const extracted = requested.match(/[가-힣A-Za-z0-9#]+/g)?.slice(0, 2) || [];
    return [...new Set([...base, ...(byElement[spread.strong.key] || []), winner.keywords[0], ...extracted])].slice(0, 6);
}

function renderUserReferenceNote(profile) {
    if (!profile.moodReference && !profile.toneReference && !profile.avoidExpression && !profile.focusElements) {
        return '구체적인 레퍼런스가 적히지 않아 기본 상몽 톤으로 해석했습니다. 다음에는 색상, 배경, 문체, 피하고 싶은 표현을 적으면 결과가 더 선명해집니다.';
    }
    return [
        profile.moodReference ? `이미지 분위기: ${profile.moodReference}` : '',
        profile.toneReference ? `문체 예시: ${profile.toneReference}` : '',
        profile.avoidExpression ? `피한 표현: ${profile.avoidExpression}` : '',
        profile.focusElements ? `강조 요소: ${profile.focusElements}` : '',
    ].filter(Boolean).join(' / ');
}

function updatePromptHelper() {
    const text = [moodReferenceInput.value, toneReferenceInput.value, focusElementsInput.value].join(' ').trim();
    const vagueWords = ['좋다', '예쁘게', '느낌', '재미있게', '몽환적', '감성적'];
    const isTooVague = text.length > 0 && text.length < 18 && vagueWords.some((word) => text.includes(word));
    promptHelper.classList.toggle('is-warning', isTooVague);
    promptHelper.textContent = isTooVague
        ? '조금 더 구체적으로 적어주세요. 예: 딥네이비 배경, 흐릿한 달빛, 얇은 금색 문양, 친구가 짚어주는 짧은 문체.'
        : '색상, 배경, 질감, 문양, 문체, 피하고 싶은 표현을 함께 적으면 결과가 더 선명해집니다.';
}

function getUserProfile() {
    const birthDate = birthDateInput.value ? new Date(`${birthDateInput.value}T12:00:00`) : null;
    return {
        name: readerNameInput.value.trim() || '당신',
        birthDate: Number.isNaN(birthDate?.getTime()) ? null : birthDate,
        calendarType: calendarTypeInput.value,
        birthTime: birthTimeInput.value,
        gender: readerGenderInput.value,
        moodReference: moodReferenceInput.value.trim(),
        toneReference: toneReferenceInput.value.trim(),
        avoidExpression: avoidExpressionInput.value.trim(),
        focusElements: focusElementsInput.value.trim(),
    };
}

function renderDailyFortune(daily) {
    return [
        ['오늘의 전체 흐름', daily.flow],
        ['관계운', daily.relation],
        ['연애운', daily.love],
        ['일/학업운', daily.focus],
        ['소비운', daily.money],
        ['감정운', daily.emotion],
        ['오늘 조심하면 좋은 점', daily.caution],
        ['오늘 하면 좋은 행동', daily.action],
        ['오늘의 한마디 조언', daily.meditation],
        ['행운 키워드', daily.keyword],
        ['행운 색상', daily.color],
        ['오늘의 수호 동물', `${daily.guardian.emoji} ${daily.guardian.name}`],
    ].map(([label, value]) => `<div class="fortune-item"><strong>${label}</strong><p>${value}</p></div>`).join('');
}

function renderWeeklyFortune(weekly) {
    return [
        reportBlock('이번 주 전체 흐름', weekly.overall),
        reportBlock('주초의 분위기', weekly.earlyWeek),
        reportBlock('주중의 전환점', weekly.midWeek),
        reportBlock('주말의 흐름', weekly.weekend),
        reportBlock('관계에서 눈여겨볼 점', weekly.relation),
        reportBlock('일과 학업에서 유리한 태도', weekly.work),
        reportBlock('돈과 소비에서 조심할 점', weekly.money),
        reportBlock('이번 주의 감정 흐름', weekly.emotion),
        reportBlock('이번 주 실천하면 좋은 한 가지', weekly.choice),
        reportBlock('이번 주를 요약하는 문장', `${weekly.sentence} 이번 주 핵심 키워드는 ${weekly.keyword}이며, 상징 동물은 ${weekly.guardian.emoji} ${weekly.guardian.name}입니다. ${weekly.avoid}`),
    ].join('');
}

function reportBlock(title, body) {
    return `<section class="report-block"><h4>${title}</h4><p>${body}</p></section>`;
}

function renderTalismanCard(symbol, winner, daily, profile) {
    return `
        <div class="talisman-inner">
            <span>${winner.emoji}</span>
            <p>오늘의 상징 카드</p>
            <h4>${symbol.title}</h4>
            <strong>${profile.name} · ${daily.title}</strong>
            <small>${symbol.description}</small>
            <em>${daily.meditation}</em>
        </div>
    `;
}

async function saveReportCard(type) {
    if (!currentResult) return;
    await downloadReportCard(type, currentResult);
    showStatus(`${cardTypeLabel(type)}를 저장했습니다.`, false);
}

async function copySummary(type) {
    if (!currentResult) return;
    const summaries = createShareSummaries(currentResult);
    try {
        await copyText(summaries[type]);
        showStatus(`${summaryTypeLabel(type)}를 복사했습니다.`, false);
    } catch (error) {
        console.error(error);
        showStatus('문장을 복사하지 못했습니다. 브라우저 권한을 확인해 주세요.', true);
    }
}

async function shareSelectedReport(type) {
    if (!currentResult) return;
    try {
        const shared = await shareReport(type, currentResult);
        if (shared) showStatus(`${cardTypeLabel(type)}를 나눌 준비가 되었습니다.`, false);
    } catch (error) {
        console.error(error);
        showStatus('공유를 마치지 못했습니다. 요약 복사를 이용해 주세요.', true);
    }
}

function cardTypeLabel(type) {
    return { summary: '종합 상 리포트 카드', face: '관상 리포트 카드', saju: '사주 리포트 카드', daily: '오늘의 운세 카드' }[type] || '결과 카드';
}

function summaryTypeLabel(type) {
    return { oneLine: '한 줄 결과', face: '관상 요약', saju: '사주 요약', daily: '오늘의 운세' }[type] || '요약 문장';
}

function renderAnimalGuide() {
    animalGuideGrid.innerHTML = animalProfiles.map((animal) => `
        <button class="animal-guide-card" type="button" data-animal-id="${animal.id}" aria-label="${animal.name} 도감 열기">
            <div class="emoji">${animal.emoji}</div>
            <h3>${animal.name}</h3>
            <p><strong>${animal.archetypeTitle}</strong><br>${animal.guide}</p>
        </button>
    `).join('');
    animalGuideGrid.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => openGuideModal(button.dataset.animalId));
    });
}

function openGuideModal(id) {
    const animal = animalById[id];
    modalContent.innerHTML = `
        <div class="modal-emoji">${animal.emoji}</div>
        <h2>${animal.name}</h2>
        <p>${animal.summary}</p>
        <ul>${animal.keywords.map((keyword) => `<li>${keyword}</li>`).join('')}</ul>
        <p><strong>이런 분위기의 얼굴</strong><br>${animal.guide}</p>
        <p><strong>관상적으로 읽히는 기운</strong><br>${animal.physiognomyEnergy}</p>
        <p><strong>웃을 때 매력</strong><br>${animal.smileCharm}</p>
        <p><strong>비슷하지만 다른 유형</strong><br>${animal.difference}</p>
    `;
    guideModal.hidden = false;
}

function closeGuideModal() {
    guideModal.hidden = true;
}

function renderSelfQuiz() {
    const quizContainer = document.getElementById('self-quiz');
    if (!quizContainer) return;
    quizContainer.innerHTML = quizQuestions.map((question, questionIndex) => `
        <div class="quiz-question">
            <strong>${question.question}</strong>
            <div class="quiz-options">
                ${question.options.map((option, optionIndex) => `
                    <label><input type="radio" name="quiz-${questionIndex}" value="${option.animal}" ${optionIndex === 0 ? '' : ''}>${option.label}</label>
                `).join('')}
            </div>
        </div>
    `).join('');
    quizContainer.addEventListener('change', updateQuizResult);
}

function updateQuizResult() {
    const quizContainer = document.getElementById('self-quiz');
    const quizOutput = document.getElementById('quiz-result');
    if (!quizContainer || !quizOutput) return;
    const selected = [...quizContainer.querySelectorAll('input:checked')].map((input) => input.value);
    if (!selected.length) return;
    const counts = selected.reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
    const [topSelfId] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    const selfAnimal = animalById[topSelfId];
    const aiText = currentResult ? `사진에서 읽힌 상은 ${currentResult.winner.name}, ` : '';
    quizOutput.textContent = `${aiText}스스로 느끼는 결은 ${selfAnimal.name}에 가깝습니다. ${selfAnimal.summary}`;
}

function renderCompareResult() {
    if (!currentResult || !comparePersonResult) return;
    const a = currentResult.winner;
    const b = comparePersonResult.winner;
    const mode = compareModeInput.value;
    const shared = currentResult.top.find((animal) => comparePersonResult.top.some((other) => other.id === animal.id));
    const modeText = {
        friend: '친구 관계에서는 한 사람이 분위기를 열고 다른 사람이 안정감을 잡아줄 때 편한 케미가 생깁니다. 서로의 반응 속도가 다를 수 있으니, 서운한 마음을 쌓기보다 가볍게 말로 확인하는 편이 좋습니다.',
        lover: '연인 관계에서는 처음의 끌림만큼 생활 속 호흡이 중요합니다. 한쪽은 더 빨리 표현하고 한쪽은 더 천천히 확인할 수 있으니, 애정 표현의 방식이 다르다는 점을 이해하면 관계가 편해집니다.',
        family: '가족 관계에서는 익숙하다는 이유로 서로의 변화를 놓치기 쉽습니다. 같은 말도 상대가 받아들이기 쉬운 온도로 바꾸면 오래 쌓인 오해가 줄어들 수 있습니다.',
        colleague: '동료 관계에서는 역할과 기대치를 분명히 할수록 좋은 조합이 됩니다. 서로의 장점이 다르게 드러나는 만큼, 감정으로 추측하기보다 기준과 일정을 말로 맞추는 편이 좋습니다.',
    }[mode];
    const note = shared
        ? `두 사람의 상에는 ${shared.name}의 분위기가 함께 보입니다. 공통점이 있기 때문에 처음에는 서로를 이해하기 쉽지만, 한 사람은 ${a.name}의 ${a.keywords[0]}이 더 앞서고 다른 사람은 ${b.name}의 ${b.keywords[0]}이 더 강하게 보입니다. 비슷한 듯 다른 지점을 인정하면 편안한 궁합으로 이어질 수 있습니다. ${modeText}`
        : `두 사람의 대표 상은 다르지만, 그래서 서로에게 새로운 분위기를 줄 수 있습니다. 한쪽에는 ${a.name}의 ${a.keywords[0]}이, 다른 쪽에는 ${b.name}의 ${b.keywords[0]}이 놓여 관계 안에서 역할이 다르게 나뉠 가능성이 큽니다. 다름을 고치려 하기보다 각자의 속도와 표현 방식을 이해하는 것이 중요합니다. ${modeText}`;
    compareResult.innerHTML = `
        <div class="compare-cards">
            <div class="compare-person"><div class="emoji">${a.emoji}</div><strong>나: ${a.name}</strong><p>${a.tagline}</p></div>
            <div class="compare-person"><div class="emoji">${b.emoji}</div><strong>친구: ${b.name}</strong><p>${b.tagline}</p></div>
        </div>
        <p class="compare-note">${note}</p>
    `;
}

function saveResultCard() {
    if (!currentResult) return;
    saveReportCard('summary');
}

async function copyResultLink() {
    const text = currentResult ? `${createShareSummaries(currentResult).oneLine}\n${location.href}` : location.href;
    try {
        await navigator.clipboard.writeText(text);
        showStatus('리포트 링크를 복사했습니다.', false);
    } catch (error) {
        console.error(error);
        showStatus('링크 복사에 실패했습니다. 주소창의 URL을 직접 복사해 주세요.', true);
    }
}

async function shareResult() {
    if (!currentResult) return;
    const shared = await shareReport('summary', currentResult);
    if (shared) showStatus('관상 리포트를 나눌 준비가 되었습니다.', false);
}

function showLoading() {
    hideResult(false);
    loadingPanel.hidden = false;
    setLoadingProgress(0, loadingSteps[0]);
    showStatus('눈과 입가에 머문 결을 살피고 있습니다.', false);
}

function hideLoading() {
    window.clearInterval(loadingTimer);
    loadingPanel.hidden = true;
}

function runLoadingSequence() {
    let step = 0;
    let progress = 12;
    setLoadingProgress(progress, loadingSteps[step]);
    window.clearInterval(loadingTimer);
    loadingTimer = window.setInterval(() => {
        progress = Math.min(progress + 11, 92);
        step = Math.min(Math.floor(progress / 25), loadingSteps.length - 1);
        setLoadingProgress(progress, loadingSteps[step]);
    }, 170);
    return delay(760).then(() => setLoadingProgress(100, loadingSteps[4]));
}

function setLoadingProgress(value, text) {
    loadingPanel.style.setProperty('--progress', `${value}%`);
    loadingProgress.textContent = `${value}%`;
    loadingStep.textContent = text;
    progressBar.style.width = `${value}%`;
}

function hideResult(clear = true) {
    if (clear) currentResult = null;
    resultPanel.hidden = true;
}

function handleAnalyzeError(error) {
    if (error.message === 'NO_FACE') {
        showStatus('얼굴의 윤곽이 맺히지 않았습니다. 밝은 정면 사진으로 다시 시도해 주세요.', true);
    } else if (error.message === 'MULTIPLE_FACES') {
        showStatus('여러 얼굴의 기운이 함께 잡혔습니다. 한 명만 선명하게 나온 사진을 사용해 주세요.', true);
    } else {
        showStatus('리포트를 펼치지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.', true);
    }
}

function showStatus(message, isError) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('is-error', isError);
}

function drawAnalysisOverlay(target, landmarks, source) {
    const canvas = target === 'compare' ? compareOverlay : analysisOverlay;
    const badge = target === 'compare' ? compareBadge : analysisBadge;
    const media = target === 'compare' ? compareImage : imagePreview;

    if (!canvas || !landmarks || !media) return;

    const rect = media.getBoundingClientRect();
    const sourceWidth = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth;
    const sourceHeight = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight;
    const displayRatio = Math.min(rect.width / sourceWidth, rect.height / sourceHeight);
    const drawWidth = sourceWidth * displayRatio;
    const drawHeight = sourceHeight * displayRatio;
    const offsetX = (rect.width - drawWidth) / 2;
    const offsetY = (rect.height - drawHeight) / 2;

    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height));
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = landmarks.map((point) => ({
        x: offsetX + point.x * drawWidth,
        y: offsetY + point.y * drawHeight,
    }));
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    ctx.strokeStyle = 'rgba(255, 216, 128, 0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    roundRect(ctx, minX - 10, minY - 14, maxX - minX + 20, maxY - minY + 28, 26);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    [33, 133, 263, 362, 61, 291, 10, 152, 234, 454].forEach((index) => {
        const point = points[index];
        if (!point) return;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
    });

    badge.hidden = false;
}

function clearAnalysisOverlay(target = 'main') {
    const canvas = target === 'compare' ? compareOverlay : analysisOverlay;
    const badge = target === 'compare' ? compareBadge : analysisBadge;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    if (badge) badge.hidden = true;
}

function clearMainImage() {
    capturedCanvas = null;
    imageUpload.value = '';
    imagePreview.removeAttribute('src');
    clearAnalysisOverlay('main');
    previewPanel.hidden = true;
    hideResult();
    shareOneLine.textContent = '결과를 만들면 이곳에 공유 문장이 펼쳐집니다.';
    showStatus('얼굴을 비웠습니다. 새 사진을 올려주세요.', false);
}

function resetTester() {
    stopCamera();
    capturedCanvas = null;
    compareCanvas = null;
    currentResult = null;
    comparePersonResult = null;
    imageUpload.value = '';
    compareUpload.value = '';
    imagePreview.removeAttribute('src');
    compareImage.removeAttribute('src');
    clearAnalysisOverlay('main');
    clearAnalysisOverlay('compare');
    previewPanel.hidden = true;
    comparePreview.hidden = true;
    cameraPanel.hidden = true;
    comparePanel.hidden = true;
    compareResult.innerHTML = '';
    shareOneLine.textContent = '결과를 만들면 이곳에 공유 문장이 펼쳐집니다.';
    hideLoading();
    hideResult();
    analyzeButton.disabled = false;
    showStatus('얼굴 이미지는 저장되지 않으며, 브라우저 안에서만 상을 읽습니다.', false);
    document.getElementById('start-test').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stopCamera() {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
}

function waitForImageReady(source) {
    if (source instanceof HTMLCanvasElement) return Promise.resolve();
    if (source.complete && source.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
        source.onload = resolve;
        source.onerror = reject;
    });
}

function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
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
