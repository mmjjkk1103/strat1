import { animalProfiles, featureLabels, quizQuestions } from './animal-data.js';
import { detectFaceLandmarks } from './faceLandmark.js';
import { extractFaceFeatures as extractLandmarkFeatures } from './faceFeatureExtraction.js';
import { calculateAnimalScores as scoreAnimalTypes, calculatePartAnimals as scorePartAnimals } from './animalTypeScoring.js';
import { renderPartAnimals as renderPartAnimalReport, renderPhysiognomyReport as renderFaceReadingReport } from './physiognomyInterpretation.js';
import { createSajuProfile } from './sajuCalculation.js';
import { createSymbolicAnimalName as createSajuSymbol, renderSajuReport as renderSajuProfileReport } from './sajuInterpretation.js';
import { createDailyFortune as createRuleDailyFortune } from './dailyFortune.js';
import { createWeeklyFortune as createRuleWeeklyFortune } from './weeklyFortune.js';
import { renderIntegrationReport as renderIntegratedReading } from './integratedReading.js';
import { copyText, createShareSummaries, downloadReportCard, shareReport } from './shareCards.js';

const animalById = Object.fromEntries(animalProfiles.map((animal) => [animal.id, animal]));
const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const loadingSteps = [
    '눈과 입가에 머문 결을 살피고 있습니다...',
    '얼굴의 윤곽과 기운의 방향을 맞추고 있습니다...',
    '태어난 날의 흐름을 사주팔자에 얹고 있습니다...',
    '오늘의 기운과 당신의 상을 겹쳐 읽고 있습니다...',
    '운세첩을 가지런히 펼쳤습니다.',
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
const loadingPanel = document.getElementById('loading-panel');
const loadingStep = document.getElementById('loading-step');
const loadingProgress = document.getElementById('loading-progress');
const progressBar = document.getElementById('progress-bar');
const resultPanel = document.getElementById('result-panel');
const winnerCard = document.getElementById('winner-card');
const featureComments = document.getElementById('feature-comments');
const featureSummary = document.getElementById('feature-summary');
const topThree = document.getElementById('top-three');
const comboSummary = document.getElementById('combo-summary');
const scoreList = document.getElementById('score-list');
const resultDetail = document.getElementById('result-detail');
const partReading = document.getElementById('part-reading');
const sajuReading = document.getElementById('saju-reading');
const gyeokReading = document.getElementById('gyeok-reading');
const integrationReading = document.getElementById('integration-reading');
const dailyFortune = document.getElementById('daily-fortune');
const weeklyFortune = document.getElementById('weekly-fortune');
const talismanCard = document.getElementById('talisman-card');
const compatibilityList = document.getElementById('compatibility-list');
const selfQuiz = document.getElementById('self-quiz');
const quizResult = document.getElementById('quiz-result');
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
    renderSelfQuiz();
    bindEvents();
}

function bindEvents() {
    themeButtons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.theme)));
    imageUpload.addEventListener('change', (event) => handleImageFile(event.target.files[0], 'main'));
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
    winnerCard.innerHTML = `
        <div class="winner-main">
            <div class="winner-emoji">${winner.emoji}</div>
            <p class="winner-label">대표로 드러난 상</p>
            <h2>${userProfile.name}의 상은 ${winner.name}</h2>
            <p class="winner-percent">가장 깊게 닿은 결 ${winner.percent}%</p>
            <p class="winner-message">${symbol.title}. ${winner.resultMessage}</p>
            <div class="keyword-row">${winner.keywords.map((keyword) => `<span>${keyword}</span>`).join('')}</div>
        </div>
    `;

    const comments = buildFeatureComments(winner, top, features);
    featureComments.innerHTML = comments.slice(0, 3).map((comment) => `<p>${comment}</p>`).join('');
    featureSummary.textContent = `이 결들이 ${top.map((animal) => animal.name).join('·')}의 상을 앞으로 불러냈습니다.`;

    topThree.innerHTML = top.map((animal, index) => `
        <div class="top-item">
            <span class="top-rank">${index + 1}위</span>
            <span class="top-animal">${animal.emoji} ${animal.name}</span>
            <strong>${animal.percent}%</strong>
        </div>
    `).join('');
    comboSummary.textContent = buildComboSummary(top);

    scoreList.innerHTML = scores.map((animal, index) => `
        <div class="score-row ${index < 3 ? 'is-top' : ''}">
            <div class="score-head"><span>${index + 1}. ${animal.emoji} ${animal.name}</span><strong>${animal.percent}%</strong></div>
            <div class="score-bar"><span data-width="${animal.percent}%"></span></div>
        </div>
    `).join('');

    partReading.innerHTML = renderPartAnimalReport(partAnimals);
    resultDetail.innerHTML = renderFaceReadingReport(winner, partAnimals, features);
    sajuReading.innerHTML = renderSajuProfileReport(saju);
    gyeokReading.innerHTML = renderGyeokReference(saju, partAnimals);
    integrationReading.innerHTML = renderIntegratedReading(winner, partAnimals, saju, features);
    dailyFortune.innerHTML = renderDailyFortune(daily);
    weeklyFortune.innerHTML = renderWeeklyFortune(weekly);
    talismanCard.innerHTML = renderTalismanCard(symbol, winner, daily, userProfile);
    shareOneLine.textContent = shareSummaries.oneLine;

    compatibilityList.innerHTML = `
        ${winner.compat.map((id) => {
            const animal = animalById[id];
            return `<div class="compat-chip"><span>${animal.emoji}</span><span>${animal.name}</span></div>`;
        }).join('')}
        <p class="combo-summary">${winner.compatText}</p>
    `;

    quizResult.textContent = '문항을 고르면 스스로 느끼는 상과 사진에서 읽힌 상을 나란히 비춰봅니다.';
    resultPanel.hidden = false;
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestAnimationFrame(() => {
        scoreList.querySelectorAll('.score-bar span').forEach((bar) => {
            bar.style.width = bar.dataset.width;
        });
    });
}

