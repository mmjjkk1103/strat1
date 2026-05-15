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

const animalById = Object.fromEntries(animalProfiles.map((animal) => [animal.id, animal]));
const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const loadingSteps = [
    '얼굴의 윤곽을 살펴보고 있습니다...',
    '눈과 입에 머문 인상을 읽고 있습니다...',
    '생년월일의 흐름을 조합하고 있습니다...',
    '오늘의 기운과 당신의 상을 맞춰보고 있습니다...',
    '해석을 완성했습니다.',
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
    setTheme(localStorage.getItem('theme') || 'light');
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
        showStatus('jpg, jpeg, png, webp 형식의 사진을 업로드해주세요.', true);
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
        showStatus('친구 사진이 준비되었습니다. 친구 결과 분석을 눌러주세요.', false);
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
    showStatus('사진이 준비되었습니다. AI 분석 시작을 눌러주세요.', false);
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
        showStatus(target === 'compare' ? '친구 얼굴이 프레임 중앙에 들어오면 촬영해주세요.' : '얼굴이 프레임 중앙에 들어오면 촬영하기를 눌러주세요.', false);
    } catch (error) {
        console.error(error);
        cameraPanel.hidden = true;
        showStatus('카메라 권한이 거부되었거나 사용할 수 없습니다. 브라우저 권한과 HTTPS 접속 상태를 확인해 주세요.', true);
    }
}

