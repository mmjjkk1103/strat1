
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/yIAiej9rC/';

const themeButtons = document.querySelectorAll('.theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
const startCameraButton = document.getElementById('start-camera');
const webcamContainer = document.getElementById('webcam-container');
const labelContainer = document.getElementById('label-container');
const moodResult = document.querySelector('.mood-result');
const moodEmoji = document.getElementById('mood-emoji');
const moodTitle = document.getElementById('mood-title');
const moodConfidence = document.getElementById('mood-confidence');

let model;
let webcam;
let maxPredictions = 0;
let isRunning = false;

setTheme(savedTheme);

themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setTheme(button.dataset.theme);
    });
});

startCameraButton.addEventListener('click', initMoodChecker);

function setTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);

    themeButtons.forEach((button) => {
        const isActive = button.dataset.theme === theme;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

async function initMoodChecker() {
    if (isRunning) {
        return;
    }

    startCameraButton.disabled = true;
    startCameraButton.textContent = '모델 불러오는 중...';
    moodTitle.textContent = 'AI 모델을 준비하고 있어요';
    moodConfidence.textContent = '잠시만 기다려 주세요.';

    try {
        const modelURL = MODEL_URL + 'model.json';
        const metadataURL = MODEL_URL + 'metadata.json';

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        webcam = new tmImage.Webcam(260, 260, true);
        await webcam.setup();
        await webcam.play();

        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
        createPredictionRows();

        isRunning = true;
        startCameraButton.textContent = '분석 중';
        moodTitle.textContent = '표정을 분석하고 있어요';
        moodConfidence.textContent = '카메라를 바라보고 자연스럽게 표정을 지어 주세요.';
        window.requestAnimationFrame(loop);
    } catch (error) {
        console.error(error);
        startCameraButton.disabled = false;
        startCameraButton.textContent = '다시 시작';
        moodEmoji.textContent = '⚠️';
        moodTitle.textContent = '카메라를 시작할 수 없습니다';
        moodConfidence.textContent = '브라우저 카메라 권한과 HTTPS 접속 상태를 확인해 주세요.';
    }
}

async function loop() {
    if (!isRunning) {
        return;
    }

    webcam.update();
    await predictMood();
    window.requestAnimationFrame(loop);
}

async function predictMood() {
    const predictions = await model.predict(webcam.canvas);
    const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
    const topPrediction = sortedPredictions[0];

    updateMoodResult(topPrediction);
    updatePredictionRows(predictions);
}

function createPredictionRows() {
    labelContainer.innerHTML = '';

    for (let index = 0; index < maxPredictions; index += 1) {
        const row = document.createElement('div');
        row.className = 'prediction-row';
        row.innerHTML = `
            <span class="prediction-name"></span>
            <span class="prediction-percent">0%</span>
            <span class="prediction-bar"><span class="prediction-fill"></span></span>
        `;
        labelContainer.appendChild(row);
    }
}

function updatePredictionRows(predictions) {
    predictions.forEach((prediction, index) => {
        const row = labelContainer.children[index];
        const percent = Math.round(prediction.probability * 100);

        row.querySelector('.prediction-name').textContent = formatClassName(prediction.className);
        row.querySelector('.prediction-percent').textContent = `${percent}%`;
        row.querySelector('.prediction-fill').style.width = `${percent}%`;
    });
}

function updateMoodResult(prediction) {
    const mood = getMoodType(prediction.className);
    const percent = Math.round(prediction.probability * 100);

    moodResult.classList.toggle('happy', mood === 'happy');
    moodResult.classList.toggle('unhappy', mood === 'unhappy');
    moodEmoji.textContent = mood === 'happy' ? '😊' : '😟';
    moodTitle.textContent = mood === 'happy' ? '기분 좋은 표정이에요' : '기분이 좋지 않은 표정이에요';
    moodConfidence.textContent = `${formatClassName(prediction.className)} 가능성 ${percent}%`;
}

function getMoodType(className) {
    const normalizedName = className.toLowerCase();
    const happyWords = ['^_^', 'happy', 'good', 'smile', 'positive', '기분 좋은', '좋은', '행복', '웃'];
    const unhappyWords = ['ㅠㅠ', 'sad', 'bad', 'angry', 'negative', 'unhappy', '기분 좋지', '좋지', '슬픔', '화남'];

    if (happyWords.some((word) => normalizedName.includes(word))) {
        return 'happy';
    }

    if (unhappyWords.some((word) => normalizedName.includes(word))) {
        return 'unhappy';
    }

    return 'unhappy';
}

function formatClassName(className) {
    if (className === '^_^') {
        return '기분 좋은 표정';
    }

    if (className === 'ㅠㅠ') {
        return '기분이 좋지 않은 표정';
    }

    return className.replace(/[_-]/g, ' ');
}