function renderGyeokReference(saju, partAnimals) {
    if (!saju.gyeokguk) {
        return '<p><strong>격국 참고</strong><br>생년월일이 없으면 월령의 그릇을 따로 세우지 않습니다. 태어난 날을 더하면 사주의 격국과 관상의 접점을 함께 살필 수 있습니다.</p>';
    }
    const { gyeokguk } = saju;
    if (!gyeokguk.reference) {
        return `
            <p><strong>${gyeokguk.name} · 월령의 그릇</strong><br>${gyeokguk.basis} 현재 제공된 연구 자료는 정인격과 식신격을 중심으로 정리되어, 이 격국은 기본 사주 리포트 안에서만 참고합니다.</p>
            <p><strong>관상과의 대조</strong><br>사진에서는 눈의 상이 ${partAnimals.eyes.name}, 입의 상이 ${partAnimals.mouth.name}, 윤곽의 상이 ${partAnimals.outline.name}으로 읽혔습니다. 이후 격국별 자료가 늘어나면 이 자리에 더 정밀한 대조가 더해집니다.</p>
        `;
    }
    const reference = gyeokguk.reference;
    const traits = reference.traits.slice(0, 4).map(([label, value]) => `${label} ${value}`).join(' · ');
    return `
        <p><strong>${reference.name} · ${reference.title}</strong><br>${gyeokguk.basis} ${reference.interpretation}</p>
        <p><strong>연구에서 본 얼굴의 결</strong><br>${traits}</p>
        <p><strong>현재 리포트와의 접점</strong><br>사진에서는 눈의 상이 ${partAnimals.eyes.name}, 입의 상이 ${partAnimals.mouth.name}, 윤곽의 상이 ${partAnimals.outline.name}으로 읽혔습니다. 격국의 경향과 실제 얼굴 특징이 겹치는 지점을 참고 자료로 비춰봅니다.</p>
    `;
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
    comments.push(`그래서 ${top.map((animal) => animal.name).join(', ')}의 기운이 앞자리에 놓였습니다.`);
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

    if (sharpCount >= 2) return `${first.name} + ${second.name} + ${third.name}의 조합은 눈매 끝과 윤곽선에서 먼저 살아납니다. 조용히 있어도 오래 남는 상입니다.`;
    if (softCount >= 2 && activeCount >= 1) return `${first.name} + ${second.name} + ${third.name}의 조합은 밝은 빛과 부드러운 결이 함께 놓입니다. 사람의 경계를 누그러뜨리는 상입니다.`;
    if (ids.includes('horse') || ids.includes('camel')) return `${first.name} + ${second.name} + ${third.name}의 조합은 긴 호흡과 차분한 여백을 품습니다. 서두르지 않을수록 품이 드러납니다.`;
    return `${first.name} + ${second.name} + ${third.name}의 조합은 한 가지 기운에 머물지 않고, 부드러움과 선명함이 번갈아 드러나는 상입니다.`;
}

function getUserProfile() {
    const birthDate = birthDateInput.value ? new Date(`${birthDateInput.value}T12:00:00`) : null;
    return {
        name: readerNameInput.value.trim() || '당신',
        birthDate: Number.isNaN(birthDate?.getTime()) ? null : birthDate,
        calendarType: calendarTypeInput.value,
        birthTime: birthTimeInput.value,
        gender: readerGenderInput.value,
    };
}