function capturePhoto() {
    if (!cameraVideo.videoWidth) {
        showStatus('카메라 화면이 준비된 뒤 다시 촬영해주세요.', true);
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
        showStatus('친구 사진이 준비되었습니다. 친구 결과 분석을 눌러주세요.', false);
        comparePanel.hidden = false;
        comparePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    capturedCanvas = canvas;
    clearAnalysisOverlay('main');
    imagePreview.src = canvas.toDataURL('image/png');
    previewPanel.hidden = false;
    showStatus('촬영한 사진이 준비되었습니다. AI 분석 시작을 눌러주세요.', false);
}

async function analyzeCurrentImage(target) {
    const isCompare = target === 'compare';
    const source = isCompare ? (compareCanvas || compareImage) : (capturedCanvas || imagePreview);
    const button = isCompare ? analyzeCompareButton : analyzeButton;
    const userProfile = getUserProfile();

    if (!source || (!isCompare && !capturedCanvas && !imagePreview.src) || (isCompare && !compareCanvas && !compareImage.src)) {
        showStatus(isCompare ? '비교할 친구 사진을 먼저 준비해주세요.' : '분석할 사진을 먼저 준비해주세요.', true);
        return;
    }

    if (!isCompare && !userProfile.birthDate) {
        showStatus('생년월일을 입력하면 관상과 생년 흐름을 함께 읽을 수 있습니다.', true);
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
            showStatus('친구 결과 분석이 완료되었습니다.', false);
        } else {
            currentResult = analysis;
            renderResult(analysis);
            showStatus('분석이 완료되었습니다. 결과 카드를 저장하거나 친구와 비교해보세요.', false);
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
    winnerCard.innerHTML = `
        <div class="winner-main">
            <div class="winner-emoji">${winner.emoji}</div>
            <p class="winner-label">당신의 대표 동물상</p>
            <h2>당신은 ${winner.name}입니다</h2>
            <p class="winner-percent">가장 높은 일치도 ${winner.percent}%</p>
            <p class="winner-message">${symbol.title}. ${winner.tagline}. ${winner.resultMessage}</p>
            <div class="keyword-row">${winner.keywords.map((keyword) => `<span>${keyword}</span>`).join('')}</div>
        </div>
    `;

    const comments = buildFeatureComments(winner, top, features);
    featureComments.innerHTML = comments.slice(0, 3).map((comment) => `<p>${comment}</p>`).join('');
    featureSummary.textContent = `이러한 특징이 ${top.map((animal) => animal.name).join('·')} 계열 점수를 높였습니다.`;

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
    integrationReading.innerHTML = renderIntegratedReading(winner, partAnimals, saju, features);
    dailyFortune.innerHTML = renderDailyFortune(daily);
    weeklyFortune.innerHTML = renderWeeklyFortune(weekly);
    talismanCard.innerHTML = renderTalismanCard(symbol, winner, daily, userProfile);

    compatibilityList.innerHTML = `
        ${winner.compat.map((id) => {
            const animal = animalById[id];
            return `<div class="compat-chip"><span>${animal.emoji}</span><span>${animal.name}</span></div>`;
        }).join('')}
        <p class="combo-summary">${winner.compatText}</p>
    `;

    quizResult.textContent = '질문을 선택하면 AI가 읽은 상과 내가 생각하는 분위기를 함께 비교해드립니다.';
    resultPanel.hidden = false;
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestAnimationFrame(() => {
        scoreList.querySelectorAll('.score-bar span').forEach((bar) => {
            bar.style.width = bar.dataset.width;
        });
    });
}

function buildFeatureComments(winner, top, features) {
    const activeFeatures = Object.entries(winner.weights)
        .filter(([, weight]) => weight > 0)
        .sort((a, b) => (features[b[0]] ?? 0) * b[1] - (features[a[0]] ?? 0) * a[1])
        .slice(0, 2)
        .map(([feature]) => featureLabels[feature])
        .filter(Boolean);
    const comments = [...winner.commentTemplates];
    if (activeFeatures.length) comments.splice(1, 0, `${activeFeatures.join(', ')} 특징이 특히 두드러지게 계산됐습니다.`);
    comments.push(`따라서 ${top.map((animal) => animal.name).join(', ')} 점수가 높게 나타났습니다.`);
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

    if (sharpCount >= 2) return `${first.name} + ${second.name} + ${third.name} 조합은 선명한 눈매와 존재감이 중심을 이루며, 차분하지만 강한 인상이 남는 카리스마형 조합입니다.`;
    if (softCount >= 2 && activeCount >= 1) return `${first.name} + ${second.name} + ${third.name} 조합은 밝고 친근한 인상이 강하며, 귀여움과 부드러운 분위기가 함께 나타나는 조합입니다.`;
    if (ids.includes('horse') || ids.includes('camel')) return `${first.name} + ${second.name} + ${third.name} 조합은 시원한 비율과 차분한 분위기가 섞여 단정하고 여유로운 인상을 만듭니다.`;
    return `${first.name} + ${second.name} + ${third.name} 조합은 한 가지 분위기에 치우치기보다 친근함, 선명함, 개성이 균형 있게 섞인 타입입니다.`;
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
        ['일/학업운', daily.focus],
        ['감정운', daily.emotion],
        ['소비운', daily.money],
        ['조심 포인트', daily.caution],
        ['추천 행동', daily.action],
        ['행운 키워드', daily.keyword],
        ['행운 색상', daily.color],
        ['오늘의 수호 동물', `${daily.guardian.emoji} ${daily.guardian.name}`],
        ['오늘의 마음 수행', daily.meditation],
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
    const aiText = currentResult ? `AI가 본 당신은 ${currentResult.winner.name}, ` : '';
    quizResult.textContent = `${aiText}내가 생각하는 나는 ${selfAnimal.name}에 가깝습니다. ${selfAnimal.summary}`;
}

function renderCompareResult() {
    if (!currentResult || !comparePersonResult) return;
    const a = currentResult.winner;
    const b = comparePersonResult.winner;
    const mode = compareModeInput.value;
    const shared = currentResult.top.find((animal) => comparePersonResult.top.some((other) => other.id === animal.id));
    const modeText = {
        friend: '친구 사이에서는 서로의 텐션과 회복 속도를 존중하는 것이 좋습니다.',
        lover: '연인 사이에서는 끌림만큼 속도 조율이 중요합니다.',
        family: '가족 사이에서는 익숙함 때문에 생략한 말을 다시 부드럽게 꺼내는 것이 좋습니다.',
        colleague: '동료 사이에서는 역할과 기준을 분명히 할수록 좋은 조합이 됩니다.',
    }[mode];
    const note = shared
        ? `두 사람 모두 ${shared.name} 계열의 분위기가 일부 겹칩니다. 한 사람은 ${a.name}의 ${a.keywords[0]}이, 다른 사람은 ${b.name}의 ${b.keywords[0]}이 더 크게 나타납니다. ${modeText}`
        : `두 사람의 1위 동물상은 다르지만, 한 사람은 ${a.name} 특유의 ${a.keywords[0]}이 강하고 다른 사람은 ${b.name} 특유의 ${b.keywords[0]}이 강해 서로 다른 매력이 보입니다. ${modeText}`;
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
    const { winner, symbol, daily, userProfile } = currentResult;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1440);
    gradient.addColorStop(0, '#fff9eb');
    gradient.addColorStop(0.55, '#ffd0b6');
    gradient.addColorStop(1, '#ffc857');
    ctx.fillStyle = gradient;
    roundRect(ctx, 0, 0, 1080, 1440, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.46)';
    roundRect(ctx, 72, 72, 936, 1296, 64);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2b1c17';
    ctx.font = '72px sans-serif';
    ctx.fillText('상결', 540, 180);
    ctx.font = '180px sans-serif';
    ctx.fillText(winner.emoji, 540, 405);
    ctx.font = '86px sans-serif';
    ctx.fillText(symbol.title, 540, 570);
    ctx.font = '56px sans-serif';
    ctx.fillText(`${userProfile.name} · ${winner.name} ${winner.percent}%`, 540, 660);
    drawWrappedText(ctx, daily.title, 540, 790, 760, 54);
    ctx.font = '42px sans-serif';
    drawWrappedText(ctx, symbol.description, 540, 930, 780, 54);
    ctx.font = '38px sans-serif';
    drawWrappedText(ctx, daily.meditation, 540, 1160, 760, 48);
    ctx.fillText('AI physiognomy reading', 540, 1300);

    const link = document.createElement('a');
    link.download = `animal-face-${winner.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

async function copyResultLink() {
    const text = currentResult ? `나는 ${currentResult.winner.name}! ${location.href}` : location.href;
    try {
        await navigator.clipboard.writeText(text);
        showStatus('결과 링크를 복사했습니다.', false);
    } catch (error) {
        console.error(error);
        showStatus('링크 복사에 실패했습니다. 주소창의 URL을 직접 복사해 주세요.', true);
    }
}

async function shareResult() {
    if (!currentResult) return;
    const shareData = {
        title: '동물상 AI 얼굴 분석',
        text: `나는 ${currentResult.winner.name}! 일치도 ${currentResult.winner.percent}%가 나왔어요.`,
        url: location.href,
    };
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error(error);
        }
    }
    await copyResultLink();
}

function showLoading() {
    hideResult(false);
    loadingPanel.hidden = false;
    setLoadingProgress(0, loadingSteps[0]);
    showStatus('분석 중입니다. 잠시만 기다려 주세요.', false);
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
        showStatus('얼굴이 감지되지 않았습니다. 밝은 정면 사진으로 다시 시도해 주세요.', true);
    } else if (error.message === 'MULTIPLE_FACES') {
        showStatus('여러 명의 얼굴이 감지되었습니다. 한 명만 선명하게 나온 사진을 사용해 주세요.', true);
    } else {
        showStatus('분석 모델을 불러오거나 결과를 계산하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.', true);
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
    showStatus('이미지를 삭제했습니다. 새 사진을 선택해주세요.', false);
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
    hideLoading();
    hideResult();
    analyzeButton.disabled = false;
    showStatus('분석한 이미지는 저장되지 않으며, 브라우저 내 분석에만 사용됩니다.', false);
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

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    words.forEach((word) => {
        const testLine = `${line}${word} `;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line.trim(), x, currentY);
            line = `${word} `;
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    });
    if (line) ctx.fillText(line.trim(), x, currentY);
}
