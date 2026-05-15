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

    partReading.innerHTML = renderPartAnimalReport(partAnimals, features);
    resultDetail.innerHTML = `
        <details class="report-disclosure" open>
            <summary>${winner.emoji} ${winner.name} 상세 리포트</summary>
            ${renderAnimalTypeReport(winner)}
        </details>
        <details class="report-disclosure" open>
            <summary>관상 총평</summary>
            ${renderFaceReadingReport(winner, partAnimals, features)}
        </details>
    `;
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
        return reportBlock('격국 참고', '생년월일 정보가 없으면 격국 참고 해석은 생략됩니다. 태어난 날을 입력하면 사주의 기본 기질과 얼굴에서 보이는 인상을 함께 비교해볼 수 있습니다.');
    }
    const { gyeokguk } = saju;
    if (!gyeokguk.reference) {
        return `
            ${reportBlock(`${gyeokguk.name} 참고`, `${gyeokguk.basis} 이 항목은 전문 사주 용어를 그대로 풀이하기보다, 태어난 달의 흐름이 기본 성향을 어떻게 도와주는지 가볍게 참고하는 영역입니다. 현재 자세한 연구 자료가 있는 격국은 일부라서, 이 결과는 기본 사주 리포트의 보조 설명으로 보는 것이 좋습니다.`)}
            ${reportBlock('관상과의 대조', `사진에서는 눈의 인상이 ${partAnimals.eyes.name}, 입과 웃음의 인상이 ${partAnimals.mouth.name}, 윤곽의 인상이 ${partAnimals.outline.name}으로 읽혔습니다. 이 조합은 겉으로 보이는 첫인상과 사주가 말하는 기본 기질이 어디서 만나고 어디서 다르게 보이는지 살피기 위한 참고 자료입니다.`)}
        `;
    }
    const reference = gyeokguk.reference;
    const traits = reference.traits.slice(0, 4).map(([label, value]) => `${label} ${value}`).join(' · ');
    return `
        ${reportBlock(`${reference.name} 참고`, `${gyeokguk.basis} ${reference.interpretation} 이 설명은 성격을 단정하기보다, 반복해서 나타날 수 있는 태도와 관계 방식을 이해하기 위한 보조 해석입니다.`)}
        ${reportBlock('연구 자료에서 본 얼굴 특징', `${traits}. 이 값들은 얼굴 특징과 격국 자료를 비교한 참고 지표이며, 실제 인상은 표정과 분위기에 따라 달라질 수 있습니다.`)}
        ${reportBlock('현재 리포트와의 접점', `사진에서는 눈의 인상이 ${partAnimals.eyes.name}, 입과 웃음의 인상이 ${partAnimals.mouth.name}, 윤곽의 인상이 ${partAnimals.outline.name}으로 읽혔습니다. 격국의 경향과 실제 얼굴 특징이 겹치는 지점을 보면, 겉으로 보이는 이미지와 타고난 기질이 어떻게 함께 작동하는지 더 입체적으로 볼 수 있습니다.`)}
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

    const base = `${first.name}이 가장 앞에 있고, ${second.name}과 ${third.name}이 뒤에서 분위기를 보태는 조합입니다. `;
    if (sharpCount >= 2) return `${base}이 조합은 눈매와 윤곽에서 선명함이 먼저 살아나 조용히 있어도 존재감이 남기 쉽습니다. 사람들은 당신을 쉽게 휩쓸리지 않는 사람, 자기 기준이 있는 사람으로 볼 수 있습니다. 다만 첫인상이 강하게 느껴질 수 있으니 편한 자리에서는 표정과 말투를 조금 부드럽게 열어두면 매력이 더 잘 전달됩니다.`;
    if (softCount >= 2 && activeCount >= 1) return `${base}부드러운 인상과 밝은 에너지가 함께 있어 사람의 경계를 낮추는 힘이 큽니다. 처음 만난 사람도 당신을 어렵게 느끼기보다 편하게 다가갈 가능성이 높습니다. 다만 늘 괜찮고 밝아 보이면 내 피로가 늦게 보일 수 있으니, 가까운 사람에게는 힘든 마음도 조금씩 드러내는 것이 좋습니다.`;
    if (ids.includes('horse') || ids.includes('camel')) return `${base}긴 호흡과 차분한 분위기가 강해 빨리 소비되는 인상보다 시간이 지날수록 더 안정적으로 보입니다. 처음에는 조금 느긋하거나 조용해 보여도, 오래 볼수록 생각이 깊고 쉽게 흔들리지 않는 사람으로 느껴질 수 있습니다. 중요한 관계에서는 반응을 너무 늦추지 않고 관심을 표현하면 장점이 더 잘 살아납니다.`;
    return `${base}한 가지 분위기로만 고정되지 않고 부드러움과 선명함, 밝음과 차분함이 번갈아 드러납니다. 그래서 상황에 따라 사람들에게 다른 매력을 남길 수 있습니다. 이 조합은 처음엔 편안하게 보이다가 가까워질수록 생각보다 입체적인 사람이라는 느낌을 줄 가능성이 큽니다.`;
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