function renderDailyFortune(daily) {
    return [
        ['오늘의 흐름', daily.flow],
        ['관계운', daily.relation],
        ['일운과 학업운', daily.focus],
        ['감정운', daily.emotion],
        ['소비운', daily.money],
        ['조심할 결', daily.caution],
        ['오늘의 작은 행', daily.action],
        ['행운 키워드', daily.keyword],
        ['행운 색상', daily.color],
        ['오늘의 수호 동물', `${daily.guardian.emoji} ${daily.guardian.name}`],
        ['오늘의 한 문장', daily.meditation],
    ].map(([label, value]) => `<div class="fortune-item"><strong>${label}</strong><p>${value}</p></div>`).join('');
}

function renderWeeklyFortune(weekly) {
    return [
        `<p><strong>이번 주 핵심 키워드</strong><br>${weekly.keyword}</p>`,
        `<p><strong>관계 흐름</strong><br>${weekly.relation}</p>`,
        `<p><strong>일/학업 흐름</strong><br>${weekly.work}</p>`,
        `<p><strong>감정 흐름</strong><br>${weekly.emotion}</p>`,
        `<p><strong>선택의 태도</strong><br>${weekly.choice}</p>`,
        `<p><strong>피하면 좋은 습관</strong><br>${weekly.avoid}</p>`,
        `<p><strong>이번 주 상징 동물</strong><br>${weekly.guardian.emoji} ${weekly.guardian.name}</p>`,
        `<p><strong>이번 주 문장</strong><br>${weekly.sentence}</p>`,
    ].join('');
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
    selfQuiz.innerHTML = quizQuestions.map((question, questionIndex) => `
        <div class="quiz-question">
            <strong>${question.question}</strong>
            <div class="quiz-options">
                ${question.options.map((option, optionIndex) => `
                    <label><input type="radio" name="quiz-${questionIndex}" value="${option.animal}" ${optionIndex === 0 ? '' : ''}>${option.label}</label>
                `).join('')}
            </div>
        </div>
    `).join('');
    selfQuiz.addEventListener('change', updateQuizResult);
}

function updateQuizResult() {
    const selected = [...selfQuiz.querySelectorAll('input:checked')].map((input) => input.value);
    if (!selected.length) return;
    const counts = selected.reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
    const [topSelfId] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    const selfAnimal = animalById[topSelfId];
    const aiText = currentResult ? `사진에서 읽힌 상은 ${currentResult.winner.name}, ` : '';
    quizResult.textContent = `${aiText}스스로 느끼는 결은 ${selfAnimal.name}에 가깝습니다. ${selfAnimal.summary}`;
}

function renderCompareResult() {
    if (!currentResult || !comparePersonResult) return;
    const a = currentResult.winner;
    const b = comparePersonResult.winner;
    const mode = compareModeInput.value;
    const shared = currentResult.top.find((animal) => comparePersonResult.top.some((other) => other.id === animal.id));
    const modeText = {
        friend: '벗의 인연에서는 서로의 속도를 억지로 맞추기보다, 각자의 쉼을 인정할 때 결이 맑아집니다.',
        lover: '연인의 인연에서는 끌림만큼 호흡이 중요합니다. 급히 다가서기보다 같은 달을 보는 시간이 필요합니다.',
        family: '가족의 인연에서는 익숙함에 묻힌 말을 다시 곱게 꺼낼 때 막힌 기운이 풀립니다.',
        colleague: '함께 일하는 인연에서는 역할의 선을 분명히 할수록 서로의 기운이 부딪히지 않습니다.',
    }[mode];
    const note = shared
        ? `두 사람의 상에는 ${shared.name}의 결이 함께 머뭅니다. 한 사람은 ${a.name}의 ${a.keywords[0]}이, 다른 사람은 ${b.name}의 ${b.keywords[0]}이 더 앞에 놓입니다. ${modeText}`
        : `두 사람의 대표 상은 다르지만, 한쪽에는 ${a.name}의 ${a.keywords[0]}이, 다른 쪽에는 ${b.name}의 ${b.keywords[0]}이 놓여 서로 다른 바람을 만듭니다. ${modeText}`;
    compareResult.innerHTML = `
        <div class="compare-cards">
            <div class="compare-person"><div class="emoji">${a.emoji}</div><strong>나: ${a.name}</strong><p>${a.percent}% · ${a.tagline}</p></div>
            <div class="compare-person"><div class="emoji">${b.emoji}</div><strong>친구: ${b.name}</strong><p>${b.percent}% · ${b.tagline}</p></div>
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
